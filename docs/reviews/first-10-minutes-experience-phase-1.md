# First 10 Minutes Experience — Vertical Slice (Phase I)

Playtest real, começando do verdadeiro ponto de entrada (`http://localhost:4000/`, a landing page — não `/app/adventure` diretamente, como nas Sprints anteriores desta série). Nenhuma mecânica central foi alterada nesta Sprint; um bug de digitação já identificado (e corrigido, mas nunca implantado) na Sprint anterior foi finalmente publicado.

**Resposta à Objetivo Principal**: sim, existe um momento — na verdade, o PRIMEIRO momento — em que o jogador não sabe o que fazer, porque **ele nunca chega a descobrir isso**. A landing page anuncia um jogo completamente diferente do que as últimas 5 Sprints testaram.

---

## 0. Achado Estrutural — antes de qualquer fase

A landing page (`/`, `LoginPage.tsx`) descreve o StreamRPG como: *"Seu personagem vive enquanto você acompanha seus criadores favoritos"* — um companion app passivo, ligado a assistir streams da Twitch (`"Evolua: Ganhe experiência automaticamente enquanto assiste"`). O fluxo "Como funciona" anunciado é: Entrar com Twitch → Escolher uma live → Personagem nasce → Explora o mundo → Enfrenta Bosses → Constrói legado.

**A Aventura ativa (clicar em "Avançar", testada nas últimas 5 Sprints) nunca é mencionada na landing page.** O único botão de ação é "Entrar com Twitch" (2 vezes na página) — que dispara um redirecionamento real de OAuth da Twitch. Esta auditoria não pode completar login real (credenciais de terceiros, fora do que um agente pode/deve fazer), então **um visitante genuinamente novo, sem conhecimento prévio do projeto e sem já saber as URLs internas, não tem NENHUM caminho visível pra chegar em `/app/adventure`, `/app/city` ou qualquer outra tela** — mesmo essas páginas tecnicamente não exigindo login (verificado: `/app/city` e `/app/adventure` carregam sem autenticação; simplesmente não há link nenhum até elas a partir de `/`).

Isto não é um problema desta Sprint criar nem corrigir sozinho — é uma descoberta que muda o que "onboarding" significa aqui: **o onboarding do produto ATUAL (clique ativo) não existe hoje, porque o produto ANTIGO (assistir passivamente) ainda ocupa toda a porta de entrada.** Tratado como o Achado #0, e referenciado em todas as fases abaixo.

A partir daqui, toda a auditoria (Fases 1-10) foi feita navegando diretamente pelas rotas internas (`/app/city`, `/app/adventure`, etc.) — a MESMA limitação que qualquer playtester externo teria, exceto que eu sabia as URLs e eles não saberiam.

---

## 1. Jornada dos Primeiros 10 Minutos (Entrega 1)

