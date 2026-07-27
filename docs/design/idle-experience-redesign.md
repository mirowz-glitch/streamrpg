# Idle Experience Redesign — a Bíblia de UX e Product Design do StreamRPG

**Status:** 🚧 Fundacional, Phase I completa — especificação de produto pronta para implementação, ainda sem nenhuma linha de código.
**Origem:** primeira live pública (RC1, 2026-07-26), observação direta de quem acompanhou a sessão, consolidada em duas Sprints de design (diagnóstico → esta especificação).
**Natureza deste documento:** referência oficial de UX e Product Design do StreamRPG, não uma lista de tarefas. Toda futura Sprint de interface deve ser avaliada contra os princípios e comportamentos daqui antes de ser avaliada contra qualquer critério técnico. Nenhuma decisão de comportamento aqui deveria precisar ser rediscutida numa Sprint de implementação — só traduzida em código.
**O que este documento não é:** uma spec de interface pixel-a-pixel, uma auditoria de arquitetura, ou uma decisão de Economia (a decisão de arquitetura de Ouro permanece adiada, ver Seção 7). Descreve comportamento e responsabilidade — nunca layout, cor ou componente React específico.

---

## 0. Por que este documento existe

O RC1 provou que o projeto resolveu seus problemas técnicos: engine estável, 449 testes, combate calibrado, progressão funcionando, sessão persistente. A live provou outra coisa: um jogo pode estar tecnicamente correto e ainda assim não parecer o jogo que queríamos construir.

Os cinco padrões observados na live — personagem parado, loop manual, inventário-lista, cidade-menu, sensação de "clique para continuar" — não são bugs. São o mesmo problema de design visto por cinco ângulos: **o jogo pede trabalho do jogador exatamente nos pontos onde deveria oferecer uma janela para um mundo que já se move sozinho.**

A Sprint anterior diagnosticou isso. Esta Sprint especifica a cura, em detalhe suficiente para que nenhuma Sprint de implementação futura precise reabrir a discussão conceitual — só decidir COMO construir o que já está decidido O QUE construir.

---

## 1. A Fantasia Central

*Resposta narrativa, não técnica — à pergunta "qual deve ser a sensação do jogador nos primeiros cinco minutos?"*

O jogador abre o StreamRPG pela primeira vez. Não existe uma tela de boas-vindas pedindo pra ele "começar sua jornada" — porque a jornada já começou sem ele. Ele encontra um aventureiro no meio de uma floresta, e esse aventureiro está fazendo algo: andando entre árvores, ou trocando golpes com um lobo, ou catando algo do chão. Não importa exatamente o quê — importa que aconteça sem que o jogador tenha apertado nada ainda.

A primeira sensação não é "o que eu faço agora" — é "ah, entendi, esse é o meu personagem, e ele já estava fazendo a vida dele". É a mesma sensação de ligar a TV no meio de um programa que já começou: você não perdeu nada de essencial, e em segundos você já está acompanhando.

Nos primeiros cinco minutos, o jogador não deveria precisar ler nenhum tutorial pra entender que:

- existe UM personagem, que é dele;
- esse personagem está OCUPADO fazendo algo, o tempo todo;
- de vez em quando, algo acontece que vale a pena decidir (um item aparece, um inimigo mais forte surge);
- fora isso, ele pode só olhar — e o jogo não vai parar de esperar por ele.

O oposto exato da sensação atual, onde a primeira coisa que o jogador vê depois da tela de boas-vindas é um botão parado esperando ser clicado. Um Idle RPG nunca espera. Ele convida a olhar.

---

## 2. Princípios de Design

Consolidação de todos os princípios identificados nesta e na Sprint anterior — a autoridade única que toda tela nova ou redesenhada deve respeitar, no mesmo espírito do Game Design Bible (`docs/game-design-bible/02-principles.md`) para arquitetura.

1. **O jogador toma decisões, não executa tarefas repetitivas.**
   Clicar dezenas de vezes no mesmo botão não é uma decisão — é trabalho manual disfarçado de gameplay. Uma decisão real tem peso: equipar ou não, arriscar ou não, continuar ou recuar.

