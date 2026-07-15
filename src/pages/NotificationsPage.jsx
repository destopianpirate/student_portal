import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { motion } from 'framer-motion';
import { Bell, CheckCircle2, Trash2, Filter, AlertTriangle, Info, AlertCircle, Trophy, Check } from 'lucide-react';

const TYPE_CONFIG = {
  success: { icon: CheckCircle2, color: '#22c55e', label: 'Success' },
  warning: { icon: AlertTriangle, color: '#f59e0b', label: 'Warning' },
  error: { icon: AlertCircle, color: '#ef4444', label: 'Error' },
  info: { icon: Info, color: '#6366f1', label: 'Info' },
  achievement: { icon: Trophy, color: '#f472b6', label: 'Achievement' },
};

const NotificationsPage = () => {
  const { history, unreadCount, markAsRead, markAllRead, clearHistory } = useNotifications();
  const [filterType, setFilterType] = useState('all');

  const filtered = filterType === 'all' ? history : history.filter(n => n.type === filterType);

  // Group by date
  const grouped = filtered.reduce((acc, n) => {
    const date = new Date(n.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(n);
    return acc;
  }, {});

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <motion.div className="page-container" variants={containerVariants} initial="hidden" animate="visible">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <Bell size={24} style={{ color: 'var(--primary)' }} /> Notifications
          {unreadCount > 0 && <span className="notif-page-badge">{unreadCount}</span>}
        </h2>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={markAllRead}><Check size={14} /> Mark All Read</button>
          <button className="btn btn-outline btn-sm" onClick={clearHistory}><Trash2 size={14} /> Clear All</button>
        </div>
      </div>

      {/* Filters */}
      <motion.div className="assignment-filters" variants={itemVariants}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          {['all', ...Object.keys(TYPE_CONFIG)].map(type => (
            <button
              key={type}
              className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterType(type)}
              style={{ fontSize: '.75rem', padding: '.25rem .6rem' }}
            >
              {type === 'all' ? 'All' : TYPE_CONFIG[type].label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications grouped by date */}
      {Object.entries(grouped).map(([date, notifs]) => (
        <motion.div key={date} variants={itemVariants}>
          <h4 className="notif-date-header">{date}</h4>
          {notifs.map(n => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
            const Icon = config.icon;
            return (
              <motion.div
                key={n.id}
                className={`notification-item ${n.read ? 'read' : 'unread'}`}
                variants={itemVariants}
                onClick={() => markAsRead(n.id)}
              >
                <div className="notif-icon" style={{ color: config.color }}>
                  <Icon size={18} />
                </div>
                <div className="notif-content">
                  <div className="notif-title">{n.title}</div>
                  {n.message && <div className="notif-message">{n.message}</div>}
                  <div className="notif-time">
                    {new Date(n.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {!n.read && <div className="notif-unread-dot" />}
              </motion.div>
            );
          })}
        </motion.div>
      ))}

      {history.length === 0 && (
        <motion.div className="empty-state" variants={itemVariants}>
          <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p>No notifications yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>You'll see activity notifications here</p>
        </motion.div>
      )}

      <div className="page-footer">Built with ❤️ by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a></div>
    </motion.div>
  );
};

export default NotificationsPage;
