# 6. Bosses

**Status:** ✅ Estável (design fechado — MVP pronto para implementação)

Design fechado bloco por bloco, antes de qualquer código, todos os 6
blocos (Nascimento, Participação, Combate, Recompensas, Escala, Ranking/MVP)
decididos. A implementação real do BossSystem só deve começar depois deste
capítulo — feito.

## Nascimento — ✅ decidido

**Escopo: por canal, não global.** Um único Boss ativo por canal por vez.
Canais diferentes podem ter Bosses ativos simultaneamente, de forma
totalmente independente — cooldown, vida, participação e recompensa não
são compartilhados entre canais. A pergunta "existe um Boss Global do
servidor inteiro?" é diferente desta e não foi decidida — fica registrada
como ideia para o futuro (afeta diretamente o design de Kingdoms), não
como algo em avaliação para o MVP atual.

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

> **Hipótese registrada para revisão na Sprint B3, não um bloqueador da
> B1 (2026-07-01):** durante o design técnico, surgiu a proposta de
> simplificar o MVP removendo os ataques do Boss por completo — luta
> puramente cooperativa (Boss só tem HP, jogadores causam dano coletivo,
> Boss nunca ataca de volta, sem morte de personagem, sem ultimate). O
> bloco Combate abaixo permanece a decisão vigente e não foi reaberto —
> essa hipótese será avaliada no início da Sprint B3 (Combate), quando
> houver um Boss real rodando em live e dados de participação reais para
> decidir, não antes. Sprint B1 (Nascimento) não depende desta escolha de
> nenhuma forma.

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

## Recompensas — ✅ decidido (MVP)

**Elegibilidade e distribuição — já resolvido pelo bloco Participação.**
Todo personagem com presença ativa durante a luta é elegível, sem piso
mínimo; distribuição proporcional à participação medida. Quem entra depois
ou sai antes só tem sua participação medida reduzida, nunca zerada.

**Precisa possuir Character** — consequência do Princípio 1, não uma
escolha de design: sem Character não há entidade para creditar nada.

**Loot principal (item, reservado à vitória):** todo personagem que
participou em qualquer momento da luta é elegível — qualidade/quantidade
proporcional à participação medida, sem corte mínimo artificial. Quem saiu
antes da morte do Boss ainda concorre.

**Reconnect:** usa o mesmo timeout de 90s do `SessionManager`, sem lógica
de presença especial para combate — uma única definição de "presença
ativa" em todo o jogo. Só revisitar se playtests reais mostrarem problema,
não preventivamente.

**Individual x coletiva — dois tipos de recompensa, com escopos
diferentes:**
1. **Individual (principal):** XP, ouro, loot, progressão — sempre
   pertence ao Character (Princípio 1), sem exceção.
2. **Coletiva (leve, temporária, nunca permanente/econômica):** a vitória
   concede um benefício ao canal — ex.: +5% XP por 15 min, +5% chance de
   drop por 10 min, efeito visual, título temporário ("Canal Vencedor"),
   NPC comemorando, fogos, clima especial. Nunca buff permanente, nunca
   recurso compartilhado entre jogadores — serve só para transformar a
   vitória num momento social do canal, não para virar vantagem econômica.
   **Conceito confirmado e permanente na visão do jogo, mas a implementação
   fica fora do MVP** (ver seção MVP) — exige infraestrutura própria de
   efeitos temporários/eventos de canal que ainda não existe.

**Tipos de recompensa no MVP: XP + Itens, e só isso.**
- **Gold fica fora do MVP.** Boss não deve ser a segunda fonte de gold
  saindo do caminho legado antes de existir uma decisão mais ampla sobre a
  migração de gold — introduzir isso via Boss seria antecipar uma migração
  da Engine sem ter sido decidida em nenhum outro lugar.
- **Hero Token fica fora.** Pertence à progressão social/Classes, não faz
  sentido tematicamente como recompensa de combate.
- **Itens** reutilizam `ItemRepository` no MVP (herdam o bug de RNG
  compartilhado — só `common` até a Economia 1.0 corrigir isso), mas a
  arquitetura fica deliberadamente aberta para uma tabela de loot própria
  de Boss (`boss_loot_table`) no futuro, sem precisar reusar exatamente a
  mesma fonte do drop geral.

**Parcial x vitória completa — regra confirmada:**
- **Participação sempre gera** XP (proporcional) e, quando a economia
  estiver migrada, Gold (proporcional) — independente do resultado (fuga
  ou vitória).
- **Vitória gera, além disso:** chance de item, recompensa coletiva de
  canal (quando existir), qualquer recompensa temática exclusiva do Boss.
- Objetivo: participar nunca é tempo perdido (fuga ainda paga XP/Gold);
  derrotar o Boss continua sendo o objetivo principal (só a vitória dá o
  loot). Fuga não é equivalente à vitória, mas também não anula o que já
  foi ganho por participação.

### Fora do MVP (confirmado)

Gold como recompensa de Boss, Hero Token como recompensa de Boss,
recompensa coletiva/de canal (conceito confirmado, implementação adiada),
`boss_loot_table` dedicada (o `ItemRepository` genérico serve por ora).

## Escala — ✅ decidido (MVP)

**Modelo: por faixas (tiers), não fórmula contínua.** Escolhido
deliberadamente sobre linear/logarítmica: mais fácil de balancear e ajustar
durante playtests, permite mudar uma faixa sem recalibrar as outras, e dá
números previsíveis para quem está testando. Objetivo do MVP é aprender com
dados reais, não encontrar a fórmula matemática perfeita antes dos
primeiros testes. Se surgir evidência de que uma fórmula contínua funciona
melhor, a migração é possível sem alterar o resto do BossSystem — os tiers
são um detalhe de calibração, não uma decisão estrutural.

