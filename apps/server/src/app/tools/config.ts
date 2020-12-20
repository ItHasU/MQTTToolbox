import { parseJSON } from './io';
import { Config } from "@mqtttoolbox/commons";
import * as path from "path";

var _configCache: Promise<Config> = null;

function getConfigFilename(): string {
    return process.env.config || "config.json"
}

/** @return Absolute path of the configuration file */
export function getConfigFolder(): string {
    return path.dirname(path.resolve(getConfigFilename()));
}

export async function getConfig(): Promise<Config> {
    if (_configCache === null) {
        _configCache = parseJSON<Config>(getConfigFilename());
    }
    return _configCache;
}