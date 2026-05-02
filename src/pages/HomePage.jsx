import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronDown, ChevronUp, User, Mail, BookOpen, MapPin, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchAndParseMessMenu } from '../utils/messParser';

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const PROGRAMMES = ['BTech','MTech','Dual (BTech+MTech)','MA','BA','BSc','MSc','PhD'];
const BRANCHES = ['Computer Science and Engineering','Electrical Engineering','Mechanical Engineering','Civil Engineering','Chemical Engineering','Materials Science','Mathematics','Physics','Chemistry','Humanities and Social Sciences','Biological Engineering','Cognitive Science','Other'];

const getMealWindow = (timeStr) => {
  const parseTime = (t) => {
    const m = t.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!m) return 0;
    let h = parseInt(m[1]); const min = parseInt(m[2]);
    if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
    if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
    return h * 60 + min;
  };
  const parts = timeStr.split('-').map(s => s.trim());
  if (parts.length < 2) return null;
  return { start: parseTime(parts[0]), end: parseTime(parts[1]) };
};

const isCurrentMeal = (timeStr) => {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const w = getMealWindow(timeStr);
  return w && mins >= w.start && mins <= w.end;
};

const HomePage = () => {
  const { currentUser, userProfile, saveProfile } = useAuth();
  const navigate = useNavigate();
  const [messMenu, setMessMenu] = useState(null);
  const [messLoading, setMessLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  const today = DAY_NAMES[new Date().getDay()];

  useEffect(() => {
    fetchAndParseMessMenu().then(d => setMessMenu(d)).catch(e => console.error(e)).finally(() => setMessLoading(false));
  }, []);

  useEffect(() => {
    if (userProfile) setEditData({
      name: userProfile.name || '', username: userProfile.username || '',
      rollNumber: userProfile.rollNumber || '', programme: userProfile.programme || '',
      branch: userProfile.branch || '', yearOfAdmission: userProfile.yearOfAdmission || '',
      github: userProfile.github || '', instagram: userProfile.instagram || '',
      linkedin: userProfile.linkedin || '', phone: userProfile.phone || '',
    });
  }, [userProfile]);

  const savedCourses = useMemo(() => {
    if (!currentUser) return [];
    try { return JSON.parse(localStorage.getItem(`courses_${currentUser.uid}`)) || userProfile?.selectedCourses || []; } catch { return []; }
  }, [currentUser, userProfile]);

  const savedTimetable = useMemo(() => {
    if (!currentUser) return null;
    try { return JSON.parse(localStorage.getItem(`timetable_${currentUser.uid}`)) || userProfile?.timetable || null; } catch { return null; }
  }, [currentUser, userProfile]);

  const todaySchedule = useMemo(() => {
    if (!savedTimetable) return [];
    const d = savedTimetable[today];
    if (!d) return [];
    return Object.entries(d).map(([time, entries]) => ({ time, entries })).sort((a, b) => a.time.localeCompare(b.time));
  }, [savedTimetable, today]);

  const todayMess = useMemo(() => {
    if (!messMenu) return null;
    const r = {};
    Object.entries(messMenu.meals).forEach(([name, meal]) => {
      r[name] = { time: meal.time, items: meal.items[today] || [] };
    });
    return r;
  }, [messMenu, today]);

  const handleSaveProfile = async () => {
    try {
      await saveProfile(editData);
      setEditMode(false);
    } catch (e) { console.error(e); }
  };

  if (!currentUser) {
    return (
      <div className="page-container">
        <div className="hero-section">
          <h1 className="hero-title">Smart Student Portal</h1>
          <p className="hero-subtitle">Your all-in-one academic companion</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>Login</button>
            <button className="btn btn-outline" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
          <div className="feature-cards">
            <div className="feature-card"><Calendar size={32} /><h3>Timetable</h3><p>Generate and manage your schedule</p></div>
            <div className="feature-card"><BookOpen size={32} /><h3>Courses</h3><p>Browse and select courses</p></div>
            <div className="feature-card"><User size={32} /><h3>Profile</h3><p>Manage your academic profile</p></div>
          </div>
        </div>
        <div className="page-footer">Smart Student Portal © {new Date().getFullYear()}</div>
      </div>
    );
  }

  const avatarUrl = userProfile?.customPhotoUrl || userProfile?.avatarUrl || (currentUser?.email ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${currentUser.email}` : '');

  const profileFields = [
    { label: 'Name', value: userProfile?.name, key: 'name' },
    { label: 'Programme', value: userProfile?.programme, key: 'programme' },
    { label: 'Current Year', value: userProfile?.currentYear },
    { label: 'Roll No', value: userProfile?.rollNumber, key: 'rollNumber' },
    { label: 'Branch', value: userProfile?.branch, key: 'branch' },
    { label: 'Semester', value: userProfile?.semester },
    { label: 'Email', value: userProfile?.email || currentUser?.email },
    { label: 'Github', value: userProfile?.github, key: 'github', link: true },
    { label: 'Instagram', value: userProfile?.instagram, key: 'instagram', link: true },
    { label: 'LinkedIn', value: userProfile?.linkedin, key: 'linkedin', link: true },
    { label: 'Phone', value: userProfile?.phone, key: 'phone' },
  ];

  return (
    <div className="page-container">
      <div className="home-top">
        {/* LEFT 30% - Avatar & Identity */}
        <div className="profile-left">
          <h2 className="profile-username">{userProfile?.username || currentUser?.displayName || 'Student'}</h2>
          <img src={avatarUrl} alt="Profile" className="profile-avatar-large" />
          <div className="profile-student-id">ID: {userProfile?.rollNumber || '—'}</div>
        </div>

        {/* RIGHT 70% - Profile Details */}
        <div className="profile-right">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '.5rem', margin: 0 }}><User size={18} /> Profile Details</h3>
            {!editMode ? (
              <button className="btn btn-outline btn-sm" onClick={() => setEditMode(true)}><Edit2 size={14} /> Edit</button>
            ) : (
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <button className="btn btn-primary btn-sm" onClick={handleSaveProfile}><Save size={14} /> Save</button>
                <button className="btn btn-outline btn-sm" onClick={() => setEditMode(false)}><X size={14} /></button>
              </div>
            )}
          </div>

          {editMode ? (
            <div className="edit-profile-grid">
              <div className="edit-field"><label>Name</label><input value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="edit-field"><label>Username</label><input value={editData.username} onChange={e => setEditData(p => ({ ...p, username: e.target.value }))} /></div>
              <div className="edit-field"><label>Roll Number</label><input value={editData.rollNumber} onChange={e => setEditData(p => ({ ...p, rollNumber: e.target.value }))} /></div>
              <div className="edit-field"><label>Programme</label>
                <select value={editData.programme} onChange={e => setEditData(p => ({ ...p, programme: e.target.value }))}>
                  <option value="">Select</option>{PROGRAMMES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="edit-field"><label>Branch</label>
                <select value={editData.branch} onChange={e => setEditData(p => ({ ...p, branch: e.target.value }))}>
                  <option value="">Select</option>{BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="edit-field"><label>Year of Admission</label><input type="number" value={editData.yearOfAdmission} onChange={e => setEditData(p => ({ ...p, yearOfAdmission: e.target.value }))} /></div>
              <div className="edit-field"><label>GitHub Link</label><input placeholder="https://github.com/..." value={editData.github} onChange={e => setEditData(p => ({ ...p, github: e.target.value }))} /></div>
              <div className="edit-field"><label>Instagram</label><input placeholder="https://instagram.com/..." value={editData.instagram} onChange={e => setEditData(p => ({ ...p, instagram: e.target.value }))} /></div>
              <div className="edit-field"><label>LinkedIn</label><input placeholder="https://linkedin.com/in/..." value={editData.linkedin} onChange={e => setEditData(p => ({ ...p, linkedin: e.target.value }))} /></div>
              <div className="edit-field"><label>Phone</label><input placeholder="+91..." value={editData.phone} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
          ) : (
            <div className="profile-details-grid">
              {profileFields.map(({ label, value, link }) => (
                <div key={label} className="profile-detail-item">
                  <span className="detail-label">{label}</span>
                  <span className="detail-value">
                    {link && value ? <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer">{value}</a> : (value || '—')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Today's Schedule + Mess */}
      <div className="home-bottom">
        <div className="today-section">
          <h3 className="section-title"><Calendar size={20} /> Today's Classes — {today}</h3>
          {todaySchedule.length === 0 ? (
            <div className="empty-state"><p>No classes scheduled for today</p></div>
          ) : (
            <div className="today-classes">
              {todaySchedule.map(({ time, entries }) => (
                <div key={time} className="today-class-card">
                  <div className="class-time">{time}</div>
                  {entries.map((e, i) => (
                    <div key={i} className="class-detail">
                      <strong>{e.code}</strong> — {e.title}
                      {e.venue && <span className="class-venue"><MapPin size={10} style={{ marginRight: 3 }} />{e.venue}</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="today-section">
          <h3 className="section-title"><BookOpen size={20} /> Mess Menu — {today}</h3>
          {messLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading menu...</p>
          ) : todayMess ? (
            <div className="mess-menu-list">
              {Object.entries(todayMess).map(([mealName, meal]) => {
                const active = isCurrentMeal(meal.time);
                return (
                  <div key={mealName} className={`mess-meal-card ${active ? 'active-meal' : ''}`}>
                    <div className="meal-header">
                      <h4>{mealName}{active && <span className="active-meal-badge">NOW</span>}</h4>
                      <span className="meal-time">{meal.time}</span>
                    </div>
                    <div className="meal-items">
                      {meal.items.map((item, i) => (
                        <div key={i} className="meal-item">
                          <span className="meal-category">{item.category}</span>
                          <span className="meal-food">{item.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state"><p>Mess menu not available</p></div>
          )}
        </div>
      </div>
      <div className="page-footer">Smart Student Portal © {new Date().getFullYear()} • Built with ❤️</div>
    </div>
  );
};

export default HomePage;
