import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { motion } from 'framer-motion';
import { CalendarDays, Check, X, Clock, AlertTriangle, TrendingUp, BookOpen, Download } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const AttendancePage = () => {
  const { currentUser, saveProfile } = useAuth();
  const { addNotification } = useNotifications();

  const [courses, setCourses] = useState(() => {
    if (!currentUser) return [];
    try { return JSON.parse(localStorage.getItem(`attendance_${currentUser.uid}`)) || []; } catch { return []; }
  });

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'calendar'

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`attendance_${currentUser.uid}`, JSON.stringify(courses));
    }
  }, [courses, currentUser]);

  const addCourse = () => {
    const name = newCourseName.trim();
    if (!name) return;
    setCourses(prev => [...prev, { id: Date.now(), name, records: [] }]);
    setNewCourseName('');
    setShowAddCourse(false);
    addNotification('success', 'Course Added', `${name} added to attendance tracker`);
  };

  const removeCourse = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    if (selectedCourse === id) setSelectedCourse(null);
  };

  const markAttendance = (courseId, date, status) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      const existing = c.records.findIndex(r => r.date === date);
      if (existing >= 0) {
        const newRecords = [...c.records];
        if (newRecords[existing].status === status) {
          newRecords.splice(existing, 1); // toggle off
        } else {
          newRecords[existing] = { date, status };
        }
        return { ...c, records: newRecords };
      }
      return { ...c, records: [...c.records, { date, status }] };
    }));
  };

  const getStats = (course) => {
    const total = course.records.length;
    const present = course.records.filter(r => r.status === 'present').length;
    const absent = course.records.filter(r => r.status === 'absent').length;
    const late = course.records.filter(r => r.status === 'late').length;
    const percentage = total > 0 ? ((present + late * 0.5) / total * 100).toFixed(1) : 0;
    return { total, present, absent, late, percentage: parseFloat(percentage) };
  };

  const overallStats = useMemo(() => {
    let total = 0, present = 0, absent = 0, late = 0;
    courses.forEach(c => {
      const s = getStats(c);
      total += s.total; present += s.present; absent += s.absent; late += s.late;
    });
    const percentage = total > 0 ? ((present + late * 0.5) / total * 100).toFixed(1) : 0;
    return { total, present, absent, late, percentage: parseFloat(percentage) };
  }, [courses]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push(dateStr);
    }
    return days;
  }, []);

  const getStatusColor = (percentage) => {
    if (percentage >= 85) return '#22c55e';
    if (percentage >= 75) return '#f59e0b';
    return '#ef4444';
  };

  const handleSave = async () => {
    try {
      await saveProfile({ attendance: courses });
      addNotification('success', 'Attendance Saved', 'Synced to cloud');
    } catch {
      addNotification('error', 'Save Failed', 'Data saved locally only');
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div className="page-container" variants={containerVariants} initial="hidden" animate="visible">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <CalendarDays size={24} style={{ color: 'var(--primary)' }} /> Attendance Tracker
        </h2>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className={`btn btn-sm ${viewMode === 'overview' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setViewMode('overview')}>Overview</button>
          <button className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setViewMode('calendar')}>Calendar</button>
          <button className="btn btn-outline btn-sm" onClick={handleSave}><Download size={14} /> Save</button>
        </div>
      </div>

      {/* Overall Stats */}
      <motion.div className="grades-stats-row" variants={itemVariants}>
        <div className="grade-stat-card" style={{ borderLeft: `3px solid ${getStatusColor(overallStats.percentage)}` }}>
          <div className="grade-stat-value" style={{ color: getStatusColor(overallStats.percentage) }}>{overallStats.percentage}%</div>
          <div className="grade-stat-label">Overall Attendance</div>
        </div>
        <div className="grade-stat-card">
          <div className="grade-stat-icon" style={{ color: '#22c55e' }}><Check size={20} /></div>
          <div className="grade-stat-value">{overallStats.present}</div>
          <div className="grade-stat-label">Present</div>
        </div>
        <div className="grade-stat-card">
          <div className="grade-stat-icon" style={{ color: '#ef4444' }}><X size={20} /></div>
          <div className="grade-stat-value">{overallStats.absent}</div>
          <div className="grade-stat-label">Absent</div>
        </div>
        <div className="grade-stat-card">
          <div className="grade-stat-icon" style={{ color: '#f59e0b' }}><Clock size={20} /></div>
          <div className="grade-stat-value">{overallStats.late}</div>
          <div className="grade-stat-label">Late</div>
        </div>
      </motion.div>

      {viewMode === 'overview' && (
        <>
          {/* Per-course attendance bars */}
          {courses.map(course => {
            const stats = getStats(course);
            const color = getStatusColor(stats.percentage);
            const isSelected = selectedCourse === course.id;
            return (
              <motion.div key={course.id} className={`attendance-course-card ${isSelected ? 'expanded' : ''}`} variants={itemVariants}>
                <div className="attendance-course-header" onClick={() => setSelectedCourse(isSelected ? null : course.id)}>
                  <div className="attendance-course-info">
                    <h4>{course.name}</h4>
                    <div className="attendance-bar-container">
                      <div className="attendance-bar-fill" style={{ width: `${stats.percentage}%`, background: color }} />
                    </div>
                    <div className="attendance-quick-stats">
                      <span style={{ color: '#22c55e' }}>P:{stats.present}</span>
                      <span style={{ color: '#ef4444' }}>A:{stats.absent}</span>
                      <span style={{ color: '#f59e0b' }}>L:{stats.late}</span>
                      <span style={{ fontWeight: 700, color }}>{stats.percentage}%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                    {stats.percentage < 75 && <AlertTriangle size={16} style={{ color: '#ef4444' }} title="Below 75%!" />}
                    <button className="btn-icon-sm danger" onClick={(e) => { e.stopPropagation(); removeCourse(course.id); }}><X size={13} /></button>
                  </div>
                </div>

                {isSelected && (
                  <motion.div className="attendance-mark-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '.5rem' }}>Mark today's attendance:</p>
                    <div className="attendance-mark-btns">
                      {['present', 'absent', 'late'].map(status => {
                        const todayRecord = course.records.find(r => r.date === todayStr);
                        const isActive = todayRecord?.status === status;
                        return (
                          <button
                            key={status}
                            className={`attendance-mark-btn ${status} ${isActive ? 'active' : ''}`}
                            onClick={() => markAttendance(course.id, todayStr, status)}
                          >
                            {status === 'present' && <Check size={14} />}
                            {status === 'absent' && <X size={14} />}
                            {status === 'late' && <Clock size={14} />}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </>
      )}

      {viewMode === 'calendar' && selectedCourse && (() => {
        const course = courses.find(c => c.id === selectedCourse);
        if (!course) return null;
        const now = new Date();
        return (
          <motion.div className="attendance-calendar-card" variants={itemVariants}>
            <h3 style={{ marginBottom: '1rem' }}>{course.name} — {MONTHS[now.getMonth()]} {now.getFullYear()}</h3>
            <div className="attendance-calendar-grid">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="cal-header">{d}</div>
              ))}
              {calendarDays.map((dateStr, i) => {
                if (!dateStr) return <div key={`e-${i}`} className="cal-cell empty" />;
                const record = course.records.find(r => r.date === dateStr);
                const day = parseInt(dateStr.split('-')[2]);
                const isToday = dateStr === todayStr;
                return (
                  <div
                    key={dateStr}
                    className={`cal-cell ${record?.status || ''} ${isToday ? 'today' : ''}`}
                    onClick={() => {
                      const nextStatus = !record ? 'present' : record.status === 'present' ? 'absent' : record.status === 'absent' ? 'late' : 'present';
                      markAttendance(course.id, dateStr, nextStatus);
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <div className="cal-legend">
              <span className="cal-legend-item"><span className="cal-dot present" /> Present</span>
              <span className="cal-legend-item"><span className="cal-dot absent" /> Absent</span>
              <span className="cal-legend-item"><span className="cal-dot late" /> Late</span>
            </div>
          </motion.div>
        );
      })()}

      {viewMode === 'calendar' && !selectedCourse && courses.length > 0 && (
        <motion.div className="empty-state" variants={itemVariants}>
          <p>Select a course from the list above to view its calendar</p>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
            {courses.map(c => (
              <button key={c.id} className="btn btn-outline btn-sm" onClick={() => setSelectedCourse(c.id)}>{c.name}</button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add Course */}
      {showAddCourse ? (
        <motion.div className="add-semester-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <input className="grade-course-input name" placeholder="Course name" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCourse()} autoFocus />
          <button className="btn btn-primary btn-sm" onClick={addCourse}>Add</button>
          <button className="btn btn-outline btn-sm" onClick={() => setShowAddCourse(false)}>Cancel</button>
        </motion.div>
      ) : (
        <motion.button className="btn btn-primary add-semester-btn" onClick={() => setShowAddCourse(true)} variants={itemVariants}>
          <BookOpen size={16} /> Add Course
        </motion.button>
      )}

      <div className="page-footer">Attendance Tracker • built by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a></div>
    </motion.div>
  );
};

export default AttendancePage;
