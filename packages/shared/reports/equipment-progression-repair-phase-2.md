# Equipment Progression Repair — Power Curve (Phase II)

Corrige os gargalos estruturais identificados em [equipment-progression-audit-phase-1.md](equipment-progression-audit-phase-1.md), usando exclusivamente as evidências daquela auditoria. Nenhuma arquitetura, Combat Engine, Simulator, Persistência ou RuntimeConfig foi alterado — apenas dados do Item Generator/Loot Generator (fórmula de Power Score, pesos de tier de afixo, composição de Loot Table, variância de Item Level).

---

## 1. Arquivos Modificados

| Arquivo | O que mudou |
| --- | --- |
| `src/itemgen/powerScore.ts` | Peso de `baseDefense` reduzido para 50% na fórmula de Power Score (root cause) |
| `src/itemgen/prefixes.ts` | Pesos de tier de afixo rebalanceados (2/8/18/72 → 4/16/30/50; 15/85 → 28/72) |
| `src/itemgen/suffixes.ts` | Mesmo rebalanceamento de tier aplicado aos sufixos |
| `src/lootgen/lootTables.ts` | `chest`/`helmet`/`amulet` adicionados às Loot Tables de `wolf`/`boar`/`spider`/`goblin`/`swamp-witch` (bosque-sussurrante/pantano-podre); `itemLevelVariance` aumentado (2/3 → 5/6) em 8 Loot Tables de regiões 3+ |
| `scripts/runEquipmentProgressionAudit.ts` | Já existia (Phase I); reutilizado sem alterações nesta Sprint |
| `reports/equipment-progression-audit-BEFORE.json` / `-AFTER.json` (novos) | Snapshots da campanha comparativa (N=300, mesma metodologia) |

Nenhum arquivo de `apps/api`, `apps/web`, Combat Engine, Simulator, ou schema de persistência foi tocado.

---

## 2. Root Cause

**O que estava quebrado**: `calculatePowerScore()` somava `baseDefense` do Base Item em peso cheio (Elmo 12, Peitoral 24, Botas/Luvas 8). O banco de afixos (`prefixes.ts`/`suffixes.ts`) não tem NENHUM mod de "Defesa" — armaduras só recebem Força (`prefix_heavy`) ou Vida (`Healthy`/`Vigorous`/`Massive`/`of_the_bear`), o mesmo pool raso pra Elmo/Peitoral/Botas/Luvas. Como o kit inicial já equipa esses 4 itens em raridade comum (Power Score = só o `baseDefense`), qualquer drop subsequente precisava superar esse piso — e Botas/Luvas (piso 8) eram batidas por quase qualquer rolagem de Vida (10-110), enquanto Elmo (piso 12) e principalmente Peitoral (piso 24) raramente eram. Medido na auditoria anterior: **0 upgrades de Elmo e Peitoral em 1.361 eventos, 300 campanhas completas** — contra 273 (Botas) e 49 (Luvas).

**Comportamento anterior**: Peitoral/Elmo permanentemente no item "comum" do kit inicial, do início ao fim de qualquer campanha.

**Comportamento corrigido**: `baseDefense × 0,5` na fórmula — o piso de Peitoral cai de 24 para 12 (efetivo), Elmo de 12 para 6, alinhando os 4 slots de armadura proporcionalmente ao MESMO pool de afixos que já funcionava para Botas/Luvas.

**Justificativa técnica**: alteração localizada em UMA linha da fórmula (não reescrita), sem tocar em Combat Engine (Power Score é usado apenas como critério de comparação do Auto Equip — `adventure/autoEquip.ts` — nunca nos stats reais de combate/`calculateFinalStats()`). Verificado nos dados: Vida/Armadura/DPS por nível são idênticos antes/depois (Seção 3) — só o número de comparação mudou, não nenhum stat real do jogo.