2. **O mundo continua vivo sem exigir interação constante.**
   Largar o mouse por 30 segundos não deveria congelar o aventureiro. Este é o princípio historicamente mais violado do projeto — e a origem direta da sensação de "clique para continuar".

3. **Toda tela deve comunicar o estado atual do aventureiro em menos de 3 segundos.**
   Olhando pra qualquer tela, sem ler parágrafo nenhum, o jogador sabe onde o personagem está e o que está fazendo.

4. **A interface deve reforçar a fantasia, nunca escondê-la atrás de dados.**
   Um número (Power Score, DPS, delta) é informação real — mas quando vira o elemento mais visível da tela, a fantasia (o item, a mochila, a cidade) vira pano de fundo de planilha.

5. **A Cidade é o intervalo entre aventuras, não um menu de navegação.**
   "Minha mochila está cheia, vou até o Ferreiro" — nunca "vou clicar em Cidade pra ver minhas opções".

6. **Interação automática é o padrão; interação manual é a exceção que precisa se justificar.** *(novo, formalizado nesta Sprint a partir da Fase 11)*
   Toda ação do jogo começa classificada como automática. Uma ação só migra pra "decisão do jogador" se puder responder com clareza por que ela merece atenção humana — nunca por hábito herdado de uma versão anterior do jogo.

7. **Nenhuma tela deve me pedir a mesma decisão duas vezes seguidas sem eu ter mudado de contexto.** *(novo, formalizado nesta Sprint a partir da Fase 8/9)*
   Se o jogador já decidiu não vender um tipo de item, o jogo não deveria perguntar de novo a cada instância idêntica — a repetição de uma decisão já tomada é, na prática, um clique repetitivo disfarçado de decisão.

---

## 3. Core Loop — Atual vs. Idle

### Loop atual

```
Abrir Aventura
     ↓
Clicar em "Avançar"
     ↓
Ver o resultado de UM encontro
     ↓
Clicar em "Avançar" de novo
     ↓
(repetir dezenas de vezes por sessão)
     ↓
Eventualmente: loot, level up, chefe, morte
```

Cada clique resolve exatamente um encontro. Numa masmorra de 20-40 encontros, isso são 20-40 cliques idênticos pra atravessar UMA masmorra — a sensação de "RPG por turnos" nomeada na live, mesmo o motor por trás já sendo capaz de simular uma campanha inteira sozinho (é isso que os scripts de auditoria/simulação deste projeto fazem há dezenas de Sprints, sem nenhum clique humano).

### Loop Idle

```
Entrar no jogo
     ↓
Ver personagem explorando (já em andamento)
     ↓
Acompanhar progresso (barra, timeline, HP — sem clicar)
     ↓
Receber loot automaticamente
     ↓
[quando a mochila pede atenção] Organizar mochila
     ↓
[quando compensa] Ir para a Cidade
     ↓
Retornar automaticamente à exploração
     ↓
[quando surge uma decisão real] O jogador decide
     ↓
Exploração continua sozinha
```

### A diferença central

O motor já simula uma campanha inteira sem input humano. A interface é a única camada do sistema que ainda trata cada tick como algo que precisa de permissão explícita. Fechar essa diferença é, sozinha, a mudança que mais aproxima o jogo da visão original — mais que qualquer região, sistema ou conteúdo novo.

---

## 4. O Idle Loop — Especificação Completa

Esta seção descreve o comportamento do sistema de exploração automática. Nenhum layout, nenhum componente — só as regras que qualquer implementação futura precisa seguir.

### Como começa

A exploração começa no instante em que o jogador entra na Aventura — nunca depois de um clique de "começar". Se a sessão já existia (jogador voltando), ela retoma exatamente de onde parou (mesma garantia já entregue pela Adventure Session Persistence). Se é uma sessão nova, o personagem começa a se mover imediatamente na primeira região.

### Como continua

Enquanto não houver nenhuma decisão pendente, o tempo avança sozinho: encontros se resolvem, dano é trocado, loot é encontrado e automaticamente comparado contra o equipado, checkpoints são atingidos. O jogador não aciona nada disso — ele testemunha.

A velocidade desse avanço é uma escolha de produto, não uma obrigação técnica: pode ser em tempo real (cada encontro leva segundos reais) ou acelerado (útil pra quem quer avançar mais rápido sem esperar) — ambos são válidos, e a escolha entre eles é ela mesma uma decisão do jogador (ver Seção 12), nunca do sistema.

