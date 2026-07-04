# Classes — Arquitetura Final (Design Fechado)

**Status: ✅ Arquitetura Fechada.** Este documento encerra a Sprint
"Classes Architecture (Final Design)". Nenhuma linha de código, schema ou
Combat Model foi alterada para produzi-lo — é a proposta de design
definitiva para quando Classes (Bible capítulo 4) entrar oficialmente em
Sprint de implementação, seguindo o mesmo processo bloco-a-bloco já usado
em Bosses (capítulo 6) antes de qualquer código real.

## Etapa 1 — Mapa completo de toda referência a Classes

| Documento | O que já diz sobre Classes |
|---|---|
| Bible cap. 3 (Characters) | Nenhum atributo além de `level` existe — Classes seria a primeira extensão real do personagem além disso. |
| Bible cap. 4 (Classes) | 📌 Placeholder. Único fio puxado: Hero Token (cap. 10) precisa de uma classe exclusiva para gastar. |
| Bible cap. 6 (Bosses) | Fórmula `Base × Equipamentos × Classe × Critical` já fechada (✅ Estável). "Dependência ainda não modelada" registrada explicitamente: a fórmula pressupõe Classe com valor numérico, que hoje não existe. `Classe_mult` fixo em `1` no código real, documentado como placeholder. Hero Token explicitamente **fora** das recompensas de Boss ("pertence à progressão social/Classes"). |
| Bible cap. 10 (Economy) | Hero Token: gastável em classe exclusiva ou vendável; decisão em aberto sobre circular no Marketplace antes do resgate. |
| Bible `open-questions.md` | 3 perguntas abertas: como uma classe é obtida além do Hero Token; múltiplas classes desde o início ou desbloqueio progressivo; com que peso Classes afeta a fórmula de dano de Boss. |
| Bible `consistency-report.md` | Classes não pode ser fechado sem olhar Economia (Hero Token); a fórmula de Boss depende de Classes e de um stat de poder em Equipamento que também não existe; implementar a fórmula com valores provisórios antes de Classes fechar "quase certamente precisa ser refeita". |
| `gameplay-design/01-characters-attributes.md` | ATQ, VEL, SUS e UTI são todos parcialmente derivados de `Classe.*_bonus`/`Classe_mult` — Classes é a única fonte de VEL e SUS no MVP. |
| `gameplay-design/04-builds.md` | Build = Classe + Equipamento (+ futuro Skill). 5 arquétipos de build (Dano/Tanque/Suporte/Velocidade/Utilidade), cada um otimizando um recurso diferente. |
| `gameplay-design/06-classes-skills.md` | 4 arquétipos propostos (Guerreiro/Druida/Caçador/Xamã), tabela qualitativa de atributos, 1 passivo fixo cada, "teste de identidade" já aplicado (Druida/Xamã convergem em números, divergem em comportamento). |
| `gameplay-design/07-regions-interface.md` | Tabela região × classe favorecida — todas as 11 regiões mapeadas, 2 lacunas reais encontradas (Minas Abandonadas precisa de arma mágica inexistente; Colinas Áridas precisa de um atributo de "dano em área" que não existe). |
| `gameplay-design/08-boss-interface.md` | Confirma que só falta Classes sair de Placeholder para o Boss real usar `Classe_mult` de verdade — nenhuma mudança de Boss é necessária além de trocar o valor `1` fixo. |
| `combat-model/canonical-formula.md` | `Classe_mult(tipo)` é termo estrutural, tipado por físico/mágico, sem valor definido — este documento define os valores. |
| `combat-model/monsters-and-regions.md` | Monstros têm o mesmo modelo de Resistência física/mágica — Deserto de Vidro é a primeira região onde sobrevivência (Druida/Xamã) e dano (Guerreiro/Caçador) puxam para grupos diferentes, favorecendo grupo misto. |
| `reviews/gameplay-combat-final-review.md` | Fechou DEF→Resistência; encontrou que Guerreiro perdeu seu passivo sem substituto; confirmou a convergência Druida/Xamã como achado real, não hipotético. |
| `reviews/mvp-readiness-review.md` | "Decidir onde mora a Classe do personagem" listado como risco #2 de seis para implementação contínua. |
| `reviews/character-attributes-schema-review.md` | `sus_base` já existe na coluna do personagem, sempre 0, esperando Classes como única fonte real futura. |
| `docs/design/*` (Sprint anterior, Long-Term Progression) | Classes identificado como o maior gargalo estrutural do projeto — recomendação de inseri-lo explicitamente no Roadmap logo após BossSystem. |

