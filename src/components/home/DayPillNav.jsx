import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import '../../../PillNav/PillNav.css';

const DayPillNav = ({
  days,
  activeDay,
  onDayChange,
  todayName,
  ease = 'power3.easeOut'
}) => {
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (w === 0 || h === 0) return;

        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    const timer = setTimeout(layout, 50);

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, [days, ease]);

  const handleEnter = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  return (
    <div 
      className="pill-nav-container" 
      style={{
        display: 'inline-block',
        '--nav-base': 'var(--input-bg)',
        '--border-color': 'var(--border)',
        '--accent-color': 'var(--primary)',
        '--bg-color': '#ffffff',
        '--nav-pill-text': 'var(--text-muted)',
        '--nav-hover-text': 'var(--primary)',
        '--nav-hover-bg': 'rgba(99, 102, 241, 0.08)'
      }}
    >
      <nav className="pill-nav" aria-label="Day Navigation">
        <div className="pill-nav-items">
          <ul className="pill-list" role="menubar">
            {days.map((day, i) => {
              const isToday = day === todayName;
              const label = `${day.substring(0, 3)}${isToday ? ' •' : ''}`;
              const active = activeDay === day;

              return (
                <li key={day} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => onDayChange(day)}
                    className={`pill${active ? ' is-active' : ''}`}
                    aria-label={day}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                    style={{ border: 'none' }}
                  >
                    <span
                      className="hover-circle"
                      aria-hidden="true"
                      ref={el => {
                        circleRefs.current[i] = el;
                      }}
                    />
                    <span className="label-stack">
                      <span className="pill-label">{label}</span>
                      <span className="pill-label-hover" aria-hidden="true">
                        {label}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default React.memo(DayPillNav);