### Como pausa

A exploração pausa em exatamente três situações, e só nelas:

1. **Uma decisão real está disponível** (item comparável ao equipado sem ser um upgrade óbvio; ver Seção 12 para o que conta como "real").
2. **O jogador pediu pra pausar** — uma pausa manual sempre precisa ser possível e óbvia, porque "acompanhar" não significa "não poder nunca intervir a qualquer momento por vontade própria".
3. **Um evento de risco genuíno está prestes a acontecer** (chefe final de masmorra, mini-boss numa região de dificuldade acima do recomendado) — o sistema avisa ANTES do encontro acontecer, não depois, dando ao jogador a chance de decidir se quer acompanhar de perto esse momento específico.

Fora dessas três situações, a exploração NUNCA pausa esperando um clique genérico — essa é a regra que elimina a sensação de "clique para continuar" por definição.

### Como o jogador interfere

A interferência do jogador é sempre uma decisão pontual sobre algo específico (equipar este item, entrar nesta masmorra, recuar deste chefe) — nunca um "próximo" genérico. Depois de decidir, a exploração retoma sozinha sem exigir mais nenhuma ação.

### Quando o jogador apenas observa

Na maior parte do tempo. Esse é o estado padrão do Idle Loop — observar é o comportamento esperado, não um efeito colateral. A interface deve deixar isso óbvio: nada na tela deveria parecer "incompleto" ou "esperando" enquanto o jogador só observa.

### Cenários a cobrir (checklist de comportamento, não de implementação)

- Jogador chega numa masmorra e não decide nada: a exploração atravessa a masmorra inteira sozinha, incluindo o chefe final, a menos que o chefe se enquadre no aviso-de-risco (item 3 acima).
- Jogador fecha a aba no meio de um combate e volta depois: retoma de onde parou (garantia já existente, preservada).
- Jogador ativa uma pausa manual e esquece a aba aberta por horas: ao voltar, a exploração está exatamente onde ele pausou — pausa manual nunca "descongela" sozinha.
- Um upgrade claramente melhor aparece (todo atributo superior, nenhuma perda): equipa automaticamente, sem pausar — não é uma decisão real, é a mesma lógica de AutoEquip que já existe hoje, só reafirmada como comportamento padrão do Idle Loop.
- Um item ambíguo aparece (troca ofensivo por defensivo, ou duas raridades próximas): pausa e apresenta a decisão.

---

## 5. Personagem Vivo — Comportamento, não Interface

*Descrição de comportamento, conforme pedido — nenhum desenho de tela.*

A tela de Personagem deve, em qualquer momento em que for aberta, ser capaz de responder — sem que o jogador precise navegar pra Aventura — a estas perguntas:

- **Onde** o aventureiro está agora (região atual).
- **O que** ele está fazendo neste segundo (explorando / em combate / se recuperando / parado numa decisão pendente).
- **O que** ele acabou de fazer (a última ação relevante: um encontro concluído, um item encontrado, um dano recebido).
- **O que** vem a seguir (o próximo marco — checkpoint, chefe, ou "nada especial ainda, só seguindo em frente").
- **Como está indo** (uma medida simples de progresso — não precisa ser a barra de XP completa, só o suficiente pra responder "estou indo bem?").

Esse mini-painel de aventura não é uma cópia da HUD completa da Aventura — é um resumo. A regra de comportamento é: **qualquer mudança de estado real na Aventura (novo item, nova região, chefe derrotado, morte) deve refletir neste painel dentro de segundos**, porque é a mesma sessão, só vista de um lugar diferente — nenhum atraso artificial, nenhuma necessidade de "atualizar" manualmente.

Quando o personagem está parado numa decisão pendente (Seção 4), o painel do Personagem também deve deixar isso claro — se o jogador abriu essa tela justamente porque recebeu um sinal de que precisa decidir algo, ele não deveria precisar voltar pra Aventura só pra descobrir o quê.

Quando não existe nenhuma sessão de aventura ativa (personagem morto e ainda não reiniciado, por exemplo), o painel comunica esse estado tão claramente quanto comunicaria "explorando" — nunca fica em branco ou desatualizado silenciosamente.

