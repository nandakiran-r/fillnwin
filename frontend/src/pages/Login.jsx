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

        try {
            const result = await login(credentials.username, credentials.password);

            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: '#1e187a',
            position: 'relative'
        }}>
            {/* Left Side - Logo Section */}
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                zIndex: 1,
                minHeight: '100vh'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <img
                        src="/indian-oil-logo.png"
                        alt="Indian Oil Logo"
                        style={{
                            height: '300px',
                            marginBottom: '2rem'
                        }}
                    />
                    <p style={{
                        color: '#fff',
                        fontSize: '1.8rem',
                        fontWeight: '600',
                        margin: 0,
                        letterSpacing: '0.5px'
                    }}>
                        Indian Oil Corporation
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form Section */}
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                zIndex: 1,
                minHeight: '100vh'
            }}>
                <div className="festive-card" style={{
                    maxWidth: '420px',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    padding: '2.5rem'
                }}>
                    <div className="text-center" style={{ marginBottom: '2.5rem' }}>
                        <h1 style={{
                            fontSize: '2.2rem',
                            marginBottom: '0.5rem',
                            color: '#1e187a'
                        }}>
                            Mega Draw
                        </h1>
                        <p style={{
                            color: '#333',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem'
                        }}>
                            Admin Dashboard
                        </p>
                        <p style={{
                            color: '#666',
                            fontSize: '0.95rem'
                        }}>
                            Christmas New Year Bonanza 2025
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="alert alert-error" style={{
                                background: 'rgba(220, 53, 69, 0.1)',
                                border: '1px solid rgba(220, 53, 69, 0.5)',
                                color: '#dc3545',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                marginBottom: '1.5rem',
                                fontSize: '0.9rem'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label htmlFor="username" style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: '#333',
                                fontWeight: '600',
                                fontSize: '0.95rem'
                            }}>
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                required
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: '2px solid #ddd',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    background: '#fff',
                                    color: '#333',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#0066FF';
                                    e.target.style.background = '#fff';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#ddd';
                                    e.target.style.background = '#fff';
                                }}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: '2rem' }}>
                            <label htmlFor="password" style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: '#333',
                                fontWeight: '600',
                                fontSize: '0.95rem'
                            }}>
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: '2px solid #ddd',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    background: '#fff',
                                    color: '#333',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#0066FF';
                                    e.target.style.background = '#fff';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#ddd';
                                    e.target.style.background = '#fff';
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.9rem 1.5rem',
                                fontSize: '1.05rem',
                                fontWeight: '600',
                                background: 'linear-gradient(135deg, #0066FF, #0052CC)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                boxShadow: '0 4px 12px rgba(0, 102, 255, 0.3)',
                                letterSpacing: '0.5px'
                            }}
                        >
                            {loading ? '🔄 Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div style={{
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid #eee',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            fontSize: '0.85rem',
                            color: '#666',
                            margin: '0.5rem 0'
                        }}>
                            <strong style={{ color: '#333' }}>Demo Credentials:</strong>
                        </p>
                        <p style={{
                            fontSize: '0.8rem',
                            color: '#666',
                            margin: '0.25rem 0',
                            fontFamily: 'monospace'
                        }}>
                            User: <span style={{ color: '#0066FF', fontWeight: '600' }}>admin</span>
                        </p>
                        <p style={{
                            fontSize: '0.8rem',
                            color: '#666',
                            margin: '0.25rem 0',
                            fontFamily: 'monospace'
                        }}>
                            Pass: <span style={{ color: '#0066FF', fontWeight: '600' }}>fillnwin2025</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
