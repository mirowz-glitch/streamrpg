# Itemization 2.0 — Fase 1 (Sprint 10, Prep de Infraestrutura)

**Status:** ✅ Infraestrutura preparada, testada e validada em navegador. Nenhuma lógica de crafting real, nenhuma UI, nenhuma tabela de banco nova — exatamente o escopo pedido ("esta Sprint NÃO implementa crafting completo, ela prepara TODA a infraestrutura").

## 1. Auditoria completa (Fase 1)

O achado mais importante desta Sprint: **grande parte da infraestrutura pedida já existe**, construída ao longo de Sprints anteriores deste mesmo projeto (Item Generator Phase I/II, Continuous Affix Scaling, Equipment Progression Repair). Mapa completo:

| Área pedida pelo brief | Estado real (evidência) |
|---|---|
| Geração procedural | ✅ Já existe e funciona — `itemgen/generator.ts` (pipeline Base Item → Item Level → Rarity Roll → Prefix Roll → Suffix Roll → Tier Roll → Value Roll → Power Score → Final Item), inspirado em PoE, com RNG determinístico por seed. |
| Raridades | ✅ 4 raridades procedurais (`ItemGenRarityId`: common/magic/rare/unique, `itemgen/rarities.ts`) — distinto do vocabulário de 5 tiers (`ItemRarity`: common/uncommon/rare/epic/legendary, `types.ts`) usado pelo sistema econômico. Os dois SEMPRE coexistiram desde a Sprint "Item Generator Phase I", nunca foi um erro — mas nunca tiveram uma tradução formal até a correção descrita na Seção 2. |
| Geração de afixos | ✅ Já existe e é sofisticada — `ItemGenModDefinition`/`ItemGenModTier`/`ItemGenRolledMod` (`itemgen/types.ts`): prefixo/sufixo, tiers por Item Level, pesos por raridade/tipo de base item, exclusão de grupo bidirecional, tags obrigatórias, Continuous Affix Scaling (`itemgen/continuousScaling.ts`, envelope contínuo por valor em vez de tiers discretos). **As Fases 4/5 deste brief ("preparar infra de afixos estilo PoE2... Prefix/Suffix/Tier") pedem algo que já existe de verdade** — ver Seção 3. |
| Power Score | ✅ Existe — `itemgen/powerScore.ts`, soma do meio da faixa de dano/defesa base + valor de cada mod rolado. Já recebeu uma correção de root cause (Equipment Progression Repair Phase II). |
| Item Generator | ✅ Módulo completo, 12 arquivos (`packages/shared/src/itemgen/`), maduro, testado (`generator.test.ts`, `continuousScaling.test.ts`, `rngAudit.test.ts`). |
| Merchant pricing | ✅ `economy/saleValue.ts` (`calculateSaleValue`) — assume as 5 raridades de `ItemRarity`. |
| Salvage rewards | ✅ `equipment/salvage.ts` (`calculateSalvageRewards`) — mesma suposição de 5 raridades. |
| Blacksmith | ✅ `equipment/upgrade.ts` (`calculateUpgrade`) — mesma suposição de 5 raridades. |
| Item History | ❌ Não existe. Nenhuma tabela, nenhum tipo, nenhum log de dono/eventos. Genuinamente novo (Seção 5). |
| Equipment | ✅ Existe (`equipment/equipment.ts`, `equipmentLock.service.ts`) — gerencia slot/equipar/desequipar, sem nenhuma dependência de raridade/afixo. |

### 1.1 Achado crítico: o roll procedural de afixos é DESCARTADO na persistência

A tabela real `items` (`apps/api/src/config/schema.ts`) só guarda `rarity`/`slot`/`min_level`/`power_score`/`upgrade_level` — **nunca o array de prefixos/sufixos rolados** (`ItemGenGeneratedItem.prefixes`/`.suffixes`). `drop.service.ts`'s `grantAdventureLoot()` recebe só `{baseItemId, name, rarity, slot, powerScore}` do cliente — o `ItemGenRolledMod[]` completo (nome do mod, tier, valor exato) nunca chega ao banco. Isso significa que, hoje, um item comum e um item raro com afixos perfeitos são indistinguíveis no banco além do `power_score` agregado — a "história" do que tornou aquele item especial já se perde no momento em que ele é salvo. Este é exatamente o problema que a filosofia desta Sprint ("todo item deve nascer, viver... ganhar história") pede para resolver, e o motivo real por trás de `PersistedItemAffix` (Seção 3).

### 1.2 Bug de raridade — já corrigido por uma tarefa em paralelo

Durante a auditoria desta Sprint, uma tarefa em background (spawnada ao final do Sprint 9 deste mesmo projeto) corrigiu exatamente o ponto que este brief pedia para só **documentar, não corrigir**: `packages/shared/src/itemgen/rarityMapping.ts` (`normalizeItemRarity()`) agora traduz as 4 raridades do Item Generator para as 5 de `ItemRarity`, aplicado uma única vez em `drop.service.ts` (na persistência) — Merchant/Salvage/Blacksmith nunca mais recebem uma raridade fora do vocabulário que esperam. Documentado aqui porque a Fase 1 pedia para mapear TODOS os pontos, mesmo já corrigidos.

## 2. O que este módulo NÃO faz

Não substitui `itemgen/`. Não cria uma segunda fonte de verdade para Prefix/Suffix/Tier. Não adiciona nenhuma coluna ao banco. Não expõe nenhuma UI. Não é importado por nenhum código real (`packages/shared/src/itemization/` não está no barrel principal — mesmo princípio de isolamento já usado por `guild/`, Sprint 9).

## 3. Fases 2/4/5 — o novo domínio de tipos

