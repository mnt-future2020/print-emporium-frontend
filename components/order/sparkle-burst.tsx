"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  shape: "circle" | "square" | "triangle" | "star";
  rotation: number;
  delay: number;
  duration: number;
}

// Sleek, brand-aligned premium palette (Stripe purple, magenta, ruby, emerald, gold, blue)
const COLORS = [
  "#533afd", // Stripe Purple
  "#ea2261", // Ruby
  "#f96bee", // Magenta
  "#10b981", // Emerald Green
  "#f59e0b", // Gold/Amber
  "#3b82f6", // Vibrant Blue
];

export function SparkleBurst({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);
  useEffect(() => {
    if (!active || prefersReducedMotion) {
      if (particles.length > 0) {
        const t = setTimeout(() => {
          setParticles([]);
        }, 0);
        return () => clearTimeout(t);
      }
      return;
    }

    // Generate 42 beautiful, distinct particles
    const newParticles: Particle[] = Array.from({ length: 42 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2; // Random 360 degree angle
      const distance = 40 + Math.random() * 140; // Spread distance
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = 6 + Math.random() * 12; // Random size in pixels
      const shape = ["circle", "square", "triangle", "star"][
        Math.floor(Math.random() * 4)
      ] as Particle["shape"];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const rotation = Math.random() * 360;
      const delay = Math.random() * 0.15; // Slightly staggered launch
      const duration = 1.0 + Math.random() * 0.6; // Staggered lifespan

      return { id: i, x, y, color, size, shape, rotation, delay, duration };
    });

    const t = setTimeout(() => {
      setParticles(newParticles);
    }, 0);
    return () => clearTimeout(t);
  }, [active, prefersReducedMotion, particles.length]);

  if (!active || prefersReducedMotion || particles.length === 0) return null;

  const starPath =
    "M 0,-1 L 0.2,-0.2 L 1,0 L 0.2,0.2 L 0,1 L -0.2,0.2 L -1,0 L -0.2,-0.2 Z";
  const trianglePath = "M 0,-0.8 L 0.8,0.6 L -0.8,0.6 Z";

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y - 30, // Drift slightly upwards to mimic gravity/float
            scale: [0, 1.2, 0.8, 0],
            opacity: [1, 1, 0.5, 0],
            rotate: p.rotation + 360,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.1, 0.8, 0.25, 1], // Staggered exponential decelerating release
          }}
          className="absolute"
        >
          {p.shape === "circle" && (
            <div
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: "50%",
                boxShadow: `0 0 6px ${p.color}40`,
              }}
            />
          )}
          {p.shape === "square" && (
            <div
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                transform: `rotate(${p.rotation}deg)`,
                borderRadius: "2px",
                boxShadow: `0 0 6px ${p.color}40`,
              }}
            />
          )}
          {p.shape === "triangle" && (
            <svg
              width={p.size}
              height={p.size}
              viewBox="-1 -1 2 2"
              style={{
                fill: p.color,
                filter: `drop-shadow(0 2px 4px ${p.color}30)`,
              }}
            >
              <path d={trianglePath} />
            </svg>
          )}
          {p.shape === "star" && (
            <svg
              width={p.size * 1.4}
              height={p.size * 1.4}
              viewBox="-1 -1 2 2"
              style={{
                fill: p.color,
                filter: `drop-shadow(0 0 4px ${p.color})`,
              }}
            >
              <path d={starPath} />
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  );
}
