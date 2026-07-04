# Kingdom Prestige System (MVP) — Review

Primeira identidade coletiva de CANAL — Prestígio do Reino e Hall da
Fama de 6 cargos. Nenhuma regra de gameplay foi alterada; XP, Gold,
Drops, Combat, Boss, Economy, Expedições e Encounter continuam
byte-a-byte como estavam antes desta Sprint. Tudo aqui é identidade
coletiva, não poder.

## Arquitetura (Etapa 1, 8)

Mesmo espírito arquitetural do Founder Identity & Prestige, mas com uma
diferença central: lá, um desbloqueio é permanente (`character_titles`/
`character_frames`, nunca revogado). Aqui, um **cargo** é "quem ocupa
agora" — `kingdom_roles` (`PRIMARY KEY (channel_id, role_slug)`) guarda
só o ocupante atual de cada cargo por canal, substituído (`UPDATE`, nunca
uma segunda linha) sempre que outro personagem ultrapassa o critério.

Os 6 cargos (👑 Guardião, ⚔ Campeão dos Bosses, 🗺 Grande Explorador, ⭐
Herói do Reino, 📅 Membro Mais Antigo, 🔥 Maior Sequência) são cada um
uma leitura pura sobre dado que já existe:

| Cargo | Critério (leitura real) |
|---|---|
| Guardião | Maior `total_xp` em `channel_rankings` deste canal |
| Campeão dos Bosses | Mais `boss_rewards.outcome='defeated'` entre Bosses **deste canal** |
| Grande Explorador | Entre membros do canal, mais regiões distintas concluídas (`expeditions`, dado global do personagem — Expedições nunca carregam `channelId`, por isso `viewer_sessions` é usado como ponte para "quem é deste canal") |
| Herói do Reino | Composto: XP no canal + Bosses derrotados no canal×50 + regiões×20 |
| Membro Mais Antigo | Menor `first_ping_at` em `viewer_sessions` deste canal |
| Maior Sequência | Maior sequência de dias consecutivos com `viewer_sessions` neste canal (calculado em JS sobre `session_date`) |

Um `KingdomPrestigeSystem` novo reage a `world.tick` (mesmo padrão do
`IdentitySystem`: só recalcula canais com alguém presente neste tick,
nunca varre canais irrelevantes) e emite `kingdom.role_changed` só
quando o ocupante de um cargo realmente muda.

**Etapa 8 (preparar infraestrutura):** `getKingdomPrestige(channelId)`
(`kingdom-prestige.service.ts`) é hoje o único ponto de leitura que uma
feature futura (liberar regiões, NPCs, eventos, Bosses, dungeons,
temporadas) precisaria importar para gatear algo por Prestígio. Nada
consome isso ainda — nenhuma dessas features existe nesta Sprint, só a
leitura pronta, com um `breakdown` explícito (XP, Bosses, membros,
minutos, regiões) para que a decisão de peso/threshold seja tomada no
lugar certo, no futuro, sem precisar reabrir este arquivo.

## Integração (Etapas 3-7, 9)

- **Mundo (`/app/world`):** ganhou um filtro `?channel=` (mesmo padrão já
  usado pelo Ranking) que transforma a página numa página de Reino de
  verdade: Banner ("Reino de {nome}"), Prestígio (score + breakdown em
  números), Hall da Fama (sempre os 6 cargos, ocupante ou "Ainda sem
  ocupante"), Estatísticas e Últimas conquistas (histórico de trocas de
  cargo deste canal). Sem canal, a página continua mostrando o agregado
  GLOBAL de sempre (nada regride).
- **Overlay:** só os 2 cargos mais importantes (Guardião + Campeão dos
  Bosses) — `getHallOfFameHighlights()` filtra explicitamente, "sem
  poluir" como pedido na Etapa 5.
- **Perfil (Character Page):** nova linha "Cargo(s) no Reino de
  {canal}" — usa o mesmo canal já resolvido por `usePing` (o mesmo que
  alimenta BossCard/ExpeditionPanel), porque cargo é um conceito de
  Reino, não existe sem um canal.
- **Ranking:** ícones dos cargos (`role_icons`) só aparecem quando o
  Ranking está filtrado por canal — cargo não tem versão global (mesmo
  motivo pelo qual `RankingResponse.channel` já podia ser `null`).
- **Timeline:** toda troca de cargo vira evento incondicional (mesmo
  critério "sem filtro" já usado para Título/Moldura) — "{ícone do
  cargo} {nome} tornou-se {cargo}.", ex: "👑 Hudson tornou-se Guardião do
  Reino." — e também alimenta o histórico de conquistas **daquele canal
  específico**, usado pela seção "Últimas conquistas" da própria página
  do Reino.

## Verificação

- **Typecheck** (`apps/api`, `apps/web`): limpo; mesma baseline de erros
  pré-existentes (arquivos de teste e um `rootDir` do `@streamrpg/shared`
  já conhecido de Sprints anteriores) — nenhum arquivo novo desta Sprint
  aparece na lista de erros.
