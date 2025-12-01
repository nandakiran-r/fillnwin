import { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import { parseCSV, validateCSVFile, downloadSampleCSV } from '../utils/csvParser';
import { saveParticipants, getParticipants, clearParticipants } from '../utils/storage';
import ParticipantCard from '../components/ParticipantCard';

const Upload = () => {
    const [participants, setParticipants] = useState(getParticipants());
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const fileInputRef = useRef(null);

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

        const validation = validateCSVFile(file);
        if (!validation.valid) {
            setMessage({ type: 'error', text: validation.error });
            return;
        }

        setUploading(true);

        try {
            const result = await parseCSV(file);

            if (result.success) {
                // Save to localStorage
                saveParticipants(result.participants);
                setParticipants(result.participants);

                setMessage({
                    type: 'success',
                    text: `✅ Successfully uploaded ${result.count} participants!`
                });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setUploading(false);
        }
    };

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all participants? This cannot be undone.')) {
            clearParticipants();
            setParticipants([]);
            setMessage({ type: 'info', text: 'All participants cleared' });
        }
    };

    const handleRemoveParticipant = (id) => {
        const updated = participants.filter(p => p.id !== id);
        saveParticipants(updated);
        setParticipants(updated);
        setMessage({ type: 'info', text: 'Participant removed' });
    };

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
            <Navbar />

            <div className="container" style={{ marginTop: '2rem' }}>
                <div className="text-center" style={{ marginBottom: '2rem' }}>
                    <h1>📤 Upload Participants</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                        Upload CSV file with participant data
                    </p>
                </div>

                {message && (
                    <div className={`alert alert-${message.type} fade-in`}>
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
                                cursor: 'pointer',
                                background: dragActive ? 'rgba(255, 215, 0, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                                transition: 'all var(--transition-base)',
                                marginBottom: '1.5rem'
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
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileInput}
                            style={{ display: 'none' }}
                        />

                        <button
                            onClick={downloadSampleCSV}
                            className="btn btn-outline"
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
                            <strong>Required columns:</strong> Full Name, Phone, Divisonal Office, Ticket Number<br />
                            <strong>Optional columns:</strong> Bill Receipt, Vehicle Registration Number, Vehicle Type, SAP Code, Retail Outlet Name, RSA, Submission Date & Time<br />
                            Maximum file size: 5MB
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
                                style={{ width: '100%' }}
                            >
                                🗑️ Clear All Data
                            </button>
                        )}
                    </div>
                </div>

                {/* Participants List */}
                {participants.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Uploaded Participants ({participants.length})</h2>

                        <div className="grid grid-2">
                            {participants.map((participant) => (
                                <ParticipantCard
                                    key={participant.id}
                                    participant={participant}
                                    showActions
                                    onRemove={handleRemoveParticipant}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Upload;
