import { createLogger, format, transports } from 'winston';


// Get log level from environment variables or use 'info' as default
const logLevel = process.env.LOG_LEVEL || 'info';


// Configure Winston logger
const logger = createLogger({
	level: logLevel,
	format: format.combine(
    	format.timestamp(), 
    	format.json() 
	),
	transports: [
    	new transports.Console(), 
	],
});


export default logger;
