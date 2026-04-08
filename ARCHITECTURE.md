# Project Structure and Architecture

## Directory Overview

```
AT5/
├── src/                          # TypeScript source files
│   ├── index.ts                 # Plugin entry point - registers platform
│   ├── settings.ts              # Constants (PLATFORM_NAME, PLUGIN_NAME)
│   ├── platform.ts              # Main platform class
│   ├── accessory.ts             # Accessory implementation
│   └── client.ts                # Air Touch 5 API client
├── dist/                        # Compiled JavaScript output (generated)
├── node_modules/                # Dependencies (generated)
├── package.json                 # Project configuration and dependencies
├── tsconfig.json                # TypeScript compiler configuration
├── .eslintrc.json               # Code style rules
├── .gitignore                   # Git ignore patterns
├── .npmignore                   # NPM package exclusions
├── mock-server.js               # Mock Air Touch 5 API server for testing
├── README.md                    # Main documentation
├── QUICKSTART.md                # Quick start guide
├── API.md                       # API specification
├── CONTRIBUTING.md              # Contribution guidelines
├── CHANGELOG.md                 # Version history
├── LICENSE                      # Apache 2.0 license
├── config.example.json          # Example Homebridge configuration
└── INDEX.md                     # This file
```

## Architecture Overview

### Plugin Flow

```
┌─────────────────────────────────────────┐
│     Homebridge Initialization           │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│   index.ts - Plugin Entry Point         │
│  (Registers AirTouch5Platform)          │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  AirTouch5Platform (platform.ts)        │
│  - Loads config                         │
│  - Creates AirTouch5Client              │
│  - Discovers devices                    │
│  - Registers accessories                │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
    ┌──────┐  ┌──────┐  ┌──────┐
    │ Sys  │  │Zone1 │  │Zone2 │
    │Acc   │  │ Acc  │  │ Acc  │
    └──┬───┘  └──┬───┘  └──┬───┘
       │         │         │
       └────┬────┴────┬────┘
            ▼         ▼
      ┌──────────────────────┐
      │ AirTouch5Accessory   │
      │ (accessory.ts)       │
      │ - Characteristic     │
      │   handlers           │
      │ - Status tracking    │
      └──────────┬───────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │ AirTouch5Client      │
      │ (client.ts)          │
      │ - HTTP requests      │
      │ - API communication  │
      └──────────┬───────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │  Air Touch 5 Device  │
      │  (Remote HTTP API)   │
      └──────────────────────┘
```

## Module Descriptions

### index.ts
**Purpose:** Plugin entry point

**Responsibilities:**
- Export the platform registration function
- Called once during Homebridge startup
- Registers the AirTouch5Platform class

**Key Functions:**
- `module.exports(api)` - Registers the platform with Homebridge

### settings.ts
**Purpose:** Define plugin constants

**Exports:**
- `PLATFORM_NAME` - Used in config.json ("AirTouch5")
- `PLUGIN_NAME` - Package name ("homebridge-airtouch5")

### platform.ts
**Purpose:** Main platform implementation

**Class:** `AirTouch5Platform`

**Key Methods:**
- `constructor()` - Initialize and set up event listeners
- `configureAccessory()` - Restore cached accessories on startup
- `discoverDevices()` - Connect to Air Touch 5 and register accessories
- `registerSystemAccessory()` - Create main system thermostat
- `registerZoneAccessories()` - Create zone accessories
- `startStatusPolling()` - Periodic status updates

**Properties:**
- `accessories[]` - Array of cached/registered accessories
- `client` - AirTouch5Client instance
- `statusInterval` - Timer ID for polling

### client.ts
**Purpose:** HTTP API communication with Air Touch 5

**Class:** `AirTouch5Client`

**Key Methods:**
- `getStatus()` - GET /status - Retrieve system and zone status
- `setPower()` - POST /power - Control system power
- `setMode()` - POST /mode - Set operating mode
- `setTargetTemp()` - POST /temperature - Set target temperature
- `setZonePower()` - POST /zone/{id}/power - Control zone power
- `setZonePercentage()` - POST /zone/{id}/percentage - Set zone airflow
- `getZoneStatus()` - GET /zone/{id} - Get specific zone status

**Types:**
- `AirTouchStatus` - System status interface
- `ZoneStatus` - Zone status interface
- `AirTouch5Response` - API response interface

### accessory.ts
**Purpose:** Individual HomeKit accessory implementation

**Class:** `AirTouch5Accessory`

