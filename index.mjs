import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { requestLogger, errorLogger } from './middleware/logger.mjs'; // Import logger middleware
import dataRoutes from './routes/dataRoutes.mjs';


dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

// Middleware for logging requests
app.use(requestLogger);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', dataRoutes);
// Error logging middleware

app.use(errorLogger);

// Global error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
});