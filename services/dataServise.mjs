import AWS from 'aws-sdk';

// AWS config
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE_NAME;

// saving data to DynamoDB
export const saveDataToDatabase = async (data) => {
    const params = {
        TableName: tableName,
        Item: {
            id: data.metadata.Board + '_' + new Date().toISOString(), // uniq ID of the 
            metadata: data.metadata,
            moves: data.moves,
            createdAt: new Date().toISOString(),
        },
    };

    // pushing data to DynamoDB
    await dynamoDB.put(params).promise();
    console.log('Data successfully saved to DynamoDB:', params.Item);
};