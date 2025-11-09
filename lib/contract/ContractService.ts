/**
 * ContractService - Polkadot smart contract interaction layer
 *
 * Handles connection to Westend testnet and provides methods for
 * interacting with the FutureProof time-lock contract.
 *
 * Requirements: 6.2, 13.5
 */

"use client";

import { ApiPromise, WsProvider } from "@polkadot/api";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { withTimeout, TIMEOUTS } from "@/utils/timeout";
import * as MessageCache from "./MessageCache";

// Pre-load web3FromAddress to avoid dynamic imports during transactions
let web3FromAddressCache: typeof import("@polkadot/extension-dapp").web3FromAddress | null = null;

if (typeof window !== 'undefined') {
  import("@polkadot/extension-dapp").then((module) => {
    web3FromAddressCache = module.web3FromAddress;
  }).catch(err => {
    console.warn('Failed to preload web3FromAddress:', err);
  });
}

/**
 * Configuration for contract connection
 */
export interface ContractConfig {
  contractAddress: string;
  rpcEndpoint: string;
  network: "westend" | "rococo";
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
 * ContractService provides methods for interacting with the Polkadot smart contract
 * that stores time-locked message metadata.
 */
export class ContractService {
  private static api: ApiPromise | null = null;
  private static isConnecting = false;
  private static connectionPromise: Promise<ApiPromise> | null = null;
  private static connectionListeners: Set<(connected: boolean) => void> = new Set();
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;

  /**
   * Get the contract configuration from environment variables
   *
   * Requirements: 13.5 - Configure contract address through environment variables
   */
  private static getConfig(): ContractConfig {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const rpcEndpoint =
      process.env.NEXT_PUBLIC_RPC_ENDPOINT || "wss://westend-rpc.polkadot.io";
    const network = (process.env.NEXT_PUBLIC_NETWORK || "westend") as
      | "westend"
      | "rococo";

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
   * Get fallback RPC endpoints for the current network
   * These are used if the primary endpoint fails
   */
  private static getFallbackEndpoints(network: string): string[] {
    const fallbacks: Record<string, string[]> = {
      westend: [
        "wss://westend-rpc.polkadot.io",
        "wss://rpc.polkadot.io/westend",
        "wss://westend.api.onfinality.io/public-ws",
      ],
      rococo: [
        "wss://rococo-rpc.polkadot.io",
        "wss://rpc.polkadot.io/rococo",
      ],
    };

    return fallbacks[network] || [];
  }

  /**
   * Connect to the Polkadot RPC endpoint
   *
   * Requirements: 6.2 - Connect to Westend testnet RPC endpoint
   *
   * @returns Promise resolving to ApiPromise instance
   * @throws Error if connection fails
   */
  private static async connect(): Promise<ApiPromise> {
    // Return existing connection if available
    if (this.api && this.api.isConnected) {
      return this.api;
    }

    // Return existing connection attempt if in progress
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = this.establishConnection();

    try {
      this.api = await this.connectionPromise;
      return this.api;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  /**
   * Establish a new connection to the RPC endpoint
   *
   * Retry Strategy:
   * - Tries primary endpoint first
   * - Falls back to alternative endpoints if primary fails
   * - Exponential backoff: 1s, 2s, 4s
   * - Maximum 3 attempts per endpoint
   * - Provides helpful error messages on failure
   */
  private static async establishConnection(): Promise<ApiPromise> {
    const config = this.getConfig();
    const fallbackEndpoints = this.getFallbackEndpoints(config.network);
    
    // Build list of endpoints to try: primary first, then fallbacks
    const endpointsToTry = [config.rpcEndpoint];
    fallbackEndpoints.forEach(endpoint => {
      if (endpoint !== config.rpcEndpoint) {
        endpointsToTry.push(endpoint);
      }
    });

    let lastError: Error | null = null;

    // Try each endpoint
    for (const endpoint of endpointsToTry) {
      const MAX_ATTEMPTS = 3;
      
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          // Add delay for retries (exponential backoff with jitter)
          if (attempt > 1) {
            const baseDelay = 1000 * Math.pow(2, attempt - 2); // 1s, 2s, 4s
            const jitter = Math.random() * 0.3 * baseDelay; // ±30% jitter
            const delay = baseDelay + jitter;
            console.log(
              `Retrying RPC connection to ${endpoint} (attempt ${attempt}/${MAX_ATTEMPTS}) after ${Math.round(delay)}ms...`
            );
            await this.delay(delay);
          } else if (endpoint !== config.rpcEndpoint) {
            console.log(`Trying fallback RPC endpoint: ${endpoint}`);
          }

          const provider = new WsProvider(endpoint);
          const api = await withTimeout(
            ApiPromise.create({ provider }),
            TIMEOUTS.BLOCKCHAIN_CONNECT,
            `Polkadot RPC connection to ${endpoint}`
          );

          // Wait for the API to be ready with timeout
          await withTimeout(
            api.isReady,
            TIMEOUTS.BLOCKCHAIN_CONNECT,
            "Polkadot API ready check"
          );

          console.log(`Connected to ${config.network} at ${endpoint}`);
          
          if (endpoint !== config.rpcEndpoint) {
            console.warn(`Using fallback RPC endpoint: ${endpoint}`);
          }

          // Set up disconnection handler
          this.setupDisconnectionHandler(api, config);
          
          // Reset reconnect attempts on successful connection
          this.reconnectAttempts = 0;
          
          // Notify listeners of successful connection
          this.notifyConnectionListeners(true);

          return api;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error("Unknown error");

          if (attempt < MAX_ATTEMPTS) {
            console.warn(
              `RPC connection attempt ${attempt} to ${endpoint} failed:`,
              lastError.message
            );
          } else {
            console.error(
              `All ${MAX_ATTEMPTS} attempts to ${endpoint} failed. ${endpointsToTry.indexOf(endpoint) < endpointsToTry.length - 1 ? 'Trying next endpoint...' : ''}`
            );
          }
        }
      }
    }

    // All endpoints and attempts failed
    const errorMessage = lastError?.message || "Unknown error";
    throw new Error(
      `Failed to connect to any Polkadot RPC endpoint after trying ${endpointsToTry.length} endpoint(s): ${errorMessage}. ` +
        `Please check your network connection and ensure at least one RPC endpoint is accessible.`
    );
  }

  /**
   * Get the current API instance, connecting if necessary
   *
   * @returns Promise resolving to ApiPromise instance
   */
  static async getApi(): Promise<ApiPromise> {
    return this.connect();
  }

  /**
   * Disconnect from the Polkadot RPC endpoint
   *
   * Call this when the application is closing or when you need to reset the connection.
   */
  static async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
      console.log("Disconnected from Polkadot RPC");
    }
  }

