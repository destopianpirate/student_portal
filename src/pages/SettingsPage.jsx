import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Moon, Sun, LogOut, Shield, Save, Camera, GraduationCap, Mail, Phone, Globe, Bell, Download, Upload, CreditCard, QrCode, ChevronDown, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { getAvatarUrl, getPhotoPosition, convertGDriveUrl, compressImageToBase64 } from '../utils/avatarUtils';
import { scanQrCodeFromFile, generateVectorQrCode } from '../utils/qrUtils';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

// Import subcomponents
import EditProfilePhoto from '../components/settings/EditProfilePhoto';
import DigitalIdentityCards from '../components/settings/DigitalIdentityCards';
import EditProfileDetails from '../components/settings/EditProfileDetails';
import EditContactSocials from '../components/settings/EditContactSocials';
import PreferencesSection from '../components/settings/PreferencesSection';
import AccountSecuritySection from '../components/settings/AccountSecuritySection';
import SettingsModals from '../components/settings/SettingsModals';

// Import helpers
import { handleDownloadData, handleExportPDF } from '../utils/settingsExporter';

const applyThemeAccent = (accent) => {
  const root = document.documentElement;
  const presets = {
    indigo: { primary: '#6366f1', hover: '#4f46e5', accent: '#ec4899' },
    emerald: { primary: '#10b981', hover: '#059669', accent: '#3b82f6' },
    black: { primary: '#000000', hover: '#18181b', accent: '#71717a' },
    orange: { primary: '#f59e0b', hover: '#d97706', accent: '#10b981' },
    pink: { primary: '#ec4899', hover: '#db2777', accent: '#8b5cf6' },
    blue: { primary: '#0284c7', hover: '#0369a1', accent: '#f59e0b' }
  };
  const selected = presets[accent] || presets.indigo;
  root.style.setProperty('--primary', selected.primary);
  root.style.setProperty('--primary-hover', selected.hover);
  root.style.setProperty('--accent', selected.accent);
  localStorage.setItem('theme_accent', accent);
};

