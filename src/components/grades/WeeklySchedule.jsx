import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';

const WeeklySchedule = ({ timetableCourses, weeklySchedule, itemVariants }) => {
  return (
    <motion.div 
      className="grades-chart-card glass-card" 
      variants={itemVariants}
      style={{ marginTop: '1.25rem', padding: '1.25rem', marginBottom: '0.5rem' }}
    >
      <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <CalendarDays size={16} style={{ color: 'var(--primary)' }} /> Synced Active Semester Weekly Schedule
      </h3>
      
      {/* Workload Stats Row */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '90px', background: 'var(--input-bg)', padding: '0.5rem 0.75rem', borderRadius: '0.4rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registered Courses</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.15rem' }}>{timetableCourses.length}</div>
        </div>
        <div style={{ flex: 1, minWidth: '90px', background: 'var(--input-bg)', padding: '0.5rem 0.75rem', borderRadius: '0.4rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Semester Credits</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.15rem' }}>
            {timetableCourses.reduce((sum, c) => sum + (parseInt(c.credits) || 0), 0)}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '90px', background: 'var(--input-bg)', padding: '0.5rem 0.75rem', borderRadius: '0.4rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Workload / Week</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.15rem' }}>
            {timetableCourses.reduce((sum, c) => sum + (c.slots?.length || 0) * 1.5, 0)} hrs
          </div>
        </div>
      </div>

      {/* Daily Schedule List (Horizontal) */}
      <div className="weekly-schedule-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
          const dayClasses = weeklySchedule[day] || [];
          return (
            <div key={day} style={{ background: 'rgba(99, 102, 241, 0.01)', border: '1px dashed var(--border)', borderRadius: '0.5rem', padding: '0.4rem', minWidth: '105px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '0.2rem', marginBottom: '0.35rem', textAlign: 'center' }}>
                {day.substring(0, 3)}
              </div>
              {dayClasses.length === 0 ? (
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', padding: '0.75rem 0' }}>
                  No classes
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {dayClasses.map((cls, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        background: 'var(--card-bg)', 
                        border: '1px solid var(--border)', 
                        borderLeft: '3px solid var(--primary)', 
                        borderRadius: '0.25rem', 
                        padding: '0.25rem 0.35rem', 
                        fontSize: '0.6rem',
                        lineHeight: '1.2'
                      }}
                    >
                      <div style={{ fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={cls.code + ' - ' + cls.title}>{cls.code}</div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '0.05rem', fontSize: '0.55rem' }}>{cls.time.split(' – ')[0]}</div>
                      <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.5rem', marginTop: '0.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={cls.venue}>{cls.venue}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default WeeklySchedule;
