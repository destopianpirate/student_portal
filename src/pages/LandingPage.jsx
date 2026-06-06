import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  Calendar,
  BookOpen,
  User,
  Sparkles,
  CalendarDays,
  ClipboardList,
  Utensils,
  Clock,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Quote,
  Layers,
  Compass,
  BookOpenCheck,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule');
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Tabs definitions
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
      desc: "Say goodbye to looking up messy PDFs or spreadsheets. StudentOS parses the official hostel mess menu and displays exactly what's currently cooking for Breakfast, Lunch, High Tea, or Dinner.",
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
                  <span className="ai-name">StudentOS AI</span>
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

  // FAQ definitions
  const FAQS = [
    {
      q: 'Do I need an official IITGN email address to use this?',
      a: 'Yes, portal access is strictly restricted to valid IIT Gandhinagar student credentials. This maintains the privacy of portal databases, custom timetables, and academic events.'
    },
    {
      q: 'How does the auto-generated timetable mapping work?',
      a: 'During profile setup or in settings, select your courses. StudentOS maps these courses against the standard IIT Gandhinagar slot matrix (e.g. Slot A, B, C etc.), instantly constructing your custom schedule without requiring manual entry.'
    },
    {
      q: 'Can I view the portal on my phone?',
      a: 'Absolutely. The entire application is built using responsive web standards. Every layout adapts dynamically to smartphones, tablets, and desktop devices for on-the-go routine checks.'
    },
    {
      q: 'Is my academic and grade data secure?',
      a: 'Yes, all personal records, grade registers, and custom tasks are cached in your local web storage and secured through Firebase Authentication. Your GPA logs are visible only to you.'
    },
    {
      q: 'Can I upload files or export records?',
      a: 'Yes. You can manage study notes with direct file attachments, record certificates in your profile page, and back up or download all of your student account data locally in structured JSON logs at any time.'
    }
  ];

  const handleToggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const ActiveIcon = SHOWCASE_TABS.find(t => t.id === activeTab)?.icon || Sparkles;
  const currentShowcase = SHOWCASE_TABS.find(t => t.id === activeTab);

  return (
    <div className="landing-page">
      {/* Background blobs for visual appeal */}
      <div className="landing-ambient-bg">
        <div className="landing-blob landing-blob-1" />
        <div className="landing-blob landing-blob-2" />
        <div className="landing-blob landing-blob-3" />
      </div>

      {/* Hero Header */}
      <section className="landing-hero">
        {/* Left Column: Text & Actions */}
        <div className="hero-content-col">
          <h1 className="landing-title">
            The Intelligent Core for <br className="hero-br" />
            <span className="landing-title-highlight" data-text="IIT Gandhinagar">IIT Gandhinagar</span> Academics
          </h1>
          <p className="landing-subtitle">
            Unlock a unified student workspace. Auto-map course slots into smart timetables, track credit limits, query mess parser feeds, and accelerate note preparation with integrated AI study planners.
          </p>

          <div className="landing-ctas">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/login')}
              style={{ padding: '0.8rem 2rem', borderRadius: '30px', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Log In to Portal <ArrowRight size={18} />
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/signup')}
              style={{ padding: '0.8rem 2rem', borderRadius: '30px', fontSize: '0.95rem', fontWeight: '700' }}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Right Column: Floating badges & Browser Mockup */}
        <div className="hero-visual-col">
          {/* Overlapping Floating Status Badges */}
          <motion.div
            className="floating-badge floating-badge-1"
            initial={{ opacity: 0, x: -20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="floating-badge-icon">🍛</div>
            <span>Mess Live</span>
          </motion.div>

          <motion.div
            className="floating-badge floating-badge-2"
            initial={{ opacity: 0, x: 20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="floating-badge-icon">🏆</div>
            <span>CGPA: 9.8</span>
          </motion.div>

          <motion.div
            className="floating-badge floating-badge-3"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <div className="floating-badge-icon">📅</div>
            <span>Slot D Lecture</span>
          </motion.div>

          {/* Dashboard Mockup */}
          <div className="landing-mockup-wrapper">
            <div className="landing-mockup-frame">
              <div className="landing-mockup-header">
                <div className="mockup-dot" />
                <div className="mockup-dot" />
                <div className="mockup-dot" />
                <div className="mockup-address">studentos.iitgn.ac.in</div>
              </div>
              <div className="landing-mockup-content">
                {/* Sidebar Mockup */}
                <div style={{ borderRight: "1px solid var(--border)", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-start", background: "var(--input-bg)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "850", fontSize: "0.9rem", marginBottom: "1.25rem", color: "var(--primary)" }}>
                    <div style={{ width: "22px", height: "22px", background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "#fff", borderRadius: "6px", display: "flex", alignItems: "center", justify: "center", fontSize: "0.75rem", fontWeight: "950" }}>S</div>
                    <span style={{ letterSpacing: "-0.02em", background: "linear-gradient(135deg, var(--text) 50%, var(--text-muted) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>StudentOS</span>
                  </div>
                  {[
                    { label: "Dashboard", active: true },
                    { label: "Timetable" },
                    { label: "Academics" },
                    { label: "Mess Menu" },
                    { label: "Study Planner" }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.65rem", borderRadius: "8px", fontSize: "0.75rem", width: "100%", textAlign: "left", background: item.active ? "var(--card-bg)" : "transparent", border: item.active ? "1px solid var(--border)" : "1px solid transparent", fontWeight: item.active ? "800" : "650", color: item.active ? "var(--primary)" : "var(--text-muted)" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: item.active ? "var(--primary)" : "transparent", border: !item.active ? "1px solid var(--text-muted)" : "none" }}></div>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Main Content Mockup */}
                <div style={{ padding: "0.5rem", display: "flex", flexDirection: "column", gap: "1rem", textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "1.15rem", fontWeight: "900", letterSpacing: "-0.02em", color: "var(--text)" }}>Hey student! 👋</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "650" }}>Here is your schedule for Saturday</div>
                    </div>
                    <div style={{ fontSize: "0.65rem", background: "rgba(99,102,241,0.1)", color: "var(--primary)", padding: "0.25rem 0.6rem", borderRadius: "20px", fontWeight: "800", border: "1px solid rgba(99,102,241,0.15)", letterSpacing: "0.02em" }}>
                      SEM 4 ACTIVE
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "0.85rem" }}>
                    <div className="glass-panel" style={{ padding: "1rem", background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: "var(--primary)" }}></div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.6rem", color: "var(--primary)", fontWeight: "800", letterSpacing: "0.04em" }}>LIVE CLASS</span>
                        <span style={{ fontSize: "0.58rem", color: "var(--text-muted)", fontWeight: "700" }}>ENDS IN 45m</span>
                      </div>
                      <div style={{ fontWeight: "800", fontSize: "0.85rem", marginTop: "0.4rem", color: "var(--text)", letterSpacing: "-0.01em" }}>CS 201: Data Structures</div>
                      <div style={{ display: "flex", gap: "0.65rem", marginTop: "0.4rem", fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "600" }}>
                        <span>📍 LHC-101</span>
                        <span>Slot D</span>
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: "1rem", background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)", display: "flex", flexDirection: "column", justify: "space-between", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: "#f97316" }}></div>
                      <span style={{ fontSize: "0.6rem", color: "#f97316", fontWeight: "800", letterSpacing: "0.04em" }}>TODAY'S SPECIAL LUNCH</span>
                      <div style={{ fontWeight: "800", fontSize: "0.85rem", marginTop: "0.4rem", color: "var(--text)" }}>Paneer Butter Masala 🍲</div>
                      <div style={{ fontSize: "0.65rem", color: "#10b981", fontWeight: "750", marginTop: "0.2rem" }}>★ 4.8 Rating</div>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: "0.85rem 1rem", background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "var(--shadow)" }}>
                    <div style={{ display: "flex", gap: "1.5rem" }}>
                      <div>
                        <div style={{ fontSize: "0.58rem", color: "var(--text-muted)", fontWeight: "750" }}>CGPA PROJECTED</div>
                        <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--primary)", fontFamily: "Space Grotesk" }}>9.12</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.58rem", color: "var(--text-muted)", fontWeight: "750" }}>ATTENDANCE AVERAGE</div>
                        <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--success)", fontFamily: "Space Grotesk" }}>91.5%</div>
                      </div>
                    </div>
                    <div style={{ width: '80px', height: '6px', background: 'var(--input-bg)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: '91.5%', height: '100%', background: 'linear-gradient(to right, var(--primary), var(--success))' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* Feature Grid */}
      <section className="features-grid-container">
        <div className="landing-section-title-wrap">
          <h2 className="landing-section-title">Everything You Need, Unified</h2>
          <p className="landing-section-subtitle">A feature suite crafted to simplify student tasks and boost performance</p>
        </div>

        <div className="features-grid">
          <div className="feature-rich-card span-4">
            <div className="feature-icon-wrapper">
              <Calendar size={22} />
            </div>
            <h3 className="feature-card-title">Timetable Slot Generator</h3>
            <p className="feature-card-desc">
              Automatic generation mapping course blocks into weekly routine timetables. Focus on lectures instead of matching slots manually.
            </p>
            <div className="feature-card-visual">
              <div className="mini-timetable-strip">
                <div className="mini-timetable-day">
                  <span className="mini-day-label">Mon</span>
                  <span className="mini-day-slot slot-dsa">CS 201</span>
                </div>
                <div className="mini-timetable-day">
                  <span className="mini-day-label">Tue</span>
                  <span className="mini-day-slot slot-math">MA 201</span>
                </div>
                <div className="mini-timetable-day">
                  <span className="mini-day-label">Wed</span>
                  <span className="mini-day-slot slot-french">HS 201</span>
                </div>
                <div className="mini-timetable-day">
                  <span className="mini-day-label">Thu</span>
                  <span className="mini-day-slot slot-dsa">CS 201</span>
                </div>
                <div className="mini-timetable-day">
                  <span className="mini-day-label">Fri</span>
                  <span className="mini-day-slot slot-free">Free</span>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-rich-card span-2">
            <div className="feature-icon-wrapper">
              <BookOpen size={22} />
            </div>
            <h3 className="feature-card-title">GPA Grade Logbook</h3>
            <p className="feature-card-desc">
              Store records of completed courses, grading evaluations, and credit systems. Watch your cumulative CGPA trajectory update automatically.
            </p>
            <div className="feature-card-visual">
              <div className="mini-gpa-tracker">
                <div className="mini-gpa-row">
                  <span className="mini-gpa-sem">Sem 1</span>
                  <div className="mini-gpa-bar-wrapper">
                    <div className="mini-gpa-bar-fill" style={{ width: '82%' }}></div>
                  </div>
                  <span className="mini-gpa-val">8.2</span>
                </div>
                <div className="mini-gpa-row">
                  <span className="mini-gpa-sem">Sem 2</span>
                  <div className="mini-gpa-bar-wrapper">
                    <div className="mini-gpa-bar-fill" style={{ width: '88%' }}></div>
                  </div>
                  <span className="mini-gpa-val">8.8</span>
                </div>
                <div className="mini-gpa-row">
                  <span className="mini-gpa-sem">Sem 3</span>
                  <div className="mini-gpa-bar-wrapper">
                    <div className="mini-gpa-bar-fill" style={{ width: '91.2%' }}></div>
                  </div>
                  <span className="mini-gpa-val">9.1</span>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-rich-card span-2">
            <div className="feature-icon-wrapper">
              <CalendarDays size={22} />
            </div>
            <h3 className="feature-card-title">Unified Campus Calendar</h3>
            <p className="feature-card-desc">
              Centralized listing of academic dates, examinations, and official gazetted & restricted holidays. Counts down to upcoming vacation recesses.
            </p>
            <div className="feature-card-visual">
              <div className="mini-calendar-countdown">
                <div className="mini-calendar-sheet">
                  <div className="mini-calendar-sheet-header">Jun</div>
                  <div className="mini-calendar-sheet-day">20</div>
                </div>
                <div className="mini-calendar-countdown-info">
                  <span className="mini-calendar-countdown-title">Summer Recess</span>
                  <span className="mini-calendar-countdown-subtitle">Starts in 14 days</span>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-rich-card span-4">
            <div className="feature-icon-wrapper">
              <ClipboardList size={22} />
            </div>
            <h3 className="feature-card-title">Workspace Study Notes</h3>
            <p className="feature-card-desc">
              Integrated markdown document sheets with custom categories, course tags, pinning toggles, and direct file backups for easy retrieval.
            </p>
            <div className="feature-card-visual">
              <div className="mini-notes-mockup">
                <div className="mini-notes-list">
                  <div className="mini-note-item active">Graph Traversals</div>
                  <div className="mini-note-item">Linear Algebra</div>
                  <div className="mini-note-item">Electrostatics</div>
                </div>
                <div className="mini-note-editor">
                  <div className="mini-note-editor-title"># Breadth-First Search</div>
                  <div className="mini-note-editor-body">Use queue data structures to visit adjacent vertices first...</div>
                  <div className="mini-note-editor-tags">
                    <span className="mini-note-tag">CS 201</span>
                    <span className="mini-note-tag">DSA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-rich-card span-3">
            <div className="feature-icon-wrapper">
              <Layers size={22} />
            </div>
            <h3 className="feature-card-title">Portfolio & Project Cards</h3>
            <p className="feature-card-desc">
              Organize personal projects, code repositories, document assets, and academic accomplishments for review in a single web dashboard.
            </p>
            <div className="feature-card-visual">
              <div className="mini-repos-list">
                <div className="mini-repo-card">
                  <span className="mini-repo-name">studentos-web</span>
                  <span className="mini-repo-desc">The modern frontend client for the student workspace portal.</span>
                  <div className="mini-repo-footer">
                    <span className="mini-repo-lang">
                      <span className="mini-repo-lang-dot js"></span> JS
                    </span>
                    <span>⭐ 128</span>
                  </div>
                </div>
                <div className="mini-repo-card">
                  <span className="mini-repo-name">mess-excel-parser</span>
                  <span className="mini-repo-desc">Converts Excel thali sheets into clean visual cards.</span>
                  <div className="mini-repo-footer">
                    <span className="mini-repo-lang">
                      <span className="mini-repo-lang-dot python"></span> Python
                    </span>
                    <span>⭐ 34</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-rich-card span-3">
            <div className="feature-icon-wrapper">
              <Wrench size={22} />
            </div>
            <h3 className="feature-card-title">Other Utilities & Tools</h3>
            <p className="feature-card-desc">
              Consolidate attendance logs, track active semester assignments, set personal study goals, and manage extracurricular certificate portfolios.
            </p>
            <div className="feature-card-visual">
              <div className="mini-utilities-visual">
                <div className="mini-utilities-checklist">
                  <div className="mini-utilities-item">
                    <div className="mini-utilities-checkbox checked">✓</div>
                    <span>CS 201 Lab Report</span>
                  </div>
                  <div className="mini-utilities-item">
                    <div className="mini-utilities-checkbox checked">✓</div>
                    <span>Review Midsem SPI</span>
                  </div>
                  <div className="mini-utilities-item">
                    <div className="mini-utilities-checkbox"></div>
                    <span>Submit CV Draft</span>
                  </div>
                </div>
                <div className="mini-utilities-attendance">
                  <span className="mini-attendance-value">88.5%</span>
                  <span className="mini-attendance-label">Attendance</span>
                  <div className="mini-attendance-bar">
                    <div className="mini-attendance-fill" style={{ width: '88.5%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IITGN Spotlight */}
      <section className="spotlight-container">
        <div className="spotlight-info">
          <span className="spotlight-badge">IIT Gandhinagar Integrations</span>
          <h2 className="spotlight-title">Tailored for IIT Gandhinagar Campus Life</h2>
          <p className="spotlight-desc">
            We built features focused on resolving actual pain points for students living on the IITGN campus:
          </p>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0 }}>
            <li>No more searching drive links for the weekly Mess Excel menus.</li>
            <li>No need to check Academic calendars to confirm Restricted Holidays.</li>
            <li>Single Click Bypass with student login domains.</li>
          </ul>
        </div>

        <div className="spotlight-integrations">
          <div className="spotlight-item">
            <div className="spotlight-item-icon"><Utensils size={18} /></div>
            <div className="spotlight-item-details">
              <span className="spotlight-item-title">Excel Mess Menu Parser</span>
              <span className="spotlight-item-desc">Reads and extracts breakfast, lunch, and dinner menus directly into active notification bars.</span>
            </div>
          </div>
          <div className="spotlight-item">
            <div className="spotlight-item-icon"><CalendarDays size={18} /></div>
            <div className="spotlight-item-details">
              <span className="spotlight-item-title">Academic & Holiday Calendar</span>
              <span className="spotlight-item-desc">Displays gazetted schedules and alerts you to mid-sem recess dates automatically.</span>
            </div>
          </div>
          <div className="spotlight-item">
            <div className="spotlight-item-icon"><ShieldCheck size={18} /></div>
            <div className="spotlight-item-details">
              <span className="spotlight-item-title">Secure College OAuth Domain</span>
              <span className="spotlight-item-desc">Restricts manual and Google Workspace login to official authenticated IITGN credentials only.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="steps-container">
        <div className="landing-section-title-wrap">
          <h2 className="landing-section-title">Get Started in 3 Simple Steps</h2>
          <p className="landing-section-subtitle">Set up your portal workspace in under two minutes</p>
        </div>

        <div className="steps-list">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4 className="step-title">IITGN Domain Gateway</h4>
            <p className="step-desc">Authenticate securely with Google OAuth or manual credentials using your official @iitgn.ac.in student identity.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h4 className="step-title">Course Registration</h4>
            <p className="step-desc">Register your semester courses during setup to automatically generate your slot schedule.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h4 className="step-title">Track & Prepare</h4>
            <p className="step-desc">Access timetable indicators, mess trackers, notes organizers, and GPA charts.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-container">
        <div className="landing-section-title-wrap">
          <h2 className="landing-section-title">Loved by IITGN Students</h2>
          <p className="landing-section-subtitle">Read what other students think about the portal</p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div style={{ color: 'var(--primary)', opacity: 0.15, position: 'absolute', top: '1rem', right: '1.5rem' }}>
              <Quote size={48} />
            </div>
            <p className="testimonial-quote">
              "StudentOS completely replaced my paper timetables. Knowing which lecture slot is active on Friday morning saves so much stress."
            </p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">
                <User size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="testimonial-meta">
                <span className="testimonial-name">Devashish Gupta</span>
                <span className="testimonial-branch">B.Tech, Computer Science '24</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div style={{ color: 'var(--primary)', opacity: 0.15, position: 'absolute', top: '1rem', right: '1.5rem' }}>
              <Quote size={48} />
            </div>
            <p className="testimonial-quote">
              "Being able to see exactly what paneer items are for dinner on the homepage parser without searching the Drive folder is a huge life upgrade."
            </p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">
                <User size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="testimonial-meta">
                <span className="testimonial-name">Riya Sen</span>
                <span className="testimonial-branch">B.Tech, Materials Engineering '25</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div style={{ color: 'var(--primary)', opacity: 0.15, position: 'absolute', top: '1rem', right: '1.5rem' }}>
              <Quote size={48} />
            </div>
            <p className="testimonial-quote">
              "I love the GPA calculator. It makes credit planning for electives incredibly simple. All student portals should look like this!"
            </p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">
                <User size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="testimonial-meta">
                <span className="testimonial-name">Kartikey Patel</span>
                <span className="testimonial-branch">M.Tech, Electrical Engineering '24</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="faqs-container">
        <div className="landing-section-title-wrap">
          <h2 className="landing-section-title">Frequently Asked Questions</h2>
          <p className="landing-section-subtitle">Everything you need to know about access and security</p>
        </div>

        <div className="faqs-list">
          {FAQS.map((faq, i) => (
            <div key={i} className={`faq-item ${expandedFaq === i ? 'active' : ''}`}>
              <button className="faq-question-btn" onClick={() => handleToggleFaq(i)}>
                <span>{faq.q}</span>
                <ChevronDown size={18} className="faq-chevron" />
              </button>
              <div
                className="faq-answer"
                style={{ maxHeight: expandedFaq === i ? '150px' : '0' }}
              >
                <p style={{ margin: 0 }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="landing-bottom-cta">
        <h2 className="landing-bottom-title">Ready to Organize Your IITGN Academic Life?</h2>
        <p className="landing-bottom-desc">
          Sign in now using your official college Google account to initialize your personal schedule and course planner.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/login')}
          style={{ padding: '0.8rem 2.5rem', borderRadius: '30px', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          Sign In Now <ArrowRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <div className="footer-logo">S</div>
          <span className="footer-name">StudentOS</span>
        </div>
        <div className="footer-credits">
          Built with ❤️ by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer">destopianpirate</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
