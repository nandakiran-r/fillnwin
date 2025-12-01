// API utilities for FillNWin backend integration

const API_BASE_URL = 'http://localhost:5000/api';

// Participants Management
export const saveParticipants = async (participants) => {
    // This is handled by the CSV upload endpoint
    console.warn('saveParticipants is deprecated, use uploadCSV instead');
    return { success: true };
};

export const getParticipants = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/participants`);
        if (!response.ok) {
            throw new Error('Failed to fetch participants');
        }
        const data = await response.json();

        // Transform snake_case to camelCase for frontend compatibility
        return data.map(p => ({
            id: p.id,
            fullName: p.full_name,
            phone: p.phone,
            billReceipt: p.bill_receipt,
            vehicleRegistrationNumber: p.vehicle_registration_number,
            vehicleType: p.vehicle_type,
            sapCode: p.sap_code,
            retailOutletName: p.retail_outlet_name,
            rsa: p.rsa,
            divisonalOffice: p.divisonal_office,
            submissionDateTime: p.submission_date_time,
            ticketNumber: p.ticket_number,
            uploadedAt: p.uploaded_at
        }));
    } catch (error) {
        console.error('Error retrieving participants:', error);
        return [];
    }
};

export const clearParticipants = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/participants`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        console.error('Error clearing participants:', error);
        return { success: false, error: error.message };
    }
};

// Draw History Management
export const saveDrawHistory = async (history) => {
    // This is deprecated, use addDrawToHistory instead
    console.warn('saveDrawHistory is deprecated');
    return { success: true };
};

export const getDrawHistory = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/draws`);
        if (!response.ok) {
            throw new Error('Failed to fetch draw history');
        }
        return await response.json();
    } catch (error) {
        console.error('Error retrieving draw history:', error);
        return [];
    }
};

export const addDrawToHistory = async (winner) => {
    try {
        const response = await fetch(`${API_BASE_URL}/draws`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ winner })
        });

        if (!response.ok) {
            throw new Error('Failed to add winner to history');
        }

        const data = await response.json();
        return data.entry;
    } catch (error) {
        console.error('Error adding draw to history:', error);
        throw error;
    }
};

export const clearDrawHistory = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/draws`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        console.error('Error clearing draw history:', error);
        return { success: false, error: error.message };
    }
};

// Remove participant after they've been selected
export const removeParticipant = async (participantId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/participants/${participantId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to remove participant');
        }

        // Return updated list of participants
        return await getParticipants();
    } catch (error) {
        console.error('Error removing participant:', error);
        return [];
    }
};

// Get statistics
export const getStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) {
            throw new Error('Failed to fetch statistics');
        }
        return await response.json();
    } catch (error) {
        console.error('Error retrieving stats:', error);
        return {
            totalParticipants: 0,
            totalDraws: 0,
            remainingParticipants: 0
        };
    }
};

