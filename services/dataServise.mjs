import AWS from 'aws-sdk';

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
    const params = {
        TableName: tableName,
        Key: { id },
    };
    const result = await dynamoDB.get(params).promise();
    return !!result.Item; // Returns true if the entry exists
};

// Save data with retry logic
export const saveWithRetry = async (params, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await dynamoDB.put(params).promise();
            return; // Successful save, exit the loop
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error; // All attempts exhausted, throw the error
            }
        }
    }
};

// Main function to save data to DynamoDB
export const saveDataToDatabase = async (data) => {
    const id = data.metadata.Board + '_' + new Date().toISOString();

    // Check for duplicates
    if (await isDuplicate(id)) {
        throw new Error(`Duplicate entry found with id: ${id}`);
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

    // Save data with retry logic
    await saveWithRetry(params);
    console.log('Data successfully saved to DynamoDB:', params.Item);
};