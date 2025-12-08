import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { validateCSVFile, downloadSampleCSV, parseCSVChunked } from '../utils/csvParser';
import { getParticipants, clearParticipants, clearDrawHistory } from '../utils/storage';

const Upload = () => {
    const [participants, setParticipants] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(null);
    const fileInputRef = useRef(null);

    // Load participants on mount
    useEffect(() => {
        const loadParticipants = async () => {
            const data = await getParticipants();
            setParticipants(data);
        };
        loadParticipants();
    }, []);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file) => {
        setMessage(null);
        setUploadProgress(null);

        const validation = validateCSVFile(file);
        if (!validation.valid) {
            setMessage({ type: 'error', text: validation.error });
            return;
        }

        setUploading(true);

        try {
            // Use chunked parsing for large files
            const result = await parseCSVChunked(
                file,
                (progress) => {
                    // Update progress
                    setUploadProgress({
                        processed: progress.processed,
                        total: progress.total,
                        percentage: progress.percentage,
                        added: progress.added,
                        errors: progress.errors
                    });
                },
                1000 // Chunk size: 1000 rows at a time
            );

            // Reload participants
            const updatedParticipants = await getParticipants();
            setParticipants(updatedParticipants);

            setMessage({
                type: 'success',
                text: `✅ Successfully uploaded ${result.count} participants${result.errors ? ` (${result.errors.length} errors)` : ''}`
            });

            // Show errors if any
            if (result.errors && result.errors.length > 0) {
                console.warn('Upload errors:', result.errors);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setUploading(false);
            setUploadProgress(null);
        }
    };

    const handleClearAll = async () => {
        if (window.confirm('Are you sure you want to clear ALL data (participants AND draw history)? This cannot be undone.')) {
            try {
                console.log('Clearing all data...');

                // Clear both participants and draw history
                const participantsResult = await clearParticipants();
                console.log('Participants cleared:', participantsResult);

                const drawHistoryResult = await clearDrawHistory();
                console.log('Draw history cleared:', drawHistoryResult);

                // Update UI
                setParticipants([]);

                // Check if both operations succeeded
                if (participantsResult?.success && drawHistoryResult?.success) {
                    setMessage({ type: 'success', text: 'All participants and draw history cleared successfully' });
                } else {
                    setMessage({ type: 'error', text: 'Some data may not have been cleared. Check console for details.' });
                }
            } catch (error) {
                console.error('Error clearing data:', error);
                setMessage({ type: 'error', text: `Failed to clear data: ${error.message}` });
            }
        }
    };

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
            <Navbar />

            <div className="container" style={{ marginTop: '2rem' }}>
                <div className="text-center" style={{ marginBottom: '2rem' }}>
                    <h1 style={{ color: 'var(--text-primary)' }}>📤 Upload Participants</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                        Upload CSV file with participant data (stored locally in browser)
                    </p>
                </div>

                {message && (
                    <div className={`alert alert-${message.type} fade-in`} style={{ whiteSpace: 'pre-line' }}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-2" style={{ alignItems: 'start' }}>
                    {/* Upload Section */}
                    <div className="festive-card">
                        <h3 style={{ marginBottom: '1.5rem' }}>Upload CSV File</h3>

                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: `2px dashed ${dragActive ? 'var(--festive-gold)' : 'rgba(255, 255, 255, 0.2)'}`,
                                borderRadius: 'var(--radius-lg)',
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                cursor: uploading ? 'not-allowed' : 'pointer',
                                background: dragActive ? 'rgba(255, 215, 0, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                                transition: 'all var(--transition-base)',
                                marginBottom: '1.5rem',
                                opacity: uploading ? 0.6 : 1
                            }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                                {uploading ? '⏳' : '📁'}
                            </div>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                {uploading ? 'Processing...' : dragActive ? 'Drop CSV file here' : 'Drag & drop CSV file here'}
                            </p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                or click to browse
                            </p>

                            {/* Progress Bar */}
                            {uploadProgress && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '10px',
                                        height: '8px',
                                        overflow: 'hidden',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <div style={{
                                            background: 'linear-gradient(90deg, var(--festive-gold), var(--crimson-red))',
                                            height: '100%',
                                            width: `${uploadProgress.percentage}%`,
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {uploadProgress.processed.toLocaleString()} / {uploadProgress.total.toLocaleString()} rows
                                        ({uploadProgress.percentage}%)
                                        {uploadProgress.added > 0 && ` • ${uploadProgress.added.toLocaleString()} added`}
                                        {uploadProgress.errors > 0 && ` • ${uploadProgress.errors} errors`}
                                    </p>
                                </div>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileInput}
                            disabled={uploading}
                            style={{ display: 'none' }}
                        />

                        <button
                            onClick={downloadSampleCSV}
                            className="btn btn-outline"
                            disabled={uploading}
                            style={{ width: '100%', marginBottom: '1rem' }}
                        >
                            📥 Download Sample CSV
                        </button>

                        <div style={{
                            background: 'rgba(255, 215, 0, 0.1)',
                            border: '1px solid rgba(255, 215, 0, 0.2)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '1rem',
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)'
                        }}>
                            <strong style={{ color: 'var(--festive-gold)' }}>CSV Format:</strong><br />
                            <strong>Required columns:</strong> Phone, Divisonal Office, Ticket Number<br />
                            <strong>Optional columns:</strong> Full Name, Bill Receipt, Vehicle Registration Number, Vehicle Type, SAP Code, Retail Outlet Name, RSA, Submission Date & Time<br />
                            <br />
                            <strong style={{ color: 'var(--festive-gold)' }}>📍 Note:</strong> Data is stored locally in your browser using IndexedDB
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '1rem' }}>Statistics</h3>

                        <div style={{
                            display: 'grid',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                background: 'rgba(255, 215, 0, 0.1)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-sm)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--festive-gold)' }}>
                                    {participants.length}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    Total Participants
                                </div>
                            </div>
                        </div>

                        {participants.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="btn btn-primary"
                                disabled={uploading}
                                style={{ width: '100%' }}
                            >
                                🗑️ Clear All Data
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Upload;
