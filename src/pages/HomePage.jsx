import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getDailyQuote } from '../data/quotes';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, BookOpen, MapPin, Edit2, Link as LinkIcon, Book, Clock, AlertCircle, Phone, Globe, Sun, Moon, Sunrise, Sunset, Coffee, Sparkles, Eye, X, QrCode, CreditCard, ChevronDown, ChevronLeft, ChevronRight, Home, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCalendar } from '../contexts/CalendarContext';
import { fetchAndParseMessMenu } from '../utils/messParser';
import { getAvatarUrl, getPhotoPosition } from '../utils/avatarUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import LandingPage from './LandingPage';

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const getMealWindow = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const parseTime = (t) => {
    if (!t) return 0;
    const m = t.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!m) return 0;
    let h = parseInt(m[1]); const min = parseInt(m[2]);
    if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
    if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
    return h * 60 + min;
  };
  const parts = timeStr.split(/[-–—]|\bto\b/i).map(s => s.trim());
  if (parts.length < 2) return null;
  return { start: parseTime(parts[0]), end: parseTime(parts[1]) };
};

const isCurrentMeal = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return false;
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const w = getMealWindow(timeStr);
  return w && mins >= w.start && mins <= w.end;
};

const getClassWindow = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const parseTime = (t) => {
    if (!t) return 0;
    const m = t.trim().match(/(\d+):(\d+)/);
    if (!m) return 0;
    return parseInt(m[1]) * 60 + parseInt(m[2]);
  };
  const parts = timeStr.split(/[-–—]/).map(s => s.trim());
  if (parts.length < 2) return null;
  return { start: parseTime(parts[0]), end: parseTime(parts[1]) };
};

// Helper for class highlighting
const getClassStatus = (timeStr) => {
  const w = getClassWindow(timeStr);
  if (!w) return null;
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  if (currentMins >= w.start && currentMins <= w.end) return 'current';
  if (currentMins < w.start) return 'upcoming';
  return 'past';
};

const getHue = (code) => {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = code.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % 360;
};

const MOODS = [
  {
    id: 'focus',
    label: 'Focus',
    emoji: '🚀',
    color1: 'rgba(99, 102, 241, 0.15)', // indigo
    color2: 'rgba(168, 85, 247, 0.15)', // purple
    solidColor1: '#6366f1',
    solidColor2: '#a855f7',
    quote: 'Make today your masterpiece. Focus on your goals.'
  },
  {
    id: 'chill',
    label: 'Chill',
    emoji: '☕',
    color1: 'rgba(16, 185, 129, 0.15)', // emerald
    color2: 'rgba(6, 182, 212, 0.15)', // cyan
    solidColor1: '#10b981',
    solidColor2: '#06b6d4',
    quote: 'Take it easy. A calm mind is a powerful mind.'
  },
  {
    id: 'grind',
    label: 'Grind',
    emoji: '📚',
    color1: 'rgba(245, 158, 11, 0.15)', // amber
    color2: 'rgba(239, 68, 68, 0.15)', // red/rose
    solidColor1: '#f59e0b',
    solidColor2: '#ef4444',
    quote: 'Hustle in silence. Let your success make the noise.'
  },
  {
    id: 'creative',
    label: 'Creative',
    emoji: '🎨',
    color1: 'rgba(236, 72, 153, 0.15)', // pink
    color2: 'rgba(244, 63, 94, 0.15)', // rose
    solidColor1: '#ec4899',
    solidColor2: '#f43f5e',
    quote: 'Creativity is intelligence having fun.'
  }
];

const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateForWeekday = (targetDayName, referenceDate = new Date()) => {
  const currentDayIndex = referenceDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const targetDayIndex = DAY_NAMES.indexOf(targetDayName);
  if (targetDayIndex === -1) return null;
  
  const diff = targetDayIndex - currentDayIndex;
  const targetDate = new Date(referenceDate);
  targetDate.setDate(referenceDate.getDate() + diff);
  return getLocalDateString(targetDate);
};

const checkIsNoClassPeriod = (dateStr, holidaysList) => {
  if (!dateStr) return false;
  
  // 1. Is it a holiday?
  const isHoliday = holidaysList && holidaysList.some(h => h.date === dateStr);
  if (isHoliday) return true;
  
  // 2. Is it mid-semester recess?
  const isRecess = (dateStr >= '2026-10-17' && dateStr <= '2026-10-25') || 
                  (dateStr >= '2027-03-20' && dateStr <= '2027-03-28');
  if (isRecess) return true;
  
  // 3. After last day of classes to classes commence of next semester
  const isVacation = (dateStr > '2026-11-19' && dateStr < '2027-01-04') || 
                     (dateStr > '2027-04-22');
  if (isVacation) return true;
  
  return false;
};

