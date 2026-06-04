import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { motion } from 'framer-motion';
import { Award, Plus, Trash2, TrendingUp, BookOpen, BarChart3, Download, ChevronDown, ChevronUp, CalendarDays } from 'lucide-react';
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
  const [isCustomSem, setIsCustomSem] = useState(false);

  // Course autocomplete Active Field state
  const [activeSearch, setActiveSearch] = useState({ semIdx: null, courseIdx: null, query: '' });

  const [targetCgpa, setTargetCgpa] = useState(8.0);
  const [remainingCredits, setRemainingCredits] = useState(45);
  const [activeHighlightSem, setActiveHighlightSem] = useState(null);

  const timetableCourses = useMemo(() => {
    if (!currentUser) return [];
    try {
      const saved = localStorage.getItem(`courses_${currentUser.uid}`);
      return saved ? JSON.parse(saved) : (userProfile?.selectedCourses || []);
    } catch {
      return [];
    }
  }, [currentUser, userProfile?.selectedCourses]);

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
  }, [userProfile?.semester, currentUser, timetableCourses]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`grades_${currentUser.uid}`, JSON.stringify(semesters));
    }
  }, [semesters, currentUser]);

  // Compute available semesters (1 to 10) that do not already exist in the list
  const availableSemesters = useMemo(() => {
    const list = [];
    for (let i = 1; i <= 10; i++) {
      const name = `Semester ${i}`;
      const alreadyExists = semesters.some(sem => sem.name === name);
      if (!alreadyExists) {
        list.push(name);
      }
    }
    return list;
  }, [semesters]);

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
    setIsCustomSem(false);
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

  // Synchronize target CGPA and remaining credits on load
  useEffect(() => {
    if (cgpa !== '—') {
      const cgpaNum = parseFloat(cgpa) || 8.0;
      setTargetCgpa(parseFloat(Math.min(11, Math.max(0, cgpaNum + 0.5)).toFixed(2)));
    }
  }, [cgpa]);

  useEffect(() => {
    const earned = parseFloat(totalCreditsEarned) || 0;
    setRemainingCredits(Math.max(1, 180 - earned));
  }, [totalCreditsEarned]);

  const currentTotalPoints = useMemo(() => {
    return semesters.reduce((sum, sem) =>
      sum + sem.courses.reduce((s, c) => {
        const gp = GRADE_POINTS[c.grade];
        return (gp !== null && gp !== undefined && c.credits > 0) ? s + (gp * parseFloat(c.credits)) : s;
      }, 0)
    , 0);
  }, [semesters]);

  const gradedCredits = useMemo(() => {
    return semesters.reduce((sum, sem) =>
      sum + sem.courses.reduce((s, c) => {
        const gp = GRADE_POINTS[c.grade];
        return (gp !== null && gp !== undefined && c.credits > 0) ? s + parseFloat(c.credits) : s;
      }, 0)
    , 0);
  }, [semesters]);

  const requiredSPI = useMemo(() => {
    if (remainingCredits <= 0) return 0;
    const req = (targetCgpa * (gradedCredits + remainingCredits) - currentTotalPoints) / remainingCredits;
    return parseFloat(req.toFixed(2));
  }, [targetCgpa, gradedCredits, remainingCredits, currentTotalPoints]);

  const honorStanding = useMemo(() => {
    const val = parseFloat(cgpa);
    if (isNaN(val)) return null;
    if (val >= 10.0) return { name: "Dean's List Elite", className: 'deans-list' };
    if (val >= 8.5) return { name: "Distinction Standing", className: 'distinction' };
    if (val >= 6.5) return { name: "Merit Standing", className: 'merit' };
    return { name: "Active Standing", className: 'active-standing' };
  }, [cgpa]);

  const weeklySchedule = useMemo(() => {
    const schedule = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
    if (!timetableCourses) return schedule;
    
    timetableCourses.forEach(course => {
      course.slots?.forEach(slot => {
        if (schedule[slot.day]) {
          schedule[slot.day].push({
            code: course.code,
            title: course.title,
            time: slot.time,
            venue: slot.venue || 'TBA',
            type: slot.type || 'Lecture'
          });
        }
      });
    });
    
    // Sort each day's classes by time
    Object.keys(schedule).forEach(day => {
      schedule[day].sort((a, b) => a.time.localeCompare(b.time));
    });
    
    return schedule;
  }, [timetableCourses]);

  const handleChartBarClick = (semName) => {
    const foundIdx = semesters.findIndex(sem => sem.name === semName);
    if (foundIdx !== -1) {
      setExpandedSem(foundIdx);
      setActiveHighlightSem(semesters[foundIdx].id);
      
      // Smooth scroll to element
      setTimeout(() => {
        const element = document.getElementById(`sem-card-${semesters[foundIdx].id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      // Clear highlight after animation completes
      setTimeout(() => {
        setActiveHighlightSem(null);
      }, 2000);
    }
  };

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

      <div className="academics-summary-grid">
        <div className="academics-summary-main">
          {/* Semesters list */}
          {semesters.map((sem, semIdx) => {
            const isExpanded = expandedSem === semIdx;
            const sgpa = calculateSGPA(sem.courses);
            const semCredits = sem.courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
            const completedCredits = sem.courses.reduce((sum, c) => {
              const gp = GRADE_POINTS[c.grade];
              return (gp !== null && gp !== undefined && gp > 0) ? sum + (parseFloat(c.credits) || 0) : sum;
            }, 0);
            return (
              <motion.div 
                id={`sem-card-${sem.id}`}
                key={sem.id} 
                className={`compact-semester-card ${sem.isSynced ? 'is-synced-card' : ''} ${activeHighlightSem === sem.id ? 'semester-glow-highlight' : ''}`} 
                variants={itemVariants}
              >
                <div className="compact-semester-header" onClick={() => setExpandedSem(isExpanded ? null : semIdx)}>
                  <div className="semester-header-left">
                    <h3>{sem.name}</h3>
                    {sem.isSynced && (
                      <span className="semester-synced-badge">
                        Synced with Timetable
                      </span>
                    )}
                    <span className="semester-sgpa-badge">SPI: {sem.isSynced ? '—' : sgpa}</span>
                    <span className="semester-course-count">
                      {sem.courses.length} courses
                      {sem.courses.length > 0 && (
                        <span className="header-grade-dots" title="Grade profile quick-view">
                          {sem.courses.map((c) => {
                            if (!c.grade) return null;
                            const dotColor = GRADE_COLORS[c.grade] || '#6366f1';
                            return (
                              <span 
                                key={c.id} 
                                className="header-grade-dot" 
                                style={{ backgroundColor: dotColor }}
                                title={`${c.name.split(' - ')[0] || 'Course'}: ${c.grade}`}
                              />
                            );
                          })}
                        </span>
                      )}
                    </span>
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
                    className="compact-semester-body"
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto', transitionEnd: { overflow: 'visible' } }}
                    transition={{ duration: 0.3 }}
                  >
                    {sem.courses.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem', fontSize: '.85rem' }}>No courses added yet</p>
                    )}
                    {sem.courses.map((course, cIdx) => (
                      <div key={course.id} className={`compact-course-row ${sem.isSynced ? 'is-synced-row' : ''}`}>
                        <div className="course-input-wrapper" style={{ flex: 3, position: 'relative' }}>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                              className="compact-course-input name"
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
                            className="compact-course-input credits"
                            type="number"
                            min="1"
                            max="12"
                            placeholder="Cr"
                            value={course.credits}
                            onChange={e => updateCourse(semIdx, cIdx, 'credits', parseInt(e.target.value) || 0)}
                            disabled={sem.isSynced}
                            style={{ fontWeight: 'bold' }}
                          />
                        </div>
                        
                        {sem.isSynced ? (
                          <span className="grade-course-running" style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '0.4rem', fontWeight: 700, minWidth: '85px', textAlign: 'center', border: '1px solid rgba(99, 102, 241, 0.15)', display: 'inline-block' }}>
                            In Progress
                          </span>
                        ) : (
                          <select
                            className="compact-course-input grade"
                            value={course.grade}
                            onChange={e => updateCourse(semIdx, cIdx, 'grade', e.target.value)}
                            style={{ fontWeight: 'bold' }}
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
                      <button className="btn btn-outline btn-sm" style={{ marginTop: '.5rem', padding: '0.35rem 0.75rem' }} onClick={() => addCourse(semIdx)}>
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
            <motion.div className="add-semester-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {!isCustomSem ? (
                <select
                  className="compact-course-input name"
                  value={newSemName}
                  onChange={e => {
                    if (e.target.value === 'CUSTOM') {
                      setIsCustomSem(true);
                      setNewSemName('');
                    } else {
                      setNewSemName(e.target.value);
                    }
                  }}
                  autoFocus
                  style={{ minWidth: '180px', height: '32px' }}
                >
                  <option value="">Select Semester</option>
                  {availableSemesters.map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                  <option value="CUSTOM">Custom Semester...</option>
                </select>
              ) : (
                <input
                  className="compact-course-input name"
                  placeholder="e.g. Summer Semester 2026"
                  value={newSemName}
                  onChange={e => setNewSemName(e.target.value)}
                  autoFocus
                  style={{ minWidth: '180px', height: '32px', padding: '0 0.75rem', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none', background: 'var(--input-bg)', color: 'var(--text)' }}
                />
              )}
              <button className="btn btn-primary btn-sm" onClick={addSemester} disabled={!newSemName} style={{ padding: '0.35rem 0.75rem' }}>Add</button>
              <button 
                className="btn btn-outline btn-sm" 
                onClick={() => { 
                  if (isCustomSem) {
                    setIsCustomSem(false);
                    setNewSemName('');
                  } else {
                    setShowAddSem(false); 
                    setNewSemName(''); 
                  }
                }} 
                style={{ padding: '0.35rem 0.75rem' }}
              >
                {isCustomSem ? 'Back' : 'Cancel'}
              </button>
            </motion.div>
          ) : (
            <motion.button 
              className="btn btn-primary add-semester-btn" 
              onClick={() => { setShowAddSem(true); setNewSemName(''); setIsCustomSem(false); }} 
              variants={itemVariants}
              style={{ marginTop: '0.5rem', padding: '0.45rem 1rem' }}
            >
              <Plus size={16} /> Add Semester
            </motion.button>
          )}

          {/* Synced Weekly Schedule & Workload Card */}
          {timetableCourses.length > 0 && (
            <motion.div 
              className="grades-chart-card glass-card" 
              variants={itemVariants}
              style={{ marginTop: '1.25rem', padding: '1.25rem', marginBottom: '0.5rem' }}
            >
              <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CalendarDays size={16} style={{ color: 'var(--primary)' }} /> Synced Active Semester Weekly Schedule
              </h3>
              
              {/* Workload Stats Row */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '90px', background: 'var(--input-bg)', padding: '0.5rem 0.75rem', borderRadius: '0.4rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registered Courses</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.15rem' }}>{timetableCourses.length}</div>
                </div>
                <div style={{ flex: 1, minWidth: '90px', background: 'var(--input-bg)', padding: '0.5rem 0.75rem', borderRadius: '0.4rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Semester Credits</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.15rem' }}>
                    {timetableCourses.reduce((sum, c) => sum + (parseInt(c.credits) || 0), 0)}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '90px', background: 'var(--input-bg)', padding: '0.5rem 0.75rem', borderRadius: '0.4rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Workload / Week</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.15rem' }}>
                    {timetableCourses.reduce((sum, c) => sum + (c.slots?.length || 0) * 1.5, 0)} hrs
                  </div>
                </div>
              </div>

              {/* Daily Schedule List (Horizontal) */}
              <div className="weekly-schedule-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                  const dayClasses = weeklySchedule[day] || [];
                  return (
                    <div key={day} style={{ background: 'rgba(99, 102, 241, 0.01)', border: '1px dashed var(--border)', borderRadius: '0.5rem', padding: '0.4rem', minWidth: '105px' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '0.2rem', marginBottom: '0.35rem', textAlign: 'center' }}>
                        {day.substring(0, 3)}
                      </div>
                      {dayClasses.length === 0 ? (
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', padding: '0.75rem 0' }}>
                          No classes
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          {dayClasses.map((cls, idx) => (
                            <div 
                              key={idx} 
                              style={{ 
                                background: 'var(--card-bg)', 
                                border: '1px solid var(--border)', 
                                borderLeft: '3px solid var(--primary)', 
                                borderRadius: '0.25rem', 
                                padding: '0.25rem 0.35rem', 
                                fontSize: '0.6rem',
                                lineHeight: '1.2'
                              }}
                            >
                              <div style={{ fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={cls.code + ' - ' + cls.title}>{cls.code}</div>
                              <div style={{ color: 'var(--text-muted)', marginTop: '0.05rem', fontSize: '0.55rem' }}>{cls.time.split(' – ')[0]}</div>
                              <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.5rem', marginTop: '0.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={cls.venue}>{cls.venue}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        <div className="academics-summary-sidebar">
          {/* Quick Stats Grid */}
          <div className="grades-sidebar-stats-grid">
            <div className="compact-grade-stat-card cgpa-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', minHeight: '115px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="compact-grade-stat-icon"><TrendingUp size={16} /></div>
                <div className="compact-grade-stat-value">{cgpa}</div>
                <div className="compact-grade-stat-label">Cumulative GPA</div>
              </div>
              {honorStanding && (
                <div className="honor-standing-container">
                  <span className={`honor-standing-badge ${honorStanding.className}`}>
                    {honorStanding.name}
                  </span>
                </div>
              )}
            </div>
            <div className="compact-grade-stat-card" style={{ minHeight: '115px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="compact-grade-stat-icon"><BookOpen size={16} /></div>
              <div className="compact-grade-stat-value">{totalCreditsEarned}</div>
              <div className="compact-grade-stat-label">Credits Earned</div>
              <div style={{ width: '100%', height: '3px', background: 'var(--input-bg)', borderRadius: '3px', marginTop: '0.35rem', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (totalCreditsEarned / 180) * 100)}%`, height: '100%', background: 'var(--primary)' }} />
              </div>
            </div>
            <div className="compact-grade-stat-card" style={{ minHeight: '115px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="compact-grade-stat-icon"><BarChart3 size={16} /></div>
              <div className="compact-grade-stat-value">{semesters.length}</div>
              <div className="compact-grade-stat-label">Semesters</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{semesters.filter(s => s.isSynced).length} Synced</div>
            </div>
            <div className="compact-grade-stat-card" style={{ minHeight: '115px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="compact-grade-stat-icon"><Award size={16} /></div>
              <div className="compact-grade-stat-value">{semesters.reduce((s, sem) => s + sem.courses.length, 0)}</div>
              <div className="compact-grade-stat-label">Total Courses</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>In Curriculum</div>
            </div>
          </div>

          {/* SPI Progress Chart */}
          {sgpaTrend.length > 1 && (
            <motion.div className="grades-chart-card glass-card" variants={itemVariants} style={{ position: 'relative', overflow: 'hidden', padding: '1rem', marginBottom: 0 }}>
              <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>
                <TrendingUp size={16} style={{ color: 'var(--primary)' }} /> Semester SPI Progress
              </h3>
              
              <div className="sgpa-chart" style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '120px', padding: '1rem 0.5rem 0.5rem', background: 'rgba(99, 102, 241, 0.02)', border: '1px dashed var(--border)', borderRadius: '0.6rem' }}>
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
                    <span style={{ position: 'absolute', right: '10px', top: '-14px', fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 'bold', background: 'var(--card-bg)', padding: '0.05rem 0.3rem', borderRadius: '3px', border: '1px solid var(--border)' }}>
                      CGPA: {cgpa}
                    </span>
                  </div>
                )}

                {sgpaTrend.map((s, i) => {
                  const heightPercent = (s.sgpa / maxSGPA) * 100;
                  return (
                    <div 
                      key={i} 
                      className="sgpa-bar-wrapper" 
                      onClick={() => handleChartBarClick(s.name)}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        height: '100%', 
                        justifyContent: 'flex-end', 
                        flex: 1, 
                        position: 'relative', 
                        zIndex: 2,
                        cursor: 'pointer'
                      }}
                      title="Click to scroll to semester details"
                    >
                      <div className="sgpa-bar-value" style={{ fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>{s.sgpa.toFixed(2)}</div>
                      <div 
                        className="sgpa-bar" 
                        style={{ 
                          height: `${heightPercent}%`, 
                          width: '20px', 
                          background: 'linear-gradient(180deg, var(--primary) 0%, var(--accent) 100%)', 
                          borderRadius: '4px 4px 0 0',
                          boxShadow: '0 3px 8px rgba(99, 102, 241, 0.15)',
                          transition: 'all 0.3s ease'
                        }} 
                      />
                      <div className="sgpa-bar-label" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontWeight: 'bold' }}>{s.name}</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Grade Distribution */}
          {Object.keys(gradeDistribution).length > 0 && (
            <motion.div className="grades-chart-card glass-card" variants={itemVariants} style={{ padding: '1rem', marginBottom: 0 }}>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>Grade Profile Analysis</h3>
              <div className="grade-dist-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {Object.entries(gradeDistribution).sort((a, b) => (GRADE_POINTS[b[0]] || 0) - (GRADE_POINTS[a[0]] || 0)).map(([grade, count]) => (
                  <div 
                    key={grade} 
                    className="grade-dist-chip" 
                    style={{ 
                      background: `${GRADE_COLORS[grade] || '#6366f1'}0d`, 
                      borderColor: `${GRADE_COLORS[grade] || '#6366f1'}33`,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderRadius: '0.5rem',
                      padding: '0.3rem 0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.75rem'
                    }}
                  >
                    <span className="grade-dist-letter" style={{ color: GRADE_COLORS[grade], fontWeight: 800 }}>{grade}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>&bull;</span>
                    <span className="grade-dist-count" style={{ color: 'var(--text)', fontWeight: 600 }}>{count} {count === 1 ? 'Course' : 'Courses'}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CGPA Goal Forecaster */}
          {cgpa !== '—' && (
            <motion.div className="cgpa-forecaster-card glass-card" variants={itemVariants}>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={15} style={{ color: 'var(--primary)' }} /> CGPA Goal Forecaster
              </h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Simulate the SPI required in remaining credits to achieve your target CGPA.
              </p>
              
              <div className="forecaster-slider-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  <span>Target CGPA:</span>
                  <span style={{ color: 'var(--primary)' }}>{targetCgpa.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  className="forecaster-slider"
                  min={(parseFloat(cgpa) || 0.01).toFixed(2)}
                  max="11.00"
                  step="0.05"
                  value={targetCgpa}
                  onChange={e => setTargetCgpa(parseFloat(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Remaining Credits:</span>
                <input
                  type="number"
                  className="compact-course-input"
                  style={{ width: '60px', height: '26px', fontSize: '0.75rem', textAlign: 'center', padding: '0.2rem' }}
                  min="1"
                  max="120"
                  value={remainingCredits}
                  onChange={e => setRemainingCredits(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              <div className={`forecaster-result ${requiredSPI > 11.0 ? 'impossible' : requiredSPI <= 4.0 ? 'perfect' : ''}`}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Required Future SPI
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: requiredSPI > 11.0 ? '#ef4444' : 'var(--primary)' }}>
                  {requiredSPI > 11.0 ? 'N/A' : requiredSPI.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.65rem', marginTop: '0.25rem', fontWeight: 600, color: requiredSPI > 11.0 ? '#ef4444' : requiredSPI <= 4.0 ? '#22c55e' : 'var(--text-muted)' }}>
                  {requiredSPI > 11.0 
                    ? '⚠️ Mathematically Impossible (> 11.00)' 
                    : requiredSPI <= 4.0 
                      ? '🎉 Highly Achievable! (SPI ≤ 4.00)' 
                      : `SPI of ${requiredSPI.toFixed(2)} average required.`}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="page-footer">Built with ❤️ by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a></div>
    </motion.div>
  );
};

export default GradesPage;
