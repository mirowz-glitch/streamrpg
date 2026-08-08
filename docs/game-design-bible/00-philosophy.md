# 0. Filosofia — O que é StreamRPG

**Status:** ✅ Estável. Capítulo fundacional, lido antes de todos os outros — inclusive antes do capítulo 1. Nenhuma decisão de design ou arquitetura, em qualquer capítulo desta Bible, pode contradizer este capítulo sem revisá-lo aqui primeiro, explicitamente.

> Em qualquer matéria de mundo/lore/narrativa, a [Constituição do Mundo](../world-constitution/README.md) continua tendo prioridade absoluta. Este capítulo não a substitui — define a lente pela qual toda decisão de sistema, de arquitetura e de conteúdo passa antes de qualquer outra coisa.

## Por que este jogo existe

A maioria dos jogos idle trata o tempo do jogador como um recurso a ser extraído: você joga, o jogo mede o quanto você jogou, e devolve um número maior. Quando você para, o número fica parado, esperando você voltar para crescer de novo. Nada do que você fez continua acontecendo sem você, e nada do que você fez muda o mundo — só o seu personagem.

StreamRPG existe para ser o oposto disso. A aposta fundadora do projeto é: **o tempo e a ação de um jogador deveriam enriquecer permanentemente um mundo compartilhado que sobrevive a qualquer sessão individual** — não só o personagem dele. Você não joga para acumular um número maior. Você joga para que algo continue existindo depois que você fechar o jogo.

Essa aposta sobreviveu inteira à origem do projeto e a toda a sua reformulação. StreamRPG começou como uma ferramenta de engajamento para Twitch — um jeito melhor de recompensar quem assistia a uma live. Ao longo do tempo, ficou claro que a parte que realmente importava nunca foi a Twitch: era a ideia de que a presença de alguém deveria deixar um traço permanente em algo maior que ela mesma. A Twitch era só o primeiro lugar onde essa ideia foi testada. O jogo, hoje, existe para testar essa mesma ideia sem depender de nenhuma plataforma para funcionar.

## Os 10 Mandamentos do Projeto

Estes não são metas — são compromissos. Uma proposta de sistema que viola um destes precisa ser sinalizada e revista aqui antes de ser implementada, nunca corrigida silenciosamente depois.

1. **O mundo é permanente.** Um Reino, uma vez fundado, nunca é deletado. Uma casa, uma vez construída, nunca desaparece. O mundo pode envelhecer, empobrecer, ficar silencioso — nunca deixar de existir.

2. **O jogador pertence ao mundo — nunca a uma plataforma.** Identidade é do jogador. Nenhum provedor de login, nenhuma live, nenhum canal define quem um personagem é ou se ele pode existir.

3. **Nenhum sistema depende de plataforma externa para funcionar.** Twitch, Kick, YouTube, Discord enriquecem a experiência — nunca são pré-requisito para nenhuma mecânica central. Todo sistema precisa passar no teste: *funciona se essas quatro plataformas nunca tivessem existido?*

4. **Toda ação relevante deixa legado.** Construir, vencer, liderar, comerciar, fundar — cada uma dessas ações grava um fato permanente em algum lugar do mundo (uma Crônica, uma placa, um Hall da Fama). Nada de importante acontece e depois não deixa rastro.

5. **O Reino é maior que quem o lidera.** Liderança é transitória — streamer, eleição, guilda, conquista, mérito, ou a própria Coroa. O Reino nunca depende de uma única pessoa continuar presente para continuar existindo.

6. **Casas nunca desaparecem.** Podem trocar de dono, podem ser recuperadas por abandono, podem ser revendidas dezenas de vezes ao longo dos anos — mas o objeto físico e sua história permanecem, sempre.

7. **A economia é dirigida pelos jogadores, nunca por decreto.** Preço, vocação, prosperidade e escassez emergem do que os jogadores realmente fazem — nunca são fixados arbitrariamente por um número de design imutável.

8. **O Idle nunca substitui a interação — ele a protege.** A simulação continua sozinha para que o jogador nunca seja forçado a estar presente o tempo todo; ela nunca existe para tornar a presença do jogador desnecessária quando ele *quer* estar lá.

9. **A história é escrita pelos jogadores — o jogo só testemunha.** Nenhuma Crônica é fabricada por conteúdo estático fingindo ser evento real. Se algo está registrado como tendo acontecido, aconteceu de verdade, gerado por uma ação real de um jogador real.

10. **O mundo continua vivo mesmo sem ninguém online.** Um Reino sem nenhum cidadão conectado, uma economia sem nenhuma transação acontecendo agora — nada disso congela o mundo. Ele segue existindo, esperando, nunca pausado.

## O que nunca faremos

Esta lista existe para evitar dezenas de decisões ruins no futuro, tomadas uma de cada vez, cada uma parecendo razoável isoladamente. Nenhum item aqui é negociável por conveniência de implementação, prazo, ou pressão comercial.

