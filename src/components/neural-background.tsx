"use client";

import { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ox: number;
  oy: number;
  // Para el vagabundeo (idle): cada nodo tiene fase y frecuencia propias
  // para que su órbita alrededor del origen no se sincronice con los demás.
  phaseX: number;
  phaseY: number;
  freqX: number;
  freqY: number;
  amp: number;
};

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const NODE_COUNT = 70;
    const LINK_DIST = 130;
    const MOUSE_DIST = 200;
    const MOUSE_PULL = 0.0015;
    const RETURN_PULL = 0.0025; // resorte suave hacia el target ambiente cuando el mouse no está
    const IDLE_AMP_BASE = 12; // radio base de la órbita ambiente en px
    const IDLE_FREQ_BASE = 0.25; // rad/s aprox

    const nodes: Node[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rafId = 0;

    function resize() {
      if (!canvas || !ctx) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      nodes.length = 0;
      for (let i = 0; i < NODE_COUNT; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        nodes.push({
          x,
          y,
          ox: x,
          oy: y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          freqX: IDLE_FREQ_BASE * (0.7 + Math.random() * 0.6),
          freqY: IDLE_FREQ_BASE * (0.7 + Math.random() * 0.6),
          amp: IDLE_AMP_BASE * (0.6 + Math.random() * 0.8),
        });
      }
    }

    function step() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const t = performance.now() / 1000;

      for (const n of nodes) {
        if (mouse.active) {
          // Atracción suave hacia el mouse
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_DIST * MOUSE_DIST) {
            n.vx += dx * MOUSE_PULL;
            n.vy += dy * MOUSE_PULL;
          }
        } else {
          // Target ambiente: órbita lenta alrededor del origen con fase propia.
          // Así cada nodo se mueve solo y el conjunto respira.
          const targetX = n.ox + Math.sin(t * n.freqX + n.phaseX) * n.amp;
          const targetY = n.oy + Math.cos(t * n.freqY + n.phaseY) * n.amp;
          n.vx += (targetX - n.x) * RETURN_PULL;
          n.vy += (targetY - n.y) * RETURN_PULL;
        }

        n.x += n.vx;
        n.y += n.vy;

        // Fricción: leve siempre, apenas más alta cuando vuelve para amortiguar sin cortar el movimiento
        const friction = mouse.active ? 0.985 : 0.96;
        n.vx *= friction;
        n.vy *= friction;

        // Rebote en bordes
        if (n.x < 0) { n.x = 0; n.vx *= -1; }
        else if (n.x > width) { n.x = width; n.vx *= -1; }
        if (n.y < 0) { n.y = 0; n.vy *= -1; }
        else if (n.y > height) { n.y = height; n.vy *= -1; }
      }

      // Líneas entre nodos cercanos
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const alpha = 0.25 * (1 - Math.sqrt(d2) / LINK_DIST);
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Líneas del mouse a nodos cercanos
      if (mouse.active) {
        for (const n of nodes) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_DIST * MOUSE_DIST) {
            const alpha = 0.6 * (1 - Math.sqrt(d2) / MOUSE_DIST);
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          }
        }
      }

      // Nodos
      for (const n of nodes) {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Halo del mouse
      if (mouse.active) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 40);
        grad.addColorStop(0, "rgba(255,255,255,0.55)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 40, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(step);
    }

    function onMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }

    function onLeave() {
      mouse.active = false;
    }

    resize();
    seed();
    rafId = requestAnimationFrame(step);

    const parent = canvas.parentElement;
    parent?.addEventListener("mousemove", onMove);
    parent?.addEventListener("mouseleave", onLeave);

    const onResize = () => {
      resize();
      seed();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      parent?.removeEventListener("mousemove", onMove);
      parent?.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
