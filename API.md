# Air Touch 5 REST API Implementation

This document describes the REST API endpoints that the Air Touch 5 controller must expose for this plugin to function.

## Base URL

```
http://<device-ip>:<port>
```

Default port is typically 8080.

## System Endpoints

### GET /status

Returns the current system and all zones status.

**Parameters:** None

**Request:**
```
GET /status
```

**Response:**
```json
{
  "power": true,
  "mode": "cool",
  "targetTemp": 22,
  "currentTemp": 21.5,
  "zones": [
    {
      "zoneNumber": 1,
      "name": "Living Room",
      "power": true,
      "percentage": 80,
      "temperature": 21.2
    },
    {
      "zoneNumber": 2,
      "name": "Bedroom",
      "power": false,
      "percentage": 0,
      "temperature": 20.8
    }
  ]
}
```

**Response Fields:**
- `power` (boolean) - System is powered on
- `mode` (string) - Current operating mode: `cool`, `heat`, `dry`, `fan`, `auto`
- `targetTemp` (number) - Target temperature in Celsius
- `currentTemp` (number) - Current temperature in Celsius
- `zones` (array) - Array of zone status objects

### POST /power

Controls the system power.

**Request:**
```
POST /power
Content-Type: application/json

{
  "power": true
}
```

**Request Parameters:**
- `power` (boolean) - `true` to turn on, `false` to turn off

**Response:**
```json
{
  "status": "ok"
}
```

### POST /mode

Sets the operating mode.

**Request:**
```
POST /mode
Content-Type: application/json

{
  "mode": "cool"
}
```

**Request Parameters:**
- `mode` (string) - Operating mode: `cool`, `heat`, `dry`, `fan`, or `auto`

**Response:**
```json
{
  "status": "ok"
}
```

### POST /temperature

Sets the target temperature.

**Request:**
```
POST /temperature
Content-Type: application/json

{
  "temperature": 22.5
}
```

**Request Parameters:**
- `temperature` (number) - Target temperature in Celsius (typically 16-32°C)

**Response:**
```json
{
  "status": "ok"
}
```

## Zone Endpoints

### GET /zone/{zoneNumber}

Returns the status of a specific zone.

**Parameters:**
- `zoneNumber` (number, path parameter) - Zone number (1-8)

**Request:**
```
GET /zone/1
```

**Response:**
```json
{
  "zoneNumber": 1,
  "name": "Living Room",
  "power": true,
  "percentage": 80,
  "temperature": 21.2
}
```

**Response Fields:**
- `zoneNumber` (number) - The zone number
- `name` (string) - Zone name/description
- `power` (boolean) - Zone is enabled
- `percentage` (number) - Airflow percentage (0-100)
- `temperature` (number) - Zone temperature in Celsius (optional)

### POST /zone/{zoneNumber}/power

Controls zone power (enable/disable).

**Parameters:**
- `zoneNumber` (number, path parameter) - Zone number (1-8)

**Request:**
```
POST /zone/1/power
Content-Type: application/json

{
  "power": true
}
```

**Request Parameters:**
- `power` (boolean) - `true` to enable, `false` to disable zone

**Response:**
```json
{
  "status": "ok"
}
```

### POST /zone/{zoneNumber}/percentage

Sets the zone airflow percentage.

**Parameters:**
- `zoneNumber` (number, path parameter) - Zone number (1-8)

**Request:**
```
POST /zone/1/percentage
Content-Type: application/json

{
  "percentage": 75
}
```

**Request Parameters:**
- `percentage` (number) - Airflow percentage (0-100)
  - 0 = Zone disabled
  - 1-100 = Airflow percentage when enabled

**Response:**
```json
{
  "status": "ok"
}
```

## Error Responses

All endpoints should return appropriate HTTP status codes:

- `200 OK` - Request successful
- `400 Bad Request` - Invalid parameters
- `404 Not Found` - Zone doesn't exist
- `500 Internal Server Error` - Server error

**Error Response Format:**
```json
{
  "status": "error",
  "error": "Description of the error"
}
```

## Example Implementation (Node.js/Express)

Here's a basic example of implementing these endpoints:

