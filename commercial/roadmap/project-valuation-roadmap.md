# PROJECT VALUATION ROADMAP — From Vertical Slice to Publisher Ready

**Natureza deste documento**: plano mestre, não uma implementação. Define a sequência restante de trabalho entre o estado atual do StreamRPG e um Vertical Slice pronto para ser apresentado a um publisher — e, principalmente, ordena esse trabalho pelo que aumenta valor percebido mais rápido, não pelo que é tecnicamente mais interessante de construir.

A partir deste documento, o projeto passa a operar em duas metades:

```
code/        — engine, balanceamento, UX, arquitetura (o que já vínhamos fazendo)
commercial/  — pitch, steam, screenshots, logo, branding, trailer, publisher,
               investors, presskit, roadmap, valuation (o que começa agora)
```

Cada Sprint de código a partir de agora deve ser avaliada por DUAS perguntas, não uma: "isso melhora o jogo?" e "isso aumenta o valor de mercado do projeto?". Nem toda melhoria técnica responde "sim" à segunda pergunta — e é exatamente essa filtragem que este roadmap formaliza.

---

## 0. Onde o projeto está hoje (linha de base para todo o resto deste documento)

Depois de ~30 Sprints (arquitetura, conteúdo, 2 auditorias completas, 2 Sprints de recuperação de balanceamento, 1 Sprint de UX/Commercial Readiness, 1 Sprint de unificação arquitetural), o estado real — não a impressão — é:

**Forte (não precisa de mais trabalho de fundação):**
- Engine profundamente calibrado com evidência quantitativa real: Combat/Loot/Progression/Dungeons/Bosses/World Tiers/Modificadores/Relíquias, todos medidos e ajustados via Simulador próprio (uma capacidade rara mesmo entre estúdios indie — vira munição de pitch, não só engenharia).
- Arquitetura unificada: um único personagem, uma única fonte de verdade (Sprint Persistent Player Experience) — o "isso parece dois jogos" que a auditoria comercial apontou como maior risco já foi eliminado.
- UX de primeira impressão já revisada uma vez (nomes localizados, textos corrigidos, comunicação clara do que está acontecendo).

**Gargalos conhecidos, com evidência já coletada (não suposição):**
- "Deserto de loot": 90% das jornadas passam 600s+ sem nenhum upgrade de equipamento (Game Design Audit, confirmado de novo na Combat Difficulty Calibration).
- Picos Congelados ainda mata ~82% de quem chega — funil que impede a maioria das jornadas de ver o restante do conteúdo tardio já construído (Dungeons/Relíquias/World Tiers).
- Persistência de equipamento entre a Aventura e o personagem real ainda não guarda o item procedural completo (só baseItemId + Power Score + raridade mapeada) — funcional, mas não 100% fiel visualmente após um refresh.
- Ouro sem função de gasto e raramente concedido.
- Dois vocabulários de raridade/item coexistindo no código (débito técnico, invisível ao jogador, mas trava expansão de conteúdo futura).

**Ausente por completo (zero trabalho feito até hoje):**
- Identidade visual: hoje é 100% emoji, sem logo, sem paleta de cor própria, sem fonte.
- Som: nenhum efeito sonoro, nenhuma música.
- Animação/partícula real: feedback hoje é texto + cor, sem movimento.
- Qualquer material de apresentação: screenshot curado, trailer, página de Steam, one-pager, pitch deck.

Este é o ponto de partida real. O roadmap abaixo assume exatamente isto — nem mais avançado, nem mais atrasado.

---

## 0.1 Atualização — Front Door Experience Sprint (resolvido, 2026-07-25)

As Sprints "First 10 Minutes Experience" e "Front Door Experience" descobriram e fecharam um gargalo que este roadmap não previa, porque ele é anterior a qualquer item da lista abaixo: **um avaliador externo (publisher, investidor, playtester) não conseguia sequer começar a jogar o Vertical Slice sem conhecer URLs internas** (`/app/city`, `/app/adventure`). A Landing Page só vendia a camada Twitch-passiva (login obrigatório na prática), enquanto a Cidade/Aventura/Combate/Loot/Progressão — 100% jogáveis sem conta — não apareciam em lugar nenhum, e o Mundo travava em "Carregando o Reino..." pra sempre sem login, sem explicação.

Corrigido nesta Sprint:
- Landing Page agora tem um CTA primário ("🎮 Jogar Agora") que leva direto à Cidade, sem login.
- Destaques e "Como funciona" reescritos pra refletir o loop real (Cidade → Portão Norte → Aventura → Combate → Loot → Nível), com a Twitch marcada como opcional, não pré-requisito.
- Seção nova ("O que precisa de login?") responde de forma explícita o que funciona sem conta e o que precisa de Twitch — nunca mais descoberto por tentativa e erro.
- Portão Norte (Cidade) ganhou uma ação real ("Ir para a Aventura →") — antes prometia "a saída para o mundo" sem nenhum link correspondente.
- `/app/world` sem login agora explica o motivo e sugere a alternativa (Cidade/Aventura), em vez de carregar infinitamente.

