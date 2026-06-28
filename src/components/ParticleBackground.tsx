"use client";

import React, { useEffect, useRef } from "react";
import "../styles/particles.css";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  depth: number;
  color: string;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Mouse interaction coordinates
    const mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 130, // Repel radius
    };

    // Color choices representing standard gold (#f5a300), amber, and copper highlights
    const colors = [
      "rgba(245, 163, 0, ",  // Gold
      "rgba(251, 191, 36, ", // Amber-400
      "rgba(217, 119, 6, ",  // Amber-600
      "rgba(245, 158, 11, ", // Warm orange-gold
    ];

    // High-DPI screen adjustments
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      initParticles();
    };

    // Initialize particles array based on screen dimensions
    const initParticles = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Adapt particle count to width to optimize mobile processing
      const particleCount = width < 768 ? 30 : 75;
      particles = [];

      for (let i = 0; i < particleCount; i++) {
        const depth = 0.5 + Math.random() * 1.0; // Parallax scale multiplier
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          // Extremely slow velocities to match the 20-30% intensity rule
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          size: 1.0 + Math.random() * 2.2,
          alpha: 0.12 + Math.random() * 0.28,
          depth: depth,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    // Event listener registration
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
      }
    };

    const handleTouchEnd = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    // Initial setup
    resizeCanvas();

    // Main animation loop
    const animate = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw connections lines first to overlay dots above them
      const maxDistance = 95;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            // Stronger connection opacity when nodes are closer
            const lineAlpha = (1 - dist / maxDistance) * 0.08 * Math.min(p1.alpha, p2.alpha);
            ctx.strokeStyle = `rgba(245, 163, 0, ${lineAlpha})`;
            ctx.lineWidth = 0.55;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 2. Draw and update particle nodes
      particles.forEach((p) => {
        // Move particle by base velocity scaled by parallax depth
        p.x += p.vx * p.depth;
        p.y += p.vy * p.depth;

        // Slow wave fluid motion (idle simulation)
        p.x += Math.sin(time * 0.00085 + p.y * 0.02) * 0.04;
        p.y += Math.cos(time * 0.00085 + p.x * 0.02) * 0.04;

        // Repel mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            // Push calculation (stronger force near center)
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            const repelStrength = 1.35 * p.depth;
            
            p.x += Math.cos(angle) * force * repelStrength;
            p.y += Math.sin(angle) * force * repelStrength;
          }
        }

        // Screen boundary wrapping
        const buffer = 15;
        if (p.x < -buffer) p.x = width + buffer;
        if (p.x > width + buffer) p.x = -buffer;
        if (p.y < -buffer) p.y = height + buffer;
        if (p.y > height + buffer) p.y = -buffer;

        // Draw particle dot
        ctx.beginPath();
        // Dot sizes are proportional to depth (farther is smaller)
        ctx.arc(p.x, p.y, p.size * p.depth, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // Begin looping
    animationFrameId = requestAnimationFrame(animate);

    // Garbage collection on component unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <div className="particles-container">
      <canvas ref={canvasRef} id="particle-canvas" />
    </div>
  );
}
