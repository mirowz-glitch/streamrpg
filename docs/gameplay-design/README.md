# Gameplay Design — Rascunhos (não-Bible)

**Status geral: 🟠 Rascunho de trabalho.** Nada aqui é decisão permanente.
Nada aqui altera a Game Design Bible (`docs/game-design-bible/`) —
Personagens (cap. 3) continua "Em discussão", Classes (cap. 4) continua
"Placeholder", Bosses (cap. 6) continua ✅ Estável e **não é reaberto por
nada aqui**. Nenhum código, nenhuma migration, nenhum arquivo TypeScript é
tocado por esta Sprint.

## Por que este diretório existe

O review de consolidação do World Design
(`docs/world-design/world-design-review.md`, seção 2 e seção 7, item 2)
encontrou a dependência mais séria de toda a biblioteca de mundo: **o
"traço mecânico" de cada região** (`docs/world-design/regions.md`) e a
fórmula de dano de Boss já fechada no capítulo 6 da Bible
(`Base × Equipamentos × Classe × Critical`, com a própria Bible marcando
"dependência ainda não modelada" para Equipamentos/Classe) pressupõem um
sistema de Personagem/Grupo/Build/Equipamento/Classe que **nunca foi
escrito em nenhum arquivo** — só existia em conversa. Este diretório é
esse sistema, finalmente registrado.

## Ordem emergente do projeto (não inventada, observada)

```
Engine → Gameplay → Economia → Boss → World → Gameplay Review → Gameplay Design (aqui)
```

Este documento nasce depois do World Design de propósito: ele responde
exatamente as lacunas que o review de World encontrou, em vez de
antecipar hipoteticamente o que o World precisaria.

## Índice

| Capítulo | Conteúdo |
|---|---|
| [01-characters-attributes.md](01-characters-attributes.md) | Personagem — atributos e como influenciam combate |
| [02-groups.md](02-groups.md) | Grupo/Equipe — como se forma, trindade opcional |
| [03-combat.md](03-combat.md) | Combate — uma única fórmula, dentro e fora de Boss |
| [04-builds.md](04-builds.md) | Build — o que faz uma build, por que nenhuma domina |
| [05-equipment.md](05-equipment.md) | Equipamentos — comportamento por slot, não só stat |
| [06-classes-skills.md](06-classes-skills.md) | Classes e Skills — Guerreiro vs. Druida e o resto |
| [07-regions-interface.md](07-regions-interface.md) | Como regiões (World) favorecem builds diferentes |
| [08-boss-interface.md](08-boss-interface.md) | Como Boss (Bible cap. 6) consome tudo isso |

## Regras que este diretório não pode violar

1. **Boss (capítulo 6 da Bible) não é reaberto.** MVP de Boss já decidiu:
   sem Skill Tree, sem Mana, sem cooldown de habilidade, sem Tank/Healer,
   sem aggro, sem posicionamento. Qualquer coisa aqui que pareça
   reintroduzir isso é **visão pós-MVP**, marcada como tal, nunca uma
   correção do que já foi fechado.
2. **Combate continua determinístico** (`Base × Equipamentos × Classe ×
   Critical`, sem RNG pesado além da pequena chance de crítico) — nenhuma
   proposta aqui adiciona uma segunda fonte de aleatoriedade forte.
3. **Nenhuma UI é decidida aqui** — isto é mundo/regra, não interface.
4. **Onde código real já existe e já resolve parte disto** (ver capítulo
   05), o documento cita o arquivo exato — não reinventa o que já foi
   escrito, só formaliza a lacuna entre o que existe e o que falta.
