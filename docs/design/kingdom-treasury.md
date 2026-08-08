# Kingdom Treasury

**Status:** 🚧 Preparação — conceitual, nenhuma implementação, nenhum schema. Parte da Sprint "Foundation Refactor".

## 1. O que já existe e por que não basta sozinho

O Economy Core (`packages/shared/src/economy/`, `apps/api/src/services/economy.service.ts`) já resolve saldo/transação/auditoria para um recurso **por personagem** — `character_resources`, `resource_transactions`, o Ledger genérico que Merchant/Blacksmith/Salvage já consomem. Kingdom Treasury introduz algo novo que esse desenho não cobre hoje: **um saldo cujo dono não é um personagem, é um Reino** — e que, ao contrário do saldo de um personagem (escrito só por aquele jogador), é escrito por N jogadores diferentes (todo proprietário de propriedade pagando imposto naquele Reino) simultaneamente.

## 2. Por que isso é o mesmo tipo de decisão que Gold já exigiu

A decisão congelada sobre Gold (`docs/design/gold-architecture-phase1.md`) identificou que um saldo se torna genuinamente sensível no momento em que passa a ser **contestado** — múltiplas operações competindo pelo mesmo valor, com risco real de corrida. O saldo de personagem nunca teve esse problema (só o dono escreve nele). O Tesouro de um Reino tem esse problema desde o primeiro dia de existência: dezenas de proprietários pagando imposto ao mesmo Reino, potencialmente na mesma janela de tempo.

**Recomendação, na mesma disciplina de "resolver a dúvida antes do domínio grande depender dela":** antes de implementar Kingdom Treasury, decidir explicitamente o modelo de consistência (mesma pergunta que Gold já respondeu: crédito simples — sem contenção real, cada imposto é um crédito independente, sem leitura-então-escrita — versus débito/gasto coletivo — que precisaria de garantias mais fortes se o Reino algum dia gastar seu próprio tesouro de forma competitiva, ex.: financiar uma guerra).

Minha leitura preliminar: **a maior parte do fluxo de Kingdom Treasury é só crédito** (impostos entrando, sempre um crédito independente, nunca uma leitura-então-escrita contestada — estruturalmente idêntico à emissão de Gold, que o Economy Core já sabe fazer bem). O risco de contenção real só aparece se/quando o Reino puder *gastar* seu tesouro de forma competitiva (várias decisões de investimento disputando o mesmo saldo ao mesmo tempo) — o que não existe ainda em nenhum sistema desta visão. Isso significa que Kingdom Treasury pode nascer reaproveitando o Ledger genérico quase sem modificação (um Reino é só mais um "dono" de saldo, do mesmo jeito que um personagem é), com a parte difícil (débito contestado) explicitamente adiada até que uma feature real precise dela — mesmo princípio de "não inventar consumidor antes de existir produtor" já usado no projeto.

## 3. O que entra no Tesouro

- Imposto de manutenção de propriedades (`housing-phase1.md`).
- Imposto de transação do mercado imobiliário (`real-estate.md`).
- Excedente de comércio favorecido por vocação (`trade-routes.md`), se o game design decidir que rotas comerciais também tributam o Reino de origem/destino.

## 4. O que sai do Tesouro (a decidir em Sprint futura, não aqui)

Financiamento de expansão de bairros, eventos, bônus de recompensa local — todos nomeados como possibilidades em `world-foundation-4.0.md`/`housing-phase1.md`, nenhum deles com fórmula decidida neste documento.

## 5. Regra que nunca muda

Nenhuma regra de "quanto o Reino cobra" ou "no que o Reino gasta" vive no Ledger genérico — o Ledger só sabe creditar/debitar um saldo. A regra de negócio (quem paga quanto, quando, e o que o Reino faz com isso) vive num serviço próprio de Kingdom Treasury, no mesmo padrão já usado por `merchant.service.ts`/`blacksmith.service.ts`/`salvage.service.ts` — reaproveitamento de arquitetura, não invenção de uma segunda forma de fazer a mesma coisa.

---

*Referências: `docs/design/gold-architecture-phase1.md` (o precedente direto desta análise); `docs/design/economy-core-phase1.md` (arquitetura base do Ledger); ADR-0001 (`docs/architecture/adr/`, composição de transação); `housing-phase1.md`, `real-estate.md`, `trade-routes.md` (as três fontes de receita do Tesouro).*