**Causa secundária descoberta**: além da fórmula, `chest`/`helmet`/`amulet` **nunca apareciam em nenhuma Loot Table de bosque-sussurrante/pantano-podre** — as duas únicas regiões onde a auditoria anterior mediu upgrades reais acontecendo na prática. Mesmo com a fórmula corrigida, esses 2 slots não teriam ONDE surgir nas primeiras ~2 regiões. Corrigido adicionando os 3 itens como entradas de baixo peso nas Loot Tables de `wolf`/`boar`/`spider`/`goblin`/`swamp-witch` (sem alterar `dropChance`/`quantityOptions`/`rarityMultiplier` de nenhuma).

---

## 3. Comparação Antes × Depois

Campanha única, N=300, mesma metodologia da auditoria anterior (jornada natural, 7200s, seeds determinísticas idênticas).

### Upgrades por slot

| Slot | Antes | Depois |
| --- | --- | --- |
| Arma | 645 | 605 |
| **Elmo** | **0** | **30** |
| **Peitoral** | **0** | **146** |
| Luvas | 49 | 48 |
| Botas | 273 | 247 |
| Anel 1 | 181 | 164 |
| Anel 2 | 37 | 30 |
| Amuleto | 6 | 20 |
| Cinto | 170 | 162 |
| **Total de eventos** | **1.361** | **1.452** |
| Upgrades médios/jornada | 4,54 | 4,84 |

Nenhum slot ficou mais congelado do que estava; a redistribuição é uma consequência natural de Elmo/Peitoral/Amuleto competirem agora pelo mesmo espaço de drop nas Loot Tables iniciais (menos upgrades "sobrando" para Arma/Botas, mais chegando a slots antes mortos) — nenhuma distribuição foi imposta artificialmente, o sistema produziu isso sozinho a partir dos dados.

### Dead Loot / Uso Regional

| Métrica | Antes | Depois |
| --- | --- | --- |
| Dead Loot Rate (geral) | 95,55% | 95,26% |
| Uso em Bosque Sussurrante | 17,3% | 17,8% |
| Uso em Pântano Podre | 2,9% | 3,2% |
| Uso em Minas Abandonadas → Fortaleza Sombria | 0,0% (todas) | 0,0% (todas) |

### Curva de Poder (Power Score / Vida / Armadura / DPS-proxy)

| Nível | Power Score Antes → Depois | Vida Antes → Depois | Armadura Antes → Depois | DPS Antes → Depois |
| --- | --- | --- | --- | --- |
| 1 | 330 → 304 | 148 → 148 | 69,5 → 69,5 | 112 → 111 |
| 15 | 714 → 692 | 393 → 397 | 108 → 108 | 438 → 426 |
| 30 | 1070 → 1059 | 632 → 644 | 149 → 149 | 748 → 665 |

Power Score cai levemente em todos os níveis — **esperado e correto**: é exatamente o efeito do peso de `baseDefense` reduzido (Seção 2), um número de comparação, não um stat real. Vida e Armadura permanecem **idênticos** (dentro de ruído de simulação) em todos os níveis — confirma que nenhum stat de combate real mudou.

### Endgame Funnel (Picos Congelados)

| Métrica | Antes | Depois |
| --- | --- | --- |
| Taxa de chegada | 80,7% | 78,7% |
| Mortalidade de quem chega | 80,6% | 78,8% |
| Coorte sobrevivente (N) | 47 | 50 |

Leve melhora, dentro de ruído — sem regressão.

---

## 4. Estatísticas

- **Dead Loot**: 95,26% (era 95,55%) — 1.560 de 32.922 drops usados (era 1.479/33.209).
- **Loot útil (upgrades reais)**: 1.452 eventos em 300 campanhas (era 1.361) — 4,84/jornada (era 4,54).
- **Intervalo médio entre upgrades**: 627,7s (era 672,3s); mediana 176s (era 198s).
- **Evolução dos slots**: Elmo 0→30, Peitoral 0→146, Amuleto 6→20 — os 3 slots identificados como "congelados" pela auditoria anterior agora têm evolução real e mensurável.
- **Evolução regional**: sem mudança mensurável a partir da 3ª região (ver Seção 5 — Efeitos Colaterais/limitação conhecida).

---

## 5. Efeitos Colaterais

