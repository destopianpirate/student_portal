import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CalendarContext = createContext();
export const useCalendar = () => useContext(CalendarContext);

// ── 2026 GAZETTED HOLIDAYS ──
const GAZETTED_HOLIDAYS = [
  { date: '2026-01-14', name: 'Makar Sankranti / Pongal', type: 'gazetted' },
  { date: '2026-01-26', name: 'Republic Day', type: 'gazetted' },
  { date: '2026-03-04', name: 'Holi', type: 'gazetted' },
  { date: '2026-03-21', name: "Idu'l Fitr", type: 'gazetted' },
  { date: '2026-03-31', name: 'Mahavir Jayanti', type: 'gazetted' },
  { date: '2026-04-03', name: 'Good Friday', type: 'gazetted' },
  { date: '2026-05-01', name: 'Buddha Purnima', type: 'gazetted' },
  { date: '2026-05-27', name: 'Id-ul-Zuha (Bakrid)', type: 'gazetted' },
  { date: '2026-06-26', name: 'Muharram', type: 'gazetted' },
  { date: '2026-08-15', name: 'Independence Day', type: 'gazetted' },
  { date: '2026-08-26', name: 'Milad-un-Nabi (Birthday of Prophet Mohammad)', type: 'gazetted' },
  { date: '2026-09-04', name: 'Janmashtami (Vaishnavi)', type: 'gazetted' },
  { date: '2026-10-02', name: "Mahatma Gandhi's Birthday", type: 'gazetted' },
  { date: '2026-10-20', name: 'Dussehra (Vijay Dashami)', type: 'gazetted' },
  { date: '2026-11-08', name: 'Diwali (Deepavali)', type: 'gazetted' },
  { date: '2026-11-24', name: "Guru Nanak's Birthday", type: 'gazetted' },
  { date: '2026-12-25', name: 'Christmas Day', type: 'gazetted' },
];

// ── 2026 RESTRICTED HOLIDAYS ──
const RESTRICTED_HOLIDAYS = [
  { date: '2026-01-01', name: "New Year's Day", type: 'restricted' },
  { date: '2026-01-03', name: "Hazarat Ali's Birthday", type: 'restricted' },
  { date: '2026-01-14', name: 'Magha Bihu', type: 'restricted' },
  { date: '2026-01-23', name: 'Basant Panchami / Sri Panchami', type: 'restricted' },
  { date: '2026-02-01', name: "Guru Ravi Das's Birthday", type: 'restricted' },
  { date: '2026-02-12', name: 'Birthday of Swami Dayananda Saraswati', type: 'restricted' },
  { date: '2026-02-15', name: 'Maha Shivratri', type: 'restricted' },
  { date: '2026-02-19', name: 'Shivaji Jayanti', type: 'restricted' },
  { date: '2026-03-03', name: 'Holika Dahan / Dolyatra', type: 'restricted' },
  { date: '2026-03-19', name: 'Chaitra Sukladi / Gudi Padava / Ugadi', type: 'restricted' },
  { date: '2026-03-20', name: 'Jamat-Ul-Vida', type: 'restricted' },
  { date: '2026-03-26', name: 'Ram Navami', type: 'restricted' },
  { date: '2026-04-05', name: 'Easter Sunday', type: 'restricted' },
  { date: '2026-04-14', name: "Vaisakhi / Vishu / Tamil New Year's Day", type: 'restricted' },
  { date: '2026-04-15', name: 'Vaisakhadi (Bengal) / Bahag Bihu (Assam)', type: 'restricted' },
  { date: '2026-05-09', name: 'Birthday of Guru Rabindranath Tagore', type: 'restricted' },
  { date: '2026-07-16', name: 'Rath Yatra', type: 'restricted' },
  { date: '2026-08-15', name: 'Parsi New Year / Nauraj', type: 'restricted' },
  { date: '2026-08-26', name: 'Onam / Thiru Onam Day', type: 'restricted' },
  { date: '2026-08-28', name: 'Raksha Bandhan', type: 'restricted' },
  { date: '2026-09-14', name: 'Ganesh Chaturthi / Vinayaka Chaturthi', type: 'restricted' },
  { date: '2026-10-18', name: 'Dussehra (Saptami)', type: 'restricted' },
  { date: '2026-10-19', name: 'Dussehra (Maha Ashtami)', type: 'restricted' },
  { date: '2026-10-20', name: 'Dussehra (Maha Navmi)', type: 'restricted' },
  { date: '2026-10-26', name: "Maharishi Valmiki's Birthday", type: 'restricted' },
  { date: '2026-10-29', name: 'Karaka Chaturdasi (Karwa Chouth)', type: 'restricted' },
  { date: '2026-11-08', name: 'Naraka Chaturdasi', type: 'restricted' },
  { date: '2026-11-09', name: 'Govardhan Puja', type: 'restricted' },
  { date: '2026-11-11', name: 'Bhai Duj', type: 'restricted' },
  { date: '2026-11-15', name: 'Pratihar Shashthi / Chhath Puja', type: 'restricted' },
  { date: '2026-11-24', name: "Guru Teg Bahadur's Martyrdom Day", type: 'restricted' },
  { date: '2026-12-23', name: "Hazarat Ali's Birthday", type: 'restricted' },
  { date: '2026-12-24', name: 'Christmas Eve', type: 'restricted' },
];

