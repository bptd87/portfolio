import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface StardustEffectProps {
  /** Number of particles (default: 30) */
  particleCount?: number;
  /** Particle color in light mode (default: theatrical gold) */
  lightColor?: string;
  /** Particle color in dark mode (default: brighter gold) */
  darkColor?: string;
  /** Intensity of effect (0-1, default: 0.5) */
  intensity?: number;
  /** Enable interactive mode (particles follow mouse) */
  interactive?: boolean;
  /** CSS class name */
  className?: string;
}

export function StardustEffect({
  particleCount = 30,
  lightColor = 'rgba(212, 175, 55, 0.6)',
  darkColor = 'rgba(232, 195, 75, 0.7)',
  intensity = 0.5,
  interactive = false,
  className = ''
}: StardustEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateCanvasSize();

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = Array.from({ length: particleCount }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3 * intensity,
        vy: (Math.random() - 0.5) * 0.3 * intensity,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        life: Math.random() * 100,
        maxLife: Math.random() * 100 + 100
      }));
    };
    initParticles();

    // Check for dark mode
    const isDarkMode = () => document.documentElement.classList.contains('dark');

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      const currentColor = isDarkMode() ? darkColor : lightColor;

      particlesRef.current.forEach((particle, index) => {
        // Update particle life
        particle.life += 1;
        
        // Reset particle if it dies
        if (particle.life >= particle.maxLife) {
          particle.x = Math.random() * canvas.offsetWidth;
          particle.y = Math.random() * canvas.offsetHeight;
          particle.life = 0;
          particle.maxLife = Math.random() * 100 + 100;
        }

        // Interactive mode: attract to mouse
        if (interactive && mouseRef.current.x > 0) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            particle.vx += (dx / distance) * 0.02 * intensity;
            particle.vy += (dy / distance) * 0.02 * intensity;
          }
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Gentle drift
        particle.vy += 0.01 * intensity;
        
        // Add slight sparkle effect
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.offsetWidth;
        if (particle.x > canvas.offsetWidth) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.offsetHeight;
        if (particle.y > canvas.offsetHeight) particle.y = 0;

        // Fade in/out based on life
        const lifeFactor = particle.life / particle.maxLife;
        const fadeOpacity = lifeFactor < 0.5 
          ? lifeFactor * 2 
          : (1 - lifeFactor) * 2;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        // Create gradient for glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        );
        
        gradient.addColorStop(0, currentColor.replace(/[\d.]+\)$/g, `${particle.opacity * fadeOpacity})`));
        gradient.addColorStop(1, currentColor.replace(/[\d.]+\)$/g, '0)'));
        
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [particleCount, lightColor, darkColor, intensity, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}
    />
  );
}
