import React, { useState, useEffect, useMemo } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useCalendar } from '../contexts/CalendarContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, CheckCircle2, Trash2, Filter, AlertTriangle, Info, AlertCircle, 
  Trophy, Check, Megaphone, Calendar, Clock, GraduationCap, X, ChevronRight, Sparkles 
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const TYPE_CONFIG = {
  success: { icon: CheckCircle2, color: '#22c55e', label: 'Success' },
  warning: { icon: AlertTriangle, color: '#f59e0b', label: 'Warning' },
  error: { icon: AlertCircle, color: '#ef4444', label: 'Alert' },
  info: { icon: Info, color: '#6366f1', label: 'Info' },
  achievement: { icon: Trophy, color: '#f472b6', label: 'Achievement' },
};

const TAB_CONFIG = {
  all: { label: 'All', icon: Bell },
  alert: { label: 'Alerts', icon: AlertTriangle },
  academic: { label: 'Academic', icon: GraduationCap },
  announcement: { label: 'Announcements', icon: Megaphone },
  achievement: { label: 'Achievements', icon: Trophy },
};

const NotificationsPage = () => {
  const { history, markAsRead, markAllRead, clearHistory } = useNotifications();
  const { currentUser } = useAuth();
  const { academicEvents = [], customEvents = [] } = useCalendar();
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [readAnnouncements, setReadAnnouncements] = useState(() => {
    if (!currentUser) return [];
    try { return JSON.parse(localStorage.getItem(`read_announcements_${currentUser.uid}`) || '[]'); } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Sync read announcements to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`read_announcements_${currentUser.uid}`, JSON.stringify(readAnnouncements));
    }
  }, [readAnnouncements, currentUser]);

  // Fetch Announcements from Firestore
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const snap = await getDocs(collection(db, 'announcements'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAnnouncements(list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
      } catch (e) {
        console.error('Failed to fetch announcements:', e);
      }
    };
    fetchAnnouncements();
  }, []);

  // 1. Calculate Attendance Alerts (< 75%)
  const attendanceAlerts = useMemo(() => {
    if (!currentUser) return [];
    try {
      const courses = JSON.parse(localStorage.getItem(`attendance_${currentUser.uid}`)) || [];
      const alerts = [];
      courses.forEach(c => {
        const total = c.records.length;
        const present = c.records.filter(r => r.status === 'present').length;
        const late = c.records.filter(r => r.status === 'late').length;
        const percentage = total > 0 ? ((present + late * 0.5) / total * 100).toFixed(1) : 100;
        const percentNum = parseFloat(percentage);
        
        if (total > 0 && percentNum < 75) {
          alerts.push({
            id: `attendance-warn-${c.id}`,
            type: 'warning',
            title: 'Low Attendance Alert',
            message: `Your attendance in "${c.name}" is ${percentNum}%, which is below the 75% minimum requirement. Attend your next classes to avoid deregistration.`,
            timestamp: new Date().toISOString(),
            category: 'alert',
            read: false,
            action: { label: 'Attendance Tracker', path: '/academics' }
          });
        }
      });
      return alerts;
    } catch (e) {
      console.error('Attendance parse error:', e);
      return [];
    }
  }, [currentUser]);

  // 2. Upcoming Deadlines & Exams (next 3 days)
  const academicAlerts = useMemo(() => {
    const alerts = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkUpcoming = (event, isCustom) => {
      if (!event.date) return;
      const eventDate = new Date(event.date + 'T00:00');
      const diffMs = eventDate - today;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Include events scheduled today or in the next 3 days
      if (diffDays >= 0 && diffDays <= 3) {
        const formattedDateStr = eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const name = event.name || event.title;
        
        if (event.category === 'deadline') {
          alerts.push({
            id: `deadline-${isCustom ? 'custom' : 'academic'}-${event.id || name}-${event.date}`,
            type: 'warning',
            title: 'Upcoming Deadline',
            message: `The deadline "${name}" is approaching on ${formattedDateStr}.`,
            timestamp: event.date + 'T09:00:00',
            category: 'academic',
            read: false,
            action: { label: 'Open Calendar', path: '/calendar' }
          });
        } else if (event.category === 'exam' || event.category === 'quiz') {
          alerts.push({
            id: `exam-${isCustom ? 'custom' : 'academic'}-${event.id || name}-${event.date}`,
            type: 'error',
            title: `Upcoming ${event.category.toUpperCase()}`,
            message: `"${name}" is scheduled on ${formattedDateStr}.`,
            timestamp: event.date + 'T08:00:00',
            category: 'academic',
            read: false,
            action: { label: 'Open Calendar', path: '/calendar' }
          });
        }
      }
    };

    academicEvents.forEach(e => checkUpcoming(e, false));
    customEvents.forEach(e => checkUpcoming(e, true));

    return alerts;
  }, [academicEvents, customEvents]);

  // 3. Convert Admin Announcements to notifications
  const announcementNotifications = useMemo(() => {
    return announcements.map(ann => ({
      id: `announcement-${ann.id}`,
      type: ann.type || 'info',
      title: `Notice: ${ann.title}`,
      message: ann.message,
      timestamp: ann.createdAt || new Date().toISOString(),
      category: 'announcement',
      read: readAnnouncements.includes(ann.id),
      announcementData: ann
    }));
  }, [announcements, readAnnouncements]);

  // 4. Merge all notifications
  const allNotifications = useMemo(() => {
    const historyNotifs = history.map(n => {
      let category = 'alert';
      if (n.type === 'achievement' || n.title?.toLowerCase().includes('achievement')) {
        category = 'achievement';
      } else if (n.type === 'info') {
        category = 'alert';
      }
      return { ...n, category };
    });

    const merged = [
      ...attendanceAlerts,
      ...academicAlerts,
      ...announcementNotifications,
      ...historyNotifs
    ];

    // Sort by timestamp descending
    return merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [attendanceAlerts, academicAlerts, announcementNotifications, history]);

  // Filter based on activeTab
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return allNotifications;
    return allNotifications.filter(n => n.category === activeTab);
  }, [allNotifications, activeTab]);

  // Counts for summary cards
  const unreadCount = useMemo(() => {
    return allNotifications.filter(n => !n.read).length;
  }, [allNotifications]);

  const handleNotifClick = (n) => {
    if (n.id?.toString().startsWith('announcement-')) {
      const annId = n.id.replace('announcement-', '');
      if (!readAnnouncements.includes(annId)) {
        setReadAnnouncements(prev => [...prev, annId]);
      }
      setSelectedAnnouncement(n.announcementData);
    } else if (n.id?.toString().startsWith('attendance-warn-') || n.id?.toString().startsWith('deadline-') || n.id?.toString().startsWith('exam-')) {
      if (n.action?.path) {
        navigate(n.action.path);
      }
    } else {
      markAsRead(n.id);
      if (n.action?.path) {
        navigate(n.action.path);
      }
    }
  };

  const handleMarkAllRead = () => {
    markAllRead();
    const allAnnIds = announcements.map(a => a.id);
    setReadAnnouncements(allAnnIds);
  };

  // Group notifications by relative date headers
  const groupedNotifications = useMemo(() => {
    const todayStr = new Date().toLocaleDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString();

    const groups = {};
    filteredNotifications.forEach(n => {
      const d = new Date(n.timestamp);
      const dStr = d.toLocaleDateString();
      let header = '';
      
      if (dStr === todayStr) {
        header = 'Today';
      } else if (dStr === yesterdayStr) {
        header = 'Yesterday';
      } else {
        header = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      }

      if (!groups[header]) groups[header] = [];
      groups[header].push(n);
    });
    return groups;
  }, [filteredNotifications]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <motion.div className="page-container" variants={containerVariants} initial="hidden" animate="visible">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 800 }}>
          <Bell size={24} style={{ color: 'var(--primary)' }} /> 
          <span>Notifications</span>
          {unreadCount > 0 && <span className="notif-page-badge">{unreadCount}</span>}
        </h2>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={handleMarkAllRead} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <Check size={14} /> Mark All Read
          </button>
          <button className="btn btn-outline btn-sm" onClick={clearHistory} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <Trash2 size={14} /> Clear History
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <motion.div className="analytics-stats-row" variants={itemVariants} style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="grade-stat-card" style={{ borderLeft: '3px solid #ef4444', padding: '1rem' }}>
          <div className="grade-stat-value" style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 800 }}>
            {academicAlerts.filter(a => a.type === 'error').length}
          </div>
          <div className="grade-stat-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upcoming Exams</div>
        </div>
        <div className="grade-stat-card" style={{ borderLeft: '3px solid #f59e0b', padding: '1rem' }}>
          <div className="grade-stat-value" style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 800 }}>
            {academicAlerts.filter(a => a.type === 'warning').length}
          </div>
          <div className="grade-stat-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approaching Deadlines</div>
        </div>
        <div className="grade-stat-card" style={{ borderLeft: '3px solid #3b82f6', padding: '1rem' }}>
          <div className="grade-stat-value" style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: 800 }}>
            {attendanceAlerts.length}
          </div>
          <div className="grade-stat-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attendance Warnings</div>
        </div>
        <div className="grade-stat-card" style={{ borderLeft: '3px solid #6366f1', padding: '1rem' }}>
          <div className="grade-stat-value" style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 800 }}>
            {announcementNotifications.filter(a => !a.read).length}
          </div>
          <div className="grade-stat-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unread Notices</div>
        </div>
      </motion.div>

      {/* Tabs / Filters */}
      <motion.div className="assignment-filters" variants={itemVariants} style={{ marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', minWidth: 'max-content' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)', marginRight: '0.25rem' }} />
          {Object.entries(TAB_CONFIG).map(([key, tab]) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === key;
            const count = key === 'all' 
              ? allNotifications.length 
              : allNotifications.filter(n => n.category === key).length;

            return (
              <button
                key={key}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab(key)}
                style={{ 
                  fontSize: '.75rem', 
                  padding: '.35rem .75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  borderRadius: '30px'
                }}
              >
                <TabIcon size={13} />
                <span>{tab.label}</span>
                <span 
                  style={{ 
                    fontSize: '0.65rem', 
                    padding: '1px 5px', 
                    borderRadius: '10px', 
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--input-bg)',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    marginLeft: '0.15rem'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Main Timeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {Object.entries(groupedNotifications).map(([header, notifs]) => (
          <motion.div key={header} variants={itemVariants}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 700 }}>
              {header}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {notifs.map(n => {
                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                const Icon = n.id?.toString().startsWith('announcement-') ? Megaphone : config.icon;
                const cardColor = n.id?.toString().startsWith('announcement-') ? 'var(--primary)' : config.color;

                return (
                  <motion.div
                    key={n.id}
                    className={`notification-item ${n.read ? 'read' : 'unread'} glass-card`}
                    onClick={() => handleNotifClick(n)}
                    style={{
                      borderLeft: `4px solid ${cardColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      cursor: 'pointer',
                      borderRadius: '10px',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      background: n.read ? 'rgba(255, 255, 255, 0.01)' : 'rgba(99, 102, 241, 0.02)'
                    }}
                    whileHover={{ scale: 1.005, x: 2, background: 'var(--input-bg)' }}
                  >
                    {/* Unread indicator dot */}
                    {!n.read && (
                      <div 
                        style={{ 
                          position: 'absolute', 
                          top: '12px', 
                          right: '12px', 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: cardColor 
                        }} 
                      />
                    )}

                    <div 
                      style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        background: 'var(--card-bg)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: cardColor, 
                        flexShrink: 0,
                        border: '1px solid var(--border)'
                      }}
                    >
                      <Icon size={16} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>
                          {n.title}
                        </span>
                        {n.category === 'achievement' && (
                          <span style={{ fontSize: '0.65rem', background: 'rgba(244, 114, 182, 0.15)', color: '#f472b6', padding: '1px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Sparkles size={10} /> Unlocked
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {n.message}
                      </p>
                      
                      {/* Action trigger label */}
                      {n.action && (
                        <span style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          {n.action.label} <ChevronRight size={10} />
                        </span>
                      )}
                      
                      {n.id?.toString().startsWith('announcement-') && (
                        <span style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          View Full Notice <ChevronRight size={10} />
                        </span>
                      )}
                    </div>

                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0, alignSelf: 'flex-start', marginTop: '2px' }}>
                      {new Date(n.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <motion.div className="empty-state glass-card" variants={itemVariants} style={{ padding: '4rem 2rem', marginTop: '1rem', textAlign: 'center' }}>
          <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>No notifications here</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '.8rem', margin: 0 }}>
            {activeTab === 'all' 
              ? "You're all caught up! You'll see alerts, calendar notices, and admin messages here."
              : `No notifications found in the "${TAB_CONFIG[activeTab].label}" category.`}
          </p>
        </motion.div>
      )}

      {/* Detailed Announcement Popup Modal */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="modal-overlay" onClick={() => setSelectedAnnouncement(null)} style={{ zIndex: 10005 }}>
            <motion.div 
              className="modal-content glass-card" 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '500px', width: '90%' }}
            >
              <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  <Megaphone size={18} style={{ color: 'var(--primary)' }} />
                  <span>College Announcement</span>
                </h3>
                <button className="modal-close" onClick={() => setSelectedAnnouncement(null)}><X size={20} /></button>
              </div>
              <div className="modal-body" style={{ minHeight: '120px', paddingBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
                  {selectedAnnouncement.title}
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--input-bg)', paddingBottom: '0.5rem' }}>
                  <span>Posted on: {new Date(selectedAnnouncement.createdAt || new Date()).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                  <span>&bull;</span>
                  <span style={{ textTransform: 'capitalize' }}>Category: {selectedAnnouncement.type || 'info'}</span>
                </div>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.85rem', 
                  color: 'var(--text)', 
                  lineHeight: '1.6', 
                  background: 'var(--input-bg)', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedAnnouncement.message}
                </p>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary btn-sm" onClick={() => setSelectedAnnouncement(null)}>Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="page-footer" style={{ marginTop: '3rem' }}>
        Built with ❤️ by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a>
      </div>
    </motion.div>
  );
};

export default NotificationsPage;
