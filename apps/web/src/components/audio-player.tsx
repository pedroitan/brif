'use client';

import { useEffect, useRef, useState } from 'react';

type AudioPlayerProps = {
  src: string;
  fileName?: string;
};

// Alturas pré-computadas das barras da waveform (determinísticas para SSR-safe).
const WAVEFORM_HEIGHTS = [
  40, 70, 55, 85, 45, 90, 60, 35, 75, 50, 80, 45, 65, 90, 40, 55, 75, 30, 60,
  85, 50, 70, 45, 60, 80, 35, 55, 70, 40, 85, 60, 45, 75, 30, 65, 50, 90, 55,
  40, 70,
];

/**
 * Player de áudio BRIF: fundo navy, botão play teal, waveform visual,
 * tempo monoespaçado. Mirror do componente .audio-player do wireframe.
 */
export function AudioPlayer({ src, fileName }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onTime = () => setCurrentTime(a.currentTime);
    const onDuration = () => setDuration(a.duration || 0);
    const onEnded = () => setPlaying(false);

    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onDuration);
    a.addEventListener('durationchange', onDuration);
    a.addEventListener('ended', onEnded);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onDuration);
      a.removeEventListener('durationchange', onDuration);
      a.removeEventListener('ended', onEnded);
    };
  }, []);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      void a.play();
      setPlaying(true);
    }
  }

  function seekToBar(index: number) {
    const a = audioRef.current;
    if (!a || !duration) return;
    const pct = (index + 0.5) / WAVEFORM_HEIGHTS.length;
    a.currentTime = duration * pct;
  }

  const progress = duration > 0 ? currentTime / duration : 0;
  const playedUntil = Math.floor(progress * WAVEFORM_HEIGHTS.length);

  return (
    <div className="flex items-center gap-3 rounded-lg bg-brif-navy px-4 py-3">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden">
        Seu navegador não suporta áudio HTML5.
      </audio>

      {/* Play button */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pausar' : 'Tocar'}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brif-teal text-white transition-colors hover:bg-brif-teal-d"
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="2" y="1.5" width="2.5" height="9" rx="0.5" />
            <rect x="7.5" y="1.5" width="2.5" height="9" rx="0.5" />
          </svg>
        ) : (
          <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
            <path d="M1 1l10 6-10 6V1z" />
          </svg>
        )}
      </button>

      {/* Waveform */}
      <div className="flex h-7 flex-1 items-center gap-[2px]">
        {WAVEFORM_HEIGHTS.map((h, i) => {
          const played = i < playedUntil;
          return (
            <button
              key={i}
              type="button"
              onClick={() => seekToBar(i)}
              aria-label={`Ir para ${Math.round((i / WAVEFORM_HEIGHTS.length) * 100)}%`}
              className="flex-1 cursor-pointer rounded-[1px] transition-colors"
              style={{
                height: `${h}%`,
                backgroundColor: played
                  ? 'var(--brif-teal)'
                  : 'rgba(255,255,255,0.15)',
              }}
            />
          );
        })}
      </div>

      {/* Tempo */}
      <div className="flex-shrink-0 font-mono text-[11px] text-white/50">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      {fileName && (
        <div
          className="ml-2 hidden max-w-[180px] truncate font-mono text-[10px] text-white/30 md:block"
          title={fileName}
        >
          {fileName}
        </div>
      )}
    </div>
  );
}

function formatTime(secs: number): string {
  if (!Number.isFinite(secs) || secs < 0) return '--:--';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
