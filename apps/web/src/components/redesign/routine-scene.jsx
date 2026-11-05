"use client";
import { redesignCopy } from "@/content/site";
import React, { useEffect, useId, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

// Distance from the reveal origin to the farthest point of the sphere.
const coverRadius = Math.hypot(68, 68) + 112;

// Geometric sun/moon study: one object and a quiet base, without orbiting labels.
export function RoutineScene({ period }) {
  const id = useId().replaceAll(":", "");
  const night = period === "noite";
  const [reduced, setReduced] = useState(false);
  const revealRadius = useMotionValue(night ? coverRadius : 0);
  const sunScale = useTransform(revealRadius, [0, coverRadius], [1, 0.7]);
  const sunRotate = useTransform(revealRadius, [0, coverRadius], [0, -35]);
  const moonScale = useTransform(revealRadius, [0, coverRadius], [0.7, 1]);
  const moonRotate = useTransform(revealRadius, [0, coverRadius], [25, 0]);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (reduced) {
      revealRadius.set(night ? coverRadius : 0);
      return;
    }
    const control = animate(revealRadius, night ? coverRadius : 0, {
      duration: 0.68,
      // Returning to daylight starts immediately; the night entrance keeps its approved timing.
      ease: night ? [0.65, 0, 0.25, 1] : [0.22, 1, 0.36, 1],
    });
    return () => control.stop();
  }, [night, reduced, revealRadius]);
  return (
    <div className={`routine-scene ${night ? "is-night" : "is-day"}`}>
      <svg
        viewBox="0 0 520 360"
        role="img"
        aria-label={
          night
            ? redesignCopy.lua_clara_sobre_uma_esfera_azul_representando_o_descanso_da_
            : redesignCopy.sol_azul_sobre_uma_esfera_clara_representando_o_movimento_do
        }
      >
        <defs>
          <radialGradient id={`${id}-day`} cx="33%" cy="20%" r="86%">
            <stop stopColor={"var(--ds-primary-ink)"} />
            <stop offset=".52" stopColor={"var(--ds-art-f1f5ff)"} />
            <stop offset=".85" stopColor={"var(--ds-art-dbe4ff)"} />
            <stop offset="1" stopColor={"var(--ds-art-bdccf5)"} />
          </radialGradient>
          <radialGradient id={`${id}-night`} cx="30%" cy="20%" r="90%">
            <stop stopColor={"var(--ds-art-5877e5)"} />
            <stop offset=".5" stopColor={"var(--ds-art-2f50cb)"} />
            <stop offset="1" stopColor={"var(--ds-art-172970)"} />
          </radialGradient>
          <linearGradient id={`${id}-base`} x1="0" x2="0" y1="0" y2="1">
            <stop stopColor={"var(--ds-art-edf2ff)"} />
            <stop offset="1" stopColor={"var(--ds-art-dce5f9)"} />
          </linearGradient>
          <radialGradient id={`${id}-shadow`}>
            <stop stopColor={"var(--ds-art-25365c)"} stopOpacity=".17" />
            <stop
              offset="1"
              stopColor={"var(--ds-art-25365c)"}
              stopOpacity="0"
            />
          </radialGradient>
          <clipPath id={`${id}-surface-reveal`}>
            <motion.circle cx="192" cy="91" r={revealRadius} />
          </clipPath>
        </defs>
        <ellipse
          cx="260"
          cy="310"
          rx="165"
          ry="26"
          fill={`url(#${id}-shadow)`}
        />
        <path
          d="M115 290v9c0 16 65 28 145 28s145-12 145-28v-9"
          fill={`url(#${id}-base)`}
        />
        <ellipse
          cx="260"
          cy="290"
          rx="145"
          ry="27"
          fill={"var(--ds-art-edf2fc)"}
        />
        <ellipse
          cx="260"
          cy="290"
          rx="145"
          ry="27"
          fill="none"
          stroke={"var(--ds-primary-ink)"}
          strokeWidth="1.5"
        />
        <ellipse
          cx="260"
          cy="285"
          rx="89"
          ry="14"
          fill={`url(#${id}-shadow)`}
        />
        <circle cx="260" cy="159" r="112" fill={`url(#${id}-day)`} />
        {/* The sun belongs to the light surface, underneath the blue reveal. */}
        <motion.g
          className="routine-sun"
          style={{
            transformOrigin: "260px 159px",
            scale: sunScale,
            rotate: sunRotate,
          }}
        >
          <circle
            cx="260"
            cy="159"
            r="37"
            fill="none"
            stroke={"var(--ds-art-3f5fcb)"}
            strokeWidth="5"
          />
          {Array.from({ length: 8 }, (_, n) => (
            <path
              key={n}
              d="M260 94v-12"
              stroke={"var(--ds-art-3f5fcb)"}
              strokeWidth="5"
              strokeLinecap="round"
              transform={`rotate(${n * 45} 260 159)`}
            />
          ))}
        </motion.g>
        {/* The moon leaves with its surface, so the blue sphere never loses its symbol. */}
        <g
          className="routine-night-layer"
          clipPath={`url(#${id}-surface-reveal)`}
        >
          <circle
            className="routine-night-surface"
            cx="260"
            cy="159"
            r="112"
            fill={`url(#${id}-night)`}
          />
          <motion.g
            className="routine-moon"
            style={{
              transformOrigin: "260px 159px",
              scale: moonScale,
              rotate: moonRotate,
            }}
          >
            <path
              d="M277 105a57 57 0 1 0 38 87 51 51 0 0 1-38-87Z"
              fill={"var(--ds-art-f3f6ff)"}
            />
            <path
              d="M309 109v17m-8-8.5h16"
              fill="none"
              stroke={"var(--ds-art-e8efff)"}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="325" cy="145" r="2.5" fill={"var(--ds-art-e8efff)"} />
          </motion.g>
        </g>
        <path
          d="M176 114a102 102 0 0 1 82-56"
          fill="none"
          stroke={"var(--ds-primary-ink)"}
          strokeOpacity=".3"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
