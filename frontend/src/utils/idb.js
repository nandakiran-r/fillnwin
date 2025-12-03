/**
 * IndexedDB wrapper for FillNWin application
 * Stores participants and draw history locally in the browser
 */

const DB_NAME = 'fillnwin_db';
const DB_VERSION = 1;

// Store names
const STORES = {
    PARTICIPANTS: 'participants',
    DRAW_HISTORY: 'draw_history'
};

/**
 * Initialize IndexedDB database and create object stores
 */
const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(new Error('Failed to open IndexedDB'));
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create participants store
            if (!db.objectStoreNames.contains(STORES.PARTICIPANTS)) {
                const participantStore = db.createObjectStore(STORES.PARTICIPANTS, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                participantStore.createIndex('ticketNumber', 'ticketNumber', { unique: true });
                participantStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
            }

            // Create draw history store
            if (!db.objectStoreNames.contains(STORES.DRAW_HISTORY)) {
                const drawHistoryStore = db.createObjectStore(STORES.DRAW_HISTORY, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                drawHistoryStore.createIndex('drawTimestamp', 'timestamp', { unique: false });
                drawHistoryStore.createIndex('participantId', 'winner.id', { unique: false });
            }
        };
    });
};

/**
 * Get a transaction for the specified store
 */
const getTransaction = async (storeName, mode = 'readonly') => {
    const db = await initDB();
    return db.transaction(storeName, mode);
};

/**
 * Get all participants
 */
export const getAllParticipants = async () => {
    const db = await initDB();
    const transaction = db.transaction(STORES.PARTICIPANTS, 'readonly');
    const store = transaction.objectStore(STORES.PARTICIPANTS);

    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(new Error('Failed to get participants'));
        };
    });
};

/**
 * Add a single participant
 */
export const addParticipant = async (participant) => {
    const db = await initDB();
    const transaction = db.transaction(STORES.PARTICIPANTS, 'readwrite');
    const store = transaction.objectStore(STORES.PARTICIPANTS);

    const participantData = {
        ...participant,
        uploadedAt: participant.uploadedAt || new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
        const request = store.add(participantData);

        request.onsuccess = () => {
            resolve(request.result); // Returns the generated ID
        };

        request.onerror = () => {
            // Check for duplicate ticket number
            if (request.error.name === 'ConstraintError') {
                reject(new Error(`Duplicate ticket number: ${participant.ticketNumber}`));
            } else {
                reject(new Error('Failed to add participant'));
            }
        };
    });
};

/**
 * Batch insert participants (for CSV uploads)
 */
export const batchAddParticipants = async (participants, onProgress = null) => {
    const db = await initDB();
    const transaction = db.transaction(STORES.PARTICIPANTS, 'readwrite');
    const store = transaction.objectStore(STORES.PARTICIPANTS);

    let addedCount = 0;
    let errorCount = 0;
    const errors = [];

    return new Promise((resolve, reject) => {
        const addNext = (index) => {
            if (index >= participants.length) {
                // All done
                resolve({ addedCount, errorCount, errors });
                return;
            }

            const participant = {
                ...participants[index],
                uploadedAt: participants[index].uploadedAt || new Date().toISOString()
            };

            const request = store.add(participant);

            request.onsuccess = () => {
                addedCount++;
                if (onProgress) {
                    onProgress({
                        processed: index + 1,
                        total: participants.length,
                        added: addedCount,
                        errors: errorCount
                    });
                }
                addNext(index + 1);
            };

            request.onerror = () => {
                errorCount++;
                if (request.error.name === 'ConstraintError') {
                    errors.push(`Duplicate ticket: ${participant.ticketNumber}`);
                } else {
                    errors.push(`Row ${index + 1}: ${request.error.message}`);
                }
                if (onProgress) {
                    onProgress({
                        processed: index + 1,
                        total: participants.length,
                        added: addedCount,
                        errors: errorCount
                    });
                }
                addNext(index + 1);
            };
        };

        addNext(0);
    });
};

/**
 * Update a participant (e.g., mark as drawn)
 */
export const updateParticipant = async (id, updates) => {
    const db = await initDB();
    const transaction = db.transaction(STORES.PARTICIPANTS, 'readwrite');
    const store = transaction.objectStore(STORES.PARTICIPANTS);

    return new Promise((resolve, reject) => {
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const participant = getRequest.result;
            if (!participant) {
                reject(new Error('Participant not found'));
                return;
            }

            const updatedParticipant = { ...participant, ...updates };
            const putRequest = store.put(updatedParticipant);

            putRequest.onsuccess = () => {
                resolve(updatedParticipant);
            };

            putRequest.onerror = () => {
                reject(new Error('Failed to update participant'));
            };
        };

        getRequest.onerror = () => {
            reject(new Error('Failed to get participant'));
        };
    });
};

