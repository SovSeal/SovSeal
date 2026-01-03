/**
 * Environment Configuration for SovSeal
 * 
 * Centralized environment detection and configuration.
 * Supports mainnet networks: Base (primary) and Polkadot Asset Hub (Jan 20, 2026).
 * Supports testnets: Base Sepolia and Passet Hub.
 */

import { getCurrentNetwork, isTestnet } from './networks';

/**
 * Environment types
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Get the current environment based on configuration
 */
export function getEnvironment(): Environment {
    const env = process.env.NODE_ENV;
    const network = getCurrentNetwork();

    if (env === 'development') {
        return 'development';
    }

    // Production environment is determined by mainnet usage
    if (!network.isTestnet) {
        return 'production';
    }

    return 'staging';
}

/**
 * Check if running in production (mainnet)
 */
export function isProduction(): boolean {
    return getEnvironment() === 'production';
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
    return getEnvironment() === 'development';
}

/**
 * Get display string for current environment
 */
export function getEnvironmentDisplay(): string {
    const network = getCurrentNetwork();
    const env = getEnvironment();

    return `${env} (${network.displayName})`;
}

/**
 * Base Mainnet configuration (Primary production network)
 * 
 * Available now - very low fees (~$0.001-0.01 per tx)
 * Use NEXT_PUBLIC_NETWORK=base
 */
export const BASE_MAINNET_CONFIG = {
    name: 'base',
    chainId: 8453,
    rpcEndpoints: [
        'https://mainnet.base.org',
        'https://base.llamarpc.com',
        'https://base.drpc.org',
    ],
    blockExplorer: 'https://basescan.org',
} as const;

/**
 * Polkadot Asset Hub mainnet configuration (Secondary)
 * 
 * Launches January 20, 2026
 * Use NEXT_PUBLIC_NETWORK=asset-hub
 */
export const POLKADOT_MAINNET_CONFIG = {
    name: 'asset-hub',
    chainId: 420420421,
    launchDate: new Date('2026-01-20T00:00:00Z'),
    rpcEndpoints: [
        'https://polkadot-asset-hub-eth-rpc.polkadot.io',
        'https://asset-hub-polkadot.api.onfinality.io/public',
    ],
    blockExplorer: 'https://assethub-polkadot.subscan.io',
} as const;

/**
 * @deprecated Use POLKADOT_MAINNET_CONFIG instead
 */
export const MAINNET_CONFIG = POLKADOT_MAINNET_CONFIG;

/**
 * Check if Polkadot Asset Hub mainnet is available (post January 20, 2026)
 */
export function isPolkadotMainnetAvailable(): boolean {
    return new Date() >= POLKADOT_MAINNET_CONFIG.launchDate;
}

/**
 * @deprecated Use isPolkadotMainnetAvailable() instead
 */
export function isMainnetAvailable(): boolean {
    return isPolkadotMainnetAvailable();
}

/**
 * Get days until Polkadot Asset Hub mainnet launch
 */
export function getDaysUntilPolkadotMainnet(): number {
    const now = new Date();
    const diff = POLKADOT_MAINNET_CONFIG.launchDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * @deprecated Use getDaysUntilPolkadotMainnet() instead
 */
export function getDaysUntilMainnet(): number {
    return getDaysUntilPolkadotMainnet();
}

/**
 * Validate that the current configuration is valid for production
 * 
 * Accepts either Base or Polkadot Asset Hub mainnet.
 * Polkadot Asset Hub requires date check (Jan 20, 2026).
 */
export function validateProductionConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const network = getCurrentNetwork();

    // Check for mainnet (Base or Asset Hub)
    if (network.isTestnet) {
        errors.push('Production requires mainnet (set NEXT_PUBLIC_NETWORK=base or asset-hub)');
    }

    // Check Polkadot mainnet availability (only if using Asset Hub)
    if (network.name === 'asset-hub' && !isPolkadotMainnetAvailable()) {
        errors.push(`Polkadot Asset Hub launches on ${POLKADOT_MAINNET_CONFIG.launchDate.toDateString()}. Use NEXT_PUBLIC_NETWORK=base for immediate production.`);
    }

    // Check contract address
    if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
        errors.push('NEXT_PUBLIC_CONTRACT_ADDRESS is required');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
