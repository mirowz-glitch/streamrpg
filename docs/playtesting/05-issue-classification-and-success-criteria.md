# 5. Issue Classification & Success Criteria

## Classificação de Issues

Todo achado de um playtest (observação da [Ficha de Observação](02-moderator-guide.md#ficha-de-observação-durante-a-sessão), resposta aberta do [Questionário](03-participant-questionnaire.md), ou métrica fora do esperado) precisa ser classificado numa destas categorias antes de virar qualquer ação. A categoria decide quem resolve e como — nunca decidir uma correção antes de classificar.

| Categoria | Definição | Exemplo hipotético |
| --- | --- | --- |
| **UX** | O sistema já faz a coisa certa, mas a interface não comunica isso com clareza | Participante não percebeu o link "Ir para a Aventura →" no Portão Norte |
| **Onboarding** | Fricção específica de quem nunca viu o jogo antes — deixaria de existir na 2ª sessão da mesma pessoa | Participante não sabia que podia clicar nos objetos da praça |
| **Gameplay** | O loop funciona como projetado, mas a experiência de jogar não engaja | Trecho de checkpoints repetitivo sem variedade percebida (já documentado no Player Retention Loop Sprint) |
| **Balanceamento** | Dificuldade, recompensa ou progressão numericamente desalinhados | Morte abrupta em Picos Congelados (Endgame Funnel Fix, já rastreado) |
| **Bug** | Comportamento que diverge do que o sistema deveria fazer, sem exceção | Um item equipado que não aparece no HUD |
| **Conteúdo** | Falta de variedade ou profundidade de texto/narrativa/regiões | Uma região com poucas variações de flavor text percebidas em replays |
| **Apresentação** | Visual, som, feedback sensorial — não afeta a lógica do jogo | Falta de identidade visual (já registrado no roadmap comercial como item "Identity") |

**Regra de ouro**: uma mesma observação pode gerar mais de uma categoria (ex: a morte em Picos Congelados é Balanceamento — a dificuldade em si — e também UX — a ausência de um aviso proporcional ao salto de risco). Registrar ambas, não forçar uma escolha única.

## Priorização por impacto × frequência

| | **Frequência baixa** (1-2 dos 10 participantes) | **Frequência alta** (maioria dos 10 participantes) |
| --- | --- | --- |
| **Impacto alto** (quebra a sessão, causa abandono, ou contradiz um Playtest Goal) | Investigar antes de agir — pode ser peculiaridade de um perfil específico | **Prioridade máxima** — vira candidato a Sprint (ver [Roadmap Integration](07-roadmap-integration.md)) |
| **Impacto baixo** (incômodo pontual, não muda o resultado da sessão) | Registrar e arquivar — não gera ação isolada | Registrar como padrão a observar na próxima rodada — só vira Sprint se persistir |

A classificação por frequência só é possível depois que os 10 participantes passaram — nunca decidir "isso é frequente" com base em 1 ou 2 sessões (ver [Modelo de Consolidação](06-consolidation-template.md)).

Esta matriz 2D (impacto × frequência) cobre a maioria dos casos. Para achados onde a confiança na própria evidência é questionável (ex: só um perfil muito específico reportou, ou há suspeita de bug temporário de ambiente), usar a matriz estendida de 3 dimensões (impacto × frequência × confiança da evidência) em [Priority Matrix](10-priority-matrix.md), junto com as regras de [False Positive Prevention](11-false-positive-prevention.md).

---

## Success Criteria

Estes critérios servem **só como referência de análise** — nunca como meta a ser forçada (o Princípio Fundamental da Sprint é claro: o objetivo não é provar que o jogo é bom, é descobrir onde ele pode melhorar). Se a maioria dos participantes não atingir um critério, isso não invalida o playtest — é exatamente o resultado que o playtest existe para revelar.

- A maioria dos 10 participantes encontra e inicia a Aventura sem pedir ajuda ao moderador.
- A maioria completa pelo menos uma expedição (ou alcança pelo menos um checkpoint significativo) dentro dos ~30 minutos.
- A maioria relata, na Parte A do questionário (A5/A6), vontade de continuar jogando ou de retornar em outra sessão.
- A maioria entende o motivo de um item não ser equipado (A7) e de quando o login é pedido (A8), sem precisar perguntar ao moderador.
- Nenhum participante fica genuinamente travado (sem conseguir prosseguir por mais de ~2 minutos) nas etapas cobertas pelas Sprints já concluídas (Landing → Cidade → Portão Norte → Aventura).

Se qualquer um destes NÃO for atingido pela maioria, o achado correspondente entra automaticamente como candidato de "Impacto alto" na tabela de priorização acima, independentemente de quantos participantes especificamente reportaram o problema em palavras — a métrica objetiva já é o sinal.

Ver também: [Modelo de Consolidação](06-consolidation-template.md), [Roadmap Integration](07-roadmap-integration.md).