const SettingsPage = ({ darkMode, setDarkMode }) => {
  const { currentUser, userProfile, logout, saveProfile, deleteAccount, resetPassword, sendVerificationEmail } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [form, setForm] = useState({
    name: '', firstName: '', surname: '', username: '', gender: '', rollNumber: '', programme: '', branch: '',
    yearOfAdmission: '', avatarUrl: '', customPhotoUrl: '', profilePhotoBase64: '',
    photoPositionX: 50, photoPositionY: 50,
    photoZoom: 100, photoRotation: 0, photoAspectRatio: 'card',
    github: '', instagram: '', linkedin: '', phone: '', gmail: '',
    cgpa: '', minor: '', hostelName: '', roomNumber: '',
    messQrBase64: '', studentIdBase64: '',
    privacy: { phone: false, email: false, social: true },
    notifications: { email: true, push: false, updates: true },
    preferences: { librarySeat: '', defaultView: 'List', accent: 'indigo' }
  });
  const [initialForm, setInitialForm] = useState(null);

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
      const loadedForm = {
        name: userProfile.name || '',
        firstName: userProfile.firstName || parts[0] || '',
        surname: userProfile.surname || parts.slice(1).join(' ') || '',
        username: userProfile.username || '',
        gender: userProfile.gender || '',
        rollNumber: userProfile.rollNumber || '', programme: userProfile.programme || '',
        branch: userProfile.branch || '', yearOfAdmission: userProfile.yearOfAdmission || '',
        avatarUrl: userProfile.avatarUrl || '',
        customPhotoUrl: userProfile.customPhotoUrl || '',
        profilePhotoBase64: userProfile.profilePhotoBase64 || '',
        photoPositionX: userProfile.photoPositionX ?? 50,
        photoPositionY: userProfile.photoPositionY ?? 50,
        photoZoom: userProfile.photoZoom ?? 100,
        photoRotation: userProfile.photoRotation ?? 0,
        photoAspectRatio: userProfile.photoAspectRatio || 'card',
        github: userProfile.github || '', instagram: userProfile.instagram || '',
        linkedin: userProfile.linkedin || '', phone: userProfile.phone || '', gmail: userProfile.gmail || '',
        cgpa: userProfile.cgpa || '', minor: userProfile.minor || '',
        hostelName: userProfile.hostelName || '', roomNumber: userProfile.roomNumber || '',
        messQrBase64: userProfile.messQrBase64 || '', studentIdBase64: userProfile.studentIdBase64 || '',
        privacy: userProfile.privacy || { phone: false, email: false, social: true },
        notifications: userProfile.notifications || { email: true, push: false, updates: true },
        preferences: {
          librarySeat: userProfile.preferences?.librarySeat || '',
          defaultView: userProfile.preferences?.defaultView || 'List',
          accent: userProfile.preferences?.accent || 'indigo'
        }
      };
      setForm(loadedForm);
      setInitialForm(loadedForm);
      if (userProfile.profilePhotoBase64) setActivePhotoTab('upload');
      else if (userProfile.customPhotoUrl) setActivePhotoTab('upload');
      else setActivePhotoTab('dicebear');
    }
  }, [userProfile]);

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const updateNested = (category, key, val) => setForm(p => ({ ...p, [category]: { ...p[category], [key]: val } }));

  const currentYear = new Date().getFullYear();

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

      const updatedFields = {
        ...form,
        yearOfAdmission: yoa || form.yearOfAdmission,
        currentYear: yoa ? `${yr}${suffix} Year` : (userProfile?.currentYear || ''),
        semester: yoa ? `Semester ${sem}` : (userProfile?.semester || ''),
      };

      saveProfile(updatedFields);
      setForm(updatedFields);
      setInitialForm(updatedFields);

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
    if (initialForm) {
      setForm(initialForm);
      if (initialForm.profilePhotoBase64) setActivePhotoTab('upload');
      else if (initialForm.customPhotoUrl) setActivePhotoTab('upload');
      else setActivePhotoTab('dicebear');
    }
    setOpenSection(null);
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        // Strict verification: college email must match the logged-in email
        if (importedData.collegeEmail !== currentUser?.email) {
          addNotification('error', 'Import Failed', 'College ID in the file does not match your logged-in account.');
          setImportError({
            title: 'Import Failed',
            message: `This backup file belongs to college ID "${importedData.collegeEmail || 'Unknown'}". It cannot be imported into your account (${currentUser?.email || 'N/A'}).`
          });
          return;
        }

        setImportPreview(importedData);
      } catch (err) {
        console.error('Import parse error:', err);
        addNotification('error', 'Import Failed', 'Invalid backup file format.');
        setImportError({
          title: 'Import Failed',
          message: 'Invalid backup file format or corrupted data. Please upload a valid JSON backup file generated from AcadX.'
        });
      }
    };
    reader.readAsText(file);
  };

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
      setSaving(true);
      const qrText = await scanQrCodeFromFile(file);
      const vectorBase64 = await generateVectorQrCode(qrText);
      update('messQrBase64', vectorBase64);
      alert('Success! Decoded QR data and generated a clean, high-contrast black & white vector QR code.');
    } catch (err) {
      console.error('QR processing failed:', err);
      alert(err.message || 'Failed to process QR image');
    } finally {
      setSaving(false);
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

  // Check if form has unsaved changes compared to initialForm
  const isFormDirty = useMemo(() => {
    if (!initialForm) return false;
    
    // Compare basic fields
    const keys = [
      'name', 'firstName', 'surname', 'username', 'gender', 'rollNumber', 'programme', 'branch',
      'yearOfAdmission', 'avatarUrl', 'customPhotoUrl', 'profilePhotoBase64',
      'photoPositionX', 'photoPositionY', 'photoZoom', 'photoRotation', 'photoAspectRatio',
      'github', 'instagram', 'linkedin', 'phone', 'gmail',
      'cgpa', 'minor', 'hostelName', 'roomNumber',
      'messQrBase64', 'studentIdBase64'
    ];
    
    for (const key of keys) {
      const formVal = form[key] === undefined || form[key] === null ? '' : String(form[key]).trim();
      const initialVal = initialForm[key] === undefined || initialForm[key] === null ? '' : String(initialForm[key]).trim();
      if (formVal !== initialVal) {
        return true;
      }
    }
    
    // Compare nested privacy fields
    const defaultPrivacy = { phone: false, email: false, social: true };
    const formPrivacy = form.privacy || defaultPrivacy;
    const initialPrivacy = initialForm.privacy || defaultPrivacy;
    if (!!formPrivacy.phone !== !!initialPrivacy.phone ||
        !!formPrivacy.email !== !!initialPrivacy.email ||
        !!formPrivacy.social !== !!initialPrivacy.social) {
      return true;
    }
    
    // Compare nested notifications fields
    const defaultNotifications = { email: true, push: false, updates: true };
    const formNotifications = form.notifications || defaultNotifications;
    const initialNotifications = initialForm.notifications || defaultNotifications;
    if (!!formNotifications.email !== !!initialNotifications.email ||
        !!formNotifications.push !== !!initialNotifications.push ||
        !!formNotifications.updates !== !!initialNotifications.updates) {
      return true;
    }
    
    // Compare nested preferences fields
    const defaultPreferences = { librarySeat: '', defaultView: 'List', accent: 'indigo' };
    const formPreferences = form.preferences || defaultPreferences;
    const initialPreferences = initialForm.preferences || defaultPreferences;
    if ((formPreferences.librarySeat || '') !== (initialPreferences.librarySeat || '') ||
        (formPreferences.defaultView || 'List') !== (initialPreferences.defaultView || 'List') ||
        (formPreferences.accent || 'indigo') !== (initialPreferences.accent || 'indigo')) {
      return true;
    }
    
    return false;
  }, [form, initialForm]);

  const handlePasswordReset = async () => {
    try {
      if (currentUser?.isDemo) {
        addNotification('success', 'Reset Link Sent', 'Demo password reset email sent successfully (simulated).');
        return;
      }
      await resetPassword(currentUser.email);
      addNotification('success', 'Reset Link Sent', `A password reset link has been sent to ${currentUser.email}.`);
    } catch (err) {
      console.error(err);
      addNotification('error', 'Reset Failed', err.message || 'Could not send reset link.');
    }
  };

  const handleSendVerification = async () => {
    try {
      if (currentUser?.isDemo) {
        addNotification('success', 'Verification Link Sent', 'Demo verification email sent successfully (simulated).');
        return;
      }
      await sendVerificationEmail();
      addNotification('success', 'Verification Link Sent', `A verification link has been sent to ${currentUser.email}.`);
    } catch (err) {
      console.error(err);
      addNotification('error', 'Verification Failed', err.message || 'Could not send verification link.');
    }
  };

  const handleConfirmDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      if (currentUser?.isDemo) {
        localStorage.clear();
        addNotification('success', 'Account Deleted', 'Demo account cleared. Wiping all local data.');
        setShowDeleteModal(false);
        setDeleteConfirmText('');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        return;
      }
      await deleteAccount();
      localStorage.clear();
      addNotification('success', 'Account Deleted', 'Your student account has been successfully deleted.');
      setShowDeleteModal(false);
      setDeleteConfirmText('');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (err) {
      console.error(err);
      addNotification('error', 'Deletion Failed', err.message || 'Could not delete your account.');
    }
  };

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
      style={{ paddingBottom: '80px' }}
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

        {/* Account & Data Portability */}
        <div className="security-health-widget" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '.4rem', margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>
                <Shield size={16} style={{ color: 'var(--primary)' }} /> Account & Data Portability
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Active Session
              </span>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '.8rem', marginBottom: '1rem', marginTop: '0.25rem' }}>
              Signed in as <strong>{currentUser?.email || 'student.demo@iitgn.ac.in'}</strong>
            </p>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => handleDownloadData(currentUser, userProfile, addNotification)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}>
                <Download size={14} /> Export Backup (JSON)
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => handleExportPDF(currentUser, userProfile, addNotification)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}>
                <Download size={14} /> Export Report (PDF)
              </button>
              <button className="btn btn-outline btn-sm danger" onClick={handleLogout} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
          
          <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.75rem' }}>
            <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>
              Import Profile & Data
            </h5>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: '0 0 0.75rem 0', lineHeight: '1.4' }}>
              Restore settings, profile photo, Mess QR, student ID, projects, certificates, note lists, and semester grades from a matching `.json` backup file.
            </p>
            <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', width: 'fit-content', padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}>
              <Upload size={14} /> Upload Backup JSON
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportJSON} 
                style={{ display: 'none' }} 
              />
            </label>
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
              <EditProfilePhoto
                form={form}
                setForm={setForm}
                update={update}
                activePhotoTab={activePhotoTab}
                setActivePhotoTab={setActivePhotoTab}
                handleFileUpload={handleFileUpload}
                currentUser={currentUser}
              />
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
              <DigitalIdentityCards
                form={form}
                update={update}
                handleQrUpload={handleQrUpload}
                handleIdCardUpload={handleIdCardUpload}
                setLightboxImage={setLightboxImage}
              />
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
              <EditProfileDetails
                form={form}
                setForm={setForm}
                update={update}
              />
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
              <EditContactSocials
                form={form}
                update={update}
                updateNested={updateNested}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* NOTIFICATIONS & PREFERENCES */}
      <motion.div className="settings-section" variants={itemVariants}>
        <h3><Bell size={18} /> App Preferences</h3>
        <PreferencesSection
          form={form}
          setForm={setForm}
          setInitialForm={setInitialForm}
          saveProfile={saveProfile}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          currentUser={currentUser}
          applyThemeAccent={applyThemeAccent}
          addNotification={addNotification}
        />
      </motion.div>

      {/* ACCOUNT & SECURITY */}
      <motion.div className="settings-section" variants={itemVariants}>
        <h3><Shield size={18} /> Account & Security</h3>
        <AccountSecuritySection
          currentUser={currentUser}
          form={form}
          handleSendVerification={handleSendVerification}
          handlePasswordReset={handlePasswordReset}
          handleLogout={handleLogout}
          setShowDeleteModal={setShowDeleteModal}
          setDeleteConfirmText={setDeleteConfirmText}
        />
      </motion.div>

      <div className="page-footer">
        <p>Built with ❤️ by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a></p>
        <p style={{ marginTop: '.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
          <Info size={14} /> <a href="#" style={{ color: 'var(--text-muted)' }}>Help & Support</a>
        </p>
      </div>

      {/* Bottom Bar for Settings */}
      <div className="bottom-navbar">
        <div className="stats-bar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--text)' }}>
              {isFormDirty ? (
                <>
                  {openSection === 'photo' && 'Editing Profile Photo'}
                  {openSection === 'messqr' && 'Editing Mess QR & Student ID'}
                  {openSection === 'details' && 'Editing Profile Details'}
                  {openSection === 'contact' && 'Editing Contact & Social Links'}
                  {!openSection && 'Unsaved Profile Changes'}
                </>
              ) : (
                'All changes saved'
              )}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <motion.button 
              className="btn btn-outline btn-sm" 
              onClick={handleCancel}
              disabled={!isFormDirty || saving}
              style={{ opacity: !isFormDirty ? 0.5 : 1, cursor: !isFormDirty ? 'not-allowed' : 'pointer' }}
              whileHover={isFormDirty && !saving ? { scale: 1.02 } : undefined}
              whileTap={isFormDirty && !saving ? { scale: 0.98 } : undefined}
            >
              Cancel
            </motion.button>
            <motion.button 
              className="btn btn-primary btn-sm" 
              onClick={handleSave} 
              disabled={!isFormDirty || saving}
              style={{ opacity: !isFormDirty ? 0.5 : 1, cursor: !isFormDirty ? 'not-allowed' : 'pointer' }}
              whileHover={isFormDirty && !saving ? { scale: 1.05 } : undefined}
              whileTap={isFormDirty && !saving ? { scale: 0.95 } : undefined}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        </div>
      </div>

      <SettingsModals
        lightboxImage={lightboxImage}
        setLightboxImage={setLightboxImage}
        importPreview={importPreview}
        setImportPreview={setImportPreview}
        importError={importError}
        setImportError={setImportError}
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        deleteConfirmText={deleteConfirmText}
        setDeleteConfirmText={setDeleteConfirmText}
        handleConfirmDeleteAccount={handleConfirmDeleteAccount}
        currentUser={currentUser}
        saveProfile={saveProfile}
        addNotification={addNotification}
      />
    </motion.div>
  );
};

export default SettingsPage;
