# BRIF — Contexto do Produto
> v3.0 — Decisões de produto consolidadas  
> Referência para desenvolvimento, design e produto. Manter atualizado a cada sprint.

---

## 🎯 O que é o BRIF?

Plataforma **SaaS multi-tenant white label** que sistematiza o fluxo de trabalho completo de agências de publicidade — do primeiro briefing com o cliente até a entrega final e fechamento com fornecedores.

Cada agência que contrata o BRIF opera em seu próprio ambiente isolado, com identidade visual própria configurada pela equipe BRIF no onboarding. O cliente final da agência nunca sabe que existe o BRIF por trás.

A plataforma usa IA (Whisper para transcrição + Claude para linguagem natural) para eliminar trabalho manual repetitivo e centralizar toda a comunicação em um único ambiente.

---

## 🏗️ Arquitetura Multi-Tenant

```
┌─────────────────────────────────────────────────────┐
│              BRIF — Plataforma Central            │
│         admin.brif.app  (equipe BRIF)           │
└──────────┬───────────────┬────────────────┬─────────┘
           │               │                │
   ┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
   │  Agência A   │ │  Agência B  │ │  Agência C  │
   │ agencia-a.   │ │app.agencia- │ │ agencia-c.  │
   │ brif.app   │ │b.com.br     │ │ brif.app  │
   │              │ │ (CNAME)     │ │             │
   │ 🔵 Marca A   │ │ 🟢 Marca B  │ │ 🟠 Marca C  │
   └──────────────┘ └─────────────┘ └─────────────┘
        schema_a         schema_b         schema_c
   ← Isolamento físico de dados por schema PostgreSQL →
```

### Princípios de Isolamento
- Cada tenant tem seu próprio **schema PostgreSQL** — dados nunca se misturam
- **Subdomínio padrão**: `agencia.brif.app` — provisionado pela equipe BRIF
- **Domínio customizado**: `app.minhaagencia.com.br` — CNAME + SSL automático via Cloudflare
- **E-mails transacionais**: saem com nome, logo e domínio da agência — BRIF nunca aparece ao cliente final da agência

---

## 🔧 Modelo de Onboarding — Managed (Assistido pela Equipe BRIF)

> **Decisão de produto**: o setup de cada novo tenant é feito pela equipe BRIF, não pelo cliente. Isso garante consistência, qualidade de configuração e experiência de onboarding premium.

### Processo de Onboarding de um Novo Tenant

```
1. Contrato assinado com a agência
        ↓
2. Equipe BRIF acessa admin.brif.app
        ↓
3. Cria o tenant: slug, subdomínio, plano
        ↓
4. Configura white label:
   — Upload de logo (variações: principal, ícone, versão escura)
   — Paleta de cores (primária, secundária, texto, fundo)
   — Fontes (Google Fonts ou upload)
   — Configuração do domínio customizado (CNAME)
        ↓
5. Configura templates de proposta com identidade da agência
        ↓
6. Configura e-mail transacional (subdomain auth via Resend)
        ↓
7. Cria os primeiros usuários internos da agência (admin + GP)
        ↓
8. Entrega: link de acesso + sessão de treinamento
```

**SLA de entrega**: a definir — recomendação: até 5 dias úteis após recebimento dos assets.

### Painel Admin (admin.brif.app) — Equipe BRIF

O painel admin é a ferramenta interna da equipe BRIF para gerenciar todos os tenants:

| Função | Descrição |
|---|---|
| Criar tenant | Slug, subdomínio, plano, dados da agência |
| Configurar white label | Logo, cores, fontes, domínio customizado |
| Configurar templates | Templates de proposta com marca da agência |
| Gerenciar usuários | Criar perfis iniciais, resetar senhas, ajustar permissões |
| Monitorar uso | Transcrições, propostas IA, storage, projetos ativos |
| Ajustar planos | Upgrade, downgrade, limites customizados por tenant |
| Suporte | Impersonation segura (toda ação logada com motivo) |
| Métricas de negócio | MRR, churn, tenants ativos, uso de IA |

### Pós-Onboarding: o que a agência pode ajustar por conta própria
- **Sim**: criar e editar projetos, usuários, tarefas, documentos — tudo operacional
- **Sim (futuro)**: pequenos ajustes de logo e cores via painel de configurações do tenant
- **Não**: configuração de domínio customizado, templates de proposta, e-mail transacional — sempre via equipe BRIF
- **Não**: acessar dados de outros tenants ou configurações de plano

