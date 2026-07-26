# External Playtest Analysis — Cycle 1 (Ready State)

**Data**: 2026-07-25
**Tipo de Sprint**: revisão documental e endurecimento de metodologia de análise — nenhum playtest executado, nenhum dado sintético produzido, nenhum código de produção alterado.

---

## 1. Revisão da Estrutura

Revisão de `docs/playtesting/` e `docs/playtesting/results/cycle-1/` contra os critérios pedidos (consistência, completude, reutilização, clareza). Ambiguidades encontradas e corrigidas — só documentação, nenhuma mudança de metodologia:

| Ambiguidade encontrada | Correção |
| --- | --- |
| O [Modelo de Consolidação](../playtesting/06-consolidation-template.md) tinha seção para "Padrões Recorrentes" (problemas) mas nenhuma seção equivalente para elogios/sinais positivos recorrentes — mesmo a Sprint anterior já pedindo "Elogios Recorrentes" como item de Entrega | Adicionada a Seção 4.1 "Elogios Recorrentes" ao template mestre e à cópia do Ciclo 1, com as mesmas categorias já usadas em Sprints anteriores (gameplay/narrativa/cidade/combate/interface/progressão) |
| A coluna "Nº que não atingiu" na tabela de Métricas Agregadas não fazia sentido para métricas puramente descritivas (ex: "Nível final alcançado", "Regiões alcançadas") | Adicionada nota explícita: marcar "não aplicável" nesses casos, em vez de deixar em branco (ambíguo entre "não preenchido" e "não se aplica") |
| A [Ficha de Sessão do Ciclo 1](../playtesting/results/cycle-1/01-session-log-template.md) pedia tempos sem especificar unidade nem qual relógio (o real do moderador ou o ⏱ interno da Aventura, que são diferentes e já causaram confusão em Sprints anteriores) | Adicionado formato explícito (mm:ss) e a distinção "relógio real do moderador, não o ⏱ interno", com link direto para a definição em [04-metrics.md](../playtesting/04-metrics.md) |
| A [Matriz de Priorização](../playtesting/05-issue-classification-and-success-criteria.md) original era só 2D (impacto × frequência) — insuficiente para achados onde a confiança na evidência em si é questionável | Mantida como está (não é um erro, é a versão simples) e complementada com a versão 3D em [10-priority-matrix.md](../playtesting/10-priority-matrix.md), com referência cruzada entre as duas |

Nenhuma mudança foi feita nos capítulos 1-7 além dessas correções pontuais e da adição de referências cruzadas para os novos capítulos — a metodologia já validada permanece a fonte oficial, conforme exigido.

## 2. Fluxo Oficial

Documentado em [`docs/playtesting/08-data-flow.md`](../playtesting/08-data-flow.md):

```
Participante → Ficha Individual → Consolidação → Classificação → Roadmap → Sprint
```

Cada seta aponta para o(s) capítulo(s) que a documentam, e o capítulo explica explicitamente o que cada etapa impede se for pulada (ex: pular direto de "Participante" para "Sprint" é exatamente o padrão que esta metodologia existe para proibir). Nenhuma etapa depende de julgamento informal não registrado em algum documento.

## 3. Matriz de Priorização

Documentada em [`docs/playtesting/10-priority-matrix.md`](../playtesting/10-priority-matrix.md) — três dimensões (Impacto: Alto/Baixo; Frequência: Baixa 1-2/Média 3-4/Alta 5+; Confiança da Evidência: Alta/Média/Baixa, com critério explícito para cada nível), uma tabela de decisão cruzando as três, e os limiares numéricos pedidos (1 participante → registrar; 3-4 → investigar; 5+ → prioridade alta), explicitamente rotulados como heurísticas iniciais revisáveis, não regras fixas.

## 4. Regras de Evidência

Documentadas em [`docs/playtesting/09-evidence-rules.md`](../playtesting/09-evidence-rules.md): quando um comentário individual pode gerar ação (só 2 casos — bug reprodutível ou violação de Success Criteria já formal, e mesmo assim a ação é "registrar para verificação", nunca "corrigir na hora"), quando deve só ser registrado, e a regra de equivalência para reconhecer quando vários relatos com palavras diferentes representam o mesmo achado. Complementadas por [`11-false-positive-prevention.md`](../playtesting/11-false-positive-prevention.md) (opinião isolada, jogador muito experiente, jogador iniciante, bug temporário — com tratamento específico para cada) e [`12-cross-validation.md`](../playtesting/12-cross-validation.md) (como interpretar diferenças entre playtests internos e externos, incluindo qual fonte é mais confiável para qual categoria de achado).

