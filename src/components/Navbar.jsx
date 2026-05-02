import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Calendar, BookOpen, Compass, Settings, Sun, Moon, LogIn, User, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ darkMode, setDarkMode }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/timetable', icon: Calendar, label: 'Timetable' },
    { to: '/explore', icon: Compass, label: 'Explore' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const avatarUrl = userProfile?.customPhotoUrl || userProfile?.avatarUrl || 
    `https://api.dicebear.com/9.x/thumbs/svg?seed=${currentUser?.email || 'default'}`;

  return (
    <nav className="portal-navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
            {navLinks.map(({ to, icon: Icon, label }) => (
              <NavLink 
                key={to} 
                to={to} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="navbar-right">
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} title="Toggle theme">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {currentUser ? (
            <div className="navbar-profile" onClick={() => navigate('/settings')}>
              <img src={avatarUrl} alt="Profile" className="navbar-avatar" />
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
              <LogIn size={16} /> Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
