import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { motion } from 'framer-motion';
import { Award, Plus, Trash2, TrendingUp, BookOpen, BarChart3, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchAndParseTimetable, isEvenSemester } from '../utils/parser';

const GRADE_POINTS = {
  'A+': 11, 'A': 10, 'A-': 9, 'B': 8, 'B-': 7, 'C': 6,
  'C-': 5, 'D': 4, 'E': 2, 'F': 0, 'I': null, 'W': null,
};

const GRADE_COLORS = {
  'A+': '#22c55e', 'A': '#22c55e', 'A-': '#4ade80', 'B': '#6366f1', 'B-': '#818cf8',
  'C': '#f59e0b', 'C-': '#fbbf24', 'D': '#ef4444', 'E': '#dc2626', 'F': '#dc2626',
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

  // Course autocomplete Active Field state
  const [activeSearch, setActiveSearch] = useState({ semIdx: null, courseIdx: null, query: '' });

  // Odd/even course lists for suggestions
  const [oddCourses, setOddCourses] = useState([]);
  const [evenCourses, setEvenCourses] = useState([]);

  // Load catalogs on mount
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const oddData = await fetchAndParseTimetable('Semester 1');
        setOddCourses(oddData.courses || []);
        
        const evenData = await fetchAndParseTimetable('Semester 2');
        setEvenCourses(evenData.courses || []);
      } catch (e) {
        console.error('Error loading course catalogs:', e);
      }
    };
    loadCatalogs();
  }, []);

  // Sync timetable registered courses into the running semester card automatically
  useEffect(() => {
    if (!currentUser || !userProfile?.semester) return;
    const runningSem = userProfile.semester;
    
    // Retrieve current registered courses from timetable page
    const savedCoursesJSON = localStorage.getItem(`courses_${currentUser.uid}`);
    const timetableCourses = savedCoursesJSON ? JSON.parse(savedCoursesJSON) : (userProfile?.selectedCourses || []);
    
    setSemesters(prev => {
      // Check if running semester card exists
      const exists = prev.some(sem => sem.name === runningSem);
      
      let updatedSemesters = [...prev];
      if (!exists) {
        // Create it
        updatedSemesters.push({ id: Date.now(), name: runningSem, courses: [], isSynced: true });
      }
      
      updatedSemesters = updatedSemesters.map(sem => {
        if (sem.name === runningSem) {
          // Reconcile courses
          const syncedCourses = timetableCourses.map(tc => {
            const fullName = `${tc.code} - ${tc.title}`;
            // Find if it was already in our card to preserve grade
            const existing = sem.courses?.find(c => c.name === fullName || c.name.startsWith(tc.code));
            return {
              id: existing?.id || tc.id || Date.now() + Math.random(),
              name: fullName,
              credits: parseInt(tc.credits) || 0,
              grade: existing?.grade || ''
            };
          });
          return { ...sem, courses: syncedCourses, isSynced: true };
        }
        return sem;
      });
      
      // Sort semesters by name to keep them in ascending order
      updatedSemesters.sort((a, b) => {
        const numA = parseInt(a.name.match(/\d+/)?.[0] || 0);
        const numB = parseInt(b.name.match(/\d+/)?.[0] || 0);
        return numA - numB;
      });

      if (JSON.stringify(prev) !== JSON.stringify(updatedSemesters)) {
        return updatedSemesters;
      }
      return prev;
    });
  }, [userProfile?.semester, currentUser, userProfile?.selectedCourses]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`grades_${currentUser.uid}`, JSON.stringify(semesters));
    }
  }, [semesters, currentUser]);

  // Compute available previous semesters for the gating list
  const availableSemesters = useMemo(() => {
    if (!userProfile?.semester) return [];
    const runningSemNum = parseInt(userProfile.semester.match(/\d+/)?.[0] || 1);
    const list = [];
    for (let i = 1; i < runningSemNum; i++) {
      const name = `Semester ${i}`;
      const alreadyExists = semesters.some(sem => sem.name === name);
      if (!alreadyExists) {
        list.push(name);
      }
    }
    return list;
  }, [userProfile?.semester, semesters]);

  const addSemester = () => {
    if (!newSemName) return;
    setSemesters(prev => {
      const updated = [...prev, { id: Date.now(), name: newSemName, courses: [] }];
      updated.sort((a, b) => {
        const numA = parseInt(a.name.match(/\d+/)?.[0] || 0);
        const numB = parseInt(b.name.match(/\d+/)?.[0] || 0);
        return numA - numB;
      });
      return updated;
    });
    setNewSemName('');
    setShowAddSem(false);
    addNotification('success', 'Semester Added', `${newSemName} created successfully`);
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

  const filteredSuggestions = useMemo(() => {
    if (activeSearch.semIdx === null || activeSearch.courseIdx === null) return [];
    const sem = semesters[activeSearch.semIdx];
    if (!sem) return [];
    const isEven = isEvenSemester(sem.name);
    const catalog = isEven ? evenCourses : oddCourses;
    const q = (activeSearch.query || '').trim().toLowerCase();
    if (!q) {
      return catalog.slice(0, 10);
    }
    return catalog.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [activeSearch, semesters, oddCourses, evenCourses]);

  const handleSelectSuggestion = (semIdx, courseIdx, suggestedCourse) => {
    const fullName = `${suggestedCourse.code} - ${suggestedCourse.title}`;
    updateCourse(semIdx, courseIdx, 'name', fullName);
    updateCourse(semIdx, courseIdx, 'credits', parseInt(suggestedCourse.credits) || 0);
    setActiveSearch({ semIdx: null, courseIdx: null, query: '' });
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--text)' }}>
            <Award size={20} style={{ color: 'var(--primary)' }} /> Academic Performance Summary
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track semester-wise SPI, cumulative GPA, and synced timetable registrations.
          </p>
        </div>
        <button 
          className="btn btn-primary btn-sm" 
          onClick={handleSave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem'
          }}
        >
          <Award size={14} /> Save to Cloud
        </button>
      </div>

      {/* Stats Cards */}
      <motion.div className="grades-stats-row" variants={itemVariants}>
        <div className="grade-stat-card cgpa-card">
          <div className="grade-stat-icon"><TrendingUp size={20} /></div>
          <div className="grade-stat-value">{cgpa}</div>
          <div className="grade-stat-label">Cumulative GPA</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Out of 11.00</div>
        </div>
        <div className="grade-stat-card">
          <div className="grade-stat-icon"><BookOpen size={20} /></div>
          <div className="grade-stat-value">{totalCreditsEarned}</div>
          <div className="grade-stat-label">Credits Earned</div>
          <div style={{ width: '80%', height: '4px', background: 'var(--input-bg)', borderRadius: '4px', marginTop: '0.5rem', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (totalCreditsEarned / 180) * 100)}%`, height: '100%', background: 'var(--primary)' }} />
          </div>
        </div>
        <div className="grade-stat-card">
          <div className="grade-stat-icon"><BarChart3 size={20} /></div>
          <div className="grade-stat-value">{semesters.length}</div>
          <div className="grade-stat-label">Semesters Added</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{semesters.filter(s => s.isSynced).length} Synced</div>
        </div>
        <div className="grade-stat-card">
          <div className="grade-stat-icon"><Award size={20} /></div>
          <div className="grade-stat-value">{semesters.reduce((s, sem) => s + sem.courses.length, 0)}</div>
          <div className="grade-stat-label">Total Courses</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>In Curriculum</div>
        </div>
      </motion.div>

      {/* SGPA Trend Chart */}
      {sgpaTrend.length > 1 && (
        <motion.div className="grades-chart-card glass-card" variants={itemVariants} style={{ position: 'relative', overflow: 'hidden' }}>
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} /> Semester SPI Progress
          </h3>
          
          <div className="sgpa-chart" style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '180px', padding: '1.5rem 1rem 0.5rem', background: 'rgba(99, 102, 241, 0.02)', border: '1px dashed var(--border)', borderRadius: '0.75rem' }}>
            {/* Dashed CGPA Baseline across all bars */}
            {cgpa !== '—' && (
              <div 
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${(1 - (parseFloat(cgpa) || 0) / maxSGPA) * 100}%`,
                  borderTop: '1px dashed var(--primary)',
                  opacity: 0.6,
                  zIndex: 1,
                  pointerEvents: 'none'
                }}
              >
                <span style={{ position: 'absolute', right: '15px', top: '-14px', fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 'bold', background: 'var(--card-bg)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  CGPA: {cgpa}
                </span>
              </div>
            )}

            {sgpaTrend.map((s, i) => {
              const heightPercent = (s.sgpa / maxSGPA) * 100;
              return (
                <div key={i} className="sgpa-bar-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', flex: 1, position: 'relative', zIndex: 2 }}>
                  <div className="sgpa-bar-value" style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{s.sgpa.toFixed(2)}</div>
                  <div 
                    className="sgpa-bar" 
                    style={{ 
                      height: `${heightPercent}%`, 
                      width: '28px', 
                      background: 'linear-gradient(180deg, var(--primary) 0%, var(--accent) 100%)', 
                      borderRadius: '6px 6px 0 0',
                      boxShadow: '0 4px 10px rgba(99, 102, 241, 0.15)',
                      transition: 'all 0.3s ease'
                    }} 
                  />
                  <div className="sgpa-bar-label" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 'bold' }}>{s.name}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Grade Distribution */}
      {Object.keys(gradeDistribution).length > 0 && (
        <motion.div className="grades-chart-card glass-card" variants={itemVariants}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>Grade Profile Analysis</h3>
          <div className="grade-dist-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            {Object.entries(gradeDistribution).sort((a, b) => (GRADE_POINTS[b[0]] || 0) - (GRADE_POINTS[a[0]] || 0)).map(([grade, count]) => (
              <div 
                key={grade} 
                className="grade-dist-chip" 
                style={{ 
                  background: `${GRADE_COLORS[grade] || '#6366f1'}0d`, 
                  borderColor: `${GRADE_COLORS[grade] || '#6366f1'}33`,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderRadius: '0.75rem',
                  padding: '0.4rem 0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem'
                }}
              >
                <span className="grade-dist-letter" style={{ color: GRADE_COLORS[grade], fontWeight: 800 }}>{grade}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>&bull;</span>
                <span className="grade-dist-count" style={{ color: 'var(--text)', fontWeight: 600 }}>{count} {count === 1 ? 'Course' : 'Courses'}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Semesters */}
      {semesters.map((sem, semIdx) => {
        const isExpanded = expandedSem === semIdx;
        const sgpa = calculateSGPA(sem.courses);
        const semCredits = sem.courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
        const completedCredits = sem.courses.reduce((sum, c) => {
          const gp = GRADE_POINTS[c.grade];
          return (gp !== null && gp !== undefined && gp > 0) ? sum + (parseFloat(c.credits) || 0) : sum;
        }, 0);
        return (
          <motion.div key={sem.id} className={`semester-card ${sem.isSynced ? 'is-synced-card' : ''}`} variants={itemVariants}>
            <div className="semester-header" onClick={() => setExpandedSem(isExpanded ? null : semIdx)}>
              <div className="semester-header-left">
                <h3>{sem.name}</h3>
                {sem.isSynced && (
                  <span className="semester-synced-badge">
                    Synced with Timetable
                  </span>
                )}
                <span className="semester-sgpa-badge">SPI: {sem.isSynced ? '—' : sgpa}</span>
                <span className="semester-course-count">{sem.courses.length} courses</span>
                <span className="semester-credits-badge">
                  {sem.isSynced ? `${semCredits} Credits (Registered)` : `${completedCredits} Credits Completed`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                <button 
                  className="btn-icon-sm danger" 
                  onClick={(e) => { e.stopPropagation(); removeSemester(semIdx); }} 
                  title={sem.isSynced ? "Synced semester cannot be deleted" : "Delete semester"}
                  disabled={sem.isSynced}
                  style={{ opacity: sem.isSynced ? 0.5 : 1, cursor: sem.isSynced ? 'not-allowed' : 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {isExpanded && (
              <motion.div
                className="semester-body"
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', transitionEnd: { overflow: 'visible' } }}
                transition={{ duration: 0.3 }}
              >
                {sem.courses.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem', fontSize: '.85rem' }}>No courses added yet</p>
                )}
                {sem.courses.map((course, cIdx) => (
                  <div key={course.id} className={`grade-course-row ${sem.isSynced ? 'is-synced-row' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0', borderBottom: '1px dashed var(--border)' }}>
                    <div className="course-input-wrapper" style={{ flex: 3, position: 'relative' }}>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          className="grade-course-input name"
                          placeholder="Course name (e.g. CS 201 - Data Structures)"
                          value={course.name}
                          onChange={e => {
                            updateCourse(semIdx, cIdx, 'name', e.target.value);
                            setActiveSearch({ semIdx, courseIdx: cIdx, query: e.target.value });
                          }}
                          onFocus={() => setActiveSearch({ semIdx, courseIdx: cIdx, query: course.name })}
                          onBlur={() => {
                            setTimeout(() => {
                              setActiveSearch(prev => prev.semIdx === semIdx && prev.courseIdx === cIdx ? { semIdx: null, courseIdx: null, query: '' } : prev);
                            }, 200);
                          }}
                          disabled={sem.isSynced}
                          style={{
                            width: '100%',
                            paddingLeft: sem.isSynced ? '2.25rem' : '0.85rem',
                            fontWeight: sem.isSynced ? 600 : 'normal'
                          }}
                        />
                        {sem.isSynced && (
                          <span style={{ position: 'absolute', left: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center' }} title="Synced from registration/timetable">
                            <BookOpen size={14} />
                          </span>
                        )}
                      </div>
                      
                      {activeSearch.semIdx === semIdx && activeSearch.courseIdx === cIdx && filteredSuggestions.length > 0 && (
                        <div className="course-suggestions-dropdown" style={{ zIndex: 1000 }}>
                          {filteredSuggestions.map((sugCourse) => (
                            <button
                              key={sugCourse.code}
                              className="course-suggestion-item"
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectSuggestion(semIdx, cIdx, sugCourse);
                              }}
                            >
                              <span className="course-sug-code">{sugCourse.code}</span>
                              <span className="course-sug-title">{sugCourse.title}</span>
                              <span className="course-sug-credits">{sugCourse.credits} Cr</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Credits:</span>
                      <input
                        className="grade-course-input credits"
                        type="number"
                        min="1"
                        max="12"
                        placeholder="Cr"
                        value={course.credits}
                        onChange={e => updateCourse(semIdx, cIdx, 'credits', parseInt(e.target.value) || 0)}
                        disabled={sem.isSynced}
                        style={{ width: '55px', textAlign: 'center', fontWeight: 'bold' }}
                      />
                    </div>
                    
                    {sem.isSynced ? (
                      <span className="grade-course-running" style={{ padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '0.5rem', fontWeight: 700, minWidth: '90px', textAlign: 'center', border: '1px solid rgba(99, 102, 241, 0.15)', display: 'inline-block' }}>
                        In Progress
                      </span>
                    ) : (
                      <select
                        className="grade-course-input grade"
                        value={course.grade}
                        onChange={e => updateCourse(semIdx, cIdx, 'grade', e.target.value)}
                        style={{ width: '85px', fontWeight: 'bold' }}
                      >
                        <option value="">Grade</option>
                        {Object.keys(GRADE_POINTS).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    )}
                    
                    <button 
                      className="btn-icon-sm danger" 
                      onClick={() => removeCourse(semIdx, cIdx)}
                      disabled={sem.isSynced}
                      style={{ opacity: sem.isSynced ? 0.4 : 1, cursor: sem.isSynced ? 'not-allowed' : 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                {!sem.isSynced && (
                  <button className="btn btn-outline btn-sm" style={{ marginTop: '.75rem' }} onClick={() => addCourse(semIdx)}>
                    <Plus size={14} /> Add Course
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Add Semester */}
      {showAddSem ? (
        <motion.div className="add-semester-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {availableSemesters.length > 0 ? (
            <>
              <select
                className="grade-course-input name"
                value={newSemName}
                onChange={e => setNewSemName(e.target.value)}
                autoFocus
                style={{ minWidth: '200px' }}
              >
                <option value="">Select Semester</option>
                {availableSemesters.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
              <button className="btn btn-primary btn-sm" onClick={addSemester} disabled={!newSemName}>Add</button>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No more previous semesters available to add.</span>
          )}
          <button className="btn btn-outline btn-sm" onClick={() => { setShowAddSem(false); setNewSemName(''); }}>Cancel</button>
        </motion.div>
      ) : (
        <motion.button 
          className="btn btn-primary add-semester-btn" 
          onClick={() => { setShowAddSem(true); setNewSemName(''); }} 
          variants={itemVariants}
        >
          <Plus size={16} /> Add Semester
        </motion.button>
      )}

      <div className="page-footer">Built with ❤️ by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a></div>
    </motion.div>
  );
};

export default GradesPage;
