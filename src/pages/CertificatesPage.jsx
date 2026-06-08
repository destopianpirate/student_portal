import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Plus, X, ExternalLink, Trash2, Search, Calendar } from 'lucide-react';

const CERT_CATEGORIES = ['All', 'Programming', 'Data Science', 'Cloud', 'Design', 'Business', 'Academic', 'Other'];

const CertificatesPage = () => {
  const [certs, setCerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('student_certificates') || '[]'); } catch { return []; }
  });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', issuer: '', date: '', category: 'Other', url: '', skills: '' });

  const save = (u) => { setCerts(u); localStorage.setItem('student_certificates', JSON.stringify(u)); };

  const handleAdd = () => {
    if (!form.name) return;
    save([...certs, { ...form, id: Date.now(), skills: form.skills.split(',').map(t => t.trim()).filter(Boolean) }]);
    setForm({ name: '', issuer: '', date: '', category: 'Other', url: '', skills: '' });
    setShowForm(false);
  };

  const filtered = useMemo(() => {
    let r = certs;
    if (category !== 'All') r = r.filter(c => c.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(c => c.name.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q));
    }
    return r.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [certs, search, category]);

  const containerV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemV = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div className="page-container" variants={containerV} initial="hidden" animate="visible">
      <motion.div className="dashboard-premium-header" variants={itemV}>
        <div className="dashboard-premium-header-content">
          <div className="dashboard-premium-icon-wrap">
            <Award size={28} />
          </div>
          <div>
            <h2 className="dashboard-premium-title">Certificates</h2>
            <p className="dashboard-premium-subtitle">Your certificate vault and credentials</p>
          </div>
        </div>
        <div className="dashboard-premium-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}><Plus size={16} /> Add Certificate</button>
        </div>
      </motion.div>

      <motion.div className="search-bar-wrap" variants={itemV}>
        <Search size={16} />
        <input type="text" className="form-input" placeholder="Search certificates..." value={search} onChange={e => setSearch(e.target.value)} />
      </motion.div>

      <motion.div className="cal-filter-row" variants={itemV}>
        {CERT_CATEGORIES.map(c => (
          <button key={c} className={`cal-filter-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </motion.div>

      {showForm && (
        <motion.div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}><h3>Add Certificate</h3><button className="modal-close" onClick={() => setShowForm(false)}><X size={16} /></button></div>
          <input className="form-input" placeholder="Certificate name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
          <div className="form-row" style={{ marginTop: '.5rem' }}>
            <input className="form-input" placeholder="Issuer (e.g., Coursera, Google)" value={form.issuer} onChange={e => setForm(f => ({...f, issuer: e.target.value}))} />
            <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} />
          </div>
          <div className="form-row" style={{ marginTop: '.5rem' }}>
            <select className="form-input" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>{CERT_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}</select>
            <input className="form-input" placeholder="Credential URL (optional)" value={form.url} onChange={e => setForm(f => ({...f, url: e.target.value}))} />
          </div>
          <input className="form-input" placeholder="Skills (comma separated)" value={form.skills} onChange={e => setForm(f => ({...f, skills: e.target.value}))} style={{ marginTop: '.5rem' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '.5rem' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>Save</button>
          </div>
        </motion.div>
      )}

      <div className="certificates-grid">
        {filtered.length === 0 && <div className="empty-state glass-card"><Award size={40} style={{ opacity: 0.3 }} /><p>No certificates yet</p></div>}
        {filtered.map(c => (
          <motion.div key={c.id} className="cert-card glass-card" variants={itemV}>
            <div className="cert-icon-wrap"><Award size={28} /></div>
            <h4 className="cert-name">{c.name}</h4>
            <div className="cert-issuer">{c.issuer}</div>
            {c.date && <div className="cert-date"><Calendar size={11} /> {new Date(c.date + 'T00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>}
            <span className="cert-category">{c.category}</span>
            {c.skills?.length > 0 && <div className="note-tags" style={{ marginTop: '.5rem' }}>{c.skills.map(s => <span key={s} className="note-tag">{s}</span>)}</div>}
            <div className="cert-actions">
              {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="resource-link"><ExternalLink size={12} /> View</a>}
              <button onClick={() => save(certs.filter(x => x.id !== c.id))} className="cal-delete-btn"><Trash2 size={12} /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CertificatesPage;
