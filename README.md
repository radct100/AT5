# Homebridge Air Touch 5 Plugin

A Homebridge plugin for integrating Air Touch 5 HVAC systems with HomeKit. This plugin allows you to control your ducted air conditioning system and individual zones through Apple HomeKit.

## Features

- ✅ System power control
- ✅ Operating mode selection (Cool, Heat, Dry, Fan, Auto)
- ✅ Target temperature adjustment
- ✅ Current temperature monitoring
- ✅ Zone-based control (enable/disable zones)
- ✅ Zone airflow percentage control (0-100%)
- ✅ Real-time status updates

## Installation

### Prerequisites

- Homebridge 1.6.0 or higher
- Node.js 18.0.0 or higher
- Air Touch 5 system with network access
- IP address/hostname of your Air Touch 5 controller

### Install from NPM

```bash
sudo npm install -g homebridge-airtouch5
```

### Install from GitHub (Development)

```bash
git clone https://github.com/radct100/AT5.git
cd AT5
npm install
npm run build
npm install -g .
```

## Configuration

Add the following to your Homebridge `config.json`:

```json
{
  "platforms": [
    {
      "platform": "AirTouch5",
      "name": "AirTouch5",
      "host": "192.168.1.100",
      "port": 8080,
      "statusInterval": 30000,
      "zones": [
        {
          "zoneNumber": 1,
          "name": "Living Room"
        },
        {
          "zoneNumber": 2,
          "name": "Bedroom"
        },
        {
          "zoneNumber": 3,
          "name": "Kitchen"
        }
      ]
    }
  ]
}
```

### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `platform` | string | Yes | - | Must be "AirTouch5" |
| `name` | string | Yes | - | Display name in Homebridge |
| `host` | string | Yes | - | IP address or hostname of Air Touch 5 controller |
| `port` | number | No | 8080 | Port of Air Touch 5 API |
| `statusInterval` | number | No | 30000 | Status polling interval in milliseconds |
| `zones` | array | No | - | Array of zone configurations |
| `zones[].zoneNumber` | number | Yes | - | Zone number (1-8 typically) |
| `zones[].name` | string | No | "Zone X" | Display name for the zone |

## API Requirements

This plugin communicates with the Air Touch 5 controller via HTTP REST API. The controller must support the following endpoints:

### System Endpoints

- `GET /status` - Get system and zone status
- `POST /power` - Control system power
- `POST /mode` - Set operating mode
- `POST /temperature` - Set target temperature

### Zone Endpoints

- `GET /zone/{zoneNumber}` - Get zone status
- `POST /zone/{zoneNumber}/power` - Control zone power
- `POST /zone/{zoneNumber}/percentage` - Set zone percentage

## Response Format

### Status Response

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
    }
  ]
}
```

### Zone Response

```json
{
  "zoneNumber": 1,
  "name": "Living Room",
  "power": true,
  "percentage": 80,
  "temperature": 21.2
}
```

## Homekit Accessories

Once configured, the plugin will create:

1. **Air Touch 5 System** - A thermostat accessory for:
   - Power on/off
   - Mode selection (Cool, Heat, Auto, Off)
   - Current temperature reading
   - Target temperature adjustment

2. **Zone Accessories** (one per configured zone) - Each zone provides:
   - Power on/off toggle (Switch service)
   - Airflow percentage control (Lightbulb brightness 0-100%)

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Lint

```bash
npm run lint
```

### Debug Logging

Enable debug logging in Homebridge by setting:

```json
{
  "debug": true
}
```

Check the Homebridge logs for detailed debug output.

## Troubleshooting

### Plugin not appearing in HomeKit

1. Verify the Air Touch 5 controller is reachable on the configured address and port
2. Check Homebridge logs for connection errors
3. Ensure the Air Touch 5 API is running and responding to requests
4. Restart Homebridge

### No response from accessory

1. Check that the `statusInterval` is set appropriately (too low may cause timeouts)
2. Verify network connectivity to the Air Touch 5 device
3. Check if the Air Touch 5 API is responding to manual requests: `curl http://{host}:{port}/status`

### Zone not responding

1. Verify the zone number is correct (typically 1-8)
2. Ensure the zone exists on your Air Touch 5 system
3. Check the API endpoint for that zone is available

## API Implementation Guide

If you need to implement a REST API bridge for your Air Touch 5 system, here are the required endpoints:

### GET /status

Returns the current system status.

**Response:** `AirTouchStatus` object

### POST /power

Controls system power.

**Request Body:**
```json
{
  "power": true
}
```

### POST /mode

Sets the operating mode.

**Request Body:**
```json
{
  "mode": "cool"
}
```

Valid modes: `cool`, `heat`, `dry`, `fan`, `auto`

### POST /temperature

Sets the target temperature.

**Request Body:**
```json
{
  "temperature": 22
}
```

### GET /zone/{zoneNumber}

Returns the status of a specific zone.

**Response:** `ZoneStatus` object

### POST /zone/{zoneNumber}/power

Controls zone power.

**Request Body:**
```json
{
  "power": true
}
```

### POST /zone/{zoneNumber}/percentage

Sets zone percentage (0-100).

**Request Body:**
```json
{
  "percentage": 80
}
```

## License

Apache 2.0 - see LICENSE file for details

## Support

For issues, feature requests, or questions, please open an issue on the [GitHub repository](https://github.com/radct100/AT5/issues).

## Changelog

### 1.0.0
- Initial release
- System power and mode control
- Temperature monitoring and control
- Zone-based zone control with percentage adjustment
- Real-time status updates