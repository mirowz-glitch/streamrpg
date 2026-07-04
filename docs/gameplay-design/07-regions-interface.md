# 07. Como Regiões favorecem Builds diferentes

**Status: 🟡 Complementar.** Não é capítulo da Bible, não é capítulo do
World Design — é a peça de conexão entre os dois. **Nota (Sprint
Canonical Architecture):** a visão oficial "qual classe brilha em qual
região" agora vive por-classe em
[`docs/design/classes-final-architecture.md`](../design/classes-final-architecture.md)
(Etapa 6). Este documento continua sendo a fonte por-região e o registro
de como as lacunas abaixo (arma mágica ausente, "dano em área" não
modelado) foram descobertas — útil como processo, não mais como a
tabela a consultar primeiro.

Este documento era a peça de conexão entre os dois, exatamente a lacuna
que o review de consolidação do World Design
(`docs/world-design/world-design-review.md`, seção 2) apontou como a
dependência mais séria da biblioteca: o "traço mecânico" de cada região
em `docs/world-design/regions.md` não tinha, até este documento, nenhum
sistema de atributo/classe real para se conectar.

**Revisado em Sprint 4:** a lacuna original desta tabela (Minas
Abandonadas exigindo dano mágico que não existia) foi resolvida
matematicamente pelo Combat Model — ver
`docs/combat-model/canonical-formula.md` e
`docs/combat-model/monsters-and-regions.md`. Ao revisar a tabela inteira
com o vocabulário correto do Combat Model (Resistência física/mágica,
UTI redefinido), duas outras células estavam usando "UTI" de forma
incorreta — corrigidas abaixo.

## Tabela de mapeamento (região × build favorecida)

| Região (World Design) | Traço mecânico (já registrado em regions.md) | Atributo/mecânica mais relevante | Classe mais favorecida |
|---|---|---|---|
| Bosque Sussurrante | Inimigos rápidos/arqueiros, pouca defesa própria | VEL, ATQ à distância | Caçador |
| Pântano Podre | Veneno contínuo, cura reduzida | SUS | Druida |
| Colinas Áridas | Táticas de flanco, favorece dano em área | Nenhum atributo atual modela "dano em área" — **lacuna nova, ver nota abaixo** | Guerreiro/Xamã combinados (hipótese, não confirmada pelos atributos) |
| Planície Dourada | Visão de longo alcance, região neutra | Nenhum em particular | Qualquer (região de descanso, não desafio) |
| Minas Abandonadas | Visão reduzida, Resistência física alta/mágica baixa dos inimigos | ATQ mágico — resolvido matematicamente (Combat Model), mas arma mágica ainda não existe no schema (ver capítulo 05) | Druida/Xamã, na teoria — não realizável em dados hoje |
| Litoral Quebrado | Maré alternando conteúdo | Nenhum atributo específico — desafio é de horário/timing, não de build | Qualquer |
| Picos Congelados | Lentidão ambiental | VEL (compensa a penalidade) | Caçador (VEL alto já nativo) |
| Deserto de Vidro | Corrupção contínua + Resistência mágica alta dos inimigos | SUS (sustenta contra Corrupção) + Resistência física (para dano contra os inimigos, não UTI) | Guerreiro/Caçador para dano, Druida/Xamã para sobreviver — grupo misto, ver `monsters-and-regions.md` |
| Ruínas Esquecidas | Magia, armadilhas, invocações | UTI (detecção de armadilha, resistência a atordoamento) — Resistência mágica é conceito separado, não parte de UTI | Xamã |
| Fortaleza Sombria | Combina múltiplos traços | Nenhum isolado — pune build hiperespecializada | Build equilibrada (nenhuma classe pura "vence" sozinha) |

## Lacunas encontradas ao construir esta tabela

**Original (Minas Abandonadas), resolvida matematicamente, ainda não em
dados:** Minas Abandonadas favorece "dano mágico contra defesa física
alta" — o Combat Model já modela tipo de dano (físico/mágico), mas a
arma mágica que tornaria isso jogável não existe no schema real
(`docs/gameplay-design/05-equipment.md` confirma). A região recomenda,
hoje, uma build que nenhum item do jogo pode montar.

**Nova (Colinas Áridas), encontrada nesta revisão:** o traço "favorece
dano em área" nunca teve, em nenhum dos dois diretórios, um atributo que
o represente — ATQ mede quantidade, não formato do dano (single-target
vs. área). Isso é diferente da lacuna de Minas: não é que falte um tipo
de arma, é que o modelo de atributos inteiro nunca definiu "alcance de
efeito" como algo mensurável. Registrado como lacuna real, não resolvida
nesta Sprint (fora do escopo de DEF/SUS/UTI).

## Por que Planície Dourada e Litoral Quebrado não têm build favorecida

Nem toda região precisa recompensar uma build específica — Planície
Dourada é deliberadamente a região "neutra" de descanso relativo (já
registrado em `regions.md`), e Litoral Quebrado desafia por **timing**
(maré), não por atributo de combate. Isso não é uma lacuna, é uma
diferença de propósito already registrada no World Design — vale deixar
explícito aqui para não ser confundido com uma tabela incompleta por
descuido.

## Nota de honestidade

Esta tabela é a primeira tentativa real de cruzar os dois sistemas — e já
encontrou uma lacuna genuína (dano físico vs. mágico) no primeiro capítulo
onde precisou ser aplicada a sério. Isso é o sinal exato que a Sprint
inteira previu: a dependência que o World Design tinha com o Gameplay era
real, não hipotética, e só aparece quando se tenta de fato construir a
ponte, não antes.

**Adendo Sprint 4:** revisitar a tabela inteira (não só Minas Abandonadas)
depois de fechar DEF/SUS/UTI encontrou mais duas coisas — uma correção de
uso incorreto de UTI (Deserto de Vidro e Ruínas Esquecidas citavam
"resistência mágica" como se fosse parte de UTI; não é, é Resistência,
conceito do Combat Model) e uma lacuna nova (Colinas Áridas não tem
nenhum atributo que represente "dano em área"). Isso reforça o padrão:
toda vez que esta tabela é revisitada a sério, aparece algo novo — vale
tratá-la como uma peça viva, não uma auditoria única e definitiva.
