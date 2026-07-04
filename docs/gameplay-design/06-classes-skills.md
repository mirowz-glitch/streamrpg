# 06. Classes e Skills

**Status: 🔵 Histórico.** Este era o rascunho de Classes — a arquitetura
final e fechada está em
[`docs/design/classes-final-architecture.md`](../design/classes-final-architecture.md)
(Sprint "Classes Architecture (Final Design)"), que incorpora
integralmente os 4 arquétipos e o "teste de identidade" definidos aqui.
Este documento permanece como registro do raciocínio original — não é
mais a fonte a consultar primeiro. Ver `docs/ARCHITECTURE_INDEX.md`.

Este capítulo respondia diretamente a "o que diferencia Guerreiro de
Druida?", a pergunta nomeada explicitamente na proposta original desta
Sprint.

**Revisado em Sprint 4 (fechamento Gameplay × Combat Model):** DEF foi
substituído por Resistência física/mágica na tabela abaixo; o passivo de
Guerreiro foi trocado (não usa mais UTI/crítico); a diferença entre
Druida e Xamã foi reexaminada e um problema real foi encontrado — ver
seção "Teste de identidade" no fim deste capítulo.

## Estado real hoje (fato)

Nenhuma classe existe. O único fio já puxado pela Bible (capítulo 4): o
Hero Token pode ser gasto numa "classe exclusiva" — implica que classes
precisam de pelo menos uma via de obtenção que não seja só progressão
normal. Este capítulo não resolve essa via de obtenção (é economia,
capítulo 10) — só desenha o que uma classe *é*, mecanicamente.

## Proposta: quatro arquétipos, não uma árvore de opções

Poucas classes, cada uma clara — evita a armadilha de "20 classes
levemente diferentes" que dilui identidade em vez de criar escolha real.

| Classe | ATQ | Res. Física | Res. Mágica | VEL | SUS | UTI | Identidade |
|---|---|---|---|---|---|---|---|
| **Guerreiro** | Alto | Média | Baixa | Baixo | Baixo | Baixo | Dano concentrado, direto, sem sutileza |
| **Druida** | Baixo | Baixa | Alta | Médio | Alto | Alto | Sustain e resistência a efeito ambiental (veneno, corrupção) |
| **Caçador** | Médio-alto | Baixa | Baixa | Alto | Baixo | Médio | Dano à distância, frágil, rápido |
| **Xamã** | Baixo | Baixa | Média | Médio | Alto | Alto | Baixo dano individual, alto valor de grupo |

`Res. Física`/`Res. Mágica` referem-se a `Resistência(físico)` e
`Resistência(mágico)`, definidos inteiramente em
`docs/combat-model/canonical-formula.md` — este capítulo só atribui um
nível qualitativo por classe, a matemática (percentual real) vive lá.

## O que diferencia Guerreiro de Druida (resposta direta)

Não é "quem causa mais dano" — os dois têm papéis diferentes por design,
e agora também perfis de resistência **opostos**, não só "médio para os
dois" como na versão anterior deste capítulo (quando existia um único
DEF): Guerreiro tem resistência física real e nenhuma resistência mágica;
Druida é o inverso exato.

- **Guerreiro** existe para regiões/encontros onde o desafio é dano bruto
  em tempo limitado (ex.: Boss antes do enrage/duração máxima expirar,
  capítulo 6 da Bible) — sua fraqueza é qualquer mecânica ambiental
  contínua (Veneno do Pântano, Corrupção do Deserto de Vidro), porque não
  tem SUS nem Resistência mágica para mitigar.
- **Druida** existe para regiões onde o desafio é resistir ao ambiente ao
  longo do tempo (Pântano Podre, Deserto de Vidro) — sua fraqueza é
  qualquer encontro que exija dano concentrado rápido (o Druida
  provavelmente não "vence" uma corrida contra o timer de fuga do Boss
  sozinho).

## Skills — deliberadamente mínimas no MVP

O capítulo 6 (Bosses) já exclui Skill Tree e Mana do MVP de Boss
explicitamente — por consistência, este capítulo propõe o mesmo limite
para expedições normais: **um único traço passivo fixo por classe**, sem
árvore, sem escolha de skill, sem cooldown de habilidade.

| Classe | Traço passivo (fixo, sem escolha) |
|---|---|
| Guerreiro | Nenhum passivo especial — identidade inteiramente carregada pelo ATQ mais alto do jogo. **Sprint 4:** a versão anterior ("bônus de crítico via UTI") foi removida — contradizia a decisão do capítulo 6/Combat Model de que Crítico é fixo e igual para todos. |
| Druida | Resistência a efeito de dano-contínuo ambiental (Veneno, Corrupção) |
| Caçador | Nunca sofre retaliação corpo-a-corpo (reforça identidade de Arco, capítulo 05) |
| Xamã | **Regra formal, não só flavor:** o SUS do Xamã cura o grupo inteiro por tick; o SUS da Druida cura só a si mesma. Esta é a diferença real entre as duas classes — ver "Teste de identidade" abaixo. |

Nenhuma dessas skills é escolhida pelo jogador — vem junto da classe,
sem decisão adicional. Skill Tree real (escolha de múltiplas skills por
personagem) é explicitamente **versão futura**, não MVP.

## Teste de identidade (Sprint 4, achado real)

Pergunta aplicada: *"Se eu esconder o nome da classe e mostrar apenas os
atributos, ainda consigo reconhecer qual classe é?"*

- **Guerreiro:** sim — ATQ isoladamente mais alto, único com Resistência
  física relevante, tudo o mais baixo. Perfil inconfundível.
- **Caçador:** sim — VEL isoladamente mais alto, ATQ segundo mais alto,
  resto baixo. Perfil inconfundível.
- **Druida vs. Xamã: não.** Depois de remover DEF e expressar os dois em
  Resistência física/mágica, os dois convergem quase completamente (ATQ
  baixo, Res. física baixa, VEL médio, SUS alto, UTI alto) — a única
  diferença numérica é Res. mágica (Alta vs. Média), uma distinção fraca
  demais para "reconhecer a classe só pelos números". **A identidade real
  entre as duas não está nos atributos — está no comportamento do SUS**
  (grupo vs. individual, ver tabela de Skills acima). Isso é reportado
  aqui como um achado honesto, não corrigido inflando a diferença
  numérica artificialmente: a regra comportamental já existia (a versão
  anterior deste capítulo já dizia "parte do SUS do Xamã beneficia o
  grupo"), só não estava formalizada como *a* diferença estrutural entre
  as duas classes. Agora está.

## Interface com regiões e Boss

Ver capítulo 07 (mapeamento Classe × Região) e capítulo 08 (como Boss usa
o multiplicador de Classe na fórmula de dano) deste diretório.

## Nota de honestidade

Quatro classes com um traço passivo fixo cada continua a proposta mais
enxuta possível. O teste de identidade acima expôs que "atributos
qualitativos + passivo" nem sempre é suficiente para diferenciar duas
classes com propósito parecido (sustain) — Druida e Xamã são o primeiro
caso real disso, não um caso hipotético. Multiplicadores numéricos
exatos continuam não propostos aqui de propósito — calibração exige
playtest, não design no papel.
