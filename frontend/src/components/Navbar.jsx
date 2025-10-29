// Navbar.jsx
import { useAuth } from '../context/AuthContext';
import { useNavbarAction } from '../context/NavbarActionContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; // Import the logo
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { action } = useNavbarAction();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-action-left">
          {action}
        </div>
        <div className="navbar-brand" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <img src={logo} alt="Mailam Engineering College Logo" style={{ height: '50px', width: 'auto' }} />
        </div>
        <div className="navbar-user" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="user-name" style={{ fontSize: '0.9rem' }}>{user?.name}</span>
          <span className="user-role" style={{ fontSize: '0.8rem', opacity: 0.8 }}>{user?.role}</span>
          <button className="btn-logout" onClick={handleLogout} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;