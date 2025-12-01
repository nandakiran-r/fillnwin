import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate a small delay for better UX
        setTimeout(() => {
            const result = login(credentials.username, credentials.password);

            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error);
                setLoading(false);
            }
        }, 500);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            backgroundImage: 'url(/christmas-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(5px)',
                zIndex: 0
            }}></div>

            <div className="festive-card fade-in" style={{
                maxWidth: '450px',
                width: '100%',
                zIndex: 1
            }}>
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
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        🎄 FillNWin
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Admin Dashboard
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Christmas New Year Bonanza 2025
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="alert alert-error fade-in">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Enter username"
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-gold"
                        disabled={loading}
                        style={{
                            width: '100%',
                            fontSize: '1.1rem',
                            marginTop: '1rem'
                        }}
                    >
                        {loading ? '🔄 Logging in...' : '🎁 Login to Dashboard'}
                    </button>
                </form>

                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'rgba(255, 215, 0, 0.1)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255, 215, 0, 0.2)'
                }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                        💡 <strong>Default Credentials:</strong><br />
                        Username: <code style={{ color: 'var(--festive-gold)' }}>admin</code><br />
                        Password: <code style={{ color: 'var(--festive-gold)' }}>fillnwin2025</code>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