**Por que isto era, na prática, tão crítico quanto o item #1 da lista abaixo (Equipment Progression Audit)**: um publisher não avalia o loop de recompensa de um jogo que ele não consegue nem abrir. Esta Sprint não substitui nenhum item do roadmap original — só remove um bloqueio que, sem ser corrigido, teria feito qualquer trailer/steam page/pitch deck futuro depender de instruções verbais ("abra esta URL, ignore o login") pra ser sequer demonstrado. Com o Front Door resolvido, a ordem da Seção 1 abaixo volta a ser válida sem ressalvas: **Equipment Progression Audit continua sendo o próximo item real da lista.**

---

## 0.2 Atualização — Player Retention Loop Sprint (2026-07-25)

Com onboarding e descoberta resolvidos (0.1), esta Sprint mudou o eixo de avaliação de "o jogador consegue começar?" para "o jogador continua interessado?". Playtest real de ~30 minutos (equivalente), começando em `/`, cobrindo Nível 1→20, uma dungeon inteira concluída (Chefe Final derrotado) e o início de uma segunda expedição até a morte do personagem. Relatório completo: `docs/reviews/player-retention-loop-vertical-slice-phase-1.md`.

**Conclusão**: a cadeia de objetivos e a cadência de recompensas já sustentam 30 minutos de interesse sem intervenção — nenhuma nova mecânica foi necessária. Um achado real e específico, porém, confirma e reforça (do ângulo de retenção, não de balanceamento) um item que já existia neste roadmap:

- **A queda de Picos Congelados quebra a curva de motivação de forma abrupta, não gradual** — o jogador vinha do maior pico de recompensa da sessão (Chefe Final derrotado, +1500 XP/+400 ouro) e morre poucos encontros depois, sem transição proporcional ao salto de dificuldade. Isto é exatamente o problema já descrito no item "Endgame Funnel Fix" (Seção 1, item 2) — esta Sprint não abre um novo item, **reforça a prioridade do que já existia**, agora com evidência do ângulo "isso quebra retenção", não só "isso mata estatisticamente ~82% das jornadas".

Achados menores, classificados como "Importante"/"Desejável" (não bloqueiam playtest externo, ver Fase 10 do relatório): falta de distinção clara entre "Elite" e "Mini-Boss" no HUD quando o objetivo pede um Mini-Boss especificamente; mensagem de login da página Crônicas mais seca que a de Inventário/Mundo; Ranking global com apenas 1 entrada no ambiente atual (esperado, não é bug).

**Reprioridade das próximas Sprints** — nenhuma mudança na ORDEM da Seção 1 abaixo, mas duas conclusões práticas:
1. **Equipment Progression Audit e Endgame Funnel Fix continuam sendo os dois próximos itens reais**, agora ambos com evidência dupla (dados de simulação anteriores + esta Sprint de retenção confirmando o mesmo problema do ângulo de experiência vivida).
2. **O Vertical Slice já está pronto para ser entregue a um playtest externo com 10 jogadores hoje** (Fase 10 do relatório) — isso pode rodar em paralelo ao Equipment Progression Audit / Endgame Funnel Fix, não precisa esperá-los, e deve coletar dados justamente sobre como jogadores reais reagem à queda de Picos Congelados (dado que hoje só existe simulação + um playtest solo).

---

## 0.3 Atualização — External Playtest Program Sprint (2026-07-25)

Com onboarding (0.1) e retenção (0.2) validados internamente, esta Sprint criou o processo completo para transformar o playtest externo — recomendado no item 2 da atualização 0.2 — em conhecimento acionável, em vez de uma sessão informal sem estrutura. Sprint de planejamento/metodologia, sem nenhuma mudança de jogo. Processo completo em `docs/playtesting/README.md` (Guia do Moderador, Questionário do Participante, Métricas, Classificação de Issues, Modelo de Consolidação, Roadmap Integration). Relatório da Sprint: `docs/reviews/external-playtest-program-phase-1.md`.

**Mudança prática de prioridade**: a partir de agora, **a próxima grande fonte de decisões de roadmap passa a ser evidência coletada com jogadores externos reais**, complementando (não substituindo) as investigações técnicas internas já concluídas (Combat/Loot/Progressão, auditorias, Front Door, Player Retention). Concretamente:

1. O primeiro ciclo de ~10 playtests externos pode começar imediatamente, seguindo `docs/playtesting/`, em paralelo ao Equipment Progression Audit (Seção 1, item 1) — nenhum dos dois bloqueia o outro.
2. Um achado de playtest só entra nesta Seção 1 (ou reforça um item já existente, como aconteceu com o Endgame Funnel Fix em 0.2) quando for um **padrão recorrente de impacto alto** (3+ dos ~10 participantes) — ver critério formal em `docs/playtesting/07-roadmap-integration.md`. Achados isolados ou sugestões pontuais de participantes ficam registrados no documento do ciclo, sem virar Sprint automaticamente.
3. A recomendação mais concreta desta Sprint: usar o primeiro ciclo de playtest para coletar dados reais sobre a reação de jogadores desconhecidos à queda de Picos Congelados (0.2) — hoje a evidência é só simulação + um playtest solo da própria equipe; um padrão confirmado com jogadores externos torna o Endgame Funnel Fix ainda mais urgente (ou, se a reação for mais tolerante que o esperado, permite recalibrar a prioridade com dados reais em vez de suposição).

