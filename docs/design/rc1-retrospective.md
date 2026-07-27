# RC1 Retrospectiva — Lições Aprendidas

**Status:** 🟢 Canônico. Cobre o arco Engine (dezenas de Sprints anteriores) → Global Idle System → Living Character → Living World → Backpack Experience → City Foundation, encerrado com esta Sprint de congelamento.

## O que deu certo

### Arquiteturas reutilizadas
- **Padrão função-pura em `lib/`**: nasceu em Living Character (`adventureLiveState.ts`, `adventureDiary.ts`) e foi reaproveitado literalmente, sem reescrita, por Living World, Backpack Experience e City Foundation. `formatRelativeTime` e `rarityLabel` (escritos uma vez em Living Character) ainda são chamados diretamente por Backpack Experience duas Sprints depois.
- **Singleton de módulo para estado compartilhado** (`useAdventureSession.ts`): a decisão mais estruturalmente arriscada do arco inteiro (Global Idle System) se pagou em todas as Sprints seguintes — nenhuma delas precisou inventar um segundo mecanismo de estado compartilhado.
- **Componente isolado + própria assinatura do hook** (`AdventureLivePanel`, `BackpackNarrativePanel`): permitiu adicionar painéis novos sem re-renderizar páginas inteiras, e sem acoplar o painel ao ciclo de vida da página que o hospeda.
- **Simulador (`packages/shared/src/simulation/`)**: construído muito antes do RC1, mas continuou sendo a ferramenta real de decisão em todo trabalho de balanceamento (Continuous Affix Scaling, Global Gameplay Rebalance) — nenhuma calibração dependeu de "achismo".

### Padrões que evitaram retrabalho
- Auditoria (Fase 1) obrigatória antes de qualquer código, em toda Sprint — encontrou, por exemplo, que `InventoryItem` persistido não carrega região/auto-equip ANTES de qualquer linha de Backpack Experience ser escrita, evitando construir uma feature sobre um dado que não existia.
- Documentos de preparação (`docs/design/*-plan.md`, `*-phase1.md`) escritos ao final de cada Sprint, não no início da próxima — cada um chegou pronto para a Sprint seguinte simplesmente ler, sem precisar redescobrir contexto.
- Browser Validation real (via `javascript_tool` `.click()`, nunca só `computer`/coordenadas) em toda Sprint que tocou UI — pegou pelo menos uma classe de bug (a diferença entre `navigate()` — hard reload — e clique real de `<Link>`) que testes unitários nunca teriam revelado.

### Boas decisões
- Adiar a decisão de arquitetura de Ouro (2026-07-02) em vez de construir Cidade funcional sobre uma base indefinida — evitou repetir, na Economia, o mesmo padrão de retrabalho que o Item Generator sofreu em 6 Sprints sucessivas de parametrização antes de resolver a causa raiz (`commercial/roadmap/project-valuation-roadmap.md` Seção 0.6).
- Separar "sinal" de "transação" na Cidade — City Foundation implementou o CONVITE (mochila cheia → sugestão de visitar o Ferreiro) sem implementar a TRANSAÇÃO, exatamente como `docs/design/backpack-experience-plan.md` Seção 5 já havia previsto que deveria ser feito.

## O que deu errado

### Problemas encontrados
- **Naming clash real**: "Aventura Atual" (card pré-existente de expedição Twitch) e o novo painel "Em Aventura" da Living Character coexistiram na mesma tela sem terem sido desenhados juntos — um problema de nomenclatura, não de dado, identificado durante a própria Sprint (ver memória `project_streamrpg_living_character_phase1`).
- **Ambiente de Browser Validation instável**: `computer{action:"screenshot"}` falha nesta sessão ("Browser pane não compositando frames"), tornando cliques por coordenada (`ref`) não confiáveis — descoberto por tentativa e erro em Living Character Phase I, precisou virar workaround documentado (dispatch real de `.click()` via `javascript_tool`) e ser reaplicado manualmente em toda Sprint seguinte, porque não existe (ainda) uma forma de tornar isso automático.
- **Lacuna de dado descoberta tarde**: só na auditoria de Backpack Experience (não antes) ficou claro que região e auto-equip nunca foram persistidos para itens — um dado que várias Sprints de UI anteriores já presumiam implicitamente existir.

### Refatorações necessárias
- Nenhuma refatoração destrutiva foi necessária em nenhuma das 6 Sprints do arco — a única mudança estrutural real (elevar o `IdleDriver` para singleton) foi tratada como sua própria Sprint dedicada (Global Idle System), não como um efeito colateral de outra.

### Erros evitados
- Não foi necessário reverter nenhuma decisão de arquitetura tomada durante o arco — o único ajuste real foi de escopo (a Sprint de City Foundation deliberadamente NÃO implementou a Cidade funcional, adiando-a corretamente para depois da decisão de Ouro, em vez de tentar e descobrir o bloqueio no meio do caminho).

## Dívida Técnica

### Dívida aceitável (não bloqueia Early Access, monitorar)
- Dois vocabulários de raridade/item coexistindo (`ItemRarity` de 5 tiers vs. `ItemGenRarityId` de 4 tiers) — já documentado e traduzido na fronteira (`RARITY_TO_PERSISTED`), não causa bug, só exige atenção ao adicionar um vocabulário novo.
- Item persistido não carrega o procedural completo (só `baseItemId` + Power Score + raridade mapeada) — funcional, mas não 100% fiel visualmente após um refresh de página (achado já registrado no roadmap comercial).
- Mistura de nomenclatura PT/EN entre `EncounterCategory`/`WorldEventCategory`/`ExplorationEventCategory` (`docs/architecture/domain-vocabulary.md` Seção 2.6) — risco de legibilidade, não de comportamento.

### Dívida prioritária (deve ser resolvida antes de Merchant/Blacksmith funcionais)
- **Decisão de arquitetura de Gold/Ledger** (Economia): identificada e congelada desde 2026-07-02, respondida em nível de preparação por `docs/design/gold-architecture-phase1.md`, mas ainda sem nenhuma implementação real — é exatamente o que Economy Core resolve a seguir.
- **Ambiente de Browser Validation por coordenada quebrado**: enquanto não for corrigido, toda Sprint futura de UI precisa reaplicar manualmente o workaround de `.click()` via `javascript_tool` — funciona, mas é atrito repetido, não uma correção definitiva.

### Dívida futura (aceitável adiar além de Early Access)
- Nenhum sistema de som, animação real (partícula), ou identidade visual própria (hoje 100% emoji) — fora do escopo de qualquer Sprint de arquitetura; é trabalho de Visual Polish/Identity já sequenciado em `commercial/roadmap/project-valuation-roadmap.md` Seção 1.
- Persistência de Ouro/transações via tabela de auditoria (`gold_transactions` ou equivalente) — a Seção 3 de `gold-architecture-phase1.md` já nomeou isso como "adicionar, nunca substituir" o saldo simples atual; não é bloqueante para a PRIMEIRA versão do Ledger, só para auditoria histórica completa.

---

*Referências: cada Sprint do arco tem seu próprio relatório final (memórias `project_streamrpg_*`) e documento de preparação (`docs/design/*`) — esta retrospectiva sintetiza, não substitui, esses registros individuais.*
