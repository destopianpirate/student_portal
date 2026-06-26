import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Sun, Moon } from 'lucide-react';
import './PillNav.css';

const PillNav = ({
  items,
  activeTab,
  onTabChange,
  theme,
  onThemeToggle,
  className = '',
  style = {},
  ease = 'power3.easeOut',
  initialLoadAnimation = true
}) => {
  const isLight = theme === 'light';

  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);
  const initialAnimDoneRef = useRef(false);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
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

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    if (initialLoadAnimation && !initialAnimDoneRef.current) {
      initialAnimDoneRef.current = true;
      const logo = logoRef.current;
      const navItems = navItemsRef.current;

      if (logo) {
        gsap.set(logo, { scale: 0 });
        gsap.to(logo, {
          scale: 1,
          duration: 0.6,
          ease
        });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        gsap.to(navItems, {
          width: 'auto',
          duration: 0.6,
          ease
        });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

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

  const handleLogoEnter = () => {
    const icon = logoImgRef.current;
    if (!icon) return;
    logoTweenRef.current?.kill();
    gsap.set(icon, { rotate: 0 });
    logoTweenRef.current = gsap.to(icon, {
      rotate: 360,
      duration: 0.4,
      ease,
      overwrite: 'auto'
    });
  };

  return (
    <div className="pill-nav-container" style={{ position: 'relative', top: 0, zIndex: 99, ...style }}>
      <nav className={`pill-nav ${className}`} aria-label="Primary">
        <div className="pill-nav-items" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => (
              <li key={item.id} role="none">
                <button
                  role="menuitem"
                  onClick={() => onTabChange(item.id)}
                  className={`pill${activeTab === item.id ? ' is-active' : ''}`}
                  aria-label={item.label}
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
                    <span className="pill-label">{item.label}</span>
                    <span className="pill-label-hover" aria-hidden="true">
                      {item.label}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {onThemeToggle && (
          <button
            className="pill-logo theme-toggle-pill"
            onClick={onThemeToggle}
            aria-label="Toggle Theme"
            onMouseEnter={handleLogoEnter}
            ref={el => {
              logoRef.current = el;
            }}
            style={{ cursor: 'pointer', border: 'none' }}
          >
            <div ref={logoImgRef} className="theme-toggle-icon">
               {isLight ? <Moon size={20} /> : <Sun size={20} />}
            </div>
          </button>
        )}
      </nav>
    </div>
  );
};

export default PillNav;
