/**
 * ZeroDevService - ERC-4337 Smart Account with Pimlico Paymaster
 *
 * Creates Kernel smart accounts using ZeroDev SDK and sponsors gas
 * via Pimlico paymaster. Replaces custom RelayerService.
 *
 * Compatible with ZeroDev SDK v5.3+ / Kernel v3
 */

import { createPublicClient, http, type Address, type Chain, type LocalAccount } from "viem";
import { base, baseSepolia } from "viem/chains";
import {
    createKernelAccount,
    createKernelAccountClient,
    createZeroDevPaymasterClient,
} from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants";
import { ErrorLogger } from "@/lib/monitoring/ErrorLogger";

const LOG_CONTEXT = "ZeroDevService";

// Environment configuration
const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
const ZERODEV_PROJECT_ID = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID;

// Get EntryPoint for Kernel v3 (uses 0.7)
const entryPoint = getEntryPoint("0.7");

// Get chain based on environment
function getChain(): Chain {
    const network = process.env.NEXT_PUBLIC_NETWORK || "base";
    return network === "base-sepolia" ? baseSepolia : base;
}

// Get bundler URL
function getBundlerUrl(): string {
    const chain = getChain();
    if (PIMLICO_API_KEY) {
        return `https://api.pimlico.io/v2/${chain.id}/rpc?apikey=${PIMLICO_API_KEY}`;
    }
    // Fallback to ZeroDev bundler
    return `https://rpc.zerodev.app/api/v2/bundler/${ZERODEV_PROJECT_ID}`;
}

// Get paymaster URL
function getPaymasterUrl(): string {
    const chain = getChain();
    if (PIMLICO_API_KEY) {
        return `https://api.pimlico.io/v2/${chain.id}/rpc?apikey=${PIMLICO_API_KEY}`;
    }
    // Fallback to ZeroDev paymaster
    return `https://rpc.zerodev.app/api/v2/paymaster/${ZERODEV_PROJECT_ID}`;
}

export class ZeroDevService {
    /**
     * Check if ZeroDev/Pimlico is properly configured
     */
    static isConfigured(): boolean {
        return !!(PIMLICO_API_KEY || ZERODEV_PROJECT_ID);
    }

    /**
     * Create a Kernel smart account from an EOA signer
     * 
     * @param signer - Viem LocalAccount (from privateKeyToAccount or similar)
     */
    static async createKernelAccount(signer: LocalAccount) {
        if (!this.isConfigured()) {
            throw new Error("ZeroDev/Pimlico not configured. Set NEXT_PUBLIC_PIMLICO_API_KEY or NEXT_PUBLIC_ZERODEV_PROJECT_ID.");
        }

        const chain = getChain();
        const bundlerUrl = getBundlerUrl();
        const paymasterUrl = getPaymasterUrl();

        try {
            // Create public client for the chain
            const publicClient = createPublicClient({
                chain,
                transport: http(),
            });

            // Create ECDSA validator from signer
            const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
                signer,
                entryPoint,
                kernelVersion: KERNEL_V3_1,
            });

            // Create Kernel account
            const account = await createKernelAccount(publicClient, {
                plugins: {
                    sudo: ecdsaValidator,
                },
                entryPoint,
                kernelVersion: KERNEL_V3_1,
            });

            ErrorLogger.info(LOG_CONTEXT, "Kernel account created", {
                address: account.address,
                chain: chain.name,
            });

            // Create paymaster client for gas sponsorship
            const paymasterClient = createZeroDevPaymasterClient({
                chain,
                transport: http(paymasterUrl),
            });

            // Create Kernel account client with paymaster
            const kernelClient = createKernelAccountClient({
                account,
                chain,
                bundlerTransport: http(bundlerUrl),
                paymaster: paymasterClient,
            });

            return {
                address: account.address as Address,
                client: kernelClient,
            };
        } catch (error) {
            ErrorLogger.error(
                error instanceof Error ? error : new Error(String(error)),
                LOG_CONTEXT,
                { operation: "createKernelAccount", chain: chain.name }
            );
            throw error;
        }
    }

    /**
     * Get the smart account address for a given EOA
     * (without creating a full client)
     */
    static async getAccountAddress(signer: LocalAccount): Promise<Address> {
        const chain = getChain();

        const publicClient = createPublicClient({
            chain,
            transport: http(),
        });

        const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
            signer,
            entryPoint,
            kernelVersion: KERNEL_V3_1,
        });

        const account = await createKernelAccount(publicClient, {
            plugins: {
                sudo: ecdsaValidator,
            },
            entryPoint,
            kernelVersion: KERNEL_V3_1,
        });

        return account.address;
    }
}