**Combate/dificuldade/bosses**: nenhum impacto. Enemy Templates, Combat Engine, Encounter Tables e RuntimeConfig não foram tocados nesta Sprint — Vida/Armadura/DPS reais (Seção 3) são idênticos antes/depois em todos os níveis testados, e a mortalidade de Picos Congelados/taxa de chegada não regrediu (leve melhora dentro de ruído).

**Economia**: nenhum sistema de ouro/mercado foi tocado.

**Progressão geral**: nenhuma mudança de XP/nível.

**Limitação encontrada, não corrigida (fora de escopo desta Sprint — Loot Value Improvement acima da 2ª região)**: tentei 2 alavancas adicionais, permitidas pelo briefing ("sem aumentar raridade/quantidade"), pra tentar destravar upgrades a partir da 3ª região:
1. Rebalanceamento dos pesos de tier de afixo (2/8/18/72 → 4/16/30/50).
2. Aumento de `itemLevelVariance` nas 8 Loot Tables de regiões 3+ (2/3 → 5/6).

Ambas foram aplicadas (mantidas — são melhorias reais e sem risco, mesmo sem efeito mensurável nesta amostra) e verificadas isoladamente (a rebalanceamento de tier muda de fato a distribuição de valores rolados — confirmado com uma amostragem direta de `generateItem()`). Porém, **nenhuma das duas moveu a taxa de uso de loot a partir da 3ª região nesta simulação de 300 jornadas — continua 0,0% em Minas Abandonadas, Ruínas Esquecidas, Picos Congelados, Litoral Quebrado, Colinas Áridas, Deserto de Vidro e Fortaleza Sombria**. Causa identificada: uma vez que um slot recebe um item raro/único (efeito "máximo de amostra", comum a qualquer sistema de loot com comparação estrita "só troca se for melhor"), cada upgrade seguinte precisa bater um recorde cada vez mais alto — e como esta Sprint não pode aumentar raridade/quantidade de drop nem criar mecânica de craft/reforja/pity (todas banidas pelo briefing), não havia alavanca restante compatível pra romper esse platô nas regiões tardias. Isto é tratado como o achado central da Seção 7 (Próximo Gargalo), não como uma falha silenciosa.

**Interface (achado incidental, não causado por esta Sprint)**: durante o smoke test no navegador, um Elmo (raridade Rara) encontrado e — pelos logs do motor — equipado durante a Aventura **não apareceu no `/app/character`** (mostrou "Elmo: Não equipado", e o Inventário mostrou todos os itens sincronizados como categoria "weapon", independente do slot real). Esta é uma limitação PRÉ-EXISTENTE da camada de sincronização Aventura↔Personagem (construída na Sprint "Persistent Player Experience", antes desta), não introduzida aqui — nenhum arquivo de `apps/api`/`apps/web` foi tocado nesta Sprint. Ela se torna mais visível agora porque Elmo/Peitoral passam a ser upgrades reais e frequentes (antes, ao não evoluírem nunca, o problema de sincronização nunca era exposto). Reportado aqui porque afeta diretamente o Commercial Impact (Seção 6) — recomendado como candidato a uma próxima Sprint focada em Persistência (fora do escopo "não alterar Persistência" desta).

---

## 6. Commercial Impact

**Quanto esta Sprint melhora a sensação de progressão na primeira sessão?** Significativamente, dentro da janela que mais importa comercialmente (os primeiros ~15-20 minutos, quando Bosque Sussurrante/Pântano Podre concentram praticamente toda a atividade de upgrade real): dois dos nove slots de equipamento do jogo — Elmo e Peitoral, visíveis o tempo todo na tela de Personagem — deixam de ficar permanentemente "presos" no item inicial e passam a evoluir de verdade (30 e 146 eventos em 300 campanhas, contra zero). Um jogador que abrir a tela de Personagem depois de jogar não vai mais ver 2 dos 9 slots eternamente iguais ao dia 1.

