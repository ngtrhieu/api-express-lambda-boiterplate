const winston = require('winston');

const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.splat(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      level: 'info',
      filename: `logs/scaffold-${new Date().toISOString()}.log`,
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.simple(),
      ),
    }),
  ],
});

module.exports = logger;
