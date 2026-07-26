# 1. Playtest Goals & Tester Profiles

## Por que este capítulo existe

Um playtest sem perguntas específicas produz opiniões soltas ("gostei", "achei legal") em vez de conhecimento acionável. Este capítulo define, antes de qualquer sessão acontecer, exatamente o que cada uma delas precisa responder — e para quem.

---

## Playtest Goals — perguntas que cada sessão deve responder

Cada pergunta abaixo é observável (tem uma resposta sim/não/onde, não uma opinião) e mapeia para um momento específico do Vertical Slice.

| # | Pergunta | Onde é observada | Por que importa |
| --- | --- | --- | --- |
| 1 | O jogador entende, só de olhar a Landing Page, como começar? | Landing → clique em "Jogar Agora" | Mede se o CTA e a copy (Front Door Experience Sprint) realmente funcionam para alguém de fora |
| 2 | Ele descobre a Cidade naturalmente, sem instrução? | Primeiros segundos em `/app/city` | Mede se a Praça Central comunica "escolha um prédio" sem tutorial forçado |
| 3 | Ele encontra o caminho até a Aventura sozinho? | Cidade → Portão Norte → `/app/adventure` | Mede se o link "Ir para a Aventura →" (Front Door Experience Sprint) é descoberto sem dica externa |
| 4 | Ele entende a progressão (nível, XP, checkpoints) sem explicação? | Primeiros minutos de Aventura | Mede se o HUD comunica por si só o que está mudando |
| 5 | Ele compreende o objetivo atual a cada momento? | Toda vez que o objetivo muda | Mede se "OBJETIVO ATUAL" é lido e compreendido, não ignorado |
| 6 | Ele continua jogando espontaneamente, sem ser instruído a continuar? | Do início até o momento em que decide parar | A métrica mais importante de todas — mede motivação real, não educada |
| 7 | Ele entende por que um item não foi equipado quando isso acontece? | Qualquer rejeição de loot | Valida o feedback já implementado (Player Feedback & Retention Sprint) |
| 8 | Ele nota a diferença entre Elite, Mini-Boss e Chefe Final quando aparecem? | Qualquer encontro especial | Valida um achado do Player Retention Loop Sprint (ambiguidade Elite vs. Mini-Boss) |
| 9 | Ele percebe quando login é necessário e entende por quê? | Qualquer tentativa de acessar Personagem/Inventário/Mundo/Crônicas | Valida a seção "O que precisa de login?" da Landing e as mensagens de cada página |
| 10 | Ele reage à transição de dificuldade ao entrar em regiões mais difíceis (ex: Picos Congelados)? | Mudança de região de dificuldade "Alta"/"Muito Alta" | Coleta evidência direta sobre o achado do Endgame Funnel Fix — de jogadores reais, não só simulação |

**Perguntas vagas a evitar** (não fazem parte deste protocolo, porque não geram dado acionável): "Você gostou do jogo?", "O que você acharia legal ter?", "Me dá uma nota de 0 a 10". Essas só aparecem, de forma controlada, no [Questionário do Participante](03-participant-questionnaire.md) — nunca como pergunta de observação durante a sessão.

---

## Tester Profiles

| Perfil | Prioridade | Por quê |
| --- | --- | --- |
| **Jogadores de ARPG** (Diablo, Path of Exile, Torchlight, etc.) | **Alta** | Referência mais próxima do gênero — vão comparar o loop de loot/progressão com o padrão da categoria; feedback mais tecnicamente calibrado sobre balanceamento e ritmo de recompensa |
| **Criadores de conteúdo (streamers pequenos/médios)** | **Alta** | Público-alvo real do gancho Twitch-integrado; mesmo testando sem login nesta fase, sua reação a "isso funcionaria bem numa live?" é dado direto de mercado |
| **Jogadores casuais** (jogam ocasionalmente, qualquer gênero) | **Média** | Representam o piso de acessibilidade — se eles entendem a Cidade/Aventura sem ajuda, um público mais amplo também entenderá |
| **Pessoas que nunca jogaram RPG** | **Média** | O teste mais rigoroso de onboarding — qualquer suposição de vocabulário ("XP", "checkpoint", "facção") que pareça óbvia para quem já joga RPG aparece aqui como fricção real |
| **Amigos próximos / conhecidos da equipe** | **Baixa — usar com cautela** | Viés de cortesia (tendem a dizer que gostaram, hesitam em apontar problemas) e viés de contexto (podem já saber coisas sobre o projeto que um jogador externo não sabe). Útil só como piloto antes da rodada real (ver [Guia do Moderador](02-moderator-guide.md)), nunca contado como um dos 10 participantes "oficiais" |

**Composição recomendada dos 10 participantes**: 3-4 jogadores de ARPG, 2-3 criadores de conteúdo, 2 casuais, 1-2 sem experiência prévia em RPG. Nenhum amigo próximo entra nessa contagem — se um amigo testar, é tratado como piloto (ver capítulo seguinte), não como dado da rodada.

Ver também: [Guia do Moderador](02-moderator-guide.md), [Métricas](04-metrics.md).
