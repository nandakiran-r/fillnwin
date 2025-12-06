import Papa from 'papaparse';
import * as IDB from './idb.js';

/**
 * Parse CSV file and extract participant data
 * Expected columns: Full Name, Phone, Bill Receipt, Vehicle Registration Number, 
 * Vehicle Type, SAP Code, Retail Outlet Name, RSA, Divisonal Office, 
 * Submission Date & Time, Ticket Number
 * 
 * Required fields: Phone, Divisonal Office, Ticket Number
 * All other fields are optional
 */
export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    // Validate and transform data
                    const participants = results.data.map((row, index) => {
                        // Check if row has required fields
                        const fullName = row['Full Name']?.trim() || '';
                        const phone = row['Phone']?.trim();
                        const divisonalOffice = row['Divisonal Office']?.trim();
                        const ticketNumber = row['Ticket Number']?.trim();

                        if (!phone || !divisonalOffice || !ticketNumber) {
                            throw new Error(`Row ${index + 1} is missing required fields (Phone, Divisonal Office, or Ticket Number)`);
                        }

                        return {
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
                            ticketNumber,
                            uploadedAt: new Date().toISOString()
                        };
                    });

                    if (participants.length === 0) {
                        reject(new Error('No valid participants found in CSV'));
                        return;
                    }

                    // Extract unique SAP codes and store in localStorage
                    const uniqueSAPCodes = [...new Set(
                        participants
                            .map(p => p.sapCode)
                            .filter(code => code && code.length > 0)
                    )];

                    // Get existing SAP codes from localStorage
                    const existingSAPCodes = JSON.parse(localStorage.getItem('SAPCODES') || '[]');

                    // Merge and deduplicate
                    const allUniqueSAPCodes = [...new Set([...existingSAPCodes, ...uniqueSAPCodes])];

                    // Store back to localStorage
                    localStorage.setItem('SAPCODES', JSON.stringify(allUniqueSAPCodes));

                    resolve({
                        success: true,
                        participants,
                        count: participants.length
                    });
                } catch (error) {
                    reject(error);
                }
            },
            error: (error) => {
                reject(new Error(`CSV parsing error: ${error.message}`));
            }
        });
    });
};

/**
 * Parse CSV file in chunks and save directly to IndexedDB
 * Optimized for large files (10k+ rows)
 */
export const parseCSVChunked = (file, onProgress = null, chunkSize = 1000) => {
    return new Promise((resolve, reject) => {
        let allParticipants = [];
        let totalRows = 0;
        let processedRows = 0;
        let addedCount = 0;
        let errorCount = 0;
        const errors = [];
        const sapCodesSet = new Set();

        // First pass: count total rows
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            preview: 0, // Parse all to count
            complete: (countResult) => {
                totalRows = countResult.data.length;

                // Second pass: process in chunks
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    chunk: async (results, parser) => {
                        // Pause parsing while we process this chunk
                        parser.pause();

                        try {
                            const chunk = results.data.map((row, index) => {
                                const fullName = row['Full Name']?.trim() || '';
                                const phone = row['Phone']?.trim();
                                const divisonalOffice = row['Divisonal Office']?.trim();
                                const ticketNumber = row['Ticket Number']?.trim();

                                if (!phone || !divisonalOffice || !ticketNumber) {
                                    errors.push(`Row ${processedRows + index + 1}: Missing required fields`);
                                    return null;
                                }

                                return {
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
                                    ticketNumber,
                                    uploadedAt: new Date().toISOString()
                                };
                            }).filter(p => p !== null);

                            // Collect SAP codes from this chunk
                            chunk.forEach(participant => {
                                if (participant.sapCode && participant.sapCode.length > 0) {
                                    sapCodesSet.add(participant.sapCode);
                                }
                            });

                            // Save chunk to IndexedDB
                            if (chunk.length > 0) {
                                const result = await IDB.batchAddParticipants(chunk);
                                addedCount += result.addedCount;
                                errorCount += result.errorCount;
                                errors.push(...result.errors);
                            }

                            processedRows += results.data.length;

                            // Report progress
                            if (onProgress) {
                                onProgress({
                                    processed: processedRows,
                                    total: totalRows,
                                    added: addedCount,
                                    errors: errorCount,
                                    percentage: Math.round((processedRows / totalRows) * 100)
                                });
                            }

                            // Resume parsing
                            parser.resume();
                        } catch (error) {
                            parser.abort();
                            reject(error);
                        }
                    },
                    complete: () => {
                        // Store all unique SAP codes in localStorage
                        const uniqueSAPCodes = Array.from(sapCodesSet);

                        // Get existing SAP codes from localStorage
                        const existingSAPCodes = JSON.parse(localStorage.getItem('SAPCODES') || '[]');

                        // Merge and deduplicate
                        const allUniqueSAPCodes = [...new Set([...existingSAPCodes, ...uniqueSAPCodes])];

                        // Store back to localStorage
                        localStorage.setItem('SAPCODES', JSON.stringify(allUniqueSAPCodes));

                        resolve({
                            success: true,
                            count: addedCount,
                            total: totalRows,
                            errors: errors.length > 0 ? errors : undefined
                        });
                    },
                    error: (error) => {
                        reject(new Error(`CSV parsing error: ${error.message}`));
                    },
                    chunkSize: chunkSize * 1024 // Convert to bytes (approximate)
                });
            },
            error: (error) => {
                reject(new Error(`Failed to count CSV rows: ${error.message}`));
            }
        });
    });
};

/**
 * Validate CSV file
 */
export const validateCSVFile = (file) => {
    if (!file) {
        return { valid: false, error: 'No file selected' };
    }

    if (!file.name.endsWith('.csv')) {
        return { valid: false, error: 'Please upload a CSV file' };
    }

    return { valid: true };
};

/**
 * Generate sample CSV for download
 */
export const generateSampleCSV = () => {
    const headers = ['Full Name', 'Phone', 'Bill Receipt', 'Vehicle Registration Number', 'Vehicle Type', 'SAP Code', 'Retail Outlet Name', 'RSA', 'Divisonal Office', 'Submission Date & Time', 'Ticket Number'];
    const sampleData = [
        ['Rajesh Kumar', '9876543210', 'BR-12345', 'KA-01-AB-1234', 'Car', 'SAP001', 'Retail Outlet A', 'RSA North', 'Bangalore', '2025-12-01 10:30:00', 'TKT-001'],
        ['Priya Sharma', '9876543211', 'BR-12346', 'KA-02-CD-5678', 'Bike', 'SAP002', 'Retail Outlet B', 'RSA South', 'Mumbai', '2025-12-01 11:00:00', 'TKT-002'],
        ['Amit Patel', '9876543212', '', 'MH-12-EF-9012', 'Car', '', 'Retail Outlet C', 'RSA East', 'Delhi', '', 'TKT-003'],
        ['Sneha Reddy', '9876543213', 'BR-12348', '', '', 'SAP004', '', 'RSA West', 'Chennai', '2025-12-01 12:30:00', 'TKT-004'],
        ['Vikram Singh', '9876543214', 'BR-12349', 'DL-05-KL-3456', 'Truck', 'SAP005', 'Retail Outlet E', '', 'Hyderabad', '2025-12-01 13:00:00', 'TKT-005']
    ];

    const csvContent = [
        headers.join(','),
        ...sampleData.map(row => row.join(','))
    ].join('\n');

    return csvContent;
};

/**
 * Download sample CSV
 */
export const downloadSampleCSV = () => {
    const csvContent = generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fillnwin_sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
