# homebridge-homeassistant-things

Homebridge plugin to control Home Assistant devices as native HomeKit accessories: switches/lights, thermostats, blinds/shutters, and garage doors.

[![npm version](https://img.shields.io/npm/v/homebridge-homeassistant-things)](https://www.npmjs.com/package/homebridge-homeassistant-things)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Homebridge Verified](https://img.shields.io/badge/homebridge-verification%20pending-yellow)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

> **EN** This plugin has been submitted for **official Homebridge verification**. Once approved, it will appear as a verified plugin in the Homebridge plugin catalogue.
>
> **ES** Este plugin ha sido enviado para **verificación oficial de Homebridge**. Una vez aprobado, aparecerá como plugin verificado en el catálogo de plugins de Homebridge.

---

## Migrating from v1.x / Migración desde v1.x

From v2.0.0 the plugin is a **dynamic platform**. Move your config from `accessories` to `platforms`.

Desde v2.0.0 el plugin es una **dynamic platform**. Mueve la config del bloque `accessories` a `platforms`.

**Before / Antes:**
```json
"accessories": [
  {
    "accessory": "HomeAssistantThing",
    "name": "Living Room Light",
    "deviceType": "switch",
    "haUrl": "http://homeassistant.local:8123",
    "haToken": "YOUR_TOKEN",
    "entityId": "light.living_room"
  },
  {
    "accessory": "HomeAssistantThing",
    "name": "Living Room Blind",
    "deviceType": "blind",
    "haUrl": "http://homeassistant.local:8123",
    "haToken": "YOUR_TOKEN",
    "entityId": "cover.living_room_blind"
  }
]
```

**After / Después:**
```json
"platforms": [
  {
    "platform": "HomeAssistantThing",
    "name": "HA Things",
    "devices": [
      {
        "name": "Living Room Light",
        "deviceType": "switch",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "YOUR_TOKEN",
        "entityId": "light.living_room"
      },
      {
        "name": "Living Room Blind",
        "deviceType": "blind",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "YOUR_TOKEN",
        "entityId": "cover.living_room_blind"
      }
    ]
  }
]
```

> **Note:** If you update without changing your config, the plugin will continue to work and log a warning asking you to migrate.
>
> **Nota:** Si actualizas sin cambiar la config, el plugin seguirá funcionando y mostrará un aviso en el log pidiendo que migres.

---

## English

### Supported device types

| `deviceType`  | HomeKit service    | HA entity domain | Sync |
|---------------|--------------------|------------------|------|
| `switch`      | Switch             | `switch`, `light`, `input_boolean` | Bidirectional |
| `thermostat`  | Thermostat         | `climate`        | Bidirectional |
| `blind`       | Window Covering    | `cover`          | Bidirectional |
| `garageDoor`  | Garage Door Opener | `switch` (pulse relay) | One-way |
| `sensor`      | Light Sensor       | `sensor` (any numeric) | Read-only |
| `pulse`       | Switch (momentary) | `switch` (pulse relay) | One-way |
| `button`      | Stateless Switch   | any (no state needed)  | One-way |

### Features

- Native HomeKit accessories for each device type
- Bidirectional state sync via polling (switch, thermostat, blind)
- Thermostat: current temperature, target temperature, heating/cooling mode
- Blind: open/close/stop, position 0–100%, moving state
- Garage door: pulse relay logic (turn_on → 2s → turn_off)
- Sensor: read-only numeric values (power, energy, temperature, etc.) — usable in HomeKit automations
- Pulse: momentary switch — sends `turn_on` then auto `turn_off` after `pulseTime` ms. Useful for doorbells, relay pulses, etc.
- Button: stateless programmable switch — triggers HomeKit automations on press. No state, no HA entity needed.
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

### Manual config.json example

Full example with all device types:

```json
"platforms": [
  {
    "platform": "HomeAssistantThing",
    "name": "HA Things",
    "devices": [
      {
        "name": "Living Room Light",
        "deviceType": "switch",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "eyJhbGciOiJIUzI1NiIs...",
        "entityId": "light.living_room",
        "pollInterval": 30
      },
      {
        "name": "Living Room Heater",
        "deviceType": "thermostat",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "eyJhbGciOiJIUzI1NiIs...",
        "entityId": "climate.living_room",
        "pollInterval": 30
      },
      {
        "name": "Living Room Blind",
        "deviceType": "blind",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "eyJhbGciOiJIUzI1NiIs...",
        "entityId": "cover.living_room_blind",
        "pollInterval": 15
      },
      {
        "name": "Garage",
        "deviceType": "garageDoor",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "eyJhbGciOiJIUzI1NiIs...",
        "entityId": "switch.garage_relay",
        "openingTime": 15,
        "closingTime": 15,
        "pulseTime": 2000
      },
      {
        "name": "Doorbell Relay",
        "deviceType": "pulse",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "eyJhbGciOiJIUzI1NiIs...",
        "entityId": "switch.doorbell_relay",
        "pulseTime": 500
      },
      {
        "name": "Scene Button",
        "deviceType": "button",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "eyJhbGciOiJIUzI1NiIs...",
        "entityId": "input_boolean.dummy"
      },
      {
        "name": "Power Consumption",
        "deviceType": "sensor",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "eyJhbGciOiJIUzI1NiIs...",
        "entityId": "sensor.power_consumption_w",
        "pollInterval": 30
      },
      {
        "name": "Solar Production",
        "deviceType": "sensor",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "eyJhbGciOiJIUzI1NiIs...",
        "entityId": "sensor.solar_production_w",
        "pollInterval": 30
      }
    ]
  }
]
```

### Sensor type — power & energy monitoring

The `sensor` device type reads any numeric Home Assistant entity and exposes it as a HomeKit **Light Sensor** (`CurrentAmbientLightLevel`). This is the standard workaround since HomeKit has no native power/energy service.

- The numeric value from HA is passed directly (e.g. `1234` W → shows as `1234` in HomeKit)
- Works with any `sensor.*` entity: power (W), energy (kWh), temperature, humidity, etc.
- **Home.app** displays the value with a "lux" unit label — visually incorrect but fully functional for automations
- **Eve app** displays the same value and supports history graphs
- Use it in **HomeKit Automations** with numeric thresholds (e.g. "if Solar Production > 2000, turn on dishwasher")

> **Note:** HomeKit's maximum for this characteristic is 100,000. Values above that will be clamped. For most home energy use cases (< 20 kW) this is not an issue.

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
| `sensor`      | Sensor de Luz      | `sensor` (cualquier numérico) | Solo lectura |
| `pulse`       | Interruptor (momentáneo) | `switch` (relé de pulso) | Unidireccional |
| `button`      | Interruptor sin estado | cualquiera (sin estado)  | Unidireccional |

### Características

- Accesorios HomeKit nativos para cada tipo de dispositivo
- Sincronización bidireccional del estado mediante polling (switch, termostato, persiana)
- Termostato: temperatura actual, temperatura objetivo, modo calefacción/refrigeración
- Persiana: abrir/cerrar/parar, posición 0–100%, estado de movimiento
- Puerta de garaje: lógica de relé de pulso (turn_on → 2s → turn_off)
- Sensor: valores numéricos de solo lectura (potencia, energía, temperatura, etc.) — utilizables en automatizaciones HomeKit
- Pulsador (`pulse`): interruptor momentáneo — envía `turn_on` y luego `turn_off` automáticamente tras `pulseTime` ms. Útil para timbres, relés de pulso, etc.
- Botón (`button`): interruptor sin estado — dispara automatizaciones HomeKit al pulsar. Sin estado, sin necesidad de entidad HA.
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

### Ejemplo de config.json manual

Ejemplo completo con todos los tipos de dispositivo:

```json
"platforms": [
  {
    "platform": "HomeAssistantThing",
    "name": "HA Things",
    "devices": [
      {
        "name": "Luz Salón",
        "deviceType": "switch",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "eyJhbGciOiJIUzI1NiIs...",
        "entityId": "light.salon",
        "pollInterval": 30
      },
      {
        "name": "Calefacción Salón",
        "deviceType": "thermostat",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "eyJhbGciOiJIUzI1NiIs...",
        "entityId": "climate.salon",
        "pollInterval": 30
      },
      {
        "name": "Persiana Salón",
        "deviceType": "blind",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "eyJhbGciOiJIUzI1NiIs...",
        "entityId": "cover.persiana_salon",
        "pollInterval": 15
      },
      {
        "name": "Garaje",
        "deviceType": "garageDoor",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "eyJhbGciOiJIUzI1NiIs...",
        "entityId": "switch.rele_garaje",
        "openingTime": 15,
        "closingTime": 15,
        "pulseTime": 2000
      },
      {
        "name": "Timbre",
        "deviceType": "pulse",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "eyJhbGciOiJIUzI1NiIs...",
        "entityId": "switch.rele_timbre",
        "pulseTime": 500
      },
      {
        "name": "Botón Escena",
        "deviceType": "button",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "eyJhbGciOiJIUzI1NiIs...",
        "entityId": "input_boolean.dummy"
      },
      {
        "name": "Consumo eléctrico",
        "deviceType": "sensor",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "eyJhbGciOiJIUzI1NiIs...",
        "entityId": "sensor.consumo_watts",
        "pollInterval": 30
      },
      {
        "name": "Producción solar",
        "deviceType": "sensor",
        "haUrl": "http://homeassistant.local:8123",
        "haToken": "eyJhbGciOiJIUzI1NiIs...",
        "entityId": "sensor.produccion_solar_watts",
        "pollInterval": 30
      }
    ]
  }
]
```

### Tipo sensor — monitorización de potencia y energía

El tipo `sensor` lee cualquier entidad numérica de Home Assistant y la expone en HomeKit como **Sensor de Luz** (`CurrentAmbientLightLevel`). Es la solución estándar ya que HomeKit no tiene un servicio nativo de potencia o energía.

- El valor numérico de HA se pasa directamente (p.ej. `1234` W → aparece como `1234` en HomeKit)
- Compatible con cualquier entidad `sensor.*`: potencia (W), energía (kWh), temperatura, humedad, etc.
- **App Home** muestra el valor con la etiqueta de unidad "lux" — visualmente incorrecto pero funcional para automatizaciones
- **App Eve** muestra el mismo valor y soporta gráficos de historial
- Úsalo en **Automatizaciones HomeKit** con umbrales numéricos (p.ej. "si Producción solar > 2000, encender el lavavajillas")

> **Nota:** El máximo de HomeKit para esta característica es 100.000. Valores superiores se recortarán. Para la mayoría de instalaciones domésticas (< 20 kW) no supone ningún problema.

### Nota sobre la programación horaria del termostato

La programación horaria no es una función del accesorio HomeKit — debe configurarse mediante **automatizaciones de Home Assistant** o **Automatizaciones de HomeKit** (disparadores por tiempo desde la app Home).

---

## Troubleshooting — after upgrading to v2.0.0 or later

From v2.0.0 this plugin changed from `accessory` to `platform`. If Config UI X still generates `"accessory"` instead of `"platform"` after updating, follow these steps:

1. **Uninstall the plugin** from Config UI X → Plugins → `homebridge-homeassistant-things` → Uninstall
2. **Clear the Homebridge accessory cache**: Config UI X → Settings → scroll down → **Remove All Cached Accessories**
3. **Restart the Homebridge container/service** completely:
   - Docker: `docker restart homebridge`
   - systemd: `sudo systemctl restart homebridge`
4. **Reinstall the plugin** from Config UI X → search `homebridge-homeassistant-things` → Install
5. **Add the plugin again** from the Config UI X assistant — it will now generate the correct `"platform"` config

> This is necessary because Config UI X caches the plugin schema. A full restart forces it to reload the schema from the newly installed version.

---

## Solución de problemas — tras actualizar a v2.0.0 o superior

Desde v2.0.0 este plugin cambió de `accessory` a `platform`. Si Config UI X sigue generando `"accessory"` en lugar de `"platform"` tras actualizar, sigue estos pasos:

1. **Desinstala el plugin** desde Config UI X → Plugins → `homebridge-homeassistant-things` → Desinstalar
2. **Limpia la caché de accesorios**: Config UI X → Ajustes → baja hasta **Eliminar todos los accesorios en caché**
3. **Reinicia completamente el contenedor/servicio de Homebridge**:
   - Docker: `docker restart homebridge`
   - systemd: `sudo systemctl restart homebridge`
4. **Vuelve a instalar el plugin** desde Config UI X → busca `homebridge-homeassistant-things` → Instalar
5. **Añade el plugin de nuevo** desde el asistente de Config UI X — ahora generará la config correcta con `"platform"`

> Esto es necesario porque Config UI X cachea el schema del plugin. Un reinicio completo fuerza la recarga del schema desde la versión recién instalada.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT License — see [LICENSE](LICENSE)

---

⭐ Star this repo if it's useful! / ¡Dale estrella si te sirve!
