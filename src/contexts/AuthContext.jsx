import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, sendPasswordResetEmail, updatePassword } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (user) => {
    if (!user) { setUserProfile(null); return null; }
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) { const p = snap.data(); setUserProfile(p); return p; }
      return null;
    } catch (e) { console.error('Fetch profile err:', e); return null; }
  };

  const saveProfile = async (profileData) => {
    if (!currentUser) return;
    const data = { ...profileData, uid: currentUser.uid, updatedAt: new Date().toISOString() };
    try {
      await setDoc(doc(db, 'users', currentUser.uid), data, { merge: true });
    } catch (e) { console.warn('Firestore save failed, using local:', e.message); }
    localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify({ ...userProfile, ...data }));
    setUserProfile(prev => ({ ...prev, ...data }));
  };

  const saveTimetable = async (timetableData, selectedCourses) => {
    if (!currentUser) return;
    const courses = selectedCourses.map(c => ({ code: c.code, title: c.title, credits: c.credits, instructor: c.instructor, slots: c.slots }));
    try {
      await setDoc(doc(db, 'users', currentUser.uid), { timetable: timetableData, selectedCourses: courses, timetableUpdatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) { console.warn('Firestore timetable save failed:', e.message); }
    setUserProfile(prev => ({ ...prev, timetable: timetableData, selectedCourses: courses }));
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

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  const changePassword = (pw) => updatePassword(currentUser, pw);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) await fetchProfile(user);
      else setUserProfile(null);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, login, signup, loginWithGoogle, logout, resetPassword, changePassword, saveProfile, saveTimetable, fetchProfile, lookupEmailByUsername, checkUsernameAvailable }}>
      {children}
    </AuthContext.Provider>
  );
};