## 5. Checklist do Ciclo 1

[`docs/playtesting/results/cycle-1/03-ready-state-checklist.md`](../playtesting/results/cycle-1/03-ready-state-checklist.md) — 9 passos operacionais, do momento em que os ~10 Session Logs estiverem completos até o arquivamento do ciclo, cada um apontando para o capítulo exato da metodologia a aplicar, mais uma lista explícita do que NÃO fazer (pular etapas do Data Flow, tratar 1-2 relatos como padrão, reabrir investigações técnicas encerradas). Status atual registrado explicitamente: nenhum passo foi iniciado, porque nenhum participante real foi confirmado ainda.

## 6. Commercial Impact

**Como este processo reduz o risco de investir tempo e recursos em funcionalidades baseadas em impressões isoladas em vez de comportamento observado?**

Antes desta Sprint, a metodologia já impedia decisões a partir de 1-2 comentários soltos (regra dos "3+" para virar padrão). O que faltava era rigor nas zonas cinzentas — exatamente onde decisões caras de verdade costumam ser tomadas por impulso:

- **Sem uma dimensão de confiança da evidência**, um achado reportado por 5 participantes do mesmo perfil (ex: 5 jogadores de ARPG, todos com o mesmo viés) poderia parecer tão forte quanto um achado confirmado por 5 participantes de perfis diferentes — a Priority Matrix agora distingue os dois casos explicitamente, evitando que o projeto reaja fortemente a um viés de amostra disfarçado de consenso.
- **Sem regras de falso-positivo**, a opinião de um único jogador muito experiente ("isso está fácil demais") poderia levar a uma decisão de rebalanceamento que na verdade prejudicaria os perfis casuais/iniciantes prioritários — agora há um tratamento explícito para exatamente esse cenário antes de qualquer ação.
- **Sem rastreabilidade obrigatória** no Roadmap Integration, uma Sprint futura poderia ser justificada com uma frase vaga ("os jogadores acharam confuso") sem ninguém conseguir verificar quantos jogadores, quais perfis, ou onde está o dado — isso agora é estruturalmente impossível: toda entrada de roadmap originada por playtest deve citar evidência específica, número e perfis.
- **Sem um padrão de relatório fixo**, cada ciclo poderia ser resumido de forma diferente, dificultando comparar o Ciclo 2 com o Ciclo 1 — o Reporting Standard fixa a mesma estrutura para todo ciclo futuro.

Em suma: o custo de uma decisão errada em um projeto que já está se movendo em direção a Steam/publishers não é só o tempo da Sprint mal-direcionada — é o precedente de que decisões de produto podem nascer de impressão em vez de evidência. Este endurecimento da metodologia é o que torna essa garantia verificável, não apenas prometida.

## 7. Roadmap

Atualizado com uma nota de status (seção "0.5") em `commercial/roadmap/project-valuation-roadmap.md` — **nenhum item da Seção 1 foi reordenado ou criado**, porque a metodologia revisada nesta Sprint diz respeito ao *processo de análise*, não a evidência nova de jogo. O único ajuste de conteúdo real fora de `docs/playtesting/` foi a correção do gap de "Elogios Recorrentes" no Modelo de Consolidação, já registrada na Seção 1 deste relatório.

---

## Critérios de Aprovação — checklist final

- [x] Toda metodologia está consistente (gaps de "Elogios Recorrentes" e ambiguidades de unidade/coluna corrigidos).
- [x] Não existem ambiguidades conhecidas remanescentes na documentação revisada.
- [x] Existe um fluxo completo desde a coleta até o roadmap ([Data Flow](../playtesting/08-data-flow.md)).
- [x] Nenhuma etapa depende de julgamento informal não documentado.
- [x] O projeto está pronto para receber dados reais imediatamente — ver [Ready State Checklist](../playtesting/results/cycle-1/03-ready-state-checklist.md).
