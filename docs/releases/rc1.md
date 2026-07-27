# RC1 — Encerramento Oficial

**Status:** 🟢 Documento de encerramento do Vertical Slice RC1, escrito na Sprint "RC1 Retrospective & Architecture Freeze". Consolida o congelamento original (`docs/releases/vertical-slice-rc1/`, 2026-07-26) com o arco de Sprints que veio depois dele (Global Idle System → Living Character → Living World → Backpack Experience → City Foundation), que juntas formam o RC1 completo entregue por este documento.

## Escopo Entregue

### Fundação (congelamento original, `docs/releases/vertical-slice-rc1/`)
- Engine completa e calibrada: Combat/Loot/Progressão/Recuperação/Objetivos/Expedições/Facções/Dungeons/Chefes/World Events/World Tiers/Relíquias.
- Item Generator reescrito para Continuous Affix Scaling (fim do platô de progressão).
- Adventure Session Persistence (sessão sobrevive à navegação entre páginas).
- 9 regiões, 4 masmorras, 4 chefes, 4 facções, 15 World Events, 4 relíquias, 4 World Tiers, 29 objetivos.

### Arco pós-congelamento (esta Sprint fecha)
- **Global Idle System**: `IdleDriver` elevado de `AdventurePage` para um singleton de módulo em `useAdventureSession.ts` — a exploração passou a avançar independentemente de qual tela está aberta.
- **Living Character**: painel "Em Aventura" na tela de Personagem, consumindo o Estado Global ao vivo.
- **Living World**: o mesmo painel evoluído de informativo para narrativo (jornada em prosa, diário classificado por prioridade, tempo relativo, micro-feedback visual).
- **Backpack Experience**: o Inventário reorganizado em mochila (Equipados/Restante, achados recentes, última jornada, sinais de capacidade), fonte de dado corrigida para eventos ao vivo onde a persistência tinha lacuna (região/auto-equip).
- **City Foundation**: a Cidade transformada em hub narrativo (boas-vindas contextuais, sugestões por prédio), com os 4 prédios ainda placeholder ganhando comunicação clara de papel futuro — sem nenhuma transação real implementada.
- **RC1 Retrospective & Architecture Freeze** (esta Sprint): consolidação documental — `docs/architecture/overview.md`, `decisions.md`, `game-flow.md`, `development-guide.md`, `architecture-freeze-rc1.md`, `docs/design/rc1-retrospective.md`, `docs/roadmap.md`, este documento, e `docs/design/economy-core-phase1.md`.

## Fora do Escopo (deliberadamente adiado)

- Qualquer economia real: compra, venda, upgrade, crafting, reciclagem — Ouro segue sendo grant-only, sem rota de gasto.
- Merchant/Blacksmith/Banco funcionais — permanecem placeholders narrativos.
- Identidade visual própria, som, animação real (partícula) — hoje 100% emoji/texto/CSS.
- World Map navegável, conteúdo de Endgame aprofundado — sem especificação de arquitetura ainda.
- Qualquer material comercial (trailer, Steam page, pitch deck) — fora do escopo de `code/`, ver `commercial/`.

## Métricas

| Métrica | Valor |
| --- | --- |
| Testes automatizados totais | **537** (449 `packages/shared` + 88 `apps/web`) |
| Falhas | 0 |
| Suítes (`packages/shared`) | 162 |
| Suítes (`apps/web`) | 15 |
| Build | limpa (verificada por Sprint, via workaround de tsconfig temporário documentado em `docs/architecture/development-guide.md`) |
| Browser Validation | aprovada em cada Sprint do arco (Global Idle System, Living Character, Living World, Backpack Experience, City Foundation), sempre cobrindo o fluxo completo Adventure→Personagem/Inventário→Cidade→prédios→Adventure |
| Principais fluxos validados | Login→personagem→exploração contínua entre navegações; item encontrado→auto-equipar→refletido na Mochila; mochila cheia→sugestão de Cidade→prédio reage; navegação completa sem perda de progresso em nenhum ponto |

Estatísticas completas de código/conteúdo de jogo (linhas, regiões, inimigos, itens, etc.) da fundação original permanecem válidas em `docs/releases/vertical-slice-rc1/project-statistics.md` — este documento não as repete, só soma os novos testes do arco pós-congelamento.

## Arquitetura Final

Engine (`packages/shared`, isolada de React) → Adventure Session (singleton de módulo) → Estado Global (`hudState`/`idleStatus`) → Funções Puras (`apps/web/src/lib`) → Componentes React (apenas apresentação) → UI. Nenhuma camada importa de baixo para cima. Ver `docs/architecture/overview.md` para o detalhamento completo, e `docs/architecture/architecture-freeze-rc1.md` para o que está congelado vs. aberto a partir de agora.

## Próxima Etapa

**Economy Core.** A infraestrutura genérica de recursos e transações (`ResourceId`, Resource Ledger, Transaction Layer, eventos econômicos) que vai permitir Ouro, Materiais, Reputação e futuras moedas — sem ainda implementar nenhuma economia real. Especificação inicial em `docs/design/economy-core-phase1.md`.

---

*Referências: `docs/releases/vertical-slice-rc1/` (congelamento original e sua documentação de suporte — release notes, known issues, dívida técnica, inventário de features), `docs/design/rc1-retrospective.md` (lições aprendidas do arco completo), `docs/roadmap.md` (sequência oficial a partir daqui).*
