# Combat Model — Rascunhos (não-Bible)

**Status geral: 🟠 Rascunho de trabalho.** Não é capítulo da Bible. Não
altera Boss (capítulo 6, ✅ Estável), não altera nenhum arquivo de
`docs/gameplay-design/` ou `docs/world-design/`, não implementa nada.

## Por que este diretório existe

O capítulo 07 de Gameplay Design
(`docs/gameplay-design/07-regions-interface.md`) encontrou uma
contradição real, não hipotética, ao tentar cruzar região com build pela
primeira vez: Minas Abandonadas foi desenhada (World Design) com
identidade "dano mágico bom, dano físico ruim contra os inimigos", mas o
sistema de atributos de Gameplay Design (capítulo 01) só modela
**quantidade** de dano (ATQ), nunca **tipo** (físico vs. mágico). Ou seja:
o World Design descreve um comportamento que a matemática de combate
ainda não consegue produzir. Isso é uma contradição estrutural, não uma
falta de detalhe — o elo que faltava entre Gameplay Design e World Design
é justamente uma matemática de combate explícita.

## Posição na ordem do projeto

```
Engine → Gameplay Design → Combat Model (aqui) → World Design → Boss
```

Este diretório existe para responder uma única pergunta central: **como o
jogo transforma atributos em combate?** — e produzir, ao final, uma
fórmula canônica única, capaz de expressar tudo que Gameplay Design e
World Design já assumiram que existe (dano físico/mágico, resistência,
crítico, bloqueio) sem inventar uma segunda economia de combate paralela
à que o capítulo 6 (Bosses) já fechou.

## Índice

| Documento | Conteúdo |
|---|---|
| [canonical-formula.md](canonical-formula.md) | A fórmula canônica — físico, mágico, resistência, penetração, crítico, bloqueio, e por que precisão/evasão não existem |
| [monsters-and-regions.md](monsters-and-regions.md) | Como monstros e regiões usam o modelo — resolve a contradição de Minas Abandonadas |

## Regras que este diretório não pode violar

1. **Boss (capítulo 6) não é reaberto.** A fórmula `Base × Equipamentos ×
   Classe × Critical` já decidida lá é o ponto de partida, não algo a
   substituir — este diretório a **estende**, detalhando o que
   "Equipamentos" e "Classe" significam, sem mudar sua forma.
2. **Combate continua determinístico.** "Sem RNG exagerado — o jogador
   precisa sentir que ficou mais forte porque evoluiu, não porque teve
   sorte" (capítulo 6) é o critério de aceite de qualquer mecânica nova
   proposta aqui.
3. **Uma única fórmula para tudo** (já decidido em
   `docs/gameplay-design/03-combat.md`) — Boss e expedição normal usam o
   mesmo modelo, só a escala (HP coletivo vs. individual) muda.
4. **Nenhum arquivo existente é alterado** — onde este diretório resolve
   uma lacuna de Gameplay Design ou World Design, ele registra a
   resolução aqui, sem editar os documentos originais.