**Nenhuma referência contraditória foi encontrada** — todo documento lido
aponta na mesma direção (Classes bloqueia Boss real, builds reais, Hero
Token, identidade do jogador) e nenhum propõe um modelo alternativo
incompatível com os 4 arquétipos já rascunhados em
`gameplay-design/06-classes-skills.md`. Este documento fecha, não
substitui, esse rascunho.

---

## Etapa 2 — Por que Classes existem (o problema de design, não "porque RPG tem")

StreamRPG tem três restrições permanentes que, juntas, eliminam quase
todas as formas usuais de um RPG gerar variedade de jogo:

1. **Combate é deliberadamente determinístico** (Bible cap. 6) — sem
   RNG pesado, sem chance de acerto/erro, sem esquiva probabilística.
2. **Boss MVP não tem Tank/Healer/aggro** (Bible cap. 6) — nenhum papel
   de grupo tradicional existe.
3. **Não há alocação manual de atributo nem árvore de skill** (Sprint
   Gameplay Design, capítulo 01/06) — o jogador nunca "monta" uma build
   ponto a ponto.

Sem Classes, a única fonte de diferença entre dois personagens seria
**qual arma/equipamento eles têm equipado** — um único eixo. Isso
significa que "build" colapsaria em "quem tem a raridade mais alta", o
oposto do que `04-builds.md` já promete (cada build otimiza um recurso
diferente, não compete no mesmo eixo).

**O problema de design que Classes resolve, então, é este:** dar ao jogo
um segundo eixo de diferenciação estrutural — independente de sorte,
reflexo, ou item — que torna real a identidade de região (World Design
já assume "classe favorecida" por região), torna real a cooperação em
Boss (Xamã é o único mecanismo de suporte de grupo que existe, já que
Tank/Healer/aggro estão fora do MVP), e dá ao Hero Token um destino que
faz sentido (progressão social, não drop de item). Classes não existe
"porque todo RPG tem" — existe porque, sem ela, as outras três decisões
permanentes do jogo (determinismo, sem Tank/Healer, sem árvore de skill)
deixariam "build" sem nenhum significado real.

---

## Etapa 3 — Identidade: o que cada Classe faz melhor que qualquer outra

Não em números — em comportamento observável:

| Classe | O que faz melhor que qualquer outra |
|---|---|
| **Guerreiro** | Sempre entrega o maior dano bruto instantâneo de qualquer classe, em qualquer contexto — é a única cuja resposta a "qual classe causa mais dano agora" é sempre a mesma. |
| **Caçador** | Age mais vezes que qualquer outra classe no mesmo intervalo de tempo, e nunca é punido por retaliação corpo-a-corpo — é a única cuja vantagem cresce quanto mais rápido o combate exige decisão. |
| **Druida** | É a única que sobrevive dano ambiental contínuo (veneno, corrupção) indefinidamente sozinha, sem depender de ninguém — onde as outras três precisam de suporte externo ou simplesmente sofrem o dano, a Druida absorve e continua. |
| **Xamã** | É a única cujo poder real cresce com o tamanho do grupo ao redor dela, não com o próprio equipamento — o SUS do Xamã cura todo mundo por tick; em um grupo de 20, isso vale mais do que em um grupo de 2. Nenhuma outra classe escala dessa forma. |

---

## Etapa 4 — Reconhecer uma Classe em 10 segundos, sem UI, sem nome, sem texto

Puramente pelo que se observa acontecer na tela — barras de HP, timing de
ataque, quem morre e quem não morre:

- **Guerreiro:** a barra de HP do alvo despenca mais rápido quando ele
  está presente do que em qualquer outra combinação — o "golpe visível
  mais forte" do grupo.
- **Caçador:** ataca visivelmente mais vezes por minuto que qualquer
  outro personagem na tela, e nunca aparece "sendo atingido" em troca
  corpo-a-corpo — dano à distância, sem retaliação.
- **Druida:** está exposta a dano ambiental contínuo (veneno, corrupção)
  e não morre nem precisa que ninguém a cure — "aguenta sozinha" onde
  qualquer outra classe visivelmente sofreria.
- **Xamã:** o sinal não está nela — está nos outros. Quando presente, as
  barras de HP do resto do grupo se recuperam visivelmente mais rápido
  do que quando ela está ausente. É a única classe cuja identidade se
  reconhece observando o grupo, não o próprio personagem.

---

## Etapa 5 — Arquétipos fechados do MVP

