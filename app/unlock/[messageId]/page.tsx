/**
 * Unlock Page - Handle message unlocking and playback
 *
 * Requirements: 9.1, 9.2, 9.3, 10.2, 10.3
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useWallet } from "@/lib/wallet/WalletProvider";
import { ContractService } from "@/lib/contract/ContractService";
import { UnlockService, UnlockResult } from "@/lib/unlock";
import { UnlockFlow, MediaPlayer } from "@/components/unlock";
import { Message } from "@/types/contract";
import { calculateMessageStatus } from "@/utils/dateUtils";

export default function UnlockPage() {
  const router = useRouter();
  const params = useParams();
  const { address, isConnected } = useWallet();
  const [message, setMessage] = useState<Message | null>(null);
  const [unlockResult, setUnlockResult] = useState<UnlockResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messageId = params.messageId as string;

  // Load message details
  useEffect(() => {
    const loadMessage = async () => {
      if (!address || !isConnected) {
        setError("Please connect your wallet to unlock messages");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get all received messages and find the one we want
        const messages = await ContractService.getReceivedMessages(address);
        const messageMetadata = messages.find((m) => m.id === messageId);

        if (!messageMetadata) {
          setError("Message not found or you are not the recipient");
          setLoading(false);
          return;
        }

        // Check if already unlocked
        const isUnlocked = UnlockService.isMessageUnlocked(messageId);
        const status = calculateMessageStatus(
          messageMetadata.unlockTimestamp,
          isUnlocked
        );

        const msg: Message = {
          id: messageMetadata.id,
          encryptedKeyCID: messageMetadata.encryptedKeyCID,
          encryptedMessageCID: messageMetadata.encryptedMessageCID,
          messageHash: messageMetadata.messageHash,
          unlockTimestamp: messageMetadata.unlockTimestamp,
          sender: messageMetadata.sender,
          recipient: messageMetadata.recipient,
          status,
          createdAt: messageMetadata.createdAt,
        };

        setMessage(msg);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load message"
        );
      } finally {
        setLoading(false);
      }
    };

    loadMessage();
  }, [address, isConnected, messageId]);

  const handleUnlock = async (msg: Message, demoMode?: boolean) => {
    try {
      const result = await UnlockService.unlockMessage(msg, {
        demoMode,
        onProgress: (stage, progress) => {
          console.log(`${stage}: ${progress}%`);
        },
      });

      // Mark as unlocked
      UnlockService.markAsUnlocked(msg.id);

      // Update message status
      setMessage((prev) =>
        prev ? { ...prev, status: "Unlocked" } : null
      );

      // Set unlock result to show player
      setUnlockResult(result);
    } catch (err) {
      throw err; // Let UnlockFlow handle the error display
    }
  };

  const handleClose = () => {
    // Navigate back to dashboard
    router.push("/dashboard");
  };

  const handlePlayerClose = () => {
    // Clear unlock result and navigate back
    setUnlockResult(null);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading message...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            Unable to Load Message
          </h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={handleClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!message) {
    return null;
  }

  return (
    <>
      {!unlockResult && (
        <UnlockFlow
          message={message}
          onUnlock={handleUnlock}
          onClose={handleClose}
        />
      )}

      {unlockResult && (
        <MediaPlayer
          unlockResult={unlockResult}
          onClose={handlePlayerClose}
          messageId={message.id}
          sender={message.sender}
        />
      )}
    </>
  );
}
