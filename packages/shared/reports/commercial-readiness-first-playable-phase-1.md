# Vertical Slice — Commercial Readiness & First Playable Experience (Phase I)

Metodologia desta Sprint: em vez de um audit só de código, foi criado um personagem de teste REAL via o mesmo caminho de código que um jogador novo usaria (`createCharacter`/`createSession`, `apps/api/src/routes/character.ts`/`middleware/auth.ts` — nenhuma rota nova, só um fixture de QA local pra contornar o login Twitch real, que exige credenciais externas) e a jornada foi jogada de fato no navegador (`/app/character`, `/app/adventure`, `/app/inventory`) clique a clique, lendo o DOM real a cada passo. Todos os achados abaixo vêm dessa sessão real, não de leitura de código isolada.

---

## 1. Arquivos modificados

| Arquivo | O que mudou |
| --- | --- |
| `packages/shared/src/itemgen/rarities.ts` | `label` traduzido: Common/Magic/Rare/Unique → Comum/Mágico/Raro/Único |
| `packages/shared/src/itemgen/baseItems.ts` | `name` de todos os 14 Base Items traduzido pra português (Sword→Espada, Boots→Botas, etc.) |
| `packages/shared/src/equipment/slots.ts` | `label` dos 9 slots traduzido (Weapon→Arma, Ring 1→Anel 1, etc.) |
| `apps/web/src/components/hud/LootPopup.tsx` | Usa `getBaseItem`/`getRegionName` em vez de ids brutos |
| `apps/web/src/components/hud/EquipmentPopup.tsx` | Usa `getBaseItem`/`getEquipmentSlotDefinition` em vez de ids brutos |
| `apps/web/src/components/hud/PermanentStatsBar.tsx` | "🏆 Melhor item" usa `getBaseItem` em vez do id bruto |
| `apps/web/src/components/hud/EventFeed.tsx` | Localiza item/slot/raridade; corrige `EncounterStarted` pra usar `getRegionName` (inconsistência com o resto do arquivo); melhora o texto de "Bênção" quando o Santuário concede zero |
| `apps/web/src/components/onboarding/WelcomeCard.tsx` | Rótulo do botão corrigido ("Começar aventura" → "Entendido, vamos lá!") |
| `apps/web/src/pages/AdventurePage.tsx` | Subtítulo explicando que a página é uma prévia interativa do motor |
| `apps/web/styles.css` | Estilo do novo subtítulo (`.hud-adventure-subtitle`, reaproveita o padrão de `.hint`) |

Nenhum sistema, mecânica, arquitetura ou algoritmo foi alterado — todas as mudanças são texto/apresentação, reaproveitando tabelas e funções já existentes (`getBaseItem`, `getEquipmentSlotDefinition`, `getRegionName`, `ITEM_GEN_RARITIES`).

---

## 2. Problemas encontrados

**UX / Comunicação:**
- O botão "Começar aventura" no card de boas-vindas só dispensa o próprio card (`setFlag("welcome_seen")`) — não navega pra lugar nenhum. Um jogador clicando nele esperando ir pra uma aventura via o guia NPC "Eldrin" que aparece em seguida, apontando pra Cidade, sem nunca mencionar Aventura.
- A página `/app/adventure` roda uma sessão de demonstração inteiramente no navegador (`useAdventureSession.ts`: `DEMO_CHARACTER_ID = "vertical-slice-hero"`, comentário já existente no código: "nenhuma chamada de API, nenhum dado do personagem real") — mas a UI não comunicava isso. Um jogador que sobe de nível e equipa itens ali, depois vai em "Personagem" (`/app/character`) e vê nível 1, 0 XP, tudo "Não equipado" — parece um bug ("meu progresso sumiu"), quando na verdade são dois sistemas propositalmente separados (Adventure = prévia do motor; Character = personagem real, progredido por tempo assistido, confirmado pela mensagem já existente no Inventário: "Continue assistindo — drops têm boa chance a cada minuto de presença").

**Clareza / Nomenclatura (Fase 2/6):**
- Itens e slots apareciam com ids brutos em inglês minúsculo numa interface 100% português: "Item encontrado: boots (magic)", "Equipado: belt no slot belt", "🏆 dagger (7)". Raízes: `ITEM_GEN_RARITIES`/`ITEM_GEN_BASE_ITEMS`/`EQUIPMENT_SLOT_DEFINITIONS` (todos em `packages/shared`) tinham seus campos `label`/`name` em inglês desde que foram criados — nenhum outro lugar do jogo os usava pra exibição até esta Sprint expor o problema.
- `EventFeed.tsx`'s `EncounterStarted` mostrava `regionId` cru ("Encontro iniciado em bosque-sussurrante") enquanto TODOS os outros casos do mesmo arquivo (RegionUnlocked/EliteEncounter/etc.) já usavam `getRegionName()` — inconsistência isolada, não intencional.

