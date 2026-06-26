import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Eye, Clock, MapPin } from 'lucide-react';
import { HOLIDAY_CREATIVES, getDefaultHolidayCreative, getHue, checkIsNoClassPeriod } from '../../utils/homeUtils';
import DayPillNav from './DayPillNav';

const ScheduleSection = ({
  selectedScheduleDay,
  setSelectedScheduleDay,
  todayName,
  savedTimetable,
  setShowClassModal,
  selectedDayHoliday,
  selectedDayExtraClasses,
  todaySchedule,
  selectedDayDateStr,
  holidays,
  isMobile,
  itemVariants,
  userProfile,
  currentUser
}) => {
  return (
    <motion.div className="today-section" variants={itemVariants}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', width: '100%', position: 'relative' }}>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 2 }}>
          <h3 className="section-title" style={{ margin: 0, textAlign: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <Calendar size={20} /> Class Schedule: {selectedScheduleDay}{selectedScheduleDay === todayName ? ' (Today)' : ''}
          </h3>
          <div className="home-day-tabs" style={{ display: 'flex', justifyContent: 'center', background: 'transparent', padding: 0, border: 'none', boxShadow: 'none' }}>
            <DayPillNav
              days={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']}
              activeDay={selectedScheduleDay}
              onDayChange={setSelectedScheduleDay}
              todayName={todayName}
            />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          {savedTimetable && !isMobile && (
            <button 
              type="button"
              className="btn btn-sm" 
              onClick={() => setShowClassModal(true)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem', 
                padding: '0.45rem 0.75rem', 
                fontSize: '0.75rem', 
                cursor: 'pointer',
                border: 'none',
                background: 'var(--input-bg)',
                color: 'var(--text-muted)',
                borderRadius: '8px'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--input-bg)'}
            >
              <Eye size={13} /> Full Schedule
            </button>
          )}
        </div>
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
          className="btn btn-sm" 
          onClick={() => setShowClassModal(true)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.35rem', 
            padding: '0.55rem 0.75rem', 
            fontSize: '0.8rem', 
            width: '100%', 
            marginTop: '1.25rem', 
            cursor: 'pointer',
            border: 'none',
            background: 'var(--input-bg)',
            color: 'var(--text-muted)',
            borderRadius: '8px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--input-bg)'}
        >
          <Eye size={14} /> Full Schedule
        </button>
      )}
    </motion.div>
  );
};

export default React.memo(ScheduleSection);
export { HOLIDAY_CREATIVES, checkIsNoClassPeriod };
