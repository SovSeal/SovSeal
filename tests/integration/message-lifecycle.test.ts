/**
 * Integration tests for message lifecycle
 * Tests message status transitions and timestamp verification
 */

import { describe, it, expect } from "vitest";

// Message status types
type MessageStatus = "Locked" | "Unlockable" | "Unlocked";

interface Message {
  id: string;
  encryptedKeyCID: string;
  encryptedMessageCID: string;
  messageHash: string;
  unlockTimestamp: number;
  sender: string;
  recipient: string;
  createdAt: number;
}

// Helper functions for message lifecycle
function calculateStatus(
  unlockTimestamp: number,
  isUnlocked: boolean = false
): MessageStatus {
  if (isUnlocked) return "Unlocked";
  return Date.now() >= unlockTimestamp ? "Unlockable" : "Locked";
}

function canUnlock(unlockTimestamp: number): boolean {
  return Date.now() >= unlockTimestamp;
}

function getTimeRemaining(unlockTimestamp: number): number {
  const remaining = unlockTimestamp - Date.now();
  return Math.max(0, remaining);
}

function filterMessagesByStatus(
  messages: Message[],
  status: MessageStatus,
  unlockedIds: Set<string>
): Message[] {
  return messages.filter((msg) => {
    const msgStatus = calculateStatus(
      msg.unlockTimestamp,
      unlockedIds.has(msg.id)
    );
    return msgStatus === status;
  });
}

function sortMessagesByTimestamp(
  messages: Message[],
  ascending: boolean = false
): Message[] {
  return [...messages].sort((a, b) => {
    return ascending
      ? a.unlockTimestamp - b.unlockTimestamp
      : b.unlockTimestamp - a.unlockTimestamp;
  });
}

