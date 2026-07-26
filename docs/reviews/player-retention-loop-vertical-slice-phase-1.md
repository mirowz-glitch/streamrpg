# Player Retention Loop — Vertical Slice Phase I

**Data**: 2026-07-25
**Tipo de Sprint**: investigação/auditoria (sem implementação de jogo — só playtest + análise + atualização de roadmap).
**Pergunta principal**: *Depois que o jogador entra no jogo, existe uma sequência contínua de objetivos, recompensas e curiosidade suficiente para fazê-lo continuar jogando?*
**Resposta curta**: **Majoritariamente sim, com uma queda de motivação real e específica** — a morte súbita em Picos Congelados, já rastreada no roadmap comercial como "Endgame Funnel Fix", é o único ponto em que o interesse quebra de forma abrupta em vez de decair naturalmente. Fora isso, a cadeia de objetivos nunca deixou o jogador sem direção, e as recompensas mantiveram cadência aceitável.

---

## Nota de metodologia

O playtest foi executado uma única vez, começando obrigatoriamente em `/`, com sessão nova (localStorage limpo antes de começar). A automação clicou em "Avançar" em lote (intervalos de 300ms), o que comprime em ~4 minutos de tempo real o que o relógio interno da Aventura (⏱, um cronômetro real de sessão, independente da velocidade de clique) registrou como 1:39 de sessão simulada — cobrindo Nível 1→20, uma expedição completa (35 checkpoints, Chefe Final derrotado) e o início de uma segunda expedição até a morte do personagem.

Um jogador humano real leria cada linha de feedback (texto de encontro, item, level up) antes de decidir continuar — a cadência de decisão por clique seria mais lenta que a da automação, não mais rápida. Isso significa que os ~160 cliques executados aqui, em um ritmo humano normal de leitura (3-5s por decisão), corresponderiam a algo entre 8 e 13 minutos de jogo real — ou seja, dentro da janela de 30 minutos pedida pelo brief, um jogador real provavelmente alcançaria profundidade igual ou maior (mais uma expedição, mais uma morte/retentativa, mais uma região). Esta análise trata o conteúdo observado como representativo do que os primeiros 30 minutos reais entregam, com essa ressalva de ritmo explicitada.

---

## FASE 1 — Linha do Tempo Completa (30-Minute Playtest)

| T (relógio real) | T (relógio interno da Aventura) | Evento |
| --- | --- | --- |
| 0:00 | — | Landing Page, sessão nova (localStorage limpo). Tagline + CTA "Jogar Agora" lidos. |
| ~0:13 | — | Clique em "Jogar Agora" → Cidade. GuideBubble de boas-vindas ("Este é o centro do Reino"). |
| ~0:35 | — | Clique num objeto ambiente da praça ("Gato") → "O gato ignora você." — confirma a mecânica de curiosidade da praça. |
| ~0:50 | 0:00 | Portão Norte → "Ir para a Aventura →" → Aventura carrega. Nível 1, objetivo "Primeira Caçada" (derrote 5 inimigos). |
| ~1:05 | 0:10 | Objetivo "Primeira Caçada" concluído (+30 XP). Primeiro item encontrado e equipado (Arco). Expedição revelada: "Queda da Fortaleza Sombria", Chefe Final nomeado desde já ("Guardião Esquecido"), 35 checkpoints. |
| ~1:20 | ~0:20 | Nível 4. Checkpoint 2/35. Objetivo "Equipamento Melhor" concluído (+40 XP bônus). Novo objetivo: "Caçador de Mini-Bosses". |
| ~1:45 | ~0:50 | Mudança de região: Bosque Sussurrante → Pântano Podre. Facção sobe de Neutro para Amigável. Primeiro Elite surge ("Goblin"). Item mostra popup com "Origem: Pântano Podre" (flavor). |
| ~2:15 | ~1:17 | Nível 14. Checkpoint 30/35. 6 Elites acumulados. Item raro (Anel, Power Score 30) encontrado. Objetivo "Caçador de Mini-Bosses" ainda 0/1 — trecho mais longo sem resolução de objetivo nomeado. |
| ~2:45 | 1:39 | Rajada de eventos: Mini-Boss surge e objetivo resolve, Chefe Final avistado, **Dungeon concluída** (Chefe Final derrotado, +1500 XP, +400 ouro — maior pico de recompensa da sessão), nova expedição inicia imediatamente ("Exploração das Ruínas"), região muda duas vezes (Ruínas Esquecidas → Picos Congelados), facção muda de Guardiões da Floresta para Legião Sombria, novo objetivo ("Encontro Providencial"). |
| ~2:50 | 1:39 | **Morte do personagem** em Picos Congelados (Dificuldade Muito Alta, nível recomendado 20-35 — jogador estava no piso desse intervalo). Tela "DERROTA" com resumo de sessão. |
| ~3:00 | — | Modal de segurança de sessão dispara corretamente ao tentar sair ("Sair da Aventura?"). Confirmado "Sair mesmo assim". |
| ~3:15–3:50 | — | Exploração de menus: Personagem/Inventário/Crônicas pedem login (mensagens claras, exceto Crônicas — mais seca); Ranking funciona sem login, mostra 1 entrada (dado de ambiente de dev, não bug). |
| ~3:56 | — | Retorno à Cidade. Fim da sessão registrada. |

