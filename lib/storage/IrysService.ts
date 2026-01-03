/**
 * Irys (Bundlr) Network Storage Service
 *
 * Handles encrypted blob uploads to Arweave via Irys bundler network
 * with progress tracking, permanent storage guarantees, and multi-token payment.
 *
 * Key Features:
 * - Pay-once-store-forever model (Arweave permanence)
 * - Multi-token payment (MATIC, ETH, Base)
 * - Instant transaction finality via Irys bundlers
 * - Compatible with existing StorachaService patterns
 */

import Irys from "@irys/sdk";
import { ErrorLogger } from "@/lib/monitoring/ErrorLogger";
import { withRetry, RetryOptions } from "@/utils/retry";
import { RETRY_CONFIG } from "@/utils/constants";

const LOG_CONTEXT = "IrysService";

/**
 * Result of an Irys upload operation
 */
export interface IrysUploadResult {
    /** Arweave transaction ID */
    id: string;
    /** Size in bytes */
    size: number;
    /** Storage provider identifier */
    provider: "irys";
    /** Indicates permanent storage on Arweave */
    permanent: true;
    /** Upload timestamp */
    timestamp: number;
    /** Gateway URL for direct access */
    url: string;
}

/**
 * Upload options for Irys service
 */
export interface IrysUploadOptions {
    /** Progress callback (0-100) */
    onProgress?: (progress: number) => void;
    /** Content type tag */
    contentType?: string;
    /** Additional Arweave tags */
    tags?: Array<{ name: string; value: string }>;
}

/**
 * Supported payment tokens
 */
export type IrysToken = "matic" | "ethereum" | "base-eth";

/**
 * Configuration for Irys service
 */
export interface IrysConfig {
    /** Irys node URL */
    nodeUrl: string;
    /** Payment token to use */
    token: IrysToken;
    /** Private key for server-side uploads (optional) */
    privateKey?: string;
}

/**
 * Default configuration from environment
 */
const getDefaultConfig = (): IrysConfig => ({
    nodeUrl: process.env.NEXT_PUBLIC_IRYS_NODE_URL || "https://node1.irys.xyz",
    token: (process.env.NEXT_PUBLIC_IRYS_TOKEN as IrysToken) || "matic",
    privateKey: process.env.IRYS_PRIVATE_KEY,
});

/**
 * IrysService provides methods for uploading encrypted blobs to Arweave
 * via the Irys bundler network with permanent storage guarantees.
 */
class IrysService {
    private irys: Irys | null = null;
    private config: IrysConfig;
    private initialized: boolean = false;

    constructor(config?: Partial<IrysConfig>) {
        this.config = { ...getDefaultConfig(), ...config };
    }

    /**
     * Initialize the Irys client
     *
     * @param privateKey - Optional private key for wallet (server-side) or uses injected provider (client-side)
     */
    async initialize(privateKey?: string): Promise<void> {
        const key = privateKey || this.config.privateKey;

        if (!key) {
            throw new Error(
                "Irys requires a private key for uploads. Set IRYS_PRIVATE_KEY env var or pass privateKey."
            );
        }

        try {
            ErrorLogger.info(LOG_CONTEXT, "Initializing Irys client", {
                nodeUrl: this.config.nodeUrl,
                token: this.config.token,
            });

            this.irys = new Irys({
                url: this.config.nodeUrl,
                token: this.config.token,
                key: key,
            });

            // Verify connection by checking balance
            await this.irys.ready();
            this.initialized = true;

            ErrorLogger.info(LOG_CONTEXT, "Irys client initialized successfully", {
                address: this.irys.address,
            });
        } catch (error) {
            ErrorLogger.error(LOG_CONTEXT, "Failed to initialize Irys client", {
                error,
            });
            throw error;
        }
    }

    /**
     * Check if service is initialized and ready
     */
    isReady(): boolean {
        return this.initialized && this.irys !== null;
    }

    /**
     * Get the connected wallet address
     */
    getAddress(): string | null {
        return this.irys?.address || null;
    }

    /**
     * Get current funded balance on Irys node
     *
     * @returns Balance in atomic units (wei for ETH, smallest unit for MATIC)
     */
    async getBalance(): Promise<string> {
        this.ensureReady();

        try {
            const balance = await this.irys!.getLoadedBalance();
            return balance.toString();
        } catch (error) {
            ErrorLogger.error(LOG_CONTEXT, "Failed to get balance", { error });
            throw error;
        }
    }

    /**
     * Get price estimate for uploading data
     *
     * @param bytes - Size of data in bytes
     * @returns Price in atomic units
     */
    async getPrice(bytes: number): Promise<string> {
        this.ensureReady();

        try {
            const price = await this.irys!.getPrice(bytes);
            return price.toString();
        } catch (error) {
            ErrorLogger.error(LOG_CONTEXT, "Failed to get price", { error, bytes });
            throw error;
        }
    }

    /**
     * Fund the Irys node with tokens for storage
     *
     * @param amount - Amount in atomic units to fund
     * @returns Transaction ID of the funding operation
     */
    async fund(amount: string): Promise<string> {
        this.ensureReady();

        try {
            ErrorLogger.info(LOG_CONTEXT, "Funding Irys node", {
                amount,
                token: this.config.token,
            });

            const response = await this.irys!.fund(BigInt(amount));

            ErrorLogger.info(LOG_CONTEXT, "Funding successful", {
                txId: response.id,
                amount: response.quantity,
            });

            return response.id;
        } catch (error) {
            ErrorLogger.error(LOG_CONTEXT, "Failed to fund Irys node", {
                error,
                amount,
            });
            throw error;
        }
    }

