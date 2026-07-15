import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle, Trophy } from 'lucide-react';

const ICON_MAP = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
  achievement: Trophy,
};

const COLOR_MAP = {
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#6366f1',
  achievement: '#f472b6',
};

const ToastContainer = () => {
  const { notifications, dismissNotification } = useNotifications();

  return (
    <div className="toast-container">
      <AnimatePresence>
        {notifications.slice(0, 5).map((notif) => {
          const Icon = ICON_MAP[notif.type] || Info;
          const color = COLOR_MAP[notif.type] || COLOR_MAP.info;

          return (
            <motion.div
              key={notif.id}
              className={`toast-item toast-${notif.type}`}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              layout
            >
              <div className="toast-icon" style={{ color }}>
                <Icon size={18} />
              </div>
              <div className="toast-content">
                <div className="toast-title">{notif.title}</div>
                {notif.message && <div className="toast-message">{notif.message}</div>}
              </div>
              <button className="toast-dismiss" onClick={() => dismissNotification(notif.id)}>
                <X size={14} />
              </button>
              <div className="toast-timer-bar" style={{ background: color }} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
