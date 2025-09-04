import React, { useState, useRef, useEffect } from 'react'
import { Actions, Action } from '@/components/actions'
import { Volume2Icon, Loader2Icon, RotateCcwIcon } from 'lucide-react'
import AudioSpectrum from './audio-spectrum'

interface GameMessageActionsProps {
  text: string;
}

export default function GameMessageActions({ text }: GameMessageActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const loadAudio = async () => {
    if (isLoading || audioReady) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Setup Web Audio API for spectrum
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audio);
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      setAudioReady(true);
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const restart = () => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
  };

  useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  return (
    <Actions className="-mt-3">
      {!audioReady ? (
        <Action label="Reproducir audio" onClick={loadAudio} disabled={isLoading}>
          {isLoading ? <Loader2Icon className="size-3 animate-spin" /> : <Volume2Icon className="size-3" />}
        </Action>
      ) : (
        <>
          <AudioSpectrum 
            analyser={analyserRef.current} 
            isPlaying={isPlaying} 
            onClick={togglePlayPause}
          />
          <Action label="Reiniciar" onClick={restart}>
            <RotateCcwIcon className="size-3" />
          </Action>
        </>
      )}
    </Actions>
  )
}
