import { ClientHeader } from '@/components/client-header';
import { StatusCard } from '@/components/status-card';
import { ActionCard } from '@/components/action-card';
import { Timeline } from '@/components/timeline';

export default function PortalHome() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader
        agencyName="Nibs Transforma"
        projectName="Campanha Verão 2025"
        clientName="Ana Lima"
        clientCompany="Natura"
        clientInitials="AL"
      />

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Olá, Ana!</h1>
          <p className="text-sm text-gray-600">
            Aqui está o status atualizado do seu projeto. Uma ação aguarda sua revisão.
          </p>
        </div>

        <StatusCard
          title="Status do Projeto"
          phaseTag="Briefing"
          phases={[
            { label: 'Briefing', state: 'done' },
            { label: 'Criação', state: 'active' },
            { label: 'Aprovação', state: 'pending' },
            { label: 'Produção', state: 'pending' },
            { label: 'Entrega', state: 'pending' },
          ]}
          progressPercent={28}
          nextDelivery="Conceito criativo — 15 nov"
        />

        <ActionCard
          banner="✦ Ação necessária — Aprovação de briefing pendente"
          title="Briefing Consolidado — Campanha Verão 2025"
          meta={[
            { label: 'Gerado em', value: '10 nov 2025' },
            { label: 'Revisado por', value: 'Planner + Gerente' },
            { label: 'Versão', value: 'v1.0' },
          ]}
          briefingPreview={[
            { key: 'Objetivo', value: 'Lançamento linha sustentável — embalagem reciclável como centro da comunicação' },
            { key: 'Público-alvo', value: '25–40 anos, consciente ambiental + aspiracional, classes A/B' },
            { key: 'Tom de voz', value: 'Emocional com base informativa. Autêntico, inspirador.' },
            { key: 'Orçamento total', value: 'R$ 280.000' },
            { key: 'Prazo de entrega', value: '20 de dezembro de 2025' },
          ]}
        />

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4 text-sm font-semibold text-gray-900">Histórico do Projeto</div>
          <Timeline
            items={[
              {
                date: '08 nov 2025',
                title: 'Projeto iniciado',
                subtitle: 'Kick-off interno realizado · Equipe alocada',
              },
              {
                date: '10 nov 2025',
                title: 'Reunião de briefing transcrita',
                subtitle: '58 minutos · IA gerou briefing consolidado',
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
