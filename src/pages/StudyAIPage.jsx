import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, BookOpen, Zap, Clock, Plus, Trash2, RotateCcw, Play, Pause, SkipForward, ChevronLeft, ChevronRight, Search, Copy, Check } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

// --- Note Summarizer (rule-based) ---
const summarizeText = (text) => {
  if (!text.trim()) return [];
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
  // Score sentences by importance heuristics
  const scored = sentences.map(s => {
    let score = 0;
    if (s.length > 30) score += 1;
    if (s.length > 60) score += 1;
    if (/\b(important|key|main|significant|essential|critical|note|remember|definition|theorem|formula)\b/i.test(s)) score += 3;
    if (/\b(first|second|third|finally|therefore|thus|hence|because|since|result)\b/i.test(s)) score += 2;
    if (/\d/.test(s)) score += 1; // contains numbers
    if (/[A-Z]{2,}/.test(s)) score += 1; // contains acronyms
    return { text: s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(3, Math.ceil(sentences.length * 0.3))).map(s => s.text);
};

// --- Flashcard Generator (rule-based) ---
const generateFlashcards = (text) => {
  if (!text.trim()) return [];
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
  const cards = [];
  sentences.forEach(s => {
    // Pattern: "X is Y" → Q: What is X? A: Y
    const isMatch = s.match(/^(.+?)\s+(?:is|are|was|were)\s+(.+)$/i);
    if (isMatch && isMatch[1].length < 80) {
      cards.push({ q: `What is ${isMatch[1].trim()}?`, a: isMatch[2].trim() });
      return;
    }
    // Pattern: "X means Y" or "X refers to Y"
    const meansMatch = s.match(/^(.+?)\s+(?:means|refers to|defines|represents)\s+(.+)$/i);
    if (meansMatch) {
      cards.push({ q: `Define: ${meansMatch[1].trim()}`, a: meansMatch[2].trim() });
      return;
    }
    // Generic: Turn into fill-in-blank
    const words = s.split(' ');
    if (words.length > 5) {
      const keyIdx = Math.floor(words.length * 0.6);
      const keyword = words[keyIdx];
      if (keyword && keyword.length > 3) {
        const blanked = words.map((w, i) => i === keyIdx ? '______' : w).join(' ');
        cards.push({ q: blanked, a: keyword });
      }
    }
  });
  return cards.slice(0, 15);
};

const StudyAIPage = () => {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('summarizer');

  // --- Summarizer State ---
  const [noteText, setNoteText] = useState('');
  const [summary, setSummary] = useState([]);

  // --- Flashcard State ---
  const [flashText, setFlashText] = useState('');
  const [cards, setCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // --- Pomodoro State ---
  const [pomodoroWork, setPomodoroWork] = useState(25);
  const [pomodoroBreak, setPomodoroBreak] = useState(5);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroPhase, setPomodoroPhase] = useState('work'); // 'work' | 'break'
  const [pomodoroSessions, setPomodoroSessions] = useState(0);
  const intervalRef = useRef(null);

  // --- Formula State ---
  const [formulas, setFormulas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('study_formulas') || '[]'); } catch { return []; }
  });
  const [newFormula, setNewFormula] = useState({ subject: '', name: '', formula: '' });
  const [formulaSearch, setFormulaSearch] = useState('');
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    localStorage.setItem('study_formulas', JSON.stringify(formulas));
  }, [formulas]);

  // Pomodoro timer
  useEffect(() => {
    if (pomodoroRunning) {
      intervalRef.current = setInterval(() => {
        setPomodoroTime(prev => {
          if (prev <= 1) {
            // Phase complete
            if (pomodoroPhase === 'work') {
              setPomodoroPhase('break');
              setPomodoroSessions(s => s + 1);
              addNotification('success', 'Pomodoro Complete! 🍅', 'Time for a break!');
              return pomodoroBreak * 60;
            } else {
              setPomodoroPhase('work');
              addNotification('info', 'Break Over! ⏰', 'Ready to focus again?');
              return pomodoroWork * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [pomodoroRunning, pomodoroPhase, pomodoroWork, pomodoroBreak]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const pomodoroProgress = pomodoroPhase === 'work'
    ? ((pomodoroWork * 60 - pomodoroTime) / (pomodoroWork * 60)) * 100
    : ((pomodoroBreak * 60 - pomodoroTime) / (pomodoroBreak * 60)) * 100;

  const resetPomodoro = () => {
    setPomodoroRunning(false);
    setPomodoroPhase('work');
    setPomodoroTime(pomodoroWork * 60);
    clearInterval(intervalRef.current);
  };

  const filteredFormulas = useMemo(() => {
    if (!formulaSearch.trim()) return formulas;
    const q = formulaSearch.toLowerCase();
    return formulas.filter(f => f.subject.toLowerCase().includes(q) || f.name.toLowerCase().includes(q) || f.formula.toLowerCase().includes(q));
  }, [formulas, formulaSearch]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  const tabs = [
    { key: 'summarizer', label: 'Summarizer', icon: BookOpen },
    { key: 'flashcards', label: 'Flashcards', icon: Zap },
    { key: 'pomodoro', label: 'Pomodoro', icon: Clock },
    { key: 'formulas', label: 'Formulas', icon: Brain },
  ];

  return (
    <motion.div className="page-container" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <h2 style={{ margin: '0 0 .5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <Brain size={24} style={{ color: 'var(--primary)' }} /> AI Study Tools
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '.85rem' }}>Smart tools to boost your study efficiency</p>
      </motion.div>

      {/* Tabs */}
      <motion.div className="study-tabs" variants={itemVariants}>
        {tabs.map(t => (
          <button key={t.key} className={`study-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </motion.div>

      {/* Summarizer */}
      {activeTab === 'summarizer' && (
        <motion.div className="study-tool-card" variants={itemVariants}>
          <h3 style={{ marginBottom: '1rem' }}>📝 Smart Note Summarizer</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '.8rem', marginBottom: '1rem' }}>Paste your notes and get key bullet points extracted automatically.</p>
          <textarea
            className="study-textarea"
            rows={8}
            placeholder="Paste your notes here..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
          />
          <button className="btn btn-primary" style={{ marginTop: '.75rem' }} onClick={() => {
            const result = summarizeText(noteText);
            setSummary(result);
            if (result.length > 0) addNotification('success', 'Notes Summarized', `${result.length} key points extracted`);
          }}>
            <Zap size={14} /> Summarize
          </button>

          {summary.length > 0 && (
            <div className="summary-results">
              <h4>Key Points ({summary.length})</h4>
              <ul>
                {summary.map((point, i) => (
                  <li key={i}>{point}.</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Flashcards */}
      {activeTab === 'flashcards' && (
        <motion.div className="study-tool-card" variants={itemVariants}>
          <h3 style={{ marginBottom: '1rem' }}>⚡ Flashcard Generator</h3>
          {cards.length === 0 ? (
            <>
              <p style={{ color: 'var(--text-muted)', fontSize: '.8rem', marginBottom: '1rem' }}>Paste content and auto-generate Q&A flashcards.</p>
              <textarea
                className="study-textarea"
                rows={6}
                placeholder="Paste study content here..."
                value={flashText}
                onChange={e => setFlashText(e.target.value)}
              />
              <button className="btn btn-primary" style={{ marginTop: '.75rem' }} onClick={() => {
                const result = generateFlashcards(flashText);
                setCards(result);
                setCurrentCard(0);
                setFlipped(false);
                if (result.length > 0) addNotification('success', 'Flashcards Generated', `${result.length} cards created`);
                else addNotification('warning', 'No Cards', 'Try pasting longer, structured text');
              }}>
                <Zap size={14} /> Generate Cards
              </button>
            </>
          ) : (
            <div className="flashcard-viewer">
              <div className="flashcard-counter">{currentCard + 1} / {cards.length}</div>
              <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
                <div className="flashcard-front">
                  <div className="flashcard-label">Q</div>
                  <div className="flashcard-text">{cards[currentCard]?.q}</div>
                  <div className="flashcard-hint">Click to flip</div>
                </div>
                <div className="flashcard-back">
                  <div className="flashcard-label">A</div>
                  <div className="flashcard-text">{cards[currentCard]?.a}</div>
                </div>
              </div>
              <div className="flashcard-nav">
                <button className="btn btn-outline btn-sm" disabled={currentCard === 0} onClick={() => { setCurrentCard(p => p - 1); setFlipped(false); }}>
                  <ChevronLeft size={14} /> Prev
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => { setCards([]); setFlashText(''); }}>
                  <RotateCcw size={14} /> Reset
                </button>
                <button className="btn btn-outline btn-sm" disabled={currentCard >= cards.length - 1} onClick={() => { setCurrentCard(p => p + 1); setFlipped(false); }}>
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Pomodoro */}
      {activeTab === 'pomodoro' && (
        <motion.div className="study-tool-card" variants={itemVariants}>
          <h3 style={{ marginBottom: '1rem' }}>🍅 Pomodoro Timer</h3>
          <div className="pomodoro-container">
            <div className="pomodoro-ring-wrapper">
              <svg className="pomodoro-ring" viewBox="0 0 120 120">
                <circle className="pomodoro-ring-bg" cx="60" cy="60" r="52" />
                <circle
                  className="pomodoro-ring-fill"
                  cx="60" cy="60" r="52"
                  stroke={pomodoroPhase === 'work' ? 'var(--primary)' : '#22c55e'}
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - pomodoroProgress / 100)}
                />
              </svg>
              <div className="pomodoro-time-display">
                <div className="pomodoro-time">{formatTime(pomodoroTime)}</div>
                <div className="pomodoro-phase">{pomodoroPhase === 'work' ? 'Focus Time' : 'Break Time'}</div>
              </div>
            </div>

            <div className="pomodoro-controls">
              <button className="btn btn-primary" onClick={() => setPomodoroRunning(!pomodoroRunning)}>
                {pomodoroRunning ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start</>}
              </button>
              <button className="btn btn-outline" onClick={resetPomodoro}>
                <RotateCcw size={14} /> Reset
              </button>
              <button className="btn btn-outline" onClick={() => {
                if (pomodoroPhase === 'work') {
                  setPomodoroPhase('break');
                  setPomodoroTime(pomodoroBreak * 60);
                } else {
                  setPomodoroPhase('work');
                  setPomodoroTime(pomodoroWork * 60);
                }
              }}>
                <SkipForward size={14} /> Skip
              </button>
            </div>

            <div className="pomodoro-settings">
              <div className="edit-field" style={{ maxWidth: '120px' }}>
                <label>Work (min)</label>
                <input type="number" min="1" max="60" value={pomodoroWork} onChange={e => { setPomodoroWork(parseInt(e.target.value) || 25); if (!pomodoroRunning && pomodoroPhase === 'work') setPomodoroTime((parseInt(e.target.value) || 25) * 60); }} />
              </div>
              <div className="edit-field" style={{ maxWidth: '120px' }}>
                <label>Break (min)</label>
                <input type="number" min="1" max="30" value={pomodoroBreak} onChange={e => { setPomodoroBreak(parseInt(e.target.value) || 5); if (!pomodoroRunning && pomodoroPhase === 'break') setPomodoroTime((parseInt(e.target.value) || 5) * 60); }} />
              </div>
              <div className="pomodoro-sessions">
                <span>Sessions: <strong>{pomodoroSessions}</strong> 🍅</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Formulas */}
      {activeTab === 'formulas' && (
        <motion.div className="study-tool-card" variants={itemVariants}>
          <h3 style={{ marginBottom: '1rem' }}>📐 Formula Sheet</h3>
          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input style={{ paddingLeft: '30px', width: '100%' }} placeholder="Search formulas..." value={formulaSearch} onChange={e => setFormulaSearch(e.target.value)} />
            </div>
          </div>

          {/* Add Formula */}
          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="edit-field" style={{ flex: 1, minWidth: '100px' }}>
              <label>Subject</label>
              <input value={newFormula.subject} onChange={e => setNewFormula(p => ({ ...p, subject: e.target.value }))} placeholder="Physics" />
            </div>
            <div className="edit-field" style={{ flex: 1, minWidth: '100px' }}>
              <label>Name</label>
              <input value={newFormula.name} onChange={e => setNewFormula(p => ({ ...p, name: e.target.value }))} placeholder="Newton's 2nd Law" />
            </div>
            <div className="edit-field" style={{ flex: 2, minWidth: '150px' }}>
              <label>Formula</label>
              <input value={newFormula.formula} onChange={e => setNewFormula(p => ({ ...p, formula: e.target.value }))} placeholder="F = ma" onKeyDown={e => {
                if (e.key === 'Enter' && newFormula.name.trim() && newFormula.formula.trim()) {
                  setFormulas(prev => [...prev, { ...newFormula, id: Date.now() }]);
                  setNewFormula({ subject: '', name: '', formula: '' });
                }
              }} />
            </div>
            <button className="btn btn-primary btn-sm" style={{ height: '38px' }} onClick={() => {
              if (!newFormula.name.trim() || !newFormula.formula.trim()) return;
              setFormulas(prev => [...prev, { ...newFormula, id: Date.now() }]);
              setNewFormula({ subject: '', name: '', formula: '' });
              addNotification('success', 'Formula Added', newFormula.name);
            }}><Plus size={14} /></button>
          </div>

          {/* Formula List */}
          <div className="formula-list">
            {filteredFormulas.map(f => (
              <div key={f.id} className="formula-item">
                <div className="formula-info">
                  {f.subject && <span className="formula-subject">{f.subject}</span>}
                  <span className="formula-name">{f.name}</span>
                </div>
                <code className="formula-code">{f.formula}</code>
                <div style={{ display: 'flex', gap: '.25rem' }}>
                  <button className="btn-icon-sm" onClick={() => {
                    navigator.clipboard.writeText(f.formula);
                    setCopied(f.id);
                    setTimeout(() => setCopied(null), 1500);
                  }}>
                    {copied === f.id ? <Check size={12} style={{ color: '#22c55e' }} /> : <Copy size={12} />}
                  </button>
                  <button className="btn-icon-sm danger" onClick={() => setFormulas(prev => prev.filter(x => x.id !== f.id))}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
            {filteredFormulas.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', fontSize: '.85rem' }}>
                {formulas.length === 0 ? 'No formulas saved yet. Add your first formula above!' : 'No formulas match your search.'}
              </p>
            )}
          </div>
        </motion.div>
      )}

      <div className="page-footer">Built with ❤️ by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a></div>
    </motion.div>
  );
};

export default StudyAIPage;
