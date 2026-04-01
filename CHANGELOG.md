# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-04-01

### Added
- Initial release as `homebridge-homeassistant-things` (evolved from `homebridge-homeassistant-garagedoor`)
- **Switch / Light** device type: on/off control via `switch` domain, bidirectional state sync
- **Thermostat** device type: current & target temperature, heating/cooling mode via `climate` domain, bidirectional sync
- **Blind / Shutter** device type: open/close/stop, position 0–100% via `cover` domain, bidirectional sync
- **Garage Door** device type: pulse relay logic (turn_on → 2s → turn_off) via `switch` domain
- `deviceType` config field to select device type per accessory instance
- `config.schema.json` for Config UI X form support
