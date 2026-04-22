'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@brif/ui';
import { uploadAndTranscribe } from '@/lib/actions/meetings';

const ACCEPTED =
  '.mp3,.m4a,.wav,.mp4,.webm,.ogg,audio/*,video/mp4,video/webm';

type Stage = 'idle' | 'uploading' | 'done' | 'error';

export function UploadAudio({ projectId }: { projectId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setStage('uploading');
    setFileName(file.name);

    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('audio', file);

    try {
      const result = await uploadAndTranscribe(formData);

      if (!result.success) {
        setStage('error');
        setError(result.error);
        return;
      }

      setStage('done');
      router.push(`/projetos/${projectId}/reuniao/${result.meetingId}`);
      router.refresh();
    } catch (err) {
      setStage('error');
      setError(err instanceof Error ? err.message : 'Erro no upload');
    }
  }

  const busy = stage === 'uploading';

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <Button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        size="lg"
      >
        {stage === 'idle' && '🎙️  Enviar áudio da reunião'}
        {stage === 'uploading' && 'Enviando + transcrevendo…'}
        {stage === 'done' && 'Concluído ✓'}
        {stage === 'error' && 'Tentar novamente'}
      </Button>

      {stage === 'uploading' && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Enviando <code className="text-xs">{fileName}</code> e transcrevendo com Whisper.
          </p>
          <p className="text-xs text-muted-foreground">
            Pode levar de 20 a 120 segundos. Não feche a aba.
          </p>
        </div>
      )}

      {error && (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-3"
          role="alert"
        >
          <p className="text-sm font-medium text-destructive">
            Não foi possível processar o áudio
          </p>
          <p className="mt-1 text-xs text-destructive/80">{error}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Dica: se gravou no celular, tente exportar como MP3 ou enviar o
            arquivo original do app.
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Formatos aceitos: MP3, M4A, WAV, MP4, WebM · Máx. 100 MB
      </p>
    </div>
  );
}
