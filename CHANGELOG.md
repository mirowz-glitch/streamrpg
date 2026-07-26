# Changelog

Todas as mudanças notáveis do projeto são registradas aqui, da mais recente pra mais antiga. Formato livre, adaptado de [Keep a Changelog](https://keepachangelog.com/) — este projeto ainda não usa versionamento semântico formal, e sim marcos nomeados (RC1, RC2, ...).

## [Vertical Slice RC1] — 2026-07-26

Primeiro Release Candidate reproduzível e documentado do StreamRPG. Ver [`docs/releases/vertical-slice-rc1/`](docs/releases/vertical-slice-rc1/) para o estado completo (snapshot, estatísticas, dívida técnica, known issues, release notes).

### Adicionado
- Adventure Session Persistence — sessão de Aventura (região/masmorra/timeline) sobrevive à navegação entre páginas do app.
- Continuous Affix Scaling — curva contínua de valor de afixo, substitui o sistema de tiers discretos.
- 449 testes automatizados (442 motor + 7 sessão de Aventura).
- `README.md`, `CHANGELOG.md`, `docs/releases/vertical-slice-rc1/*`, `docs/planning/post-rc1-roadmap.md`.

### Corrigido
- **B1 (Crítico)**: perda total do estado de sessão de Aventura em qualquer navegação (não só reload).
- Pluralização quebrada em `WorldPage` ("expediçãoões").
- Copy contraditória em `ChroniclePage`.
- Elmo/Peitoral com 0 upgrades em 300 campanhas (peso de `baseDefense` no Power Score).
- 2 masmorras com 0% de conclusão apesar de o chefe morrer em 94-99% dos encontros.
- Bug de mapeamento de slot Adventure→Personagem (tudo caindo em "Arma").

### Alterado
- 4 chefes de masmorra recalibrados (+18% a +37,5%) após a Continuous Affix Scaling.
- Orçamento de encontros de 2 masmorras reduzido pra faixa realmente alcançável.
- Nomes de item/slot/raridade localizados em português na interface.
- `.env` removido do controle de versão (nunca continha segredos reais, só placeholders de desenvolvimento — `.env.example` continua sendo o template).

### Removido
- `packages/shared/src/itemgen/selectionStrategy.ts` e seu script de comparação — superados pela Continuous Affix Scaling.

---

## Anterior ao registro formal deste CHANGELOG

O projeto acumulou dezenas de Sprints antes deste arquivo existir (Character/Combat/Inventory/Equipment/Loot/Objectives/Bosses/Dungeons/Persistence, World Events, Facções, World Tiers, Relíquias Únicas, RNG Audit, Player Journey, Boss Accessibility, Progression Economy, Game Design Audit, Item Generation — diagnóstico e redesenho, Global Gameplay Rebalance, entre outras). O histórico técnico completo de cada uma está em `packages/shared/reports/*.md`; o resumo executivo está em [`docs/releases/vertical-slice-rc1/RC1-SNAPSHOT.md`](docs/releases/vertical-slice-rc1/RC1-SNAPSHOT.md).
