# 10. Priority Matrix & Decision Thresholds

Extensão da matriz 2D (impacto × frequência) já definida em [Issue Classification](05-issue-classification-and-success-criteria.md#priorização-por-impacto--frequência) — usada quando a confiança na própria evidência não é óbvia (perfil muito específico reportando, suspeita de fator externo, achado baseado só em opinião auto-relatada em vez de comportamento observado).

## As três dimensões

| Dimensão | Valores | Definição |
| --- | --- | --- |
| **Impacto** | Alto / Baixo | Alto = quebra a sessão, causa abandono, ou reprova um [Success Criteria](05-issue-classification-and-success-criteria.md#success-criteria). Baixo = incômodo pontual que não muda o resultado da sessão. |
| **Frequência** | Baixa (1-2) / Média (3-4) / Alta (5+) | Quantos dos ~10 participantes, usando a [Regra de Equivalência](09-evidence-rules.md#quando-vários-relatos-passam-a-representar-um-padrão) (mesmo achado, palavras diferentes contam igual). |
| **Confiança da Evidência** | Alta / Média / Baixa | Ver critério abaixo — não é sobre quantos relataram, é sobre o quanto dá para confiar no que foi relatado. |

## Critério de Confiança da Evidência

| Nível | Quando se aplica |
| --- | --- |
| **Alta** | O moderador observou o comportamento diretamente (não é só o participante dizendo — é o que ele fez, registrado na Ficha de Observação), e/ou o mesmo achado apareceu em perfis diferentes entre si, e/ou não há suspeita de fator externo. |
| **Média** | Vem de auto-relato (questionário/fala do participante) sem observação direta correspondente, ou apareceu só em participantes de perfil semelhante entre si (não testa se generaliza). |
| **Baixa** | Vem de um único perfil muito específico ([False Positive Prevention](11-false-positive-prevention.md)), ou há suspeita concreta de fator externo (bug de ambiente, conexão, cansaço do participante) confundindo a observação. |

## Matriz de Decisão

| Impacto | Frequência | Confiança | Decisão |
| --- | --- | --- | --- |
| Alto | Alta (5+) | Alta/Média | **Prioridade máxima** — candidato direto a Sprint (ver [Roadmap Integration](07-roadmap-integration.md)) |
| Alto | Alta (5+) | Baixa | Investigar a causa da baixa confiança antes de decidir — não promover a Sprint sem resolver a suspeita (ex: confirmar se não é bug de ambiente) |
| Alto | Média (3-4) | Alta | Investigar — forte candidato, mas esperar mais dados (próximo ciclo) antes de prioridade máxima, a menos que também viole um Success Criteria |
| Alto | Média (3-4) | Média/Baixa | Registrar como observação a confirmar no próximo ciclo |
| Alto | Baixa (1-2) | Qualquer | Registrar — pode ser peculiaridade de perfil (ver [False Positive Prevention](11-false-positive-prevention.md)) |
| Baixo | Alta (5+) | Qualquer | Registrar como padrão a observar — vira Sprint só se persistir e a frequência subir mais, dado que o impacto é baixo |
| Baixo | Média/Baixa | Qualquer | Registrar e arquivar — não gera ação isolada |

## Decision Thresholds

Heurísticas numéricas. Estes números são um ponto de partida deliberadamente simples — **heurísticas iniciais, não regras fixas**, revisáveis depois que ciclos futuros mostrarem se 3 e 5 são os cortes certos para o tamanho real dos ciclos (~10 participantes) deste projeto.

| Nº de participantes reportando o mesmo achado | Ação |
| --- | --- |
| 1 | **Registrar** — nunca decidir prioridade sozinho a partir de 1 relato (exceção: violação direta de Success Criteria, ver [Evidence Rules](09-evidence-rules.md#quando-um-comentário-individual-pode-gerar-uma-ação)) |
| 2 | Ainda **registrar** — não é suficiente para "padrão" (ver limiar de 3 em [Evidence Rules](09-evidence-rules.md)) |
| 3-4 | **Investigar** — cruzar com Impacto e Confiança na Matriz de Decisão acima antes de decidir a ação final |
| 5+ | **Prioridade alta** — se Impacto também for Alto, candidato direto a Sprint (ver [Roadmap Integration](07-roadmap-integration.md)) |

Se um ciclo futuro tiver um número de participantes muito diferente de ~10 (ex: 20 ou 5), estes cortes devem ser reproporcionalizados (ex: manter a mesma fração ~30%/50%, não o número absoluto 3/5) — registrar essa decisão explicitamente no documento de Consolidação daquele ciclo, nunca mudar silenciosamente.

Ver também: [Evidence Rules](09-evidence-rules.md), [False Positive Prevention](11-false-positive-prevention.md), [Cross Validation](12-cross-validation.md).
