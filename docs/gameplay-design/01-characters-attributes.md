# 01. Personagem — Atributos

**Status: 🟠 Rascunho.** Não é capítulo da Bible. Responde diretamente à
"dependência ainda não modelada" que o próprio capítulo 6 (Bosses) da
Bible já registrava: a fórmula `Base × Equipamentos × Classe × Critical`
não tinha, até agora, nenhum documento definindo o que "Equipamentos" e
"Classe" significam numericamente.

**Revisado em Sprint 4 (fechamento Gameplay × Combat Model):** DEF foi
removido deste capítulo — ver `docs/reviews/gameplay-combat-final-review.md`
para o histórico da decisão. Resistência (física/mágica) é definida
inteiramente em `docs/combat-model/canonical-formula.md`, não aqui. SUS e
UTI ganharam papel matemático real, também detalhado no Combat Model —
este capítulo só define o que cada atributo *representa*, a matemática
final vive lá.

## Estado real hoje (fato, não hipótese)

Um `Character` tem `level`, `xp`, `gold`, `total_minutes` (capítulo 3 da
Bible). Nenhum atributo além de `level` existe. `packages/shared/src/items.ts`
já contém um modelo numérico de poder de item (`getItemPower()`,
`RARITY_BASE`, `SLOT_DEFENSE_WEIGHT`) — mas é **usado só no frontend**,
para o badge de comparação "▲ Melhor / ▼ Pior" do Inventário
(`apps/web/src/pages/InventoryPage.tsx`), nunca chamado por nenhum System
de combate. Este capítulo assume esse código como ponto de partida real,
não como proposta nova.

## Proposta: quatro atributos derivados, não alocados manualmente

Evitar um sistema de "pontos de atributo" que o jogador aloca — isso
exigiria uma decisão ativa e frequente, incompatível com o jogo sendo
majoritariamente assistido, não jogado. Todo atributo é **derivado** de
`level + Equipamento + Classe`, nunca alocado ponto a ponto:

- **Poder de Ataque (ATQ):** dano bruto causado. Já parcialmente modelado
  em `getItemPower()` (campo `attack`). No Combat Model, ATQ se divide por
  tipo (`físico`/`mágico`) conforme a arma equipada — este capítulo trata
  ATQ como conceito único; a matemática por tipo vive só no Combat Model.
- ~~**Resistência (DEF)**~~ — **removido.** Ver seção "O que aconteceu com
  DEF" abaixo.
- **Velocidade de Ação (VEL):** frequência de ação por tick de combate.
  Não existe hoje em nenhum lugar — resolve a ambiguidade que o World
  Design já registrou ("botas... pode significar age mais vezes por
  combate, ou velocidade de avanço no mapa"). VEL afeta só frequência de
  ação em combate; velocidade de avanço no mapa é um conceito separado,
  de exploração, não de combate.
- **Sustentação (SUS):** regeneração de HP por tick de combate, reduzida
  ou anulada por mecânicas ambientais de dano contínuo (Veneno, Corrupção).
  Fórmula completa e sistemas consumidores em
  `docs/combat-model/canonical-formula.md`, seção "Sustentação (SUS)".
- **Utilidade (UTI):** checagem determinística (não probabilística) contra
  o valor de perigo ambiental de uma região (controle/atordoamento,
  detecção de armadilha). Escopo reduzido em relação à proposta original
  — não afeta mais Crítico (ver seção "O que aconteceu com UTI" abaixo).
  Fórmula completa em `docs/combat-model/canonical-formula.md`.

## O que aconteceu com DEF

**Decisão: DEF desaparece completamente.** Não é um nome antigo mantido
por compatibilidade, não é convertido automaticamente — deixa de existir
como conceito neste capítulo. A intenção original de DEF ("dano recebido
reduzido") continua válida, mas passou a ser expressa exclusivamente por
`Resistência(físico)` e `Resistência(mágico)` — dois valores percentuais
independentes, definidos e calculados inteiramente em
`docs/combat-model/canonical-formula.md`. Motivo da escolha: DEF era um
valor único, sem tipo; a resolução da contradição de Minas Abandonadas
(capítulo 07) exigia exatamente separar isso em dois — manter DEF como
um terceiro conceito paralelo recriaria a duplicação que esta Sprint
existe para eliminar. Não existem mais dois modelos de mitigação de dano
neste diretório — só um, e ele vive no Combat Model.

## O que aconteceu com UTI

UTI deixa de cobrir "chance de crítico adicional" — essa promessa
(existente na versão anterior deste capítulo e em
`docs/gameplay-design/06-classes-skills.md`) contradizia diretamente a
decisão já fechada no capítulo 6 da Bible e reafirmada no Combat Model:
Crítico é uma chance pequena e fixa, igual para todos, nunca modificada
por atributo. UTI mantém as outras duas funções (resistência a controle,
detecção de armadilha) porque as duas têm um gancho mecânico real e já
documentado (Armadilhas e Escuridão, `docs/world-design/environmental-mechanics.md`)
— e passam a ser checagens determinísticas de limiar, não chances.

## Como cada atributo é calculado (referência; matemática oficial no Combat Model)

```
ATQ(tipo) = Equipamento_ATQ(tipo) × Classe_mult(tipo)   [ver Combat Model]
VEL = 1 (baseline) + Classe.vel_bonus + Ambiente.vel_modifier (ex.: Gelo)
SUS = Classe.sus_bonus                                   [ver Combat Model]
UTI = Equipamento.uti_bonus + Classe.uti_bonus           [ver Combat Model]
```

`Base(level)` continua existindo (o `level` do Character) e entra na
fórmula de dano diretamente no Combat Model, não como parte de um
atributo próprio.

## Como isso alimenta a fórmula de dano do capítulo 6

A fórmula oficial completa vive em
`docs/combat-model/canonical-formula.md` — este capítulo não repete mais
uma versão própria dela, para não criar uma segunda fonte de verdade
(era exatamente esse tipo de divergência silenciosa que causou a
contradição DEF/Resistência corrigida nesta Sprint).

## Nota de honestidade

VEL e SUS continuam propostas inteiramente novas, sem nenhum precedente
em código. UTI, mesmo com escopo reduzido, ainda não tem calibração
numérica real (o que conta como "limiar" de controle/detecção por
região é hipótese, não dado de playtest).
