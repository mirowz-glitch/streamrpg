# Árvore de Progressão (Parte 4)

## Achado principal desta Parte

O Roadmap já ✅ Estável da Bible (capítulo 12) define a ordem:
**BossSystem → QuestSystem → Kingdoms → Economia 1.0 → Marketplace →
Referral → MetricsSystem.** Essa ordem está correta para os sistemas que
lista — mas **não lista Classes como um passo**, mesmo Classes sendo,
segundo praticamente todo outro documento lido nesta Sprint (Combat
Model, Gameplay Design, `boss-interface.md`, `mvp-readiness-review.md`),
o bloqueio mais citado do projeto: trava o multiplicador de dano real do
Boss (`Classe_mult`, hoje fixo em `1`), trava a diferenciação real de
build, e trava o caminho de gasto do Hero Token ("classe exclusiva").

**Recomendação registrada aqui, não decidida:** Classes precisa entrar
explicitamente na ordem do Roadmap — o lugar mais coerente com as
dependências encontradas é **logo após BossSystem, antes de
QuestSystem**, já que Quests provavelmente quer recompensas relevantes
por classe, e Boss já está pronto para receber o valor real assim que
existir (`Classe_mult` já é um termo isolado na fórmula canônica,
substituir `1` por um valor real não exige reescrever nada).

## Árvore de dependência

```
[FUNDAÇÃO — ✅ concluída, Marco 1.0]
Engine (EventBus/GameClock/SessionManager)
  └─ XP, Level, Welcome Reward, Drop (via Systems)
  └─ Gold (caminho legado, exceção documentada)

[MVP — ✅ majoritariamente concluído]
  └─ BossSystem (spawn→ativo→derrota/fuga→recompensa, visível na UI)
       └─ Combat Model canônico (rodando com termos neutros: Classe=1,
           Penetração=0, Bloqueio=0, Resistência do Boss=0)
       └─ Ranking, Overlay, Timeline/Estado do Reino (leitura pura)

[GARGALO — 🔴 bloqueia quase tudo abaixo]
  └─ Classes (Bible cap. 4, Placeholder)
       ├─ desbloqueia: Classe_mult real na fórmula canônica
       ├─ desbloqueia: 4 arquétipos com identidade numérica real
       │    (hoje Druida/Xamã convergem sem ela — ver riscos)
       ├─ desbloqueia: Hero Token → "classe exclusiva" (Bible cap. 10)
       └─ desbloqueia: Boss Escala (Sprint B5) fazer sentido balancear
            por classe, não só por HP/tier

[MVP+ — depende de Classes]
  └─ Boss Escala (Tiers 2+, hoje só Tier 1 calibrado)
  └─ Exploração / Regiões (0% código, 11 regiões já desenhadas)
       └─ depende também de: Combat Model completo (Resistência real
            por monstro, já desenhado em monsters-and-regions.md)
  └─ QuestSystem (Bible cap. 7, Placeholder)
       └─ depende também de: Exploração (onde a Quest acontece) e
            lore-ambiental.md (ganchos narrativos já escritos)

[KINGDOMS — depende de uma decisão de arquitetura, não só de design]
  └─ Kingdoms (Bible cap. 8, Placeholder)
       ├─ pergunta em aberto: Kingdom é só por canal, ou pode
       │    atravessar canais? (afeta tudo abaixo desta linha)
       └─ pergunta em aberto: precisa de sharding próprio? (Platform
            Audit, Bible cap. 12)

[ECONOMIA — pode avançar em paralelo a Kingdoms]
  └─ Economia 1.0 (Bible cap. 10, Em discussão)
       ├─ corrige o bug do RNG compartilhado (100% dos drops = comum)
       ├─ define sinks (hoje nenhum existe — Gold e itens só acumulam)
       └─ desbloqueia: Craft (hoje só uma palavra repetida, sem sistema)
  └─ Marketplace (Bible cap. 11 — estritamente depois de Economia 1.0,
       nunca antes, ordem já decidida)
  └─ Referral / Hero Token (Bible cap. 10)

[SEASONS / EVENTOS GLOBAIS — risco arquitetural real, ver riscos]
  └─ Seasons (Bible cap. 9, Placeholder)
       └─ Modificadores de Boss já crescem organicamente aqui
            (decisão já existente, Bible cap. 6)
       └─ Eventos verdadeiramente Global-scope (Estações, Lua Vermelha)
            só fazem sentido DEPOIS de Kingdoms resolver a pergunta
            "por canal ou cross-canal" — não antes

[EXPANSÃO — 1-5 anos, condicionado, não agendado]
  └─ Expansion 1 (~1 ano): 2-3 regiões novas (Lava, Abismo Selado),
       segundo anel de Vilas, primeira rota marítima expandida
  └─ Expansion 2 (~2 anos): Invasão como World Event real, segundo
       Boss escondido oficial, Kingdom Events cross-canal (se resolvido)
  └─ Horizonte 5 anos (especulativo, sem dependência de arquitetura
       assumível com confiança): segundo continente, Classes maduras
       interagindo com identidade de região, Legado visível no mundo
```

