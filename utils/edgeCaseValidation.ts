/**
 * Edge Case Validation Utilities
 * 
 * Provides validation functions for handling edge cases and
 * preventing common errors.
 * 
 * Requirements: 12.2 - Handle edge cases
 */

// Pre-load web3Enable to avoid dynamic imports
let web3EnableCache: typeof import('@polkadot/extension-dapp').web3Enable | null = null;

if (typeof window !== 'undefined') {
  import('@polkadot/extension-dapp').then((module) => {
    web3EnableCache = module.web3Enable;
  }).catch(err => {
    console.warn('Failed to preload web3Enable:', err);
  });
}

/**
 * Validate Polkadot address format
 */
export function isValidPolkadotAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Polkadot addresses are base58 encoded and typically 47-48 characters
  const polkadotAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{47,48}$/;
  return polkadotAddressRegex.test(address.trim());
}

/**
 * Validate IPFS CID format
 */
export function isValidIPFSCID(cid: string): boolean {
  if (!cid || typeof cid !== 'string') {
    return false;
  }

  // CIDv0: Qm... (base58, 46 characters)
  // CIDv1: bafy... (base32) or other multibase prefixes
  return (
    /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid) ||
    /^b[a-z2-7]{58,}/.test(cid) ||
    /^bafy[a-z2-7]{55,}/.test(cid)
  );
}

/**
 * Validate timestamp is in the future
 */
export function isValidFutureTimestamp(timestamp: number): boolean {
  if (!timestamp || typeof timestamp !== 'number') {
    return false;
  }

  return timestamp > Date.now();
}

/**
 * Validate media file type
 */
export function isValidMediaType(mimeType: string): boolean {
  const validTypes = [
    // Audio
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    // Video
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
  ];

  return validTypes.includes(mimeType.toLowerCase());
}

/**
 * Validate file size
 */
export function isValidFileSize(
  size: number,
  maxSize: number = 100 * 1024 * 1024 // 100MB
): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Check if wallet extension is installed
 */
export async function isWalletInstalled(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // Use cached module or dynamic import as fallback
    let web3Enable = web3EnableCache;
    if (!web3Enable) {
      const module = await import('@polkadot/extension-dapp');
      web3Enable = module.web3Enable;
      web3EnableCache = web3Enable;
    }
    
    const extensions = await web3Enable('FutureProof');
    return extensions.length > 0;
  } catch {
    return false;
  }
}

/**
 * Check if browser supports required features
 */
export function checkBrowserSupport(): {
  supported: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  // Check Web Crypto API
  if (!window.crypto || !window.crypto.subtle) {
    missing.push('Web Crypto API');
  }

  // Check MediaRecorder API
  if (!window.MediaRecorder) {
    missing.push('MediaRecorder API');
  }

  // Check Blob support
  if (!window.Blob) {
    missing.push('Blob API');
  }

  // Check localStorage
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch {
    missing.push('localStorage');
  }

  return {
    supported: missing.length === 0,
    missing,
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate network connectivity
 */
export async function checkNetworkConnectivity(): Promise<boolean> {
  if (!navigator.onLine) {
    return false;
  }

  try {
    // Try to fetch a small resource with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if data appears corrupted
 */
export function isDataCorrupted(data: ArrayBuffer | Uint8Array): boolean {
  if (!data || data.byteLength === 0) {
    return true;
  }

  // Check for all zeros (likely corrupted)
  const view = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  const allZeros = view.every((byte) => byte === 0);

  return allZeros;
}

/**
 * Validate message metadata
 */
export interface MessageMetadataValidation {
  valid: boolean;
  errors: string[];
}

export function validateMessageMetadata(metadata: {
  encryptedKeyCID?: string;
  encryptedMessageCID?: string;
  messageHash?: string;
  unlockTimestamp?: number;
  sender?: string;
  recipient?: string;
}): MessageMetadataValidation {
  const errors: string[] = [];

  if (!metadata.encryptedKeyCID || !isValidIPFSCID(metadata.encryptedKeyCID)) {
    errors.push('Invalid encrypted key CID');
  }

  if (
    !metadata.encryptedMessageCID ||
    !isValidIPFSCID(metadata.encryptedMessageCID)
  ) {
    errors.push('Invalid encrypted message CID');
  }

  if (!metadata.messageHash || metadata.messageHash.length !== 64) {
    errors.push('Invalid message hash');
  }

  if (
    !metadata.unlockTimestamp ||
    typeof metadata.unlockTimestamp !== 'number'
  ) {
    errors.push('Invalid unlock timestamp');
  }

  if (!metadata.sender || !isValidPolkadotAddress(metadata.sender)) {
    errors.push('Invalid sender address');
  }

  if (!metadata.recipient || !isValidPolkadotAddress(metadata.recipient)) {
    errors.push('Invalid recipient address');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
