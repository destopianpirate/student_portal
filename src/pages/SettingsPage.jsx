import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Moon, Sun, LogOut, Edit2, Shield, Save, X, Camera, Link2, GraduationCap, Mail, Phone, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PROGRAMMES = ['BTech','MTech','Dual (BTech+MTech)','MA','BA','BSc','MSc','PhD'];
const BRANCHES = ['Computer Science and Engineering','Electrical Engineering','Mechanical Engineering','Civil Engineering','Chemical Engineering','Materials Science','Mathematics','Physics','Chemistry','Humanities and Social Sciences','Biological Engineering','Cognitive Science','Other'];
const AVATAR_SEEDS = ['Felix','Aneka','Milo','Luna','Pepper','Oscar','Bella','Shadow','Simba','Nala','Oreo','Coco','Buddy','Daisy','Max','Ruby','Charlie','Olive','Leo','Willow'];

const SettingsPage = ({ darkMode, setDarkMode }) => {
  const { currentUser, userProfile, logout, saveProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: '', username: '', rollNumber: '', programme: '', branch: '',
    yearOfAdmission: '', avatarUrl: '', customPhotoUrl: '',
    github: '', instagram: '', linkedin: '', phone: '', gmail: '',
  });

  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name || '',
        username: userProfile.username || '',
        rollNumber: userProfile.rollNumber || '',
        programme: userProfile.programme || '',
        branch: userProfile.branch || '',
        yearOfAdmission: userProfile.yearOfAdmission || '',
        avatarUrl: userProfile.avatarUrl || '',
        customPhotoUrl: userProfile.customPhotoUrl || '',
        github: userProfile.github || '',
        instagram: userProfile.instagram || '',
        linkedin: userProfile.linkedin || '',
        phone: userProfile.phone || '',
        gmail: userProfile.gmail || '',
      });
    }
  }, [userProfile]);

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const currentYear = new Date().getFullYear();
  const admissionYears = Array.from({ length: 7 }, (_, i) => currentYear - i);

  const getDisplayAvatar = () => {
    if (form.customPhotoUrl) return form.customPhotoUrl;
    if (form.avatarUrl) return form.avatarUrl;
    return currentUser?.email ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${currentUser.email}` : '';
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const yoa = parseInt(form.yearOfAdmission);
      const diff = currentYear - yoa;
      const month = new Date().getMonth();
      const yr = diff + 1;
      const sem = (diff * 2) + (month >= 6 ? 2 : 1);
      const ord = ['th','st','nd','rd'];
      const v = yr % 100;
      const suffix = ord[(v - 20) % 10] || ord[v] || ord[0];

      await saveProfile({
        ...form,
        avatarUrl: form.customPhotoUrl || form.avatarUrl,
        yearOfAdmission: yoa || form.yearOfAdmission,
        currentYear: yoa ? `${yr}${suffix} Year` : userProfile?.currentYear,
        semester: yoa ? `Semester ${sem}` : userProfile?.semester,
      });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const displayAvatar = getDisplayAvatar();

  return (
    <div className="page-container">
      <h2 style={{ marginBottom: '2rem' }}>Settings</h2>

      {saved && <div className="auth-success" style={{ marginBottom: '1rem' }}>Profile updated successfully!</div>}

      {/* PROFILE SECTION */}
      <div className="settings-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3><User size={18} /> Profile</h3>
          {!editing ? (
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}><Edit2 size={14} /> Edit All</button>
          ) : (
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}><Save size={14} /> {saving ? 'Saving...' : 'Save'}</button>
              <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}><X size={14} /></button>
            </div>
          )}
        </div>

        <div className="settings-card" style={{ marginTop: '1rem' }}>
          {!editing ? (
            /* VIEW MODE */
            <>
              <div className="settings-profile-row" style={{ marginBottom: '1.5rem' }}>
                <img src={displayAvatar} alt="Avatar" className="settings-avatar" style={{ width: 72, height: 96, borderRadius: '.75rem', objectFit: 'cover' }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{userProfile?.name || 'Student'}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>@{userProfile?.username || '—'}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>{currentUser?.email}</p>
                </div>
              </div>
              <div className="profile-details-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                {[
                  { l: 'Name', v: userProfile?.name },
                  { l: 'Username', v: userProfile?.username },
                  { l: 'Roll Number', v: userProfile?.rollNumber },
                  { l: 'Programme', v: userProfile?.programme },
                  { l: 'Branch', v: userProfile?.branch },
                  { l: 'Current Year', v: userProfile?.currentYear },
                  { l: 'Semester', v: userProfile?.semester },
                  { l: 'Year of Admission', v: userProfile?.yearOfAdmission },
                  { l: 'Email', v: currentUser?.email },
                  { l: 'Gmail', v: userProfile?.gmail },
                  { l: 'Phone', v: userProfile?.phone },
                  { l: 'Photo URL', v: userProfile?.customPhotoUrl, link: true },
                  { l: 'GitHub', v: userProfile?.github, link: true },
                  { l: 'Instagram', v: userProfile?.instagram, link: true },
                  { l: 'LinkedIn', v: userProfile?.linkedin, link: true },
                ].map(({ l, v, link }) => (
                  <div key={l} className="profile-detail-item">
                    <span className="detail-label">{l}</span>
                    <span className="detail-value">
                      {link && v ? <a href={v.startsWith('http') ? v : `https://${v}`} target="_blank" rel="noreferrer">{v.length > 30 ? v.slice(0, 30) + '...' : v}</a> : (v || '—')}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* EDIT MODE */
            <>
              {/* Photo Section */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--input-bg)', borderRadius: '.75rem' }}>
                <h4 style={{ marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}><Camera size={16} /> Profile Photo</h4>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <div style={{ textAlign: 'center' }}>
                    <img src={getDisplayAvatar()} alt="Preview" style={{ width: 80, height: 106, borderRadius: '.75rem', objectFit: 'cover', border: '3px solid var(--primary)', display: 'block', marginBottom: '.5rem' }} />
                    <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>Preview</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="edit-field" style={{ marginBottom: '.75rem' }}>
                      <label><Link2 size={12} /> Custom Photo URL (Google Drive, etc.)</label>
                      <input placeholder="https://drive.google.com/..." value={form.customPhotoUrl} onChange={e => update('customPhotoUrl', e.target.value)} />
                    </div>
                    <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.5rem' }}>Or choose a DiceBear avatar:</p>
                    <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                      {AVATAR_SEEDS.map(seed => {
                        const url = `https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}`;
                        const isSelected = !form.customPhotoUrl && form.avatarUrl === url;
                        return (
                          <img key={seed} src={url} alt={seed}
                            onClick={() => { update('avatarUrl', url); update('customPhotoUrl', ''); }}
                            style={{ width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', border: isSelected ? '3px solid var(--primary)' : '2px solid transparent', transition: 'all .2s' }} />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* All Fields */}
              <div className="edit-profile-grid">
                <div className="edit-field"><label><User size={12} /> Full Name</label><input value={form.name} onChange={e => update('name', e.target.value)} /></div>
                <div className="edit-field"><label><User size={12} /> Username</label><input value={form.username} onChange={e => update('username', e.target.value)} /></div>
                <div className="edit-field"><label><GraduationCap size={12} /> Roll Number</label><input value={form.rollNumber} onChange={e => update('rollNumber', e.target.value)} /></div>
                <div className="edit-field">
                  <label>Programme</label>
                  <select value={form.programme} onChange={e => update('programme', e.target.value)}>
                    <option value="">Select</option>{PROGRAMMES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="edit-field">
                  <label>Branch</label>
                  <select value={form.branch} onChange={e => update('branch', e.target.value)}>
                    <option value="">Select</option>{BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="edit-field">
                  <label>Year of Admission</label>
                  <select value={form.yearOfAdmission} onChange={e => update('yearOfAdmission', e.target.value)}>
                    <option value="">Select</option>{admissionYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="edit-field"><label><Mail size={12} /> Gmail</label><input value={form.gmail} onChange={e => update('gmail', e.target.value)} placeholder="personal@gmail.com" /></div>
                <div className="edit-field"><label><Phone size={12} /> Phone</label><input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91..." /></div>
                <div className="edit-field"><label><Globe size={12} /> GitHub</label><input value={form.github} onChange={e => update('github', e.target.value)} placeholder="https://github.com/..." /></div>
                <div className="edit-field"><label><Globe size={12} /> Instagram</label><input value={form.instagram} onChange={e => update('instagram', e.target.value)} placeholder="https://instagram.com/..." /></div>
                <div className="edit-field"><label><Globe size={12} /> LinkedIn</label><input value={form.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* APPEARANCE */}
      <div className="settings-section">
        <h3><Moon size={18} /> Appearance</h3>
        <div className="settings-card">
          <div className="settings-row">
            <span>Theme</span>
            <button className="theme-toggle-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
            </button>
          </div>
        </div>
      </div>

      {/* ACCOUNT */}
      <div className="settings-section">
        <h3><Shield size={18} /> Account</h3>
        <div className="settings-card">
          <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', marginBottom: '1rem' }}>Signed in as <strong>{currentUser?.email}</strong></p>
          <button className="btn btn-danger" onClick={handleLogout}><LogOut size={18} /> Logout</button>
        </div>
      </div>

      <div className="page-footer">Smart Student Portal • Settings</div>
    </div>
  );
};

export default SettingsPage;