```typescript
import express from 'express';

const app = express();
app.use(express.json());

// Mock Air Touch 5 state
let systemState = {
  power: true,
  mode: 'cool',
  targetTemp: 22,
  currentTemp: 21.5,
  zones: [
    { zoneNumber: 1, name: 'Living Room', power: true, percentage: 80, temperature: 21.2 },
    { zoneNumber: 2, name: 'Bedroom', power: false, percentage: 0, temperature: 20.8 },
  ],
};

// GET /status
app.get('/status', (req, res) => {
  res.json(systemState);
});

// POST /power
app.post('/power', (req, res) => {
  const { power } = req.body;
  if (typeof power !== 'boolean') {
    return res.status(400).json({ status: 'error', error: 'Invalid power value' });
  }
  systemState.power = power;
  res.json({ status: 'ok' });
});

// POST /mode
app.post('/mode', (req, res) => {
  const { mode } = req.body;
  const validModes = ['cool', 'heat', 'dry', 'fan', 'auto'];
  if (!validModes.includes(mode)) {
    return res.status(400).json({ status: 'error', error: 'Invalid mode' });
  }
  systemState.mode = mode;
  res.json({ status: 'ok' });
});

// POST /temperature
app.post('/temperature', (req, res) => {
  const { temperature } = req.body;
  if (typeof temperature !== 'number' || temperature < 16 || temperature > 32) {
    return res.status(400).json({ status: 'error', error: 'Invalid temperature' });
  }
  systemState.targetTemp = temperature;
  res.json({ status: 'ok' });
});

// GET /zone/:zoneNumber
app.get('/zone/:zoneNumber', (req, res) => {
  const zoneNumber = parseInt(req.params.zoneNumber);
  const zone = systemState.zones.find(z => z.zoneNumber === zoneNumber);
  if (!zone) {
    return res.status(404).json({ status: 'error', error: 'Zone not found' });
  }
  res.json(zone);
});

// POST /zone/:zoneNumber/power
app.post('/zone/:zoneNumber/power', (req, res) => {
  const zoneNumber = parseInt(req.params.zoneNumber);
  const { power } = req.body;
  
  const zone = systemState.zones.find(z => z.zoneNumber === zoneNumber);
  if (!zone) {
    return res.status(404).json({ status: 'error', error: 'Zone not found' });
  }
  
  zone.power = power;
  res.json({ status: 'ok' });
});

// POST /zone/:zoneNumber/percentage
app.post('/zone/:zoneNumber/percentage', (req, res) => {
  const zoneNumber = parseInt(req.params.zoneNumber);
  const { percentage } = req.body;
  
  if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
    return res.status(400).json({ status: 'error', error: 'Invalid percentage' });
  }
  
  const zone = systemState.zones.find(z => z.zoneNumber === zoneNumber);
  if (!zone) {
    return res.status(404).json({ status: 'error', error: 'Zone not found' });
  }
  
  zone.percentage = percentage;
  res.json({ status: 'ok' });
});

app.listen(8080, () => {
  console.log('API listening on port 8080');
});
```

## Testing the API

### cURL Examples

```bash
# Get system status
curl http://localhost:8080/status

# Turn on the system
curl -X POST http://localhost:8080/power \
  -H "Content-Type: application/json" \
  -d '{"power": true}'

# Set mode to cool
curl -X POST http://localhost:8080/mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "cool"}'

# Set target temperature
curl -X POST http://localhost:8080/temperature \
  -H "Content-Type: application/json" \
  -d '{"temperature": 22}'

# Get zone 1 status
curl http://localhost:8080/zone/1

# Enable zone 1
curl -X POST http://localhost:8080/zone/1/power \
  -H "Content-Type: application/json" \
  -d '{"power": true}'

# Set zone 1 to 75% airflow
curl -X POST http://localhost:8080/zone/1/percentage \
  -H "Content-Type: application/json" \
  -d '{"percentage": 75}'
```

## Notes

- All temperatures are in Celsius
- Zone numbers are typically 1-8
- Percentages are 0-100
- Timestamps are optional but recommended
- Consider implementing rate limiting for production use
- Ensure proper error handling and validation
