'use strict';

const PLUGIN_NAME   = 'homebridge-homeassistant-things';
const PLATFORM_NAME = 'HomeAssistantThing';

module.exports = (api) => {
  api.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, HomeAssistantThingsPlatform);
};

class HomeAssistantThingsPlatform {
  constructor(log, config, api) {
    this.log         = log;
    this.config      = config;
    this.api         = api;
    this.accessories = new Map(); // uuid → PlatformAccessory

    if (!config) return;

    api.on('didFinishLaunching', () => {
      this._discoverDevices();
    });
  }

  configureAccessory(accessory) {
    this.accessories.set(accessory.UUID, accessory);
  }

  _discoverDevices() {
    let devices = this.config.devices || [];

    // Legacy compatibility: single accessory-style config at platform level
    if (devices.length === 0 && this.config.haUrl && this.config.entityId && this.config.haToken) {
      this.log.warn(`[${PLATFORM_NAME}] Legacy config detected. Please migrate to the new format with a "devices" array. See README for instructions.`);
      devices = [{
        name:         this.config.name || 'HA Device',
        deviceType:   this.config.deviceType || 'switch',
        haUrl:        this.config.haUrl,
        entityId:     this.config.entityId,
        haToken:      this.config.haToken,
        pollInterval: this.config.pollInterval,
        openingTime:  this.config.openingTime,
        closingTime:  this.config.closingTime,
        pulseTime:    this.config.pulseTime,
      }];
    }

    const configuredUUIDs = new Set();

    for (const deviceConfig of devices) {
      if (!deviceConfig.name || !deviceConfig.haUrl || !deviceConfig.entityId || !deviceConfig.haToken) {
        this.log.warn(`[${PLATFORM_NAME}] Skipping device with missing required fields: ${deviceConfig.name || '(unnamed)'}`);
        continue;
      }

      const uuid = this.api.hap.uuid.generate(deviceConfig.name + deviceConfig.entityId);
      configuredUUIDs.add(uuid);

      let accessory = this.accessories.get(uuid);
      if (accessory) {
        this.log.info(`[${deviceConfig.name}] Restoring cached accessory`);
      } else {
        this.log.info(`[${deviceConfig.name}] Adding new accessory`);
        accessory = new this.api.platformAccessory(deviceConfig.name, uuid);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        this.accessories.set(uuid, accessory);
      }

      new ThingHandler(this.log, deviceConfig, accessory, this.api.hap);
    }

    // Remove accessories no longer in config
    for (const [uuid, accessory] of this.accessories) {
      if (!configuredUUIDs.has(uuid)) {
        this.log.info(`[${accessory.displayName}] Removing stale accessory`);
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        this.accessories.delete(uuid);
      }
    }
  }
}

class ThingHandler {
  constructor(log, config, accessory, hap) {
    this.log          = log;
    this.accessory    = accessory;
    this.hap          = hap;
    this.name         = config.name;
    this.haUrl        = config.haUrl;
    this.entityId     = config.entityId;
    this.haToken      = config.haToken;
    this.pollInterval = config.pollInterval || 30;
    this.deviceType   = config.deviceType   || 'switch';
    this.openingTime  = config.openingTime  || 15;
    this.closingTime  = config.closingTime  || 15;
    this.pulseTime    = config.pulseTime    || 2000;
    this.state        = {};

    const { Service, Characteristic } = hap;

    accessory.getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, 'Home Assistant')
      .setCharacteristic(Characteristic.Model,        this.deviceType)
      .setCharacteristic(Characteristic.SerialNumber,  this.entityId);

