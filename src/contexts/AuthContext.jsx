import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification, updateEmail as firebaseUpdateEmail, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, arrayUnion } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const demo = localStorage.getItem('demo_user');
      if (demo) return JSON.parse(demo);
      const cached = localStorage.getItem('cached_firebase_user');
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error('Error reading cached user:', e);
    }
    return null;
  });

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const session = localStorage.getItem('demo_user') || localStorage.getItem('cached_firebase_user');
      if (session) {
        const parsed = JSON.parse(session);
        const profile = localStorage.getItem(`profile_${parsed.uid}`);
        if (profile) return JSON.parse(profile);
      }
    } catch (e) {
      console.error('Error reading cached profile:', e);
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  // Derived role state
  const userRole = userProfile?.role || 'student';
  const isAdmin = userRole === 'admin';

  const fetchProfile = async (user) => {
    if (!user) { setUserProfile(null); return null; }
    let cachedProfile = null;
    try {
      const local = localStorage.getItem(`profile_${user.uid}`);
      if (local) {
        cachedProfile = JSON.parse(local);
        setUserProfile(cachedProfile);
      }
    } catch (err) {
      console.error('Local profile parse err:', err);
    }
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const p = snap.data();
        setUserProfile(p);
        localStorage.setItem(`profile_${user.uid}`, JSON.stringify(p));
        return p;
      }
    } catch (e) {
      console.error('Fetch profile err:', e);
    }
    return cachedProfile;
  };

  const saveProfile = async (profileData) => {
    if (!currentUser) return;
    const data = { ...profileData, uid: currentUser.uid, updatedAt: new Date().toISOString() };
    const updatedProfile = { ...userProfile, ...data };
    localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(updatedProfile));
    setUserProfile(updatedProfile);
    if (currentUser.isDemo) return;
    try {
      await setDoc(doc(db, 'users', currentUser.uid), data, { merge: true });
    } catch (e) {
      console.warn('Firestore save failed, using local:', e.message);
    }
  };

  const saveTimetable = async (timetableData, selectedCourses) => {
    if (!currentUser) return;
    const courses = selectedCourses.map(c => ({ code: c.code, title: c.title, credits: c.credits, instructor: c.instructor, slots: c.slots }));
    const updatedProfile = { ...userProfile, timetable: timetableData, selectedCourses: courses };
    localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(updatedProfile));
    setUserProfile(updatedProfile);
    if (currentUser.isDemo) return;
    try {
      await setDoc(doc(db, 'users', currentUser.uid), { timetable: timetableData, selectedCourses: courses, timetableUpdatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Firestore timetable save failed:', e.message);
    }
  };

  const lookupEmailByUsername = async (username) => {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('No account found with that username');
    return snap.docs[0].data().email || snap.docs[0].data().gmail;
  };

  const checkUsernameAvailable = async (username) => {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const snap = await getDocs(q);
    return snap.empty;
  };

  // --- Session tracking helper ---
  const trackLogin = async (user) => {
    if (!user) return;
    const sessionEntry = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent?.substring(0, 120) || 'Unknown',
      platform: navigator.platform || 'Unknown',
    };
    try {
      await setDoc(doc(db, 'users', user.uid), {
        lastLoginAt: new Date().toISOString(),
        loginHistory: arrayUnion(sessionEntry),
      }, { merge: true });
    } catch (e) {
      console.warn('Session tracking failed:', e.message);
    }
  };

  // --- Auth methods ---
    const login = async (email, password) => {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const simplifiedUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        emailVerified: result.user.emailVerified
      };
      localStorage.setItem('cached_firebase_user', JSON.stringify(simplifiedUser));
      await trackLogin(result.user);
      return result;
    };
  
    const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  
    const loginWithGoogle = async () => {
      const result = await signInWithPopup(auth, googleProvider);
      const simplifiedUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        emailVerified: result.user.emailVerified
      };
      localStorage.setItem('cached_firebase_user', JSON.stringify(simplifiedUser));
      await trackLogin(result.user);
      return result;
    };

  const loginAsDemo = () => {
    const demoUser = {
      uid: 'demo_user_id',
      email: 'demo@iitgn.ac.in',
      displayName: 'Demo Student',
      emailVerified: true,
      isDemo: true
    };
    const demoProfile = {
      uid: 'demo_user_id',
      name: 'Demo Student',
      username: 'demo',
      rollNumber: '22110001',
      programme: 'BTech',
      branch: 'Computer Science and Engineering',
      yearOfAdmission: 2022,
      currentYear: '3rd Year',
      semester: 'Semester 6',
      avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=demo',
      phone: '+91 98765 43210',
      gmail: 'demo.personal@gmail.com',
      github: 'https://github.com/demo-student',
      linkedin: 'https://linkedin.com/in/demo-student',
      instagram: 'https://instagram.com/demo-student',
      privacy: { phone: false, email: false, social: true },
      notifications: { email: true, push: false, updates: true },
      preferences: { librarySeat: 'A-12', defaultView: 'Grid' },
      isDemo: true
    };
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    localStorage.setItem(`profile_${demoUser.uid}`, JSON.stringify(demoProfile));
    setCurrentUser(demoUser);
    setUserProfile(demoProfile);
  };

  const logout = async () => {
    localStorage.removeItem('demo_user');
    localStorage.removeItem('cached_firebase_user');
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  const changePassword = (pw) => updatePassword(currentUser, pw);

  // --- New enhanced methods ---
  const reauthenticate = async (password) => {
    if (!currentUser || !currentUser.email) throw new Error('No user signed in');
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    return reauthenticateWithCredential(currentUser, credential);
  };

  const sendVerificationEmail = () => {
    if (!currentUser) throw new Error('No user signed in');
    return sendEmailVerification(currentUser);
  };

  const updateUserEmail = async (newEmail) => {
    if (!currentUser) throw new Error('No user signed in');
    return firebaseUpdateEmail(currentUser, newEmail);
  };

  const deleteAccount = async () => {
    if (!currentUser) throw new Error('No user signed in');
    localStorage.removeItem(`profile_${currentUser.uid}`);
    localStorage.removeItem(`courses_${currentUser.uid}`);
    localStorage.removeItem(`timetable_${currentUser.uid}`);
    localStorage.removeItem('demo_user');
    return deleteUser(currentUser);
  };

  const downloadUserData = () => {
    if (!userProfile) return;
    const data = {
      profile: userProfile,
      exportedAt: new Date().toISOString(),
      email: currentUser?.email,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-portal-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const simplifiedUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        };
        // Always overwrite cache so stale emails never persist
        const oldCached = localStorage.getItem('cached_firebase_user');
        if (oldCached) {
          try {
            const prev = JSON.parse(oldCached);
            if (prev.uid !== user.uid) {
              // Different user — clear old profile cache
              localStorage.removeItem(`profile_${prev.uid}`);
            }
          } catch {}
        }
        localStorage.setItem('cached_firebase_user', JSON.stringify(simplifiedUser));
        setCurrentUser(user);
        await fetchProfile(user);
      } else {
        localStorage.removeItem('cached_firebase_user');
        const localDemo = localStorage.getItem('demo_user');
        if (localDemo) {
          const parsedUser = JSON.parse(localDemo);
          setCurrentUser(parsedUser);
          const cachedProfile = localStorage.getItem(`profile_${parsedUser.uid}`);
          if (cachedProfile) {
            setUserProfile(JSON.parse(cachedProfile));
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser, userProfile, loading,
      userRole, isAdmin,
      login, signup, loginWithGoogle, loginAsDemo, logout,
      resetPassword, changePassword,
      saveProfile, saveTimetable, fetchProfile,
      lookupEmailByUsername, checkUsernameAvailable,
      reauthenticate, sendVerificationEmail, updateUserEmail,
      deleteAccount, downloadUserData,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
