import net from 'net';
import { validateData } from './validation/validation.mjs';
import { saveDataToDatabase } from './services/dataService.mjs';
import logger from './middleware/logger.mjs';
import { ValidationError, DuplicateError, DatabaseError } from './errors.mjs';

const PORT = process.env.PORT || 3000;

// connection timeout for not active connections
const CONNECTION_TIMEOUT = process.env.CONNECTION_TIMEOUT || 60000;

const server = net.createServer((socket) => {
	logger.info('Client connected');

	// timeout for not active connection
	socket.setTimeout(CONNECTION_TIMEOUT);

	// handling income data
	socket.on('data', async (data) => {
    	try {
        	// income data from buffer  to string and parsing jSON
        	const parsedData = JSON.parse(data.toString());

        	// data validation
        	await validateData(parsedData);
            logger.info ("Data validation successful")
            
            // saving data to DynamoDB
        	await saveDataToDatabase(parsedData);

        	
        	logger.info('Data successfully saved to DynamoDB:', {data: parsedData});

    	} catch (error) {
        	if (error instanceof ValidationError) {
            	logger.warn('Validation error', { error: error.message });
            	
        	} else if (error instanceof DuplicateError) {
            	logger.warn('Duplicate entry error', { error: error.message });
            	
        	} else if (error instanceof DatabaseError) {
            	logger.error('Database error', { error: error.message });
            	
        	} else {
            	logger.error('Unexpected error', { error: error.message });
            	
        	}
        	socket.end(); // Close connection after error
    	}
	});


	// handling  end of connection
	socket.on('end', () => {
    	logger.info('Client disconnected');
	});

	// handling timeout
	socket.on('timeout', () => {
    	logger.warn('Connection timed out');
    	socket.end(); // Закрываем соединение
	});

	// handling errors
	socket.on('error', (err) => {
    	logger.error('Socket error', { error: err.message });
	});
});

// TCP server sterting
server.listen(PORT, () => {
	logger.info(`TCP Server is running on port ${PORT}`);
});

