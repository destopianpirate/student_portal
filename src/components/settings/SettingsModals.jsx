import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Shield, Trash2 } from 'lucide-react';

const GRADE_POINTS = {
  'A+': 11, 'A': 10, 'A-': 9, 'B': 8, 'B-': 7, 'C': 6,
  'C-': 5, 'D': 4, 'E': 2, 'F': 0, 'I': null, 'W': null,
};

const SettingsModals = ({
  lightboxImage,
  setLightboxImage,
  importPreview,
  setImportPreview,
  importError,
  setImportError,
  showDeleteModal,
  setShowDeleteModal,
  deleteConfirmText,
  setDeleteConfirmText,
  handleConfirmDeleteAccount,
  currentUser,
  saveProfile,
  addNotification
}) => {
  return (
    <>
      {/* Lightbox Blur-Overlay for Cards */}
      {lightboxImage && createPortal(
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button type="button" className="lightbox-close" onClick={() => setLightboxImage(null)}>
              <X size={18} />
            </button>
            <div className="lightbox-image-container">
              <img src={lightboxImage.url} alt={lightboxImage.label} className="lightbox-image" />
            </div>
            <div className="lightbox-label">{lightboxImage.label}</div>
          </div>
        </div>,
        document.body
      )}

      {/* Review Imported Data Modal */}
      {importPreview && (
        <div className="modal-overlay" onClick={() => setImportPreview(null)}>
          <motion.div 
            className="modal-content glass-card"
            style={{ maxWidth: '680px', width: '90vw', maxHeight: '85vh', overflowY: 'auto', background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Review Imported Data</h3>
              <button type="button" className="modal-close" onClick={() => setImportPreview(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Please review the semesters and courses from the backup file before importing.
              </p>
              
              <div style={{ display: 'flex', gap: '1.5rem', background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <strong>College ID:</strong> {importPreview.collegeEmail}
                </div>
                <div>
                  <strong>Running Semester:</strong> {importPreview.profile?.semester || 'N/A'}
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--text)' }}>Semester-wise Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {importPreview.grades && importPreview.grades.length > 0 ? (
                    (() => {
                      const runningSemName = importPreview.profile?.semester;
                      const runningSem = importPreview.grades.find(sem => sem.name === runningSemName);
                      const completedSems = importPreview.grades.filter(sem => sem.name !== runningSemName);

                      return (
                        <>
                          {/* Running Semester Section */}
                          <div>
                            <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                              Running Semester
                            </h5>
                            {runningSem ? (
                              (() => {
                                const totalSemCredits = runningSem.courses?.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0) || 0;
                                return (
                                  <div style={{ border: '1px solid var(--primary)', borderRadius: '0.75rem', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.04)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                      <strong style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
                                        {runningSem.name}
                                      </strong>
                                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                                        <span style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                          {runningSem.courses?.length || 0} courses
                                        </span>
                                        <span style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                          {totalSemCredits} Credits
                                        </span>
                                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                                          SPI: — (In Progress)
                                        </span>
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.5rem' }}>
                                      {runningSem.courses && runningSem.courses.length > 0 ? (
                                        runningSem.courses.map((course, idx) => (
                                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <span>{course.name}</span>
                                            <span>{course.credits} Cr &bull; In Progress</span>
                                          </div>
                                        ))
                                      ) : (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No courses</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()
                            ) : (
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', border: '1px dashed var(--border)', borderRadius: '0.75rem', padding: '0.75rem' }}>
                                No registered courses found for the running semester.
                              </div>
                            )}
                          </div>

                          {/* Completed Semesters Section */}
                          <div style={{ marginTop: '0.5rem' }}>
                            <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                              Completed Semesters
                            </h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {completedSems.length > 0 ? (
                                completedSems.map(sem => {
                                  // Calculate SPI
                                  let totalPoints = 0, totalCredits = 0;
                                  sem.courses?.forEach(c => {
                                    const gp = GRADE_POINTS[c.grade];
                                    if (gp !== null && gp !== undefined && c.credits > 0) {
                                      totalPoints += gp * parseFloat(c.credits);
                                      totalCredits += parseFloat(c.credits);
                                    }
                                  });
                                  const spi = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '—';

                                  // Calculate credits completed
                                  const completedCredits = sem.courses?.reduce((sum, c) => {
                                    const gp = GRADE_POINTS[c.grade];
                                    return (gp !== null && gp !== undefined && gp > 0) ? sum + parseFloat(c.credits) : sum;
                                  }, 0) || 0;

                                  return (
                                    <div key={sem.name} style={{ border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.75rem' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <strong style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
                                          {sem.name}
                                        </strong>
                                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                                          <span style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                            {sem.courses?.length || 0} courses
                                          </span>
                                          <span style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                            {completedCredits} Credits Completed
                                          </span>
                                          <span style={{ background: 'var(--primary)', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                                            SPI: {spi}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Courses List */}
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.5rem' }}>
                                        {sem.courses && sem.courses.length > 0 ? (
                                          sem.courses.map((course, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                              <span>{course.name}</span>
                                              <span>{course.credits} Cr &bull; Grade: {course.grade || '—'}</span>
                                            </div>
                                          ))
                                        ) : (
                                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No courses</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', border: '1px dashed var(--border)', borderRadius: '0.75rem', padding: '0.75rem' }}>
                                  No completed semesters recorded.
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No semesters found in the backup file.</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setImportPreview(null)}>Cancel</button>
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={async () => {
                  const importedData = importPreview;
                  setImportPreview(null);
                  
                  // Restore localStorage parameters
                  if (importedData.notes) localStorage.setItem('student_notes', JSON.stringify(importedData.notes));
                  if (importedData.customEvents) localStorage.setItem('custom_events', JSON.stringify(importedData.customEvents));
                  if (importedData.certificates) localStorage.setItem('student_certificates', JSON.stringify(importedData.certificates));
                  if (importedData.projects) localStorage.setItem('student_projects', JSON.stringify(importedData.projects));
                  if (importedData.grades) localStorage.setItem(`grades_${currentUser.uid}`, JSON.stringify(importedData.grades));
                  
                  if (importedData.timetableCourses) {
                    localStorage.setItem(`courses_${currentUser.uid}`, JSON.stringify(importedData.timetableCourses));
                  } else {
                    // Fallback: reconstruct timetable courses from the running semester in importedData.grades
                    const runningSemName = importedData.profile?.semester;
                    const runningSem = importedData.grades?.find(sem => sem.name === runningSemName);
                    if (runningSem && runningSem.courses) {
                      const reconstructed = runningSem.courses.map(c => {
                        const parts = c.name.split(' - ');
                        const code = parts[0] || 'COURSE';
                        const title = parts.slice(1).join(' - ') || 'Course Title';
                        return {
                          id: c.id || Date.now() + Math.random(),
                          code: code,
                          title: title,
                          credits: c.credits || 0,
                          slots: []
                        };
                      });
                      localStorage.setItem(`courses_${currentUser.uid}`, JSON.stringify(reconstructed));
                    }
                  }
                  
                  // Restore profile details
                  if (importedData.profile) {
                    await saveProfile(importedData.profile);
                  }
                  
                  addNotification('success', 'Import Successful', 'All settings, data, and digital IDs successfully restored. Reloading...');
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                }}
              >
                Confirm Import
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {importError && (
        <div className="modal-overlay" onClick={() => setImportError(null)}>
          <motion.div 
            className="modal-content glass-card"
            style={{ maxWidth: '420px', width: '90vw', padding: '1.75rem', textAlign: 'center', background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '1rem' }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', color: '#ef4444' }}>
              <Shield size={48} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text)', fontSize: '1.25rem', fontWeight: 800 }}>{importError.title}</h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
              {importError.message}
            </p>
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={() => setImportError(null)}
              style={{ width: '100%', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontWeight: 'bold' }}
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <motion.div 
            className="modal-content glass-card"
            style={{ maxWidth: '420px', width: '90vw', padding: '1.75rem', textAlign: 'center', background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '1rem' }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', color: '#ef4444' }}>
              <Trash2 size={48} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text)', fontSize: '1.25rem', fontWeight: 800 }}>Delete Your Account?</h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
              This action is immediate and completely irreversible. All your profile details, notes, calendar events, projects, certificates, and grades will be permanently deleted.
            </p>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8', color: 'var(--text)', fontWeight: 600 }}>
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input 
              type="text" 
              className="compact-course-input name"
              style={{ width: '100%', marginBottom: '1.5rem', textAlign: 'center', height: '36px', fontSize: '0.9rem', letterSpacing: '2px', fontWeight: 'bold', textTransform: 'uppercase' }}
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button"
                className="btn btn-outline" 
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, padding: '0.6rem 1.25rem', borderRadius: '0.5rem' }}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn btn-danger" 
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={handleConfirmDeleteAccount}
                style={{ flex: 1, padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontWeight: 'bold', opacity: deleteConfirmText === 'DELETE' ? 1 : 0.5, cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed' }}
              >
                Confirm Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default SettingsModals;
