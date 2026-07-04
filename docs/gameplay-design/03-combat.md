# 03. Combate

**Status: 🟠 Rascunho.** Não é capítulo da Bible. O capítulo 6 (Bosses) da
Bible já fechou o modelo de combate para Boss — este capítulo não o
reabre, só responde a pergunta que ele deixou pendente para **todo o
resto do jogo**: existe um segundo modelo de combate para expedições
normais (fora de Boss), ou é o mesmo?

## Decisão proposta: uma única fórmula, sempre

```
Dano = Base × Equipamentos × Classe × Critical
```

A mesma fórmula já fechada no capítulo 6 (Bosses) — reaproveitada
integralmente para combate de expedição normal (regiões do World Design),
não uma segunda fórmula. **Nota (Sprint 4):** a forma completa e oficial
desta fórmula — incluindo tipo de dano (físico/mágico), Resistência,
Penetração e Bloqueio — vive em
`docs/combat-model/canonical-formula.md`. O que está escrito abaixo é só
a forma resumida original do capítulo 6; para qualquer cálculo real,
`canonical-formula.md` é a única fonte de verdade. Motivo: o próprio
projeto já tem uma regra
implícita nesta sessão inteira ("nenhum System novo deve replicar um bug
antigo só por consistência aparente", registrada no Technical Design de
Boss) — o espírito equivalente aqui é "nenhum sistema novo deveria
inventar uma segunda economia de combate só porque é um contexto
diferente". Um jogador não deveria sentir que luta "diferente" contra um
lobo do Bosque e contra o Boss do canal — a diferença deveria estar na
escala (HP, tier, contexto social), não na fórmula.

## O que muda entre combate de expedição e combate de Boss

| Aspecto | Expedição (este capítulo) | Boss (capítulo 6, já fechado) |
|---|---|---|
| Fórmula de dano por personagem | `Base × Equipamentos × Classe × Critical` | Igual |
| HP do alvo | Individual por monstro do encontro | Barra coletiva única do canal |
| Aggro | Não existe (nem aqui, nem lá) | Não existe no MVP |
| Habilidades do inimigo | Nenhuma prevista no MVP (monstros de expedição são mais simples que Boss) | 3 fixas (ataque normal, especial, ultimate por %) |
| Morte de personagem | Proposta: mesma regra do Boss — temporária, sem penalidade, revive ao fim do encontro | Já decidido: temporária, sem penalidade |
| Mecânica ambiental (veneno, gelo, etc.) | Sim — ver `docs/world-design/environmental-mechanics.md` | Não mencionada no capítulo 6 (Boss não ocorre "dentro" de uma região com traço ambiental próprio, é evento de canal) |

## Como mecânicas ambientais entram na fórmula

Proposta: mecânicas ambientais (capítulo 07 deste diretório) não criam um
quinto termo na fórmula — elas modificam os termos existentes
temporariamente durante a expedição. Exemplo: Veneno reduz `Base` ao
longo do tempo (dano contínuo separado do combate, não multiplicado por
Equipamentos/Classe); Gelo reduz a frequência de ação (afeta quantas vezes
a fórmula é aplicada por tick, via o atributo VEL do capítulo 01, não a
fórmula em si).

## Por que não existe posicionamento nem esquiva aqui também

O capítulo 6 já exclui posicionamento e esquiva do MVP de Boss
explicitamente. Por consistência com a decisão "uma única fórmula, um
único modelo de combate", este capítulo também não introduz
posicionamento/esquiva para expedições normais — seria estranho ter uma
regra em um contexto e não no outro sem motivo. Fica registrado como
possível versão futura, não decidido.

## Nota de honestidade

Esta é a proposta mais arquiteturalmente importante deste diretório —
"uma única fórmula para tudo" simplifica bastante, mas nunca foi testada
contra o caso onde expedição e Boss precisariam divergir por um motivo
real (ex.: se Boss um dia ganhar posicionamento e expedição não). Se isso
acontecer, a unificação proposta aqui precisa ser revisitada, não just
mantida por inércia.
