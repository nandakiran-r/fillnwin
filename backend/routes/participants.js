import express from 'express';
import multer from 'multer';
import csvParser from 'csv-parser';
import fs from 'fs';
import pool from '../config/database.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Upload CSV and parse participants
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const participants = [];
        const errors = [];

        // Parse CSV file
        fs.createReadStream(req.file.path)
            .pipe(csvParser())
            .on('data', (row) => {
                // Validate required fields
                const fullName = row['Full Name']?.trim();
                const phone = row['Phone']?.trim();
                const divisonalOffice = row['Divisonal Office']?.trim();
                const ticketNumber = row['Ticket Number']?.trim();

                if (!fullName || !phone || !divisonalOffice || !ticketNumber) {
                    errors.push(`Missing required fields for row with ticket: ${ticketNumber || 'unknown'}`);
                    return;
                }

                participants.push({
                    fullName,
                    phone,
                    billReceipt: row['Bill Receipt']?.trim() || '',
                    vehicleRegistrationNumber: row['Vehicle Registration Number']?.trim() || '',
                    vehicleType: row['Vehicle Type']?.trim() || '',
                    sapCode: row['SAP Code']?.trim() || '',
                    retailOutletName: row['Retail Outlet Name']?.trim() || '',
                    rsa: row['RSA']?.trim() || '',
                    divisonalOffice,
                    submissionDateTime: row['Submission Date & Time']?.trim() || '',
                    ticketNumber
                });
            })
            .on('end', async () => {
                try {
                    // Delete uploaded file
                    fs.unlinkSync(req.file.path);

                    if (participants.length === 0) {
                        return res.status(400).json({
                            error: 'No valid participants found in CSV',
                            details: errors
                        });
                    }

                    // Insert participants into database
                    const insertQuery = `
                        INSERT INTO participants (
                            full_name, phone, bill_receipt, vehicle_registration_number,
                            vehicle_type, sap_code, retail_outlet_name, rsa,
                            divisonal_office, submission_date_time, ticket_number
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        ON CONFLICT (ticket_number) DO NOTHING
                    `;

                    let insertedCount = 0;
                    for (const participant of participants) {
                        try {
                            await pool.query(insertQuery, [
                                participant.fullName,
                                participant.phone,
                                participant.billReceipt,
                                participant.vehicleRegistrationNumber,
                                participant.vehicleType,
                                participant.sapCode,
                                participant.retailOutletName,
                                participant.rsa,
                                participant.divisonalOffice,
                                participant.submissionDateTime,
                                participant.ticketNumber
                            ]);
                            insertedCount++;
                        } catch (err) {
                            if (err.code === '23505') { // Unique constraint violation
                                errors.push(`Duplicate ticket number: ${participant.ticketNumber}`);
                            } else {
                                throw err;
                            }
                        }
                    }

                    res.json({
                        success: true,
                        message: `Successfully uploaded ${insertedCount} participants`,
                        count: insertedCount,
                        errors: errors.length > 0 ? errors : undefined
                    });
                } catch (error) {
                    console.error('Database error:', error);
                    res.status(500).json({ error: 'Failed to save participants to database' });
                }
            })
            .on('error', (error) => {
                fs.unlinkSync(req.file.path);
                res.status(500).json({ error: 'Failed to parse CSV file' });
            });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// Get all active participants (not drawn)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM participants WHERE is_drawn = FALSE ORDER BY uploaded_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get participants error:', error);
        res.status(500).json({ error: 'Failed to fetch participants' });
    }
});

// Delete/mark participant as drawn
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Mark as drawn instead of deleting
        const result = await pool.query(
            'UPDATE participants SET is_drawn = TRUE WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Participant not found' });
        }

        res.json({ success: true, participant: result.rows[0] });
    } catch (error) {
        console.error('Delete participant error:', error);
        res.status(500).json({ error: 'Failed to remove participant' });
    }
});

// Clear all participants
router.delete('/', async (req, res) => {
    try {
        await pool.query('DELETE FROM participants');
        res.json({ success: true, message: 'All participants cleared' });
    } catch (error) {
        console.error('Clear participants error:', error);
        res.status(500).json({ error: 'Failed to clear participants' });
    }
});

export default router;
