import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { getAvatarUrl } from './utils/avatarUtils';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CommandPalette from './components/CommandPalette';
import LogoutConfirmModal from './components/LogoutConfirmModal';
import { Menu, X, Sun, Moon, Settings, LogOut } from 'lucide-react';
import ToastContainer from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

const withSuspense = (Component) => {
  return (props) => (
    <Suspense fallback={<LazyFallback />}>
      <Component {...props} />
    </Suspense>
  );
};

// Lazy-loaded pages
const TimetablePage = withSuspense(lazy(() => import('./pages/TimetablePage')));
const ExplorePage = withSuspense(lazy(() => import('./pages/ExplorePage')));
const SettingsPage = withSuspense(lazy(() => import('./pages/SettingsPage')));
const AcademicsPage = withSuspense(lazy(() => import('./pages/AcademicsPage')));
const NotificationsPage = withSuspense(lazy(() => import('./pages/NotificationsPage')));
const StudyAIPage = withSuspense(lazy(() => import('./pages/StudyAIPage')));
const AdminPage = withSuspense(lazy(() => import('./pages/AdminPage')));
const CalendarPage = withSuspense(lazy(() => import('./pages/CalendarPage')));
const NotesPage = withSuspense(lazy(() => import('./pages/NotesPage')));
const ProjectsPage = withSuspense(lazy(() => import('./pages/ProjectsPage')));
const CertificatesPage = withSuspense(lazy(() => import('./pages/CertificatesPage')));

const PageWrapper = ({ children }) => (
  <motion.div
    className="route-transition-wrapper"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
  >
    {children}
  </motion.div>
);

const LazyFallback = () => (
  <div className="lazy-fallback">
    <div className="loading-spinner" />
  </div>
);

