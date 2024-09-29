import React, { useEffect, useRef } from "react";

const HelloWave: React.FC = () => {
  const waveRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const wave = waveRef.current;
    let animationFrame: number | null = null;

    const animate = () => {
      let start: number | null = null;
      const duration = 3000; // Total duration for one complete wave (4 repetitions)

      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = (timestamp - start) % duration;
        const t = progress / (duration / 4); // Normalize time for each repetition

        // Calculate rotation based on a sine wave
        const rotation = Math.sin(t * Math.PI * 2) * -25;

        if (wave) {
          wave.style.transform = `rotate(${rotation}deg)`;
        }

        animationFrame = requestAnimationFrame(step);
      };

      animationFrame = requestAnimationFrame(step);
    };

    animate();

    return () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <span ref={waveRef} className="inline-block">
      👋
    </span>
  );
};

export default HelloWave;
