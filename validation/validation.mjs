import Joi from 'joi';

// Схема для валидации metadata
const metadataSchema = Joi.object({
    Result: Joi.string().valid('*', '1-0', '0-1', '1/2-1/2').required(),
    FEN: Joi.string().required(),
    Board: Joi.string().required(),
    Site: Joi.string().required(),
    White: Joi.string().required(),
    Black: Joi.string().required(),
    Annotator: Joi.string().optional(),
});

// Основная схема данных
const dataSchema = Joi.object({
    metadata: metadataSchema.required(),
    moves: Joi.array().items(Joi.string().pattern(/^[a-h][1-8][a-h][1-8]$/)).required(),
});

// Функция для валидации
export const validateData = async (data) => {
    return await dataSchema.validateAsync(data);
};