Faixas ilustrativas (números de exemplo, não calibrados):
- Tier 1: 1–10 participantes
- Tier 2: 11–25
- Tier 3: 26–50
- Tier 4: 51–100
- Tier 5: 101+

**Vida do Boss:** escala por tier (consequência já estabelecida do dano
coletivo — sem isso, canais grandes matariam o Boss quase instantaneamente).

**Dano do Boss contra os jogadores: fixo, não escala no MVP.** Decisão
deliberada de isolar uma variável por vez — se vida e dano escalassem
simultaneamente, ficaria difícil saber se um Boss está difícil por ter HP
demais ou por matar rápido demais. O desafio em canais grandes vem da
duração do combate e da coordenação coletiva, não de dano artificialmente
maior. Se playtests mostrarem que canais grandes derrotam o Boss com
facilidade excessiva, reavaliar escala parcial de dano nesse momento — não
agora, preventivamente.

**Recompensa total: também por tier, não ilimitada nem com teto único.**
Cada tier tem um pool de recompensa conhecido e balanceado (pool maior nos
tiers maiores, mas com limite definido por faixa — não uma fórmula onde
cada espectador adicional aumenta indefinidamente a emissão de itens e
recursos). Mesma lógica de proteção de economia do Cooldown (bloco
Nascimento): canais maiores são recompensados por mobilizar mais gente, mas
de forma previsível e calibrável, não com crescimento ilimitado.

## MVP — consolidação final

Todos os 6 blocos estão decididos. Esta lista reúne tudo — nada aqui é
especulação, cada item tem sua justificativa completa no bloco de origem.

**Entra no MVP:**
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
- Distribuição de recompensa proporcional à participação (XP e Itens).
- Loot principal para todo mundo que participou em algum momento, mesmo
  quem saiu antes da morte — proporcional, sem corte mínimo.
- Reconnect usa o timeout padrão de 90s do `SessionManager`, sem regra
  especial de combate.
- Recompensa individual (XP, Loot) sempre do Character — recompensa
  coletiva/de canal é conceito confirmado, mas fora da implementação MVP.
- XP/Gold-quando-migrado proporcionais à participação independente do
  resultado (fuga paga); só a chance de item depende de vitória.
- Dano coletivo (barra de vida única do canal), com contribuição individual
  rastreada por personagem.
- Sem aggro, sem Tank/Healer.
- 3 habilidades fixas do Boss (ataque normal, especial periódico, ultimate
  por % de vida).
- Morte de personagem temporária, sem penalidade, revive ao fim da luta.
- Dano determinístico (`Base × Equipamentos × Classe`) com pequena chance
  de crítico — sem RNG pesado.
- Escala por tiers (vida e recompensa total); dano do Boss fixo, não
  escala.
- Participação individual rastreada internamente para ranking futuro, sem
  UI de ranking/MVP nesta versão.

**Fica para versão futura:**
- Skill Tree, Mana, cooldown de habilidades, Tank, Healer, buff complexo,
  posicionamento.
- Esquiva, bloqueio, sangramento, veneno e outros efeitos além de crítico.
- Novos Modifiers crescendo em temporadas futuras (capítulo 9).
- Gold e Hero Token como recompensa de Boss.
- Recompensa coletiva/de canal (buffs temporários, títulos, efeitos) —
  conceito confirmado, implementação adiada, depende de infraestrutura de
  eventos de canal que não existe.
- `boss_loot_table` dedicada (o `ItemRepository` genérico serve por ora).
- Ranking visível e destaque de MVP (jogador) — depende do Frontend Event
  Bridge.
- Escala parcial de dano do Boss — só se playtests mostrarem necessidade.
- Migração de fórmula de escala de tiers para curva contínua — só se
  playtests mostrarem necessidade.

**Nunca deve existir:** nada foi vetado permanentemente. Registrar aqui só
quando houver uma decisão explícita nesse sentido — não é uma lista para
preencher por especulação.

## Ranking e MVP (jogador) — ✅ decidido (MVP)

**Ranking visível: não no MVP.** O `BossSystem` precisa calcular e
registrar internamente a participação de cada personagem de qualquer forma
(é o que alimenta a distribuição proporcional de XP/Gold/Loot já decidida),
mas não existe interface mostrando esse ranking ao jogador nesta primeira
versão. Motivo explícito: expor ranking em tempo real exige o Frontend
Event Bridge, UI própria da luta e persistência de ranking durante o
combate — nenhuma dessas peças é necessária para validar se o Boss
funciona. Quando o Frontend Event Bridge existir, o ranking pode ser
exposto sem alterar a lógica do `BossSystem` (o dado já vai estar lá).

**MVP (jogador destaque): não no MVP.** A distribuição proporcional já
recompensa quem mais contribuiu automaticamente, sem precisar de uma
camada extra de reconhecimento (critério de desempate, título exclusivo,
UI de destaque). Motivo de design, não só técnico: o objetivo do Boss no
MVP é incentivar cooperação, não competição individual dentro de um evento
cooperativo. Títulos/conquistas de MVP podem ser avaliados depois, como
camada social, quando a interface do Boss estiver madura — não como parte
da mecânica principal agora.

## Dependências

Bosses depende de:
- Princípios permanentes (regras de evento, Repository sem regra de jogo)
- Personagens (quem participa, dano de personagem)
- Progressão (XP como possível recompensa; gold ainda legado)
- Classes (fórmula de dano pressupõe stat de Classe, ainda placeholder)
- Economia (drop de item herda o bug de RNG; Hero Token como possível
  recompensa; cooldown protege a economia de canais grandes)
- Seasons (Modifiers de batalha crescem em temporadas futuras)
