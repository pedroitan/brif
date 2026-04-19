'use client';

import { useState, useTransition } from 'react';
import { Button, Label, Textarea } from '@brif/ui';
import { saveBriefing } from '@/lib/actions/briefings';

type BriefingFields = {
  objetivo: string;
  publicoAlvo: string;
  tomEComunicacao: string;
  entregas: string;
  prazos: string;
  orcamento: string;
  observacoes: string;
};

const FIELDS: Array<{
  key: keyof BriefingFields;
  label: string;
  description: string;
  minHeight: number;
}> = [
  {
    key: 'objetivo',
    label: 'Objetivo',
    description: 'Qual o objetivo estratégico do projeto para o cliente.',
    minHeight: 100,
  },
  {
    key: 'publicoAlvo',
    label: 'Público-alvo',
    description: 'Perfil demográfico, comportamental e psicográfico.',
    minHeight: 100,
  },
  {
    key: 'tomEComunicacao',
    label: 'Tom e comunicação',
    description: 'Personalidade da marca e estilo de comunicação.',
    minHeight: 100,
  },
  {
    key: 'entregas',
    label: 'Entregas',
    description: 'Peças, formatos e canais a serem produzidos.',
    minHeight: 120,
  },
  {
    key: 'prazos',
    label: 'Prazos',
    description: 'Datas e marcos importantes.',
    minHeight: 80,
  },
  {
    key: 'orcamento',
    label: 'Orçamento',
    description: 'Verba disponível ou faixa de investimento.',
    minHeight: 80,
  },
  {
    key: 'observacoes',
    label: 'Observações',
    description: 'Referências, restrições, contexto adicional.',
    minHeight: 100,
  },
];

export function BriefingEditor({
  briefingId,
  initial,
}: {
  briefingId: string;
  initial: BriefingFields;
}) {
  const [values, setValues] = useState<BriefingFields>(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof BriefingFields>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setSaved(false);
    setError(null);
    startTransition(async () => {
      try {
        await saveBriefing(briefingId, {
          objetivo: values.objetivo,
          publicoAlvo: values.publicoAlvo,
          tomEComunicacao: values.tomEComunicacao,
          entregas: values.entregas,
          prazos: values.prazos,
          orcamento: values.orcamento,
          observacoes: values.observacoes.trim() || null,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar');
      }
    });
  }

  const dirty = FIELDS.some(
    (f) => values[f.key] !== initial[f.key],
  );

  return (
    <div className="space-y-6">
      {FIELDS.map((f) => (
        <div key={f.key} className="space-y-2">
          <Label htmlFor={f.key} className="text-base font-semibold">
            {f.label}
          </Label>
          <p className="text-xs text-muted-foreground">{f.description}</p>
          <Textarea
            id={f.key}
            value={values[f.key]}
            onChange={(e) => update(f.key, e.target.value)}
            style={{ minHeight: `${f.minHeight}px` }}
            className="leading-relaxed"
          />
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3 border-t pt-4">
        <Button onClick={handleSave} disabled={pending || !dirty}>
          {pending ? 'Salvando…' : 'Salvar alterações'}
        </Button>
        <Button variant="outline" disabled>
          Enviar para aprovação (Sprint 5)
        </Button>
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