// ── ACADEMIC CALENDAR 2026-27 ──
const ACADEMIC_EVENTS = [
  // Semester I
  { date: '2026-07-17', name: 'Registration — New PG Students', semester: 'I', category: 'registration' },
  { date: '2026-07-20', name: 'Registration — New UG Students', semester: 'I', category: 'registration' },
  { date: '2026-08-03', name: 'Registration — All Other Students', semester: 'I', category: 'registration' },
  { date: '2026-07-17', endDate: '2026-07-31', name: 'Aarohan — New PG Students', semester: 'I', category: 'orientation' },
  { date: '2026-07-21', endDate: '2026-08-15', name: 'Foundation Programme — New UG', semester: 'I', category: 'orientation' },
  { date: '2026-08-04', name: 'Classes Commence — All Other Students', semester: 'I', category: 'classes' },
  { date: '2026-08-17', name: 'Classes Commence — New UG Students', semester: 'I', category: 'classes' },
  { date: '2026-08-10', name: 'Late Registration Deadline', semester: 'I', category: 'deadline' },
  { date: '2026-08-04', endDate: '2026-08-17', name: 'Course Adjustment (Add/Drop)', semester: 'I', category: 'deadline' },
  { date: '2026-08-25', name: 'Last Day of Classes — Quad 1', semester: 'I', category: 'classes' },
  { date: '2026-08-27', name: 'Classes Commence — Quad 2', semester: 'I', category: 'classes' },
  { date: '2026-09-17', name: 'Last Day of Classes — Quad 2', semester: 'I', category: 'classes' },
  { date: '2026-09-18', endDate: '2026-09-23', name: 'Examination I', semester: 'I', category: 'exam' },
  { date: '2026-09-24', name: 'Classes Commence — Quad 3', semester: 'I', category: 'classes' },
  { date: '2026-10-16', name: 'Last Day of Classes — Quad 3', semester: 'I', category: 'classes' },
  { date: '2026-10-17', endDate: '2026-10-25', name: 'Mid-Semester Recess', semester: 'I', category: 'vacation' },
  { date: '2026-10-26', name: 'Classes Commence — Quad 4', semester: 'I', category: 'classes' },
  { date: '2026-11-02', endDate: '2026-11-06', name: 'Academic Pre-Registration', semester: 'I', category: 'registration' },
  { date: '2026-11-11', name: 'Last Date for Course Drop', semester: 'I', category: 'deadline' },
  { date: '2026-11-19', name: 'Last Day of Classes', semester: 'I', category: 'classes' },
  { date: '2026-11-20', endDate: '2026-11-28', name: 'Examination II', semester: 'I', category: 'exam' },
  { date: '2026-11-30', endDate: '2026-12-01', name: 'Make-up Examination', semester: 'I', category: 'exam' },
  { date: '2026-12-02', name: 'Last Date for Grade Submission', semester: 'I', category: 'deadline' },
  { date: '2026-12-05', name: 'Disclosure of Grades', semester: 'I', category: 'deadline' },
  { date: '2026-11-29', endDate: '2027-01-01', name: 'Winter Vacation', semester: 'I', category: 'vacation' },
  { date: '2026-12-01', endDate: '2026-12-07', name: 'PhD Qualifying Exam (Phase I)', semester: 'I', category: 'exam' },
  // Semester II
  { date: '2026-12-17', name: 'Registration — New PG Students', semester: 'II', category: 'registration' },
  { date: '2027-01-02', name: 'Registration — New UG Students', semester: 'II', category: 'registration' },
  { date: '2026-12-18', endDate: '2027-01-01', name: 'Aarohan — New PG Students', semester: 'II', category: 'orientation' },
  { date: '2027-01-04', name: 'Classes Commence', semester: 'II', category: 'classes' },
  { date: '2027-01-08', name: 'Late Registration Deadline', semester: 'II', category: 'deadline' },
  { date: '2027-01-04', endDate: '2027-01-18', name: 'Course Adjustment (Add/Drop)', semester: 'II', category: 'deadline' },
  { date: '2027-01-27', name: 'Last Day of Classes — Quad 1', semester: 'II', category: 'classes' },
  { date: '2027-01-28', name: 'Classes Commence — Quad 2', semester: 'II', category: 'classes' },
  { date: '2027-02-18', name: 'Last Day of Classes — Quad 2', semester: 'II', category: 'classes' },
  { date: '2027-02-19', endDate: '2027-02-24', name: 'Examination I', semester: 'II', category: 'exam' },
  { date: '2027-02-25', name: 'Classes Commence — Quad 3', semester: 'II', category: 'classes' },
  { date: '2027-03-19', name: 'Last Day of Classes — Quad 3', semester: 'II', category: 'classes' },
  { date: '2027-03-20', endDate: '2027-03-28', name: 'Mid-Semester Recess', semester: 'II', category: 'vacation' },
  { date: '2027-03-29', name: 'Classes Commence — Quad 4', semester: 'II', category: 'classes' },
  { date: '2027-04-05', endDate: '2027-04-09', name: 'Academic Pre-Registration', semester: 'II', category: 'registration' },
  { date: '2027-04-15', name: 'Last Date for Course Drop', semester: 'II', category: 'deadline' },
  { date: '2027-04-22', name: 'Last Day of Classes', semester: 'II', category: 'classes' },
  { date: '2027-04-23', endDate: '2027-04-30', name: 'Examination II', semester: 'II', category: 'exam' },
  { date: '2027-05-01', endDate: '2027-05-03', name: 'Make-up Examination', semester: 'II', category: 'exam' },
  { date: '2027-05-04', name: 'Last Date for Grade Submission', semester: 'II', category: 'deadline' },
  { date: '2027-05-06', name: 'Disclosure of Grades', semester: 'II', category: 'deadline' },
  { date: '2027-05-01', endDate: '2027-07-31', name: 'Summer Vacation', semester: 'II', category: 'vacation' },
  { date: '2027-05-03', endDate: '2027-05-07', name: 'PhD Qualifying Exam (Phase I)', semester: 'II', category: 'exam' },
  // Summer Term
  { date: '2027-05-07', name: 'Registration & Classes — Summer Term', semester: 'Summer', category: 'registration' },
  { date: '2027-06-01', name: 'Last Day of Classes — Quad 1 (Summer)', semester: 'Summer', category: 'classes' },
  { date: '2027-06-02', endDate: '2027-06-04', name: 'Examination I (Summer)', semester: 'Summer', category: 'exam' },
  { date: '2027-06-07', name: 'Classes Commence — Quad 2 (Summer)', semester: 'Summer', category: 'classes' },
  { date: '2027-06-26', name: 'Convocation', semester: 'Summer', category: 'event' },
  { date: '2027-06-29', name: 'Last Day of Classes (Summer)', semester: 'Summer', category: 'classes' },
  { date: '2027-06-30', endDate: '2027-07-02', name: 'Examination II (Summer)', semester: 'Summer', category: 'exam' },
  { date: '2027-07-06', name: 'Last Date for Grade Submission (Summer)', semester: 'Summer', category: 'deadline' },
  { date: '2027-07-07', name: 'Disclosure of Grades (Summer)', semester: 'Summer', category: 'deadline' },
];