---

## 0.4 Nota de status — External Playtest Execution, Ciclo 1 (2026-07-25)

**Isto é uma nota de status, não uma reprioridade.** Nenhum item da Seção 1 abaixo muda de posição nesta atualização — não há evidência real ainda que justifique mover qualquer coisa.

O pacote de execução do Ciclo 1 (recrutamento, ficha de sessão, consolidação em branco) está pronto em `docs/playtesting/results/cycle-1/`, mas **as ~10 sessões reais ainda não foram conduzidas** — este assistente não tem acesso para recrutar, agendar ou observar pessoas externas ao usuário; a execução real depende do usuário/equipe. Relatório completo: `docs/reviews/external-playtest-execution-phase-1.md`.

**Risco atual mais importante identificado (usando só evidência disponível até aqui)**: todas as conclusões de onboarding e retenção deste roadmap (seções 0.1 e 0.2) foram validadas só internamente (equipe/IA) — nenhuma delas foi ainda confirmada por alguém genuinamente de fora do projeto. Isso não invalida essas conclusões, mas significa que **nenhum dos 4 públicos comerciais** (demonstrações públicas, Steam Page, criadores de conteúdo, publishers) deveria ser abordado hoje com o argumento "já validamos com jogadores externos" — essa alegação só passa a ser verdadeira depois que o Ciclo 1 rodar de verdade.

---

## 0.5 Nota de status — External Playtest Analysis, Ready State (2026-07-25)

**Novamente uma nota de status, não uma reprioridade.** Nenhum item da Seção 1 muda nesta atualização — nenhum dado real de playtest existe ainda para justificar isso.

Esta Sprint revisou e endureceu a metodologia de *análise* (não de execução) do Ciclo 1, adicionando ao processo já existente em `docs/playtesting/`: um fluxo de dados explícito (Participante → Ficha → Consolidação → Classificação → Roadmap → Sprint), regras de quando um comentário vira ação vs. só é registrado, uma matriz de priorização de 3 dimensões (impacto × frequência × confiança da evidência) com heurísticas numéricas explícitas (1/3/5 participantes, revisáveis), regras de prevenção de falso-positivo (opinião isolada, jogador muito experiente/iniciante, bug de ambiente), um método de comparação entre playtests internos e externos, um padrão fixo de relatório final, e uma exigência de rastreabilidade obrigatória (toda entrada de roadmap originada por playtest deve citar evidência + nº de participantes + perfis). Relatório completo: `docs/reviews/external-playtest-analysis-cycle-1-ready-state.md`.

Um gap real de documentação foi encontrado e corrigido durante a revisão: o Modelo de Consolidação não tinha uma seção para elogios recorrentes (só para problemas) — corrigido em `docs/playtesting/06-consolidation-template.md` e na cópia do Ciclo 1.

**Conclusão prática**: o projeto agora está pronto para processar os dados do Ciclo 1 assim que chegarem, sem precisar redefinir critério nenhum no meio da análise — ver o passo a passo em `docs/playtesting/results/cycle-1/03-ready-state-checklist.md`. O roadmap permanece exatamente como estava nas seções 0.1-0.4: Equipment Progression Audit e Endgame Funnel Fix continuam sendo os próximos itens reais, e nenhuma Sprint nova foi aberta por esta atualização.

**Próximo passo real**: usuário/equipe conduz as ~10 sessões usando `docs/playtesting/results/cycle-1/`; a análise completa (Fases 6-10 da Sprint "External Playtest Execution") retoma assim que os dados chegarem.

---

## 0.6 Atualização — Equipment Progression: da parametrização à arquitetura (2026-07-25/26)

**Isto ENCERRA o item #1 da Seção 1 (Equipment Progression Audit) e registra oficialmente o fim da linha de investigação por parametrização do Item Generator.** Seis Sprints sucessivas, todas sobre o mesmo problema ("deserto de loot" citado em 0 e na Seção 3, item 1):

1. **Equipment Progression Audit — Player Power Curve Phase I**: diagnóstico puro. Confirmou Dead Loot ~95,5%, Elmo/Peitoral com 0 upgrades em 300 campanhas completas, probabilidade de upgrade caindo pra perto de zero já na 2ª região.
2. **Equipment Progression Repair Phase II**: corrigiu o peso de `baseDefense` no Power Score e a composição de Loot Tables early-game — Elmo/Peitoral voltaram a evoluir, mas o problema regional (regiões 3+) persistiu.
3. **Item Generation Design Review Phase I**: prova matemática da causa raiz — `MAX_LEVEL=30` nunca alcança os limiares de Item Level (50-65) que 13 dos 14 afixos do jogo exigiam pro melhor tier. Teto real: 56% do teto teórico de Power Score.
4. **Item Generation Redesign Validation + Parameter Interaction**: testaram (via uma camada experimental em memória, nunca tocando arquivos) reescala de limiares, rebalanceamento de peso, e a combinação dos dois. Confirmaram sinergia real entre os parâmetros, mas mesmo a melhor combinação não moveu Dead Loot além do ruído (~95,2% em toda tentativa) — **a linha de parametrização foi declarada oficialmente esgotada**.
5. **Continuous Affix Scaling — Implementation Phase I**: substituiu o MECANISMO (tiers-com-degraus) por uma curva contínua de valor por Item Level, mantendo toda a arquitetura/raridades/Combat Engine intocados. Resultado medido (N=300 campanhas, mesma metodologia de todas as Sprints anteriores):

