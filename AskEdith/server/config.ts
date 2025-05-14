import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const mkdirAsync = promisify(fs.mkdir);

// Path to the config directory and file
const CONFIG_DIR = path.join(process.cwd(), '.config');
const CONFIG_FILE = path.join(CONFIG_DIR, 'app-config.json');

// Interface for application configuration
interface AppConfig {
  emailService: {
    provider: 'sendgrid' | 'nodemailer' | 'fallback';
    sendgrid: {
      apiKey: string;
      configured: boolean;
    };
    nodemailer: {
      configured: boolean;
    };
  };
}

// Default configuration
const DEFAULT_CONFIG: AppConfig = {
  emailService: {
    provider: 'fallback',
    sendgrid: {
      apiKey: '',
      configured: false
    },
    nodemailer: {
      configured: false
    }
  }
};

// Initialize configuration
let configCache: AppConfig | null = null;

/**
 * Ensures the configuration directory exists
 */
async function ensureConfigDir(): Promise<void> {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      await mkdirAsync(CONFIG_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating config directory:', error);
    throw error;
  }
}

/**
 * Initialize the configuration file if it doesn't exist
 */
async function initConfig(): Promise<AppConfig> {
  try {
    await ensureConfigDir();
    
    if (!fs.existsSync(CONFIG_FILE)) {
      await writeFileAsync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
      return DEFAULT_CONFIG;
    }
    
    const data = await readFileAsync(CONFIG_FILE, 'utf8');
    return JSON.parse(data) as AppConfig;
  } catch (error) {
    console.error('Error initializing config:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Get the application configuration
 */
export async function getConfig(): Promise<AppConfig> {
  if (configCache) {
    return configCache;
  }
  
  configCache = await initConfig();
  return configCache;
}

/**
 * Update the application configuration
 */
export async function updateConfig(newConfig: Partial<AppConfig>): Promise<AppConfig> {
  try {
    const currentConfig = await getConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    
    await ensureConfigDir();
    await writeFileAsync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2));
    
    configCache = updatedConfig;
    return updatedConfig;
  } catch (error) {
    console.error('Error updating config:', error);
    throw error;
  }
}

/**
 * Set the SendGrid API key
 */
export async function setSendGridApiKey(apiKey: string): Promise<void> {
  const config = await getConfig();
  
  config.emailService.sendgrid.apiKey = apiKey;
  config.emailService.sendgrid.configured = true;
  config.emailService.provider = 'sendgrid';
  
  await updateConfig(config);
  
  // Also set in environment for current session
  process.env.SENDGRID_API_KEY = apiKey;
}

/**
 * Get the SendGrid API key
 */
export async function getSendGridApiKey(): Promise<string> {
  const config = await getConfig();
  return config.emailService.sendgrid.apiKey;
}

/**
 * Check if SendGrid is configured
 */
export async function isSendGridConfigured(): Promise<boolean> {
  const config = await getConfig();
  return config.emailService.sendgrid.configured;
}