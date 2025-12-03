// API utilities for FillNWin - IndexedDB storage with backend auth only
import * as IDB from './idb.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ============================================
// PARTICIPANTS MANAGEMENT (IndexedDB)
// ============================================

export const saveParticipants = async (participants) => {
    try {
        const result = await IDB.batchAddParticipants(participants);
        return {
            success: true,
            count: result.addedCount,
            errors: result.errors
        };
    } catch (error) {
        console.error('Error saving participants:', error);
        return { success: false, error: error.message };
    }
};

export const getParticipants = async () => {
    try {
        const participants = await IDB.getAllParticipants(true); // Only non-drawn
        return participants;
    } catch (error) {
        console.error('Error retrieving participants:', error);
        return [];
    }
};

export const clearParticipants = async () => {
    try {
        await IDB.clearAllParticipants();
        return { success: true, message: 'All participants cleared' };
    } catch (error) {
        console.error('Error clearing participants:', error);
        return { success: false, error: error.message };
    }
};

export const removeParticipant = async (participantId) => {
    try {
        // Mark participant as drawn instead of deleting
        await IDB.updateParticipant(participantId, { isDrawn: true });

        // Return updated list of participants
        return await getParticipants();
    } catch (error) {
        console.error('Error removing participant:', error);
        return [];
    }
};

// ============================================
// DRAW HISTORY MANAGEMENT (IndexedDB)
// ============================================

export const saveDrawHistory = async (history) => {
    console.warn('saveDrawHistory is deprecated');
    return { success: true };
};

export const getDrawHistory = async () => {
    try {
        const history = await IDB.getAllDrawHistory();
        return history;
    } catch (error) {
        console.error('Error retrieving draw history:', error);
        return [];
    }
};

export const addDrawToHistory = async (winner) => {
    try {
        const entry = await IDB.addToDrawHistory(winner);
        return entry;
    } catch (error) {
        console.error('Error adding draw to history:', error);
        throw error;
    }
};

export const clearDrawHistory = async () => {
    try {
        await IDB.clearAllDrawHistory();
        return { success: true, message: 'All draw history cleared' };
    } catch (error) {
        console.error('Error clearing draw history:', error);
        return { success: false, error: error.message };
    }
};

// ============================================
// STATISTICS (IndexedDB)
// ============================================

export const getStats = async () => {
    try {
        const stats = await IDB.getStats();
        return stats;
    } catch (error) {
        console.error('Error retrieving stats:', error);
        return {
            totalParticipants: 0,
            totalDraws: 0,
            remainingParticipants: 0
        };
    }
};

// ============================================
// CSV EXPORT (Client-side, from IndexedDB)
// ============================================

export const exportWinnersCSV = async () => {
    try {
        const history = await IDB.getAllDrawHistory();

        if (history.length === 0) {
            throw new Error('No winners to export');
        }

        // CSV headers
        const headers = [
            'Full Name', 'Phone', 'Bill Receipt', 'Vehicle Registration Number',
            'Vehicle Type', 'SAP Code', 'Retail Outlet Name', 'RSA',
            'Divisonal Office', 'Submission Date & Time', 'Ticket Number',
            'Draw Date', 'Draw Time', 'Prize Rank'
        ];

        // CSV rows
        const rows = history.map(entry => [
            entry.winner.fullName,
            entry.winner.phone,
            entry.winner.billReceipt || '',
            entry.winner.vehicleRegistrationNumber || '',
            entry.winner.vehicleType || '',
            entry.winner.sapCode || '',
            entry.winner.retailOutletName || '',
            entry.winner.rsa || '',
            entry.winner.divisonalOffice,
            entry.winner.submissionDateTime || '',
            entry.winner.ticketNumber,
            entry.date,
            entry.time,
            entry.winner.prizeRank || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fillnwin_winners_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('Export error:', error);
        throw error;
    }
};
