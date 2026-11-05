import React, {useEffect, useId, useState} from 'react';
import {animate, motion, useMotionValue, useTransform} from 'motion/react';

// Distance from the reveal origin to the farthest point of the sphere.
const coverRadius = Math.hypot(68, 68) + 112;

// Geometric sun/moon study: one object and a quiet base, without orbiting labels.
export function RoutineScene({period}) {
  const id = useId().replaceAll(':', '');
  const night = period === 'noite';
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const revealRadius = useMotionValue(night ? coverRadius : 0);
  const sunScale = useTransform(revealRadius, [0, coverRadius], [1, .7]);
  const sunRotate = useTransform(revealRadius, [0, coverRadius], [0, -35]);
  const moonScale = useTransform(revealRadius, [0, coverRadius], [.7, 1]);
  const moonRotate = useTransform(revealRadius, [0, coverRadius], [25, 0]);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (reduced) {revealRadius.set(night ? coverRadius : 0); return;}
    const control = animate(revealRadius, night ? coverRadius : 0, {
      duration: .68,
      // Returning to daylight starts immediately; the night entrance keeps its approved timing.
      ease: night ? [.65, 0, .25, 1] : [.22, 1, .36, 1]
    });
    return () => control.stop();
  }, [night, reduced, revealRadius]);
  return <div className={`routine-scene ${night ? 'is-night' : 'is-day'}`}>
    <svg viewBox="0 0 520 360" role="img" aria-label={night ? 'Lua clara sobre uma esfera azul, representando o descanso da noite.' : 'Sol azul sobre uma esfera clara, representando o movimento do dia.'}>
      <defs>
        <radialGradient id={`${id}-day`} cx="33%" cy="20%" r="86%"><stop stopColor="#ffffff"/><stop offset=".52" stopColor="#f1f5ff"/><stop offset=".85" stopColor="#dbe4ff"/><stop offset="1" stopColor="#bdccf5"/></radialGradient>
        <radialGradient id={`${id}-night`} cx="30%" cy="20%" r="90%"><stop stopColor="#5877e5"/><stop offset=".5" stopColor="#2f50cb"/><stop offset="1" stopColor="#172970"/></radialGradient>
        <linearGradient id={`${id}-base`} x1="0" x2="0" y1="0" y2="1"><stop stopColor="#edf2ff"/><stop offset="1" stopColor="#dce5f9"/></linearGradient>
        <radialGradient id={`${id}-shadow`}><stop stopColor="#25365c" stopOpacity=".17"/><stop offset="1" stopColor="#25365c" stopOpacity="0"/></radialGradient>
        <clipPath id={`${id}-surface-reveal`}><motion.circle cx="192" cy="91" r={revealRadius}/></clipPath>
      </defs>
      <ellipse cx="260" cy="310" rx="165" ry="26" fill={`url(#${id}-shadow)`}/>
      <path d="M115 290v9c0 16 65 28 145 28s145-12 145-28v-9" fill={`url(#${id}-base)`}/>
      <ellipse cx="260" cy="290" rx="145" ry="27" fill="#edf2fc"/>
      <ellipse cx="260" cy="290" rx="145" ry="27" fill="none" stroke="#ffffff" strokeWidth="1.5"/>
      <ellipse cx="260" cy="285" rx="89" ry="14" fill={`url(#${id}-shadow)`}/>
      <circle cx="260" cy="159" r="112" fill={`url(#${id}-day)`}/>
      {/* The sun belongs to the light surface, underneath the blue reveal. */}
      <motion.g className="routine-sun" style={{transformOrigin: '260px 159px', scale: sunScale, rotate: sunRotate}}>
        <circle cx="260" cy="159" r="37" fill="none" stroke="#3f5fcb" strokeWidth="5"/>
        {Array.from({length: 8}, (_, n) => <path key={n} d="M260 94v-12" stroke="#3f5fcb" strokeWidth="5" strokeLinecap="round" transform={`rotate(${n * 45} 260 159)`}/>)}
      </motion.g>
      {/* The moon leaves with its surface, so the blue sphere never loses its symbol. */}
      <g className="routine-night-layer" clipPath={`url(#${id}-surface-reveal)`}>
      <circle className="routine-night-surface" cx="260" cy="159" r="112" fill={`url(#${id}-night)`}/>
      <motion.g className="routine-moon" style={{transformOrigin: '260px 159px', scale: moonScale, rotate: moonRotate}}>
        <path d="M277 105a57 57 0 1 0 38 87 51 51 0 0 1-38-87Z" fill="#f3f6ff"/>
        <path d="M309 109v17m-8-8.5h16" fill="none" stroke="#e8efff" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="325" cy="145" r="2.5" fill="#e8efff"/>
      </motion.g>
      </g>
      <path d="M176 114a102 102 0 0 1 82-56" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </div>;
}