---

## 👥 Perfis de Usuário

### Equipe BRIF (Super Admin)
- Acessa `admin.brif.app`
- Configura e gerencia todos os tenants
- Pode impersonar qualquer tenant para suporte (ação sempre logada)
- Vê métricas globais: MRR, churn, uso de IA, storage

### Usuários Internos da Agência

| Perfil | Papel no BRIF |
|---|---|
| **Tenant Admin / Sócio** | Gerencia usuários da agência, vê métricas e dados financeiros do tenant |
| **Gerente de Projetos** | Cria projetos, atribui tarefas, aprova briefings, gerencia prazos |
| **Planner / Estratégia** | Revisa transcrições, consolida briefings, gera propostas via IA |
| **Produtor Executivo** | Gerencia produção, contratos, disparo a fornecedores |
| **Time de Criação** | Recebe tarefas, faz upload de entregas, comenta versões |
| **Financeiro / Jurídico** | Revisa contratos, aprova orçamentos |

### Cliente Externo (por projeto)
- Acessa via **Magic Link** por e-mail — sem criar conta, sem senha
- Vê apenas: status do projeto, briefing para aprovação, propostas publicadas
- Interface 100% com a marca da agência — BRIF invisível
- Cada projeto tem seu próprio link seguro

---

## 💰 Planos e Precificação

Modelo de planos fixos — simples de entender, previsível para a plataforma.

| | **Basic** | **Pro** | **Enterprise** |
|---|---|---|---|
| Usuários internos | até 5 | até 20 | Ilimitado |
| Projetos ativos | até 5 | até 30 | Ilimitado |
| Transcrições/mês | 120 min | 600 min | Ilimitado |
| Propostas IA/mês | 10 | 50 | Ilimitado |
| Storage | 5 GB | 50 GB | 500 GB |
| White label (logo + cores) | ✅ | ✅ | ✅ |
| Domínio customizado | ✅ | ✅ | ✅ |
| Templates de proposta custom | 3 | Ilimitado | Ilimitado |
| Portal do cliente | ✅ | ✅ | ✅ |
| Suporte / Onboarding | Assistido (equipe BRIF) | Assistido + treinamento | SLA dedicado |
| **Preço referência/mês** | **R$ 297** | **R$ 697** | **Sob consulta** |

> Valores a validar com análise de custo real (Whisper + Claude por minuto de áudio).

**Nota sobre trial / aquisição**: dado o modelo de onboarding assistido (managed), o modelo de aquisição é via **demo call guiada** — a equipe BRIF apresenta o produto, entende as necessidades da agência e fecha o contrato. Não há self-service ou trial automatizado no MVP. As primeiras agências serão adquiridas via network direto do founder e agências parceiras já mapeadas.

---

## 🗺️ Fluxo Principal do Produto

```
[BRIF faz setup do tenant] → [Agência recebe ambiente configurado]
        ↓
[Agência convida time interno] → [Sessão de treinamento com equipe BRIF]
        ↓
[Reunião de briefing com cliente final: Meet / Zoom / Presencial]
        ↓
[Upload da gravação OU integração automática Meet/Zoom]
        ↓
[Transcrição automática — Whisper large-v3, otimizado PT-BR]
        ↓
[IA gera Briefing Consolidado — Claude API]
        ↓
[Planner revisa → Gerente aprova → Cliente confirma via Magic Link]
        ↓
[Projeto criado] → [Tarefas disparadas ao time de criação]
        ↓
[Time executa] → [Upload de entregas nas tarefas]
        ↓
[Proposta visual gerada por IA — HTML com marca da agência]
        ↓
[Gerente publica] → [Cliente acessa via portal com marca da agência]
        ↓
[Debriefing: nova transcrição → diff automático → nova versão da proposta]
        ↓
[Aprovação final] → [Produção executiva]
        ↓
[Contratos: Jurídico + Financeiro aprovam → Disparo automático a fornecedores]
        ↓
[Entrega final + Arquivo do projeto]
```

---

## 🧩 Módulos do Sistema

