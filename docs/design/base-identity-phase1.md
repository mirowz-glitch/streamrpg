# Base Identity — Phase I

**Sprint:** 19 — Base Identity (Cada Base Precisa Ter Personalidade)
**Status:** Infraestrutura apenas — Implicit Mods nunca aplicados a um item real, nenhuma regra de gameplay lê `BaseIdentity` ainda.

## Fase 9 — Economia: a Base pode valer antes do item ser raro

Regra oficial, documentada por exigência explícita do brief (Fase 9):

> **O mercado pode valorizar uma Base antes mesmo do item ser raro. Exatamente como Path of Exile 2.**

### Por que essa possibilidade agora existe

Antes desta Sprint, uma "Espada" era só um nome — o único sinal de valor de um item vinha inteiramente do que rolava DEPOIS dele existir (raridade, afixos, Power Score). Com `BaseIdentity` (Tier, Potential, Implicit Mods, Tags), a Base em si carrega informação relevante mesmo com craft_state neutro e zero afixos: uma "Maça" (Tier 4, Potential High) é estruturalmente mais desejável do que uma "Adaga" (Tier 1, Potential Low) antes mesmo de qualquer Esfera ser aplicada. Isso é o que o brief chama de "o jogador deve pensar: 'Finalmente dropou uma Base boa' — mesmo sendo comum."

### O que isso NÃO habilita ainda

Esta Sprint é deliberadamente só a fundação de dado — nenhuma das seguintes coisas foi implementada, por restrição explícita do brief:
- Implicit Mods nunca somam a nenhum item real (nenhum recálculo de Power Score).
- Base Tags (`physical`/`caster`/`tank`/`speed`/`bleed`/`critical`/`fire`/`ice`/`lightning`/`summoner`) não são lidas por nenhum sistema de Craft/Sockets/Gemas/Boss/NPC/Mercado real ainda — só existem como dado consultável (`listBaseIdentitiesByTag`).
- Nenhum preço de Merchant/mercado real muda por causa de Tier/Potential.

### Verificação (Fase 1 — auditoria desta Sprint)

Confirmado por auditoria de código: todas as 13 Bases reais vivem em `packages/shared/src/itemgen/baseItems.ts` (`ITEM_GEN_BASE_ITEMS`) — 7 armas, 4 peças de armadura, 3 acessórios — e cada uma tem exatamente UMA entrada (nenhuma família de variantes como "Espada Curta"/"Espada Longa"/"Espada Imperial" existe ainda no catálogo real; os nomes do brief nesse exemplo são ilustrativos do CONCEITO, não bases já implementadas). `BaseIdentity` (Sprint 19) referencia esses 13 ids reais 1:1, nunca inventa Bases novas.

## Ver também

- `docs/design/itemization2-phase2-persistence.md` — persistência real de Item Potential/Quality/Craft State (Sprint 11), distinto de Base Potential (Sprint 19), que é uma propriedade FIXA da Base, não uma instância rolada.
- `packages/shared/src/baseIdentity/` — implementação real desta Sprint (`BaseIdentity`, `BaseRegistry`, Implicit Mods, Base Tags, Base Potential, Base Tier, Base Lore).
- `packages/shared/src/itemgen/baseItems.ts` — o catálogo real de Bases que `BaseIdentity` descreve (nunca duplicado, só referenciado por `id`).
