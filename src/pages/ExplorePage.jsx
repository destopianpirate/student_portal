import React from 'react';
import { Users, CalendarDays, BookMarked, Sparkles } from 'lucide-react';

const ExplorePage = () => {
  const cards = [
    { icon: Users, title: 'Clubs', desc: 'Discover student clubs and organizations', color: '#6366f1' },
    { icon: CalendarDays, title: 'Events', desc: 'Upcoming campus events and activities', color: '#f472b6' },
    { icon: Sparkles, title: 'Opportunities', desc: 'Internships, competitions and more', color: '#f59e0b' },
  ];

  return (
    <div className="page-container">
      <h2 style={{ 
        marginBottom: '0.5rem',
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: '1.75rem',
        fontWeight: 800
      }}>Explore</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', animation: 'fadeIn .6s ease .1s both' }}>Discover what's happening on campus</p>

      <div className="explore-grid">
        {cards.map(({ icon: Icon, title, desc, color }, index) => (
          <div key={title} className="explore-card" style={{ 
            borderLeft: `4px solid ${color}`,
            animationDelay: `${0.05 + index * 0.08}s`
          }}>
            <div className="explore-card-header">
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '0.75rem',
                background: `${color}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all .3s',
                border: `1px solid ${color}20`
              }}>
                <Icon size={24} style={{ color }} />
              </div>
              <span className="coming-soon-badge">Coming Soon</span>
            </div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
