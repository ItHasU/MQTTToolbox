import { parseJSON, saveText } from './io';
import { ConfigFile } from "@mqtttoolbox/commons";

import * as path from 'path';
import * as process from 'process';

const ENV_PORT = 'PORT';
const ENV_CONFIG = 'CONFIG';

const DEFAULT_PORT: number = 3000;
const DEFAULT_CONFIG_PATH: string = 'config.json';

type ConfigCallback<K extends keyof ConfigFile> = (name: K, value: ConfigFile[K]) => void;

export class Config {
  private static _configCache: Promise<ConfigFile> = null;
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
    await Config._setAndFireCallbacks(name, value);
    await Config.save();
  }

  public static async setMulti(values: Partial<ConfigFile>): Promise<void> {
    for (let name in values) {
      await Config._setAndFireCallbacks(<any>name, <any>values[name]);
    }
    await Config.save();
  }

  /** Set value and trigger callbacks */
  private static async _setAndFireCallbacks(name: string, value: any): Promise<void> {
    const config = await Config._get();
    try {
      if (value === undefined) {
        delete config[name];
      } else {
        config[name] = JSON.parse(JSON.stringify(value)); // Make sure value is stringifiable
      }
    } catch (e) {
      // Special catch for the 
      console.error(`Failed to stringify value.`);
      throw e;
    }

    try {
      let callbacks = Config._callbacks[name];
      if (callbacks) {
        for (let callback of callbacks) {
          callback(<keyof ConfigFile>name, value);
        }
      }
    } catch (e) {
      // We don't care about exception in callback
      console.error(e);
    }
  }

  private static async save(): Promise<void> {
    try {
      let config = await Config._get();
      await saveText(Config._getConfigFilename(), JSON.stringify(config, null, 2));
    } catch (e) {
      console.error(e); // Make sure error is logged
      throw e;          // Then forward the error
    }
  }

  /** Build config path from env variable */
  private static _getConfigFilename(): string {
    const configPath: string = process.env[ENV_CONFIG] || DEFAULT_CONFIG_PATH;
    return path.resolve(configPath);
  }

  /** Get config from filesystem of from cache if already loaded. */
  private static async _get(): Promise<ConfigFile> {
    if (Config._configCache === null) {
      Config._configCache = parseJSON<ConfigFile>(Config._getConfigFilename()).catch((e) => {
        console.error(e);
        console.error(`Failed to load config. Reinitialized.`);
        return Promise.resolve(<ConfigFile>{});
      });
    }
    return Config._configCache;
  }
}
