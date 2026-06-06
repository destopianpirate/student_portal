import React from 'react';
import { User, GraduationCap, ChevronDown, Calendar, Award, Book, Home, Hash } from 'lucide-react';

const PROGRAMME_BRANCHES = {
  'B.Tech': [
    'Artificial Intelligence',
    'Chemical Engineering',
    'Civil Engineering',
    'Computer Science & Engineering',
    'Electrical Engineering',
    'Integrated Circuit Design & Technology',
    'Materials Engineering',
    'Mechanical Engineering'
  ],
  'M.Tech': [
    'Biological Engineering',
    'Chemical Engineering',
    'Civil Engineering',
    'Computer Science & Engineering',
    'Artificial Intelligence',
    'Earth System Science',
    'Electrical Engineering',
    'Integrated Circuit Design & Technology',
    'Mechanical Engineering',
    'Materials Engineering',
    'Maritime Engineering'
  ],
  'M.Sc.': [
    'Chemistry',
    'Mathematics',
    'Physics',
    'Cognitive Science'
  ],
  'M.A.': [
    'Society and Culture'
  ],
  'Masters of Design (M.Des)': [
    'M.Des in Integrated Design & Technology'
  ],
  'Ph.D.': [
    'Biological Engineering',
    'Chemical Engineering',
    'Chemistry',
    'Civil Engineering',
    'Cognitive Science',
    'Computer Science and Engineering',
    'Artificial Intelligence',
    'Earth Sciences',
    'Archaeological Sciences',
    'Electrical Engineering',
    'Integrated Circuit Design and Technology',
    'Humanities & Social Sciences',
    'Materials Engineering',
    'Mathematics',
    'Mechanical Engineering',
    'Maritime Engineering',
    'Design',
    'Physics'
  ]
};
const PROGRAMMES = Object.keys(PROGRAMME_BRANCHES);

const EditProfileDetails = ({
  form,
  setForm,
  update
}) => {
  const currentYear = new Date().getFullYear();
  const admissionYears = Array.from({ length: 7 }, (_, i) => currentYear - i);

  return (
    <div className="settings-accordion-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Personal Identity Group */}
      <div className="settings-form-group">
        <h4 className="settings-form-subtitle">
          <User size={14} /> Personal Identity
        </h4>
        <div className="edit-profile-grid" style={{ marginTop: 0 }}>
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
            <label>Gender</label>
            <div className="premium-input-wrapper">
              <select value={form.gender || ''} onChange={e => update('gender', e.target.value)}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              <ChevronDown className="premium-select-chevron" size={14} />
              <User className="premium-input-icon" size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Academic Details Group */}
      <div className="settings-form-group">
        <h4 className="settings-form-subtitle">
          <GraduationCap size={14} /> Academic Details
        </h4>
        <div className="edit-profile-grid" style={{ marginTop: 0 }}>
          <div className="edit-field">
            <label>Roll Number</label>
            <div className="premium-input-wrapper">
              <input value={form.rollNumber} onChange={e => update('rollNumber', e.target.value)} />
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
            <label>Programme</label>
            <div className="premium-input-wrapper">
              <select value={form.programme} onChange={e => {
                const val = e.target.value;
                setForm(p => ({ ...p, programme: val, branch: '' }));
              }}>
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
              <select value={form.branch} onChange={e => update('branch', e.target.value)} disabled={!form.programme}>
                <option value="">{form.programme ? 'Select Branch' : 'Select Programme First'}</option>
                {form.programme && PROGRAMME_BRANCHES[form.programme]?.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="premium-select-chevron" size={14} />
              <GraduationCap className="premium-input-icon" size={16} />
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
        </div>
      </div>

      {/* Accommodation Group */}
      <div className="settings-form-group">
        <h4 className="settings-form-subtitle">
          <Home size={14} /> Accommodation Info
        </h4>
        <div className="edit-profile-grid" style={{ marginTop: 0 }}>
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
              <ChevronDown className="premium-select-chevron" size={14} />
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

    </div>
  );
};

export default EditProfileDetails;