### M1 · Briefing & Transcrição IA
- Upload de áudio/vídeo (MP3, MP4, WAV, M4A) para reuniões presenciais
- Integração Google Meet (gravação via Google Drive API) e Zoom (webhook pós-reunião)
- Transcrição via Whisper large-v3 com identificação de speakers e timestamps
- Claude gera briefing estruturado: objetivo, público, tom, entregas, prazos, orçamento
- Fluxo de aprovação 3 etapas: Planner → Gerente → Cliente (Magic Link)
- Notificações por e-mail com marca da agência em cada etapa

### M2 · Gestão de Projetos e Tarefas
- Projeto criado automaticamente após aprovação do briefing pelo cliente
- Fases configuráveis por agência: padrão Briefing → Criação → Revisão → Produção → Entrega
- Kanban e lista de tarefas; subtarefas com checklists, prazos, responsáveis, prioridade
- Upload de arquivos e comentários versionados nas tarefas; menção com @nome

### M3 · Calendário e Roadmap
- Calendário unificado: reuniões, deadlines, marcos
- Integração Google Calendar para criação e sincronização de eventos
- Alertas automáticos: 72h, 24h e no dia do prazo
- Gantt interativo com dependências (pós-MVP)

### M4 · Portal do Cliente
- Status em tempo real: fase atual, percentual de conclusão, próxima entrega
- Aprovação digital de briefing com comentário e timestamp
- Acesso às propostas visuais publicadas pela agência
- Canal de mensagens direto com o Gerente de Projetos
- Magic Link por projeto — sem senha, sem cadastro
- Interface responsiva; marca da agência em todo o portal

### M5 · Geração de Propostas Visuais com IA
- Claude transforma briefing aprovado em proposta HTML publicada no app
- Templates por tipo de campanha: branding, digital, eventos, mídia, 360°
- Templates incorporam logo e paleta de cores configurados no onboarding
- Conteúdo gerado: conceito criativo, racional estratégico, cronograma, investimento
- Gerente decide quando publicar — nunca automático
- Versionamento completo com histórico de aprovações

### M6 · Debriefing e Ajustes
- Mesmo fluxo de transcrição do briefing aplicado às reuniões de debriefing
- IA identifica ajustes em relação à proposta anterior (diff automático)
- Nova versão da proposta gerada com marcação visual das mudanças

### M7 · Produção e Contratos
- Upload de contratos com metadados: fornecedor, valor, prazo, categoria
- Fluxo de aprovação duplo: Jurídico + Financeiro → Gerente libera disparo
- Disparo automático de e-mail ao fornecedor com contrato anexo
- Status: enviado / visualizado / assinado
- Integração futura DocuSign para assinatura eletrônica

### M8 · Gestão de Documentos
- Repositório central por projeto com versionamento automático
- Categorias: briefing, criação, produção, financeiro, legal, referências
- Controle de acesso por perfil e por documento
- Busca por nome e metadados (pós-MVP: full-text no conteúdo)

### M9 · Painel Admin (admin.brif.app)
- Dashboard global: tenants, MRR, churn, uso de IA, storage, custos
- Criação e configuração completa de novos tenants (managed onboarding)
- Configuração de white label: logo, cores, fontes, domínio, templates, e-mail
- Gerenciamento de usuários por tenant
- Ajuste de planos e limites por tenant
- Impersonation segura com log de auditoria completo
- Monitoramento de custos de IA por tenant (controle de margem)

---

## 🛠️ Stack Técnica

```
Frontend:          Next.js 14 + Tailwind CSS + shadcn/ui
Backend:           Node.js + tRPC (type-safe end-to-end)
Banco:             PostgreSQL + Prisma ORM — schema-per-tenant
Autenticação:      NextAuth.js + JWT (internos) + Magic Link (cliente externo)
IA Transcrição:    OpenAI Whisper API (large-v3 — melhor acurácia PT-BR)
IA Linguagem:      Anthropic Claude API (claude-sonnet-4)
Storage:           Cloudflare R2 (S3-compatible, sem egress fee)
Fila de Jobs:      BullMQ + Redis (transcrições e propostas são assíncronas)
E-mail:            Resend com subdomain auth por tenant (white label de e-mail)
Billing:           Stripe + Stripe Customer Portal
DNS/SSL:           Cloudflare Workers + SSL automático por CNAME
Mobile (MVP):      PWA responsivo (sem custo de app nativo)
Mobile (pós-MVP):  React Native com Expo
Calendário:        Google Calendar API
Infra:             Vercel (frontend) + Railway (backend + Redis)
```

