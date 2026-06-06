import React from 'react';
import { Bell, Sun, Moon, CheckCircle2 } from 'lucide-react';

const PreferencesSection = ({
  form,
  setForm,
  setInitialForm,
  saveProfile,
  darkMode,
  setDarkMode,
  currentUser,
  applyThemeAccent,
  addNotification
}) => {
  return (
    <div className="settings-card">
      <div className="setting-toggle-row">
        <div className="setting-toggle-info">
          <div className="setting-label">Email Notifications</div>
          <div className="setting-desc">Receive timetable changes and class updates via email</div>
        </div>
        <button 
          type="button"
          className={`toggle-switch ${form.notifications.email ? 'active' : ''}`} 
          onClick={() => {
            const newVal = !form.notifications.email;
            const updatedNotifications = { ...form.notifications, email: newVal };
            const updatedForm = { ...form, notifications: updatedNotifications };
            setForm(updatedForm);
            setInitialForm(updatedForm);
            saveProfile(updatedForm);
          }} 
        />
      </div>
      
      <div className="setting-toggle-row">
        <div className="setting-toggle-info">
          <div className="setting-label">Dark Mode Theme</div>
          <div className="setting-desc">Toggle the overall appearance of the portal</div>
        </div>
        <button 
          type="button"
          className="theme-toggle-btn" 
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <><Sun size={14} /> Light</> : <><Moon size={14} /> Dark</>}
        </button>
      </div>

      <div className="setting-toggle-row">
        <div className="setting-toggle-info">
          <div className="setting-label">Default Timetable View</div>
          <div className="setting-desc">Preferred view when opening the timetable page</div>
        </div>
        <select 
          className="auth-select" 
          style={{ width: '120px', marginBottom: 0, padding: '.3rem .5rem' }} 
          value={form.preferences.defaultView} 
          onChange={(e) => {
            const newVal = e.target.value;
            const updatedPreferences = { ...form.preferences, defaultView: newVal };
            const updatedForm = { ...form, preferences: updatedPreferences };
            setForm(updatedForm);
            setInitialForm(updatedForm);
            saveProfile(updatedForm);
          }}
        >
          <option>List</option>
          <option>Grid</option>
        </select>
      </div>

      <div className="setting-toggle-row">
        <div className="setting-toggle-info">
          <div className="setting-label">UI Theme Accent</div>
          <div className="setting-desc">Select custom visual highlights across the entire portal</div>
        </div>
        <div className="accent-presets-container">
          {[
            { id: 'indigo', name: 'Indigo Classic', color: '#6366f1' },
            { id: 'emerald', name: 'Neon Emerald', color: '#10b981' },
            { id: 'purple', name: 'Cyberpunk Purple', color: '#a855f7' },
            { id: 'orange', name: 'Amber Orange', color: '#f59e0b' },
            { id: 'pink', name: 'Rose Pink', color: '#ec4899' },
            { id: 'blue', name: 'Ocean Blue', color: '#0284c7' }
          ].map(preset => {
            const isSelected = (form.preferences.accent || 'indigo') === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={`accent-preset-btn ${isSelected ? 'active' : ''}`}
                title={preset.name}
                onClick={() => {
                  const updatedPreferences = { ...form.preferences, accent: preset.id };
                  const updatedForm = { ...form, preferences: updatedPreferences };
                  setForm(updatedForm);
                  setInitialForm(updatedForm);
                  applyThemeAccent(preset.id);
                  saveProfile(updatedForm);
                }}
                style={{ '--preset-color': preset.color }}
              >
                <span className="accent-color-bubble" style={{ backgroundColor: preset.color }}>
                  {isSelected && <CheckCircle2 size={10} className="accent-check-icon" />}
                </span>
                <span className="accent-color-name">{preset.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="setting-toggle-row" style={{ borderBottom: 'none', flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
        <div className="setting-toggle-info">
          <div className="setting-label">External Calendar Sync (iCal)</div>
          <div className="setting-desc">Sync your academic schedule to external calendars (Google Calendar, Apple, Outlook)</div>
        </div>
        <div className="ical-sync-wrapper">
          <input 
            type="text" 
            readOnly 
            value={`https://acadx-api.destopianpirate.com/api/v1/calendar/feed/${currentUser?.uid || 'guest'}.ics`}
            className="ical-sync-input" 
            onClick={(e) => e.target.select()}
          />
          <button 
            type="button"
            className="btn btn-primary btn-sm ical-copy-btn"
            onClick={() => {
              navigator.clipboard.writeText(`https://acadx-api.destopianpirate.com/api/v1/calendar/feed/${currentUser?.uid || 'guest'}.ics`);
              addNotification('success', 'Copied iCal Feed', 'iCal subscription link copied to clipboard.');
            }}
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSection;
