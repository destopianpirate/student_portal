import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { getAvatarUrl } from './utils/avatarUtils';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CommandPalette from './components/CommandPalette';
import { Menu, X, Sun, Moon } from 'lucide-react';
import ToastContainer from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfileSetupPage from './pages/ProfileSetupPage';

// Lazy-loaded pages
const TimetablePage = lazy(() => import('./pages/TimetablePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AcademicsPage = lazy(() => import('./pages/AcademicsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const StudyAIPage = lazy(() => import('./pages/StudyAIPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const CertificatesPage = lazy(() => import('./pages/CertificatesPage'));

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
  const { currentUser, userProfile, loading } = useAuth();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; } catch { return false; }
  });
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

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
            <div className="mobile-app-logo">S</div>
            <span className="mobile-app-name">StudentOS</span>
          </div>
          <div className="mobile-app-actions">
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} title="Toggle theme">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {currentUser && (
              <img 
                src={getAvatarUrl(userProfile, currentUser.email)} 
                alt="Profile" 
                className="mobile-avatar"
                onClick={() => navigate('/settings')}
              />
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
                  <Route path="/profile-setup" element={<PageWrapper><ProfileSetupPage /></PageWrapper>} />
                  <Route path="/timetable" element={<PageWrapper><TimetablePage /></PageWrapper>} />
                  <Route path="/explore" element={<PageWrapper><ExplorePage /></PageWrapper>} />
                  <Route path="/settings" element={<PageWrapper><SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} /></PageWrapper>} />
                  <Route path="/academics" element={<PageWrapper><AcademicsPage /></PageWrapper>} />
                  <Route path="/notifications" element={<PageWrapper><NotificationsPage /></PageWrapper>} />
                  <Route path="/study-tools" element={<PageWrapper><StudyAIPage /></PageWrapper>} />
                  <Route path="/admin" element={<PageWrapper><AdminPage /></PageWrapper>} />
                  <Route path="/calendar" element={<PageWrapper><CalendarPage /></PageWrapper>} />
                  <Route path="/notes" element={<PageWrapper><NotesPage /></PageWrapper>} />
                  <Route path="/projects" element={<PageWrapper><ProjectsPage /></PageWrapper>} />
                  <Route path="/certificates" element={<PageWrapper><CertificatesPage /></PageWrapper>} />
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
      <ToastContainer />
    </>
  );
}

export default App;
