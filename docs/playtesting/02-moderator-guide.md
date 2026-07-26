# 2. Guia do Moderador

Documento completo para conduzir uma sessão de playtest do zero ao fim. Segue o mesmo roteiro para todos os participantes — comparabilidade entre sessões é mais importante do que otimizar cada sessão individualmente.

---

## Antes de tudo: piloto interno

Antes da primeira sessão com um participante externo real, rode este roteiro uma vez com alguém próximo (ver "Amigos próximos" em [Tester Profiles](01-goals-and-profiles.md)) só para cronometrar tempos e detectar falhas no próprio roteiro (link quebrado, ambiente de dev fora do ar, etc.). Esse piloto não conta como um dos 10 participantes.

---

## Preparação (antes da sessão)

- [ ] Confirmar que o ambiente está no ar e acessível (URL pública ou local, conforme o formato da sessão).
- [ ] Limpar `localStorage`/cookies do navegador que será usado (ou pedir para o participante usar uma aba anônima) — cada sessão deve começar como uma sessão genuinamente nova, igual a de um visitante real.
- [ ] Ter a [Ficha de Observação](#ficha-de-observação-durante-a-sessão) e o cronômetro prontos antes de convidar o participante para começar.
- [ ] Confirmar o perfil do participante (ver [Tester Profiles](01-goals-and-profiles.md)) e registrá-lo no topo da ficha.
- [ ] Decidir o formato: presencial (observando a tela por cima do ombro), remoto com compartilhamento de tela, ou gravação assíncrona (participante grava sozinho e envia). Formatos diferentes têm vieses diferentes — registrar qual foi usado.

## Instruções iniciais (ler para o participante, sempre com as mesmas palavras)

> "Obrigado por participar. Isso é um playtest de um jogo em desenvolvimento — eu vou observar você jogando por cerca de 30 minutos, e ao final você responde um questionário rápido. Não existe forma errada de jogar. Se você ficar preso, confuso, ou não souber o que fazer, isso é exatamente o tipo de informação que eu quero capturar — por favor, não peça ajuda a menos que fique impossível continuar, e se pedir, eu vou anotar esse momento antes de responder. Pense em voz alta sempre que puder: o que você está tentando fazer, o que está achando, o que não entendeu. Pode começar quando quiser, a partir desta página."

Regras fixas para o moderador durante a leitura:
- Nunca explicar antecipadamente o que é a Cidade, o Portão Norte, ou como jogar — isso é exatamente o que o playtest mede.
- Nunca mostrar a Landing Page já rolada ou focada em algum elemento — o participante começa do topo, como um visitante real.

## Duração prevista

- **Sessão de jogo**: ~30 minutos (o mesmo recorte validado no Player Retention Loop Sprint). Não interromper por tempo se o participante estiver genuinamente engajado perto dos 30 minutos — deixar completar o encontro/checkpoint atual antes de encerrar.
- **Questionário final**: ~5-10 minutos.
- **Total por participante**: ~40 minutos.

## Momento de encerrar a sessão de jogo

Encerrar quando o **primeiro** destes acontecer:
1. O participante chega a ~30 minutos de jogo.
2. O participante para espontaneamente e diz (ou demonstra) que não quer continuar.
3. O participante fica genuinamente travado sem conseguir prosseguir por mais de ~2 minutos, mesmo tentando — nesse caso, registrar isso como o dado mais importante da sessão inteira, não como uma falha do teste.

Nunca encerrar cedo só porque o roteiro de observação já foi "todo preenchido" — tempo extra de jogo espontâneo é em si um dado (ver Pergunta 6 em [Playtest Goals](01-goals-and-profiles.md)).

## Perguntas finais (antes de abrir o questionário escrito)

Perguntar em voz alta, registrando as respostas antes de entregar o [Questionário do Participante](03-participant-questionnaire.md):
1. "Me conta o que você acabou de fazer, com suas palavras, como se estivesse explicando pra um amigo."
2. "Teve algum momento em que você não soube o que fazer?"
3. "Teve algum momento que te surpreendeu, bem ou mal?"

Essas três perguntas abertas, ditas em voz alta logo após o jogo (antes do questionário escrito), capturam a primeira reação — que costuma ser mais honesta e menos filtrada do que a resposta escrita alguns minutos depois.

---

## Ficha de Observação (durante a sessão)

Preencher **durante** a sessão, não depois — anotar o que aconteceu, não o que você acha que significa (a interpretação vem depois, na [Consolidação](06-consolidation-template.md)).

| Campo | O que registrar |
| --- | --- |
| Perfil do participante | Conforme [Tester Profiles](01-goals-and-profiles.md) |
| Formato da sessão | Presencial / remoto / gravação assíncrona |
| Hora de início | — |

### O que observar (registrar o momento exato — timestamp ou "aos X minutos")

- **Hesitação**: qualquer pausa visível antes de clicar em algo, especialmente na Landing Page e na primeira tela da Cidade. Registrar ONDE (qual elemento) o cursor ficou parado.
- **Perda de rumo**: o participante clica em vários lugares sem propósito aparente, ou verbaliza "não sei o que fazer agora".
- **Entusiasmo**: qualquer reação positiva espontânea (sorriso, "ah, legal", inclinar-se pra frente, ler algo em voz alta sem ser pedido).
- **Elementos ignorados**: qualquer coisa que o time considera importante (ex: o hint "A saída da Capital para o mundo", o aviso de sessão de demonstração, o feedback de loot rejeitado) que o participante passa por cima sem notar.
- **Encerramento espontâneo**: o momento exato em que o participante decide parar por conta própria, e o que ele estava fazendo/vendo imediatamente antes.
- **Pedidos de ajuda**: sempre que o participante pergunta "o que eu faço agora?" ou similar — registrar a pergunta exata e o que estava na tela.
- **Falas em voz alta relevantes**: qualquer comentário espontâneo sobre dificuldade, clareza, diversão ou confusão, transcrito o mais literalmente possível.

### Disciplina de registro

Registrar primeiro, analisar depois. Durante a sessão, o moderador não deve tentar classificar o problema (UX? bug? balanceamento?) nem decidir se é importante — isso é papel da [Classificação de Issues](05-issue-classification-and-success-criteria.md), feita depois, com a cabeça fria e olhando o padrão entre várias sessões, não uma reação isolada.

Ver também: [Métricas](04-metrics.md) (o que cronometrar em paralelo a esta ficha), [Questionário do Participante](03-participant-questionnaire.md).
