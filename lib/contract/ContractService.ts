/**
 * ContractService - Ethereum-compatible smart contract interaction layer
 *
 * Handles connection to Passet Hub testnet via Ethereum RPC and provides methods for
 * interacting with the Lockdrop time-lock Solidity contract.
 *
 * Uses ethers.js for Ethereum-compatible contract interactions on Polkadot infrastructure.
 */

"use client";

import { ethers } from "ethers";
import { withTimeout, TIMEOUTS } from "@/utils/timeout";
import solidityAbi from "@/contract/solidity-abi.json";

/**
 * Configuration for contract connection
 */
export interface ContractConfig {
  contractAddress: string;
  rpcEndpoint: string;
  network: string;
}

/**
 * Message metadata stored on-chain
 */
export interface MessageMetadata {
  id: string;
  encryptedKeyCID: string;
  encryptedMessageCID: string;
  messageHash: string;
  unlockTimestamp: number;
  sender: string;
  recipient: string;
  createdAt: number;
}

/**
 * Result of a contract transaction
 */
export interface TransactionResult {
  success: boolean;
  messageId?: string;
  blockHash?: string;
  error?: string;
}

/**
 * ContractService provides methods for interacting with the Solidity smart contract
 * that stores time-locked message metadata on Passet Hub (Polkadot).
 */
export class ContractService {
  private static provider: ethers.JsonRpcProvider | null = null;
  private static contract: ethers.Contract | null = null;
  private static isConnecting = false;
  private static connectionPromise: Promise<ethers.JsonRpcProvider> | null =
    null;
  private static connectionListeners: Set<(connected: boolean) => void> =
    new Set();

  /**
   * Get the contract configuration from environment variables
   */
  private static getConfig(): ContractConfig {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const rpcEndpoint =
      process.env.NEXT_PUBLIC_RPC_ENDPOINT ||
      "https://testnet-passet-hub-eth-rpc.polkadot.io";
    const network = process.env.NEXT_PUBLIC_NETWORK || "passet-hub";

    if (!contractAddress) {
      throw new Error(
        "Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your environment variables."
      );
    }

    return {
      contractAddress,
      rpcEndpoint,
      network,
    };
  }

  /**
   * Connect to the Ethereum RPC endpoint
   *
   * @returns Promise resolving to JsonRpcProvider instance
   * @throws Error if connection fails
   */
  private static async connect(): Promise<ethers.JsonRpcProvider> {
    // Return existing connection if available
    if (this.provider) {
      try {
        // Test connection
        await this.provider.getBlockNumber();
        return this.provider;
      } catch (error) {
        console.warn("Existing provider failed, reconnecting...");
        this.provider = null;
      }
    }

    // Return existing connection attempt if in progress
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = this.establishConnection();

    try {
      this.provider = await this.connectionPromise;
      return this.provider;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  /**
   * Establish a new connection to the RPC endpoint
   *
   * Retry Strategy:
   * - Exponential backoff: 1s, 2s, 4s
   * - Maximum 3 attempts
   * - Provides helpful error messages on failure
   */
  private static async establishConnection(): Promise<ethers.JsonRpcProvider> {
    const config = this.getConfig();
    const MAX_ATTEMPTS = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        // Add delay for retries (exponential backoff with jitter)
        if (attempt > 1) {
          const baseDelay = 1000 * Math.pow(2, attempt - 2); // 1s, 2s, 4s
          const jitter = Math.random() * 0.3 * baseDelay; // ±30% jitter
          const delay = baseDelay + jitter;
          console.log(
            `Retrying RPC connection (attempt ${attempt}/${MAX_ATTEMPTS}) after ${Math.round(delay)}ms...`
          );
          await this.delay(delay);
        }

        // Create provider with custom network config to disable ENS
        // Passet Hub doesn't support ENS, so we must completely disable ENS resolution
        const network = new ethers.Network(config.network, 420420422);

        // Remove all ENS-related plugins from the network
        // This is the nuclear option to prevent ANY ENS resolution attempts
        const ensPluginName = "org.ethers.plugins.network.Ens";
        try {
          network.plugins.forEach((plugin) => {
            if (plugin.name === ensPluginName) {
              // @ts-expect-error - accessing private method to remove plugin
              network._plugins.delete(ensPluginName);
            }
          });
        } catch (e) {
          // Ignore errors - plugin might not exist
        }

        console.log(
          "[ContractService] Creating provider with ENS disabled for network:",
          config.network
        );

        const provider = new ethers.JsonRpcProvider(
          config.rpcEndpoint,
          network,
          {
            staticNetwork: network, // Prevents network auto-detection
          }
        );

        // Test connection
        await withTimeout(
          provider.getBlockNumber(),
          TIMEOUTS.BLOCKCHAIN_CONNECT,
          `Ethereum RPC connection to ${config.rpcEndpoint}`
        );

        console.log(`Connected to ${config.network} at ${config.rpcEndpoint}`);

        // Notify listeners of successful connection
        this.notifyConnectionListeners(true);

        return provider;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        if (attempt < MAX_ATTEMPTS) {
          console.warn(
            `RPC connection attempt ${attempt} failed:`,
            lastError.message
          );
        }
      }
    }

    // All attempts failed
    const errorMessage = lastError?.message || "Unknown error";
    this.notifyConnectionListeners(false);

    throw new Error(
      `Failed to connect to Ethereum RPC endpoint after ${MAX_ATTEMPTS} attempts: ${errorMessage}. ` +
        `Please check your network connection and ensure the RPC endpoint is accessible.`
    );
  }

