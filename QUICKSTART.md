# Quick Start Guide

## Installation Steps

### 1. Find Your Air Touch 5 IP Address

First, identify the IP address of your Air Touch 5 controller on your network. You can do this through:
- Your router's admin panel
- Air Touch 5 mobile app settings
- Network scanning tools like Angry IP Scanner

### 2. Verify API Access

Test if the Air Touch 5 API is accessible:

```bash
curl http://<your-ip>:8080/status
```

If this returns a JSON response with system status, the API is working.

### 3. Install Homebridge (if not already installed)

```bash
sudo npm install -g homebridge
```

### 4. Install the Plugin

```bash
sudo npm install -g homebridge-airtouch5
```

### 5. Configure the Plugin

Edit your Homebridge `config.json` (usually at `~/.homebridge/config.json`):

```json
{
  "platforms": [
    {
      "platform": "AirTouch5",
      "name": "Air Touch 5",
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
        }
      ]
    }
  ]
}
```

Replace `192.168.1.100` with your actual Air Touch 5 IP address.

### 6. Restart Homebridge

```bash
# If using systemd (Linux)
sudo systemctl restart homebridge

# Or if running manually
# Stop the process and restart it
```

### 7. Add to Home App

1. Open the Apple Home app on your iPhone/iPad
2. Tap the + icon
3. Select "Add Accessory"
4. Scan the Homebridge HomeKit code (from the terminal output)
5. Your Air Touch 5 system and zones should now appear

## Zones Configuration

List the zones available on your Air Touch 5 system. Most systems have 1-8 zones. You can find this information:

- In the Air Touch 5 mobile app
- From your installer
- By checking the controller's web interface

Update the `zones` array in config.json accordingly.

## Troubleshooting

### Plugin doesn't load

Check the Homebridge logs:

```bash
# View live logs
homebridge -U ~/.homebridge -D

# Or check the log file
tail -f ~/.homebridge/homebridge.log
```

### Cannot connect to device

1. Verify the IP address is correct: `ping <your-ip>`
2. Test the API: `curl http://<your-ip>:8080/status`
3. Check firewall rules

### Accessories not showing in Home app

1. Remove the accessory from the Home app
2. Restart Homebridge
3. Re-scan the code in the Home app

## Next Steps

- Configure automations in the Home app
- Create scenes for common temperature settings
- Set up remote access for control outside your home
- Integrate with other HomeKit devices

For more information, see the full [README.md](README.md).
