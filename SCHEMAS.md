# Football Auction System - Schema & DTO Documentation

## Overview

This document describes all MongoDB schemas, DTOs, and service methods for the football auction system.

---

## 1. Player Module

### Player Schema

```typescript
{
  name: string (required)
  position: string (required)
  basePrice: number (required)
  finalPrice: number | null
  boughtBy: string | null (Team reference)
  status: 'pending' | 'auctioning' | 'sold' (default: 'pending')
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Player DTOs

**CreatePlayerDto:**

- name: string (required)
- position: string (required)
- basePrice: number (required, min: 0)
- finalPrice: number (optional, min: 0)
- boughtBy: string (optional)
- status: PlayerStatus (optional)

**UpdatePlayerDto:**

- All fields optional
- Same validation as CreatePlayerDto

### Player Service Methods

- `findAll()` - Get all players
- `findOne(id)` - Get player by ID
- `create(createPlayerDto)` - Create new player
- `update(id, updatePlayerDto)` - Update player
- `delete(id)` - Delete player
- `findByStatus(status)` - Get players by status
- `assignToTeam(playerId, teamId, finalPrice)` - Assign player to team
- `resetPlayerStatus(playerId)` - Reset player to pending

### Player Endpoints

- `GET /players` - Get all players
- `GET /players/:id` - Get player by ID
- `POST /players` - Create new player
- `PUT /players/:id` - Update player
- `DELETE /players/:id` - Delete player
- `GET /players/status/:status` - Get players by status

---

## 2. Team Module

### Team Schema

```typescript
{
  name: string (required)
  budget: number (required, default: 100)
  players: string[] (Player references, default: [])
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Team DTOs

**CreateTeamDto:**

- name: string (required)
- budget: number (optional, min: 0, default: 100)
- players: string[] (optional)

**UpdateTeamDto:**

- All fields optional
- Same validation as CreateTeamDto

### Team Service Methods

- `findAll()` - Get all teams with populated players
- `findOne(id)` - Get team by ID with populated players
- `create(createTeamDto)` - Create new team
- `update(id, updateTeamDto)` - Update team
- `delete(id)` - Delete team
- `addPlayerToTeam(teamId, playerId, playerPrice)` - Add player and deduct budget
- `removePlayerFromTeam(teamId, playerId, refundAmount)` - Remove player and refund budget
- `updateBudget(teamId, amount)` - Update team budget
- `getTeamPlayers(teamId)` - Get all players for a team

### Team Endpoints

- `GET /teams` - Get all teams
- `GET /teams/:id` - Get team by ID
- `POST /teams` - Create new team
- `PUT /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team
- `GET /teams/:id/players` - Get team's players

---

## 3. Auction Module

### Auction State Schema

```typescript
{
  currentPlayerId: string | null (Player reference)
  highestBid: number (default: 0)
  highestBidTeamId: string | null (Team reference)
  timer: number (default: 0)
  isRunning: boolean (default: false)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Auction DTOs

**CreateAuctionStateDto:**

- currentPlayerId: string (optional)
- highestBid: number (optional, min: 0)
- highestBidTeamId: string (optional)
- timer: number (optional, min: 0)
- isRunning: boolean (optional)

**UpdateAuctionStateDto:**

- All fields optional
- Same validation as CreateAuctionStateDto

**PlaceBidDto:**

- teamId: string (required)
- playerId: string (required)
- bidAmount: number (required, min: 0)

### Auction Service Methods

- `startAuction(playerId)` - Start auction for a player
  - Updates player status to 'auctioning'
  - Sets initial bid to player's basePrice
  - Sets timer to 30 seconds
- `placeBid(teamId, playerId, bidAmount)` - Place a bid
  - Validates auction is running
  - Validates bid is higher than current highest
  - Validates team has sufficient budget
  - Resets timer to 30 seconds
- `endAuction(playerId)` - End auction for a player
  - If winning bid exists: assigns player to team, deducts budget
  - If no bids: resets player to pending
  - Resets auction state
- `getAuctionStatus()` - Get current auction state
- `resetAuction()` - Reset all auction data and players
- `updateTimer(seconds)` - Update auction timer

### Auction Endpoints

- `POST /auction/start/:playerId` - Start auction
- `POST /auction/bid` - Place bid (body: PlaceBidDto)
- `POST /auction/end/:playerId` - End auction
- `GET /auction/status` - Get current auction status
- `POST /auction/reset` - Reset auction

---

## 4. WebSocket Gateway

### Events (to be implemented)

- `auctionStart` - Broadcast when auction starts
- `placeBid` - Broadcast when new bid is placed
- `auctionEnd` - Broadcast when auction ends
- `auctionUpdate` - General auction updates
- `timerUpdate` - Timer countdown updates

---

## Example Workflow

1. **Setup:**

   ```
   POST /teams - Create 4 teams (budget: 100 each)
   POST /players - Create 28 players (various positions, base prices)
   ```

2. **Start Auction:**

   ```
   POST /auction/start/:playerId
   Response: { currentPlayerId, highestBid (=basePrice), timer: 30, isRunning: true }
   ```

3. **Place Bids:**

   ```
   POST /auction/bid
   Body: { teamId, playerId, bidAmount }
   Response: Updated auction state with new highestBid
   ```

4. **End Auction:**

   ```
   POST /auction/end/:playerId
   Response: { playerId, sold: true, teamId, finalPrice }
   ```

5. **Check Results:**
   ```
   GET /teams/:id - View team's players and remaining budget
   GET /players/status/sold - View all sold players
   ```

---

## Validation Rules

- All IDs must be valid MongoDB ObjectIds
- Prices must be non-negative numbers
- Team budget must be sufficient for bids
- Players can only be auctioned if status is 'pending'
- Bids must be higher than current highest bid
- Only one auction can run at a time

---

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/auction
PORT=3001
FRONTEND_URL=http://localhost:3000
MAX_TEAMS=4
MAX_PLAYERS=28
DEFAULT_TEAM_BUDGET=100
```

---

## Next Steps

1. Implement WebSocket real-time updates in `auction.gateway.ts`
2. Add authentication/authorization
3. Create seed data script for initial players/teams
4. Add unit and integration tests
5. Implement timer countdown mechanism
6. Add auction history logging
