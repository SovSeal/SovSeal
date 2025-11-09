/**
 * Basic tests for ContractService
 * 
 * Note: These are minimal tests to verify the service structure.
 * Full integration tests require a running Polkadot node and deployed contract.
 */

import { ContractService } from '../ContractService';

describe('ContractService', () => {
  describe('Configuration', () => {
    it('should throw error when contract address is not configured', () => {
      // Save original env
      const originalAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      
      // Remove contract address
      delete process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      
      // Should throw when trying to get config
      expect(() => {
        ContractService.getContractAddress();
      }).toThrow('Contract address not configured');
      
      // Restore env
      if (originalAddress) {
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS = originalAddress;
      }
    });

    it('should return contract address when configured', () => {
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS = 'test_address';
      
      const address = ContractService.getContractAddress();
      expect(address).toBe('test_address');
    });

    it('should return network name', () => {
      process.env.NEXT_PUBLIC_NETWORK = 'westend';
      
      const network = ContractService.getNetwork();
      expect(network).toBe('westend');
    });

    it('should default to westend network', () => {
      const originalNetwork = process.env.NEXT_PUBLIC_NETWORK;
      delete process.env.NEXT_PUBLIC_NETWORK;
      
      const network = ContractService.getNetwork();
      expect(network).toBe('westend');
      
      if (originalNetwork) {
        process.env.NEXT_PUBLIC_NETWORK = originalNetwork;
      }
    });
  });

  describe('Connection Status', () => {
    it('should report not connected initially', () => {
      expect(ContractService.isConnected()).toBe(false);
    });
  });
});
