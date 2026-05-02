import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import TimetablePage from './pages/TimetablePage';
import ExplorePage from './pages/ExplorePage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile-setup" element={<ProfileSetupPage />} />
          <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/settings" element={<SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
