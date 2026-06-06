import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Eye, MapPin, AlertCircle, Download, ChevronDown, FileSpreadsheet, Image as ImageIcon, File as FileIcon, Search, Trash2, Save, Edit2, Plus, ChevronUp, X, Coffee, Clock, BookOpen, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchAndParseTimetable } from '../utils/parser';
import { exportToExcel } from '../utils/exporter';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const isSlotActive = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return false;
  const parseTime = (t) => {
    if (!t) return 0;
    const m = t.trim().match(/(\d+):(\d+)/);
    if (!m) return 0;
    return parseInt(m[1]) * 60 + parseInt(m[2]);
  };
  const parts = timeStr.split(/[-–—]/).map(s => s.trim());
  if (parts.length < 2) return false;
  
  const startMins = parseTime(parts[0]);
  const endMins = parseTime(parts[1]);
  
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  
  return currentMins >= startMins && currentMins <= endMins;
};

const TimetablePage = () => {
  const { currentUser, userProfile, saveTimetable } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [orderedTimeSlots, setOrderedTimeSlots] = useState([]);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Per-user saved data
  const userKey = currentUser?.uid || 'guest';
  const [savedTimetable, setSavedTimetable] = useState(null);
  const [savedCourses, setSavedCourses] = useState([]);

  const [isEditing, setIsEditing] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeDayTab, setActiveDayTab] = useState('Monday');
  const [mobileViewMode, setMobileViewMode] = useState('list'); // 'list' or 'grid'

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (days.length > 0) {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      if (days.includes(today)) {
        setActiveDayTab(today);
      } else {
        setActiveDayTab(days[0]);
      }
    }
  }, [days]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [showSelectedList, setShowSelectedList] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const timetableRef = useRef(null);



  const hasInitializedSelectedIds = useRef(false);

  // Load per-user saved data
  useEffect(() => {
    try {
      hasInitializedSelectedIds.current = false;
      const tt = localStorage.getItem(`timetable_${userKey}`);
      const sc = localStorage.getItem(`courses_${userKey}`);
      if (tt) { setSavedTimetable(JSON.parse(tt)); setIsEditing(false); }
      else { setSavedTimetable(null); setIsEditing(true); }
      if (sc) setSavedCourses(JSON.parse(sc));
      else setSavedCourses([]);
    } catch { /* ignore */ }
  }, [userKey]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAndParseTimetable(userProfile?.semester);
        setCourses(data.courses); 
        setOrderedTimeSlots(data.orderedTimeSlots); 
        setDays(data.days);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [userProfile?.semester]);

  // Sync selectedIds with savedCourses or userProfile.selectedCourses when courses/savedCourses load
  useEffect(() => {
    if (courses.length === 0 || hasInitializedSelectedIds.current) return;
    const src = savedCourses.length > 0 ? savedCourses : userProfile?.selectedCourses;
    if (src && src.length > 0) {
      // Merge saved custom slots into the main courses list so edits are preserved in catalog selections
      const savedSlotsMap = new Map(src.map(c => [c.code, c.slots]));
      setCourses(prev => prev.map(c => {
        if (savedSlotsMap.has(c.code)) {
          return { ...c, slots: savedSlotsMap.get(c.code) };
        }
        return c;
      }));

      const codes = new Set(src.map(c => c.code));
      setSelectedIds(codes);
      hasInitializedSelectedIds.current = true;
    } else if (savedCourses.length === 0 && !loading) {
      hasInitializedSelectedIds.current = true;
    }
  }, [courses, savedCourses, userProfile, loading]);

  const toggleCourse = (code) => {
    const n = new Set(selectedIds);
    n.has(code) ? n.delete(code) : n.add(code);
    setSelectedIds(n);
  };
  
  const removeCourse = (code) => {
    const n = new Set(selectedIds);
    n.delete(code);
    setSelectedIds(n);
  };

  const handleCancel = () => {
    try {
      const sc = localStorage.getItem(`courses_${userKey}`);
      if (sc) {
        const parsed = JSON.parse(sc);
        setSavedCourses(parsed);
        const codes = new Set(parsed.map(c => c.code));
        setSelectedIds(codes);
      } else {
        setSavedCourses([]);
        setSelectedIds(new Set());
      }
      setIsEditing(false);
      setPreviewMode(false);
    } catch (e) {
      setIsEditing(false);
    }
  };

  const handleDirectRemoveCourse = async (courseCode) => {
    if (window.confirm(`Are you sure you want to remove ${courseCode} from your timetable?`)) {
      if (isEditing) {
        const n = new Set(selectedIds);
        n.delete(courseCode);
        setSelectedIds(n);
      } else {
        const updated = savedCourses.filter(c => c.code.replace(/\s+/g, '').toLowerCase() !== courseCode.replace(/\s+/g, '').toLowerCase());
        const newGrid = buildGrid(updated);
        setSavedCourses(updated);
        setSavedTimetable(newGrid);
        localStorage.setItem(`timetable_${userKey}`, JSON.stringify(newGrid));
        localStorage.setItem(`courses_${userKey}`, JSON.stringify(updated));

        const n = new Set(selectedIds);
        n.delete(courseCode);
        setSelectedIds(n);

        if (currentUser) {
          saveTimetable(newGrid, updated).catch(e => console.warn('Firestore:', e.message));
        }

        confetti({
          particleCount: 60,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#ef4444', '#f59e0b']
        });
      }
    }
  };

  const selectedCourses = useMemo(() => courses.filter(c => selectedIds.has(c.code)), [courses, selectedIds]);

  // displayCourses: what to show in the summary — editing uses live selection, view uses saved
  const displayCourses = useMemo(() => isEditing ? selectedCourses : savedCourses, [isEditing, selectedCourses, savedCourses]);
  const displayCredits = useMemo(() => displayCourses.reduce((s, c) => s + (parseFloat(c.credits) || 0), 0), [displayCourses]);

  const buildGrid = useCallback((courseList) => {
    const grid = {};
    courseList.forEach(course => {
      course.slots.forEach(s => {
        if (!grid[s.day]) grid[s.day] = {};
        if (!grid[s.day][s.time]) grid[s.day][s.time] = [];
        grid[s.day][s.time].push({ code: course.code, title: course.title, type: s.type, venue: s.venue, instructor: course.instructor });
      });
    });
    return grid;
  }, []);

  const activeTimetable = useMemo(() => {
    if (!isEditing && savedTimetable) return savedTimetable;
    return buildGrid(selectedCourses);
  }, [selectedCourses, isEditing, savedTimetable, buildGrid]);

  // States for manual course slots modification modal
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [editingCourseCode, setEditingCourseCode] = useState('');
  const [editingSlots, setEditingSlots] = useState([]);

  const handleOpenModifyModal = () => {
    const list = isEditing ? selectedCourses : savedCourses;
    if (list.length > 0) {
      setEditingCourseCode(list[0].code);
    } else {
      setEditingCourseCode('');
    }
    setShowModifyModal(true);
  };

  useEffect(() => {
    const list = isEditing ? selectedCourses : savedCourses;
    if (editingCourseCode && list.length > 0) {
      const course = list.find(c => c.code === editingCourseCode);
      if (course) {
        setEditingSlots(JSON.parse(JSON.stringify(course.slots || [])));
      } else {
        setEditingSlots([]);
      }
    } else {
      setEditingSlots([]);
    }
  }, [editingCourseCode, selectedCourses, savedCourses, isEditing]);

  const handleAddSlot = () => {
    setEditingSlots(prev => [
      ...prev,
      { 
        type: 'Lecture', 
        day: days[0] || 'Monday', 
        time: orderedTimeSlots[0] || '8:30 - 9:50', 
        venue: '' 
      }
    ]);
  };

  const handleUpdateSlot = (index, field, value) => {
    setEditingSlots(prev => prev.map((s, i) => {
      if (i === index) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const handleDeleteSlot = (index) => {
    setEditingSlots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveCourseSlots = async () => {
    const targetCourses = isEditing ? [...selectedCourses] : [...savedCourses];
    const updated = targetCourses.map(c => {
      if (c.code === editingCourseCode) {
        return { ...c, slots: editingSlots };
      }
      return c;
    });

    const newGrid = buildGrid(updated);

    if (isEditing) {
      setCourses(prev => prev.map(c => {
        if (c.code === editingCourseCode) {
          return { ...c, slots: editingSlots };
        }
        return c;
      }));
    } else {
      setSavedCourses(updated);
      setSavedTimetable(newGrid);
      localStorage.setItem(`timetable_${userKey}`, JSON.stringify(newGrid));
      localStorage.setItem(`courses_${userKey}`, JSON.stringify(updated));

      if (currentUser) {
        saveTimetable(newGrid, updated).catch(e => console.warn('Firestore:', e.message));
      }
      
      setCourses(prev => prev.map(c => {
        if (c.code === editingCourseCode) {
          return { ...c, slots: editingSlots };
        }
        return c;
      }));
    }

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#f472b6', '#34d399']
    });

    setShowModifyModal(false);
  };

  const groupedCourses = useMemo(() => {
    const g = {};
    courses.forEach((c, i) => {
      if (searchQuery) { const q = searchQuery.toLowerCase(); if (!c.code.toLowerCase().includes(q) && !c.title.toLowerCase().includes(q)) return; }
      if (!g[c.group]) g[c.group] = [];
      g[c.group].push({ ...c, originalIndex: i });
    });
    return g;
  }, [courses, searchQuery]);

  const getHue = (code) => { let h = 0; for (let i = 0; i < code.length; i++) h = code.charCodeAt(i) + ((h << 5) - h); return Math.abs(h) % 360; };

  const handleSave = async () => {
    setSaving(true);
    const grid = buildGrid(selectedCourses);
    const cs = selectedCourses.map(c => ({ code: c.code, title: c.title, credits: c.credits, instructor: c.instructor, slots: c.slots }));
    localStorage.setItem(`timetable_${userKey}`, JSON.stringify(grid));
    localStorage.setItem(`courses_${userKey}`, JSON.stringify(cs));

    // Update saved state first
    setSavedTimetable(grid);
    setSavedCourses(cs);

    // Save to Firestore
    if (currentUser) {
      saveTimetable(grid, cs).catch(e => console.warn('Firestore:', e.message));
    }

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#f472b6', '#34d399']
    });

    // Then switch view — use setTimeout to ensure React state settles
    setTimeout(() => {
      setIsEditing(false);
      setPreviewMode(false);
      setSaving(false);
    }, 50);
  };

  const handleExportExcel = () => { exportToExcel(activeTimetable, days, orderedTimeSlots, isEditing ? selectedCourses : savedCourses); setShowExportMenu(false); };
  const handleExportImage = async () => {
    if (!timetableRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const c = await html2canvas(timetableRef.current, { scale: 2, windowWidth: 1200, useCORS: true });
      const l = document.createElement('a');
      l.download = 'Timetable.png';
      l.href = c.toDataURL('image/png');
      l.click();
    } catch (err) {
      console.error('Failed to export image:', err);
    }
    setShowExportMenu(false);
  };
  const handleExportPDF = async () => {
    if (!timetableRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const c = await html2canvas(timetableRef.current, { scale: 2, windowWidth: 1200, useCORS: true });
      const p = new jsPDF('l', 'mm', 'a4');
      const w = p.internal.pageSize.getWidth() - 20;
      p.addImage(c.toDataURL('image/png'), 'PNG', 10, 10, w, (c.height * w) / c.width);
      p.save('Timetable.pdf');
    } catch (err) {
      console.error('Failed to export PDF:', err);
    }
    setShowExportMenu(false);
  };

  if (loading) return <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>;

  return (
    <div className="page-container" style={{ paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobile && isEditing ? '1rem' : '2rem', flexWrap: 'wrap', gap: '0.75rem', position: 'relative' }}>
        <div style={{ flex: 1, minWidth: '0', marginRight: isMobile ? '95px' : '0' }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.1rem, 3vw, 1.5rem)' }}>{isEditing ? 'Course Selection' : 'Your Timetable'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', margin: 0 }}>
            {isEditing ? 'Select courses for this semester' : `${displayCourses.length} courses • ${displayCredits} credits`}
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: '.5rem', 
          flexWrap: 'wrap', 
          alignItems: 'center',
          position: isMobile ? 'absolute' : 'static',
          right: 0,
          top: 0,
          zIndex: 100
        }}>
          {!isMobile ? (
            <>
              {!isEditing ? (
                <button className="btn btn-outline" onClick={handleOpenModifyModal}><Edit2 size={16} /> Modify Course</button>
              ) : savedTimetable && (
                <button className="btn btn-outline" onClick={() => { setIsEditing(false); setPreviewMode(false); }}>Cancel</button>
              )}
            </>
          ) : (
            !isEditing && (
              <button 
                className="btn btn-outline btn-sm" 
                onClick={handleOpenModifyModal}
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', height: '32px', display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                <Edit2 size={12} /> Modify
              </button>
            )
          )}
          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowExportMenu(!showExportMenu)}
              style={isMobile ? { 
                padding: '0.4rem 0.6rem', 
                fontSize: '0.75rem', 
                height: '32px',
                width: '90px',
                justifyContent: 'center',
                gap: '4px',
                display: 'flex',
                alignItems: 'center'
              } : {}}
            >
              <Download size={isMobile ? 12 : 18} /> {isMobile ? 'Export' : 'Export'} <ChevronDown size={isMobile ? 12 : 14} />
            </button>
            {showExportMenu && (
              <div className="export-dropdown" style={isMobile ? { right: 0 } : {}}>
                <button onClick={handleExportExcel}><FileSpreadsheet size={14} /> Excel</button>
                <button onClick={handleExportImage}><ImageIcon size={14} /> Image</button>
                <button onClick={handleExportPDF}><FileIcon size={14} /> PDF</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobile && isEditing && (
        <div className="mobile-search-container" style={{ position: 'relative', width: '100%', marginBottom: '1.25rem' }}>
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            style={{ width: '100%', padding: '.5rem 1rem .5rem 2.4rem', borderRadius: '2rem', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '.8rem', outline: 'none', color: '#1e293b', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', boxSizing: 'border-box' }} 
          />
          <Search size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {isEditing && !previewMode ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {/* Selected Courses Chips */}
            <div className="selected-chips">
              {selectedCourses.length === 0 ? (
                <span className="selected-chips-empty"><Plus size={14} /> No courses selected — pick from the list below</span>
              ) : (
                selectedCourses.map((c, i) => {
                  return (
                    <div key={c.code + i} className="selected-chip">
                      <span>{c.code}</span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({c.credits} Cr)</span>
                      <button className="chip-remove" onClick={(e) => { e.stopPropagation(); removeCourse(c.code); }} title="Remove course">
                        <X size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Course Bucket List */}
            <div className="card course-bucket-card">
              {Object.keys(groupedCourses).map(gn => (
                <div key={gn} style={{ marginBottom: isMobile ? '1rem' : '2rem' }}>
                  <div onClick={() => { const n = new Set(collapsedGroups); n.has(gn) ? n.delete(gn) : n.add(gn); setCollapsedGroups(n); }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: isMobile ? '0.5rem' : '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '.5rem' }}>
                    <h3 style={{ fontSize: isMobile ? '0.95rem' : '1.1rem', margin: 0 }}>{gn}</h3>
                    {collapsedGroups.has(gn) ? <ChevronDown size={isMobile ? 16 : 20} /> : <ChevronUp size={isMobile ? 16 : 20} />}
                  </div>
                  {!collapsedGroups.has(gn) && (
                    <div className="course-list">
                      {groupedCourses[gn].map(c => (
                        <div key={c.originalIndex} className={`course-item ${selectedIds.has(c.code) ? 'selected' : ''}`} onClick={() => toggleCourse(c.code)}>
                          <input type="checkbox" checked={selectedIds.has(c.code)} readOnly />
                          <div className="course-item-details">
                            <div className="course-code-row">
                              <span className="course-code">{c.code}</span>
                              <span className="course-credits">{c.credits} Cr</span>
                            </div>
                            <span className="course-title">{c.title}</span>
                            {!isMobile && <span className="course-instructor">{c.instructor}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="timetable"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {isMobile && (
              <div className="timetable-view-selector-mobile" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${mobileViewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setMobileViewMode('list')}
                  style={{ borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.75rem' }}
                >
                  Daywise List
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${mobileViewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setMobileViewMode('grid')}
                  style={{ borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.75rem' }}
                >
                  Gridwise Table
                </button>
              </div>
            )}

            {isMobile && mobileViewMode === 'list' && (
              <div className="timetable-mobile-tabs">
                {days.map(d => (
                  <button 
                    key={d} 
                    className={`timetable-mobile-tab-btn ${activeDayTab === d ? 'active' : ''}`}
                    onClick={() => setActiveDayTab(d)}
                  >
                    {d.substring(0, 3)}
                  </button>
                ))}
              </div>
            )}

            {(isMobile && mobileViewMode === 'list') ? (
              <div className="timetable-mobile-timeline" ref={timetableRef}>
                {orderedTimeSlots.map(time => {
                  const isActive = isSlotActive(time);
                  
                  if (time === "13:00 - 14:00") {
                    return (
                      <div key={time} className={`timetable-mobile-lunch ${isActive ? 'active' : ''}`}>
                        <Coffee size={14} />
                        <span>Lunch Break ({time})</span>
                      </div>
                    );
                  }
                  
                  const entries = activeTimetable[activeDayTab]?.[time] || [];
                  if (entries.length === 0) return null;
                  
                  return (
                    <div key={time} className={`timetable-mobile-row ${isActive ? 'active-row' : ''}`}>
                      <div className="timetable-mobile-time-badge">
                        <Clock size={12} />
                        <span>{time}</span>
                      </div>
                      <div className="timetable-mobile-cards-list">
                        {entries.map((e, idx) => (
                          <div key={idx} className="timetable-mobile-card" style={{ '--hue': getHue(e.code) }}>
                            <div className="mobile-card-accent" />
                            <div className="mobile-card-body">
                              <div className="mobile-card-header">
                                <span className="mobile-card-code">{e.code}</span>
                                <span className="mobile-card-type">{e.type}</span>
                              </div>
                              <h4 className="mobile-card-title">{e.title}</h4>
                              <div className="mobile-card-meta">
                                <div className="meta-item">
                                  <User size={11} />
                                  <span>{e.instructor || 'N/A'}</span>
                                </div>
                                {e.venue && (
                                  <div className="meta-item">
                                    <MapPin size={11} />
                                    <span>{e.venue}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {entries.length > 1 && (
                          <div className="conflict-warning" style={{ marginTop: '0.25rem' }}>
                            <AlertCircle size={12} style={{ marginRight: 4 }} />Conflict!
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {orderedTimeSlots.filter(t => t !== "13:00 - 14:00" && (activeTimetable[activeDayTab]?.[t] || []).length > 0).length === 0 && (
                  <div className="timetable-mobile-empty">
                    <Calendar size={36} />
                    <p>No classes scheduled for {activeDayTab}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="timetable-container" ref={timetableRef}>
                <table className="timetable">
                  <thead><tr><th style={{ width: '120px' }}>Time</th>{days.map(d => <th key={d}>{d}</th>)}</tr></thead>
                  <tbody>
                    {orderedTimeSlots.map(time => {
                      const isActive = isSlotActive(time);
                      const rowClass = isActive ? 'active-row' : '';
                      const slotClass = `time-slot-cell ${isActive ? 'active-slot' : ''}`;
                      
                      if (time === "13:00 - 14:00") {
                        return (
                          <tr key={time} className={rowClass}>
                            <td className={slotClass}>
                              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <Coffee size={12} /> {time}
                              </span>
                            </td>
                            <td colSpan={days.length} className="timetable-lunch">Lunch Break</td>
                          </tr>
                        );
                      }
                      
                      return (
                        <tr key={time} className={rowClass}>
                          <td className={slotClass}>{time}</td>
                          {days.map(day => {
                            const entries = activeTimetable[day]?.[time] || [];
                            return (
                              <td key={day} style={{ padding: 0 }}>
                                {entries.map((e, i) => (
                                  <div key={i} className="timetable-cell" style={{ '--hue': getHue(e.code) }}>
                                    
                                    {/* Timetable hover details card */}
                                    <div className="timetable-hover-tooltip">
                                      <div className="tooltip-header">Session Details</div>
                                      <div className="tooltip-title">{e.title || 'Course Lecture'}</div>
                                      <div className="tooltip-meta-row">
                                        <BookOpen size={11} style={{ color: 'var(--primary)' }} />
                                        <span>Code: {e.code}</span>
                                      </div>
                                      <div className="tooltip-meta-row">
                                        <User size={11} style={{ color: 'var(--primary)' }} />
                                        <span>Instructor: {e.instructor || 'N/A'}</span>
                                      </div>
                                      <div className="tooltip-meta-row">
                                        <MapPin size={11} style={{ color: 'var(--primary)' }} />
                                        <span>Venue: {e.venue || 'N/A'}</span>
                                      </div>
                                      <div className="tooltip-meta-row">
                                        <Clock size={11} style={{ color: 'var(--primary)' }} />
                                        <span>Type: {e.type || 'Lecture'}</span>
                                      </div>
                                    </div>

                                    <span className="code">{e.code}</span>
                                    <span className="title">{e.title}</span>
                                    <span className="type">{e.type}</span>
                                    {e.venue && <span className="venue"><MapPin size={10} style={{ marginRight: 2 }} />{e.venue}</span>}
                                  </div>
                                ))}
                                {entries.length > 1 && <div className="conflict-warning"><AlertCircle size={12} style={{ marginRight: 4 }} />Conflict!</div>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: '2rem' }}>
              <h3>Registered Courses Summary</h3>
              <div className="courses-table-container">
                <table className="courses-table">
                  <thead><tr><th>Sr.</th><th>Code</th><th>Name</th><th>Credits</th><th>Instructor</th><th style={{ width: '50px', textAlign: 'center' }}>Action</th></tr></thead>
                  <tbody>
                    {displayCourses.map((c, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{c.code}</td>
                        <td>{c.title}</td>
                        <td>{c.credits}</td>
                        <td>{c.instructor}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn-icon-sm danger"
                            onClick={(e) => { e.stopPropagation(); handleDirectRemoveCourse(c.code); }}
                            title="Remove course"
                            style={{ padding: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="total-row"><td colSpan={3} style={{ fontWeight: 700 }}>Total Semester Credits</td><td style={{ fontWeight: 800, color: 'var(--primary)' }}>{displayCredits}</td><td /><td /></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Bar */}
      <div className="bottom-navbar">
        <div className="stats-bar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div onClick={() => setShowSelectedList(!showSelectedList)} className="selected-courses-trigger" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '.25rem .5rem', borderRadius: '.25rem' }}>
              <span style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>Courses:</span>
              <span style={{ fontWeight: 800, marginLeft: '.5rem' }}>{displayCourses.length}</span>
            </div>
            {showSelectedList && displayCourses.length > 0 && (
              <div style={{ position: 'absolute', bottom: '70px', left: '2rem', background: 'var(--card-bg)', borderRadius: '.75rem', padding: '1rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,.15)', minWidth: '300px', maxHeight: '300px', overflowY: 'auto', zIndex: 2000, border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: '.5rem' }}>Chosen Courses</h4>
                {displayCourses.map((c, i) => (
                  <div key={i} style={{ display: 'flex', fontSize: '.8rem', padding: '.4rem', background: 'var(--input-bg)', borderRadius: '.4rem', marginBottom: '.25rem', gap: '.5rem' }}>
                    <strong>{c.code}</strong><span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                  </div>
                ))}
              </div>
            )}
            <span style={{ margin: '0 .75rem', color: 'var(--border)' }}>|</span>
            <span style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>Credits:</span>
            <span style={{ fontWeight: 800, marginLeft: '.5rem', color: 'var(--primary)' }}>{displayCredits}</span>
            {isEditing && (
              isMobile ? (
                <button 
                  className="btn btn-outline btn-sm" 
                  onClick={() => setPreviewMode(!previewMode)}
                  style={{ marginLeft: '0.75rem', padding: '0.55rem 1rem', fontSize: '0.8rem', height: '42px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {previewMode ? <><Edit2 size={12} /> Select</> : <><Eye size={12} /> Preview</>}
                </button>
              ) : (
                <div style={{ position: 'relative', marginLeft: '1.5rem', width: '200px' }}>
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '.5rem 1rem .5rem 2.2rem', borderRadius: '2rem', border: 'none', background: 'var(--input-bg)', fontSize: '.85rem', outline: 'none', color: 'var(--text)' }} />
                  <Search size={16} style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              )
            )}
          </div>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            {isEditing ? (<>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedIds(new Set())} style={isMobile ? { height: '42px', padding: '0.55rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' } : {}}><Trash2 size={16} /> Clear</button>
              {isMobile ? (
                <button 
                  className="btn btn-outline btn-sm" 
                  onClick={handleCancel}
                  style={{ padding: '0.55rem 1rem', fontSize: '0.8rem', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Cancel
                </button>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => setPreviewMode(!previewMode)}>{previewMode ? <><Edit2 size={16} /> Select</> : <><Eye size={16} /> Preview</>}</button>
              )}
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving || selectedCourses.length === 0} style={isMobile ? { height: '42px', padding: '0.55rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' } : {}}><Save size={16} /> {saving ? 'Saving...' : 'Save Timetable'}</button>
            </>) : (
              <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}><Plus size={16} /> Modify Courses</button>
            )}
          </div>
        </div>
      </div>
      
      {/* Modify Course slots Modal */}
      {showModifyModal && (
        <div className="modal-overlay" onClick={() => setShowModifyModal(false)}>
          <motion.div 
            className="modal-content glass-card" 
            style={{ maxWidth: '640px', width: '90vw', background: 'var(--card-bg)', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', color: 'var(--text)' }}
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Edit2 size={18} style={{ color: 'var(--primary)' }} /> Modify Course Slots</h3>
              <button className="modal-close" onClick={() => setShowModifyModal(false)}><X size={18} /></button>
            </div>
            
            <div className="modal-body">
              {displayCourses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  <AlertCircle size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                  <p>No courses selected. Please add courses first using the "Modify Courses" button.</p>
                </div>
              ) : (
                <>
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Course</label>
                    <select 
                      className="form-input" 
                      value={editingCourseCode} 
                      onChange={(e) => setEditingCourseCode(e.target.value)}
                      style={{ width: '100%', fontSize: '0.9rem', padding: '0.65rem' }}
                    >
                      {displayCourses.map(c => (
                        <option key={c.code} value={c.code}>{c.code} — {c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="slot-edit-header">
                      <span>Type</span>
                      <span>Day</span>
                      <span>Time Slot</span>
                      <span>Venue</span>
                      <span style={{ width: '28px' }}></span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                      {editingSlots.map((slot, idx) => (
                        <div key={idx} className="slot-edit-row">
                          
                          {/* Slot Type */}
                          <select 
                            className="form-input" 
                            value={slot.type || 'Lecture'} 
                            onChange={(e) => handleUpdateSlot(idx, 'type', e.target.value)}
                            style={{ padding: '0.45rem 0.5rem' }}
                          >
                            <option value="Lecture">Lecture</option>
                            <option value="Lab">Lab</option>
                            <option value="Tutorial">Tutorial</option>
                            <option value="Practical">Practical</option>
                          </select>

                          {/* Day */}
                          <select 
                            className="form-input" 
                            value={slot.day || 'Monday'} 
                            onChange={(e) => handleUpdateSlot(idx, 'day', e.target.value)}
                            style={{ padding: '0.45rem 0.5rem' }}
                          >
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>

                          {/* Time */}
                          <select 
                            className="form-input" 
                            value={slot.time || '8:30 - 9:50'} 
                            onChange={(e) => handleUpdateSlot(idx, 'time', e.target.value)}
                            style={{ padding: '0.45rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            {orderedTimeSlots.filter(t => t !== "13:00 - 14:00").map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>

                          {/* Venue */}
                          <input 
                            type="text" 
                            className="form-input" 
                            value={slot.venue || ''} 
                            placeholder="Venue" 
                            onChange={(e) => handleUpdateSlot(idx, 'venue', e.target.value)}
                            style={{ padding: '0.45rem 0.5rem' }}
                          />

                          {/* Delete Button */}
                          <button 
                            className="btn btn-outline btn-sm" 
                            onClick={() => handleDeleteSlot(idx)} 
                            style={{ padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '6px', border: '1px solid transparent', cursor: 'pointer' }}
                            title="Remove slot"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}

                      {editingSlots.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          No slots configured for this course. Click "Add Slot" below to create one.
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-outline btn-sm" 
                      onClick={handleAddSlot}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
                    >
                      <Plus size={14} /> Add Slot
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm danger"
                      onClick={() => {
                        handleDirectRemoveCourse(editingCourseCode);
                        setShowModifyModal(false);
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.02)' }}
                    >
                      <Trash2 size={14} /> Remove Course
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.25rem' }}>
              <button className="btn btn-outline" onClick={() => setShowModifyModal(false)}>Cancel</button>
              {displayCourses.length > 0 && (
                <button className="btn btn-primary" onClick={handleSaveCourseSlots}><Save size={16} /> Save Changes</button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <div className="page-footer">Built with ❤️ by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a></div>
    </div>
  );
};

export default TimetablePage;
