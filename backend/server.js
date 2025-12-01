import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import participantsRouter from './routes/participants.js';
import drawsRouter from './routes/draws.js';
import statsRouter from './routes/stats.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/participants', participantsRouter);
app.use('/api/draws', drawsRouter);
app.use('/api/stats', statsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'FillNWin API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 FillNWin Backend API running on port ${PORT}`);
    console.log(`📡 API URL: http://localhost:${PORT}`);
});
