import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const AddEventModal = ({ showAddModal, setShowAddModal, eventForm, setEventForm, handleAddEvent, isFormValid }) => {
  return (
    <AnimatePresence>
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <motion.div 
            className="modal-content glass-card add-event-modal" 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3><Plus size={20} style={{ color: 'var(--primary)' }} /> Add Event</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {/* Event Type & Name */}
              <div className="form-row">
                <div className="form-group">
                  <label>Event Type <span style={{ color: 'red' }}>*</span></label>
                  <select 
                    className="form-input" 
                    value={eventForm.category} 
                    onChange={e => setEventForm(f => {
                      const cat = e.target.value;
                      const defaultColors = {
                        personal: '#3b82f6',
                        academic: '#6366f1',
                        social: '#ec4899',
                        deadline: '#f59e0b',
                        exam: '#ef4444',
                        quiz: '#14b8a6'
                      };
                      return { ...f, category: cat, color: defaultColors[cat] || '#6366f1' };
                    })}
                  >
                    <option value="personal">Personal</option>
                    <option value="academic">Academic</option>
                    <option value="social">Social</option>
                    <option value="deadline">Deadline</option>
                    <option value="exam">Exam</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Event Name <span style={{ color: 'red' }}>*</span></label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="What's happening?" 
                    value={eventForm.title} 
                    onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} 
                    autoFocus 
                  />
                </div>
              </div>

              {/* Conditional Fields depending on selected event type */}
              {['personal', 'academic', 'social'].includes(eventForm.category) && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Date <span style={{ color: 'red' }}>*</span></label>
                    <input type="date" className="form-input" value={eventForm.date} onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Time (Optional)</label>
                    <input type="time" className="form-input" value={eventForm.time} onChange={e => setEventForm(f => ({ ...f, time: e.target.value }))} />
                  </div>
                </div>
              )}

              {eventForm.category === 'deadline' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Due Date <span style={{ color: 'red' }}>*</span></label>
                    <input type="date" className="form-input" value={eventForm.date} onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Due Time <span style={{ color: 'red' }}>*</span></label>
                    <input type="time" className="form-input" value={eventForm.time} onChange={e => setEventForm(f => ({ ...f, time: e.target.value }))} />
                  </div>
                </div>
              )}

              {['exam', 'quiz'].includes(eventForm.category) && (
                <>
                  <div className="form-group">
                    <label>Date <span style={{ color: 'red' }}>*</span></label>
                    <input type="date" className="form-input" value={eventForm.date} onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Time <span style={{ color: 'red' }}>*</span></label>
                      <input type="time" className="form-input" value={eventForm.time} onChange={e => setEventForm(f => ({ ...f, time: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>End Time <span style={{ color: 'red' }}>*</span></label>
                      <input type="time" className="form-input" value={eventForm.endTime} onChange={e => setEventForm(f => ({ ...f, endTime: e.target.value }))} />
                    </div>
                  </div>
                </>
              )}

              {/* Color Selector */}
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label>Event Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.35rem' }}>
                  {['#3b82f6', '#6366f1', '#ec4899', '#f59e0b', '#ef4444', '#14b8a6', '#a78bfa'].map(c => (
                    <button 
                      key={c}
                      type="button" 
                      onClick={() => setEventForm(f => ({ ...f, color: c }))} 
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        backgroundColor: c, 
                        border: eventForm.color === c ? '2.5px solid var(--text)' : '1.5px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    />
                  ))}
                  <input 
                    type="color" 
                    className="form-color" 
                    value={eventForm.color} 
                    onChange={e => setEventForm(f => ({ ...f, color: e.target.value }))} 
                    style={{ 
                      width: '28px', 
                      height: '28px', 
                      padding: 0, 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      background: 'transparent'
                    }} 
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddEvent} disabled={!isFormValid()}>Save Event</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddEventModal;