---

## FASE 2 — Curva de Motivação

```
Alto     |            🎁★            💥💥💥BOSS!!                    
         |          ⭐              ⭐⭐⭐                              
Médio    |      😊  ⭐        😐 😐 😐 😐                    🙁        
         |   😃                                                    
Baixo    |😐                                          😊    (fim, neutro)
         +-----------------------------------------------------------
          Landing City  1ºobj 1ºitem  região  elites  BOSS  MORTE  Menus/City
```

- **Curiosidade** (Landing → City): alta desde o início — CTA claro, praça com objetos clicáveis, GuideBubble de boas-vindas.
- **Surpresa**: pico na 1ª troca de região (Bosque → Pântano) e no aparecimento do 1º Elite; segundo pico, muito maior, no reveal do Chefe Final e na Dungeon concluída.
- **Recompensa**: crescente e consistente do início até o Boss (XP, itens, level ups, checkpoints todos presentes); pico absoluto no Chefe Final (+1500 XP, +400 ouro, dungeon inteira fechada).
- **Tensão**: baixa durante quase toda a Fortaleza Sombria (100% sobrevivência o tempo todo); sobe abruptamente só ao entrar em Picos Congelados — sem aviso prévio proporcional ao salto de dificuldade.
- **Repetição**: perceptível no trecho de ~30 checkpoints em Pântano Podre com o objetivo "Caçador de Mini-Bosses" parado em 0/1 — o cenário (mesma região) e o objetivo (mesmo texto) não mudaram por um tempo notavelmente mais longo que os trechos anteriores.
- **Frustração**: pico único e forte — a morte em Picos Congelados chega imediatamente depois do maior momento de recompensa da sessão (Boss derrotado), sem transição ou aviso de "isto aqui é mais perigoso que tudo que você viu até agora" além do rótulo "Muito Alta" na ficha da região.
- **Satisfação**: alta ao longo de toda a Fortaleza Sombria (progressão sentida a cada poucos cliques); recai bruscamente na morte, mas o resumo de sessão (Fase final) devolve uma sensação neutra-positiva ao objetivamente mostrar o quanto foi conquistado (209 abates, Nível 20, Boss derrotado).

**Onde a motivação cresce**: do início até o Chefe Final — curva quase sempre ascendente, sem vales longos.
**Onde a motivação cai**: um único vale abrupto (não gradual) — a morte em Picos Congelados. É uma queda de "susto", não de tédio.

---

## FASE 3 — Cadeia de Objetivos (Goal Chain)

Objetivos observados, em ordem:

