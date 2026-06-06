import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, UserPlus, User, GraduationCap, Calendar, BarChart3, UtensilsCrossed, Check, ChevronRight, ChevronLeft, AlertCircle, ArrowRight, Loader2, X, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

/* ─── Password Strength Calculator ─── */
const getPasswordStrength = (pw) => {
  if (!pw) return { level: 0, label: '', key: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { level: 1, label: 'Weak', key: 'weak' };
  if (score === 2) return { level: 2, label: 'Fair', key: 'fair' };
  if (score === 3 || score === 4) return { level: 3, label: 'Good', key: 'good' };
  return { level: 4, label: 'Strong', key: 'strong' };
};

/* ─── Illustration Panel ─── */
const IllustrationPanel = () => (
  <div className="auth-illustration">
    <div className="auth-mesh-blob" />
    <div className="auth-illus-content">
      <div className="auth-illus-logo">
        <GraduationCap size={28} />
      </div>
      <h2 className="auth-illus-title">
        Get started with <span>AcadX</span>
      </h2>
      <p className="auth-illus-subtitle">
        Join fellow IITGN students to streamline your timetable, track grades, and access mess menus.
      </p>
      <div className="auth-floating-cards">
        <div className="floating-card">
          <div className="floating-card-icon" style={{ background: 'rgba(99,102,241,0.2)', color: 'var(--primary)' }}>
            <Calendar size={18} />
          </div>
          <div className="floating-card-text">
            <strong>ES 202: Signals & Systems</strong>
            <span>LH-102 • Starts in 10 mins</span>
          </div>
          <span className="floating-card-badge indigo">Live Slot</span>
        </div>

        <div className="floating-card">
          <div className="floating-card-icon" style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}>
            <BarChart3 size={18} />
          </div>
          <div className="floating-card-text">
            <strong>GPA Forecast Analytics</strong>
            <span>Current: 9.15 • Target: 9.30</span>
          </div>
          <span className="floating-card-badge green">On Track</span>
        </div>

        <div className="floating-card">
          <div className="floating-card-icon" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>
            <UtensilsCrossed size={18} />
          </div>
          <div className="floating-card-text">
            <strong>Diners Hall Lunch Menu</strong>
            <span>Lunch: Paneer Butter Masala</span>
          </div>
          <span className="floating-card-badge amber">Open</span>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Google Icon SVG ─── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

/* ─── Step Indicator ─── */
const StepIndicator = ({ current, total }) => {
  const labels = ['Account', 'Security', 'Confirm'];
  return (
    <div className="auth-step-indicator">
      {Array.from({ length: total }, (_, i) => (
        <div className="auth-step-item" key={i}>
          <div className={`auth-step-circle ${i + 1 === current ? 'active' : ''} ${i + 1 < current ? 'completed' : ''}`}>
            {i + 1 < current ? <Check size={14} /> : i + 1}
          </div>
          <span className={`auth-step-label ${i + 1 === current ? 'active' : ''} ${i + 1 < current ? 'completed' : ''}`}>
            {labels[i]}
          </span>
          {i < total - 1 && (
            <div className={`auth-step-line ${i + 1 < current ? 'completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const SignupPage = () => {
  const [step, setStep] = useState(1);
  
  // Step 1 fields
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  
  // Step 2 fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  
  // UI states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  
  // Username availability
  const [usernameStatus, setUsernameStatus] = useState(''); // '', 'checking', 'available', 'taken'
  const usernameTimerRef = useRef(null);
  
  // Domain modal
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [domainModalMessage, setDomainModalMessage] = useState('');

  const { signup, loginWithGoogle, logout, saveProfile, checkUsernameAvailable } = useAuth();
  const navigate = useNavigate();

  const triggerShake = () => {
    setShouldShake(true);
    setTimeout(() => setShouldShake(false), 500);
  };

  // Debounced username check
  const handleUsernameChange = useCallback((val) => {
    setUsername(val);
    setUsernameStatus('');
    
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);
    
    const trimmed = val.trim();
    if (trimmed.length < 3) { setUsernameStatus(''); return; }
    
    setUsernameStatus('checking');
    usernameTimerRef.current = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailable(trimmed);
        setUsernameStatus(available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('');
      }
    }, 600);
  }, [checkUsernameAvailable]);

  // Validate step before proceeding
  const validateStep = () => {
    if (step === 1) {
      if (!username.trim()) { setError('Username is required'); triggerShake(); return false; }
      if (username.trim().length < 3) { setError('Username must be at least 3 characters'); triggerShake(); return false; }
      if (usernameStatus === 'taken') { setError('Username is already taken'); triggerShake(); return false; }
      if (!firstName.trim()) { setError('First name is required'); triggerShake(); return false; }
      if (!surname.trim()) { setError('Surname is required'); triggerShake(); return false; }
    }
    if (step === 2) {
      if (!email.includes('@')) { setError('Please enter a valid email address'); triggerShake(); return false; }
      if (!email.toLowerCase().endsWith('@iitgn.ac.in')) { setError('Only @iitgn.ac.in email addresses are allowed'); triggerShake(); return false; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); triggerShake(); return false; }
      if (password !== confirmPw) { setError('Passwords do not match'); triggerShake(); return false; }
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (!validateStep()) return;
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(s => s - 1);
  };

  // Final signup
  const handleSignup = async () => {
    setError('');
    try {
      setLoading(true);
      
      // Double-check username availability at submission time
      const available = await checkUsernameAvailable(username.trim());
      if (!available) { 
        setError('Username is already taken');
        triggerShake();
        setStep(1); // Go back to fix
        setLoading(false);
        return; 
      }

      await signup(email, password);
      await saveProfile({ 
        username: username.trim(), 
        firstName: firstName.trim(), 
        surname: surname.trim(), 
        name: `${firstName.trim()} ${surname.trim()}`,
        email, 
        signupMethod: 'manual', 
        createdAt: new Date().toISOString() 
      });
      
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#f472b6', '#34d399']
      });
      setTimeout(() => navigate('/profile-setup', { state: { method: 'manual' } }), 750);
    } catch (err) {
      triggerShake();
      setError(err.message?.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '') || 'Signup failed');
    } finally { setLoading(false); }
  };

  // Google signup with domain check
  const handleGoogle = async () => {
    try {
      setLoading(true); 
      setError('');
      const result = await loginWithGoogle();
      const googleEmail = result.user?.email || '';

      // Domain check for Google signup
      if (!googleEmail.toLowerCase().endsWith('@iitgn.ac.in')) {
        await logout();
        setDomainModalMessage(
          `Google authentication succeeded, but the account "${googleEmail}" is restricted. You must sign up using your official IIT Gandhinagar Google Workspace ID (@iitgn.ac.in).`
        );
        setShowDomainModal(true);
        setLoading(false);
        return;
      }

      await saveProfile({ 
        username: result.user.displayName || '', 
        email: googleEmail, 
        signupMethod: 'google', 
        createdAt: new Date().toISOString() 
      });
      
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335']
      });
      setTimeout(() => navigate('/profile-setup', { state: { method: 'google' } }), 750);
    } catch (err) {
      triggerShake();
      setError(err.message?.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '') || 'Google signup failed');
    } finally { setLoading(false); }
  };

  // Password strength
  const strength = getPasswordStrength(password);

  // Domain status for email field
  const emailDomainStatus = !email ? '' : email.toLowerCase().endsWith('@iitgn.ac.in') ? 'valid' : (email.includes('@') ? 'invalid' : '');

  // Animation variants
  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 })
  };
  const [slideDir, setSlideDir] = useState(1);

  const goNext = () => { setSlideDir(1); handleNext(); };
  const goBack = () => { setSlideDir(-1); handleBack(); };

  return (
    <div className="auth-page">
      {/* Left: Illustration */}
      <IllustrationPanel />

      {/* Right: Form */}
      <div className="auth-form-panel">
        <div className={`auth-card ${shouldShake ? 'shake-animation' : ''}`}>
          
          {/* Step Indicator */}
          <StepIndicator current={step} total={3} />

          {error && (
            <div className="auth-error">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <AnimatePresence mode="wait" custom={slideDir}>
            {/* ═══ STEP 1: Identity ═══ */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={slideDir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
              >
                <div className="auth-header" style={{ marginBottom: '1.25rem' }}>
                  <div className="auth-logo-ring">
                    <UserPlus size={24} style={{ color: 'var(--primary)' }} />
                  </div>
                  <h1 className="auth-title">Create Account</h1>
                  <p className="auth-subtitle">Let's start with your identity</p>
                </div>

                <div className="auth-form">
                  {/* Username with availability check */}
                  <div className="input-group">
                    <User size={17} className="input-icon" />
                    <input 
                      id="signup-username"
                      className="auth-input" 
                      placeholder="Username (min 3 characters)" 
                      value={username} 
                      onChange={e => handleUsernameChange(e.target.value)} 
                      style={{ paddingRight: usernameStatus ? '6.5rem' : undefined }}
                    />
                    {usernameStatus && (
                      <div className={`username-status ${usernameStatus}`}>
                        {usernameStatus === 'checking' && <><Loader2 size={14} /> Checking...</>}
                        {usernameStatus === 'available' && <><CheckCircle2 size={14} /> Available</>}
                        {usernameStatus === 'taken' && <><XCircle size={14} /> Taken</>}
                      </div>
                    )}
                  </div>

                  {/* Name row */}
                  <div className="auth-name-row">
                    <div className="input-group">
                      <User size={17} className="input-icon" />
                      <input id="signup-firstname" className="auth-input" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    </div>
                    <div className="input-group">
                      <User size={17} className="input-icon" />
                      <input id="signup-surname" className="auth-input" placeholder="Surname" value={surname} onChange={e => setSurname(e.target.value)} />
                    </div>
                  </div>

                  {/* Google shortcut */}
                  <div className="auth-divider"><span>or</span></div>
                  <button className="btn-google-premium" onClick={handleGoogle} disabled={loading}>
                    <GoogleIcon />
                    Sign up with Google Workspace
                  </button>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', marginTop: '1.5rem' }}>
                  <button className="btn-step-nav btn-step-next" onClick={goNext} style={{ width: '100%' }}>
                    Next <ChevronRight size={17} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ═══ STEP 2: Credentials ═══ */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={slideDir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
              >
                <div className="auth-header" style={{ marginBottom: '1.25rem' }}>
                  <h1 className="auth-title" style={{ fontSize: '1.35rem' }}>Security Details</h1>
                  <p className="auth-subtitle">Set up your college email & password</p>
                </div>

                <div className="auth-form">
                  {/* Email with domain badge */}
                  <div className="input-group input-group-with-domain">
                    <Mail size={17} className="input-icon" />
                    <input 
                      id="signup-email"
                      type="email" 
                      className="auth-input" 
                      placeholder="yourname@iitgn.ac.in" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                    />
                    <div className={`domain-badge ${emailDomainStatus}`}>
                      @iitgn.ac.in
                    </div>
                  </div>
                  {emailDomainStatus === 'invalid' && (
                    <p className="field-hint error">Only @iitgn.ac.in email addresses are accepted</p>
                  )}

                  {/* Password */}
                  <div className="input-group">
                    <Lock size={17} className="input-icon" />
                    <input 
                      id="signup-password"
                      type={showPw ? 'text' : 'password'} 
                      className="auth-input" 
                      placeholder="Password (min 6 chars)" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                    />
                    <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {password && (
                    <div className="password-strength">
                      <div className="password-strength-bar">
                        {[1,2,3,4].map(i => (
                          <div 
                            key={i} 
                            className={`password-strength-segment ${i <= strength.level ? `filled strength-${strength.key}` : ''}`} 
                          />
                        ))}
                      </div>
                      <span className={`password-strength-label strength-${strength.key}`}>
                        {strength.label}
                      </span>
                    </div>
                  )}

                  {/* Confirm Password */}
                  <div className="input-group">
                    <Lock size={17} className="input-icon" />
                    <input 
                      id="signup-confirm-password"
                      type={showPw ? 'text' : 'password'} 
                      className="auth-input" 
                      placeholder="Confirm Password" 
                      value={confirmPw} 
                      onChange={e => setConfirmPw(e.target.value)} 
                    />
                    {confirmPw && (
                      <div style={{ position: 'absolute', right: '0.75rem' }}>
                        {password === confirmPw 
                          ? <CheckCircle2 size={17} color="#22c55e" />
                          : <XCircle size={17} color="#ef4444" />
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', gap: '0.75rem' }}>
                  <button className="btn-step-nav" onClick={goBack}>
                    <ChevronLeft size={17} /> Back
                  </button>
                  <button className="btn-step-nav btn-step-next" onClick={goNext} style={{ flex: 1 }}>
                    Next <ChevronRight size={17} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ═══ STEP 3: Confirmation ═══ */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={slideDir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
              >
                <div className="auth-header" style={{ marginBottom: '1.25rem' }}>
                  <h1 className="auth-title" style={{ fontSize: '1.35rem' }}>Review & Confirm</h1>
                  <p className="auth-subtitle">Double-check your details before creating your account</p>
                </div>

                <div className="auth-summary-card">
                  <div className="auth-summary-row">
                    <span className="label">Username</span>
                    <span className="value">@{username}</span>
                  </div>
                  <div className="auth-summary-row">
                    <span className="label">Full Name</span>
                    <span className="value">{firstName} {surname}</span>
                  </div>
                  <div className="auth-summary-row">
                    <span className="label">College Email</span>
                    <span className="value">{email}</span>
                  </div>
                  <div className="auth-summary-row">
                    <span className="label">Password</span>
                    <span className="value">{'•'.repeat(Math.min(password.length, 12))}</span>
                  </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', gap: '0.75rem' }}>
                  <button className="btn-step-nav" onClick={goBack}>
                    <ChevronLeft size={17} /> Edit
                  </button>
                  <button 
                    className="btn-auth-submit" 
                    onClick={handleSignup} 
                    disabled={loading}
                    style={{ flex: 1 }}
                  >
                    <UserPlus size={17} /> {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </div>

      {/* Domain Verification Modal */}
      <AnimatePresence>
        {showDomainModal && (
          <div className="auth-domain-modal-overlay">
            <motion.div
              className="auth-domain-modal"
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="auth-domain-modal-icon">
                  <AlertCircle size={22} />
                </div>
                <h3>Access Restricted</h3>
              </div>
              <p>{domainModalMessage}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowDomainModal(false)}
                  className="btn-auth-submit"
                  style={{ width: 'auto', padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
                >
                  Okay, Understood <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignupPage;
