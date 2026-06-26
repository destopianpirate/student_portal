import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const formatReminderDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const targetTime = targetDate.getTime();
  if (targetTime === today.getTime()) return 'Today';
  if (targetTime === tomorrow.getTime()) return 'Tomorrow';
  if (targetDate.getFullYear() !== today.getFullYear()) {
    return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const slideVariants = {
  enter: { x: -30, opacity: 0 },
  center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { x: 30, opacity: 0, transition: { duration: 0.35, ease: 'easeIn' } }
};

const RemindersSection = ({
  hudInfo,
  holidays,
  academicEvents,
  customEvents,
  itemVariants
}) => {
  const isRunningOrNextMonth = (dateStr) => {
    if (!dateStr) return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const targetTime = target.getTime();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    // Last day of the next month (setting date to 0 of currentMonth + 2)
    const lastDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    lastDayOfNextMonth.setHours(23, 59, 59, 999);
    const maxTime = lastDayOfNextMonth.getTime();

    return targetTime >= todayTime && targetTime <= maxTime;
  };

  // Group 1: Holidays
  const holidaysList = useMemo(() => {
    const list = [];
    if (holidays) {
      holidays.forEach(h => {
        if (isRunningOrNextMonth(h.date)) {
          list.push({ date: h.date, title: h.name });
        }
      });
    }
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [holidays]);

  // Group 2: Exams, Quizzes & Deadlines (manually added + academic)
  const examsList = useMemo(() => {
    const list = [];
    if (customEvents) {
      customEvents.forEach(e => {
        if (isRunningOrNextMonth(e.date)) {
          if (e.category === 'exam' || e.title.toLowerCase().includes('exam')) {
            list.push({ date: e.date, title: e.title, type: 'Exam' });
          } else if (e.category === 'quiz' || e.title.toLowerCase().includes('quiz')) {
            list.push({ date: e.date, title: e.title, type: 'Quiz' });
          } else if (e.category === 'deadline') {
            list.push({ date: e.date, title: e.title, type: 'Deadline' });
          }
        }
      });
    }
    // Academic deadlines
    if (academicEvents) {
      academicEvents.forEach(e => {
        if (e.category === 'deadline' && isRunningOrNextMonth(e.date)) {
          list.push({ date: e.date, title: e.name, type: 'Deadline' });
        }
      });
    }
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [customEvents, academicEvents]);

  // Group 3: Events & Academic Periods
  const eventsList = useMemo(() => {
    const list = [];
    if (customEvents) {
      customEvents.forEach(e => {
        const isQuiz = e.category === 'quiz' || e.title.toLowerCase().includes('quiz');
        const isExam = e.category === 'exam' || e.title.toLowerCase().includes('exam');
        const isDeadline = e.category === 'deadline';
        if (isRunningOrNextMonth(e.date) && !isQuiz && !isExam && !isDeadline) {
          const isExtraClass = e.category === 'academic' || e.title.toLowerCase().includes('class');
          list.push({
            date: e.date,
            title: e.title,
            type: isExtraClass ? 'Extra Class' : 'Event'
          });
        }
      });
    }
    if (academicEvents) {
      academicEvents.forEach(e => {
        const isExam = e.category === 'exam' || e.name.toLowerCase().includes('exam');
        const isDeadline = e.category === 'deadline';
        if (isRunningOrNextMonth(e.date) && !isExam && !isDeadline) {
          list.push({
            date: e.date,
            title: e.name,
            type: 'Academic'
          });
        }
      });
    }
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [customEvents, academicEvents]);

  // Indices for loop intervals
  const [holidayIndex, setHolidayIndex] = useState(0);
  const [examIndex, setExamIndex] = useState(0);
  const [eventIndex, setEventIndex] = useState(0);

  // Interval timers to loop
  useEffect(() => {
    if (holidaysList.length <= 1) return;
    const interval = setInterval(() => {
      setHolidayIndex(prev => (prev + 1) % holidaysList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [holidaysList.length]);

  useEffect(() => {
    if (examsList.length <= 1) return;
    const interval = setInterval(() => {
      setExamIndex(prev => (prev + 1) % examsList.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [examsList.length]);

  useEffect(() => {
    if (eventsList.length <= 1) return;
    const interval = setInterval(() => {
      setEventIndex(prev => (prev + 1) % eventsList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [eventsList.length]);

  // Active items
  const currentHoliday = holidaysList[holidayIndex % holidaysList.length] || null;
  const currentExam = examsList[examIndex % examsList.length] || null;
  const currentEvent = eventsList[eventIndex % eventsList.length] || null;

  return (
    <motion.div 
      className="reminders-section" 
      variants={itemVariants}
    >
      {/* Live/Status banner */}
      <div className={`reminder-status-banner ${hudInfo?.countdownBadgeClass || 'status-badge-relax'}`}>
        <span className="status-text">{hudInfo?.countdownText || 'No classes scheduled'}</span>
      </div>

      {/* Category Rows */}
      <div className="reminder-rows">
        {/* Holidays */}
        <div className="reminder-category-row">
          <span className="reminder-category-label">Holiday</span>
          <div className="reminder-slider-container">
            <AnimatePresence mode="wait">
              {currentHoliday ? (
                <motion.div
                  key={`holiday-${currentHoliday.title}-${currentHoliday.date}`}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="reminder-slider-item"
                >
                  <span className="reminder-item-title" title={currentHoliday.title}>
                    {currentHoliday.title}
                  </span>
                  <span className="reminder-item-date">
                    {formatReminderDate(currentHoliday.date)}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="no-holidays"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="reminder-slider-item empty"
                >
                  <span className="reminder-item-title-empty">No upcoming holidays</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Exams, Quizzes & Deadlines */}
        <div className="reminder-category-row">
          <span className="reminder-category-label">Exam/Quiz/<br />Deadline</span>
          <div className="reminder-slider-container">
            <AnimatePresence mode="wait">
              {currentExam ? (
                <motion.div
                  key={`exam-${currentExam.title}-${currentExam.date}`}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="reminder-slider-item"
                >
                  <span className="reminder-item-title" title={currentExam.title}>
                    <span className="reminder-sub-type">{currentExam.type}:</span> {currentExam.title}
                  </span>
                  <span className="reminder-item-date">
                    {formatReminderDate(currentExam.date)}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="no-exams"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="reminder-slider-item empty"
                >
                  <span className="reminder-item-title-empty">No exams, quizzes or deadlines</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Events / Academic Periods */}
        <div className="reminder-category-row">
          <span className="reminder-category-label">Event/<br />Academic</span>
          <div className="reminder-slider-container">
            <AnimatePresence mode="wait">
              {currentEvent ? (
                <motion.div
                  key={`event-${currentEvent.title}-${currentEvent.date}`}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="reminder-slider-item"
                >
                  <span className="reminder-item-title" title={currentEvent.title}>
                    <span className="reminder-sub-type">{currentEvent.type}:</span> {currentEvent.title}
                  </span>
                  <span className="reminder-item-date">
                    {formatReminderDate(currentEvent.date)}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="no-events"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="reminder-slider-item empty"
                >
                  <span className="reminder-item-title-empty">No upcoming events or periods</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(RemindersSection);