---

## 6. Inventário → Mochila

### O conceito

O Inventário deixa de ser uma lista ordenada por raridade e passa a se comportar como uma mochila: algo com espaço finito, organizado por categoria, onde o que acabou de entrar tem um lugar visualmente diferente do que já estava lá.

### Capacidade

A mochila tem um limite de espaço (hoje já existe um limite técnico de 24 unidades — o comportamento de produto é decidir o que acontece quando esse limite é alcançado: o jogo deve avisar de forma clara e antecipada, nunca simplesmente recusar o próximo item sem explicação). Um espaço perto do limite é, por si só, um dos gatilhos naturais pra "ir à Cidade" (ver Seção 7).

### Categorias

Armas, Armaduras, Acessórios (anéis/amuleto/cinto) — os mesmos agrupamentos que já existem na Aventura e na Cidade (Ferreiro), só reorganizando a apresentação. Categoria não é uma aba escondida — é a primeira coisa que organiza visualmente a mochila.

### Itens equipados

Sempre visíveis primeiro dentro de cada categoria, claramente distintos do resto — são o que o aventureiro está literalmente vestindo agora, não só mais um item na pilha.

### Itens recém-encontrados

Um item encontrado nos últimos momentos de exploração tem destaque temporário (não permanente — o destaque existe pra chamar atenção pro que é novo, e desaparece naturalmente conforme o jogador já viu). Isso substitui a necessidade de escanear a lista inteira procurando "o que mudou desde a última vez que olhei".

### Favoritos

O jogador pode marcar um item como favorito — um sinal manual de "não sucatear isso, mesmo que pareça inferior por número" (um anel de baixo Power Score mas de uma masmorra específica, por exemplo). Favoritar é uma decisão explícita e rara, nunca o padrão.

### Sucata

Itens claramente inferiores a tudo que já está equipado, e não marcados como favoritos, são candidatos naturais a sucata — a mochila deve tornar essa categoria óbvia e agrupada, não escondida entre os itens bons.

### Comparação

A comparação numérica contra o equipado continua existindo (é informação real e útil) — mas como um detalhe que aparece ao focar um item específico, não como o primeiro elemento visual de cada linha da lista inteira.

### Limite de espaço

Ver "Capacidade" acima — o limite não é um detalhe técnico, é um gatilho de gameplay: mochila cheia é o motivo mais natural e menos artificial pra visitar a Cidade.

### Como essa mochila conversa com a Cidade

A mochila é o ponto de partida do ciclo Cidade (Seção 7): o que está marcado como sucata é o que o Mercador compra; o que está equipado ou perto de um upgrade é o que o Ferreiro trabalha. A mochila não decide o que a Cidade faz com os itens — só apresenta claramente o que existe, pra que a visita à Cidade já comece sabendo o que resolver.

---

## 7. Cidade — Por que o Jogador Volta

### O problema real, não o aparente

A Cidade não tem um problema de atmosfera — tem, de longe, o maior investimento de ambientação já feito no projeto (mais de dez sistemas de texto/estado ambiente diferentes, cada um com seu próprio módulo: presença do mundo, narrativa ambiental, micro-eventos, vida da cidade, corvos, NPCs com diálogo próprio, objetos escondidos). O problema é que dois dos prédios centrais (Mercador, Ferreiro) são hoje vitrines fechadas — "Loja fechada", "Forja disponível em breve" — enquanto tudo ao redor deles já é genuinamente vivo.

### Por que o jogador deveria voltar

Não porque um botão de menu existe. Porque a Aventura gerou um problema que só a Cidade resolve: a mochila está cheia, ou o equipamento parou de evoluir sozinho, ou o jogador quer preparar algo específico antes de arriscar uma masmorra mais difícil. A Cidade é a resposta a uma necessidade que nasceu em outro lugar — nunca o destino de uma navegação sem motivo.

### Responsabilidades de cada prédio (papel conceitual, não escopo de implementação)

