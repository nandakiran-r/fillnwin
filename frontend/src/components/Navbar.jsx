import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../utils/auth';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        const result = logout();
        if (result.success) {
            navigate('/', { replace: true });
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav style={{
            background: 'rgba(42, 36, 96, 0.8)',
            borderBottom: '1px solid rgba(107, 141, 255, 0.25)',
            padding: '1rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            fontFamily: "'Roboto', sans-serif"
        }}>
            <div className="container flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={{
                        fontSize: '1.4rem',
                        color: '#e0e7ff',
                        margin: 0,
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: '700',
                        letterSpacing: '0.5px'
                    }}>
                        Mega Draw Admin
                    </h2>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Link
                        to="/dashboard"
                        style={{
                            padding: '0.65rem 1.25rem',
                            fontSize: '0.95rem',
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: '500',
                            color: isActive('/dashboard') ? '#ffffff' : '#b4b8e0',
                            background: isActive('/dashboard') ? 'rgba(107, 141, 255, 0.3)' : 'transparent',
                            border: isActive('/dashboard') ? '1px solid rgba(107, 141, 255, 0.5)' : '1px solid rgba(107, 141, 255, 0.2)',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'inline-block'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(107, 141, 255, 0.25)';
                            e.currentTarget.style.color = '#e0e7ff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = isActive('/dashboard') ? 'rgba(107, 141, 255, 0.3)' : 'transparent';
                            e.currentTarget.style.color = isActive('/dashboard') ? '#ffffff' : '#b4b8e0';
                        }}
                    >
                        Dashboard
                    </Link>

                    <Link
                        to="/upload"
                        style={{
                            padding: '0.65rem 1.25rem',
                            fontSize: '0.95rem',
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: '500',
                            color: isActive('/upload') ? '#ffffff' : '#b4b8e0',
                            background: isActive('/upload') ? 'rgba(107, 141, 255, 0.3)' : 'transparent',
                            border: isActive('/upload') ? '1px solid rgba(107, 141, 255, 0.5)' : '1px solid rgba(107, 141, 255, 0.2)',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'inline-block'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(107, 141, 255, 0.25)';
                            e.currentTarget.style.color = '#e0e7ff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = isActive('/upload') ? 'rgba(107, 141, 255, 0.3)' : 'transparent';
                            e.currentTarget.style.color = isActive('/upload') ? '#ffffff' : '#b4b8e0';
                        }}
                    >
                        Upload
                    </Link>

                    <Link
                        to="/coupon-draw"
                        style={{
                            padding: '0.65rem 1.25rem',
                            fontSize: '0.95rem',
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: '500',
                            color: isActive('/coupon-draw') ? '#ffffff' : '#b4b8e0',
                            background: isActive('/coupon-draw') ? 'rgba(107, 141, 255, 0.3)' : 'transparent',
                            border: isActive('/coupon-draw') ? '1px solid rgba(107, 141, 255, 0.5)' : '1px solid rgba(107, 141, 255, 0.2)',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'inline-block'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(107, 141, 255, 0.25)';
                            e.currentTarget.style.color = '#e0e7ff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = isActive('/coupon-draw') ? 'rgba(107, 141, 255, 0.3)' : 'transparent';
                            e.currentTarget.style.color = isActive('/coupon-draw') ? '#ffffff' : '#b4b8e0';
                        }}
                    >
                        Coupon Draw
                    </Link>

                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '0.65rem 1.25rem',
                            fontSize: '0.95rem',
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: '600',
                            color: '#ffffff',
                            background: 'rgba(107, 141, 255, 0.35)',
                            border: '1px solid rgba(107, 141, 255, 0.4)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(107, 141, 255, 0.5)';
                            e.currentTarget.style.borderColor = 'rgba(107, 141, 255, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(107, 141, 255, 0.35)';
                            e.currentTarget.style.borderColor = 'rgba(107, 141, 255, 0.4)';
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
