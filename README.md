# Football Player Auction System - Backend

A NestJS-based backend for managing a real-time football player auction system with WebSocket support, MongoDB persistence, and RESTful APIs.

## 🚀 Features

- **Real-time Bidding**: WebSocket-based live auction system using Socket.IO
- **RESTful APIs**: Complete CRUD operations for players, teams, and auction management
- **MongoDB Integration**: Persistent storage with Mongoose ODM
- **TypeScript**: Fully typed codebase with validation
- **Modular Architecture**: Clean, maintainable NestJS module structure
- **CORS Support**: Configured for frontend integration
- **Environment-based Configuration**: Support for local and production MongoDB

## 📋 System Requirements

- Node.js 18.19.1+ or 20.11.1+
- MongoDB (Local or Atlas)
- npm 6.11.0+ or yarn 1.13.0+

### Auction Rules

- 28 Players total
- 4 Teams competing
- Real-time bidding with countdown timer
- Budget management per team

## 📁 Project Structure

```
backend/
├── src/
│   ├── main.ts                      # Application entry point with CORS
│   ├── app.module.ts                # Root module with DB config
│   ├── seed.ts                      # Database seeding script
│   ├── players/                     # Players module
│   │   ├── players.schema.ts        # Player schema (Position, Status, BasePrice)
│   │   ├── players.service.ts       # Player CRUD + findNextUnsold()
│   │   ├── players.controller.ts    # Player REST endpoints
│   │   └── dto/                     # Create/Update DTOs
│   ├── teams/                       # Teams module
│   │   ├── teams.schema.ts          # Team schema (Name, Budget, Players)
│   │   ├── teams.service.ts         # Team CRUD operations
│   │   ├── teams.controller.ts      # Team REST endpoints
│   │   └── dto/                     # Create/Update DTOs
│   └── auction/                     # Auction module (Core)
│       ├── auction-state.schema.ts  # Auction state tracking
│       ├── auction.service.ts       # Auction business logic
│       ├── auction.controller.ts    # Auction REST endpoints
│       ├── auction.gateway.ts       # WebSocket event handlers
│       └── dto/                     # Bid/State DTOs
├── .env                             # Local MongoDB config
├── .env.production                  # Production MongoDB config
└── package.json
```

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Create environment files
cp .env.example .env
cp .env.example .env.production

# Update .env with your local MongoDB
MONGODB_URI=mongodb://localhost:27017/auction

# Update .env.production with MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/auction
```

## 🏃 Running the Application

### Development Mode

```bash
# Local MongoDB
npm run start:dev:local

# MongoDB Atlas
npm run start:dev:atlas

# Default (uses .env)
npm run start:dev
```

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Seed Database

```bash
# Seed with local MongoDB
npm run seed:local

# Seed with MongoDB Atlas
npm run seed:atlas

# Default seed
npm run seed
```

The seed script creates:

- 4 Teams with $1,000,000 budget each
- 28 Players across different positions (GK, Defender, Midfielder, Forward)

## 🌐 API Endpoints

Base URL: `http://localhost:3001` (local) or `https://your-backend.onrender.com` (production)

### Players

| Method | Endpoint       | Description       | Request Body      |
| ------ | -------------- | ----------------- | ----------------- |
| GET    | `/players`     | Get all players   | -                 |
| GET    | `/players/:id` | Get player by ID  | -                 |
| POST   | `/players`     | Create new player | `CreatePlayerDto` |
| PUT    | `/players/:id` | Update player     | `UpdatePlayerDto` |
| DELETE | `/players/:id` | Delete player     | -                 |

**CreatePlayerDto:**

```typescript
{
  name: string;
  position: 'Goal Keeper' | 'Defender' | 'Midfielder' | 'Forward';
  basePrice: number;
  image?: string;
}
```

### Teams

| Method | Endpoint     | Description     | Request Body    |
| ------ | ------------ | --------------- | --------------- |
| GET    | `/teams`     | Get all teams   | -               |
| GET    | `/teams/:id` | Get team by ID  | -               |
| POST   | `/teams`     | Create new team | `CreateTeamDto` |
| PUT    | `/teams/:id` | Update team     | `UpdateTeamDto` |
| DELETE | `/teams/:id` | Delete team     | -               |

**CreateTeamDto:**

```typescript
{
  name: string;
  budget: number;      // Default: 1000000
  owner?: string;
  contactEmail?: string;
}
```

### Auction

| Method | Endpoint                   | Description               | Request Body |
| ------ | -------------------------- | ------------------------- | ------------ |
| GET    | `/auction/state`           | Get current auction state | -            |
| POST   | `/auction/start/:playerId` | Start auction for player  | -            |
| POST   | `/auction/reset`           | Reset entire auction      | -            |

## 🔌 WebSocket Events

