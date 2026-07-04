# Roadmap de Longo Prazo (Parte 9)

Sem datas — apenas ordem lógica. A lógica de dependência completa está em
[progression-tree.md](progression-tree.md); este documento só organiza o
mesmo conteúdo na moldura MVP → MVP+ → Season 1 → Season 2 → Expansion 1
→ Expansion 2 pedida por esta Sprint. Não substitui o Roadmap ✅ Estável
da Bible (capítulo 12) — é a mesma ordem, com Classes inserida
explicitamente (ver achado principal em `progression-tree.md`) e
estendida até o horizonte de expansão que a Bible ainda não cobre.

## MVP (já majoritariamente entregue)

- Engine (EventBus, GameClock, SessionManager) — ✅ concluído.
- XP, Level, Welcome Reward, Drop via Engine — ✅ concluído (Marco 1.0).
- Gold via caminho legado — ✅ concluído, exceção documentada.
- BossSystem completo e visível (spawn → ativo → derrota/fuga →
  recompensa → overlay/Timeline) — ✅ concluído.
- Ranking, Overlay, Estado do Reino — ✅ concluído.
- **Classes** (recomendação desta Sprint, não decisão da Bible ainda) —
  🔴 pendente, é o item que mais bloqueia tudo depois dele.

## MVP+

- Boss Escala (Tiers 2+, calibração real via playtest).
- Combat Model completo dentro do Boss (Resistência real, Penetração,
  Bloqueio — hoje termos neutros).
- Exploração / Regiões (design já maduro, 0% código).
- QuestSystem (depende de Exploração existir).
- Decisão de arquitetura de Kingdoms (por canal vs. cross-canal;
  necessidade de sharding).

## Season 1

- Economia 1.0 (RNG independente, `DROP_CHANCE`/pesos revisados, sinks).
- Marketplace (estritamente depois de Economia 1.0).
- Craft (só depois de Economia 1.0 definir pesos de raridade reais).
- Referral / Hero Token.
- Modificadores de Boss crescendo organicamente (gancho já decidido em
  Bible cap. 6).
- MetricsSystem (último item do Roadmap ✅ Estável da Bible).

## Season 2

- Eventos verdadeiramente Global-scope (Estações, Lua Vermelha) — **só**
  depois da decisão de Kingdoms sobre escopo cross-canal, reinterpretando
  "Global" como "mesma regra aplicada independentemente por Kingdom" (ver
  `risks-and-mitigations.md`, risco 9).
- Coleções (só depois de Marketplace/Kingdom darem valor de troca ou
  exibição).
- Título de Ranking equipável (espaço já reservado na UI hoje).

## Expansion 1 (~1 ano de horizonte, condicionado — não agendado)

- 2-3 regiões novas (candidatos já teasados: Lava, Abismo Selado).
- Segundo anel de Vilas.
- Rota marítima expandida (segunda cidade costeira, travessias reais).

## Expansion 2 (~2 anos de horizonte, condicionado — não agendado)

- Invasão como World Event real (diferenciação de Boss ainda em aberto,
  precisa ser resolvida antes).
- Segundo Boss escondido oficial (hoje só um hipótese em rascunho, "O
  Guardião sem Nome").
- Kingdom Events cross-canal — só se a arquitetura de Kingdoms permitir.

## Além de Expansion 2 (especulativo, sem dependência assumível hoje)

- Segundo continente ou expansão vertical do primeiro.
- Classes maduras interagindo com identidade de região (regiões que hoje
  só recompensam "traço de combate" passam a recompensar Classe
  específica).
- Legado visível no mundo (estátuas, menções em lore-ambiental.md,
  referências a Kingdoms que bateram marcos raros primeiro) — condicionado
  à hipótese de Character Legacy ser promovida, o que esta Sprint não
  decide.
- Seasons narrativas completas (arcos conectados de várias semanas, ex.:
  Corrupção Crescente → Guerra Regional → Festival de vitória).

## O que este roadmap explicitamente não faz

Não promete datas. Não assume que nenhuma fase "vai dar certo" antes da
anterior validar isso com dados reais de playtest — o mesmo princípio que
`future-expansion.md` já usa para o mundo se aplica aqui ao jogo inteiro:
nenhuma fase deveria assumir que a anterior "não funcionou," e nenhuma
fase deveria ser desenhada em detalhe de implementação antes de sua vez
chegar de verdade.
