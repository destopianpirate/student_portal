import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, LogIn } from 'lucide-react';

const Navbar = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  return (
    <nav className="guest-navbar">
      <div className="guest-navbar-inner">
        <div className="guest-navbar-brand" onClick={() => navigate('/')}>
          <div className="guest-navbar-logo" style={{ overflow: "hidden" }}><img src="/logo.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
          <span className="guest-navbar-name">AcadX</span>
        </div>
        <div className="guest-navbar-actions">
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} title="Toggle theme">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>
            <LogIn size={16} /> Login
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
