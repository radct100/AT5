import {
  PlatformAccessory,
  Service,
  CharacteristicValue,
} from 'homebridge';
import { AirTouch5Platform } from './platform';
import { AirTouch5Client } from './client';

export class AirTouch5Accessory {
  private service: Service;
  private statusUpdateInterval?: NodeJS.Timer;

  constructor(
    private platform: AirTouch5Platform,
    private accessory: PlatformAccessory,
    private client: AirTouch5Client,
    private zoneNumber?: number,
  ) {
    const isZone = zoneNumber !== undefined;

    // set accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Air Touch')
      .setCharacteristic(this.platform.Characteristic.Model, '5')
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        isZone ? `ZONE-${zoneNumber}` : 'SYSTEM',
      );

    if (isZone) {
      this.setupZoneAccessory();
    } else {
      this.setupSystemAccessory();
    }

    this.startStatusUpdates();
  }

  private setupSystemAccessory() {
    // Remove any existing services (except AccessoryInformation)
    const existing = this.accessory.getService(this.platform.Service.Thermostat);
    if (existing) {
      this.accessory.removeService(existing);
    }

    // Add thermostat service
    this.service = this.accessory.addService(
      this.platform.Service.Thermostat,
      'Air Conditioner',
      'thermostat',
    );

    // Required Characteristics
    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
      .onGet(this.getCurrentHeatingCoolingState.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
      .setProps({
        minValue: 0,
        maxValue: 3,
        validValues: [0, 1, 2, 3], // Off, Heat, Cool, Auto
      })
      .onGet(this.getTargetHeatingCoolingState.bind(this))
      .onSet(this.setTargetHeatingCoolingState.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .setProps({
        minValue: -50,
        maxValue: 100,
        minStep: 0.1,
      })
      .onGet(this.getCurrentTemperature.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.TargetTemperature)
      .setProps({
        minValue: 16,
        maxValue: 32,
        minStep: 0.5,
      })
      .onGet(this.getTargetTemperature.bind(this))
      .onSet(this.setTargetTemperature.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
      .onGet(() => this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS);
  }

  private setupZoneAccessory() {
    // Remove any existing services (except AccessoryInformation)
    const existing = this.accessory.getService(this.platform.Service.Switch);
    if (existing) {
      this.accessory.removeService(existing);
    }

    // Add switch service for zone power
    this.service = this.accessory.addService(
      this.platform.Service.Switch,
      `Zone ${this.zoneNumber}`,
      `zone-${this.zoneNumber}`,
    );

    this.service
      .getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getZonePower.bind(this))
      .onSet(this.setZonePower.bind(this));

    // Add a lightbulb service to represent zone percentage
    const lightbulb = this.accessory.addService(
      this.platform.Service.Lightbulb,
      `Zone ${this.zoneNumber} Level`,
      `zone-${this.zoneNumber}-level`,
    );

    lightbulb
      .getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getZonePower.bind(this))
      .onSet(this.setZonePower.bind(this));

    lightbulb
      .getCharacteristic(this.platform.Characteristic.Brightness)
      .setProps({
        minValue: 0,
        maxValue: 100,
        minStep: 1,
      })
      .onGet(this.getZonePercentage.bind(this))
      .onSet(this.setZonePercentage.bind(this));
  }

  // System Thermostat Characteristics
  async getCurrentHeatingCoolingState() {
    try {
      const status = await this.client.getStatus();
      if (!status.power) {
        return this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
      }

      const mode = status.mode;
      switch (mode) {
        case 'heat':
          return this.platform.Characteristic.CurrentHeatingCoolingState.HEAT;
        case 'cool':
          return this.platform.Characteristic.CurrentHeatingCoolingState.COOL;
        default:
          return this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
      }
    } catch (error) {
      this.platform.log.error('Error getting current heating/cooling state:', error);
      return this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
    }
  }

  async getTargetHeatingCoolingState() {
    try {
      const status = await this.client.getStatus();
      if (!status.power) {
        return this.platform.Characteristic.TargetHeatingCoolingState.OFF;
      }

      const mode = status.mode;
      switch (mode) {
        case 'heat':
          return this.platform.Characteristic.TargetHeatingCoolingState.HEAT;
        case 'cool':
          return this.platform.Characteristic.TargetHeatingCoolingState.COOL;
        case 'auto':
          return this.platform.Characteristic.TargetHeatingCoolingState.AUTO;
        default:
          return this.platform.Characteristic.TargetHeatingCoolingState.OFF;
      }
    } catch (error) {
      this.platform.log.error('Error getting target heating/cooling state:', error);
      return this.platform.Characteristic.TargetHeatingCoolingState.OFF;
    }
  }

  async setTargetHeatingCoolingState(value: CharacteristicValue) {
    try {
      const hkValue = value as number;

      if (hkValue === this.platform.Characteristic.TargetHeatingCoolingState.OFF) {
        await this.client.setPower(false);
      } else {
        await this.client.setPower(true);

        const modeMap: Record<number, 'cool' | 'heat' | 'dry' | 'fan' | 'auto'> = {
          [this.platform.Characteristic.TargetHeatingCoolingState.HEAT]: 'heat',
          [this.platform.Characteristic.TargetHeatingCoolingState.COOL]: 'cool',
          [this.platform.Characteristic.TargetHeatingCoolingState.AUTO]: 'auto',
        };

        if (modeMap[hkValue]) {
          await this.client.setMode(modeMap[hkValue]);
        }
      }
    } catch (error) {
      this.platform.log.error('Error setting target heating/cooling state:', error);
    }
  }

  async getCurrentTemperature() {
    try {
      const status = await this.client.getStatus();
      return status.currentTemp || 20;
    } catch (error) {
      this.platform.log.error('Error getting current temperature:', error);
      return 20;
    }
  }

  async getTargetTemperature() {
    try {
      const status = await this.client.getStatus();
      return status.targetTemp || 22;
    } catch (error) {
      this.platform.log.error('Error getting target temperature:', error);
      return 22;
    }
  }

  async setTargetTemperature(value: CharacteristicValue) {
    try {
      const temperature = value as number;
      await this.client.setTargetTemp(temperature);
    } catch (error) {
      this.platform.log.error('Error setting target temperature:', error);
    }
  }

  // Zone Characteristics
  async getZonePower() {
    if (this.zoneNumber === undefined) {
      return false;
    }

    try {
      const zone = await this.client.getZoneStatus(this.zoneNumber);
      return zone.power;
    } catch (error) {
      this.platform.log.error(`Error getting zone ${this.zoneNumber} power:`, error);
      return false;
    }
  }

  async setZonePower(value: CharacteristicValue) {
    if (this.zoneNumber === undefined) {
      return;
    }

    try {
      const power = value as boolean;
      await this.client.setZonePower(this.zoneNumber, power);
    } catch (error) {
      this.platform.log.error(`Error setting zone ${this.zoneNumber} power:`, error);
    }
  }

  async getZonePercentage() {
    if (this.zoneNumber === undefined) {
      return 0;
    }

    try {
      const zone = await this.client.getZoneStatus(this.zoneNumber);
      return zone.percentage;
    } catch (error) {
      this.platform.log.error(`Error getting zone ${this.zoneNumber} percentage:`, error);
      return 0;
    }
  }

  async setZonePercentage(value: CharacteristicValue) {
    if (this.zoneNumber === undefined) {
      return;
    }

    try {
      const percentage = value as number;
      await this.client.setZonePercentage(this.zoneNumber, percentage);
    } catch (error) {
      this.platform.log.error(`Error setting zone ${this.zoneNumber} percentage:`, error);
    }
  }

  private startStatusUpdates() {
    // Update status every 30 seconds
    this.statusUpdateInterval = setInterval(async () => {
      try {
        if (this.zoneNumber !== undefined) {
          const zone = await this.client.getZoneStatus(this.zoneNumber);
          this.service
            .getCharacteristic(this.platform.Characteristic.On)
            .updateValue(zone.power);

          // Update lightbulb brightness if available
          const lightbulb = this.accessory.getService(this.platform.Service.Lightbulb);
          if (lightbulb) {
            lightbulb
              .getCharacteristic(this.platform.Characteristic.Brightness)
              .updateValue(zone.percentage);
          }
        } else {
          const status = await this.client.getStatus();
          this.service
            .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
            .updateValue(status.currentTemp);
          this.service
            .getCharacteristic(this.platform.Characteristic.TargetTemperature)
            .updateValue(status.targetTemp);
        }
      } catch (error) {
        this.platform.log.debug('Error updating status:', error);
      }
    }, 30000);
  }
}
