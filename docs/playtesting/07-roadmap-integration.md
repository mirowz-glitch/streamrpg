# 7. Roadmap Integration (Processo de Priorização)

Este capítulo define como o conteúdo do [Modelo de Consolidação](06-consolidation-template.md) — já preenchido ao final de um ciclo de 10 participantes — se transforma (ou não) em trabalho real no `commercial/roadmap/project-valuation-roadmap.md`.

## Quando um achado vira uma Sprint

Um achado só vira uma proposta de Sprint quando **todas** estas condições são verdadeiras:

1. Está classificado na seção "Padrões Recorrentes" do Modelo de Consolidação (observado em 3+ dos ~10 participantes) — **nunca** a partir da seção "Problemas Isolados".
2. Tem impacto alto conforme a matriz de [Issue Classification](05-issue-classification-and-success-criteria.md#priorização-por-impacto--frequência) (quebra a sessão, causa abandono, ou reprova um Success Criteria).
3. Não é uma sugestão de feature nova sem relação com um problema observado (sugestões puras de conteúdo/feature entram no roadmap como hipótese a avaliar depois, nunca como Sprint imediata — ver seção "Sugestões dos Participantes" do Modelo de Consolidação).
4. Não contradiz uma investigação técnica já encerrada nesta sessão (Combat Engine, Loot System, Progressão — ver Princípios Obrigatórios: "não reabrir investigações técnicas encerradas"). Se o achado aponta para uma dessas áreas, ele reforça uma decisão já tomada (como aconteceu com Picos Congelados no Player Retention Loop Sprint) — não reabre a investigação do zero.

Quando as 4 condições são verdadeiras, o achado ganha uma entrada na tabela da Seção 1 do `project-valuation-roadmap.md` (ou reforça a prioridade de uma entrada já existente, como já aconteceu com o Endgame Funnel Fix) com uma referência direta ao ciclo de playtest que o originou.

## Rastreabilidade obrigatória (toda Sprint originada por playtest)

Nenhuma entrada de roadmap ou proposta de Sprint pode citar um achado de playtest sem, ao mesmo tempo, citar explicitamente:

1. **Qual evidência a originou** — link direto para a linha específica da [Consolidação](06-consolidation-template.md) do ciclo (não "o playtest em geral", a linha exata).
2. **Quantos participantes observaram o achado** — o número real, não uma aproximação ("vários", "a maioria") sem o valor.
3. **Em quais perfis** — conforme [Tester Profiles](01-goals-and-profiles.md#tester-profiles); um achado presente só em um perfil específico é informação diferente de um achado presente em todos.

Esta exigência existe para que qualquer pessoa lendo uma entrada do roadmap consiga, sem precisar perguntar a quem escreveu, verificar a evidência por trás dela — e para impedir que uma Sprint futura seja justificada por uma paráfrase vaga de feedback ("os jogadores acharam confuso") em vez de um número e uma fonte rastreável.

## Quando um achado deve apenas ser registrado

- Está na seção "Problemas Isolados" (1-2 participantes) — fica arquivado no documento do ciclo, sem virar tarefa, até (e a menos que) reapareça como padrão recorrente num ciclo futuro.
- É uma sugestão de feature/conteúdo sem um problema observável por trás — fica registrada na Seção 5 do Modelo de Consolidação como candidato a hipótese de design, seguindo o mesmo tratamento que outras hipóteses deste projeto (ver memórias de projeto: hipóteses ficam deliberadamente fora da Game Design Bible até serem revisitadas com contexto suficiente).
- É uma divergência entre perfis (Seção 6 do Modelo de Consolidação) sem um padrão dominante claro — registrada como informação de segmentação de público, útil para decisões futuras de escopo (ex: "para quem estamos otimizando o onboarding?"), não para uma correção imediata.

## Quando um achado deve ser descartado

- É um comentário de um único participante que a própria ficha de observação já suspeitava ser viés de perfil (ex: um "amigo próximo" usado como piloto, cujo feedback nunca conta como um dos ~10 participantes oficiais — ver [Tester Profiles](01-goals-and-profiles.md)).
- É uma reação a um bug de ambiente de teste (conexão instável, navegador incompatível) sem relação com o produto em si — registrar a causa técnica no rodapé do ciclo, mas não tratar como achado de produto.
- É uma sugestão que contradiz diretamente um princípio já fixado em documento de prioridade máxima (ex: uma sugestão de mudança de lore que contradiz a [Constituição do Mundo](../world-constitution/README.md), ou uma sugestão de sistema que fere um dos 7 princípios de arquitetura da Game Design Bible) — descartada com justificativa registrada, não implementada só porque um participante pediu.

## Como isso alimenta o `project-valuation-roadmap.md`

- Cada ciclo de playtest concluído ganha uma entrada de atualização no roadmap (seguindo o padrão já estabelecido pelas seções "0.1" e "0.2" — Front Door Experience e Player Retention Loop), linkando para o documento de consolidação do ciclo.
- Achados que viram Sprint entram na tabela da Seção 1 do roadmap, com prioridade determinada pela mesma lógica de impacto-no-valor-percebido já usada para os itens existentes (Seção 3 do roadmap) — um achado de playtest externo tem o mesmo peso que um achado de auditoria interna, nunca menos, porque vem de evidência real de jogador, não de simulação.
- A partir do primeiro ciclo de playtest externo, o roadmap passa a ter duas fontes de evidência complementares: **investigação técnica interna** (simulador, auditorias de código, Sprints de design) e **evidência de jogador externo** (este processo). Nenhuma substitui a outra — um achado técnico prevê o que PODE acontecer; um achado de playtest confirma o que REALMENTE aconteceu com uma pessoa que nunca viu o projeto antes.

Ver também: [Modelo de Consolidação](06-consolidation-template.md), [Issue Classification](05-issue-classification-and-success-criteria.md).