  /**
   * Get the current provider instance, connecting if necessary
   *
   * @returns Promise resolving to JsonRpcProvider instance
   */
  static async getProvider(): Promise<ethers.JsonRpcProvider> {
    return this.connect();
  }

  /**
   * Get the contract instance, initializing if necessary
   *
   * @returns Promise resolving to Contract instance
   */
  private static async getContract(): Promise<ethers.Contract> {
    if (this.contract) {
      return this.contract;
    }

    const provider = await this.getProvider();
    const config = this.getConfig();

    this.contract = new ethers.Contract(
      config.contractAddress,
      solidityAbi,
      provider
    );

    return this.contract;
  }

  /**
   * Disconnect from the RPC endpoint
   *
   * Call this when the application is closing or when you need to reset the connection.
   */
  static async disconnect(): Promise<void> {
    if (this.provider) {
      this.provider.destroy();
      this.provider = null;
      this.contract = null;
      console.log("Disconnected from Ethereum RPC");
    }
  }

  /**
   * Check if the provider is currently connected
   *
   * @returns true if connected, false otherwise
   */
  static isConnected(): boolean {
    return this.provider !== null;
  }

  /**
   * Get the contract address from configuration
   *
   * @returns Contract address string
   */
  static getContractAddress(): string {
    return this.getConfig().contractAddress;
  }

  /**
   * Get the network name from configuration
   *
   * @returns Network name
   */
  static getNetwork(): string {
    return this.getConfig().network;
  }

