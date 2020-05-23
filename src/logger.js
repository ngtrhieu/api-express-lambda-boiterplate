import winston from 'winston';
import expressWinston from 'express-winston';

// Main Logger
const logger = winston.createLogger({
  level: 'info',
  format: new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.splat(),
      winston.format.simple(),
    ),
  }),
});
export default logger;

// Express logger middleware
export const loggerMiddleware = expressWinston.logger({
  format: new winston.transports.Console({
    silent: process.env.NODE_ENV === 'test',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }),
  meta: true,
  msg: 'HTTTP {{res.method}}  {{req.url}}',
  expressFormat: true,
});
