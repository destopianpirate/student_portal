import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Star, BookOpen, PartyPopper, Clock, Trash2, Filter, GraduationCap } from 'lucide-react';
import { useCalendar } from '../contexts/CalendarContext';
import { useAuth } from '../contexts/AuthContext';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', endTime: '', category: 'personal', color: '#3b82f6' });
  const [holidayFilter, setHolidayFilter] = useState('all');
  const [semFilter, setSemFilter] = useState('all');

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const savedTimetable = useMemo(() => {
    if (!currentUser) return null;
    try { return JSON.parse(localStorage.getItem(`timetable_${currentUser.uid}`)) || userProfile?.timetable || null; } catch { return null; }
  }, [currentUser, userProfile]);

  const selectedDayName = useMemo(() => {
    if (!selectedDate) return null;
    const d = new Date(selectedDate + 'T00:00');
    return DAY_NAMES[d.getDay()];
  }, [selectedDate]);

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
    if (!selectedDate || !selectedDayName || !savedTimetable) return [];
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
  }, [selectedDate, selectedDayName, savedTimetable]);

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
    
    // Previous month fill
    const prevDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevDays - i, isCurrentMonth: false, dateStr: '' });
    }
    
    // Current month
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const events = getEventsForDate(dateStr);
      days.push({ day: d, isCurrentMonth: true, dateStr, isToday: dateStr === todayStr, events });
    }
    
    // Next month fill
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false, dateStr: '' });
    }
    return days;
  }, [year, month, getEventsForDate]);

  const goMonth = (dir) => {
    setCurrentDate(new Date(year, month + dir, 1));
    if (!isMobile) setSelectedDate(null);
  };

  const handleDayClick = (d) => {
    if (!d.isCurrentMonth) return;
    setSelectedDate(d.dateStr);
    if (isMobile) {
      setShowMobileDetail(true);
    }
  };

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return null;
    return getEventsForDate(selectedDate);
  }, [selectedDate, getEventsForDate]);

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
    if (!selectedDate) {
      return (
        <div className="cal-detail-empty">
          <Calendar size={32} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>Select a date to view events</p>
        </div>
      );
    }

    return (
      <>
        <div className="cal-detail-header-flex">
          <h4 className="cal-detail-date">
            {new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h4>
          {isMobile && (
            <button className="cal-close-btn" onClick={() => setShowMobileDetail(false)}>
              <X size={18} />
            </button>
          )}
        </div>
        
        {selectedEvents.all.length === 0 ? (
          <div className="cal-detail-empty">
            <p>No events on this day</p>
            <button className="btn btn-outline btn-sm" onClick={() => { setEventForm(prev => ({ ...prev, date: selectedDate })); setShowAddModal(true); if (isMobile) setShowMobileDetail(false); }}>
              <Plus size={14} /> Add Event
            </button>
          </div>
        ) : (
          <div className="cal-detail-events">
            {selectedEvents.holidays.map((e, i) => (
              <motion.div initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} transition={{delay: i*0.05}} key={`h-${i}`} className="cal-detail-item holiday">
                <Star size={16} />
                <div className="cal-detail-item-content">
                  <div className="cal-detail-name">{e.name}</div>
                  <div className="cal-detail-type">{e.type === 'gazetted' ? '🔴 Gazetted Holiday' : '🟠 Restricted Holiday'}</div>
                </div>
              </motion.div>
            ))}
            {selectedEvents.academic.map((e, i) => (
              <motion.div initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} transition={{delay: (selectedEvents.holidays.length + i)*0.05}} key={`a-${i}`} className="cal-detail-item academic">
                <BookOpen size={16} />
                <div className="cal-detail-item-content">
                  <div className="cal-detail-name">{e.name}</div>
                  <div className="cal-detail-type">Semester {e.semester} • {e.category}</div>
                </div>
              </motion.div>
            ))}
            {selectedEvents.custom.map((e, i) => (
              <motion.div initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} transition={{delay: (selectedEvents.holidays.length + selectedEvents.academic.length + i)*0.05}} key={`c-${e.id}`} className="cal-detail-item custom">
                <div className="cal-event-color" style={{ background: e.color || '#6366f1' }} />
                <div className="cal-detail-item-content">
                  <div className="cal-detail-name">{e.title}</div>
                  {e.time && (
                    <div className="cal-detail-type">
                      <Clock size={12} style={{display:'inline', marginRight: 4}} /> 
                      {e.time}{e.endTime ? ` - ${e.endTime}` : ''}
                    </div>
                  )}
                </div>
                <button className="cal-delete-btn" onClick={() => removeEvent(e.id)}><Trash2 size={14} /></button>
              </motion.div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <motion.div className="page-container calendar-page-container" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="page-header-row">
        <div>
          <h2 className="page-title"><Calendar size={24} /> Calendar</h2>
          <p className="page-subtitle">Holidays, academic events, and your personal schedule</p>
        </div>
        <button className="btn btn-primary btn-sm add-event-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> <span className="add-event-text">Add Event</span>
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div className="study-tabs" variants={itemVariants}>
        <button className={`study-tab ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
          <Calendar size={16} /> Calendar
        </button>
        <button className={`study-tab ${activeTab === 'holidays' ? 'active' : ''}`} onClick={() => setActiveTab('holidays')}>
          <Star size={16} /> Holidays <span className="tab-badge">{gazettedHolidays.length + restrictedHolidays.length}</span>
        </button>
        <button className={`study-tab ${activeTab === 'academic' ? 'active' : ''}`} onClick={() => setActiveTab('academic')}>
          <BookOpen size={16} /> Academic
        </button>
        <button className={`study-tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
          <PartyPopper size={16} /> My Events <span className="tab-badge">{customEvents.length}</span>
        </button>
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
            <div className="calendar-days-grid">
              <AnimatePresence mode="popLayout">
                {calendarDays.map((d, i) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.005 }}
                    key={`${year}-${month}-${i}`}
                    className={`cal-day ${!d.isCurrentMonth ? 'other-month' : ''} ${d.isToday ? 'today' : ''} ${d.dateStr === selectedDate ? 'selected' : ''} ${d.events && d.events.all.length > 0 ? 'has-events' : ''}`}
                    onClick={() => handleDayClick(d)}
                  >
                    <span className="cal-day-num">{d.day}</span>
                    {d.events && d.events.all.length > 0 && (
                      <div className="cal-day-dots">
                        {d.events.holidays.length > 0 && <span className="cal-dot holiday" />}
                        {/* Deadline dot: academic deadlines OR custom deadlines */}
                        {(d.events.academicDeadlines?.length > 0 || d.events.custom.some(e => e.category === 'deadline')) && <span className="cal-dot deadline" />}
                        {d.events.academic.some(e => e.category !== 'deadline') && <span className="cal-dot academic" />}
                        {/* Exam dot: custom exams/quizzes */}
                        {d.events.custom.some(e => e.category === 'exam' || e.category === 'quiz') && <span className="cal-dot exam" />}
                        {/* Other custom events */}
                        {d.events.custom.some(e => !['deadline','exam','quiz'].includes(e.category)) && <span className="cal-dot custom" />}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="cal-legend">
              <span><span className="cal-dot holiday" /> Holiday</span>
              <span><span className="cal-dot academic" /> Academic</span>
              <span><span className="cal-dot deadline" /> Deadline</span>
              <span><span className="cal-dot exam" /> Exam/Quiz</span>
              <span><span className="cal-dot custom" /> Custom</span>
            </div>
          </div>

          {/* Day Detail Panel - Desktop */}
          {!isMobile && (
            <div className="calendar-detail-panel glass-card">
              {renderDetailContent()}
            </div>
          )}

          {/* Day Detail Bottom Sheet - Mobile */}
          <AnimatePresence>
            {isMobile && showMobileDetail && (
              <>
                <motion.div 
                  className="mobile-sheet-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileDetail(false)}
                />
                <motion.div 
                  className="mobile-bottom-sheet glass-card"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  drag="y"
                  dragConstraints={{ top: 0 }}
                  onDragEnd={(e, { offset, velocity }) => {
                    if (offset.y > 100 || velocity.y > 500) {
                      setShowMobileDetail(false);
                    }
                  }}
                >
                  <div className="bottom-sheet-handle" />
                  {renderDetailContent()}
                </motion.div>
              </>
            )}
          </AnimatePresence>
          {/* Bottom Dynamic Sections */}
          <div className="calendar-bottom-widgets">
            {/* Section 1: Classes of the Selected Day */}
            <div className="bottom-widget-card glass-card">
              <h4 className="bottom-widget-title">
                <Clock size={16} />
                Classes {selectedDate ? `— ${new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}` : ''}
              </h4>
              <div className="bottom-widget-content">
                {!selectedDate ? (
                  <div className="bottom-widget-empty">
                    <p>Click a date on the calendar to view its classes.</p>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const dayEvents = getEventsForDate(selectedDate);
                      const isHoliday = dayEvents.holidays && dayEvents.holidays.length > 0;
                      const customEventsForDay = dayEvents.custom || [];
                      
                      if (isHoliday) {
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div className="bottom-widget-empty" style={{ color: 'var(--danger)', padding: '1rem', height: 'auto', minHeight: 'auto' }}>
                              <Star size={20} style={{ marginBottom: '0.35rem', opacity: 0.8 }} />
                              <p style={{ margin: 0 }}><strong>Holiday:</strong> {dayEvents.holidays[0].name}</p>
                              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>No regular classes scheduled today! 🎉</span>
                            </div>
                            {customEventsForDay.length > 0 && (
                              <div style={{ padding: '0 0.5rem 1rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                  Extra Scheduled Events
                                </div>
                                <div className="bottom-widget-list">
                                  {customEventsForDay.map((e, idx) => (
                                    <div key={idx} className="bottom-widget-item">
                                      <div className="cal-event-color" style={{ background: e.color || 'var(--primary)', marginTop: '5px' }} />
                                      <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                                          <span>{e.title}</span>
                                          {e.time && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.time}</span>}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                          <span style={{ textTransform: 'capitalize' }}>{e.category}</span>
                                          {e.endTime && <span>until {e.endTime}</span>}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                      
                      if (['Saturday', 'Sunday'].includes(selectedDayName)) {
                        if (customEventsForDay.length > 0) {
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <div className="bottom-widget-empty" style={{ padding: '1rem', height: 'auto', minHeight: 'auto' }}>
                                <PartyPopper size={20} style={{ marginBottom: '0.35rem', opacity: 0.5 }} />
                                <p style={{ margin: 0 }}>Weekend ({selectedDayName})</p>
                                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>No regular classes. Enjoy your weekend! ☕</span>
                              </div>
                              <div style={{ padding: '0 0.5rem 1rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                  Extra Scheduled Events
                                </div>
                                <div className="bottom-widget-list">
                                  {customEventsForDay.map((e, idx) => (
                                    <div key={idx} className="bottom-widget-item">
                                      <div className="cal-event-color" style={{ background: e.color || 'var(--primary)', marginTop: '5px' }} />
                                      <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                                          <span>{e.title}</span>
                                          {e.time && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.time}</span>}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                          <span style={{ textTransform: 'capitalize' }}>{e.category}</span>
                                          {e.endTime && <span>until {e.endTime}</span>}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div className="bottom-widget-empty">
                            <PartyPopper size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                            <p>It's {selectedDayName} (Weekend)!</p>
                            <span>No classes scheduled. Enjoy your break! ☕</span>
                          </div>
                        );
                      }

                      if (clickedDayClasses.length === 0) {
                        return (
                          <div className="bottom-widget-empty">
                            <p>No classes scheduled for this day.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="bottom-widget-list">
                          {clickedDayClasses.map((slot, idx) => (
                            <div key={idx} className="bottom-widget-item">
                              <GraduationCap size={16} style={{ color: 'var(--primary)', marginTop: '2px' }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>{slot.entries[0]?.code || 'Course'}</span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{slot.time}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>{slot.entries[0]?.type || 'Lecture'}</span>
                                  <span style={{ fontWeight: '500' }}>{slot.entries[0]?.venue || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>

            {/* Section 2: Deadlines of the Month */}
            <div className="bottom-widget-card glass-card">
              <h4 className="bottom-widget-title">
                <Filter size={16} />
                Deadlines — {MONTHS[month]}
              </h4>
              <div className="bottom-widget-content">
                {monthDeadlines.length === 0 ? (
                  <div className="bottom-widget-empty">
                    <p>No deadlines scheduled for {MONTHS[month]}.</p>
                    <button className="btn btn-outline btn-sm" onClick={() => { setShowAddModal(true); setEventForm(f => ({ ...f, category: 'deadline' })); }}>
                      <Plus size={12} /> Add Deadline
                    </button>
                  </div>
                ) : (
                  <div className="bottom-widget-list">
                    {monthDeadlines.map((e, idx) => (
                      <div key={idx} className="bottom-widget-item">
                        <div className="cal-event-color" style={{ background: CATEGORY_COLORS.deadline, marginTop: '5px' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{e.title}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(e.date + 'T00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          {e.time && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Time: {e.time}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>


            {/* Section 3: Multi-Day Academic Periods for this month */}
            {monthLongAcademicEvents.length > 0 && (
              <div className="bottom-widget-card glass-card">
                <h4 className="bottom-widget-title">
                  <BookOpen size={16} />
                  Academic Periods — {MONTHS[month]}
                </h4>
                <div className="bottom-widget-content">
                  <div className="bottom-widget-list">
                    {monthLongAcademicEvents.map((e, idx) => (
                      <div key={idx} className="bottom-widget-item">
                        <div className="cal-event-color" style={{ background: CATEGORY_COLORS[e.category] || '#6366f1', marginTop: '5px' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{e.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                            <span>
                              {new Date(e.date + 'T00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                              {e.endDate && ` → ${new Date(e.endDate + 'T00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`}
                            </span>
                            <span className="acad-sem-badge" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>Sem {e.semester}</span>
                            <span style={{ color: CATEGORY_COLORS[e.category], textTransform: 'capitalize', fontWeight: '600', fontSize: '0.7rem' }}>{e.category}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Exams & Quizzes of the Month */}
            <div className="bottom-widget-card glass-card">
              <h4 className="bottom-widget-title">
                <Star size={16} />
                Exams &amp; Quizzes — {MONTHS[month]}
              </h4>
              <div className="bottom-widget-content">
                {/* Academic Exam Phases */}
                {academicExamPhases.length > 0 && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.07)',
                    border: '1px solid rgba(239, 68, 68, 0.22)',
                    borderRadius: '10px',
                    padding: '0.6rem 0.75rem',
                    marginBottom: '0.85rem'
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ef4444', marginBottom: '0.4rem', padding: '0 0.1rem' }}>
                      Academic Phases (Exam Period)
                    </div>
                    <div className="bottom-widget-list">
                      {academicExamPhases.map((e, idx) => (
                        <div key={`ap-${idx}`} className="bottom-widget-item" style={{ background: 'rgba(239, 68, 68, 0.03)', borderColor: 'rgba(239, 68, 68, 0.12)' }}>
                          <div className="cal-event-color" style={{ background: '#ef4444', marginTop: '5px' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{e.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                              <span>
                                {new Date(e.date + 'T00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                {e.endDate && ` → ${new Date(e.endDate + 'T00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`}
                              </span>
                              <span className="acad-sem-badge" style={{ fontSize: '0.65rem', padding: '1px 6px', color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>Sem {e.semester}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Manually Added Exams */}
                <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.4rem', padding: '0 0.1rem' }}>
                  My Added Exams &amp; Quizzes — {MONTHS[month]}
                </div>
                {monthExamsAndQuizzes.length === 0 ? (
                  <div className="bottom-widget-empty">
                    <p>No exams or quizzes added for {MONTHS[month]}.</p>
                    <button className="btn btn-outline btn-sm" onClick={() => { setShowAddModal(true); setEventForm(f => ({ ...f, category: 'exam' })); }}>
                      <Plus size={12} /> Add Exam/Quiz
                    </button>
                  </div>
                ) : (
                  <div className="bottom-widget-list">
                    {monthExamsAndQuizzes.map((e, idx) => (
                      <div key={`ceq-${idx}`} className="bottom-widget-item">
                        <div className="cal-event-color" style={{ background: CATEGORY_COLORS[e.category] || '#ef4444', marginTop: '5px' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{e.title}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(e.date + 'T00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ textTransform: 'capitalize' }}>{e.category}</span>
                            {e.time && <span>{e.time}{e.endTime ? ` - ${e.endTime}` : ''}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
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
          {customEvents.length === 0 ? (
            <div className="empty-state glass-card" style={{ padding: '4rem 2rem' }}>
              <PartyPopper size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No custom events yet</p>
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Create your first event</button>
            </div>
          ) : (
            <div className="custom-events-grid">
              {customEvents.sort((a,b) => a.date.localeCompare(b.date)).map(e => (
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
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <motion.div 
              className="modal-content glass-card add-event-modal" 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3><Plus size={20} style={{ color: 'var(--primary)' }} /> Add Event</h3>
                <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                {/* Event Type & Name */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Event Type <span style={{ color: 'red' }}>*</span></label>
                    <select 
                      className="form-input" 
                      value={eventForm.category} 
                      onChange={e => setEventForm(f => {
                        const cat = e.target.value;
                        const defaultColors = {
                          personal: '#3b82f6',
                          academic: '#6366f1',
                          social: '#ec4899',
                          deadline: '#f59e0b',
                          exam: '#ef4444',
                          quiz: '#14b8a6'
                        };
                        return { ...f, category: cat, color: defaultColors[cat] || '#6366f1' };
                      })}
                    >
                      <option value="personal">Personal</option>
                      <option value="academic">Academic</option>
                      <option value="social">Social</option>
                      <option value="deadline">Deadline</option>
                      <option value="exam">Exam</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Event Name <span style={{ color: 'red' }}>*</span></label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="What's happening?" 
                      value={eventForm.title} 
                      onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} 
                      autoFocus 
                    />
                  </div>
                </div>

                {/* Conditional Fields depending on selected event type */}
                {['personal', 'academic', 'social'].includes(eventForm.category) && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date <span style={{ color: 'red' }}>*</span></label>
                      <input type="date" className="form-input" value={eventForm.date} onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Time (Optional)</label>
                      <input type="time" className="form-input" value={eventForm.time} onChange={e => setEventForm(f => ({ ...f, time: e.target.value }))} />
                    </div>
                  </div>
                )}

                {eventForm.category === 'deadline' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Due Date <span style={{ color: 'red' }}>*</span></label>
                      <input type="date" className="form-input" value={eventForm.date} onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Due Time <span style={{ color: 'red' }}>*</span></label>
                      <input type="time" className="form-input" value={eventForm.time} onChange={e => setEventForm(f => ({ ...f, time: e.target.value }))} />
                    </div>
                  </div>
                )}

                {['exam', 'quiz'].includes(eventForm.category) && (
                  <>
                    <div className="form-group">
                      <label>Date <span style={{ color: 'red' }}>*</span></label>
                      <input type="date" className="form-input" value={eventForm.date} onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Start Time <span style={{ color: 'red' }}>*</span></label>
                        <input type="time" className="form-input" value={eventForm.time} onChange={e => setEventForm(f => ({ ...f, time: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label>End Time <span style={{ color: 'red' }}>*</span></label>
                        <input type="time" className="form-input" value={eventForm.endTime} onChange={e => setEventForm(f => ({ ...f, endTime: e.target.value }))} />
                      </div>
                    </div>
                  </>
                )}

                {/* Color Selector */}
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label>Event Color</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.35rem' }}>
                    {['#3b82f6', '#6366f1', '#ec4899', '#f59e0b', '#ef4444', '#14b8a6', '#a78bfa'].map(c => (
                      <button 
                        key={c}
                        type="button" 
                        onClick={() => setEventForm(f => ({ ...f, color: c }))} 
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          backgroundColor: c, 
                          border: eventForm.color === c ? '2.5px solid var(--text)' : '1.5px solid rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      />
                    ))}
                    <input 
                      type="color" 
                      className="form-color" 
                      value={eventForm.color} 
                      onChange={e => setEventForm(f => ({ ...f, color: e.target.value }))} 
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        padding: 0, 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        background: 'transparent'
                      }} 
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddEvent} disabled={!isFormValid()}>Save Event</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CalendarPage;
