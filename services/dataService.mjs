import AWS from 'aws-sdk';
import logger from '../middleware/logger.mjs';
import { DuplicateError, DatabaseError } from '../errors.mjs';


// Configure connection to DynamoDB
AWS.config.update({
	region: process.env.AWS_REGION,
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});


const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE_NAME;


// Check for duplicate entry
export const isDuplicate = async (id) => {
	logger.info(`Checking for duplicate entry with ID: ${id}`);
	const params = {
    	TableName: tableName,
    	Key: { id },
	};
	try {
    	const result = await dynamoDB.get(params).promise();
    	if (result.Item) {
        	logger.warn(`Duplicate entry found with ID: ${id}`);
        	throw new DuplicateError(`Duplicate entry found with ID: ${id}`);
    	} else {
        	logger.info(`No duplicate entry found with ID: ${id}`);
    	}
    	return !!result.Item; // Returns true if the entry exists
	} catch (error) {
    	if (!(error instanceof DuplicateError)) {
        	logger.error(`Error checking duplicate for ID: ${id}. Error: ${error.message}`);
        	throw new DatabaseError(`Database error while checking for duplicate. Error: ${error.message}`);
    	}
    	throw error; // rethrow the DuplicateError
	}
};


// Save data with retry logic
export const saveWithRetry = async (params, maxRetries = 3) => {
	for (let i = 0; i < maxRetries; i++) {
    	try {
        	logger.info(`Attempt ${i + 1} to save data to DynamoDB.`);
        	await dynamoDB.put(params).promise();
        	logger.info('Data successfully saved to DynamoDB.', { item: params.Item });
        	return; // Successful save, exit the loop
    	} catch (error) {
        	logger.error(`Attempt ${i + 1} failed. Error: ${error.message}`);
        	if (i === maxRetries - 1) {
            	logger.error('All attempts to save data to DynamoDB have failed.');
            	throw new DatabaseError(`Failed to save data after ${maxRetries} attempts. Error: ${error.message}`);
        	}
    	}
	}
};


// Main function to save data to DynamoDB
export const saveDataToDatabase = async (data) => {
	const id = data.metadata.Board + '_' + new Date().toISOString();


	logger.info(`Processing data for saving. Generated ID: ${id}`);


	// Check for duplicates
	try {
    	await isDuplicate(id);
	} catch (error) {
    	if (error instanceof DuplicateError) {
        	logger.error(error.message);
        	throw error; // Rethrow DuplicateError
    	}
    	throw error; // Handle any other error
	}


	// Parameters for saving
	const params = {
    	TableName: tableName,
    	Item: {
        	id,
        	metadata: data.metadata,
        	moves: data.moves,
        	createdAt: new Date().toISOString(),
    	},
	};


	logger.info(`Saving data to DynamoDB with ID: ${id}`);
	// Save data with retry logic
	try {
    	await saveWithRetry(params);
    	logger.info(`Data successfully saved with ID: ${id}`);
	} catch (error) {
    	if (error instanceof DatabaseError) {
        	logger.error(`Failed to save data with ID: ${id}. Error: ${error.message}`);
    	}
    	throw error; // Re-throw the error for further handling
	}
};