describe("Message Lifecycle Integration", () => {
  describe("Message Status Calculation", () => {
    it("should calculate correct status for locked message", () => {
      const futureTimestamp = Date.now() + 60000;
      const status = calculateStatus(futureTimestamp, false);
      expect(status).toBe("Locked");
    });

    it("should calculate correct status for unlockable message", () => {
      const pastTimestamp = Date.now() - 60000;
      const status = calculateStatus(pastTimestamp, false);
      expect(status).toBe("Unlockable");
    });

    it("should calculate correct status for unlocked message", () => {
      const pastTimestamp = Date.now() - 60000;
      const status = calculateStatus(pastTimestamp, true);
      expect(status).toBe("Unlocked");
    });

    it("should handle edge case at exact unlock time", () => {
      const now = Date.now();
      const status = calculateStatus(now, false);
      expect(status).toBe("Unlockable");
    });
  });

  describe("Unlock Permission", () => {
    it("should allow unlock when time has passed", () => {
      const pastTimestamp = Date.now() - 1000;
      expect(canUnlock(pastTimestamp)).toBe(true);
    });

    it("should prevent unlock when time has not passed", () => {
      const futureTimestamp = Date.now() + 60000;
      expect(canUnlock(futureTimestamp)).toBe(false);
    });

    it("should allow unlock at exact timestamp", () => {
      const now = Date.now();
      expect(canUnlock(now)).toBe(true);
    });
  });

  describe("Time Remaining Calculation", () => {
    it("should return 0 for past timestamps", () => {
      const pastTimestamp = Date.now() - 60000;
      expect(getTimeRemaining(pastTimestamp)).toBe(0);
    });

    it("should return positive value for future timestamps", () => {
      const futureTimestamp = Date.now() + 60000;
      const remaining = getTimeRemaining(futureTimestamp);
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(60000);
    });

    it("should return 0 at exact unlock time", () => {
      const now = Date.now();
      expect(getTimeRemaining(now)).toBe(0);
    });
  });

  describe("Message Filtering", () => {
    const createTestMessage = (
      id: string,
      unlockTimestamp: number
    ): Message => ({
      id,
      encryptedKeyCID: `cid-key-${id}`,
      encryptedMessageCID: `cid-msg-${id}`,
      messageHash: `hash-${id}`,
      unlockTimestamp,
      sender: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      recipient: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      createdAt: Date.now() - 86400000,
    });

    it("should filter locked messages", () => {
      const messages: Message[] = [
        createTestMessage("1", Date.now() + 60000), // Locked
        createTestMessage("2", Date.now() - 60000), // Unlockable
        createTestMessage("3", Date.now() + 120000), // Locked
      ];

      const unlockedIds = new Set<string>();
      const locked = filterMessagesByStatus(messages, "Locked", unlockedIds);

      expect(locked).toHaveLength(2);
      expect(locked.map((m) => m.id)).toEqual(["1", "3"]);
    });

    it("should filter unlockable messages", () => {
      const messages: Message[] = [
        createTestMessage("1", Date.now() + 60000), // Locked
        createTestMessage("2", Date.now() - 60000), // Unlockable
        createTestMessage("3", Date.now() - 120000), // Unlockable
      ];

      const unlockedIds = new Set<string>();
      const unlockable = filterMessagesByStatus(
        messages,
        "Unlockable",
        unlockedIds
      );

      expect(unlockable).toHaveLength(2);
      expect(unlockable.map((m) => m.id)).toEqual(["2", "3"]);
    });

    it("should filter unlocked messages", () => {
      const messages: Message[] = [
        createTestMessage("1", Date.now() - 60000),
        createTestMessage("2", Date.now() - 120000),
        createTestMessage("3", Date.now() - 180000),
      ];

      const unlockedIds = new Set(["1", "3"]);
      const unlocked = filterMessagesByStatus(
        messages,
        "Unlocked",
        unlockedIds
      );

      expect(unlocked).toHaveLength(2);
      expect(unlocked.map((m) => m.id)).toEqual(["1", "3"]);
    });

    it("should handle empty message list", () => {
      const messages: Message[] = [];
      const unlockedIds = new Set<string>();
      const locked = filterMessagesByStatus(messages, "Locked", unlockedIds);

      expect(locked).toHaveLength(0);
    });
  });

  describe("Message Sorting", () => {
    const createTestMessage = (
      id: string,
      unlockTimestamp: number
    ): Message => ({
      id,
      encryptedKeyCID: `cid-key-${id}`,
      encryptedMessageCID: `cid-msg-${id}`,
      messageHash: `hash-${id}`,
      unlockTimestamp,
      sender: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      recipient: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      createdAt: Date.now() - 86400000,
    });

    it("should sort messages by timestamp descending", () => {
      const messages: Message[] = [
        createTestMessage("1", 1000),
        createTestMessage("2", 3000),
        createTestMessage("3", 2000),
      ];

      const sorted = sortMessagesByTimestamp(messages, false);

      expect(sorted.map((m) => m.id)).toEqual(["2", "3", "1"]);
    });

    it("should sort messages by timestamp ascending", () => {
      const messages: Message[] = [
        createTestMessage("1", 3000),
        createTestMessage("2", 1000),
        createTestMessage("3", 2000),
      ];

      const sorted = sortMessagesByTimestamp(messages, true);

      expect(sorted.map((m) => m.id)).toEqual(["2", "3", "1"]);
    });

    it("should not mutate original array", () => {
      const messages: Message[] = [
        createTestMessage("1", 3000),
        createTestMessage("2", 1000),
      ];

      const originalOrder = messages.map((m) => m.id);
      sortMessagesByTimestamp(messages, true);

      expect(messages.map((m) => m.id)).toEqual(originalOrder);
    });
  });

  describe("Status Transitions", () => {
    it("should transition from Locked to Unlockable over time", async () => {
      const unlockTime = Date.now() + 100; // 100ms from now

      // Initially locked
      expect(calculateStatus(unlockTime, false)).toBe("Locked");
      expect(canUnlock(unlockTime)).toBe(false);

      // Wait for unlock time
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Now unlockable
      expect(calculateStatus(unlockTime, false)).toBe("Unlockable");
      expect(canUnlock(unlockTime)).toBe(true);
    });

    it("should transition from Unlockable to Unlocked", () => {
      const pastTimestamp = Date.now() - 60000;

      // Initially unlockable
      expect(calculateStatus(pastTimestamp, false)).toBe("Unlockable");

      // After user unlocks
      expect(calculateStatus(pastTimestamp, true)).toBe("Unlocked");
    });

    it("should never transition from Unlocked", () => {
      const futureTimestamp = Date.now() + 60000;
      const pastTimestamp = Date.now() - 60000;

      // Once unlocked, always unlocked regardless of timestamp
      expect(calculateStatus(futureTimestamp, true)).toBe("Unlocked");
      expect(calculateStatus(pastTimestamp, true)).toBe("Unlocked");
    });
  });

  describe("Dashboard Scenarios", () => {
    const createTestMessage = (
      id: string,
      unlockTimestamp: number
    ): Message => ({
      id,
      encryptedKeyCID: `cid-key-${id}`,
      encryptedMessageCID: `cid-msg-${id}`,
      messageHash: `hash-${id}`,
      unlockTimestamp,
      sender: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      recipient: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      createdAt: Date.now() - 86400000,
    });

    it("should handle mixed message statuses", () => {
      const now = Date.now();
      const messages: Message[] = [
        createTestMessage("1", now + 60000), // Locked
        createTestMessage("2", now - 60000), // Unlockable
        createTestMessage("3", now + 120000), // Locked
        createTestMessage("4", now - 120000), // Unlockable
      ];

      const unlockedIds = new Set(["2"]);

      const locked = filterMessagesByStatus(messages, "Locked", unlockedIds);
      const unlockable = filterMessagesByStatus(
        messages,
        "Unlockable",
        unlockedIds
      );
      const unlocked = filterMessagesByStatus(
        messages,
        "Unlocked",
        unlockedIds
      );

      expect(locked).toHaveLength(2);
      expect(unlockable).toHaveLength(1);
      expect(unlocked).toHaveLength(1);
    });

    it("should sort and filter together", () => {
      const now = Date.now();
      const messages: Message[] = [
        createTestMessage("1", now - 60000),
        createTestMessage("2", now - 120000),
        createTestMessage("3", now - 30000),
      ];

      const unlockedIds = new Set<string>();
      const unlockable = filterMessagesByStatus(
        messages,
        "Unlockable",
        unlockedIds
      );
      const sorted = sortMessagesByTimestamp(unlockable, false);

      expect(sorted.map((m) => m.id)).toEqual(["3", "1", "2"]);
    });

    it("should handle real-time status updates", async () => {
      const unlockTime = Date.now() + 100;
      const messages: Message[] = [createTestMessage("1", unlockTime)];

      const unlockedIds = new Set<string>();

      // Initially locked
      let locked = filterMessagesByStatus(messages, "Locked", unlockedIds);
      expect(locked).toHaveLength(1);

      // Wait for unlock
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Now unlockable
      let unlockable = filterMessagesByStatus(
        messages,
        "Unlockable",
        unlockedIds
      );
      expect(unlockable).toHaveLength(1);

      // User unlocks
      unlockedIds.add("1");
      let unlocked = filterMessagesByStatus(messages, "Unlocked", unlockedIds);
      expect(unlocked).toHaveLength(1);
    });
  });
});