| Tempo | Ação | Emoção | Recompensa | Dúvida |
| --- | --- | --- | --- | --- |
| 0:00 (real) | Landing page carrega | Curiosidade — visual rico, mundo com personalidade | — | "Isso é sobre assistir stream ou jogar?" |
| 0:00-0:30 | Rolagem pela landing page: features, "Como funciona", 11 regiões, Reino/Prestígio, Cidade, NPC (Borin), personagem de exemplo (Kaio) | Impressionado com a profundidade — MUITO conteúdo mostrado antes de qualquer ação | — | Nenhuma ainda — é só leitura |
| 0:30 | Único CTA: "Entrar com Twitch" | **Bloqueio** — exige conta Twitch real | — | "Preciso mesmo de Twitch pra ver o resto?" |
| (bypass de URL) | `/app/city` | Alívio + encantamento — relógio ao vivo, "kingdom news", 24 objetos clicáveis | Curiosidades do dia (ex.: "Pedra") | "Como eu inicio uma aventura daqui?" |
| — | Clique em "Portão Norte" (que a própria Cidade descreve como "a saída para o mundo") | Expectativa | NPC (Sargento Roth) + lista de regiões | **Sem nenhum botão pra realmente ir** — só informação |
| (bypass de URL) | `/app/adventure` | Orientação clara — vida, XP, objetivo, região, botão "Avançar" | — | Nenhuma real — o painel já é bem auto-explicativo |
| 1º clique | Primeiro combate + vitória | Satisfação imediata | +7 XP, 1/5 objetivo | Nenhuma |
| 2º tick | "Expedição: Queda da Fortaleza Sombria" + "Boss Final: Guardião Esquecido" aparecem | Confusão leve — sistemas de longo prazo revelados cedo demais | — | "Isso é pra agora ou pra muito depois?" |
| ~5-8 cliques | Primeiro loot, primeira rejeição explicada ("X não foi equipado — Y ainda é melhor") | Clareza — acabou de ser corrigido na Sprint anterior | Item visto, comparação entendida | Nenhuma |
| ~10-15 cliques | Level Up (repetido, várias vezes) | Satisfação crescente | Atributos sobem, HP máximo cresce | Nenhuma |
| ~20 cliques | Expedição concluída (+XP, +ouro real) | Recompensa clara e nomeada | 1ª moeda de ouro ganha | Nenhuma |
| ~25 cliques | Transição de região (Bosque Sussurrante → Pântano Podre) | Surpresa agradável — clima/atmosfera mudam de verdade | Novo cenário, novo texto | Nenhuma |
| ~30-50 cliques | Fação sobe de rank (Neutro → Amigável → Respeitado → Honrado) | Satisfação de progressão paralela | Rótulo de rank muda | Nenhuma |
| ao longo de toda a sessão | "Roubo de Vida 0" aparece repetidamente no log | Ruído — nenhuma informação real | — | "O que é isso? Por que aparece se é sempre 0?" |
| a qualquer momento | Tentar "Mundo" no menu | Confuso | — | **"Carregando o Reino..." para sempre, sem explicação** |

---

## 2. First Impression (Entrega 2)

**Primeiros 30 segundos**: impressionante e ambicioso — a landing page sozinha comunica mais personalidade/mundo (11 regiões com atmosfera própria, uma cidade viva, um sistema de prestígio, NPCs com falas) do que a maioria dos jogos indie mostra em 10 minutos de gameplay real. Mas a mensagem central ("assista streams, ganhe XP automaticamente") não prepara o visitante pro que ele realmente vai jogar se entrar.

**Primeiros 2 minutos**: se o visitante não tiver Twitch (ou não quiser logar), a experiência PARA aqui — rolando a mesma landing page repetidamente, sem novidade. Se soubesse a URL de `/app/city` ou `/app/adventure` (o que só um playtester interno saberia), os 2 minutos seriam de exploração rica e sem atrito real.

**Primeiros 10 minutos** (via `/app/adventure`): sólida curva de progressão real — múltiplos Level Ups, uma Expedição inteira completada com recompensa nomeada, mudança de região, evolução de reputação de facção. A base de jogo é genuinamente satisfatória quando alcançada.

---

## 3. Momentos Memoráveis (Entrega 3)

- **Surpresa**: a profundidade da landing page (11 regiões com atmosfera própria, NPC com falas dinâmicas, sistema de Prestígio) — mais rica do que a média do gênero.
- **Curiosidade**: a Cidade — relógio ao vivo, "kingdom news" ambiente, 24 objetos clicáveis com curiosidade do dia.
- **Satisfação**: cada Level Up; a primeira Expedição concluída com recompensa nomeada (+200 XP, +50 ouro) — sensação clara de "terminei algo".
- **Tensão**: nenhuma tensão real observada nesta sessão específica (vida nunca caiu abaixo de ~70%, diferente de sessões anteriores desta série que chegaram a 15%) — a dificuldade parece variar bastante entre seeds/sessões.
- **Recompensa**: mudança de região (Bosque Sussurrante → Pântano Podre) — clima, cor, tom mudam de verdade, sensação real de "cheguei a um lugar novo".

---

