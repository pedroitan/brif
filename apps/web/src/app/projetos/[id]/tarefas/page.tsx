import { KanbanBoard } from '@/components/kanban-board';

const mockTasks = [
  // A fazer
  {
    id: '1',
    title: 'Moodboard — linha sustentável',
    description: 'Referências visuais para o conceito de sustentabilidade e embalagem reciclável.',
    tag: 'Criação',
    priority: 'MEDIUM' as const,
    dueDate: new Date('2025-11-18'),
    assigneeName: 'Designer',
    assigneeInitials: 'DS',
    assigneeColor: '#E09B2A',
    fileCount: 0,
    status: 'TODO' as const,
  },
  {
    id: '2',
    title: 'Estudo de viabilidade — ativações',
    description: 'Levantar fornecedores e custos para as ativações presenciais dentro do budget de R$100k.',
    tag: 'Estratégia',
    priority: 'MEDIUM' as const,
    dueDate: new Date('2025-11-22'),
    assigneeName: 'Produtor',
    assigneeInitials: 'PE',
    assigneeColor: '#8B5CF6',
    fileCount: 2,
    status: 'TODO' as const,
  },
  {
    id: '3',
    title: 'Planilha orçamentária consolidada',
    description: 'Compilar todos os itens de custo por categoria.',
    tag: 'Financeiro',
    priority: 'MEDIUM' as const,
    dueDate: new Date('2025-11-10'),
    assigneeName: 'Financeiro',
    assigneeInitials: 'FN',
    assigneeColor: '#DC3545',
    fileCount: 0,
    status: 'TODO' as const,
  },
  // Em progresso
  {
    id: '4',
    title: 'Conceito criativo — Campanha',
    description: 'Proposta inicial de conceito e tagline para aprovação interna antes da apresentação.',
    tag: 'Criação',
    priority: 'MEDIUM' as const,
    dueDate: new Date('2025-11-15'),
    assigneeName: 'Planner + Designer',
    assigneeInitials: 'PL',
    assigneeColor: '#0D9E78',
    fileCount: 3,
    status: 'IN_PROGRESS' as const,
  },
  {
    id: '5',
    title: 'Estrutura da proposta visual',
    description: 'Montar estrutura de seções para geração da proposta via IA no BRIF.',
    tag: 'Deck',
    priority: 'MEDIUM' as const,
    dueDate: new Date('2025-11-16'),
    assigneeName: 'Planner',
    assigneeInitials: 'PL',
    assigneeColor: '#0D9E78',
    fileCount: 1,
    status: 'IN_PROGRESS' as const,
  },
  // Em revisão
  {
    id: '6',
    title: 'Peças gráficas mockup — digital',
    description: 'Feed, stories e banner — aguardando aprovação do gerente para envio ao cliente.',
    tag: 'Urgente',
    priority: 'URGENT' as const,
    dueDate: new Date(),
    assigneeName: 'Designer',
    assigneeInitials: 'DS',
    assigneeColor: '#E09B2A',
    fileCount: 8,
    status: 'REVIEW' as const,
  },
  // Concluído
  {
    id: '7',
    title: 'Transcrição e consolidação do briefing',
    tag: 'Briefing',
    priority: 'MEDIUM' as const,
    dueDate: new Date('2025-11-10'),
    assigneeName: 'Planner',
    assigneeInitials: 'PL',
    assigneeColor: '#0D9E78',
    fileCount: 0,
    status: 'DONE' as const,
  },
  {
    id: '8',
    title: 'Kick-off interno e alinhamento de equipe',
    tag: 'Setup',
    priority: 'LOW' as const,
    dueDate: new Date('2025-11-08'),
    assigneeName: 'Gerente',
    assigneeInitials: 'GP',
    assigneeColor: '#152238',
    fileCount: 0,
    status: 'DONE' as const,
  },
];

export default function TarefasPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Kanban de Tarefas</h1>
          <p className="text-sm text-gray-600">Gerencie as tarefas do projeto</p>
        </div>
        <button className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 md:self-auto">
          + Nova tarefa
        </button>
      </div>

      <KanbanBoard tasks={mockTasks} />
    </div>
  );
}
