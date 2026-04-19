'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Textarea } from '@brif/ui';
import { saveTranscription } from '@/lib/actions/meetings';
import { generateBriefing } from '@/lib/actions/briefings';

export function TranscriptionEditor({
  projectId,
  meetingId,
  initialText,
  hasBriefing,
}: {
  projectId: string;
  meetingId: string;
  initialText: string;
  hasBriefing: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState(initialText);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [generating, startGenerating] = useTransition();

  function handleSave() {
    setSaved(false);
    setError(null);
    startTransition(async () => {
      await saveTranscription(meetingId, text);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  function handleGenerate() {
    setError(null);
    startGenerating(async () => {
      // Salva transcrição antes de gerar, caso o usuário tenha editado
      if (text !== initialText) {
        await saveTranscription(meetingId, text);
      }
      const result = await generateBriefing(meetingId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/projetos/${projectId}/reuniao/${meetingId}/briefing`);
      router.refresh();
    });
  }

  const dirty = text !== initialText;
  const busy = pending || generating;

  return (
    <div className="space-y-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[320px] font-mono text-sm leading-relaxed"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleSave} disabled={busy || !dirty} variant="outline">
          {pending ? 'Salvando…' : 'Salvar transcrição'}
        </Button>
        <Button onClick={handleGenerate} disabled={busy}>
          {generating
            ? 'Gerando com Claude…'
            : hasBriefing
              ? 'Regenerar briefing com IA'
              : '✨ Gerar briefing com IA'}
        </Button>
        {hasBriefing && (
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/projetos/${projectId}/reuniao/${meetingId}/briefing`)
            }
            disabled={busy}
          >
            Ver briefing →
          </Button>
        )}
        {saved && <span className="text-sm text-muted-foreground">Salvo ✓</span>}
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