const HOLIDAY_CREATIVES = {
  'Raksha Bandhan': {
    wish: 'Happy Raksha Bandhan',
    hudText: 'Celebrating the sacred bond of love & protection 🧵✨',
    title: 'Raksha Bandhan Celebrations 🧵❤️',
    message: (name) => `Hey ${name}, today is Raksha Bandhan! Time to celebrate the beautiful bond of love, support, and protection between siblings. Tie a thread of love, enjoy the sweets, and cherish your family time!`,
    gradient: 'linear-gradient(135deg, #f472b6 0%, #fb7185 100%)',
    textColor: '#ffffff',
    emoji: '🧵'
  },
  'Diwali (Deepavali)': {
    wish: 'Happy Diwali',
    hudText: 'May your life be illuminated with joy & success 🪔✨',
    title: 'Diwali - The Festival of Lights 🪔🌟',
    message: (name) => `Wishing you a very Happy Diwali, ${name}! May the festival of lights bring endless joy, prosperity, and success to your academic and personal life. Light up some diyas and spread happiness!`,
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    textColor: '#ffffff',
    emoji: '🪔'
  },
  'Holi': {
    wish: 'Happy Holi',
    hudText: 'Splash the colors of joy, love, and laughter! 🎨💦',
    title: 'Holi - Festival of Colors 🎨🌸',
    message: (name) => `Happy Holi, ${name}! Let your day be filled with vibrant colors of happiness, friendships, and delicious gujiyas. Have a safe and joyful celebration with your friends and family!`,
    gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    textColor: '#ffffff',
    emoji: '🎨'
  },
  'Independence Day': {
    wish: 'Happy Independence Day',
    hudText: "Saluting our nation's freedom and unity! 🇮🇳✨",
    title: 'Independence Day 🇮🇳🎖️',
    message: (name) => `Wishing you a Happy Independence Day, ${name}! Let us honor the sacrifices of our heroes and take pride in our nation's progress. Jai Hind!`,
    gradient: 'linear-gradient(135deg, #f97316 0%, #16a34a 100%)',
    textColor: '#ffffff',
    emoji: '🇮🇳'
  },
  'Republic Day': {
    wish: 'Happy Republic Day',
    hudText: 'Celebrating the spirit of our Constitution! 🇮🇳✨',
    title: 'Republic Day 🇮🇳📜',
    message: (name) => `Happy Republic Day, ${name}! Today we celebrate the democratic spirit and sovereignty of our nation. Let's pledge to build a brighter future together.`,
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #16a34a 100%)',
    textColor: '#ffffff',
    emoji: '🇮🇳'
  },
  'Christmas Day': {
    wish: 'Merry Christmas',
    hudText: 'Wishing you peace, joy, and merry moments! 🎄🎁',
    title: 'Merry Christmas! 🎄🎅',
    message: (name) => `Merry Christmas, ${name}! May your holidays be filled with warmth, laughter, and cozy vibes. Enjoy the cake, music, and the magical winter season!`,
    gradient: 'linear-gradient(135deg, #ef4444 0%, #10b981 100%)',
    textColor: '#ffffff',
    emoji: '🎄'
  },
  "New Year's Day": {
    wish: 'Happy New Year',
    hudText: "Here's to 365 new chapters and opportunities! 🎉✨",
    title: 'Happy New Year! 🎉',
    message: (name) => `Happy New Year, ${name}! May this year bring you closer to your goals, with new achievements, growth, and wonderful memories. Let's make it count!`,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    textColor: '#ffffff',
    emoji: '🎉'
  },
  'Janmashtami (Vaishnavi)': {
    wish: 'Happy Janmashtami',
    hudText: 'Celebrating the birth of Lord Krishna! 🪈✨',
    title: 'Krishna Janmashtami 🪈🍶',
    message: (name) => `Wishing you a blessed Janmashtami, ${name}! May Lord Krishna bless you with wisdom, strength, and love. Enjoy the festive celebrations and Dahi Handi!`,
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #f472b6 100%)',
    textColor: '#ffffff',
    emoji: '🪈'
  },
  'Ganesh Chaturthi / Vinayaka Chaturthi': {
    wish: 'Happy Ganesh Chaturthi',
    hudText: 'May Lord Ganesha remove all obstacles! 🌺✨',
    title: 'Ganesh Chaturthi 🌺🐘',
    message: (name) => `Happy Ganesh Chaturthi, ${name}! May Bappa bless you with wisdom, prosperity, and success in all your academic endeavors. Ganpati Bappa Morya!`,
    gradient: 'linear-gradient(135deg, #f97316 0%, #fb7185 100%)',
    textColor: '#ffffff',
    emoji: '🌺'
  },
  'Dussehra (Vijay Dashami)': {
    wish: 'Happy Dussehra',
    hudText: 'Celebrating the victory of good over evil! 🏹✨',
    title: 'Dussehra / Vijayadashami 🏹🔥',
    message: (name) => `Happy Dussehra, ${name}! Today we celebrate the triumph of righteousness and light over darkness. May all obstacles in your path be conquered!`,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
    textColor: '#ffffff',
    emoji: '🏹'
  },
  'Makar Sankranti / Pongal': {
    wish: 'Happy Makar Sankranti',
    hudText: 'May your dreams soar high like kites! 🪁🌾',
    title: 'Makar Sankranti & Pongal 🪁🌾',
    message: (name) => `Happy Makar Sankranti and Pongal, ${name}! Wishing you a harvest of happiness, good health, and success. Let your spirit soar high like a colorful kite!`,
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #06b6d4 100%)',
    textColor: '#ffffff',
    emoji: '🪁'
  },
  'Maha Shivratri': {
    wish: 'Happy Maha Shivratri',
    hudText: 'May the divine blessings of Lord Shiva be with you 🔱✨',
    title: 'Maha Shivratri 🔱🌌',
    message: (name) => `Wishing you a blessed Maha Shivratri, ${name}! May Lord Shiva guide you to the path of wisdom, peace, and focus. Have a peaceful day!`,
    gradient: 'linear-gradient(135deg, #111827 0%, #4b5563 100%)',
    textColor: '#ffffff',
    emoji: '🔱'
  },
  'Good Friday': {
    wish: 'Blessed Good Friday',
    hudText: 'Remembering the grace, love, and sacrifice ✝️✨',
    title: 'Good Friday ✝️🕊️',
    message: (name) => `Hi ${name}, today is Good Friday. It is a day of reflection, remembrance, and gratitude for the boundless love and sacrifice. Have a thoughtful and peaceful day.`,
    gradient: 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)',
    textColor: '#ffffff',
    emoji: '✝'
  },
  "Idu'l Fitr": {
    wish: 'Eid Mubarak',
    hudText: 'Eid Mubarak! May peace & happiness bless your home 🌙✨',
    title: 'Eid-ul-Fitr Mubarak 🌙🕌',
    message: (name) => `Eid Mubarak, ${name}! Wishing you a wonderful celebration filled with peace, love, delicious biryani and sheer khurma, and quality time with your family!`,
    gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
    textColor: '#ffffff',
    emoji: '🌙'
  },
  'Id-ul-Zuha (Bakrid)': {
    wish: 'Eid Mubarak',
    hudText: 'Eid Mubarak! Wishing you peace, sacrifice, and joy 🌙✨',
    title: 'Eid-al-Adha Mubarak 🌙🐏',
    message: (name) => `Eid Mubarak, ${name}! May this sacred day bring you and your family closer in spirit, peace, and abundance. Have a blessed and joyful day.`,
    gradient: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
    textColor: '#ffffff',
    emoji: '🌙'
  }
};

