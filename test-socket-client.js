/**
 * Socket.IO Test Client
 * 
 * Usage: node test-socket-client.js
 * 
 * Make sure the server is running: npm run start:dev
 */

const io = require('socket.io-client');

// Connect to the server
const socket = io('http://localhost:3001', {
  withCredentials: true,
  transports: ['websocket', 'polling']
});

console.log('🔌 Attempting to connect to WebSocket server...\n');

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected to server!');
  console.log(`📡 Socket ID: ${socket.id}\n`);
  
  // Wait for initial state
  setTimeout(() => {
    runTests();
  }, 1000);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

// Listen to all broadcast events
socket.on('stateUpdate', (data) => {
  console.log('📊 STATE UPDATE:');
  console.log(JSON.stringify(data, null, 2));
  console.log('');
});

socket.on('timerUpdate', (data) => {
  console.log(`⏱️  TIMER UPDATE: ${data.timer}s (Running: ${data.isRunning})`);
});

socket.on('auctionStarted', (data) => {
  console.log('🎬 AUCTION STARTED:');
  console.log(JSON.stringify(data, null, 2));
  console.log('');
});

socket.on('bidPlaced', (data) => {
  console.log('💰 BID PLACED:');
  console.log(JSON.stringify(data, null, 2));
  console.log('');
});

socket.on('playerSold', (data) => {
  console.log('✅ PLAYER SOLD:');
  console.log(JSON.stringify(data, null, 2));
  console.log('');
});

socket.on('auctionEnded', (data) => {
  console.log('🏁 AUCTION ENDED:');
  console.log(JSON.stringify(data, null, 2));
  console.log('');
});

socket.on('auctionError', (error) => {
  console.error('⚠️  AUCTION ERROR:', error.message);
});

// Acknowledgment events
socket.on('bidAcknowledged', (data) => {
  console.log('✅ Bid Acknowledged:', data);
});

socket.on('bidError', (data) => {
  console.error('❌ Bid Error:', data);
});

// Test functions
function runTests() {
  console.log('🧪 Running test scenarios...\n');
  
  // Test 1: Place a bid (will likely fail - no active auction)
  console.log('Test 1: Attempting to place a bid...');
  socket.emit('bid', {
    teamId: 'test-team-123',
    bidAmount: 150
  });
  
  // Test 2: Try to start auction (admin event)
  setTimeout(() => {
    console.log('\nTest 2: Attempting to start auction...');
    socket.emit('startAuction', {
      playerId: 'test-player-456'
    });
  }, 2000);
  
  // Test 3: Try to sell player (admin event)
  setTimeout(() => {
    console.log('\nTest 3: Attempting to sell player...');
    socket.emit('sellPlayer', {
      playerId: 'test-player-456'
    });
  }, 4000);
  
  // Test 4: Try next player (admin event)
  setTimeout(() => {
    console.log('\nTest 4: Attempting to move to next player...');
    socket.emit('nextPlayer', {
      playerId: 'test-player-789'
    });
  }, 6000);
  
  // Disconnect after tests
  setTimeout(() => {
    console.log('\n✅ Tests complete. Disconnecting...');
    socket.disconnect();
    process.exit(0);
  }, 8000);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Disconnecting...');
  socket.disconnect();
  process.exit(0);
});