| Métrica | Antes (todas as tentativas de parametrização) | Depois (Continuous Affix Scaling) |
| --- | --- | --- |
| Dead Loot Rate | ~95,2% (nunca saiu desta faixa em 6 Sprints) | **94,4%** |
| Upgrades por campanha | ~4,9 | **7,9 (+62%)** |
| Upgrades de Elmo/Peitoral/Anel2/Amuleto (slots antes mais fracos) | baseline | **+93%/+90%/+133%/+95%** |
| Taxa de chegada a Picos Congelados | 80,7% | **95%** |
| Mortalidade em Picos Congelados (de quem chega) | ~80,6% | **20,7%** |

**Efeito colateral não-buscado, mas relevante pro item #2 desta lista (Endgame Funnel Fix)**: como o personagem agora chega às regiões finais genuinamente mais forte (não por nenhuma mudança de Combat Engine/Enemy Templates, ambos intocados nesta Sprint), a mortalidade de Picos Congelados — o alvo do próximo item do roadmap — já caiu de ~82% pra ~21% como consequência indireta. Isso não substitui uma investigação dedicada ao item #2 (a causa raiz documentada da mortalidade ali sempre foi frequência de combate/exposição a Elite/Mini-Boss, não equipamento — ver relatórios da Equipment Progression Audit Phase I), mas reduz consideravelmente a urgência e o escopo provável dessa próxima Sprint.

**Mudança prática de prioridade**: o item #1 desta lista (Equipment Progression Audit) está **concluído e verificado em produção**. O item #2 (Endgame Funnel Fix) permanece no roadmap, mas com uma pergunta nova em aberto pra quando essa Sprint começar: "os ~21% de mortalidade restantes em Picos Congelados ainda justificam uma Sprint dedicada, ou já caem dentro de uma faixa aceitável pra um Vertical Slice comercial?" — decisão a ser tomada com uma nova medição, não com o número antigo de 82%.

Relatórios completos (packages/shared/reports/): `equipment-progression-audit-phase-1.md`, `equipment-progression-repair-phase-2.md`, `item-generation-design-review-phase-1.md`, `item-generation-redesign-validation-phase-1.md`, `item-generation-parameter-interaction-phase-1.md`, `continuous-affix-scaling-phase-1.md`.

---

## 0.7 Atualização — Global Gameplay Rebalance Phase I (2026-07-26): fim da evolução do Item Generator, início da produção

**Marca oficialmente o encerramento da linha de evolução do Item Generator (0.6) e a entrada do projeto na fase de balanceamento global / produção de conteúdo.** Auditoria completa (N=500 campanhas) sob Continuous Affix Scaling em produção confirmou a hipótese do item 0.6: a progressão de equipamento deixou de ser o gargalo dominante, e isso desbalanceou Combate/Chefes/Dungeons, que nunca tinham sido recalibrados pra esse novo ritmo.

**Achados principais**:
- Todos os 4 Chefes de Dungeon (forgotten-guardian, frost-king, corrupted-bishop, ancient-dragon) mediram taxa de vitória entre 94-100% — deixaram de representar picos de dificuldade.
- 2 das 4 Dungeons (Catedral Esquecida, Covil do Dragão) mediram **0% de conclusão apesar do Chefe ser derrotado em 94-99% dos encontros** — orçamento de encontros pós-Chefe (48/52) muito maior que o tempo real que os personagens passam nessas regiões.
- Mortalidade de Picos Congelados (0.6 já havia medido ~21% como efeito colateral) permanece bem abaixo do critério de ~50% da Seção 6 mesmo após a recalibração desta Sprint.

**Correções aplicadas** (só valores numéricos — `enemy/templates.ts` stats dos 4 Chefes, `expeditions/expeditionDefinitions.ts` orçamento de 2 Dungeons — nenhuma arquitetura tocada): Chefes buffados (+18-37,5%, forgotten-guardian precisou de 2 rodadas), orçamento de Catedral Esquecida (48→22 encontros) e Covil do Dragão (52→10) reduzido pra faixa realmente alcançável. Resultado: as 2 Dungeons que mediam 0% agora completam 56,8%/19,4% das tentativas; taxas de vitória de Chefe agora na faixa 88,8-100% (ainda alta para forgotten-guardian/corrupted-bishop, aceito como residual menor — ver relatório completo).

**Conclusão prática**: o projeto está pronto pra deixar a fase de auditoria/investigação repetida do Item Generator e entrar na fase de produção de conteúdo/preparação de lançamento — ver plano macro de próximas Sprints no relatório `global-gameplay-rebalance-phase-1.md`, Seção 7 (Roadmap Update), que também endereça diretamente os itens 3-10 da Seção 1 abaixo.

