/**
 * Contract interaction module
 * 
 * Provides services for interacting with the Polkadot smart contract
 * that stores time-locked message metadata.
 */

export { ContractService } from './ContractService';
export type {
  ContractConfig,
  MessageMetadata,
  TransactionResult,
} from './ContractService';