**Decisão: exatamente 4 arquétipos, nenhum a mais.** Guerreiro, Druida,
Caçador, Xamã — a proposta já existente em
`gameplay-design/06-classes-skills.md` é adotada integralmente, sem
adicionar uma quinta classe mecânica. Motivo: mais arquétipos diluiriam
identidade em vez de multiplicar escolha real (a mesma armadilha que
aquele capítulo já nomeava: "20 classes levemente diferentes"). A
"classe exclusiva" do Hero Token (Etapa 8) **não é** um quinto
arquétipo mecânico — ver resolução abaixo.

---

## Etapa 6 — Ficha completa de cada Classe

### Guerreiro

| Campo | Definição |
|---|---|
| Função | Dano concentrado, burst — resolve encontros contra o relógio |
| Identidade | Direto, sem sutileza — o maior número na tela, sempre |
| Força | Encontros de dano-contra-tempo (Boss antes da fuga, cap. 6) |
| Fraqueza | Qualquer mecânica ambiental contínua (Veneno, Corrupção) — sem SUS nem Resistência mágica para mitigar |
| Tipo de dano | Físico |
| Escalamento | `Classe_mult(físico) = 1.5`, `Classe_mult(mágico) = 0.5` (ver Etapa 7) |
| Equipamentos favoritos | Armas físicas de ATQ alto (espada, machado, lança), Armadura (Resistência física) |
| Regiões favoritas | Deserto de Vidro e Colinas Áridas (dano contra Resistência física baixa dos inimigos) |
| Regiões onde sofre | Pântano Podre (veneno contínuo sem SUS), Minas Abandonadas (Resistência física alta dos inimigos) |
| Bosses onde brilha | Lutas curtas, decididas antes do timer de fuga expirar |
| Bosses onde sofre | Lutas longas de atrito — sem SUS, presença prolongada pesa mais que em qualquer outra classe |

### Druida

| Campo | Definição |
|---|---|
| Função | Sustain individual — sobrevive ao ambiente sozinha |
| Identidade | Absorve dano contínuo onde qualquer outra classe sofreria |
| Força | Regiões com dano ambiental contínuo (Pântano, Deserto de Vidro) |
| Fraqueza | Encontros que exigem dano concentrado rápido — não vence uma corrida contra o timer sozinha |
| Tipo de dano | Mágico |
| Escalamento | `Classe_mult(mágico) = 1.5`, `Classe_mult(físico) = 0.5` |
| Equipamentos favoritos | Arma mágica (cajado/grimório — proposta, ainda não existe no schema), Amuleto/Anel (Resistência mágica, UTI) |
| Regiões favoritas | Pântano Podre, Minas Abandonadas (na teoria — falta arma mágica real, ver lacuna já registrada) |
| Regiões onde sofre | Colinas Áridas (dano em área de bandidos táticos, sem atributo que a proteja disso) |
| Bosses onde brilha | Lutas longas, onde sustain pessoal importa mais que burst |
| Bosses onde sofre | Lutas muito curtas — baixo ATQ não fecha a luta antes da fuga sozinha |

### Caçador

| Campo | Definição |
|---|---|
| Função | Dano à distância, alta frequência de ação |
| Identidade | Rápido e frágil — nunca é pego corpo-a-corpo |
| Força | Ambientes com penalidade de VEL (Gelo, Picos Congelados) — compensa a lentidão ambiental |
| Fraqueza | Baixa Resistência em ambos os tipos — qualquer coisa que o alcance sofre puro |
| Tipo de dano | Físico (à distância) |
| Escalamento | `Classe_mult(físico) = 1.3`, `Classe_mult(mágico) = 0.7` |
| Equipamentos favoritos | Arco (nunca sofre retaliação corpo-a-corpo, cap. 05), Botas (VEL) |
| Regiões favoritas | Bosque Sussurrante (inimigos rápidos/arqueiros — Caçador combina naturalmente), Picos Congelados |
| Regiões onde sofre | Deserto de Vidro, Ruínas Esquecidas (baixa Resistência em ambiente punitivo) |
| Bosses onde brilha | Lutas onde a cadência de ataque (mais ações por tick) compensa ATQ mais baixo que o Guerreiro |
| Bosses onde sofre | Lutas de HP muito alto sem ajuda — ATQ médio-alto, não o maior |

### Xamã

