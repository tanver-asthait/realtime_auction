# Auction Logic Implementation

## ✅ Implemented Features

### Auction Rules

1. **Initial Setup**
   - ✅ All players start with `basePrice = 1`
   - ✅ Teams have `budget = 100`
   - ✅ Bid increment is exactly `+1`

2. **Bid Validation**
   - ✅ Team budget must be >= new bid
   - ✅ Auction must be running
   - ✅ Player must be in "AUCTIONING" status
   - ✅ Bid must be exactly `currentHighestBid + 1`

3. **Timer Logic**
   - ✅ 20 seconds countdown timer
   - ✅ Timer resets to 20s on each bid
   - ✅ When timer hits 0 → automatically sell player
   - ✅ Timer updates broadcast every second

4. **Player Sale**
   - ✅ Assign player to highestBidTeam
   - ✅ Deduct budget from team
   - ✅ Mark player as SOLD
   - ✅ If no bids → player returns to PENDING

5. **State Management**
   - ✅ Only one auction can run at a time
   - ✅ Auction state persisted in MongoDB
   - ✅ Real-time updates via WebSocket

---

## 📋 Service Methods

### 1. `startAuction(playerId)`

**Purpose**: Start auction for a specific player

**Rules Applied**:

- ✅ Check if another auction is already running
- ✅ Validate player is in PENDING status
- ✅ Set player status to AUCTIONING
- ✅ Set initial bid to player's basePrice (default 1)
- ✅ Start 20-second timer
- ✅ Broadcast auction started event

**Example**:

```typescript
await auctionService.startAuction('player-id-123');
// Player now in auction, timer started at 20s
```

---

### 2. `validateBid(teamId, bidAmount)`

**Purpose**: Validate if a bid can be placed

**Validation Rules**:

- ✅ Auction must be running
- ✅ Player must be in AUCTIONING status
- ✅ Bid must be exactly `currentHighestBid + 1` (increment rule)
- ✅ Team budget must be >= bidAmount

**Returns**:

```typescript
{
  valid: boolean;
  error?: string;
}
```

**Example**:

```typescript
// Current highest bid = 5
const validation = await auctionService.validateBid('team-id', 6); // Valid
const validation2 = await auctionService.validateBid('team-id', 7); // Invalid (must be 6)
const validation3 = await auctionService.validateBid('team-id', 5); // Invalid (must be > 5)
```

---

### 3. `placeBid(teamId, playerId, bidAmount)`

**Purpose**: Place a bid on the current player

**Process**:

1. ✅ Validate bid (calls `validateBid()`)
2. ✅ Update highest bid and team
3. ✅ Reset timer to 20 seconds
4. ✅ Broadcast bid placed event
5. ✅ Broadcast state update

**Example**:

```typescript
await auctionService.placeBid('team-id', 'player-id', 6);
// Bid placed, timer reset to 20s
```

---

### 4. `startTimer()`

**Purpose**: Start countdown timer mechanism

**Behavior**:

- ✅ Counts down from current timer value to 0
- ✅ Updates every 1 second
- ✅ Broadcasts timer update each second
- ✅ When timer hits 0 → calls `sellPlayer()` automatically
- ✅ Stops if auction is no longer running

**Auto-execution**:

```
Timer: 20 → 19 → 18 → ... → 1 → 0 → Auto Sell Player
```

---

### 5. `sellPlayer(playerId)`

**Purpose**: End auction and sell player to highest bidder

**Process**:

1. ✅ Stop timer
2. ✅ Check if there's a winning bid
3. ✅ If bid exists:
   - Assign player to team (status → SOLD)
   - Deduct budget from team
   - Add player to team's roster
   - Broadcast player sold event
4. ✅ If no bids:
   - Return player to PENDING status
5. ✅ Reset auction state
6. ✅ Broadcast auction ended event

**Example**:

```typescript
const result = await auctionService.sellPlayer('player-id');
// Result:
{
  playerId: 'player-id',
  playerName: 'John Doe',
  sold: true,
  teamId: 'team-id',
  teamName: 'Team A',
  finalPrice: 15,
  timestamp: '2025-11-23T...'
}
```

---

### 6. `nextPlayer(playerId)`

**Purpose**: Move to next player (admin function)

**Process**:

1. ✅ If auction is running → sell current player first
2. ✅ Start auction for next player

**Example**:

```typescript
await auctionService.nextPlayer('next-player-id');
// Previous auction ended, new auction started
```

---

## 🔄 Auction Flow

### Normal Flow (with bids)

```
1. Admin: startAuction(playerId)
   ├─ Player status: PENDING → AUCTIONING
   ├─ Initial bid: 1 (basePrice)
   ├─ Timer: 20s
   └─ Broadcast: auctionStarted

2. Timer countdown starts: 20 → 19 → 18 → ...
   └─ Broadcast: timerUpdate (every second)

3. Team A: placeBid(teamId, playerId, 2)
   ├─ Validate: ✅ (2 = 1 + 1)
   ├─ Update highest bid: 2
   ├─ Timer reset: 20s
   └─ Broadcast: bidPlaced, stateUpdate

4. Team B: placeBid(teamId, playerId, 3)
   ├─ Validate: ✅ (3 = 2 + 1)
   ├─ Update highest bid: 3
   ├─ Timer reset: 20s
   └─ Broadcast: bidPlaced, stateUpdate

5. Timer countdown: 20 → 19 → ... → 1 → 0
   └─ Auto trigger: sellPlayer()

6. sellPlayer() executes
   ├─ Assign player to Team B (highest bidder)
   ├─ Deduct 3 from Team B budget
   ├─ Player status: AUCTIONING → SOLD
   ├─ Reset auction state
   └─ Broadcast: playerSold, auctionEnded, stateUpdate
```

