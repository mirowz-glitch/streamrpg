# Cycle 1 — Ready State Checklist

Resposta operacional à pergunta: **assim que os ~10 [Session Logs](01-session-log-template.md) estiverem preenchidos, o que exatamente deve acontecer, passo a passo?** Nada nesta lista depende de redefinir metodologia — cada passo só aplica o que já existe em `docs/playtesting/`.

## Passo a passo

1. **Confirmar completude** — todos os ~10 [Session Logs](01-session-log-template.md) preenchidos por completo (métricas + ficha de observação + questionário íntegro, sem seções em branco não justificadas). Se algum participante não completou uma parte (ex: saiu antes do questionário), registrar isso explicitamente no log dele, não deixar em branco sem explicação.
2. **Preencher a [Consolidação](02-consolidation.md)** — seguindo [06-consolidation-template.md](../../06-consolidation-template.md), só depois que TODOS os logs estiverem prontos (nunca em paralelo às sessões, ver a mesma regra no capítulo 6).
3. **Classificar cada achado** — aplicar [Issue Classification](../../05-issue-classification-and-success-criteria.md) (categoria) e [Priority Matrix](../../10-priority-matrix.md) (impacto × frequência × confiança) a cada linha das seções "Padrões Recorrentes" e "Elogios Recorrentes" da Consolidação.
4. **Aplicar False Positive Prevention** — revisar cada achado de alto impacto contra [11-false-positive-prevention.md](../../11-false-positive-prevention.md) antes de considerá-lo confirmado.
5. **Rodar a Cross Validation** — comparar os padrões confirmados com os 4 relatórios de playtest interno já existentes, seguindo [12-cross-validation.md](../../12-cross-validation.md): o que foi confirmado, o que foi contrariado, o que é descoberta inédita.
6. **Aplicar Roadmap Integration** — para cada achado classificado como padrão de impacto alto, decidir (usando [07-roadmap-integration.md](../../07-roadmap-integration.md)) se vira Sprint, entra no backlog, é só registrado, ou é descartado — com a Rastreabilidade Obrigatória (evidência + nº de participantes + perfis) preenchida para cada decisão.
7. **Escrever o Relatório Final do ciclo** — seguindo a estrutura fixa de [13-reporting-standard.md](../../13-reporting-standard.md) (Resumo Executivo → Métricas → Problemas → Padrões → Elogios → Comparação → Roadmap → Conclusão), em `docs/reviews/external-playtest-cycle-1-report.md`.
8. **Atualizar `project-valuation-roadmap.md`** — só com os itens que passaram pelo Passo 6, cada um citando a evidência de origem.
9. **Arquivar o ciclo** — a Consolidação preenchida e os Session Logs permanecem em `docs/playtesting/results/cycle-1/` como registro permanente, servindo de base de comparação para o Ciclo 2 (ver Seção 7 do Modelo de Consolidação).

## O que NÃO fazer em nenhum passo acima

- Não pular da Ficha Individual (Passo 1) direto para uma decisão de Sprint (Passo 6) sem passar pela Consolidação, Classificação e Cross Validation — viola o [Data Flow](../../08-data-flow.md).
- Não tratar um achado de 1-2 participantes como padrão só porque "parece importante" — ver [Decision Thresholds](../../10-priority-matrix.md#decision-thresholds).
- Não reabrir investigações técnicas já encerradas (Combat Engine, Loot System, Progressão) a partir de um achado externo — reforçar, não reabrir (ver [Roadmap Integration](../../07-roadmap-integration.md)).
- Não escrever o Relatório Final (Passo 7) antes da Consolidação (Passo 2) estar completa.

## Status atual

**Nenhum passo acima foi iniciado** — os ~10 Session Logs ainda não existem (ver [00-recruitment.md](00-recruitment.md), nenhum participante confirmado ainda). Este checklist só passa a ser executado quando dados reais chegarem.