| Campo | Definição |
|---|---|
| Função | Suporte de grupo — a única fonte de cura coletiva do jogo |
| Identidade | Baixo poder individual, altíssimo valor coletivo |
| Força | Qualquer conteúdo em grupo — Boss é o caso extremo (canal inteiro) |
| Fraqueza | Sozinha, é a classe mais fraca em dano bruto — depende de contexto de grupo para justificar a escolha |
| Tipo de dano | Mágico |
| Escalamento | `Classe_mult(mágico) = 1.2`, `Classe_mult(físico) = 0.3` |
| Equipamentos favoritos | Arma mágica (mesma lacuna da Druida), Amuleto/Anel (UTI, Resistência mágica) |
| Regiões favoritas | Ruínas Esquecidas (UTI contra armadilhas/invocações) | 
| Regiões onde sofre | Qualquer região jogada solo — sua força só aparece em grupo |
| Bosses onde brilha | Bosses de Tier alto (mais participantes = SUS de grupo vale mais) — ver Etapa 7 |
| Bosses onde sofre | Bosses Tier 1 com poucos participantes — valor de grupo pouco expressivo |

**Achado honesto explícito (herdado de `06-classes-skills.md`, confirmado
aqui):** Druida e Xamã têm ficha de atributos quase idêntica — a
diferença estrutural real entre elas está inteiramente no comportamento
do SUS (grupo vs. individual), não nos números. Isso é aceito como
identidade válida, não corrigido inflando artificialmente uma diferença
numérica — behavior é uma forma legítima de identidade neste design (ver
Etapa 3).

---

## Etapa 7 — Resolução de `Classe_mult`

**Como nasce:** `Classe_mult` é uma constante fixa por Classe, por tipo
de dano (físico/mágico) — definida no momento em que a Classe é
escolhida, nunca calculada dinamicamente.

| Classe | `Classe_mult(físico)` | `Classe_mult(mágico)` |
|---|---|---|
| Guerreiro | 1.5 | 0.5 |
| Druida | 0.5 | 1.5 |
| Caçador | 1.3 | 0.7 |
| Xamã | 0.3 | 1.2 |

Valores **ilustrativos, não calibrados** — mesma honestidade já usada em
todo número não validado por playtest neste projeto (Tiers de Boss,
pesos de raridade). A estrutura (cada classe forte num tipo, fraca no
outro) é a decisão real; os números exatos calibram depois, sem
reescrever a arquitetura.

**Como evolui:** não evolui. `Classe_mult` é fixo para a vida do
personagem enquanto a Classe escolhida não mudar — não cresce com nível
(`Base(level)` já escala com nível; fazer `Classe_mult` também escalar
duplicaria o crescimento e agravaria o risco de power creep já registrado
na Sprint anterior). A única forma de mudar é resetar a Classe via Hero
Token (Etapa 8).

**Como influencia combate:** multiplica `Equipamento_ATQ(tipo)`
diretamente em `Dano_bruto(tipo)`, exatamente como já estrutural na
fórmula canônica — nenhuma mudança na fórmula em si, só um valor real no
lugar do placeholder `1`. Como cada personagem só pode ter uma arma
equipada por vez (um único slot de arma), na prática só o
`Classe_mult(tipo)` correspondente ao tipo da arma equipada entra em
jogo — o outro fica latente. Isso cria um incentivo natural (não uma
restrição rígida) para jogar "a favor do tipo": um Guerreiro empunhando
uma arma mágica (quando essa existir) simplesmente rende menos do que
empunhando uma física, sem nenhuma regra proibindo a escolha.

**Como influencia Boss:** exatamente da mesma forma — `BossCombatSystem`
(já implementado) hoje usa `Classe_mult = 1` fixo para todos; a única
mudança necessária (fora do escopo desta Sprint, puramente código) é
substituir esse valor fixo pelos valores reais da tabela acima, por
Classe do personagem presente. Nenhuma outra parte do Boss muda —
`08-boss-interface.md` já havia confirmado isso antes desta Sprint.

**Como influencia mundo:** não altera a fórmula de região (regiões
mudam valores de `Base`/`Resistência` temporariamente, nunca
`Classe_mult`) — mas dá um mecanismo numérico real à tabela já existente
em `07-regions-interface.md` ("classe favorecida por região"): um
Guerreiro (físico alto) naturalmente rende mais contra monstros com
`Resistência(físico)` baixa (Deserto de Vidro) e menos contra
`Resistência(físico)` alta (Minas Abandonadas) — a tabela qualitativa já
existente passa a ter um número real por trás, sem precisar ser
redesenhada.

---

## Etapa 8 — Hero Token, decisão definitiva

