# Release Notes — StreamRPG Vertical Slice RC1

**Data**: 2026-07-26 · **Branch**: `release/vertical-slice-rc1`

Primeiro Release Candidate reproduzível do StreamRPG, pronto para o primeiro playtest público em live.

---

## Novidades

- **Continuous Affix Scaling** — sistema de raridade/afixo procedural reescrito de tiers discretos para uma curva contínua de valor, eliminando o platô de progressão que travava upgrades de equipamento após a região 1.
- **Adventure Session Persistence** — a sessão de Aventura (região, masmorra, linha do tempo) agora sobrevive a qualquer navegação dentro do app, não só a XP/Ouro/Itens.
- **449 testes automatizados** (442 do motor + 7 novos de sessão de Aventura), cobrindo desde geração procedural de item até persistência de sessão entre remontagens.

## Correções

- Pluralização quebrada em `WorldPage` (`"expediçãoões"` → `"expedições"`).
- Copy contraditória em `ChroniclePage` (intro de estágio de personagem aparecia empilhada sobre o estado vazio "nenhum capítulo escrito").
- **B1 (Crítico)**: sessão de Aventura inteira (região/masmorra/timeline/estado de morte) era perdida em qualquer navegação para outra página do app — corrigido movendo o estado para um singleton de módulo.
- Elmo/Peitoral com 0 upgrades em 300 campanhas simuladas — raiz no peso do `baseDefense` do Power Score, corrigido (Equipment Progression Repair).
- 2 masmorras (Catedral Esquecida, Covil do Dragão) media 0% de conclusão apesar do chefe morrer em 94-99% dos encontros — orçamento de encontros pós-chefe reduzido pra faixa alcançável.

## Arquitetura

- Item Generator: migrado de seleção por tier-eligibility + peso pra uma curva contínua com pooling de envelope por grupo de afixo (`itemgen/continuousScaling.ts`).
- Sessão de Aventura: estado promovido de `useRef` local de componente pra singleton de módulo (`useAdventureSession.ts`) — sobrevive a desmontagens de rota, reaproveitando 100% da infraestrutura de sync já existente.
- Nenhuma mudança de arquitetura em Combat/Loot Tables/Boss/Dungeon além do necessário pra recalibração de valores (ver Balanceamento).

## Balanceamento

- 4 chefes de masmorra buffados (+18% a +37,5%) após a Continuous Affix Scaling deixar personagens mais fortes que o esperado.
- Orçamento de encontros de 2 masmorras reduzido pra corresponder ao tempo real gasto ali pelos personagens.
- Dead Loot: 95.2% → 94.4%; upgrades por campanha: +62%; todos os 9 slots de equipamento com +35% a +133% de upgrades.
- Mortalidade de Picos Congelados: 82% → 21% (efeito colateral da Continuous Affix Scaling, não uma mudança direta de combate).

## Melhorias

- Nomes de item/slot/raridade localizados em português nos popups de loot/equipamento e na linha do tempo.
- Rótulo do botão "Começar aventura" e clareza geral da página de Aventura revisados.
- Linguagem de "demo" removida de toda a interface após a Aventura passar a usar o personagem real.

## Bugs Conhecidos

Ver lista completa e classificada em [`known-issues-rc1.md`](known-issues-rc1.md). Nenhum bug Crítico permanece aberto no momento do congelamento — B1 foi o último e está resolvido.