---

### No Bids Flow

```
1. Admin: startAuction(playerId)
   └─ Player status: PENDING → AUCTIONING

2. Timer countdown: 20 → ... → 0
   └─ Auto trigger: sellPlayer()

3. sellPlayer() executes
   ├─ No bids detected
   ├─ Player status: AUCTIONING → PENDING
   ├─ Reset auction state
   └─ Broadcast: auctionEnded (reason: no_bids)
```

---

### Manual Sell (Admin)

```
1. Auction running with bids
2. Admin: sellPlayer(playerId)
   ├─ Stop timer immediately
   ├─ Assign to highest bidder
   └─ Broadcast: playerSold
```

---

## 🎯 Bid Validation Examples

### Valid Bids ✅

```typescript
// Current highest: 1
placeBid(teamId, playerId, 2); // ✅ Valid (1 + 1 = 2)

// Current highest: 5
placeBid(teamId, playerId, 6); // ✅ Valid (5 + 1 = 6)

// Current highest: 99, Team budget: 100
placeBid(teamId, playerId, 100); // ✅ Valid (within budget)
```

### Invalid Bids ❌

```typescript
// Current highest: 1
placeBid(teamId, playerId, 3); // ❌ Invalid (must be 2, not 3)
placeBid(teamId, playerId, 1); // ❌ Invalid (must be higher)

// Current highest: 5
placeBid(teamId, playerId, 7); // ❌ Invalid (must be 6, not 7)

// Team budget: 50, Current highest: 50
placeBid(teamId, playerId, 51); // ❌ Invalid (insufficient budget)

// Auction not running
placeBid(teamId, playerId, 2); // ❌ Invalid (no active auction)
```

---

## 🔗 Gateway Integration

### Event Flow

**Client → Gateway → Service**

1. **Start Auction**

```
Client: emit('startAuction', { playerId })
  ↓
Gateway: handleStartAuction()
  ↓
Service: startAuction(playerId)
  ↓
Broadcast: auctionStarted, stateUpdate
```

2. **Place Bid**

```
Client: emit('bid', { teamId, bidAmount })
  ↓
Gateway: handleBid()
  ↓
Service: validateBid() → placeBid()
  ↓
Broadcast: bidPlaced, stateUpdate, timerUpdate
```

3. **Auto Sell (Timer = 0)**

```
Timer: 0
  ↓
Service: sellPlayer() (auto-called)
  ↓
Broadcast: playerSold, auctionEnded, stateUpdate
```

---

## 📊 State Management

### Auction State Structure

```typescript
{
  currentPlayerId: string | null,   // Player being auctioned
  highestBid: number,                // Current highest bid
  highestBidTeamId: string | null,  // Team with highest bid
  timer: number,                     // Countdown timer (seconds)
  isRunning: boolean                 // Auction active flag
}
```

### State Transitions

```
IDLE → START_AUCTION → RUNNING → TIMER_0 → SOLD → IDLE
       (player set)   (bids)     (auto)    (reset)

IDLE → START_AUCTION → RUNNING → TIMER_0 → NO_BIDS → IDLE
       (player set)   (no bids)  (auto)    (pending)
```

---

## 🧪 Testing Scenarios

### Scenario 1: Normal Auction

```bash
1. Create 4 teams (budget: 100 each)
2. Create 1 player (basePrice: 1)
3. Start auction → player-1
4. Team A bids 2
5. Team B bids 3
6. Team A bids 4
7. Wait for timer to hit 0
8. Verify: Player assigned to Team A, budget deducted
```

### Scenario 2: No Bids

```bash
1. Start auction → player-1
2. Wait for timer to hit 0
3. Verify: Player returns to PENDING
```

### Scenario 3: Budget Limit

```bash
1. Team A budget: 10
2. Current bid: 9
3. Team A tries to bid 10 → ✅ Success
4. Team A tries to bid 11 → ❌ Fail (insufficient budget)
```

### Scenario 4: Bid Increment

```bash
1. Current bid: 5
2. Team A bids 7 → ❌ Fail (must be 6)
3. Team A bids 6 → ✅ Success
```

---

## 🚀 Usage Example

```typescript
// Admin starts auction
socket.emit('startAuction', { playerId: 'player-1' });

// Team places bid
socket.emit('bid', { teamId: 'team-1', bidAmount: 2 });

// Listen to updates
socket.on('stateUpdate', (state) => {
  console.log('Current bid:', state.highestBid);
  console.log('Timer:', state.timer);
});

socket.on('timerUpdate', (data) => {
  console.log('Countdown:', data.timer);
});

socket.on('playerSold', (data) => {
  console.log('Player sold to', data.teamName, 'for', data.finalPrice);
});
```

---

## ⚙️ Configuration

### Timer Settings

- Default: 20 seconds
- Resets on each bid
- Updates broadcast: Every 1 second

### Bid Rules

- Increment: Exactly +1
- Validation: Real-time
- Budget check: Before bid placement

### State Persistence

- MongoDB: AuctionState collection
- Real-time: In-memory timer
- Broadcasts: WebSocket (Socket.IO)

---

## 🎉 Implementation Complete!

✅ All auction rules implemented
✅ Timer countdown with auto-sell
✅ Bid validation with +1 increment
✅ Budget management
✅ WebSocket broadcasting
✅ Error handling
✅ State persistence

**Status**: Ready for production testing! 🚀
