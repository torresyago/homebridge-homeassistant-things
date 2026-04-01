# Changelog — homebridge-homeassistant-things

**Author / Autor:** Yago Torres  
**Repository / Repositorio:** https://github.com/torresyago/homebridge-homeassistant-things

---

All notable changes to this project will be documented in this file.  
Todos los cambios relevantes de este proyecto se documentan aquí.

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
