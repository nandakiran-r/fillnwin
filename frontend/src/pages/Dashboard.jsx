import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getParticipants, removeParticipant, getDrawHistory, addDrawToHistory, getStats, exportWinnersByPrize } from '../utils/storage';
import confetti from 'canvas-confetti';

const Dashboard = () => {
    const [participants, setParticipants] = useState([]);
    const [drawHistory, setDrawHistory] = useState([]);
    const [stats, setStats] = useState({ totalParticipants: 0, totalDraws: 0, remainingParticipants: 0 });
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [currentWinner, setCurrentWinner] = useState(null);
    const [isDrawing, setIsDrawing] = useState({ first: false, second: false, third: false, fourth: false, fifth: false, sixth: false, seventh: false });
    const [lastDrawnTicket, setLastDrawnTicket] = useState({
        first: 'XXX-XXX',
        second: 'XXX-XXX',
        third: 'XXX-XXX',
        fourth: 'XXX-XXX',
        fifth: 'XXX-XXX',
        sixth: 'XXX-XXX',
        seventh: 'XXX-XXX'
    });
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkWinners, setBulkWinners] = useState([]);
    const [bulkModalTitle, setBulkModalTitle] = useState('3rd Prize');
    const [bulkModalCount, setBulkModalCount] = useState(25);


    // Prize configurations
    const prizes = {
        first: { name: '1st Prize', title: 'MARUTI SUZUKI SWIFT', subtitle: 'LXI 1.2L (SS SMT)', image: '/swift-car.png' },
        second: { name: '2nd Prize', title: 'HONDA ACTIVA 125', subtitle: 'Two Wheeler', image: '/scooter-image.png' },
        third: { name: '3rd Prize', title: 'VIVO Y19 5G', subtitle: 'Latest Model', image: '/phone-image.png' },
        fourth: { name: 'Free Borophene Self-Healing Coating', title: 'BOROPHENE SELF-HEALING COATING', subtitle: 'Free Coating', image: '/borophene-coating.png' },
        fifth: { name: '25% Discount Voucher', title: '25% DISCOUNT VOUCHERS ON BOROPHENE SELF-HEALING COATING', subtitle: 'On Borophene Self-Healing Coating', image: '/discount-voucher.png' },
        sixth: { name: 'Free Meta Marketing Course', title: 'FREE META MARKETING COURSE', subtitle: 'Professional Certification', image: '/meta-course.png' },
        seventh: { name: '20% Discount Coupon', title: '20% DISCOUNT COUPONS ON ALL COURSES', subtitle: 'On All Courses', image: '/discount-20-voucher.png' }
    };

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

    const handleExportPrize = async (prizeRank) => {
        try {
            await exportWinnersByPrize(prizeRank);
        } catch (error) {
            console.error('Export error:', error);
            alert(error.message || 'Failed to export winners');
        }
    };


    const handleDraw = async (prizeType) => {
        if (participants.length === 0) {
            alert('No participants available for draw');
            return;
        }

        setIsDrawing(prev => ({ ...prev, [prizeType]: true }));

        // Simulate drawing animation (random selection)
        setTimeout(async () => {
            const randomIndex = Math.floor(Math.random() * participants.length);
            const winner = { ...participants[randomIndex], prizeRank: prizes[prizeType].name };

            // Save the winner's ticket for display
            setLastDrawnTicket(prev => ({ ...prev, [prizeType]: winner.ticketNumber }));

            await addDrawToHistory(winner);
            await removeParticipant(winner.id);
            setCurrentWinner(winner);
            setShowWinnerModal(true);
            setIsDrawing(prev => ({ ...prev, [prizeType]: false }));

            // Fire confetti from sides - continuous effect with vibrant colors
            const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00']; // Red, Green, Blue, Yellow

            // Create or get confetti canvas with high z-index
            let confettiCanvas = document.getElementById('confetti-canvas');
            if (!confettiCanvas) {
                confettiCanvas = document.createElement('canvas');
                confettiCanvas.id = 'confetti-canvas';
                confettiCanvas.style.position = 'fixed';
                confettiCanvas.style.top = '0';
                confettiCanvas.style.left = '0';
                confettiCanvas.style.width = '100%';
                confettiCanvas.style.height = '100%';
                confettiCanvas.style.pointerEvents = 'none';
                confettiCanvas.style.zIndex = '10000'; // Above modal (z-index: 1000)
                document.body.appendChild(confettiCanvas);
            }

            const myConfetti = confetti.create(confettiCanvas, { resize: true });

            // Continuous side cannons effect for 3 seconds
            const end = Date.now() + 3 * 1000; // 3 seconds
            const frame = () => {
                if (Date.now() > end) return;

                // Left side cannon
                myConfetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    startVelocity: 60,
                    origin: { x: 0, y: 0.5 },
                    colors: colors
                });

                // Right side cannon
                myConfetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    startVelocity: 60,
                    origin: { x: 1, y: 0.5 },
                    colors: colors
                });

                requestAnimationFrame(frame);
            };

            frame();

            setTimeout(async () => {
                await loadData();
            }, 500);
        }, 2000);
    };

    // Generic multi-winner handler: select COUNT winners at once
    const handleBulkDraw = async (prizeType, count, prizeLabel) => {
        if (participants.length === 0) {
            alert('No participants available for draw');
            return;
        }

        if (participants.length < count) {
            alert(`Not enough participants. Need at least ${count}, only ${participants.length} remaining.`);
            return;
        }

        setIsDrawing(prev => ({ ...prev, [prizeType]: true }));

        setTimeout(async () => {
            // Shuffle a copy and pick first COUNT
            const pool = [...participants];
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }
            const selected = pool.slice(0, count).map(p => ({ ...p, prizeRank: prizeLabel }));

            // Persist each winner
            for (const winner of selected) {
                await addDrawToHistory(winner);
                await removeParticipant(winner.id);
            }

            setBulkWinners(selected);
            setBulkModalTitle(prizeLabel);
            setBulkModalCount(count);
            setShowBulkModal(true);
            setIsDrawing(prev => ({ ...prev, [prizeType]: false }));

            // Confetti
            const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
            let confettiCanvas = document.getElementById('confetti-canvas');
            if (!confettiCanvas) {
                confettiCanvas = document.createElement('canvas');
                confettiCanvas.id = 'confetti-canvas';
                confettiCanvas.style.position = 'fixed';
                confettiCanvas.style.top = '0';
                confettiCanvas.style.left = '0';
                confettiCanvas.style.width = '100%';
                confettiCanvas.style.height = '100%';
                confettiCanvas.style.pointerEvents = 'none';
                confettiCanvas.style.zIndex = '10000';
                document.body.appendChild(confettiCanvas);
            }
            const myConfetti = confetti.create(confettiCanvas, { resize: true });
            const end = Date.now() + 3 * 1000;
            const frame = () => {
                if (Date.now() > end) return;
                myConfetti({ particleCount: 2, angle: 60, spread: 55, startVelocity: 60, origin: { x: 0, y: 0.5 }, colors });
                myConfetti({ particleCount: 2, angle: 120, spread: 55, startVelocity: 60, origin: { x: 1, y: 0.5 }, colors });
                requestAnimationFrame(frame);
            };
            frame();

            setTimeout(async () => { await loadData(); }, 500);
        }, 2000);
    };

    // Convenience wrappers (batchSize of 10 for 100-winner draws)
    const handleDrawSecond = () => handleBulkDraw('second', 3, '2nd Prize');
    const handleDrawThird = () => handleBulkDraw('third', 25, '3rd Prize');
    const handleDrawFifth = () => handleBulkDraw('fifth', 100, '25% Discount Voucher');
    const handleDrawSixth = () => handleBulkDraw('sixth', 2, 'Free Meta Marketing Course');
    const handleDrawSeventh = () => handleBulkDraw('seventh', 100, '20% Discount Coupon');


    const closeModal = () => {
        setShowWinnerModal(false);
        setCurrentWinner(null);
    };

    // Map prize types to their bulk handlers
    const bulkHandlers = {
        second: handleDrawSecond,
        third: handleDrawThird,
        fifth: handleDrawFifth,
        sixth: handleDrawSixth,
        seventh: handleDrawSeventh
    };

    const renderPrizeCard = (prizeType) => {
        const prize = prizes[prizeType];
        const drawing = isDrawing[prizeType];
        const displayedTicket = lastDrawnTicket[prizeType];
        const prizeWinners = drawHistory.filter(entry => entry.winner.prizeRank === prize.name);
        const colorMap = {
            first: '#fbbf24',
            second: '#fbbf24',
            third: '#fbbf24',
            fourth: '#fbbf24',
            fifth: '#fbbf24',
            sixth: '#fbbf24',
            seventh: '#fbbf24'
        };
        const prizeColor = colorMap[prizeType] || '#FFD700';
        const isBulkDraw = ['second', 'third', 'fifth', 'sixth', 'seventh'].includes(prizeType);

        return (
            <div key={prizeType} style={{
                background: '#fff',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                marginBottom: '2.5rem'
            }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {/* Left Side - Prize Image */}
                    <div style={{
                        flex: '0 0 30%',
                        backgroundImage: `url(${prize.image})`,
                        padding: '2rem 1rem',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        minHeight: '350px'
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

                    {/* Middle - Ticket & Draw Button */}
                    <div style={{
                        flex: '0 0 35%',
                        padding: '2rem 1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f8f8f8'
                    }}>
                        {/* Prize Title */}
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <h2 style={{
                                fontSize: '1.8rem',
                                fontWeight: 'bold',
                                color: prizeColor,
                                margin: '0 0 0.5rem 0',
                                textTransform: 'uppercase'
                            }}>
                                {prize.name}
                            </h2>
                            <p style={{
                                color: '#666',
                                fontSize: '1rem',
                                fontWeight: '600',
                                margin: 0
                            }}>
                                {prize.title}
                            </p>
                        </div>

                        {/* Ticket Number Display */}
                        <div style={{
                            marginBottom: '1.5rem',
                            textAlign: 'center'
                        }}>
                            <p style={{
                                color: '#666',
                                fontSize: '0.8rem',
                                marginBottom: '0.75rem',
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
                                padding: '1.25rem 2rem',
                                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3), inset 0 2px 4px rgba(255,215,0,0.1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <h3 style={{
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    margin: 0,
                                    fontFamily: 'monospace',
                                    letterSpacing: '2px'
                                }}>
                                    {drawing ? '━━━━━━' : displayedTicket}
                                </h3>
                            </div>
                        </div>

                        {/* Draw Button */}
                        <button
                            onClick={() => isBulkDraw ? bulkHandlers[prizeType]() : handleDraw(prizeType)}
                            disabled={drawing}
                            style={{
                                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                color: '#000',
                                fontSize: '1.3rem',
                                fontWeight: 'bold',
                                padding: '1rem 3rem',
                                border: 'none',
                                borderRadius: '50px',
                                cursor: drawing ? 'not-allowed' : 'pointer',
                                boxShadow: '0 6px 20px rgba(255, 215, 0, 0.5)',
                                transition: 'all 0.3s ease',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                opacity: drawing ? 0.6 : 1,
                                transform: drawing ? 'scale(0.95)' : 'scale(1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                if (!drawing) {
                                    e.target.style.transform = 'scale(1.05)';
                                    e.target.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.7)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!drawing) {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.5)';
                                }
                            }}
                        >
                            {drawing ? '🎰 DRAWING...' : '🎲 DRAW'}
                        </button>

                        <p style={{
                            marginTop: '1rem',
                            color: '#999',
                            fontSize: '0.85rem',
                            textAlign: 'center'
                        }}>
                            {participants.length} participants remaining
                        </p>
                    </div>

                    {/* Right Side - Winners List */}
                    <div style={{
                        flex: '0 0 35%',
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(59, 89, 152, 0.95) 100%)',
                        overflowY: 'auto',
                        maxHeight: '400px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                            borderBottom: `2px solid ${prizeColor}`,
                            paddingBottom: '0.5rem'
                        }}>
                            <h4 style={{
                                color: prizeColor,
                                fontSize: '1rem',
                                marginTop: 0,
                                marginBottom: 0,
                                fontWeight: '700'
                            }}>
                                {prizeType === 'first' ? '🥇' : prizeType === 'second' ? '🥈' : prizeType === 'third' ? '🥉' : '🏆'} Winners ({prizeWinners.length})
                            </h4>
                            {prizeWinners.length > 0 && (
                                <button
                                    onClick={() => handleExportPrize(prize.name)}
                                    style={{
                                        background: 'rgba(255, 215, 0, 0.2)',
                                        border: `1px solid ${prizeColor}`,
                                        color: prizeColor,
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = prizeColor;
                                        e.target.style.color = prizeType === 'third' ? '#fff' : '#000';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255, 215, 0, 0.2)';
                                        e.target.style.color = prizeColor;
                                    }}
                                >
                                    📥 Export CSV
                                </button>
                            )}
                        </div>

                        {prizeWinners.length === 0 ? (
                            <p style={{
                                color: '#9ca3af',
                                fontSize: '0.85rem',
                                fontStyle: 'italic',
                                textAlign: 'center',
                                marginTop: '2rem'
                            }}>
                                No winners yet
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {prizeWinners.map((entry, index) => (
                                    <div
                                        key={entry.id}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: `1px solid ${prizeColor}`,
                                            borderRadius: '8px',
                                            padding: '0.75rem',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <h5 style={{
                                                fontSize: '0.95rem',
                                                color: '#ffffff',
                                                margin: 0,
                                                fontWeight: '700'
                                            }}>
                                                {entry.winner.fullName}
                                            </h5>
                                            <span style={{
                                                background: prizeColor,
                                                color: prizeType === 'third' ? '#fff' : '#000',
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {entry.winner.ticketNumber}
                                            </span>
                                        </div>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            color: '#e0e7ff',
                                            margin: '0.25rem 0 0 0'
                                        }}>
                                            📞 {entry.winner.phone}
                                        </p>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            color: '#e0e7ff',
                                            margin: '0.25rem 0 0 0'
                                        }}>
                                            🏢 {entry.winner.divisonalOffice}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
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
                        Christmas Bonanza Lucky Draw
                    </h1>
                </div>

                {/* Prize Draw Cards */}
                {participants.length > 0 && (
                    <div style={{ maxWidth: '1500px', margin: '0 auto' }}>
                        {renderPrizeCard('first')}
                        {renderPrizeCard('second')}
                        {renderPrizeCard('third')}
                        {renderPrizeCard('fourth')}
                        {renderPrizeCard('fifth')}
                        {renderPrizeCard('sixth')}
                        {renderPrizeCard('seventh')}
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
                            marginBottom: '0.5rem',
                            fontWeight: '500'
                        }}>
                            Lucky Draw Winner
                        </p>

                        <p style={{
                            color: '#fbbf24',
                            fontSize: '1.2rem',
                            marginBottom: '2rem',
                            fontWeight: '700',
                            textTransform: 'uppercase'
                        }}>
                            {currentWinner.prizeRank || '1st Prize'}
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

            {/* Bulk Winners Modal for 3rd Prize */}
            {showBulkModal && bulkWinners.length > 0 && (
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
                    onClick={() => { setShowBulkModal(false); setBulkWinners([]); }}
                >
                    <div
                        style={{
                            background: 'linear-gradient(180deg, #1e3a8a 0%, #3b5998 100%)',
                            border: '3px solid #fbbf24',
                            borderRadius: '24px',
                            padding: '2rem',
                            maxWidth: '650px',
                            width: '92%',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top accent stripe */}
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            height: '6px',
                            background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 2s linear infinite'
                        }}></div>

                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '1.25rem', paddingTop: '0.5rem' }}>
                            <img src="/indian-oil-logo.png" alt="Indian Oil" style={{ height: '45px', marginBottom: '0.75rem', filter: 'drop-shadow(0 2px 8px rgba(255,255,255,0.3))' }} />
                            <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: '0 0 0.25rem', fontWeight: '700', textTransform: 'uppercase' }}>Congratulations!</h2>
                            <p style={{ color: '#bfdbfe', fontSize: '0.9rem', margin: 0 }}>{bulkModalTitle} — {bulkModalCount} Lucky Winners</p>
                            <p style={{ color: '#fbbf24', fontSize: '1.1rem', fontWeight: '700', margin: '0.25rem 0 0', textTransform: 'uppercase' }}>🏆 {bulkModalTitle}</p>
                        </div>

                        {/* Winners Grid — scrollable */}
                        <div style={{
                            overflowY: 'auto',
                            flex: 1,
                            paddingRight: '0.25rem',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.6rem'
                        }}>
                            {bulkWinners.map((winner, idx) => (
                                <div
                                    key={winner.id}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(251,191,36,0.4)',
                                        borderRadius: '10px',
                                        padding: '0.65rem 0.85rem',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                                        <span style={{ color: '#fbbf24', fontWeight: '700', fontSize: '0.8rem' }}>#{idx + 1}</span>
                                        <span style={{ background: '#fbbf24', color: '#000', padding: '0.1rem 0.45rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 'bold' }}>{winner.ticketNumber}</span>
                                    </div>
                                    <h5 style={{ fontSize: '0.88rem', color: '#fff', margin: '0 0 0.15rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{winner.fullName}</h5>
                                    <p style={{ fontSize: '0.72rem', color: '#e0e7ff', margin: 0 }}>📞 {winner.phone}</p>
                                </div>
                            ))}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => { setShowBulkModal(false); setBulkWinners([]); }}
                            style={{
                                marginTop: '1.25rem',
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                color: '#000',
                                padding: '0.85rem 2.5rem',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '700',
                                width: '100%',
                                boxShadow: '0 4px 15px rgba(251,191,36,0.4)',
                                transition: 'all 0.3s ease',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                flexShrink: 0
                            }}
                            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(251,191,36,0.6)'; }}
                            onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(251,191,36,0.4)'; }}
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
