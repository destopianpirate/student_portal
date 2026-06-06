import { getDailyQuote } from '../data/quotes';
import { Moon, Sunrise, Sun, Sunset } from 'lucide-react';

export const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export const getMealWindow = (timeStr) => {
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

export const isCurrentMeal = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return false;
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const w = getMealWindow(timeStr);
  return w && mins >= w.start && mins <= w.end;
};

export const getClassWindow = (timeStr) => {
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

export const getClassStatus = (timeStr) => {
  const w = getClassWindow(timeStr);
  if (!w) return null;
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  if (currentMins >= w.start && currentMins <= w.end) return 'current';
  if (currentMins < w.start) return 'upcoming';
  return 'past';
};

export const getHue = (code) => {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = code.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % 360;
};

export const MOODS = [
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

export const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDateForWeekday = (targetDayName, referenceDate = new Date()) => {
  const currentDayIndex = referenceDate.getDay();
  const targetDayIndex = DAY_NAMES.indexOf(targetDayName);
  if (targetDayIndex === -1) return null;
  
  const diff = targetDayIndex - currentDayIndex;
  const targetDate = new Date(referenceDate);
  targetDate.setDate(referenceDate.getDate() + diff);
  return getLocalDateString(targetDate);
};

export const checkIsNoClassPeriod = (dateStr, holidaysList) => {
  if (!dateStr) return false;
  const isHoliday = holidaysList && holidaysList.some(h => h.date === dateStr);
  if (isHoliday) return true;
  const isRecess = (dateStr >= '2026-10-17' && dateStr <= '2026-10-25') || 
                  (dateStr >= '2027-03-20' && dateStr <= '2027-03-28');
  if (isRecess) return true;
  const isVacation = (dateStr > '2026-11-19' && dateStr < '2027-01-04') || 
                     (dateStr > '2027-04-22');
  if (isVacation) return true;
  return false;
};

export const HOLIDAY_CREATIVES = {
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

export const getDefaultHolidayCreative = (holidayName) => {
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

export const calculateHudInfo = (hudTime, savedTimetable, holidays, customEvents, academicEvents) => {
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
  const academicEnd = 18 * 60 + 30;
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

  let countdownText = 'Relax, no classes today!';
  let countdownBadgeClass = 'status-badge-relax';
  
  const todayExtraClasses = customEvents ? customEvents.filter(e => {
    if (e.date !== todayDateStr) return false;
    return e.category === 'academic' || e.title.toLowerCase().includes('class');
  }) : [];
  const hasExtraClassToday = todayExtraClasses.length > 0;

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
};
export { MOODS as MOODS_LIST };
export { checkIsNoClassPeriod as checkIsNoClassPeriodHelper };
export { HOLIDAY_CREATIVES as HOLIDAY_CREATIVES_LIST };
