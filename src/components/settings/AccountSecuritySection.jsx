import React from 'react';
import { Shield, CheckCircle2, AlertTriangle, LogOut, Trash2, Mail, Lock, Laptop, Key, User } from 'lucide-react';

const AccountSecuritySection = ({
  currentUser,
  form,
  handleSendVerification,
  handlePasswordReset,
  handleLogout,
  setShowDeleteModal,
  setDeleteConfirmText
}) => {
  // Device details helper
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

  // Calculate Security Score
  const isEmailVerified = currentUser?.emailVerified || currentUser?.isDemo;
  const isSSO = currentUser?.providerId === 'google.com';
  const isInstituteEmail = currentUser?.email?.toLowerCase().endsWith('@iitgn.ac.in');
  const hasLastLogin = !!currentUser?.metadata?.lastSignInTime;

  let securityScore = 0;
  if (isInstituteEmail) securityScore += 25;
  if (isEmailVerified) securityScore += 25;
  if (isSSO) securityScore += 25; else securityScore += 15;
  if (hasLastLogin) securityScore += 25;

  // Visual score category
  let scoreColorClass = 'strong';
  let scoreLabel = 'Excellent';
  if (securityScore < 65) {
    scoreColorClass = 'weak';
    scoreLabel = 'Action Needed';
  } else if (securityScore < 90) {
    scoreColorClass = 'medium';
    scoreLabel = 'Fair';
  }

  // SVG ring properties
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (securityScore / 100) * circumference;

  return (
    <div className="security-section-wrapper">
      
      {/* Security Health Widget */}
      <div className="security-health-widget-new">
        <div className="security-health-header">
          <Shield className="shield-icon-glow" size={20} />
          <div>
            <h4>Security Health Center</h4>
            <p>Real-time analysis of your student portal credentials and verification status</p>
          </div>
        </div>

        <div className="security-health-dashboard">
          {/* SVG Circular Progress Ring */}
          <div className="security-gauge-container">
            <svg className="security-progress-svg" viewBox="0 0 90 90">
              <circle 
                className="security-progress-bg-circle" 
                cx="45" cy="45" r={radius} 
                strokeWidth="7"
              />
              <circle 
                className={`security-progress-circle ${scoreColorClass}`} 
                cx="45" cy="45" r={radius} 
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
              />
            </svg>
            <div className="gauge-overlay-text">
              <span className="gauge-score">{securityScore}</span>
              <span className="gauge-percent">%</span>
            </div>
            <span className={`gauge-badge ${scoreColorClass}`}>{scoreLabel}</span>
          </div>

          {/* Security Parameter Checklist */}
          <div className="security-checklist-new">
            <div className={`security-check-row ${isInstituteEmail ? 'passed' : 'failed'}`}>
              <span className="status-marker" />
              <div className="checklist-details">
                <h6>IITGN Academic Domain</h6>
                <p>{isInstituteEmail ? 'Identified as a genuine institute academic mailbox (@iitgn.ac.in).' : 'Registered under personal mailbox domain. Sandbox session limits apply.'}</p>
              </div>
            </div>
            <div className={`security-check-row ${isEmailVerified ? 'passed' : 'failed'}`}>
              <span className="status-marker" />
              <div className="checklist-details">
                <h6>Email Identity Verification</h6>
                <p>{isEmailVerified ? 'Mailbox confirmation complete. Direct credentials recovery is safe.' : 'Mailbox unconfirmed. Confirm ownership to prevent accidental lockouts.'}</p>
              </div>
            </div>
            <div className={`security-check-row ${isSSO ? 'passed' : 'info'}`}>
              <span className="status-marker" />
              <div className="checklist-details">
                <h6>Enterprise SSO Security</h6>
                <p>{isSSO ? 'Protected by Google Single Sign-On federation.' : 'Using standard password. Connect with Google SSO for higher protection.'}</p>
              </div>
            </div>
            <div className={`security-check-row ${hasLastLogin ? 'passed' : 'failed'}`}>
              <span className="status-marker" />
              <div className="checklist-details">
                <h6>Authorized Session Token</h6>
                <p>{hasLastLogin ? 'Active login credentials verified within normal expiry period.' : 'Sandbox database session credentials active.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Credentials & Identity Cards Grid */}
      <div className="security-cards-grid">
        
        {/* Card 1: Identity Card */}
        <div className="security-card-item">
          <div className="card-item-header">
            <User size={18} className="card-icon" />
            <h5>Student Profile Identity</h5>
          </div>
          
          <div className="card-content-fields">
            <div className="profile-sec-field">
              <label>Logged-in ID</label>
              <div>{currentUser?.email || 'student.demo@iitgn.ac.in'}</div>
            </div>
            <div className="profile-sec-field">
              <label>Account Sync Mode</label>
              <div className="sync-mode-indicator">
                <span className={`dot-status ${currentUser?.isDemo ? 'warning' : 'success'}`} />
                {currentUser?.isDemo ? 'Local Sandboxed Demo' : 'Cloud Synchronized'}
              </div>
            </div>
          </div>

          <div className="card-footer-action">
            {isEmailVerified ? (
              <span className="verified-success-label">
                <CheckCircle2 size={12} /> Email is Verified
              </span>
            ) : (
              <button 
                type="button"
                className="btn btn-primary btn-sm flex-center"
                onClick={handleSendVerification}
              >
                <Mail size={12} /> Verify Email Address
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Password Management */}
        <div className="security-card-item">
          <div className="card-item-header">
            <Key size={18} className="card-icon" />
            <h5>Authentication Settings</h5>
          </div>

          <p className="card-item-description">
            {isSSO 
              ? 'Your account is connected via Google SSO. Password controls are managed by Google authentication.' 
              : 'Keep your login password updated to prevent unauthorized portal access.'
            }
          </p>

          <div className="card-footer-action flex-end">
            {!isSSO && (
              <button 
                type="button"
                className="btn btn-outline btn-sm flex-center"
                onClick={handlePasswordReset}
              >
                <Lock size={12} /> Send Reset Link
              </button>
            )}
            {isSSO && (
              <span className="sso-active-badge">Google SSO Active</span>
            )}
          </div>
        </div>

        {/* Card 3: Session Details */}
        <div className="security-card-item">
          <div className="card-item-header">
            <Laptop size={18} className="card-icon" />
            <h5>Active Device Session</h5>
          </div>

          <div className="card-content-fields">
            <div className="profile-sec-field">
              <label>Browser &amp; OS</label>
              <div>{getDeviceDetails()}</div>
            </div>
            <div className="profile-sec-field">
              <label>Last Authentication</label>
              <div>
                {currentUser?.metadata?.lastSignInTime 
                  ? new Date(currentUser.metadata.lastSignInTime).toLocaleString() 
                  : new Date().toLocaleString() + ' (Current Session)'
                }
              </div>
            </div>
          </div>

          <div className="card-footer-action">
            <button 
              type="button"
              className="btn btn-outline btn-sm danger flex-center"
              onClick={handleLogout}
            >
              <LogOut size={12} /> Terminate Session
            </button>
          </div>
        </div>



      </div>

      {/* Danger Zone */}
      <div className="danger-zone-revamped">
        <div className="danger-zone-header">
          <AlertTriangle className="danger-icon" size={20} />
          <div>
            <h4>Danger Zone</h4>
            <p>Irreversibly delete your student profile metadata, grade spreadsheets, timetable files, and authentication records.</p>
          </div>
        </div>
        <div className="danger-action-block">
          <button 
            type="button"
            className="btn btn-danger delete-btn-new"
            onClick={() => {
              setShowDeleteModal(true);
              setDeleteConfirmText('');
            }}
          >
            <Trash2 size={14} /> Delete Profile Account
          </button>
        </div>
      </div>

    </div>
  );
};

export default AccountSecuritySection;