## MVP vs. MVP+ vs. Season 1/2 vs. Expansion 1/2

| Sistema | Onde pertence | Por quê |
|---|---|---|
| XP/Gold/Drop/Welcome/Boss/Ranking | **MVP** | Já rodando, já é o Roadmap ✅ Estável de hoje |
| Classes | **MVP** (recomendado, não decidido) | Bloqueia demais itens para esperar — deveria ser tratado como parte do MVP, não como DLC |
| Combat Model completo (Resistência real, Penetração, Bloqueio) | **MVP+** | Só faz sentido quando Exploração existir (monstros com perfis reais) |
| Exploração / Regiões | **MVP+** | Design já maduro (11 regiões), só falta código; depende de Classes para builds valerem a pena |
| QuestSystem | **MVP+** | Depende de Exploração existir para ter "onde" acontecer |
| Kingdoms (decisão de escopo) | **MVP+ → Season 1** | A decisão de arquitetura (por canal vs. cross-canal) deveria vir antes de Season 1 prometer qualquer evento global |
| Economia 1.0 | **MVP+ → Season 1** | Bloqueia Marketplace; pode e deve andar em paralelo a Kingdoms |
| Marketplace | **Season 1** | Ordem já decidida (depois de Economia 1.0) |
| Craft | **Season 1** (proposto) | Hoje é só uma palavra repetida — precisa de Economia 1.0 (sinks) para ter propósito |
| Referral / Hero Token | **Season 1** | Bible cap. 10 já o posiciona depois de Marketplace na sequência |
| Seasons (Modificadores de Boss crescendo) | **Season 1** | Já é o gancho decidido (Bible cap. 6) |
| Eventos Global-scope reais (Estações, Lua Vermelha) | **Season 2** (condicionado) | Só depois de Kingdoms resolver a pergunta cross-canal — nunca antes |
| Coleções | **Season 2** (proposto) | Precisa de Marketplace ou Kingdom para ter valor de exibição/troca, senão é o risco "coleção sem valor" |
| Ranking com título equipável | **Season 2** (proposto) | Espaço já reservado na UI (`.ranking-title-slot`), sem lógica — encaixe natural quando títulos existirem |
| Expansion 1 (novas regiões, 2ª ala do mundo) | **Expansion 1** | `future-expansion.md`, horizonte de ~1 ano, condicionado a Kingdoms resolvido |
| Invasão como World Event, Kingdom Events cross-canal | **Expansion 2** | `future-expansion.md`, horizonte de ~2 anos, condicionado a Kingdoms e Economia maduros |
| Legado, segundo continente, Classes maduras por região | **Além de Expansion 2** | Especulativo, sem dependência de arquitetura assumível com confiança hoje |

## O que pode esperar DLC/expansão sem prejudicar o MVP

- **Coleções** — não existe em nenhum design hoje; pode esperar sem
  custo, porque nada mais depende dela.
- **Craft** — repetidamente mencionado, nunca desenhado; pode esperar
  até Economia 1.0 dar um motivo real (sink) para existir.
- **Eventos Global-scope verdadeiros** — devem esperar, porque
  implementá-los antes de Kingdoms decidir "por canal ou cross-canal"
  arrisca retrabalho arquitetural real (o mesmo tipo de risco que o
  próprio `consistency-report.md` já nomeia para "decisão fora de
  ordem").
- **Legado** — deliberadamente não promovido (ver memória do projeto);
  esperar por Marketplace/Economia madura antes de reabrir a hipótese.
- **Segundo continente** — o próprio World Design já disse que "múltiplos
  continentes é claramente um caminho de anos, não um ponto de partida."

## O que pertence ao MVP e não deveria esperar

- **Classes** — apesar de não estar no Roadmap ✅ Estável como passo
  explícito, esta Sprint recomenda tratá-lo como parte do MVP (ou o
  primeiro item logo após), porque adiar mais tempo já está bloqueando
  Boss Escala, Quests e a identidade de build prometida desde o Sprint 4
  do Gameplay Design.
