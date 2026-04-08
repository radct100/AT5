import axios, { AxiosInstance } from 'axios';
import { Logger } from 'homebridge';

export interface AirTouchStatus {
  power: boolean;
  mode: 'cool' | 'heat' | 'dry' | 'fan' | 'auto';
  targetTemp: number;
  currentTemp: number;
  zones: ZoneStatus[];
}

export interface ZoneStatus {
  zoneNumber: number;
  name: string;
  power: boolean;
  percentage: number;
  temperature?: number;
}

export interface AirTouch5Response {
  status: string;
  data?: unknown;
  error?: string;
}

export class AirTouch5Client {
  private api: AxiosInstance;
  private baseUrl: string;

  constructor(
    host: string,
    port: number,
    private log: Logger,
  ) {
    this.baseUrl = `http://${host}:${port}`;
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 5000,
    });
  }

  /**
   * Get the current status of the Air Touch 5 system
   */
  async getStatus(): Promise<AirTouchStatus> {
    try {
      const response = await this.api.get<AirTouchStatus>('/status');
      return response.data;
    } catch (error) {
      this.log.error('Error getting status:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Turn the system on or off
   */
  async setPower(power: boolean): Promise<void> {
    try {
      await this.api.post('/power', { power });
    } catch (error) {
      this.log.error('Error setting power:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Set the operating mode
   */
  async setMode(mode: 'cool' | 'heat' | 'dry' | 'fan' | 'auto'): Promise<void> {
    try {
      await this.api.post('/mode', { mode });
    } catch (error) {
      this.log.error('Error setting mode:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Set the target temperature
   */
  async setTargetTemp(temperature: number): Promise<void> {
    try {
      await this.api.post('/temperature', { temperature });
    } catch (error) {
      this.log.error('Error setting temperature:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Set zone power state
   */
  async setZonePower(zoneNumber: number, power: boolean): Promise<void> {
    try {
      await this.api.post(`/zone/${zoneNumber}/power`, { power });
    } catch (error) {
      this.log.error(`Error setting zone ${zoneNumber} power:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Set zone percentage (0-100)
   */
  async setZonePercentage(zoneNumber: number, percentage: number): Promise<void> {
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    try {
      await this.api.post(`/zone/${zoneNumber}/percentage`, { percentage: clampedPercentage });
    } catch (error) {
      this.log.error(`Error setting zone ${zoneNumber} percentage:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Get zone status
   */
  async getZoneStatus(zoneNumber: number): Promise<ZoneStatus> {
    try {
      const response = await this.api.get<ZoneStatus>(`/zone/${zoneNumber}`);
      return response.data;
    } catch (error) {
      this.log.error(`Error getting zone ${zoneNumber} status:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}
