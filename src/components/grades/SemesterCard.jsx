import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, ChevronUp, ChevronDown, BookOpen, Plus } from 'lucide-react';

const SemesterCard = ({
  sem,
  semIdx,
  expandedSem,
  setExpandedSem,
  calculateSGPA,
  GRADE_POINTS,
  GRADE_COLORS,
  removeSemester,
  addCourse,
  removeCourse,
  updateCourse,
  activeSearch,
  setActiveSearch,
  filteredSuggestions,
  handleSelectSuggestion,
  itemVariants,
  currentSemester
}) => {
  const currentSemNum = parseInt(currentSemester?.match(/\d+/)?.[0] || '1');
  const thisSemNum = parseInt(sem.name?.match(/\d+/)?.[0]);
  const isEditable = isNaN(thisSemNum) || thisSemNum < currentSemNum;
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
      className={`compact-semester-card ${sem.isSynced ? 'is-synced-card' : ''}`} 
      variants={itemVariants}
    >
      <div className="compact-semester-header" onClick={() => setExpandedSem(isExpanded ? null : semIdx)}>
        <div className="semester-header-left">
          <h3>{sem.name}</h3>
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
          {sem.isSynced && (
            <span className="semester-synced-badge">
              Synced with Timetable
            </span>
          )}
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
              <div className="course-name-credits-group">
                <div className="course-input-wrapper" style={{ position: 'relative' }}>
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
                
                <div className="course-credits-wrapper">
                  <span className="credits-label">Credits:</span>
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
                  style={{ fontWeight: 'bold', cursor: isEditable ? 'pointer' : 'not-allowed' }}
                  disabled={!isEditable}
                  title={isEditable ? "Select Grade" : "Grades can only be entered/edited for completed (previous) semesters"}
                >
                  <option value="">{isEditable ? 'Grade' : 'Locked'}</option>
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
};

export default SemesterCard;