### Decisão de Arquitetura: Schema-per-tenant
Adotamos **schema isolation** no PostgreSQL ao invés de row-level isolation (coluna `tenant_id`) porque:
- Isolamento físico total — impossível vazar dados entre tenants por bug de query
- Backup e restore individual por tenant
- Facilita compliance e auditorias futuras (LGPD)
- Escala até ~500 tenants no mesmo cluster sem degradação

---

## ⚙️ Regras de Negócio Críticas

| ID | Regra |
|---|---|
| RN-01 | Projetos só são criados após aprovação do briefing pelo cliente — sem exceção |
| RN-02 | Propostas só ficam visíveis ao cliente após publicação explícita pelo Gerente |
| RN-03 | Contratos só são disparados após aprovação dupla: Jurídico + Financeiro |
| RN-04 | Clientes externos nunca acessam dados internos da agência |
| RN-05 | Dados de diferentes tenants são fisicamente isolados em schemas PostgreSQL separados |
| RN-06 | Versões aprovadas de briefing e proposta são imutáveis — mudança gera nova versão |
| RN-07 | Transcrição passa por revisão humana antes de gerar o briefing formal — IA auxilia, humano decide |
| RN-08 | Configurações de white label (domínio, templates, e-mail) são gerenciadas exclusivamente pela equipe BRIF |
| RN-09 | Impersonation pelo Admin é sempre logada com motivo, operador e timestamp |
| RN-10 | E-mails transacionais saem com a marca da agência — BRIF nunca aparece ao cliente final |
| RN-11 | Tenants que excedem o limite de plano recebem aviso automático; bloqueio de feature após 7 dias |
| RN-12 | Custos de IA por tenant são monitorados em tempo real no painel admin para controle de margem |

---

## 📦 Escopo do MVP (0–6 meses)

### ✅ Incluído no MVP
- [ ] Multi-tenancy com schema isolation
- [ ] Painel admin (admin.brif.app) com managed onboarding completo
- [ ] White label: logo, cores, subdomínio, domínio customizado, e-mail, templates de proposta
- [ ] Todos os 7 perfis de usuário com RBAC granular
- [ ] Upload de áudio + transcrição Whisper + revisão humana
- [ ] Briefing consolidado via Claude + fluxo de aprovação 3 etapas
- [ ] Portal do cliente com Magic Link (status, briefing, proposta)
- [ ] Geração de proposta visual HTML via Claude com marca da agência
- [ ] Kanban + upload de arquivos + comentários nas tarefas
- [ ] Calendário básico com alertas de prazo por e-mail
- [ ] Repositório de documentos por projeto com categorias e versionamento
- [ ] E-mail transacional white label via Resend
- [ ] Billing Stripe: planos Basic e Pro com recorrência mensal

### 🔜 Pós-MVP (6–12 meses)
- [ ] App mobile React Native (iOS + Android)
- [ ] Módulo de debriefing com diff automático de propostas
- [ ] Módulo de contratos e produção executiva
- [ ] Gantt interativo com dependências
- [ ] Integração Google Drive / Dropbox
- [ ] Integração DocuSign para assinatura eletrônica
- [ ] Busca full-text em transcrições e documentos
- [ ] Dashboard de métricas da agência
- [ ] Self-service parcial para ajustes de marca pelo tenant admin
- [ ] Suporte a espanhol (expansão LATAM)

---

## 📊 Métricas de Sucesso

### Por Agência (produto)
| Métrica | Meta | Prazo |
|---|---|---|
| Tarefas criadas no app vs WhatsApp/e-mail | 80% no app | 60 dias após onboarding |
| Tempo de consolidação de briefing | Redução de 70% | 30 dias |
| Retrabalho por informação incompleta | Redução de 50% | 90 dias |
| NPS do portal do cliente | > 50 | 90 dias |
| Proposta gerada após briefing aprovado | < 30 minutos | Desde o MVP |

### Do Negócio SaaS
| Métrica | 6 meses | 12 meses |
|---|---|---|
| Tenants pagantes | 10 | 50 |
| MRR | R$ 5k | R$ 30k |
| Churn mensal | < 3% | < 2% |
| Custo de IA / receita | < 15% | < 12% |
| NPS da plataforma | > 40 | > 60 |

---

## ⚠️ Riscos e Mitigações

