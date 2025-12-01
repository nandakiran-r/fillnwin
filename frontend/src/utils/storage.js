// LocalStorage management utilities for FillNWin

const PARTICIPANTS_KEY = 'fillnwin_participants';
const DRAW_HISTORY_KEY = 'fillnwin_draw_history';

// Participants Management
export const saveParticipants = (participants) => {
    try {
        localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(participants));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getParticipants = () => {
    try {
        const data = localStorage.getItem(PARTICIPANTS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error retrieving participants:', error);
        return [];
    }
};

export const clearParticipants = () => {
    localStorage.removeItem(PARTICIPANTS_KEY);
};

// Draw History Management
export const saveDrawHistory = (history) => {
    try {
        localStorage.setItem(DRAW_HISTORY_KEY, JSON.stringify(history));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getDrawHistory = () => {
    try {
        const data = localStorage.getItem(DRAW_HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error retrieving draw history:', error);
        return [];
    }
};

export const addDrawToHistory = (winner) => {
    const history = getDrawHistory();
    const newEntry = {
        id: Date.now(),
        winner,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };
    history.unshift(newEntry);
    saveDrawHistory(history);
    return newEntry;
};

export const clearDrawHistory = () => {
    localStorage.removeItem(DRAW_HISTORY_KEY);
};

// Remove participant after they've been selected
export const removeParticipant = (participantId) => {
    const participants = getParticipants();
    const updated = participants.filter(p => p.id !== participantId);
    saveParticipants(updated);
    return updated;
};

// Get statistics
export const getStats = () => {
    const participants = getParticipants();
    const history = getDrawHistory();

    return {
        totalParticipants: participants.length,
        totalDraws: history.length,
        remainingParticipants: participants.length
    };
};
