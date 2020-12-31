import { parseJSON, saveText } from './io';
import * as path from 'path';
import * as process from 'process';

const ENV_PORT = 'PORT';
const ENV_CONFIG = 'CONFIG';

const DEFAULT_PORT: number = 3000;
const DEFAULT_CONFIG_PATH: string = 'config.json';

export class Config {
  private static _configCache: Promise<Config> = null;

  /** Read port from environment variables. Will never fail. */
  public static getPort(): number {
    try {
      const portStr = process.env[ENV_PORT];
      const portInt = Number.parseInt(portStr);
      if (!portInt || Number.isNaN(portInt)) throw new Error(`Invalid port in ENV`);

      return portInt;
    } catch (e) {
      console.error(e);
      return DEFAULT_PORT; // Default value
    }
  }

  /**
   * Get config value. File is automatically loaded if needed and kept in cache.
   */
  public static async get<T = any>(name: string, defaultValue?: T): Promise<T> {
    const config = await Config._get();
    if (!config || !config[name]) {
      return defaultValue;
    }

    return config[name];
  }

  /**
   * 
   * @param name 
   * @param value 
   */
  public static async set(name: string, value: any): Promise<void> {
    // Make sure value is stringifiable
    try {
      JSON.stringify(value);
    } catch (e) {
      console.error(e);
      throw new Error(`Failed to stringify config value for ${name}`);
    }

    const config = await Config._get();
    config[name] = value;

    try {
      await saveText(Config._getConfigFilename(), JSON.stringify(config, null, 2));
    } catch (e) {
      console.error(e);
    } finally {
      // Make sure config cache is deleted
      Config._configCache = null;
    }
  }

  /** Build config path from env variable */
  private static _getConfigFilename(): string {
    const configPath: string = process.env[ENV_CONFIG] || DEFAULT_CONFIG_PATH;
    return path.resolve(configPath);
  }

  /** Get config from filesystem of from cache if already loaded. */
  private static async _get(): Promise<{ [uid: string]: any }> {
    if (Config._configCache === null) {
      Config._configCache = parseJSON<Config>(Config._getConfigFilename());
    }
    return Config._configCache;
  }
}
