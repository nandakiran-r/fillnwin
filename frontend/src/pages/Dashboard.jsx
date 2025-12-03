import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getParticipants, removeParticipant, getDrawHistory, addDrawToHistory, getStats } from '../utils/storage';

const Dashboard = () => {
    const [participants, setParticipants] = useState([]);
    const [drawHistory, setDrawHistory] = useState([]);
    const [stats, setStats] = useState({ totalParticipants: 0, totalDraws: 0, remainingParticipants: 0 });
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [currentWinner, setCurrentWinner] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastDrawnTicket, setLastDrawnTicket] = useState('XXX-XXX');

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

    const handleDrawFirstPrize = async () => {
        if (participants.length === 0) {
            alert('No participants available for draw');
            return;
        }

        setIsDrawing(true);

        // Simulate drawing animation (random selection)
        setTimeout(async () => {
            const randomIndex = Math.floor(Math.random() * participants.length);
            const winner = participants[randomIndex];

            // Save the winner's ticket for display
            setLastDrawnTicket(winner.ticketNumber);

            await addDrawToHistory(winner);
            await removeParticipant(winner.id);
            setCurrentWinner(winner);
            setShowWinnerModal(true);
            setIsDrawing(false);

            setTimeout(async () => {
                await loadData();
            }, 500);
        }, 2000);
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
                            filter: 'drop-shadow(0 2px 8px rgba(255, 215, 0, 0.3))'
                        }}
                    />
                    <h1 style={{
                        fontSize: '2.5rem',
                        color: '#FFD700',
                        margin: '0.5rem 0',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}>
                        Lucky Draw Dashboard
                    </h1>
                </div>

                {/* Statistics Cards */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '2px solid #FFD700',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        minWidth: '200px'
                    }}>
                        <div style={{ fontSize: '2.5rem', color: '#8B0000', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {stats.totalParticipants}
                        </div>
                        <div style={{ color: '#333', fontSize: '1rem', fontWeight: '600' }}>
                            Total Participants
                        </div>
                    </div>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '2px solid #FFD700',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        minWidth: '200px'
                    }}>
                        <div style={{ fontSize: '2.5rem', color: '#8B0000', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {stats.remainingParticipants}
                        </div>
                        <div style={{ color: '#333', fontSize: '1rem', fontWeight: '600' }}>
                            Remaining
                        </div>
                    </div>
                </div>

                {/* First Prize Draw Card */}
                {participants.length > 0 && (
                    <div style={{
                        background: '#fff',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                        marginBottom: '2.5rem',
                        maxWidth: '1000px',
                        margin: '0 auto 2.5rem'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            {/* Left Side - Prize & Car */}
                            <div style={{
                                flex: '0 0 45%',
                                backgroundImage: 'url(swift-car.png)',
                                padding: '3rem 2rem',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            }}>
                                {/* Snowflake decorations */}
                                <div style={{
                                    position: 'absolute',
                                    top: '10%',
                                    left: '10%',
                                    fontSize: '1.5rem',
                                    color: 'rgba(255, 255, 255, 0.3)'
                                }}>❄</div>
                                <div style={{
                                    position: 'absolute',
                                    top: '20%',
                                    right: '15%',
                                    fontSize: '1rem',
                                    color: 'rgba(255, 255, 255, 0.2)'
                                }}>❄</div>
                                <div style={{
                                    position: 'absolute',
                                    bottom: '15%',
                                    left: '20%',
                                    fontSize: '1.2rem',
                                    color: 'rgba(255, 255, 255, 0.25)'
                                }}>❄</div>
                                <div style={{
                                    position: 'absolute',
                                    bottom: '25%',
                                    right: '10%',
                                    fontSize: '1.3rem',
                                    color: 'rgba(255, 255, 255, 0.2)'
                                }}>❄</div>
                            </div>

                            {/* Right Side - Ticket & Draw Button */}
                            <div style={{
                                flex: '0 0 55%',
                                padding: '3rem 2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#f8f8f8'
                            }}>
                                {/* Ticket Number Display */}
                                <div style={{
                                    marginBottom: '2rem',
                                    textAlign: 'center'
                                }}>
                                    <p style={{
                                        color: '#666',
                                        fontSize: '0.9rem',
                                        marginBottom: '1rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        fontWeight: '600'
                                    }}>
                                        Next Lucky Ticket
                                    </p>
                                    <div style={{
                                        background: '#fff',
                                        border: '4px solid #FFD700',
                                        borderRadius: '12px',
                                        padding: '1.5rem 3rem',
                                        boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3), inset 0 2px 4px rgba(255,215,0,0.1)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Decorative corner elements */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 5,
                                            left: 5,
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid #FFD700',
                                            borderRight: 'none',
                                            borderBottom: 'none'
                                        }}></div>
                                        <div style={{
                                            position: 'absolute',
                                            top: 5,
                                            right: 5,
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid #FFD700',
                                            borderLeft: 'none',
                                            borderBottom: 'none'
                                        }}></div>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 5,
                                            left: 5,
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid #FFD700',
                                            borderRight: 'none',
                                            borderTop: 'none'
                                        }}></div>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 5,
                                            right: 5,
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid #FFD700',
                                            borderLeft: 'none',
                                            borderTop: 'none'
                                        }}></div>

                                        <h3 style={{
                                            fontSize: '2.5rem',
                                            fontWeight: 'bold',
                                            color: '#333',
                                            margin: 0,
                                            fontFamily: 'monospace',
                                            letterSpacing: '2px'
                                        }}>
                                            {isDrawing ? '━━━━━━' : lastDrawnTicket}
                                        </h3>
                                    </div>
                                </div>

                                {/* Draw Button */}
                                <button
                                    onClick={handleDrawFirstPrize}
                                    disabled={isDrawing}
                                    style={{
                                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                        color: '#000',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        padding: '1.25rem 4rem',
                                        border: 'none',
                                        borderRadius: '50px',
                                        cursor: isDrawing ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 6px 20px rgba(255, 215, 0, 0.5)',
                                        transition: 'all 0.3s ease',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        opacity: isDrawing ? 0.6 : 1,
                                        transform: isDrawing ? 'scale(0.95)' : 'scale(1)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isDrawing) {
                                            e.target.style.transform = 'scale(1.05)';
                                            e.target.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.7)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isDrawing) {
                                            e.target.style.transform = 'scale(1)';
                                            e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.5)';
                                        }
                                    }}
                                >
                                    {isDrawing ? '🎰 DRAWING...' : '🎲 DRAW'}
                                </button>

                                <p style={{
                                    marginTop: '1.5rem',
                                    color: '#999',
                                    fontSize: '0.85rem',
                                    textAlign: 'center'
                                }}>
                                    {participants.length} participants remaining
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* No Participants Message */}
                {participants.length === 0 && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '2px dashed #FFD700',
                        borderRadius: '12px',
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        marginBottom: '2.5rem'
                    }}>
                        <h2 style={{ color: '#333', marginBottom: '1rem', fontSize: '1.5rem' }}>
                            No Participants Available
                        </h2>
                        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                            Upload CSV file with participant data to start the Lucky Draw
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
                            <h2 style={{ color: '#FFD700', fontSize: '1.5rem', margin: 0 }}>
                                Winners List ({drawHistory.length})
                            </h2>
                            <button
                                onClick={exportWinners}
                                style={{
                                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                    color: '#000',
                                    padding: '0.75rem 1.5rem',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                📥 Export Winners
                            </button>
                        </div>

                        <div className="grid grid-2" style={{ gap: '1rem' }}>
                            {drawHistory.slice(0, 10).map((entry, index) => (
                                <div
                                    key={entry.id}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #FFD700',
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
                                                color: '#333',
                                                margin: '0 0 0.5rem 0'
                                            }}>
                                                {entry.winner.fullName}
                                            </h4>
                                            <p style={{
                                                fontSize: '0.9rem',
                                                color: '#666',
                                                margin: '0.25rem 0'
                                            }}>
                                                {entry.winner.phone}
                                            </p>
                                            <p style={{
                                                fontSize: '0.9rem',
                                                color: '#666',
                                                margin: '0.25rem 0'
                                            }}>
                                                {entry.winner.divisonalOffice}
                                            </p>
                                        </div>
                                        <span style={{
                                            background: '#FFD700',
                                            color: '#000',
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
                                        color: '#999',
                                        paddingTop: '0.75rem',
                                        borderTop: '1px solid rgba(255, 215, 0, 0.3)'
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
                        background: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        animation: 'fadeIn 0.3s ease'
                    }}
                    onClick={closeModal}
                >
                    <div
                        style={{
                            background: 'linear-gradient(180deg, #1e3a8a 0%, #3b5998 100%)',
                            border: '3px solid #60a5fa',
                            borderRadius: '24px',
                            padding: '2.5rem 2rem',
                            maxWidth: '500px',
                            width: '90%',
                            textAlign: 'center',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top accent stripe */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '6px',
                            background: 'linear-gradient(90deg, #60a5fa, #93c5fd, #60a5fa)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 2s linear infinite'
                        }}></div>

                        {/* Indian Oil Logo */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <img
                                src="/indian-oil-logo.png"
                                alt="Indian Oil"
                                style={{
                                    height: '50px',
                                    filter: 'drop-shadow(0 2px 8px rgba(255, 255, 255, 0.3))'
                                }}
                            />
                        </div>

                        <h2 style={{
                            fontSize: '2rem',
                            color: '#fff',
                            marginBottom: '0.5rem',
                            fontWeight: '700',
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                        }}>
                            Congratulations!
                        </h2>

                        <p style={{
                            color: '#bfdbfe',
                            fontSize: '0.95rem',
                            marginBottom: '2rem',
                            fontWeight: '500'
                        }}>
                            Lucky Draw Winner
                        </p>

                        {/* Ticket Number Display */}
                        <div style={{
                            background: '#fff',
                            borderRadius: '16px',
                            padding: '2rem 1.5rem',
                            marginBottom: '1.5rem',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                        }}>
                            <div style={{
                                fontSize: '3.5rem',
                                fontWeight: 'bold',
                                color: '#1e3a8a',
                                fontFamily: 'monospace',
                                letterSpacing: '3px',
                                marginBottom: '0.5rem'
                            }}>
                                🎫 {currentWinner.ticketNumber}
                            </div>
                        </div>

                        {/* Winner Details */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            marginBottom: '1.5rem',
                            textAlign: 'left'
                        }}>
                            <div style={{
                                color: '#fff',
                                marginBottom: '0.75rem',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>📞</span>
                                <span><strong>Phone:</strong> {currentWinner.phone}</span>
                            </div>
                            <div style={{
                                color: '#fff',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>🏢</span>
                                <span><strong>Office:</strong> {currentWinner.divisonalOffice}</span>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            style={{
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                color: '#000',
                                padding: '0.9rem 2.5rem',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                width: '100%',
                                boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)',
                                transition: 'all 0.3s ease',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(251, 191, 36, 0.4)';
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                @keyframes shimmer {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
