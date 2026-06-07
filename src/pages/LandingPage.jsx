import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  BookOpen,
  User,
  CalendarDays,
  ClipboardList,
  Utensils,
  ShieldCheck,
  Quote,
  Layers,
  Wrench,
  Laptop,
  Tablet,
  Smartphone,
  Search,
  Brain,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import ShowcaseSection from '../components/landing/ShowcaseSection';
import FaqSection from '../components/landing/FaqSection';

const DEVICE_DATA = {
  monitor: {
    tag: 'Central Command',
    title: 'Central Student Dashboard',
    desc: 'Your main gateway to campus life. Track active semester metrics, view upcoming lectures, and receive live system notifications from a single interface.',
    bullets: [
      'Real-time class schedule counters & progress bars',
      'Consolidated CGPA & attendance indicators',
      'Quick-action widget toggles & user custom controls'
    ],
    icon: Laptop
  },
  tablet: {
    tag: 'Curriculum Logbook',
    title: 'Curriculum & GPA Tracker',
    desc: 'Manage your academic progression with ease. Store grade logs across semesters, evaluate audits, and check cumulative CGPA trajectory curves dynamically.',
    bullets: [
      'Interactive credit distribution visualizers',
      'SGPA & CGPA trajectory chart generators',
      'Semester course grading audit history list'
    ],
    icon: Tablet
  },
  phone: {
    tag: 'Live Mess Menu & ID',
    title: 'Mess Tracker & Mobile Profile',
    desc: 'Access hostel meal menus and profiles on the move. Automatically parses the weekly Excel files to tell you what is cooking for breakfast, lunch, or dinner today.',
    bullets: [
      'Live meal tab highlight based on local time',
      'Chef-special recommendations and meal ratings',
      'Digital student profile ID & secure verification QR'
    ],
    icon: Smartphone
  },
  notebook: {
    tag: 'Study Organizer',
    title: 'Workspace Study Notes',
    desc: 'Draft structured study notebooks directly within the app. Write Markdown-supported study sheets, tag documents by course slots, and backup files instantly.',
    bullets: [
      'Full Markdown text compiler support',
      'Course-specific tagging and pinning controls',
      'Local backups and external document download tools'
    ],
    icon: Sparkles
  },
  cards: {
    tag: 'Utilities & Gateway',
    title: 'Secure College OAuth & Tools',
    desc: 'A suite of mini utility gadgets to organize your campus life. Enforces secure gateway authentication restricted to official student accounts only.',
    bullets: [
      'OAuth domain gateway for official student emails',
      'Semester assignment checklists and logs trackers',
      'Focus timers and attendance records calculators'
    ],
    icon: ShieldCheck
  }
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeDevice, setActiveDevice] = useState('monitor');
  const currentDeviceData = DEVICE_DATA[activeDevice];

  // Listen to global data-theme changes to toggle the mockup and footer logo theme
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark' || localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

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
                <div className="mockup-address">acadx.iitgn.ac.in</div>
              </div>
              <div className="landing-mockup-content">
                {/* Sidebar Mockup */}
                <div style={{ borderRight: "1px solid var(--border)", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-start", background: "var(--input-bg)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "850", fontSize: "0.9rem", marginBottom: "1.25rem", color: "var(--primary)" }}>
                    <div style={{ width: "22px", height: "22px", background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "#fff", borderRadius: "6px", display: "flex", alignItems: "center", justify: "center", fontSize: "0.75rem", fontWeight: "950", overflow: "hidden" }}><img src={isDark ? "/logo_dark.png" : "/logo_light.png"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                    <span style={{ letterSpacing: "-0.02em", background: "linear-gradient(135deg, var(--text) 50%, var(--text-muted) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AcadX</span>
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

      <ShowcaseSection />

      {/* Feature Grid Revamp: Interactive Desk Workspace Mockup */}
      <section className="features-grid-container">
        <div className="landing-section-title-wrap">
          <h2 className="landing-section-title">Everything You Need, Unified</h2>
          <p className="landing-section-subtitle">A responsive interactive workspace console mapping all study routines in one place</p>
        </div>

        <div className="desk-workspace-container">
          <div className="desk-workspace-grid">
            {/* Desk Surface (Interactive 3D mockups area) */}
            <div className="desk-surface">
              <div className="desk-surface-perspective">
                <div className="desk-surface-3d">
                  
                  {/* Large Monitor Screen */}
                  <div 
                    className={`desk-device device-monitor ${activeDevice === 'monitor' ? 'active' : ''}`}
                    onMouseEnter={() => setActiveDevice('monitor')}
                    onClick={() => setActiveDevice('monitor')}
                    style={{ zIndex: 3 }}
                  >
                    <div className="mock-ui-header">
                      <div className="mock-ui-dot" />
                      <div className="mock-ui-dot" />
                      <div className="mock-ui-dot" />
                      <span className="mock-ui-address">acadx.iitgn.ac.in/dashboard</span>
                    </div>
                    <div className="mock-ui-body" style={{ background: '#0a0a0c', padding: '8px', display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '6px', height: 'calc(100% - 18px)' }}>
                      {/* Mock Sidebar */}
                      <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontWeight: '850', color: 'var(--neon-pink)', fontSize: '0.45rem', marginBottom: '8px' }}>ACADX</div>
                        {['Home', 'Schedule', 'Grades', 'Mess'].map((item, i) => (
                          <div key={i} style={{ fontSize: '0.35rem', color: i === 0 ? 'var(--neon-pink)' : '#71717a', background: i === 0 ? 'rgba(255,0,127,0.08)' : 'transparent', padding: '2px 4px', borderRadius: '3px', textAlign: 'left' }}>{item}</div>
                        ))}
                      </div>
                      {/* Mock Content */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                        <div style={{ fontSize: '0.55rem', fontWeight: '800' }}>Hey student! 👋</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                          <div style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '4px' }}>
                            <div style={{ fontSize: '0.35rem', color: '#71717a' }}>LIVE CLASS</div>
                            <div style={{ fontSize: '0.42rem', fontWeight: '800', color: 'var(--neon-pink)', marginTop: '1px' }}>CS 201: DSA</div>
                          </div>
                          <div style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '4px' }}>
                            <div style={{ fontSize: '0.35rem', color: '#71717a' }}>CGPA</div>
                            <div style={{ fontSize: '0.42rem', fontWeight: '800', color: '#10b981', marginTop: '1px' }}>9.12</div>
                          </div>
                        </div>
                        <div style={{ background: '#18181b', borderRadius: '4px', padding: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '0.35rem', color: '#71717a' }}>WEEKLY TIMETABLE ACTIVITY</div>
                          <div style={{ width: '100%', height: '4px', background: '#27272a', borderRadius: '2px', marginTop: '3px', overflow: 'hidden' }}>
                            <div style={{ width: '85%', height: '100%', background: 'linear-gradient(to right, var(--neon-pink), var(--neon-purple))' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="monitor-stand" />

                  {/* Keyboard (Decoration) */}
                  <div className="desk-device-keyboard">
                    <div className="keyboard-row">
                      {Array.from({ length: 14 }).map((_, i) => <div key={i} className="key-cap" />)}
                    </div>
                    <div className="keyboard-row">
                      {Array.from({ length: 13 }).map((_, i) => <div key={i} className="key-cap" />)}
                    </div>
                    <div className="keyboard-row">
                      <div className="key-cap" />
                      <div className="key-cap space-bar" />
                      <div className="key-cap" />
                    </div>
                  </div>

                  {/* Tablet Screen */}
                  <div 
                    className={`desk-device device-tablet ${activeDevice === 'tablet' ? 'active' : ''}`}
                    onMouseEnter={() => setActiveDevice('tablet')}
                    onClick={() => setActiveDevice('tablet')}
                    style={{ zIndex: 2 }}
                  >
                    <div className="mock-ui-header">
                      <div className="mock-ui-dot" />
                      <div className="mock-ui-dot" />
                      <div className="mock-ui-dot" />
                      <span className="mock-ui-address">acadx.iitgn.ac.in/academics</span>
                    </div>
                    <div className="mock-ui-body" style={{ background: '#09090b', padding: '10px', textAlign: 'left' }}>
                      <div style={{ fontSize: '0.55rem', fontWeight: '850', color: '#a855f7', marginBottom: '4px' }}>GPA CURVE</div>
                      <svg viewBox="0 0 100 40" style={{ width: '100%', height: '55px', overflow: 'visible' }}>
                        <path d="M5,35 Q30,20 55,22 T95,8" fill="none" stroke="var(--neon-pink)" strokeWidth="1.5" />
                        <circle cx="5" cy="35" r="1.5" fill="#fff" />
                        <circle cx="30" cy="23" r="1.5" fill="#fff" />
                        <circle cx="55" cy="22" r="1.5" fill="#fff" />
                        <circle cx="95" cy="8" r="2" fill="var(--neon-pink)" />
                        <text x="95" y="4" fontSize="3" fill="var(--neon-pink)" fontWeight="bold" textAnchor="middle">9.5</text>
                      </svg>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.35rem', color: '#52525b', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                        <span>Sem 1: 8.2</span>
                        <span>Sem 2: 8.8</span>
                        <span>Sem 3: 9.1</span>
                        <span>Sem 4: 9.5</span>
                      </div>
                    </div>
                  </div>

                  {/* Smartphone Screen */}
                  <div 
                    className={`desk-device device-phone ${activeDevice === 'phone' ? 'active' : ''}`}
                    onMouseEnter={() => setActiveDevice('phone')}
                    onClick={() => setActiveDevice('phone')}
                    style={{ zIndex: 5 }}
                  >
                    <div className="mock-ui-header">
                      <div className="mock-ui-dot" style={{ width: '4px', height: '4px' }} />
                      <span className="mock-ui-address" style={{ fontSize: '0.4rem', marginLeft: '2px' }}>mess.iitgn</span>
                    </div>
                    <div className="mock-ui-body" style={{ background: '#09090b', padding: '8px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ background: 'rgba(255,0,127,0.08)', color: 'var(--neon-pink)', padding: '2px 4px', borderRadius: '3px', fontSize: '0.4rem', fontWeight: '800', width: 'fit-content' }}>LUNCH SPECIAL</div>
                      <div style={{ fontSize: '0.52rem', fontWeight: '850', color: '#fff', marginTop: '1px' }}>Paneer Butter Masala</div>
                      <div style={{ fontSize: '0.38rem', color: '#71717a' }}>Dal Tadka, Kashmiri Pulao, Gulab Jamun</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                        <span style={{ fontSize: '0.4rem', color: '#10b981' }}>★ 4.8 Rating</span>
                        <span style={{ fontSize: '0.35rem', color: '#71717a' }}>12:30-2:30 PM</span>
                      </div>
                      {/* Student QR ID Mock */}
                      <div style={{ background: '#18181b', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '4px', padding: '4px', display: 'flex', gap: '4px', alignItems: 'center', marginTop: '4px' }}>
                        <div style={{ width: '15px', height: '15px', background: '#fff', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.3rem', fontWeight: 'bold', color: '#000' }}>QR</div>
                        <div>
                          <div style={{ fontSize: '0.35rem', color: '#fff', fontWeight: '700' }}>Devashish Gupta</div>
                          <div style={{ fontSize: '0.3rem', color: '#71717a' }}>Roll No: 20110045</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notebook / Journal Screen */}
                  <div 
                    className={`desk-device device-notebook ${activeDevice === 'notebook' ? 'active' : ''}`}
                    onMouseEnter={() => setActiveDevice('notebook')}
                    onClick={() => setActiveDevice('notebook')}
                    style={{ zIndex: 3 }}
                  >
                    <div style={{ fontSize: '0.58rem', fontWeight: '850', color: 'var(--neon-pink)', marginBottom: '2px' }}># Graph Traversals</div>
                    <div style={{ fontSize: '0.42rem', color: '#a1a1aa', lineHeight: '1.4', marginBottom: '6px' }}>
                      Use queue data structures to visit adjacent vertices first in Breadth-First Search (BFS)...
                    </div>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      <span style={{ fontSize: '0.35rem', color: 'var(--neon-pink)', background: 'rgba(255,0,127,0.08)', padding: '1px 3px', borderRadius: '2px', fontWeight: '700' }}>CS 201</span>
                      <span style={{ fontSize: '0.35rem', color: '#a855f7', background: 'rgba(168,85,247,0.08)', padding: '1px 3px', borderRadius: '2px', fontWeight: '700' }}>DSA</span>
                    </div>
                  </div>

                  {/* Stationery / Cards Gateway Screen */}
                  <div 
                    className={`desk-device device-card-gateway ${activeDevice === 'cards' ? 'active' : ''}`}
                    onMouseEnter={() => setActiveDevice('cards')}
                    onClick={() => setActiveDevice('cards')}
                    style={{ zIndex: 2 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '2px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 4px #22c55e' }} />
                      <span style={{ fontSize: '0.45rem', fontWeight: '800', color: '#fff' }}>GATEWAY AUTH</span>
                    </div>
                    <div style={{ fontSize: '0.38rem', color: '#71717a', lineHeight: '1.2' }}>Official IITGN student domain verified.</div>
                    <div style={{ display: 'flex', gap: '2px', marginTop: '6px', fontSize: '0.35rem' }}>
                      <span style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1px 3px', borderRadius: '2px', color: '#a1a1aa' }}>ASSIGNMENTS: 2 PENDING</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Desk Details Panel */}
            <div className="desk-details-panel">
              <span className="desk-details-tag">
                {React.createElement(currentDeviceData.icon, { size: 16 })} {currentDeviceData.tag}
              </span>
              <h3 className="desk-details-title">{currentDeviceData.title}</h3>
              <p className="desk-details-desc">{currentDeviceData.desc}</p>
              <div className="desk-details-list">
                {currentDeviceData.bullets.map((bullet, idx) => (
                  <div key={idx} className="desk-details-item">
                    <ShieldCheck size={16} />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="desk-interactive-prompt">
            <span>⚡</span> Hover over or tap the devices on the desk to explore different workspace capabilities.
          </div>
        </div>
      </section>

      {/* AI Operator Showcase Section (Image 2 style) */}
      <section className="ai-operator-section">
        {/* Background Slashes & Grids */}
        <div className="ai-operator-bg-slashes">
          <div className="bg-slash-white" />
          <div className="bg-slash-dark" />
          <div className="bg-slash-lines" />
        </div>

        {/* Client Top Header */}
        <div className="ai-operator-header">
          <div className="ai-operator-logo-wrap">
            <span className="logo-chinese">IITGN ACADX</span>
            <span className="logo-divider"></span>
            <span className="ai-operator-logo">Gandhinagar</span>
          </div>

          <div className="ai-operator-search-wrap">
            <Search className="ai-operator-search-icon" size={12} />
            <input 
              type="text" 
              placeholder="Search features" 
              className="ai-operator-search-bar"
              readOnly
            />
          </div>

          <div className="ai-operator-tabs">
            <button className="ai-operator-tab">Timetable</button>
            <button className="ai-operator-tab active">A.R.A.I.</button>
            <button className="ai-operator-tab">Grade Tracker</button>
          </div>

          <div className="ai-operator-profile-avatar">
            <img src="/logo_icon.svg" alt="Avatar" onError={(e) => { e.target.src = "/logo_dark.png"; }} />
          </div>
        </div>

        {/* Showcase Grid */}
        <div className="ai-operator-grid">
          {/* Background Watermark Outline Text */}
          <div className="ai-operator-watermark">
            A.R.<br />A.I.
          </div>

          {/* Left Col: Info panel */}
          <div className="ai-operator-info-col">
            <div className="ai-operator-quote-box">
              <span className="ai-operator-quote-icon">“</span>
              <p className="ai-operator-quote-text">
                Ehh... Student, when'd you<br />get here? Ready to optimize your study routine?
              </p>
            </div>

            <span className="ai-operator-codename-header">AI ASSISTANT //</span>
            <h2 className="ai-operator-codename">A.R.A.I.</h2>

            {/* Custom Arknights Badge */}
            <div className="ai-operator-subclass-badge">
              <div className="subclass-icon-square">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="#111" strokeWidth="2" fill="none">
                  <line x1="4" y1="20" x2="20" y2="4"></line>
                  <line x1="4" y1="4" x2="20" y2="20"></line>
                </svg>
              </div>
              <div className="subclass-icon-square">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="#111" strokeWidth="2" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
                </svg>
              </div>
              <div className="subclass-text-box">
                Study Core
              </div>
            </div>

            <div className="ai-operator-desc-box">
              Enforces 100% <span className="highlight-purple">Google OAuth</span> restriction; Logbooks calculate overall <span className="highlight-purple">CGPA</span>;<br />
              Parses weekly excel spreadsheets to highlight <span className="highlight-blue">live meal cards</span>, up to dinner hour
            </div>

            <button 
              className="btn-gacha"
              onClick={() => navigate('/login')}
            >
              Access Dashboard
            </button>
          </div>

          {/* Right Col: Character Artwork */}
          <div className="ai-operator-artwork-col">
            <div className="ai-operator-artwork-wrapper">
              <img 
                src="/la_pluma_ai.png" 
                alt="La Pluma AI Companion" 
                className="ai-operator-img"
              />
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
              "AcadX completely replaced my paper timetables. Knowing which lecture slot is active on Friday morning saves so much stress."
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
      <FaqSection />

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
          <div className="footer-logo" style={{ overflow: "hidden" }}><img src={isDark ? "/logo_dark.png" : "/logo_light.png"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
          <span className="footer-name">AcadX</span>
        </div>
        <div className="footer-credits">
          Built with ❤️ by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer">destopianpirate</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
