import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../utils/auth';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        const result = logout();
        if (result.success) {
            // Use replace to avoid navigation stack issues
            navigate('/', { replace: true });
        }
    };

    return (
        <nav style={{
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
            padding: '1rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        background: 'linear-gradient(135deg, var(--festive-gold), var(--crimson-red))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        margin: 0
                    }}>
                        🎄 FillNWin Admin
                    </h2>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link
                        to="/dashboard"
                        className={`btn btn-outline ${location.pathname === '/dashboard' ? 'active' : ''}`}
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem',
                            ...(location.pathname === '/dashboard' && {
                                background: 'var(--festive-gold)',
                                color: 'var(--deep-red)'
                            })
                        }}
                    >
                        📊 Dashboard
                    </Link>

                    <Link
                        to="/upload"
                        className={`btn btn-outline ${location.pathname === '/upload' ? 'active' : ''}`}
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem',
                            ...(location.pathname === '/upload' && {
                                background: 'var(--festive-gold)',
                                color: 'var(--deep-red)'
                            })
                        }}
                    >
                        📤 Upload
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="btn btn-primary"
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
