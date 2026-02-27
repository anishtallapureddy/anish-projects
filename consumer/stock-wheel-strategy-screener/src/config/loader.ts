import * as fs from 'fs';
import * as path from 'path';
import { parse as parseYaml } from 'yaml';
import { AppConfig, StrategyRules, RiskLimits, UniverseConfig, UserPreferences } from '../types';

const CONFIGS_DIR = path.resolve(__dirname, '../../agents/configs');

function loadYaml<T>(filename: string): T {
  const filepath = path.join(CONFIGS_DIR, filename);
  const content = fs.readFileSync(filepath, 'utf-8');
  return parseYaml(content) as T;
}

export function loadConfig(): AppConfig {
  return {
    strategyRules: loadYaml<StrategyRules>('strategy_rules.yaml'),
    riskLimits: loadYaml<RiskLimits>('risk_limits.yaml'),
    universe: loadYaml<UniverseConfig>('universe.yaml'),
    userPreferences: loadYaml<UserPreferences>('user_preferences.yaml'),
  };
}