const ALL_HOLIDAYS = [...GAZETTED_HOLIDAYS, ...RESTRICTED_HOLIDAYS];

export const CalendarProvider = ({ children }) => {
  const { userProfile } = useAuth();

  const [customEvents, setCustomEvents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('custom_events') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('custom_events', JSON.stringify(customEvents));
  }, [customEvents]);

  const filteredAcademicEvents = useMemo(() => {
    if (!userProfile) {
      return ACADEMIC_EVENTS.filter(e =>
        !e.name.toLowerCase().includes('foundation prog') &&
        !e.name.toLowerCase().includes('aarohan')
      );
    }
    const prog = (userProfile.programme || '').toLowerCase();
    const sem = String(userProfile.semester || '').toLowerCase();

    const isBTech = prog.includes('btech') || prog.includes('b.tech');
    const isPG = !isBTech; // MTech, MSc, MA, MDes, PhD, etc.
    const isSem1 = sem === '1' || sem === 'i' || sem === 'sem 1' || sem === 'semester 1' || sem.includes('first');
    const isBTechSem1 = isBTech && isSem1;
    const isPGSem1 = isPG && isSem1;

    return ACADEMIC_EVENTS.filter(e => {
      // Foundation Programme → only for BTech Semester 1 students
      if (e.name.toLowerCase().includes('foundation prog')) {
        return isBTechSem1;
      }
      // Aarohan orientation → only for new PG students in Semester 1
      if (e.name.toLowerCase().includes('aarohan')) {
        return isPGSem1;
      }
      return true;
    });
  }, [userProfile]);

  const addEvent = useCallback((event) => {
    const newEvent = { ...event, id: Date.now(), createdAt: new Date().toISOString() };
    setCustomEvents(prev => [...prev, newEvent]);
    return newEvent;
  }, []);

  const removeEvent = useCallback((id) => {
    setCustomEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const updateEvent = useCallback((id, updates) => {
    setCustomEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  // Helper: calculate number of days between two date strings
  const daysBetween = (startStr, endStr) => {
    if (!endStr) return 0;
    const start = new Date(startStr + 'T00:00');
    const end = new Date(endStr + 'T00:00');
    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  };

  const getEventsForDate = useCallback((dateStr) => {
    const holidays = ALL_HOLIDAYS.filter(h => h.date === dateStr);
    // For calendar dot display: exclude multi-day (>=4 days) academic events
    const academic = filteredAcademicEvents.filter(e => {
      const span = daysBetween(e.date, e.endDate);
      if (span >= 4) return false; // long-duration events don't mark calendar
      if (e.date === dateStr) return true;
      if (e.endDate && dateStr >= e.date && dateStr <= e.endDate) return true;
      return false;
    });
    const custom = customEvents.filter(e => e.date === dateStr);
    // Deadlines: academic deadlines on their exact date, custom deadlines on their date
    const academicDeadlines = filteredAcademicEvents.filter(e =>
      e.category === 'deadline' && e.date === dateStr
    );
    return { holidays, academic, custom, academicDeadlines, all: [...holidays, ...academic, ...custom] };
  }, [customEvents, filteredAcademicEvents]);

  const getUpcomingEvents = useCallback((count = 5) => {
    const today = new Date().toISOString().split('T')[0];
    const allEvents = [
      ...ALL_HOLIDAYS.map(h => ({ ...h, source: 'holiday' })),
      ...filteredAcademicEvents.filter(e => !e.endDate).map(e => ({ ...e, source: 'academic' })),
      ...customEvents.map(e => ({ ...e, source: 'custom' })),
    ];
    return allEvents
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, count);
  }, [customEvents, filteredAcademicEvents]);

  const nextHoliday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return GAZETTED_HOLIDAYS.find(h => h.date >= today) || null;
  }, []);

  const hasEventsOnDate = useCallback((dateStr) => {
    if (ALL_HOLIDAYS.some(h => h.date === dateStr)) return 'holiday';
    // Academic deadlines always get a dot (they're single-day)
    if (filteredAcademicEvents.some(e => e.category === 'deadline' && e.date === dateStr)) return 'deadline';
    if (filteredAcademicEvents.some(e => {
      const span = daysBetween(e.date, e.endDate);
      if (span >= 4) return false; // long multi-day events (4+ days) don't dot the calendar
      return e.date === dateStr || (e.endDate && dateStr >= e.date && dateStr <= e.endDate);
    })) return 'academic';
    // Custom deadlines get a deadline dot
    if (customEvents.some(e => e.date === dateStr && e.category === 'deadline')) return 'deadline';
    // Custom exams/quizzes get a custom (exam) dot
    if (customEvents.some(e => e.date === dateStr && (e.category === 'exam' || e.category === 'quiz'))) return 'exam';
    if (customEvents.some(e => e.date === dateStr)) return 'custom';
    return null;
  }, [customEvents, filteredAcademicEvents]);

  return (
    <CalendarContext.Provider value={{
      holidays: ALL_HOLIDAYS,
      gazettedHolidays: GAZETTED_HOLIDAYS,
      restrictedHolidays: RESTRICTED_HOLIDAYS,
      academicEvents: filteredAcademicEvents,
      customEvents,
      addEvent, removeEvent, updateEvent,
      getEventsForDate, getUpcomingEvents,
      nextHoliday, hasEventsOnDate,
    }}>
      {children}
    </CalendarContext.Provider>
  );
};
