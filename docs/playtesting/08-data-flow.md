# 8. Data Flow

O fluxo completo de um ciclo de playtest, do primeiro clique de um participante até uma linha no roadmap comercial. Cada seta abaixo é uma transição documentada em um capítulo específico — nenhuma etapa depende de julgamento informal não registrado em algum lugar.

```
Participante
   │  (joga a sessão seguindo o Guia do Moderador)
   ▼
Ficha Individual                    → 02-moderator-guide.md (protocolo + observação)
   │                                  03-participant-questionnaire.md (questionário)
   │                                  04-metrics.md (métricas)
   │                                  results/cycle-N/0X-session-log-*.md (registro concreto)
   │  (registro cru, um arquivo por participante — nenhuma interpretação ainda)
   ▼
Consolidação                        → 06-consolidation-template.md
   │  (agrupar as ~10 fichas: padrões recorrentes, problemas isolados,
   │   elogios recorrentes, sugestões, divergências, métricas agregadas)
   ▼
Classificação                       → 05-issue-classification-and-success-criteria.md (categoria)
   │                                  10-priority-matrix.md (impacto × frequência × confiança)
   │                                  11-false-positive-prevention.md (filtro antes de decidir)
   │  (cada padrão recorrente recebe categoria + posição na matriz)
   ▼
Roadmap                             → 07-roadmap-integration.md
   │  (decidir: vira Sprint / entra no backlog / só é registrado / é descartado)
   ▼
Sprint
   (só achados que passaram por todas as etapas acima chegam aqui —
    nunca uma opinião isolada pulando direto de "Participante" para "Sprint")
```

## Por que cada etapa existe (o que ela impede)

| Etapa | O que ela impede se for pulada |
| --- | --- |
| Ficha Individual | Perder o registro bruto — sem ela, a Consolidação vira memória/opinião do moderador, não dado |
| Consolidação | Confundir uma reação isolada com uma tendência — sem agrupar as ~10 fichas lado a lado, cada comentário parece igualmente importante |
| Classificação | Misturar categorias diferentes (ex: tratar um bug como se fosse balanceamento) e atacar o problema errado |
| Roadmap Integration | Abrir uma Sprint a partir de uma opinião simpática, mas isolada — o próprio Princípio Fundamental desta metodologia |

## Regra de não-interpretação em trânsito

Cada seta do diagrama move o dado para uma etapa mais analítica que a anterior — mas a interpretação (decidir o que um achado *significa*) só acontece nas etapas de Classificação e Roadmap, nunca antes. Um moderador preenchendo uma Ficha Individual não deve classificar ("isso é um bug") nem julgar prioridade ("isso é urgente") — só registrar o que aconteceu. Ver [Guia do Moderador](02-moderator-guide.md#disciplina-de-registro) e o Princípio Fundamental desta Sprint: "Nenhuma conclusão poderá existir antes dos dados."

Ver também: [Evidence Rules](09-evidence-rules.md), [Ready State Checklist do Ciclo 1](results/cycle-1/03-ready-state-checklist.md).
