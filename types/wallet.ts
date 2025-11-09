import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | null;
}

export interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  selectAccount: (address: string) => void;
  signMessage: (message: string) => Promise<string>;
  isHealthy: boolean;
  checkHealth: () => Promise<boolean>;
  reconnect: () => Promise<void>;
  onConnectionChange: (listener: (connected: boolean) => void) => () => void;
}
