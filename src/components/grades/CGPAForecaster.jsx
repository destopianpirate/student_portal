import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const CGPAForecaster = ({
  cgpa,
  targetCgpa,
  setTargetCgpa,
  remainingCredits,
  setRemainingCredits,
  requiredSPI,
  itemVariants
}) => {
  return (
    <motion.div className="cgpa-forecaster-card glass-card" variants={itemVariants}>
      <h3 style={{ marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <TrendingUp size={15} style={{ color: 'var(--primary)' }} /> CGPA Goal Forecaster
      </h3>
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        Simulate the SPI required in remaining credits to achieve your target CGPA.
      </p>
      
      <div className="forecaster-slider-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold' }}>
          <span>Target CGPA:</span>
          <span style={{ color: 'var(--primary)' }}>{targetCgpa.toFixed(2)}</span>
        </div>
        <input
          type="range"
          className="forecaster-slider"
          min={(parseFloat(cgpa) || 0.01).toFixed(2)}
          max="11.00"
          step="0.05"
          value={targetCgpa}
          onChange={e => setTargetCgpa(parseFloat(e.target.value))}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginTop: '0.5rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>Remaining Credits:</span>
        <input
          type="number"
          className="compact-course-input"
          style={{ width: '60px', height: '26px', fontSize: '0.75rem', textAlign: 'center', padding: '0.2rem' }}
          min="1"
          max="120"
          value={remainingCredits}
          onChange={e => setRemainingCredits(Math.max(1, parseInt(e.target.value) || 1))}
        />
      </div>

      <div className={`forecaster-result ${requiredSPI > 11.0 ? 'impossible' : requiredSPI <= 4.0 ? 'perfect' : ''}`}>
        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
          Required Future SPI
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: requiredSPI > 11.0 ? '#ef4444' : 'var(--primary)' }}>
          {requiredSPI > 11.0 ? 'N/A' : requiredSPI.toFixed(2)}
        </div>
        <div style={{ fontSize: '0.65rem', marginTop: '0.25rem', fontWeight: 600, color: requiredSPI > 11.0 ? '#ef4444' : requiredSPI <= 4.0 ? '#22c55e' : 'var(--text-muted)' }}>
          {requiredSPI > 11.0 
            ? '⚠️ Mathematically Impossible (> 11.00)' 
            : requiredSPI <= 4.0 
              ? '🎉 Highly Achievable! (SPI ≤ 4.00)' 
              : `SPI of ${requiredSPI.toFixed(2)} average required.`}
        </div>
      </div>
    </motion.div>
  );
};

export default CGPAForecaster;
