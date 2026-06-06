import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, User, AlertCircle, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  
  // Custom dialog box state
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [domainModalMessage, setDomainModalMessage] = useState('');

  const { login, loginWithGoogle, loginAsDemo, logout, resetPassword, lookupEmailByUsername } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError('');
    
    let email = identifier.trim();
    if (!email) return;

    try {
      setLoading(true);
      
      // If no '@', resolve as username to get email
      if (!email.includes('@')) {
        try {
          email = await lookupEmailByUsername(email);
        } catch (lookupErr) {
          setShouldShake(true);
          setTimeout(() => setShouldShake(false), 500);
          setError('No account found with that username');
          setLoading(false);
          return;
        }
      }

      // Check college domain constraint
      if (!email.toLowerCase().endsWith('@iitgn.ac.in')) {
        setDomainModalMessage(
          `The email address associated with your login ("${email}") is invalid. Access is restricted to official IIT Gandhinagar student accounts only. Please use your @iitgn.ac.in email ID to log in.`
        );
        setShowDomainModal(true);
        setLoading(false);
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
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      setError(err.message?.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '') || 'Login failed');
    } finally { 
      setLoading(false); 
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
      setLoading(true); 
      setError('');
      const result = await loginWithGoogle();
      const email = result.user?.email || '';

      // Check if logged in Google email matches college domain
      if (!email.toLowerCase().endsWith('@iitgn.ac.in')) {
        // Sign out immediately to clear the invalid auth session
        await logout();
        setDomainModalMessage(
          `Google authentication succeeded, but the account "${email}" is restricted. You must log in using your official IIT Gandhinagar Google Workspace ID (@iitgn.ac.in).`
        );
        setShowDomainModal(true);
        setLoading(false);
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
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      setError(err.message?.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '') || 'Google login failed');
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!identifier) { 
      setError('Enter your username or email first'); 
      setShouldShake(true); 
      setTimeout(() => setShouldShake(false), 500); 
      return; 
    }
    
    let email = identifier.trim();
    try {
      if (!email.includes('@')) { 
        email = await lookupEmailByUsername(email); 
      }
      
      if (!email.toLowerCase().endsWith('@iitgn.ac.in')) {
        setDomainModalMessage(
          `Cannot request password reset. The email "${email}" associated with this account does not belong to the IIT Gandhinagar domain (@iitgn.ac.in).`
        );
        setShowDomainModal(true);
        return;
      }

      await resetPassword(email);
      setResetSent(true); 
      setError('');
    } catch (err) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      setError(err.message || 'Failed to send reset email');
    }
  };

  // Stagger configurations for animation
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="auth-page" style={{ position: 'relative' }}>
      <motion.div
        className={`auth-card glass-panel ${shouldShake ? 'shake-animation' : ''}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="auth-header" variants={itemVariants}>
          {/* IITGN Branding Badge */}
          <div style={{
            background: 'rgba(249, 115, 22, 0.1)',
            color: '#f97316',
            border: '1px solid rgba(249, 115, 22, 0.2)',
            borderRadius: '20px',
            padding: '0.35rem 0.85rem',
            fontSize: '0.75rem',
            fontWeight: '700',
            letterSpacing: '0.05em',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <GraduationCap size={14} /> IIT GANDHINAGAR
          </div>

          <div className="auth-logo-ring">
            <LogIn size={28} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your StudentOS portal</p>
        </motion.div>
        
        {error && <motion.div className="auth-error" variants={itemVariants}>{error}</motion.div>}
        {resetSent && <motion.div className="auth-success" variants={itemVariants}>Password reset email sent! Check your inbox.</motion.div>}
        
        <form onSubmit={handleLogin} className="auth-form">
          <motion.div className="input-group" variants={itemVariants}>
            <User size={18} className="input-icon" />
            <input 
              type="text"
              className="auth-input" 
              placeholder="Username or College Email" 
              value={identifier} 
              onChange={e => setIdentifier(e.target.value)} 
              required 
            />
          </motion.div>
          
          <motion.div className="input-group" variants={itemVariants}>
            <Lock size={18} className="input-icon" />
            <input 
              type={showPw ? 'text' : 'password'} 
              className="auth-input" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </motion.div>
          
          <motion.button type="button" className="forgot-link" onClick={handleForgot} variants={itemVariants}>
            Forgot Password?
          </motion.button>
          
          <motion.button type="submit" className="btn btn-primary btn-full" disabled={loading} variants={itemVariants}>
            <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>
        
        <motion.div className="auth-divider" variants={itemVariants}><span>or</span></motion.div>
        
        <motion.button className="btn btn-google btn-full" onClick={handleGoogle} disabled={loading} variants={itemVariants}>
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google Workspace Login
        </motion.button>

        <motion.button 
          type="button" 
          className="btn btn-secondary btn-full" 
          onClick={handleDemoLogin} 
          style={{ 
            marginTop: '0.75rem', 
            background: 'rgba(99, 102, 241, 0.08)', 
            color: 'var(--primary)', 
            border: '1px solid rgba(99, 102, 241, 0.15)' 
          }} 
          variants={itemVariants}
        >
          <User size={18} /> Bypass with Demo Account
        </motion.button>
        
        <motion.p className="auth-switch" variants={itemVariants}>
          New Student? <Link to="/signup">Create Account</Link>
        </motion.p>
      </motion.div>

      {/* Domain Verification Modal */}
      <AnimatePresence>
        {showDomainModal && (
          <div className="modal-overlay" style={{ background: 'rgba(0, 0, 0, 0.65)' }}>
            <motion.div
              className="modal-content"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 30px 70px rgba(0,0,0,0.4)',
                padding: '2rem',
                borderRadius: '1.25rem',
                maxWidth: '450px',
                width: '90%',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}
            >
              <div className="modal-header" style={{ border: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <AlertCircle size={22} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text)' }}>
                  Access Restricted
                </h3>
              </div>
              
              <div className="modal-body" style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', padding: 0, margin: 0 }}>
                {domainModalMessage}
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', border: 'none', padding: 0, margin: 0 }}>
                <button
                  onClick={() => setShowDomainModal(false)}
                  className="btn btn-primary"
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: '0.65rem',
                    fontWeight: '600',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  Okay, Understood <ArrowRight size={16} />
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
