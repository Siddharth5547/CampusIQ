import { useEffect, useRef } from 'react';

const CampusGridAnimation = ({ className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      initNodes();
    };

    window.addEventListener('resize', handleResize);

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse position
    let mouse = { x: -1000, y: -1000, radius: 120 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Nodes representing campus infrastructure points
    let nodes = [];
    const nodeCount = Math.min(24, Math.floor((width * height) / 32000) || 16);

    const initNodes = () => {
      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: 2.2 + Math.random() * 2,
          pulseTimer: Math.random() * Math.PI * 2,
          isPalmAccent: i % 3 === 0
        });
      }
    };

    initNodes();

    // Pulse waves array in Dusty Taupe #9F8170
    let pulses = [
      { x: width * 0.25, y: height * 0.35, r: 0, maxR: 95, alpha: 0.16 },
      { x: width * 0.75, y: height * 0.65, r: 30, maxR: 115, alpha: 0.14 }
    ];

    let lastTime = performance.now();

    const render = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid lines in Warm Border #DEDAD3 (10% opacity)
      const gridSize = 48;
      ctx.strokeStyle = '#9F8170';
      ctx.lineWidth = 0.6;
      ctx.globalAlpha = 0.07;

      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Update and draw expanding Campus Pulses in Dusty Taupe #9F8170
      pulses.forEach((pulse) => {
        if (!prefersReducedMotion) {
          pulse.r += 24 * delta;
          if (pulse.r > pulse.maxR) {
            pulse.r = 0;
          }
        }
        const currentAlpha = Math.max(0, pulse.alpha * (1 - pulse.r / pulse.maxR));

        ctx.strokeStyle = '#9F8170';
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.r, 0, Math.PI * 2);
        ctx.stroke();

        // Central hub point with Charcoal Brown #3B3C36
        ctx.fillStyle = '#3B3C36';
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and connect nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;
          node.pulseTimer += delta * 1.5;

          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
        }

        // Mouse proximity factor
        const dxMouse = mouse.x - node.x;
        const dyMouse = mouse.y - node.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        const mouseFactor = distMouse < mouse.radius ? (1 - distMouse / mouse.radius) * 0.12 : 0;

        // Draw connections between nearby nodes with Dusty Taupe #9F8170 (6-10% opacity)
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const lineAlpha = (1 - dist / 140) * 0.09 + mouseFactor;
            ctx.strokeStyle = '#9F8170';
            ctx.lineWidth = 0.8;
            ctx.globalAlpha = Math.min(0.18, lineAlpha);
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        // Draw node point with Dusty Taupe / Palm Leaf Green
        const pulseAlpha = 0.08 + Math.sin(node.pulseTimer) * 0.04 + mouseFactor;
        ctx.fillStyle = node.isPalmAccent ? '#8A9A5B' : '#9F8170';
        ctx.globalAlpha = Math.min(0.28, pulseAlpha);
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
};

export default CampusGridAnimation;
