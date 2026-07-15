import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, GraduationCap, Brain, Compass, Settings, Bell, Sun, Moon, LogOut, ChevronLeft, ChevronRight, Search, Shield, StickyNote, BarChart3, FolderKanban, BookMarked, Award, Wrench, Command } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useCalendar } from '../contexts/CalendarContext';
import { getAvatarUrl, getPhotoPosition } from '../utils/avatarUtils';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ darkMode, setDarkMode, collapsed, setCollapsed, mobileOpen, onOpenCommandPalette }) => {
  const { currentUser, userProfile, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const { hasEventsOnDate, nextHoliday, getEventsForDate } = useCalendar();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [miniCalDate, setMiniCalDate] = useState(() => new Date());
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const avatarUrl = getAvatarUrl(userProfile, currentUser?.email);
  const photoPosition = getPhotoPosition(userProfile);

  // Mini calendar for current month
  const miniCalDays = useMemo(() => {
    const year = miniCalDate.getFullYear();
    const month = miniCalDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const todayDate = new Date();
    const todayYear = todayDate.getFullYear();
    const todayMonth = todayDate.getMonth();
    const todayDay = todayDate.getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = getEventsForDate ? getEventsForDate(dateStr) : null;
      const allEvents = dayEvents ? dayEvents.all : [];
      const tooltip = allEvents.length > 0 
        ? allEvents.map(e => e.name || e.title).join('\n')
        : 'No events';

      days.push({ 
        day: d, 
        dateStr, 
        isToday: year === todayYear && month === todayMonth && d === todayDay, 
        eventType: hasEventsOnDate(dateStr),
        tooltip
      });
    }
    return days;
  }, [miniCalDate, hasEventsOnDate, getEventsForDate]);

  const navItems = [
    { to: '/timetable', icon: Calendar, label: 'Timetable', shortcut: '2' },
    { to: '/academics', icon: GraduationCap, label: 'Academics', shortcut: '3' },
    { to: '/calendar', icon: Calendar, label: 'Calendar', shortcut: '4' },
    { to: '/notes', icon: StickyNote, label: 'Notes', shortcut: '5' },
    { to: '/study-tools', icon: Brain, label: 'AI Tools', shortcut: '6' },
    { to: '/projects', icon: FolderKanban, label: 'Projects', shortcut: '7' },
    { to: '/certificates', icon: Award, label: 'Certificates', shortcut: '' },
    { to: '/explore', icon: Compass, label: 'Explore', shortcut: '' },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin', icon: Shield, label: 'Admin', shortcut: '' });
  }

  const miniCalMonthName = useMemo(() => {
    return miniCalDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [miniCalDate]);

  const effectiveCollapsed = collapsed;

  return (
    <motion.aside
      className={`sidebar ${effectiveCollapsed ? 'collapsed' : 'expanded'} ${mobileOpen ? 'mobile-open' : ''}`}
      animate={{ width: isMobile ? 260 : (effectiveCollapsed ? 68 : 260) }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Sidebar Header (Fixed at the top) */}
      <div className="sidebar-header">
        {/* User Profile Card */}
        {currentUser && (
          <div className="sidebar-user-card top-profile" onClick={() => navigate('/settings')} title={effectiveCollapsed ? (userProfile?.name || currentUser.displayName || 'Profile') : undefined}>
            <img src={avatarUrl} alt="" className="sidebar-user-avatar" style={{ objectPosition: photoPosition }} />
            {!effectiveCollapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{userProfile?.name || currentUser.displayName || 'Student'}</div>
                <div className="sidebar-user-role">{userProfile?.branch?.substring(0, 25) || 'Student'}</div>
              </div>
            )}
            {!effectiveCollapsed && (
              <button className="sidebar-logout-btn" onClick={(e) => { e.stopPropagation(); handleLogout(); }} title="Logout">
                <LogOut size={14} />
              </button>
            )}
          </div>
        )}

        {/* Home Button */}
        <NavLink
          to="/"
          className={({ isActive }) => `sidebar-link sidebar-home-link ${isActive ? 'active' : ''}`}
          title={effectiveCollapsed ? 'Dashboard' : undefined}
        >
          <div className="sidebar-link-icon"><Home size={18} /></div>
          {!effectiveCollapsed && (
            <>
              <span className="sidebar-link-label">Dashboard</span>
              <kbd className="sidebar-shortcut">1</kbd>
            </>
          )}
          {effectiveCollapsed && <div className="sidebar-tooltip">Dashboard</div>}
        </NavLink>

        {/* Command Palette Trigger */}
        <button className="sidebar-search-btn" onClick={onOpenCommandPalette} title="Search (Ctrl+K)">
          <Search size={16} />
          {!effectiveCollapsed && (
            <>
              <span>Search...</span>
              <kbd className="sidebar-kbd">⌘K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Navigation (Scrollable) */}
      <nav className="sidebar-nav">
        {!effectiveCollapsed && <div className="sidebar-nav-label">Navigation</div>}
        {navItems.map(({ to, icon: Icon, label, shortcut }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={effectiveCollapsed ? label : undefined}
          >
            <div className="sidebar-link-icon"><Icon size={18} /></div>
            {!effectiveCollapsed && (
              <>
                <span className="sidebar-link-label">{label}</span>
                {shortcut && <kbd className="sidebar-shortcut">{shortcut}</kbd>}
              </>
            )}
            {effectiveCollapsed && <div className="sidebar-tooltip">{label}</div>}
          </NavLink>
        ))}
      </nav>

      {/* Mini Calendar (only when expanded) */}
      {!effectiveCollapsed && (
        <div className="sidebar-mini-calendar">
          <div className="mini-cal-month-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', padding: '0 2px' }}>
            <button 
              type="button"
              onClick={() => setMiniCalDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 6px', display: 'flex', alignItems: 'center' }}
              title="Previous Month"
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--primary)', letterSpacing: '.03em', textTransform: 'uppercase' }}>
              {miniCalMonthName}
            </span>
            <button 
              type="button"
              onClick={() => setMiniCalDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 6px', display: 'flex', alignItems: 'center' }}
              title="Next Month"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="mini-cal-grid">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="mini-cal-header">{d}</div>
            ))}
            {miniCalDays.map((d, i) => d ? (
              <div
                key={i}
                className={`mini-cal-day ${d.isToday ? 'today' : ''} ${d.eventType ? 'has-event' : ''}`}
                data-event-type={d.eventType || ''}
                title={d.tooltip}
                onClick={() => navigate('/calendar')}
              >
                {d.day}
              </div>
            ) : <div key={i} className="mini-cal-day empty" />)}
          </div>
          {nextHoliday && (
            <div className="mini-cal-next-holiday" onClick={() => navigate('/calendar')}>
              🎉 {nextHoliday.name} — {new Date(nextHoliday.date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      )}

      {/* Bottom Section */}
      <div className="sidebar-bottom" style={{ padding: effectiveCollapsed ? '0.35rem' : '0.5rem 0.75rem' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: effectiveCollapsed ? 'column' : 'row', 
          alignItems: 'center',
          justifyContent: effectiveCollapsed ? 'center' : 'space-between',
          gap: effectiveCollapsed ? '0.15rem' : '0.5rem',
          width: '100%'
        }}>
          {/* Settings */}
          <NavLink 
            to="/settings" 
            className={({ isActive }) => `sidebar-bottom-btn ${isActive ? 'active' : ''}`} 
            title="Settings"
            style={{ 
              width: effectiveCollapsed ? '36px' : '40px', 
              height: effectiveCollapsed ? '36px' : '40px',
              justifyContent: 'center',
              padding: 0,
              borderRadius: '50%',
              flex: 'none'
            }}
          >
            <Settings size={18} />
          </NavLink>

          {/* Theme Toggle */}
          <button 
            className="sidebar-bottom-btn" 
            onClick={() => setDarkMode(!darkMode)} 
            title="Toggle theme"
            style={{ 
              width: effectiveCollapsed ? '36px' : '40px', 
              height: effectiveCollapsed ? '36px' : '40px',
              justifyContent: 'center',
              padding: 0,
              borderRadius: '50%',
              flex: 'none'
            }}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notification */}
          <button 
            className="sidebar-bottom-btn" 
            onClick={() => navigate('/notifications')} 
            title="Notifications"
            style={{ 
              width: effectiveCollapsed ? '36px' : '40px', 
              height: effectiveCollapsed ? '36px' : '40px',
              justifyContent: 'center',
              padding: 0,
              borderRadius: '50%',
              flex: 'none'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span 
                className="sidebar-notif-badge" 
                style={{ 
                  position: 'absolute',
                  top: '4px',
                  left: effectiveCollapsed ? '20px' : '50%',
                  transform: effectiveCollapsed ? 'none' : 'translateX(2px)',
                  margin: 0
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Collapse Toggle */}
          <button 
            className="sidebar-collapse-btn" 
            onClick={() => setCollapsed(!collapsed)} 
            title={collapsed ? 'Expand' : 'Collapse'}
            style={{ 
              width: effectiveCollapsed ? '36px' : '40px', 
              height: effectiveCollapsed ? '36px' : '40px',
              justifyContent: 'center',
              padding: 0,
              borderRadius: '50%',
              margin: 0,
              flex: 'none'
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
