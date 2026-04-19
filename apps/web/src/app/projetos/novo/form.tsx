'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button, Input, Label } from '@brif/ui';
import { createProject, type CreateProjectState } from '@/lib/actions/projetos';

const initialState: CreateProjectState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Criando…' : 'Criar projeto'}
    </Button>
  );
}

export function NewProjectForm() {
  const [state, formAction] = useFormState(createProject, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do projeto</Label>
        <Input
          id="name"
          name="name"
          placeholder="Ex.: Campanha Verão 2026"
          required
          minLength={3}
        />
        {state.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientName">Nome do cliente</Label>
        <Input
          id="clientName"
          name="clientName"
          placeholder="Ex.: Acme Refrigerantes"
          required
          minLength={2}
        />
        {state.errors?.clientName && (
          <p className="text-sm text-destructive">{state.errors.clientName[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientEmail">E-mail do cliente</Label>
        <Input
          id="clientEmail"
          name="clientEmail"
          type="email"
          placeholder="contato@acme.com.br"
          required
        />
        <p className="text-xs text-muted-foreground">
          Este e-mail receberá o link para aprovar o briefing.
        </p>
        {state.errors?.clientEmail && (
          <p className="text-sm text-destructive">{state.errors.clientEmail[0]}</p>
        )}
      </div>

      {state.errors?._form && (
        <p className="text-sm text-destructive" role="alert">
          {state.errors._form[0]}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
