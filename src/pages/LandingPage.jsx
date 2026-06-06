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
  Wrench
} from 'lucide-react';
import { motion } from 'framer-motion';
import ShowcaseSection from '../components/landing/ShowcaseSection';
import FaqSection from '../components/landing/FaqSection';

const LandingPage = () => {
  const navigate = useNavigate();

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
                  <span className="mini-repo-name">acadx-web</span>
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
