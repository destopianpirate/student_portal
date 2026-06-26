import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Star, BookOpen, PartyPopper, Clock, Trash2, Filter, GraduationCap } from 'lucide-react';
import { useCalendar } from '../contexts/CalendarContext';
import { useAuth } from '../contexts/AuthContext';
import AddEventModal from '../components/calendar/AddEventModal';
import DayDetailContent from '../components/calendar/DayDetailContent';
import PillNav from '../../PillNav/PillNav';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];


const CATEGORY_COLORS = {
  registration: '#6366f1',
  classes: '#22c55e',
  exam: '#ef4444',
  deadline: '#f59e0b',
  vacation: '#a78bfa',
  orientation: '#14b8a6',
  event: '#f472b6',
  personal: '#3b82f6',
  academic: '#6366f1',
  social: '#ec4899',
  quiz: '#14b8a6',
};

const CalendarPage = () => {
  const { currentUser, userProfile } = useAuth();
  const { gazettedHolidays, restrictedHolidays, academicEvents, customEvents, addEvent, removeEvent, getEventsForDate } = useCalendar();
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const todayStr = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  }, []);
  const activeDateStr = selectedDate || todayStr;

  const customNonExamEvents = useMemo(() => {
    return customEvents;
  }, [customEvents]);

  const formattedDate = useMemo(() => {
    if (!activeDateStr) return '';
    return new Date(activeDateStr + 'T00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [activeDateStr]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', endTime: '', category: 'personal', color: '#3b82f6' });
  const [holidayFilter, setHolidayFilter] = useState('all');
  const [semFilter, setSemFilter] = useState('all');

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showDayTimetable, setShowDayTimetable] = useState(false);

  useEffect(() => {
    setShowDayTimetable(false);
  }, [selectedDate, currentDate]);

  const savedTimetable = useMemo(() => {
    if (!currentUser) return null;
    try { return JSON.parse(localStorage.getItem(`timetable_${currentUser.uid}`)) || userProfile?.timetable || null; } catch { return null; }
  }, [currentUser, userProfile]);

  const savedCourses = useMemo(() => {
    if (!currentUser) return [];
    try { return JSON.parse(localStorage.getItem(`courses_${currentUser.uid}`)) || userProfile?.selectedCourses || []; } catch { return []; }
  }, [currentUser, userProfile]);

  const selectedDayName = useMemo(() => {
    if (!activeDateStr) return null;
    const d = new Date(activeDateStr + 'T00:00');
    return DAY_NAMES[d.getDay()];
  }, [activeDateStr]);

  const isDateInCurrentViewedMonth = useCallback((dateStr) => {
    if (!dateStr) return false;
    const parts = dateStr.split('-');
    if (parts.length < 2) return false;
    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    const currYear = currentDate.getFullYear();
    const currMonth = currentDate.getMonth();
    return y === currYear && m === (currMonth + 1);
  }, [currentDate]);

  const clickedDayClasses = useMemo(() => {
    if (!activeDateStr || !selectedDayName || !savedTimetable) return [];
    const dayData = savedTimetable[selectedDayName];
    if (!dayData) return [];
    return Object.entries(dayData).map(([time, entries]) => ({ time, entries })).sort((a, b) => {
      const parseTime = (t) => {
        if (!t) return 0;
        const m = t.trim().match(/(\d+):(\d+)/);
        if (!m) return 0;
        return parseInt(m[1]) * 60 + parseInt(m[2]);
      };
      return parseTime(a.time.split(/[-–—]/)[0]) - parseTime(b.time.split(/[-–—]/)[0]);
    });
  }, [activeDateStr, selectedDayName, savedTimetable]);

  const monthDeadlines = useMemo(() => {
    const list = [];
    academicEvents.forEach(e => {
      if (e.category === 'deadline' && isDateInCurrentViewedMonth(e.date)) {
        list.push({ ...e, source: 'academic', title: e.name });
      }
    });
    customEvents.forEach(e => {
      if (e.category === 'deadline' && isDateInCurrentViewedMonth(e.date)) {
        list.push({ ...e, source: 'custom' });
      }
    });
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [academicEvents, customEvents, isDateInCurrentViewedMonth]);

  const monthExamsAndQuizzes = useMemo(() => {
    // Only custom (manually added) exam/quiz events for this month
    const list = [];
    customEvents.forEach(e => {
      if ((e.category === 'exam' || e.category === 'quiz') && isDateInCurrentViewedMonth(e.date)) {
        list.push({ ...e, source: 'custom' });
      }
    });
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [customEvents, isDateInCurrentViewedMonth]);

  // Academic exam/quiz phases (from academic calendar) — filtered by current viewed month
  const academicExamPhases = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const monthStart = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m + 1, 0).getDate();
    const monthEnd = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const list = [];
    academicEvents.forEach(e => {
      if (e.category === 'exam' || e.category === 'quiz') {
        const eEnd = e.endDate || e.date;
        const overlaps = e.date <= monthEnd && eEnd >= monthStart;
        if (overlaps) {
          list.push({ ...e, source: 'academic', title: e.name });
        }
      }
    });
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [academicEvents, currentDate]);

  // Helper: days between two date strings
  const daysBetween = (startStr, endStr) => {
    if (!endStr) return 0;
    const start = new Date(startStr + 'T00:00');
    const end = new Date(endStr + 'T00:00');
    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  };

  // Long academic events (>3 days) that overlap the current month — shown in dedicated section
  const monthLongAcademicEvents = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const monthStart = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m + 1, 0).getDate();
    const monthEnd = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    return academicEvents.filter(e => {
      if (e.category === 'exam' || e.category === 'quiz') return false; // Exclude exams & quizzes from Academic Periods
      const span = daysBetween(e.date, e.endDate);
      if (span <= 3) return false; // short events are marked on the calendar
      const eEnd = e.endDate || e.date;
      // overlaps the month?
      return e.date <= monthEnd && eEnd >= monthStart;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [academicEvents, currentDate]);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];
    
    // Previous month fill — with dateStr so they're clickable
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    const prevDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDays - i;
      const dateStr = `${prevMonthYear}-${String(prevMonthIdx + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      days.push({ day: d, isCurrentMonth: false, dateStr });
    }
    
    // Current month
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const events = getEventsForDate(dateStr);
      days.push({ day: d, isCurrentMonth: true, dateStr, isToday: dateStr === todayStr, events });
    }
    
    // Next month fill — with dateStr
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const dateStr = `${nextMonthYear}-${String(nextMonthIdx + 1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
      days.push({ day: i, isCurrentMonth: false, dateStr });
    }
    return days;
  }, [year, month, getEventsForDate]);

  const goMonth = (dir) => {
    setCurrentDate(new Date(year, month + dir, 1));
    setSelectedDate(null);
  };

  const handleDayClick = (d) => {
    if (!d.isCurrentMonth && d.dateStr) {
      // Navigate to the month of this day
      const parts = d.dateStr.split('-');
      setCurrentDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1));
      setSelectedDate(d.dateStr);
      return;
    }
    setSelectedDate(d.dateStr);
  };

  const selectedEvents = useMemo(() => {
    if (!activeDateStr) return null;
    return getEventsForDate(activeDateStr);
  }, [activeDateStr, getEventsForDate]);

  const isHoliday = useMemo(() => {
    return selectedEvents?.holidays && selectedEvents.holidays.length > 0;
  }, [selectedEvents]);

  const isFormValid = () => {
    if (!eventForm.title || !eventForm.date) return false;
    if (eventForm.category === 'deadline') {
      return !!eventForm.time;
    }
    if (['exam', 'quiz'].includes(eventForm.category)) {
      return !!eventForm.time && !!eventForm.endTime;
    }
    return true;
  };

  const handleAddEvent = () => {
    if (!isFormValid()) return;
    addEvent(eventForm);
    setEventForm({ title: '', date: '', time: '', endTime: '', category: 'personal', color: '#3b82f6' });
    setShowAddModal(false);
  };

  const filteredHolidays = useMemo(() => {
    if (holidayFilter === 'gazetted') return gazettedHolidays;
    if (holidayFilter === 'restricted') return restrictedHolidays;
    return [...gazettedHolidays, ...restrictedHolidays].sort((a, b) => a.date.localeCompare(b.date));
  }, [holidayFilter, gazettedHolidays, restrictedHolidays]);

  const filteredAcademic = useMemo(() => {
    if (semFilter === 'all') return academicEvents;
    return academicEvents.filter(e => e.semester === semFilter);
  }, [semFilter, academicEvents]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  const renderDetailContent = () => {
    return (
      <DayDetailContent
        activeDateStr={activeDateStr}
        todayStr={todayStr}
        showDayTimetable={showDayTimetable}
        setShowDayTimetable={setShowDayTimetable}
        selectedEvents={selectedEvents}
        selectedDayName={selectedDayName}
        clickedDayClasses={clickedDayClasses}
        removeEvent={removeEvent}
        monthDeadlines={monthDeadlines}
        academicExamPhases={academicExamPhases}
        monthExamsAndQuizzes={monthExamsAndQuizzes}
        monthLongAcademicEvents={monthLongAcademicEvents}
        setEventForm={setEventForm}
        setShowAddModal={setShowAddModal}
        isMobile={isMobile}
        setShowMobileDetail={setShowMobileDetail}
        MONTHS={MONTHS}
        month={month}
        gazettedHolidays={gazettedHolidays}
        restrictedHolidays={restrictedHolidays}
        customEvents={customEvents}
        currentDate={currentDate}
      />
    );
  };

  return (
    <motion.div className="page-container calendar-page-container" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="dashboard-premium-header cal-header-compact">
        <div className="dashboard-premium-header-content">
          <div className="dashboard-premium-icon-wrap cal-header-icon-hide">
            <Calendar size={28} />
          </div>
          <div>
            <h2 className="dashboard-premium-title">Calendar</h2>
          </div>
        </div>
        <div className="cal-page-tabs-container">
          <PillNav
            items={[
              { id: 'calendar', label: 'Calendar' },
              { id: 'holidays', label: 'Holidays' },
              { id: 'academic', label: 'Academic' },
              { id: 'events', label: 'My Events' },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            style={{
              '--nav-base': 'var(--input-bg)',
              '--border-color': 'var(--border)',
              '--accent-color': 'var(--primary)',
              '--bg-color': 'var(--card-bg)',
              '--nav-pill-text': 'var(--text-muted)',
              '--nav-hover-text': 'var(--primary)',
              '--nav-hover-bg': 'rgba(99, 102, 241, 0.08)'
            }}
          />
        </div>
        <div className="dashboard-premium-actions">
          <button className="btn btn-primary btn-sm" onClick={() => { setEventForm({ title: '', date: activeDateStr, type: 'personal', desc: '' }); setShowAddModal(true); }}>
            <Plus size={16} /><span className="cal-btn-text"> Add Event</span>
          </button>
        </div>
      </motion.div>

      {/* Calendar View Tab */}
      {activeTab === 'calendar' && (
        <motion.div variants={itemVariants} className="calendar-view-layout">
          <div className="calendar-grid-container glass-card">
            <div className="calendar-nav-header">
              <button className="cal-nav-btn" onClick={() => goMonth(-1)}><ChevronLeft size={20} /></button>
              <h3 className="cal-month-title">
                {MONTHS[month]} <span className="cal-year">{year}</span>
              </h3>
              <button className="cal-nav-btn" onClick={() => goMonth(1)}><ChevronRight size={20} /></button>
            </div>
            <div className="calendar-weekday-header">
              {WEEKDAYS.map(d => <div key={d} className="cal-weekday">{d}</div>)}
            </div>
            <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${year}-${month}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="calendar-days-grid"
                >
                  {calendarDays.map((d, i) => {
                    // Build colors for this day to apply text styling or gradients
                    const dayColors = [];
                    if (d.events && d.isCurrentMonth) {
                      if (d.events.holidays.length > 0) dayColors.push('#a855f7');
                      if (d.events.academic.some(e => !['deadline', 'exam', 'quiz'].includes(e.category))) dayColors.push('#6366f1');
                      if (d.events.academicDeadlines?.length > 0 || d.events.custom.some(e => e.category === 'deadline')) dayColors.push('#f59e0b');
                      if (d.events.academic.some(e => e.category === 'exam' || e.category === 'quiz') || d.events.custom.some(e => e.category === 'exam' || e.category === 'quiz')) dayColors.push('#ef4444');
                      if (d.events.custom.some(e => !['deadline','exam','quiz'].includes(e.category))) {
                        dayColors.push(d.events.custom.find(e => !['deadline','exam','quiz'].includes(e.category))?.color || '#22c55e');
                      }
                    }

                    const uniqueColors = Array.from(new Set(dayColors));
                    let cellBackground = 'transparent';
                    let dateTextStyle = {};
                    let cellBorder = undefined;

                    const isWeekend = (i % 7 === 0) || (i % 7 === 6);

                    if (uniqueColors.length === 1) {
                      if (d.isToday) {
                        dateTextStyle = { color: '#ffffff' };
                        cellBackground = uniqueColors[0];
                      } else {
                        dateTextStyle = { color: uniqueColors[0] };
                      }
                    } else if (uniqueColors.length > 1) {
                      // Show gradient on the number itself
                      dateTextStyle = {
                        background: `linear-gradient(135deg, ${uniqueColors.join(', ')})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'inline-block',
                        fontWeight: '800'
                      };
                      if (d.isToday) {
                        // Neutral background + border to indicate Today, number has gradient text
                        cellBackground = 'rgba(99, 102, 241, 0.08)';
                        cellBorder = '2px solid var(--primary)';
                      } else {
                        cellBackground = 'transparent';
                      }
                    } else {
                      // No events
                      if (d.isToday) {
                        // today uses default styles (white text, gradient bg in CSS)
                      }
                    }

                    return (
                      <div
                        key={i}
                        className={`cal-day ${!d.isCurrentMonth ? 'other-month' : ''} ${d.isToday ? 'today' : ''} ${d.dateStr === selectedDate ? 'selected' : ''} ${isWeekend ? 'weekend' : ''}`}
                        style={{
                          background: cellBackground !== 'transparent' ? cellBackground : undefined,
                          border: cellBorder,
                        }}
                        onClick={() => handleDayClick(d)}
                      >
                        <span className="cal-day-num" style={dateTextStyle}>{d.day}</span>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="cal-legend">
              <span><span className="cal-legend-bar" style={{ background: '#a855f7' }} /> Holiday</span>
              <span><span className="cal-legend-bar" style={{ background: '#6366f1' }} /> Academic</span>
              <span><span className="cal-legend-bar" style={{ background: '#f59e0b' }} /> Deadline</span>
              <span><span className="cal-legend-bar" style={{ background: '#ef4444' }} /> Exam/Quiz</span>
              <span><span className="cal-legend-bar" style={{ background: '#22c55e' }} /> Custom</span>
            </div>
          </div>

          {/* Day Detail Panel - Desktop */}
          {!isMobile && (
            <div className="calendar-detail-panel glass-card">
              {renderDetailContent()}
            </div>
          )}
        </motion.div>
      )}

      {/* Mobile Day Detail — inline below calendar */}
      {activeTab === 'calendar' && isMobile && (
        <motion.div variants={itemVariants} className="cal-mobile-detail glass-card">
          {renderDetailContent()}
        </motion.div>
      )}

      {/* Holidays Tab */}
      {activeTab === 'holidays' && (
        <motion.div variants={itemVariants}>
          <div className="cal-filter-row">
            <button className={`cal-filter-btn ${holidayFilter === 'all' ? 'active' : ''}`} onClick={() => setHolidayFilter('all')}>All ({gazettedHolidays.length + restrictedHolidays.length})</button>
            <button className={`cal-filter-btn ${holidayFilter === 'gazetted' ? 'active' : ''}`} onClick={() => setHolidayFilter('gazetted')}>Gazetted ({gazettedHolidays.length})</button>
            <button className={`cal-filter-btn ${holidayFilter === 'restricted' ? 'active' : ''}`} onClick={() => setHolidayFilter('restricted')}>Restricted ({restrictedHolidays.length})</button>
          </div>
          <div className="holiday-list glass-card">
            <table className="holiday-table">
              <thead>
                <tr><th>#</th><th>Holiday</th><th>Date</th><th>Day</th><th>Type</th></tr>
              </thead>
              <tbody>
                {filteredHolidays.map((h, i) => {
                  const d = new Date(h.date + 'T00:00');
                  const isPast = d < new Date();
                  return (
                    <tr key={`${h.date}-${h.name}`} className={isPast ? 'past-holiday' : ''}>
                      <td>{i + 1}</td>
                      <td className="holiday-name">{h.name}</td>
                      <td>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td>{d.toLocaleDateString('en-US', { weekday: 'long' })}</td>
                      <td><span className={`holiday-type-badge ${h.type}`}>{h.type}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Academic Calendar Tab */}
      {activeTab === 'academic' && (
        <motion.div variants={itemVariants}>
          <div className="cal-filter-row">
            <button className={`cal-filter-btn ${semFilter === 'all' ? 'active' : ''}`} onClick={() => setSemFilter('all')}>All</button>
            <button className={`cal-filter-btn ${semFilter === 'I' ? 'active' : ''}`} onClick={() => setSemFilter('I')}>Semester I</button>
            <button className={`cal-filter-btn ${semFilter === 'II' ? 'active' : ''}`} onClick={() => setSemFilter('II')}>Semester II</button>
            <button className={`cal-filter-btn ${semFilter === 'Summer' ? 'active' : ''}`} onClick={() => setSemFilter('Summer')}>Summer Term</button>
          </div>
          <div className="academic-timeline glass-card">
            {filteredAcademic.map((e, i) => {
              const d = new Date(e.date + 'T00:00');
              const isPast = d < new Date();
              return (
                <div key={i} className={`acad-event ${isPast ? 'past' : ''}`}>
                  <div className="acad-event-dot" style={{ background: CATEGORY_COLORS[e.category] || '#6366f1' }} />
                  <div className="acad-event-content">
                    <div className="acad-event-name">{e.name}</div>
                    <div className="acad-event-meta">
                      <span>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {e.endDate && <span> → {new Date(e.endDate + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                      <span className="acad-sem-badge">Sem {e.semester}</span>
                      <span className="acad-cat-badge" style={{ color: CATEGORY_COLORS[e.category] }}>{e.category}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* My Events Tab */}
      {activeTab === 'events' && (
        <motion.div variants={itemVariants}>
          {customNonExamEvents.length === 0 ? (
            <div className="empty-state glass-card" style={{ padding: '4rem 2rem' }}>
              <PartyPopper size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No custom events yet</p>
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Create your first event</button>
            </div>
          ) : (
            <div className="custom-events-grid">
              {customNonExamEvents.sort((a,b) => a.date.localeCompare(b.date)).map(e => (
                <div key={e.id} className="custom-event-card glass-card">
                  <div className="custom-event-color" style={{ background: e.color || '#6366f1' }} />
                  <div className="custom-event-body">
                    <div className="custom-event-title">{e.title}</div>
                    <div className="custom-event-date">
                      {new Date(e.date + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {e.time && ` at ${e.time}${e.endTime ? ` - ${e.endTime}` : ''}`}
                    </div>
                    <span className="custom-event-cat">{e.category}</span>
                  </div>
                  <button className="cal-delete-btn" onClick={() => removeEvent(e.id)}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Add Event Modal */}
      <AddEventModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        eventForm={eventForm}
        setEventForm={setEventForm}
        handleAddEvent={handleAddEvent}
        isFormValid={isFormValid}
        savedCourses={savedCourses}
      />

      {/* Timetable Modal (Dialog Box) */}
      <AnimatePresence>
        {showDayTimetable && (
          <div className="modal-overlay" onClick={() => setShowDayTimetable(false)}>
            <motion.div 
              className="modal-content glass-card timetable-dialog-modal" 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '480px', width: '90%' }}
            >
              <div className="modal-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Clock size={20} style={{ color: 'var(--primary)' }} />
                  <span>Timetable - {selectedDayName}</span>
                </h3>
              </div>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '1rem 0' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                  Classes scheduled for {formattedDate}
                </p>
                
                {isHoliday ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                    <Star size={32} style={{ color: '#ef4444', marginBottom: '0.5rem' }} />
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#ef4444' }}>Holiday: {selectedEvents?.holidays[0]?.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>No classes scheduled today! 🎉</p>
                  </div>
                ) : ['Saturday', 'Sunday'].includes(selectedDayName) ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--input-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>☕</span>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text)' }}>Weekend</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enjoy your weekend! No classes scheduled.</p>
                  </div>
                ) : clickedDayClasses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--input-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📖</span>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text)' }}>No Classes</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>No classes scheduled for this day.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {clickedDayClasses.map((slot, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--input-bg)', borderRadius: '8px', borderLeft: '4px solid var(--primary)', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flex: 1, minWidth: 0 }}>
                          <GraduationCap size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong style={{ color: 'var(--text)', fontSize: '0.9rem' }}>{slot.entries[0]?.code || 'Course'}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              {slot.entries[0]?.type || 'Lecture'} &bull; {slot.entries[0]?.venue || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--card-bg)', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                          {slot.time.split(/[-–—]/)[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => setShowDayTimetable(false)}>Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CalendarPage;
