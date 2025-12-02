import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LuckyDrawWheel from '../components/LuckyDrawWheel';
import { getParticipants, removeParticipant, getDrawHistory, addDrawToHistory, getStats } from '../utils/storage';

const Dashboard = () => {
    const [participants, setParticipants] = useState([]);
    const [drawHistory, setDrawHistory] = useState([]);
    const [stats, setStats] = useState({ totalParticipants: 0, totalDraws: 0, remainingParticipants: 0 });
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [currentWinner, setCurrentWinner] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const p = await getParticipants();
        const h = await getDrawHistory();
        const s = await getStats();

        setParticipants(p);
        setDrawHistory(h);
        setStats(s);
    };

    const handleWinnerSelected = async (winner) => {
        // Add to history
        await addDrawToHistory(winner);

        // Remove from participants
        await removeParticipant(winner.id);

        // Update state
        setCurrentWinner(winner);
        setShowWinnerModal(true);

        // Reload data
        setTimeout(async () => {
            await loadData();
        }, 500);
    };

    const closeModal = () => {
        setShowWinnerModal(false);
        setCurrentWinner(null);
    };

    const exportWinners = async () => {
        if (drawHistory.length === 0) {
            alert('No winners to export');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/draws/export`);
            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `fillnwin_winners_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export winners');
        }
    };

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
            <Navbar />

            <div className="container" style={{ marginTop: '2rem' }}>
                <div className="text-center" style={{ marginBottom: '2rem' }}>
                    <img
                        src="/indian-oil-logo.png"
                        alt="Indian Oil Logo"
                        style={{
                            height: '80px',
                            marginBottom: '1rem',
                            filter: 'drop-shadow(0 2px 8px rgba(255, 215, 0, 0.3))'
                        }}
                    />
                    <h1>🎄 FillNWin Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                        Christmas New Year Bonanza Lucky Draw
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
                    <div className="glass-card text-center">
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--festive-gold)' }}>
                            {stats.totalParticipants}
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>Total Uploaded</div>
                    </div>

                    <div className="glass-card text-center">
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎁</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--crimson-red)' }}>
                            {stats.totalDraws}
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>Draws Conducted</div>
                    </div>

                    <div className="glass-card text-center">
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--forest-green)' }}>
                            {stats.remainingParticipants}
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>Remaining</div>
                    </div>
                </div>

                {/* Lucky Draw Section */}
                {participants.length > 0 ? (
                    <LuckyDrawWheel
                        participants={participants}
                        onWinnerSelected={handleWinnerSelected}
                    />
                ) : (
                    <div className="festive-card text-center" style={{ padding: '3rem 2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <h2 style={{ marginBottom: '1rem' }}>No Participants Available</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Please upload a CSV file with participant data to start the lucky draw
                        </p>
                        <a href="/upload" className="btn btn-gold">
                            📤 Upload Participants
                        </a>
                    </div>
                )}

                {/* Draw History */}
                {drawHistory.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                        <div className="flex-between" style={{ marginBottom: '1rem' }}>
                            <h2>🏆 Draw History ({drawHistory.length})</h2>
                            <button onClick={exportWinners} className="btn btn-outline">
                                📥 Export Winners
                            </button>
                        </div>

                        <div className="grid grid-2">
                            {drawHistory.slice(0, 10).map((entry) => (
                                <div key={entry.id} className="glass-card fade-in">
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'start',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', color: 'var(--festive-gold)', marginBottom: '0.25rem' }}>
                                                🏆 {entry.winner.fullName}
                                            </h4>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                                                📞 {entry.winner.phone}
                                            </p>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                                                🏢 {entry.winner.divisonalOffice}
                                            </p>
                                        </div>
                                        <div className="badge badge-gold">
                                            {entry.winner.ticketNumber}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--text-muted)',
                                        marginTop: '0.5rem',
                                        paddingTop: '0.5rem',
                                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}>
                                        📅 {entry.date} • ⏰ {entry.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Winner Modal */}
            {showWinnerModal && currentWinner && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎊</div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                                Congratulations!
                            </h2>
                            <div style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, var(--festive-gold), var(--crimson-red))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                marginBottom: '1rem'
                            }}>
                                {currentWinner.fullName}
                            </div>
                            <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                📞 {currentWinner.phone}
                            </div>
                            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                🏢 {currentWinner.divisonalOffice}
                            </div>
                            <div className="badge badge-gold" style={{ fontSize: '1.2rem', padding: '0.5rem 1.5rem' }}>
                                {currentWinner.ticketNumber}
                            </div>

                            <button
                                onClick={closeModal}
                                className="btn btn-gold"
                                style={{ marginTop: '2rem', width: '100%' }}
                            >
                                ✅ Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