Relatório completo: `packages/shared/reports/global-gameplay-rebalance-phase-1.md`.

---

## 0.8 Atualização — Live Playtest Preparation, RC1 Candidate (2026-07-26)

**Sprint de consolidação de experiência (não de sistema novo)**: playthrough real completo (nível 1→23, morte real em Picos Congelados, ressurreição via reload, Dungeon Fortaleza Congelada em progresso), com foco só em experiência do jogador para a primeira live pública. Zero erros de console durante todo o playthrough.

**Corrigidos** (2 bugs de texto reais, ambos verificados ao vivo no navegador após rebuild): pluralização quebrada em `WorldPage.tsx` (`"expediçãoões"` → `"expedições"`); intro contraditória em `ChroniclePage.tsx` (frase "esta história já tem capítulos" aparecia empilhada sobre "nenhum capítulo escrito ainda" para qualquer personagem em estágio "Aventureiro"+ sem entradas de Crônica — agora só renderiza quando `data.entries.length > 0`).

**Achado crítico, documentado e NÃO corrigido nesta Sprint** (fixar exigiria replicar o trabalho de sync já feito para XP/Ouro/Itens — fora de escopo de "não implementar novo sistema"): o estado da sessão de Aventura (região, progresso de expedição/masmorra, timeline) vive 100% em memória do componente `AdventurePage` e é perdido em **qualquer** navegação para fora da página — não só um F5, mas o próprio clique em "Personagem"/"Inventário" e volta, já que `router.tsx` não tem layout persistente entre rotas. Nível/XP/Ouro/itens sobrevivem (via rotas de sync já existentes), região/masmorra não. Reclassificado como **Crítico** em `docs/releases/vertical-slice-rc1/known-issues-rc1.md` (item B1) — ver Seção 8, item 9 (novo) abaixo para prioridade recomendada.

**Conclusão prática**: o Vertical Slice é jogável do início à morte, sem bugs de console e sem estados quebrados — mas B1 exige que o streamer/moderador seja explicitamente orientado a não navegar para outras páginas do app durante uma Aventura/Masmorra ativa nesta live específica. Persistência completa de sessão de Aventura deve ser a primeira prioridade de código da próxima Sprint (ver Seção 8, item 9).

---

## 0.9 Atualização — Adventure Session Persistence, RC1 Blocker Fix (2026-07-26)

**Resolve o B1 identificado em 0.8, o único bloqueador crítico restante do RC1.** Sem nenhum sistema novo: o estado da sessão de Aventura (`session`/`timeline` de `useAdventureSession.ts`) foi movido de um `useRef` local a `AdventurePage` para um singleton a nível de módulo (`let singleton` fora de qualquer componente React). Um `useRef` morre quando o componente desmonta; uma variável de módulo sobrevive a qualquer remontagem, porque o módulo JS só é recarregado num reload de página de verdade — nunca numa troca de rota do React Router. Reaproveita 100% da infraestrutura de sync já existente (rotas `/api/character/adventure/xp`, `/gold`, `/api/items/loot`) sem tocar nelas.

**Verificado em navegador real** (não apenas por leitura de código): personagem avançado até Nível 28 dentro de duas Dungeons diferentes (Queda da Fortaleza Sombria → conclusão → Ruínas Esquecidas), navegação completa por Personagem/Inventário/Crônicas/Ranking/Mundo/Streamer e volta em cada etapa — checkpoint, HP, timeline e estatísticas idênticos byte-a-byte antes/depois em todos os casos, incluindo com o personagem morto (`DERROTA`) em Deserto de Vidro. Zero erros de console. Um F5 real ainda reinicia região/masmorra (esperado e documentado — corrigir isso persistiria estado no backend, um sistema novo, fora de escopo). 7 testes automatizados novos (`useAdventureSession.test.ts`) travam a garantia central: o singleton nunca é recriado enquanto existir, nem sob chamadas concorrentes (StrictMode). Suíte completa de `packages/shared` (442/442) inalterada.

**Conclusão prática**: B1 removido da lista de bloqueadores em `docs/releases/vertical-slice-rc1/known-issues-rc1.md`. RC1 **desbloqueado** — não há mais bugs críticos conhecidos impedindo a primeira live pública.

---

## 0.10 Congelamento — Vertical Slice RC1 (2026-07-26)

```
Vertical Slice RC1
COMPLETO
```

Marca o encerramento oficial da fase de fundação do projeto. Documentação completa do estado congelado em `docs/releases/vertical-slice-rc1/`: `RC1-SNAPSHOT.md` (estado oficial), `project-statistics.md` (números), `technical-debt.md` (dívida real, classificada), `known-issues-rc1.md` (bugs/limitações/features futuras), `release-notes-rc1.md` (novidades/correções/arquitetura/balanceamento). Plano estratégico de conteúdo pós-RC1 em `docs/planning/post-rc1-roadmap.md` (não substitui a Seção 1 abaixo, que continua sendo o caminho crítico comercial — endereça a sequência de conteúdo/sistemas de jogo em paralelo).

