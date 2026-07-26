# 6. Modelo de Consolidação (Modelo de Relatório)

Template único para consolidar os resultados dos ~10 participantes de um ciclo de playtest, depois que todas as sessões individuais (Ficha de Observação + Questionário + Métricas de cada uma) já foram registradas. Preencher isto só depois da última sessão do ciclo — nunca em paralelo às sessões, pra não deixar a primeira impressão de um participante contaminar a observação do próximo.

Copiar este template para um novo arquivo por ciclo (ex: `docs/playtesting/results/2026-08-ciclo-1.md`) — este capítulo é o molde, não o registro em si.

---

## 1. Sumário do Ciclo

- Datas de início/fim do ciclo:
- Número de participantes:
- Composição por perfil (ver [Tester Profiles](01-goals-and-profiles.md)):
- Versão/branch do jogo testada:

## 2. Métricas Agregadas

Preencher com base nas fichas individuais (ver [Métricas](04-metrics.md)) — usar mediana, não média, para tempos (menos sensível a um outlier que trava ou que já conhece o jogo).

| Métrica | Mediana | Mín | Máx | Nº que não atingiu* |
| --- | --- | --- | --- | --- |
| Tempo até iniciar a Aventura | | | | |
| Tempo até Nível 2 | | | | |
| Tempo até 1º Elite | | | | |
| Duração total da sessão | | | | |
| Nível final alcançado | | | | — (sem limite natural, não aplicável) |
| Nº de mortes | | | | |
| Regiões alcançadas (mais comum) | | | | — (não aplicável) |

*"Nº que não atingiu" só se aplica a métricas com um limite claro de sucesso dentro da sessão (ex: "não chegou a iniciar a Aventura", "não chegou ao Nível 2"). Para métricas puramente descritivas (nível final, regiões alcançadas), marcar "não aplicável" em vez de deixar em branco — evita ambiguidade entre "não preenchido" e "não se aplica".

## 3. Padrões Recorrentes (observados em 3+ dos 10 participantes)

Só entra aqui o que se repetiu em **múltiplos** participantes — um comentário isolado, por mais interessante que seja, vai na seção 4, não aqui. Esta é a seção mais importante do documento: é o que efetivamente deve influenciar decisões (ver [Priority Matrix](10-priority-matrix.md) e [Roadmap Integration](07-roadmap-integration.md)).

| Padrão observado | Nº de participantes | Categoria (ver [Issue Classification](05-issue-classification-and-success-criteria.md)) | Impacto | Confiança da evidência (ver [Priority Matrix](10-priority-matrix.md)) |
| --- | --- | --- | --- | --- |
| | | | | |

## 4. Problemas Isolados (observados em 1-2 participantes)

Registrar mesmo assim — um problema isolado hoje pode virar recorrente no próximo ciclo, e o histórico importa. Mas nenhuma ação de Sprint nasce só daqui (ver [Success Criteria](05-issue-classification-and-success-criteria.md#priorização-por-impacto--frequência)).

| Observação | Participante(s) | Categoria | Notas |
| --- | --- | --- | --- |
| | | | |

## 4.1 Elogios Recorrentes (observados em 3+ dos 10 participantes)

Mesmo critério de recorrência da Seção 3, mas para sinais positivos — o que gerou boa percepção espontânea (entusiasmo registrado na Ficha de Observação, respostas positivas em B1/B4/B5 do [Questionário](03-participant-questionnaire.md)). Tão importante quanto os padrões negativos: protege elementos que já funcionam de serem alterados sem necessidade em Sprints futuras.

| Elemento elogiado | Categoria | Nº de participantes | Notas |
| --- | --- | --- | --- |
| | Gameplay / Narrativa / Cidade / Combate / Interface / Progressão | | |

## 5. Sugestões dos Participantes

Sugestões de feature/conteúdo ditas pelos participantes (Parte B/C do [Questionário](03-participant-questionnaire.md)) entram aqui, separadas de bugs/UX — são hipóteses de design, não defeitos observados. Nunca implementadas diretamente a partir de uma única sugestão (ver Princípios Obrigatórios da Sprint: "separar claramente bugs, UX, Game Design e sugestões pessoais").

| Sugestão | Participante(s) | Já existe no roadmap? |
| --- | --- | --- |

## 6. Divergências

Quando participantes de perfis diferentes reagiram de forma oposta ao mesmo momento (ex: um jogador de ARPG achou a dificuldade "justa", um casual achou "injusta", ambos no mesmo trecho). Divergências por perfil são informação, não ruído — indicam que uma solução única pode não servir para todos os públicos-alvo.

| Momento | Reação do Perfil A | Reação do Perfil B | Implicação |
| --- | --- | --- | --- |

## 7. Comparação com o Ciclo Anterior (se houver)

Preencher só a partir do 2º ciclo em diante. Um padrão que aparecia no ciclo anterior e sumiu (porque foi corrigido) deve ser destacado como validação de que a correção funcionou — não só problemas novos merecem registro.

| Padrão do ciclo anterior | Status neste ciclo |
| --- | --- |

## 8. Critérios de Sucesso — Resultado

Revisitar cada item de [Success Criteria](05-issue-classification-and-success-criteria.md#success-criteria) e marcar objetivamente se a maioria dos participantes atingiu:

- [ ] Maioria encontrou/iniciou a Aventura sem ajuda.
- [ ] Maioria completou pelo menos uma expedição/checkpoint significativo.
- [ ] Maioria relatou vontade de continuar (A5) ou retornar (A6).
- [ ] Maioria entendeu loot rejeitado (A7) e necessidade de login (A8) sem perguntar.
- [ ] Nenhum participante travou nas etapas de onboarding já resolvidas.

## 9. Recomendação Final deste Ciclo

Um parágrafo objetivo: dado tudo acima, o que este ciclo especificamente recomenda para o roadmap? (Ver [Roadmap Integration](07-roadmap-integration.md) para o processo formal de decisão.)
