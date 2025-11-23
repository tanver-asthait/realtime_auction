# WebSocket Gateway Documentation

## Overview

This document describes the WebSocket events for the real-time football auction system using Socket.IO.

## Connection

- **URL**: `http://localhost:3001` (or your configured server URL)
- **CORS**: Enabled for frontend origin (default: `http://localhost:3000`)

---

## Client → Server Events

### 1. **bid**

Teams place bids during an active auction.

**Event Name**: `bid`

**Payload**:

```typescript
{
  teamId: string; // ID of the bidding team
  bidAmount: number; // Bid amount (must be higher than current highest)
}
```

**Response**:

```typescript
// Success
{
  event: 'bidAcknowledged',
  data: {
    success: true,
    teamId: string,
    bidAmount: number
  }
}

// Error
{
  event: 'bidError',
  data: {
    success: false,
    error: string
  }
}
```

**Example (JavaScript)**:

```javascript
socket.emit('bid', {
  teamId: '507f1f77bcf86cd799439011',
  bidAmount: 150,
});
```

---

### 2. **startAuction** (Admin)

Admin starts an auction for a specific player.

**Event Name**: `startAuction`

**Payload**:

```typescript
{
  playerId: string; // ID of the player to auction
}
```

**Response**:

```typescript
// Success
{
  event: 'auctionStarted',
  data: {
    success: true,
    playerId: string
  }
}

// Error
{
  event: 'auctionStartError',
  data: {
    success: false,
    error: string
  }
}
```

**Example**:

```javascript
socket.emit('startAuction', {
  playerId: '507f1f77bcf86cd799439012',
});
```

---

### 3. **nextPlayer** (Admin)

Admin moves to the next player.

**Event Name**: `nextPlayer`

**Payload**:

```typescript
{
  playerId: string; // ID of the next player
}
```

**Response**:

```typescript
// Success
{
  event: 'nextPlayerSet',
  data: {
    success: true,
    playerId: string
  }
}

// Error
{
  event: 'nextPlayerError',
  data: {
    success: false,
    error: string
  }
}
```

**Example**:

```javascript
socket.emit('nextPlayer', {
  playerId: '507f1f77bcf86cd799439013',
});
```

---

### 4. **sellPlayer** (Admin)

Admin ends the auction and sells the player to the highest bidder.

**Event Name**: `sellPlayer`

**Payload**:

```typescript
{
  playerId: string; // ID of the player to sell
}
```

**Response**:

```typescript
// Success
{
  event: 'playerSold',
  data: {
    success: true,
    playerId: string
  }
}

// Error
{
  event: 'sellPlayerError',
  data: {
    success: false,
    error: string
  }
}
```

**Example**:

```javascript
socket.emit('sellPlayer', {
  playerId: '507f1f77bcf86cd799439012',
});
```

---

## Server → Client Events (Broadcasts)

### 1. **stateUpdate**

Server broadcasts the complete auction state to all clients.

**Event Name**: `stateUpdate`

**Payload**:

```typescript
{
  currentPlayer: {
    _id: string,
    name: string,
    position: string,
    basePrice: number,
    finalPrice: number | null,
    boughtBy: string | null,
    status: 'pending' | 'auctioning' | 'sold'
  } | null,
  highestBid: number,
  highestBidTeam: {
    _id: string,
    name: string,
    budget: number,
    players: string[]
  } | null,
  timer: number,
  isRunning: boolean
}
```

**Listen Example**:

```javascript
socket.on('stateUpdate', (state) => {
  console.log('Auction state updated:', state);
  // Update your UI with the new state
});
```

---

### 2. **timerUpdate**

Server broadcasts timer updates (useful for countdown).

**Event Name**: `timerUpdate`

**Payload**:

```typescript
{
  timer: number,       // Remaining seconds
  isRunning: boolean   // Whether auction is active
}
```

**Listen Example**:

```javascript
socket.on('timerUpdate', (data) => {
  console.log(`Timer: ${data.timer}s, Running: ${data.isRunning}`);
  // Update countdown timer in UI
});
```

---

### 3. **auctionStarted**

Broadcast when a new auction starts.

**Event Name**: `auctionStarted`

**Payload**:

```typescript
{
  playerId: string,
  playerName: string,
  basePrice: number,
  timer: number
}
```

**Listen Example**:

```javascript
socket.on('auctionStarted', (data) => {
  console.log(`Auction started for ${data.playerName}`);
  // Show auction UI
});
```

---

### 4. **bidPlaced**

Broadcast when a new bid is placed.

**Event Name**: `bidPlaced`

**Payload**:

```typescript
{
  teamId: string,
  teamName: string,
  bidAmount: number,
  playerId: string,
  timestamp: string
}
```

**Listen Example**:

```javascript
socket.on('bidPlaced', (data) => {
  console.log(`${data.teamName} bid ${data.bidAmount}`);
  // Update bid display
});
```

---

### 5. **playerSold**

Broadcast when a player is sold.

**Event Name**: `playerSold`

**Payload**:

```typescript
{
  playerId: string,
  playerName: string,
  teamId: string,
  teamName: string,
  finalPrice: number,
  timestamp: string
}
```

**Listen Example**:

```javascript
socket.on('playerSold', (data) => {
  console.log(
    `${data.playerName} sold to ${data.teamName} for ${data.finalPrice}`,
  );
  // Show sold animation
});
```

---

### 6. **auctionEnded**

Broadcast when auction ends (no bids or timeout).

**Event Name**: `auctionEnded`

**Payload**:

```typescript
{
  playerId: string,
  sold: boolean,
  reason: 'timeout' | 'sold' | 'cancelled'
}
```

**Listen Example**:

```javascript
socket.on('auctionEnded', (data) => {
  console.log(`Auction ended: ${data.reason}`);
  // Reset auction UI
});
```

---

### 7. **auctionError**

Broadcast when an error occurs.

**Event Name**: `auctionError`

**Payload**:

```typescript
{
  message: string,
  code?: string
}
```

**Listen Example**:

```javascript
socket.on('auctionError', (error) => {
  console.error('Auction error:', error.message);
  // Show error notification
});
```

---

## Connection Lifecycle

### On Connect

When a client connects, the server automatically sends the current auction state:

```javascript
socket.on('connect', () => {
  console.log('Connected to auction server');
  // Server will automatically send 'stateUpdate' with current state
});
```

### On Disconnect

```javascript
socket.on('disconnect', () => {
  console.log('Disconnected from auction server');
});
```

---

## Complete Client Example (React/JavaScript)

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  withCredentials: true,
});

// Listen to broadcasts
socket.on('stateUpdate', (state) => {
  console.log('State:', state);
});

socket.on('timerUpdate', (data) => {
  console.log('Timer:', data.timer);
});

socket.on('bidPlaced', (data) => {
  console.log('New bid:', data);
});

socket.on('playerSold', (data) => {
  console.log('Player sold:', data);
});

socket.on('auctionError', (error) => {
  console.error('Error:', error);
});

// Place a bid (Team action)
function placeBid(teamId, amount) {
  socket.emit('bid', {
    teamId: teamId,
    bidAmount: amount,
  });
}

// Admin: Start auction
function startAuction(playerId) {
  socket.emit('startAuction', { playerId });
}

// Admin: Sell player
function sellPlayer(playerId) {
  socket.emit('sellPlayer', { playerId });
}

// Admin: Next player
function nextPlayer(playerId) {
  socket.emit('nextPlayer', { playerId });
}
```

---

## Event Flow Diagram

```
CLIENT (Team)                    SERVER                    ALL CLIENTS
     |                              |                            |
     |------ bid (teamId, amount) ->|                            |
     |                              |--- Validate & Process      |
     |<---- bidAcknowledged --------|                            |
     |                              |                            |
     |                              |--- broadcastBidPlaced ---->|
     |                              |--- broadcastStateUpdate -->|
     |                              |--- broadcastTimerUpdate -->|
     |                              |                            |


CLIENT (Admin)                   SERVER                    ALL CLIENTS
     |                              |                            |
     |-- startAuction (playerId) -->|                            |
     |                              |--- Start Auction Logic     |
     |<---- auctionStarted ---------|                            |
     |                              |                            |
     |                              |--- broadcastAuctionStarted-|
     |                              |--- broadcastStateUpdate -->|
     |                              |                            |
     |                              |                            |
     |-- sellPlayer (playerId) ---->|                            |
     |                              |--- End & Assign Player     |
     |<---- playerSold -------------|                            |
     |                              |                            |
     |                              |--- broadcastPlayerSold --->|
     |                              |--- broadcastStateUpdate -->|
```

---

## Gateway Methods (Internal Use)

The following methods are available in `AuctionGateway` for internal service use:

- `broadcastStateUpdate(stateData)` - Send state to all clients
- `broadcastTimerUpdate(timerData)` - Send timer updates
- `broadcastAuctionStarted(auctionData)` - Notify auction start
- `broadcastBidPlaced(bidData)` - Notify new bid
- `broadcastPlayerSold(soldData)` - Notify player sold
- `broadcastAuctionEnded(endData)` - Notify auction end
- `broadcastError(error)` - Notify error
- `getConnectedClientsCount()` - Get number of connected clients

---

## Testing with Socket.IO Client

```bash
npm install socket.io-client
```

```javascript
// test-socket.js
const io = require('socket.io-client');

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected!');

  // Test bid
  socket.emit('bid', {
    teamId: 'test-team-id',
    bidAmount: 100,
  });
});

socket.on('stateUpdate', (data) => {
  console.log('State:', JSON.stringify(data, null, 2));
});

socket.on('bidAcknowledged', (data) => {
  console.log('Bid acknowledged:', data);
});
```

Run: `node test-socket.js`

---

## Next Steps

1. Implement business logic in event handlers
2. Add authentication/authorization for admin events
3. Implement timer countdown mechanism
4. Add rate limiting for bid events
5. Add reconnection handling
6. Add room-based broadcasting (if multiple auctions)