  /**
   * Helper method to add delay for retry logic
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Notify connection listeners of connection status changes
   */
  private static notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach((listener) => listener(connected));
  }

  /**
   * Add a connection status listener
   */
  static addConnectionListener(listener: (connected: boolean) => void): void {
    this.connectionListeners.add(listener);
  }

  /**
   * Remove a connection status listener
   */
  static removeConnectionListener(
    listener: (connected: boolean) => void
  ): void {
    this.connectionListeners.delete(listener);
  }

  /**
   * Get the total number of messages stored in the contract
   *
   * @returns Promise resolving to the message count
   */
  static async getMessageCount(): Promise<number> {
    const contract = await this.getContract();
    const count = await withTimeout(
      contract.getMessageCount.staticCall(),
      TIMEOUTS.BLOCKCHAIN_QUERY,
      "Get message count"
    );
    return Number(count);
  }

  /**
   * Get all messages sent by a specific address
   *
   * @param senderAddress - Ethereum address of the sender
   * @returns Promise resolving to array of message metadata
   */
  static async getSentMessages(
    senderAddress: string
  ): Promise<MessageMetadata[]> {
    const contract = await this.getContract();

    // Use staticCall to bypass ENS resolution
    // This calls the contract method directly without address resolution
    const messages = await withTimeout(
      contract.getSentMessages.staticCall(senderAddress),
      TIMEOUTS.BLOCKCHAIN_QUERY,
      "Get sent messages"
    );

    return messages.map((msg: any, index: number) => ({
      id: index.toString(),
      encryptedKeyCID: msg.encryptedKeyCid,
      encryptedMessageCID: msg.encryptedMessageCid,
      messageHash: msg.messageHash,
      unlockTimestamp: Number(msg.unlockTimestamp),
      sender: msg.sender,
      recipient: msg.recipient,
      createdAt: Number(msg.createdAt),
    }));
  }

  /**
   * Get all messages received by a specific address
   *
   * @param recipientAddress - Ethereum address of the recipient
   * @returns Promise resolving to array of message metadata
   */
  static async getReceivedMessages(
    recipientAddress: string
  ): Promise<MessageMetadata[]> {
    const contract = await this.getContract();

    // Use staticCall to bypass ENS resolution
    // This calls the contract method directly without address resolution
    const messages = await withTimeout(
      contract.getReceivedMessages.staticCall(recipientAddress),
      TIMEOUTS.BLOCKCHAIN_QUERY,
      "Get received messages"
    );

    return messages.map((msg: any, index: number) => ({
      id: index.toString(),
      encryptedKeyCID: msg.encryptedKeyCid,
      encryptedMessageCID: msg.encryptedMessageCid,
      messageHash: msg.messageHash,
      unlockTimestamp: Number(msg.unlockTimestamp),
      sender: msg.sender,
      recipient: msg.recipient,
      createdAt: Number(msg.createdAt),
    }));
  }

  /**
   * Get a specific message by its ID
   *
   * @param messageId - The message ID to retrieve
   * @returns Promise resolving to message metadata or null if not found
   */
  static async getMessage(messageId: string): Promise<MessageMetadata | null> {
    const contract = await this.getContract();
    try {
      const msg = await withTimeout(
        contract.getMessage.staticCall(messageId),
        TIMEOUTS.BLOCKCHAIN_QUERY,
        "Get message"
      );

      return {
        id: messageId,
        encryptedKeyCID: msg.encryptedKeyCid,
        encryptedMessageCID: msg.encryptedMessageCid,
        messageHash: msg.messageHash,
        unlockTimestamp: Number(msg.unlockTimestamp),
        sender: msg.sender,
        recipient: msg.recipient,
        createdAt: Number(msg.createdAt),
      };
    } catch (error) {
      // Message not found or other error
      console.error(`Failed to get message ${messageId}:`, error);
      return null;
    }
  }

  /**
   * Store a new message on the blockchain
   *
   * @param params - Message parameters
   * @param signerAddress - Ethereum address to sign the transaction
   * @returns Promise resolving to transaction result
   */
  static async storeMessage(
    params: {
      encryptedKeyCID: string;
      encryptedMessageCID: string;
      messageHash: string;
      unlockTimestamp: number;
      recipient: string;
    },
    signerAddress: string
  ): Promise<TransactionResult> {
    try {
      const config = this.getConfig();

      // Get signer from browser wallet (MetaMask or Talisman)
      if (!(window as any).ethereum) {
        throw new Error(
          "No Ethereum wallet found. Please install Talisman (recommended) or MetaMask."
        );
      }

      const browserProvider = new ethers.BrowserProvider(
        (window as any).ethereum
      );
      const signer = await browserProvider.getSigner(signerAddress);

      const contract = new ethers.Contract(
        config.contractAddress,
        solidityAbi,
        signer
      );

      // Send transaction
      const tx = await withTimeout(
        contract.storeMessage(
          params.encryptedKeyCID,
          params.encryptedMessageCID,
          params.messageHash,
          params.unlockTimestamp,
          params.recipient
        ),
        TIMEOUTS.BLOCKCHAIN_TX_SUBMIT,
        "Store message transaction"
      );

      // Wait for transaction confirmation
      const receipt = await withTimeout(
        tx.wait(),
        TIMEOUTS.BLOCKCHAIN_TX_FINALIZE,
        "Transaction confirmation"
      );

      // Extract messageId from event
      const event = (receipt as ethers.TransactionReceipt).logs
        .map((log: any) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e: any) => e?.name === "MessageStored");

      return {
        success: true,
        messageId: event?.args.messageId.toString(),
        blockHash: (receipt as ethers.TransactionReceipt).blockHash,
      };
    } catch (error) {
      console.error("Failed to store message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Transaction failed",
      };
    }
  }

  /**
   * Subscribe to MessageStored events
   *
   * @param callback - Function to call when a new message is stored
   * @returns Cleanup function to unsubscribe
   */
  static async subscribeToMessageEvents(
    callback: (event: {
      messageId: string;
      sender: string;
      recipient: string;
      unlockTimestamp: number;
    }) => void
  ): Promise<() => void> {
    const contract = await this.getContract();

    const listener = (
      messageId: bigint,
      sender: string,
      recipient: string,
      unlockTimestamp: bigint
    ) => {
      callback({
        messageId: messageId.toString(),
        sender,
        recipient,
        unlockTimestamp: Number(unlockTimestamp),
      });
    };

    contract.on("MessageStored", listener);

    // Return cleanup function
    return () => {
      contract.off("MessageStored", listener);
    };
  }
}