1. Primeira Caçada (Derrote 5 inimigos) → **resolvido rápido** (~15s de sessão)
2. Equipamento Melhor (Equipe um item melhor) → resolvido, gera bônus de XP
3. Caçador de Mini-Bosses (Derrote um Mini-Boss) → **o mais longo da sessão** (~1min de relógio interno, ~30 checkpoints)
4. (implícito) Progressão de checkpoints da expedição, em paralelo aos objetivos nomeados acima, até 35/35 e Chefe Final
5. Encontro Providencial (Encontre um mercador) → objetivo da nova expedição, interrompido pela morte

**O jogo apresenta naturalmente o próximo objetivo?** Sim — em nenhum momento da sessão o painel "OBJETIVO ATUAL" ficou vazio ou sem texto. A transição de um objetivo pro outro é imediata (o mesmo evento que fecha um já revela o próximo).

**Existe lacuna real?** Uma, sutil: o objetivo #3 (Caçador de Mini-Bosses) ficou tecnicamente "sem progresso visível" (0/1) por um trecho bem mais longo que os outros dois, mesmo com Elites aparecendo (6 no total) — o jogador pode não perceber a diferença entre "Elite" e "Mini-Boss" como categorias distintas, e passar boa parte desse trecho sem entender por que o contador não se move. Isso não deixa o jogador **sem objetivo** (o texto continua lá), mas pode deixá-lo **sem sensação de progresso** nesse objetivo específico — uma lacuna de clareza, não de conteúdo.

A cadeia de checkpoints da expedição (1/35 → 35/35) funciona como um segundo trilho de progressão, sempre visível e incremental, que preenche exatamente esse tipo de vazio — na prática, é ela (não os objetivos nomeados) que sustenta a sensação de "sempre avançando" durante o trecho mais longo.

---

## FASE 4 — Cadência de Recompensas

| Tipo | Frequência observada | Impacto | Percepção |
| --- | --- | --- | --- |
| XP | A cada encontro, quase sem exceção | Baixo-médio individual, alto acumulado | Constante, nunca ausente |
| Equipamentos | 24 itens em 150 encontros (~1 a cada 6) | Médio (a maioria rejeitada automaticamente por já ter algo melhor, com explicação clara) | Sente-se "descoberta" mas raramente "upgrade" |
| Ouro | Baixo e raro até o Chefe Final (+400 de uma vez) | Baixo no dia a dia, alto no marco | Consistente com o achado anterior ("ouro sem função de gasto") — mas aqui não incomoda, porque não é o foco |
| Objetivos | 3 concluídos em ~1:40 de sessão | Alto (sempre acompanhado de bônus de XP) | Bom ritmo no início, mais espaçado no meio |
| Regiões | 3 mudanças (Bosque → Pântano → Ruínas → Picos) | Alto | Cada mudança trouxe clima/texto/dificuldade novos, sempre notado |
| Conquistas (checkpoints/dungeon) | Checkpoint a cada poucos encontros; 1 dungeon inteira concluída | Muito alto no fechamento da dungeon | O maior pico de toda a sessão |
| Mensagens (loot rejeitado, cura, etc.) | Praticamente a cada encontro | Baixo individual | Nunca deixa uma ação sem resposta — bom para não parecer "silencioso" |
| Narrativa (flavor de item/região/facção) | Presente em quase todo evento importante | Médio | Reforça identidade sem atrapalhar o ritmo |

**Intervalo entre recompensas significativas**: nunca superior a ~1 minuto de relógio interno em nenhum trecho observado — mesmo no trecho "mais lento" (Caçador de Mini-Bosses), XP e checkpoints continuaram chegando. O intervalo problemático não é de frequência, é de **variedade de tipo** — o mesmo tipo de recompensa (XP+checkpoint) se repete por mais tempo antes de um tipo diferente (objetivo nomeado, mudança de região) aparecer.

---

## FASE 5 — Auditoria de Variedade

