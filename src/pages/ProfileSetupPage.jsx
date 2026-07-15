import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ChevronRight, User, GraduationCap, Mail, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AVATAR_SEEDS = [
  'Felix', 'Aneka', 'Milo', 'Luna', 'Pepper', 'Oscar', 'Bella', 'Shadow', 'Simba', 'Nala',
  'Oreo', 'Coco', 'Buddy', 'Daisy', 'Max', 'Ruby', 'Charlie', 'Olive', 'Leo', 'Willow'
];

const PROGRAMMES = [
  'BTech (Bachelor of Technology)',
  'MTech (Master of Technology)',
  'Dual (BTech + MTech)',
  'MA (Master of Arts)',
  'BA (Bachelor of Arts)',
  'BSc (Bachelor of Science)',
  'MSc (Master of Science)',
  'PhD (Doctor of Philosophy)'
];

const BRANCHES = [
  'Computer Science and Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Materials Science and Engineering',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Humanities and Social Sciences',
  'Biological Engineering',
  'Cognitive Science',
  'Other'
];

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const signupMethod = location.state?.method || 'manual';
  const { currentUser, saveProfile, userProfile } = useAuth();

  const totalSteps = signupMethod === 'google' ? 2 : 3;
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Info
  const [firstName, setFirstName] = useState(() => {
    if (userProfile?.firstName) return userProfile.firstName;
    const parts = (userProfile?.name || currentUser?.displayName || '').trim().split(/\s+/);
    return parts[0] || '';
  });
  const [surname, setSurname] = useState(() => {
    if (userProfile?.surname) return userProfile.surname;
    const parts = (userProfile?.name || currentUser?.displayName || '').trim().split(/\s+/);
    return parts.slice(1).join(' ') || '';
  });
  const [rollNumber, setRollNumber] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_SEEDS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Step 2: Academic Info
  const [programme, setProgramme] = useState('');
  const [branch, setBranch] = useState('');
  const [yearOfAdmission, setYearOfAdmission] = useState('');
  const [hostelName, setHostelName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');

  // Step 3: Email (manual only)
  const [gmail, setGmail] = useState('');

  const currentYear = new Date().getFullYear();
  const admissionYears = Array.from({ length: 7 }, (_, i) => currentYear - i);

  const computeAcademicYear = () => {
    if (!yearOfAdmission) return { year: '-', semester: '-' };
    const diff = currentYear - parseInt(yearOfAdmission);
    const month = new Date().getMonth();
    const year = diff + 1;
    const semester = (diff * 2) + (month >= 6 ? 2 : 1);
    return { year: `${year}${getOrdinal(year)} Year`, semester: `Semester ${semester}` };
  };

  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const getAvatarUrl = () => {
    if (customAvatarUrl) return customAvatarUrl;
    return `https://api.dicebear.com/9.x/thumbs/svg?seed=${selectedAvatar}`;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!firstName.trim() || !surname.trim() || !rollNumber.trim()) {
        setError('Please fill in all fields');
        return;
      }
    }
    if (step === 2) {
      if (!programme || !yearOfAdmission || !branch) {
        setError('Please fill in all fields');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      const academic = computeAcademicYear();
      const profileData = {
        firstName: firstName.trim(),
        surname: surname.trim(),
        name: `${firstName.trim()} ${surname.trim()}`,
        rollNumber,
        avatarUrl: getAvatarUrl(),
        programme,
        branch,
        yearOfAdmission: parseInt(yearOfAdmission),
        currentYear: academic.year,
        semester: academic.semester,
        gmail: signupMethod === 'google' ? currentUser?.email : gmail,
        hostelName: hostelName,
        roomNumber: roomNumber,
        profileComplete: true
      };
      try { await saveProfile(profileData); } catch (e) { console.warn('Profile save error:', e); }
      navigate('/');
    } catch (err) {
      setError('Failed to save profile');
      // Navigate anyway after a short delay
      setTimeout(() => navigate('/'), 1500);
    } finally {
      setLoading(false);
    }
  };

  const academic = computeAcademicYear();

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '550px' }}>
        {/* Progress Bar */}
        <div className="stepper">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`step ${i + 1 <= step ? 'active' : ''} ${i + 1 < step ? 'completed' : ''}`}>
              <div className="step-circle">
                {i + 1 < step ? <Check size={14} /> : i + 1}
              </div>
              <span className="step-label">
                {i === 0 ? 'Basic' : i === 1 ? 'Academic' : 'Email'}
              </span>
            </div>
          ))}
        </div>

        {error && <div className="auth-error">{error}</div>}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="setup-step">
            <h2 style={{ marginBottom: '1.5rem' }}>Basic Information</h2>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <User size={18} className="input-icon" />
                <input className="auth-input" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <User size={18} className="input-icon" />
                <input className="auth-input" placeholder="Surname" value={surname} onChange={e => setSurname(e.target.value)} />
              </div>
            </div>

            <div className="input-group">
              <GraduationCap size={18} className="input-icon" />
              <input className="auth-input" placeholder="Roll Number" value={rollNumber} onChange={e => setRollNumber(e.target.value)} />
            </div>

            <h3 style={{ margin: '1.5rem 0 0.75rem', fontSize: '0.9rem' }}>Choose Avatar</h3>
            <div className="avatar-grid">
              {AVATAR_SEEDS.map(seed => (
                <div 
                  key={seed}
                  className={`avatar-option ${selectedAvatar === seed && !customAvatarUrl ? 'selected' : ''}`}
                  onClick={() => { setSelectedAvatar(seed); setCustomAvatarUrl(''); }}
                >
                  <img src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}`} alt={seed} />
                  {selectedAvatar === seed && !customAvatarUrl && <div className="avatar-check"><Check size={12} /></div>}
                </div>
              ))}
            </div>

            <div className="input-group" style={{ marginTop: '1rem' }}>
              <Camera size={18} className="input-icon" />
              <input className="auth-input" placeholder="Or paste image URL (Google Drive, etc.)" value={customAvatarUrl} onChange={e => setCustomAvatarUrl(e.target.value)} />
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Preview:</p>
              <img src={getAvatarUrl()} alt="Avatar Preview" style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid var(--primary)' }} />
            </div>
          </div>
        )}

        {/* Step 2: Academic Info */}
        {step === 2 && (
          <div className="setup-step">
            <h2 style={{ marginBottom: '1.5rem' }}>Academic Information</h2>

            <label className="field-label">Programme</label>
            <select className="auth-select" value={programme} onChange={e => setProgramme(e.target.value)}>
              <option value="">Select Programme</option>
              {PROGRAMMES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <label className="field-label">Branch / Department</label>
            <select className="auth-select" value={branch} onChange={e => setBranch(e.target.value)}>
              <option value="">Select Branch</option>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <label className="field-label">Year of Admission</label>
            <select className="auth-select" value={yearOfAdmission} onChange={e => setYearOfAdmission(e.target.value)}>
              <option value="">Select Year</option>
              {admissionYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            {yearOfAdmission && (
              <div className="computed-info">
                <div className="computed-item">
                  <span>Current Year:</span>
                  <strong>{academic.year}</strong>
                </div>
                <div className="computed-item">
                  <span>Semester:</span>
                  <strong>{academic.semester}</strong>
                </div>
              </div>
            )}

            <label className="field-label" style={{ marginTop: '1rem' }}>Hostel Name</label>
            <select 
              className="auth-select" 
              value={hostelName} 
              onChange={e => {
                const val = e.target.value;
                const prefix = val ? `${val.split(' ')[0]}-` : '';
                setHostelName(val);
                setRoomNumber(prefix);
              }}
            >
              <option value="">Select Hostel (Optional)</option>
              {['Aibaan', 'Beauki', 'Chimair', 'Duven', 'Emiet', 'Firpeal', 'Griwiksh', 'Hiqom', 'Ijokha', 'Jurqia', 'Kyzeel', 'Lekhaag'].map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>

            <label className="field-label">Room Number</label>
            <input 
              className="auth-input"
              placeholder={hostelName ? `${hostelName.split(' ')[0]}-304` : "Select hostel first"} 
              disabled={!hostelName}
              value={roomNumber} 
              onChange={e => {
                const inputVal = e.target.value;
                const prefix = hostelName ? `${hostelName.split(' ')[0]}-` : '';
                if (!inputVal.startsWith(prefix)) {
                  setRoomNumber(prefix);
                  return;
                }
                const suffix = inputVal.slice(prefix.length);
                const cleanSuffix = suffix.replace(/\D/g, '').slice(0, 3);
                setRoomNumber(prefix + cleanSuffix);
              }}
              style={{
                opacity: hostelName ? 1 : 0.6,
                cursor: hostelName ? 'text' : 'not-allowed'
              }}
            />
          </div>
        )}

        {/* Step 3: Email (manual only) */}
        {step === 3 && signupMethod === 'manual' && (
          <div className="setup-step">
            <h2 style={{ marginBottom: '1.5rem' }}>Gmail Address</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              This is used for Google Calendar sync and communication.
            </p>
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input className="auth-input" type="email" placeholder="your.name@gmail.com" value={gmail} onChange={e => setGmail(e.target.value)} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          {step > 1 && (
            <button className="btn btn-outline" onClick={() => setStep(step - 1)}>← Back</button>
          )}
          <div style={{ marginLeft: 'auto' }}>
            {step < totalSteps ? (
              <button className="btn btn-primary" onClick={handleNext}>
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleFinish} disabled={loading}>
                {loading ? 'Saving...' : 'Complete Setup'} <Check size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
