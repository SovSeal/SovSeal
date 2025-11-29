/**
 * MessageFilters - Filter and sort controls for message lists
 */

"use client";

import { MessageStatus } from "@/types/contract";

interface MessageFiltersProps {
  statusFilter: MessageStatus | "All";
  onStatusFilterChange: (status: MessageStatus | "All") => void;
  sortOrder: "newest" | "oldest";
  onSortOrderChange: (order: "newest" | "oldest") => void;
}

export function MessageFilters({
  statusFilter,
  onStatusFilterChange,
  sortOrder,
  onSortOrderChange,
}: MessageFiltersProps) {
  const statusOptions: Array<MessageStatus | "All"> = [
    "All",
    "Locked",
    "Unlockable",
    "Unlocked",
  ];

  return (
    <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Status Filter */}
        <div className="flex-1">
          <label
            htmlFor="status-filter"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Filter by Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as MessageStatus | "All")
            }
            className="w-full rounded-md border-gray-600 bg-gray-900 text-sm text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex-1">
          <label
            htmlFor="sort-order"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Sort by Date
          </label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) =>
              onSortOrderChange(e.target.value as "newest" | "oldest")
            }
            className="w-full rounded-md border-gray-600 bg-gray-900 text-sm text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
}
