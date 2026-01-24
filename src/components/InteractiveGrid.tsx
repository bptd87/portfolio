import React, { useEffect, useRef } from 'react';

const InteractiveGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    let animationFrameId: number;
    let mouseX = -1000;
    let mouseY = -1000;

    // Grid configuration
    const gridSize = 40;
    const pointColor = '#808080';
    const baseOpacity = 0.15; // Slightly clearer than 0.02 to see the effect, can adjust
    
    // Points array
    interface Point {
      x: number;
      y: number;
      originX: number;
      originY: number;
      vx: number;
      vy: number;
    }
    
    let points: Point[] = [];

    const initPoints = () => {
      points = [];
      const cols = Math.ceil(width / gridSize) + 1;
      const rows = Math.ceil(height / gridSize) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;
          points.push({
            x,
            y,
            originX: x,
            originY: y,
            vx: 0,
            vy: 0
          });
        }
      }
    };

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;
      initPoints();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const update = () => {
      ctx.clearRect(0, 0, width, height);

      // Physics constants
      const mouseRadius = 250; // Larger sphere effect
      const forceFactor = 4;   // Reduced force for subtlety
      const friction = 0.92;   // Higher friction for "dragging" feel
      const ease = 0.02;       // Very slow return for "viscous" feel

      // Draw grid lines
      ctx.beginPath();
      ctx.strokeStyle = `rgba(128, 128, 128, 0.4)`;
      ctx.lineWidth = 1;

      // Update points
      for (const point of points) {
        // Distance to mouse
        const dx = mouseX - point.x;
        const dy = mouseY - point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // "Sphere drag" effect - Gentle push
        let tx = point.originX;
        let ty = point.originY;

        if (dist < mouseRadius) {
          const force = (mouseRadius - dist) / mouseRadius; // 0 to 1
          // Pull towards mouse
          const pullStrength = force * 10; 
          
          // PUSH points AWAY from mouse (repel)
          // To make it look like points are being pushed away
          const angle = Math.atan2(dy, dx);
          // Negative direction to push away
          tx = point.originX - Math.cos(angle) * pullStrength * forceFactor;
          ty = point.originY - Math.sin(angle) * pullStrength * forceFactor;
        }

        // Spring physics
        const ax = (tx - point.x) * ease;
        const ay = (ty - point.y) * ease;

        point.vx += ax;
        point.vy += ay;
        point.vx *= friction;
        point.vy *= friction;

        point.x += point.vx;
        point.y += point.vy;
      }

      // Draw horizontal lines connecting points
      const cols = Math.ceil(width / gridSize) + 1;
      const rows = Math.ceil(height / gridSize) + 1;

      // Draw horizontal connections
      for (let j = 0; j < rows; j++) {
        ctx.beginPath();
        for (let i = 0; i < cols; i++) {
          const idx = i * rows + j;
          if (points[idx]) {
            if (i === 0) ctx.moveTo(points[idx].x, points[idx].y);
            else ctx.lineTo(points[idx].x, points[idx].y);
          }
        }
        ctx.stroke();
      }

      // Draw vertical connections
      for (let i = 0; i < cols; i++) {
        ctx.beginPath();
        for (let j = 0; j < rows; j++) {
          const idx = i * rows + j;
          if (points[idx]) {
            if (j === 0) ctx.moveTo(points[idx].x, points[idx].y);
            else ctx.lineTo(points[idx].x, points[idx].y);
          }
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(update);
    };

    window.addEventListener('resize', resize);
    // Track mouse on window to keep effect active even if mouse is over content
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave); // Optional, maybe we want it to stay last known pos?
    
    resize();
    update();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none">
      <canvas ref={canvasRef} className="opacity-40" />
    </div>
  );
};

export default InteractiveGrid;
