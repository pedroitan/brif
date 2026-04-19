'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Textarea,
} from '@brif/ui';
import { approve, reject } from './actions';

type Mode = 'idle' | 'approving' | 'rejecting';

export function DecisionForm({ token }: { token: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('idle');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      try {
        await approve(token, comment.trim() || undefined);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao registrar decisão');
      }
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await reject(token, comment);
        if (!result.success) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao registrar decisão');
      }
    });
  }

  if (mode === 'idle') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sua decisão</CardTitle>
          <CardDescription>
            Aprove para que a equipe inicie a produção, ou solicite ajustes
            descrevendo o que deve mudar.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button size="lg" onClick={() => setMode('approving')}>
            ✓ Aprovar briefing
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setMode('rejecting')}
          >
            Solicitar ajustes
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'approving' ? 'Aprovar briefing' : 'Solicitar ajustes'}
        </CardTitle>
        <CardDescription>
          {mode === 'approving'
            ? 'Você pode deixar um comentário opcional para a equipe.'
            : 'Descreva com clareza quais pontos precisam ser ajustados.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="comment">
            Comentário {mode === 'approving' ? '(opcional)' : '(obrigatório)'}
          </Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              mode === 'approving'
                ? 'Ex.: Perfeito, podem seguir.'
                : 'Ex.: O orçamento precisa ser revisto; o prazo de entrega está apertado demais para as peças de vídeo.'
            }
            className="min-h-[140px]"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          {mode === 'approving' ? (
            <Button onClick={handleApprove} disabled={pending}>
              {pending ? 'Registrando…' : 'Confirmar aprovação'}
            </Button>
          ) : (
            <Button onClick={handleReject} disabled={pending}>
              {pending ? 'Enviando…' : 'Enviar solicitação de ajustes'}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setMode('idle');
              setComment('');
              setError(null);
            }}
            disabled={pending}
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