**Feedback (Fase 3):**
- A Bênção do Santuário pode conceder 0 HP/0 XP/0 ouro — e o texto mostrava literalmente "Bênção recebida: +0 HP, +0 XP, +0 ouro" logo depois de "Evento encontrado: Altar Antigo". Um evento anunciado com entusiasmo ("descobri algo!") seguido de um resultado explicitamente nulo é um anticlímax que mina exatamente o "por que explorar" que a Sprint pede pra garantir.

**Gameplay observado (funciona bem, sem necessidade de mudança):**
- Level up, checkpoint de expedição, objetivo concluído, "novo melhor item"/"novo recorde de dano" já geram uma linha de feedback clara na Linha do Tempo — a base de reward feedback já existe e funciona, só precisava da localização de nomes acima.
- O popup de equipamento (`EquipmentPopup`) já mostra um delta de Power Score (+/-) colorido — resposta direta e correta à pergunta da Fase 4 ("existe comparação clara ao trocar equipamento?").

---

## 3. Melhorias realizadas

| Melhoria | Que problema resolvia | Como melhora a experiência | Por que aumenta o valor comercial |
| --- | --- | --- | --- |
| Localização de nomes de item/slot/raridade | Ids brutos em inglês minúsculo numa UI português | O jogador lê "Botas Mágicas" em vez de "boots (magic)" — informação legível sem precisar traduzir mentalmente | Um publisher/investidor lendo "boots" numa demo pensa "protótipo técnico"; ler "Botas" pensa "produto acabado" |
| Correção do `EncounterStarted` | Inconsistência isolada dentro do próprio feed de eventos | Toda a Linha do Tempo agora fala consistentemente sobre "Bosque Sussurrante", nunca mistura com "bosque-sussurrante" | Pequenos detalhes inconsistentes acumulam a sensação de "não polido" |
| Texto da Bênção quando o resultado é zero | Anticlímax explícito ("+0" três vezes) | Frase neutra em vez de números nulos — a descoberta continua sendo uma descoberta, só sem recompensa desta vez | Recompensa (ou a ausência dela) precisa ser comunicada com intenção, não como um "bug visual" de zeros |
| Rótulo do botão de boas-vindas | Prometia "iniciar aventura" e não fazia nada disso | O jogador não fica esperando uma navegação que nunca vem | Uma primeira ação que não faz o que promete é o pior tipo de atrito nos primeiros 10 minutos |
| Subtítulo explicativo na página Aventura | Progresso "desaparecendo" ao trocar de página parecia bug | Contextualiza a página como uma prévia intencional do motor, não um erro | Evita que um publisher interprete uma decisão de arquitetura legítima como um defeito |

---

## 4. Antes × Depois (percepção do jogador, não só técnica)

**Antes**: um jogador novo é recebido, clica no botão que promete "iniciar aventura", nada visível acontece (um NPC aparece falando de Cidade). Ele encontra a página Aventura sozinho pelo menu, joga, sobe de nível, acha itens chamados "boots"/"belt", vê "+0 HP, +0 XP, +0 ouro" depois de uma descoberta empolgante. Ao conferir "Personagem", tudo que fez sumiu — nível 1, inventário vazio. A sensação geral: "isso parece quebrado, ou eu não entendi alguma coisa."

**Depois**: o botão de boas-vindas diz exatamente o que faz. A página Aventura se apresenta como uma prévia do motor, então a diferença com o Personagem faz sentido em vez de parecer um erro. Os itens encontrados têm nomes reais em português, consistentes com o resto do jogo. Uma descoberta sem recompensa é comunicada como tal, não como três zeros. A sensação geral: "isso é uma demonstração interativa de um sistema que funciona, com uma progressão real acontecendo em paralelo enquanto assisto."

---

## 5. Vertical Slice Checklist

