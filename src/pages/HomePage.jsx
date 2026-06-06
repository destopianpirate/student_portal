import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Link as LinkIcon, Globe, Phone, AlertCircle, Clock, Calendar, Moon, Sunrise, Sun, Sunset, Award, BookOpen, Layers, Bookmark, Flame, Trophy, FileText, Folder, ClipboardList, Target, Percent } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCalendar } from '../contexts/CalendarContext';
import { fetchAndParseMessMenu } from '../utils/messParser';
import { getAvatarUrl, getPhotoPosition } from '../utils/avatarUtils';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './LandingPage';

// Import subcomponents
import CampusHUD from '../components/home/CampusHUD';
import TimelineRibbon from '../components/home/TimelineRibbon';
import ProfileSection from '../components/home/ProfileSection';
import ScheduleSection from '../components/home/ScheduleSection';
import MessMenuSection from '../components/home/MessMenuSection';
import HomeModals from '../components/home/HomeModals';

// Import helpers
import {
  DAY_NAMES,
  getMealWindow,
  isCurrentMeal,
  getClassWindow,
  getClassStatus,
  getHue,
  MOODS,
  getLocalDateString,
  getDateForWeekday,
  checkIsNoClassPeriod,
  HOLIDAY_CREATIVES,
  getDefaultHolidayCreative,
  calculateHudInfo
} from '../utils/homeUtils';

