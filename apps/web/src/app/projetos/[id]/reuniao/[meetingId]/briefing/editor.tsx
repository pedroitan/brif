'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { Button, Label, Textarea } from '@brif/ui';
import { saveBriefing, sendBriefingForApproval } from '@/lib/actions/briefings';

function AutoTextarea({
  value,
  onChange,
  id,
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  id: string;
  readOnly?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <Textarea
      ref={ref}
      id={id}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[40px] resize-none overflow-hidden leading-relaxed"
      rows={1}
    />
  );
}

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
}> = [
  {
    key: 'objetivo',
    label: 'Objetivo',
    description: 'Qual o objetivo estratégico do projeto para o cliente.',
  },
  {
    key: 'publicoAlvo',
    label: 'Público-alvo',
    description: 'Perfil demográfico, comportamental e psicográfico.',
  },
  {
    key: 'tomEComunicacao',
    label: 'Tom e comunicação',
    description: 'Personalidade da marca e estilo de comunicação.',
  },
  {
    key: 'entregas',
    label: 'Entregas',
    description: 'Peças, formatos e canais a serem produzidos.',
  },
  {
    key: 'prazos',
    label: 'Prazos',
    description: 'Datas e marcos importantes.',
  },
  {
    key: 'orcamento',
    label: 'Orçamento',
    description: 'Verba disponível ou faixa de investimento.',
  },
  {
    key: 'observacoes',
    label: 'Observações',
    description: 'Referências, restrições, contexto adicional.',
  },
];

export function BriefingEditor({
  briefingId,
  initial,
  approvalUrl: initialApprovalUrl,
  readOnly = false,
}: {
  briefingId: string;
  initial: BriefingFields;
  approvalUrl: string | null;
  readOnly?: boolean;
}) {
  const [values, setValues] = useState<BriefingFields>(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(initialApprovalUrl);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const [sending, startSending] = useTransition();

  function handleSend() {
    setError(null);
    startSending(async () => {
      const result = await sendBriefingForApproval(briefingId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setApprovalUrl(result.url);
    });
  }

  async function handleCopy() {
    if (!approvalUrl) return;
    await navigator.clipboard.writeText(approvalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
          <AutoTextarea
            id={f.key}
            value={values[f.key]}
            onChange={(v) => update(f.key, v)}
            readOnly={readOnly}
          />
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3 border-t pt-4">
        <Button
          onClick={handleSave}
          disabled={readOnly || pending || sending || !dirty}
          variant="outline"
        >
          {pending ? 'Salvando…' : 'Salvar alterações'}
        </Button>
        <Button onClick={handleSend} disabled={readOnly || sending || pending || dirty}>
          {sending
            ? 'Gerando link…'
            : approvalUrl
              ? 'Regenerar link de aprovação'
              : 'Enviar para aprovação'}
        </Button>
        {saved && <span className="text-sm text-muted-foreground">Salvo ✓</span>}
        {dirty && !pending && (
          <span className="text-xs text-muted-foreground">
            Salve antes de enviar.
          </span>
        )}
      </div>

      {approvalUrl && (
        <div className="rounded-lg border bg-accent/20 p-4 space-y-2">
          <p className="text-sm font-semibold">Link de aprovação do cliente</p>
          <p className="text-xs text-muted-foreground">
            Envie este link para o cliente aprovar ou solicitar ajustes. Válido por 30 dias.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="flex-1 min-w-[240px] rounded bg-background px-2 py-1 text-xs break-all">
              {approvalUrl}
            </code>
            <Button size="sm" variant="outline" onClick={handleCopy}>
              {copied ? 'Copiado ✓' : 'Copiar'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(approvalUrl, '_blank')}
            >
              Abrir ↗
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
