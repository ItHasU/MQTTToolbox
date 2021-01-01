import { parseJSON, saveText } from './io';
import { ConfigFile } from "@mqtttoolbox/commons";

import * as path from 'path';
import * as process from 'process';

const ENV_PORT = 'PORT';
const ENV_CONFIG = 'CONFIG';

const DEFAULT_PORT: number = 3000;
const DEFAULT_CONFIG_PATH: string = 'config.json';

type ConfigCallback<K extends keyof ConfigFile> = (name: K, value: ConfigFile[K]) => void;
type ConfigObject = { [name: string]: any };

export class Config {
  private static _configCache: Promise<ConfigObject> = null;
  private static _callbacks: { [name: string]: ConfigCallback<keyof ConfigFile>[] } = {};

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

  public static on<K extends keyof ConfigFile>(name: K, callback: ConfigCallback<K>): void {
    let callbacks: ConfigCallback<keyof ConfigFile>[] = Config._callbacks[name];
    if (!callbacks) {
      Config._callbacks[name] = callbacks = [];
    }

    callbacks.push(callback);
  }

  /**
   * Get config value. File is automatically loaded if needed and kept in cache.
   */
  public static async get<K extends keyof ConfigFile>(name: K, defaultValue?: ConfigFile[K]): Promise<ConfigFile[K]> {
    const config = await Config._get();
    if (!config || !config[name]) {
      return defaultValue;
    }

    return config[name];
  }

  /**
   * Set value in config. Will save file and reload it afterwards.
   */
  public static async set<K extends keyof ConfigFile>(name: K, value: ConfigFile[K]): Promise<void> {
    try {
      const config = await Config._get();
      config[name] = JSON.parse(JSON.stringify(value)); // Make sure value is stringifiable

      await Config.save();
    } catch (e) {
      console.error(e);
      throw new Error(`Failed to stringify config value for ${name}`);
    }
  }

  public static async setMulti(values: Partial<ConfigFile>): Promise<void> {
    try {
      const config = await Config._get();
      for (let name in values) {
        try {
          config[name] = JSON.parse(JSON.stringify(values[name])); // Make sure value is stringifiable
        } catch (e) {
          console.error(e);
          throw new Error(`Failed to stringify config value for ${name}`);
        }
      }

      await Config.save();
    } catch (e) {
      console.error(e);
      throw new Error(`Failed to save config`);
    }
  }

  private static async save(): Promise<void> {
    try {
      let config = await Config._get();
      await saveText(Config._getConfigFilename(), JSON.stringify(config, null, 2));
    } catch (e) {
      console.error(e);
    } finally {
      // Make sure config cache is deleted
      await this.reload();
    }
  }

  /**
   * Reload the configuration, will also trigger callbacks for all config.
   */
  public static reload(): Promise<void> {
    Config._configCache = null;
    return Config._get().then((config) => { });
  }

  /** Build config path from env variable */
  private static _getConfigFilename(): string {
    const configPath: string = process.env[ENV_CONFIG] || DEFAULT_CONFIG_PATH;
    return path.resolve(configPath);
  }

  /** Get config from filesystem of from cache if already loaded. */
  private static async _get(): Promise<ConfigObject> {
    if (Config._configCache === null) {
      Config._configCache = parseJSON<Config>(Config._getConfigFilename());
      Config._configCache.then((config) => {
        for (let name in config) {
          const value: any = config[name];

          let callbacks = Config._callbacks[name];
          if (!callbacks) continue;

          for (let callback of callbacks) {
            callback(<keyof ConfigFile>name, value);
          }
        }
      });
    }
    return Config._configCache;
  }
}
