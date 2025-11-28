const http = require('http');

const options = {
  hostname: '127.0.0.1', // Use explicit IP instead of localhost
  port: 3001,
  path: '/players',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  console.log(`headers: ${JSON.stringify(res.headers)}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.on('timeout', () => {
  console.error('Request timeout');
  req.destroy();
});

req.end();