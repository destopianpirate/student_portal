import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Plus, Trash2, Calendar, Flag, Filter, ArrowRight, CheckCircle2, Clock, AlertCircle, Download } from 'lucide-react';

const PRIORITY_CONFIG = {
  high: { color: '#ef4444', label: 'High', icon: '🔴' },
  medium: { color: '#f59e0b', label: 'Medium', icon: '🟡' },
  low: { color: '#22c55e', label: 'Low', icon: '🟢' },
};

const STATUS_CONFIG = {
  todo: { label: 'To Do', color: '#6366f1', icon: ClipboardList },
  'in-progress': { label: 'In Progress', color: '#f59e0b', icon: Clock },
  completed: { label: 'Completed', color: '#22c55e', icon: CheckCircle2 },
};

const AssignmentsPage = () => {
  const { currentUser, saveProfile } = useAuth();
  const { addNotification } = useNotifications();

  const [assignments, setAssignments] = useState(() => {
    if (!currentUser) return [];
    try { return JSON.parse(localStorage.getItem(`assignments_${currentUser.uid}`)) || []; } catch { return []; }
  });

  const [showAdd, setShowAdd] = useState(false);
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [newAssignment, setNewAssignment] = useState({
    title: '', course: '', dueDate: '', priority: 'medium', description: '', status: 'todo'
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`assignments_${currentUser.uid}`, JSON.stringify(assignments));
    }
  }, [assignments, currentUser]);

  const addAssignment = () => {
    if (!newAssignment.title.trim()) return;
    setAssignments(prev => [...prev, { ...newAssignment, id: Date.now(), createdAt: new Date().toISOString() }]);
    setNewAssignment({ title: '', course: '', dueDate: '', priority: 'medium', description: '', status: 'todo' });
    setShowAdd(false);
    addNotification('success', 'Assignment Added', newAssignment.title);
  };

  const removeAssignment = (id) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const moveStatus = (id, newStatus) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    if (newStatus === 'completed') {
      addNotification('achievement', 'Assignment Completed! 🎉', 'Great job finishing your work!');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const isOverdue = (assignment) => {
    return assignment.dueDate && assignment.dueDate < todayStr && assignment.status !== 'completed';
  };

  const uniqueCourses = useMemo(() => {
    return [...new Set(assignments.map(a => a.course).filter(Boolean))];
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      if (filterCourse !== 'all' && a.course !== filterCourse) return false;
      if (filterPriority !== 'all' && a.priority !== filterPriority) return false;
      return true;
    });
  }, [assignments, filterCourse, filterPriority]);

  const grouped = useMemo(() => {
    const g = { todo: [], 'in-progress': [], completed: [] };
    filteredAssignments.forEach(a => {
      if (g[a.status]) g[a.status].push(a);
    });
    // Sort: overdue first, then by due date
    Object.values(g).forEach(arr => arr.sort((a, b) => {
      const aOverdue = isOverdue(a) ? 0 : 1;
      const bOverdue = isOverdue(b) ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      return (a.dueDate || 'z').localeCompare(b.dueDate || 'z');
    }));
    return g;
  }, [filteredAssignments]);

  const stats = useMemo(() => ({
    total: assignments.length,
    todo: assignments.filter(a => a.status === 'todo').length,
    inProgress: assignments.filter(a => a.status === 'in-progress').length,
    completed: assignments.filter(a => a.status === 'completed').length,
    overdue: assignments.filter(a => isOverdue(a)).length,
  }), [assignments]);

  const handleSave = async () => {
    try {
      await saveProfile({ assignments });
      addNotification('success', 'Saved', 'Assignments synced to cloud');
    } catch {
      addNotification('error', 'Save Failed', 'Data saved locally only');
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  const nextStatus = (status) => {
    if (status === 'todo') return 'in-progress';
    if (status === 'in-progress') return 'completed';
    return null;
  };

  return (
    <motion.div className="page-container" variants={containerVariants} initial="hidden" animate="visible">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <ClipboardList size={24} style={{ color: 'var(--primary)' }} /> Assignment Manager
        </h2>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} /> New</button>
          <button className="btn btn-outline btn-sm" onClick={handleSave}><Download size={14} /> Save</button>
        </div>
      </div>

      {/* Stats */}
      <motion.div className="grades-stats-row" variants={itemVariants}>
        <div className="grade-stat-card"><div className="grade-stat-value">{stats.total}</div><div className="grade-stat-label">Total</div></div>
        <div className="grade-stat-card" style={{ borderLeft: '3px solid #6366f1' }}><div className="grade-stat-value">{stats.todo}</div><div className="grade-stat-label">To Do</div></div>
        <div className="grade-stat-card" style={{ borderLeft: '3px solid #f59e0b' }}><div className="grade-stat-value">{stats.inProgress}</div><div className="grade-stat-label">In Progress</div></div>
        <div className="grade-stat-card" style={{ borderLeft: '3px solid #22c55e' }}><div className="grade-stat-value">{stats.completed}</div><div className="grade-stat-label">Done</div></div>
        {stats.overdue > 0 && <div className="grade-stat-card" style={{ borderLeft: '3px solid #ef4444' }}><div className="grade-stat-value" style={{ color: '#ef4444' }}>{stats.overdue}</div><div className="grade-stat-label">Overdue</div></div>}
      </motion.div>

      {/* Filters */}
      <motion.div className="assignment-filters" variants={itemVariants}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <select className="grade-course-input grade" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
            <option value="all">All Courses</option>
            {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="grade-course-input grade" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>
      </motion.div>

      {/* Add Assignment Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div className="assignment-add-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="assignment-add-modal" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
              <h3 style={{ marginBottom: '1rem' }}>New Assignment</h3>
              <div className="edit-profile-grid">
                <div className="edit-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Title *</label>
                  <input value={newAssignment.title} onChange={e => setNewAssignment(p => ({ ...p, title: e.target.value }))} placeholder="Assignment title" autoFocus />
                </div>
                <div className="edit-field">
                  <label>Course</label>
                  <input value={newAssignment.course} onChange={e => setNewAssignment(p => ({ ...p, course: e.target.value }))} placeholder="Course name" list="course-list" />
                  <datalist id="course-list">{uniqueCourses.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div className="edit-field">
                  <label>Due Date</label>
                  <input type="date" value={newAssignment.dueDate} onChange={e => setNewAssignment(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
                <div className="edit-field">
                  <label>Priority</label>
                  <select value={newAssignment.priority} onChange={e => setNewAssignment(p => ({ ...p, priority: e.target.value }))}>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
                <div className="edit-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea rows={3} value={newAssignment.description} onChange={e => setNewAssignment(p => ({ ...p, description: e.target.value }))} placeholder="Optional notes..." style={{ resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={addAssignment}>Add Assignment</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      <motion.div className="kanban-board" variants={itemVariants}>
        {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => {
          const Icon = config.icon;
          return (
            <div key={statusKey} className="kanban-column">
              <div className="kanban-column-header" style={{ borderTopColor: config.color }}>
                <Icon size={16} style={{ color: config.color }} />
                <span>{config.label}</span>
                <span className="kanban-count">{grouped[statusKey]?.length || 0}</span>
              </div>
              <div className="kanban-cards">
                <AnimatePresence>
                  {grouped[statusKey]?.map(assignment => (
                    <motion.div
                      key={assignment.id}
                      className={`kanban-card ${isOverdue(assignment) ? 'overdue' : ''}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <div className="kanban-card-header">
                        <span className="kanban-priority" title={PRIORITY_CONFIG[assignment.priority]?.label}>
                          {PRIORITY_CONFIG[assignment.priority]?.icon}
                        </span>
                        {isOverdue(assignment) && <span className="overdue-badge"><AlertCircle size={11} /> Overdue</span>}
                        <button className="btn-icon-sm danger" onClick={() => removeAssignment(assignment.id)} style={{ marginLeft: 'auto' }}><Trash2 size={12} /></button>
                      </div>
                      <div className="kanban-card-title">{assignment.title}</div>
                      {assignment.course && <div className="kanban-card-course">{assignment.course}</div>}
                      {assignment.dueDate && (
                        <div className="kanban-card-due">
                          <Calendar size={11} /> {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                      {assignment.description && <div className="kanban-card-desc">{assignment.description}</div>}
                      {nextStatus(assignment.status) && (
                        <button className="kanban-move-btn" onClick={() => moveStatus(assignment.id, nextStatus(assignment.status))}>
                          Move to {STATUS_CONFIG[nextStatus(assignment.status)].label} <ArrowRight size={12} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {(!grouped[statusKey] || grouped[statusKey].length === 0) && (
                  <div className="kanban-empty">No items</div>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>

      <div className="page-footer">Built with ❤️ by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a></div>
    </motion.div>
  );
};

export default AssignmentsPage;
