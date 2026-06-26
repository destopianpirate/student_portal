import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Eye, Clock, Coffee, Sun, Cookie, Moon } from 'lucide-react';
import { isCurrentMeal, getMealWindow } from '../../utils/homeUtils';
import DayPillNav from './DayPillNav';

const MEAL_ICONS = {
  Breakfast: Coffee,
  Lunch: Sun,
  Snacks: Cookie,
  Dinner: Moon
};

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', width: '100%', position: 'relative' }}>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: 2 }}>
          <h3 className="section-title" style={{ margin: 0, textAlign: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <BookOpen size={20} /> Mess Menu: {selectedMessDay}{selectedMessDay === todayName ? ' (Today)' : ''}
          </h3>
          <div className="home-day-tabs" style={{ display: 'flex', justifyContent: 'center', background: 'transparent', padding: 0, border: 'none', boxShadow: 'none' }}>
            <DayPillNav
              days={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
              activeDay={selectedMessDay}
              onDayChange={setSelectedMessDay}
              todayName={todayName}
            />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          {messMenu && !isMobile && (
            <button 
              type="button"
              className="btn btn-sm" 
              onClick={() => setShowMessModal(true)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem', 
                padding: '0.45rem 0.75rem', 
                fontSize: '0.75rem',
                cursor: 'pointer',
                border: 'none',
                background: 'var(--input-bg)',
                color: 'var(--text-muted)',
                borderRadius: '8px'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--input-bg)'}
            >
              <Eye size={13} /> Full Menu
            </button>
          )}
        </div>
      </div>

      {messLoading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading menu...</p>
      ) : todayMess ? (
        <div>
          <div className="mess-tabs">
            {Object.keys(todayMess).map((mealName) => {
              const isActive = activeMealTab === mealName;
              const isNow = isCurrentMeal(todayMess[mealName].time);
              const isToday = selectedMessDay === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
              const MealIcon = MEAL_ICONS[mealName];
              
              return (
                <button
                  key={mealName}
                  type="button"
                  className={`mess-tab-btn ${isActive ? 'active' : ''} ${isNow && isToday ? 'is-now' : ''}`}
                  onClick={() => setActiveMealTab(mealName)}
                >
                  {MealIcon && <MealIcon size={14} className="meal-tab-icon" />}
                  <span>{mealName}</span>
                  {isNow && isToday && <span className="tab-now-dot" />}
                </button>
              );
            })}
          </div>

          {(() => {
            const meal = todayMess[activeMealTab];
            if (!meal) return null;
            const isToday = selectedMessDay === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
            const isNow = isToday && isCurrentMeal(meal.time);
            const filteredItems = meal.items.filter(item => item.item && item.item.trim() !== '' && item.item.trim() !== '-');

            return (
              <div className="mess-meal-col-card active-meal">
                <div className="meal-col-header">
                  <div className="meal-col-title-row">
                    <span className="meal-col-name">{activeMealTab}</span>
                    {isNow && <span className="active-meal-badge">NOW</span>}
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
      ) : (
        <div className="empty-state"><p>Mess menu not available</p></div>
      )}
      {isMobile && messMenu && (
        <button 
          type="button"
          className="btn btn-sm" 
          onClick={() => setShowMessModal(true)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.35rem', 
            padding: '0.55rem 0.75rem', 
            fontSize: '0.8rem', 
            width: '100%', 
            marginTop: '1.25rem', 
            cursor: 'pointer',
            border: 'none',
            background: 'var(--input-bg)',
            color: 'var(--text-muted)',
            borderRadius: '8px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--input-bg)'}
        >
          <Eye size={14} /> Full Menu
        </button>
      )}
    </motion.div>
  );
};

export default React.memo(MessMenuSection);
