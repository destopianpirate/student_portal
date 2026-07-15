import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, UserPlus, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const { signup, loginWithGoogle, saveProfile, checkUsernameAvailable } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault(); setError('');
    if (!username.trim()) { setError('Username is required'); setShouldShake(true); setTimeout(() => setShouldShake(false), 500); return; }
    if (!firstName.trim()) { setError('First name is required'); setShouldShake(true); setTimeout(() => setShouldShake(false), 500); return; }
    if (!surname.trim()) { setError('Surname is required'); setShouldShake(true); setTimeout(() => setShouldShake(false), 500); return; }
    if (!email.includes('@')) { setError('Please enter a valid email address'); setShouldShake(true); setTimeout(() => setShouldShake(false), 500); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); setShouldShake(true); setTimeout(() => setShouldShake(false), 500); return; }
    if (password !== confirmPw) { setError('Passwords do not match'); setShouldShake(true); setTimeout(() => setShouldShake(false), 500); return; }
    try {
      setLoading(true);
      const available = await checkUsernameAvailable(username.trim());
      if (!available) { setError('Username is already taken'); setShouldShake(true); setTimeout(() => setShouldShake(false), 500); setLoading(false); return; }
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
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      setError(err.message?.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '') || 'Signup failed');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true); setError('');
      const result = await loginWithGoogle();
      await saveProfile({ username: result.user.displayName || '', email: result.user.email, signupMethod: 'google', createdAt: new Date().toISOString() });
      
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335']
      });
      setTimeout(() => navigate('/profile-setup', { state: { method: 'google' } }), 750);
    } catch (err) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      setError(err.message?.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '') || 'Google signup failed');
    } finally { setLoading(false); }
  };

  // Stagger configurations for animation
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="auth-page">
      <motion.div
        className={`auth-card glass-panel ${shouldShake ? 'shake-animation' : ''}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="auth-header" variants={itemVariants}>
          <div className="auth-logo-ring">
            <UserPlus size={28} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join your student portal</p>
        </motion.div>
        
        {error && <motion.div className="auth-error" variants={itemVariants}>{error}</motion.div>}
        
        <form onSubmit={handleSignup} className="auth-form">
          <motion.div className="input-group" variants={itemVariants}>
            <User size={18} className="input-icon" />
            <input className="auth-input" placeholder="Username (unique)" value={username} onChange={e => setUsername(e.target.value)} required />
          </motion.div>
          
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <motion.div className="input-group" variants={itemVariants} style={{ flex: 1, marginBottom: 0 }}>
              <User size={18} className="input-icon" />
              <input className="auth-input" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            </motion.div>
            <motion.div className="input-group" variants={itemVariants} style={{ flex: 1, marginBottom: 0 }}>
              <User size={18} className="input-icon" />
              <input className="auth-input" placeholder="Surname" value={surname} onChange={e => setSurname(e.target.value)} required />
            </motion.div>
          </div>
          
          <motion.div className="input-group" variants={itemVariants}>
            <Mail size={18} className="input-icon" />
            <input type="email" className="auth-input" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
          </motion.div>
          
          <motion.div className="input-group" variants={itemVariants}>
            <Lock size={18} className="input-icon" />
            <input type={showPw ? 'text' : 'password'} className="auth-input" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" className="input-toggle" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </motion.div>
          
          <motion.div className="input-group" variants={itemVariants}>
            <Lock size={18} className="input-icon" />
            <input type={showPw ? 'text' : 'password'} className="auth-input" placeholder="Confirm Password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
          </motion.div>
          
          <motion.button type="submit" className="btn btn-primary btn-full" disabled={loading} variants={itemVariants}>
            <UserPlus size={18} /> {loading ? 'Creating...' : 'Create Account'}
          </motion.button>
        </form>
        
        <motion.div className="auth-divider" variants={itemVariants}><span>or</span></motion.div>
        
        <motion.button className="btn btn-google btn-full" onClick={handleGoogle} disabled={loading} variants={itemVariants}>
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '6px' }}><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign up with Google
        </motion.button>
        
        <motion.p className="auth-switch" variants={itemVariants}>Already have an account? <Link to="/login">Login</Link></motion.p>
      </motion.div>
    </div>
  );
};
export default SignupPage;