| Risco | Nível | Mitigação |
|---|---|---|
| Gargalo no onboarding manual com crescimento de tenants | Alto | Criar checklist + ferramentas internas eficientes no admin; planejar self-service parcial pós-MVP |
| Custo de IA escalando acima da receita | Alto | Limites rígidos por plano + monitoramento de custo/tenant no admin em tempo real |
| Qualidade de transcrição em PT-BR | Médio | Whisper large-v3 + revisão humana obrigatória antes do briefing |
| Vazamento de dados entre tenants | Alto | Schema isolation + testes de penetração antes do go-live |
| Resistência do time das agências à adoção | Médio | Treinamento no onboarding + UX simplificado + suporte próximo nas primeiras semanas |
| Dependência de APIs externas (Whisper + Claude) | Médio | Filas assíncronas BullMQ + fallback manual + monitoramento de status das APIs |
| Feature creep comprometendo o prazo do MVP | Médio | Escopo do MVP travado neste documento; novos itens vão direto para o backlog pós-MVP |

---

## 📅 Timeline

| Período | Marco |
|---|---|
| Sem 1–2 | Validação do PRD com stakeholders + agências piloto mapeadas |
| Sem 3–4 | Wireframes das telas core (briefing, kanban, portal cliente, proposta, admin) |
| Sem 5–6 | Contratação do time de desenvolvimento |
| Sem 7–8 | Setup: repositório, CI/CD, multi-tenant schema, Stripe sandbox |
| Mês 3–4 | Desenvolvimento MVP — sprints de 2 semanas com demos internas |
| Mês 5 | Dogfooding: uso real pela própria agência do founder |
| Mês 6 | Beta fechado com 3–5 agências selecionadas via network |
| Mês 7 | Go-live: landing page + modelo de aquisição via demo call |
| Mês 8+ | Roadmap pós-MVP + expansão de tenants |

---

## 🔗 Decisões em Aberto

> Itens que precisam de resposta antes do início do desenvolvimento

- [ ] **SLA de onboarding**: qual o prazo máximo entre contrato assinado e ambiente entregue? → Recomendação: 5 dias úteis
- [ ] **Custo real de IA**: validar custo médio por tenant (Whisper + Claude) para calibrar limites dos planos e garantir margem
- [ ] **Trial ou não**: dado o modelo managed, a aquisição é via demo call. Definir se haverá algum período de avaliação guiada
- [ ] **LGPD**: dados dos tenants precisam ficar em servidores no Brasil? → Impacta escolha de região na infra (Cloudflare, Railway, Vercel)
- [ ] **Self-service parcial pós-onboarding**: a agência poderá atualizar logo/cores por conta própria no futuro? → Recomendado para reduzir demanda de suporte
- [ ] **Estratégia de preço**: validar R$297 e R$697 com análise de custo real + benchmark de concorrentes

---

*Versão 3.0 — Abril 2025 | Todas as decisões de produto até esta data consolidadas*

---

## ✅ Decisões Finais Registradas (última rodada)

| Decisão | Resolução |
|---|---|
| Quem configura white label | Equipe BRIF — onboarding 100% managed, cliente não altera nada |
| A agência pode alterar logo/cores sozinha? | Não — sempre via equipe BRIF |
| SLA de entrega do ambiente | Até 5 dias úteis após fechamento do contrato |
| Trial / período de avaliação | A definir — não prioridade para o MVP |
| Primeiras agências clientes | Própria agência do founder (dogfooding) + agências parceiras já mapeadas |
| LGPD / localização dos dados | A verificar — recomendado confirmar com advogado antes do go-live |

---

## 📊 Planilha de Viabilidade Financeira

O arquivo `BRIF_Viabilidade.xlsx` contém 4 abas:

1. **📋 Premissas** — todos os inputs editáveis: custos de IA (Whisper + Claude), câmbio USD/BRL, limites e preços dos planos, custos de infra fixa
2. **💰 Custo por Tenant** — custo mensal de IA por agência em 3 cenários (baixo/médio/alto) + margem bruta por plano + % custo/receita
3. **📈 Projeção 12 Meses** — crescimento de tenants, MRR, custos totais e resultado líquido mês a mês
4. **🎯 Resumo Executivo** — indicadores-chave e recomendações antes do lançamento

**Atenção**: células em **azul** são inputs que devem ser atualizados com dados reais durante o dogfooding.