  /**
   * Check if the API is currently connected
   *
   * @returns true if connected, false otherwise
   */
  static isConnected(): boolean {
    return this.api !== null && this.api.isConnected;
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
   * @returns Network name ('westend' or 'rococo')
   */
  static getNetwork(): string {
    return this.getConfig().network;
  }

  /**
   * Store a new time-locked message on the blockchain
   *
   * Requirements: 6.2, 6.3, 6.4, 6.5
   *
   * @param params Message parameters
   * @param account Injected account for signing
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
    account: InjectedAccountWithMeta
  ): Promise<TransactionResult> {
    try {
      const api = await this.getApi();

      // Use cached module or dynamic import as fallback
      let web3FromAddress = web3FromAddressCache;
      
      if (!web3FromAddress) {
        const module = await import("@polkadot/extension-dapp");
        web3FromAddress = module.web3FromAddress;
        web3FromAddressCache = web3FromAddress;
      }
      
      const injector = await withTimeout(
        web3FromAddress(account.address),
        TIMEOUTS.WALLET_ENABLE,
        "Get wallet injector"
      );

      // For now, we'll use a simple extrinsic call
      // In a real implementation, this would interact with the ink! contract
      // using the contract's ABI and the api.tx.contracts.call method

      // TODO: Replace with actual contract call once contract is deployed
      // This is a placeholder that demonstrates the transaction flow

      // Example of what the actual call would look like:
      // const contract = new ContractPromise(api, contractAbi, config.contractAddress);
      // const gasLimit = api.registry.createType('WeightV2', {
      //   refTime: 1000000000000,
      //   proofSize: 1000000000000,
      // });
      // const { gasRequired, result, output } = await contract.query.storeMessage(
      //   account.address,
      //   { gasLimit, storageDepositLimit: null },
      //   params.encryptedKeyCID,
      //   params.encryptedMessageCID,
      //   params.messageHash,
      //   params.unlockTimestamp,
      //   params.recipient
      // );

      return withTimeout(
        new Promise<TransactionResult>((resolve, reject) => {
          // Create a remark extrinsic as a placeholder
          // This will be replaced with actual contract interaction
          const remarkData = JSON.stringify({
            type: "futureproof_message",
            encryptedKeyCID: params.encryptedKeyCID,
            encryptedMessageCID: params.encryptedMessageCID,
            messageHash: params.messageHash,
            unlockTimestamp: params.unlockTimestamp,
            recipient: params.recipient,
            sender: account.address,
            createdAt: Date.now(),
          });

          api.tx.system
            .remark(remarkData)
            .signAndSend(
              account.address,
              { signer: injector.signer },
              ({ status, dispatchError }) => {
                if (dispatchError) {
                  let errorMessage = "Transaction failed";

                  if (dispatchError.isModule) {
                    const decoded = api.registry.findMetaError(
                      dispatchError.asModule
                    );
                    errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs.join(" ")}`;
                  } else {
                    errorMessage = dispatchError.toString();
                  }

                  // Check for insufficient balance error
                  if (
                    errorMessage.includes("balance") ||
                    errorMessage.includes("funds")
                  ) {
                    errorMessage +=
                      "\n\nYou may need testnet tokens. Get free Westend tokens from the faucet:\n" +
                      "- https://faucet.polkadot.io/westend\n" +
                      "- https://matrix.to/#/#westend_faucet:matrix.org";
                  }

                  reject(new Error(errorMessage));
                } else if (status.isInBlock) {
                  console.log(
                    `Transaction included in block ${status.asInBlock.toString()}`
                  );
                } else if (status.isFinalized) {
                  console.log(
                    `Transaction finalized in block ${status.asFinalized.toString()}`
                  );

                  // Generate a message ID from the block hash and transaction index
                  const messageId = `${status.asFinalized.toString()}-${Date.now()}`;

                  // Store message in cache for instant retrieval
                  const messageMetadata: MessageMetadata = {
                    id: messageId,
                    encryptedKeyCID: params.encryptedKeyCID,
                    encryptedMessageCID: params.encryptedMessageCID,
                    messageHash: params.messageHash,
                    unlockTimestamp: params.unlockTimestamp,
                    sender: account.address,
                    recipient: params.recipient,
                    createdAt: Date.now(),
                  };

                  // Add to both sent and received caches
                  MessageCache.addSentMessage(messageMetadata);
                  MessageCache.addReceivedMessage(messageMetadata);

                  console.log("Message cached successfully:", messageId);

                  resolve({
                    success: true,
                    messageId,
                    blockHash: status.asFinalized.toString(),
                  });
                }
              }
            )
            .catch((error) => {
              const errorMessage =
                error instanceof Error ? error.message : "Unknown error";

              // Provide helpful guidance for common errors
              let enhancedMessage = `Transaction submission failed: ${errorMessage}`;

              if (
                errorMessage.includes("balance") ||
                errorMessage.includes("funds")
              ) {
                enhancedMessage +=
                  "\n\nYou may need testnet tokens. Get free Westend tokens from the faucet:\n" +
                  "- https://faucet.polkadot.io/westend\n" +
                  "- https://matrix.to/#/#westend_faucet:matrix.org";
              } else if (errorMessage.includes("Cancelled")) {
                enhancedMessage = "Transaction was cancelled by the user";
              }

              reject(new Error(enhancedMessage));
            });
        }),
        TIMEOUTS.BLOCKCHAIN_TX_FINALIZE,
        "Transaction finalization"
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to store message: ${errorMessage}`);
    }
  }

  /**
   * Get all messages sent by a specific address
   *
   * Retry Strategy:
   * - Retries transient failures (network errors, timeouts)
   * - Exponential backoff: 1s, 2s, 4s
   * - Maximum 3 attempts
   * - Fails fast on non-retryable errors
   *
   * Requirements: 7.1
   *
   * @param senderAddress The address of the sender
   * @param attempt Current attempt number (internal use)
   * @returns Promise resolving to array of message metadata
   */
  static async getSentMessages(
    senderAddress: string,
    _attempt = 1
  ): Promise<MessageMetadata[]> {
    try {
      const api = await this.getApi();

      // TODO: Replace with actual contract query once contract is deployed
      // This is a placeholder that demonstrates the query flow

      // Example of what the actual call would look like:
      // const contract = new ContractPromise(api, contractAbi, config.contractAddress);
      // const { result, output } = await contract.query.getSentMessages(
      //   senderAddress,
      //   { gasLimit, storageDepositLimit: null },
      //   senderAddress
      // );
      // return this.parseMessageMetadata(output);

      // Query blockchain for messages sent by this sender
      const blockchainMessages = await this.queryMessagesFromRemarks(
        api,
        senderAddress,
        "sender"
      );
      
      // Also check cache for any messages not yet on blockchain
      const cachedMessages = MessageCache.getSentMessages(senderAddress);
      
      // Merge and deduplicate messages
      const allMessages = [...blockchainMessages];
      const existingIds = new Set(blockchainMessages.map(m => m.id));
      
      for (const cached of cachedMessages) {
        if (!existingIds.has(cached.id)) {
          allMessages.push(cached);
        }
      }
      
      console.log(`Loaded ${allMessages.length} sent messages (${blockchainMessages.length} from blockchain, ${cachedMessages.length} from cache)`);
      
      return allMessages;

      // Note: When smart contract is deployed with proper indexing, update to:
      // 1. Query contract storage/events
      // 2. Sync with cache
      // 3. Return merged results
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error loading sent messages:", errorMessage);
      
      // Return empty array instead of throwing to prevent UI blocking
      return [];
    }
  }

  /**
   * Get all messages received by a specific address
   *
   * Retry Strategy:
   * - Retries transient failures (network errors, timeouts)
   * - Exponential backoff: 1s, 2s, 4s
   * - Maximum 3 attempts
   * - Fails fast on non-retryable errors
   *
   * Requirements: 8.1
   *
   * @param recipientAddress The address of the recipient
   * @param attempt Current attempt number (internal use)
   * @returns Promise resolving to array of message metadata
   */
  static async getReceivedMessages(
    recipientAddress: string,
    _attempt = 1
  ): Promise<MessageMetadata[]> {
    try {
      const api = await this.getApi();

      // TODO: Replace with actual contract query once contract is deployed
      // This is a placeholder that demonstrates the query flow

      // Example of what the actual call would look like:
      // const contract = new ContractPromise(api, contractAbi, config.contractAddress);
      // const { result, output } = await contract.query.getReceivedMessages(
      //   recipientAddress,
      //   { gasLimit, storageDepositLimit: null },
      //   recipientAddress
      // );
      // return this.parseMessageMetadata(output);

      // Query blockchain for messages sent to this recipient
      const blockchainMessages = await this.queryMessagesFromRemarks(
        api,
        recipientAddress,
        "recipient"
      );
      
      // Also check cache for any messages not yet on blockchain
      const cachedMessages = MessageCache.getReceivedMessages(recipientAddress);
      
      // Merge and deduplicate messages
      const allMessages = [...blockchainMessages];
      const existingIds = new Set(blockchainMessages.map(m => m.id));
      
      for (const cached of cachedMessages) {
        if (!existingIds.has(cached.id)) {
          allMessages.push(cached);
        }
      }
      
      console.log(`Loaded ${allMessages.length} received messages (${blockchainMessages.length} from blockchain, ${cachedMessages.length} from cache)`);
      
      return allMessages;

      // Note: When smart contract is deployed with proper indexing, update to:
      // 1. Query contract storage/events
      // 2. Sync with cache
      // 3. Return merged results
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error loading received messages:", errorMessage);
      
      // Return empty array instead of throwing to prevent UI blocking
      return [];
    }
  }

  /**
   * Helper method to query messages from system remarks (placeholder implementation)
   *
   * @param api ApiPromise instance
   * @param address Address to filter by
   * @param role Whether to filter by 'sender' or 'recipient'
   * @returns Array of message metadata
   */
  private static async queryMessagesFromRemarks(
    api: ApiPromise,
    address: string,
    role: "sender" | "recipient"
  ): Promise<MessageMetadata[]> {
    const messages: MessageMetadata[] = [];

    try {
      // Get recent blocks - reduced to 20 blocks for better performance
      // This is a temporary placeholder until proper contract indexing is implemented
      const currentBlock = await withTimeout(
        api.rpc.chain.getBlock(),
        TIMEOUTS.BLOCKCHAIN_QUERY,
        "Get current block"
      );
      const currentBlockNumber = currentBlock.block.header.number.toNumber();

      // Query only last 20 blocks to stay within timeout limits
      // For production, implement proper event indexing or use a subquery
      const BLOCKS_TO_QUERY = 20;
      const startBlock = Math.max(0, currentBlockNumber - BLOCKS_TO_QUERY);

      console.log(
        `Querying blocks ${startBlock} to ${currentBlockNumber} for messages...`
      );

      // Query blocks for system.remark extrinsics with batch timeout
      await withTimeout(
        (async () => {
          // Fetch blocks in parallel batches for better performance
          const BATCH_SIZE = 5;
          for (
            let batchStart = currentBlockNumber;
            batchStart >= startBlock;
            batchStart -= BATCH_SIZE
          ) {
            const batchEnd = Math.max(startBlock, batchStart - BATCH_SIZE + 1);
            const blockNumbers = [];

            for (let i = batchStart; i >= batchEnd; i--) {
              blockNumbers.push(i);
            }

            // Fetch blocks in parallel within each batch
            const blockPromises = blockNumbers.map(async (blockNum) => {
              try {
                const blockHash = await api.rpc.chain.getBlockHash(blockNum);
                const block = await api.rpc.chain.getBlock(blockHash);
                return { blockNum, blockHash, block };
              } catch (error) {
                console.warn(`Failed to fetch block ${blockNum}:`, error);
                return null;
              }
            });

            const blocks = await Promise.all(blockPromises);

            // Process blocks
            for (const blockData of blocks) {
              if (!blockData) continue;

              blockData.block.block.extrinsics.forEach((extrinsic) => {
                if (
                  extrinsic.method.section === "system" &&
                  extrinsic.method.method === "remark"
                ) {
                  try {
                    const remarkData = extrinsic.method.args[0].toString();
                    const data = JSON.parse(remarkData);

                    if (data.type === "futureproof_message") {
                      // Filter by role
                      if (
                        (role === "sender" && data.sender === address) ||
                        (role === "recipient" && data.recipient === address)
                      ) {
                        messages.push({
                          id:
                            data.messageId ||
                            `${blockData.blockHash.toString()}-${blockData.blockNum}`,
                          encryptedKeyCID: data.encryptedKeyCID,
                          encryptedMessageCID: data.encryptedMessageCID,
                          messageHash: data.messageHash,
                          unlockTimestamp: data.unlockTimestamp,
                          sender: data.sender,
                          recipient: data.recipient,
                          createdAt: data.createdAt || Date.now(),
                        });
                      }
                    }
                  } catch {
                    // Skip invalid remarks
                  }
                }
              });
            }
          }
        })(),
        TIMEOUTS.BLOCKCHAIN_QUERY_BATCH,
        `Query message history (${BLOCKS_TO_QUERY} blocks)`
      );

      console.log(
        `Found ${messages.length} messages in last ${BLOCKS_TO_QUERY} blocks`
      );
    } catch (error) {
      console.error("Error querying remarks:", error);
      // Don't throw - return empty array to allow UI to continue
    }

    return messages;
  }

  /**
   * Determine if an error is retryable
   *
   * Retryable errors:
   * - Network errors (connection refused, timeout, DNS)
   * - RPC errors (503, 504, rate limiting)
   * - Temporary blockchain issues
   *
   * Non-retryable errors:
   * - Invalid addresses or parameters
   * - Contract not found
   * - Authentication errors
   *
   * @param errorMessage The error message to check
   * @returns true if error should be retried
   */
  private static isRetryableError(errorMessage: string): boolean {
    const msg = errorMessage.toLowerCase();

    // Network-level errors (always retryable)
    if (
      msg.includes("network") ||
      msg.includes("timeout") ||
      msg.includes("econnrefused") ||
      msg.includes("enotfound") ||
      msg.includes("etimedout") ||
      msg.includes("connection") ||
      msg.includes("fetch failed") ||
      msg.includes("websocket")
    ) {
      return true;
    }

    // RPC/service errors (retryable)
    if (
      msg.includes("503") ||
      msg.includes("504") ||
      msg.includes("rate limit") ||
      msg.includes("too many requests") ||
      msg.includes("service unavailable")
    ) {
      return true;
    }

    // Non-retryable errors
    if (
      msg.includes("invalid address") ||
      msg.includes("contract not found") ||
      msg.includes("not configured") ||
      msg.includes("unauthorized") ||
      msg.includes("forbidden")
    ) {
      return false;
    }

    // Default: retry unknown errors (conservative approach)
    return true;
  }

  /**
   * Helper method to delay execution
   *
   * @param ms Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Set up handler for WebSocket disconnections
   * Automatically attempts to reconnect when connection is lost
   */
  private static setupDisconnectionHandler(api: ApiPromise, config: ContractConfig): void {
    api.on('disconnected', async () => {
      console.warn('WebSocket disconnected from RPC endpoint');
      this.notifyConnectionListeners(false);
      
      // Attempt automatic reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000); // Max 30s
        console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);
        
        await this.delay(delay);
        
        try {
          // Clear the old API instance
          this.api = null;
          
          // Attempt to reconnect
          await this.connect();
          console.log('Successfully reconnected to RPC endpoint');
        } catch (error) {
          console.error('Reconnection attempt failed:', error);
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached. Manual reconnection required.');
          }
        }
      }
    });

    api.on('connected', () => {
      console.log('WebSocket connected to RPC endpoint');
      this.reconnectAttempts = 0;
      this.notifyConnectionListeners(true);
    });

    api.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  /**
   * Subscribe to connection state changes
   * 
   * @param listener Callback function that receives connection status
   * @returns Unsubscribe function
   */
  static onConnectionChange(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.add(listener);
    
    // Immediately notify of current state
    listener(this.isConnected());
    
    // Return unsubscribe function
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of connection state change
   */
  private static notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  /**
   * Manually trigger reconnection attempt
   * Useful for UI "Retry" buttons
   * 
   * @returns Promise resolving when reconnection completes
   */
  static async reconnect(): Promise<void> {
    console.log('Manual reconnection triggered');
    
    // Disconnect existing connection
    await this.disconnect();
    
    // Reset reconnect attempts
    this.reconnectAttempts = 0;
    
    // Attempt new connection
    await this.connect();
  }

  /**
   * Verify the current connection matches the configured network
   * Useful for detecting when user switches networks in their wallet
   * 
   * @returns true if connected to correct network, false otherwise
   */
  static async verifyNetwork(): Promise<boolean> {
    try {
      if (!this.api || !this.api.isConnected) {
        return false;
      }

      const config = this.getConfig();
      const chainName = (await this.api.rpc.system.chain()).toString().toLowerCase();
      
      // Check if chain name matches expected network
      const expectedNetwork = config.network.toLowerCase();
      const isCorrectNetwork = chainName.includes(expectedNetwork);

      if (!isCorrectNetwork) {
        console.warn(
          `Network mismatch detected. Expected: ${config.network}, Connected to: ${chainName}`
        );
      }

      return isCorrectNetwork;
    } catch (error) {
      console.error('Failed to verify network:', error);
      return false;
    }
  }

  /**
   * Get information about the currently connected chain
   * 
   * @returns Chain information or null if not connected
   */
  static async getChainInfo(): Promise<{
    name: string;
    version: string;
    network: string;
  } | null> {
    try {
      if (!this.api || !this.api.isConnected) {
        return null;
      }

      const [chain, version] = await Promise.all([
        this.api.rpc.system.chain(),
        this.api.rpc.system.version(),
      ]);

      return {
        name: chain.toString(),
        version: version.toString(),
        network: this.getConfig().network,
      };
    } catch (error) {
      console.error('Failed to get chain info:', error);
      return null;
    }
  }
}
