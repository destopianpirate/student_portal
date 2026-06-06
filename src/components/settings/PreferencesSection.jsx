import React, { useState } from 'react';
import { Sun, Moon, Calendar, Palette, Check, HelpCircle, ChevronDown, ChevronUp, Copy } from 'lucide-react';

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
  const [showIcalHelp, setShowIcalHelp] = useState(false);

  const handleAccentChange = (accentId) => {
    if (accentId === 'black' && darkMode) {
      setDarkMode(false);
      addNotification('info', 'Theme Adjusted', 'Light theme forced for black accent color.');
    }
    const updatedPreferences = { ...form.preferences, accent: accentId };
    const updatedForm = { ...form, preferences: updatedPreferences };
    setForm(updatedForm);
    setInitialForm(updatedForm);
    applyThemeAccent(accentId);
    saveProfile(updatedForm);
    addNotification('success', 'Accent Color Updated', `Successfully changed primary theme highlight.`);
  };

  const iCalUrl = `https://acadx-api.destopianpirate.com/api/v1/calendar/feed/${currentUser?.uid || 'guest'}.ics`;

  const copyIcalLink = () => {
    navigator.clipboard.writeText(iCalUrl);
    addNotification('success', 'Copied Link', 'iCal subscription feed URL copied to clipboard.');
  };

  return (
    <div className="settings-card preferences-revamp-card">
      <div className="pref-grid">

        {/* Segment Button Card: Dark Mode Theme */}
        <div className="pref-item-card">
          <div className="pref-item-header">
            <div className="pref-icon-wrapper theme-icon">
              {darkMode ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <div className="pref-item-title-section">
              <div className="pref-item-label">Appearance Theme</div>
              <div className="pref-item-desc">Choose between a light or dark visual aesthetic</div>
            </div>
          </div>
          <div className="pref-control-action">
            <div className="pref-segment-group">
              <button
                type="button"
                className={`pref-segment-btn ${!darkMode ? 'active' : ''}`}
                onClick={() => { if (darkMode) setDarkMode(false); }}
              >
                <Sun size={14} /> Light
              </button>
              <button
                type="button"
                className={`pref-segment-btn ${darkMode ? 'active' : ''}`}
                onClick={() => { if (!darkMode) setDarkMode(true); }}
                disabled={(form.preferences?.accent || 'indigo') === 'black'}
                style={(form.preferences?.accent || 'indigo') === 'black' ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
                title={(form.preferences?.accent || 'indigo') === 'black' ? 'Dark theme is not available with Ink Black accent' : ''}
              >
                <Moon size={14} /> Dark
              </button>
            </div>
          </div>
        </div>

        {/* Theme Accent Panel */}
        <div className="pref-item-card">
          <div className="pref-item-header" style={{ marginBottom: '1.25rem' }}>
            <div className="pref-icon-wrapper accent-icon">
              <Palette size={18} />
            </div>
            <div className="pref-item-title-section">
              <div className="pref-item-label">UI Theme Accent</div>
              <div className="pref-item-desc">Customize accent highlights and gradients across the dashboard</div>
            </div>
          </div>

          <div className="accent-grid-container">
            {[
              { id: 'indigo', name: 'Indigo Classic', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
              { id: 'emerald', name: 'Neon Emerald', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
              { id: 'black', name: 'Ink Black', color: '#000000', gradient: 'linear-gradient(135deg, #3f3f46, #000000)' },
              { id: 'orange', name: 'Amber Orange', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
              { id: 'pink', name: 'Rose Pink', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
              { id: 'blue', name: 'Ocean Blue', color: '#0284c7', gradient: 'linear-gradient(135deg, #0284c7, #0369a1)' }
            ].map(preset => {
              const isSelected = (form.preferences?.accent || 'indigo') === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`accent-preset-card-new ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAccentChange(preset.id)}
                  style={{ '--preset-glow': preset.color + '4D' }}
                >
                  <div className="accent-gradient-preview" style={{ background: preset.gradient }}>
                    {isSelected && (
                      <span className="accent-check-badge-new">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <span className="accent-preset-label">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* iCal Feed Sync */}
        <div className="pref-item-card span-full ical-sync-card">
          <div className="ical-card-content">
            <div className="pref-item-header" style={{ marginBottom: 0 }}>
              <div className="pref-icon-wrapper calendar-icon">
                <Calendar size={18} />
              </div>
              <div className="pref-item-title-section">
                <div className="pref-item-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>External Calendar Sync (iCal)</span>
                  <span className="ical-active-pulse-badge">
                    <span className="pulse-dot" /> Sync Active
                  </span>
                </div>
                <div className="pref-item-desc">Integrate your classes and exams into Google Calendar, Apple, or Outlook</div>
              </div>
            </div>

            <div className="ical-input-action-row">
              <input 
                type="text" 
                readOnly 
                value={iCalUrl}
                className="ical-link-field-new" 
                onClick={(e) => e.target.select()}
              />
              <button 
                type="button"
                className="btn btn-primary ical-copy-btn-new"
                onClick={copyIcalLink}
              >
                <Copy size={14} /> Copy link
              </button>
            </div>

            <button
              type="button"
              className="ical-toggle-instructions-btn"
              onClick={() => setShowIcalHelp(!showIcalHelp)}
            >
              <HelpCircle size={14} /> 
              <span>{showIcalHelp ? 'Hide subscription instructions' : 'How do I add this to my calendar?'}</span>
              {showIcalHelp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showIcalHelp && (
              <div className="ical-help-box">
                <div className="ical-help-tab">
                  <h5>📅 Google Calendar</h5>
                  <p>Open Google Calendar in your web browser. Click the <strong>"+"</strong> next to <em>"Other calendars"</em> on the left side panel, select <strong>"From URL"</strong>, paste the link above, and click <strong>"Add calendar"</strong>.</p>
                </div>
                <div className="ical-help-tab">
                  <h5>🍏 Apple Calendar (macOS / iOS)</h5>
                  <p>In the Calendar app on macOS, select <strong>File &gt; New Calendar Subscription</strong>. Paste the feed link, click <strong>"Subscribe"</strong>, and adjust your preferences. On iOS, add via <strong>Settings &gt; Calendar &gt; Accounts &gt; Add Account &gt; Other &gt; Add Subscribed Calendar</strong>.</p>
                </div>
                <div className="ical-help-tab">
                  <h5>💻 Microsoft Outlook</h5>
                  <p>Go to Outlook Web, click <strong>"Add Calendar"</strong>, select <strong>"Subscribe from web"</strong>, paste the link, choose a name and color, and click <strong>"Import"</strong>.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PreferencesSection;
