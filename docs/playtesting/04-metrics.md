# 4. Métricas

Todas as métricas abaixo são coletadas **manualmente pelo moderador**, com um cronômetro e observação direta da tela — esta Sprint não implementa nenhuma instrumentação/telemetria nova (proibido pelo brief: "NÃO IMPLEMENTAR novos sistemas", "NÃO ALTERAR nenhum sistema do Vertical Slice"). Toda métrica listada aqui já é visível na interface existente (relógio ⏱ da Aventura, nível, checkpoints, região no HUD) — o trabalho desta Sprint é só definir QUAIS observar e COMO registrar, não construir nada novo para observá-las.

Se uma rodada futura de playtests justificar telemetria automática (ex: volume grande demais pra cronometrar manualmente), isso vira uma proposta de Sprint própria — ver [Roadmap Integration](07-roadmap-integration.md).

---

## Métricas de tempo (cronometradas pelo moderador, relógio real — não o ⏱ interno da Aventura, que só começa quando a Aventura carrega)

| Métrica | Como coletar |
| --- | --- |
| Tempo até iniciar a Aventura | Cronômetro do moderador, do instante em que a Landing Page carrega até o primeiro carregamento de `/app/adventure` |
| Tempo até o primeiro nível (Nível 1 → 2) | Cronômetro do moderador, a partir da entrada em `/app/adventure` |
| Tempo até o primeiro Elite | Cronômetro do moderador, a partir da entrada em `/app/adventure` |
| Tempo até o primeiro item equipado | Cronômetro do moderador — cruzar com a reação do participante (Entusiasmo? Indiferença?) |
| Tempo até o primeiro objetivo concluído | Cronômetro do moderador |
| Duração total da sessão de jogo | Do início em `/app/adventure` até o encerramento (ver [critérios de encerramento](02-moderator-guide.md#momento-de-encerrar-a-sessão-de-jogo)) |

## Métricas de ponto de abandono / progresso alcançado

| Métrica | Como coletar |
| --- | --- |
| Ponto exato de abandono (se espontâneo) | Registrar tela, região, nível e o que estava acontecendo no momento em que o participante decidiu parar |
| Regiões alcançadas | Lista das regiões visitadas durante a sessão (nome + ordem), lida diretamente do HUD da Aventura |
| Nível alcançado ao final | Lido diretamente do HUD |
| Checkpoints de expedição alcançados | Lido diretamente do HUD ("Checkpoint X/35") |
| Chefe Final / Mini-Boss / Elite encontrados | Contagem simples de quantos de cada tipo apareceram durante a sessão |
| Morte(s) durante a sessão | Quantas vezes, em qual região, em qual nível — cruzar diretamente com o achado do Endgame Funnel Fix (ver [Player Retention Loop Sprint](../reviews/player-retention-loop-vertical-slice-phase-1.md)) |

## Métricas derivadas do questionário (ver [Parte A](03-participant-questionnaire.md#parte-a--escalas-1--discordo-totalmente-5--concordo-totalmente))

| Métrica | Como coletar |
| --- | --- |
| Clareza percebida (A1, A2, A7, A8) | Média das 4 escalas, por participante e agregada nos 10 |
| Diversão percebida (A3) | Escala direta |
| Dificuldade percebida como justa (A4) | Escala direta — cruzar com morte(s) registradas acima |
| Vontade de continuar (A5) | Escala direta — cruzar com duração real da sessão (alguém pode marcar 5 e ainda assim parar por motivo externo, ex: tempo disponível) |
| Vontade de retorno (A6) | Escala direta |

## Como registrar (ficha simples, uma linha por participante)

```
Participante: ____   Perfil: ____   Data: ____
Tempo até Aventura: ____   Tempo até Nível 2: ____   Tempo até 1º Elite: ____
Duração total: ____   Nível final: ____   Regiões visitadas: ____
Checkpoints: ____   Elites: ____   Mini-Bosses: ____   Chefes Finais: ____   Mortes: ____
Ponto de abandono (se espontâneo): ____
A1-A8 (escalas): ____
```

Uma linha preenchida por participante alimenta diretamente o [Modelo de Consolidação](06-consolidation-template.md), onde as 10 linhas são comparadas lado a lado.
