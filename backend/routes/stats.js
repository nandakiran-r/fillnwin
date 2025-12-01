import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get statistics
router.get('/', async (req, res) => {
    try {
        // Get total participants count
        const totalResult = await pool.query(
            'SELECT COUNT(*) as count FROM participants'
        );

        // Get total draws count
        const drawsResult = await pool.query(
            'SELECT COUNT(*) as count FROM draw_history'
        );

        // Get remaining participants count (not drawn)
        const remainingResult = await pool.query(
            'SELECT COUNT(*) as count FROM participants WHERE is_drawn = FALSE'
        );

        res.json({
            totalParticipants: parseInt(totalResult.rows[0].count),
            totalDraws: parseInt(drawsResult.rows[0].count),
            remainingParticipants: parseInt(remainingResult.rows[0].count)
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

export default router;
