#!/usr/bin/env node

/**
 * Mock Air Touch 5 API Server
 * 
 * This is a test utility that simulates an Air Touch 5 device.
 * Useful for development and testing without a real device.
 * 
 * Usage: node mock-server.js [port]
 * Example: node mock-server.js 8080
 */

const http = require('http');
const url = require('url');

const PORT = parseInt(process.argv[2]) || 8080;

// Mock system state
let state = {
  power: true,
  mode: 'cool',
  targetTemp: 22,
  currentTemp: 21.5,
  zones: [
    { zoneNumber: 1, name: 'Living Room', power: true, percentage: 80, temperature: 21.2 },
    { zoneNumber: 2, name: 'Main Bedroom', power: false, percentage: 0, temperature: 20.8 },
    { zoneNumber: 3, name: 'Guest Bedroom', power: true, percentage: 60, temperature: 19.5 },
  ],
};

// Simulate temperature changes
setInterval(() => {
  if (state.power) {
    const diff = state.targetTemp - state.currentTemp;
    state.currentTemp += diff * 0.01;
    
    state.zones.forEach(zone => {
      if (zone.power && zone.percentage > 0) {
        zone.temperature = zone.temperature + (Math.random() - 0.5) * 0.1;
      }
    });
  }
}, 1000);

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${req.method} ${pathname}`);

  // GET /status
  if (req.method === 'GET' && pathname === '/status') {
    res.writeHead(200);
    res.end(JSON.stringify(state));
    return;
  }

  // POST /power
  if (req.method === 'POST' && pathname === '/power') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        state.power = data.power;
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ status: 'error', error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // POST /mode
  if (req.method === 'POST' && pathname === '/mode') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const validModes = ['cool', 'heat', 'dry', 'fan', 'auto'];
        if (!validModes.includes(data.mode)) {
          throw new Error('Invalid mode');
        }
        state.mode = data.mode;
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ status: 'error', error: e.message }));
      }
    });
    return;
  }

  // POST /temperature
  if (req.method === 'POST' && pathname === '/temperature') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.temperature < 16 || data.temperature > 32) {
          throw new Error('Temperature out of range');
        }
        state.targetTemp = data.temperature;
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ status: 'error', error: e.message }));
      }
    });
    return;
  }

  // GET /zone/:zoneNumber
  const zoneMatch = pathname.match(/^\/zone\/(\d+)$/);
  if (req.method === 'GET' && zoneMatch) {
    const zoneNumber = parseInt(zoneMatch[1]);
    const zone = state.zones.find(z => z.zoneNumber === zoneNumber);
    if (!zone) {
      res.writeHead(404);
      res.end(JSON.stringify({ status: 'error', error: 'Zone not found' }));
      return;
    }
    res.writeHead(200);
    res.end(JSON.stringify(zone));
    return;
  }

  // POST /zone/:zoneNumber/power
  const zonePowerMatch = pathname.match(/^\/zone\/(\d+)\/power$/);
  if (req.method === 'POST' && zonePowerMatch) {
    const zoneNumber = parseInt(zonePowerMatch[1]);
    const zone = state.zones.find(z => z.zoneNumber === zoneNumber);
    if (!zone) {
      res.writeHead(404);
      res.end(JSON.stringify({ status: 'error', error: 'Zone not found' }));
      return;
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        zone.power = data.power;
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ status: 'error', error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // POST /zone/:zoneNumber/percentage
  const zonePercentMatch = pathname.match(/^\/zone\/(\d+)\/percentage$/);
  if (req.method === 'POST' && zonePercentMatch) {
    const zoneNumber = parseInt(zonePercentMatch[1]);
    const zone = state.zones.find(z => z.zoneNumber === zoneNumber);
    if (!zone) {
      res.writeHead(404);
      res.end(JSON.stringify({ status: 'error', error: 'Zone not found' }));
      return;
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.percentage < 0 || data.percentage > 100) {
          throw new Error('Percentage must be between 0-100');
        }
        zone.percentage = data.percentage;
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ status: 'error', error: e.message }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404);
  res.end(JSON.stringify({ status: 'error', error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Mock Air Touch 5 API Server listening on http://localhost:${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log('  GET  /status');
  console.log('  POST /power');
  console.log('  POST /mode');
  console.log('  POST /temperature');
  console.log('  GET  /zone/:zoneNumber');
  console.log('  POST /zone/:zoneNumber/power');
  console.log('  POST /zone/:zoneNumber/percentage');
  console.log('\nPress Ctrl+C to stop the server');
});

process.on('SIGINT', () => {
  console.log('\nServer stopped');
  process.exit(0);
});