| Pergunta | Decisão |
|---|---|
| Quando é usado? | A qualquer momento após ser obtido (não expira, consistente com Bible cap. 10). Duas utilizações possíveis: (1) desbloquear a variante exclusiva de uma Classe; (2) resetar a Classe já escolhida de um personagem. |
| Quantos existem? | Um por indicação real — só é emitido quando a conta indicada atinge um limiar mínimo real de engajamento (ex.: nível ≥ 5, usando dados que já existem hoje — `level`/`total_minutes`). Isso fecha a lacuna de "referral falso ganhando valor de mercado" já registrada como risco em aberto: o controle de abuso acontece na **emissão**, não na circulação. |
| É raro? | Sim, por natureza — não é obtido por progressão normal (grind), é a única via de obtenção de Classe fora do padrão, exatamente como Bible cap. 4 já exigia. |
| Pode vender? | Sim, livremente, uma vez emitido — sem restrição adicional além do limiar de emissão acima. Consistente com "o mercado tem que estar fluindo" (Bible cap. 11). |
| Pode trocar? | Sim — mesma resposta de "pode vender", é um ativo de Marketplace como outro qualquer. |
| Pode destruir? | Sim — usá-lo (desbloquear variante exclusiva ou resetar Classe) o consome. Essa é sua função de sink de economia. |
| Pode criar Classe nova? | **Não uma classe mecanicamente nova.** A "classe exclusiva" do Hero Token é uma **variante cosmética/de prestígio** de um dos 4 arquétipos do MVP (ex.: "Guerreiro Ancestral") — mesmo comportamento e `Classe_mult`, identidade visual exclusiva. Isso resolve a exigência da Bible cap. 4 (Hero Token precisa de uma classe exclusiva) sem violar a decisão da Etapa 5 (não aumentar a quantidade de arquétipos mecânicos no MVP). Um quinto arquétipo mecânico real fica explicitamente para Season 2+, condicionado a dados reais de playtest — não decidido aqui. |
| Pode resetar? | Sim — gastar um Hero Token permite trocar a Classe escolhida de um personagem por outra das 4 (ou pela variante exclusiva, se já desbloqueada). Dá ao jogador uma saída para "escolhi errado" sem depender do Marketplace vender o personagem inteiro. |

---

## Etapa 9 — O que muda em outros sistemas

| Sistema | Muda? | Como |
|---|---|---|
| Economia | Sim | Hero Token ganha destino de sink totalmente definido (Etapa 8); nenhuma mudança em `DROP_CHANCE`, pesos de raridade, ou Gold. |
| Marketplace | Sim | Hero Token passa a ser um ativo negociável real, com regra de emissão anti-abuso definida; nenhuma outra mudança de Marketplace. |
| Progressão | Sim | Build passa a ser Classe (fixa até reset) + Equipamento — antes era só Equipamento. XP/Level/Gold/Drop continuam absolutamente inalterados. |
| World Design | Indiretamente | A tabela "classe favorecida por região" (`07-regions-interface.md`) ganha um mecanismo numérico real (`Classe_mult` vs. `Resistência` do monstro) — nenhuma região é redesenhada, nenhum novo traço mecânico é proposto. |
| Boss | Sim, futuramente (fora do escopo de código desta Sprint) | `Classe_mult` deixa de ser `1` fixo — é a única mudança. Nascimento, Participação, Recompensas, Escala e Ranking/MVP do capítulo 6 continuam **inteiramente intocados**. |

---

## Etapa 10 e 11 — ver documento dedicado

A análise completa de dependência documento-a-documento (o que precisa
alterar, o que não precisa, o que ficou obsoleto) e o diagrama de
dependência completo estão em
[class-dependency-map.md](class-dependency-map.md), conforme pedido
nesta Sprint.

---

## Etapa 12 — Auditoria final

**Pergunta:** depois desta Sprint, ainda existe alguma dúvida estrutural
sobre Classes?

**Resposta:** Não. As três perguntas que estavam formalmente em aberto em
`open-questions.md` (como uma classe é obtida além do Hero Token; classes
disponíveis desde o início ou desbloqueio progressivo; peso de Classe na
fórmula de dano de Boss) estão todas respondidas: os 4 arquétipos estão
disponíveis desde o início (nenhuma progressão de desbloqueio — a única
via não-padrão é o Hero Token, que dá uma **variante**, não uma classe
nova); o peso de Classe na fórmula é a tabela de `Classe_mult` da Etapa
7; e a via de obtenção "além do Hero Token" é a escolha normal, livre,
disponível a partir do momento em que o personagem existe.

**Classes = Arquitetura Fechada.**

Isso não significa "implementado" — significa que a próxima Sprint que
tocar Classes tem, pela primeira vez, documentação suficiente para
implementar sem precisar voltar ao design. Igual ao que já aconteceu com
Bosses antes do BossSystem: fechar o design é a condição para começar o
código, não o código em si.
