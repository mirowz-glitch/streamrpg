# 12. Cross Validation

Como comparar os resultados de um ciclo de playtest **externo** com os playtests **internos** já documentados (feitos pela própria equipe/IA, sem participantes de fora):

- [Gameplay Vertical Slice — Player Experience Phase I](../reviews/gameplay-vertical-slice-player-experience-phase-1.md)
- [First 10 Minutes Experience — Vertical Slice Phase I](../reviews/first-10-minutes-experience-phase-1.md)
- [Front Door Experience — Vertical Slice Phase I](../reviews/front-door-experience-vertical-slice-phase-1.md)
- [Player Retention Loop — Vertical Slice Phase I](../reviews/player-retention-loop-vertical-slice-phase-1.md)

## Por que a comparação importa

Playtests internos e externos têm vieses estruturalmente **opostos**, não aleatórios:

- **Playtest interno** (equipe/IA): quem testa já sabe onde cada botão leva, o que cada termo significa, o que é intencional vs. bug. Isso cria um ponto cego sistemático para problemas de clareza/onboarding — é estruturalmente impossível para alguém que já conhece o produto "esquecer" esse conhecimento e reagir como um visitante genuíno reagiria.
- **Playtest externo**: a pessoa não tem esse conhecimento prévio, então detecta exatamente o que o interno não consegue — mas cada sessão individual carrega mais variância (habilidade, atenção, humor do dia), o que exige olhar para o padrão entre várias sessões, não uma sessão isolada, antes de tirar conclusão.

Por isso, esta comparação nunca deve tratar "interno" e "externo" como igualmente confiáveis para o mesmo tipo de pergunta — cada um é mais confiável numa categoria específica (ver tabela abaixo).

## Onde cada fonte é mais confiável

| Categoria (ver [Issue Classification](05-issue-classification-and-success-criteria.md)) | Fonte mais confiável | Por quê |
| --- | --- | --- |
| Onboarding / UX de descoberta | **Externo** | Interno tem o ponto cego estrutural descrito acima |
| Balanceamento numérico (ex: taxa de mortalidade de uma região) | **Interno** (simulação/auditoria quantitativa) | Já validado com centenas/milhares de execuções — um ciclo de ~10 sessões externas tem poder estatístico muito menor para números finos |
| Percepção subjetiva de diversão/engajamento | **Externo** | É exatamente o que só uma pessoa sem contexto prévio pode responder de forma não-contaminada |
| Consistência técnica (bugs reprodutíveis) | Ambos, mas **externo pesa mais** | Um bug que só aparece pra quem não conhece o fluxo "certo" de usar o produto pode nunca ter sido testado internamente |

## Como interpretar uma diferença entre interno e externo

| Situação observada | Interpretação mais provável | Ação |
| --- | --- | --- |
| Externo confirma um achado interno (ex: Picos Congelados quebra motivação para múltiplos participantes externos também) | **Confirmação independente** — o sinal mais forte que este processo pode produzir | Eleva a confiança do achado ao máximo (ver [Priority Matrix](10-priority-matrix.md)); referenciar ambas as fontes na entrada do roadmap |
| Externo encontra um problema de onboarding/clareza que o interno nunca reportou | **Provavelmente real** — é exatamente a categoria onde o interno tem ponto cego estrutural (ver tabela acima) | Tratar como achado novo, não como contradição — não exige "explicar por que o interno errou", porque o interno nunca poderia ter visto isso |
| 1-2 participantes externos contrariam um achado interno bem quantificado (ex: dizem que Picos Congelados "não foi difícil") | **Provável ruído estatístico** — n pequeno, abaixo do limiar de padrão (ver [Decision Thresholds](10-priority-matrix.md#decision-thresholds)) | Registrar, não descartar o achado interno quantificado com base em 1-2 relatos |
| Resultados externos se dividem claramente por perfil (ex: jogadores de ARPG acham a dificuldade justa, casuais acham injusta, no mesmo trecho) | **Diferença de perfil**, não uma contradição a resolver com um único veredito | Registrar em "Divergências" no [Modelo de Consolidação](06-consolidation-template.md) — informa segmentação de público-alvo, não decide uma correção universal |
| Externo relata algo que nenhuma sessão interna sequer tentou observar (ex: reação de criador de conteúdo ao potencial de live) | **Descoberta inédita** — nem confirma nem contradiz nada interno, porque não havia dado interno equivalente | Tratar como evidência nova por si só, seguindo o processo normal de [Priority Matrix](10-priority-matrix.md) |

## Regra de ouro

Uma diferença entre interno e externo só vira "problema a resolver" quando o lado externo atinge o limiar de padrão (3+ participantes, ver [Decision Thresholds](10-priority-matrix.md#decision-thresholds)) E a categoria do achado é uma onde o externo é a fonte mais confiável (tabela acima). Fora disso, a diferença é registrada, nunca tratada como veredito.

Ver também: [Priority Matrix](10-priority-matrix.md), [False Positive Prevention](11-false-positive-prevention.md), [Roadmap Integration](07-roadmap-integration.md).