**Key Methods:**
- `setupSystemAccessory()` - Configure thermostat service
- `setupZoneAccessory()` - Configure switch/lightbulb services
- `getCurrentHeatingCoolingState()` - Get current AC state
- `setTargetHeatingCoolingState()` - Set AC mode/power
- `getCurrentTemperature()` - Get current temp
- `setTargetTemperature()` - Set target temp
- `getZonePower()` / `setZonePower()` - Zone power control
- `getZonePercentage()` / `setZonePercentage()` - Zone percentage control
- `startStatusUpdates()` - Periodic status sync to HomeKit

**Services:**
- System: Thermostat
- Zone: Switch + Lightbulb

## Data Flow

### System Control Example: Turning On Air Conditioner

```
User Action in Home App
         ↓
Homebridge API
         ↓
Characteristic.onSet() in Accessory
         ↓
setTargetHeatingCoolingState() handler
         ↓
client.setPower(true)
         ↓
HTTP POST /power → Air Touch 5 Device
         ↓
Device response
         ↓
Updated state in Air Touch 5
```

### Status Update Flow

```
Timer tick (every 30 seconds)
         ↓
client.getStatus()
         ↓
HTTP GET /status → Air Touch 5 Device
         ↓
Device returns current state
         ↓
Update characteristic values in HomeKit
         ↓
Home App reflects new state
```

## Configuration Structure

### Plugin Config (in config.json)

```json
{
  "platform": "AirTouch5",        // Must match PLATFORM_NAME
  "name": "Air Touch 5",           // Display name
  "host": "192.168.1.100",         // Device IP
  "port": 8080,                    // API port
  "statusInterval": 30000,         // Poll interval in ms
  "zones": [                        // Zone configuration
    {
      "zoneNumber": 1,
      "name": "Living Room"
    }
  ]
}
```

### Device State (in-memory)

```typescript
{
  power: true,
  mode: "cool",
  targetTemp: 22,
  currentTemp: 21.5,
  zones: [
    {
      zoneNumber: 1,
      name: "Living Room",
      power: true,
      percentage: 80,
      temperature: 21.2
    }
  ]
}
```

## HomeKit Services and Characteristics

### System Thermostat
- **Service:** Thermostat
- **Characteristics:**
  - `CurrentHeatingCoolingState` (read-only)
  - `TargetHeatingCoolingState` (read-write)
  - `CurrentTemperature` (read-only)
  - `TargetTemperature` (read-write)
  - `TemperatureDisplayUnits` (read-only)

### Zone Switch
- **Service:** Switch
- **Characteristics:**
  - `On` (read-write) - Zone power

### Zone Lightbulb
- **Service:** Lightbulb
- **Characteristics:**
  - `On` (read-write) - Zone power
  - `Brightness` (read-write) - Airflow percentage (0-100)

## Error Handling

Errors are handled at multiple levels:

1. **Client Level** (client.ts)
   - Network errors logged
   - Exceptions thrown to caller

2. **Accessory Level** (accessory.ts)
   - Handler exceptions caught
   - Default values returned on error
   - Errors logged with context

3. **Platform Level** (platform.ts)
   - Connection failures logged
   - Polling continues despite errors
   - User notified via Homebridge logs

## Build and Packaging

### TypeScript Compilation
```
src/*.ts → (tsc) → dist/*.js
                → dist/*.d.ts
```

### NPM Publishing
```
dist/
package.json
README.md
LICENSE
/   ↓ (npm publish)
NPM Registry
```

## Performance Considerations

- **Status Polling:** 30 seconds (default, configurable)
- **Characteristic Caching:** HomeKit framework caches values
- **HTTP Requests:** Concurrent requests use Axios pooling
- **Memory:** Minimal - single JSON state object
- **CPU:** Polling intervals prevent excessive CPU usage

## Testing Strategy

1. **Unit Testing:** Test individual methods
2. **Integration Testing:** Test with mock server
3. **Real Device Testing:** Test with actual Air Touch 5
4. **HomeKit Testing:** Verify HomeKit app integration

## Dependencies

- **axios** - HTTP client for API calls
- **homebridge** - HomeKit framework
- **@types/homebridge** - TypeScript definitions
- **typescript** - TypeScript compiler
- **eslint** - Code linting

## Extension Points

To add new features:

1. **New System Feature:** Add to AirTouch5Accessory.setupSystemAccessory()
2. **New Zone Feature:** Add to AirTouch5Accessory.setupZoneAccessory()
3. **New API Endpoint:** Add method to AirTouch5Client
4. **New Zone Type:** Update ZoneStatus interface in client.ts
