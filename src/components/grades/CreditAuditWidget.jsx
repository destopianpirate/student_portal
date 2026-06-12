import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, Layers } from 'lucide-react';

const CATEGORY_RULES = {
  Core: { color: '#3b82f6', required: 70, label: 'Core Courses' },
  'Basic Sciences': { color: '#10b981', required: 24, label: 'Basic Sciences' },
  HSS: { color: '#f97316', required: 12, label: 'HSS & Electives' },
  Project: { color: '#ec4899', required: 14, label: 'Projects & Thesis' },
  Elective: { color: '#8b5cf6', required: 40, label: 'Open Electives' },
};

const getCourseCategory = (courseName) => {
  const code = courseName?.split('-')[0]?.trim()?.toUpperCase() || '';
  if (/^(CS|EE|ME|CE|CH|AI|IC|MT)/.test(code)) return 'Core';
  if (/^(HS|SO|LA|HSS|HU)/.test(code)) return 'HSS';
  if (/^(MA|PH|CY|BSC|SC)/.test(code)) return 'Basic Sciences';
  if (/^(PR|TH|IN|PROJ|THS)/.test(code)) return 'Project';
  return 'Elective';
};

const CreditAuditWidget = ({ semesters, GRADE_POINTS, itemVariants }) => {
  const auditData = useMemo(() => {
    const categories = {
      Core: 0,
      'Basic Sciences': 0,
      HSS: 0,
      Project: 0,
      Elective: 0,
    };

    semesters.forEach((sem) => {
      sem.courses.forEach((c) => {
        const gp = GRADE_POINTS[c.grade];
        // Only count credits if course has a passing grade (GP > 0)
        if (gp !== null && gp !== undefined && gp > 0) {
          const cat = getCourseCategory(c.name);
          if (categories[cat] !== undefined) {
            categories[cat] += parseFloat(c.credits) || 0;
          } else {
            categories['Elective'] += parseFloat(c.credits) || 0;
          }
        }
      });
    });

    return categories;
  }, [semesters, GRADE_POINTS]);

  const totalCompleted = Object.values(auditData).reduce((a, b) => a + b, 0);
  const totalRequired = Object.values(CATEGORY_RULES).reduce((a, b) => a + b.required, 0); // 160
  const totalPercent = Math.min(100, (totalCompleted / totalRequired) * 100);

  return (
    <motion.div className="grades-chart-card glass-card" variants={itemVariants} style={{ padding: '1.25rem', marginBottom: '0.75rem' }}>
      <h3 style={{ marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Layers size={16} style={{ color: 'var(--primary)' }} /> Degree Credit Audit
      </h3>
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        Track your earned credits against graduation requirements (B.Tech target: {totalRequired} credits).
      </p>

      {/* Main progress indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--input-bg)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {/* Radial progress ring */}
          <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            <circle cx="25" cy="25" r="21" stroke="var(--border)" strokeWidth="4" fill="transparent" />
            <circle 
              cx="25" 
              cy="25" 
              r="21" 
              stroke="var(--primary)" 
              strokeWidth="4" 
              fill="transparent" 
              strokeDasharray={`${2 * Math.PI * 21}`}
              strokeDashoffset={`${2 * Math.PI * 21 * (1 - totalPercent / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          <span style={{ position: 'absolute', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text)' }}>
            {Math.round(totalPercent)}%
          </span>
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>{totalCompleted} / {totalRequired} Cr</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Curriculum Progress</div>
        </div>
      </div>

      {/* Categories breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Object.entries(CATEGORY_RULES).map(([key, meta]) => {
          const completed = auditData[key] || 0;
          const pct = Math.min(100, (completed / meta.required) * 100);
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{meta.label}</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  <strong style={{ color: meta.color }}>{completed}</strong> / {meta.required} Cr
                </span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'var(--input-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${pct}%`, 
                    height: '100%', 
                    background: meta.color, 
                    borderRadius: '3px',
                    transition: 'width 0.4s ease-out'
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CreditAuditWidget;
