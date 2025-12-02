import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getParticipants } from '../utils/storage';

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
        // Filter out already drawn participants if needed, but the backend handles it.
        // For UI, we just show total available.
        setParticipants(p.filter(p => !p.isDrawn));
    };

    const handleMegaDraw = async () => {
        if (!confirm('Are you sure you want to start the Mega Draw? This will select 87 winners!')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/draws/mega`, {
                method: 'POST',
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to conduct mega draw');
            }

            setWinners(data.winners);
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
                        {rank} 🏆 {winner.full_name || winner.fullName}
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                        📞 {winner.phone}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                        🏢 {winner.divisonal_office || winner.divisonalOffice}
                    </p>
                </div>
                <div className="badge badge-gold">
                    {winner.ticket_number || winner.ticketNumber}
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
                            disabled={loading || participants.length < 87}
                            className="btn btn-gold"
                            style={{
                                fontSize: '1.2rem',
                                padding: '1rem 3rem',
                                opacity: (loading || participants.length < 87) ? 0.5 : 1
                            }}
                        >
                            {loading ? 'Running Draw...' : '🚀 Start Mega Draw'}
                        </button>

                        {participants.length < 87 && (
                            <p style={{ marginTop: '1rem', color: '#ff4444', fontSize: '0.9rem' }}>
                                * Minimum 87 participants required
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
                                🥇 1st Prize Winners (3)
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
                                🥈 2nd Prize Winners (9)
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
                                🥉 3rd Prize Winners (75)
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
