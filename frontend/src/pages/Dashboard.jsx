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
        await addDrawToHistory(winner);
        await removeParticipant(winner.id);
        setCurrentWinner(winner);
        setShowWinnerModal(true);

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
            const { exportWinnersCSV } = await import('../utils/storage');
            await exportWinnersCSV();
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export winners');
        }
    };

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
            <Navbar />

            <div className="container" style={{ marginTop: '2rem' }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '2.5rem'
                }}>
                    <img
                        src="/indian-oil-logo.png"
                        alt="Indian Oil Logo"
                        style={{
                            height: '70px',
                            marginBottom: '1rem',
                            filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.2))'
                        }}
                    />
                    <h1 style={{
                        fontSize: '2.2rem',
                        color: '#fff',
                        margin: '0.5rem 0'
                    }}>
                        Mega Draw Dashboard
                    </h1>
                </div>

                {/* Statistics Cards */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{
                        background: 'rgba(107, 141, 255, 0.12)',
                        border: '1px solid rgba(107, 141, 255, 0.35)',
                        borderRadius: '12px',
                        padding: '2rem',
                        textAlign: 'center',
                        maxWidth: '300px',
                        margin: '0 auto'
                    }}>
                        <div style={{ fontSize: '2.5rem', color: '#a5baff', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {stats.totalParticipants}
                        </div>
                        <div style={{ color: '#e0e7ff', fontSize: '1rem', fontWeight: '500' }}>
                            Ready to Draw
                        </div>
                    </div>
                </div>

                {/* Lucky Draw Section */}
                {participants.length > 0 ? (
                    <div style={{ marginBottom: '2.5rem' }}>
                        <LuckyDrawWheel
                            participants={participants}
                            onWinnerSelected={handleWinnerSelected}
                        />
                    </div>
                ) : (
                    <div style={{
                        background: 'rgba(107, 141, 255, 0.1)',
                        border: '2px dashed rgba(107, 141, 255, 0.4)',
                        borderRadius: '12px',
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        marginBottom: '2.5rem'
                    }}>
                        <h2 style={{ color: '#e0e7ff', marginBottom: '1rem', fontSize: '1.5rem' }}>
                            No Participants Available
                        </h2>
                        <p style={{ color: '#b4b8e0', marginBottom: '1.5rem' }}>
                            Upload CSV file with participant data to start the Mega Draw
                        </p>
                        <a href="/upload" className="btn btn-gold">
                            Upload Participants
                        </a>
                    </div>
                )}

                {/* Draw History */}
                {drawHistory.length > 0 && (
                    <div style={{ marginTop: '2.5rem' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <h2 style={{ color: '#e0e7ff', fontSize: '1.5rem', margin: 0 }}>
                                Winners List ({drawHistory.length})
                            </h2>
                            <button
                                onClick={exportWinners}
                                className="btn btn-gold"
                            >
                                Export Winners
                            </button>
                        </div>

                        <div className="grid grid-2" style={{ gap: '1rem' }}>
                            {drawHistory.slice(0, 10).map((entry, index) => (
                                <div
                                    key={entry.id}
                                    style={{
                                        background: 'rgba(107, 141, 255, 0.1)',
                                        border: '1px solid rgba(107, 141, 255, 0.25)',
                                        borderRadius: '10px',
                                        padding: '1.25rem'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'start',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <div>
                                            <h4 style={{
                                                fontSize: '1.05rem',
                                                color: '#e0e7ff',
                                                margin: '0 0 0.5rem 0'
                                            }}>
                                                {entry.winner.fullName}
                                            </h4>
                                            <p style={{
                                                fontSize: '0.9rem',
                                                color: '#b4b8e0',
                                                margin: '0.25rem 0'
                                            }}>
                                                {entry.winner.phone}
                                            </p>
                                            <p style={{
                                                fontSize: '0.9rem',
                                                color: '#b4b8e0',
                                                margin: '0.25rem 0'
                                            }}>
                                                {entry.winner.divisonalOffice}
                                            </p>
                                        </div>
                                        <span style={{
                                            background: 'rgba(107, 141, 255, 0.3)',
                                            color: '#a5baff',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}>
                                            #{index + 1}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: '#8b90b8',
                                        paddingTop: '0.75rem',
                                        borderTop: '1px solid rgba(107, 141, 255, 0.15)'
                                    }}>
                                        {entry.date} • {entry.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Winner Modal */}
            {showWinnerModal && currentWinner && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(5px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}
                    onClick={closeModal}
                >
                    <div
                        style={{
                            background: 'rgba(30, 58, 138, 0.95)',
                            border: '2px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '16px',
                            padding: '2rem',
                            maxWidth: '500px',
                            width: '90%',
                            textAlign: 'center',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{
                            fontSize: '1.8rem',
                            color: '#e0e7ff',
                            marginBottom: '1rem'
                        }}>
                            Congratulations!
                        </h2>

                        <div style={{
                            fontSize: '1.8rem',
                            color: '#a5baff',
                            fontWeight: 'bold',
                            marginBottom: '1.5rem'
                        }}>
                            {currentWinner.fullName}
                        </div>

                        <div style={{
                            background: 'rgba(107, 141, 255, 0.1)',
                            border: '1px solid rgba(107, 141, 255, 0.25)',
                            borderRadius: '10px',
                            padding: '1.25rem',
                            marginBottom: '1.5rem',
                            textAlign: 'left'
                        }}>
                            <div style={{ color: '#b4b8e0', marginBottom: '0.5rem' }}>
                                {currentWinner.phone}
                            </div>
                            <div style={{ color: '#b4b8e0' }}>
                                {currentWinner.divisonalOffice}
                            </div>
                            <div style={{
                                color: '#a5baff',
                                fontWeight: '600',
                                marginTop: '0.75rem',
                                paddingTop: '0.75rem',
                                borderTop: '1px solid rgba(107, 141, 255, 0.2)'
                            }}>
                                Ticket: {currentWinner.ticketNumber}
                            </div>
                        </div>

                        <button
                            onClick={closeModal}
                            className="btn btn-gold"
                            style={{ width: '100%' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