WebSocket URL: `http://localhost:3001` or `wss://your-backend.onrender.com`

### Client → Server Events

| Event                 | Payload                                                   | Description                                     |
| --------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| `startAuction`        | `{ playerId?: string }`                                   | Admin starts auction (auto-picks next if no ID) |
| `placeBid`            | `{ teamId: string, bidAmount: number, playerId: string }` | Team places bid                                 |
| `nextPlayer`          | `{ playerId?: string }`                                   | Admin moves to next player (auto-picks)         |
| `sellPlayer`          | `{ playerId?: string }`                                   | Admin sells current player (auto-picks)         |
| `requestCurrentState` | -                                                         | Client requests full state sync                 |

### Server → Client Events (Broadcasts)

| Event            | Payload               | Description                          |
| ---------------- | --------------------- | ------------------------------------ |
| `stateUpdate`    | `AuctionStateUpdate`  | Complete state (player, bids, teams) |
| `timerUpdate`    | `{ timer: number }`   | Countdown timer (1-60 seconds)       |
| `bidPlaced`      | `BidPlacedEvent`      | New bid notification                 |
| `playerSold`     | `PlayerSoldEvent`     | Player sold/unsold notification      |
| `auctionStarted` | `AuctionStartedEvent` | Auction started notification         |
| `auctionEnded`   | `AuctionEndedEvent`   | Auction ended notification           |
| `auctionError`   | `{ message: string }` | Error notification                   |

**Example `stateUpdate` payload:**

```typescript
{
  auctionState: {
    isRunning: true,
    currentPlayerId: "player123",
    highestBid: 50000,
    highestBidTeamId: "team456",
    timer: 30
  },
  currentPlayer: { name: "Player Name", position: "Forward", ... },
  highestBidTeam: { name: "Team Name", budget: 950000, ... }
}
```

**See [WEBSOCKET.md](./WEBSOCKET.md) for detailed documentation**

## 🧪 Testing WebSocket Connection

```bash
# Start the backend
npm run start:dev:local

# In another terminal, run test client
node test-socket-client.js
```

The test client demonstrates:

- Connecting to WebSocket
- Starting an auction
- Placing bids
- Handling all server events

## 🔧 Tech Stack

| Technology            | Purpose                         |
| --------------------- | ------------------------------- |
| **NestJS 10.3.0**     | Progressive Node.js framework   |
| **MongoDB**           | NoSQL database                  |
| **Mongoose 8.0.3**    | MongoDB ODM                     |
| **Socket.IO 4.6.0**   | WebSocket library for real-time |
| **TypeScript 5.3.3**  | Type-safe JavaScript            |
| **class-validator**   | DTO validation decorators       |
| **class-transformer** | Object transformation           |
| **@nestjs/config**    | Environment configuration       |

## 🌍 Environment Variables

### `.env` (Local Development)

```env
MONGODB_URI=mongodb://localhost:27017/auction
PORT=3001
HOST=0.0.0.0
FRONTEND_URL=http://localhost:4200
```

### `.env.production` (Production)

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/auction
NODE_ENV=production
FRONTEND_URL=https://your-frontend.onrender.com
```

## 🚀 Deployment (Render)

### Configuration

```yaml
# Build Command
npm install && npm run build

# Start Command
npm run start:prod
```

### Environment Variables on Render

```
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
FRONTEND_URL=https://your-frontend.onrender.com
PORT=3001
```

### CORS Configuration

Update `src/main.ts` with your frontend URL:

```typescript
app.enableCors({
  origin: ['http://localhost:4200', 'https://your-frontend.onrender.com'],
  credentials: true,
});
```

## 📖 Additional Documentation

- **[SCHEMAS.md](./SCHEMAS.md)** - Complete schema & DTO documentation
- **[WEBSOCKET.md](./WEBSOCKET.md)** - Detailed WebSocket events guide
- **[WEBSOCKET-QUICK.md](./WEBSOCKET-QUICK.md)** - Quick reference
- **[AUCTION-LOGIC.md](./AUCTION-LOGIC.md)** - Business logic documentation
- **[IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md)** - Implementation details

## ✅ Implementation Status

**Completed:**

- ✅ Player, Team, and Auction schemas with Mongoose
- ✅ Complete CRUD operations with validation
- ✅ WebSocket gateway with all event handlers
- ✅ Real-time auction state management
- ✅ Timer countdown mechanism
- ✅ Auto-select next unsold player
- ✅ Budget validation and team updates
- ✅ Environment-based configuration (local/Atlas)
- ✅ Seed script for initial data
- ✅ CORS configuration
- ✅ Production-ready deployment setup

**Pending:**

- ⏳ Authentication/Authorization
- ⏳ Unit and E2E tests
- ⏳ Rate limiting
- ⏳ Logging and monitoring

## 📝 License

MIT