- **Ferreiro**: responde "o que eu faço com tudo que a mochila já não usa". É o prédio que transforma excedente de equipamento em progresso — a forma exata (upgrade, fusão, outra mecânica) é uma decisão de Economia ainda em aberto, mas o PAPEL já está definido.
- **Mercador**: responde "o que eu faço com o que sobrou". Converte itens não-equipáveis/sucata em algum recurso de troca.
- **Alquimista**: hoje sem papel definido — permanece fora do escopo desta especificação até que exista uma necessidade de gameplay concreta que o justifique (ver princípio de "não inventar sistema sem evidência").
- **Banco**: guarda valor com segurança. Só ganha peso de gameplay quando existir algo que ameace ou consuma esse valor — hoje é um registro passivo, e está certo que continue assim até a decisão de Economia avançar.
- **Armazém** *(conceito novo, citado no brief, ainda sem componente próprio no código hoje)*: um espaço de guarda além da mochila ativa — resolve o caso em que o jogador quer manter um item sem carregá-lo pra próxima expedição. Só faz sentido como conceito depois que a mochila (Seção 6) já tiver um limite de espaço claramente sentido pelo jogador — do contrário não existe problema real pra esse prédio resolver.

### O gatilho, resumido

```
Mochila perto do limite (Seção 6)
     ↓
Jogador sente a necessidade, não lê um aviso genérico
     ↓
Visita a Cidade
     ↓
Ferreiro/Mercador resolvem o excedente
     ↓
Jogador retorna à Aventura já preparado
```

---

## 8. Navegação — Nova Ordem e Justificativa

### Ordem atual (`AppNav.tsx`)

Personagem, Inventário, Crônicas, Cidade, Ranking, Mundo, Streamer, Aventura.

A Aventura — a única tela onde o aventureiro "existe" hoje — está por último, e é a única com destaque visual permanente (`nav-glow` fixo, nunca condicionado a uma flag como as demais). Essa é, ela mesma, uma pequena mas real inconsistência: a tela mais importante do jogo tem a posição menos importante da lista.

### Ordem proposta, e por que cada tela existe

1. **Aventura** — primeiro lugar. É onde o aventureiro vive; se o Idle Loop (Seção 4) for implementado, é também a tela que o jogador mais frequentemente só espia e sai, não a que ele "trabalha" — sua posição de destaque reflete importância, não tempo de permanência.
2. **Personagem** — segundo lugar, logo depois, porque com o painel vivo da Seção 5 ele passa a ser uma extensão natural de "estou acompanhando meu aventureiro", só que com mais detalhe sobre quem ele é (equipamento, identidade, títulos).
3. **Inventário/Mochila** — terceiro, porque é o destino natural depois de "vi que peguei um item novo" no painel do Personagem ou na própria Aventura.
4. **Cidade** — quarto, porque é o destino de uma necessidade (mochila cheia) que só existe depois de já ter passado pelas três telas acima.
5. **Crônicas** — quinto: é reflexão sobre o que já aconteceu, não uma ferramenta de decisão do momento — pertence depois do ciclo de ação, não no meio dele.
6. **Ranking / Mundo / Streamer** — mantidos no final, nessa ordem: são contexto sobre o Reino e a comunidade, não sobre o aventureiro individual — o jogador visita por curiosidade, não por necessidade de jogo.

Cada tela deveria responder, em uma frase, "por que o jogador abriria esta página":

| Tela | Por que o jogador abre |
| --- | --- |
| Aventura | Ver o aventureiro vivendo, e decidir quando algo importa |
| Personagem | Saber quem é meu aventureiro e o que ele está vivendo agora |
| Inventário | Organizar o que a aventura trouxe |
| Cidade | Resolver uma necessidade que a aventura gerou |
| Crônicas | Reviver o que já aconteceu |
| Ranking | Comparar meu progresso com o de outros |
| Mundo | Entender o Reino além do meu próprio personagem |
| Streamer | Ver o Reino do ponto de vista de um canal específico |

---

## 9. Feedback Visual — Todos os Momentos Importantes

```
Loot → Level Up → Boss → Checkpoint → Dungeon → Morte → Novo Equipamento → Inventário Cheio → Cidade Disponível
```

Para cada momento, como o jogador deveria percebê-lo — e o que já existe hoje (`AdventurePage`/`useAnimationController` já orquestram banners próprios pra grande parte destes) versus o que ainda não tem representação nenhuma:

