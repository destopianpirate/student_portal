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
    // Run Firestore save in background so it doesn't block UI state changes
    setDoc(doc(db, 'users', currentUser.uid), data, { merge: true }).catch(e => {
      console.warn('Firestore save failed, using local:', e.message);
    });
  };

  const saveTimetable = async (timetableData, selectedCourses) => {
    if (!currentUser) return;
    const courses = selectedCourses.map(c => ({ code: c.code, title: c.title, credits: c.credits, instructor: c.instructor, slots: c.slots }));
    const updatedProfile = { ...userProfile, timetable: timetableData, selectedCourses: courses };
    localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(updatedProfile));
    setUserProfile(updatedProfile);
    if (currentUser.isDemo) return;
    // Run Firestore save in background so it doesn't block UI state changes
    setDoc(doc(db, 'users', currentUser.uid), { timetable: timetableData, selectedCourses: courses, timetableUpdatedAt: new Date().toISOString() }, { merge: true }).catch(e => {
      console.warn('Firestore timetable save failed:', e.message);
    });
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
      trackLogin(result.user).catch(e => console.warn('trackLogin failed:', e.message));
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
      trackLogin(result.user).catch(e => console.warn('trackLogin failed:', e.message));
      return result;
    };

  const loginAsDemo = () => {
    const demoUser = {
      uid: 'demo_user_id',
      email: 'singh.ayush@iitgn.ac.in',
      displayName: 'Ayush Singh',
      emailVerified: true,
      isDemo: true
    };
    const demoProfile = {
      uid: 'demo_user_id',
      name: 'Ayush Singh',
      username: 'singh.ayush',
      rollNumber: '23110001',
      programme: 'B.Tech',
      branch: 'Computer Science & Engineering',
      yearOfAdmission: 2024,
      currentYear: '2nd Year',
      semester: 'Semester 3',
      avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Ayush',
      phone: '+91 98765 43210',
      gmail: 'singh.ayush.personal@gmail.com',
      github: 'https://github.com/singh-ayush',
      linkedin: 'https://linkedin.com/in/singh-ayush',
      instagram: 'https://instagram.com/singh-ayush',
      privacy: { phone: false, email: false, social: true },
      notifications: { email: true, push: false, updates: true },
      preferences: { librarySeat: 'A-12', defaultView: 'Grid', accent: 'indigo' },
      isDemo: true
    };

    const demoGrades = [
      {
        id: 1,
        name: 'Semester 1',
        courses: [
          { id: 101, name: 'CS 101 - Introduction to Computing', credits: 4, grade: 'A-' },
          { id: 102, name: 'MA 101 - Calculus', credits: 4, grade: 'B' },
          { id: 103, name: 'PH 101 - Physics I', credits: 4, grade: 'B-' },
          { id: 104, name: 'HS 101 - English Communication', credits: 3, grade: 'A' },
          { id: 105, name: 'CE 101 - Engineering Graphics', credits: 3, grade: 'B' },
          { id: 106, name: 'CH 101 - General Chemistry', credits: 3, grade: 'B' }
        ]
      },
      {
        id: 2,
        name: 'Semester 2',
        courses: [
          { id: 201, name: 'CS 102 - Data Structures', credits: 3, grade: 'A-' },
          { id: 202, name: 'MA 102 - Linear Algebra', credits: 3, grade: 'B' },
          { id: 203, name: 'PH 102 - Physics II', credits: 3, grade: 'B' },
          { id: 204, name: 'EE 101 - Introduction to Electrical Engineering', credits: 3, grade: 'B' },
          { id: 205, name: 'ME 101 - Engineering Mechanics', credits: 3, grade: 'B' },
          { id: 206, name: 'HS 102 - Professional Ethics', credits: 3, grade: 'B-' },
          { id: 207, name: 'CH 102 - Chemistry Lab', credits: 2, grade: 'A' },
          { id: 208, name: 'PH 103 - Physics Lab', credits: 2, grade: 'B-' }
        ]
      }
    ];

    const demoCourses = [
      { id: 301, code: 'CS 201', title: 'Data Structures and Algorithms', credits: 4, slots: [{ day: 'Monday', time: '09:00 – 10:30', venue: 'LHC-101' }, { day: 'Wednesday', time: '09:00 – 10:30', venue: 'LHC-101' }] },
      { id: 302, code: 'CS 202', title: 'Discrete Mathematics', credits: 4, slots: [{ day: 'Tuesday', time: '10:30 – 12:00', venue: 'LHC-102' }, { day: 'Thursday', time: '10:30 – 12:00', venue: 'LHC-102' }] },
      { id: 303, code: 'EE 201', title: 'Signals and Systems', credits: 4, slots: [{ day: 'Monday', time: '14:00 – 15:30', venue: 'LHC-103' }, { day: 'Wednesday', time: '14:00 – 15:30', venue: 'LHC-103' }] },
      { id: 304, code: 'MA 201', title: 'Differential Equations', credits: 3, slots: [{ day: 'Tuesday', time: '09:00 – 10:00', venue: 'LHC-104' }, { day: 'Friday', time: '09:00 – 10:00', venue: 'LHC-104' }] },
      { id: 305, code: 'HS 201', title: 'Sociology & Technology', credits: 3, slots: [{ day: 'Wednesday', time: '11:00 – 12:00', venue: 'LHC-105' }, { day: 'Friday', time: '11:00 – 12:00', venue: 'LHC-105' }] },
      { id: 306, code: 'CS 291', title: 'Programming Laboratory', credits: 3, slots: [{ day: 'Thursday', time: '14:00 – 17:00', venue: 'CC-Lab' }] }
    ];

    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    localStorage.setItem(`profile_${demoUser.uid}`, JSON.stringify(demoProfile));
    localStorage.setItem(`grades_${demoUser.uid}`, JSON.stringify(demoGrades));
    localStorage.setItem(`courses_${demoUser.uid}`, JSON.stringify(demoCourses));
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
        fetchProfile(user).catch(e => console.warn('fetchProfile failed:', e.message));
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