| Item | Resposta | Justificativa |
| --- | --- | --- |
| Objetivo inicial claro? | **Parcial** | O card de boas-vindas explica bem o loop geral (Evoluir/Equipar/Explorar/Títulos), mas a navegação inicial (botão que não navega) atrapalhava — corrigido nesta Sprint. |
| Progressão clara? | **Parcial** | Dentro da página Aventura, sim (XP/Nível/Objetivo sempre visíveis). Entre páginas (Aventura vs. Personagem), não fazia sentido sem o subtítulo adicionado — corrigido nesta Sprint, mas o fato de serem dois sistemas de progressão permanece uma característica estrutural, não um bug, e vale documentar com mais destaque no futuro. |
| Equipamentos intuitivos? | **Sim** | Delta de Power Score visível e colorido ao equipar; nomes agora localizados. |
| Loot recompensador? | **Sim** | "Novo melhor item"/"novo recorde de dano" já geram destaque; nomes de item agora legíveis. |
| Boss memorável? | **Parcial** | O nome do Boss ("Guardião Esquecido") e o card "BOSS FINAL" já aparecem claramente quando a Dungeon é a expedição ativa; não foi possível observar a derrota de um Boss dentro do orçamento curto desta sessão de smoke test (esperado — o motor já mede isso: ~90-130 encontros até o Chefe em jornada natural, ver Sprints de balanceamento anteriores). |
| Dungeon compreensível? | **Sim** | Nome da Dungeon, contagem de Checkpoint e nome do Chefe Final aparecem juntos, claramente rotulados. |
| Sessão satisfatória? | **Parcial** | Ganho de XP/loot é constante e visível a cada clique; o "deserto de loot" já documentado em auditorias anteriores (90% das jornadas com 600s+ sem upgrade) continua sem solução — fora do escopo de apresentação desta Sprint. |

---

## 6. Commercial Readiness Score

| Critério | Nota | Justificativa |
| --- | --- | --- |
| Gameplay | 7/10 | Loop de combate/loot/progressão funciona e já foi calibrado em 2 Sprints anteriores; falta variedade de ação do jogador (tudo via um botão "Avançar"). |
| UX | 6/10 | Melhorou nesta Sprint (nomes localizados, textos corrigidos), mas a duplicidade Aventura/Personagem ainda exige explicação mesmo com o subtítulo. |
| Clareza | 7/10 | HUD mostra objetivo/facção/expedição/vida sempre visíveis; a única grande confusão estrutural (2 progressões paralelas) agora é comunicada, não escondida. |
| Progressão | 7/10 | Curva de dificuldade já calibrada com dados (Sprints anteriores); dentro da Aventura, sempre clara. |
| Interface | 6/10 | Consistente em português agora; ainda mistura termos técnicos em inglês aceitáveis como jargão (DPS, Power Score) com uma estrutura de card/HUD funcional mas simples visualmente. |
| Valor percebido | 6/10 | A profundidade real (Facções/Dungeons/World Tiers/Relíquias) existe mas não é visível nos primeiros minutos — um jogador só vê o loop básico de combate/loot no início. |
| Apresentação | 6/10 | Textos agora consistentes; falta identidade visual mais forte (ícones/arte além de emojis) pra parecer produto acabado, não protótipo. |
| Potencial comercial | 6/10 | A base é sólida e já passou por várias rodadas de calibração de dados real — o que falta é polish visual e reduzir a "distância" entre a demonstração e o produto persistente real. |

**Média: 6.4/10** — Vertical Slice funcional e mensuravelmente mais claro após esta Sprint, mas ainda com identidade de "protótipo bem calibrado" mais que "produto comercial pronto".

---

## 7. Próximos Passos

**"Se amanhã fosse necessário apresentar este projeto a um publisher, o que ainda impediria essa apresentação?"** — ordenado por impacto comercial:

1. **A duplicidade Aventura (demo) vs. Personagem (real) continua existindo estruturalmente.** O subtítulo desta Sprint explica a diferença, mas um publisher jogando por 10 minutos ainda vai perceber dois "personagens" diferentes — a explicação ajuda, mas não substitui uma experiência unificada. Resolver isso é uma decisão de produto/arquitetura (fora do escopo desta Sprint), não outra rodada de texto.
2. **Identidade visual ainda é fraca.** Toda a interface usa emojis como ícones (🏆🔥🎁) em vez de arte própria — funcional, mas lê como protótipo. Isso é o maior "quebra de mágica" visual pra qualquer avaliação comercial.
3. **Nomes de Enemy Templates regulares (Wolf, Boar, Goblin, Skeleton, Bandit...) continuam em inglês**, enquanto Bosses/Mini-Bosses já são em português ("Guardião Esquecido", "Rei Gélido"). Mesmo achado desta Sprint (Fase 2/6), não corrigido por escopo/tempo — indicado aqui como o próximo item óbvio de localização.
4. **"Deserto de loot" (achado de 2 auditorias anteriores, nunca corrigido)**: 90% das jornadas passam 600s+ sem nenhum upgrade de equipamento — isso é sentido diretamente como "a sessão parou de me recompensar", um risco real pra "sessão satisfatória" numa demo de 10 minutos.
5. **Picos Congelados ainda mata ~82% de quem chega** (achado da Sprint de Combat Difficulty Calibration, ainda não resolvido) — se um publisher jogar tempo suficiente pra alcançar essa região, verá uma morte quase certa logo depois de um bom progresso, o que pode ler como "desbalanceado" em vez de "desafiador".
