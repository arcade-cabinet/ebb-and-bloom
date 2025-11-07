/**
 * Browser-compatible logging system for evolution data
 * Uses pino with localStorage persistence
 */

import pino from 'pino';

// Create browser-compatible pino logger
const logger = pino({
  level: 'debug',
  browser: {
    asObject: true,
    serialize: true
  }
});

// Enhanced logging functions with evolution data persistence
export const log = {
  debug: (message: string, context?: any) => {
    logger.debug(context, message);
    persistEvolutionLog('debug', message, context);
  },
  
  info: (message: string, context?: any) => {
    logger.info(context, message);
    persistEvolutionLog('info', message, context);
  },
  
  warn: (message: string, context?: any) => {
    logger.warn(context, message);
    persistEvolutionLog('warn', message, context);
  },
  
  error: (message: string, error?: Error | any, context?: any) => {
    const errorContext = { error: error?.message || error, stack: error?.stack, ...context };
    logger.error(errorContext, message);
    persistEvolutionLog('error', message, errorContext);
  },
  
  // Game-specific logging
  terrain: (message: string, context?: any) => {
    log.info(`[TERRAIN] ${message}`, context);
  },
  
  creature: (message: string, creatureId?: string, context?: any) => {
    log.debug(`[CREATURE${creatureId ? ` ${creatureId}` : ''}] ${message}`, context);
  },
  
  yuka: (message: string, context?: any) => {
    log.debug(`[YUKA] ${message}`, context);
  },
  
  r3f: (message: string, context?: any) => {
    log.debug(`[R3F] ${message}`, context);
  },
  
  performance: (message: string, metrics?: any) => {
    log.info(`[PERF] ${message}`, metrics);
  },
  
  // Export logs for file analysis
  exportLogs: () => {
    try {
      const logs = localStorage.getItem('ebb-bloom-evolution-logs');
      return logs ? JSON.parse(logs) : [];
    } catch (e) {
      return [];
    }
  },
  
  clearLogs: () => {
    localStorage.removeItem('ebb-bloom-evolution-logs');
  }
};

// Persist evolution data to localStorage
function persistEvolutionLog(level: string, message: string, context?: any) {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };
    
    const existing = localStorage.getItem('ebb-bloom-evolution-logs');
    const logs = existing ? JSON.parse(existing) : [];
    logs.push(entry);
    
    // Keep last 2000 evolution logs
    if (logs.length > 2000) {
      logs.splice(0, logs.length - 2000);
    }
    
    localStorage.setItem('ebb-bloom-evolution-logs', JSON.stringify(logs));
  } catch (e) {
    console.warn('Failed to persist evolution log');
  }
}

// Performance monitoring
export const measurePerformance = (name: string) => {
  const start = performance.now();
  
  return {
    end: () => {
      const duration = performance.now() - start;
      log.performance(`${name} completed`, { duration: `${duration.toFixed(2)}ms` });
      return duration;
    }
  };
};

// Initialize logging
export const initializeLogging = () => {
  try {
    log.info('Pino browser logger initialized', { 
      environment: 'browser',
      timestamp: new Date().toISOString(),
      localStorage: typeof localStorage !== 'undefined'
    });
  } catch (error) {
    console.error('Failed to initialize logging:', error);
  }
};

export default logger;