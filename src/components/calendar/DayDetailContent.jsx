import React, { useMemo } from 'react';
import { Clock, Plus, X, Trash2 } from 'lucide-react';

const DayDetailContent = ({
  activeDateStr,
  todayStr,
  showDayTimetable,
  setShowDayTimetable,
  selectedEvents,
  selectedDayName,
  clickedDayClasses,
  removeEvent,
  monthDeadlines,
  academicExamPhases,
  monthExamsAndQuizzes,
  monthLongAcademicEvents,
  setEventForm,
  setShowAddModal,
  isMobile,
  setShowMobileDetail,
  MONTHS,
  month,
  // New props for month-level holidays & events
  gazettedHolidays,
  restrictedHolidays,
  customEvents,
  currentDate,
}) => {
  const formattedDate = new Date(activeDateStr + 'T00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const fmtDate = (d) => new Date(d + 'T00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  // Month-level holidays & custom events for "Events & Holidays" section
  const y = currentDate ? currentDate.getFullYear() : new Date().getFullYear();
  const m = currentDate ? currentDate.getMonth() : new Date().getMonth();

  const monthHolidays = useMemo(() => {
    const allH = [...(gazettedHolidays || []), ...(restrictedHolidays || [])];
    return allH.filter(h => {
      if (!h.date) return false;
      const parts = h.date.split('-');
      return parseInt(parts[0]) === y && parseInt(parts[1]) === (m + 1);
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [gazettedHolidays, restrictedHolidays, y, m]);

  const monthCustomEvents = useMemo(() => {
    if (!customEvents) return [];
    return customEvents.filter(e => {
      if (!e.date) return false;
      const parts = e.date.split('-');
      return parseInt(parts[0]) === y && parseInt(parts[1]) === (m + 1);
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [customEvents, y, m]);

  const allEventsCombined = useMemo(() => {
    const list = [
      ...monthHolidays.map((h, idx) => ({ ...h, isHoliday: true, idx, sortDate: h.date, textLength: h.name.length })),
      ...monthCustomEvents.map(e => ({ ...e, isHoliday: false, sortDate: e.date, textLength: e.title.length }))
    ];
    return list.sort((a, b) => a.sortDate.localeCompare(b.sortDate));
  }, [monthHolidays, monthCustomEvents]);

  const layoutData = useMemo(() => {
    if (allEventsCombined.length === 0) return { gridItems: [], longestItem: null };
    if (isMobile) {
      return { gridItems: allEventsCombined, longestItem: null };
    }
    if (allEventsCombined.length % 2 === 0) {
      return { gridItems: allEventsCombined, longestItem: null };
    }
    // Odd length - find index of the one with longest textLength
    let maxIdx = 0;
    let maxLen = -1;
    allEventsCombined.forEach((item, index) => {
      if (item.textLength > maxLen) {
        maxLen = item.textLength;
        maxIdx = index;
      }
    });
    const gridItems = allEventsCombined.filter((_, idx) => idx !== maxIdx);
    const longestItem = allEventsCombined[maxIdx];
    return { gridItems, longestItem };
  }, [allEventsCombined, isMobile]);

  const renderEventItem = (item, styleOverride = {}) => {
    if (item.isHoliday) {
      return (
        <div
          key={`mh-${item.idx}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.5rem',
            background: 'rgba(168, 85, 247, 0.06)',
            borderRadius: '6px',
            boxSizing: 'border-box',
            ...styleOverride
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.name}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              {item.type === 'gazetted' ? 'Gazetted' : 'Restricted'} · {fmtDate(item.date)}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div
          key={`me-${item.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.5rem',
            background: 'rgba(168, 85, 247, 0.06)',
            borderRadius: '6px',
            boxSizing: 'border-box',
            ...styleOverride
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.title}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ textTransform: 'capitalize' }}>{item.category}</span> · {fmtDate(item.date)}
              {item.time && <span>· {item.time}</span>}
            </div>
          </div>
          <button onClick={() => removeEvent(item.id)} style={{ padding: '0.2rem', cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'inline-flex' }}>
            <Trash2 size={12} />
          </button>
        </div>
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border)' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>{formattedDate}</h4>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {activeDateStr === todayStr ? "Today's Agenda" : 'Selected Date'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowDayTimetable(true)}
            style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', fontWeight: 600, fontFamily: 'inherit' }}
          >
            Show Timetable
          </button>
          <button
            onClick={() => { setEventForm(prev => ({ ...prev, date: activeDateStr })); setShowAddModal(true); }}
            style={{ padding: '0.3rem', borderRadius: '6px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex' }}
          >
            <Plus size={14} />
          </button>
          {isMobile && (
            <button className="cal-close-btn" onClick={() => setShowMobileDetail(false)}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Events & Holidays — Month level */}
      <div>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>
          Events & Holidays — {MONTHS[month]}
        </div>
        {allEventsCombined.length === 0 ? (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.4rem 0' }}>
            No events or holidays this month
          </div>
        ) : (
          <div
            style={{
              maxHeight: isMobile ? 'none' : '142px',
              overflowY: isMobile ? 'visible' : 'auto',
              scrollbarWidth: isMobile ? 'none' : 'thin',
              paddingRight: '2px'
            }}
          >
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {layoutData.gridItems.map(item => renderEventItem(item))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                {layoutData.gridItems.map(item => renderEventItem(item))}
                {layoutData.longestItem && renderEventItem(layoutData.longestItem, { gridColumn: 'span 2' })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Month Highlights */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.8rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
          Month Highlights
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {/* Deadlines */}
          <div>
            <div style={{ fontSize: '0.63rem', fontWeight: 700, color: '#d97706', marginBottom: '0.2rem' }}>Deadlines</div>
            {monthDeadlines.length === 0 ? (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>No deadlines this month</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {monthDeadlines.map((e, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0.45rem', background: 'var(--input-bg)', borderRadius: '5px', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: '0.4rem' }}>{e.title}</span>
                    <span style={{ color: '#d97706', fontWeight: 600, flexShrink: 0, fontSize: '0.65rem' }}>{fmtDate(e.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exams & Quizzes — darker bg */}
          <div>
            <div style={{ fontSize: '0.63rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.2rem' }}>Exams & Quizzes</div>
            {(academicExamPhases.length === 0 && monthExamsAndQuizzes.length === 0) ? (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>No exams scheduled</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {academicExamPhases.map((e, idx) => (
                  <div key={`ae-${idx}`} style={{ padding: '0.35rem 0.5rem', background: 'rgba(239,68,68,0.08)', borderRadius: '5px', fontSize: '0.72rem', border: '1px solid rgba(239,68,68,0.1)' }}>
                    <div style={{ fontWeight: 650, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                    <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)' }}>
                      {fmtDate(e.date)}{e.endDate && ` → ${fmtDate(e.endDate)}`}
                    </div>
                  </div>
                ))}
                {monthExamsAndQuizzes.map((e, idx) => (
                  <div key={`ce-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.5rem', background: 'rgba(239,68,68,0.06)', borderRadius: '5px', fontSize: '0.72rem', border: '1px solid rgba(239,68,68,0.08)' }}>
                    <span style={{ color: 'var(--text)', fontWeight: 550, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: '0.4rem' }}>{e.title}</span>
                    <span style={{ color: '#dc2626', fontWeight: 600, flexShrink: 0, fontSize: '0.65rem' }}>{fmtDate(e.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Academic Periods */}
          {monthLongAcademicEvents.length > 0 && (
            <div>
              <div style={{ fontSize: '0.63rem', fontWeight: 700, color: '#059669', marginBottom: '0.2rem' }}>Academic Periods</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {monthLongAcademicEvents.map((e, idx) => (
                  <div key={idx} style={{ padding: '0.3rem 0.45rem', background: 'var(--input-bg)', borderRadius: '5px', fontSize: '0.72rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
                    <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)' }}>
                      {fmtDate(e.date)}{e.endDate && ` → ${fmtDate(e.endDate)}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayDetailContent;