| Momento | Como deve ser percebido | Hoje |
| --- | --- | --- |
| Loot | Um destaque temporário claro, associado ao item, nunca só um número subindo | Já existe (`LootPopup`) |
| Level Up | Uma celebração breve, sentida como marco pessoal do aventureiro | Já existe (`LevelUpBanner`) |
| Boss | Aviso ANTES do encontro (ver Seção 4), depois confirmação clara de vitória/derrota | Já existe (`FinalBossBanner`) |
| Checkpoint | Sinal discreto de progresso — não deveria competir visualmente com loot/boss | Já existe (`ExpeditionCheckpointBanner`) |
| Dungeon (conclusão) | Um fechamento de capítulo, distinto de um checkpoint comum | Já existe (`DungeonCompletedBanner`) |
| Morte | Deveria doer um pouco, sem travar o jogo — resumo claro do que foi vivido | Já existe (`SessionSummaryPanel`) |
| Novo Equipamento | Diferente de "Loot" — é a confirmação de que algo mudou no personagem, não só que algo foi encontrado | Já existe (`EquipmentPopup`) |
| **Inventário Cheio** | Deveria ser percebido como um convite ("hora de visitar a Cidade"), nunca como um erro | **Não existe ainda** — lacuna real, criada pela ausência de um limite de mochila sentido (Seção 6) |
| **Cidade Disponível** | Um sinal leve de que existe algo esperando na Cidade (item pronto pro Ferreiro, excedente pro Mercador) | **Não existe ainda** — só existe hoje como brilho de "não visitado ainda" (`nav-glow`), que não é a mesma coisa que "há algo relevante lá agora" |

As duas lacunas identificadas (Inventário Cheio, Cidade Disponível) são consequência direta de a mochila ainda não ter um limite sentido nem a Cidade ter função real — resolver as Seções 6 e 7 já cria a base pra esses dois feedbacks existirem.

---

## 10. Hierarquia da Informação

### Sempre visível (qualquer tela)

- Nível e XP do personagem.
- Um indicador mínimo de "o que o aventureiro está fazendo agora" (mesmo que resumido a um ícone/frase curta) — esta é a peça que hoje só existe na Aventura e deveria atravessar todo o app, conforme a Visão (Seção 1).

### Visível na maioria das telas, mas não em todas

- Ouro.
- Estado da mochila (perto do limite ou não) — relevante em qualquer tela que possa levar a uma decisão de ir à Cidade, mas não precisa estar em Ranking/Mundo/Streamer.

### Pertence só à tela Aventura

- Timeline detalhada de eventos recentes (linha do tempo completa).
- HUD de combate em tempo real (barra de vida do inimigo, dano por encontro).
- Detalhes de expedição/masmorra em profundidade (checkpoints exatos, modificadores ativos).

### Pertence só à tela Personagem

- Identidade (títulos, molduras, reputação de facção em detalhe).
- Equipamento completo, slot a slot.

### Pertence só à tela Inventário

- A lista/mochila completa de itens não equipados.

### Regra geral

Uma informação pertence "a todas as telas" só se for necessária pra responder rapidamente "o que meu aventureiro está fazendo" (Princípio 3). Tudo que é detalhe de UM sistema específico (combate, identidade, itens) fica na tela desse sistema — trazer detalhe demais pra todo lugar recria o problema oposto (telas poluídas), que também violaria o Princípio 4.

---

## 11. Fluxo Completo do Jogador

```
Entrar no jogo
     ↓
Ver personagem explorando (já em andamento, sem clique inicial)
     ↓
Abrir mochila (curiosidade pelo que já foi encontrado)
     ↓
Organizar equipamentos (decisão pontual, não obrigatória)
     ↓
Voltar
     ↓
Personagem continua andando (nunca pausou por causa da mochila)
     ↓
Encontra uma Masmorra
     ↓
Decide entrar (decisão real — ver Seção 12)
     ↓
Conclui a Masmorra (majoritariamente automático, com um aviso antes do chefe)
     ↓
Vai à Cidade (porque a mochila pede, não porque um menu convidou)
     ↓
Visita o Ferreiro (resolve o excedente que a Masmorra trouxe)
     ↓
Explora novamente (retomada automática, sem precisar reabrir manualmente)
```