    /**
     * Upload an encrypted blob to Arweave via Irys
     *
     * @param blob - The encrypted blob to upload
     * @param filename - Optional filename for tagging
     * @param options - Upload options
     * @returns Upload result with Arweave transaction ID
     */
    async uploadEncryptedBlob(
        blob: Blob,
        filename: string = "encrypted-media",
        options: IrysUploadOptions = {}
    ): Promise<IrysUploadResult> {
        this.ensureReady();

        const retryOptions: RetryOptions = {
            ...RETRY_CONFIG,
            shouldRetry: (error) => this.isRetryableError(error as Error),
            onRetry: (attempt, error, delay) => {
                ErrorLogger.warn(LOG_CONTEXT, `Upload retry attempt ${attempt}`, {
                    error: (error as Error).message,
                    delay,
                });
            },
        };

        return withRetry(async () => {
            return this.uploadToIrys(blob, filename, options);
        }, retryOptions);
    }

    /**
     * Internal upload implementation
     */
    private async uploadToIrys(
        blob: Blob,
        filename: string,
        options: IrysUploadOptions
    ): Promise<IrysUploadResult> {
        ErrorLogger.info(LOG_CONTEXT, "Starting Irys upload", {
            filename,
            size: blob.size,
        });

        // Convert blob to buffer
        const buffer = Buffer.from(await blob.arrayBuffer());

        // Build tags
        const tags = [
            { name: "Content-Type", value: options.contentType || blob.type || "application/octet-stream" },
            { name: "App-Name", value: "SovSeal" },
            { name: "App-Version", value: "1.0.0" },
            { name: "Filename", value: filename },
            { name: "Timestamp", value: Date.now().toString() },
            ...(options.tags || []),
        ];

        try {
            // Upload to Irys
            const receipt = await this.irys!.upload(buffer, { tags });

            const result: IrysUploadResult = {
                id: receipt.id,
                size: blob.size,
                provider: "irys",
                permanent: true,
                timestamp: Date.now(),
                url: this.getGatewayUrl(receipt.id),
            };

            ErrorLogger.info(LOG_CONTEXT, "Upload successful", {
                id: result.id,
                size: result.size,
                url: result.url,
            });

            // Report progress complete
            options.onProgress?.(100);

            return result;
        } catch (error) {
            ErrorLogger.error(LOG_CONTEXT, "Upload failed", { error, filename });
            throw error;
        }
    }

    /**
     * Download an encrypted blob from Arweave
     *
     * @param txId - Arweave transaction ID
     * @returns The downloaded blob
     */
    async downloadEncryptedBlob(txId: string): Promise<Blob> {
        const url = this.getGatewayUrl(txId);

        const retryOptions: RetryOptions = {
            ...RETRY_CONFIG,
            shouldRetry: (error) => this.isRetryableError(error as Error),
            onRetry: (attempt, error, delay) => {
                ErrorLogger.warn(LOG_CONTEXT, `Download retry attempt ${attempt}`, {
                    error: (error as Error).message,
                    delay,
                    txId,
                });
            },
        };

        return withRetry(async () => {
            ErrorLogger.info(LOG_CONTEXT, "Downloading from Arweave", { txId, url });

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Download failed: ${response.status} ${response.statusText}`);
            }

            const blob = await response.blob();

            ErrorLogger.info(LOG_CONTEXT, "Download successful", {
                txId,
                size: blob.size,
            });

            return blob;
        }, retryOptions);
    }

    /**
     * Get the gateway URL for accessing content
     *
     * @param txId - Arweave transaction ID
     * @returns Gateway URL for direct access
     */
    getGatewayUrl(txId: string): string {
        // Use Arweave gateway for permanent access
        return `https://arweave.net/${txId}`;
    }

    /**
     * Validate an Arweave transaction ID format
     */
    isValidTxId(txId: string): boolean {
        // Arweave TX IDs are 43 characters, base64url encoded
        return /^[a-zA-Z0-9_-]{43}$/.test(txId);
    }

    /**
     * Check if error is retryable
     */
    private isRetryableError(error: Error): boolean {
        const message = error.message.toLowerCase();

        // Network errors are retryable
        if (
            message.includes("fetch") ||
            message.includes("network") ||
            message.includes("timeout") ||
            message.includes("econnreset") ||
            message.includes("socket")
        ) {
            return true;
        }

        // Rate limiting is retryable
        if (message.includes("429") || message.includes("rate limit")) {
            return true;
        }

        // Server errors (5xx) are retryable
        if (message.includes("500") || message.includes("502") || message.includes("503")) {
            return true;
        }

        return false;
    }

    /**
     * Ensure service is initialized
     */
    private ensureReady(): void {
        if (!this.isReady()) {
            throw new Error("IrysService not initialized. Call initialize() first.");
        }
    }
}

// Export singleton instance
export const irysService = new IrysService();

// Export class for custom instances
export { IrysService };
