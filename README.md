# Football Player Auction System - Backend

A NestJS-based backend for managing a football player auction system with real-time WebSocket support.

## Features

- **NestJS Framework**: Module-based architecture with dependency injection
- **MongoDB**: Using Mongoose for data persistence
- **WebSockets**: Real-time auction updates using Socket.IO
- **TypeScript**: Fully typed codebase
- **RESTful API**: CRUD operations for players, teams, and auction management

## System Requirements

- 28 Players total
- 4 Teams
- Real-time bidding system

## Project Structure

```
backend/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts            # Root module
│   ├── app.controller.ts        # Root controller
│   ├── app.service.ts           # Root service
│   ├── players/                 # Players module
│   │   ├── players.schema.ts    # Player schema/model
│   │   ├── players.service.ts   # Player business logic
│   │   ├── players.controller.ts # Player API endpoints
│   │   └── players.module.ts    # Player module definition
│   ├── teams/                   # Teams module
│   │   ├── teams.schema.ts      # Team schema/model
│   │   ├── teams.service.ts     # Team business logic
│   │   ├── teams.controller.ts  # Team API endpoints
│   │   └── teams.module.ts      # Team module definition
│   └── auction/                 # Auction module
│       ├── auction.service.ts   # Auction business logic
│       ├── auction.controller.ts # Auction API endpoints
│       ├── auction.gateway.ts   # WebSocket gateway
│       └── auction.module.ts    # Auction module definition
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env.example
```

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your MongoDB connection string
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Endpoints (To be implemented)

### Players

- `GET /players` - Get all players
- `GET /players/:id` - Get player by ID
- `POST /players` - Create new player
- `PUT /players/:id` - Update player
- `DELETE /players/:id` - Delete player

### Teams

- `GET /teams` - Get all teams
- `GET /teams/:id` - Get team by ID
- `POST /teams` - Create new team
- `PUT /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team

### Auction

- `POST /auction/start/:playerId` - Start auction for a player
- `POST /auction/bid` - Place a bid
- `POST /auction/end/:playerId` - End auction
- `GET /auction/status` - Get current auction status
- `POST /auction/reset` - Reset auction

## WebSocket Events

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `bid` | `{ teamId, bidAmount }` | Team places a bid |
| `startAuction` | `{ playerId }` | Admin starts auction |
| `nextPlayer` | `{ playerId }` | Admin moves to next player |
| `sellPlayer` | `{ playerId }` | Admin sells current player |

### Server → Client Events (Broadcasts)

| Event | Description |
|-------|-------------|
| `stateUpdate` | Complete auction state update |
| `timerUpdate` | Timer countdown update |
| `auctionStarted` | Auction started notification |
| `bidPlaced` | New bid placed notification |
| `playerSold` | Player sold notification |
| `auctionEnded` | Auction ended notification |
| `auctionError` | Error notification |

**See [WEBSOCKET.md](./WEBSOCKET.md) for complete WebSocket documentation**

## Testing WebSocket

```bash
# Start the server
npm run start:dev

# In another terminal, run the test client
node test-socket-client.js
```

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - WebSocket library
- **TypeScript** - Type-safe JavaScript
- **class-validator** - DTO validation
- **class-transformer** - DTO transformation

## Documentation

- [SCHEMAS.md](./SCHEMAS.md) - Complete schema & DTO documentation
- [WEBSOCKET.md](./WEBSOCKET.md) - WebSocket events documentation
- [WEBSOCKET-QUICK.md](./WEBSOCKET-QUICK.md) - Quick reference guide

## Implementation Status

✅ **Completed:**
- Player, Team, and Auction schemas
- All DTOs with validation
- CRUD services and controllers
- WebSocket gateway with event handlers
- Auction state management
- Helper methods for gateway integration

⏳ **Pending:**
- Business logic implementation in event handlers
- Timer countdown mechanism
- Authentication/authorization
- Seed data script
- Unit and e2e tests

## License

MIT
