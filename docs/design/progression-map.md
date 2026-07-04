# Mapa de Progressão (Partes 1 e 2)

## Parte 1 — O mapa completo, em uma frase por sistema

| Sistema | Status hoje (código) | Status hoje (design) | Fonte |
|---|---|---|---|
| XP / Level / Welcome / Drop | 🟢 Rodando via Engine (Marco 1.0) | ✅ Estável (Bible cap. 5) | `mvp-readiness-review.md` |
| Gold | 🟢 Rodando via caminho legado (`applyPing`), decisão deliberada | ✅ Estável, exceção documentada | Bible cap. 5, `atomic-update-guideline.md` |
| Boss | 🟢 Rodando e visível (spawn→ativo→derrota→recompensa→overlay) | ✅ Estável (MVP fechado) | Bible cap. 6, `boss-experience-review.md` |
| Combat Model (fórmula canônica) | 🟡 Rodando no Boss só com termos neutros (Classe=1, Penetração=0, Bloqueio=0) | ✅ Estável | `combat-model-runtime-review.md` |
| Ranking | 🟢 Rodando, com barra de progresso e gap de XP | ✅ Estável | `identity-progression-review.md` |
| Mundo/mapa social (Timeline, Estado do Reino) | 🟢 Rodando (leitura pura) | — | `world-simulation-review.md` |
| Classes | 🔴 Não existe (`class` não é coluna) | 📌 Placeholder — 4 arquétipos em rascunho | Bible cap. 4, `gameplay-design/06-classes-skills.md` |
| Exploração / Regiões | 🔴 0% código | 🟠 Rascunho maduro (11 regiões, grafo, cidades) | `world-design/regions.md` |
| Quests | 🔴 Não existe | 📌 Placeholder | Bible cap. 7 |
| Kingdoms | 🔴 Não existe além do conceito "1 instância por canal" | 📌 Placeholder | Bible cap. 8 |
| Economia 1.0 (RNG fix, sinks) | 🔴 Bug do RNG compartilhado ainda ativo (100% dos drops = comum) | 🚧 Em discussão | Bible cap. 10 |
| Marketplace | 🔴 Não existe | 🚧 Em discussão | Bible cap. 11 |
| Seasons / Eventos globais | 🔴 Não existe | 📌 Placeholder, risco arquitetural aberto | Bible cap. 9, `world-events.md` |

Esta tabela é o "hoje" contra o qual toda fase abaixo é medida — nenhuma
fase pressupõe um sistema que não esteja, no mínimo, desenhado em algum
documento existente.

## Como ler as fases abaixo

As fases (primeiras horas → 1000h) descrevem **a experiência pretendida
de um jogador dedicado, assumindo que o Roadmap (Bible cap. 12) já
entregou os sistemas na ordem nele definida**: BossSystem → QuestSystem →
Kingdoms → Economia 1.0 → Marketplace → Referral → MetricsSystem. Horas
de jogo e meses de calendário são eixos diferentes — um jogador muito
ativo pode cruzar "100 horas" em poucas semanas, antes de Classes sequer
existir. Por isso cada fase assume **"quando os sistemas relevantes já
existirem"**, não uma data. Onde um sistema necessário para a fase ainda
não tem uma linha de código, isso é dito explicitamente — a fase descreve
a experiência-alvo, não uma promessa de calendário.

---

## Parte 2 — Fases

### Primeiras horas (0–3h)

- **O que busca:** entender o que está acontecendo. "Estou ganhando algo
  só de assistir?" — validar que o loop é real antes de investir atenção.
- **O que desbloqueia:** Welcome Reward (primeira vez), primeiro XP,
  primeiro Gold, primeiro Drop (hoje sempre raridade comum — bug
  conhecido do RNG compartilhado, ver
  [risks-and-mitigations.md](risks-and-mitigations.md)), primeiro Equip
  (agora com os 6 slots sempre visíveis e "Poder Total", Sprint Identity &
  Progression).
- **O que aprende:** presença gera progresso automaticamente; o
  personagem é seu, não do canal (Princípio 1 da Bible) — mesmo trocando
  de canal, o personagem continua o mesmo.
- **O que sente:** curiosidade cautelosa. Honestamente, hoje esta é a
  fase mais frágil do jogo — `first-player-experience-review.md` mediu
  Diversão 2/10 e Economia 1/10 nesta janela antes das Sprints de UX
  recentes (Player Feedback Bridge, Equipment Experience, Boss
  Experience, Identity & Progression); o objetivo dessas Sprints foi
  exatamente elevar o "sente" desta fase sem mudar nenhuma regra.

### Primeira semana (~5–15h)

- **O que busca:** o primeiro momento coletivo — um Boss de verdade, não
  só números pessoais subindo.
- **O que desbloqueia:** participação em Boss (recompensa proporcional à
  presença, hoje sem bônus real por dano — ver
  `boss-reward-balance-study.md`), visibilidade de Ranking, primeiro
  vislumbre do "Estado do Reino" (jogadores ativos, Bosses derrotados,
  Gold em circulação — painel real, Sprint World Simulation).
  d
- **O que aprende:** Boss é um evento de **canal inteiro** (Kingdom),
  não pessoal — todo mundo presente contribui para uma única barra de
  HP; o Reino continua existindo e acumulando história mesmo quando o
  jogador não está olhando.
- **O que sente:** "algo importante aconteceu" — a frase que a própria
  Sprint Boss Experience usou como critério de sucesso. É o primeiro
  momento social do jogo.

### Primeiro mês (~30–60h)

- **O que busca:** variedade de objetivos — já sabe ganhar XP/Gold/item,
  agora quer algo para *decidir*, não só acumular.
