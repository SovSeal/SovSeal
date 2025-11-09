# Dashboard Components

This directory contains components for displaying and managing time-locked messages in the FutureProof application.

## Components

### MessageCard
Displays an individual message with status badge, metadata, and action buttons.

**Props:**
- `message: Message` - The message to display
- `type: "sent" | "received"` - Whether this is a sent or received message
- `onUnlock?: (message: Message) => void` - Callback for unlock button (received messages only)

**Features:**
- Status badge with color coding (Locked/Unlockable/Unlocked)
- Formatted addresses and timestamps
- Time until unlock countdown
- Unlock button for unlockable received messages
- Message metadata display (size, type, duration)

### MessageList
Displays a grid of message cards with empty state.

**Props:**
- `messages: Message[]` - Array of messages to display
- `type: "sent" | "received"` - Message type
- `onUnlock?: (message: Message) => void` - Unlock callback

**Features:**
- Responsive grid layout (1/2/3 columns)
- Empty state with helpful message
- Passes unlock handler to cards

### MessageFilters
Filter and sort controls for message lists.

**Props:**
- `statusFilter: MessageStatus | "All"` - Current status filter
- `onStatusFilterChange: (status) => void` - Status filter change handler
- `sortOrder: "newest" | "oldest"` - Current sort order
- `onSortOrderChange: (order) => void` - Sort order change handler

**Features:**
- Status filter dropdown (All/Locked/Unlockable/Unlocked)
- Sort order dropdown (Newest/Oldest)
- Responsive layout

### Pagination
Pagination controls for large message lists.

**Props:**
- `currentPage: number` - Current page number (1-indexed)
- `totalPages: number` - Total number of pages
- `onPageChange: (page: number) => void` - Page change handler
- `itemsPerPage: number` - Items per page
- `totalItems: number` - Total number of items

**Features:**
- Desktop and mobile layouts
- Page number buttons with ellipsis for large page counts
- Previous/Next navigation
- Item count display
- Auto-hides when only one page

### SentMessages
Container component for sent messages view.

**Props:**
- `address: string` - User's wallet address

**Features:**
- Loads sent messages from blockchain
- Real-time status updates (every 10 seconds)
- Status filtering and sorting
- Pagination (12 items per page)
- Loading and error states
- Refresh button

### ReceivedMessages
Container component for received messages view.

**Props:**
- `address: string` - User's wallet address

**Features:**
- Loads received messages from blockchain
- Tracks unlocked messages in localStorage
- Real-time status updates (every 10 seconds)
- Status filtering and sorting
- Pagination (12 items per page)
- Loading and error states
- Refresh button
- Unlock navigation

## Usage

```tsx
import { SentMessages, ReceivedMessages } from '@/components/dashboard';

// In your dashboard page
<SentMessages address={userAddress} />
<ReceivedMessages address={userAddress} />
```

## Requirements Implemented

- **7.1, 7.2**: Query and display sent messages with status
- **7.3, 7.4, 7.5**: Calculate and update message status in real-time
- **8.1, 8.2**: Query and display received messages with status
- **8.3, 8.4, 8.5**: Track unlocked messages and update status
- **11.4**: Responsive grid layout for mobile and desktop

## Status Calculation

Message status is calculated based on:
1. **Locked**: Current time < unlock timestamp
2. **Unlockable**: Current time >= unlock timestamp AND not yet unlocked
3. **Unlocked**: Message has been decrypted and viewed by recipient

Status updates automatically every 10 seconds to reflect time-based changes.

## LocalStorage

Unlocked message IDs are stored in localStorage under the key `futureproof_unlocked_messages` to persist unlock state across sessions.
