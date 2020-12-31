import { parseJSON, saveText } from './io';
import { Config } from "@mqtttoolbox/commons";
import * as path from 'path';
import * as process from 'process';

const ENV_PORT = 'PORT';
const ENV_CONFIG = 'CONFIG';

const DEFAULT_PORT: number = 3000;
const DEFAULT_CONFIG_PATH: string = 'config.json';

var _configCache: Promise<Config> = null;

/** Read port from environment variables. Will never fail. */
export function getPort(): number {
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
export async function getConfigValue<T = any>(name: string, defaultValue?: T): Promise<T> {
  const config = await getConfig();
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
export async function setConfigValue(name: string, value: any): Promise<void> {
  // Make sure value is stringifiable
  try {
    JSON.stringify(value);
  } catch (e) {
    console.error(e);
    throw new Error(`Failed to stringify config value for ${name}`);
  }

  const config = await getConfig();
  config[name] = value;

  try {
    await saveText(_getConfigFilename(), JSON.stringify(config, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    // Make sure config cache is deleted
    _configCache = null;
  }
}

/** Build config path from env variable */
function _getConfigFilename(): string {
  const configPath: string = process.env[ENV_CONFIG] || DEFAULT_CONFIG_PATH;
  return path.resolve(configPath);
}

/** Get config from filesystem of from cache if already loaded. */
async function getConfig(): Promise<{ [uid: string]: any }> {
  if (_configCache === null) {
    _configCache = parseJSON<Config>(_getConfigFilename());
  }
  return _configCache;
}