import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Eye, MapPin, AlertCircle, Download, ChevronDown, FileSpreadsheet, Image as ImageIcon, File as FileIcon, Search, Trash2, Save, Edit2, Plus, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchAndParseTimetable } from '../utils/parser';
import { exportToExcel } from '../utils/exporter';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [showSelectedList, setShowSelectedList] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const timetableRef = useRef(null);

  // Load per-user saved data
  useEffect(() => {
    try {
      const tt = localStorage.getItem(`timetable_${userKey}`);
      const sc = localStorage.getItem(`courses_${userKey}`);
      if (tt) { setSavedTimetable(JSON.parse(tt)); setIsEditing(false); }
      if (sc) setSavedCourses(JSON.parse(sc));
    } catch { /* ignore */ }
  }, [userKey]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAndParseTimetable();
        setCourses(data.courses); setOrderedTimeSlots(data.orderedTimeSlots); setDays(data.days);
        const src = savedCourses.length > 0 ? savedCourses : userProfile?.selectedCourses;
        if (src?.length > 0) {
          const codes = new Set(src.map(c => c.code));
          const sel = new Set();
          data.courses.forEach((c, i) => { if (codes.has(c.code)) sel.add(i); });
          setSelectedIds(sel);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const toggleCourse = (id) => { const n = new Set(selectedIds); n.has(id) ? n.delete(id) : n.add(id); setSelectedIds(n); };
  const selectedCourses = useMemo(() => courses.filter((_, i) => selectedIds.has(i)), [courses, selectedIds]);
  const totalCredits = useMemo(() => selectedCourses.reduce((s, c) => s + (parseFloat(c.credits) || 0), 0), [selectedCourses]);

  const buildGrid = (courseList) => {
    const grid = {};
    courseList.forEach(course => {
      course.slots.forEach(s => {
        if (!grid[s.day]) grid[s.day] = {};
        if (!grid[s.day][s.time]) grid[s.day][s.time] = [];
        grid[s.day][s.time].push({ code: course.code, title: course.title, type: s.type, venue: s.venue, instructor: course.instructor });
      });
    });
    return grid;
  };

  const activeTimetable = useMemo(() => {
    if (!isEditing && savedTimetable) return savedTimetable;
    return buildGrid(selectedCourses);
  }, [selectedCourses, isEditing, savedTimetable]);

  const groupedCourses = useMemo(() => {
    const g = {};
    courses.forEach((c, i) => {
      if (searchQuery) { const q = searchQuery.toLowerCase(); if (!c.code.toLowerCase().includes(q) && !c.title.toLowerCase().includes(q)) return; }
      if (!g[c.group]) g[c.group] = [];
      g[c.group].push({ ...c, originalIndex: i });
    });
    return g;
  }, [courses, searchQuery]);

  const getColor = (code) => { let h = 0; for (let i = 0; i < code.length; i++) h = code.charCodeAt(i) + ((h << 5) - h); return `hsl(${Math.abs(h) % 360},${65 + Math.abs(h) % 20}%,${85 + Math.abs(h) % 10}%)`; };

  const handleSave = async () => {
    setSaving(true);
    const grid = buildGrid(selectedCourses);
    const cs = selectedCourses.map(c => ({ code: c.code, title: c.title, credits: c.credits, instructor: c.instructor, slots: c.slots }));
    localStorage.setItem(`timetable_${userKey}`, JSON.stringify(grid));
    localStorage.setItem(`courses_${userKey}`, JSON.stringify(cs));
    setSavedTimetable(grid); setSavedCourses(cs);
    if (currentUser) { try { await saveTimetable(grid, cs); } catch (e) { console.warn('Firestore:', e.message); } }
    setIsEditing(false); setPreviewMode(false); setSaving(false);
  };

  const handleExportExcel = () => { exportToExcel(activeTimetable, days, orderedTimeSlots, isEditing ? selectedCourses : savedCourses); setShowExportMenu(false); };
  const handleExportImage = async () => { if (!timetableRef.current) return; const c = await html2canvas(timetableRef.current, { scale: 2 }); const l = document.createElement('a'); l.download = 'Timetable.png'; l.href = c.toDataURL('image/png'); l.click(); setShowExportMenu(false); };
  const handleExportPDF = async () => { if (!timetableRef.current) return; const c = await html2canvas(timetableRef.current, { scale: 2 }); const p = new jsPDF('l', 'mm', 'a4'); const w = p.internal.pageSize.getWidth() - 20; p.addImage(c.toDataURL('image/png'), 'PNG', 10, 10, w, (c.height * w) / c.width); p.save('Timetable.pdf'); setShowExportMenu(false); };

  if (loading) return <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>;

  const displayCourses = isEditing ? selectedCourses : savedCourses;

  return (
    <div className="page-container" style={{ paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>{isEditing ? 'Course Selection' : 'Your Timetable'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>{isEditing ? 'Select courses for this semester' : `${displayCourses.length} courses • ${totalCredits} credits`}</p>
        </div>
        <div style={{ display: 'flex', gap: '.75rem' }}>
          {!isEditing ? (
            <button className="btn btn-outline" onClick={() => setIsEditing(true)}><Edit2 size={16} /> Modify</button>
          ) : savedTimetable && (
            <button className="btn btn-outline" onClick={() => { setIsEditing(false); setPreviewMode(false); }}>Cancel</button>
          )}
          <div style={{ position: 'relative' }}>
            <button className="btn btn-primary" onClick={() => setShowExportMenu(!showExportMenu)}><Download size={18} /> Export <ChevronDown size={14} /></button>
            {showExportMenu && (
              <div className="export-dropdown">
                <button onClick={handleExportExcel}><FileSpreadsheet size={16} /> Excel</button>
                <button onClick={handleExportImage}><ImageIcon size={16} /> Image</button>
                <button onClick={handleExportPDF}><FileIcon size={16} /> PDF</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && !previewMode ? (
        <div className="card">
          {Object.keys(groupedCourses).map(gn => (
            <div key={gn} style={{ marginBottom: '2rem' }}>
              <div onClick={() => { const n = new Set(collapsedGroups); n.has(gn) ? n.delete(gn) : n.add(gn); setCollapsedGroups(n); }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{gn}</h3>
                {collapsedGroups.has(gn) ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </div>
              {!collapsedGroups.has(gn) && (
                <div className="course-list">
                  {groupedCourses[gn].map(c => (
                    <div key={c.originalIndex} className={`course-item ${selectedIds.has(c.originalIndex) ? 'selected' : ''}`} onClick={() => toggleCourse(c.originalIndex)}>
                      <input type="checkbox" checked={selectedIds.has(c.originalIndex)} readOnly />
                      <div style={{ display: 'flex', flex: 1, gap: '1rem', alignItems: 'center' }}>
                        <span className="course-code" style={{ minWidth: '80px' }}>{c.code}</span>
                        <span style={{ minWidth: '50px', color: 'var(--primary)' }}>{c.credits} Cr</span>
                        <span style={{ flex: 1 }}>{c.title}</span>
                        <span style={{ minWidth: '120px', textAlign: 'right', fontSize: '.75rem', color: 'var(--text-muted)' }}>{c.instructor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="timetable-container" ref={timetableRef}>
            <table className="timetable">
              <thead><tr><th style={{ width: '120px' }}>Time</th>{days.map(d => <th key={d}>{d}</th>)}</tr></thead>
              <tbody>
                {orderedTimeSlots.map(time => {
                  if (time === "13:00 - 14:00") return <tr key={time}><td className="time-slot-cell">{time}</td><td colSpan={days.length} className="timetable-lunch">Lunch Break</td></tr>;
                  return (
                    <tr key={time}>
                      <td className="time-slot-cell">{time}</td>
                      {days.map(day => {
                        const entries = activeTimetable[day]?.[time] || [];
                        return (
                          <td key={day} style={{ padding: 0 }}>
                            {entries.map((e, i) => (
                              <div key={i} className="timetable-cell" style={{ backgroundColor: getColor(e.code) }}
                                title={`${e.code}: ${e.title}\n${e.type}\nVenue: ${e.venue || 'N/A'}\nInstructor: ${e.instructor}`}>
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

          <div style={{ marginTop: '2rem' }}>
            <h3>Registered Courses Summary</h3>
            <div className="courses-table-container">
              <table className="courses-table">
                <thead><tr><th>Sr.</th><th>Code</th><th>Name</th><th>Credits</th><th>Instructor</th></tr></thead>
                <tbody>
                  {displayCourses.map((c, i) => (
                    <tr key={i}><td>{i + 1}</td><td style={{ fontWeight: 700, color: 'var(--primary)' }}>{c.code}</td><td>{c.title}</td><td>{c.credits}</td><td>{c.instructor}</td></tr>
                  ))}
                  <tr className="total-row"><td colSpan={3} style={{ fontWeight: 700 }}>Total Semester Credits</td><td style={{ fontWeight: 800, color: 'var(--primary)' }}>{displayCourses.reduce((s, c) => s + (parseFloat(c.credits) || 0), 0)}</td><td /></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="bottom-navbar">
        <div className="stats-bar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div onClick={() => setShowSelectedList(!showSelectedList)} className="selected-courses-trigger" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '.25rem .5rem', borderRadius: '.25rem' }}>
              <span style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>Selected:</span>
              <span style={{ fontWeight: 800, marginLeft: '.5rem' }}>{selectedCourses.length}</span>
            </div>
            {showSelectedList && selectedCourses.length > 0 && (
              <div style={{ position: 'absolute', bottom: '70px', left: '2rem', background: 'var(--card-bg)', borderRadius: '.75rem', padding: '1rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,.15)', minWidth: '300px', maxHeight: '300px', overflowY: 'auto', zIndex: 2000, border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: '.5rem' }}>Chosen Courses</h4>
                {selectedCourses.map((c, i) => (
                  <div key={i} style={{ display: 'flex', fontSize: '.8rem', padding: '.4rem', background: 'var(--input-bg)', borderRadius: '.4rem', marginBottom: '.25rem', gap: '.5rem' }}>
                    <strong>{c.code}</strong><span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                  </div>
                ))}
              </div>
            )}
            <span style={{ margin: '0 .75rem', color: 'var(--border)' }}>|</span>
            <span style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>Credits:</span>
            <span style={{ fontWeight: 800, marginLeft: '.5rem', color: 'var(--primary)' }}>{totalCredits}</span>
            {isEditing && (
              <div style={{ position: 'relative', marginLeft: '1.5rem', width: '200px' }}>
                <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '.5rem 1rem .5rem 2.2rem', borderRadius: '2rem', border: 'none', background: 'var(--input-bg)', fontSize: '.85rem', outline: 'none', color: 'var(--text)' }} />
                <Search size={16} style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            {isEditing ? (<>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedIds(new Set())}><Trash2 size={16} /> Clear</button>
              <button className="btn btn-outline btn-sm" onClick={() => setPreviewMode(!previewMode)}>{previewMode ? <><Edit2 size={16} /> Select</> : <><Eye size={16} /> Preview</>}</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving || selectedCourses.length === 0}><Save size={16} /> {saving ? 'Saving...' : 'Save Timetable'}</button>
            </>) : (
              <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}><Plus size={16} /> Modify Courses</button>
            )}
          </div>
        </div>
      </div>
      <div className="page-footer">Smart Student Portal • Timetable Generator</div>
    </div>
  );
};

export default TimetablePage;
