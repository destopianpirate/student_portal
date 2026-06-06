import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  BookOpenCheck,
  Utensils,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const SHOWCASE_TABS = [
  {
    id: 'schedule',
    label: 'Smart Timetable',
    icon: Clock,
    tag: 'Academic Routine Mapping',
    title: 'Never miss a slot again.',
    desc: 'Our intelligent slot scheduler automatically generates your weekly schedule. It marks your current running classes, counts down to the next lecture, and factors in standard lunch breaks.',
    bullets: [
      'Automatic slot-to-time mapping scheme',
      'Current class live highlighting and venue markers',
      'Direct links to professor contact logs'
    ],
    visual: (
      <div className="showcase-card-wrapper timetable-widget">
        <div className="timeline-connector-line"></div>

        <div className="timeline-widget-card active-card">
          <div className="timeline-card-header">
            <span className="live-pill"><span className="pulse-dot"></span> LIVE NOW</span>
          </div>
          <h4 className="class-name">CS 201 - Data Structures & Algorithms</h4>
          <div className="class-meta">
            <span>📍 LHC-101</span>
            <span>👤 Prof. Amit Pradhan</span>
          </div>

          <div className="class-progress-container">
            <div className="class-progress-track">
              <div className="class-progress-fill" style={{ width: '65%' }}></div>
            </div>
            <div className="class-progress-labels">
              <span>10:00 AM</span>
              <span>65% completed</span>
              <span>11:20 AM</span>
            </div>
          </div>
        </div>

        <div className="timeline-widget-card upcoming-card">
          <div className="timeline-card-header">
            <span className="upcoming-pill">NEXT UP - 11:30 AM</span>
          </div>
          <h4 className="class-name">MA 201 - Linear Algebra</h4>
          <div className="class-meta">
            <span>📍 LHC-102</span>
            <span>👤 Prof. Sunita Rao</span>
          </div>
          <div className="class-time-tag">Starts in 30 mins</div>
        </div>
      </div>
    )
  },
  {
    id: 'grades',
    label: 'Academic Tracker',
    icon: BookOpenCheck,
    tag: 'Progress & Planning',
    title: 'Know where you stand in your curriculum.',
    desc: 'Keep track of all your semesters, credits earned, and grade logs in one consolidated interface. Compute your cumulative and semester-wise GPA dynamically.',
    bullets: [
      'Dynamically updated SGPA/CGPA calculations',
      'Visual credit breakdown indicators',
      'Audit status and course details logs'
    ],
    visual: (
      <div className="showcase-card-wrapper grades-widget">
        <div className="grades-header-row">
          <div className="grades-stat-card">
            <span className="stat-label">CUMULATIVE CGPA</span>
            <div className="stat-value-group">
              <span className="stat-value text-gradient">9.12</span>
              <span className="stat-trend positive">▲ +0.32</span>
            </div>
          </div>

          <div className="grades-stat-card">
            <span className="stat-label">CREDITS EARNED</span>
            <div className="credit-progress-box">
              <svg className="radial-progress-svg" viewBox="0 0 36 36">
                <path className="radial-track" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="radial-fill" strokeDasharray="41, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="credit-value">
                <span className="current">68</span>
                <span className="total">/164</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grades-chart-card">
          <div className="chart-header">
            <span>GPA TRAJECTORY</span>
            <span className="chart-subtitle">Across Semesters</span>
          </div>
          <div className="chart-container">
            <svg viewBox="0 0 200 80" className="gpa-curve-svg">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="10" y1="10" x2="190" y2="10" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2" />
              <line x1="10" y1="40" x2="190" y2="40" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2" />
              <line x1="10" y1="70" x2="190" y2="70" stroke="var(--border)" strokeWidth="0.5" />

              <path d="M15,70 L15,48 L70,30 L125,22 L180,10 L180,70 Z" fill="url(#chartGlow)" />
              <path d="M15,48 L70,30 L125,22 L180,10" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />

              <circle cx="15" cy="48" r="3.5" fill="var(--card-bg)" stroke="var(--primary)" strokeWidth="2" />
              <circle cx="70" cy="30" r="3.5" fill="var(--card-bg)" stroke="var(--primary)" strokeWidth="2" />
              <circle cx="125" cy="22" r="3.5" fill="var(--card-bg)" stroke="var(--primary)" strokeWidth="2" />
              <circle cx="180" cy="10" r="3.5" fill="var(--card-bg)" stroke="var(--accent)" strokeWidth="2" />

              <text x="15" y="78" className="chart-label">Sem 1</text>
              <text x="70" y="78" className="chart-label">Sem 2</text>
              <text x="125" y="78" className="chart-label">Sem 3</text>
              <text x="180" y="78" className="chart-label">Sem 4</text>

              <text x="23" y="44" className="chart-value">8.2</text>
              <text x="78" y="26" className="chart-value">8.8</text>
              <text x="133" y="18" className="chart-value">9.0</text>
              <text x="165" y="6" className="chart-value highlight">9.5</text>
            </svg>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'mess',
    label: 'Mess Parser',
    icon: Utensils,
    tag: 'IITGN Integration',
    title: "What's on the menu today?",
    desc: "Say goodbye to looking up messy PDFs or spreadsheets. AcadX parses the official hostel mess menu and displays exactly what's currently cooking for Breakfast, Lunch, High Tea, or Dinner.",
    bullets: [
      'Automatic Excel/PDF cell-mapping configurations',
      'Live Meal tab detection based on local time',
      'Live meal window alerts and chef specialties'
    ],
    visual: (
      <div className="showcase-card-wrapper mess-widget">
        <div className="mess-menu-card">
          <img src="/gourmet_thali.png" alt="Meal Preview" className="mess-card-hero-img" style={{ width: '100%', height: '140px', objectFit: 'cover', borderBottom: '1px solid var(--border)' }} />
          <div className="mess-menu-header">
            <div className="meal-tag-group">
              <span className="meal-pill">LUNCH SPECIAL 🍲</span>
              <span className="time-badge">12:30 PM – 2:30 PM</span>
            </div>
            <div className="menu-rating">
              <span className="star-icon">★</span>
              <span className="rating-value">4.8</span>
              <span className="rating-count">(124 reviews)</span>
            </div>
          </div>

          <div className="menu-items-list">
            <div className="menu-item-row">
              <div className="menu-item-name-group">
                <span className="menu-item-bullet">•</span>
                <span className="menu-item-name">Paneer Butter Masala</span>
              </div>
              <span className="menu-item-category chef-choice">CHEF'S CHOICE</span>
            </div>

            <div className="menu-item-row">
              <div className="menu-item-name-group">
                <span className="menu-item-bullet">•</span>
                <span className="menu-item-name">Dal Tadka & Steamed Rice</span>
              </div>
              <span className="menu-item-category regular">STAPLE</span>
            </div>

            <div className="menu-item-row">
              <div className="menu-item-name-group">
                <span className="menu-item-bullet">•</span>
                <span className="menu-item-name">Kashmiri Pulao</span>
              </div>
              <span className="menu-item-category special">SPECIAL</span>
            </div>

            <div className="menu-item-row last">
              <div className="menu-item-name-group">
                <span className="menu-item-bullet">•</span>
                <span className="menu-item-name">Gulab Jamun (1 pc)</span>
              </div>
              <span className="menu-item-category dessert">DESSERT</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'ai',
    label: 'AI Study Tools',
    icon: Sparkles,
    tag: 'Intelligent Assistant',
    title: 'Supercharge your preparation.',
    desc: 'Draft summaries, parse complex class notes, structure outlines, and create dynamic flashcards for revisions using integrated local or remote AI text summaries.',
    bullets: [
      'Class note summarization tools',
      'Interactive AI chat for study support',
      'Personal workspace task logs integration'
    ],
    visual: (
      <div className="showcase-card-wrapper ai-widget">
        <div className="ai-chat-window">
          <div className="chat-window-header">
            <div className="ai-avatar-group">
              <span className="ai-avatar-sparkle">✨</span>
              <div className="ai-name-group">
                <span className="ai-name">AcadX AI</span>
                <span className="ai-status">Active</span>
              </div>
            </div>
            <span className="ai-model-badge">GPT-4o</span>
          </div>

          <div className="chat-conversation-area">
            <div className="chat-message user-bubble">
              Explain Big-O complexity for QuickSort?
            </div>

            <div className="chat-message assistant-bubble">
              <div className="assistant-bubble-intro">
                ✨ Average case is <strong>O(n log n)</strong>.
              </div>
              <div className="ai-code-block">
                <div className="code-header">Python</div>
                <pre><code>{`# Worst Case: O(n²)
# Average Case: O(n log n)
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    ...`}</code></pre>
              </div>
            </div>
          </div>

          <div className="chat-suggestions-area">
            <span className="suggestion-chip">✨ Summarize Note</span>
            <span className="suggestion-chip">📇 Flashcards</span>
          </div>
        </div>
      </div>
    )
  }
];

const ShowcaseSection = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const currentShowcase = SHOWCASE_TABS.find(t => t.id === activeTab);

  return (
    <section className="showcase-container">
      <div className="landing-section-title-wrap">
        <h2 className="landing-section-title">Designed for Everyday Student Life</h2>
        <p className="landing-section-subtitle">Take a look at the powerful features standard with every student account</p>
      </div>

      <div className="showcase-tabs">
        {SHOWCASE_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`showcase-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {isActive && (
                <motion.span
                  layoutId="activeShowcaseTab"
                  className="showcase-tab-bg"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="showcase-tab-content">
                <TabIcon size={16} /> {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="showcase-display">
        <div className="showcase-info">
          <span className="showcase-tag">{currentShowcase.tag}</span>
          <h3 className="showcase-title">{currentShowcase.title}</h3>
          <p className="showcase-desc">{currentShowcase.desc}</p>
          <div className="showcase-bullets">
            {currentShowcase.bullets.map((bullet, i) => (
              <div key={i} className="showcase-bullet">
                <ShieldCheck size={16} />
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="showcase-visual">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', maxWidth: '380px' }}
            >
              {currentShowcase.visual}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
