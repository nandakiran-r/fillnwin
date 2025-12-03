import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getParticipants } from '../utils/storage';
import * as IDB from '../utils/idb';

const MegaDraw = () => {
    const [participants, setParticipants] = useState([]);
    const [winners, setWinners] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const p = await getParticipants();
        // Get only non-drawn participants
        setParticipants(p);
    };

    const handleMegaDraw = async () => {
        if (!confirm('Are you sure you want to start the Mega Draw? This will select 29 winners!')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Get all eligible participants from IndexedDB
            let eligibleParticipants = await IDB.getAllParticipants(true);

            // Check if we have enough participants
            const requiredParticipants = 1 + 3 + 25;
            if (eligibleParticipants.length < requiredParticipants) {
                throw new Error(`Not enough participants. Required: ${requiredParticipants}, Available: ${eligibleParticipants.length}`);
            }

            // Shuffle participants (Fisher-Yates shuffle)
            for (let i = eligibleParticipants.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [eligibleParticipants[i], eligibleParticipants[j]] = [eligibleParticipants[j], eligibleParticipants[i]];
            }

            // Select winners
            const firstPrizeWinners = eligibleParticipants.slice(0, 1);
            const secondPrizeWinners = eligibleParticipants.slice(1, 4);
            const thirdPrizeWinners = eligibleParticipants.slice(4, 29);

            const allWinners = [
                ...firstPrizeWinners.map(w => ({ ...w, prizeRank: '1st Prize' })),
                ...secondPrizeWinners.map(w => ({ ...w, prizeRank: '2nd Prize' })),
                ...thirdPrizeWinners.map(w => ({ ...w, prizeRank: '3rd Prize' }))
            ];

            // Save winners to draw history and mark as drawn
            const now = new Date();
            const drawDate = now.toLocaleDateString();
            const drawTime = now.toLocaleTimeString();

            for (const winner of allWinners) {
                // Mark as drawn
                await IDB.updateParticipant(winner.id, { isDrawn: true });

                // Add to history
                await IDB.addToDrawHistory(winner);
            }

            setWinners({
                first: firstPrizeWinners,
                second: secondPrizeWinners,
                third: thirdPrizeWinners
            });

            await loadData(); // Refresh participants list
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const WinnerCard = ({ winner, rank }) => (
        <div className="glass-card fade-in" style={{ marginBottom: '1rem' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--festive-gold)', marginBottom: '0.25rem' }}>
                        {rank} 🏆 {winner.fullName}
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                        📞 {winner.phone}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                        🏢 {winner.divisonalOffice}
                    </p>
                </div>
                <div className="badge badge-gold">
                    {winner.ticketNumber}
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
            <Navbar />

            <div className="container" style={{ marginTop: '2rem' }}>
                <div className="text-center" style={{ marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '3rem',
                        background: 'linear-gradient(135deg, var(--festive-gold), var(--crimson-red))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '1rem'
                    }}>
                        🌟 Mega Draw Event 🌟
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                        Grand Prize Selection for 1st, 2nd, and 3rd Place Winners
                    </p>
                </div>

                {!winners && (
                    <div className="glass-card text-center" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎰</div>
                        <h2 style={{ marginBottom: '1rem' }}>Ready to Draw?</h2>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
                            Available Participants: <strong style={{ color: 'var(--festive-gold)' }}>{participants.length}</strong>
                        </p>

                        {error && (
                            <div className="alert alert-error" style={{
                                background: 'rgba(255, 0, 0, 0.1)',
                                color: '#ff4444',
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '1.5rem'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            onClick={handleMegaDraw}
                            disabled={loading || participants.length < 29}
                            className="btn btn-gold"
                            style={{
                                fontSize: '1.2rem',
                                padding: '1rem 3rem',
                                opacity: (loading || participants.length < 29) ? 0.5 : 1
                            }}
                        >
                            {loading ? 'Running Draw...' : '🚀 Start Mega Draw'}
                        </button>

                        {participants.length < 29 && (
                            <p style={{ marginTop: '1rem', color: '#ff4444', fontSize: '0.9rem' }}>
                                * Minimum 29 participants required
                            </p>
                        )}
                    </div>
                )}

                {winners && (
                    <div className="fade-in">
                        <div className="text-center" style={{ marginBottom: '3rem' }}>
                            <button
                                onClick={() => setWinners(null)}
                                className="btn btn-outline"
                                style={{ marginBottom: '2rem' }}
                            >
                                🔄 Reset View
                            </button>
                        </div>

                        {/* 1st Prize */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h2 className="text-center" style={{
                                color: 'var(--festive-gold)',
                                fontSize: '2.5rem',
                                marginBottom: '1.5rem',
                                textShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                            }}>
                                🥇 1st Prize Winner (1)
                            </h2>
                            <div className="grid grid-3">
                                {winners.first.map((w, i) => (
                                    <WinnerCard key={i} winner={w} rank="1st Prize" />
                                ))}
                            </div>
                        </div>

                        {/* 2nd Prize */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h2 className="text-center" style={{
                                color: 'silver',
                                fontSize: '2.2rem',
                                marginBottom: '1.5rem',
                                textShadow: '0 0 20px rgba(192, 192, 192, 0.3)'
                            }}>
                                🥈 2nd Prize Winners (3)
                            </h2>
                            <div className="grid grid-3">
                                {winners.second.map((w, i) => (
                                    <WinnerCard key={i} winner={w} rank="2nd Prize" />
                                ))}
                            </div>
                        </div>

                        {/* 3rd Prize */}
                        <div>
                            <h2 className="text-center" style={{
                                color: '#cd7f32',
                                fontSize: '2rem',
                                marginBottom: '1.5rem',
                                textShadow: '0 0 20px rgba(205, 127, 50, 0.3)'
                            }}>
                                🥉 3rd Prize Winners (25)
                            </h2>
                            <div className="grid grid-3">
                                {winners.third.map((w, i) => (
                                    <WinnerCard key={i} winner={w} rank="3rd Prize" />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MegaDraw;
