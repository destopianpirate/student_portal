import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Moon, Sun, LogOut, Shield, Save, Camera, Link2, GraduationCap, Mail, Phone, Globe, Bell, Book, Download, Trash2, Info, ChevronRight, ChevronDown, Upload, CheckCircle2, CreditCard, QrCode, Home, Hash, Award, Eye, X, Calendar, Grid, RotateCw, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { jsPDF } from 'jspdf';
import { getAvatarUrl, getPhotoPosition, convertGDriveUrl, compressImageToBase64 } from '../utils/avatarUtils';
import { scanQrCodeFromFile, generateVectorQrCode } from '../utils/qrUtils';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { createPortal } from 'react-dom';

const PROGRAMME_BRANCHES = {
  'B.Tech': [
    'Artificial Intelligence',
    'Chemical Engineering',
    'Civil Engineering',
    'Computer Science & Engineering',
    'Electrical Engineering',
    'Integrated Circuit Design & Technology',
    'Materials Engineering',
    'Mechanical Engineering'
  ],
  'M.Tech': [
    'Biological Engineering',
    'Chemical Engineering',
    'Civil Engineering',
    'Computer Science & Engineering',
    'Artificial Intelligence',
    'Earth System Science',
    'Electrical Engineering',
    'Integrated Circuit Design & Technology',
    'Mechanical Engineering',
    'Materials Engineering',
    'Maritime Engineering'
  ],
  'M.Sc.': [
    'Chemistry',
    'Mathematics',
    'Physics',
    'Cognitive Science'
  ],
  'M.A.': [
    'Society and Culture'
  ],
  'Masters of Design (M.Des)': [
    'M.Des in Integrated Design & Technology'
  ],
  'Ph.D.': [
    'Biological Engineering',
    'Chemical Engineering',
    'Chemistry',
    'Civil Engineering',
    'Cognitive Science',
    'Computer Science and Engineering',
    'Artificial Intelligence',
    'Earth Sciences',
    'Archaeological Sciences',
    'Electrical Engineering',
    'Integrated Circuit Design and Technology',
    'Humanities & Social Sciences',
    'Materials Engineering',
    'Mathematics',
    'Mechanical Engineering',
    'Maritime Engineering',
    'Design',
    'Physics'
  ]
};
const PROGRAMMES = Object.keys(PROGRAMME_BRANCHES);
const AVATAR_SEEDS = ['Felix','Aneka','Milo','Luna','Pepper','Oscar','Bella','Shadow','Simba','Nala','Oreo','Coco','Buddy','Daisy','Max','Ruby','Charlie','Olive','Leo','Willow'];

const applyThemeAccent = (accent) => {
  const root = document.documentElement;
  const presets = {
    indigo: { primary: '#6366f1', hover: '#4f46e5', accent: '#ec4899' },
    emerald: { primary: '#10b981', hover: '#059669', accent: '#3b82f6' },
    purple: { primary: '#a855f7', hover: '#9333ea', accent: '#f43f5e' },
    orange: { primary: '#f59e0b', hover: '#d97706', accent: '#10b981' },
    pink: { primary: '#ec4899', hover: '#db2777', accent: '#8b5cf6' },
    blue: { primary: '#0284c7', hover: '#0369a1', accent: '#f59e0b' }
  };
  const selected = presets[accent] || presets.indigo;
  root.style.setProperty('--primary', selected.primary);
  root.style.setProperty('--primary-hover', selected.hover);
  root.style.setProperty('--accent', selected.accent);
  localStorage.setItem('theme_accent', accent);
};

const GRADE_POINTS = {
  'A+': 11, 'A': 10, 'A-': 9, 'AB': 8, 'B-': 7, 'BC': 6,
  'C-': 5, 'CD': 4, 'E': 2, 'F': 0, 'I': null, 'W': null,
};

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
};