- **Nunca vender poder.** Nenhuma compra com dinheiro real concede vantagem de combate, economia ou progressão que um jogador não possa alcançar jogando.
- **Nunca destruir uma casa histórica.** Uma propriedade pode mudar de dono; sua existência e sua história nunca são apagadas por decisão de sistema.
- **Nunca resetar o mundo.** Uma temporada pode reiniciar um quadro competitivo — o mundo, os Reinos, as casas, as Crônicas, jamais.
- **Nunca travar um jogador para sempre fora de conteúdo essencial por ele ter perdido uma janela de tempo.** Unicidade histórica genuína (o primeiro castelo, o primeiro dragão) é celebrada; exclusão permanente de progressão por FOMO nunca é.
- **Nunca obrigar Twitch, Kick, YouTube ou Discord.** Nenhuma dessas plataformas é, nunca foi, e nunca será um requisito para jogar, progredir, ou pertencer a um Reino.
- **Nunca fazer um evento que exclua quem não assistiu a uma live.** Todo conteúdo relevante precisa ser alcançável por quem só joga, sem nunca abrir uma stream.
- **Nunca permitir que um Reino desapareça.** Mesmo o Reino mais abandonado do mundo continua existindo, silencioso, sob a Coroa, esperando.
- **Nunca fazer cidadania depender de audiência.** Pertencer a um Reino é sempre resultado de jogar ali — nunca de ter assistido a alguém jogando.
- **Nunca gastar o tesouro de um Reino sem que seus cidadãos possam ver para onde foi.**

## Os Pilares

Dez sistemas que sustentam o jogo, cada um respondendo a uma pergunta diferente sobre por que alguém continua jogando:

| Pilar | Pergunta que responde |
|---|---|
| **Combat** | O que acontece quando o mundo resiste a você? |
| **Exploration** | O que existe além do que você já viu? |
| **Idle** | O que continua acontecendo quando você não está olhando? |
| **Crafting** | O que você pode transformar com o que encontrou? |
| **Trade** | O que vale mais em outro lugar do mundo? |
| **Economy** | Quem decide o que as coisas valem? |
| **Housing** | O que fica seu, para sempre, no mundo? |
| **Kingdom** | A que comunidade você pertence? |
| **Social** | Quem mais está construindo essa história com você? |
| **History** | O que vai restar de tudo isso, daqui a anos? |

## O Loop do Jogador

```
Entrar
  ↓
Coletar
  ↓
Craftar
  ↓
Negociar
  ↓
Melhorar casa
  ↓
Fortalecer Reino
  ↓
Explorar
  ↓
Descobrir
  ↓
Voltar amanhã
```

Nenhuma dessas etapas é obrigatória em toda sessão — um jogador pode passar meses só explorando, ou só cuidando da própria casa, sem nunca tocar Kingdom Treasury. O loop descreve o espaço de possibilidades de uma sessão significativa, não uma lista de tarefas fixas. O único elemento não-opcional é o último: o mundo precisa dar a esse jogador um motivo real de voltar amanhã, mesmo que ele não tenha feito nada "importante" hoje.

## A Promessa

> **Tudo o que você construir permanecerá no mundo — mesmo depois que você parar de jogar.**

Você não está apenas evoluindo um personagem. Você está deixando, no mundo, algo que continua existindo com o seu nome: uma casa que outro jogador vai um dia comprar e ainda saber quem a construiu; um cargo que você ocupou e que a Crônica do seu Reino nunca vai esquecer; uma rota comercial que você abriu entre dois Reinos que nunca tinham comércio antes. Você não joga só para ficar mais forte. Você joga para deixar um legado que o mundo carrega sozinho, para sempre, sem precisar de você para continuar sendo verdade.

## Por que isso importa

Daqui a dois anos, quando este projeto tiver centenas de documentos, centenas de Sprints, milhares de arquivos e dezenas de sistemas, a pergunta relevante nunca vai ser "isso é fácil de implementar?". Vai ser: **isso obedece à filosofia?**

Se uma ideia violar um dos Mandamentos ou cruzar a lista do que nunca faremos, ela não entra — mesmo que seja tecnicamente trivial, mesmo que pareça lucrativa, mesmo que um streamer importante peça. Este capítulo é o que se consulta quando a dúvida aparecer, e a resposta dele vence, sempre, sobre qualquer conveniência de curto prazo.

## Dependências

Nenhuma — capítulo fundacional, lido antes de qualquer outro, inclusive antes do capítulo 1. Todos os demais capítulos desta Bible (e todo o conjunto de `docs/design/world-foundation-4.0.md` e seus 13 documentos irmãos, que detalham a arquitetura conceitual que nasce desta filosofia) dependem deste capítulo, nunca o contrário.
