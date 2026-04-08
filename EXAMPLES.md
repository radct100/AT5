/**
 * Example: Using the Air Touch 5 Homebridge Plugin
 * 
 * This example demonstrates how the plugin integrates with Homebridge
 * and HomeKit to control an Air Touch 5 HVAC system.
 */

// ============================================================================
// 1. CONFIGURATION
// ============================================================================

// First, add this to your Homebridge config.json:
const exampleConfig = {
  "platforms": [
    {
      "platform": "AirTouch5",
      "name": "Air Touch 5",
      "host": "192.168.1.100",      // Your Air Touch 5 device IP
      "port": 8080,                  // API port
      "statusInterval": 30000,       // Poll every 30 seconds
      "zones": [
        {
          "zoneNumber": 1,
          "name": "Living Room"
        },
        {
          "zoneNumber": 2,
          "name": "Master Bedroom"
        },
        {
          "zoneNumber": 3,
          "name": "Guest Bedroom"
        }
      ]
    }
  ]
};

// ============================================================================
// 2. WHAT YOU GET IN HOMEKIT
// ============================================================================

// After configuration, these accessories appear in HomeKit:

// System Accessory - "Air Touch 5 System" (Thermostat)
// ├── Power Control (on/off)
// ├── Mode Selection (Cool, Heat, Auto, Off)
// ├── Current Temperature (read-only)
// ├── Target Temperature (adjustable)
// └── Temperature Unit (Celsius)

// Zone Accessory 1 - "Living Room" (Switch + Brightness)
// ├── Power Toggle (on/off) - Enable/disable zone
// └── Brightness Slider - Adjust airflow percentage (0-100%)

// Zone Accessory 2 - "Master Bedroom" (Switch + Brightness)
// ├── Power Toggle (on/off)
// └── Brightness Slider (0-100%)

// Zone Accessory 3 - "Guest Bedroom" (Switch + Brightness)
// ├── Power Toggle (on/off)
// └── Brightness Slider (0-100%)

// ============================================================================
// 3. HOMEKIT AUTOMATIONS
// ============================================================================

// Example automations you can create:

// Automation 1: Night Mode
// When: Sunset
// Do:
//   - Set Air Touch 5 to Heat mode
//   - Set target temperature to 20°C
//   - Enable Master Bedroom zone (100%)
//   - Disable Living Room zone (0%)
//   - Disable Guest Bedroom zone (0%)

// Automation 2: Leave Home
// When: Everyone leaves home
// Do:
//   - Turn off Air Touch 5
//   - Disable all zones

// Automation 3: Come Home
// When: First person arrives home
// Do:
//   - Turn on Air Touch 5
//   - Set to Cool mode
//   - Set target temperature to 22°C
//   - Set all zones to 80%

// Automation 4: Zone-Specific Control
// When: Person enters Master Bedroom
// Do:
//   - Set Living Room zone to 40%
//   - Set Master Bedroom zone to 100%

// ============================================================================
// 4. SIRI COMMANDS
// ============================================================================

// Control via voice:

// "Hey Siri, set the temperature to 24 degrees"
// → Sets target temperature to 24°C

// "Hey Siri, turn on the Air Touch 5"
// → Turns on the system

// "Hey Siri, set the Living Room to 80 percent"
// → Adjusts Living Room zone to 80% airflow

// "Hey Siri, turn off the Guest Bedroom"
// → Disables Guest Bedroom zone

// "Hey Siri, activate comfort mode"  (if you create a scene)
// → Runs your predefined comfort scene

// ============================================================================
// 5. SCENES
// ============================================================================

// Create scenes in Home app for common settings:

// Scene: Movie Mode
// - Set temperature to 21°C
// - Set Living Room to 100%
// - Set other zones to 20%

// Scene: Sleep Mode
// - Set temperature to 19°C
// - Set Master Bedroom to 70%
// - Disable other zones

// Scene: Party Mode
// - Set temperature to 20°C
// - Set all zones to 100%

// Scene: Eco Mode
// - Set temperature to 25°C (summer) or 18°C (winter)
// - Disable unused zones

// ============================================================================
// 6. API COMMUNICATION FLOW
// ============================================================================

// When you interact with HomeKit:

// User Action:
//   "Set temperature to 22°C in the Home app"
//
// HomeKit triggers:
//   → Homebridge platform receives command
//   → Accessory handler:
//      setTargetTemperature(22)
//   → Client library:
//      HTTP POST http://192.168.1.100:8080/temperature
//      Body: { "temperature": 22 }
//   → Air Touch 5 Device:
//      Receives command, updates thermostat
//   → Status polling (every 30s):
//      HTTP GET http://192.168.1.100:8080/status
//      Returns current state
//   → HomeKit updated with current status
//   → Home app refreshes

// ============================================================================
// 7. STATUS MONITORING
// ============================================================================

// The plugin continuously monitors (every 30 seconds):

// System Status:
// - Power state (on/off)
// - Current operating mode (cool/heat/fan/dry/auto)
// - Current temperature
// - Target temperature

// Zone Status (for each zone):
// - Power state (enabled/disabled)
// - Airflow percentage (0-100%)
// - Zone temperature (if available)

// All changes automatically update in HomeKit app

// ============================================================================
// 8. TROUBLESHOOTING
// ============================================================================

// If the accessory doesn't appear:
// 1. Check device is online: ping 192.168.1.100
// 2. Verify API works: curl http://192.168.1.100:8080/status
// 3. Check Homebridge logs: homebridge -D
// 4. Ensure config.json is valid JSON
// 5. Restart Homebridge

// If control is unresponsive:
// 1. Check network connectivity
// 2. Verify Air Touch 5 API is running
// 3. Check for firewall blocking port 8080
// 4. Restart both devices

// If status doesn't update:
// 1. Set debug mode and check logs
// 2. Verify statusInterval is reasonable (30000+ ms)
// 3. Check if API endpoint is working

// ============================================================================
// 9. TESTING THE MOCK SERVER
// ============================================================================

// For development/testing without a real device:

// Terminal 1: Start mock server
// $ node mock-server.js 8080

// Terminal 2: Configure Homebridge with:
// {
//   "platform": "AirTouch5",
//   "host": "localhost",
//   "port": 8080,
//   "zones": [/* ... */]
// }

// Terminal 3: Run Homebridge
// $ homebridge -U ~/.homebridge -D

// Now test with the mock server responding like a real device!

// ============================================================================
// 10. ADVANCED USAGE
// ============================================================================

// Multiple Air Touch 5 Systems:
// {
//   "platforms": [
//     {
//       "platform": "AirTouch5",
//       "name": "Upstairs AC",
//       "host": "192.168.1.100",
//       "zones": [/* ... */]
//     },
//     {
//       "platform": "AirTouch5",
//       "name": "Downstairs AC",
//       "host": "192.168.1.101",
//       "zones": [/* ... */]
//     }
//   ]
// }

// Custom Status Poll Interval (shorter for faster updates):
// {
//   "platform": "AirTouch5",
//   "host": "192.168.1.100",
//   "statusInterval": 10000,  // Poll every 10 seconds
//   "zones": [/* ... */]
// }

// Minimal Configuration (no zones):
// {
//   "platform": "AirTouch5",
//   "host": "192.168.1.100"
//   // Only system thermostat, no zone control
// }