`packages/shared/src/itemization/types.ts` cria os tipos genuinamente novos pedidos pelo brief (`ItemStage`/`ItemTier`/`ItemPotential`/`ItemQuality`/`ItemCraftState`/`ItemLegacy`) e, para os que já existem (`ItemAffix`/`ItemPrefix`/`ItemSuffix`/`ItemModifier`), cria **aliases documentados** apontando para `ItemGenRolledMod`/`ItemGenModDefinition` (`itemgen/types.ts`) em vez de duplicar campos — nenhum sistema antigo é tocado, nenhuma lógica é reescrita.

`PersistedItemAffix` (= `ItemGenRolledMod`) e `ItemizationExtension` documentam o contrato que uma futura migração de `items` precisaria satisfazer para parar de descartar o roll de afixos (achado 1.1) — sem criar a migração agora.

## 4. Fase 3 — Estágios do item

`ItemStage = "base" | "generated" | "crafted" | "legendary" | "historical"`. Hoje só os dois primeiros existem de verdade no pipeline real (`itemgen/generator.ts`); os outros três são os estágios que Crafting/Esferas/tempo de posse vão produzir nas Sprints futuras.

## 5. Fase 6 — Item History

`packages/shared/src/itemization/history.ts`. Mesmo princípio de "nunca apagar" já usado por `houses.history`/`HouseHistoryEvent` (Housing Phase I) — log append-only. Cobre todos os campos pedidos (criado por, primeiro/último dono, quantidade de donos, chefes derrotados, kingdoms visitados, guerras vencidas) mais `playersKilledWith` (sempre 0 até Kingdom Wars, roadmap item 12, existir — campo já reservado para não precisar de outra migração depois). `deriveItemLegacyFromHistory()` deriva o resumo compacto (`ItemLegacy`) a partir do log completo, pura e testada.

## 6. Fase 7 — Esferas

`packages/shared/src/itemization/spheres.ts`. As 5 Esferas previstas (Fortuna/Purificação/Lapidação/Ascensão/Maldição) como dados (`SPHERE_DEFINITIONS`), cada uma com efeito/restrições/raridade — nenhuma lógica de aplicação real. `canApplySphere()` é a única regra REAL desta Fase (verificada, nunca aplicada): garante que um item `sealed` nunca aceita outra Esfera, a garantia central da Esfera da Maldição (sela permanentemente; depois disso, sem novas Esferas/reroll/reforja/alteração; continua podendo equipar/vender/dropar/herdar/ganhar Legado).

## 7. Fase 8/9 — Potential e Quality

`ItemPotential` (teto de evolução por INSTÂNCIA, sorteado no nascimento — distinto de `AffixValueEnvelope` de `itemgen/continuousScaling.ts`, que já é o teto por Item Level para TODOS os itens daquele nível) e `ItemQuality` (0-20, escala um atributo BASE, deliberadamente sem relação com raridade ou afixos — mesmo princípio de Path of Exile).

## 8. Fase 10 — Compatibilidade

Merchant/Blacksmith/Salvage/Housing/Real Estate/Idle/Adventure confirmados funcionando sem nenhuma mudança — `itemization/` não é importado por nenhum arquivo de produção, então não há superfície de regressão possível. Confirmado via typecheck completo dos 3 pacotes + suíte de testes completa + Browser Validation real (Seção 10).

## 9. Fase 11 — Testes

15 testes novos (`spheres.test.ts` 7, `history.test.ts` 6, mais os já cobertos indiretamente por typecheck em `types.ts`, que não tem lógica própria para testar). Shared: 543/543 (subiu de 529 antes desta Sprint — as 3 diferenças vêm de `rarityMapping.test.ts`, adicionado pela tarefa de correção em paralelo). API typecheck: mesma dívida pré-existente de sempre (5 arquivos já documentados), zero arquivo novo na lista. Web typecheck: limpo. Build: limpo. Nenhum teste antigo removido.

## 10. Fase 12 — Browser Validation

Login por e-mail → Aventura (idle já rodando sozinho, item real encontrado: "Botas (Comum)") → Casas (mensagem correta de "precisa ser cidadão") → Mercado Imobiliário (lista vazia, correto) → Cidade (retornou da expedição real, "3 novos itens") → Ferreiro (ofertas reais de melhoria: Botas/Luvas/Adaga, Poder atual → Poder novo, custo em ouro). Zero erros de console em toda a sessão. Como esta Sprint não altera nenhum código já wired em produção (só adiciona um módulo novo, isolado, nunca importado), a validação confirma ausência de regressão — não testa nenhuma feature nova visível, porque nenhuma feature nova visível foi criada por esta Sprint (por design: "ainda sem interface", "nada visual ainda").

## 11. Problemas Encontrados

Ver Seção 1.1 (roll de afixos descartado na persistência) e 1.2 (bug de raridade já corrigido em paralelo). Nenhum problema novo introduzido por esta Sprint.

## 12. Próxima Sprint

Candidato natural: a primeira Sprint de Crafting real, consumindo a infraestrutura aqui preparada — precisaria decidir (não decidido aqui, deliberadamente): (a) a migração real de `items` para parar de descartar afixos (achado 1.1), (b) a fórmula real de Item Tier a partir dos tiers de afixo, (c) como o Merchant precifica um item com Quality/Potential/Legacy (hoje só lê `rarity`/`min_level`), (d) o primeiro consumidor real de uma Esfera (provavelmente Esfera da Fortuna, a mais simples).

---

*Referências: `docs/design/world-foundation-4.0.md`, `docs/game-design-bible/00-philosophy.md`/`02-principles.md`, `packages/shared/src/itemgen/` (o sistema que já existe e não foi tocado), `docs/design/housing-phase1.md` (precedente de "nunca apagar histórico").*
