import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { motion } from 'framer-motion';
import { Award, Plus, Trash2, TrendingUp, BookOpen, BarChart3, Download, ChevronDown, ChevronUp } from 'lucide-react';

const GRADE_POINTS = {
  'A+': 10, 'A': 10, 'A-': 9, 'B+': 8, 'B': 8, 'B-': 7,
  'C+': 6, 'C': 6, 'C-': 5, 'D': 4, 'F': 0, 'I': null, 'W': null,
};

const GRADE_COLORS = {
  'A+': '#22c55e', 'A': '#22c55e', 'A-': '#4ade80', 'B+': '#6366f1', 'B': '#6366f1', 'B-': '#818cf8',
  'C+': '#f59e0b', 'C': '#f59e0b', 'C-': '#fbbf24', 'D': '#ef4444', 'F': '#dc2626',
};

const GradesPage = () => {
  const { currentUser, userProfile, saveProfile } = useAuth();
  const { addNotification } = useNotifications();

  const [semesters, setSemesters] = useState(() => {
    if (!currentUser) return [];
    try {
      const saved = localStorage.getItem(`grades_${currentUser.uid}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [expandedSem, setExpandedSem] = useState(null);
  const [showAddSem, setShowAddSem] = useState(false);
  const [newSemName, setNewSemName] = useState('');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`grades_${currentUser.uid}`, JSON.stringify(semesters));
    }
  }, [semesters, currentUser]);

  const addSemester = () => {
    const name = newSemName.trim() || `Semester ${semesters.length + 1}`;
    setSemesters(prev => [...prev, { id: Date.now(), name, courses: [] }]);
    setNewSemName('');
    setShowAddSem(false);
    setExpandedSem(semesters.length);
    addNotification('success', 'Semester Added', `${name} created successfully`);
  };

  const removeSemester = (idx) => {
    setSemesters(prev => prev.filter((_, i) => i !== idx));
    addNotification('info', 'Semester Removed', 'Semester deleted');
  };

  const addCourse = (semIdx) => {
    setSemesters(prev => prev.map((sem, i) => i === semIdx ? {
      ...sem,
      courses: [...sem.courses, { id: Date.now(), name: '', credits: 3, grade: '' }]
    } : sem));
  };

  const updateCourse = (semIdx, courseIdx, field, value) => {
    setSemesters(prev => prev.map((sem, i) => i === semIdx ? {
      ...sem,
      courses: sem.courses.map((c, j) => j === courseIdx ? { ...c, [field]: value } : c)
    } : sem));
  };

  const removeCourse = (semIdx, courseIdx) => {
    setSemesters(prev => prev.map((sem, i) => i === semIdx ? {
      ...sem,
      courses: sem.courses.filter((_, j) => j !== courseIdx)
    } : sem));
  };

  const calculateSGPA = (courses) => {
    let totalPoints = 0, totalCredits = 0;
    courses.forEach(c => {
      const gp = GRADE_POINTS[c.grade];
      if (gp !== null && gp !== undefined && c.credits > 0) {
        totalPoints += gp * c.credits;
        totalCredits += parseFloat(c.credits);
      }
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '—';
  };

  const cgpa = useMemo(() => {
    let totalPoints = 0, totalCredits = 0;
    semesters.forEach(sem => {
      sem.courses.forEach(c => {
        const gp = GRADE_POINTS[c.grade];
        if (gp !== null && gp !== undefined && c.credits > 0) {
          totalPoints += gp * parseFloat(c.credits);
          totalCredits += parseFloat(c.credits);
        }
      });
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '—';
  }, [semesters]);

  const gradeDistribution = useMemo(() => {
    const dist = {};
    semesters.forEach(sem => {
      sem.courses.forEach(c => {
        if (c.grade && GRADE_POINTS[c.grade] !== null) {
          dist[c.grade] = (dist[c.grade] || 0) + 1;
        }
      });
    });
    return dist;
  }, [semesters]);

  const totalCreditsEarned = useMemo(() => {
    return semesters.reduce((sum, sem) =>
      sum + sem.courses.reduce((s, c) => {
        const gp = GRADE_POINTS[c.grade];
        return (gp !== null && gp !== undefined && gp > 0) ? s + parseFloat(c.credits || 0) : s;
      }, 0)
    , 0);
  }, [semesters]);

  const sgpaTrend = useMemo(() => {
    return semesters.map(sem => ({
      name: sem.name,
      sgpa: parseFloat(calculateSGPA(sem.courses)) || 0,
    })).filter(s => s.sgpa > 0);
  }, [semesters]);

  const maxSGPA = Math.max(...sgpaTrend.map(s => s.sgpa), 10);

  const handleSave = async () => {
    try {
      await saveProfile({ grades: semesters });
      addNotification('success', 'Grades Saved', 'Your grade data has been saved to the cloud');
    } catch {
      addNotification('error', 'Save Failed', 'Could not save grades. Data saved locally.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <motion.div className="page-container" variants={containerVariants} initial="hidden" animate="visible">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <Award size={24} style={{ color: 'var(--primary)' }} /> GPA Calculator & Tracker
        </h2>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={handleSave}><Download size={14} /> Save to Cloud</button>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div className="grades-stats-row" variants={itemVariants}>
        <div className="grade-stat-card cgpa-card">
          <div className="grade-stat-icon"><TrendingUp size={20} /></div>
          <div className="grade-stat-value">{cgpa}</div>
          <div className="grade-stat-label">Cumulative GPA</div>
        </div>
        <div className="grade-stat-card">
          <div className="grade-stat-icon"><BookOpen size={20} /></div>
          <div className="grade-stat-value">{totalCreditsEarned}</div>
          <div className="grade-stat-label">Credits Earned</div>
        </div>
        <div className="grade-stat-card">
          <div className="grade-stat-icon"><BarChart3 size={20} /></div>
          <div className="grade-stat-value">{semesters.length}</div>
          <div className="grade-stat-label">Semesters</div>
        </div>
        <div className="grade-stat-card">
          <div className="grade-stat-icon"><Award size={20} /></div>
          <div className="grade-stat-value">{semesters.reduce((s, sem) => s + sem.courses.length, 0)}</div>
          <div className="grade-stat-label">Total Courses</div>
        </div>
      </motion.div>

      {/* SGPA Trend Chart */}
      {sgpaTrend.length > 1 && (
        <motion.div className="grades-chart-card" variants={itemVariants}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <TrendingUp size={16} style={{ color: 'var(--primary)' }} /> GPA Trend
          </h3>
          <div className="sgpa-chart">
            {sgpaTrend.map((s, i) => (
              <div key={i} className="sgpa-bar-wrapper">
                <div className="sgpa-bar-value">{s.sgpa}</div>
                <div className="sgpa-bar" style={{ height: `${(s.sgpa / maxSGPA) * 100}%` }} />
                <div className="sgpa-bar-label">{s.name.replace('Semester ', 'S')}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Grade Distribution */}
      {Object.keys(gradeDistribution).length > 0 && (
        <motion.div className="grades-chart-card" variants={itemVariants}>
          <h3 style={{ marginBottom: '1rem' }}>Grade Distribution</h3>
          <div className="grade-dist-row">
            {Object.entries(gradeDistribution).sort((a, b) => (GRADE_POINTS[b[0]] || 0) - (GRADE_POINTS[a[0]] || 0)).map(([grade, count]) => (
              <div key={grade} className="grade-dist-chip" style={{ background: `${GRADE_COLORS[grade] || '#6366f1'}18`, borderColor: GRADE_COLORS[grade] || '#6366f1' }}>
                <span className="grade-dist-letter" style={{ color: GRADE_COLORS[grade] }}>{grade}</span>
                <span className="grade-dist-count">×{count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Semesters */}
      {semesters.map((sem, semIdx) => {
        const isExpanded = expandedSem === semIdx;
        const sgpa = calculateSGPA(sem.courses);
        return (
          <motion.div key={sem.id} className="semester-card" variants={itemVariants}>
            <div className="semester-header" onClick={() => setExpandedSem(isExpanded ? null : semIdx)}>
              <div className="semester-header-left">
                <h3>{sem.name}</h3>
                <span className="semester-sgpa-badge">SGPA: {sgpa}</span>
                <span className="semester-course-count">{sem.courses.length} courses</span>
              </div>
              <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                <button className="btn-icon-sm danger" onClick={(e) => { e.stopPropagation(); removeSemester(semIdx); }} title="Delete semester">
                  <Trash2 size={14} />
                </button>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {isExpanded && (
              <motion.div
                className="semester-body"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                {sem.courses.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem', fontSize: '.85rem' }}>No courses added yet</p>
                )}
                {sem.courses.map((course, cIdx) => (
                  <div key={course.id} className="grade-course-row">
                    <input
                      className="grade-course-input name"
                      placeholder="Course name"
                      value={course.name}
                      onChange={e => updateCourse(semIdx, cIdx, 'name', e.target.value)}
                    />
                    <input
                      className="grade-course-input credits"
                      type="number"
                      min="1"
                      max="12"
                      placeholder="Cr"
                      value={course.credits}
                      onChange={e => updateCourse(semIdx, cIdx, 'credits', parseInt(e.target.value) || 0)}
                    />
                    <select
                      className="grade-course-input grade"
                      value={course.grade}
                      onChange={e => updateCourse(semIdx, cIdx, 'grade', e.target.value)}
                    >
                      <option value="">Grade</option>
                      {Object.keys(GRADE_POINTS).map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <button className="btn-icon-sm danger" onClick={() => removeCourse(semIdx, cIdx)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button className="btn btn-outline btn-sm" style={{ marginTop: '.75rem' }} onClick={() => addCourse(semIdx)}>
                  <Plus size={14} /> Add Course
                </button>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Add Semester */}
      {showAddSem ? (
        <motion.div className="add-semester-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <input
            className="grade-course-input name"
            placeholder="Semester name (e.g. Semester 3)"
            value={newSemName}
            onChange={e => setNewSemName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSemester()}
            autoFocus
          />
          <button className="btn btn-primary btn-sm" onClick={addSemester}>Add</button>
          <button className="btn btn-outline btn-sm" onClick={() => setShowAddSem(false)}>Cancel</button>
        </motion.div>
      ) : (
        <motion.button className="btn btn-primary add-semester-btn" onClick={() => setShowAddSem(true)} variants={itemVariants}>
          <Plus size={16} /> Add Semester
        </motion.button>
      )}

      <div className="page-footer">GPA Calculator • built by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a></div>
    </motion.div>
  );
};

export default GradesPage;