- **O que desbloqueia (assumindo Roadmap em dia):** primeiras Quests
  (Bible cap. 7, ainda Placeholder — quando existir, usa os ganchos de
  lore já escritos: Templo Esquecido, Castelo Destruído, Navio Encalhado,
  per `future-expansion.md`); primeira Região jogável de verdade
  (Exploração é hoje 0% código — `world-design/regions.md` já tem 11
  regiões desenhadas e prontas para virar conteúdo real).
- **O que aprende:** builds diferentes servem propósitos diferentes —
  Dano (velocidade de expedição), Tanque (acesso a conteúdo difícil),
  Suporte (valor social via SUS em grupo), Velocidade (alcance em
  ambientes penalizantes), Utilidade (nichos de detecção/resistência a
  controle) — tabela completa em `gameplay-design/04-builds.md`. Também
  aprende que descobertas (atalhos, áreas secretas) ficam permanentes
  para o Kingdom inteiro, não só para si (`world-design/exploration.md`).
- **O que sente:** "isso tem profundidade" — o jogo deixa de ser só um
  contador de XP e começa a parecer um mundo com decisões reais.

### 100 horas

- **O que busca:** identidade — uma Classe real, não um rótulo estático
  ("Aventureiro" hoje é placeholder de UI sem coluna no banco, Sprint
  Identity & Progression).
- **O que desbloqueia (assumindo Roadmap em dia):** Classes (Guerreiro/
  Druida/Caçador/Xamã, `gameplay-design/06-classes-skills.md` — hoje só
  rascunho, Bible cap. 4 ainda Placeholder); Economia 1.0 (RNG
  independente corrigido — raridades além de comum finalmente possíveis);
  primeiros itens raros/épicos de verdade.
- **O que aprende:** build = Classe + Equipamento junto, não só
  Equipamento sozinho; o Reino (Kingdom) tem uma identidade acumulada
  mensurável — quantos aventureiros, quantos Bosses derrotados, quanto
  Gold em circulação (já exposto hoje em `/app/world`).
- **O que sente:** maestria — "eu entendo como meu personagem funciona,
  e escolhi isso."

### 300 horas

- **O que busca:** trocar decisões antigas por novas (vendeu a build
  errada, quer a rara que só o Marketplace tem), e um motivo para se
  importar com o *futuro* do jogo, não só com o próprio personagem.
- **O que desbloqueia (assumindo Roadmap em dia):** Marketplace (após
  Economia 1.0, nunca antes — ordem já decidida em Bible cap. 11); Hero
  Token/Referral; primeira Season real (Modificadores de Boss que já
  crescem organicamente entre temporadas, per Bible cap. 6).
- **O que aprende:** economia viva — preço vem de decisão de jogador, não
  de tabela fixa ("o mercado tem que estar fluindo", Bible cap. 11); Boss
  tem tiers reais de escala (hoje só Tier 1 está calibrado — ver
  [progression-tree.md](progression-tree.md)).
- **O que sente:** pertencimento a uma economia de verdade, e orgulho de
  Kingdom — "meu canal já derrotou N Bosses" vira uma métrica social, não
  só pessoal.

### 1000 horas

- **O que busca:** conteúdo novo (não repetição do mesmo Boss/região),
  e reconhecimento de ter ajudado a construir algo que durou.
- **O que desbloqueia (assumindo Roadmap + Expansion em dia):** Season 2,
  possivelmente uma segunda ala do mundo (segundo continente ou expansão
  vertical — horizonte de 2-5 anos per `future-expansion.md`); eventos de
  escala verdadeiramente global (Estações, Lua Vermelha) **se** a questão
  arquitetural de Kingdoms cruzarem-canais for resolvida antes (ver
  [risks-and-mitigations.md](risks-and-mitigations.md), risco "Eventos
  Globais vs. Kingdoms Independentes").
- **O que aprende:** o mundo muda com o tempo de verdade — arcos
  narrativos de várias semanas (ex.: Corrupção Crescente → Guerra
  Regional → Festival de vitória), não eventos isolados.
- **O que sente:** veterania — "eu joguei desde quando isso era menor."
  Esse sentimento hoje não tem nenhum sistema dedicado a reconhecê-lo
  (ver gap de "Legado" em
  [risks-and-mitigations.md](risks-and-mitigations.md)) — é um risco de
  retenção de longuíssimo prazo, não uma lacuna resolvida.

---

## "Buracos" de progressão identificados neste mapa

1. **Entre "primeiras horas" e "primeira semana":** o loop pessoal (XP/
   Gold/Drop) já existia antes das Sprints de UX recentes, mas o
   sentimento de progresso ficou para trás — parcialmente resolvido
   (Player Feedback Bridge, Identity & Progression), mas o Drop RNG bug
   (100% comum) ainda está ativo e some com a sensação de "sorte" nessa
   fase até Economia 1.0.
2. **Entre "primeiro mês" e "100 horas":** depende inteiramente de
   Exploração/Regiões (hoje 0% código) e Classes (Placeholder) — sem os
   dois, um jogador de 40h e um de 90h têm exatamente a mesma experiência
   disponível. Este é o buraco mais largo do mapa hoje.
3. **Entre "300 horas" e "1000 horas":** endgame real. Mesmo quando
   Marketplace/Season 1 existirem, `world-design-review.md` já registrou
   que não existe conteúdo repetível além da Fortaleza Sombria (nível
   35+) — um jogador que "termina" o mundo atual não tem para onde ir
   até Expansion 1. Ver risco "Jogador sem objetivo" em
   [risks-and-mitigations.md](risks-and-mitigations.md).
