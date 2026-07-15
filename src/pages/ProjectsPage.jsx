import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, Plus, X, Save, Trash2, ExternalLink, GitBranch, Clock } from 'lucide-react';

const STATUS = ['Not Started', 'In Progress', 'Completed'];
const STATUS_COLORS = { 'Not Started': '#94a3b8', 'In Progress': '#f59e0b', 'Completed': '#22c55e' };

const ProjectsPage = () => {
  const [projects, setProjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem('student_projects') || '[]'); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'Not Started', techStack: '', github: '', progress: 0 });
  const [filterStatus, setFilterStatus] = useState('all');

  const save = (u) => { setProjects(u); localStorage.setItem('student_projects', JSON.stringify(u)); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const proj = { ...form, id: editing?.id || Date.now(), techStack: form.techStack.split(',').map(t => t.trim()).filter(Boolean), updatedAt: new Date().toISOString() };
    if (editing) save(projects.map(p => p.id === editing.id ? proj : p));
    else save([...projects, proj]);
    setForm({ name: '', description: '', status: 'Not Started', techStack: '', github: '', progress: 0 });
    setEditing(null); setShowForm(false);
  };

  const filtered = useMemo(() => {
    if (filterStatus === 'all') return projects;
    return projects.filter(p => p.status === filterStatus);
  }, [projects, filterStatus]);

  const containerV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemV = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div className="page-container" variants={containerV} initial="hidden" animate="visible">
      <motion.div className="page-header-row" variants={itemV}>
        <div>
          <h2 className="page-title"><FolderKanban size={24} /> Projects</h2>
          <p className="page-subtitle">Track your academic and personal projects</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm({ name: '', description: '', status: 'Not Started', techStack: '', github: '', progress: 0 }); setShowForm(true); }}>
          <Plus size={16} /> New Project
        </button>
      </motion.div>

      <motion.div className="cal-filter-row" variants={itemV}>
        <button className={`cal-filter-btn ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>All ({projects.length})</button>
        {STATUS.map(s => (
          <button key={s} className={`cal-filter-btn ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
            {s} ({projects.filter(p => p.status === s).length})
          </button>
        ))}
      </motion.div>

      {showForm && (
        <motion.div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>{editing ? 'Edit Project' : 'New Project'}</h3>
            <button className="modal-close" onClick={() => setShowForm(false)}><X size={16} /></button>
          </div>
          <input className="form-input" placeholder="Project name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
          <textarea className="form-input" placeholder="Description" rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} style={{ marginTop: '.5rem' }} />
          <div className="form-row" style={{ marginTop: '.5rem' }}>
            <select className="form-input" value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
              {STATUS.map(s => <option key={s}>{s}</option>)}
            </select>
            <input className="form-input" placeholder="Tech stack (comma separated)" value={form.techStack} onChange={e => setForm(f => ({...f, techStack: e.target.value}))} />
          </div>
          <div className="form-row" style={{ marginTop: '.5rem' }}>
            <input className="form-input" placeholder="GitHub URL (optional)" value={form.github} onChange={e => setForm(f => ({...f, github: e.target.value}))} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', minWidth: 200 }}>
              <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Progress:</span>
              <input type="range" min="0" max="100" value={form.progress} onChange={e => setForm(f => ({...f, progress: parseInt(e.target.value)}))} style={{ flex: 1 }} />
              <span style={{ fontSize: '.8rem', fontWeight: 600 }}>{form.progress}%</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave}><Save size={14} /> Save</button>
          </div>
        </motion.div>
      )}

      <div className="projects-grid">
        {filtered.length === 0 && <div className="empty-state glass-card"><FolderKanban size={40} style={{ opacity: 0.3 }} /><p>No projects yet</p></div>}
        {filtered.map(p => (
          <motion.div key={p.id} className="glass-card project-card" variants={itemV}>
            <div className="project-header">
              <h4>{p.name}</h4>
              <span className="project-status-badge" style={{ color: STATUS_COLORS[p.status] }}>{p.status}</span>
            </div>
            {p.description && <p className="project-desc">{p.description}</p>}
            <div className="project-progress-bar">
              <div className="project-progress-fill" style={{ width: `${p.progress}%`, background: STATUS_COLORS[p.status] }} />
            </div>
            <div className="project-meta">
              <span>{p.progress}% complete</span>
              {p.github && <a href={p.github} target="_blank" rel="noreferrer" className="project-link"><GitBranch size={12} /> GitHub</a>}
            </div>
            {p.techStack?.length > 0 && <div className="project-tech">{p.techStack.map(t => <span key={t} className="note-tag">{t}</span>)}</div>}
            <div className="project-actions">
              <button onClick={() => { setEditing(p); setForm({ ...p, techStack: Array.isArray(p.techStack) ? p.techStack.join(', ') : '' }); setShowForm(true); }} className="btn btn-outline btn-sm">Edit</button>
              <button onClick={() => save(projects.filter(x => x.id !== p.id))} className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }}><Trash2 size={12} /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProjectsPage;