const getDefaultHolidayCreative = (holidayName) => {
  const cleanName = holidayName.split('(')[0].split('/')[0].trim();
  return {
    wish: `Happy ${cleanName}`,
    hudText: `No classes today! Celebrating ${cleanName} 🎉✨`,
    title: `${holidayName} Holiday 🎉`,
    message: (name) => `Wishing you a happy and restful ${cleanName}, ${name}! Take this time to relax, recharge, and enjoy a wonderful break from classes.`,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    textColor: '#ffffff',
    emoji: '🎉'
  };
};

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

  const hudInfo = useMemo(() => {
    const hrs = hudTime.getHours();
    let text = 'Good Evening';
    let Icon = Moon;
    let color = '#a78bfa';
    let temp = '22°C 🌙';
    let label = 'Clear Sky';
    let quote = 'Rest and recharge. Tomorrow is a brand new page.';

    if (hrs >= 5 && hrs < 12) {
      text = 'Good Morning';
      Icon = Sunrise;
      color = '#fb7185';
      temp = '24°C ☀️';
      label = 'Sunny & Fresh';
      quote = 'Rise up, start fresh, see the bright opportunity in each day.';
    } else if (hrs >= 12 && hrs < 17) {
      text = 'Good Afternoon';
      Icon = Sun;
      color = '#fbbf24';
      temp = '32°C 🌤️';
      label = 'Warm & Bright';
      quote = 'Focus on being productive, not busy.';
    } else if (hrs >= 17 && hrs < 21) {
      text = 'Good Evening';
      Icon = Sunset;
      color = '#f472b6';
      temp = '28°C ⛅';
      label = 'Pleasant Sunset';
      quote = 'Great things are done by a series of small things brought together.';
    } else {
      text = 'Good Night';
      Icon = Moon;
      color = '#a78bfa';
      temp = '22°C 🌙';
      label = 'Clear Starry Sky';
      quote = 'Rest and recharge. Tomorrow is a brand new page.';
    }

    const todayDateStr = getLocalDateString(hudTime);
    const todayHoliday = holidays ? holidays.find(h => h.date === todayDateStr) : null;
    let isHolidayToday = false;
    let holidayCreative = null;
    if (todayHoliday) {
      isHolidayToday = true;
      holidayCreative = HOLIDAY_CREATIVES[todayHoliday.name] || getDefaultHolidayCreative(todayHoliday.name);
      text = holidayCreative.wish;
    }

    const dayName = DAY_NAMES[hudTime.getDay()];
    const dateNum = hudTime.getDate();
    const monthName = hudTime.toLocaleDateString('en-US', { month: 'long' });
    
    const mins = hudTime.getHours() * 60 + hudTime.getMinutes();
    const academicStart = 8 * 60 + 30;
    const academicEnd = 18 * 60 + 30; // 6:30 PM
    let progressPercent = 0;
    let progressLabel = 'Campus day has not started yet';

    if (mins >= academicStart && mins <= academicEnd) {
      progressPercent = Math.round(((mins - academicStart) / (academicEnd - academicStart)) * 100);
      progressLabel = 'Campus Day Progress';
    } else if (mins > academicEnd) {
      progressPercent = 100;
      progressLabel = 'Campus day completed! Enjoy your evening.';
    }

    const formattedTimeStr = hudTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const [timeVal, ampmVal] = formattedTimeStr.split(' ');
    const secVal = String(hudTime.getSeconds()).padStart(2, '0');

    // Live countdown calculation
    let countdownText = 'Relax, no classes today!';
    let countdownBadgeClass = 'status-badge-relax';
    
    // Check if there are extra academic/class events scheduled for today
    const todayExtraClasses = customEvents ? customEvents.filter(e => {
      if (e.date !== todayDateStr) return false;
      return e.category === 'academic' || e.title.toLowerCase().includes('class');
    }) : [];
    const hasExtraClassToday = todayExtraClasses.length > 0;

    // Check if there are exams scheduled for today
    const todayExams = academicEvents ? academicEvents.filter(e => {
      const matchesDate = e.date === todayDateStr || (e.endDate && todayDateStr >= e.date && todayDateStr <= e.endDate);
      return matchesDate && (e.category === 'exam' || e.name.toLowerCase().includes('exam'));
    }) : [];
    const hasExamToday = todayExams.length > 0;

    const isNoClassToday = checkIsNoClassPeriod(todayDateStr, holidays);

    if (isNoClassToday) {
      if (isHolidayToday && holidayCreative) {
        if (hasExtraClassToday) {
          const GEMINI_REPLIES = [
            "Wait, an extra class on a holiday? The grind never stops! 📚🔥",
            "Holiday logic: 404. Extra class: Active. Let's do this! 💻✨",
            "No sleeping in today—knowledge doesn't take holidays! 🧠⚡",
            "A holiday class? You're officially in the elite student tier now! 🎓🚀",
            "Even the campus is quiet, but our ambition is loud! 🏫💪",
            "Holiday vibe check: Cancelled by an extra class. Let's conquer it anyway! 📝🔥",
            "Who needs a day off when you can master the code? 💻✨",
            "Sacrificing holiday sleep for academic glory. Respect! 🫡🎓",
            "Class on a holiday? That's what we call a power move. ⚡🔥",
            "The professor said: 'Holiday? I think you mean Study-day!' 📚😅",
            "No holidays for future leaders. Your dedication is inspiring! 🚀🌟",
            "Just think of this extra class as your holiday bonus round! 🎁🎮",
            "Holiday classes: building character, one slide at a time. 📊💪",
            "Class is in session, even if the calendar says otherwise! 📅⚡",
            "Making history by studying while everyone else is sleeping! 📖✨"
          ];
          const stableIndex = (hudTime.getDate() + hudTime.getMonth()) % GEMINI_REPLIES.length;
          countdownText = GEMINI_REPLIES[stableIndex];
          countdownBadgeClass = 'status-badge-upcoming';
        } else if (hasExamToday) {
          countdownText = `Holiday Exam: ${todayExams[0].name} is ongoing! ✍️🎓`;
          countdownBadgeClass = 'status-badge-active';
        } else {
          countdownText = holidayCreative.hudText;
          countdownBadgeClass = 'status-badge-relax';
        }
      } else {
        // Recess or vacation
        if (hasExamToday) {
          countdownText = `Exams Ongoing: ${todayExams[0].name} ✍️🎓`;
          countdownBadgeClass = 'status-badge-active';
        } else if (hasExtraClassToday) {
          countdownText = `Extra Class Today: ${todayExtraClasses[0].title} 📚⚡`;
          countdownBadgeClass = 'status-badge-upcoming';
        } else {
          countdownText = 'Relax, campus recess/vacation is ongoing! 🏕️🌴';
          countdownBadgeClass = 'status-badge-relax';
        }
      }
    } else {
      const realTodayName = DAY_NAMES[hudTime.getDay()];
      const realTodaySchedule = (() => {
        if (!savedTimetable) return [];
        const d = savedTimetable[realTodayName];
        if (!d) return [];
        return Object.entries(d).map(([time, entries]) => ({ time, entries })).sort((a, b) => {
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
      })();

      if (realTodaySchedule.length > 0) {
        const activeEntry = realTodaySchedule.find(({ time }) => {
          const w = getClassWindow(time);
          return w && mins >= w.start && mins <= w.end;
        });

        if (activeEntry) {
          const w = getClassWindow(activeEntry.time);
          const mainEntry = activeEntry.entries[0] || {};
          const minsLeft = w.end - mins;
          countdownText = `Active class: ${mainEntry.code} ends in ${minsLeft}m (${mainEntry.venue || 'N/A'})`;
          countdownBadgeClass = 'status-badge-active';
        } else {
          const upcomingEntries = realTodaySchedule.filter(({ time }) => {
            const w = getClassWindow(time);
            return w && w.start > mins;
          });

          if (upcomingEntries.length > 0) {
            const nextEntry = upcomingEntries.sort((a, b) => getClassWindow(a.time).start - getClassWindow(b.time).start)[0];
            const w = getClassWindow(nextEntry.time);
            const mainEntry = nextEntry.entries[0] || {};
            const diff = w.start - mins;
            if (diff <= 60) {
              countdownText = `Next class: ${mainEntry.code} in ${diff}m (${mainEntry.venue || 'N/A'})`;
            } else {
              const startStr = nextEntry.time.split(/[-–—]/)[0].trim();
              countdownText = `Next class: ${mainEntry.code} at ${startStr}`;
            }
            countdownBadgeClass = 'status-badge-upcoming';
          } else {
            countdownText = 'All classes done for today!';
            countdownBadgeClass = 'status-badge-completed';
          }
        }
      } else {
        countdownText = 'Relax, no classes scheduled today!';
        countdownBadgeClass = 'status-badge-relax';
      }
    }

    return {
      greeting: text,
      GreetingIcon: Icon,
      greetingColor: color,
      dayName,
      dateNum,
      monthName,
      progressPercent,
      progressLabel,
      timeVal,
      ampmVal,
      secVal,
      weatherTemp: temp,
      weatherLabel: label,
      quote: isHolidayToday && holidayCreative ? holidayCreative.hudText : quote,
      countdownText,
      countdownBadgeClass
    };
  }, [hudTime, savedTimetable, holidays, customEvents]);

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
      <motion.div 
        className="campus-hud-card" 
        variants={itemVariants}
        style={{
          '--aurora-1-color': MOODS.find(m => m.id === activeMoodId)?.solidColor1,
          '--aurora-2-color': MOODS.find(m => m.id === activeMoodId)?.solidColor2,
          background: `linear-gradient(135deg, ${MOODS.find(m => m.id === activeMoodId)?.color1} 0%, ${MOODS.find(m => m.id === activeMoodId)?.color2} 100%), var(--card-bg)`,
          boxShadow: `0 12px 40px -10px ${MOODS.find(m => m.id === activeMoodId)?.color1.replace('0.15', '0.08')}`
        }}
      >
        {/* Dynamic Aurora Glow blobs */}
        <div className="hud-aurora-bg">
          <div className="aurora-blob aurora-1" />
          <div className="aurora-blob aurora-2" />
        </div>

        {/* Ambient Mood Header & Quote */}
        <div className="hud-top-bar">
          <div className="hud-quote-top">
            "{getDailyQuote()}"
          </div>
        </div>

        {/* Greeting Area */}
        <div className="hud-middle-section">
          <div className="hud-greeting-container">
            <div className="hud-greet-title">
              <span>{hudInfo.greeting}</span>
            </div>
            <div className="hud-greet-name">
              {userProfile?.firstName || (userProfile?.name || currentUser?.displayName || 'Student').trim().split(/\s+/)[0]}!
            </div>
          </div>
        </div>

        {/* Info Row: Time and Day (left), Weather/Temperature/Feel (right) */}
        <div className="hud-info-row">
          <div className="hud-time-date-container">
            <div className="hud-clock-large">
              {hudInfo.timeVal}
              <span className="seconds">:{hudInfo.secVal}</span>
              <span className="ampm" style={{ fontSize: '1.25rem', marginLeft: '0.25rem', verticalAlign: 'middle', textTransform: 'uppercase' }}>{hudInfo.ampmVal}</span>
            </div>
            <div className="hud-date-large">
              {hudInfo.dayName} • {hudInfo.dateNum} {hudInfo.monthName}
            </div>
          </div>
          
          <div className="hud-weather-container">
            <div className="hud-weather-temp">
              {hudInfo.weatherTemp}
            </div>
            <div className="hud-weather-label">
              {hudInfo.weatherLabel}
            </div>
          </div>
        </div>

        {/* Campus Day Progress (stacked below Time/Date row) */}
        <div className="hud-bottom-progress-row">
          <div className="hud-right-progress-block">
            {/* Active Class Notification above progress bar */}
            <div className={`hud-countdown-above-progress ${hudInfo.countdownBadgeClass}`}>
              <Sparkles size={12} style={{ color: 'inherit' }} />
              <span>{hudInfo.countdownText}</span>
            </div>

            {/* Bottom Progress Tracker */}
            <div className="hud-progress-section">
              <div className="hud-progress-header">
                <span>{hudInfo.progressLabel}</span>
                <span>{hudInfo.progressPercent}%</span>
              </div>
              <div className="hud-progress-bar-bg">
                <div className="hud-progress-bar-fill" style={{ width: `${hudInfo.progressPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Live Visual Timeline Ribbon */}
      {/* Live Visual Timeline Ribbon */}
      {todaySchedule.length > 0 && (
        <motion.div className="card timeline-ribbon-card" variants={itemVariants}>
          <div className="timeline-ribbon-header">
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
              <Clock size={16} style={{ color: 'var(--primary)' }} /> Live Day Timeline ({selectedScheduleDay})
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>8:30 AM - 6:30 PM</span>
          </div>
          
          {(() => {
            const currentMins = hudTime.getHours() * 60 + hudTime.getMinutes();
            const isToday = selectedScheduleDay === DAY_NAMES[hudTime.getDay()];
            const academicStart = 8 * 60 + 30; // 8:30 AM
            const academicEnd = 18 * 60 + 30; // 6:30 PM

            const markers = [
              { label: '8:30', time: 8 * 60 + 30, left: 0 },
              { label: '10:00', time: 10 * 60, left: 14.286 },
              { label: '11:30', time: 11 * 60 + 30, left: 28.571 },
              { label: '13:00', time: 13 * 60, left: 42.857 },
              { label: '14:00', time: 14 * 60, left: 57.143 },
              { label: '15:30', time: 15 * 60 + 30, left: 71.429 },
              { label: '17:00', time: 17 * 60, left: 85.714 },
              { label: '18:30', time: 18 * 60 + 30, left: 100 }
            ];

            const getTimePos = (mins) => {
              if (mins <= markers[0].time) return 0;
              if (mins >= markers[markers.length - 1].time) return 100;
              for (let i = 0; i < markers.length - 1; i++) {
                const m1 = markers[i];
                const m2 = markers[i + 1];
                if (mins >= m1.time && mins <= m2.time) {
                  const t = (mins - m1.time) / (m2.time - m1.time);
                  return m1.left + t * (m2.left - m1.left);
                }
              }
              return 0;
            };

            return (
              <div className="timeline-ribbon-container">
                {/* Live Progress Track Base Overlay */}
                {isToday && currentMins >= academicStart && (
                  <div 
                    className="timeline-progress-track" 
                    style={{ width: `${Math.min(100, getTimePos(currentMins))}%` }} 
                  />
                )}

                {/* Hour Grid Markers */}
                <div className="timeline-markers">
                  {markers.map(marker => {
                    const passed = isToday && currentMins > marker.time;
                    const active = isToday && Math.abs(currentMins - marker.time) < 15;
                    const markerStatus = passed ? 'passed' : active ? 'active' : '';
                    return (
                      <div key={marker.label} className={`timeline-marker ${markerStatus}`} style={{ left: `${marker.left}%` }}>
                        <span 
                          className="marker-label"
                          style={{
                            transform: marker.left === 0 ? 'translateX(50%)' : marker.left === 100 ? 'translateX(-50%)' : 'none',
                            display: 'inline-block'
                          }}
                        >
                          {marker.label}
                        </span>
                        <div className="marker-line" />
                      </div>
                    );
                  })}
                </div>

                {/* Course Blocks */}
                <div className="timeline-blocks">
                  {todaySchedule.map(({ time, entries }) => {
                    const w = getClassWindow(time);
                    if (!w) return null;
                    const startMin = w.start;
                    const endMin = w.end;
                    
                    const left = getTimePos(startMin);
                    const right = getTimePos(endMin);
                    const width = right - left;
                    const mainEntry = entries[0] || {};
                    
                    const passed = isToday && currentMins > endMin;
                    const active = isToday && currentMins >= startMin && currentMins <= endMin;
                    const statusClass = passed ? 'past-course' : active ? 'active-course' : 'upcoming-course';
                    
                    return (
                      <div 
                        key={time} 
                        className={`timeline-block ${statusClass}`}
                        style={{ 
                          left: `${left}%`, 
                          width: `${width}%`,
                          '--hue': getHue(mainEntry.code || 'CS')
                        }}
                        title={`${mainEntry.code}: ${time} (${mainEntry.venue || 'N/A'})`}
                      >
                        <span className="block-code">
                          {active && <span className="live-dot" />}
                          {mainEntry.code}
                        </span>
                        {mainEntry.venue && <span className="block-venue-badge">{mainEntry.venue}</span>}
                      </div>
                    );
                  })}

                  {/* Lunch Break Block */}
                  {(() => {
                    const lunchStart = 13 * 60;
                    const lunchEnd = 14 * 60;
                    const isLunchActive = isToday && currentMins >= lunchStart && currentMins <= lunchEnd;
                    const isLunchPassed = isToday && currentMins > lunchEnd;
                    const lunchClass = isLunchActive ? 'active-lunch' : isLunchPassed ? 'past-lunch' : '';
                    const lunchLeft = getTimePos(lunchStart);
                    const lunchWidth = getTimePos(lunchEnd) - lunchLeft;
                    return (
                      <div 
                        className={`timeline-block lunch-block ${lunchClass}`}
                        style={{ left: `${lunchLeft}%`, width: `${lunchWidth}%` }}
                        title="Lunch Break: 13:00 - 14:00"
                      >
                        <Coffee size={12} className={isLunchActive ? 'pulse-icon' : ''} />
                        <span>Lunch</span>
                      </div>
                    );
                  })()}

                  {/* Current Time Pointer Line */}
                  {isToday && currentMins >= academicStart && currentMins <= academicEnd && (() => {
                    const pointerLeft = getTimePos(currentMins);
                    return (
                      <div className="timeline-now-pointer" style={{ left: `${pointerLeft}%` }}>
                        <div 
                          className="pointer-tooltip"
                          style={{
                            left: pointerLeft < 12 ? '0px' : pointerLeft > 88 ? 'auto' : '50%',
                            right: pointerLeft > 88 ? '0px' : 'auto',
                            transform: pointerLeft < 12 ? 'none' : pointerLeft > 88 ? 'none' : 'translateX(-50%)'
                          }}
                        >
                          {`${hudTime.getHours() % 12 || 12}:${hudTime.getMinutes().toString().padStart(2, '0')}:${hudTime.getSeconds().toString().padStart(2, '0')} ${hudTime.getHours() >= 12 ? 'PM' : 'AM'}`}
                        </div>
                        <div className="pointer-dot" />
                        <div className="pointer-line" />
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}

      <div 
        className="home-top" 
        style={{ 
          gridTemplateColumns: (!isMobile && isDetailsExpanded) ? '28% auto 1fr' : undefined,
          transition: !isMobile ? 'grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
        }}
      >
        {/* LEFT 30% - Avatar & Identity */}
        <motion.div className="profile-left" variants={itemVariants} style={{ zIndex: 10, position: 'relative' }}>
          <h2 className="profile-username">{userProfile?.username || currentUser?.displayName || 'Student'}</h2>
          
          <div className="avatar-containment-cell">
            {/* Tech targeting bracket corners */}
            <div className="avatar-tech-corner top-left" />
            <div className="avatar-tech-corner top-right" />
            <div className="avatar-tech-corner bottom-left" />
            <div className="avatar-tech-corner bottom-right" />
            
            {/* Futuristic ambient back glow */}
            <div className="avatar-ambient-glow" />
            
            {/* Floating double orbit rings */}
            <div className="avatar-orbital-ring ring-outer" />
            <div className="avatar-orbital-ring ring-inner" />
            
            {/* Main photo frame */}
            <div className={`avatar-photo-frame aspect-${userProfile?.photoAspectRatio || 'card'}`}>
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className="profile-avatar-large" 
                style={{ 
                  objectPosition: photoPosition,
                  '--img-zoom': (userProfile?.photoZoom ?? 100) / 100,
                  '--img-rot': `${userProfile?.photoRotation ?? 0}deg`
                }} 
              />
              <div className="avatar-hologram-sheen" />
            </div>
          </div>

          <div className="profile-student-id">ID: {userProfile?.rollNumber || '—'}</div>

          {/* QR / ID Card Toggle Button */}
          {userProfile?.messQrBase64 || userProfile?.studentIdBase64 ? (
            <div className="qr-id-dropdown" style={{ width: '100%', marginTop: '0.75rem' }}>
              <button className="qr-id-toggle" onClick={handleToggleQr} style={{ cursor: 'pointer', width: '100%', whiteSpace: 'nowrap' }}>
              <CreditCard size={13} /> {showQrId ? 'Hide My Cards' : 'Show My Cards'} <ChevronDown size={13} style={{ transform: showQrId ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
            </div>
          ) : (
            <div className="qr-id-upload-prompt" style={{ marginTop: '0.75rem', width: '100%' }}>
              <button 
                className="btn btn-outline btn-sm" 
                style={{ fontSize: '0.75rem', gap: '0.4rem', width: '100%', cursor: 'pointer', whiteSpace: 'nowrap' }}
                onClick={() => navigate('/settings', { state: { openSection: 'messqr' } })}
              >
                <QrCode size={14} /> Upload QR & ID Card
              </button>
            </div>
          )}
        </motion.div>

        {/* MIDDLE COLUMN - Vertically stacked QR/ID cards that slide out from behind profile-left */}
        <AnimatePresence>
          {showQrId && (
            <motion.div
              variants={cardContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
                justifyContent: 'center',
                overflow: 'hidden',
                zIndex: 5,
                position: 'relative',
                paddingLeft: isMobile ? 0 : '0.5rem',
                paddingTop: isMobile ? '0.5rem' : 0,
                height: isMobile ? 'auto' : '100%',
                width: isMobile ? '100%' : 'auto',
                alignItems: isMobile ? 'center' : 'stretch'
              }}
            >
              {userProfile?.messQrBase64 && (
                <motion.div 
                  variants={singleCardVariants}
                  className="qr-id-card"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '0.4rem',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: isMobile ? 'auto' : 'auto',
                    width: isMobile ? '280px' : '100%',
                    aspectRatio: isMobile ? '1 / 1' : 'auto',
                    flex: isMobile ? 'none' : '1',
                    minHeight: 0,
                    overflow: 'hidden'
                  }}
                >
                  <label style={{ margin: '0 0 0.15rem 0', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mess QR</label>
                  <img 
                    src={userProfile.messQrBase64} 
                    alt="Mess QR" 
                    style={{ 
                      cursor: 'pointer',
                      width: isMobile ? '240px' : '100%',
                      height: isMobile ? '240px' : 'auto',
                      flex: isMobile ? 'none' : '1',
                      minHeight: 0,
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: '#fff'
                    }}
                    onClick={() => setActiveLightBoxImage({ url: userProfile.messQrBase64, label: 'Mess QR' })}
                  />
                </motion.div>
              )}

              {userProfile?.studentIdBase64 && (
                <motion.div 
                  variants={singleCardVariants}
                  className="qr-id-card"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '0.4rem',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: isMobile ? 'auto' : 'auto',
                    width: isMobile ? '100%' : '100%',
                    maxWidth: isMobile ? '260px' : '100%',
                    flex: isMobile ? 'none' : '1',
                    minHeight: 0,
                    overflow: 'hidden'
                  }}
                >
                  <label style={{ margin: '0 0 0.15rem 0', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student ID</label>
                  <img 
                    src={userProfile.studentIdBase64} 
                    alt="Student ID" 
                    style={{ 
                      cursor: 'pointer',
                      width: '100%',
                      flex: isMobile ? 'none' : '1',
                      minHeight: 0,
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: '#fff'
                    }}
                    onClick={() => setActiveLightBoxImage({ url: userProfile.studentIdBase64, label: 'Student ID Card' })}
                  />
                </motion.div>
              )}

              {(!userProfile?.messQrBase64 || !userProfile?.studentIdBase64) && (
                <motion.div
                  variants={singleCardVariants}
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px dashed var(--border)',
                    borderRadius: '12px',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    aspectRatio: isMobile ? 'auto' : '1.58 / 1',
                    height: isMobile ? 'auto' : 'auto',
                    width: isMobile ? '100%' : '100%',
                    maxWidth: isMobile ? '260px' : '100%',
                    flex: isMobile ? 'none' : '1',
                    textAlign: 'center'
                  }}
                >
                  <button 
                    className="btn btn-ghost btn-xs" 
                    style={{ width: '100%', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', padding: '0.2rem' }}
                    onClick={() => navigate('/settings', { state: { openSection: 'messqr' } })}
                  >
                    <QrCode size={12} /> Add missing {!userProfile?.messQrBase64 ? 'Mess QR' : 'Student ID'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* RIGHT 70% - Profile Details (View Only) */}
        <motion.div className="profile-right" variants={itemVariants}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '.5rem', margin: 0 }}><User size={18} /> Profile Details</h3>
          </div>

          <div 
            className="profile-details-grid"
            style={{
              gridTemplateColumns: (!isMobile && isDetailsExpanded) ? '1fr 1fr' : undefined
            }}
          >
            {(() => {
              const combinedFields = [
                ...mainProfileFields,
                ...(!isMobile ? contactFields : [])
              ];
              const maxFields = isDetailsExpanded ? 6 : 9;
              const visibleFields = combinedFields.slice(0, maxFields);
              
              return visibleFields.map(({ label, value, link, isNameField, rollNumber }) => (
                <div key={label} className="profile-detail-item">
                  <span className="detail-label">{label}</span>
                  {isNameField ? (
                    <span className="detail-value">
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{value || '—'}</span>
                      {rollNumber && <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.3rem' }}>({rollNumber})</span>}
                    </span>
                  ) : (
                    <span className="detail-value">
                      {link && value ? <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer">{value}</a> : (value || '—')}
                    </span>
                  )}
                </div>
              ));
            })()}
          </div>

          {/* Mobile Contact & Links Dropdown - initially collapsed */}
          {isMobile && (
            <div className="profile-contact-dropdown">
              <button className="profile-contact-toggle" onClick={() => setShowContactInfo(!showContactInfo)}>
                <LinkIcon size={14} />
                <span>Contact & Links</span>
                <ChevronDown size={14} style={{ transform: showContactInfo ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease', marginLeft: 'auto' }} />
              </button>
              {showContactInfo && (
                <div className="profile-contact-items">
                  {contactFields.length > 0 ? (
                    <>
                      {contactFields.map(({ label, value, link }) => (
                        <div key={label} className="profile-detail-item">
                          <span className="detail-label">{label}</span>
                          <span className="detail-value">
                            {link && value ? <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer">{value}</a> : (value || '—')}
                          </span>
                        </div>
                      ))}
                      <div style={{ gridColumn: 'span 2', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                        <button 
                          className="btn btn-ghost btn-xs" 
                          style={{ width: '100%', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' }}
                          onClick={() => navigate('/settings', { state: { openSection: 'contact' } })}
                        >
                          <Edit2 size={12} /> Manage Contact & Socials
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '0.75rem 0.25rem', textAlign: 'center', fontSize: '0.8rem', gridColumn: 'span 2' }}>
                      <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>No public contact details setup yet.</p>
                      <button 
                        className="btn btn-outline btn-sm" 
                        style={{ fontSize: '0.75rem', gap: '0.4rem', width: '100%', cursor: 'pointer' }}
                        onClick={() => navigate('/settings', { state: { openSection: 'contact' } })}
                      >
                        <Phone size={12} /> Setup Contact & Social Links
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Today's Schedule + Mess */}
      <div className="home-bottom">
        <motion.div className="today-section" variants={itemVariants}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 className="section-title" style={{ margin: 0 }}><Calendar size={20} /> Schedule — {selectedScheduleDay}{selectedScheduleDay === todayName ? ' (Today)' : ''}</h3>
              <div className="home-day-tabs">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => {
                  const isToday = d === todayName;
                  return (
                    <button
                      key={d}
                      className={`home-day-tab-btn ${selectedScheduleDay === d ? 'active' : ''}`}
                      onClick={() => setSelectedScheduleDay(d)}
                    >
                      {d.substring(0, 3)}{isToday ? ' (Today)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
            {savedTimetable && !isMobile && (
              <button 
                type="button"
                className="btn btn-outline btn-sm" 
                onClick={() => setShowClassModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.75rem', fontSize: '0.75rem', marginTop: '0.25rem', cursor: 'pointer' }}
              >
                <Eye size={13} /> Full Schedule
              </button>
            )}
          </div>
          {selectedDayHoliday ? (
            (() => {
              const creative = HOLIDAY_CREATIVES[selectedDayHoliday.name] || getDefaultHolidayCreative(selectedDayHoliday.name);
              const studentName = userProfile?.firstName || (userProfile?.name || currentUser?.displayName || 'Student').trim().split(/\s+/)[0];
              const hasExtraClass = selectedDayExtraClasses.length > 0;
              return (
                <>
                  <div 
                    className="holiday-schedule-card"
                    style={{
                      background: creative.gradient,
                      color: creative.textColor || '#ffffff',
                      padding: '2rem',
                      borderRadius: '1rem',
                      boxShadow: '0 10px 30px -5px rgba(0,0,0,0.12)',
                      position: 'relative',
                      overflow: 'hidden',
                      marginTop: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      minHeight: hasExtraClass ? 'auto' : '350px',
                      justifyContent: hasExtraClass ? 'flex-start' : 'center',
                    }}
                  >
                    <div className="holiday-glow-overlay" style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)',
                      pointerEvents: 'none'
                    }} />
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
                      <span style={{ fontSize: '2.5rem' }}>{creative.emoji || '🎉'}</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                          {creative.title}
                        </h4>
                        <span style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {selectedDayHoliday.type === 'restricted' ? 'Holiday' : `Holiday • ${selectedDayHoliday.type}`}
                        </span>
                      </div>
                    </div>
                    
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', fontWeight: '500', opacity: 0.95, zIndex: 1, textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      {hasExtraClass 
                        ? `Wishing you a Happy ${selectedDayHoliday.name.split('(')[0].split('/')[0].trim()}, ${studentName}! Although it is a holiday, you have an extra class scheduled today. Let's keep the grind going!`
                        : (typeof creative.message === 'function' ? creative.message(studentName) : creative.message)
                      }
                    </p>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', zIndex: 1 }}>
                      {hasExtraClass && (
                        <span style={{ background: 'rgba(255, 255, 255, 0.3)', padding: '0.35rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700', backdropFilter: 'blur(4px)' }}>
                          📚 Extra Class Scheduled
                        </span>
                      )}
                      <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.35rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700', backdropFilter: 'blur(4px)' }}>
                        ✨ Enjoy the break!
                      </span>
                    </div>
                  </div>

                  {hasExtraClass && (
                    <div className="today-schedule-timeline" style={{ marginTop: '1.5rem' }}>
                      {selectedDayExtraClasses.map((e, idx) => (
                        <div key={e.id || idx} className="timeline-schedule-item upcoming">
                          <div className="timeline-schedule-left">
                            <span className="timeline-time"><Clock size={11} /> {e.time || 'All Day'}</span>
                            <div className="timeline-node">
                              <div className="node-dot" style={{ '--hue': getHue(e.title) }} />
                              <div className="node-connector" />
                            </div>
                          </div>

                          <div className="timeline-schedule-right">
                            <div className="timeline-class-header">
                              <span className="timeline-class-code" style={{ '--hue': getHue(e.title) }}>{e.title}</span>
                              <span className="timeline-class-type">Extra Class</span>
                              <span className="timeline-status-badge upcoming">SCHEDULED</span>
                            </div>
                            <h4 className="timeline-class-title">{e.title}</h4>
                            <div className="timeline-class-meta">
                              {e.endTime && <span className="meta-item"><Clock size={11} /> Ends: {e.endTime}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()
          ) : todaySchedule.length === 0 ? (
            checkIsNoClassPeriod(selectedDayDateStr, holidays) ? (
              <div className="empty-state">
                <p>Campus Recess / Vacation Period</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No classes are scheduled. Enjoy the break! 🏕️🌴</span>
              </div>
            ) : (
              <div className="empty-state"><p>No classes scheduled for this day</p></div>
            )
          ) : (
            <div className="today-schedule-timeline">
              {todaySchedule.map(({ time, entries, status }) => {
                const isCurrent = status === 'current';
                const isNext = status === 'next';
                const mainEntry = entries[0] || {};
                
                return (
                  <div key={time} className={`timeline-schedule-item ${status || ''}`}>
                    <div className="timeline-schedule-left">
                      <span className="timeline-time"><Clock size={11} /> {time}</span>
                      <div className="timeline-node">
                        <div className="node-dot" style={{ '--hue': getHue(mainEntry.code || 'CS') }} />
                        <div className="node-connector" />
                      </div>
                    </div>

                    <div className="timeline-schedule-right">
                      <div className="timeline-class-header">
                        <span className="timeline-class-code" style={{ '--hue': getHue(mainEntry.code || 'CS') }}>{mainEntry.code}</span>
                        <span className="timeline-class-type">{mainEntry.type}</span>
                        {isCurrent && <span className="timeline-status-badge now">NOW</span>}
                        {isNext && <span className="timeline-status-badge next">NEXT</span>}
                        {status === 'upcoming' && <span className="timeline-status-badge upcoming">UPCOMING</span>}
                      </div>
                      <h4 className="timeline-class-title">{mainEntry.title}</h4>
                      <div className="timeline-class-meta">
                        {mainEntry.venue && <span className="meta-item" title={mainEntry.venue}><MapPin size={11} /> {mainEntry.venue}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {isMobile && savedTimetable && (
            <button 
              type="button"
              className="btn btn-outline btn-sm" 
              onClick={() => setShowClassModal(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.55rem 0.75rem', fontSize: '0.8rem', width: '100%', marginTop: '1.25rem', cursor: 'pointer' }}
            >
              <Eye size={14} /> Full Schedule
            </button>
          )}
        </motion.div>

        <motion.div className="today-section" variants={itemVariants}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
              <h3 className="section-title" style={{ margin: 0, paddingRight: '7.5rem' }}><BookOpen size={20} /> Mess Menu — {selectedMessDay}{selectedMessDay === todayName ? ' (Today)' : ''}</h3>
              <div className="home-day-tabs">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => {
                  const isToday = d === todayName;
                  return (
                    <button
                      key={d}
                      className={`home-day-tab-btn ${selectedMessDay === d ? 'active' : ''}`}
                      onClick={() => setSelectedMessDay(d)}
                    >
                      {d.substring(0, 3)}{isToday ? ' (Today)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
            {messMenu && !isMobile && (
              <button 
                type="button"
                className="btn btn-outline btn-sm" 
                onClick={() => setShowMessModal(true)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  padding: '0.45rem 0.75rem', 
                  fontSize: '0.75rem',
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  zIndex: 10,
                  cursor: 'pointer'
                }}
              >
                <Eye size={13} /> Full Menu
              </button>
            )}
          </div>
          {messLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading menu...</p>
          ) : todayMess ? (
            isMobile ? (
              <div className="mess-meals-grid">
                {Object.keys(todayMess).map((mealName) => {
                  const meal = todayMess[mealName];
                  if (!meal) return null;
                  const active = isCurrentMeal(meal.time);
                  const filteredItems = meal.items.filter(item => item.item && item.item.trim() !== '' && item.item.trim() !== '-');

                  return (
                    <div key={mealName} className={`mess-meal-col-card ${active ? 'active-meal' : ''}`}>
                      <div className="meal-col-header">
                        <div className="meal-col-title-row">
                          <span className="meal-col-name">{mealName}</span>
                          {active && <span className="active-meal-badge">NOW</span>}
                        </div>
                        <span className="meal-col-time"><Clock size={10} /> {meal.time}</span>
                      </div>

                      <div className="meal-col-body">
                        {filteredItems.length === 0 ? (
                          <span className="meal-col-empty">No items listed</span>
                        ) : (
                          <ul className="meal-col-list">
                            {filteredItems.map((item, idx) => (
                              <li key={idx} className="meal-col-item">
                                <span className="meal-col-category-dot" title={item.category} />
                                <div className="meal-col-food-info">
                                  <span className="meal-col-food-name">{item.item}</span>
                                  <span className="meal-col-category-text">{item.category}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <div className="mess-tabs">
                  {Object.keys(todayMess).map((mealName) => {
                    const isActive = activeMealTab === mealName;
                    const isNow = isCurrentMeal(todayMess[mealName].time);
                    const isToday = selectedMessDay === DAY_NAMES[new Date().getDay()];
                    
                    return (
                      <button
                        key={mealName}
                        type="button"
                        className={`mess-tab-btn ${isActive ? 'active' : ''} ${isNow && isToday ? 'is-now' : ''}`}
                        onClick={() => setActiveMealTab(mealName)}
                      >
                        {mealName}
                        {isNow && isToday && <span className="tab-now-dot" />}
                      </button>
                    );
                  })}
                </div>

                {(() => {
                  const meal = todayMess[activeMealTab];
                  if (!meal) return null;
                  const isToday = selectedMessDay === DAY_NAMES[new Date().getDay()];
                  const active = isToday && isCurrentMeal(meal.time);
                  const filteredItems = meal.items.filter(item => item.item && item.item.trim() !== '' && item.item.trim() !== '-');

                  return (
                    <div className={`mess-meal-col-card ${active ? 'active-meal' : ''}`}>
                      <div className="meal-col-header">
                        <div className="meal-col-title-row">
                          <span className="meal-col-name">{activeMealTab}</span>
                          {active && <span className="active-meal-badge">NOW</span>}
                        </div>
                        <span className="meal-col-time"><Clock size={10} /> {meal.time}</span>
                      </div>

                      <div className="meal-col-body">
                        {filteredItems.length === 0 ? (
                          <span className="meal-col-empty">No items listed</span>
                        ) : (
                          <ul className="meal-col-list">
                            {filteredItems.map((item, idx) => (
                              <li key={idx} className="meal-col-item">
                                <span className="meal-col-category-dot" title={item.category} />
                                <div className="meal-col-food-info">
                                  <span className="meal-col-food-name">{item.item}</span>
                                  <span className="meal-col-category-text">{item.category}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )
          ) : (
            <div className="empty-state"><p>Mess menu not available</p></div>
          )}
          {isMobile && messMenu && (
            <button 
              type="button"
              className="btn btn-outline btn-sm" 
              onClick={() => setShowMessModal(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.55rem 0.75rem', fontSize: '0.8rem', width: '100%', marginTop: '1.25rem', cursor: 'pointer' }}
            >
              <Eye size={14} /> Full Menu
            </button>
          )}
        </motion.div>
      </div>

      {/* QUICK LINKS & SUMMARY */}
      <div className="home-extras">
        <motion.div className="today-section" variants={itemVariants}>
          <h3 className="section-title"><Book size={20} /> Academic Summary</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-value">{savedCourses.length}</div>
              <div className="summary-label">Registered Courses</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{totalCredits}</div>
              <div className="summary-label">Total Credits</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{userProfile?.cgpa || '—'}</div>
              <div className="summary-label">CGPA</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{userProfile?.semester || '—'}</div>
              <div className="summary-label">Current Semester</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{todaySchedule.length}</div>
              <div className="summary-label">Classes Today</div>
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

      {/* Class Timetable Modal */}
      {showClassModal && savedTimetable && (
        <div className="popup-modal-overlay" onClick={() => setShowClassModal(false)}>
          <div className="popup-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-modal-header">
              <h3 className="popup-modal-title"><Calendar size={18} /> Full Weekly Timetable</h3>
              <button className="popup-modal-close" onClick={() => setShowClassModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="popup-modal-body">
              <div className="timetable-scroll-wrapper">
                <table className="modal-timetable-table">
                  <thead>
                    <tr>
                      <th>Time Slot</th>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                        <th key={day}>{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allSlots.map(time => {
                      if (time === "13:00 - 14:00") {
                        return (
                          <tr key={time}>
                            <td className="time-col">{time}</td>
                            <td colSpan={5} className="lunch-row-cell">Lunch Break</td>
                          </tr>
                        );
                      }
                      
                      return (
                        <tr key={time}>
                          <td className="time-col">{time}</td>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                            const entries = savedTimetable[day]?.[time] || [];
                            return (
                              <td key={day}>
                                {entries.length === 0 ? (
                                  <span className="empty-slot">—</span>
                                ) : (
                                  entries.map((e, idx) => (
                                    <div key={idx} className="modal-timetable-cell" style={{ '--hue': getHue(e.code || 'CS') }}>
                                      <div className="cell-code">{e.code}</div>
                                      <div className="cell-type">{e.type}</div>
                                      <div className="cell-venue">{e.venue || 'N/A'}</div>
                                    </div>
                                  ))
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Mess Menu Modal */}
      {showMessModal && messMenu && (
        <div className="popup-modal-overlay" onClick={() => setShowMessModal(false)}>
          <div className="popup-modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '1200px' }}>
            <div className="popup-modal-header">
              <h3 className="popup-modal-title"><BookOpen size={18} /> Full Weekly Mess Menu</h3>
              <button className="popup-modal-close" onClick={() => setShowMessModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="popup-modal-body">
              <div className="timetable-scroll-wrapper">
                <table className="modal-timetable-table">
                  <thead>
                    <tr>
                      <th>Meal / Time</th>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <th key={day}>{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(messMenu.meals).map(([mealName, mealData]) => (
                      <tr key={mealName}>
                        <td className="time-col">
                          <div style={{ fontWeight: '700' }}>{mealName}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.15rem' }}>{mealData.time}</div>
                        </td>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                          const items = mealData.items[day] || [];
                          const filtered = items.filter(it => it.item && it.item.trim() !== '' && it.item.trim() !== '-');
                          return (
                            <td key={day} style={{ verticalAlign: 'top' }}>
                              {filtered.length === 0 ? (
                                <span className="empty-slot">—</span>
                              ) : (
                                <ul style={{ paddingLeft: '0.75rem', margin: 0, fontSize: '0.75rem', lineHeight: '1.3' }}>
                                  {filtered.map((it, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.2rem' }}>
                                      <span>{it.item}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeLightBoxImage && createPortal(
        <div className="lightbox-overlay" onClick={() => { setActiveLightBoxImage(null); setZoomedImage(false); }}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => { setActiveLightBoxImage(null); setZoomedImage(false); }}>
              <X size={18} />
            </button>
            <div className="lightbox-image-container">
              <img 
                src={activeLightBoxImage.url} 
                alt={activeLightBoxImage.label} 
                className={`lightbox-image ${zoomedImage ? 'zoomed' : ''}`}
                onClick={() => setZoomedImage(!zoomedImage)}
              />
            </div>
            <div className="lightbox-label">{activeLightBoxImage.label} (Click image to zoom)</div>
          </div>
        </div>,
        document.body
      )}

      <div className="page-footer">Built with ❤️ by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a></div>
    </motion.div>
  );
};

export default HomePage;