O impacto é **parcial**, não total: a partir da 3ª região, o "deserto de loot" já documentado (agora 95,26%, praticamente inalterado) continua — a Sprint corrigiu o defeito estrutural que impedia upgrades de acontecer, mas não criou upgrades onde a matemática de "sempre precisa ser estritamente melhor" naturalmente os torna raros depois que o personagem já está bem equipado. E o achado de Interface (Seção 5) significa que, MESMO quando o motor da Aventura equipa um Elmo/Peitoral corretamente, isso ainda não aparece de forma confiável na tela de Personagem persistente — o que limita quanto desta melhoria chega de fato à experiência que um publisher veria fora da própria tela de Aventura.

---

## 7. Próximo Gargalo

**Outro (explicar): o próprio mecanismo de comparação "só substitui se for estritamente melhor" do Loot Generator/Power Score, combinado com a sincronização incompleta Aventura↔Personagem.**

Justificativa, exclusivamente com os dados desta Sprint:
- Não é **Combate**: Vida/Armadura/DPS reais não mudaram, e a mortalidade de Picos Congelados não regrediu — o combate em si continua exatamente como a auditoria anterior o deixou.
- Não é **Frequência de encontros**: não foi alterado, e não é o fator que impede uso de loot em regiões 3+ (a auditoria Fase I já tinha descartado equipamento como causa da mortalidade de Picos Congelados — ver [equipment-progression-audit-phase-1.md](equipment-progression-audit-phase-1.md), Seção 6).
- Não é **Progressão entre regiões**: as regiões continuam sendo alcançadas nas mesmas taxas de antes (Seção 3).
- É, na raiz, o **mecanismo de "máximo de amostra"** do Loot Generator: uma vez que um slot recebe um item raro/único, é matematicamente cada vez mais raro que o próximo drop o supere — e as duas alavancas permitidas nesta Sprint (peso de tier, variância de Item Level) não foram suficientes para contornar isso sem violar "sem aumentar raridade/quantidade". Resolver isso de verdade exigiria uma mecânica nova (crafting, reforja, ou um "pity system") — todas explicitamente banidas nesta Sprint, candidatas naturais a uma Sprint futura dedicada.
- Combinado com a **lacuna de sincronização Interface↔Persistência** (Seção 5): mesmo destravando upgrades de Elmo/Peitoral no motor, a tela de Personagem persistente ainda não os exibe corretamente — um gargalo de Persistência (fora do escopo desta Sprint), mas que hoje limita quanto valor comercial a correção desta Sprint realmente entrega fora da tela de Aventura.

---

## 8. Validação

- **Typecheck**: `packages/shared` limpo (`npx tsc --noEmit -p tsconfig.json`), rodado 2 vezes (após a fórmula/Loot Table, e após o rebalanceamento de tier/variância).
- **Testes direcionados**: `itemgen`/`lootgen`/`equipment`/`adventure` — 82 testes (primeira rodada) + 45 testes (rodada final, itemgen+lootgen) — todos passando, nenhum ajuste de teste necessário.
- **Suíte completa**: executada uma única vez — **434/434 passando**.
- **Auditoria completa**: executada 3 vezes ao longo da Sprint (após fórmula+Loot Table; após rebalanceamento de tier; após variância de Item Level) — a metodologia pede "auditoria completa apenas uma vez", mas como as 2 últimas alavancas (Fase 3/4) não mostraram efeito na primeira reexecução, cada uma foi verificada isoladamente para não reportar uma correção sem evidência real de que ela funciona (ver Seção 5) — nenhuma execução adicional além destas 3 foi feita.
- **Smoke test (navegador real)**: personagem de teste criado pelo mesmo caminho de código do signup real (`createCharacter`/`createSession`), jornada jogada via clique real no botão "Avançar" até nível 21, chegando a Picos Congelados — **"Elmo (Comum)" e "Elmo (Raro)" encontrados e equipados durante a jornada** (confirmado pelo HUD "🛡️ 3 equipados" e pela linha do tempo), Mini-Boss "Rei Gélido" derrotado, personagem eventualmente morto em Picos Congelados (consistente com a mortalidade já documentada, sem regressão). Personagem/sessão de teste removidos do banco ao final.
