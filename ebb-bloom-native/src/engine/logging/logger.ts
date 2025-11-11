import pino from 'pino';

const isDev = import.meta.env.DEV;

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  browser: {
    asObject: true,
    write: {
      trace: console.trace.bind(console),
      debug: console.debug.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      fatal: console.error.bind(console),
    },
  },
});

export const genesisLogger = logger.child({ module: 'Genesis' });
export const timelineLogger = logger.child({ module: 'CosmicTimeline' });
export const ecsLogger = logger.child({ module: 'ECS' });
export const worldLogger = logger.child({ module: 'World' });
export const lawLogger = logger.child({ module: 'LawOrchestrator' });
export const intentLogger = logger.child({ module: 'GovernorActionExecutor' });
export const conservationLogger = logger.child({ module: 'ConservationLedger' });
export const rngLogger = logger.child({ module: 'RNGRegistry' });
export const gameStateLogger = logger.child({ module: 'GameState' });
export const sceneLogger = logger.child({ module: 'SceneManager' });
