import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getParticipants, removeParticipant, addDrawToHistory, getDrawHistory } from '../utils/storage';

const CouponDraw = () => {
    const [participants, setParticipants] = useState([]);
    const [sapCodes, setSapCodes] = useState([]);
    const [drawResults, setDrawResults] = useState({});
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentDrawingCode, setCurrentDrawingCode] = useState(null);
    const [currentWinnerTicket, setCurrentWinnerTicket] = useState('XXX-XXX');
    const [allWinners, setAllWinners] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const p = await getParticipants();
        setParticipants(p);

        // Derive unique SAP codes from actual participant data
        // Only SAP codes that have matching participants are "correctly configured"
        const uniqueCodes = [...new Set(
            p.filter(part => part.sapCode && part.sapCode.trim().length > 0)
                .map(part => part.sapCode.trim())
        )];
        setSapCodes(uniqueCodes);
    };

    const handleDraw = async () => {
        if (participants.length === 0) {
            alert('No participants available for draw');
            return;
        }

        if (sapCodes.length === 0) {
            alert('No SAP Codes found in localStorage');
            return;
        }

        setIsDrawing(true);
        const newResults = {};
        let updatedParticipants = [...participants];
        const newWinnersList = [];

        try {
            for (const code of sapCodes) {
                setCurrentDrawingCode(code);

                // Filter participants for this SAP Code
                const eligibleParticipants = updatedParticipants.filter(p => String(p.sapCode) === String(code));

                if (eligibleParticipants.length === 0) {
                    newResults[code] = [];
                    continue;
                }

                // Select up to 10 random winners
                const winnersCount = Math.min(10, eligibleParticipants.length);
                const tempPool = [...eligibleParticipants];
                const codeWinners = [];

                for (let i = 0; i < winnersCount; i++) {
                    // Random selection logic
                    const randomIndex = Math.floor(Math.random() * tempPool.length);
                    const winner = tempPool[randomIndex];

                    // Update display
                    setCurrentWinnerTicket(winner.ticketNumber);

                    // Add to winners list
                    codeWinners.push(winner);

                    // Remove from temp pool
                    tempPool.splice(randomIndex, 1);

                    // Simulate delay for effect
                    await new Promise(resolve => setTimeout(resolve, 200));
                }

                // Process winners
                for (const winner of codeWinners) {
                    const winnerEntry = { ...winner, prizeRank: 'Coupon Draw' };
                    await addDrawToHistory(winnerEntry);
                    await removeParticipant(winner.id);

                    updatedParticipants = updatedParticipants.filter(p => p.id !== winner.id);
                    newWinnersList.push({ ...winnerEntry, sapCode: code });
                }

                newResults[code] = codeWinners;
                setAllWinners(prev => [...prev, ...codeWinners.map(w => ({ ...w, sapCode: code }))]);
            }

            setDrawResults(newResults);
            setCurrentDrawingCode(null);
            setCurrentWinnerTicket('XXX-XXX');

            // Refresh main participant list
            const p = await getParticipants();
            setParticipants(p);

        } catch (error) {
            console.error('Error during draw:', error);
            alert('Error occurred during draw');
        } finally {
            setIsDrawing(false);
        }
    };

    const handleExport = async () => {
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
                        Christmas Bonanza Lucky Draw
                    </h1>
                </div>

                {/* Main Draw Card */}
                <div style={{ maxWidth: '1500px', margin: '0 auto' }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                        marginBottom: '2.5rem'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'row', minHeight: '500px' }}>
                            {/* Left Side - Image */}
                            <div style={{
                                flex: '0 0 30%',
                                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                                padding: '2rem 1rem',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {/* Snowflakes */}
                                <div style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '1.5rem', color: 'rgba(255, 255, 255, 0.3)' }}>❄</div>
                                <div style={{ position: 'absolute', bottom: '15%', right: '10%', fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.25)' }}>❄</div>

                                <div style={{
                                    fontSize: '5rem',
                                    marginBottom: '1rem',
                                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                                }}>
                                    🎁
                                </div>
                                <h2 style={{
                                    color: '#FFD700',
                                    fontSize: '2.5rem',
                                    textAlign: 'center',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    Coupon<br />Draw
                                </h2>
                            </div>

                            {/* Middle - Controls */}
                            <div style={{
                                flex: '0 0 35%',
                                padding: '2rem 1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#f8f8f8'
                            }}>
                                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{
                                        fontSize: '1.8rem',
                                        fontWeight: 'bold',
                                        color: '#1e3a8a',
                                        margin: '0 0 0.5rem 0',
                                        textTransform: 'uppercase'
                                    }}>
                                        Lucky Draw Event
                                    </h2>
                                    <p style={{
                                        color: '#666',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        margin: 0
                                    }}>
                                        10 Winners per SAP Code
                                    </p>
                                </div>

                                {/* Status Box */}
                                <div style={{
                                    marginBottom: '2rem',
                                    textAlign: 'center',
                                    width: '100%'
                                }}>
                                    <p style={{
                                        color: '#666',
                                        fontSize: '0.8rem',
                                        marginBottom: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        fontWeight: '600'
                                    }}>
                                        {isDrawing ? 'Drawing for SAP Code' : 'Ready to Start'}
                                    </p>
                                    <div style={{
                                        background: '#fff',
                                        border: '4px solid #FFD700',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
                                        minHeight: '100px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        {isDrawing ? (
                                            <>
                                                <div style={{ fontSize: '1.5rem', color: '#1e3a8a', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                                    {currentDrawingCode}
                                                </div>
                                                <div style={{ fontSize: '1.2rem', color: '#666', fontFamily: 'monospace' }}>
                                                    {currentWinnerTicket}
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ fontSize: '1.2rem', color: '#9ca3af', fontStyle: 'italic' }}>
                                                {sapCodes.length} Unique SAP Codes
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleDraw}
                                    disabled={isDrawing || sapCodes.length === 0}
                                    style={{
                                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                        color: '#000',
                                        fontSize: '1.3rem',
                                        fontWeight: 'bold',
                                        padding: '1rem 3rem',
                                        border: 'none',
                                        borderRadius: '50px',
                                        cursor: isDrawing || sapCodes.length === 0 ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 6px 20px rgba(255, 215, 0, 0.5)',
                                        transition: 'all 0.3s ease',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        opacity: isDrawing ? 0.6 : 1,
                                        transform: isDrawing ? 'scale(0.95)' : 'scale(1)'
                                    }}
                                >
                                    {isDrawing ? 'Drawing...' : 'Start Draw'}
                                </button>
                            </div>

                            {/* Right Side - Winners List */}
                            <div style={{
                                flex: '0 0 35%',
                                padding: '1.5rem',
                                background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(59, 89, 152, 0.95) 100%)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1rem',
                                    borderBottom: '2px solid #FFD700',
                                    paddingBottom: '0.5rem'
                                }}>
                                    <h4 style={{
                                        color: '#FFD700',
                                        fontSize: '1rem',
                                        margin: 0,
                                        fontWeight: '700'
                                    }}>
                                        Winners ({allWinners.length})
                                    </h4>
                                    {allWinners.length > 0 && (
                                        <button
                                            onClick={handleExport}
                                            style={{
                                                background: 'rgba(255, 215, 0, 0.2)',
                                                border: '1px solid #FFD700',
                                                color: '#FFD700',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            📥 Export CSV
                                        </button>
                                    )}
                                </div>

                                <div style={{
                                    overflowY: 'auto',
                                    flex: 1,
                                    paddingRight: '0.5rem',
                                    maxHeight: '450px'
                                }}>
                                    {allWinners.length === 0 ? (
                                        <p style={{
                                            color: '#9ca3af',
                                            fontSize: '0.85rem',
                                            fontStyle: 'italic',
                                            textAlign: 'center',
                                            marginTop: '2rem'
                                        }}>
                                            No winners drawn yet
                                        </p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {allWinners.map((winner, index) => (
                                                <div
                                                    key={`${winner.id}-${index}`}
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                        border: '1px solid rgba(255, 215, 0, 0.3)',
                                                        borderRadius: '8px',
                                                        padding: '0.75rem',
                                                        backdropFilter: 'blur(10px)'
                                                    }}
                                                >
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '0.25rem'
                                                    }}>
                                                        <h5 style={{
                                                            fontSize: '0.9rem',
                                                            color: '#ffffff',
                                                            margin: 0,
                                                            fontWeight: '700'
                                                        }}>
                                                            {winner.fullName}
                                                        </h5>
                                                        <span style={{
                                                            background: '#FFD700',
                                                            color: '#000',
                                                            padding: '0.15rem 0.5rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {winner.sapCode}
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        fontSize: '0.75rem',
                                                        color: '#e0e7ff'
                                                    }}>
                                                        <span>{winner.ticketNumber}</span>
                                                        <span>{winner.phone}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CouponDraw;
