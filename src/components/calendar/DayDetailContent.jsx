import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, X, GraduationCap, Star, BookOpen, Trash2 } from 'lucide-react';

const DayDetailContent = ({
  activeDateStr,
  todayStr,
  showDayTimetable,
  setShowDayTimetable,
  selectedEvents,
  selectedDayName,
  clickedDayClasses,
  removeEvent,
  monthDeadlines,
  academicExamPhases,
  monthExamsAndQuizzes,
  monthLongAcademicEvents,
  setEventForm,
  setShowAddModal,
  isMobile,
  setShowMobileDetail,
  MONTHS,
  month
}) => {
  const formattedDate = new Date(activeDateStr + 'T00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const dayEvents = selectedEvents || { holidays: [], academic: [], custom: [], all: [] };
  const isHoliday = dayEvents.holidays && dayEvents.holidays.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
      {/* Date Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span>{formattedDate}</span>
            <button 
              onClick={() => setShowDayTimetable(true)}
              style={{ 
                fontSize: '0.68rem', 
                padding: '0.15rem 0.45rem', 
                borderRadius: '6px', 
                background: 'var(--input-bg)', 
                border: '1px solid var(--border)', 
                color: 'var(--text-muted)', 
                cursor: 'pointer', 
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                transition: 'all 0.2s ease',
                marginLeft: '0.25rem'
              }}
            >
              <Clock size={11} /> Show Timetable
            </button>
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {activeDateStr === todayStr ? 'Today\'s Agenda' : 'Selected Date'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <button 
            className="btn-icon-sm"
            title="Add Event"
            onClick={() => { setEventForm(prev => ({ ...prev, date: activeDateStr })); setShowAddModal(true); }}
            style={{ padding: '0.35rem', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={16} />
          </button>
          {isMobile && (
            <button className="cal-close-btn" onClick={() => setShowMobileDetail(false)}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Synced Day Timetable - Removed from inline accordion and moved to dialog modal */}

      {/* Dynamic Daily Agenda List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <h5 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
          Events &amp; Holidays
        </h5>
        {!(dayEvents.holidays.length > 0 || dayEvents.academic.length > 0 || dayEvents.custom.filter(e => e.category !== 'exam' && e.category !== 'quiz').length > 0) ? (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.15rem 0' }}>
            No scheduled events for this day.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {dayEvents.holidays.map((e, idx) => (
              <div key={`h-${idx}`} style={{ display: 'flex', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.04)', borderLeft: '3px solid #ef4444', padding: '0.45rem 0.55rem', borderRadius: '0.375rem', fontSize: '0.75rem', alignItems: 'center' }}>
                <Star size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {e.type === 'gazetted' ? '🔴 Gazetted Holiday' : '🟠 Restricted Holiday'}
                  </div>
                </div>
              </div>
            ))}
            {dayEvents.academic.map((e, idx) => (
              <div key={`a-${idx}`} style={{ display: 'flex', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.04)', borderLeft: '3px solid #6366f1', padding: '0.45rem 0.55rem', borderRadius: '0.375rem', fontSize: '0.75rem', alignItems: 'center' }}>
                <BookOpen size={14} style={{ color: '#6366f1', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Semester {e.semester} &bull; {e.category}</div>
                </div>
              </div>
            ))}
            {dayEvents.custom.filter(e => e.category !== 'exam' && e.category !== 'quiz').map((e, idx) => (
              <div key={`c-${e.id}`} style={{ display: 'flex', gap: '0.5rem', background: 'var(--input-bg)', borderLeft: `3px solid ${e.color || '#3b82f6'}`, padding: '0.45rem 0.55rem', borderRadius: '0.375rem', fontSize: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: e.color || '#3b82f6', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{e.title}</div>
                    {e.time && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.1rem' }}>
                        <Clock size={10} /> {e.time}{e.endTime ? ` - ${e.endTime}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <button className="cal-delete-btn" onClick={() => removeEvent(e.id)} style={{ padding: '0.25rem', cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Month Agenda / Highlights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', flex: 1, overflowY: 'auto' }}>
        <h5 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
          Month Highlights ({MONTHS[month]})
        </h5>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {/* Deadlines */}
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.25rem', letterSpacing: '0.3px' }}>Deadlines</div>
            {monthDeadlines.length === 0 ? (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No deadlines this month.</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {monthDeadlines.map((e, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--input-bg)', padding: '0.35rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: '0.5rem' }}>{e.title}</span>
                    <span style={{ color: '#f59e0b', fontWeight: 600, flexShrink: 0 }}>{new Date(e.date + 'T00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exams / Quizzes */}
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#ef4444', marginBottom: '0.25rem', letterSpacing: '0.3px' }}>Exams &amp; Quizzes</div>
            {(academicExamPhases.length === 0 && monthExamsAndQuizzes.length === 0) ? (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No exams scheduled.</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {academicExamPhases.map((e, idx) => (
                  <div key={`ae-${idx}`} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.08)', padding: '0.35rem 0.55rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                    <strong style={{ color: '#ef4444', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{e.title}</strong>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.05rem' }}>
                      {new Date(e.date + 'T00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      {e.endDate && ` → ${new Date(e.endDate + 'T00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`}
                    </span>
                  </div>
                ))}
                {monthExamsAndQuizzes.map((e, idx) => (
                  <div key={`ce-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--input-bg)', padding: '0.35rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: '0.5rem' }}>{e.title}</span>
                    <span style={{ color: '#ef4444', fontWeight: 600, flexShrink: 0 }}>{new Date(e.date + 'T00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Academic Periods */}
          {monthLongAcademicEvents.length > 0 && (
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#10b981', marginBottom: '0.25rem', letterSpacing: '0.3px' }}>Academic Periods</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {monthLongAcademicEvents.map((e, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', background: 'var(--input-bg)', padding: '0.35rem 0.55rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                    <span style={{ color: 'var(--text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.05rem' }}>
                      {new Date(e.date + 'T00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      {e.endDate && ` → ${new Date(e.endDate + 'T00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayDetailContent;
