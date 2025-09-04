import React, { useRef, useEffect } from 'react';

interface AudioSpectrumProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  onClick: () => void;
}

export default function AudioSpectrum({ analyser, isPlaying, onClick }: AudioSpectrumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    if (!isPlaying || !analyser) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Draw static line when paused/stopped
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const usedBars = Math.min(bufferLength, 16);
      const barWidth = canvas.width / usedBars;
      const centerY = canvas.height / 2;
      const centerX = canvas.width / 2;
      
      for (let i = 0; i < usedBars; i++) {
        const barHeight = (dataArray[i] / 255) * (canvas.height / 2) * 0.8;
        
        ctx.fillStyle = 'white';
        
        // Mirror bars from center outward
        const distanceFromCenter = Math.floor(i / 2);
        const isLeft = i % 2 === 0;
        
        const x = isLeft 
          ? centerX - (distanceFromCenter + 1) * barWidth
          : centerX + distanceFromCenter * barWidth;
        
        // Bar extending upward
        ctx.fillRect(x, centerY - barHeight, barWidth - 1, barHeight);
        
        // Bar extending downward
        ctx.fillRect(x, centerY, barWidth - 1, barHeight);
      }
      
      // Always draw center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();
      
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, analyser]);

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-16 h-8 bg-muted/10 backdrop-blur-sm rounded-lg cursor-pointer "
    >
      <canvas
        ref={canvasRef}
        width={60}
        height={24}
        className="rounded"
      />
    </button>
  );
}