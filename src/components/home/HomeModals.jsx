import React from 'react';
import { createPortal } from 'react-dom';
import { Calendar, X, BookOpen } from 'lucide-react';
import { getHue } from '../../utils/homeUtils';

const HomeModals = ({
  showClassModal,
  setShowClassModal,
  savedTimetable,
  allSlots,
  showMessModal,
  setShowMessModal,
  messMenu,
  activeLightBoxImage,
  setActiveLightBoxImage,
  zoomedImage,
  setZoomedImage
}) => {
  return (
    <>
      {/* Class Timetable Modal */}
      {showClassModal && savedTimetable && (
        <div className="popup-modal-overlay" onClick={() => setShowClassModal(false)}>
          <div className="popup-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-modal-header">
              <h3 className="popup-modal-title"><Calendar size={18} /> Full Weekly Timetable</h3>
              <button className="popup-modal-close" onClick={() => setShowClassModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="popup-modal-body">
              <div className="timetable-scroll-wrapper">
                <table className="modal-timetable-table">
                  <thead>
                    <tr>
                      <th>Time Slot</th>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                        <th key={day}>{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allSlots.map(time => {
                      if (time === "13:00 - 14:00") {
                        return (
                          <tr key={time}>
                            <td className="time-col">{time}</td>
                            <td colSpan={5} className="lunch-row-cell">Lunch Break</td>
                          </tr>
                        );
                      }
                      
                      return (
                        <tr key={time}>
                          <td className="time-col">{time}</td>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                            const entries = savedTimetable[day]?.[time] || [];
                            return (
                              <td key={day}>
                                {entries.length === 0 ? (
                                  <span className="empty-slot">—</span>
                                ) : (
                                  entries.map((e, idx) => (
                                    <div key={idx} className="modal-timetable-cell" style={{ '--hue': getHue(e.code || 'CS') }}>
                                      <div className="cell-code">{e.code}</div>
                                      <div className="cell-type">{e.type}</div>
                                      <div className="cell-venue">{e.venue || 'N/A'}</div>
                                    </div>
                                  ))
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Mess Menu Modal */}
      {showMessModal && messMenu && (
        <div className="popup-modal-overlay" onClick={() => setShowMessModal(false)}>
          <div className="popup-modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '1200px' }}>
            <div className="popup-modal-header">
              <h3 className="popup-modal-title"><BookOpen size={18} /> Full Weekly Mess Menu</h3>
              <button className="popup-modal-close" onClick={() => setShowMessModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="popup-modal-body">
              <div className="timetable-scroll-wrapper">
                <table className="modal-timetable-table">
                  <thead>
                    <tr>
                      <th>Meal / Time</th>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <th key={day}>{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(messMenu.meals).map(([mealName, mealData]) => (
                      <tr key={mealName}>
                        <td className="time-col">
                          <div style={{ fontWeight: '700' }}>{mealName}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.15rem' }}>{mealData.time}</div>
                        </td>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                          const items = mealData.items[day] || [];
                          const filtered = items.filter(it => it.item && it.item.trim() !== '' && it.item.trim() !== '-');
                          return (
                            <td key={day} style={{ verticalAlign: 'top' }}>
                              {filtered.length === 0 ? (
                                <span className="empty-slot">—</span>
                              ) : (
                                <ul style={{ paddingLeft: '0.75rem', margin: 0, fontSize: '0.75rem', lineHeight: '1.3' }}>
                                  {filtered.map((it, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.2rem' }}>
                                      <span>{it.item}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeLightBoxImage && createPortal(
        <div className="lightbox-overlay" onClick={() => { setActiveLightBoxImage(null); setZoomedImage(false); }}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => { setActiveLightBoxImage(null); setZoomedImage(false); }}>
              <X size={18} />
            </button>
            <div className="lightbox-image-container">
              <img 
                src={activeLightBoxImage.url} 
                alt={activeLightBoxImage.label} 
                className={`lightbox-image ${zoomedImage ? 'zoomed' : ''}`}
                onClick={() => setZoomedImage(!zoomedImage)}
              />
            </div>
            <div className="lightbox-label">{activeLightBoxImage.label} (Click image to zoom)</div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default React.memo(HomeModals);
export { getHue };
