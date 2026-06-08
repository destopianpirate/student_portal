import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Home, Calendar, GraduationCap, Brain, Compass, Settings, StickyNote, BarChart3, FolderKanban, BookMarked, Award, Wrench, Bell, Shield, Moon, Sun, LogOut, ArrowRight, Command } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PAGES = [
  { name: 'Dashboard', path: '/', icon: Home, keywords: ['home', 'dashboard', 'overview'] },
  { name: 'Timetable', path: '/timetable', icon: Calendar, keywords: ['timetable', 'schedule', 'classes'] },
  { name: 'Academics', path: '/academics', icon: GraduationCap, keywords: ['academics', 'grades', 'attendance', 'goals', 'courses', 'gpa'] },
  { name: 'Calendar', path: '/calendar', icon: Calendar, keywords: ['calendar', 'holidays', 'events', 'academic calendar'] },
  { name: 'Notes', path: '/notes', icon: StickyNote, keywords: ['notes', 'notebook', 'write'] },
  { name: 'A.R.A.I.', path: '/study-tools', icon: Brain, keywords: ['ai', 'study', 'flashcards', 'pomodoro', 'summarizer', 'arai'] },
  { name: 'Projects', path: '/projects', icon: FolderKanban, keywords: ['projects', 'kanban', 'tasks'] },
  { name: 'Certificates', path: '/certificates', icon: Award, keywords: ['certificates', 'certifications', 'achievements'] },
  { name: 'Explore', path: '/explore', icon: Compass, keywords: ['explore', 'discover'] },
  { name: 'Notifications', path: '/notifications', icon: Bell, keywords: ['notifications', 'alerts'] },
  { name: 'Settings', path: '/settings', icon: Settings, keywords: ['settings', 'profile', 'preferences'] },
];

const ACTIONS = [
  { name: 'Toggle Dark Mode', action: 'toggle-theme', icon: Moon, keywords: ['dark', 'light', 'theme', 'mode'] },
  { name: 'Logout', action: 'logout', icon: LogOut, keywords: ['logout', 'sign out', 'exit'] },
];

const CommandPalette = ({ isOpen, onClose, darkMode, setDarkMode }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { logout, setShowLogoutConfirm } = useAuth();

  // Filter results
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const pages = q
      ? PAGES.filter(p => p.name.toLowerCase().includes(q) || p.keywords.some(k => k.includes(q)))
      : PAGES;
    const actions = q
      ? ACTIONS.filter(a => a.name.toLowerCase().includes(q) || a.keywords.some(k => k.includes(q)))
      : ACTIONS;
    return { pages, actions, all: [...pages, ...actions] };
  }, [query]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.all.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results.all[selectedIndex]) {
        e.preventDefault();
        executeItem(results.all[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, selectedIndex, results]);

  const executeItem = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.action === 'toggle-theme') {
      setDarkMode(!darkMode);
    } else if (item.action === 'logout') {
      setShowLogoutConfirm(true);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="cmd-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            className="cmd-palette"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cmd-search-row">
              <Search size={18} className="cmd-search-icon" />
              <input
                ref={inputRef}
                type="text"
                className="cmd-search-input"
                placeholder="Search pages, actions..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              />
              <kbd className="cmd-esc">ESC</kbd>
            </div>

            <div className="cmd-results">
              {results.pages.length > 0 && (
                <div className="cmd-section">
                  <div className="cmd-section-label">Pages</div>
                  {results.pages.map((item, i) => {
                    const Icon = item.icon;
                    const globalIdx = i;
                    return (
                      <button
                        key={item.path}
                        className={`cmd-item ${selectedIndex === globalIdx ? 'selected' : ''}`}
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      >
                        <Icon size={16} className="cmd-item-icon" />
                        <span className="cmd-item-name">{item.name}</span>
                        <ArrowRight size={12} className="cmd-item-arrow" />
                      </button>
                    );
                  })}
                </div>
              )}
              {results.actions.length > 0 && (
                <div className="cmd-section">
                  <div className="cmd-section-label">Actions</div>
                  {results.actions.map((item, i) => {
                    const Icon = item.icon;
                    const globalIdx = results.pages.length + i;
                    return (
                      <button
                        key={item.action}
                        className={`cmd-item ${selectedIndex === globalIdx ? 'selected' : ''}`}
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      >
                        <Icon size={16} className="cmd-item-icon" />
                        <span className="cmd-item-name">{item.name}</span>
                        <ArrowRight size={12} className="cmd-item-arrow" />
                      </button>
                    );
                  })}
                </div>
              )}
              {results.all.length === 0 && (
                <div className="cmd-empty">No results found for "{query}"</div>
              )}
            </div>

            <div className="cmd-footer">
              <span><kbd>↑↓</kbd> Navigate</span>
              <span><kbd>↵</kbd> Select</span>
              <span><kbd>esc</kbd> Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
