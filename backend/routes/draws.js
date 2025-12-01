import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Add winner to draw history
router.post('/', async (req, res) => {
    try {
        const { winner } = req.body;

        if (!winner) {
            return res.status(400).json({ error: 'Winner data is required' });
        }

        const now = new Date();
        const drawDate = now.toLocaleDateString();
        const drawTime = now.toLocaleTimeString();

        const query = `
            INSERT INTO draw_history (
                participant_id, full_name, phone, bill_receipt, 
                vehicle_registration_number, vehicle_type, sap_code,
                retail_outlet_name, rsa, divisonal_office,
                submission_date_time, ticket_number, draw_date, draw_time
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `;

        const result = await pool.query(query, [
            winner.id,
            winner.fullName || winner.full_name,
            winner.phone,
            winner.billReceipt || winner.bill_receipt || '',
            winner.vehicleRegistrationNumber || winner.vehicle_registration_number || '',
            winner.vehicleType || winner.vehicle_type || '',
            winner.sapCode || winner.sap_code || '',
            winner.retailOutletName || winner.retail_outlet_name || '',
            winner.rsa || '',
            winner.divisonalOffice || winner.divisonal_office,
            winner.submissionDateTime || winner.submission_date_time || '',
            winner.ticketNumber || winner.ticket_number,
            drawDate,
            drawTime
        ]);

        res.json({
            success: true,
            entry: {
                id: result.rows[0].id,
                winner: {
                    id: result.rows[0].participant_id,
                    fullName: result.rows[0].full_name,
                    phone: result.rows[0].phone,
                    billReceipt: result.rows[0].bill_receipt,
                    vehicleRegistrationNumber: result.rows[0].vehicle_registration_number,
                    vehicleType: result.rows[0].vehicle_type,
                    sapCode: result.rows[0].sap_code,
                    retailOutletName: result.rows[0].retail_outlet_name,
                    rsa: result.rows[0].rsa,
                    divisonalOffice: result.rows[0].divisonal_office,
                    submissionDateTime: result.rows[0].submission_date_time,
                    ticketNumber: result.rows[0].ticket_number
                },
                date: drawDate,
                time: drawTime,
                timestamp: result.rows[0].draw_timestamp
            }
        });
    } catch (error) {
        console.error('Add draw history error:', error);
        res.status(500).json({ error: 'Failed to add winner to history' });
    }
});

// Get draw history
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM draw_history ORDER BY draw_timestamp DESC'
        );

        const history = result.rows.map(row => ({
            id: row.id,
            winner: {
                id: row.participant_id,
                fullName: row.full_name,
                phone: row.phone,
                billReceipt: row.bill_receipt,
                vehicleRegistrationNumber: row.vehicle_registration_number,
                vehicleType: row.vehicle_type,
                sapCode: row.sap_code,
                retailOutletName: row.retail_outlet_name,
                rsa: row.rsa,
                divisonalOffice: row.divisonal_office,
                submissionDateTime: row.submission_date_time,
                ticketNumber: row.ticket_number
            },
            date: row.draw_date,
            time: row.draw_time,
            timestamp: row.draw_timestamp
        }));

        res.json(history);
    } catch (error) {
        console.error('Get draw history error:', error);
        res.status(500).json({ error: 'Failed to fetch draw history' });
    }
});

// Export winners as CSV
router.get('/export', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM draw_history ORDER BY draw_timestamp DESC'
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No winners to export' });
        }

        // CSV headers
        const headers = [
            'Full Name', 'Phone', 'Bill Receipt', 'Vehicle Registration Number',
            'Vehicle Type', 'SAP Code', 'Retail Outlet Name', 'RSA',
            'Divisonal Office', 'Submission Date & Time', 'Ticket Number',
            'Draw Date', 'Draw Time'
        ];

        // CSV rows
        const rows = result.rows.map(row => [
            row.full_name,
            row.phone,
            row.bill_receipt || '',
            row.vehicle_registration_number || '',
            row.vehicle_type || '',
            row.sap_code || '',
            row.retail_outlet_name || '',
            row.rsa || '',
            row.divisonal_office,
            row.submission_date_time || '',
            row.ticket_number,
            row.draw_date,
            row.draw_time
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=fillnwin_winners_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csvContent);
    } catch (error) {
        console.error('Export winners error:', error);
        res.status(500).json({ error: 'Failed to export winners' });
    }
});

// Clear all draw history
router.delete('/', async (req, res) => {
    try {
        await pool.query('DELETE FROM draw_history');
        res.json({ success: true, message: 'All draw history cleared' });
    } catch (error) {
        console.error('Clear draw history error:', error);
        res.status(500).json({ error: 'Failed to clear draw history' });
    }
});

export default router;