A partir deste ponto, qualquer nova Sprint de código parte deste snapshot como base de verdade, não de suposição sobre o estado do projeto.

---

## 1. Todas as etapas restantes até um Vertical Slice comercial

| # | Etapa | Categoria |
| --- | --- | --- |
| 1 | ~~Equipment Progression Audit (resolver deserto de loot)~~ — **concluído 2026-07-26, ver 0.6** | code |
| 2 | Endgame Funnel Fix (Picos Congelados — mortalidade já caiu de ~82% pra ~21% como efeito colateral do item 1, ver 0.6; reavaliar escopo antes de iniciar) | code |
| 3 | Visual Polish (animação, som, partícula, ícone, raridade, efeito) | code (sem novo sistema) |
| 4 | Identity (logo, fonte, paleta, HUD, menus) | commercial + code (aplicação) |
| 5 | Steam Vertical Slice (recorte de 10-15min pensado pra ser gravado) | commercial + code (curadoria) |
| 6 | Trailer | commercial |
| 7 | Steam Page | commercial |
| 8 | Presskit (nasce como subproduto do Trailer + Steam Page, não é trabalho novo) | commercial |
| 9 | Pitch Deck | commercial |
| 10 | Publisher/Investor outreach material | commercial |

Isto é praticamente a ordem que você propôs — a única mudança real é dividir sua "Sprint 1" em duas (Equipment Progression Audit e Endgame Funnel Fix), porque são dois problemas de natureza diferente (progressão de item vs. curva de dificuldade) que só coincidem por estarem os dois sem solução hoje. Resolver um não resolve o outro, e os dois precisam estar resolvidos ANTES de gravar qualquer trailer — um trailer que mostra o jogador andando 10 minutos sem loot, ou morrendo instantaneamente ao entrar numa região, é pior que nenhum trailer.

---

## 2. Ordem ideal de desenvolvimento (com justificativa)

**Por que código ainda vem antes de identidade visual**: um logo bonito sobre uma sessão sem recompensa continua parecendo, na prática, uma sessão sem recompensa — só que agora com um logo bonito. Valor percebido de um Vertical Slice vem primeiro da SENSAÇÃO de jogar (loop de recompensa, curva de dificuldade), depois da APRESENTAÇÃO dessa sensação (visual/som), e só então da EMBALAGEM (trailer/steam page/deck). Inverter essa ordem gasta o orçamento de "impressionar" em cima de uma base que ainda decepciona nos primeiros 10 minutos.

**Por que Identity vem antes do Vertical Slice final, não depois**: gravar um trailer/screenshots ANTES de ter paleta/fonte/logo definidos significa refazer todo o material assim que a identidade chegar. Identity é barata e rápida (decisão de design, não engenharia) — vale resolver antes de qualquer coisa que dependa dela ficar "congelada" numa gravação.

**Por que Presskit não é uma Sprint própria**: um presskit de qualidade é, por definição, uma seleção do que já foi produzido pro Trailer e pra Steam Page (screenshots, GIFs, logo, descrição, fact sheet) — tratá-lo como Sprint separada duplicaria trabalho. Ele "nasce pronto" quando as Sprints 5-7 terminam.

Sequência final recomendada:
```
1. Equipment Progression Audit
2. Endgame Funnel Fix
3. Visual Polish
4. Identity
5. Steam Vertical Slice
6. Trailer
7. Steam Page (+ Presskit)
8. Pitch Deck
9. Publisher/Investor outreach
```

---

## 3. O que aumenta mais o valor do projeto (por ordem de impacto)

1. **Fechar o deserto de loot.** É o único item desta lista que, sem correção, faz um jogador/avaliador experiente sentir "isso não me recompensa" nos primeiros minutos — o pecado mais caro que um Vertical Slice pode cometer, porque nenhuma arte ou trailer disfarça a ausência de recompensa sentida ao vivo.
2. **Identidade visual própria.** É a diferença entre "isso parece um protótipo Unity/React genérico" e "isso parece um produto com um dono". Publishers avaliam dezenas de projetos por semana — a primeira impressão visual decide se eles continuam olhando.
3. **Um trailer que mostra o gancho real do jogo (Twitch-integrado, persistente, evolução automática assistindo à live).** Este é o ÚNICO ângulo deste projeto que não existe em nenhum outro RPG genérico — é o que faz um publisher perguntar "quantos streamers já usam isso?" em vez de "por que eu preciso de mais um ARPG?".
4. **Corrigir o funil de Picos Congelados.** Menos crítico que os itens acima porque só afeta quem joga além dos primeiros ~10-15 minutos — mas se o Vertical Slice pretende mostrar QUALQUER conteúdo de fim de jogo (Dungeons/Relíquias/World Tiers, todos já construídos), esse funil precisa parar de impedir a maioria das sessões de chegar lá.
5. **Steam Page bem escrita.** Converte atenção em wishlist — mas só depois que os itens 1-3 já existem pra sustentar as promessas do texto.
6. **Pitch Deck.** O documento de menor custo de produção desta lista inteira e, ironicamente, o que mais depende de tudo antes dele estar pronto — um deck bom não compensa um jogo ainda no estado de hoje, só comunica honestamente o que já existe.