## 4. Pontos de Confusão (Entrega 4)

| Ponto | Motivo | Impacto | Frequência |
| --- | --- | --- | --- |
| **Nenhum caminho da landing page até o jogo jogável, sem Twitch** (Achado #0) | Marketing descreve um produto (companion passivo) diferente do testável (Aventura ativa) | Crítico — impede QUALQUER playtest externo sem gambiarra de URL | 100% dos visitantes novos |
| **"Mundo" trava em "Carregando o Reino..." pra sempre** | Página exige contexto de canal/streamer que não existe sem login, sem nenhuma mensagem de erro | Alto | Qualquer clique em "Mundo" sem login |
| **"Portão Norte" (Cidade) promete "a saída para o mundo" mas não tem botão de ação** | A própria ficção do jogo cria uma expectativa (ir pra Aventura) que a UI não cumpre | Médio | Toda vez que um jogador explora a Cidade em busca de como começar |
| **Expedição/Boss Final revelados no 2º clique**, antes do jogador entender combate básico | Sequenciamento de informação, não falta de informação | Médio | Toda sessão nova |
| **"Roubo de Vida 0" repetido no log** | Floating number aparece mesmo com valor zero/irrelevante | Baixo | Frequente, mas baixo custo de atenção |
| **Objetivo "Matador de Guardiões: Derrote o Guardião Esquecido" nunca progride** apesar de 100+ abates | O Boss não aparece em encontros comuns — não fica claro que é preciso outra coisa (Dungeon/Expedição específica) | Médio | Enquanto o objetivo estiver ativo |

---

## 5. Cognitive Load Map (Fase 2)

| Elemento | Classificação |
| --- | --- |
| Vida, XP, Objetivo Atual, botão Avançar | Necessário |
| Nome/atmosfera da região | Necessário (ancora o jogador no mundo) |
| Facção Atual (barra de reputação) | Opcional no início — só relevante depois de entender combate |
| Expedição + Boss Final (revelados no 2º clique) | **No momento errado** — deveria aparecer depois do 1º objetivo simples ser concluído, não junto |
| "Roubo de Vida 0" / floating numbers de valor zero | Desnecessário |
| "🧳 Mercador Perdido" / "⚔️ Caçadores" (fragmentos sem contexto no meio do painel) | Desnecessário na forma atual — parecem rótulos de sistemas maiores (Loot Identity/Facção) sem frase completa |

**Existe informação demais?** Sim, nos primeiros 1-2 cliques (Expedição + Boss Final + Facção todos de uma vez). **De menos?** Não — o resto do painel é bem dimensionado. **No momento errado?** Sim — ver acima.

---

## 6. Goal Clarity (Fase 3)

- **Objetivo imediato**: claro — "Derrote 5 inimigos" (Primeira Caçada), sempre visível no painel.
- **Objetivo de médio prazo**: parcialmente claro — objetivos encadeados aparecem automaticamente (Caçador de Tesouros, Amigo dos Mercadores, Matador de Guardiões), mas o jogador não escolhe nem entende o critério de progressão entre eles.
- **Objetivo de longo prazo**: presente mas prematuro — "Boss Final: Guardião Esquecido" e "Checkpoint X/35" aparecem cedo demais pra serem um objetivo de longo prazo compreendido; parecem, no início, só mais um número na tela.

**Melhoria proposta** (não implementada): atrasar a revelação de Expedição/Boss Final até o primeiro objetivo simples ser concluído (já recomendado na Sprint anterior, ainda válido, ainda não implementado).

---

## 7. Discovery Audit (Fase 5)

| Destino | Descoberta natural? |
| --- | --- |
| Cidade | **Não** — só por tentativa e erro/URL direta; nenhum link a partir da landing page |
| Aventura | **Não** — mesmo problema; uma vez dentro do app (`/app/*`), sim, natural (nav bar sempre visível, item com destaque `nav-glow`) |
| Equipamentos | Parcialmente — só descobertos jogando a Aventura; a Cidade tem um "Ferreiro" que promete mostrar equipamento, mas não teve tempo de validar profundamente nesta Sprint |
| Inventário | Natural, uma vez logado ou navegando por tentativa — já corrigido (Sprint anterior) pra explicar quando vazio/sem login |
| Objetivos | Natural — sempre visível no painel de Aventura |
| NPCs | Natural e um dos pontos mais fortes — Cidade tem múltiplos NPCs com falas dinâmicas, descobertos só de clicar nos prédios |
| Construções | Natural (Cidade), mas "Portão Norte" cria uma expectativa de ação que não se cumpre |
| Notícias ("kingdom news") | Natural — aparecem ambientalmente na Cidade sem exigir nenhuma ação |

**Conclusão**: dentro do app (`/app/*`), a descoberta é majoritariamente natural e bem feita. **A porta de entrada (landing → app) é inteiramente por tentativa e erro ou conhecimento prévio.**

---

## 8. Interface Guidance (Fase 6)

- **Botões pouco claros**: nenhum encontrado dentro da Aventura/Cidade — "Avançar"/"Reiniciar" são diretos.
- **Menus escondidos**: nenhum — a nav bar é sempre visível uma vez dentro do app.
- **Ações importantes pouco destacadas**: "Portão Norte" na Cidade parece uma ação (tem verbo "saída"), mas é só informação.
- **Feedback insuficiente**: `/app/world` sem login — tela infinita de carregamento, sem mensagem.
- **Mensagens redundantes**: nenhuma nova encontrada (a duplicidade Inventário já foi corrigida na Sprint anterior).

---

## 9. Friction Ranking (Fase 7)

| Prioridade | Atrito | Impacto | Frequência | Facilidade de correção |
| --- | --- | --- | --- | --- |
| **Crítico** | Nenhum caminho da landing page até o app sem Twitch (Achado #0) | Bloqueia 100% dos playtests externos | Sempre | Alta complexidade — decisão de produto (adicionar modo "explorar sem login"? Atualizar copy da landing pra refletir a Aventura ativa?) |
| **Alto** | `/app/world` trava sem explicação | Confunde qualquer visitante que clique em "Mundo" sem login | Sempre (sem login) | Baixo custo — mensagem de estado vazio, mesmo padrão já aplicado em Character/Streamer/Chronicle |
| **Médio** | "Portão Norte" promete ação, não entrega | Expectativa quebrada | Toda exploração da Cidade | Baixo custo — adicionar um link/botão "Ir para a Aventura" ali |
| **Médio** | Expedição/Boss Final revelados cedo demais | Sobrecarga cognitiva inicial | Toda sessão nova | Médio custo — sequenciamento de UI, já recomendado antes |
| **Baixo** | "Roubo de Vida 0" e fragmentos sem contexto no log | Ruído visual | Frequente | Baixo custo — suprimir floating numbers de valor 0 |

---

## 10. Hook Moment (Fase 8)

O momento em que um jogador pensaria "quero continuar jogando" é a **conclusão da primeira Expedição** (~20 cliques): um marco NOMEADO, com recompensa clara (+200 XP, +50 ouro) e sensação real de progresso de longo prazo pago — diferente de um Level Up (que é esperado) ou um item comum (que é frequente e às vezes rejeitado). Esse momento hoje já EXISTE e funciona bem — o problema não é a ausência de um Hook Moment, é que **poucos jogadores vão chegar até ele**, dado o Achado #0.

---

## 11. Steam Store Perspective (Fase 9)

- **Diferencial ficou claro?** Não completamente — a landing page vende "companion de Twitch" (nicho, exige Twitch), enquanto o jogo testável é um clicker/incremental de progressão com mundo vivo — um diferencial genuinamente mais amplo (não exige ser espectador de ninguém) que não está sendo comunicado.
- **Personalidade/identidade?** Sim, fortemente — Cidade, NPCs, regiões, "kingdom news" têm voz própria e consistente.
- **Recomendaria continuar?** Quem chegasse à Aventura, provavelmente sim — a curva de progressão real (múltiplos Level Ups, Expedição completa, mudança de região em poucos minutos) é satisfatória.
- **Momentos para trailer**: a Cidade viva (relógio, NPCs, "kingdom news"); a transição de região com mudança de atmosfera; a conclusão de uma Expedição com recompensa nomeada.

---

## 12. External Playtest Readiness (Fase 10)

**Obrigatórios antes do primeiro playtest externo:**
1. Resolver o Achado #0 — sem isso, nenhum playtester de fora do projeto vai além da landing page.
2. Corrigir `/app/world` sem login (mensagem de estado vazio).

**Recomendados antes da página da Steam:**
3. Adicionar um link/botão de ação em "Portão Norte" (Cidade → Aventura).
4. Adiar revelação de Expedição/Boss Final.
5. Decidir o texto da landing page: alinhar com o produto que será testado (Aventura ativa) ou manter o companion passivo como um MODO adicional, claramente diferenciado.

**Desejáveis para acesso antecipado:**
6. Suprimir floating numbers de valor 0 ("Roubo de Vida 0").
7. Investigar por que o objetivo "Matador de Guardiões" não progride em encontros comuns — comunicar isso ao jogador, se for intencional.

---

## Commercial Impact (Entrega 6)

Um jogador que encontrasse o StreamRPG na Steam e clicasse "jogar" hoje **nem chegaria a ver os 10 minutos de gameplay que esta série de Sprints já validou como sólidos** — ele veria uma landing page pedindo login com Twitch pra um mecanismo de companion passivo. Isso reduz a chance de adicionar à lista de desejos por dois motivos: (1) exige uma conta de terceiros antes de qualquer prova de valor; (2) a mensagem não corresponde ao produto mais forte que o projeto já tem (a Aventura ativa). Resolver o Achado #0 é, provavelmente, a mudança de MAIOR impacto comercial disponível hoje — maior que qualquer polimento adicional de UX já feito nas últimas 2 Sprints.

---

## Trailer Opportunities (Entrega 7)

1. **A Cidade viva** — relógio em tempo real, "kingdom news" ambiente, NPCs com falas — comunica mundo persistente em poucos segundos de tela.
2. **Transição de região** — mudança de atmosfera/clima real ao avançar no mundo.
3. **Conclusão de Expedição** — recompensa nomeada, números reais subindo (XP/ouro).
4. **Sequência de Level Up** — mostrar 2-3 subindo em sequência comunica ritmo de progressão sem precisar explicar regras.

---

## Roadmap Atualizado (Entrega 8)

Reordenando `project-valuation-roadmap.md` com base neste playtest:

1. **[Obrigatório]** Decidir e implementar um caminho de entrada real pro Vertical Slice (Achado #0) — sem isso, nenhuma outra melhoria de UX chega a ser vista por alguém de fora do projeto.
2. **[Obrigatório]** Corrigir `/app/world` sem contexto de canal.
3. **[Recomendado]** CTA real em "Portão Norte".
4. **[Recomendado]** Sequenciamento de Expedição/Boss Final.
5. Todo o resto do roadmap anterior (decisão de modelo de progressão de equipamentos, etc.) permanece válido, mas em prioridade menor que os itens acima — não adianta refinar o que acontece DEPOIS que o jogador entra, se hoje quase ninguém de fora consegue entrar.

---

## Validação

- **Playtest manual único**: sessão real, começando da landing page (`/`), cobrindo os 12 passos do Smoke Test — Cidade, descoberta (parcial, com o achado documentado), Aventura (~85 cliques, nível 1→11, 2 Expedições completas, transição de região), navegação por Ranking/Mundo/Streamer/Crônicas.
- **Mudança em produção**: nenhuma nesta Sprint — apenas o redeploy de uma correção de texto já feita e aprovada na Sprint anterior (nunca publicada por falta de reiniciar o servidor de dev).
- **Typecheck/suíte**: não necessário — nenhum código alterado nesta Sprint.
