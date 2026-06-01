const pino = require('pino');
const env = require('../config/env');

const logger = pino({
  level: env.isTest ? 'silent' : env.isProduction ? 'info' : 'debug',
  ...(env.isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        },
      }),
});

module.exports = logger;
