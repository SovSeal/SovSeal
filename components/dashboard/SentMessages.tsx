/**
 * SentMessages - Display messages sent by the user
 */

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Message, MessageStatus } from "@/types/contract";
import {
  ContractService,
  MessageMetadata,
} from "@/lib/contract/ContractService";
import { MessageList } from "./MessageList";
import { MessageFilters } from "./MessageFilters";
import { Pagination } from "./Pagination";
import { calculateMessageStatus } from "@/utils/dateUtils";

interface SentMessagesProps {
  address: string;
}

const ITEMS_PER_PAGE = 12;

export function SentMessages({ address }: SentMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MessageStatus | "All">(
    "All"
  );
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Convert MessageMetadata to Message with calculated status
   */
  const convertToMessage = useCallback((metadata: MessageMetadata): Message => {
    const status = calculateMessageStatus(metadata.unlockTimestamp, false);

    return {
      id: metadata.id,
      encryptedKeyCID: metadata.encryptedKeyCID,
      encryptedMessageCID: metadata.encryptedMessageCID,
      messageHash: metadata.messageHash,
      unlockTimestamp: metadata.unlockTimestamp,
      sender: metadata.sender,
      recipient: metadata.recipient,
      status,
      createdAt: metadata.createdAt,
    };
  }, []);

  /**
   * Load sent messages from blockchain
   */
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const metadata = await ContractService.getSentMessages(address);
      const messagesWithStatus = metadata.map(convertToMessage);

      setMessages(messagesWithStatus);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load messages";
      setError(errorMessage);
      console.error("Error loading sent messages:", err);
    } finally {
      setLoading(false);
    }
  }, [address, convertToMessage]);

  /**
   * Update message statuses based on current time
   */
  const updateStatuses = useCallback(() => {
    setMessages((prevMessages) =>
      prevMessages.map((message) => ({
        ...message,
        status: calculateMessageStatus(message.unlockTimestamp, false),
      }))
    );
  }, []);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  /**
   * Set up interval for real-time status updates
   */
  useEffect(() => {
    // Update statuses every 10 seconds
    const interval = setInterval(updateStatuses, 10000);

    return () => clearInterval(interval);
  }, [updateStatuses]);

  /**
   * Filter and sort messages
   */
  const filteredAndSortedMessages = useMemo(() => {
    let filtered = messages;

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((msg) => msg.status === statusFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === "newest") {
        return b.createdAt - a.createdAt;
      } else {
        return a.createdAt - b.createdAt;
      }
    });

    return sorted;
  }, [messages, statusFilter, sortOrder]);

  /**
   * Paginate messages
   */
  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedMessages.slice(startIndex, endIndex);
  }, [filteredAndSortedMessages, currentPage]);

  const totalPages = Math.ceil(
    filteredAndSortedMessages.length / ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sortOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-300">Loading sent messages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-start">
          <svg
            className="mt-0.5 h-6 w-6 text-red-600"
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
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Error loading messages
            </h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={loadMessages}
              className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-100">Sent Messages</h2>
          <p className="mt-1 text-sm text-gray-400">
            {filteredAndSortedMessages.length} message
            {filteredAndSortedMessages.length !== 1 ? "s" : ""}
            {statusFilter !== "All" && ` (${statusFilter})`}
          </p>
        </div>
        <button
          onClick={loadMessages}
          className="text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          Refresh
        </button>
      </div>

      <MessageFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      <MessageList messages={paginatedMessages} type="sent" />

      {filteredAndSortedMessages.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredAndSortedMessages.length}
          />
        </div>
      )}
    </div>
  );
}
