import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, CalendarDays, Target, BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react';
import GradesPage from './GradesPage';
import AttendancePage from './AttendancePage';
import GoalsPage from './GoalsPage';

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

const AcademicsPage = () => {
  const [activeTab, setActiveTab] = useState('grades');

  const tabs = [
    { key: 'grades', label: 'Academic Summary', icon: Award },
    { key: 'attendance', label: 'Attendance', icon: CalendarDays },
    { key: 'goals', label: 'Goals', icon: Target },
    { key: 'courses', label: 'Course Policy', icon: BookOpen },
  ];

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div className="page-container" variants={containerVariants} initial="hidden" animate="visible" style={{ paddingBottom: 0 }}>
      <motion.div variants={itemVariants}>
        <h2 className="page-title"><GraduationCap size={24} /> Academics</h2>
        <p className="page-subtitle">Manage your grades, attendance, goals, and explore course policies</p>
      </motion.div>

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
