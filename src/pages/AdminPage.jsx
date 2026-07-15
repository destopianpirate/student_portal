import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, BarChart3, Megaphone, Plus, Trash2, Search, RefreshCw, Activity, Database, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

const AdminPage = () => {
  const { currentUser, isAdmin } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info' });

  // Fetch all users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(data);
    } catch (e) {
      console.error('Failed to fetch users:', e);
      addNotification('error', 'Fetch Failed', 'Could not load users');
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const snap = await getDocs(collection(db, 'announcements'));
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('Failed to fetch announcements:', e);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchAnnouncements();
    }
  }, [isAdmin]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.branch || '').toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    return {
      totalUsers: users.length,
      activeToday: users.filter(u => u.lastLoginAt?.startsWith(todayStr)).length,
      profileComplete: users.filter(u => u.profileComplete).length,
      branches: [...new Set(users.map(u => u.branch).filter(Boolean))],
      adminCount: users.filter(u => u.role === 'admin').length,
    };
  }, [users]);

  const branchDistribution = useMemo(() => {
    const dist = {};
    users.forEach(u => {
      if (u.branch) dist[u.branch] = (dist[u.branch] || 0) + 1;
    });
    return Object.entries(dist).sort((a, b) => b[1] - a[1]);
  }, [users]);

  const toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      await setDoc(doc(db, 'users', userId), { role: newRole }, { merge: true });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      addNotification('success', 'Role Updated', `User role changed to ${newRole}`);
    } catch (e) {
      addNotification('error', 'Update Failed', e.message);
    }
  };

  const postAnnouncement = async () => {
    if (!newAnnouncement.title.trim()) return;
    const data = {
      ...newAnnouncement,
      createdAt: new Date().toISOString(),
      authorId: currentUser.uid,
      authorName: currentUser.displayName || currentUser.email,
    };
    try {
      const id = `ann_${Date.now()}`;
      await setDoc(doc(db, 'announcements', id), data);
      setAnnouncements(prev => [{ id, ...data }, ...prev]);
      setNewAnnouncement({ title: '', message: '', type: 'info' });
      addNotification('success', 'Announcement Posted', data.title);
    } catch (e) {
      addNotification('error', 'Post Failed', e.message);
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      addNotification('info', 'Deleted', 'Announcement removed');
    } catch (e) {
      addNotification('error', 'Delete Failed', e.message);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  const tabItems = [
    { key: 'users', label: 'Users', icon: Users },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'announcements', label: 'Announcements', icon: Megaphone },
    { key: 'system', label: 'System', icon: Activity },
  ];

  return (
    <motion.div className="page-container" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <Shield size={24} style={{ color: 'var(--primary)' }} /> Admin Panel
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', marginTop: '.25rem' }}>Platform management dashboard</p>
      </motion.div>

      {/* Stats */}
      <motion.div className="grades-stats-row" variants={itemVariants}>
        <div className="grade-stat-card cgpa-card"><div className="grade-stat-value">{stats.totalUsers}</div><div className="grade-stat-label">Total Users</div></div>
        <div className="grade-stat-card"><div className="grade-stat-value">{stats.activeToday}</div><div className="grade-stat-label">Active Today</div></div>
        <div className="grade-stat-card"><div className="grade-stat-value">{stats.profileComplete}</div><div className="grade-stat-label">Profiles Done</div></div>
        <div className="grade-stat-card"><div className="grade-stat-value">{stats.adminCount}</div><div className="grade-stat-label">Admins</div></div>
      </motion.div>

      {/* Tabs */}
      <motion.div className="study-tabs" variants={itemVariants}>
        {tabItems.map(t => (
          <button key={t.key} className={`study-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </motion.div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <motion.div className="study-tool-card" variants={itemVariants}>
          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input style={{ paddingLeft: '30px', width: '100%' }} placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button className="btn btn-outline btn-sm" onClick={fetchUsers}><RefreshCw size={14} /></button>
          </div>

          {usersLoading ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading users...</p>
          ) : (
            <div className="admin-users-table">
              <div className="admin-table-header">
                <span>User</span>
                <span>Branch</span>
                <span>Role</span>
                <span>Last Login</span>
                <span>Actions</span>
              </div>
              {filteredUsers.map(u => (
                <div key={u.id} className="admin-table-row">
                  <div className="admin-user-cell">
                    <div className="admin-user-name">{u.name || u.username || 'Unnamed'}</div>
                    <div className="admin-user-email">{u.email || u.gmail || '—'}</div>
                  </div>
                  <span className="admin-cell">{u.branch?.substring(0, 20) || '—'}</span>
                  <span className={`admin-role-badge ${u.role === 'admin' ? 'admin' : 'student'}`}>
                    {u.role || 'student'}
                  </span>
                  <span className="admin-cell" style={{ fontSize: '.75rem' }}>
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—'}
                  </span>
                  <button className="btn btn-outline btn-sm" style={{ fontSize: '.7rem' }} onClick={() => toggleUserRole(u.id, u.role)}>
                    {u.role === 'admin' ? 'Demote' : 'Promote'}
                  </button>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No users found</p>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <motion.div className="study-tool-card" variants={itemVariants}>
          <h3 style={{ marginBottom: '1.5rem' }}>Branch Distribution</h3>
          {branchDistribution.length > 0 ? (
            <div className="branch-chart">
              {branchDistribution.map(([branch, count]) => (
                <div key={branch} className="branch-bar-row">
                  <span className="branch-name">{branch.substring(0, 30)}</span>
                  <div className="branch-bar-bg">
                    <div className="branch-bar-fill" style={{ width: `${(count / stats.totalUsers) * 100}%` }} />
                  </div>
                  <span className="branch-count">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No data available</p>
          )}

          <h3 style={{ margin: '2rem 0 1rem' }}>Platform Overview</h3>
          <div className="admin-overview-grid">
            <div className="admin-overview-item">
              <Globe size={16} style={{ color: 'var(--primary)' }} />
              <span>Unique Branches: {stats.branches.length}</span>
            </div>
            <div className="admin-overview-item">
              <Database size={16} style={{ color: 'var(--primary)' }} />
              <span>Profile Completion: {stats.totalUsers > 0 ? Math.round((stats.profileComplete / stats.totalUsers) * 100) : 0}%</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <motion.div className="study-tool-card" variants={itemVariants}>
          <h3 style={{ marginBottom: '1rem' }}>Post Announcement</h3>
          <div className="edit-profile-grid">
            <div className="edit-field" style={{ gridColumn: '1 / -1' }}>
              <label>Title</label>
              <input value={newAnnouncement.title} onChange={e => setNewAnnouncement(p => ({ ...p, title: e.target.value }))} placeholder="Announcement title" />
            </div>
            <div className="edit-field" style={{ gridColumn: '1 / -1' }}>
              <label>Message</label>
              <textarea rows={3} value={newAnnouncement.message} onChange={e => setNewAnnouncement(p => ({ ...p, message: e.target.value }))} placeholder="Write your announcement..." style={{ resize: 'vertical' }} />
            </div>
            <div className="edit-field">
              <label>Type</label>
              <select value={newAnnouncement.type} onChange={e => setNewAnnouncement(p => ({ ...p, type: e.target.value }))}>
                <option value="info">ℹ️ Info</option>
                <option value="warning">⚠️ Warning</option>
                <option value="success">✅ Success</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={postAnnouncement}>
            <Megaphone size={14} /> Post Announcement
          </button>

          <h3 style={{ margin: '2rem 0 1rem' }}>Previous Announcements</h3>
          {announcements.map(a => (
            <div key={a.id} className="announcement-card">
              <div className="announcement-header">
                <h4>{a.title}</h4>
                <button className="btn-icon-sm danger" onClick={() => deleteAnnouncement(a.id)}><Trash2 size={13} /></button>
              </div>
              <p>{a.message}</p>
              <div className="announcement-meta">
                {new Date(a.createdAt).toLocaleDateString()} • {a.authorName || 'Admin'}
              </div>
            </div>
          ))}
          {announcements.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No announcements yet</p>}
        </motion.div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <motion.div className="study-tool-card" variants={itemVariants}>
          <h3 style={{ marginBottom: '1.5rem' }}>System Status</h3>
          <div className="system-status-grid">
            <div className="system-status-item online">
              <Activity size={16} />
              <span>Firebase Auth</span>
              <span className="status-badge online">Online</span>
            </div>
            <div className="system-status-item online">
              <Database size={16} />
              <span>Firestore Database</span>
              <span className="status-badge online">Online</span>
            </div>
            <div className="system-status-item online">
              <Globe size={16} />
              <span>Frontend Application</span>
              <span className="status-badge online">Running</span>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--input-bg)', borderRadius: '.75rem' }}>
            <h4 style={{ fontSize: '.85rem', marginBottom: '.5rem' }}>App Version</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>Smart Student Portal v2.0.0</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '.75rem', marginTop: '.25rem' }}>React 19 • Vite 8 • Firebase 11 • Framer Motion 12</p>
          </div>
        </motion.div>
      )}

      <div className="page-footer">Admin Panel • built by <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>destopianpirate</a></div>
    </motion.div>
  );
};

export default AdminPage;
