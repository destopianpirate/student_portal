import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { motion } from 'framer-motion';
import { Award, Plus, Trash2, TrendingUp, BookOpen, BarChart3, Download, ChevronDown, ChevronUp, CalendarDays } from 'lucide-react';
import { fetchAndParseTimetable, isEvenSemester } from '../utils/parser';
import CGPAForecaster from '../components/grades/CGPAForecaster';
import SemesterCard from '../components/grades/SemesterCard';
import WeeklySchedule from '../components/grades/WeeklySchedule';
import CreditAuditWidget from '../components/grades/CreditAuditWidget';
import { handleExportPDF } from '../utils/settingsExporter';

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
      if (saved) return JSON.parse(saved);
      if (userProfile?.grades) return userProfile.grades;
      return [];
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
      // Auto sync to cloud in background
      saveProfile({ grades: semesters }).catch(err => {
        console.warn('Failed to auto-save grades to cloud:', err);
      });
    }
  }, [semesters, currentUser, saveProfile]);

  // Compute available semesters (1 to 8/10) that do not already exist in the list
  const availableSemesters = useMemo(() => {
    const list = [];
    const maxSems = (userProfile?.programme === 'B.Tech') ? 8 : 10;
    for (let i = 1; i <= maxSems; i++) {
      const name = `Semester ${i}`;
      const alreadyExists = semesters.some(sem => sem.name === name);
      if (!alreadyExists) {
        list.push(name);
      }
    }
    return list;
  }, [semesters, userProfile?.programme]);

  const addSemester = () => {
    if (!newSemName) return;
    // Enforce 8 semester limit for B.Tech if the name matches a semester number
    if (userProfile?.programme === 'B.Tech') {
      const semNum = parseInt(newSemName.match(/\d+/)?.[0]);
      if (!isNaN(semNum) && semNum > 8) {
        addNotification('error', 'Limit Reached', 'B.Tech programmes only support up to 8 semesters');
        return;
      }
    }
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

  const chartRange = useMemo(() => {
    if (sgpaTrend.length === 0) return { min: 6, max: 10 };
    const values = sgpaTrend.map(s => s.sgpa);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    
    const chartMin = minVal < 6 ? Math.max(0, Math.floor(minVal - 1)) : 6;
    const chartMax = Math.max(maxVal, 10);
    return { min: chartMin, max: chartMax };
  }, [sgpaTrend]);

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
      </div>

      <div className="academics-summary-grid">
        <div className="academics-summary-main">
          <div className="semesters-container-box">
            {/* Semesters list */}
            {semesters.map((sem, semIdx) => (
              <SemesterCard
                key={sem.id}
                sem={sem}
                semIdx={semIdx}
                expandedSem={expandedSem}
                setExpandedSem={setExpandedSem}
                calculateSGPA={calculateSGPA}
                GRADE_POINTS={GRADE_POINTS}
                GRADE_COLORS={GRADE_COLORS}
                removeSemester={removeSemester}
                addCourse={addCourse}
                removeCourse={removeCourse}
                updateCourse={updateCourse}
                activeSearch={activeSearch}
                setActiveSearch={setActiveSearch}
                filteredSuggestions={filteredSuggestions}
                handleSelectSuggestion={handleSelectSuggestion}
                itemVariants={itemVariants}
                currentSemester={userProfile?.semester}
              />
            ))}

            {/* Add Semester inside the same box */}
            <div className="add-semester-container-inside">
              {showAddSem ? (
                <motion.div className="add-semester-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                <button 
                  className="add-semester-btn" 
                  onClick={() => { setShowAddSem(true); setNewSemName(''); setIsCustomSem(false); }}
                >
                  <Plus size={14} /> Add Semester
                </button>
              )}
            </div>
          </div>

          {/* Credit Distribution & Degree Audit */}
          <div className="credit-audit-container">
            <CreditAuditWidget
              semesters={semesters}
              GRADE_POINTS={GRADE_POINTS}
              itemVariants={itemVariants}
            />
          </div>

          {/* Synced Weekly Schedule & Workload Card */}
          {timetableCourses.length > 0 && (
            <div className="weekly-schedule-container">
              <WeeklySchedule
                timetableCourses={timetableCourses}
                weeklySchedule={weeklySchedule}
                itemVariants={itemVariants}
              />
            </div>
          )}
        </div>

        <div className="academics-summary-sidebar">
          {/* Quick Stats Grid */}
          <div className="grades-sidebar-stats-grid">
            <div className="compact-grade-stat-card cgpa-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '115px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="compact-grade-stat-icon"><TrendingUp size={16} /></div>
                <div className="compact-grade-stat-value">{cgpa}</div>
                <div className="compact-grade-stat-label">Cumulative GPA</div>
              </div>
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
            <motion.div className="grades-chart-card glass-card spi-progress-chart-container" variants={itemVariants} style={{ position: 'relative', overflow: 'hidden', padding: '1rem', marginBottom: 0 }}>
              <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>
                <TrendingUp size={16} style={{ color: 'var(--primary)' }} /> Semester SPI Progress
              </h3>
              
              <div className="sgpa-chart" style={{ position: 'relative', height: '180px', padding: '1rem 0.5rem 0.5rem', background: 'rgba(99, 102, 241, 0.02)', border: '1px dashed var(--border)', borderRadius: '0.6rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {/* The main relative grid of the chart (height 120px) where the bars and baseline sit */}
                <div style={{ position: 'relative', height: '120px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', width: '100%', borderBottom: '1px solid var(--border)' }}>
                  
                  {/* Dashed CGPA Baseline across all bars, positioned relative to the 85px height container */}
                  {cgpa !== '—' && (
                    <div 
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: `${((parseFloat(cgpa) - chartRange.min) / (chartRange.max - chartRange.min)) * 100}%`,
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

                  {/* The columns of the chart */}
                  {sgpaTrend.map((s, i) => {
                    const heightPercent = ((s.sgpa - chartRange.min) / (chartRange.max - chartRange.min)) * 100;
                    return (
                      <div 
                        key={i} 
                        className="sgpa-bar-wrapper" 
                        onClick={() => handleChartBarClick(s.name)}
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'flex-end',
                          height: '100%',
                          flex: 1, 
                          position: 'relative', 
                          zIndex: 2,
                          cursor: 'pointer'
                        }}
                        title="Click to scroll to semester details"
                      >
                        {/* Label with the actual SGPA value - positioned absolutely above the bar so it never squashes the flex */}
                        <div style={{ position: 'absolute', bottom: `calc(${heightPercent}% + 2px)`, fontSize: '0.7rem', fontWeight: 'bold', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                          {s.sgpa.toFixed(2)}
                        </div>

                        {/* The visual bar */}
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
                      </div>
                    );
                  })}
                </div>

                {/* The labels at the very bottom (outside the relative grid) to avoid any overlapping */}
                <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', paddingTop: '0.4rem' }}>
                  {sgpaTrend.map((s, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                      {s.name}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Grade Distribution */}
          {Object.keys(gradeDistribution).length > 0 && (
            <motion.div className="grades-chart-card glass-card grade-distribution-container" variants={itemVariants} style={{ padding: '1rem', marginBottom: 0 }}>
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
            <div className="cgpa-forecaster-container">
              <CGPAForecaster
                cgpa={cgpa}
                targetCgpa={targetCgpa}
                setTargetCgpa={setTargetCgpa}
                remainingCredits={remainingCredits}
                setRemainingCredits={setRemainingCredits}
                requiredSPI={requiredSPI}
                itemVariants={itemVariants}
              />
            </div>
          )}

        </div>
      </div>

      <div className="page-footer">Built with ❤️ by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a></div>
    </motion.div>
  );
};

export default GradesPage;
