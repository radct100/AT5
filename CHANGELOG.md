# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-04-08

### Added
- Initial release of Homebridge Air Touch 5 plugin
- System power control (on/off)
- Operating mode selection (Cool, Heat, Dry, Fan, Auto)
- Target temperature adjustment (16-32°C)
- Current temperature monitoring
- Zone-based control for individual system zones
- Zone power toggle (enable/disable)
- Zone airflow percentage control (0-100%)
- Real-time status polling
- HomeKit accessory creation and management
- API client with error handling
- Full TypeScript implementation
- Comprehensive documentation
- Mock API server for testing
- Configuration examples

### Features

#### System Accessories
- Thermostat service with:
  - Current heating/cooling state feedback
  - Target heating/cooling mode selection
  - Current temperature reading
  - Target temperature adjustment
  - Temperature display units (Celsius)

#### Zone Accessories
- Switch service for zone power control
- Lightbulb service for zone percentage adjustment
- Individual zone status tracking

### Under the Hood
- Status polling every 30 seconds (configurable)
- Automatic reconnection on connection loss
- Comprehensive error logging
- HomeKit UUID generation for consistent accessory identification
- Persistent accessory caching

## Future Releases

### Planned Features
- Humidity monitoring
- Energy consumption tracking
- Timer/scheduling support
- Geofencing integration
- Smart automation presets
- Fan speed control
- Indoor air quality monitoring
- System diagnostics

### Possible Enhancements
- WebSocket support for faster updates
- MQTT bridge integration
- Multi-zone temperature sensors
- Scene support
- Historical data storage
- Statistics and reporting

## Migration Guide

### From v0.x to v1.0.0
If this is your first installation, no migration is needed. Simply follow the [Quick Start Guide](QUICKSTART.md).

## Support

For issues, feature requests, or version-specific questions:
- Check the [README.md](README.md)
- Review the [Quick Start Guide](QUICKSTART.md)
- Consult the [API documentation](API.md)
- Open an issue on [GitHub](https://github.com/radct100/AT5/issues)

## Contributors

- Initial development and maintenance
