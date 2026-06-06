import React from 'react';
import { Shield, CheckCircle2, LogOut, RotateCw, Trash2 } from 'lucide-react';

const AccountSecuritySection = ({
  currentUser,
  form,
  handleSendVerification,
  handlePasswordReset,
  handleLogout,
  setShowDeleteModal,
  setDeleteConfirmText
}) => {
  const getDeviceDetails = () => {
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";
    
    if (ua.indexOf("Firefox") > -1) browser = "Mozilla Firefox";
    else if (ua.indexOf("SamsungBrowser") > -1) browser = "Samsung Internet";
    else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browser = "Opera";
    else if (ua.indexOf("Trident") > -1) browser = "Internet Explorer";
    else if (ua.indexOf("Edge") > -1 || ua.indexOf("Edg") > -1) browser = "Microsoft Edge";
    else if (ua.indexOf("Chrome") > -1) browser = "Google Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Apple Safari";
    
    if (ua.indexOf("Windows NT 10.0") > -1) os = "Windows 10/11";
    else if (ua.indexOf("Windows NT 6.2") > -1) os = "Windows 8";
    else if (ua.indexOf("Windows NT 6.1") > -1) os = "Windows 7";
    else if (ua.indexOf("Macintosh") > -1) os = "macOS";
    else if (ua.indexOf("Android") > -1) os = "Android";
    else if (ua.indexOf("iPhone") > -1) os = "iOS";
    else if (ua.indexOf("Linux") > -1) os = "Linux";
    
    return `${browser} on ${os}`;
  };

  return (
    <div>
      <div className="settings-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Account Metadata Grid */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Account Identity & Status
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Logged In User</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginTop: '0.15rem' }}>{currentUser?.email || 'singh.ayush@iitgn.ac.in'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Account Sync Mode</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: currentUser?.isDemo ? 'var(--warning)' : 'var(--success)', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: currentUser?.isDemo ? 'var(--warning)' : 'var(--success)' }} />
                  {currentUser?.isDemo ? 'Local Sandboxed Demo' : 'Cloud Synchronized'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Identity Provider</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginTop: '0.15rem' }}>
                  {currentUser?.providerId === 'google.com' ? 'Google SSO' : 'Email & Password'}
                </div>
              </div>
            </div>
          </div>

          {/* Email Verification Status */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>Email Verification</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0, lineHeight: '1.4', flex: 1, minWidth: '240px' }}>
                Verify your email address to secure your account and recover data in case of credential loss.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {(currentUser?.emailVerified || currentUser?.isDemo) ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 700 }}>
                    <CheckCircle2 size={12} /> Verified
                  </span>
                ) : (
                  <>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 700 }}>
                      Unverified
                    </span>
                    <button 
                      type="button"
                      className="btn btn-outline btn-sm" 
                      onClick={handleSendVerification} 
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                    >
                      Send Link
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Password Reset Section */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>Password Management</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0, lineHeight: '1.4', flex: 1, minWidth: '240px' }}>
                {currentUser?.providerId === 'google.com' 
                  ? 'Your password is securely managed via Google SSO connection. Credentials cannot be modified here.' 
                  : 'Request a secure email link to change or reset your password.'
                }
              </p>
              {currentUser?.providerId !== 'google.com' && (
                <button 
                  type="button"
                  className="btn btn-outline btn-sm" 
                  onClick={handlePasswordReset} 
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                >
                  Send Reset Email
                </button>
              )}
            </div>
          </div>

          {/* Device & Session Details */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>Active Session Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Logged-in Device</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 500, marginTop: '0.15rem' }}>{getDeviceDetails()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Last Login Time</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 500, marginTop: '0.15rem' }}>
                  {currentUser?.metadata?.lastSignInTime 
                    ? new Date(currentUser.metadata.lastSignInTime).toLocaleString() 
                    : new Date().toLocaleString() + ' (This Session)'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Session Management */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>Session Management</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0, lineHeight: '1.4' }}>
                Securely log out of this active device session.
              </p>
            </div>
            <button 
              type="button"
              className="btn btn-outline" 
              onClick={handleLogout} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <LogOut size={16} /> Logout Session
            </button>
          </div>

          {/* Reset Local Cache */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>Reset Local Cache</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0, lineHeight: '1.4' }}>
                Clear cached databases, timetables, note summaries, and logs stored locally.
              </p>
            </div>
            <button 
              type="button"
              className="btn btn-outline danger" 
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all local data? This will log you out and reset cached timetables, grades, and notes.')) {
                  localStorage.clear();
                  window.location.href = '/login';
                }
              }} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RotateCw size={16} /> Reset Local Data
            </button>
          </div>
          
        </div>
      </div>

      {/* Danger Zone */}
      <div className="danger-zone" style={{ border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '1rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.02)' }}>
        <h4 style={{ color: '#ef4444', margin: '0 0 0.5rem 0', fontWeight: 800 }}>Danger Zone</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 1.25rem 0', lineHeight: '1.4' }}>
          Permanently delete your student profile, grades database, timetable mappings, notes, and all digital assets. This operation is immediate and irreversible.
        </p>
        <button 
          type="button"
          className="btn btn-danger" 
          onClick={() => {
            setShowDeleteModal(true);
            setDeleteConfirmText('');
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)' }}
        >
          <Trash2 size={16} /> Delete Account
        </button>
      </div>
    </div>
  );
};

export default AccountSecuritySection;