- **Build** (`esbuild`): limpo.
- **Harness** (EventBus real, DB isolada, 2 personagens A e B): A começa
  com mais XP no canal — um único `world.tick` concede a A todos os 5
  cargos com dado real (Guardião, Campeão dos Bosses, Grande Explorador,
  Herói do Reino, Membro Mais Antigo); Hall da Fama sempre retorna os 6
  cargos (o 6º, Maior Sequência, sem dado suficiente no teste, aparece
  como "sem ocupante" em vez de erro); evento de cargo aparece na
  Timeline no formato exato pedido; segundo tick sem mudança não duplica
  evento nem linha em `kingdom_roles` (`PRIMARY KEY` respeitada); B
  ultrapassa A em XP — terceiro tick transfere o cargo de Guardião para
  B, gera um NOVO evento de Timeline ("Desafiante tornou-se Guardião do
  Reino.") e **atualiza** (não duplica) a linha em `kingdom_roles`;
  Prestígio calculado bate com os dados reais inseridos; ícones de cargo
  em lote (Ranking) e cargos por personagem num canal (Perfil) batem com
  o estado real; canal inexistente retorna listas vazias, nunca erro.
  Todos os 25 checks passaram.
- **Browser ao vivo:** canal de teste com 1 personagem ocupando 5 dos 6
  cargos. Confirmado nos 4 lugares: Mundo (Banner "Reino de
  KingdomPreview", Prestígio 310, Hall da Fama com os 5 cargos reais +
  "Ainda sem ocupante" no 6º, Últimas conquistas vazia — coerente, os
  cargos foram semeados diretamente, sem passar por `world.tick`, então
  nenhuma troca real aconteceu ainda para gerar conquista), Overlay
  (só 👑 e ⚔ aparecem, os outros 4 cargos não poluem o overlay), Ranking
  filtrado por canal (`⚔ 🗺 👑 ⭐ 📅` ao lado do nome), Perfil ("Cargos no
  Reino de kingdom-preview-channel: 👑 Guardião do Reino · ⚔ Campeão dos
  Bosses · 🗺 Grande Explorador · ⭐ Herói do Reino · 📅 Membro Mais
  Antigo"). Todos os dados de teste removidos ao final (confirmado por
  contagem zero em cada tabela tocada).

## Regressão

Confirmado por inspeção: nenhuma linha de `XPSystemV2`, `DropSystem`,
`BossCombatSystem`, `BossRewardSystem`, `BossSpawnSystem`,
`BossParticipationSystem`, `ExpeditionSystem`, `xp.service.ts` (caminho
de Gold/ping) ou `combat-model` foi tocada nesta Sprint. Os únicos
arquivos existentes modificados (`overlay.ts`, `ranking.ts`, `world.ts`,
`world-state.service.ts`, `server.ts`, `schema.ts`, `engine/types.ts`,
`CharacterPage.tsx`, `OverlayPage.tsx`, `RankingPage.tsx`,
`WorldPage.tsx`, `styles.css`) receberam apenas adições — uma tabela
nova, campos opcionais novos em respostas já existentes, um Sistema
novo registrado. Nenhuma recompensa nova, nenhum balanceamento de
combate novo.

## Respostas

**O Reino parece uma comunidade?**
Mais do que antes: ao abrir a página Mundo com um canal selecionado, o
visitante vê um nome próprio ("Reino de KingdomPreview"), um placar
próprio (Prestígio) e pessoas reais ocupando papéis nomeados — não só
"6 aventureiros, 1 Boss derrotado" (o agregado global genérico que já
existia). É um primeiro passo real na direção de "comunidade", mas
ainda depende de mais gente jogando no mesmo canal para o Hall da Fama
parecer disputado, não só preenchido.

**Existe motivo para defender o Reino?**
Sim, num sentido direto: cada cargo pode ser tomado por outro jogador a
qualquer momento (diferente de Título/Moldura, que nunca são perdidos).
Ser Guardião hoje não garante nada amanhã — isso cria tensão real, o
oposto de "conquistei e esqueci". O motivo é mais individual
("defender meu cargo") do que coletivo ainda ("defender o Reino contra
outro Reino") — não existe hoje nenhuma comparação entre Reinos
diferentes, só dentro do mesmo canal.

**Os cargos ficaram desejáveis?**
Têm os ingredientes certos: nome, ícone, critério real, e podem ser
perdidos — mas a Sprint não constrói nenhuma recompensa cosmética
própria de cargo (uma borda especial, uma menção diferente no Overlay
além do texto simples) como Título/Moldura já têm. Hoje o cargo é
desejável pelo *status* (aparecer no Hall da Fama, no Ranking, no
Overlay), não por nenhum benefício visual adicional — o que é coerente
com "identidade, não poder", mas é um limite real de desejabilidade que
uma Sprint futura poderia resolver.

**O Prestígio prepara corretamente as futuras expansões?**
Sim: `getKingdomPrestige()` retorna um `score` e um `breakdown`
detalhado (XP, Bosses, membros, minutos, regiões), pronto para ser
importado por qualquer sistema futuro sem precisar recalcular nada.
Nenhum peso foi calibrado para valer como balanceamento — são
ilustrativos, documentados como tal, exatamente como todo outro valor
não calibrado do projeto. A única lacuna: como nenhuma feature futura
existe ainda, não há como validar se o `score` de hoje realmente serve
como gate (ex: "Prestígio 500 libera uma região") sem antes decidir os
limiares em outro documento de design.

**O sistema evita recompensar apenas quem deixa a live aberta?**
Foi um cuidado deliberado desta Sprint: "Herói do Reino" não usa minutos
assistidos puros (o dado mais fácil de acumular passivamente) — usa um
composto de XP + Bosses derrotados + regiões descobertas, todos exigindo
engajamento real (ping ativo, presença em combate, expedição
completada). "Guardião" (XP no canal) e "Grande Explorador"/"Campeão dos
Bosses" já herdam qualquer proteção anti-AFK que XP/Boss/Expedição já
tinham antes desta Sprint (nenhuma foi alterada aqui). A exceção
honesta é "Membro Mais Antigo": por definição, é tempo de casa, não
esforço — não finge ser outra coisa. "Maior Sequência" exige pelo menos
um ping por dia para manter a sequência, o que já é mais esforço do que
simplesmente deixar uma aba aberta.
