# homebridge-homeassistant-things

Homebridge plugin to control Home Assistant devices as native HomeKit accessories: switches/lights, thermostats, blinds/shutters, and garage doors.

[![npm version](https://img.shields.io/npm/v/homebridge-homeassistant-things)](https://www.npmjs.com/package/homebridge-homeassistant-things)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## English

### Supported device types

| `deviceType`  | HomeKit service   | HA entity domain | Sync |
|---------------|-------------------|------------------|------|
| `switch`      | Switch            | `switch`, `light`, `input_boolean` | Bidirectional |
| `thermostat`  | Thermostat        | `climate`        | Bidirectional |
| `blind`       | Window Covering   | `cover`          | Bidirectional |
| `garageDoor`  | Garage Door Opener | `switch` (pulse relay) | One-way |

### Features

- Native HomeKit accessories for each device type
- Bidirectional state sync via polling (switch, thermostat, blind)
- Thermostat: current temperature, target temperature, heating/cooling mode
- Blind: open/close/stop, position 0–100%, moving state
- Garage door: pulse relay logic (turn_on → 2s → turn_off)
- Config UI X form — no manual JSON editing required

### Installation

```bash
npm install -g homebridge-homeassistant-things
```

### Configuration via Config UI X

1. Go to **Plugins → HA Things → Add (+)**
2. Fill in the fields:
   - **Name**: e.g. `Living Room Light`
   - **Device Type**: select from the list
   - **Home Assistant URL**: e.g. `http://homeassistant.local:8123`
   - **Entity ID**: the HA entity (see table above)
   - **Long-Lived Access Token**: your HA token
   - **Poll Interval**: seconds between sync (default `30`)
3. Click **Save** and restart Homebridge

### Manual config.json examples

**Switch / Light**
```json
{
  "accessory": "HomeAssistantThing",
  "name": "Living Room Light",
  "deviceType": "switch",
  "haUrl": "http://homeassistant.local:8123",
  "haToken": "eyJhbGciOiJIUzI1NiIs...",
  "entityId": "light.living_room",
  "pollInterval": 30
}
```

**Thermostat**
```json
{
  "accessory": "HomeAssistantThing",
  "name": "Living Room Heater",
  "deviceType": "thermostat",
  "haUrl": "http://homeassistant.local:8123",
  "haToken": "eyJhbGciOiJIUzI1NiIs...",
  "entityId": "climate.living_room",
  "pollInterval": 30
}
```

**Blind / Shutter**
```json
{
  "accessory": "HomeAssistantThing",
  "name": "Living Room Blind",
  "deviceType": "blind",
  "haUrl": "http://homeassistant.local:8123",
  "haToken": "eyJhbGciOiJIUzI1NiIs...",
  "entityId": "cover.living_room_blind",
  "pollInterval": 15
}
```

**Garage Door (pulse relay)**
```json
{
  "accessory": "HomeAssistantThing",
  "name": "Garage",
  "deviceType": "garageDoor",
  "haUrl": "http://homeassistant.local:8123",
  "haToken": "eyJhbGciOiJIUzI1NiIs...",
  "entityId": "switch.garage_relay",
  "pollInterval": 30
}
```

### Getting a Home Assistant Long-Lived Access Token

1. In Home Assistant, click your user avatar (bottom-left)
2. Scroll to **Long-Lived Access Tokens**
3. Click **Create Token**, give it a name (e.g. `Homebridge`)
4. Copy the token and paste it in the plugin config

### Note on thermostat scheduling

Scheduling is not a HomeKit accessory feature — it must be configured through **Home Assistant automations** or **HomeKit Automations** (time-based triggers in the Home app).

---

## Español

### Tipos de dispositivo soportados

| `deviceType`  | Servicio HomeKit   | Dominio entidad HA | Sync |
|---------------|--------------------|--------------------|------|
| `switch`      | Interruptor        | `switch`, `light`, `input_boolean` | Bidireccional |
| `thermostat`  | Termostato         | `climate`          | Bidireccional |
| `blind`       | Persiana           | `cover`            | Bidireccional |
| `garageDoor`  | Puerta de Garaje   | `switch` (relé pulso) | Unidireccional |

### Características

- Accesorios HomeKit nativos para cada tipo de dispositivo
- Sincronización bidireccional del estado mediante polling (switch, termostato, persiana)
- Termostato: temperatura actual, temperatura objetivo, modo calefacción/refrigeración
- Persiana: abrir/cerrar/parar, posición 0–100%, estado de movimiento
- Puerta de garaje: lógica de relé de pulso (turn_on → 2s → turn_off)
- Formulario automático en Config UI X

### Instalación

```bash
npm install -g homebridge-homeassistant-things
```

### Configuración con Config UI X

1. Ve a **Plugins → HA Things → Nuevo (+)**
2. Rellena los campos:
   - **Nombre**: p. ej. `Luz Salón`
   - **Tipo de dispositivo**: selecciona de la lista
   - **URL Home Assistant**: p. ej. `http://homeassistant.local:8123`
   - **Entity ID**: la entidad de HA (ver tabla)
   - **Long-Lived Access Token**: tu token de HA
   - **Intervalo Poll**: segundos entre sincronizaciones (por defecto `30`)
3. Haz clic en **Guardar** y reinicia Homebridge

### Ejemplos de config.json manual

**Interruptor / Luz**
```json
{
  "accessory": "HomeAssistantThing",
  "name": "Luz Salón",
  "deviceType": "switch",
  "haUrl": "http://homeassistant.local:8123",
  "haToken": "eyJhbGciOiJIUzI1NiIs...",
  "entityId": "light.salon",
  "pollInterval": 30
}
```

**Termostato / Calefacción**
```json
{
  "accessory": "HomeAssistantThing",
  "name": "Calefacción Salón",
  "deviceType": "thermostat",
  "haUrl": "http://homeassistant.local:8123",
  "haToken": "eyJhbGciOiJIUzI1NiIs...",
  "entityId": "climate.salon",
  "pollInterval": 30
}
```

**Persiana**
```json
{
  "accessory": "HomeAssistantThing",
  "name": "Persiana Salón",
  "deviceType": "blind",
  "haUrl": "http://homeassistant.local:8123",
  "haToken": "eyJhbGciOiJIUzI1NiIs...",
  "entityId": "cover.persiana_salon",
  "pollInterval": 15
}
```

**Puerta de garaje (relé pulso)**
```json
{
  "accessory": "HomeAssistantThing",
  "name": "Garaje",
  "deviceType": "garageDoor",
  "haUrl": "http://homeassistant.local:8123",
  "haToken": "eyJhbGciOiJIUzI1NiIs...",
  "entityId": "switch.rele_garaje",
  "pollInterval": 30
}
```

### Nota sobre la programación horaria del termostato

La programación horaria no es una función del accesorio HomeKit — debe configurarse mediante **automatizaciones de Home Assistant** o **Automatizaciones de HomeKit** (disparadores por tiempo desde la app Home).

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT License — see [LICENSE](LICENSE)

---

⭐ Star this repo if it's useful! / ¡Dale estrella si te sirve!