    this._setupService();
    this.log.info(`[${this.name}] Initialized - type:${this.deviceType} HA:${this.haUrl} (${this.entityId})`);
    this._startPolling();
  }

  _setupService() {
    switch (this.deviceType) {
      case 'switch':     this._setupSwitch();     break;
      case 'thermostat': this._setupThermostat(); break;
      case 'blind':      this._setupBlind();      break;
      case 'garageDoor': this._setupGarageDoor(); break;
      case 'sensor':     this._setupSensor();     break;
      default:           this._setupSwitch();
    }
  }

  // ─── SWITCH / LIGHT ───────────────────────────────────────────────────────

  _setupSwitch() {
    const { Service, Characteristic } = this.hap;
    this.state.on = false;

    this.service = this.accessory.getService(Service.Switch)
      || this.accessory.addService(Service.Switch, this.name);

    this.service.getCharacteristic(Characteristic.On)
      .onGet(() => this.state.on)
      .onSet((value) => {
        this.state.on = value;
        this._sendCommand('switch', value ? 'turn_on' : 'turn_off', {});
      });
  }

  // ─── THERMOSTAT ───────────────────────────────────────────────────────────

  _setupThermostat() {
    const { Service, Characteristic } = this.hap;
    this.state.currentTemp        = 20;
    this.state.targetTemp         = 21;
    this.state.heatingState       = 0;
    this.state.targetHeatingState = 0;

    this.service = this.accessory.getService(Service.Thermostat)
      || this.accessory.addService(Service.Thermostat, this.name);

    this.service.getCharacteristic(Characteristic.CurrentTemperature)
      .onGet(() => this.state.currentTemp);

    this.service.getCharacteristic(Characteristic.TargetTemperature)
      .setProps({ minValue: 5, maxValue: 35, minStep: 0.5 })
      .onGet(() => this.state.targetTemp)
      .onSet((value) => {
        this.state.targetTemp = value;
        this._sendCommand('climate', 'set_temperature', { temperature: value });
      });

    this.service.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
      .onGet(() => this.state.heatingState);

    this.service.getCharacteristic(Characteristic.TargetHeatingCoolingState)
      .onGet(() => this.state.targetHeatingState)
      .onSet((value) => {
        this.state.targetHeatingState = value;
        const modeMap = { 0: 'off', 1: 'heat', 2: 'cool', 3: 'auto' };
        this._sendCommand('climate', 'set_hvac_mode', { hvac_mode: modeMap[value] || 'off' });
      });

    this.service.getCharacteristic(Characteristic.TemperatureDisplayUnits)
      .onGet(() => Characteristic.TemperatureDisplayUnits.CELSIUS);
  }

  // ─── BLIND / SHUTTER ──────────────────────────────────────────────────────

  _setupBlind() {
    const { Service, Characteristic } = this.hap;
    this.state.currentPosition = 0;
    this.state.targetPosition  = 0;
    this.state.positionState   = Characteristic.PositionState.STOPPED;

    this.service = this.accessory.getService(Service.WindowCovering)
      || this.accessory.addService(Service.WindowCovering, this.name);

    this.service.getCharacteristic(Characteristic.CurrentPosition)
      .onGet(() => this.state.currentPosition);

    this.service.getCharacteristic(Characteristic.TargetPosition)
      .onGet(() => this.state.targetPosition)
      .onSet((value) => {
        this.state.targetPosition = value;
        if (value === 100) {
          this._sendCommand('cover', 'open_cover', {});
        } else if (value === 0) {
          this._sendCommand('cover', 'close_cover', {});
        } else {
          this._sendCommand('cover', 'set_cover_position', { position: value });
        }
      });

    this.service.getCharacteristic(Characteristic.PositionState)
      .onGet(() => this.state.positionState);
  }

  // ─── GARAGE DOOR (pulse relay + timed animation) ──────────────────────────

  _setupGarageDoor() {
    const { Service, Characteristic } = this.hap;
    this.isUpdating      = false;
    this.state.doorState = 'closed';

    this.service = this.accessory.getService(Service.GarageDoorOpener)
      || this.accessory.addService(Service.GarageDoorOpener, this.name);

    this.service.getCharacteristic(Characteristic.CurrentDoorState)
      .onGet(() => this._currentDoorState());

    this.service.getCharacteristic(Characteristic.TargetDoorState)
      .onGet(() => (this.state.doorState === 'open' || this.state.doorState === 'opening')
        ? Characteristic.TargetDoorState.OPEN
        : Characteristic.TargetDoorState.CLOSED)
      .onSet((value) => this._setGarageDoor(value));

    this.service.updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
    this.service.updateCharacteristic(Characteristic.TargetDoorState,  Characteristic.TargetDoorState.CLOSED);

    this.log.info(`[${this.name}] Garage door: opening=${this.openingTime}s closing=${this.closingTime}s pulse=${this.pulseTime}ms`);
  }

  _currentDoorState() {
    const { Characteristic } = this.hap;
    const map = {
      open:    Characteristic.CurrentDoorState.OPEN,
      closed:  Characteristic.CurrentDoorState.CLOSED,
      opening: Characteristic.CurrentDoorState.OPENING,
      closing: Characteristic.CurrentDoorState.CLOSING,
    };
    return map[this.state.doorState] ?? Characteristic.CurrentDoorState.CLOSED;
  }

  _setGarageDoor(newState) {
    const { Characteristic } = this.hap;
    if (this.isUpdating) {
      this.log.debug(`[${this.name}] Garage door busy, ignoring`);
      return;
    }

    this.isUpdating = true;
    this._sendCommand('switch', 'turn_on', {});
    setTimeout(() => this._sendCommand('switch', 'turn_off', {}), this.pulseTime);

    if (newState === Characteristic.TargetDoorState.OPEN) {
      this.log.info(`[${this.name}] Opening... (${this.openingTime}s)`);
      this.state.doorState = 'opening';
      this.service.updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPENING);

      setTimeout(() => {
        this.state.doorState = 'open';
        this.service.updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
        this.service.updateCharacteristic(Characteristic.TargetDoorState,  Characteristic.TargetDoorState.OPEN);
        this.isUpdating = false;
        this.log.info(`[${this.name}] Door OPEN`);
      }, this.openingTime * 1000);

    } else {
      this.log.info(`[${this.name}] Closing... (${this.closingTime}s)`);
      this.state.doorState = 'closing';
      this.service.updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSING);

      setTimeout(() => {
        this.state.doorState = 'closed';
        this.service.updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
        this.service.updateCharacteristic(Characteristic.TargetDoorState,  Characteristic.TargetDoorState.CLOSED);
        this.isUpdating = false;
        this.log.info(`[${this.name}] Door CLOSED`);
      }, this.closingTime * 1000);
    }
  }

  // ─── SENSOR (read-only numeric, e.g. power/energy) ───────────────────────

  _setupSensor() {
    const { Service, Characteristic } = this.hap;
    this.state.value = 0.0001; // LightSensor minimum

    this.service = this.accessory.getService(Service.LightSensor)
      || this.accessory.addService(Service.LightSensor, this.name);

    this.service.getCharacteristic(Characteristic.CurrentAmbientLightLevel)
      .onGet(() => Math.max(0.0001, this.state.value));
  }

  // ─── POLLING & STATE SYNC ─────────────────────────────────────────────────

  async _pollHA() {
    if (this.deviceType === 'garageDoor') return;
    if (this.deviceType === 'sensor') { await this._pollSensor(); return; }

    try {
      const res = await fetch(`${this.haUrl}/api/states/${this.entityId}`, {
        headers: {
          'Authorization': `Bearer ${this.haToken}`,
          'Content-Type':  'application/json',
        },
      });
      if (!res.ok) {
        this.log.error(`[${this.name}] Poll error: ${res.status}`);
        return;
      }
      this._updateState(await res.json());
    } catch (e) {
      this.log.error(`[${this.name}] Poll error: ${e.message}`);
    }
  }

  _updateState(data) {
    const { Characteristic } = this.hap;
    const { state, attributes } = data;

    switch (this.deviceType) {

      case 'switch': {
        const on = state === 'on';
        this.state.on = on;
        this.service.updateCharacteristic(Characteristic.On, on);
        this.log.debug(`[${this.name}] Poll: switch = ${state}`);
        break;
      }

      case 'thermostat': {
        const curTemp  = parseFloat(attributes.current_temperature) ?? this.state.currentTemp;
        const tgtTemp  = parseFloat(attributes.temperature)         ?? this.state.targetTemp;
        const stateMap = { off: 0, heat: 1, cool: 2, auto: 3, heat_cool: 3 };
        const hstate   = stateMap[state] ?? 0;

        this.state.currentTemp        = curTemp;
        this.state.targetTemp         = tgtTemp;
        this.state.heatingState       = hstate;
        this.state.targetHeatingState = hstate;

        this.service.updateCharacteristic(Characteristic.CurrentTemperature,        curTemp);
        this.service.updateCharacteristic(Characteristic.TargetTemperature,         tgtTemp);
        this.service.updateCharacteristic(Characteristic.CurrentHeatingCoolingState, hstate);
        this.service.updateCharacteristic(Characteristic.TargetHeatingCoolingState,  hstate);
        this.log.debug(`[${this.name}] Poll: thermostat = ${state} | cur:${curTemp}° tgt:${tgtTemp}°`);
        break;
      }

      case 'blind': {
        const pos      = parseInt(attributes.current_position, 10);
        const posMap   = { opening: Characteristic.PositionState.INCREASING, closing: Characteristic.PositionState.DECREASING };
        const posState = posMap[state] ?? Characteristic.PositionState.STOPPED;
        const curPos   = isNaN(pos) ? this.state.currentPosition : pos;

        this.state.currentPosition = curPos;
        this.state.positionState   = posState;
        if (posState === Characteristic.PositionState.STOPPED) {
          this.state.targetPosition = curPos;
        }

        this.service.updateCharacteristic(Characteristic.CurrentPosition, curPos);
        this.service.updateCharacteristic(Characteristic.TargetPosition,  this.state.targetPosition);
        this.service.updateCharacteristic(Characteristic.PositionState,   posState);
        this.log.debug(`[${this.name}] Poll: blind = ${state} | pos:${curPos}%`);
        break;
      }
    }
  }

  async _pollSensor() {
    const { Characteristic } = this.hap;
    try {
      const res = await fetch(`${this.haUrl}/api/states/${this.entityId}`, {
        headers: {
          'Authorization': `Bearer ${this.haToken}`,
          'Content-Type':  'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) { this.log.error(`[${this.name}] Poll error: ${res.status}`); return; }
      const data  = await res.json();
      const raw   = parseFloat(data.state);
      const value = isNaN(raw) ? this.state.value : Math.max(0.0001, raw);
      this.state.value = value;
      this.service.updateCharacteristic(Characteristic.CurrentAmbientLightLevel, value);
      this.log.debug(`[${this.name}] Poll: sensor = ${value} (${data.attributes?.unit_of_measurement ?? ''})`);
    } catch (e) {
      this.log.error(`[${this.name}] Poll error: ${e.message}`);
    }
  }

  // ─── HA API ───────────────────────────────────────────────────────────────

  async _sendCommand(domain, service, data) {
    try {
      const res = await fetch(`${this.haUrl}/api/services/${domain}/${service}`, {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${this.haToken}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ entity_id: this.entityId, ...data }),
      });
      if (res.ok) {
        this.log.info(`[${this.name}] HA ${domain}/${service} → OK`);
      } else {
        this.log.error(`[${this.name}] HA ${domain}/${service} → ${res.status}`);
      }
    } catch (e) {
      this.log.error(`[${this.name}] HA ${domain}/${service} → ERROR: ${e.message}`);
    }
  }

  _startPolling() {
    setInterval(() => this._pollHA(), this.pollInterval * 1000);
    this.log.info(`[${this.name}] Polling started (${this.pollInterval}s)`);
  }
}