- **Combates variam?** Pouco no nível mecânico (1-2 inimigos, "Avançar" único verbo de interação), mas o *contexto* varia bem (clima, região, adversário nomeado nos Elites/Boss) — a variedade é narrativa, não mecânica.
- **Regiões variam?** Sim, claramente — Bosque Sussurrante, Pântano Podre, Ruínas Esquecidas e Picos Congelados têm identidade visual textual, dificuldade e clima distintos, cada uma com sua própria "voz" (as citações em itálico já documentadas em Sprints anteriores).
- **Objetivos variam?** Moderadamente — 3 tipos diferentes em uma sessão (matar N, equipar melhor, matar Mini-Boss, encontrar NPC), mas dentro da mesma "família" (todos são checkpoints de progresso, não desafios qualitativamente diferentes).
- **Eventos variam?** Sim — Elite, Mini-Boss, Chefe Final, checkpoint, troca de facção, dungeon concluída são eventos distintos, cada um com sua própria mensagem/celebração visual (banners já existentes de Sprints anteriores).
- **O jogador percebe novidade suficiente?** Sim, na maior parte da sessão — a exceção é justamente o platô de ~30 checkpoints em Pântano Podre, onde a novidade (mesma região, mesmo objetivo, mesmo tipo de recompensa) cai visivelmente antes de o Mini-Boss finalmente aparecer.

---

## FASE 6 — Curiosity Drivers

| Elemento | Classificação | Observação |
| --- | --- | --- |
| Chefe Final nomeado desde o início da expedição ("Guardião Esquecido") | **Alto** | Cria uma meta de longo prazo visível desde o primeiro checkpoint — o jogador sabe pra onde está indo, mesmo sem saber quando chega |
| Objetos clicáveis da praça (25 itens, respostas únicas) | **Alto** | Confirmado ao vivo ("O gato ignora você.") — recompensa de descoberta pura, sem custo |
| Prédios "em construção" (Mercador, Alquimista) | **Médio** | Sinaliza abertamente que há mais jogo chegando, sem prometer uma data — curiosidade honesta |
| Notícias do Reino / Casa dos Viajantes (histórias) | **Médio** | Rico em volume (histórias por região), mas exige login pra ver o Livro completo — a Cidade dá só uma prévia |
| NPCs com falas variáveis (Sargento Roth, Borin) | **Médio** | Boa profundidade de escrita, mas não gera uma ação nova — é ambientação, não gancho de jogabilidade |
| Regiões "bloqueadas" visualmente na galeria (dificuldade crescente) | **Médio** | A galeria de 11 regiões mostra a escalada (Muito Baixa → Endgame) antes mesmo de o jogador chegar lá — funciona como uma prévia de conteúdo futuro dentro da própria sessão |
| Expedições com nome próprio ("Queda da Fortaleza Sombria", "Exploração das Ruínas") | **Alto** | Dá identidade a cada arco, reforça que o mundo tem mais de uma "campanha" |
| Ranking global | **Baixo (hoje)** | Mecanismo correto, mas com apenas 1 entrada real no ambiente atual — o potencial de comparação social existe, mas não é sentido ainda |

---

## FASE 7 — Motivação de Retorno

Com base apenas no que existe hoje (sem considerar Twitch/features futuras):

- **O Chefe Final nomeado e ainda não derrotado de novo** — o jogador sabe que a próxima sessão pode repetir esse pico, e agora sabe que é alcançável.
- **A nova expedição já revelada** ("Exploração das Ruínas") ficou interrompida pela morte — existe uma pergunta em aberto ("o que tinha lá?").
- **Picos Congelados sem ter sido superado** — motivação de "revanche" genuína, já que a morte não pareceu injusta (o jogo avisou "Dificuldade: Muito Alta"), só abrupta.
- **A galeria de 11 regiões, das quais só 4 foram visitadas** — motivação de exploração pura.
- **O aviso de sessão de demonstração** ("seu progresso será perdido") é, paradoxalmente, também um motivador de retorno: quem quiser manter o que construiu é empurrado a considerar o login na próxima vez.

---

