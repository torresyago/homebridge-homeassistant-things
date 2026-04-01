'use strict';

const request = require('request');

module.exports = (homebridge) => {
  const { Service, Characteristic } = homebridge.hap;

  class HomeAssistantThing {
    constructor(log, config) {
      this.log = log;
      this.name = config.name;
      this.haUrl = config.haUrl;
      this.entityId = config.entityId;
      this.haToken = config.haToken;
      this.pollInterval = config.pollInterval || 30;
      this.deviceType = config.deviceType || 'switch';

      this.state = {};

      this._setupService();
      this.log(`[${this.name}] Initialized - type:${this.deviceType} HA:${this.haUrl} (${this.entityId})`);
      this.startPolling();
    }

    _setupService() {
      switch (this.deviceType) {
        case 'switch':   this._setupSwitch();     break;
        case 'thermostat': this._setupThermostat(); break;
        case 'blind':    this._setupBlind();      break;
        case 'garageDoor': this._setupGarageDoor(); break;
        default:         this._setupSwitch();
      }
    }

    // ─── SWITCH / LIGHT ─────────────────────────────────────────────────────────

    _setupSwitch() {
      this.state.on = false;
      this.service = new Service.Switch(this.name);
      this.service.getCharacteristic(Characteristic.On)
        .on('get', cb => cb(null, this.state.on))
        .on('set', (value, cb) => {
          this.state.on = value;
          this._sendCommand('switch', value ? 'turn_on' : 'turn_off', {});
          cb();
        });
    }

    // ─── THERMOSTAT ──────────────────────────────────────────────────────────────

    _setupThermostat() {
      this.state.currentTemp = 20;
      this.state.targetTemp = 21;
      this.state.heatingState = 0;
      this.state.targetHeatingState = 0;

      this.service = new Service.Thermostat(this.name);

      this.service.getCharacteristic(Characteristic.CurrentTemperature)
        .on('get', cb => cb(null, this.state.currentTemp));

      this.service.getCharacteristic(Characteristic.TargetTemperature)
        .setProps({ minValue: 5, maxValue: 35, minStep: 0.5 })
        .on('get', cb => cb(null, this.state.targetTemp))
        .on('set', (value, cb) => {
          this.state.targetTemp = value;
          this._sendCommand('climate', 'set_temperature', { temperature: value });
          cb();
        });

      this.service.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
        .on('get', cb => cb(null, this.state.heatingState));

      this.service.getCharacteristic(Characteristic.TargetHeatingCoolingState)
        .on('get', cb => cb(null, this.state.targetHeatingState))
        .on('set', (value, cb) => {
          this.state.targetHeatingState = value;
          const modeMap = { 0: 'off', 1: 'heat', 2: 'cool', 3: 'auto' };
          this._sendCommand('climate', 'set_hvac_mode', { hvac_mode: modeMap[value] || 'off' });
          cb();
        });

      this.service.getCharacteristic(Characteristic.TemperatureDisplayUnits)
        .on('get', cb => cb(null, Characteristic.TemperatureDisplayUnits.CELSIUS));
    }

    // ─── BLIND / SHUTTER ────────────────────────────────────────────────────────

    _setupBlind() {
      this.state.currentPosition = 0;
      this.state.targetPosition = 0;
      this.state.positionState = Characteristic.PositionState.STOPPED;

      this.service = new Service.WindowCovering(this.name);

      this.service.getCharacteristic(Characteristic.CurrentPosition)
        .on('get', cb => cb(null, this.state.currentPosition));

      this.service.getCharacteristic(Characteristic.TargetPosition)
        .on('get', cb => cb(null, this.state.targetPosition))
        .on('set', (value, cb) => {
          this.state.targetPosition = value;
          if (value === 100) {
            this._sendCommand('cover', 'open_cover', {});
          } else if (value === 0) {
            this._sendCommand('cover', 'close_cover', {});
          } else {
            this._sendCommand('cover', 'set_cover_position', { position: value });
          }
          cb();
        });

      this.service.getCharacteristic(Characteristic.PositionState)
        .on('get', cb => cb(null, this.state.positionState));
    }

    // ─── GARAGE DOOR (pulse relay) ───────────────────────────────────────────────

    _setupGarageDoor() {
      this.state.currentDoorState = Characteristic.CurrentDoorState.CLOSED;
      this.state.targetDoorState = Characteristic.TargetDoorState.CLOSED;
      this.isUpdating = false;

      this.service = new Service.GarageDoorOpener(this.name);
      this.service.getCharacteristic(Characteristic.TargetDoorState)
        .on('set', this._setGarageDoor.bind(this));

      this._forceGarageClosed();
    }

    _setGarageDoor(newState, callback) {
      if (this.isUpdating) { return callback(); }
      if (newState === Characteristic.TargetDoorState.OPEN) {
        this.isUpdating = true;
        this._sendCommand('switch', 'turn_on', {});
        setTimeout(() => {
          this._sendCommand('switch', 'turn_off', {});
          setTimeout(() => {
            this._forceGarageClosed();
            this.isUpdating = false;
          }, 500);
        }, 2000);
      } else {
        return callback();
      }
      callback();
    }

    _forceGarageClosed() {
      if (this.isUpdating) return;
      this.isUpdating = true;
      this.service.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
      this.service.setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED);
      setTimeout(() => { this.isUpdating = false; }, 500);
    }

    // ─── POLLING & STATE SYNC ───────────────────────────────────────────────────

    pollHA() {
      request.get({
        url: `${this.haUrl}/api/states/${this.entityId}`,
        headers: {
          'Authorization': `Bearer ${this.haToken}`,
          'Content-Type': 'application/json'
        }
      }, (err, res, body) => {
        if (err || !res || res.statusCode !== 200) {
          this.log(`[${this.name}] Poll error: ${err ? err.message : res?.statusCode}`);
          return;
        }
        try {
          this._updateState(JSON.parse(body));
        } catch (e) {
          this.log(`[${this.name}] Poll parse error: ${e.message}`);
        }
      });
    }

    _updateState(data) {
      const { state, attributes } = data;

      switch (this.deviceType) {

        case 'switch': {
          const on = state === 'on';
          this.state.on = on;
          this.service.updateCharacteristic(Characteristic.On, on);
          this.log(`[${this.name}] Poll: switch = ${state}`);
          break;
        }

        case 'thermostat': {
          const curTemp  = parseFloat(attributes.current_temperature) ?? this.state.currentTemp;
          const tgtTemp  = parseFloat(attributes.temperature)         ?? this.state.targetTemp;
          const stateMap = { off: 0, heat: 1, cool: 2, auto: 3, heat_cool: 3 };
          const hstate   = stateMap[state] ?? 0;

          this.state.currentTemp       = curTemp;
          this.state.targetTemp        = tgtTemp;
          this.state.heatingState      = hstate;
          this.state.targetHeatingState = hstate;

          this.service.updateCharacteristic(Characteristic.CurrentTemperature, curTemp);
          this.service.updateCharacteristic(Characteristic.TargetTemperature, tgtTemp);
          this.service.updateCharacteristic(Characteristic.CurrentHeatingCoolingState, hstate);
          this.service.updateCharacteristic(Characteristic.TargetHeatingCoolingState, hstate);
          this.log(`[${this.name}] Poll: thermostat = ${state} | cur:${curTemp}° tgt:${tgtTemp}°`);
          break;
        }

        case 'blind': {
          const pos      = parseInt(attributes.current_position, 10);
          const posMap   = { opening: Characteristic.PositionState.INCREASING, closing: Characteristic.PositionState.DECREASING };
          const posState = posMap[state] ?? Characteristic.PositionState.STOPPED;
          const currentPos = isNaN(pos) ? this.state.currentPosition : pos;

          this.state.currentPosition = currentPos;
          this.state.positionState   = posState;
          if (posState === Characteristic.PositionState.STOPPED) {
            this.state.targetPosition = currentPos;
          }

          this.service.updateCharacteristic(Characteristic.CurrentPosition, currentPos);
          this.service.updateCharacteristic(Characteristic.TargetPosition, this.state.targetPosition);
          this.service.updateCharacteristic(Characteristic.PositionState, posState);
          this.log(`[${this.name}] Poll: blind = ${state} | pos:${currentPos}%`);
          break;
        }

        case 'garageDoor':
          // garage door always reports CLOSED
          break;
      }
    }

    // ─── HA API ─────────────────────────────────────────────────────────────────

    _sendCommand(domain, service, data) {
      request.post({
        url: `${this.haUrl}/api/services/${domain}/${service}`,
        headers: {
          'Authorization': `Bearer ${this.haToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ entity_id: this.entityId, ...data })
      }, (err, res) => {
        if (res && res.statusCode === 200) {
          this.log(`[${this.name}] HA ${domain}/${service} → OK`);
        } else {
          this.log(`[${this.name}] HA ${domain}/${service} → ${res ? res.statusCode : 'ERROR'} ${err ? err.message : ''}`);
        }
      });
    }

    startPolling() {
      setInterval(() => this.pollHA(), this.pollInterval * 1000);
      this.log(`[${this.name}] Polling started (${this.pollInterval}s)`);
    }

    getServices() {
      return [this.service];
    }
  }

  homebridge.registerAccessory('homebridge-homeassistant-things', 'HomeAssistantThing', HomeAssistantThing);
};