const HomePage = () => {
  const { currentUser, userProfile } = useAuth();
  const { holidays, academicEvents, customEvents, getEventsForDate } = useCalendar();
  const navigate = useNavigate();
  const [messMenu, setMessMenu] = useState(null);
  const [messLoading, setMessLoading] = useState(true);
  const [hudTime, setHudTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeMealTab, setActiveMealTab] = useState('Breakfast');
  const [showClassModal, setShowClassModal] = useState(false);
  const [showMessModal, setShowMessModal] = useState(false);
  const [showQrId, setShowQrId] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const gridTimeoutRef = useRef(null);
  const [activeMoodId, setActiveMoodId] = useState(() => localStorage.getItem('hud_mood') || 'focus');
  const [showAmbientMenu, setShowAmbientMenu] = useState(false);
  const [activeLightBoxImage, setActiveLightBoxImage] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const ambientMenuRef = useRef(null);

  useEffect(() => {
    return () => {
      if (gridTimeoutRef.current) clearTimeout(gridTimeoutRef.current);
    };
  }, []);

  const handleToggleQr = () => {
    if (gridTimeoutRef.current) {
      clearTimeout(gridTimeoutRef.current);
      gridTimeoutRef.current = null;
    }
    if (!showQrId) {
      setIsDetailsExpanded(true);
      setShowQrId(true);
    } else {
      setShowQrId(false);
      gridTimeoutRef.current = setTimeout(() => {
        setIsDetailsExpanded(false);
      }, 400); // 400ms matches the exit animation of cardContainerVariants
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ambientMenuRef.current && !ambientMenuRef.current.contains(event.target)) {
        setShowAmbientMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setHudTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const [selectedScheduleDay, setSelectedScheduleDay] = useState(() => {
    const todayName = DAY_NAMES[new Date().getDay()];
    return ['Saturday', 'Sunday'].includes(todayName) ? 'Monday' : todayName;
  });
  const [selectedMessDay, setSelectedMessDay] = useState(() => {
    const todayName = DAY_NAMES[new Date().getDay()];
    return todayName;
  });

  useEffect(() => {
    fetchAndParseMessMenu().then(d => setMessMenu(d)).catch(e => console.error(e)).finally(() => setMessLoading(false));
  }, []);

  const savedCourses = useMemo(() => {
    if (!currentUser) return [];
    try { return JSON.parse(localStorage.getItem(`courses_${currentUser.uid}`)) || userProfile?.selectedCourses || []; } catch { return []; }
  }, [currentUser, userProfile]);

  const savedTimetable = useMemo(() => {
    if (!currentUser) return null;
    try { return JSON.parse(localStorage.getItem(`timetable_${currentUser.uid}`)) || userProfile?.timetable || null; } catch { return null; }
  }, [currentUser, userProfile]);

  const attendancePercentage = useMemo(() => {
    if (!currentUser) return null;
    try {
      const courses = JSON.parse(localStorage.getItem(`attendance_${currentUser.uid}`)) || [];
      let total = 0, present = 0, late = 0;
      courses.forEach(c => {
        const totalC = c.records?.length || 0;
        const presentC = c.records?.filter(r => r.status === 'present').length || 0;
        const lateC = c.records?.filter(r => r.status === 'late').length || 0;
        total += totalC;
        present += presentC;
        late += lateC;
      });
      if (total === 0) return null;
      return parseFloat(((present + late * 0.5) / total * 100).toFixed(1));
    } catch {
      return null;
    }
  }, [currentUser]);

  const assignmentsStats = useMemo(() => {
    if (!currentUser) return { pending: 0, total: 0 };
    try {
      const list = JSON.parse(localStorage.getItem(`assignments_${currentUser.uid}`)) || [];
      const pending = list.filter(a => !a.completed).length;
      return { pending, total: list.length };
    } catch {
      return { pending: 0, total: 0 };
    }
  }, [currentUser]);

  const goalsStats = useMemo(() => {
    if (!currentUser) return { active: 0, total: 0 };
    try {
      const list = JSON.parse(localStorage.getItem(`goals_${currentUser.uid}`)) || [];
      const active = list.filter(g => g.current < g.target).length;
      return { active, total: list.length };
    } catch {
      return { active: 0, total: 0 };
    }
  }, [currentUser]);

  const studyStats = useMemo(() => {
    if (!currentUser) return { hours: 0, streak: 0 };
    try {
      const logs = JSON.parse(localStorage.getItem(`studylog_${currentUser.uid}`)) || [];
      const hours = logs.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
      
      const dates = [...new Set(logs.map(l => l.date))].sort().reverse();
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < dates.length; i++) {
        const expected = new Date(today);
        expected.setDate(expected.getDate() - i);
        const expStr = expected.toISOString().split('T')[0];
        if (dates[i] === expStr) streak++;
        else break;
      }
      return { hours: parseFloat(hours.toFixed(1)), streak };
    } catch {
      return { hours: 0, streak: 0 };
    }
  }, [currentUser]);

  const projectsCount = useMemo(() => {
    try {
      return (JSON.parse(localStorage.getItem('student_projects') || '[]')).length;
    } catch {
      return 0;
    }
  }, []);

  const certificatesCount = useMemo(() => {
    try {
      return (JSON.parse(localStorage.getItem('student_certificates') || '[]')).length;
    } catch {
      return 0;
    }
  }, []);

  const notesCount = useMemo(() => {
    try {
      return (JSON.parse(localStorage.getItem('student_notes') || '[]')).length;
    } catch {
      return 0;
    }
  }, []);

  const hudInfo = useMemo(() => {
    return calculateHudInfo(hudTime, savedTimetable, holidays, customEvents, academicEvents);
  }, [hudTime, savedTimetable, holidays, customEvents, academicEvents]);

  const selectedDayDateStr = useMemo(() => {
    return getDateForWeekday(selectedScheduleDay, hudTime);
  }, [selectedScheduleDay, hudTime]);

  const selectedDayHoliday = useMemo(() => {
    if (!selectedDayDateStr || !holidays) return null;
    return holidays.find(h => h.date === selectedDayDateStr);
  }, [selectedDayDateStr, holidays]);

  const selectedDayExtraClasses = useMemo(() => {
    if (!selectedDayDateStr || !customEvents) return [];
    return customEvents.filter(e => {
      if (e.date !== selectedDayDateStr) return false;
      return e.category === 'academic' || e.title.toLowerCase().includes('class');
    });
  }, [selectedDayDateStr, customEvents]);

  const todaySchedule = useMemo(() => {
    const isNoClass = checkIsNoClassPeriod(selectedDayDateStr, holidays);
    const todayName = DAY_NAMES[new Date().getDay()];
    const isToday = selectedScheduleDay === todayName;

    if (isNoClass) {
      // Return only exams and extra classes for this date
      const dayExams = academicEvents ? academicEvents.filter(e => {
        const matchesDate = e.date === selectedDayDateStr || (e.endDate && selectedDayDateStr >= e.date && selectedDayDateStr <= e.endDate);
        return matchesDate && (e.category === 'exam' || e.name.toLowerCase().includes('exam'));
      }) : [];
      
      const dayExtraClasses = customEvents ? customEvents.filter(e => {
        return e.date === selectedDayDateStr && (e.category === 'academic' || e.title.toLowerCase().includes('class'));
      }) : [];
      
      const slots = [];
      
      // 1. Add exams
      dayExams.forEach((exam) => {
        slots.push({
          time: '09:00 - 17:00', // standard exam block
          entries: [{
            code: 'EXAM',
            title: exam.name,
            venue: 'Exam Hall',
            type: 'Examination'
          }]
        });
      });
      
      // 2. Add extra classes
      dayExtraClasses.forEach(ec => {
        let timeStr = ec.time || '10:00 - 12:00';
        if (ec.time && ec.endTime) {
          timeStr = `${ec.time} - ${ec.endTime}`;
        }
        slots.push({
          time: timeStr,
          entries: [{
            code: ec.title.substring(0, 10).toUpperCase(),
            title: ec.title,
            venue: ec.venue || 'TBA',
            type: 'Extra Class'
          }]
        });
      });

      // Sort slots chronologically
      const sorted = slots.sort((a, b) => {
        const parseTime = (t) => {
          if (!t) return 0;
          const m = t.trim().match(/(\d+):(\d+)/);
          if (!m) return 0;
          return parseInt(m[1]) * 60 + parseInt(m[2]);
        };
        const aStart = parseTime(a.time.split(/[-–—]/)[0]);
        const bStart = parseTime(b.time.split(/[-–—]/)[0]);
        return aStart - bStart;
      });

      const finalSchedule = sorted.map(slot => {
        const status = isToday ? getClassStatus(slot.time) : null;
        return { ...slot, status };
      });

      if (isToday) {
        const isCurrentlyRunning = finalSchedule.some(s => s.status === 'current');
        if (!isCurrentlyRunning) {
          const nextClass = finalSchedule.find(s => s.status === 'upcoming');
          if (nextClass) nextClass.status = 'next';
        }
      }
      
      return finalSchedule;
    }

    if (!savedTimetable) return [];
    const d = savedTimetable[selectedScheduleDay];
    if (!d) return [];
    
    // Sort chronologically
    const sorted = Object.entries(d).map(([time, entries]) => ({ time, entries })).sort((a, b) => {
      const parseTime = (t) => {
        if (!t) return 0;
        const m = t.trim().match(/(\d+):(\d+)/);
        if (!m) return 0;
        return parseInt(m[1]) * 60 + parseInt(m[2]);
      };
      const aStart = parseTime(a.time.split(/[-–—]/)[0]);
      const bStart = parseTime(b.time.split(/[-–—]/)[0]);
      return aStart - bStart;
    });

    // Determine highlighting (only for active today)
    const finalSchedule = sorted.map(slot => {
      const status = isToday ? getClassStatus(slot.time) : null;
      return { ...slot, status };
    });

    // Find the first upcoming class and mark it as 'next'
    if (isToday) {
      const isCurrentlyRunning = finalSchedule.some(s => s.status === 'current');
      if (!isCurrentlyRunning) {
        const nextClass = finalSchedule.find(s => s.status === 'upcoming');
        if (nextClass) nextClass.status = 'next';
      }
    }

    return finalSchedule;
  }, [savedTimetable, selectedScheduleDay, selectedDayDateStr, academicEvents, customEvents, holidays]);

  const allSlots = useMemo(() => {
    if (!savedTimetable) return [];
    const slots = new Set();
    Object.values(savedTimetable).forEach(daySlots => {
      Object.keys(daySlots).forEach(time => slots.add(time));
    });
    // Add standard Lunch Break if not present
    slots.add('13:00 - 14:00');
    // Sort slots chronologically
    return Array.from(slots).sort((a, b) => {
      const parseTime = (t) => {
        if (!t) return 0;
        const m = t.trim().match(/(\d+):(\d+)/);
        if (!m) return 0;
        return parseInt(m[1]) * 60 + parseInt(m[2]);
      };
      const aStart = parseTime(a.split(/[-–—]/)[0]);
      const bStart = parseTime(b.split(/[-–—]/)[0]);
      return aStart - bStart;
    });
  }, [savedTimetable]);

  const todayMess = useMemo(() => {
    if (!messMenu) return null;
    const r = {};
    Object.entries(messMenu.meals).forEach(([name, meal]) => {
      r[name] = { time: meal.time, items: meal.items[selectedMessDay] || [] };
    });
    return r;
  }, [messMenu, selectedMessDay]);

  useEffect(() => {
    if (todayMess) {
      // 1. Check if any meal is currently running
      const runningMeal = Object.entries(todayMess).find(([_, meal]) => isCurrentMeal(meal.time));
      if (runningMeal) {
        setActiveMealTab(runningMeal[0]);
        return;
      }

      // 2. If nothing is running, find the upcoming meal tab
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      
      const mealList = Object.entries(todayMess).map(([name, meal]) => {
        const w = getMealWindow(meal.time);
        return { name, start: w ? w.start : 0 };
      }).sort((a, b) => a.start - b.start);

      // Find the first meal that starts after current time
      const upcoming = mealList.find(m => m.start > currentMins);
      if (upcoming) {
        setActiveMealTab(upcoming.name);
      } else {
        // If it's after the last meal (Dinner), default to Breakfast for the next cycle
        setActiveMealTab('Breakfast');
      }
    }
  }, [todayMess]);



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

  const cardContainerVariants = {
    hidden: isMobile 
      ? { opacity: 0, height: 0, overflow: 'hidden' }
      : { opacity: 0, width: 0 },
    visible: isMobile 
      ? { 
          opacity: 1, 
          height: 'auto',
          overflow: 'visible',
          transition: { 
            duration: 0.45, 
            ease: [0.4, 0, 0.2, 1],
            staggerChildren: 0.12
          }
        }
      : { 
          opacity: 1, 
          width: 160,
          transition: { 
            duration: 0.4, 
            ease: [0.4, 0, 0.2, 1],
            staggerChildren: 0.1
          }
        },
    exit: isMobile 
      ? { 
          opacity: 0, 
          height: 0,
          overflow: 'hidden',
          transition: { 
            duration: 0.35, 
            ease: [0.4, 0, 0.2, 1]
          }
        }
      : { 
          opacity: 0, 
          width: 0,
          transition: { 
            duration: 0.3, 
            ease: [0.4, 0, 0.2, 1]
          }
        }
  };

  const singleCardVariants = {
    hidden: isMobile 
      ? { y: -50, opacity: 0, scale: 0.85 }
      : { x: -160, opacity: 0 },
    visible: isMobile 
      ? { 
          y: 0, 
          opacity: 1, 
          scale: 1,
          transition: { 
            type: 'spring', 
            stiffness: 130, 
            damping: 16 
          } 
        }
      : { 
          x: 0, 
          opacity: 1, 
          transition: { 
            type: 'spring', 
            stiffness: 110, 
            damping: 15 
          } 
        },
    exit: isMobile 
      ? { 
          y: -50, 
          opacity: 0, 
          scale: 0.85,
          transition: { 
            duration: 0.25 
          } 
        }
      : { 
          x: -160, 
          opacity: 0, 
          transition: { 
            duration: 0.2 
          } 
        }
  };

  if (!currentUser) {
    return <LandingPage />;
  }

  const avatarUrl = getAvatarUrl(userProfile, currentUser?.email);
  const photoPosition = getPhotoPosition(userProfile);

  // Build formatted programme string: "BTech'22 3rd Year/Semester 6"
  const formattedProgramme = (() => {
    const prog = userProfile?.programme || '';
    const yoa = userProfile?.yearOfAdmission;
    const yr = userProfile?.currentYear || '';
    const sem = userProfile?.semester || '';
    let parts = [];
    if (prog) {
      let progStr = prog;
      if (yoa) progStr += `'${String(yoa).slice(-2)}`;
      parts.push(progStr);
    }
    if (yr || sem) {
      const yrSem = [yr, sem].filter(Boolean).join('/');
      parts.push(yrSem);
    }
    return parts.join(' ') || '—';
  })();

  const mainProfileFields = [
    { label: 'Name', value: userProfile?.name, rollNumber: userProfile?.rollNumber, isNameField: true },
    { label: 'Programme', value: formattedProgramme },
    { label: 'Branch', value: userProfile?.branch },
  ];

  // Add academic extras if set
  if (userProfile?.cgpa) mainProfileFields.push({ label: 'CGPA', value: userProfile.cgpa });
  if (userProfile?.minor) mainProfileFields.push({ label: 'Minor', value: userProfile.minor });
  if (userProfile?.hostelName) {
    const hName = userProfile.hostelName;
    let roomVal = '';
    if (userProfile.roomNumber) {
      const prefix = `${hName.split(' ')[0]}-`;
      if (userProfile.roomNumber.startsWith(prefix)) {
        roomVal = `${hName[0].toUpperCase()}-${userProfile.roomNumber.slice(prefix.length)}`;
      } else {
        roomVal = userProfile.roomNumber;
      }
    }
    mainProfileFields.push({
      label: 'Hostel',
      value: roomVal ? `${hName}/${roomVal}` : hName
    });
  }

  // Contact & link fields — shown in dropdown on mobile
  const contactFields = [];
  const privacy = userProfile?.privacy || { phone: false, email: false, social: true };
  if (privacy.email) contactFields.push({ label: 'Email', value: userProfile?.gmail || currentUser?.email });
  if (privacy.phone) contactFields.push({ label: 'Phone', value: userProfile?.phone });
  if (privacy.social) {
    if (userProfile?.github) contactFields.push({ label: 'Github', value: userProfile?.github, link: true });
    if (userProfile?.linkedin) contactFields.push({ label: 'LinkedIn', value: userProfile?.linkedin, link: true });
    if (userProfile?.instagram) contactFields.push({ label: 'Instagram', value: userProfile?.instagram, link: true });
  }

  const totalCredits = savedCourses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
  const todayName = DAY_NAMES[new Date().getDay()];

  return (
    <motion.div 
      className="page-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Interactive Page Ambient Background Glows */}
      <div className="page-ambient-bg">
        <div className="page-ambient-blob blob-1" style={{ '--blob-color': MOODS.find(m => m.id === activeMoodId)?.solidColor1 }} />
        <div className="page-ambient-blob blob-2" style={{ '--blob-color': MOODS.find(m => m.id === activeMoodId)?.solidColor2 }} />
        <div className="page-ambient-blob blob-3" style={{ '--blob-color': MOODS.find(m => m.id === activeMoodId)?.solidColor1 }} />
      </div>

      {/* Live Campus HUD */}
      <CampusHUD
        activeMoodId={activeMoodId}
        hudInfo={hudInfo}
        userProfile={userProfile}
        currentUser={currentUser}
        itemVariants={itemVariants}
      />

      {/* Live Visual Timeline Ribbon */}
      {todaySchedule.length > 0 && (
        <TimelineRibbon
          todaySchedule={todaySchedule}
          selectedScheduleDay={selectedScheduleDay}
          hudTime={hudTime}
          itemVariants={itemVariants}
        />
      )}

      <ProfileSection
        userProfile={userProfile}
        currentUser={currentUser}
        isMobile={isMobile}
        isDetailsExpanded={isDetailsExpanded}
        showQrId={showQrId}
        handleToggleQr={handleToggleQr}
        showContactInfo={showContactInfo}
        setShowContactInfo={setShowContactInfo}
        avatarUrl={avatarUrl}
        photoPosition={photoPosition}
        mainProfileFields={mainProfileFields}
        contactFields={contactFields}
        cardContainerVariants={cardContainerVariants}
        singleCardVariants={singleCardVariants}
        itemVariants={itemVariants}
        setActiveLightBoxImage={setActiveLightBoxImage}
        navigate={navigate}
      />

      {/* Today's Schedule + Mess */}
      <div className="home-bottom">
        <ScheduleSection
          selectedScheduleDay={selectedScheduleDay}
          setSelectedScheduleDay={setSelectedScheduleDay}
          todayName={todayName}
          savedTimetable={savedTimetable}
          setShowClassModal={setShowClassModal}
          selectedDayHoliday={selectedDayHoliday}
          selectedDayExtraClasses={selectedDayExtraClasses}
          todaySchedule={todaySchedule}
          selectedDayDateStr={selectedDayDateStr}
          holidays={holidays}
          isMobile={isMobile}
          itemVariants={itemVariants}
          userProfile={userProfile}
          currentUser={currentUser}
        />

        <MessMenuSection
          selectedMessDay={selectedMessDay}
          setSelectedMessDay={setSelectedMessDay}
          todayName={todayName}
          messMenu={messMenu}
          messLoading={messLoading}
          setShowMessModal={setShowMessModal}
          todayMess={todayMess}
          activeMealTab={activeMealTab}
          setActiveMealTab={setActiveMealTab}
          isMobile={isMobile}
          itemVariants={itemVariants}
        />
      </div>

      {/* QUICK LINKS & SUMMARY */}
      <div className="home-extras">
        <motion.div className="today-section academic-summary-section" variants={itemVariants}>
          <h3 className="section-title"><Book size={20} /> Academic Summary</h3>
          <div className="summary-cards">
            {/* 1. CGPA */}
            <div className="summary-card cgpa-card">
              <div className="summary-icon"><Award size={18} /></div>
              <div className="summary-info">
                <div className="summary-value">{userProfile?.cgpa || '—'}</div>
                <div className="summary-label">CGPA</div>
              </div>
            </div>
            
            {/* 2. Attendance */}
            <div className="summary-card attendance-card">
              <div className="summary-icon"><Percent size={18} /></div>
              <div className="summary-info">
                <div className="summary-value">{attendancePercentage !== null ? `${attendancePercentage}%` : '—'}</div>
                <div className="summary-label">Attendance</div>
              </div>
            </div>

            {/* 3. Pending Assignments */}
            <div className="summary-card assignments-card">
              <div className="summary-icon"><ClipboardList size={18} /></div>
              <div className="summary-info">
                <div className="summary-value">{assignmentsStats.pending}</div>
                <div className="summary-label">Assignments</div>
              </div>
            </div>

            {/* 4. Active Goals */}
            <div className="summary-card goals-card">
              <div className="summary-icon"><Target size={18} /></div>
              <div className="summary-info">
                <div className="summary-value">{goalsStats.active}</div>
                <div className="summary-label">Active Goals</div>
              </div>
            </div>

            {/* 5. Study Hours */}
            <div className="summary-card study-hours-card">
              <div className="summary-icon"><Clock size={18} /></div>
              <div className="summary-info">
                <div className="summary-value">{studyStats.hours}h</div>
                <div className="summary-label">Study Logged</div>
              </div>
            </div>

            {/* 6. Focus Streak */}
            <div className="summary-card streak-card">
              <div className="summary-icon"><Flame size={18} /></div>
              <div className="summary-info">
                <div className="summary-value">{studyStats.streak}d</div>
                <div className="summary-label">Study Streak</div>
              </div>
            </div>

            {/* 7. Total Credits */}
            <div className="summary-card credits-card">
              <div className="summary-icon"><Bookmark size={18} /></div>
              <div className="summary-info">
                <div className="summary-value">{totalCredits}</div>
                <div className="summary-label">Total Credits</div>
              </div>
            </div>

            {/* 8. Registered Courses */}
            <div className="summary-card courses-card">
              <div className="summary-icon"><BookOpen size={18} /></div>
              <div className="summary-info">
                <div className="summary-value">{savedCourses.length}</div>
                <div className="summary-label">Courses</div>
              </div>
            </div>

            {/* 9. Current Semester */}
            <div className="summary-card semester-card">
              <div className="summary-icon"><Layers size={18} /></div>
              <div className="summary-info">
                <div className="summary-value">{userProfile?.semester || '—'}</div>
                <div className="summary-label">Current Sem</div>
              </div>
            </div>

            {/* 10. Projects */}
            <div className="summary-card projects-card">
              <div className="summary-icon"><Folder size={18} /></div>
              <div className="summary-info">
                <div className="summary-value">{projectsCount}</div>
                <div className="summary-label">Projects</div>
              </div>
            </div>

            {/* 11. Certificates */}
            <div className="summary-card certificates-card">
              <div className="summary-icon"><Trophy size={18} /></div>
              <div className="summary-info">
                <div className="summary-value">{certificatesCount}</div>
                <div className="summary-label">Certificates</div>
              </div>
            </div>

            {/* 12. Academic Notes */}
            <div className="summary-card notes-card">
              <div className="summary-icon"><FileText size={18} /></div>
              <div className="summary-info">
                <div className="summary-value">{notesCount}</div>
                <div className="summary-label">Notes</div>
              </div>
            </div>

            {/* 13. Classes Today */}
            <div className="summary-card classes-card">
              <div className="summary-icon"><Clock size={18} /></div>
              <div className="summary-info">
                <div className="summary-value">{todaySchedule.length}</div>
                <div className="summary-label">Classes Today</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="today-section" variants={itemVariants}>
          <h3 className="section-title"><LinkIcon size={20} /> Quick Links & Resources</h3>
          <div className="quick-links-grid">
            <a href="#" className="quick-link-item"><Globe size={16} /> Canvas Portal</a>
            <a href="#" className="quick-link-item"><Book size={16} /> Library Catalog</a>
            <a href="#" className="quick-link-item"><Phone size={16} /> Campus Security</a>
            <a href="#" className="quick-link-item"><AlertCircle size={16} /> Health Center</a>
            <a href="#" className="quick-link-item"><Clock size={16} /> Shuttle Schedule</a>
            <a href="#" className="quick-link-item"><Calendar size={16} /> Academic Calendar</a>
          </div>
        </motion.div>
      </div>

      <HomeModals
        showClassModal={showClassModal}
        setShowClassModal={setShowClassModal}
        savedTimetable={savedTimetable}
        allSlots={allSlots}
        showMessModal={showMessModal}
        setShowMessModal={setShowMessModal}
        messMenu={messMenu}
        activeLightBoxImage={activeLightBoxImage}
        setActiveLightBoxImage={setActiveLightBoxImage}
        zoomedImage={zoomedImage}
        setZoomedImage={setZoomedImage}
      />

      <div className="page-footer">Built with ❤️ by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a></div>
    </motion.div>
  );
};

export default HomePage;