Este é o mesmo fluxo pedido no brief — confirmado e ancorado em cada seção anterior: cada seta acima corresponde a um comportamento já especificado nas Seções 4-7, não a uma ideia solta.

---

## 12. Sistema de Interação — Automático vs. Decisão do Jogador

### Automáticas (o personagem faz sozinho)

- Andar, explorar, mover-se entre encontros.
- Lutar contra inimigos comuns.
- Coletar loot comum e equipar automaticamente upgrades óbvios (mesma lógica do AutoEquip já existente).
- Avançar entre encontros e atingir checkpoints.
- Atravessar uma masmorra inteira, incluindo o chefe final, **a menos que** o chefe se enquadre no aviso-de-risco (Seção 4).
- Recuperação de vida entre combates.
- Reputação de facção acumulando com o resultado natural dos combates.

### Decisões do jogador (o que realmente merece um clique)

- Trocar equipamento quando a comparação não é óbvia (item ambíguo, troca de perfil ofensivo/defensivo).
- Vender ou sucatear (decisão de mochila, Seção 6).
- Entrar numa Dungeon — mantido como decisão do jogador, porque é o ponto de maior risco/recompensa do jogo e o próprio brief reconhece essa escolha como aceitável de preservar.
- Aceitar ou recusar um evento especial de mundo.
- Usar um consumível importante (não trivial/automático).
- Interagir com um comerciante (a transação em si, não a chegada até a loja).
- Pausar/retomar manualmente a exploração, e escolher a velocidade de avanço (Seção 4).
- Favoritar um item (Seção 6).

### O critério de classificação

Uma ação só pertence à coluna "Decisão do jogador" se puder responder com clareza a pergunta "por que isso merece a atenção de uma pessoa, e não só a lógica do motor" (Princípio 6). Se a resposta for "porque sempre foi assim" ou "porque é assim que o protótipo foi construído", a ação pertence à coluna automática — mesmo que hoje ainda exija um clique.

---

## 13. Roadmap de Implementação

Sprints pequenas e independentes sempre que possível — cada uma entrega valor perceptível ao jogador sem quebrar o que o RC1 já validou.

### Sprint 1 — Idle Loop
- **Objetivo**: substituir o avanço manual por exploração automática com os três gatilhos de pausa da Seção 4.
- **Dependências**: nenhuma — parte diretamente do `useAdventureSession`/`AdventurePage` já existentes e validados no RC1.
- **Risco**: alto — é a mudança mais estrutural de toda a especificação, toca o coração do loop de jogo.
- **Impacto esperado**: o maior de toda a lista — resolve diretamente a sensação de "clique para continuar" nomeada na live.
- **Estimativa qualitativa**: Grande.

### Sprint 2 — Living Character
- **Objetivo**: painel vivo na tela de Personagem (Seção 5).
- **Dependências**: nenhuma tecnicamente (a sessão de Aventura já é consultável de qualquer lugar do app desde a Adventure Session Persistence) — mas o resultado percebido é mais forte depois da Sprint 1, porque "explorando automaticamente" comunica vida melhor do que "esperando o próximo clique".
- **Risco**: baixo — é uma nova superfície de leitura sobre um estado que já existe, não uma mudança de regra de jogo.
- **Impacto esperado**: alto — resolve diretamente a Observação 1 (personagem parece parado).
- **Estimativa qualitativa**: Médio.

### Sprint 3 — Backpack (Mochila)
- **Objetivo**: reorganizar o Inventário por categoria, com destaque de item recém-encontrado, favoritos e sucata (Seção 6).
- **Dependências**: nenhuma — pode ser feita a qualquer momento, isolada de tudo o mais.
- **Risco**: baixo — é a mudança de menor risco de toda a especificação.
- **Impacto esperado**: médio — resolve a Observação 3 (inventário parece lista).
- **Estimativa qualitativa**: Pequeno-Médio.

