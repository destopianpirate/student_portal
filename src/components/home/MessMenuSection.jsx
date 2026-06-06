import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Eye, Clock } from 'lucide-react';
import { isCurrentMeal, getMealWindow } from '../../utils/homeUtils';

const MessMenuSection = ({
  selectedMessDay,
  setSelectedMessDay,
  todayName,
  messMenu,
  messLoading,
  setShowMessModal,
  todayMess,
  activeMealTab,
  setActiveMealTab,
  isMobile,
  itemVariants
}) => {
  return (
    <motion.div className="today-section" variants={itemVariants}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <h3 className="section-title" style={{ margin: 0, paddingRight: '7.5rem' }}><BookOpen size={20} /> Mess Menu — {selectedMessDay}{selectedMessDay === todayName ? ' (Today)' : ''}</h3>
          <div className="home-day-tabs">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => {
              const isToday = d === todayName;
              return (
                <button
                  key={d}
                  className={`home-day-tab-btn ${selectedMessDay === d ? 'active' : ''}`}
                  onClick={() => setSelectedMessDay(d)}
                >
                  {d.substring(0, 3)}{isToday ? ' (Today)' : ''}
                </button>
              );
            })}
          </div>
        </div>
        {messMenu && !isMobile && (
          <button 
            type="button"
            className="btn btn-outline btn-sm" 
            onClick={() => setShowMessModal(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              padding: '0.45rem 0.75rem', 
              fontSize: '0.75rem',
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              zIndex: 10,
              cursor: 'pointer'
            }}
          >
            <Eye size={13} /> Full Menu
          </button>
        )}
      </div>

      {messLoading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading menu...</p>
      ) : todayMess ? (
        isMobile ? (
          <div className="mess-meals-grid">
            {Object.keys(todayMess).map((mealName) => {
              const meal = todayMess[mealName];
              if (!meal) return null;
              const active = isCurrentMeal(meal.time);
              const filteredItems = meal.items.filter(item => item.item && item.item.trim() !== '' && item.item.trim() !== '-');

              return (
                <div key={mealName} className={`mess-meal-col-card ${active ? 'active-meal' : ''}`}>
                  <div className="meal-col-header">
                    <div className="meal-col-title-row">
                      <span className="meal-col-name">{mealName}</span>
                      {active && <span className="active-meal-badge">NOW</span>}
                    </div>
                    <span className="meal-col-time"><Clock size={10} /> {meal.time}</span>
                  </div>

                  <div className="meal-col-body">
                    {filteredItems.length === 0 ? (
                      <span className="meal-col-empty">No items listed</span>
                    ) : (
                      <ul className="meal-col-list">
                        {filteredItems.map((item, idx) => (
                          <li key={idx} className="meal-col-item">
                            <span className="meal-col-category-dot" title={item.category} />
                            <div className="meal-col-food-info">
                              <span className="meal-col-food-name">{item.item}</span>
                              <span className="meal-col-category-text">{item.category}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <div className="mess-tabs">
              {Object.keys(todayMess).map((mealName) => {
                const isActive = activeMealTab === mealName;
                const isNow = isCurrentMeal(todayMess[mealName].time);
                const isToday = selectedMessDay === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
                
                return (
                  <button
                    key={mealName}
                    type="button"
                    className={`mess-tab-btn ${isActive ? 'active' : ''} ${isNow && isToday ? 'is-now' : ''}`}
                    onClick={() => setActiveMealTab(mealName)}
                  >
                    {mealName}
                    {isNow && isToday && <span className="tab-now-dot" />}
                  </button>
                );
              })}
            </div>

            {(() => {
              const meal = todayMess[activeMealTab];
              if (!meal) return null;
              const isToday = selectedMessDay === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
              const active = isToday && isCurrentMeal(meal.time);
              const filteredItems = meal.items.filter(item => item.item && item.item.trim() !== '' && item.item.trim() !== '-');

              return (
                <div className={`mess-meal-col-card ${active ? 'active-meal' : ''}`}>
                  <div className="meal-col-header">
                    <div className="meal-col-title-row">
                      <span className="meal-col-name">{activeMealTab}</span>
                      {active && <span className="active-meal-badge">NOW</span>}
                    </div>
                    <span className="meal-col-time"><Clock size={10} /> {meal.time}</span>
                  </div>

                  <div className="meal-col-body">
                    {filteredItems.length === 0 ? (
                      <span className="meal-col-empty">No items listed</span>
                    ) : (
                      <ul className="meal-col-list">
                        {filteredItems.map((item, idx) => (
                          <li key={idx} className="meal-col-item">
                            <span className="meal-col-category-dot" title={item.category} />
                            <div className="meal-col-food-info">
                              <span className="meal-col-food-name">{item.item}</span>
                              <span className="meal-col-category-text">{item.category}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )
      ) : (
        <div className="empty-state"><p>Mess menu not available</p></div>
      )}
      {isMobile && messMenu && (
        <button 
          type="button"
          className="btn btn-outline btn-sm" 
          onClick={() => setShowMessModal(true)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.55rem 0.75rem', fontSize: '0.8rem', width: '100%', marginTop: '1.25rem', cursor: 'pointer' }}
        >
          <Eye size={14} /> Full Menu
        </button>
      )}
    </motion.div>
  );
};

export default MessMenuSection;
