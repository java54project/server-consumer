import { createLogger, format, transports } from 'winston';

// Get log level from environment variables or use 'info' as default
const logLevel = process.env.LOG_LEVEL || 'info';

// Configure Winston logger
const logger = createLogger({
    level: logLevel,
    format: format.combine(
        format.timestamp(),
        format.json() // JSON format for structured logging
    ),
    transports: [
        new transports.Console(), // Logs sent to stdout
    ],
});

export const requestLogger = (req, res, next) => {
    logger.info({
        message: 'Incoming request',
        method: req.method,
        url: req.url,
        headers: req.headers,
    });
    next();
};

export const errorLogger = (err, req, res, next) => {
    logger.error({
        message: 'Error occurred',
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
    next(err);
};

export default logger;