### Sprint 4 — Functional City
- **Objetivo**: dar função real ao Ferreiro e ao Mercador (Seção 7).
- **Dependências**: **bloqueada** pela decisão de arquitetura de Ouro já identificada e adiada no roadmap comercial (`commercial/roadmap/project-valuation-roadmap.md`) — não deve começar antes dessa decisão estar resolvida, sob risco de repetir o padrão já visto neste projeto de construir sobre uma base que precisa ser desfeita depois.
- **Risco**: alto se a decisão de arquitetura for pulada; médio se resolvida antes.
- **Impacto esperado**: alto — resolve a Observação 4 (falta motivo pra voltar à Cidade).
- **Estimativa qualitativa**: Grande.

### Sprint 5 — Visual Feedback
- **Objetivo**: os dois feedbacks visuais hoje ausentes (Inventário Cheio, Cidade Disponível — Seção 9) + polimento de hierarquia visual (números crus vs. fantasia, Princípio 4) nas telas já redesenhadas pelas Sprints 2-4.
- **Dependências**: depende das Sprints 3 (mochila com limite sentido) e 4 (Cidade com função real) para os dois feedbacks novos fazerem sentido; o polimento de hierarquia visual deve vir por último em qualquer tela, pra não polir uma estrutura que ainda vai mudar.
- **Risco**: baixo — é a Sprint mais "de acabamento" de toda a lista.
- **Impacto esperado**: médio, mas fecha o ciclo — sem ela, as Sprints 1-4 ficam funcionalmente prontas mas ainda pouco comunicadas.
- **Estimativa qualitativa**: Pequeno-Médio.

---

## 14. Síntese Final

### 1. As 5 mudanças de maior impacto

1. **Idle Loop** (Sprint 1) — eliminar o clique manual repetitivo é, isoladamente, a mudança que mais aproxima o jogo da visão original.
2. **Personagem Vivo** (Sprint 2) — o aventureiro passa a existir em qualquer tela, não só na Aventura.
3. **Cidade Funcional** (Sprint 4) — Ferreiro e Mercador deixam de ser vitrines fechadas e passam a fechar o ciclo que a Aventura abre.
4. **Mochila** (Sprint 3) — o Inventário passa a comunicar fantasia, não só dados.
5. **Feedback Visual completo** (Sprint 5) — as lacunas de "Inventário Cheio" e "Cidade Disponível" fecham o ciclo de percepção do jogador.

### 2. Ordem recomendada e por quê

**Sprint 1 → Sprint 2 → Sprint 3 → [decisão de arquitetura de Ouro] → Sprint 4 → Sprint 5.**

A Sprint 1 vem primeiro porque toda mudança percebida nas demais telas fica mais forte depois que o jogador para de estar ocupado clicando — um personagem "vivo" na tela de Personagem comunica muito mais quando a Aventura já não depende de clique manual. A Sprint 2 vem em seguida porque é barata e de baixo risco, e reforça imediatamente o ganho da Sprint 1. A Sprint 3 pode, na prática, rodar em paralelo a qualquer uma das anteriores — é isolada e de baixo risco — mas fica nomeada nesta posição porque prepara o terreno de dados (mochila com limite sentido) que a Sprint 5 vai precisar depois. A Sprint 4 fica deliberadamente depois do gate de decisão de Economia, nunca antes — é o único ponto da sequência inteira que depende de uma decisão externa a este documento. A Sprint 5 fecha por último porque depende do resultado estrutural de 3 e 4 para os dois feedbacks novos existirem de verdade.

### 3. Riscos por mudança

| Mudança | Depende de | Pode ser feita isoladamente? |
| --- | --- | --- |
| Idle Loop | Nada | Sim — mas é a mais arriscada estruturalmente |
| Personagem Vivo | Idle Loop (parcialmente, pra máximo efeito) | Sim, tecnicamente — mais fraca antes do Idle Loop |
| Mochila | Nada | Sim, totalmente independente |
| Cidade Funcional | Decisão de arquitetura de Ouro (bloqueante) | Não — bloqueada até essa decisão |
| Feedback Visual | Mochila + Cidade Funcional | Não — os dois feedbacks novos não fazem sentido sem elas |

---

*Este documento substitui qualquer entendimento anterior de UX e Product Design do projeto como referência de decisão. Atualizações futuras devem vir de nova observação real de jogador — nunca de suposição interna. Nenhuma Sprint de implementação deveria precisar reabrir uma decisão conceitual já tomada aqui — só traduzi-la em código.*