---

## 4. O que pode esperar

- **Fechar 100% a lacuna de persistência de equipamento** (afixos completos do item procedural sobrevivendo a um refresh dentro da própria Aventura) — o essencial (o item aparece no Personagem/Inventário real) já funciona; o resto é polimento de um caso relativamente raro (trocar de aba no meio de uma sessão).
- **Sistema de gasto de ouro (loja/crafting/marketplace)** — já identificado em auditorias anteriores como gargalo estrutural, mas nenhum publisher de Vertical Slice espera ver uma economia completa; espera ver um LOOP de recompensa que funciona, o que é o item #1 desta lista, não uma economia.
- **Unificar os dois vocabulários de raridade/item no código** — dívida técnica real, mas invisível pra qualquer avaliador externo. Resolver antes de expandir conteúdo de verdade (mais Dungeons/Bosses), não antes do Vertical Slice.
- **Multiplayer/PvP/Crafting/Economia avançada** — fora de escopo de qualquer Vertical Slice; são conversas de "depois que alguém já disse sim".

---

## 5. O que um publisher espera ver

Genérico (qualquer jogo):
- 10-15 minutos de gameplay real, sem cortes que escondam problemas.
- Uma primeira impressão que comunica gênero e proposta de valor em segundos (tela de título, HUD, primeiro minuto).
- Consistência visual (paleta, fonte, ícones — não precisa ser caro, precisa ser COERENTE).
- Evidência de que o jogo já foi testado/iterado, não é a primeira versão jogável.

Específico do StreamRPG (o que NENHUM outro pitch de ARPG genérico consegue mostrar):
- O gancho Twitch-integrado funcionando ao vivo: um personagem evoluindo automaticamente enquanto alguém assiste a uma live — a demonstração mais forte que este projeto pode dar não é "aqui está um combate", é "aqui está uma comunidade Twitch inteira progredindo junto".
- A profundidade real de sistemas já calibrados por dados (Facções/Dungeons/World Tiers/Relíquias) — comunicada de forma simples, não uma lista de features.
- Rigor de balanceamento quantitativo (Simulador próprio, relatórios de auditoria) — um diferencial real de maturidade de processo que a maioria dos pitches indie não tem para mostrar, e que reduz o risco percebido pelo publisher ("estes desenvolvedores sabem medir o que estão fazendo").

---

## 6. Critérios objetivos: "o projeto está pronto para ser apresentado"

Checklist de aprovação (todos os itens devem ser SIM):

- [ ] Um jogador novo, sem explicação externa, consegue jogar 10 minutos e sentir progressão real (Sprint Commercial Readiness já resolveu a comunicação disso — falta a Sprint 1 deste roadmap resolver a SENSAÇÃO real de recompensa).
- [ ] Nenhuma região/conteúdo mostrado no material de apresentação tem mortalidade acima de ~50% em condições normais (ver Sprint 2 deste roadmap).
- [ ] A interface tem uma identidade visual coerente própria — não emojis, não paleta default de biblioteca de UI.
- [ ] Existe pelo menos uma demonstração gravável do gancho Twitch-integrado (evolução automática assistindo a uma live).
- [ ] Existem 5-10 screenshots curados que comunicam variedade (combate, loot, progressão, mundo, HUD) sem precisar de legenda explicando o que é.
- [ ] Existe um trailer de 60-90s.
- [ ] Existe uma Steam Page com texto, capa e pelo menos um GIF/vídeo.
- [ ] Existe um Pitch Deck de 10-15 slides cobrindo: problema/oportunidade, proposta de valor única, prova de execução (auditorias/calibração), roadmap, ask.

Quando todos os itens acima forem SIM, o projeto está, por definição objetiva, pronto para a primeira conversa com um publisher — não antes.

---

## 7. Estimativa de impacto de cada marco no valor percebido

Escala qualitativa (Baixo/Médio/Alto/Crítico) — "valor percebido" aqui significa especificamente a impressão de um avaliador externo (publisher/investidor) nos primeiros 15 minutos de contato com o projeto, não a qualidade técnica interna.

| Marco | Esforço estimado | Impacto no valor percebido | Por quê |
| --- | --- | --- | --- |
| Equipment Progression Audit | Médio (1 Sprint, dados já existem) | **Crítico** | Sem isso, qualquer outra melhoria é maquiagem sobre uma sessão que não recompensa |
| Endgame Funnel Fix | Médio (1 Sprint, mesma técnica já usada 2x nesta fase) | Alto | Necessário só se o material de apresentação for mostrar conteúdo além dos primeiros 15min |
| Visual Polish | Alto (várias frentes: anim/som/partícula) | **Crítico** | Maior salto de "protótipo" pra "produto" que existe nesta lista inteira |
| Identity | Baixo-Médio (decisão de design + aplicação) | **Crítico** | Barato e determina a primeira impressão de tudo que vem depois |
| Steam Vertical Slice | Médio (curadoria, não nova feature) | Alto | Transforma o jogo em algo "mostrável", não muda o jogo em si |
| Trailer | Médio (produção) | **Crítico** | É o único ativo que a maioria dos publishers realmente assiste antes de decidir se vale a pena olhar o resto |
| Steam Page | Baixo | Alto | Converte atenção em wishlist — alto ROI, baixo custo |
| Pitch Deck | Baixo | Médio | Importante pra conversas formais, mas não substitui os itens acima |
| Publisher/Investor outreach | Baixo (uma vez que tudo acima existe) | Alto | É o passo que converte todo o trabalho anterior em oportunidade real |

