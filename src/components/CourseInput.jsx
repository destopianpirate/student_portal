import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * CourseInput — Reusable course name/code input with auto-suggest from timetable.
 * 
 * Props:
 *  - value: string (current value)
 *  - onChange: (value: string) => void
 *  - placeholder?: string
 *  - className?: string
 *  - showCode?: boolean (show course code in suggestions)
 */
const CourseInput = ({ value, onChange, placeholder = 'Course name', className = '', showCode = true }) => {
  const { currentUser, userProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Get courses from user's timetable (localStorage or profile)
  const savedCourses = useMemo(() => {
    if (!currentUser) return [];
    try {
      const local = localStorage.getItem(`courses_${currentUser.uid}`);
      if (local) return JSON.parse(local);
    } catch { /* ignore */ }
    return userProfile?.selectedCourses || [];
  }, [currentUser, userProfile]);

  // Filter suggestions based on query
  const suggestions = useMemo(() => {
    if (!query.trim()) return savedCourses;
    const q = query.toLowerCase();
    return savedCourses.filter(c =>
      (c.title || '').toLowerCase().includes(q) ||
      (c.code || '').toLowerCase().includes(q)
    );
  }, [savedCourses, query]);

  // Sync external value changes
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (course) => {
    const val = showCode ? `${course.code} — ${course.title}` : course.title;
    setQuery(val);
    onChange(val);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    if (!open && val.length > 0) setOpen(true);
  };

  return (
    <div className={`course-input-wrapper ${className}`} ref={wrapperRef}>
      <div className="course-input-field">
        <BookOpen size={14} className="course-input-icon" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="course-input-text"
          autoComplete="off"
        />
        {savedCourses.length > 0 && (
          <button 
            type="button" 
            className="course-input-toggle"
            onClick={() => { setOpen(!open); inputRef.current?.focus(); }}
          >
            <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="course-suggestions-dropdown">
          {suggestions.map((c, i) => (
            <button
              key={`${c.code}-${i}`}
              type="button"
              className="course-suggestion-item"
              onClick={() => handleSelect(c)}
            >
              <span className="course-sug-code">{c.code}</span>
              <span className="course-sug-title">{c.title}</span>
              {c.credits && <span className="course-sug-credits">{c.credits}cr</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseInput;
