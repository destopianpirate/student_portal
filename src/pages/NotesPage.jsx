import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { StickyNote, Plus, Search, Pin, Trash2, Edit3, X, Save, Tag } from 'lucide-react';
import CourseInput from '../components/CourseInput';

const NotesPage = () => {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('student_notes') || '[]'); } catch { return []; }
  });
  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', course: '', tags: '', pinned: false, color: '#6366f1' });

  const save = (updated) => { setNotes(updated); localStorage.setItem('student_notes', JSON.stringify(updated)); };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const note = {
      ...form,
      id: editingNote?.id || Date.now(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
      createdAt: editingNote?.createdAt || new Date().toISOString(),
    };
    if (editingNote) {
      save(notes.map(n => n.id === editingNote.id ? note : n));
    } else {
      save([note, ...notes]);
    }
    setForm({ title: '', content: '', course: '', tags: '', pinned: false, color: '#6366f1' });
    setEditingNote(null);
    setShowEditor(false);
  };

  const deleteNote = (id) => save(notes.filter(n => n.id !== id));
  const togglePin = (id) => save(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));

  const filtered = useMemo(() => {
    let result = [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.updatedAt) - new Date(a.updatedAt));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.course.toLowerCase().includes(q));
    }
    return result;
  }, [notes, search]);

  const startEdit = (note) => {
    setEditingNote(note);
    setForm({ ...note, tags: Array.isArray(note.tags) ? note.tags.join(', ') : '' });
    setShowEditor(true);
  };

  const containerV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemV = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div className="page-container" variants={containerV} initial="hidden" animate="visible">
      <motion.div className="page-header-row" variants={itemV}>
        <div>
          <h2 className="page-title"><StickyNote size={24} /> Notes</h2>
          <p className="page-subtitle">Capture and organize your academic notes</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditingNote(null); setForm({ title: '', content: '', course: '', tags: '', pinned: false, color: '#6366f1' }); setShowEditor(true); }}>
          <Plus size={16} /> New Note
        </button>
      </motion.div>

      <motion.div className="search-bar-wrap" variants={itemV}>
        <Search size={16} />
        <input type="text" className="form-input" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
      </motion.div>

      {showEditor && (
        <motion.div className="note-editor glass-card" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
          <div className="note-editor-header">
            <h3>{editingNote ? 'Edit Note' : 'New Note'}</h3>
            <button className="modal-close" onClick={() => setShowEditor(false)}><X size={16} /></button>
          </div>
          <input type="text" className="form-input" placeholder="Note title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <CourseInput value={form.course} onChange={v => setForm(f => ({ ...f, course: v }))} placeholder="Course (optional)" />
          <textarea className="form-input note-textarea" placeholder="Write your note content here..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} />
          <div className="form-row">
            <input type="text" className="form-input" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            <input type="color" className="form-color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
            <button className="btn btn-primary btn-sm" onClick={handleSave}><Save size={14} /> Save</button>
          </div>
        </motion.div>
      )}

      <div className="notes-grid">
        {filtered.length === 0 && (
          <div className="empty-state glass-card"><StickyNote size={40} style={{ opacity: 0.3 }} /><p>No notes yet</p></div>
        )}
        {filtered.map(n => (
          <motion.div key={n.id} className="note-card glass-card" variants={itemV} style={{ borderLeft: `3px solid ${n.color}` }}>
            {n.pinned && <Pin size={12} className="note-pin-icon" />}
            <h4 className="note-title">{n.title}</h4>
            {n.course && <div className="note-course"><Tag size={11} /> {n.course}</div>}
            <p className="note-preview">{n.content.substring(0, 120)}{n.content.length > 120 ? '...' : ''}</p>
            {n.tags?.length > 0 && <div className="note-tags">{n.tags.map(t => <span key={t} className="note-tag">{t}</span>)}</div>}
            <div className="note-footer">
              <span className="note-date">{new Date(n.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <div className="note-actions">
                <button onClick={() => togglePin(n.id)} title="Pin"><Pin size={13} /></button>
                <button onClick={() => startEdit(n)} title="Edit"><Edit3 size={13} /></button>
                <button onClick={() => deleteNote(n.id)} title="Delete"><Trash2 size={13} /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default NotesPage;