**Conclusão prática**: os 4 itens marcados como "Crítico" (Equipment Progression Audit, Visual Polish, Identity, Trailer) são o caminho mínimo entre o estado de hoje e um projeto que gera a reação "eu quero saber mais" em vez de "isso ainda está em desenvolvimento". Tudo o mais neste roadmap existe para sustentar e distribuir essa reação, não para criá-la.

---

## 8. Plano macro pós-auditorias — produção de conteúdo (adicionado 2026-07-26, Global Gameplay Rebalance Phase I)

Com o Item Generator estabilizado (0.6) e o restante do jogo recalibrado pro novo ritmo (0.7), o projeto sai da fase de "auditoria repetida do mesmo sistema" e entra na fase de produção de conteúdo. Ordem recomendada abaixo, por dependência e complexidade — **não substitui a Seção 1** (que continua sendo o caminho crítico até um publisher); esta seção endereça o que vem depois/em paralelo, do lado puramente de código.

| # | Item | Complexidade | Depende de | Por quê nesta posição |
| --- | --- | --- | --- | --- |
| 1 | Eventos dinâmicos (expandir World Events) | Baixa-Média | Nada novo — sistema já existe (Treasure/Merchant/Shrine/Discovery/Ambush) | Maior retorno por esforço: só adicionar dados a uma arquitetura já validada, sem risco |
| 2 | Conteúdo de endgame (aprofundar Dungeons/Chefes existentes) | Baixa-Média | Global Gameplay Rebalance (concluído) | Chefes/Dungeons só voltaram a ser desafiadores NESTA Sprint — aprofundar antes disso teria sido retrabalho |
| 3 | Novas regiões | Média | Item 2 (decidir profundidade vs. amplitude primeiro) | Mecanicamente repetitivo (Region+EncounterTable+EnemyTemplate+LootTable, já feito 9x), mas cada região nova precisa herdar a calibração desta Sprint, não a antiga |
| 4 | Progressão de longo prazo (retenção além de uma campanha) | Média-Alta | Itens 2-3 (precisa saber o que "campanha longa" significa depois de endgame/regiões novas) | Toca hipóteses de design ainda não promovidas (ver memória: "Escala aumenta opções, não poder", "Character Legacy") — precisa de decisão de design real, não só dados |
| 5 | Economia e lojas | Alta | **Decisão arquitetural pendente**: split Gold emissão (Engine) vs. ledger/gasto (transacional) — já identificado e congelado como pré-requisito (ver memória "Gold ownership decision") | Não é trabalho de conteúdo, é uma decisão de arquitetura que precisa vir ANTES de qualquer loja — construir em cima do modelo atual de ouro criaria dívida técnica imediata |
| 6 | Crafting / evolução de equipamento | Alta | Item 5 (economia — crafting sem sink de recursos vira só "mais um jeito de achar item") + confirmação por playtest de que falta agência sobre o próprio equipamento | Risco real de fragmentar de novo o sistema que acabou de ser unificado (Continuous Affix Scaling) — só faz sentido se o playtest confirmar que "achar loot" sozinho não é suficiente |
| 7 | Polimento de interface e feedback visual | Média-Alta (várias frentes) | Nada de código — já é o item "Visual Polish" da Seção 1 (#3) | Já coberto, não duplicar; só reforçando aqui que idealmente acontece ANTES dos itens 2-4 acima começarem a gerar conteúdo que precisa desse polimento pra ser bem apresentado |
| 8 | Preparação para playtests externos em larga escala | Baixa (processo já existe) | Nada — `docs/playtesting/` já pronto desde 2026-07-25 (ver 0.3-0.5) | Já pronto, só falta EXECUTAR (ação humana, fora do escopo deste assistente) — deve rodar EM PARALELO a todo o resto desta lista, não esperar por nenhum item |
| 9 | ~~Persistência completa da sessão de Aventura (região/expedição/masmorra/timeline)~~ — **concluído 2026-07-26, ver 0.9** | — | — | Resolvido com um singleton de módulo (não um novo sistema de save) — ver 0.9 para detalhes e evidência de verificação |

**Recomendação de sequência real**: 8 (executar já, em paralelo) → 9 (bug crítico, alta prioridade) → 1 → 2 → 7 (Visual Polish, se ainda não feito pela Seção 1) → 3 → 4 → 5 → 6. Os itens 5/6 (Economia/Crafting) são deliberadamente os últimos: ambos têm um pré-requisito de decisão arquitetural ou de dados de playtest que ainda não existe, e implementá-los cedo demais arrisca exatamente o padrão que as últimas 6 Sprints de Item Generator passaram por: construir em cima de uma base que precisa ser desfeita depois.
