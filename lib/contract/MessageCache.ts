/**
 * MessageCache - Client-side message storage
 *
 * Temporary solution for storing and retrieving messages until
 * the smart contract is deployed and indexed properly.
 *
 * This provides instant loading and eliminates the need to scan
 * blockchain blocks for system remarks.
 */

import { MessageMetadata } from "./ContractService";

const MESSAGES_CACHE_KEY = "futureproof_messages_cache";

export interface MessageCache {
  sent: MessageMetadata[];
  received: MessageMetadata[];
  lastUpdated: number;
}

/**
 * Get the message cache from localStorage
 */
export function getMessageCache(): MessageCache {
  try {
    const stored = localStorage.getItem(MESSAGES_CACHE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading message cache:", error);
  }

  return {
    sent: [],
    received: [],
    lastUpdated: Date.now(),
  };
}

/**
 * Save the message cache to localStorage
 */
export function saveMessageCache(cache: MessageCache): void {
  try {
    cache.lastUpdated = Date.now();
    localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Error saving message cache:", error);
  }
}

/**
 * Add a sent message to the cache
 */
export function addSentMessage(message: MessageMetadata): void {
  const cache = getMessageCache();

  // Check if message already exists
  const exists = cache.sent.some((m) => m.id === message.id);
  if (!exists) {
    cache.sent.unshift(message); // Add to beginning
    saveMessageCache(cache);
  }
}

/**
 * Add a received message to the cache
 */
export function addReceivedMessage(message: MessageMetadata): void {
  const cache = getMessageCache();

  // Check if message already exists
  const exists = cache.received.some((m) => m.id === message.id);
  if (!exists) {
    cache.received.unshift(message); // Add to beginning
    saveMessageCache(cache);
  }
}

/**
 * Get sent messages for a specific address
 */
export function getSentMessages(address: string): MessageMetadata[] {
  const cache = getMessageCache();
  return cache.sent.filter((m) => m.sender === address);
}

/**
 * Get received messages for a specific address
 */
export function getReceivedMessages(address: string): MessageMetadata[] {
  const cache = getMessageCache();
  return cache.received.filter((m) => m.recipient === address);
}

/**
 * Clear the message cache
 */
export function clearMessageCache(): void {
  try {
    localStorage.removeItem(MESSAGES_CACHE_KEY);
  } catch (error) {
    console.error("Error clearing message cache:", error);
  }
}

/**
 * Add a message to both sent and received caches
 * Used when creating messages to make them immediately available to both sender and recipient
 */
export function addToGlobalCache(message: MessageMetadata): void {
  addSentMessage(message);
  addReceivedMessage(message);
}

/**
 * Sync messages from blockchain to cache
 * This will be used when proper contract indexing is available
 */
export function syncMessagesFromBlockchain(
  sent: MessageMetadata[],
  received: MessageMetadata[]
): void {
  const cache: MessageCache = {
    sent,
    received,
    lastUpdated: Date.now(),
  };
  saveMessageCache(cache);
}