const SettingsPage = ({ darkMode, setDarkMode }) => {
  const { currentUser, userProfile, logout, saveProfile } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [importPreview, setImportPreview] = useState(null);

  const [form, setForm] = useState({
    name: '', firstName: '', surname: '', username: '', rollNumber: '', programme: '', branch: '',
    yearOfAdmission: '', avatarUrl: '', customPhotoUrl: '', profilePhotoBase64: '',
    photoPositionX: 50, photoPositionY: 50,
    photoZoom: 100, photoRotation: 0, photoAspectRatio: 'card',
    github: '', instagram: '', linkedin: '', phone: '', gmail: '',
    cgpa: '', minor: '', hostelName: '', roomNumber: '',
    messQrBase64: '', studentIdBase64: '',
    privacy: { phone: false, email: false, social: true },
    notifications: { email: true, push: false, updates: true },
    preferences: { librarySeat: '', defaultView: 'List', accent: 'indigo' }
  });
  const [initialForm, setInitialForm] = useState(null);

  const [activePhotoTab, setActivePhotoTab] = useState('upload'); // 'upload', 'gdrive', 'dicebear'
  const [openSection, setOpenSection] = useState(location.state?.openSection || null); // null = all closed

  const toggleSection = (id) => setOpenSection(prev => prev === id ? null : id);

  useEffect(() => {
    if (location.state?.openSection) {
      setOpenSection(location.state.openSection);
    }
  }, [location.state]);

  useEffect(() => {
    if (userProfile) {
      const parts = (userProfile.name || '').trim().split(/\s+/);
      const loadedForm = {
        name: userProfile.name || '',
        firstName: userProfile.firstName || parts[0] || '',
        surname: userProfile.surname || parts.slice(1).join(' ') || '',
        username: userProfile.username || '',
        rollNumber: userProfile.rollNumber || '', programme: userProfile.programme || '',
        branch: userProfile.branch || '', yearOfAdmission: userProfile.yearOfAdmission || '',
        avatarUrl: userProfile.avatarUrl || '',
        customPhotoUrl: userProfile.customPhotoUrl || '',
        profilePhotoBase64: userProfile.profilePhotoBase64 || '',
        photoPositionX: userProfile.photoPositionX ?? 50,
        photoPositionY: userProfile.photoPositionY ?? 50,
        photoZoom: userProfile.photoZoom ?? 100,
        photoRotation: userProfile.photoRotation ?? 0,
        photoAspectRatio: userProfile.photoAspectRatio || 'card',
        github: userProfile.github || '', instagram: userProfile.instagram || '',
        linkedin: userProfile.linkedin || '', phone: userProfile.phone || '', gmail: userProfile.gmail || '',
        cgpa: userProfile.cgpa || '', minor: userProfile.minor || '',
        hostelName: userProfile.hostelName || '', roomNumber: userProfile.roomNumber || '',
        messQrBase64: userProfile.messQrBase64 || '', studentIdBase64: userProfile.studentIdBase64 || '',
        privacy: userProfile.privacy || { phone: false, email: false, social: true },
        notifications: userProfile.notifications || { email: true, push: false, updates: true },
        preferences: {
          librarySeat: userProfile.preferences?.librarySeat || '',
          defaultView: userProfile.preferences?.defaultView || 'List',
          accent: userProfile.preferences?.accent || 'indigo'
        }
      };
      setForm(loadedForm);
      setInitialForm(loadedForm);
      if (userProfile.profilePhotoBase64) setActivePhotoTab('upload');
      else if (userProfile.customPhotoUrl) setActivePhotoTab('upload');
      else setActivePhotoTab('dicebear');
    }
  }, [userProfile]);

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const updateNested = (category, key, val) => setForm(p => ({ ...p, [category]: { ...p[category], [key]: val } }));

  const currentYear = new Date().getFullYear();
  const admissionYears = Array.from({ length: 7 }, (_, i) => currentYear - i);

  const handleSave = async () => {
    try {
      setSaving(true);
      const yoa = parseInt(form.yearOfAdmission);
      const diff = currentYear - yoa;
      const month = new Date().getMonth();
      const yr = diff + 1;
      const sem = (diff * 2) + (month >= 6 ? 2 : 1);
      const ord = ['th','st','nd','rd'];
      const v = yr % 100;
      const suffix = ord[(v - 20) % 10] || ord[v] || ord[0];

      const updatedFields = {
        ...form,
        yearOfAdmission: yoa || form.yearOfAdmission,
        currentYear: yoa ? `${yr}${suffix} Year` : (userProfile?.currentYear || ''),
        semester: yoa ? `Semester ${sem}` : (userProfile?.semester || ''),
      };

      saveProfile(updatedFields);
      setForm(updatedFields);
      setInitialForm(updatedFields);

      setSaved(true);
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#f472b6', '#34d399']
      });
      setOpenSection(null);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (initialForm) {
      setForm(initialForm);
      if (initialForm.profilePhotoBase64) setActivePhotoTab('upload');
      else if (initialForm.customPhotoUrl) setActivePhotoTab('upload');
      else setActivePhotoTab('dicebear');
    }
    setOpenSection(null);
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const handleDownloadData = () => {
    if (!userProfile) return;
    try {
      const notes = JSON.parse(localStorage.getItem('student_notes') || '[]');
      const events = JSON.parse(localStorage.getItem('custom_events') || '[]');
      const certificates = JSON.parse(localStorage.getItem('student_certificates') || '[]');
      const projects = JSON.parse(localStorage.getItem('student_projects') || '[]');
      const rawGrades = JSON.parse(localStorage.getItem(`grades_${currentUser.uid}`) || '[]');
      const timetableCourses = JSON.parse(localStorage.getItem(`courses_${currentUser.uid}`) || '[]');
      
      // Reconcile/sync running semester courses from timetable to grades before export
      const runningSemName = userProfile.semester;
      let finalGrades = [...rawGrades];
      if (runningSemName) {
        const savedCoursesJSON = localStorage.getItem(`courses_${currentUser.uid}`);
        const timetableCoursesList = savedCoursesJSON ? JSON.parse(savedCoursesJSON) : (userProfile.selectedCourses || []);
        
        const exists = finalGrades.some(sem => sem.name === runningSemName);
        if (!exists) {
          finalGrades.push({ id: Date.now(), name: runningSemName, courses: [], isSynced: true });
        }
        
        finalGrades = finalGrades.map(sem => {
          if (sem.name === runningSemName) {
            const syncedCourses = timetableCoursesList.map(tc => {
              const fullName = `${tc.code} - ${tc.title}`;
              const existing = sem.courses?.find(c => c.name === fullName || c.name.startsWith(tc.code));
              return {
                id: existing?.id || tc.id || Date.now() + Math.random(),
                name: fullName,
                credits: parseInt(tc.credits) || 0,
                grade: '' // Clear/ensure empty grade for running semester
              };
            });
            return { ...sem, courses: syncedCourses, isSynced: true };
          }
          return sem;
        });
        
        finalGrades.sort((a, b) => {
          const numA = parseInt(a.name.match(/\d+/)?.[0] || 0);
          const numB = parseInt(b.name.match(/\d+/)?.[0] || 0);
          return numA - numB;
        });
      }
      
      const fullBackup = {
        collegeEmail: currentUser?.email || '',
        profile: userProfile,
        notes: notes,
        customEvents: events,
        certificates: certificates,
        projects: projects,
        grades: finalGrades,
        timetableCourses: timetableCourses,
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
        portal: "StudentOS"
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${userProfile.username || 'student'}_profile_backup.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addNotification('success', 'Backup Exported', 'All profile details, notes, calendar events, projects, and grades downloaded in JSON.');
    } catch (e) {
      console.error('JSON export failed:', e);
      alert('Failed to export profile details.');
    }
  };

  const handleExportPDF = async () => {
    if (!userProfile) return;
    try {
      const doc = new jsPDF();
      const profile = userProfile;
      const notes = JSON.parse(localStorage.getItem('student_notes') || '[]');
      const events = JSON.parse(localStorage.getItem('custom_events') || '[]');
      const certificates = JSON.parse(localStorage.getItem('student_certificates') || '[]');
      const projects = JSON.parse(localStorage.getItem('student_projects') || '[]');
      const rawGrades = JSON.parse(localStorage.getItem(`grades_${currentUser.uid}`) || '[]');

      // Reconcile/sync running semester courses from timetable to grades before export
      const runningSemName = profile.semester;
      let finalGrades = [...rawGrades];
      if (runningSemName) {
        const savedCoursesJSON = localStorage.getItem(`courses_${currentUser.uid}`);
        const timetableCoursesList = savedCoursesJSON ? JSON.parse(savedCoursesJSON) : (profile.selectedCourses || []);
        
        const exists = finalGrades.some(sem => sem.name === runningSemName);
        if (!exists) {
          finalGrades.push({ id: Date.now(), name: runningSemName, courses: [], isSynced: true });
        }
        
        finalGrades = finalGrades.map(sem => {
          if (sem.name === runningSemName) {
            const syncedCourses = timetableCoursesList.map(tc => {
              const fullName = `${tc.code} - ${tc.title}`;
              const existing = sem.courses?.find(c => c.name === fullName || c.name.startsWith(tc.code));
              return {
                id: existing?.id || tc.id || Date.now() + Math.random(),
                name: fullName,
                credits: parseInt(tc.credits) || 0,
                grade: '' // Clear/ensure empty grade for running semester
              };
            });
            return { ...sem, courses: syncedCourses, isSynced: true };
          }
          return sem;
        });
        
        finalGrades.sort((a, b) => {
          const numA = parseInt(a.name.match(/\d+/)?.[0] || 0);
          const numB = parseInt(b.name.match(/\d+/)?.[0] || 0);
          return numA - numB;
        });
      }

      // Load IITGN Logo
      let logoImg = null;
      try {
        logoImg = await loadImage('/IITGN-5.png');
      } catch (e) {
        console.warn('Failed to load IITGN logo:', e);
      }

      // Helper for page breaks
      let y = 45;
      const checkPageBreak = (heightNeeded) => {
        if (y + heightNeeded > 275) {
          doc.addPage();
          y = 20;
          return true;
        }
        return false;
      };

      // Set styling variables - Premium White Header with Orange Saffron Top Accent Bar
      doc.setFillColor(255, 153, 51); // IITGN Orange Saffron
      doc.rect(0, 0, 210, 4, 'F');

      if (logoImg) {
        doc.addImage(logoImg, 'PNG', 15, 8, 22, 22);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59); // Slate 800
        doc.text("Indian Institute of Technology Gandhinagar", 42, 16);
        
        doc.setFontSize(10.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(99, 102, 241); // Indigo
        doc.text("STUDENT PROFILE & ACADEMIC PORTFOLIO", 42, 22);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139); // Slate 500
        doc.text(`Academic Session: ${new Date().getFullYear()}-${new Date().getFullYear()+1}   |   Report Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 42, 27);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text("StudentOS — Academic Profile Report", 15, 18);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 15, 25);
      }

      // Divider line
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setLineWidth(0.5);
      doc.line(15, 33, 195, 33);

      const drawSectionHeader = (title, num) => {
        checkPageBreak(25);
        doc.setFillColor(241, 245, 249); // Slate 100 Background Pill
        doc.rect(15, y, 180, 8, 'F');
        doc.setFillColor(99, 102, 241); // Indigo Left Border Bar
        doc.rect(15, y, 3, 8, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(`${num}. ${title.toUpperCase()}`, 22, y + 5.8);
        y += 13;
      };

      // Helper to draw single-column row
      const drawLeftRow = (label, val, hasPhotoOpt) => {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 35, 7, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(15, y, 35, 7, 'S');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(label, 18, y + 4.8);

        doc.setFillColor(255, 255, 255);
        doc.rect(50, y, hasPhotoOpt ? 105 : 145, 7, 'F');
        doc.rect(50, y, hasPhotoOpt ? 105 : 145, 7, 'S');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(String(val || 'N/A'), 53, y + 4.8);
        y += 7;
      };

      // Helper to draw full-width two-column rows
      const drawFullRow = (label1, val1, label2, val2) => {
        // Label 1
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 35, 7, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(15, y, 35, 7, 'S');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(label1, 18, y + 4.8);

        // Value 1
        doc.setFillColor(255, 255, 255);
        doc.rect(50, y, 55, 7, 'F');
        doc.rect(50, y, 55, 7, 'S');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(String(val1 || 'N/A'), 53, y + 4.8);

        // Label 2
        doc.setFillColor(248, 250, 252);
        doc.rect(105, y, 35, 7, 'F');
        doc.rect(105, y, 35, 7, 'S');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(label2, 108, y + 4.8);

        // Value 2
        doc.setFillColor(255, 255, 255);
        doc.rect(140, y, 55, 7, 'F');
        doc.rect(140, y, 55, 7, 'S');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(String(val2 || 'N/A'), 143, y + 4.8);

        y += 7;
      };

      // 1. STUDENT INFORMATION (with Profile Photo if available)
      drawSectionHeader("Student Information", "1");
      
      let hasPhoto = false;
      let photoY = y;
      if (profile.profilePhotoBase64) {
        try {
          doc.addImage(profile.profilePhotoBase64, 'PNG', 160, photoY, 35, 35);
          doc.setDrawColor(99, 102, 241);
          doc.setLineWidth(0.5);
          doc.rect(159.5, photoY - 0.5, 36, 36, 'S');
          hasPhoto = true;
        } catch (e) {
          console.warn('Failed to render profile photo in PDF:', e);
        }
      }

      drawLeftRow("Full Name", profile.name || `${profile.firstName || ''} ${profile.surname || ''}`.trim(), hasPhoto);
      drawLeftRow("Roll Number", profile.rollNumber, hasPhoto);
      drawLeftRow("College Email", currentUser?.email, hasPhoto);
      drawLeftRow("Programme", profile.programme, hasPhoto);
      drawLeftRow("Branch/Department", profile.branch, hasPhoto);

      if (hasPhoto && y < photoY + 35) {
        y = photoY + 35;
      }

      y += 2;
      checkPageBreak(30);
      drawFullRow("Admission Year", profile.yearOfAdmission, "Current Year", profile.currentYear);
      drawFullRow("Active Semester", profile.semester, "Cumulative GPA", profile.cgpa);
      drawFullRow("Minor Focus", profile.minor, "Hostel & Room", `${profile.hostelName || 'N/A'}, Room ${profile.roomNumber || 'N/A'}`);
      y += 4;

      // 2. CONTACT DETAILS
      drawSectionHeader("Contact & Connection Channels", "2");
      drawFullRow("Personal Contact", profile.phone, "Personal Email", profile.gmail);
      drawFullRow("GitHub Username", profile.github, "LinkedIn ID", profile.linkedin);
      
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, 35, 7, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, y, 35, 7, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text("Instagram Handle", 18, y + 4.8);

      doc.setFillColor(255, 255, 255);
      doc.rect(50, y, 145, 7, 'F');
      doc.rect(50, y, 145, 7, 'S');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(String(profile.instagram || 'N/A'), 53, y + 4.8);
      y += 12;

      // 3. RUNNING SEMESTER & REGISTERED COURSES
      drawSectionHeader("Running Semester & Registered Courses", "3");

      const runningSemObj = finalGrades.find(sem => sem.name === runningSemName);
      if (!runningSemObj || !runningSemObj.courses || runningSemObj.courses.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(100, 116, 139);
        doc.text("No registered courses found for the running semester (sync via Timetable Generator).", 18, y);
        y += 10;
      } else {
        const totalSemCredits = runningSemObj.courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
        
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 8, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(15, y, 180, 8, 'S');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(99, 102, 241);
        doc.text(`${runningSemObj.name}`, 18, y + 5.5);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Courses Selected: ${runningSemObj.courses.length}   |   Total Registered Credits: ${totalSemCredits}   |   SPI: — (In Progress)`, 60, y + 5.5);
        y += 12;

        // Table Header
        doc.setFillColor(99, 102, 241); // Indigo
        doc.rect(15, y, 110, 7, 'F');
        doc.rect(125, y, 35, 7, 'F');
        doc.rect(160, y, 35, 7, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text("Course Details", 18, y + 4.8);
        doc.text("Credits", 130, y + 4.8);
        doc.text("Status", 165, y + 4.8);
        
        y += 7;

        runningSemObj.courses.forEach(course => {
          checkPageBreak(8);
          
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(226, 232, 240);
          doc.rect(15, y, 110, 7, 'F');
          doc.rect(15, y, 110, 7, 'S');
          doc.rect(125, y, 35, 7, 'F');
          doc.rect(125, y, 35, 7, 'S');
          doc.rect(160, y, 35, 7, 'F');
          doc.rect(160, y, 35, 7, 'S');
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text(course.name || 'Unnamed Course', 18, y + 4.8);
          
          doc.setFont('helvetica', 'bold');
          doc.text(String(course.credits || 0), 130, y + 4.8);
          
          doc.setTextColor(99, 102, 241);
          doc.text("In Progress", 165, y + 4.8);
          y += 7;
        });
        y += 6;
      }

      // 4. COMPLETED SEMESTERS & ACADEMIC SUMMARY
      drawSectionHeader("Completed Semesters & Academic Summary", "4");

      const completedSemObjs = finalGrades.filter(sem => sem.name !== runningSemName);
      if (completedSemObjs.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(100, 116, 139);
        doc.text("No completed semesters recorded (add and manage via Academics page).", 18, y);
        y += 10;
      } else {
        completedSemObjs.forEach(sem => {
          let totalPoints = 0, totalCredits = 0;
          sem.courses.forEach(c => {
            const gp = GRADE_POINTS[c.grade];
            if (gp !== null && gp !== undefined && c.credits > 0) {
              totalPoints += gp * parseFloat(c.credits);
              totalCredits += parseFloat(c.credits);
            }
          });
          const spi = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '—';
          
          const completedCredits = sem.courses.reduce((sum, c) => {
            const gp = GRADE_POINTS[c.grade];
            return (gp !== null && gp !== undefined && gp > 0) ? sum + parseFloat(c.credits) : sum;
          }, 0);

          const neededHeight = 15 + (sem.courses.length * 7) + 12;
          checkPageBreak(neededHeight);

          doc.setFillColor(241, 245, 249);
          doc.rect(15, y, 180, 8, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.rect(15, y, 180, 8, 'S');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          doc.text(sem.name, 18, y + 5.5);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          doc.text(`Courses: ${sem.courses.length}   |   Credits Completed: ${completedCredits}   |   SPI: `, 60, y + 5.5);
          
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(16, 185, 129); // Emerald for SPI
          doc.text(spi, 145, y + 5.5);
          y += 12;

          // Table Header
          doc.setFillColor(71, 85, 105); // Slate
          doc.rect(15, y, 110, 7, 'F');
          doc.rect(125, y, 35, 7, 'F');
          doc.rect(160, y, 35, 7, 'F');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);
          doc.text("Course Name", 18, y + 4.8);
          doc.text("Credits", 130, y + 4.8);
          doc.text("Grade (GP)", 165, y + 4.8);
          y += 7;

          sem.courses.forEach(course => {
            checkPageBreak(8);
            
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(226, 232, 240);
            doc.rect(15, y, 110, 7, 'F');
            doc.rect(15, y, 110, 7, 'S');
            doc.rect(125, y, 35, 7, 'F');
            doc.rect(125, y, 35, 7, 'S');
            doc.rect(160, y, 35, 7, 'F');
            doc.rect(160, y, 35, 7, 'S');
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text(course.name || 'Unnamed Course', 18, y + 4.8);
            
            doc.setFont('helvetica', 'bold');
            doc.text(String(course.credits || 0), 130, y + 4.8);
            
            const gpVal = GRADE_POINTS[course.grade];
            const gpStr = gpVal !== null && gpVal !== undefined ? `GP: ${gpVal.toFixed(1)}` : 'GP: —';
            doc.text(`${course.grade || '—'} (${gpStr})`, 165, y + 4.8);
            y += 7;
          });
          y += 6;
        });
      }

      // 5. PROJECTS LIST
      drawSectionHeader("Academic & Personal Projects", "5");
      if (projects.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(100, 116, 139);
        doc.text("No projects tracked yet.", 18, y);
        y += 10;
      } else {
        projects.forEach(proj => {
          const desc = proj.description || '';
          const splitDesc = doc.splitTextToSize(desc, 172);
          const needed = 15 + splitDesc.length * 4.5;
          checkPageBreak(needed);

          doc.setFillColor(248, 250, 252);
          doc.rect(15, y, 180, needed - 5, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.rect(15, y, 180, needed - 5, 'S');

          doc.setFillColor(99, 102, 241);
          doc.rect(15, y, 2, needed - 5, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(30, 41, 59);
          doc.text(`${proj.title || 'Untitled Project'} (${proj.status || 'General'})`, 20, y + 5.5);
          
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`Course/Area: ${proj.course || 'Independent'}`, 20, y + 9.5);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          doc.text(splitDesc, 20, y + 14.5);

          y += needed;
        });
        y += 4;
      }

      // 6. CERTIFICATES LIST
      drawSectionHeader("Earned Certificates & Awards", "6");
      if (certificates.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(100, 116, 139);
        doc.text("No certificates recorded yet.", 18, y);
        y += 10;
      } else {
        certificates.forEach(cert => {
          checkPageBreak(25);
          
          doc.setFillColor(248, 250, 252);
          doc.rect(15, y, 180, cert.link ? 18 : 13, 'F');
          doc.rect(15, y, 180, cert.link ? 18 : 13, 'S');
          doc.setFillColor(16, 185, 129); // Emerald
          doc.rect(15, y, 2, cert.link ? 18 : 13, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(30, 41, 59);
          doc.text(`${cert.title || 'Untitled Certificate'}`, 20, y + 5.5);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          doc.text(`Issued by: ${cert.issuer || 'N/A'} on ${cert.date || 'N/A'}`, 20, y + 9.5);
          
          if (cert.link) {
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(99, 102, 241);
            doc.text(`Link: ${cert.link}`, 20, y + 14.5);
          }
          
          y += cert.link ? 23 : 18;
        });
        y += 4;
      }

      // 7. NOTES LIST
      drawSectionHeader("Student Notes Summary", "7");
      if (notes.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(100, 116, 139);
        doc.text("No notes saved.", 18, y);
        y += 10;
      } else {
        notes.slice(0, 15).forEach(note => {
          const contentStr = (note.content || '').replace(/\n/g, ' ');
          const splitPreview = doc.splitTextToSize(contentStr, 125);
          const needed = Math.max(12, splitPreview.length * 4.5 + 8);
          
          checkPageBreak(needed);
          
          doc.setFillColor(248, 250, 252);
          doc.rect(15, y, 180, needed - 3, 'F');
          doc.rect(15, y, 180, needed - 3, 'S');
          doc.setFillColor(245, 158, 11); // Amber
          doc.rect(15, y, 2, needed - 3, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          doc.text(`${note.title || 'Untitled Note'} (${note.course || 'General'}):`, 20, y + 5.5);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          doc.text(splitPreview, 65, y + 5.5);
          
          y += needed;
        });
        y += 4;
      }

      // 8. DIGITAL IDENTITY CARD & MESS QR
      doc.addPage();
      y = 20;

      drawSectionHeader("Digital Identity Documents", "8");
      
      if (profile.messQrBase64) {
        try {
          checkPageBreak(65);
          doc.setDrawColor(226, 232, 240);
          doc.setFillColor(248, 250, 252);
          doc.rect(15, y, 80, 60, 'F');
          doc.rect(15, y, 80, 60, 'S');
          
          doc.setFillColor(255, 153, 51); // saffron accent
          doc.rect(15, y, 80, 3, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(30, 41, 59);
          doc.text("MESS QR CODE", 25, y + 8);
          
          doc.addImage(profile.messQrBase64, 'PNG', 30, y + 12, 50, 45);
        } catch (e) {
          console.warn('Failed to render Mess QR in PDF:', e);
        }
      }

      if (profile.studentIdBase64) {
        try {
          doc.setDrawColor(99, 102, 241);
          doc.setFillColor(248, 250, 252);
          doc.rect(105, y, 90, 60, 'F');
          doc.rect(105, y, 90, 60, 'S');
          
          doc.setFillColor(99, 102, 241); // indigo accent
          doc.rect(105, y, 90, 3, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(30, 41, 59);
          doc.text("OFFICIAL STUDENT ID CARD", 115, y + 8);

          doc.addImage(profile.studentIdBase64, 'PNG', 110, y + 12, 80, 45);
        } catch (e) {
          console.warn('Failed to render Student ID in PDF:', e);
        }
      }
      y += 65;

      // Draw footer with page numbers
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(15, 282, 195, 282);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("IITGN StudentOS — Academic & Profile Report", 15, 287);
        doc.text(`Page ${i} of ${totalPages}`, 180, 287);
      }

      // Save the PDF
      doc.save(`${profile.firstName || 'student'}_full_profile_report.pdf`);
      addNotification('success', 'Full Report Exported', 'A beautifully formatted PDF report has been generated and saved.');
    } catch (e) {
      console.error('PDF export error:', e);
      alert('Failed to generate PDF report.');
    }
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        // Strict verification: college email must match the logged-in email
        if (importedData.collegeEmail !== currentUser?.email) {
          addNotification('error', 'Import Failed', 'College ID in the file does not match your logged-in account.');
          alert(`Import Failed: This backup file belongs to college ID "${importedData.collegeEmail || 'Unknown'}". It cannot be imported into your account (${currentUser?.email}).`);
          return;
        }

        setImportPreview(importedData);
      } catch (err) {
        console.error('Import parse error:', err);
        addNotification('error', 'Import Failed', 'Invalid backup file format.');
        alert('Import Failed: Invalid backup file format or corrupted data.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await compressImageToBase64(file, 400); // compress & convert
      update('profilePhotoBase64', base64);
      update('customPhotoUrl', '');
      update('avatarUrl', '');
    } catch (err) {
      console.error('Image compression failed', err);
      alert('Failed to process image');
    }
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setSaving(true);
      const qrText = await scanQrCodeFromFile(file);
      const vectorBase64 = await generateVectorQrCode(qrText);
      update('messQrBase64', vectorBase64);
      alert('Success! Decoded QR data and generated a clean, high-contrast black & white vector QR code.');
    } catch (err) {
      console.error('QR processing failed:', err);
      alert(err.message || 'Failed to process QR image');
    } finally {
      setSaving(false);
    }
  };

  const handleIdCardUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await compressImageToBase64(file, 600);
      update('studentIdBase64', base64);
    } catch (err) {
      console.error('ID card compression failed', err);
      alert('Failed to process ID card image');
    }
  };

  // Profile Completeness Calculation
  const completenessDetails = useMemo(() => {
    let score = 0;
    const milestones = [];

    if (form.name.trim()) { score += 15; milestones.push('Name'); }
    if (form.username.trim()) { score += 15; milestones.push('Username'); }
    if (form.rollNumber.trim()) { score += 15; milestones.push('Roll No'); }
    if (form.programme) { score += 10; milestones.push('Prog'); }
    if (form.branch) { score += 10; milestones.push('Branch'); }
    if (form.yearOfAdmission) { score += 10; milestones.push('YOA'); }
    if (form.profilePhotoBase64 || form.customPhotoUrl || form.avatarUrl) { score += 15; milestones.push('Photo'); }
    if (form.github.trim() || form.instagram.trim() || form.linkedin.trim()) { score += 5; milestones.push('Socials'); }
    if (form.phone.trim() || form.gmail.trim()) { score += 5; milestones.push('Contact'); }

    return { percent: score, milestones };
  }, [form]);

  // Security Health Calculation
  const securityHealth = useMemo(() => {
    const checks = [];
    let passedCount = 0;

    // Check 1: Institutional email domain
    const isInstEmail = currentUser?.email?.endsWith('.ac.in');
    checks.push({ name: 'Institutional Email Domain (.ac.in)', passed: isInstEmail });
    if (isInstEmail) passedCount++;

    // Check 2: Phone is registered
    const isPhoneRegistered = !!form.phone.trim();
    checks.push({ name: 'Phone number linked', passed: isPhoneRegistered });
    if (isPhoneRegistered) passedCount++;

    // Check 3: External backup email registered
    const isBackupEmailSet = !!form.gmail.trim();
    checks.push({ name: 'External recovery email linked', passed: isBackupEmailSet });
    if (isBackupEmailSet) passedCount++;

    // Check 4: Contact details privacy hidden
    const isPrivacyActive = !form.privacy.phone || !form.privacy.email;
    checks.push({ name: 'Public privacy filters active', passed: isPrivacyActive });
    if (isPrivacyActive) passedCount++;

    let level = 'Weak';
    let levelClass = 'weak';
    if (passedCount >= 4) {
      level = 'Strong';
      levelClass = 'strong';
    } else if (passedCount >= 2) {
      level = 'Medium';
      levelClass = 'medium';
    }

    return { score: passedCount, total: 4, level, levelClass, checks };
  }, [form, currentUser]);

  // Check if form has unsaved changes compared to initialForm
  const isFormDirty = useMemo(() => {
    if (!initialForm) return false;
    
    // Compare basic fields
    const keys = [
      'name', 'firstName', 'surname', 'username', 'rollNumber', 'programme', 'branch',
      'yearOfAdmission', 'avatarUrl', 'customPhotoUrl', 'profilePhotoBase64',
      'photoPositionX', 'photoPositionY', 'photoZoom', 'photoRotation', 'photoAspectRatio',
      'github', 'instagram', 'linkedin', 'phone', 'gmail',
      'cgpa', 'minor', 'hostelName', 'roomNumber',
      'messQrBase64', 'studentIdBase64'
    ];
    
    for (const key of keys) {
      const formVal = form[key] === undefined || form[key] === null ? '' : String(form[key]).trim();
      const initialVal = initialForm[key] === undefined || initialForm[key] === null ? '' : String(initialForm[key]).trim();
      if (formVal !== initialVal) {
        return true;
      }
    }
    
    // Compare nested privacy fields
    const defaultPrivacy = { phone: false, email: false, social: true };
    const formPrivacy = form.privacy || defaultPrivacy;
    const initialPrivacy = initialForm.privacy || defaultPrivacy;
    if (!!formPrivacy.phone !== !!initialPrivacy.phone ||
        !!formPrivacy.email !== !!initialPrivacy.email ||
        !!formPrivacy.social !== !!initialPrivacy.social) {
      return true;
    }
    
    // Compare nested notifications fields
    const defaultNotifications = { email: true, push: false, updates: true };
    const formNotifications = form.notifications || defaultNotifications;
    const initialNotifications = initialForm.notifications || defaultNotifications;
    if (!!formNotifications.email !== !!initialNotifications.email ||
        !!formNotifications.push !== !!initialNotifications.push ||
        !!formNotifications.updates !== !!initialNotifications.updates) {
      return true;
    }
    
    // Compare nested preferences fields
    const defaultPreferences = { librarySeat: '', defaultView: 'List', accent: 'indigo' };
    const formPreferences = form.preferences || defaultPreferences;
    const initialPreferences = initialForm.preferences || defaultPreferences;
    if ((formPreferences.librarySeat || '') !== (initialPreferences.librarySeat || '') ||
        (formPreferences.defaultView || 'List') !== (initialPreferences.defaultView || 'List') ||
        (formPreferences.accent || 'indigo') !== (initialPreferences.accent || 'indigo')) {
      return true;
    }
    
    return false;
  }, [form, initialForm]);

  // Live preview logic using the same getAvatarUrl as the rest of the app
  const getPreviewUrl = () => {
    if (activePhotoTab === 'upload') {
      if (form.profilePhotoBase64) return form.profilePhotoBase64;
      if (form.customPhotoUrl) return convertGDriveUrl(form.customPhotoUrl);
    }
    if (activePhotoTab === 'dicebear' && form.avatarUrl) return form.avatarUrl;
    return currentUser?.email 
      ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${currentUser.email}` 
      : 'https://api.dicebear.com/9.x/thumbs/svg?seed=default';
  };

  const previewPosition = `${form.photoPositionX}% ${form.photoPositionY}%`;

  const [isDragging, setIsDragging] = useState(false);
  const [showGridLines, setShowGridLines] = useState(false);
  const dragStartRef = React.useRef({ x: 0, y: 0, posX: 50, posY: 50 });

  const handleDragStart = (e) => {
    if (activePhotoTab === 'dicebear') return;
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      posX: form.photoPositionX,
      posY: form.photoPositionY
    };
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;

    const width = 150;
    const height = 195;
    const sensitivity = 0.6 * (100 / form.photoZoom);

    const newX = Math.max(0, Math.min(100, dragStartRef.current.posX - (dx / width) * 100 * sensitivity));
    const newY = Math.max(0, Math.min(100, dragStartRef.current.posY - (dy / height) * 100 * sensitivity));

    setForm(prev => ({
      ...prev,
      photoPositionX: Math.round(newX),
      photoPositionY: Math.round(newY)
    }));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <motion.div 
      className="page-container"
      style={{ paddingBottom: '80px' }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Settings &amp; Profile</h2>
      </div>

      {saved && <div className="auth-success" style={{ marginBottom: '1rem' }}>Settings updated successfully!</div>}

      {/* Visual Analytics Widgets */}
      <motion.div 
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}
        variants={itemVariants}
      >
        {/* Profile Completeness Tracker */}
        <div className="profile-completeness-card">
          <div className="completeness-gauge-container">
            <svg className="completeness-svg" viewBox="0 0 80 80">
              <circle className="completeness-circle-bg" cx="40" cy="40" r="36" />
              <circle 
                className="completeness-circle-fill" 
                cx="40" 
                cy="40" 
                r="36" 
                stroke="url(#completenessGrad)"
                strokeDasharray="226.2" 
                strokeDashoffset={226.2 - (completenessDetails.percent / 100) * 226.2} 
              />
              <defs>
                <linearGradient id="completenessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--accent)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="completeness-text-overlay">{completenessDetails.percent}%</div>
          </div>
          <div className="completeness-details">
            <div className="completeness-title">
              <GraduationCap size={18} style={{ color: 'var(--primary)' }} /> Profile Completeness
            </div>
            <div className="completeness-subtitle">
              {completenessDetails.percent === 100 ? 'Awesome! Your profile is fully setup.' : 'Fill in more details to reach 100% completion.'}
            </div>
            <div className="completeness-milestones">
              {['Name', 'Roll No', 'Branch', 'Photo', 'Socials'].map(m => {
                const isDone = completenessDetails.milestones.some(mil => mil.startsWith(m));
                return (
                  <span key={m} className={`completeness-badge ${isDone ? 'completed' : ''}`}>
                    {isDone ? '✓' : '○'} {m}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security Health Check */}
        <div className="security-health-widget">
          <div className="security-header-row">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '.5rem', margin: 0 }}>
              <Shield size={16} style={{ color: 'var(--primary)' }} /> Security Strength
            </h4>
            <span className={`security-score-badge ${securityHealth.levelClass}`}>
              {securityHealth.level} ({securityHealth.score}/{securityHealth.total})
            </span>
          </div>
          <div className="security-checklist">
            {securityHealth.checks.map((c, i) => (
              <div key={i} className={`security-check-item ${c.passed ? 'passed' : ''}`}>
                <span style={{ color: c.passed ? 'var(--success)' : 'var(--danger)', marginRight: '6px', fontSize: '1rem' }}>
                  {c.passed ? '●' : '○'}
                </span>
                <span style={{ textDecoration: c.passed ? 'none' : 'line-through' }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ACCORDION EDIT PROFILE SECTION */}
      <motion.div className="settings-section" variants={itemVariants}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
          <User size={18} style={{ color: 'var(--primary)' }} /> Edit Your Profile
        </h3>

        <div className="settings-accordion-panel">
          {/* --- Profile Photo Accordion --- */}
          <div className="settings-accordion-item">
          <button className="settings-accordion-header" onClick={() => toggleSection('photo')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={18} style={{ color: 'var(--primary)' }} />
              <span>Edit Profile Photo</span>
            </span>
            <ChevronDown size={18} style={{ transition: 'transform 0.3s', transform: openSection === 'photo' ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-muted)' }} />
          </button>
          {openSection === 'photo' && (
            <div className="settings-accordion-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="photo-source-tabs" style={{ justifyContent: 'center', width: '100%' }}>
                <button className={`photo-source-tab ${activePhotoTab === 'upload' ? 'active' : ''}`} onClick={() => setActivePhotoTab('upload')}>
                  <Upload size={14} /> Upload
                </button>
                <button className={`photo-source-tab ${activePhotoTab === 'dicebear' ? 'active' : ''}`} onClick={() => setActivePhotoTab('dicebear')}>
                  <User size={14} /> Avatar
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.75rem', width: '100%' }}>
                <div style={{ flex: '0 1 350px', minWidth: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  {activePhotoTab === 'upload' && (
                    <label className="file-upload-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '235px', margin: 0, width: '100%' }}>
                      <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                      <p style={{ margin: 0 }}>Click to select or drag and drop<br/><small style={{ color: 'var(--text-muted)' }}>(JPEG, PNG, WebP up to 5MB)</small></p>
                      <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleFileUpload} />
                    </label>
                  )}
                  
                  {activePhotoTab === 'dicebear' && (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.5rem', textAlign: 'center' }}>Select a dynamic avatar seed:</p>
                      <div className="avatar-scroll-container">
                        {AVATAR_SEEDS.map(seed => {
                          const url = `https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}`;
                          const isSelected = form.avatarUrl === url;
                          return (
                            <img 
                              key={seed} 
                              src={url} 
                              alt={seed}
                              className={`avatar-option-img ${isSelected ? 'selected' : ''}`}
                              onClick={() => { update('avatarUrl', url); update('customPhotoUrl', ''); update('profilePhotoBase64', ''); }} 
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ flex: '0 1 450px', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', width: '100%' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', width: '100%', textAlign: 'center' }}>Interactive Focus &amp; Crop Editor</label>
                  
                  <div className="crop-editor-layout">
                    {/* Viewport with grid overlay and drag listeners */}
                    <div 
                      className={`focal-editor-viewport aspect-${form.photoAspectRatio} ${isDragging ? 'dragging' : ''}`}
                      onMouseDown={handleDragStart}
                      onMouseMove={handleDragMove}
                      onMouseUp={handleDragEnd}
                      onMouseLeave={handleDragEnd}
                      onTouchStart={handleDragStart}
                      onTouchMove={handleDragMove}
                      onTouchEnd={handleDragEnd}
                    >
                      {/* Grid overlay */}
                      {showGridLines && (
                        <div className="viewport-grid-lines">
                          <div className="grid-line-h h-1" />
                          <div className="grid-line-h h-2" />
                          <div className="grid-line-v v-1" />
                          <div className="grid-line-v v-2" />
                        </div>
                      )}
                      
                      {/* Circular/Squircle Crop Guidelines */}
                      <div className="viewport-crop-guideline" />
                      
                      {/* Target Reticle Crosshair */}
                      <div className="viewport-target-reticle" />

                      <img 
                        src={getPreviewUrl()} 
                        alt="Focal Preview" 
                        draggable="false"
                        style={{ 
                          objectPosition: previewPosition,
                          transform: `scale(${form.photoZoom / 100}) rotate(${form.photoRotation}deg)`,
                          pointerEvents: activePhotoTab === 'dicebear' ? 'auto' : 'none' /* prevent default image dragging behavior */
                        }} 
                      />
                      
                      {/* Technical Info Overlays */}
                      <div className="viewport-tech-info top-left-info">FOCAL_X: {form.photoPositionX}%</div>
                      <div className="viewport-tech-info bottom-right-info">FOCAL_Y: {form.photoPositionY}%</div>
                    </div>

                    {/* Right side controls dock */}
                    <div className="focal-editor-dock">
                      {/* Framing Shape Options */}
                      <div className="dock-control-group">
                        <label className="dock-group-label">Framing Aspect Ratio</label>
                        <div className="dock-presets-row">
                          <button 
                            type="button"
                            className={`dock-preset-btn ${form.photoAspectRatio === 'card' ? 'active' : ''}`}
                            onClick={() => update('photoAspectRatio', 'card')}
                            title="Student Card (3:4)"
                          >
                            Card (3:4)
                          </button>
                          <button 
                            type="button"
                            className={`dock-preset-btn ${form.photoAspectRatio === 'circle' ? 'active' : ''}`}
                            onClick={() => update('photoAspectRatio', 'circle')}
                            title="Round Avatar (1:1)"
                          >
                            Circle
                          </button>
                          <button 
                            type="button"
                            className={`dock-preset-btn ${form.photoAspectRatio === 'squircle' ? 'active' : ''}`}
                            onClick={() => update('photoAspectRatio', 'squircle')}
                            title="Cyber Squircle (1:1)"
                          >
                            Squircle
                          </button>
                        </div>
                      </div>

                      {/* Zoom and rotation sliders */}
                      {(activePhotoTab === 'upload') && (
                        <>
                          <div className="dock-control-group">
                            <label className="dock-group-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Zoom Scale</span>
                              <span>{form.photoZoom}%</span>
                            </label>
                            <div className="slider-row-new">
                              <ZoomOut size={14} style={{ color: 'var(--text-muted)' }} />
                              <input 
                                type="range" 
                                min="100" 
                                max="300" 
                                value={form.photoZoom}
                                onChange={e => update('photoZoom', parseInt(e.target.value))}
                              />
                              <ZoomIn size={14} style={{ color: 'var(--text-muted)' }} />
                            </div>
                          </div>

                          <div className="dock-control-group">
                            <label className="dock-group-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Rotation Angle</span>
                              <span>{form.photoRotation}°</span>
                            </label>
                            <div className="slider-row-new">
                              <RotateCw size={14} style={{ color: 'var(--text-muted)' }} />
                              <input 
                                type="range" 
                                min="-180" 
                                max="180" 
                                value={form.photoRotation}
                                onChange={e => update('photoRotation', parseInt(e.target.value))}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Utility Action Buttons */}
                      <div className="dock-presets-row" style={{ marginTop: '0.25rem' }}>
                        <button 
                          type="button"
                          className={`dock-utility-btn ${showGridLines ? 'active' : ''}`}
                          onClick={() => setShowGridLines(!showGridLines)}
                          style={{ flex: 1, gap: '4px' }}
                        >
                          <Grid size={12} /> Align Grid
                        </button>
                        <button 
                          type="button"
                          className="dock-utility-btn"
                          onClick={() => {
                            setForm(p => ({
                              ...p,
                              photoPositionX: 50,
                              photoPositionY: 50,
                              photoZoom: 100,
                              photoRotation: 0
                            }));
                          }}
                          style={{ flex: 1, gap: '4px' }}
                        >
                          <RefreshCw size={12} /> Reset
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {activePhotoTab !== 'dicebear' && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0', textAlign: 'center', width: '100%' }}>
                      💡 <strong>Tip:</strong> Click and drag directly on the image preview to align it!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- Mess QR Accordion --- */}
        <div className="settings-accordion-item">
          <button className="settings-accordion-header" onClick={() => toggleSection('messqr')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <QrCode size={18} style={{ color: 'var(--primary)' }} />
              <span>Mess QR &amp; Student ID Card</span>
            </span>
            <ChevronDown size={18} style={{ transition: 'transform 0.3s', transform: openSection === 'messqr' ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-muted)' }} />
          </button>
          {openSection === 'messqr' && (
            <div className="settings-accordion-body">
              <div className="cards-layout-grid">
                {/* Mess QR Code Card */}
                <div className="digital-card-container">
                  <h4 className="digital-card-title">
                    <QrCode size={16} style={{ color: 'var(--primary)' }} /> Mess QR Code
                  </h4>
                  <div className="digital-card-body">
                    {form.messQrBase64 ? (
                      <>
                        <img 
                          src={form.messQrBase64} 
                          alt="Mess QR" 
                          className="digital-card-image" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => setLightboxImage({ url: form.messQrBase64, label: 'Mess QR Code' })}
                        />
                        <div 
                          className="digital-card-overlay" 
                          onClick={() => setLightboxImage({ url: form.messQrBase64, label: 'Mess QR Code' })}
                          style={{ cursor: 'pointer' }}
                        >
                          <button 
                            type="button"
                            className="card-overlay-btn" 
                            title="View Card" 
                            onClick={(e) => { e.stopPropagation(); setLightboxImage({ url: form.messQrBase64, label: 'Mess QR Code' }); }}
                          >
                            <Eye size={18} />
                          </button>
                          <label className="card-overlay-btn" title="Replace Card" onClick={(e) => e.stopPropagation()}>
                            <Upload size={18} />
                            <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleQrUpload} />
                          </label>
                          <button 
                            type="button"
                            className="card-overlay-btn btn-delete" 
                            title="Remove Card" 
                            onClick={(e) => { e.stopPropagation(); update('messQrBase64', ''); }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="digital-card-empty">
                        <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                        <p><strong>Click to upload Mess QR</strong><br/>JPEG, PNG or WebP</p>
                        <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleQrUpload} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Student ID Card Card */}
                <div className="digital-card-container">
                  <h4 className="digital-card-title">
                    <CreditCard size={16} style={{ color: 'var(--primary)' }} /> Student ID Card
                  </h4>
                  <div className="digital-card-body">
                    {form.studentIdBase64 ? (
                      <>
                        <img 
                          src={form.studentIdBase64} 
                          alt="Student ID" 
                          className="digital-card-image" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => setLightboxImage({ url: form.studentIdBase64, label: 'Student ID Card' })}
                        />
                        <div 
                          className="digital-card-overlay" 
                          onClick={() => setLightboxImage({ url: form.studentIdBase64, label: 'Student ID Card' })}
                          style={{ cursor: 'pointer' }}
                        >
                          <button 
                            type="button"
                            className="card-overlay-btn" 
                            title="View Card" 
                            onClick={(e) => { e.stopPropagation(); setLightboxImage({ url: form.studentIdBase64, label: 'Student ID Card' }); }}
                          >
                            <Eye size={18} />
                          </button>
                          <label className="card-overlay-btn" title="Replace Card" onClick={(e) => e.stopPropagation()}>
                            <Upload size={18} />
                            <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleIdCardUpload} />
                          </label>
                          <button 
                            type="button"
                            className="card-overlay-btn btn-delete" 
                            title="Remove Card" 
                            onClick={(e) => { e.stopPropagation(); update('studentIdBase64', ''); }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="digital-card-empty">
                        <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                        <p><strong>Click to upload ID Card</strong><br/>JPEG, PNG or WebP</p>
                        <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleIdCardUpload} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- Edit Profile Details Accordion --- */}
        <div className="settings-accordion-item">
          <button className="settings-accordion-header" onClick={() => toggleSection('details')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ color: 'var(--primary)' }} />
              <span>Edit Profile Details</span>
            </span>
            <ChevronDown size={18} style={{ transition: 'transform 0.3s', transform: openSection === 'details' ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-muted)' }} />
          </button>
          {openSection === 'details' && (
            <div className="settings-accordion-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Personal Identity Group */}
              <div className="settings-form-group">
                <h4 className="settings-form-subtitle">
                  <User size={14} /> Personal Identity
                </h4>
                <div className="edit-profile-grid" style={{ marginTop: 0 }}>
                  <div className="edit-field">
                    <label>First Name</label>
                    <div className="premium-input-wrapper">
                      <input value={form.firstName} onChange={e => {
                        const first = e.target.value;
                        setForm(prev => ({
                          ...prev,
                          firstName: first,
                          name: `${first.trim()} ${prev.surname.trim()}`
                        }));
                      }} />
                      <User className="premium-input-icon" size={16} />
                    </div>
                  </div>
                  <div className="edit-field">
                    <label>Surname</label>
                    <div className="premium-input-wrapper">
                      <input value={form.surname} onChange={e => {
                        const sur = e.target.value;
                        setForm(prev => ({
                          ...prev,
                          surname: sur,
                          name: `${prev.firstName.trim()} ${sur.trim()}`
                        }));
                      }} />
                      <User className="premium-input-icon" size={16} />
                    </div>
                  </div>
                  <div className="edit-field" style={{ gridColumn: 'span 2' }}>
                    <label>Username</label>
                    <div className="premium-input-wrapper">
                      <input value={form.username} onChange={e => update('username', e.target.value)} />
                      <User className="premium-input-icon" size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Details Group */}
              <div className="settings-form-group">
                <h4 className="settings-form-subtitle">
                  <GraduationCap size={14} /> Academic Details
                </h4>
                <div className="edit-profile-grid" style={{ marginTop: 0 }}>
                  <div className="edit-field">
                    <label>Roll Number</label>
                    <div className="premium-input-wrapper">
                      <input value={form.rollNumber} onChange={e => update('rollNumber', e.target.value)} />
                      <GraduationCap className="premium-input-icon" size={16} />
                    </div>
                  </div>
                  <div className="edit-field">
                    <label>Year of Admission</label>
                    <div className="premium-input-wrapper">
                      <select value={form.yearOfAdmission} onChange={e => update('yearOfAdmission', e.target.value)}>
                        <option value="">Select Year</option>
                        {admissionYears.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <ChevronDown className="premium-select-chevron" size={14} />
                      <Calendar className="premium-input-icon" size={16} />
                    </div>
                  </div>
                  <div className="edit-field">
                    <label>Programme</label>
                    <div className="premium-input-wrapper">
                      <select value={form.programme} onChange={e => {
                        const val = e.target.value;
                        setForm(p => ({ ...p, programme: val, branch: '' }));
                      }}>
                        <option value="">Select Programme</option>
                        {PROGRAMMES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronDown className="premium-select-chevron" size={14} />
                      <GraduationCap className="premium-input-icon" size={16} />
                    </div>
                  </div>
                  <div className="edit-field">
                    <label>Branch</label>
                    <div className="premium-input-wrapper">
                      <select value={form.branch} onChange={e => update('branch', e.target.value)} disabled={!form.programme}>
                        <option value="">{form.programme ? 'Select Branch' : 'Select Programme First'}</option>
                        {form.programme && PROGRAMME_BRANCHES[form.programme]?.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <ChevronDown className="premium-select-chevron" size={14} />
                      <GraduationCap className="premium-input-icon" size={16} />
                    </div>
                  </div>
                  <div className="edit-field">
                    <label>CGPA</label>
                    <div className="premium-input-wrapper">
                      <input type="number" step="0.01" min="0" max="10" placeholder="e.g. 8.54" value={form.cgpa} onChange={e => update('cgpa', e.target.value)} />
                      <Award className="premium-input-icon" size={16} />
                    </div>
                  </div>
                  <div className="edit-field">
                    <label>Minor / Specialization</label>
                    <div className="premium-input-wrapper">
                      <input placeholder="e.g. AI &amp; Data Science" value={form.minor} onChange={e => update('minor', e.target.value)} />
                      <Book className="premium-input-icon" size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Accommodation Group */}
              <div className="settings-form-group">
                <h4 className="settings-form-subtitle">
                  <Home size={14} /> Accommodation Info
                </h4>
                <div className="edit-profile-grid" style={{ marginTop: 0 }}>
                  <div className="edit-field">
                    <label>Hostel Name</label>
                    <div className="premium-input-wrapper">
                      <select 
                        value={form.hostelName} 
                        onChange={e => {
                          const val = e.target.value;
                          const prefix = val ? `${val.split(' ')[0]}-` : '';
                          setForm(prev => ({
                            ...prev,
                            hostelName: val,
                            roomNumber: prefix
                          }));
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          background: 'var(--input-bg)',
                          color: 'var(--text)',
                          outline: 'none',
                          appearance: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Select Hostel</option>
                        {['Aibaan', 'Beauki', 'Chimair', 'Duven', 'Emiet', 'Firpeal', 'Griwiksh', 'Hiqom', 'Ijokha', 'Jurqia', 'Kyzeel', 'Lekhaag'].map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <ChevronDown className="premium-select-chevron" size={14} />
                      <Home className="premium-input-icon" size={16} />
                    </div>
                  </div>
                  <div className="edit-field">
                    <label>Room Number</label>
                    <div className="premium-input-wrapper">
                      <input 
                        placeholder={form.hostelName ? `${form.hostelName.split(' ')[0]}-304` : "Select hostel first"} 
                        disabled={!form.hostelName}
                        value={form.roomNumber} 
                        onChange={e => {
                          const inputVal = e.target.value;
                          const prefix = form.hostelName ? `${form.hostelName.split(' ')[0]}-` : '';
                          if (!inputVal.startsWith(prefix)) {
                            setForm(prev => ({ ...prev, roomNumber: prefix }));
                            return;
                          }
                          const suffix = inputVal.slice(prefix.length);
                          const cleanSuffix = suffix.replace(/\D/g, '').slice(0, 3);
                          setForm(prev => ({ ...prev, roomNumber: prefix + cleanSuffix }));
                        }}
                        style={{
                          paddingLeft: '2.2rem',
                          opacity: form.hostelName ? 1 : 0.6,
                          cursor: form.hostelName ? 'text' : 'not-allowed'
                        }}
                      />
                      <Hash className="premium-input-icon" size={16} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* --- Contact & Social Accordion --- */}
        <div className="settings-accordion-item">
          <button className="settings-accordion-header" onClick={() => toggleSection('contact')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={18} style={{ color: 'var(--primary)' }} />
              <span>Edit Contact &amp; Social Links</span>
            </span>
            <ChevronDown size={18} style={{ transition: 'transform 0.3s', transform: openSection === 'contact' ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-muted)' }} />
          </button>
          {openSection === 'contact' && (
            <div className="settings-accordion-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', margin: 0 }}>Adjust your details and choose what's visible publicly on your student card.</p>
              
              {/* Contact Information Group */}
              <div className="settings-form-group">
                <h4 className="settings-form-subtitle">
                  <Mail size={14} /> Contact Information
                </h4>
                <div className="edit-profile-grid" style={{ marginTop: 0 }}>
                  <div className="edit-field">
                    <label>Phone Number</label>
                    <div className="premium-input-wrapper">
                      <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91..." />
                      <Phone className="premium-input-icon" size={16} />
                    </div>
                    <div className="privacy-toggle" style={{ marginTop: '0.4rem' }}>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Show Publicly on Card?</label>
                      <button className={`toggle-switch ${form.privacy.phone ? 'active' : ''}`} onClick={() => updateNested('privacy', 'phone', !form.privacy.phone)} />
                    </div>
                  </div>

                  <div className="edit-field">
                    <label>Recovery Email</label>
                    <div className="premium-input-wrapper">
                      <input value={form.gmail} onChange={e => update('gmail', e.target.value)} placeholder="personal@gmail.com" />
                      <Mail className="premium-input-icon" size={16} />
                    </div>
                    <div className="privacy-toggle" style={{ marginTop: '0.4rem' }}>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Show Publicly on Card?</label>
                      <button className={`toggle-switch ${form.privacy.email ? 'active' : ''}`} onClick={() => updateNested('privacy', 'email', !form.privacy.email)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Connections Group */}
              <div className="settings-form-group">
                <h4 className="settings-form-subtitle">
                  <Globe size={14} /> Social Connections
                </h4>
                <div className="edit-profile-grid" style={{ marginTop: 0 }}>
                  <div className="edit-field">
                    <label>GitHub Profile</label>
                    <div className="premium-input-wrapper">
                      <input value={form.github} onChange={e => update('github', e.target.value)} placeholder="https://github.com/username" />
                      <Globe className="premium-input-icon" size={16} />
                    </div>
                  </div>
                  <div className="edit-field">
                    <label>LinkedIn Profile</label>
                    <div className="premium-input-wrapper">
                      <input value={form.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" />
                      <Globe className="premium-input-icon" size={16} />
                    </div>
                  </div>
                  <div className="edit-field" style={{ gridColumn: 'span 2' }}>
                    <label>Instagram Handle</label>
                    <div className="premium-input-wrapper">
                      <input value={form.instagram} onChange={e => update('instagram', e.target.value)} placeholder="https://instagram.com/username" />
                      <Globe className="premium-input-icon" size={16} />
                    </div>
                  </div>
                </div>
                
                <div className="privacy-toggle" style={{ borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>Show Social Links Publicly?</label>
                  <button className={`toggle-switch ${form.privacy.social ? 'active' : ''}`} onClick={() => updateNested('privacy', 'social', !form.privacy.social)} />
                </div>
              </div>

            </div>
          )}
        </div>
        </div>

      </motion.div>

      {/* NOTIFICATIONS & PREFERENCES */}
      <motion.div className="settings-section" variants={itemVariants}>
        <h3><Bell size={18} /> App Preferences</h3>
        <div className="settings-card">
          <div className="setting-toggle-row">
            <div className="setting-toggle-info">
              <div className="setting-label">Email Notifications</div>
              <div className="setting-desc">Receive timetable changes and class updates via email</div>
            </div>
            <button className={`toggle-switch ${form.notifications.email ? 'active' : ''}`} onClick={() => {
              const newVal = !form.notifications.email;
              const updatedNotifications = { ...form.notifications, email: newVal };
              const updatedForm = { ...form, notifications: updatedNotifications };
              setForm(updatedForm);
              setInitialForm(updatedForm);
              saveProfile(updatedForm);
            }} />
          </div>
          <div className="setting-toggle-row">
            <div className="setting-toggle-info">
              <div className="setting-label">Dark Mode Theme</div>
              <div className="setting-desc">Toggle the overall appearance of the portal</div>
            </div>
            <button className="theme-toggle-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <><Sun size={14} /> Light</> : <><Moon size={14} /> Dark</>}
            </button>
          </div>
          <div className="setting-toggle-row">
            <div className="setting-toggle-info">
              <div className="setting-label">Default Timetable View</div>
              <div className="setting-desc">Preferred view when opening the timetable page</div>
            </div>
            <select className="auth-select" style={{ width: '120px', marginBottom: 0, padding: '.3rem .5rem' }} value={form.preferences.defaultView} onChange={(e) => {
              const newVal = e.target.value;
              const updatedPreferences = { ...form.preferences, defaultView: newVal };
              const updatedForm = { ...form, preferences: updatedPreferences };
              setForm(updatedForm);
              setInitialForm(updatedForm);
              saveProfile(updatedForm);
            }}>
              <option>List</option>
              <option>Grid</option>
            </select>
          </div>
          <div className="setting-toggle-row">
            <div className="setting-toggle-info">
              <div className="setting-label">UI Theme Accent</div>
              <div className="setting-desc">Select custom visual highlights across the entire portal</div>
            </div>
            <div className="accent-presets-container">
              {[
                { id: 'indigo', name: 'Indigo Classic', color: '#6366f1' },
                { id: 'emerald', name: 'Neon Emerald', color: '#10b981' },
                { id: 'purple', name: 'Cyberpunk Purple', color: '#a855f7' },
                { id: 'orange', name: 'Amber Orange', color: '#f59e0b' },
                { id: 'pink', name: 'Rose Pink', color: '#ec4899' },
                { id: 'blue', name: 'Ocean Blue', color: '#0284c7' }
              ].map(preset => {
                const isSelected = (form.preferences.accent || 'indigo') === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`accent-preset-btn ${isSelected ? 'active' : ''}`}
                    title={preset.name}
                    onClick={() => {
                      const updatedPreferences = { ...form.preferences, accent: preset.id };
                      const updatedForm = { ...form, preferences: updatedPreferences };
                      setForm(updatedForm);
                      setInitialForm(updatedForm);
                      applyThemeAccent(preset.id);
                      saveProfile(updatedForm);
                    }}
                    style={{ '--preset-color': preset.color }}
                  >
                    <span className="accent-color-bubble" style={{ backgroundColor: preset.color }}>
                      {isSelected && <CheckCircle2 size={10} className="accent-check-icon" />}
                    </span>
                    <span className="accent-color-name">{preset.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="setting-toggle-row" style={{ borderBottom: 'none', flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
            <div className="setting-toggle-info">
              <div className="setting-label">External Calendar Sync (iCal)</div>
              <div className="setting-desc">Sync your academic schedule to external calendars (Google Calendar, Apple, Outlook)</div>
            </div>
            <div className="ical-sync-wrapper">
              <input 
                type="text" 
                readOnly 
                value={`https://studentos-api.destopianpirate.com/api/v1/calendar/feed/${currentUser?.uid || 'guest'}.ics`}
                className="ical-sync-input" 
                onClick={(e) => e.target.select()}
              />
              <button 
                type="button"
                className="btn btn-primary btn-sm ical-copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(`https://studentos-api.destopianpirate.com/api/v1/calendar/feed/${currentUser?.uid || 'guest'}.ics`);
                  addNotification('success', 'Copied iCal Feed', 'iCal subscription link copied to clipboard.');
                }}
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ACCOUNT & DANGER ZONE */}
      <motion.div className="settings-section" variants={itemVariants}>
        <h3><Shield size={18} /> Account & Security</h3>
        <div className="settings-card" style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', marginBottom: '1.5rem' }}>Signed in as <strong>{currentUser?.email}</strong></p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <button className="btn btn-outline" onClick={handleDownloadData}><Download size={16} /> Export Backup (JSON)</button>
            <button className="btn btn-outline" onClick={handleExportPDF}><Download size={16} /> Export Report (PDF)</button>
            <button className="btn btn-outline" onClick={handleLogout}><LogOut size={16} /> Logout</button>
          </div>
          
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>Import Profile & Data</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1rem', lineHeight: '1.4' }}>
              Restore settings, profile photo, Mess QR, student ID, projects, certificates, note lists, and semester grades from a matching `.json` backup file.
            </p>
            <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}>
              <Upload size={14} /> Upload Backup JSON
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportJSON} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>
        </div>

        <div className="danger-zone">
          <h4>Danger Zone</h4>
          <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button className="btn btn-danger" onClick={() => alert('Account deletion is disabled in demo mode.')}><Trash2 size={16} /> Delete Account</button>
        </div>
      </motion.div>

      <div className="page-footer">
        <p>Built with ❤️ by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a></p>
        <p style={{ marginTop: '.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
          <Info size={14} /> <a href="#" style={{ color: 'var(--text-muted)' }}>Help & Support</a>
        </p>
      </div>

      {/* Bottom Bar for Settings */}
      <div className="bottom-navbar">
        <div className="stats-bar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--text)' }}>
              {isFormDirty ? (
                <>
                  {openSection === 'photo' && 'Editing Profile Photo'}
                  {openSection === 'messqr' && 'Editing Mess QR & Student ID'}
                  {openSection === 'details' && 'Editing Profile Details'}
                  {openSection === 'contact' && 'Editing Contact & Social Links'}
                  {!openSection && 'Unsaved Profile Changes'}
                </>
              ) : (
                'All changes saved'
              )}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <motion.button 
              className="btn btn-outline btn-sm" 
              onClick={handleCancel}
              disabled={!isFormDirty || saving}
              style={{ opacity: !isFormDirty ? 0.5 : 1, cursor: !isFormDirty ? 'not-allowed' : 'pointer' }}
              whileHover={isFormDirty && !saving ? { scale: 1.02 } : undefined}
              whileTap={isFormDirty && !saving ? { scale: 0.98 } : undefined}
            >
              Cancel
            </motion.button>
            <motion.button 
              className="btn btn-primary btn-sm" 
              onClick={handleSave} 
              disabled={!isFormDirty || saving}
              style={{ opacity: !isFormDirty ? 0.5 : 1, cursor: !isFormDirty ? 'not-allowed' : 'pointer' }}
              whileHover={isFormDirty && !saving ? { scale: 1.05 } : undefined}
              whileTap={isFormDirty && !saving ? { scale: 0.95 } : undefined}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Lightbox Blur-Overlay for Cards */}
      {lightboxImage && createPortal(
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxImage(null)}>
              <X size={18} />
            </button>
            <div className="lightbox-image-container">
              <img src={lightboxImage.url} alt={lightboxImage.label} className="lightbox-image" />
            </div>
            <div className="lightbox-label">{lightboxImage.label}</div>
          </div>
        </div>,
        document.body
      )}

      {/* Review Imported Data Modal */}
      {importPreview && (
        <div className="modal-overlay" onClick={() => setImportPreview(null)}>
          <motion.div 
            className="modal-content glass-card"
            style={{ maxWidth: '680px', width: '90vw', maxHeight: '85vh', overflowY: 'auto', background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Review Imported Data</h3>
              <button className="modal-close" onClick={() => setImportPreview(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Please review the semesters and courses from the backup file before importing.
              </p>
              
              <div style={{ display: 'flex', gap: '1.5rem', background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <strong>College ID:</strong> {importPreview.collegeEmail}
                </div>
                <div>
                  <strong>Running Semester:</strong> {importPreview.profile?.semester || 'N/A'}
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--text)' }}>Semester-wise Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {importPreview.grades && importPreview.grades.length > 0 ? (
                    (() => {
                      const runningSemName = importPreview.profile?.semester;
                      const runningSem = importPreview.grades.find(sem => sem.name === runningSemName);
                      const completedSems = importPreview.grades.filter(sem => sem.name !== runningSemName);

                      return (
                        <>
                          {/* Running Semester Section */}
                          <div>
                            <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                              Running Semester
                            </h5>
                            {runningSem ? (
                              (() => {
                                const totalSemCredits = runningSem.courses?.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0) || 0;
                                return (
                                  <div style={{ border: '1px solid var(--primary)', borderRadius: '0.75rem', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.04)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                      <strong style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
                                        {runningSem.name}
                                      </strong>
                                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                                        <span style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                          {runningSem.courses?.length || 0} courses
                                        </span>
                                        <span style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                          {totalSemCredits} Credits
                                        </span>
                                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                                          SPI: — (In Progress)
                                        </span>
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.5rem' }}>
                                      {runningSem.courses && runningSem.courses.length > 0 ? (
                                        runningSem.courses.map((course, idx) => (
                                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <span>{course.name}</span>
                                            <span>{course.credits} Cr &bull; In Progress</span>
                                          </div>
                                        ))
                                      ) : (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No courses</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()
                            ) : (
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', border: '1px dashed var(--border)', borderRadius: '0.75rem', padding: '0.75rem' }}>
                                No registered courses found for the running semester.
                              </div>
                            )}
                          </div>

                          {/* Completed Semesters Section */}
                          <div style={{ marginTop: '0.5rem' }}>
                            <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                              Completed Semesters
                            </h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {completedSems.length > 0 ? (
                                completedSems.map(sem => {
                                  // Calculate SPI
                                  let totalPoints = 0, totalCredits = 0;
                                  sem.courses?.forEach(c => {
                                    const gp = GRADE_POINTS[c.grade];
                                    if (gp !== null && gp !== undefined && c.credits > 0) {
                                      totalPoints += gp * parseFloat(c.credits);
                                      totalCredits += parseFloat(c.credits);
                                    }
                                  });
                                  const spi = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '—';

                                  // Calculate credits completed
                                  const completedCredits = sem.courses?.reduce((sum, c) => {
                                    const gp = GRADE_POINTS[c.grade];
                                    return (gp !== null && gp !== undefined && gp > 0) ? sum + parseFloat(c.credits) : sum;
                                  }, 0) || 0;

                                  return (
                                    <div key={sem.name} style={{ border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.75rem' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <strong style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
                                          {sem.name}
                                        </strong>
                                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                                          <span style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                            {sem.courses?.length || 0} courses
                                          </span>
                                          <span style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                            {completedCredits} Credits Completed
                                          </span>
                                          <span style={{ background: 'var(--primary)', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                                            SPI: {spi}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Courses List */}
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.5rem' }}>
                                        {sem.courses && sem.courses.length > 0 ? (
                                          sem.courses.map((course, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                              <span>{course.name}</span>
                                              <span>{course.credits} Cr &bull; Grade: {course.grade || '—'}</span>
                                            </div>
                                          ))
                                        ) : (
                                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No courses</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', border: '1px dashed var(--border)', borderRadius: '0.75rem', padding: '0.75rem' }}>
                                  No completed semesters recorded.
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No semesters found in the backup file.</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-outline" onClick={() => setImportPreview(null)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={async () => {
                  const importedData = importPreview;
                  setImportPreview(null);
                  
                  // Restore localStorage parameters
                  if (importedData.notes) localStorage.setItem('student_notes', JSON.stringify(importedData.notes));
                  if (importedData.customEvents) localStorage.setItem('custom_events', JSON.stringify(importedData.customEvents));
                  if (importedData.certificates) localStorage.setItem('student_certificates', JSON.stringify(importedData.certificates));
                  if (importedData.projects) localStorage.setItem('student_projects', JSON.stringify(importedData.projects));
                  if (importedData.grades) localStorage.setItem(`grades_${currentUser.uid}`, JSON.stringify(importedData.grades));
                  
                  if (importedData.timetableCourses) {
                    localStorage.setItem(`courses_${currentUser.uid}`, JSON.stringify(importedData.timetableCourses));
                  } else {
                    // Fallback: reconstruct timetable courses from the running semester in importedData.grades
                    const runningSemName = importedData.profile?.semester;
                    const runningSem = importedData.grades?.find(sem => sem.name === runningSemName);
                    if (runningSem && runningSem.courses) {
                      const reconstructed = runningSem.courses.map(c => {
                        const parts = c.name.split(' - ');
                        const code = parts[0] || 'COURSE';
                        const title = parts.slice(1).join(' - ') || 'Course Title';
                        return {
                          id: c.id || Date.now() + Math.random(),
                          code: code,
                          title: title,
                          credits: c.credits || 0,
                          slots: []
                        };
                      });
                      localStorage.setItem(`courses_${currentUser.uid}`, JSON.stringify(reconstructed));
                    }
                  }
                  
                  // Restore profile details
                  if (importedData.profile) {
                    await saveProfile(importedData.profile);
                  }
                  
                  addNotification('success', 'Import Successful', 'All settings, data, and digital IDs successfully restored. Reloading...');
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                }}
              >
                Confirm Import
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default SettingsPage;
