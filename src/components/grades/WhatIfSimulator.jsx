import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw, HelpCircle } from 'lucide-react';

const WhatIfSimulator = ({ semesters, maxSemesters, currentSemester, itemVariants }) => {
  // Parse numeric semester from name (e.g., "Semester 4" -> 4)
  const currentSemNum = useMemo(() => {
    return parseInt(currentSemester?.match(/\d+/)?.[0] || '1');
  }, [currentSemester]);

  // Compute the real SGPA and credits for each semester from the saved list
  const realSemesterData = useMemo(() => {
    const list = [];
    for (let i = 1; i <= maxSemesters; i++) {
      const name = `Semester ${i}`;
      const found = semesters.find(s => s.name === name);
      
      let totalPoints = 0, totalCredits = 0;
      if (found) {
        found.courses.forEach(c => {
          // Check if grade points map is available (Standard 11 scale weightings)
          const gp = {
            'A+': 11, 'A': 10, 'A-': 9, 'B': 8, 'B-': 7, 'C': 6,
            'C-': 5, 'D': 4, 'E': 2, 'F': 0
          }[c.grade];
          if (gp !== null && gp !== undefined && c.credits > 0) {
            totalPoints += gp * parseFloat(c.credits);
            totalCredits += parseFloat(c.credits);
          }
        });
      }

      const realSgpa = totalCredits > 0 ? totalPoints / totalCredits : null;
      const realCredits = totalCredits > 0 ? totalCredits : 20; // Default weight to 20 credits if empty/future

      list.push({
        num: i,
        name,
        realSgpa,
        realCredits,
        isCompleted: i < currentSemNum && realSgpa !== null
      });
    }
    return list;
  }, [semesters, maxSemesters, currentSemNum]);

  // Track the user's mocked SGPAs
  const [mockedSgpas, setMockedSgpas] = useState({});

  // Initialize/Reset mocked values based on real data
  const resetToReal = () => {
    const initial = {};
    realSemesterData.forEach(sem => {
      initial[sem.num] = sem.realSgpa !== null ? sem.realSgpa : 8.0; // default to 8.0 for future/empty sems
    });
    setMockedSgpas(initial);
  };

  useEffect(() => {
    resetToReal();
  }, [realSemesterData]);

  const handleSliderChange = (num, val) => {
    setMockedSgpas(prev => ({
      ...prev,
      [num]: parseFloat(val)
    }));
  };

  // Calculate simulated CGPA
  const simulatedCgpa = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;

    realSemesterData.forEach(sem => {
      const sgpa = mockedSgpas[sem.num] !== undefined ? mockedSgpas[sem.num] : (sem.realSgpa || 8.0);
      const credits = sem.realCredits;
      totalPoints += sgpa * credits;
      totalCredits += credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '—';
  }, [realSemesterData, mockedSgpas]);

  return (
    <motion.div className="compact-semester-card" variants={itemVariants} style={{ padding: '1.25rem', marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} /> Mock SPI What-If Simulator
          </h3>
          <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Simulate SGPAs for completed and future semesters to forecast your final CGPA.
          </p>
        </div>
        <button 
          className="btn btn-outline btn-xs" 
          onClick={resetToReal}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', padding: '0.2rem 0.5rem', cursor: 'pointer' }}
          title="Reset all values to your actual grades"
        >
          <RefreshCw size={12} /> Reset to Real
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
        {/* Sliders list */}
        <div style={{ flex: '2', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {realSemesterData.map(sem => {
            const currentVal = mockedSgpas[sem.num] ?? 8.0;
            const isFuture = sem.num >= currentSemNum;
            const hasReal = sem.realSgpa !== null;

            return (
              <div 
                key={sem.num} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.2rem',
                  padding: '0.5rem',
                  background: isFuture ? 'rgba(99, 102, 241, 0.01)' : 'var(--input-bg)',
                  border: isFuture ? '1px dashed var(--border)' : '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  <span style={{ color: 'var(--text)' }}>
                    Semester {sem.num}
                    {hasReal && <span style={{ fontSize: '0.65rem', color: 'var(--success)', marginLeft: '0.4rem', fontWeight: 600 }}>(Real: {sem.realSgpa.toFixed(2)})</span>}
                    {isFuture && <span style={{ fontSize: '0.65rem', color: 'var(--primary)', marginLeft: '0.4rem', fontWeight: 600 }}>(Future/Current)</span>}
                  </span>
                  <span style={{ color: 'var(--primary)' }}>{currentVal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="range"
                    min="0.00"
                    max="11.00"
                    step="0.05"
                    value={currentVal}
                    onChange={e => handleSliderChange(sem.num, e.target.value)}
                    style={{ flex: 1, height: '4px', background: 'var(--border)', borderRadius: '2px', cursor: 'pointer' }}
                  />
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', minWidth: '45px', textAlign: 'right' }}>
                    {sem.realCredits} Cr
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Display Simulated Result Card */}
        <div style={{ flex: '1', minWidth: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Simulated CGPA
          </div>
          <div 
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              background: 'var(--card-bg)', 
              border: '3px solid var(--primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 900,
              color: 'var(--primary)',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.15)',
              marginBottom: '0.75rem'
            }}
          >
            {simulatedCgpa}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
            Calculated over {realSemesterData.reduce((a, b) => a + b.realCredits, 0)} total credits (completed + mock weights).
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WhatIfSimulator;
