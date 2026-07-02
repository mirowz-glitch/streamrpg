# 6. Bosses

**Status:** 🚧 Em discussão

Design sendo fechado bloco por bloco, antes de qualquer código. Um bloco só
é considerado decidido quando está registrado aqui como decisão confirmada,
não como pergunta aberta.

## Nascimento — ✅ decidido

**Gatilho:** o Boss nasce automaticamente (por condição de tempo e/ou
atividade acumulada do canal), mas não entra em combate sozinho. Ele fica em
estado **"Aguardando invocação"**. O streamer recebe um botão no Overlay
("⚔️ Invocar Boss"). Se ele não clicar, o Boss entra em combate sozinho
após um tempo definido (ex.: 15 minutos).

Motivação: automação sem tirar o controle do criador de conteúdo — o
streamer não esquece de "spawnar" o Boss, o chat cria expectativa vendo que
o Boss já está pronto, e o streamer escolhe o melhor momento (fim de
partida, intervalo, troca de jogo) sem depender de lembrar um comando.

**Papel do streamer:** não modifica o Boss diretamente nem concede buffs ao
chat. Em vez disso, escolhe um **Modifier** (mutador) que altera as regras
do encontro para todos igualmente. Exemplos: mais vida e mais recompensa,
Boss mais rápido, maior chance de drop, modo Hardcore, eventos climáticos.
Modifiers são pensados para crescer organicamente em temporadas futuras
(ver capítulo 9, Seasons).

**Cooldown:** cooldown base fixo entre Bosses no mesmo canal (ex.: 3 horas),
igual para todos os canais. Engajamento da live pode reduzir esse tempo
dentro de um limite (ex.: até 2 horas no mínimo), nunca removendo o cooldown
por completo. Objetivo explícito: recompensar canais ativos sem permitir que
canais muito grandes gerem uma quantidade desproporcional de Bosses (e,
portanto, de recompensas) — proteção direta da economia e do Marketplace
futuro (capítulos 10 e 11).

**Duração de vida:** duração máxima (ex.: 10 minutos). Durante esse período,
a vida do Boss decresce lentamente com o tempo (timeout suave), mas o dano
do chat continua sendo a forma principal de derrotá-lo. Se o tempo acabar
sem morte, o Boss **foge** — participantes recebem uma recompensa parcial
por participação, mas o loot principal fica reservado exclusivamente para a
vitória. Garante que todo encontro tenha um fim, cria urgência durante a
luta, e evita tanto encontros infinitos quanto um corte abrupto sem
recompensa nenhuma.

## Participação — ✅ decidido

**Elegibilidade:** todo personagem com presença ativa no canal (via
`SessionManager`) no momento em que o Boss entra em combate participa
automaticamente — não exige ping recente nem ação explícita de "entrar".

**Métrica:** participação é medida como presença + dano como bônus. Presença
durante a luta é a base; se existir dano por personagem (ver bloco Combate,
ainda em aberto), ele soma como fator extra sobre essa base.

**AFK:** sem distinção — presença já basta, mesmo padrão já usado no resto
do jogo hoje (que também não distingue AFK de ativo).

**Distribuição:** recompensa proporcional à participação medida — quem
contribuiu mais (pela métrica acima) recebe proporcionalmente mais. Não é
"tudo igual" nem "camadas fixas".

**Piso mínimo:** não existe piso — qualquer presença durante a luta, por
menor que seja, garante uma recompensa mínima proporcional. Consistente com
a decisão de não distinguir AFK.

## Combate — ✅ decidido (MVP)

