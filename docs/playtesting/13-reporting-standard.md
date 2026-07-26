# 13. Reporting Standard

O [Modelo de Consolidação](06-consolidation-template.md) é o documento de trabalho do analista — tabelas cruas, uma linha por achado, sem prosa. Este capítulo define a estrutura do **relatório final** de um ciclo: o documento narrativo que resume a Consolidação para quem vai decidir (o roadmap comercial, e quem lê `docs/reviews/`), na mesma linha dos relatórios de Sprint já escritos neste projeto.

**Diferença prática**: a Consolidação é preenchida durante a análise; o Relatório Final é escrito depois, a partir da Consolidação já pronta — nunca em paralelo, para não misturar registro com narrativa antes da hora.

## Estrutura fixa do Relatório Final de um ciclo

```
1. Resumo Executivo
2. Métricas
3. Problemas
4. Padrões
5. Elogios
6. Comparação
7. Roadmap
8. Conclusão
```

| Seção | Conteúdo | Fonte |
| --- | --- | --- |
| **1. Resumo Executivo** | 3-5 frases: quantos participantes, pergunta principal do ciclo, resposta direta (a Sprint de execução, ver [`docs/reviews/external-playtest-execution-phase-1.md`](../reviews/external-playtest-execution-phase-1.md), já define essa pergunta como "o comportamento de jogadores reais confirma as conclusões internas?") | Seções 1, 8 e 9 da Consolidação |
| **2. Métricas** | Tabela de métricas agregadas (mediana/mín/máx), com destaque só para tendências consistentes — nunca listar todo número bruto sem interpretação | Seção 2 da Consolidação |
| **3. Problemas** | Problemas recorrentes primeiro (ordenados por [Priority Matrix](10-priority-matrix.md)), depois isolados, cada um já classificado por categoria | Seções 3 e 4 da Consolidação |
| **4. Padrões** | Não duplica a Seção 3 — aqui entram padrões comportamentais mais amplos que uma lista de problemas não captura bem (ex: "a maioria hesitou nos primeiros 10 segundos, mas nenhum travou de fato") | Ficha de Observação de todas as sessões, lida em conjunto |
| **5. Elogios** | Elogios recorrentes (3+), separados por categoria (gameplay/narrativa/cidade/combate/interface/progressão) | Seção 4.1 da Consolidação |
| **6. Comparação** | Interno × Externo, seguindo [Cross Validation](12-cross-validation.md) — hipóteses confirmadas, refutadas, descobertas inéditas | Seção 7 da Consolidação + os 4 relatórios internos referenciados em Cross Validation |
| **7. Roadmap** | O que muda (ou não) em `project-valuation-roadmap.md`, com cada item citando explicitamente sua evidência de origem (ver [Rastreabilidade obrigatória](07-roadmap-integration.md#rastreabilidade-obrigatória-toda-sprint-originada-por-playtest)) | Resultado da aplicação de [Roadmap Integration](07-roadmap-integration.md) |
| **8. Conclusão** | Resposta final e direta à pergunta do ciclo, mais o maior risco restante identificado (mesmo formato do "Strategic Review" já usado em Sprints anteriores) | Síntese de tudo acima |

## Regras de escrita

- Cada afirmação no Relatório Final deve ser rastreável a uma linha específica da Consolidação — nunca uma conclusão nova aparecendo só no relatório sem uma linha correspondente no documento de trabalho.
- Nenhuma seção pode conter números ou participantes inventados para "completar" a estrutura — se uma seção não tem conteúdo real (ex: "Comparação" no Ciclo 1, que não tem ciclo externo anterior para comparar), ela deve dizer isso explicitamente, não ser preenchida com generalidades.
- O relatório vive em `docs/reviews/` (mesmo padrão dos relatórios de Sprint já existentes), nomeado por ciclo (ex: `external-playtest-cycle-1-report.md`), e sempre linka de volta para o documento de Consolidação bruto correspondente em `docs/playtesting/results/cycle-N/`.

Ver também: [Modelo de Consolidação](06-consolidation-template.md), [Cross Validation](12-cross-validation.md), [Roadmap Integration](07-roadmap-integration.md).
