/**
 * Wallet Provider Tests
 *
 * Tests for wallet connection, lock detection, and account change scenarios.
 * These tests mock the window.ethereum provider to simulate browser extension behavior.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock EIP-1193 provider interface
interface MockProvider {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, handler: (...args: unknown[]) => void) => void;
    removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    emit?: (event: string, ...args: unknown[]) => void;
    isMetaMask?: boolean;
    isTalisman?: boolean;
}

/**
 * Creates a mock Ethereum provider for testing
 */
function createMockProvider(options: {
    accounts?: string[];
    chainId?: string;
    isLocked?: boolean;
    providerType?: "metamask" | "talisman";
}): MockProvider {
    const {
        accounts = [],
        chainId = "0x1",
        isLocked = false,
        providerType = "metamask",
    } = options;

    const listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

    const requestFn = async ({ method }: { method: string }): Promise<unknown> => {
        switch (method) {
            case "eth_accounts":
                // Locked wallet returns empty array
                return isLocked ? [] : accounts;
            case "eth_requestAccounts":
                if (isLocked) {
                    throw new Error("Wallet is locked. Please unlock your wallet.");
                }
                return accounts;
            case "eth_chainId":
                return chainId;
            case "wallet_switchEthereumChain":
                return null;
            default:
                throw new Error(`Unsupported method: ${method}`);
        }
    };

    const onFn = (event: string, handler: (...args: unknown[]) => void): void => {
        if (!listeners.has(event)) {
            listeners.set(event, new Set());
        }
        listeners.get(event)!.add(handler);
    };

    const removeListenerFn = (event: string, handler: (...args: unknown[]) => void): void => {
        listeners.get(event)?.delete(handler);
    };

    const emitFn = (event: string, ...args: unknown[]): void => {
        listeners.get(event)?.forEach((handler) => handler(...args));
    };

    return {
        request: requestFn,
        on: onFn,
        removeListener: removeListenerFn,
        emit: emitFn,
        isMetaMask: providerType === "metamask",
        isTalisman: providerType === "talisman",
    };
}

