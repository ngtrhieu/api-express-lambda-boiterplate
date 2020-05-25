const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.splat(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: `logs/scaffold-${new Date().toISOString()}.log`,
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.simple(),
      ),
    }),
  ],
});

module.exports = logger;
