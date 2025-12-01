import Papa from 'papaparse';

/**
 * Parse CSV file and extract participant data
 * Expected columns: name, phone, email, coupon_code
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
                        if (!row.name || !row.phone || !row.coupon_code) {
                            throw new Error(`Row ${index + 1} is missing required fields`);
                        }

                        return {
                            id: `${Date.now()}_${index}`,
                            name: row.name.trim(),
                            phone: row.phone.trim(),
                            email: row.email ? row.email.trim() : '',
                            couponCode: row.coupon_code.trim(),
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
    const headers = ['name', 'phone', 'email', 'coupon_code'];
    const sampleData = [
        ['Rajesh Kumar', '9876543210', 'rajesh@example.com', 'XMAS2025-001'],
        ['Priya Sharma', '9876543211', 'priya@example.com', 'XMAS2025-002'],
        ['Amit Patel', '9876543212', 'amit@example.com', 'XMAS2025-003'],
        ['Sneha Reddy', '9876543213', 'sneha@example.com', 'XMAS2025-004'],
        ['Vikram Singh', '9876543214', 'vikram@example.com', 'XMAS2025-005']
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
