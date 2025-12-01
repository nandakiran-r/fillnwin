import Papa from 'papaparse';

/**
 * Parse CSV file and extract participant data
 * Expected columns: Full Name, Phone, Bill Receipt, Vehicle Registration Number, 
 * Vehicle Type, SAP Code, Retail Outlet Name, RSA, Divisonal Office, 
 * Submission Date & Time, Ticket Number
 * 
 * Required fields: Full Name, Phone, Divisonal Office, Ticket Number
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
                        const fullName = row['Full Name']?.trim();
                        const phone = row['Phone']?.trim();
                        const divisonalOffice = row['Divisonal Office']?.trim();
                        const ticketNumber = row['Ticket Number']?.trim();

                        if (!fullName || !phone || !divisonalOffice || !ticketNumber) {
                            throw new Error(`Row ${index + 1} is missing required fields (Full Name, Phone, Divisonal Office, or Ticket Number)`);
                        }

                        return {
                            id: `${Date.now()}_${index}`,
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
 * Validate CSV file
 */
export const validateCSVFile = (file) => {
    if (!file) {
        return { valid: false, error: 'No file selected' };
    }

    if (!file.name.endsWith('.csv')) {
        return { valid: false, error: 'Please upload a CSV file' };
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return { valid: false, error: 'File size must be less than 5MB' };
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