// Pages that don't use the sidebar
const GUEST_PATHS = ['/login', '/signup', '/profile-setup'];

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile, logout, loading, showLogoutConfirm, setShowLogoutConfirm } = useAuth();
  
  const handleActualLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate('/');
  };
  const [darkMode, rawSetDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  
  const savedAccent = userProfile?.preferences?.accent || localStorage.getItem('theme_accent') || 'indigo';

  const setDarkMode = (val) => {
    if (savedAccent === 'black') {
      const targetVal = typeof val === 'function' ? val(darkMode) : val;
      if (targetVal === true) {
        return;
      }
    }
    rawSetDarkMode(val);
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; } catch { return false; }
  });
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    const link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = darkMode ? "/logo_dark.png" : "/logo_light.png";
    }
  }, [darkMode]);

  useEffect(() => {
    const savedAccent = userProfile?.preferences?.accent || localStorage.getItem('theme_accent') || 'indigo';
    if (savedAccent === 'black' && darkMode) {
      rawSetDarkMode(false);
    }
    const presets = {
      indigo: { primary: '#6366f1', hover: '#4f46e5', accent: '#ec4899' },
      emerald: { primary: '#10b981', hover: '#059669', accent: '#3b82f6' },
      black: { primary: '#000000', hover: '#18181b', accent: '#71717a' },
      orange: { primary: '#f59e0b', hover: '#d97706', accent: '#10b981' },
      pink: { primary: '#ec4899', hover: '#db2777', accent: '#8b5cf6' },
      blue: { primary: '#0284c7', hover: '#0369a1', accent: '#f59e0b' }
    };
    const selected = presets[savedAccent] || presets.indigo;
    const root = document.documentElement;
    root.style.setProperty('--primary', selected.primary);
    root.style.setProperty('--primary-hover', selected.hover);
    root.style.setProperty('--accent', selected.accent);
  }, [userProfile, darkMode]);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);


  // Global Ctrl+K handler
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Mouse tracking for CSS spotlight effects
  useEffect(() => {
    const handler = (e) => {
      document.documentElement.style.setProperty('--mouse-x', e.clientX);
      document.documentElement.style.setProperty('--mouse-y', e.clientY);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Scroll progress bar
  useEffect(() => {
    const handler = () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isGuestPage = GUEST_PATHS.includes(location.pathname);
  const showSidebar = currentUser && !isGuestPage && !loading;

  // For landing page (unauthenticated on /), show navbar instead of sidebar
  const showGuestNav = !currentUser && location.pathname === '/';

  return (
    <>
      <div className="scroll-progress-bar" />
      <div className="cursor-follower" />

      {showGuestNav && <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />}

      {showSidebar && (
        <header className="mobile-app-header">
          <button 
            className="mobile-menu-toggle-btn"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            aria-label="Toggle Menu"
          >
            {mobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="mobile-app-brand" onClick={() => navigate('/')}>
            <div className="mobile-app-logo" style={{ overflow: "hidden", background: "none" }}>
              <img src={darkMode ? "/logo_dark.png" : "/logo_light.png"} alt="AcadX Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span className="mobile-app-name">AcadX</span>
          </div>
          <div className="mobile-app-actions" style={{ position: 'relative' }}>
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} title="Toggle theme">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {currentUser && (
              <div className="mobile-profile-menu-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <img 
                  src={getAvatarUrl(userProfile, currentUser.email)} 
                  alt="Profile" 
                  className="mobile-avatar"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  style={{ cursor: 'pointer' }}
                />
                <AnimatePresence>
                  {profileMenuOpen && (
                    <>
                      <div 
                        style={{ position: 'fixed', inset: 0, zIndex: 999 }} 
                        onClick={() => setProfileMenuOpen(false)} 
                      />
                      <motion.div 
                        className="mobile-profile-dropdown glass-card"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: '0.5rem',
                          width: '160px',
                          background: 'var(--card-bg)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          boxShadow: 'var(--shadow-lg)',
                          padding: '0.4rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                          zIndex: 1000
                        }}
                      >
                        <button 
                          className="profile-menu-dropdown-item" 
                          onClick={() => { setProfileMenuOpen(false); navigate('/settings'); }}
                        >
                          <Settings size={14} /> Settings
                        </button>
                        <button 
                          className="profile-menu-dropdown-item text-danger" 
                          onClick={() => { setProfileMenuOpen(false); setShowLogoutConfirm(true); }}
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>
      )}

      <div className={`app-layout ${showSidebar ? 'with-sidebar' : 'no-sidebar'} ${showGuestNav ? 'with-guest-nav' : ''}`}>
        {showSidebar && (
          <Sidebar
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            mobileOpen={mobileSidebarOpen}
            setMobileOpen={setMobileSidebarOpen}
            onOpenCommandPalette={() => setCmdOpen(true)}
          />
        )}
        <main className={`main-content ${showSidebar ? (sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded') : ''}`}>
          <ErrorBoundary>
            <Suspense fallback={<LazyFallback />}>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
                  <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
                  <Route path="/signup" element={<PageWrapper><SignupPage /></PageWrapper>} />
                  <Route path="/profile-setup" element={<ProtectedRoute><PageWrapper><ProfileSetupPage /></PageWrapper></ProtectedRoute>} />
                  <Route path="/timetable" element={<ProtectedRoute><PageWrapper><TimetablePage /></PageWrapper></ProtectedRoute>} />
                  <Route path="/explore" element={<ProtectedRoute><PageWrapper><ExplorePage /></PageWrapper></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><PageWrapper><SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} /></PageWrapper></ProtectedRoute>} />
                  <Route path="/academics" element={<ProtectedRoute><PageWrapper><AcademicsPage /></PageWrapper></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><PageWrapper><NotificationsPage /></PageWrapper></ProtectedRoute>} />
                  <Route path="/study-tools" element={<ProtectedRoute><PageWrapper><StudyAIPage /></PageWrapper></ProtectedRoute>} />
                  <Route path="/admin" element={<AdminRoute><PageWrapper><AdminPage /></PageWrapper></AdminRoute>} />
                  <Route path="/calendar" element={<ProtectedRoute><PageWrapper><CalendarPage /></PageWrapper></ProtectedRoute>} />
                  <Route path="/notes" element={<ProtectedRoute><PageWrapper><NotesPage /></PageWrapper></ProtectedRoute>} />
                  <Route path="/projects" element={<ProtectedRoute><PageWrapper><ProjectsPage /></PageWrapper></ProtectedRoute>} />
                  <Route path="/certificates" element={<ProtectedRoute><PageWrapper><CertificatesPage /></PageWrapper></ProtectedRoute>} />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {showSidebar && mobileSidebarOpen && (
        <div className="mobile-sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Mobile sidebar toggle button is now integrated into the mobile-app-header */}

      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} darkMode={darkMode} setDarkMode={setDarkMode} />
      <AnimatePresence>
        {showLogoutConfirm && (
          <LogoutConfirmModal 
            isOpen={showLogoutConfirm} 
            onClose={() => setShowLogoutConfirm(false)} 
            onConfirm={handleActualLogout} 
          />
        )}
      </AnimatePresence>
      <ToastContainer />
    </>
  );
}

export default App;