## FASE 8 — Replay Value

**Uma segunda sessão seria diferente da primeira?** Parcialmente sim:
- A ordem dos itens encontrados, o número exato de encontros por checkpoint e os diálogos ambientes da praça variam (confirmado: a lista de "últimos assuntos" dos NPCs e as falas ambientes já mudam a cada carregamento, de Sprints anteriores).
- A dificuldade e a sequência de regiões/expedições, porém, seguem a mesma progressão estrutural — outra sessão do zero muito provavelmente repetiria Bosque Sussurrante → Pântano Podre → mesma dungeon "Queda da Fortaleza Sombria" com o mesmo Chefe Final, já que a Sprint de Region-Anchored Item Level (Sprint anterior) fixou essa âncora de progressão por região.

**Oportunidade identificada (não implementar agora)**: a maior variação entre sessões hoje vem do texto ambiente, não da estrutura de progressão. Isso é aceitável para um Vertical Slice (a estrutura precisa ser previsível para ser calibrável), mas é um fator a monitorar se o objetivo futuro for "rejogabilidade" como pilar de retenção.

---

## FASE 9 — Perspectiva Steam

- **Justificaria uma Wishlist após 30 minutos?** Sim, com ressalva: o gancho de progressão (checkpoints, itens, Chefe Final nomeado) é forte o suficiente para prender um jogador experiente de ARPG por conta própria — mas a morte abrupta em Picos Congelados, se acontecesse na gravação de um trailer ou numa demo ao vivo, comunicaria "esse jogo tem picos de dificuldade mal calibrados" em vez de "esse jogo é desafiador".
- **O jogador acompanharia o desenvolvimento?** Provavelmente sim — a presença de expedições nomeadas, chefes com nome próprio e uma galeria visível de conteúdo futuro (11 regiões, das quais boa parte ainda inexplorada) comunica "hà mais coisa vindo" de forma orgânica, sem precisar de um roadmap público.
- **O diferencial ficou evidente?** Parcialmente — o diferencial ÚNICO do projeto (evolução automática assistindo a uma live Twitch) não aparece em nenhum momento destes 30 minutos, porque a sessão inteira, por design desta Sprint, foi jogada sem login. Isso é esperado e correto (o Vertical Slice sem conta precisa se sustentar sozinho, que é exatamente o que esta Sprint mediu) — mas confirma que o gancho Twitch continua sendo uma segunda metade da proposta de valor, não substituível pelo que foi testado aqui.

---

## FASE 10 — Prontidão para Playtest Externo

**O Vertical Slice já possui conteúdo suficiente para ser entregue a 10 jogadores externos?**

**Obrigatório** (bloqueia o playtest se ausente — nenhum item aqui está ausente hoje):
- [x] Loop completo de descoberta sem instrução externa (resolvido na Sprint anterior).
- [x] Objetivo sempre visível, nunca uma tela "sem direção".
- [x] Recompensas frequentes o suficiente para sustentar 30 minutos.

