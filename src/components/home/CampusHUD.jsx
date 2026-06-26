import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getDailyQuote } from '../../data/quotes';

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

const CampusHUD = ({ activeMoodId, hudInfo, userProfile, currentUser, itemVariants }) => {
  const currentMood = MOODS.find(m => m.id === activeMoodId) || MOODS[0];

  const [localTime, setLocalTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTimeStr = localTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const [timeVal, ampmVal] = formattedTimeStr.split(' ');
  const secVal = String(localTime.getSeconds()).padStart(2, '0');

  return (
    <motion.div 
      className="campus-hud-card" 
      variants={itemVariants}
      style={{
        '--aurora-1-color': currentMood.solidColor1,
        '--aurora-2-color': currentMood.solidColor2,
        background: `linear-gradient(135deg, ${currentMood.color1} 0%, ${currentMood.color2} 100%), var(--card-bg)`,
        boxShadow: `0 12px 40px -10px ${currentMood.color1.replace('0.15', '0.08')}`
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
            {timeVal}
            <span className="seconds">:{secVal}</span>
            <span className="ampm" style={{ fontSize: '1.25rem', marginLeft: '0.25rem', verticalAlign: 'middle', textTransform: 'uppercase' }}>{ampmVal}</span>
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
  );
};

export default React.memo(CampusHUD);
export { MOODS };

