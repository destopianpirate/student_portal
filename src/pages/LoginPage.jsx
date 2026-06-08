import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, LogIn, User, AlertCircle, GraduationCap, ArrowRight, Calendar, BarChart3, UtensilsCrossed, ArrowLeft, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

/* ─── Illustration Panel (shared visual) ─── */
const IllustrationPanel = ({ variant = 'login' }) => (
  <div className="auth-illustration">
    <div className="auth-mesh-blob" />

    <div className="auth-illus-content">
      <div className="auth-illus-logo">
        <GraduationCap size={28} />
      </div>
      <h2 className="auth-illus-title">
        {variant === 'login'
          ? <>Welcome to <span>AcadX</span></>
          : <>Get started with <span>AcadX</span></>
        }
      </h2>
      <p className="auth-illus-subtitle">
        {variant === 'login'
          ? 'The unified academic and campus hub for IIT Gandhinagar students.'
          : 'Join fellow IITGN students to streamline your timetable, track grades, and access mess menus.'}
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

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false); // Reset email sent flag
  const [shouldShake, setShouldShake] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  // Domain modal state
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [domainModalMessage, setDomainModalMessage] = useState('');

  const { login, loginWithGoogle, loginAsDemo, logout, resetPassword, lookupEmailByUsername } = useAuth();
  const navigate = useNavigate();

  const triggerShake = () => {
    setShouldShake(true);
    setTimeout(() => setShouldShake(false), 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError('');
    
    let email = identifier.trim();
    if (!email) return;

    try {
      setIsLoginLoading(true);
      
      // If no '@', resolve as username to get email
      if (!email.includes('@')) {
        try {
          email = await lookupEmailByUsername(email);
        } catch (lookupErr) {
          triggerShake();
          setError('No account found with that username');
          setIsLoginLoading(false);
          return;
        }
      }

      // Check college domain constraint
      if (!email.toLowerCase().endsWith('@iitgn.ac.in')) {
        setDomainModalMessage(
          `The email address associated with your login ("${email}") is invalid. Access is restricted to official IIT Gandhinagar student accounts only. Please use your @iitgn.ac.in email ID to log in.`
        );
        setShowDomainModal(true);
        setIsLoginLoading(false);
        return;
      }

      await login(email, password);
      
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#f472b6', '#34d399']
      });
      setTimeout(() => navigate('/'), 750);
    } catch (err) {
      triggerShake();
      setError(err.message?.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '') || 'Login failed');
    } finally { 
      setIsLoginLoading(false); 
    }
  };

  const handleDemoLogin = () => {
    loginAsDemo();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#f472b6', '#34d399']
    });
    navigate('/');
  };

  const handleGoogle = async () => {
    try {
      setIsLoginLoading(true); 
      setError('');
      const result = await loginWithGoogle();
      const email = result.user?.email || '';

      // Check if logged in Google email matches college domain (bypass on localhost for testing)
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocalhost && !email.toLowerCase().endsWith('@iitgn.ac.in')) {
        await logout();
        setDomainModalMessage(
          `Google authentication succeeded, but the account "${email}" is restricted. You must log in using your official IIT Gandhinagar Google Workspace ID (@iitgn.ac.in).`
        );
        setShowDomainModal(true);
        setIsLoginLoading(false);
        return;
      }

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335']
      });
      setTimeout(() => navigate('/'), 750);
    } catch (err) {
      triggerShake();
      setError(err.message?.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '') || 'Google login failed');
      setIsLoginLoading(false);
    }
  };

  const handleForgot = async (e) => {
    if (e) e.preventDefault();
    let email = identifier.trim();
    if (!email) {
      setError('Please enter your username or email address.');
      triggerShake();
      return;
    }
    
    try {
      setIsForgotLoading(true);
      setError('');
      setResetSent(false);
      
      if (!email.includes('@')) { 
        email = await lookupEmailByUsername(email); 
      }
      
      if (!email.toLowerCase().endsWith('@iitgn.ac.in')) {
        setDomainModalMessage(
          `Cannot request password reset. The email "${email}" associated with this account does not belong to the IIT Gandhinagar domain (@iitgn.ac.in).`
        );
        setShowDomainModal(true);
        setIsForgotLoading(false);
        return;
      }

      await resetPassword(email);
      setResetSent(true);
      setIdentifier(''); // Clear the input field on success
    } catch (err) {
      triggerShake();
      const cleanMsg = err.message
        ?.replace('Firebase: ', '')
        ?.replace(/\(auth\/.*\)/, '')
        ?.trim() || 'Failed to send password reset email';
      setError(cleanMsg);
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.07, delayChildren: 0.05, duration: 0.4 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="auth-page">
      {/* Left: Illustration */}
      <IllustrationPanel variant="login" />

      {/* Right: Form */}
      <div className="auth-form-panel">
        <motion.div
          className={`auth-card ${shouldShake ? 'shake-animation' : ''}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div className="auth-header" variants={itemVariants}>
            <div className="auth-logo-ring">
              {isForgot ? (
                <Key size={20} style={{ color: 'var(--primary)' }} />
              ) : (
                <LogIn size={24} style={{ color: 'var(--primary)' }} />
              )}
            </div>
            <h1 className="auth-title">{isForgot ? 'Reset Password' : 'Welcome Back'}</h1>
            <p className="auth-subtitle">
              {isForgot 
                ? 'Enter your username or college email to receive a password reset link' 
                : 'Sign in to your AcadX portal'}
            </p>
          </motion.div>
          
          {error && <motion.div className="auth-error" variants={itemVariants}><AlertCircle size={15} /> {error}</motion.div>}
          {resetSent && <motion.div className="auth-success" variants={itemVariants}>Password reset email sent! Check your inbox.</motion.div>}
          
          {!isForgot ? (
            <>
              <form onSubmit={handleLogin} className="auth-form">
                <motion.div className="input-group" variants={itemVariants}>
                  <User size={17} className="input-icon" />
                  <input 
                    type="text"
                    id="login-identifier"
                    className="auth-input" 
                    placeholder="Username or College Email" 
                    value={identifier} 
                    onChange={e => setIdentifier(e.target.value)} 
                    required 
                  />
                </motion.div>
                
                <motion.div className="input-group" variants={itemVariants}>
                  <Lock size={17} className="input-icon" />
                  <input 
                    id="login-password"
                    type={showPw ? 'text' : 'password'} 
                    className="auth-input" 
                    placeholder="Password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                  />
                  <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </motion.div>
                
                <motion.button 
                  type="button" 
                  className="forgot-link" 
                  onClick={() => { setIsForgot(true); setError(''); setResetSent(false); }} 
                  variants={itemVariants}
                >
                  Forgot Password?
                </motion.button>
                
                <motion.button type="submit" className="btn-auth-submit" disabled={isLoginLoading} variants={itemVariants}>
                  <LogIn size={17} /> {isLoginLoading ? 'Signing in...' : 'Sign In'}
                </motion.button>
              </form>
              
              <motion.div className="auth-divider" variants={itemVariants}><span>or</span></motion.div>
              
              <motion.button className="btn-google-premium" onClick={handleGoogle} disabled={isLoginLoading} variants={itemVariants}>
                <GoogleIcon />
                Google Workspace Login
              </motion.button>

              <motion.button 
                type="button" 
                className="btn-demo"
                onClick={handleDemoLogin} 
                variants={itemVariants}
              >
                <User size={17} /> Bypass with Demo Account
              </motion.button>
              
              <motion.p className="auth-switch" variants={itemVariants}>
                New Student? <Link to="/signup">Create Account</Link>
              </motion.p>
            </>
          ) : (
            <>
              {/* Forgot password flow */}
              {!resetSent ? (
                <form onSubmit={handleForgot} className="auth-form">
                  <motion.div className="input-group" variants={itemVariants}>
                    <User size={17} className="input-icon" />
                    <input 
                      type="text"
                      id="reset-identifier"
                      className="auth-input" 
                      placeholder="Username or College Email" 
                      value={identifier} 
                      onChange={e => setIdentifier(e.target.value)} 
                      required 
                    />
                  </motion.div>

                  <motion.button type="submit" className="btn-auth-submit" disabled={isForgotLoading} variants={itemVariants}>
                    <Key size={17} /> {isForgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </motion.button>
                </form>
              ) : null}
              <motion.button 
                type="button" 
                className="btn-demo"
                onClick={() => { setIsForgot(false); setError(''); setResetSent(false); }} 
                variants={itemVariants}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: resetSent ? '1rem' : '0' }}
              >
                <ArrowLeft size={17} /> Back to Sign In
              </motion.button>
            </>
          )}
        </motion.div>
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

export default LoginPage;
