import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Moon, Sun, LogOut, Shield, Save, Camera, Link2, GraduationCap, Mail, Phone, Globe, Bell, Book, Download, Trash2, Info, ChevronRight, ChevronDown, Upload, CheckCircle2, CreditCard, QrCode, Home, Hash, Award, Eye, X, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAvatarUrl, getPhotoPosition, convertGDriveUrl, compressImageToBase64 } from '../utils/avatarUtils';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const PROGRAMMES = ['BTech','MTech','Dual (BTech+MTech)','MA','BA','BSc','MSc','PhD'];
const BRANCHES = ['Computer Science and Engineering','Electrical Engineering','Mechanical Engineering','Civil Engineering','Chemical Engineering','Materials Science','Mathematics','Physics','Chemistry','Humanities and Social Sciences','Biological Engineering','Cognitive Science','Other'];
const AVATAR_SEEDS = ['Felix','Aneka','Milo','Luna','Pepper','Oscar','Bella','Shadow','Simba','Nala','Oreo','Coco','Buddy','Daisy','Max','Ruby','Charlie','Olive','Leo','Willow'];

const SettingsPage = ({ darkMode, setDarkMode }) => {
  const { currentUser, userProfile, logout, saveProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const [form, setForm] = useState({
    name: '', firstName: '', surname: '', username: '', rollNumber: '', programme: '', branch: '',
    yearOfAdmission: '', avatarUrl: '', customPhotoUrl: '', profilePhotoBase64: '',
    photoPositionX: 50, photoPositionY: 50,
    github: '', instagram: '', linkedin: '', phone: '', gmail: '',
    cgpa: '', minor: '', hostelName: '', roomNumber: '',
    messQrBase64: '', studentIdBase64: '',
    privacy: { phone: false, email: false, social: true },
    notifications: { email: true, push: false, updates: true },
    preferences: { librarySeat: '', defaultView: 'List' }
  });

  const [activePhotoTab, setActivePhotoTab] = useState('upload'); // 'upload', 'gdrive', 'dicebear'
  const [openSection, setOpenSection] = useState(location.state?.openSection || null); // null = all closed

  const toggleSection = (id) => setOpenSection(prev => prev === id ? null : id);

  useEffect(() => {
    if (location.state?.openSection) {
      setOpenSection(location.state.openSection);
    }
  }, [location.state]);

  useEffect(() => {
    if (userProfile) {
      const parts = (userProfile.name || '').trim().split(/\s+/);
      setForm({
        name: userProfile.name || '',
        firstName: userProfile.firstName || parts[0] || '',
        surname: userProfile.surname || parts.slice(1).join(' ') || '',
        username: userProfile.username || '',
        rollNumber: userProfile.rollNumber || '', programme: userProfile.programme || '',
        branch: userProfile.branch || '', yearOfAdmission: userProfile.yearOfAdmission || '',
        avatarUrl: userProfile.avatarUrl || '',
        customPhotoUrl: userProfile.customPhotoUrl || '',
        profilePhotoBase64: userProfile.profilePhotoBase64 || '',
        photoPositionX: userProfile.photoPositionX ?? 50,
        photoPositionY: userProfile.photoPositionY ?? 50,
        github: userProfile.github || '', instagram: userProfile.instagram || '',
        linkedin: userProfile.linkedin || '', phone: userProfile.phone || '', gmail: userProfile.gmail || '',
        cgpa: userProfile.cgpa || '', minor: userProfile.minor || '',
        hostelName: userProfile.hostelName || '', roomNumber: userProfile.roomNumber || '',
        messQrBase64: userProfile.messQrBase64 || '', studentIdBase64: userProfile.studentIdBase64 || '',
        privacy: userProfile.privacy || { phone: false, email: false, social: true },
        notifications: userProfile.notifications || { email: true, push: false, updates: true },
        preferences: userProfile.preferences || { librarySeat: '', defaultView: 'List' }
      });
      if (userProfile.profilePhotoBase64) setActivePhotoTab('upload');
      else if (userProfile.customPhotoUrl) setActivePhotoTab('gdrive');
      else setActivePhotoTab('dicebear');
    }
  }, [userProfile]);

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const updateNested = (category, key, val) => setForm(p => ({ ...p, [category]: { ...p[category], [key]: val } }));

  const currentYear = new Date().getFullYear();
  const admissionYears = Array.from({ length: 7 }, (_, i) => currentYear - i);

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
        yearOfAdmission: yoa || form.yearOfAdmission,
        currentYear: yoa ? `${yr}${suffix} Year` : (userProfile?.currentYear || ''),
        semester: yoa ? `Semester ${sem}` : (userProfile?.semester || ''),
      });
      setSaved(true);
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#f472b6', '#34d399']
      });
      setOpenSection(null);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      const parts = (userProfile.name || '').trim().split(/\s+/);
      setForm({
        name: userProfile.name || '',
        firstName: userProfile.firstName || parts[0] || '',
        surname: userProfile.surname || parts.slice(1).join(' ') || '',
        username: userProfile.username || '',
        rollNumber: userProfile.rollNumber || '', programme: userProfile.programme || '',
        branch: userProfile.branch || '', yearOfAdmission: userProfile.yearOfAdmission || '',
        avatarUrl: userProfile.avatarUrl || '',
        customPhotoUrl: userProfile.customPhotoUrl || '',
        profilePhotoBase64: userProfile.profilePhotoBase64 || '',
        photoPositionX: userProfile.photoPositionX ?? 50,
        photoPositionY: userProfile.photoPositionY ?? 50,
        github: userProfile.github || '', instagram: userProfile.instagram || '',
        linkedin: userProfile.linkedin || '', phone: userProfile.phone || '', gmail: userProfile.gmail || '',
        cgpa: userProfile.cgpa || '', minor: userProfile.minor || '',
        hostelName: userProfile.hostelName || '', roomNumber: userProfile.roomNumber || '',
        messQrBase64: userProfile.messQrBase64 || '', studentIdBase64: userProfile.studentIdBase64 || '',
        privacy: userProfile.privacy || { phone: false, email: false, social: true },
        notifications: userProfile.notifications || { email: true, push: false, updates: true },
        preferences: userProfile.preferences || { librarySeat: '', defaultView: 'List' }
      });
      if (userProfile.profilePhotoBase64) setActivePhotoTab('upload');
      else if (userProfile.customPhotoUrl) setActivePhotoTab('gdrive');
      else setActivePhotoTab('dicebear');
    }
    setOpenSection(null);
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await compressImageToBase64(file, 400); // compress & convert
      update('profilePhotoBase64', base64);
      update('customPhotoUrl', '');
      update('avatarUrl', '');
    } catch (err) {
      console.error('Image compression failed', err);
      alert('Failed to process image');
    }
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await compressImageToBase64(file, 400);
      update('messQrBase64', base64);
    } catch (err) {
      console.error('QR compression failed', err);
      alert('Failed to process QR image');
    }
  };

  const handleIdCardUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await compressImageToBase64(file, 600);
      update('studentIdBase64', base64);
    } catch (err) {
      console.error('ID card compression failed', err);
      alert('Failed to process ID card image');
    }
  };

  // Profile Completeness Calculation
  const completenessDetails = useMemo(() => {
    let score = 0;
    const milestones = [];

    if (form.name.trim()) { score += 15; milestones.push('Name'); }
    if (form.username.trim()) { score += 15; milestones.push('Username'); }
    if (form.rollNumber.trim()) { score += 15; milestones.push('Roll No'); }
    if (form.programme) { score += 10; milestones.push('Prog'); }
    if (form.branch) { score += 10; milestones.push('Branch'); }
    if (form.yearOfAdmission) { score += 10; milestones.push('YOA'); }
    if (form.profilePhotoBase64 || form.customPhotoUrl || form.avatarUrl) { score += 15; milestones.push('Photo'); }
    if (form.github.trim() || form.instagram.trim() || form.linkedin.trim()) { score += 5; milestones.push('Socials'); }
    if (form.phone.trim() || form.gmail.trim()) { score += 5; milestones.push('Contact'); }

    return { percent: score, milestones };
  }, [form]);

  // Security Health Calculation
  const securityHealth = useMemo(() => {
    const checks = [];
    let passedCount = 0;

    // Check 1: Institutional email domain
    const isInstEmail = currentUser?.email?.endsWith('.ac.in');
    checks.push({ name: 'Institutional Email Domain (.ac.in)', passed: isInstEmail });
    if (isInstEmail) passedCount++;

    // Check 2: Phone is registered
    const isPhoneRegistered = !!form.phone.trim();
    checks.push({ name: 'Phone number linked', passed: isPhoneRegistered });
    if (isPhoneRegistered) passedCount++;

    // Check 3: External backup email registered
    const isBackupEmailSet = !!form.gmail.trim();
    checks.push({ name: 'External recovery email linked', passed: isBackupEmailSet });
    if (isBackupEmailSet) passedCount++;

    // Check 4: Contact details privacy hidden
    const isPrivacyActive = !form.privacy.phone || !form.privacy.email;
    checks.push({ name: 'Public privacy filters active', passed: isPrivacyActive });
    if (isPrivacyActive) passedCount++;

    let level = 'Weak';
    let levelClass = 'weak';
    if (passedCount >= 4) {
      level = 'Strong';
      levelClass = 'strong';
    } else if (passedCount >= 2) {
      level = 'Medium';
      levelClass = 'medium';
    }

    return { score: passedCount, total: 4, level, levelClass, checks };
  }, [form, currentUser]);

  // Live preview logic using the same getAvatarUrl as the rest of the app
  const getPreviewUrl = () => {
    if (activePhotoTab === 'upload' && form.profilePhotoBase64) return form.profilePhotoBase64;
    if (activePhotoTab === 'gdrive' && form.customPhotoUrl) return convertGDriveUrl(form.customPhotoUrl);
    if (activePhotoTab === 'dicebear' && form.avatarUrl) return form.avatarUrl;
    return currentUser?.email 
      ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${currentUser.email}` 
      : 'https://api.dicebear.com/9.x/thumbs/svg?seed=default';
  };

  const previewPosition = `${form.photoPositionX}% ${form.photoPositionY}%`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <motion.div 
      className="page-container"
      style={{ paddingBottom: ['photo', 'messqr', 'details', 'contact'].includes(openSection) ? '80px' : '0' }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Settings &amp; Profile</h2>
      </div>

      {saved && <div className="auth-success" style={{ marginBottom: '1rem' }}>Settings updated successfully!</div>}

      {/* Visual Analytics Widgets */}
      <motion.div 
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}
        variants={itemVariants}
      >
        {/* Profile Completeness Tracker */}
        <div className="profile-completeness-card">
          <div className="completeness-gauge-container">
            <svg className="completeness-svg" viewBox="0 0 80 80">
              <circle className="completeness-circle-bg" cx="40" cy="40" r="36" />
              <circle 
                className="completeness-circle-fill" 
                cx="40" 
                cy="40" 
                r="36" 
                stroke="url(#completenessGrad)"
                strokeDasharray="226.2" 
                strokeDashoffset={226.2 - (completenessDetails.percent / 100) * 226.2} 
              />
              <defs>
                <linearGradient id="completenessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--accent)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="completeness-text-overlay">{completenessDetails.percent}%</div>
          </div>
          <div className="completeness-details">
            <div className="completeness-title">
              <GraduationCap size={18} style={{ color: 'var(--primary)' }} /> Profile Completeness
            </div>
            <div className="completeness-subtitle">
              {completenessDetails.percent === 100 ? 'Awesome! Your profile is fully setup.' : 'Fill in more details to reach 100% completion.'}
            </div>
            <div className="completeness-milestones">
              {['Name', 'Roll No', 'Branch', 'Photo', 'Socials'].map(m => {
                const isDone = completenessDetails.milestones.some(mil => mil.startsWith(m));
                return (
                  <span key={m} className={`completeness-badge ${isDone ? 'completed' : ''}`}>
                    {isDone ? '✓' : '○'} {m}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security Health Check */}
        <div className="security-health-widget">
          <div className="security-header-row">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '.5rem', margin: 0 }}>
              <Shield size={16} style={{ color: 'var(--primary)' }} /> Security Strength
            </h4>
            <span className={`security-score-badge ${securityHealth.levelClass}`}>
              {securityHealth.level} ({securityHealth.score}/{securityHealth.total})
            </span>
          </div>
          <div className="security-checklist">
            {securityHealth.checks.map((c, i) => (
              <div key={i} className={`security-check-item ${c.passed ? 'passed' : ''}`}>
                <span style={{ color: c.passed ? 'var(--success)' : 'var(--danger)', marginRight: '6px', fontSize: '1rem' }}>
                  {c.passed ? '●' : '○'}
                </span>
                <span style={{ textDecoration: c.passed ? 'none' : 'line-through' }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ACCORDION EDIT PROFILE SECTION */}
      <motion.div className="settings-section" variants={itemVariants}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
          <User size={18} style={{ color: 'var(--primary)' }} /> Edit Your Profile
        </h3>

        <div className="settings-accordion-panel">
          {/* --- Profile Photo Accordion --- */}
          <div className="settings-accordion-item">
          <button className="settings-accordion-header" onClick={() => toggleSection('photo')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={18} style={{ color: 'var(--primary)' }} />
              <span>Edit Profile Photo</span>
            </span>
            <ChevronDown size={18} style={{ transition: 'transform 0.3s', transform: openSection === 'photo' ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-muted)' }} />
          </button>
          {openSection === 'photo' && (
            <div className="settings-accordion-body">
              <div className="photo-source-tabs">
                <button className={`photo-source-tab ${activePhotoTab === 'upload' ? 'active' : ''}`} onClick={() => setActivePhotoTab('upload')}>
                  <Upload size={14} /> Upload
                </button>
                <button className={`photo-source-tab ${activePhotoTab === 'gdrive' ? 'active' : ''}`} onClick={() => setActivePhotoTab('gdrive')}>
                  <Link2 size={14} /> GDrive Link
                </button>
                <button className={`photo-source-tab ${activePhotoTab === 'dicebear' ? 'active' : ''}`} onClick={() => setActivePhotoTab('dicebear')}>
                  <User size={14} /> Avatar
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  {activePhotoTab === 'upload' && (
                    <label className="file-upload-area" style={{ display: 'block', height: '150px' }}>
                      <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                      <p>Click to select or drag and drop<br/><small style={{ color: 'var(--text-muted)' }}>(JPEG, PNG, WebP up to 5MB)</small></p>
                      <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleFileUpload} />
                    </label>
                  )}
                  
                  {activePhotoTab === 'gdrive' && (
                    <div className="edit-field" style={{ margin: 0 }}>
                      <label><Link2 size={12} /> Google Drive Sharing Link</label>
                      <input 
                        type="url"
                        placeholder="https://drive.google.com/file/d/..." 
                        value={form.customPhotoUrl} 
                        onChange={e => { update('customPhotoUrl', e.target.value); update('profilePhotoBase64', ''); }} 
                      />
                      <p style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginTop: '.4rem', lineHeight: 1.4 }}>
                        Make sure the link sharing setting in Google Drive is set to <strong>"Anyone with the link"</strong>.
                      </p>
                    </div>
                  )}
                  
                  {activePhotoTab === 'dicebear' && (
                    <div>
                      <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.5rem' }}>Select a dynamic avatar seed:</p>
                      <div className="avatar-scroll-container">
                        {AVATAR_SEEDS.map(seed => {
                          const url = `https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}`;
                          const isSelected = form.avatarUrl === url;
                          return (
                            <img 
                              key={seed} 
                              src={url} 
                              alt={seed}
                              className={`avatar-option-img ${isSelected ? 'selected' : ''}`}
                              onClick={() => { update('avatarUrl', url); update('customPhotoUrl', ''); update('profilePhotoBase64', ''); }} 
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ flexShrink: 0, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Preview & Position</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="position-preview">
                      <img src={getPreviewUrl()} alt="Preview" style={{ objectPosition: previewPosition }} />
                    </div>
                    {(activePhotoTab === 'upload' || activePhotoTab === 'gdrive') && (
                      <div className="position-sliders-container">
                        <div className="position-slider-row">
                          <span>X</span>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            className="custom-range-slider"
                            value={form.photoPositionX} 
                            onChange={e => update('photoPositionX', e.target.value)} 
                          />
                        </div>
                        <div className="position-slider-row">
                          <span>Y</span>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            className="custom-range-slider"
                            value={form.photoPositionY} 
                            onChange={e => update('photoPositionY', e.target.value)} 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- Mess QR Accordion --- */}
        <div className="settings-accordion-item">
          <button className="settings-accordion-header" onClick={() => toggleSection('messqr')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <QrCode size={18} style={{ color: 'var(--primary)' }} />
              <span>Mess QR &amp; Student ID Card</span>
            </span>
            <ChevronDown size={18} style={{ transition: 'transform 0.3s', transform: openSection === 'messqr' ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-muted)' }} />
          </button>
          {openSection === 'messqr' && (
            <div className="settings-accordion-body">
              <div className="cards-layout-grid">
                {/* Mess QR Code Card */}
                <div className="digital-card-container">
                  <h4 className="digital-card-title">
                    <QrCode size={16} style={{ color: 'var(--primary)' }} /> Mess QR Code
                  </h4>
                  <div className="digital-card-body">
                    {form.messQrBase64 ? (
                      <>
                        <img src={form.messQrBase64} alt="Mess QR" className="digital-card-image" />
                        <div className="digital-card-overlay">
                          <button 
                            type="button"
                            className="card-overlay-btn" 
                            title="View Card" 
                            onClick={() => setLightboxImage({ url: form.messQrBase64, label: 'Mess QR Code' })}
                          >
                            <Eye size={18} />
                          </button>
                          <label className="card-overlay-btn" title="Replace Card">
                            <Upload size={18} />
                            <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleQrUpload} />
                          </label>
                          <button 
                            type="button"
                            className="card-overlay-btn btn-delete" 
                            title="Remove Card" 
                            onClick={() => update('messQrBase64', '')}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="digital-card-empty">
                        <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                        <p><strong>Click to upload Mess QR</strong><br/>JPEG, PNG or WebP</p>
                        <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleQrUpload} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Student ID Card Card */}
                <div className="digital-card-container">
                  <h4 className="digital-card-title">
                    <CreditCard size={16} style={{ color: 'var(--primary)' }} /> Student ID Card
                  </h4>
                  <div className="digital-card-body">
                    {form.studentIdBase64 ? (
                      <>
                        <img src={form.studentIdBase64} alt="Student ID" className="digital-card-image" />
                        <div className="digital-card-overlay">
                          <button 
                            type="button"
                            className="card-overlay-btn" 
                            title="View Card" 
                            onClick={() => setLightboxImage({ url: form.studentIdBase64, label: 'Student ID Card' })}
                          >
                            <Eye size={18} />
                          </button>
                          <label className="card-overlay-btn" title="Replace Card">
                            <Upload size={18} />
                            <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleIdCardUpload} />
                          </label>
                          <button 
                            type="button"
                            className="card-overlay-btn btn-delete" 
                            title="Remove Card" 
                            onClick={() => update('studentIdBase64', '')}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="digital-card-empty">
                        <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                        <p><strong>Click to upload ID Card</strong><br/>JPEG, PNG or WebP</p>
                        <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleIdCardUpload} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- Edit Profile Details Accordion --- */}
        <div className="settings-accordion-item">
          <button className="settings-accordion-header" onClick={() => toggleSection('details')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ color: 'var(--primary)' }} />
              <span>Edit Profile Details</span>
            </span>
            <ChevronDown size={18} style={{ transition: 'transform 0.3s', transform: openSection === 'details' ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-muted)' }} />
          </button>
          {openSection === 'details' && (
            <div className="settings-accordion-body">
              <div className="edit-profile-grid">
                <div className="edit-field">
                  <label>First Name</label>
                  <div className="premium-input-wrapper">
                    <input value={form.firstName} onChange={e => {
                      const first = e.target.value;
                      setForm(prev => ({
                        ...prev,
                        firstName: first,
                        name: `${first.trim()} ${prev.surname.trim()}`
                      }));
                    }} />
                    <User className="premium-input-icon" size={16} />
                  </div>
                </div>
                <div className="edit-field">
                  <label>Surname</label>
                  <div className="premium-input-wrapper">
                    <input value={form.surname} onChange={e => {
                      const sur = e.target.value;
                      setForm(prev => ({
                        ...prev,
                        surname: sur,
                        name: `${prev.firstName.trim()} ${sur.trim()}`
                      }));
                    }} />
                    <User className="premium-input-icon" size={16} />
                  </div>
                </div>
                <div className="edit-field">
                  <label>Username</label>
                  <div className="premium-input-wrapper">
                    <input value={form.username} onChange={e => update('username', e.target.value)} />
                    <User className="premium-input-icon" size={16} />
                  </div>
                </div>
                <div className="edit-field">
                  <label>Roll Number</label>
                  <div className="premium-input-wrapper">
                    <input value={form.rollNumber} onChange={e => update('rollNumber', e.target.value)} />
                    <GraduationCap className="premium-input-icon" size={16} />
                  </div>
                </div>
                <div className="edit-field">
                  <label>Programme</label>
                  <div className="premium-input-wrapper">
                    <select value={form.programme} onChange={e => update('programme', e.target.value)}>
                      <option value="">Select Programme</option>
                      {PROGRAMMES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <ChevronDown className="premium-select-chevron" size={14} />
                    <GraduationCap className="premium-input-icon" size={16} />
                  </div>
                </div>
                <div className="edit-field">
                  <label>Branch</label>
                  <div className="premium-input-wrapper">
                    <select value={form.branch} onChange={e => update('branch', e.target.value)}>
                      <option value="">Select Branch</option>
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <ChevronDown className="premium-select-chevron" size={14} />
                    <GraduationCap className="premium-input-icon" size={16} />
                  </div>
                </div>
                <div className="edit-field">
                  <label>Year of Admission</label>
                  <div className="premium-input-wrapper">
                    <select value={form.yearOfAdmission} onChange={e => update('yearOfAdmission', e.target.value)}>
                      <option value="">Select Year</option>
                      {admissionYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <ChevronDown className="premium-select-chevron" size={14} />
                    <Calendar className="premium-input-icon" size={16} />
                  </div>
                </div>
                <div className="edit-field">
                  <label>CGPA</label>
                  <div className="premium-input-wrapper">
                    <input type="number" step="0.01" min="0" max="10" placeholder="e.g. 8.54" value={form.cgpa} onChange={e => update('cgpa', e.target.value)} />
                    <Award className="premium-input-icon" size={16} />
                  </div>
                </div>
                <div className="edit-field">
                  <label>Minor / Specialization</label>
                  <div className="premium-input-wrapper">
                    <input placeholder="e.g. AI &amp; Data Science" value={form.minor} onChange={e => update('minor', e.target.value)} />
                    <Book className="premium-input-icon" size={16} />
                  </div>
                </div>
                 <div className="edit-field">
                   <label>Hostel Name</label>
                   <div className="premium-input-wrapper">
                     <select 
                       value={form.hostelName} 
                       onChange={e => {
                         const val = e.target.value;
                         const prefix = val ? `${val.split(' ')[0]}-` : '';
                         setForm(prev => ({
                           ...prev,
                           hostelName: val,
                           roomNumber: prefix
                         }));
                       }}
                       style={{
                         width: '100%',
                         padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                         border: '1px solid var(--border)',
                         borderRadius: '8px',
                         fontSize: '0.85rem',
                         background: 'var(--input-bg)',
                         color: 'var(--text)',
                         outline: 'none',
                         appearance: 'none',
                         cursor: 'pointer'
                       }}
                     >
                       <option value="">Select Hostel</option>
                       {['Aibaan', 'Beauki', 'Chimair', 'Duven', 'Emiet', 'Firpeal', 'Griwiksh', 'Hiqom', 'Ijokha', 'Jurqia', 'Kyzeel', 'Lekhaag'].map(h => (
                         <option key={h} value={h}>{h}</option>
                       ))}
                     </select>
                     <Home className="premium-input-icon" size={16} />
                   </div>
                 </div>
                 <div className="edit-field">
                   <label>Room Number</label>
                   <div className="premium-input-wrapper">
                     <input 
                       placeholder={form.hostelName ? `${form.hostelName.split(' ')[0]}-304` : "Select hostel first"} 
                       disabled={!form.hostelName}
                       value={form.roomNumber} 
                       onChange={e => {
                         const inputVal = e.target.value;
                         const prefix = form.hostelName ? `${form.hostelName.split(' ')[0]}-` : '';
                         if (!inputVal.startsWith(prefix)) {
                           setForm(prev => ({ ...prev, roomNumber: prefix }));
                           return;
                         }
                         const suffix = inputVal.slice(prefix.length);
                         const cleanSuffix = suffix.replace(/\D/g, '').slice(0, 3);
                         setForm(prev => ({ ...prev, roomNumber: prefix + cleanSuffix }));
                       }}
                       style={{
                         paddingLeft: '2.2rem',
                         opacity: form.hostelName ? 1 : 0.6,
                         cursor: form.hostelName ? 'text' : 'not-allowed'
                       }}
                     />
                     <Hash className="premium-input-icon" size={16} />
                   </div>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* --- Contact & Social Accordion --- */}
        <div className="settings-accordion-item">
          <button className="settings-accordion-header" onClick={() => toggleSection('contact')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={18} style={{ color: 'var(--primary)' }} />
              <span>Edit Contact &amp; Social Links</span>
            </span>
            <ChevronDown size={18} style={{ transition: 'transform 0.3s', transform: openSection === 'contact' ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-muted)' }} />
          </button>
          {openSection === 'contact' && (
            <div className="settings-accordion-body">
              <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Adjust your details and choose what's visible publicly on your profile.</p>
              <div className="edit-profile-grid" style={{ marginBottom: '1rem' }}>
                <div className="edit-field">
                  <label>Phone</label>
                  <div className="premium-input-wrapper">
                    <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91..." />
                    <Phone className="premium-input-icon" size={16} />
                  </div>
                  <div className="privacy-toggle">
                    <label>Show Publicly?</label>
                    <button className={`toggle-switch ${form.privacy.phone ? 'active' : ''}`} onClick={() => updateNested('privacy', 'phone', !form.privacy.phone)} />
                  </div>
                </div>
                <div className="edit-field">
                  <label>External Email</label>
                  <div className="premium-input-wrapper">
                    <input value={form.gmail} onChange={e => update('gmail', e.target.value)} placeholder="personal@gmail.com" />
                    <Mail className="premium-input-icon" size={16} />
                  </div>
                  <div className="privacy-toggle">
                    <label>Show Publicly?</label>
                    <button className={`toggle-switch ${form.privacy.email ? 'active' : ''}`} onClick={() => updateNested('privacy', 'email', !form.privacy.email)} />
                  </div>
                </div>
                <div className="edit-field">
                  <label>GitHub</label>
                  <div className="premium-input-wrapper">
                    <input value={form.github} onChange={e => update('github', e.target.value)} placeholder="https://github.com/..." />
                    <Globe className="premium-input-icon" size={16} />
                  </div>
                </div>
                <div className="edit-field">
                  <label>LinkedIn</label>
                  <div className="premium-input-wrapper">
                    <input value={form.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
                    <Globe className="premium-input-icon" size={16} />
                  </div>
                </div>
                <div className="edit-field">
                  <label>Instagram</label>
                  <div className="premium-input-wrapper">
                    <input value={form.instagram} onChange={e => update('instagram', e.target.value)} placeholder="https://instagram.com/..." />
                    <Globe className="premium-input-icon" size={16} />
                  </div>
                </div>
              </div>
              <div className="privacy-toggle" style={{ borderTop: '1px solid var(--border)', paddingTop: '.75rem', maxWidth: '300px' }}>
                <label>Show Social Links Publicly?</label>
                <button className={`toggle-switch ${form.privacy.social ? 'active' : ''}`} onClick={() => updateNested('privacy', 'social', !form.privacy.social)} />
              </div>
            </div>
          )}
        </div>
        </div>

      </motion.div>

      {/* NOTIFICATIONS & PREFERENCES */}
      <motion.div className="settings-section" variants={itemVariants}>
        <h3><Bell size={18} /> App Preferences</h3>
        <div className="settings-card">
          <div className="setting-toggle-row">
            <div className="setting-toggle-info">
              <div className="setting-label">Email Notifications</div>
              <div className="setting-desc">Receive timetable changes and class updates via email</div>
            </div>
            <button className={`toggle-switch ${form.notifications.email ? 'active' : ''}`} onClick={async () => {
              const newVal = !form.notifications.email;
              const updatedNotifications = { ...form.notifications, email: newVal };
              setForm(p => ({ ...p, notifications: updatedNotifications }));
              try {
                await saveProfile({
                  ...form,
                  notifications: updatedNotifications
                });
              } catch (e) {
                console.error('Failed to auto-save notifications:', e);
              }
            }} />
          </div>
          <div className="setting-toggle-row">
            <div className="setting-toggle-info">
              <div className="setting-label">Dark Mode Theme</div>
              <div className="setting-desc">Toggle the overall appearance of the portal</div>
            </div>
            <button className="theme-toggle-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <><Sun size={14} /> Light</> : <><Moon size={14} /> Dark</>}
            </button>
          </div>
          <div className="setting-toggle-row" style={{ borderBottom: 'none' }}>
            <div className="setting-toggle-info">
              <div className="setting-label">Default Timetable View</div>
              <div className="setting-desc">Preferred view when opening the timetable page</div>
            </div>
            <select className="auth-select" style={{ width: '120px', marginBottom: 0, padding: '.3rem .5rem' }} value={form.preferences.defaultView} onChange={async (e) => {
              const newVal = e.target.value;
              const updatedPreferences = { ...form.preferences, defaultView: newVal };
              setForm(p => ({ ...p, preferences: updatedPreferences }));
              try {
                await saveProfile({
                  ...form,
                  preferences: updatedPreferences
                });
              } catch (e) {
                console.error('Failed to auto-save preferences:', e);
              }
            }}>
              <option>List</option>
              <option>Grid</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* ACCOUNT & DANGER ZONE */}
      <motion.div className="settings-section" variants={itemVariants}>
        <h3><Shield size={18} /> Account & Security</h3>
        <div className="settings-card" style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', marginBottom: '1.5rem' }}>Signed in as <strong>{currentUser?.email}</strong></p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline"><Download size={16} /> Download My Data</button>
            <button className="btn btn-outline" onClick={handleLogout}><LogOut size={16} /> Logout</button>
          </div>
        </div>

        <div className="danger-zone">
          <h4>Danger Zone</h4>
          <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button className="btn btn-danger" onClick={() => alert('Account deletion is disabled in demo mode.')}><Trash2 size={16} /> Delete Account</button>
        </div>
      </motion.div>

      <div className="page-footer">
        <p>built by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a> • Version 1.0.0</p>
        <p style={{ marginTop: '.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
          <Info size={14} /> <a href="#" style={{ color: 'var(--text-muted)' }}>Help & Support</a>
        </p>
      </div>

      {/* Bottom Bar for Settings */}
      {['photo', 'messqr', 'details', 'contact'].includes(openSection) && (
        <div className="bottom-navbar">
          <div className="stats-bar">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {openSection === 'photo' && 'Editing Profile Photo'}
                {openSection === 'messqr' && 'Editing Mess QR & Student ID'}
                {openSection === 'details' && 'Editing Profile Details'}
                {openSection === 'contact' && 'Editing Contact & Social Links'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={handleCancel}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Blur-Overlay for Cards */}
      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxImage(null)}>
              <X size={18} />
            </button>
            <div className="lightbox-image-container">
              <img src={lightboxImage.url} alt={lightboxImage.label} className="lightbox-image" />
            </div>
            <div className="lightbox-label">{lightboxImage.label}</div>
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default SettingsPage;