**Dano:** coletivo. O Boss tem uma única barra de vida para todo o canal —
não uma vida por jogador. Cada personagem contribui automaticamente com seu
próprio DPS para essa barra compartilhada. A contribuição individual
continua sendo rastreada por personagem (é o que alimenta o "dano como
bônus" da participação, capítulo Participação) — "coletivo" descreve a
barra de vida, não a atribuição de dano por jogador. Objetivo: sentimento de
"raid".

**Aggro:** não existe no MVP. Sem Tank/Healer, sem sistema de ameaça — cada
personagem só causa dano conforme seus próprios atributos. Aggro fica para
quando existirem habilidades (fora do MVP).

**Habilidades do Boss:** simples, fixas para o MVP —
- Ataque normal.
- Ataque especial a cada X segundos.
- Ultimate em percentuais de vida determinados (75%, 50%, 25%).

Nada além disso no MVP.

**Morte de personagem:** o Boss pode matar. A morte é temporária e sem
penalidade: o personagem fica "derrotado" (para de causar dano naquele
Boss), continua assistindo normalmente, e revive automaticamente ao fim da
luta. Sem perda de XP, ouro ou itens.

**Cálculo de dano:** determinístico, não aleatório. Fórmula:

```
Dano Base × Equipamentos × Classe × Critical (pequena chance)
```

Sem RNG exagerado — o jogador precisa sentir que ficou mais forte porque
evoluiu, não porque teve sorte. Único elemento de aleatoriedade é uma
pequena chance de crítico.

> **Dependência ainda não modelada:** esta fórmula pressupõe que Equipamentos
> e Classe contribuam com um valor numérico de poder/dano. Hoje nenhum dos
> dois existe assim — `items` (capítulo 3/schema) só tem `rarity`/`slot`/
> `min_level`, sem stat de poder; Classes (capítulo 4) é placeholder, nada
> definido. Não bloqueia o design, mas precisa ser resolvido antes da
> implementação real do BossSystem.

**Efeitos:** crítico existe no MVP. Esquiva, bloqueio, sangramento, veneno e
outros efeitos ficam para depois.

**Fuga:** já coberta no bloco Nascimento — o Boss foge ao fim da duração
máxima se não for derrotado. Nenhuma outra forma de fuga além dessa no MVP.

### Explicitamente fora do MVP

Skill Tree, Mana, Cooldown de habilidades, Tank, Healer, Buff complexo,
Posicionamento. Tudo isso pode esperar a versão 2.

## Recompensas — parcialmente em aberto

Vários itens deste bloco já estão resolvidos por decisões de blocos
anteriores — registrados aqui como consequência, não como escolha nova.
Os genuinamente abertos aparecem com opções, sem decisão tomada.

**Quem é elegível — já resolvido pelo bloco Participação.** Todo personagem
com presença ativa durante a luta é elegível, sem piso mínimo (ver
Participação). Não é uma pergunta nova.

**Precisa possuir Character — não é uma escolha de design, é consequência
do Princípio 1** (capítulo 2): progressão pertence ao Character. Sem
Character não existe entidade para creditar XP/gold/item. Um espectador sem
personagem simplesmente não é elegível, pela própria arquitetura, não por
uma regra específica do BossSystem.

**Quem entra depois recebe — já resolvido pelo bloco Participação.**
Recebe proporcional ao tempo/dano que teve a partir do momento em que
entrou (sem piso mínimo, qualquer presença conta). Entrar depois não exclui,
só reduz a participação medida.

**Quem sai antes do Boss morrer recebe — parcialmente resolvido, um ponto
genuinamente em aberto.** A participação até o momento da saída já é
contabilizada (mesma lógica acima). **Em aberto:** a recompensa de "vitória
completa" (loot principal, reservado à vitória — ver Nascimento) é para
quem participou em qualquer momento da luta, ou só para quem estava
presente no instante da morte do Boss? Nenhuma decisão tomada ainda.

**Reconnect — informado por infraestrutura já existente, não totalmente
resolvido para este caso.** `SessionManager` já expira sessão após 90s sem
presença reportada; reconectar dentro desse intervalo não gera gap
perceptível. **Em aberto:** se isso é suficiente para a duração de uma luta
de Boss (até ~10 min) ou se o combate precisa de uma tolerância própria a
reconexão, diferente do padrão geral do jogo.

**Recompensa individual x coletiva — em aberto.** Duas direções possíveis:
- Só individual: cada participante recebe conforme sua própria contribuição,
  nada compartilhado. Mais simples, mais alinhado ao Princípio 1 (progressão
  é sempre do Character).
- Existe também uma recompensa coletiva/de canal (ex.: buff temporário para
  o canal, cosmético de "sobrevivente da luta X"). Cria um momento social
  mais forte, mas exige um conceito de "recompensa de canal" que não existe
  em nenhum outro lugar da Bible hoje — seria a primeira exceção ao padrão
  "tudo pertence ao Character".

**Tipos de recompensa — cada um com uma implicação diferente, nenhuma
decisão tomada sobre quais entram no MVP:**
- **XP:** trivial — reaproveita `xp.granted` já existente.
- **Gold:** hoje gold só é concedido pelo caminho legado (capítulo 5), nunca
  pela Engine. Se o Boss conceder gold via evento, seria o **primeiro caso**
  de gold saindo do legado — antecipa parte de uma migração que ainda não
  aconteceu em nenhum outro lugar.
- **Itens:** reaproveita `DropSystem`/`ItemRepository`, mas herda o bug de
  RNG compartilhado (capítulo 10) — enquanto não corrigido, Boss também só
  vai dropar `common`, na prática.
- **Cosméticos:** não existe esse conceito em nenhum lugar do jogo hoje —
  precisaria ser inventado antes de ser uma recompensa de Boss.
- **Hero Token:** tematicamente estranho um Boss "dropar" um token que
  representa "trouxe alguém novo para o jogo" (capítulo 10) — não é óbvio
  que faça sentido aqui. Vale decidir explicitamente se Hero Token entra
  como recompensa de Boss ou fica reservado só para referral.

**Recompensas parciais x vitória completa — parcialmente já decidido no
bloco Nascimento** (fuga = recompensa parcial; vitória = loot principal
reservado). Ainda em aberto: se XP/gold seguem proporcionais à participação
independente do resultado (fuga ou vitória), e só a *chance* de item depende
de vitória — essa é a leitura mais direta da decisão já tomada, mas não foi
confirmada explicitamente.

**Fora do MVP (candidatos, não confirmados):** cosméticos, Hero Token como
drop de Boss, recompensa coletiva/de canal, camadas de recompensa ligadas a
ranking/MVP (ver bloco MVP abaixo).

## Escala — em aberto (sem matemática definitiva)

Objetivo deste bloco: mapear o que precisa escalar e as opções de *como*,
não fixar números. Os cinco tamanhos de referência (5, 20, 100, 500, 5.000
espectadores) servem para testar se uma abordagem faz sentido nos dois
extremos, não para definir a fórmula final.

**Vida do Boss — quase forçado a crescer, dado o Combate já decidido.** Como
o dano é coletivo (uma barra de vida somando o DPS de todo mundo), se a vida
não escalar com o número de participantes, um canal de 5.000 pessoas mataria
o Boss quase instantaneamente, esvaziando a luta decidida no bloco
Nascimento (duração máxima, urgência). Não é exatamente uma escolha aberta
— é consequência de "dano coletivo" — mas a *forma* da curva (linear,
logarítmica, por faixas) continua em aberto.

**Dano do Boss contra os jogadores — genuinamente em aberto.** Três direções
possíveis:
- **Não escala:** favorece canais pequenos (luta "mais justa" per capita),
  mas o Boss deixa de ser ameaça percebida em canais grandes.
- **Escala com espectadores:** mantém tensão em qualquer escala, mas risco
  de matar jogadores rápido demais em canais grandes se mal calibrado.
- **Escala parcial** (menos que a vida): meio-termo, sem compromisso ainda
  sobre a proporção.

**Recompensa total — conecta diretamente com a proteção de economia já
decidida no Cooldown (bloco Nascimento).** Se a recompensa total crescesse
sem limite com o número de espectadores, canais grandes voltariam a gerar
valor desproporcional mesmo com cooldown fixo — reabrindo o mesmo problema
que o cooldown já existe para conter. Vale considerar um teto na recompensa
total, independente do tamanho do canal, mas isso não foi decidido.

**Modelos de escala, vantagens e desvantagens (nenhum escolhido ainda):**

| Modelo | Vantagem | Desvantagem |
|---|---|---|
| Linear | Simples de entender e prever | Nos extremos (5.000 espectadores) os números ficam absurdos se a base for calibrada para grupos pequenos |
| Logarítmica | Suaviza o crescimento em escalas grandes, evita absurdos nos extremos | Mais difícil de calibrar e de "sentir" intuitivamente durante o design |
| Por faixas (tiers) | Fácil de balancear e testar manualmente por faixa | Cria degraus artificiais (ex.: 50 vs. 51 espectadores comportam-se diferente); exige manutenção manual conforme o jogo cresce |

Nenhum modelo foi escolhido. Esta tabela existe para a decisão futura
começar de uma base já mapeada, não do zero.

## MVP — consolidação parcial

Este bloco reúne o que os blocos anteriores já decidiram. Itens de
Recompensas e Escala que ainda estão em aberto **não entram nesta lista**
até serem fechados — listá-los aqui seria inventar uma decisão que não foi
tomada.

**Entra no MVP (já decidido):**
- Nascimento automático com estado "Aguardando invocação" + botão do
  streamer + timeout automático.
- Modifier de batalha escolhido pelo streamer (não buff direto, não
  vantagem unilateral ao chat).
- Cooldown fixo, redutível por engajamento até um piso, nunca removível.
- Duração máxima com decaimento suave de vida; foge com recompensa parcial
  se não morrer a tempo.
- Elegibilidade por presença ativa, sem piso mínimo de participação.
- Métrica de participação: presença + dano como bônus.
- Sem distinção de AFK.
- Distribuição de recompensa proporcional à participação.
- Dano coletivo (barra de vida única do canal), com contribuição individual
  rastreada por personagem.
- Sem aggro, sem Tank/Healer.
- 3 habilidades fixas do Boss (ataque normal, especial periódico, ultimate
  por % de vida).
- Morte de personagem temporária, sem penalidade, revive ao fim da luta.
- Dano determinístico (`Base × Equipamentos × Classe`) com pequena chance
  de crítico — sem RNG pesado.

**Fica para versão futura (já sinalizado nos blocos anteriores):**
- Skill Tree, Mana, cooldown de habilidades, Tank, Healer, buff complexo,
  posicionamento.
- Esquiva, bloqueio, sangramento, veneno e outros efeitos além de crítico.
- Novos Modifiers crescendo em temporadas futuras (capítulo 9).
- Cosméticos, Hero Token como drop de Boss, recompensa coletiva/de canal,
  camadas de recompensa por ranking — *candidatos*, pendentes de decisão no
  bloco Recompensas.
- Fórmula final de escala de vida/dano/recompensa — pendente do bloco
  Escala.

**Nunca deve existir:** nada foi vetado permanentemente até agora. Registrar
aqui só quando houver uma decisão explícita nesse sentido — não é uma lista
para preencher por especulação.

## Ranking e MVP (jogador) — em aberto

- Existe ranking de contribuição na luta?
- Existe um "MVP" (maior contribuinte) com reconhecimento/recompensa
  própria, ou a distribuição proporcional (já decidida) já é suficiente sem
  precisar de um destaque adicional?

Nenhuma decisão tomada. Interage diretamente com "recompensa individual x
coletiva" (bloco Recompensas) e com o modelo de distribuição já decidido —
um MVP com recompensa própria seria uma camada adicional sobre a
distribuição proporcional, não uma substituição dela.

## Dependências

Bosses depende de:
- Princípios permanentes (regras de evento, Repository sem regra de jogo)
- Personagens (quem participa, dano de personagem)
- Progressão (XP como possível recompensa; gold ainda legado)
- Classes (fórmula de dano pressupõe stat de Classe, ainda placeholder)
- Economia (drop de item herda o bug de RNG; Hero Token como possível
  recompensa; cooldown protege a economia de canais grandes)
- Seasons (Modifiers de batalha crescem em temporadas futuras)
