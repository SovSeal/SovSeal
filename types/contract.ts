/**
 * Type definitions for smart contract interactions
 */

/**
 * Status of a time-locked message
 */
export type MessageStatus = 'Locked' | 'Unlockable' | 'Unlocked';

/**
 * Complete message entity with metadata
 */
export interface Message {
  id: string;
  encryptedKeyCID: string;
  encryptedMessageCID: string;
  messageHash: string;
  unlockTimestamp: number;
  sender: string;
  recipient: string;
  status: MessageStatus;
  createdAt: number;
  metadata?: {
    fileSize: number;
    mimeType: string;
    duration?: number;
  };
}

/**
 * Parameters for storing a new message on-chain
 */
export interface StoreMessageParams {
  encryptedKeyCID: string;
  encryptedMessageCID: string;
  messageHash: string;
  unlockTimestamp: number;
  recipient: string;
}

/**
 * Dashboard filter options
 */
export interface DashboardFilters {
  status?: MessageStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
