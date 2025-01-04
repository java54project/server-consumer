import Joi from 'joi';
import { ValidationError } from '../errors.mjs'; // Импорт кастомной ошибки


// schema for metadata validation
const metadataSchema = Joi.object({
	Result: Joi.string().valid('*', '1-0', '0-1', '1/2-1/2').required(),
	FEN: Joi.string().required(),
	Board: Joi.string().required(),
	Site: Joi.string().required(),
	White: Joi.string().required(),
	Black: Joi.string().required(),
	Annotator: Joi.string().optional(),
});


// Main data schema
const dataSchema = Joi.object({
	metadata: metadataSchema.required(),
	moves: Joi.array().items(Joi.string().pattern(/^[a-h][1-8][a-h][1-8]$/)).required(),
});


// validation function
export const validateData = async (data) => {
	const { error } = await dataSchema.validateAsync(data);
	if (error) {
    	throw new ValidationError(`Validation failed: ${error.details.map((x) => x.message).join(', ')}`);
	}
};
