import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const LuckyDrawWheel = ({ participants, onWinnerSelected }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [winner, setWinner] = useState(null);

    const startDraw = () => {
        if (participants.length === 0 || isSpinning) return;

        setIsSpinning(true);
        setWinner(null);

        // Shuffle through names rapidly
        let iterations = 0;
        const maxIterations = 50;

        const interval = setInterval(() => {
            setCurrentIndex(Math.floor(Math.random() * participants.length));
            iterations++;

            if (iterations >= maxIterations) {
                clearInterval(interval);

                // Select final winner
                const finalWinner = participants[Math.floor(Math.random() * participants.length)];
                setWinner(finalWinner);
                setIsSpinning(false);

                // Trigger confetti
                confetti({
                    particleCount: 200,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#FFD700', '#DC143C', '#2D5016']
                });

                // Notify parent
                onWinnerSelected(finalWinner);
            }
        }, 100);
    };

    return (
        <div className="festive-card text-center" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>🎁 Lucky Draw Wheel</h2>

            <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem 2rem',
                margin: '2rem 0',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {isSpinning && participants[currentIndex] && (
                    <div className="pulse" style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: 'var(--festive-gold)',
                        textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
                    }}>
                        {participants[currentIndex].fullName}
                    </div>
                )}

                {!isSpinning && !winner && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
                        🎄 Ready to draw the lucky winner! 🎄
                    </div>
                )}

                {winner && !isSpinning && (
                    <div className="fade-in">
                        <div style={{
                            fontSize: '1.2rem',
                            color: 'var(--festive-gold)',
                            marginBottom: '1rem'
                        }}>
                            🎊 WINNER 🎊
                        </div>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, var(--festive-gold), var(--crimson-red))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            marginBottom: '1rem'
                        }}>
                            {winner.fullName}
                        </div>
                        <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                            📞 {winner.phone}
                        </div>
                        <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            🏢 {winner.divisonalOffice}
                        </div>
                        <div className="badge badge-gold" style={{ marginTop: '1rem', fontSize: '1rem' }}>
                            {winner.ticketNumber}
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={startDraw}
                disabled={isSpinning || participants.length === 0}
                className="btn btn-gold"
                style={{
                    fontSize: '1.2rem',
                    padding: '1rem 2rem',
                    transform: isSpinning ? 'scale(0.95)' : 'scale(1)'
                }}
            >
                {isSpinning ? '🎰 Drawing...' : '🎁 Start Lucky Draw'}
            </button>

            <p style={{
                marginTop: '1rem',
                color: 'var(--text-muted)',
                fontSize: '0.9rem'
            }}>
                {participants.length} participant{participants.length !== 1 ? 's' : ''} eligible
            </p>
        </div>
    );
};

export default LuckyDrawWheel;
