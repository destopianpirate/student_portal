import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { motion } from 'framer-motion';
import { Target, Plus, Trash2, Flame, Trophy, Star, TrendingUp, BookOpen, Download, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

const QUOTES = [
  "The expert in anything was once a beginner.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Education is the most powerful weapon you can use to change the world.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Push yourself, because no one else is going to do it for you.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Don't watch the clock; do what it does — keep going.",
];

const ACHIEVEMENTS = [
  { id: 'first_goal', name: 'Goal Setter', desc: 'Set your first goal', icon: '🎯', condition: (goals) => goals.length >= 1 },
  { id: 'streak_3', name: '3-Day Streak', desc: 'Study 3 days in a row', icon: '🔥', condition: (_, streak) => streak >= 3 },
  { id: 'streak_7', name: 'Week Warrior', desc: '7-day study streak', icon: '⚡', condition: (_, streak) => streak >= 7 },
  { id: 'streak_14', name: 'Fortnight Force', desc: '14-day study streak', icon: '💎', condition: (_, streak) => streak >= 14 },
  { id: 'five_goals', name: 'Ambitious', desc: 'Set 5 goals', icon: '🚀', condition: (goals) => goals.length >= 5 },
  { id: 'study_50', name: 'Scholar', desc: 'Log 50 study hours', icon: '📚', condition: (_, __, hours) => hours >= 50 },
  { id: 'study_100', name: 'Dedicated', desc: 'Log 100 study hours', icon: '🏆', condition: (_, __, hours) => hours >= 100 },
];

const GoalsPage = () => {
  const { currentUser, saveProfile } = useAuth();
  const { addNotification } = useNotifications();

  const [goals, setGoals] = useState(() => {
    if (!currentUser) return [];
    try { return JSON.parse(localStorage.getItem(`goals_${currentUser.uid}`)) || []; } catch { return []; }
  });

  const [studyLog, setStudyLog] = useState(() => {
    if (!currentUser) return [];
    try { return JSON.parse(localStorage.getItem(`studylog_${currentUser.uid}`)) || []; } catch { return []; }
  });

  const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
    if (!currentUser) return [];
    try { return JSON.parse(localStorage.getItem(`achievements_${currentUser.uid}`)) || []; } catch { return []; }
  });

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [todayHours, setTodayHours] = useState('');
  const [todaySubject, setTodaySubject] = useState('');
  const [newGoal, setNewGoal] = useState({ title: '', target: '', unit: '%', current: 0, category: 'academic' });

  const todayStr = new Date().toISOString().split('T')[0];
  const quoteIdx = new Date().getDate() % QUOTES.length;

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`goals_${currentUser.uid}`, JSON.stringify(goals));
      localStorage.setItem(`studylog_${currentUser.uid}`, JSON.stringify(studyLog));
      localStorage.setItem(`achievements_${currentUser.uid}`, JSON.stringify(unlockedAchievements));
    }
  }, [goals, studyLog, unlockedAchievements, currentUser]);

  // Calculate streak
  const streak = useMemo(() => {
    const dates = [...new Set(studyLog.map(l => l.date))].sort().reverse();
    let count = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expStr = expected.toISOString().split('T')[0];
      if (dates[i] === expStr) count++;
      else break;
    }
    return count;
  }, [studyLog]);

  const totalStudyHours = useMemo(() => {
    return studyLog.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
  }, [studyLog]);

  // Check achievements
  useEffect(() => {
    ACHIEVEMENTS.forEach(ach => {
      if (!unlockedAchievements.includes(ach.id) && ach.condition(goals, streak, totalStudyHours)) {
        setUnlockedAchievements(prev => [...prev, ach.id]);
        addNotification('achievement', `Achievement Unlocked! ${ach.icon}`, ach.name);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#6366f1', '#f472b6', '#22c55e'] });
      }
    });
  }, [goals, streak, totalStudyHours]);

  const addGoal = () => {
    if (!newGoal.title.trim()) return;
    setGoals(prev => [...prev, { ...newGoal, id: Date.now(), target: parseFloat(newGoal.target) || 100, createdAt: todayStr }]);
    setNewGoal({ title: '', target: '', unit: '%', current: 0, category: 'academic' });
    setShowAddGoal(false);
    addNotification('success', 'Goal Set', newGoal.title);
  };

  const updateGoalProgress = (id, current) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, current: parseFloat(current) || 0 } : g));
  };

  const removeGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const logStudy = () => {
    const hours = parseFloat(todayHours);
    if (!hours || hours <= 0) return;
    setStudyLog(prev => [...prev, { date: todayStr, hours, subject: todaySubject || 'General', timestamp: new Date().toISOString() }]);
    setTodayHours('');
    setTodaySubject('');
    addNotification('success', 'Study Logged', `${hours}h added to your log`);
  };

  const todayLogged = useMemo(() => {
    return studyLog.filter(l => l.date === todayStr).reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
  }, [studyLog, todayStr]);

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const hours = studyLog.filter(l => l.date === ds).reduce((s, l) => s + (parseFloat(l.hours) || 0), 0);
      days.push({ date: ds, day: d.toLocaleDateString('en-US', { weekday: 'short' }), hours });
    }
    return days;
  }, [studyLog]);

  const maxDayHours = Math.max(...last7Days.map(d => d.hours), 1);

  const handleSave = async () => {
    try {
      await saveProfile({ goals, studyLog, achievements: unlockedAchievements });
      addNotification('success', 'Saved', 'Goals synced to cloud');
    } catch {
      addNotification('error', 'Save Failed', 'Data saved locally');
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div className="page-container" variants={containerVariants} initial="hidden" animate="visible">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <Target size={24} style={{ color: 'var(--primary)' }} /> Goals & Progress
        </h2>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddGoal(true)}><Plus size={14} /> New Goal</button>
          <button className="btn btn-outline btn-sm" onClick={handleSave}><Download size={14} /> Save</button>
        </div>
      </div>

      {/* Motivational Quote */}
      <motion.div className="quote-banner" variants={itemVariants}>
        <Star size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
        <span>"{QUOTES[quoteIdx]}"</span>
      </motion.div>

      {/* Stats Row */}
      <motion.div className="grades-stats-row" variants={itemVariants}>
        <div className="grade-stat-card cgpa-card">
          <div className="grade-stat-icon"><Flame size={20} style={{ color: streak > 0 ? '#ef4444' : 'var(--text-muted)' }} /></div>
          <div className="grade-stat-value">{streak}</div>
          <div className="grade-stat-label">Day Streak 🔥</div>
        </div>
        <div className="grade-stat-card">
          <div className="grade-stat-icon"><BookOpen size={20} /></div>
          <div className="grade-stat-value">{totalStudyHours.toFixed(1)}h</div>
          <div className="grade-stat-label">Total Study</div>
        </div>
        <div className="grade-stat-card">
          <div className="grade-stat-icon"><Zap size={20} /></div>
          <div className="grade-stat-value">{todayLogged.toFixed(1)}h</div>
          <div className="grade-stat-label">Today</div>
        </div>
        <div className="grade-stat-card">
          <div className="grade-stat-icon"><Trophy size={20} /></div>
          <div className="grade-stat-value">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</div>
          <div className="grade-stat-label">Achievements</div>
        </div>
      </motion.div>

      {/* Study Log */}
      <motion.div className="goals-section-card" variants={itemVariants}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}><BookOpen size={16} style={{ color: 'var(--primary)' }} /> Log Study Session</h3>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="edit-field" style={{ flex: 1, minWidth: '120px' }}>
            <label>Hours</label>
            <input type="number" step="0.5" min="0.5" max="16" placeholder="2.5" value={todayHours} onChange={e => setTodayHours(e.target.value)} />
          </div>
          <div className="edit-field" style={{ flex: 2, minWidth: '150px' }}>
            <label>Subject</label>
            <input placeholder="What did you study?" value={todaySubject} onChange={e => setTodaySubject(e.target.value)} onKeyDown={e => e.key === 'Enter' && logStudy()} />
          </div>
          <button className="btn btn-primary btn-sm" style={{ height: '38px' }} onClick={logStudy}>Log</button>
        </div>

        {/* Last 7 days chart */}
        <div className="study-week-chart" style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '.75rem' }}>Last 7 Days</h4>
          <div className="sgpa-chart" style={{ height: '100px' }}>
            {last7Days.map((d, i) => (
              <div key={i} className="sgpa-bar-wrapper">
                <div className="sgpa-bar-value" style={{ fontSize: '.65rem' }}>{d.hours > 0 ? `${d.hours}h` : ''}</div>
                <div className="sgpa-bar" style={{ height: `${(d.hours / maxDayHours) * 100}%`, background: d.date === todayStr ? 'var(--primary)' : undefined }} />
                <div className="sgpa-bar-label">{d.day}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div className="goals-section-card" variants={itemVariants}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}><Trophy size={16} style={{ color: '#fbbf24' }} /> Achievements</h3>
        <div className="achievements-grid">
          {ACHIEVEMENTS.map(ach => {
            const unlocked = unlockedAchievements.includes(ach.id);
            return (
              <div key={ach.id} className={`achievement-badge ${unlocked ? 'unlocked' : 'locked'}`}>
                <span className="achievement-icon">{ach.icon}</span>
                <span className="achievement-name">{ach.name}</span>
                <span className="achievement-desc">{ach.desc}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Goals List */}
      {goals.map(goal => {
        const progress = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0;
        const isComplete = progress >= 100;
        return (
          <motion.div key={goal.id} className={`goal-card ${isComplete ? 'completed' : ''}`} variants={itemVariants}>
            <div className="goal-header">
              <div>
                <h4>{goal.title}</h4>
                <span className="goal-category-badge">{goal.category}</span>
              </div>
              <button className="btn-icon-sm danger" onClick={() => removeGoal(goal.id)}><Trash2 size={13} /></button>
            </div>
            <div className="goal-progress-section">
              <div className="goal-progress-bar-bg">
                <div className="goal-progress-bar-fill" style={{ width: `${progress}%`, background: isComplete ? '#22c55e' : 'var(--primary)' }} />
              </div>
              <div className="goal-progress-text">
                <input
                  type="number"
                  className="goal-current-input"
                  value={goal.current}
                  onChange={e => updateGoalProgress(goal.id, e.target.value)}
                  style={{ width: '60px' }}
                />
                <span>/ {goal.target} {goal.unit}</span>
                <span style={{ marginLeft: 'auto', fontWeight: 700, color: isComplete ? '#22c55e' : 'var(--primary)' }}>{progress.toFixed(0)}%</span>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Add Goal Form */}
      {showAddGoal && (
        <motion.div className="assignment-add-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div className="assignment-add-modal" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
            <h3 style={{ marginBottom: '1rem' }}>Set New Goal</h3>
            <div className="edit-profile-grid">
              <div className="edit-field" style={{ gridColumn: '1 / -1' }}>
                <label>Goal Title *</label>
                <input value={newGoal.title} onChange={e => setNewGoal(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Achieve 9.0 CGPA" autoFocus />
              </div>
              <div className="edit-field">
                <label>Target Value</label>
                <input type="number" value={newGoal.target} onChange={e => setNewGoal(p => ({ ...p, target: e.target.value }))} placeholder="100" />
              </div>
              <div className="edit-field">
                <label>Unit</label>
                <select value={newGoal.unit} onChange={e => setNewGoal(p => ({ ...p, unit: e.target.value }))}>
                  <option value="%">%</option>
                  <option value="hours">hours</option>
                  <option value="GPA">GPA</option>
                  <option value="tasks">tasks</option>
                  <option value="books">books</option>
                </select>
              </div>
              <div className="edit-field">
                <label>Category</label>
                <select value={newGoal.category} onChange={e => setNewGoal(p => ({ ...p, category: e.target.value }))}>
                  <option value="academic">Academic</option>
                  <option value="skill">Skill</option>
                  <option value="fitness">Fitness</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowAddGoal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={addGoal}>Set Goal</button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {goals.length === 0 && !showAddGoal && (
        <motion.div className="empty-state" variants={itemVariants}>
          <Target size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p>No goals set yet. Start by adding your first academic goal!</p>
        </motion.div>
      )}

      <div className="page-footer">Goals & Progress • built by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a></div>
    </motion.div>
  );
};

export default GoalsPage;