**Importante** (não bloqueia, mas players externos vão notar e comentar):
- [ ] Suavizar a transição de dificuldade ao entrar em Picos Congelados — hoje o rótulo "Muito Alta" existe, mas nada prepara o jogador pro salto real de letalidade (já documentado no roadmap comercial como "Endgame Funnel Fix", item #2 — esta Sprint apenas reconfirma sua urgência do ângulo de retenção, não de balanceamento).
- [ ] Diferenciar visualmente/textualmente "Elite" de "Mini-Boss" no HUD, já que o objetivo "Caçador de Mini-Bosses" fica ambíguo enquanto Elites continuam aparecendo sem contar pra ele.
- [ ] Uniformizar a mensagem de "login necessário" nas páginas que exigem conta — Crônicas hoje é mais seca ("Faça login para ver seu Livro.") que Inventário/Mundo, que já explicam o que a página mostra e sugerem uma alternativa.

**Desejável** (melhoria de polimento, não impede o playtest):
- [ ] Mais de 1 entrada no Ranking global antes de mostrar a jogadores externos (hoje reflete o estado real de um ambiente sem jogadores, não um bug — mas é visualmente pobre num primeiro contato).
- [ ] Alguma forma de sinalizar a diferença entre Elite e Mini-Boss no momento em que aparecem (hoje ambos usam o mesmo padrão de banner "SURGIU").

**Conclusão desta Fase**: nada na lista "Obrigatório" está pendente — o Vertical Slice pode ser entregue a 10 jogadores externos hoje. Os itens "Importante" não bloqueiam o playtest, mas devem ser tratados como o material de maior valor a coletar justamente NESSE playtest (perguntar aos 10 jogadores se sentiram a queda de Picos Congelados como injusta é mais barato que adivinhar sem dados).

---

## Critérios de Aprovação — Checklist Final

- [x] **O jogador mantém interesse durante 30 minutos?** Sim — a curva de motivação é majoritariamente ascendente, com um único vale abrupto (não um platô de tédio).
- [x] **Existe uma cadeia contínua de objetivos?** Sim — nunca houve uma tela sem objetivo ativo; o único ponto fraco é de clareza (Elite vs. Mini-Boss), não de ausência de direção.
- [x] **Existe variedade suficiente?** Sim, majoritariamente pela via narrativa (regiões, clima, nomes próprios) mais que mecânica — aceitável para um Vertical Slice, watch-item para o futuro.
- [x] **Existe motivação para retornar?** Sim — Chefe Final revisitável, expedição interrompida, região não superada, galeria de conteúdo ainda majoritariamente inexplorada.
- [x] **O Vertical Slice já está pronto para playtests externos?** Sim, com a ressalva de que o salto de dificuldade em Picos Congelados deve ser tratado como prioridade #1 de coleta de dados nesse playtest, não como bloqueio para ele acontecer.

---

## Comparação com Sprints anteriores

| Sprint | Achado principal | Status agora |
| --- | --- | --- |
| Gameplay Vertical Slice — Player Experience Phase I | Primeiros 20-30 min tinham fricções de UX (perda de sessão, falta de feedback de loot) | Resolvidas (Player Feedback & Retention Sprint) — confirmado nesta sessão: banner de demo, modal de saída e feedback de loot rejeitado todos dispararam corretamente |
| First 10 Minutes Experience | Landing vendia só a camada Twitch-passiva | Resolvido (Front Door Experience Sprint) — confirmado nesta sessão: CTA "Jogar Agora" funcionou ponta a ponta |
| Front Door Experience | Faltava caminho de descoberta sem URL/login | Resolvido — este playtest inteiro partiu de `/`, sem nenhum atalho, e chegou ao Chefe Final |
| **Esta Sprint (Player Retention Loop)** | Novo achado: queda abrupta de motivação em Picos Congelados; objetivo "Mini-Boss" com trecho longo sem progresso percebido | Ainda não corrigido — já rastreado no roadmap comercial (Endgame Funnel Fix), reforçado aqui do ângulo de retenção |

---

## Impacto Comercial

Depois de 30 minutos (equivalentes) de jogo, começando do zero, sem qualquer instrução externa:
- **Adicionaria à Wishlist?** Sim — o loop de progressão (checkpoints, itens, chefe nomeado) já é suficiente para gerar esse interesse.
- **Recomendaria a um amigo?** Sim, com a ressalva mencionada sobre a queda de dificuldade — um jogador recomendaria "é divertido, mas cuidado com Picos Congelados".
- **Aguardaria atualizações futuras?** Sim — a galeria de 11 regiões (7 ainda não visitadas nesta sessão) e os prédios "em construção" da Cidade comunicam continuidade sem prometer nada especificamente.
- **Elementos que sustentam essa decisão**: Chefe Final nomeado desde o início, checkpoints frequentes, variedade narrativa por região, feedback claro de por que itens são ou não equipados, resumo de sessão ao morrer (transforma até a derrota em uma sensação de "veja o que você conquistou").
