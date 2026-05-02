import React from 'react';
import { Users, CalendarDays, BookMarked, Sparkles } from 'lucide-react';

const ExplorePage = () => {
  const cards = [
    { icon: Users, title: 'Clubs', desc: 'Discover student clubs and organizations', color: '#6366f1' },
    { icon: CalendarDays, title: 'Events', desc: 'Upcoming campus events and activities', color: '#f472b6' },
    { icon: BookMarked, title: 'Resources', desc: 'Study materials and academic resources', color: '#22c55e' },
    { icon: Sparkles, title: 'Opportunities', desc: 'Internships, competitions and more', color: '#f59e0b' },
  ];

  return (
    <div className="page-container">
      <h2 style={{ marginBottom: '0.5rem' }}>Explore</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Discover what's happening on campus</p>

      <div className="explore-grid">
        {cards.map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="explore-card" style={{ borderLeft: `4px solid ${color}` }}>
            <div className="explore-card-header">
              <Icon size={28} style={{ color }} />
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
