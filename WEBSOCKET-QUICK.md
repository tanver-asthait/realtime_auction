# WebSocket Quick Reference

## Event Handlers (auction.gateway.ts)

### Client Events

| Event Name     | Handler Method         | Payload                 | Purpose                    |
| -------------- | ---------------------- | ----------------------- | -------------------------- |
| `bid`          | `handleBid()`          | `{ teamId, bidAmount }` | Team places bid            |
| `startAuction` | `handleStartAuction()` | `{ playerId }`          | Admin starts auction       |
| `nextPlayer`   | `handleNextPlayer()`   | `{ playerId }`          | Admin moves to next player |
| `sellPlayer`   | `handleSellPlayer()`   | `{ playerId }`          | Admin sells player         |

### Broadcast Methods

| Method                      | Event Emitted    | Purpose                     |
| --------------------------- | ---------------- | --------------------------- |
| `broadcastStateUpdate()`    | `stateUpdate`    | Send complete auction state |
| `broadcastTimerUpdate()`    | `timerUpdate`    | Send timer countdown        |
| `broadcastAuctionStarted()` | `auctionStarted` | Notify auction started      |
| `broadcastBidPlaced()`      | `bidPlaced`      | Notify new bid              |
| `broadcastPlayerSold()`     | `playerSold`     | Notify player sold          |
| `broadcastAuctionEnded()`   | `auctionEnded`   | Notify auction ended        |
| `broadcastError()`          | `auctionError`   | Broadcast error             |

## Service Helper Methods (auction.service.ts)

| Method                       | Return Type                | Purpose                       |
| ---------------------------- | -------------------------- | ----------------------------- |
| `getFormattedAuctionState()` | `Promise<any>`             | Get state with populated data |
| `validateBid()`              | `Promise<{valid, error?}>` | Validate if bid can be placed |
| `isAuctionRunning()`         | `Promise<boolean>`         | Check if auction is active    |
| `getCurrentPlayer()`         | `Promise<any>`             | Get current player in auction |

## Usage Example in Service

```typescript
import { AuctionGateway } from './auction.gateway';

@Injectable()
export class AuctionService {
  constructor(private gateway: AuctionGateway) {}

  async somMethod() {
    // Broadcast state update
    const state = await this.getFormattedAuctionState();
    this.gateway.broadcastStateUpdate(state);

    // Broadcast timer
    this.gateway.broadcastTimerUpdate({ timer: 30, isRunning: true });
  }
}
```

## Testing

```bash
# Start server
npm run start:dev

# Test with curl (REST)
curl http://localhost:3001/auction/status

# Test with Socket.IO client
node test-socket.js
```

## Implementation Status

✅ Gateway event handlers created (logic pending)
✅ Broadcast methods implemented
✅ Service helper methods added
✅ TypeScript interfaces defined
✅ Logger integrated
✅ Error handling structure
✅ Dependency injection configured

⏳ Business logic implementation (next step)
⏳ Timer countdown mechanism
⏳ Authentication for admin events
⏳ Rate limiting