/**
 * Delete a participant by ID
 */
export const deleteParticipant = async (id) => {
    const db = await initDB();
    const transaction = db.transaction(STORES.PARTICIPANTS, 'readwrite');
    const store = transaction.objectStore(STORES.PARTICIPANTS);

    return new Promise((resolve, reject) => {
        const request = store.delete(id);

        request.onsuccess = () => {
            resolve({ success: true });
        };

        request.onerror = () => {
            reject(new Error('Failed to delete participant'));
        };
    });
};

/**
 * Clear all participants
 */
export const clearAllParticipants = async () => {
    const db = await initDB();
    const transaction = db.transaction(STORES.PARTICIPANTS, 'readwrite');
    const store = transaction.objectStore(STORES.PARTICIPANTS);

    return new Promise((resolve, reject) => {
        const request = store.clear();

        request.onsuccess = () => {
            resolve({ success: true });
        };

        request.onerror = () => {
            reject(new Error('Failed to clear participants'));
        };
    });
};

/**
 * Get all draw history entries
 */
export const getAllDrawHistory = async () => {
    const db = await initDB();
    const transaction = db.transaction(STORES.DRAW_HISTORY, 'readonly');
    const store = transaction.objectStore(STORES.DRAW_HISTORY);

    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
            // Sort by timestamp descending (newest first)
            const history = request.result.sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
            );
            resolve(history);
        };

        request.onerror = () => {
            reject(new Error('Failed to get draw history'));
        };
    });
};

/**
 * Add entry to draw history
 */
export const addToDrawHistory = async (winner) => {
    const db = await initDB();
    const transaction = db.transaction(STORES.DRAW_HISTORY, 'readwrite');
    const store = transaction.objectStore(STORES.DRAW_HISTORY);

    const now = new Date();
    const entry = {
        winner,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        timestamp: now.toISOString()
    };

    return new Promise((resolve, reject) => {
        const request = store.add(entry);

        request.onsuccess = () => {
            resolve({ ...entry, id: request.result });
        };

        request.onerror = () => {
            reject(new Error('Failed to add to draw history'));
        };
    });
};

/**
 * Clear all draw history
 */
export const clearAllDrawHistory = async () => {
    const db = await initDB();
    const transaction = db.transaction(STORES.DRAW_HISTORY, 'readwrite');
    const store = transaction.objectStore(STORES.DRAW_HISTORY);

    return new Promise((resolve, reject) => {
        const request = store.clear();

        request.onsuccess = () => {
            resolve({ success: true });
        };

        request.onerror = () => {
            reject(new Error('Failed to clear draw history'));
        };
    });
};

/**
 * Get statistics
 */
export const getStats = async () => {
    const db = await initDB();
    const participantTransaction = db.transaction(STORES.PARTICIPANTS, 'readonly');
    const historyTransaction = db.transaction(STORES.DRAW_HISTORY, 'readonly');

    const participantStore = participantTransaction.objectStore(STORES.PARTICIPANTS);
    const historyStore = historyTransaction.objectStore(STORES.DRAW_HISTORY);

    return new Promise((resolve, reject) => {
        const participantRequest = participantStore.getAll();
        const historyRequest = historyStore.getAll();

        let participants = [];
        let history = [];

        participantRequest.onsuccess = () => {
            participants = participantRequest.result;
            checkComplete();
        };

        historyRequest.onsuccess = () => {
            history = historyRequest.result;
            checkComplete();
        };

        participantRequest.onerror = historyRequest.onerror = () => {
            reject(new Error('Failed to get statistics'));
        };

        const checkComplete = () => {
            if (participants.length !== undefined && history.length !== undefined) {
                const totalParticipants = participants.length + history.length; // Total ever uploaded
                const remainingParticipants = participants.length; // Current participants pool
                const totalDraws = history.length;

                resolve({
                    totalParticipants,
                    remainingParticipants,
                    totalDraws
                });
            }
        };
    });
};

export default {
    getAllParticipants,
    addParticipant,
    batchAddParticipants,
    updateParticipant,
    deleteParticipant,
    clearAllParticipants,
    getAllDrawHistory,
    addToDrawHistory,
    clearAllDrawHistory,
    getStats
};
