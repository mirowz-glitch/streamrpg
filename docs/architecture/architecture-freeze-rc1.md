# Congelamento da Arquitetura — RC1

**Status:** 🟢 Congelamento oficial, efetivo a partir desta Sprint ("RC1 Retrospective & Architecture Freeze"). Qualquer mudança em uma parte CONGELADA exige um RFC explícito (ver formato ao final) — nunca uma decisão implícita dentro de uma Sprint de feature.

## Congeladas

| Parte | Status | O que "congelada" significa aqui |
| --- | --- | --- |
| **Engine** (`packages/shared`) | CONGELADA | Nunca importa React/DOM/`apps/web`/`apps/api`. Regra de gameplay só nasce aqui. |
| **Adventure Session** (`useAdventureSession.ts` como singleton de módulo) | CONGELADA | Uma única instância de `IdleDriver`/estado por processo de navegador. Não vira Context, não vira múltiplas instâncias por tela. |
| **Estado Global** (`hudState`/`idleStatus`) | CONGELADO | Única fonte de verdade sobre a aventura. Nenhuma tela mantém cópia paralela. |
| **Funções Puras em `lib/`** | CONGELADA (como padrão) | Toda agregação/classificação/formatação nasce aqui, nunca em componente. O CONJUNTO de funções existentes pode crescer livremente — o que está congelado é a REGRA de onde elas vivem. |
| **Componentes React apenas apresentam dados** | CONGELADA | Nenhum componente novo pode conter regra de gameplay/validação de negócio. |
| **Browser Validation obrigatória** | CONGELADA | Nenhuma Sprint que toca UI é considerada concluída sem validação real em navegador. |
| **Arquitetura incremental, sem refatoração destrutiva** | CONGELADA (como princípio) | Sprints novas estendem o que existe; uma reescrita de camada inteira exige RFC próprio, não é uma decisão de rotina. |
| **Persistência como fronteira** (`apps/api` traduz, não decide) | CONGELADA | Regra de jogo nunca nasce no schema SQL; SQL nunca é importado pela Engine. |

## Abertas (podem mudar sem RFC, dentro do escopo normal de uma Sprint)

| Parte | Por que está aberta |
| --- | --- |
| **Economia / Ouro / Ledger** | Nenhuma decisão de implementação real foi tomada ainda — só preparação (`docs/design/gold-architecture-phase1.md`, `docs/design/economy-core-phase1.md`). É o próximo grande domínio a ser decidido, não um domínio já fechado. |
| **Merchant / Blacksmith / Banco (funcionais)** | Hoje são placeholders narrativos (Fase 8 de City Foundation) — nenhuma regra de transação existe para congelar ainda. |
| **Crafting / Salvage** | Zero implementação, zero decisão de design registrada além de menções de escopo futuro. |
| **Conteúdo novo** (regiões, inimigos, itens, masmorras) | Adicionar dados a tabelas já existentes (`Enemy Templates`, `Loot Tables`, `Encounter Tables`) não é uma mudança arquitetural — é o uso normal e esperado da arquitetura já congelada. |
| **Identidade visual / som / animação real** | Zero trabalho feito até hoje; nenhuma decisão a proteger. |
| **World Map / Endgame** | Ainda não especificados em nível de arquitetura — nascem como Sprints de design antes de qualquer código. |

## O que exige RFC (Request for Change)

Um RFC é necessário sempre que uma mudança proposta:

1. Move uma regra de gameplay para fora de `packages/shared` (ou introduz uma segunda cópia dela em outro lugar).
2. Introduz um segundo mecanismo de estado compartilhado entre telas (um segundo Context, um segundo singleton, um segundo hook "global").
3. Permite que um componente React decida um resultado de jogo (em vez de só apresentar um resultado já decidido).
4. Faz `apps/api` ou `apps/web` importarem um do outro.
5. Remove ou substitui a obrigatoriedade de Browser Validation para alguma classe de mudança.
6. Propõe uma reescrita estrutural de uma camada inteira já congelada (não uma extensão dela).

### Formato mínimo de um RFC

- **O que muda**: a decisão específica sendo revertida ou alterada.
- **Por que a decisão congelada não serve mais**: evidência concreta (não preferência estética) — um problema real medido, uma limitação técnica encontrada.
- **Alternativas consideradas**: incluindo "não mudar nada".
- **Blast radius**: quais Sprints/sistemas anteriores dependem da regra atual e seriam afetados.
- **Plano de migração**: como a mudança é feita sem quebrar o que já existe (arquitetura incremental, D7 em `docs/architecture/decisions.md`, continua valendo mesmo para o próprio processo de RFC).

Nenhuma Sprint de feature normal (incluindo Economy Core) precisa de RFC para trabalhar DENTRO das partes congeladas — só para alterar as próprias regras congeladas listadas acima.

---

*Referências: `docs/architecture/decisions.md` (a motivação de cada item congelado), `docs/architecture/overview.md` (a arquitetura que este documento protege), `docs/roadmap.md` (o que vem a seguir dentro das partes abertas).*
