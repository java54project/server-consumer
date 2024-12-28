import express from 'express';
import { validateData } from '../validation/validation.mjs'; 
import { saveDataToDatabase } from '../services/dataService.mjs'; 
import asyncHandler from 'express-async-handler';

const router = express.Router();

// handling of POST request to add data to database
router.post(
    '/data',
    asyncHandler(async (req, res) => {
        // data validation
        const validatedData = await validateData(req.body);

        // Saving data to database
        await saveDataToDatabase(validatedData);

        res.status(201).json({ message: 'Data successfully processed and saved' });
    })
);


export default router;