describe("Wallet Lock Detection", () => {
    let originalWindow: typeof globalThis.window;

    beforeEach(() => {
        originalWindow = globalThis.window;
    });

    afterEach(() => {
        globalThis.window = originalWindow;
        vi.clearAllMocks();
    });

    describe("Wallet Lock State Detection", () => {
        it("detects locked wallet via eth_accounts returning empty array", async () => {
            const provider = createMockProvider({
                accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
                isLocked: true,
            });

            const accounts = await provider.request({ method: "eth_accounts" });
            expect(accounts).toEqual([]);
        });

        it("detects unlocked wallet with accounts", async () => {
            const expectedAccount = "0x1234567890abcdef1234567890abcdef12345678";
            const provider = createMockProvider({
                accounts: [expectedAccount],
                isLocked: false,
            });

            const accounts = await provider.request({ method: "eth_accounts" });
            expect(accounts).toEqual([expectedAccount]);
        });

        it("throws error when requesting accounts from locked wallet", async () => {
            const provider = createMockProvider({
                accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
                isLocked: true,
            });

            await expect(
                provider.request({ method: "eth_requestAccounts" })
            ).rejects.toThrow("locked");
        });
    });

    describe("Account Changes Events", () => {
        it("registers accountsChanged listener", () => {
            const provider = createMockProvider({
                accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
            });

            const handler = vi.fn();
            const onSpy = vi.spyOn(provider, "on");
            provider.on("accountsChanged", handler);

            expect(onSpy).toHaveBeenCalledWith("accountsChanged", handler);
        });

        it("removes accountsChanged listener", () => {
            const provider = createMockProvider({
                accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
            });

            const handler = vi.fn();
            const removeSpy = vi.spyOn(provider, "removeListener");
            provider.on("accountsChanged", handler);
            provider.removeListener("accountsChanged", handler);

            expect(removeSpy).toHaveBeenCalledWith("accountsChanged", handler);
        });

        it("handles account change to different address", () => {
            const provider = createMockProvider({
                accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
            });

            const handler = vi.fn();
            provider.on("accountsChanged", handler);

            // Simulate account change
            const newAccount = "0xabcdef1234567890abcdef1234567890abcdef12";
            provider.emit?.("accountsChanged", [newAccount]);

            expect(handler).toHaveBeenCalledWith([newAccount]);
        });

        it("handles wallet lock via empty accounts array", () => {
            const provider = createMockProvider({
                accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
            });

            const handler = vi.fn();
            provider.on("accountsChanged", handler);

            // Simulate wallet lock - returns empty array
            provider.emit?.("accountsChanged", []);

            expect(handler).toHaveBeenCalledWith([]);
        });
    });

    describe("Chain Change Events", () => {
        it("registers chainChanged listener", () => {
            const provider = createMockProvider({ chainId: "0x1" });

            const handler = vi.fn();
            const onSpy = vi.spyOn(provider, "on");
            provider.on("chainChanged", handler);

            expect(onSpy).toHaveBeenCalledWith("chainChanged", handler);
        });

        it("handles chain change event", () => {
            const provider = createMockProvider({ chainId: "0x1" });

            const handler = vi.fn();
            provider.on("chainChanged", handler);

            // Simulate chain change to Sepolia
            provider.emit?.("chainChanged", "0xaa36a7");

            expect(handler).toHaveBeenCalledWith("0xaa36a7");
        });
    });

    describe("Disconnect Events", () => {
        it("registers disconnect listener", () => {
            const provider = createMockProvider({
                accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
            });

            const handler = vi.fn();
            const onSpy = vi.spyOn(provider, "on");
            provider.on("disconnect", handler);

            expect(onSpy).toHaveBeenCalledWith("disconnect", handler);
        });

        it("handles disconnect event", () => {
            const provider = createMockProvider({
                accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
            });

            const handler = vi.fn();
            provider.on("disconnect", handler);

            // Simulate disconnect with error
            provider.emit?.("disconnect", { code: 4900, message: "Disconnected" });

            expect(handler).toHaveBeenCalledWith({ code: 4900, message: "Disconnected" });
        });
    });

    describe("Provider Detection", () => {
        it("detects MetaMask provider", () => {
            const provider = createMockProvider({
                providerType: "metamask",
                accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
            });

            expect(provider.isMetaMask).toBe(true);
            expect(provider.isTalisman).toBe(false);
        });

        it("detects Talisman provider", () => {
            const provider = createMockProvider({
                providerType: "talisman",
                accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
            });

            expect(provider.isMetaMask).toBe(false);
            expect(provider.isTalisman).toBe(true);
        });
    });

    describe("Reconnection Scenarios", () => {
        it("handles unlock after lock via account change events", () => {
            const provider = createMockProvider({
                accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
            });

            const accountHistory: unknown[] = [];
            provider.on("accountsChanged", (accounts: unknown) => {
                accountHistory.push(accounts);
            });

            // Simulate lock (empty accounts)
            provider.emit?.("accountsChanged", []);

            // Simulate unlock (account returns)
            provider.emit?.("accountsChanged", ["0x1234567890abcdef1234567890abcdef12345678"]);

            expect(accountHistory).toEqual([
                [],
                ["0x1234567890abcdef1234567890abcdef12345678"],
            ]);
        });

        it("handles multiple account changes in sequence", () => {
            const provider = createMockProvider({
                accounts: ["0x0000000000000000000000000000000000000001"],
            });

            const accountHistory: unknown[] = [];
            provider.on("accountsChanged", (accounts: unknown) => {
                accountHistory.push(accounts);
            });

            // Sequence of changes
            provider.emit?.("accountsChanged", ["0x0000000000000000000000000000000000000002"]);
            provider.emit?.("accountsChanged", []); // Lock
            provider.emit?.("accountsChanged", ["0x0000000000000000000000000000000000000003"]); // Unlock with new account

            expect(accountHistory).toEqual([
                ["0x0000000000000000000000000000000000000002"],
                [],
                ["0x0000000000000000000000000000000000000003"],
            ]);
        });
    });
});
