import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from 'homebridge';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { AirTouch5Accessory } from './accessory';
import { AirTouch5Client } from './client';

interface AirTouch5Config extends PlatformConfig {
  host?: string;
  port?: number;
  statusInterval?: number;
  zones?: Array<{
    zoneNumber: number;
    name: string;
  }>;
}

export class AirTouch5Platform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];
  public client?: AirTouch5Client;
  public statusInterval?: NodeJS.Timer;

  constructor(
    public readonly log: Logger,
    public readonly config: AirTouch5Config,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. More info can be found at
    // https://github.com/homebridge/homebridge/wiki/Dynamic-Platform-Plugins
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  discoverDevices() {
    const host = this.config.host;
    const port = this.config.port || 8080;

    if (!host) {
      this.log.error('No host configured for Air Touch 5 device');
      return;
    }

    // Initialize the client
    this.client = new AirTouch5Client(host, port, this.log);

    // Check connection
    this.client.getStatus()
      .then((status) => {
        this.log.info('Connected to Air Touch 5 device at', `${host}:${port}`);
        this.registerSystemAccessory();
        this.registerZoneAccessories();
        this.startStatusPolling();
      })
      .catch((error) => {
        this.log.error('Failed to connect to Air Touch 5 device:', error.message);
      });
  }

  private registerSystemAccessory() {
    if (!this.client) {
      return;
    }

    const uuid = this.api.hap.uuid.generate('airtouch5-system');
    let accessory = this.accessories.find(acc => acc.UUID === uuid);

    if (!accessory) {
      accessory = new this.api.platformAccessory('Air Touch 5 System', uuid);
      accessory.context.device = {
        type: 'system',
      };
      this.accessories.push(accessory);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }

    new AirTouch5Accessory(this, accessory, this.client);
  }

  private registerZoneAccessories() {
    if (!this.client || !this.config.zones) {
      return;
    }

    for (const zoneConfig of this.config.zones) {
      const zoneName = zoneConfig.name || `Zone ${zoneConfig.zoneNumber}`;
      const uuid = this.api.hap.uuid.generate(`airtouch5-zone-${zoneConfig.zoneNumber}`);

      let accessory = this.accessories.find(acc => acc.UUID === uuid);

      if (!accessory) {
        accessory = new this.api.platformAccessory(zoneName, uuid);
        accessory.context.device = {
          type: 'zone',
          zoneNumber: zoneConfig.zoneNumber,
        };
        this.accessories.push(accessory);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }

      new AirTouch5Accessory(this, accessory, this.client, zoneConfig.zoneNumber);
    }
  }

  private startStatusPolling() {
    const interval = this.config.statusInterval || 30000; // Default 30 seconds

    this.statusInterval = setInterval(() => {
      if (this.client) {
        this.client.getStatus()
          .catch((error) => {
            this.log.error('Error polling status:', error.message);
          });
      }
    }, interval);
  }

  stopStatusPolling() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
  }
}
