import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Coffee } from 'lucide-react';
import { getClassWindow, getHue } from '../../utils/homeUtils';

const TimelineRibbon = ({ todaySchedule, selectedScheduleDay, itemVariants }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentMins = now.getHours() * 60 + now.getMinutes();
  const isToday = selectedScheduleDay === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
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
    <motion.div className="card timeline-ribbon-card" variants={itemVariants}>
      <div className="timeline-ribbon-header">
        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
          <Clock size={16} style={{ color: 'var(--primary)' }} /> Live Day Timeline ({selectedScheduleDay})
        </h4>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>8:30 AM - 6:30 PM</span>
      </div>
      
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
          {todaySchedule.map(({ time, entries, status }) => {
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
                  {`${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`}
                </div>
                <div className="pointer-dot" />
                <div className="pointer-line" />
              </div>
            );
          })()}
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(TimelineRibbon);
