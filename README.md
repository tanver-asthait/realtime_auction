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

## WebSocket Events (To be implemented)

- `auctionStart` - Auction started for a player
- `placeBid` - New bid placed
- `auctionEnd` - Auction ended
- `auctionUpdate` - General auction updates

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - WebSocket library
- **TypeScript** - Type-safe JavaScript

## Next Steps

1. Implement service methods in each module
2. Create DTOs for request/response validation
3. Add authentication/authorization
4. Implement auction business logic
5. Add WebSocket event handlers
6. Create seed data for testing
7. Add unit and e2e tests

## License

MIT
