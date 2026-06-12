import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, CalendarDays, Target, BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react';
import GradesPage from './GradesPage';
import AttendancePage from './AttendancePage';
import GoalsPage from './GoalsPage';
import { useAuth } from '../contexts/AuthContext';

const DEPARTMENT_MAP = {
  'BE': 'Biological Engineering',
  'BS': 'Basic Sciences',
  'CE': 'Civil Engineering',
  'CG': 'Cognitive Science',
  'CH': 'Chemistry',
  'CL': 'Chemical Engineering',
  'CS': 'Computer Science & Engineering',
  'DES': 'Design',
  'EE': 'Electrical Engineering',
  'EH': 'Earth System Science',
  'ES': 'Earth Sciences',
  'FP': 'Foundation Program',
  'GE': 'General Engineering',
  'HS': 'Humanities & Social Sciences',
  'IN': 'Interdisciplinary',
  'MA': 'Mathematics',
  'ME': 'Mechanical Engineering',
  'MS': 'Materials Science',
  'MSE': 'Materials Science & Engineering',
  'MTE': 'Materials Engineering',
  'PH': 'Physics'
};

const CoursePolicyTab = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [expandedCode, setExpandedCode] = useState(null);
  const [deptFilter, setDeptFilter] = useState('all');
  const [displayLimit, setDisplayLimit] = useState(50);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch('/course_policy.json');
        if (!res.ok) throw new Error('Failed to fetch course policy');
        const data = await res.json();
        
        // Map abbreviation filters to full names for display
        const mapped = data.map(c => ({
          ...c,
          dept: DEPARTMENT_MAP[c.deptFilter] || c.deptFilter
        }));
        
        // Sort courses by code alphabetically
        mapped.sort((a, b) => a.code.localeCompare(b.code));
        
        setCourses(mapped);
      } catch (e) {
        console.error('Error loading course policy:', e);
        setError('Failed to load course policy database.');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const departments = useMemo(() => {
    const depts = [...new Set(courses.map(c => c.dept))];
    return depts.sort();
  }, [courses]);

  const filtered = useMemo(() => {
    let results = courses;
    if (deptFilter !== 'all') {
      results = results.filter(c => c.dept === deptFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(c => 
        c.code.toLowerCase().includes(q) || 
        c.name.toLowerCase().includes(q) || 
        c.dept.toLowerCase().includes(q)
      );
    }
    return results;
  }, [courses, search, deptFilter]);

  // Reset display limit when search or filter changes
  useEffect(() => {
    setDisplayLimit(50);
  }, [search, deptFilter]);

  const displayedCourses = useMemo(() => {
    return filtered.slice(0, displayLimit);
  }, [filtered, displayLimit]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0', flexDirection: 'column', gap: '1rem' }}>
        <div className="loading-spinner" />
        <p style={{ color: 'var(--text-muted)' }}>Loading course policies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem 0', textAlign: 'center' }}>
        <p style={{ color: '#ef4444' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem 0' }}>
      <div className="course-policy-controls">
        <div className="course-search-wrap">
          <Search size={14} />
          <input 
            type="text" 
            placeholder="Search by code or name..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="form-input" 
          />
        </div>
        <select 
          className="form-input" 
          value={deptFilter} 
          onChange={e => setDeptFilter(e.target.value)} 
          style={{ maxWidth: 240 }}
        >
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="course-count">{filtered.length} courses found</div>
      <div className="course-policy-table-wrap glass-card">
        <table className="course-policy-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Course Name</th>
              <th>L</th>
              <th>T</th>
              <th>P</th>
              <th>C</th>
              <th>Department</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayedCourses.map(c => (
              <React.Fragment key={c.code}>
                <tr className={`course-row ${expandedCode === c.code ? 'expanded' : ''}`} onClick={() => setExpandedCode(expandedCode === c.code ? null : c.code)}>
                  <td><span className="course-code-badge">{c.code}</span></td>
                  <td className="course-name-cell">{c.name}</td>
                  <td>{c.L}</td>
                  <td>{c.T}</td>
                  <td>{c.P}</td>
                  <td><strong>{c.C}</strong></td>
                  <td><span className="course-dept-badge">{c.dept}</span></td>
                  <td>{expandedCode === c.code ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</td>
                </tr>
                {expandedCode === c.code && (
                  <tr className="course-syllabus-row">
                    <td colSpan={8}>
                      <div className="course-syllabus-content">
                        <strong>Syllabus:</strong> {c.description || 'No syllabus description available.'}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {filtered.length > displayLimit && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setDisplayLimit(prev => prev + 50)}
              style={{ padding: '0.5rem 2rem' }}
            >
              Load More Courses (+50)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ACADEMIC_GRADE_POINTS = {
  'A+': 11, 'A': 10, 'A-': 9, 'B': 8, 'B-': 7, 'C': 6,
  'C-': 5, 'D': 4, 'E': 2, 'F': 0, 'I': null, 'W': null,
};

const AcademicsPage = () => {
  const [activeTab, setActiveTab] = useState('grades');
  const { currentUser, userProfile } = useAuth();
  const [academicsMeta, setAcademicsMeta] = useState({ cgpa: '—', credits: 0, semestersCount: 0 });

  const tabs = [
    { key: 'grades', label: 'Academic Summary', icon: Award },
    { key: 'attendance', label: 'Attendance', icon: CalendarDays },
    { key: 'goals', label: 'Goals', icon: Target },
    { key: 'courses', label: 'Course Policy', icon: BookOpen },
  ];

  useEffect(() => {
    if (!currentUser) return;
    try {
      const grades = JSON.parse(localStorage.getItem(`grades_${currentUser.uid}`) || '[]');
      let totalPoints = 0, totalCredits = 0;
      let completedCredits = 0;
      grades.forEach(sem => {
        sem.courses?.forEach(c => {
          const gp = ACADEMIC_GRADE_POINTS[c.grade];
          if (gp !== null && gp !== undefined && c.credits > 0) {
            totalPoints += gp * parseFloat(c.credits);
            totalCredits += parseFloat(c.credits);
          }
          if (gp !== null && gp !== undefined && gp > 0) {
            completedCredits += parseFloat(c.credits || 0);
          }
        });
      });
      const calcCgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '—';
      setAcademicsMeta({
        cgpa: calcCgpa !== '—' ? calcCgpa : (userProfile?.cgpa || '—'),
        credits: completedCredits,
        semestersCount: grades.length
      });
    } catch (e) {
      console.error('Error loading academics meta:', e);
    }
  }, [currentUser, userProfile?.cgpa]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div className="page-container" variants={containerVariants} initial="hidden" animate="visible" style={{ paddingBottom: 0 }}>

      {/* Academic Profile Card */}
      {userProfile && (
        <motion.div 
          className="academic-profile-header-card glass-card"
          variants={itemVariants}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
            borderRadius: '1.25rem',
            marginBottom: '2rem',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            gap: '1.5rem',
            flexWrap: 'wrap',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '200px',
            height: '200px',
            background: 'var(--primary)',
            filter: 'blur(80px)',
            opacity: 0.08,
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            {userProfile.profilePhotoBase64 ? (
              <img 
                src={userProfile.profilePhotoBase64} 
                alt="Student Profile" 
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--primary)',
                  boxShadow: '0 0 15px rgba(99, 102, 241, 0.25)'
                }}
              />
            ) : (
              <div 
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '1.75rem',
                  fontWeight: 'bold',
                  boxShadow: '0 0 15px rgba(99, 102, 241, 0.25)'
                }}
              >
                {userProfile.firstName?.[0] || userProfile.name?.[0] || 'S'}
              </div>
            )}

            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)' }}>
                {userProfile.name || `${userProfile.firstName || ''} ${userProfile.surname || ''}`.trim() || 'Student'}
              </h3>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Roll Number: <strong>{userProfile.rollNumber || 'N/A'}</strong> | {userProfile.programme || 'N/A'} in {userProfile.branch || 'N/A'}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="semester-synced-badge" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '2rem' }}>
                  {userProfile.semester || 'N/A'}
                </span>
                {userProfile.minor && (
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.2rem 0.6rem', borderRadius: '2rem', fontWeight: 600 }}>
                    Minor: {userProfile.minor}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', fontWeight: 700 }}>
                Cumulative GPA
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
                {academicsMeta.cgpa}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '-0.1rem' }}>
                on 11.00 scale
              </div>
            </div>

            <div style={{ width: '120px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', fontWeight: 700 }}>
                Degree Credits
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>
                {academicsMeta.credits} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Done</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--input-bg)', borderRadius: '10px', marginTop: '0.35rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ width: `${Math.min(100, (academicsMeta.credits / 180) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '10px' }} />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div className="study-tabs" variants={itemVariants}>
        {tabs.map(t => (
          <button key={t.key} className={`study-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </motion.div>

      <div className="academics-content" style={{ marginTop: '-1.5rem' }}>
        {activeTab === 'grades' && <GradesPage />}
        {activeTab === 'attendance' && <AttendancePage />}
        {activeTab === 'goals' && <GoalsPage />}
        {activeTab === 'courses' && <CoursePolicyTab />}
      </div>
    </motion.div>
  );
};

export default AcademicsPage;
