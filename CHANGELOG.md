# Changelog — homebridge-homeassistant-things

**Author / Autor:** Yago Torres  
**Repository / Repositorio:** https://github.com/torresyago/homebridge-homeassistant-things

---

All notable changes to this project will be documented in this file.  
Todos los cambios relevantes de este proyecto se documentan aquí.

---

## [2.1.1] - 2026-04-02

### Changed / Cambios
- **EN** README updated: Homebridge verification submitted notice and badge added.
- **ES** README actualizado: añadido aviso e insignia de verificación oficial de Homebridge solicitada.

---

## [2.1.0] - 2026-04-02

### Added / Añadido
- **EN** New `deviceType: "sensor"` — exposes any numeric Home Assistant sensor (e.g. power in W, energy in kWh) as a HomeKit Light Sensor (`CurrentAmbientLightLevel`). Supports read-only polling. Useful for electricity consumption and solar production monitoring.
- **ES** Nuevo `deviceType: "sensor"` — expone cualquier sensor numérico de Home Assistant (p.ej. potencia en W, energía en kWh) como sensor de luz HomeKit (`CurrentAmbientLightLevel`). Solo lectura con polling configurable. Útil para monitorización de consumo eléctrico y producción solar.

---

## [2.0.1] - 2026-04-02

### Added / Añadido
- **EN** Plugin icon added (`icon.svg` — mdi:home-automation).
- **ES** Icono del plugin añadido (`icon.svg` — mdi:home-automation).

---

## [2.0.0] - 2026-04-02

### ⚠️ Breaking change / Cambio importante

- **EN** Converted to **dynamic platform** (`pluginType: platform`). Devices are now declared under a `devices` array inside the platform block. See README for migration guide.
- **ES** Convertido a **dynamic platform** (`pluginType: platform`). Los dispositivos se declaran ahora bajo un array `devices` dentro del bloque de plataforma. Ver README para guía de migración.

### Changed / Cambios

- **EN** Replaced `registerAccessory` with `registerPlatform`. Supports multiple devices in a single platform block.
- **EN** Improved log levels: errors use `log.error`, debug messages use `log.debug`.
- **EN** Backward-compatible config shim: old single-device config at platform level continues to work with a migration warning in the log.
- **ES** Reemplazado `registerAccessory` por `registerPlatform`. Soporta múltiples dispositivos en un único bloque de plataforma.
- **ES** Mejoras en niveles de log: errores usan `log.error`, mensajes de debug usan `log.debug`.
- **ES** Compatibilidad con config antigua: la config de un solo dispositivo a nivel de plataforma sigue funcionando con un aviso de migración en el log.

---

## [1.1.5] - 2026-04-01

### Fixed / Corregido
- **EN** Fixed invalid `config.schema.json`: removed `"required": true` from individual fields and replaced with a `"required": [...]` array at the object level.
- **ES** Corregido `config.schema.json` inválido: eliminado `"required": true` de los campos individuales y reemplazado por un array `"required": [...]` a nivel de objeto.

---

## [1.1.4] - 2026-04-01

### Fixed / Corregido
- **EN** Added Node.js 24 to supported engines (`^24`). Previously the plugin rejected Node.js v24.x with an incompatibility warning.
- **ES** Añadido Node.js 24 a los engines soportados (`^24`). Anteriormente el plugin rechazaba Node.js v24.x con un aviso de incompatibilidad.

---

## [1.1.3] - 2026-04-01

### Fixed / Corregido
- **EN** Republish to ensure README and CHANGELOG are correctly included in the npm package.
- **ES** Republicación para asegurar que README y CHANGELOG se incluyen correctamente en el paquete npm.

---

## [1.1.2] - 2026-04-01

### Changed / Cambios
- **EN** Changelog rewritten in English and Spanish. Author and repository link added to the header.
- **ES** Changelog reescrito en inglés y castellano. Añadidos autor y enlace al repositorio en la cabecera.

---

## [1.1.1] - 2026-04-01

### Fixed / Corregido
- **EN** Added `repository`, `bugs` and `homepage` fields to `package.json` so Homebridge Config UI X can display the changelog and release notes correctly.
- **ES** Añadidos campos `repository`, `bugs` y `homepage` en `package.json` para que Homebridge Config UI X muestre correctamente el changelog y las release notes.

---

## [1.1.0] - 2026-04-01

### Changed / Cambios
- **EN** Homebridge v2 compatible: replaced `.on('get')`/`.on('set')` with `.onGet()`/`.onSet()` API.
- **EN** Replaced deprecated `request` library with native `fetch` (Node.js 18+ built-in) — no external dependencies.
- **EN** Updated `engines` to `^1.6.0 || ^2.0.0-beta.0` with Node.js 18/20/22 requirement.
- **ES** Compatible con Homebridge v2: reemplazados `.on('get')`/`.on('set')` por la nueva API `.onGet()`/`.onSet()`.
- **ES** Eliminada la librería deprecated `request`, reemplazada por `fetch` nativo (integrado en Node.js 18+) — sin dependencias externas.
- **ES** `engines` actualizado a `^1.6.0 || ^2.0.0-beta.0` con requisito de Node.js 18/20/22.

---

## [1.0.1] - 2026-04-01

### Changed / Cambios
- **EN** Garage door: replaced fake-closed logic with real timed animation (OPENING → OPEN, CLOSING → CLOSED).
- **EN** Garage door: new config fields `openingTime` (s), `closingTime` (s), `pulseTime` (ms).
- **EN** Garage door: state managed internally by timer, no HA polling needed.
- **ES** Puerta de garaje: reemplazada la lógica de siempre-cerrado por una animación real con temporizador (ABRIENDO → ABIERTA, CERRANDO → CERRADA).
- **ES** Puerta de garaje: nuevos campos de configuración `openingTime` (s), `closingTime` (s), `pulseTime` (ms).
- **ES** Puerta de garaje: el estado se gestiona internamente por temporizador, sin polling a HA.

---

## [1.0.0] - 2026-04-01

### Added / Añadido
- **EN** Initial release as `homebridge-homeassistant-things` (evolved from `homebridge-homeassistant-garagedoor`).
- **EN** **Switch / Light** device type: on/off control via `switch` domain, bidirectional state sync.
- **EN** **Thermostat** device type: current & target temperature, heating/cooling mode via `climate` domain, bidirectional sync.
- **EN** **Blind / Shutter** device type: open/close/stop, position 0–100% via `cover` domain, bidirectional sync.
- **EN** **Garage Door** device type: pulse relay logic (turn_on → 2s → turn_off) via `switch` domain.
- **EN** `deviceType` config field to select device type per accessory instance.
- **EN** `config.schema.json` for Config UI X form support.
- **ES** Primera versión de `homebridge-homeassistant-things` (evolución de `homebridge-homeassistant-garagedoor`).
- **ES** Tipo **Interruptor / Luz**: control on/off via dominio `switch`, sincronización bidireccional.
- **ES** Tipo **Termostato**: temperatura actual y objetivo, modo calefacción/refrigeración via dominio `climate`, sync bidireccional.
- **ES** Tipo **Persiana**: abrir/cerrar/parar, posición 0–100% via dominio `cover`, sync bidireccional.
- **ES** Tipo **Puerta de garaje**: lógica de relé de pulso (turn_on → 2s → turn_off) via dominio `switch`.
- **ES** Campo `deviceType` para seleccionar el tipo de dispositivo por accesorio.
- **ES** `config.schema.json` para el formulario de Config UI X.
