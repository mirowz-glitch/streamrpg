# StreamRPG — Programa de Playtest Externo v1.0

Processo padronizado para convidar jogadores externos, observar seu comportamento, registrar métricas e transformar o feedback coletado em decisões concretas de roadmap. Nasceu da Sprint "External Playtest Program — Phase I" (2026-07-25), depois que as Sprints de Onboarding (Front Door Experience) e Retenção (Player Retention Loop) confirmaram que não existem mais bloqueios obrigatórios para começar a testar com pessoas de fora.

**Este documento não descreve o jogo** (isso é a [Game Design Bible](../game-design-bible/README.md) e a [Constituição do Mundo](../world-constitution/README.md)) — descreve **como testá-lo com pessoas reais**, de forma repetível entre ciclos.

## Filosofia em uma frase

> O objetivo do playtest não é provar que o jogo é bom. É descobrir onde ele ainda pode melhorar.

## Capítulos

| # | Capítulo | Conteúdo |
| --- | --- | --- |
| 1 | [Playtest Goals & Tester Profiles](01-goals-and-profiles.md) | Perguntas que cada sessão deve responder; perfis de participantes e prioridade de cada um |
| 2 | [Guia do Moderador](02-moderator-guide.md) | Protocolo completo: preparação, instruções, duração, encerramento, perguntas finais, ficha de observação |
| 3 | [Questionário do Participante](03-participant-questionnaire.md) | Formulário final pronto para uso — escalas 1-5 + perguntas abertas |
| 4 | [Métricas](04-metrics.md) | Todas as métricas objetivas coletadas manualmente e como registrá-las |
| 5 | [Issue Classification & Success Criteria](05-issue-classification-and-success-criteria.md) | Categorias de problema, priorização por impacto×frequência, critérios de referência para um ciclo bem-sucedido |
| 6 | [Modelo de Consolidação](06-consolidation-template.md) | Template para consolidar os ~10 participantes de um ciclo num único relatório |
| 7 | [Roadmap Integration](07-roadmap-integration.md) | Quando um achado vira Sprint, quando só é registrado, quando é descartado; rastreabilidade obrigatória |
| 8 | [Data Flow](08-data-flow.md) | Fluxo completo Participante → Ficha → Consolidação → Classificação → Roadmap → Sprint, sem etapas de julgamento informal |
| 9 | [Evidence Rules](09-evidence-rules.md) | Quando um comentário individual pode gerar ação, quando só é registrado, quando vira padrão |
| 10 | [Priority Matrix](10-priority-matrix.md) | Matriz impacto × frequência × confiança da evidência; heurísticas numéricas (1/3/5 participantes) |
| 11 | [False Positive Prevention](11-false-positive-prevention.md) | Como tratar opinião isolada, jogador muito experiente/iniciante, bug temporário de ambiente |
| 12 | [Cross Validation](12-cross-validation.md) | Como comparar playtests internos × externos; quando uma diferença é problema real, viés de perfil, ou ruído |
| 13 | [Reporting Standard](13-reporting-standard.md) | Estrutura fixa do relatório final de um ciclo (Resumo → Métricas → Problemas → Padrões → Elogios → Comparação → Roadmap → Conclusão) |

## Como rodar um ciclo, do início ao fim

1. Definir os ~10 participantes seguindo a composição recomendada em [Tester Profiles](01-goals-and-profiles.md#tester-profiles).
2. Rodar um piloto interno com alguém próximo, seguindo o [Guia do Moderador](02-moderator-guide.md#antes-de-tudo-piloto-interno) (não conta como participante oficial).
3. Rodar as sessões reais, uma por uma, sempre com o mesmo roteiro do [Guia do Moderador](02-moderator-guide.md), preenchendo a Ficha de Observação e as [Métricas](04-metrics.md) de cada uma, e aplicando o [Questionário](03-participant-questionnaire.md) ao final de cada sessão.
4. Depois da última sessão, preencher o [Modelo de Consolidação](06-consolidation-template.md) uma única vez, olhando as 10 sessões juntas (ver o [Data Flow](08-data-flow.md) completo).
5. Classificar cada achado (categoria + [Priority Matrix](10-priority-matrix.md)), filtrar falsos positivos ([11](11-false-positive-prevention.md)) e comparar com playtests internos ([Cross Validation](12-cross-validation.md)).
6. Aplicar o processo de [Roadmap Integration](07-roadmap-integration.md) para decidir o que vira Sprint, o que só é registrado, e o que é descartado — sempre com rastreabilidade (evidência + nº de participantes + perfis).
7. Escrever o Relatório Final seguindo o [Reporting Standard](13-reporting-standard.md) e atualizar o `commercial/roadmap/project-valuation-roadmap.md` com uma nova seção de ciclo (seguindo o padrão já estabelecido pelas seções "0.1" a "0.5").

## Onde ficam os dados de cada ciclo real

`docs/playtesting/results/cycle-N/` guarda os artefatos concretos de cada rodada real (recrutamento, um log de sessão por participante, consolidação preenchida, checklist de estado) — sempre derivados dos templates genéricos dos capítulos acima, nunca substituindo-os. Ver [`results/cycle-1/`](results/cycle-1/03-ready-state-checklist.md) para o primeiro ciclo (em andamento — preparação e metodologia de análise concluídas, execução real ainda pendente de sessões com participantes reais).

## Como isto se conecta ao resto do projeto

- [`docs/reviews/`](../reviews/) guarda os relatórios de Sprint de investigação (Gameplay Vertical Slice, First 10 Minutes, Front Door Experience, Player Retention Loop, e o relatório desta própria Sprint) — este diretório (`docs/playtesting/`) é o processo permanente que essas Sprints levaram à criação; ele continua existindo e sendo reutilizado a cada novo ciclo, enquanto os relatórios em `docs/reviews/` são um registro histórico de quando cada Sprint aconteceu.
- `commercial/roadmap/project-valuation-roadmap.md` é onde os resultados de cada ciclo se transformam em prioridade real de desenvolvimento — ver [Roadmap Integration](07-roadmap-integration.md).
- Nenhum achado de playtest pode contradizer a [Constituição do Mundo](../world-constitution/README.md) ou os princípios de arquitetura da [Game Design Bible](../game-design-bible/README.md) — um achado de playtest pode revelar que algo não está sendo comunicado bem, mas nunca justifica sozinho quebrar uma regra permanente dessas duas fontes.
