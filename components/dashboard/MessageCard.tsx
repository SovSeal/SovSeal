"use client";

import { Message, MessageStatus } from "@/types/contract";
import { formatDistanceToNow } from "@/utils/dateUtils";
import {
  LockClosedIcon,
  LockOpenIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface MessageCardProps {
  message: Message;
  type: "sent" | "received";
  onUnlock?: (message: Message) => void;
}

export function MessageCard({ message, type, onUnlock }: MessageCardProps) {
  const isUnlockable = message.status === "Unlockable";
  const isLocked = message.status === "Locked";

  const getStatusConfig = (status: MessageStatus) => {
    switch (status) {
      case "Locked":
        return {
          bg: "bg-dark-800",
          border: "border-dark-700",
          text: "text-dark-400",
          icon: <LockClosedIcon className="h-4 w-4" />,
        };
      case "Unlockable":
        return {
          bg: "bg-brand-500/10",
          border: "border-brand-500/30",
          text: "text-brand-400",
          icon: <LockOpenIcon className="h-4 w-4" />,
        };
      case "Unlocked":
        return {
          bg: "bg-green-500/10",
          border: "border-green-500/30",
          text: "text-green-400",
          icon: <CheckCircleIcon className="h-4 w-4" />,
        };
    }
  };

  const statusConfig = getStatusConfig(message.status);

  const formatAddress = (address: string): string => {
    if (address.length <= 13) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getTimeUntilUnlock = (timestamp: number): string => {
    if (timestamp <= Date.now()) return "Unlockable now";
    return `Unlocks ${formatDistanceToNow(timestamp)}`;
  };

  return (
    <div className="card-glass group p-5 transition-all hover:border-brand-500/30">
      <div className="mb-4 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs text-dark-500">
              {type === "sent" ? "To:" : "From:"}
            </span>
            <span className="truncate font-mono text-sm text-dark-200">
              {formatAddress(
                type === "sent" ? message.recipient : message.sender
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-dark-500">
            <ClockIcon className="h-3 w-3" />
            {formatTimestamp(message.createdAt)}
          </div>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text} border`}
        >
          {statusConfig.icon}
          {message.status}
        </span>
      </div>

      <div className="border-t border-slate-500/20 pt-4">
        {isLocked && (
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <LockClosedIcon className="h-4 w-4" />
            <span>{getTimeUntilUnlock(message.unlockTimestamp)}</span>
          </div>
        )}

        {isUnlockable && type === "received" && (
          <div className="flex items-center gap-2 text-sm text-brand-400">
            <LockOpenIcon className="h-4 w-4" />
            <span className="font-medium">Ready to unlock</span>
          </div>
        )}

        {message.status === "Unlocked" && (
          <div className="flex items-center gap-2 text-sm text-green-400">
            <CheckCircleIcon className="h-4 w-4" />
            <span>Viewed</span>
          </div>
        )}

        {message.metadata && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-dark-500">
            <span>{message.metadata.mimeType}</span>
            {message.metadata.fileSize && (
              <span>
                {(message.metadata.fileSize / 1024 / 1024).toFixed(2)} MB
              </span>
            )}
            {message.metadata.duration && (
              <span>{Math.round(message.metadata.duration)}s</span>
            )}
          </div>
        )}

        {isUnlockable && type === "received" && onUnlock && (
          <button
            onClick={() => onUnlock(message)}
            className="btn-primary mt-4 w-full py-2 text-sm"
          >
            Unlock Message
          </button>
        )}

        {isLocked && type === "received" && (
          <p className="mt-3 text-center text-xs text-dark-500">
            Unlocks on {formatTimestamp(message.unlockTimestamp)}
          </p>
        )}
      </div>
    </div>
  );
}
