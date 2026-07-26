# 9. Evidence Rules

Regras explícitas para responder três perguntas que aparecem em toda análise de playtest: quando um comentário individual pode gerar uma ação, quando ele deve apenas ser registrado, e quando vários relatos separados passam a representar um padrão real.

## Quando um comentário individual pode gerar uma ação

Só nestes casos — todos raros e específicos, nunca o caminho padrão:

- **Bug reprodutível descrito com precisão suficiente para confirmar sem mais dados** (ex: "cliquei em X e a tela ficou em branco", com o X identificado). Mesmo assim, a ação correta é **registrar o bug para verificação técnica**, não mudar o jogo durante a Sprint de playtest (ver Princípios Obrigatórios: "não alterar o jogo").
- **Violação direta de um Success Criteria já formal** (ver [Issue Classification & Success Criteria](05-issue-classification-and-success-criteria.md#success-criteria)) — um único participante travando de forma genuína em uma etapa já considerada resolvida (ex: não conseguir sair da Landing Page) é, por si só, sinal suficiente para investigar, porque o critério já define isso como inaceitável em qualquer frequência, não porque uma opinião isolada "pesou mais".

Fora desses dois casos, nenhum comentário individual — por mais convincente, articulado ou vindo de um perfil "importante" (ex: um criador de conteúdo grande) — justifica uma ação sozinho.

## Quando um comentário deve apenas ser registrado

- Sugestão de feature/conteúdo sem um problema observável por trás (ver Seção 5 do [Modelo de Consolidação](06-consolidation-template.md)).
- Reação emocional (positiva ou negativa) sem repetição em outros participantes — vai para "Problemas Isolados" ou "Elogios Recorrentes" (se já há 3+; ver seção seguinte) conforme o caso.
- Comentário que soa como preferência pessoal de gênero/estilo, não como fricção de uso (ex: "eu prefiro jogos com mais texto de diálogo" vindo de alguém que, ainda assim, completou a sessão sem dificuldade real).

## Quando vários relatos passam a representar um padrão

Um padrão nasce quando **3 ou mais** dos ~10 participantes relatam ou demonstram a mesma coisa, independentemente de terem usado palavras diferentes — a semelhança é de comportamento/observação, não de vocabulário. Ver os limiares numéricos completos (1/3/5) em [Priority Matrix](10-priority-matrix.md#decision-thresholds).

**Regra de equivalência**: dois relatos contam como "o mesmo achado" quando apontam para o mesmo elemento do jogo e o mesmo tipo de reação, mesmo com palavras diferentes. Exemplo: um participante diz "não vi como sair da praça", outro diz "não sabia que dava pra ir pro Portão Norte" — ambos são o mesmo achado (dificuldade em descobrir a navegação da Cidade), não dois achados diferentes.

## Exemplos worked (formato pergunta → resposta)

| Situação | Classificação |
| --- | --- |
| 1 participante diz "achei o combate meio repetitivo" | Registrar em Problemas Isolados — não vira ação sozinho |
| 3 participantes, independentemente, hesitam mais de 10s antes de clicar em "Jogar Agora" | Padrão — vira candidato à Priority Matrix |
| 1 participante (um jogador de ARPG muito experiente) diz "a dificuldade tá fácil demais" | Registrar, mas cruzar com [False Positive Prevention](11-false-positive-prevention.md#jogador-muito-experiente) antes de qualquer peso extra — perfil específico, não representa a maioria dos públicos-alvo |
| 5 participantes morrem em Picos Congelados sem entender por quê | Padrão de impacto alto — evidência forte, mesmo território já mapeado internamente (reforça, não reabre, ver [Roadmap Integration](07-roadmap-integration.md)) |
| 2 participantes elogiam espontaneamente o reveal do Chefe Final nomeado | Ainda não é "Elogio Recorrente" (precisa de 3+) — registrar e observar se aparece de novo |

Ver também: [Priority Matrix](10-priority-matrix.md), [False Positive Prevention](11-false-positive-prevention.md), [Data Flow](08-data-flow.md).
