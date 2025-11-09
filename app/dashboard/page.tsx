/**
 * Dashboard Page - Display sent and received time-locked messages
 *
 * Requirements: 7.1, 7.2, 8.1, 8.2, 11.4
 */

"use client";

import { useState } from "react";
import { SentMessages } from "@/components/dashboard/SentMessages";
import { ReceivedMessages } from "@/components/dashboard/ReceivedMessages";
import { useWallet } from "@/lib/wallet/WalletProvider";

type TabType = "sent" | "received";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("received");
  const { isConnected, address } = useWallet();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 text-3xl font-bold">Dashboard</h1>
          <p className="mb-6 text-gray-600">
            Please connect your Talisman wallet to view your messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("received")}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === "received"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Received Messages
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === "sent"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Sent Messages
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "received" && <ReceivedMessages address={address!} />}
          {activeTab === "sent" && <SentMessages address={address!} />}
        </div>
      </div>
    </div>
  );
}
