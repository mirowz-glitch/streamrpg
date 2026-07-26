# External Playtest Program — Phase I

**Data**: 2026-07-25
**Tipo de Sprint**: planejamento, documentação e metodologia — nenhuma linha de código de jogo foi alterada.
**Pergunta principal**: *O que precisamos observar para transformar os primeiros 10 jogadores em conhecimento útil para o projeto?*
**Resposta**: um processo completo agora existe em `docs/playtesting/`, cobrindo da definição de objetivo de cada sessão até a decisão de quando um achado vira Sprint.

---

## Contexto de entrada

As três Sprints anteriores fecharam, em sequência, os únicos bloqueios obrigatórios identificados para começar a testar com jogadores externos:
- **Gameplay Vertical Slice / Player Feedback & Retention**: fricções de UX (perda de sessão, feedback de loot, timeline) resolvidas.
- **Front Door Experience**: onboarding e descoberta (Landing → Cidade → Aventura, sem login) resolvidos.
- **Player Retention Loop**: playtest interno de ~30 minutos confirmou interesse contínuo, cadeia de objetivos e motivação de retorno — único gargalo real (Picos Congelados) já rastreado no roadmap comercial.

Esta Sprint não adiciona um item novo a essa lista de bloqueios — ela responde a uma pergunta diferente: **agora que o jogo está pronto para ser testado, como garantimos que testá-lo produza conhecimento, e não só opiniões soltas?**

---

## 1. Guia do Moderador

[`docs/playtesting/02-moderator-guide.md`](../playtesting/02-moderator-guide.md) — cobre preparação (incluindo um piloto interno antes da rodada real), o texto exato de instruções iniciais (para garantir comparabilidade entre sessões), duração prevista (~30min de jogo + ~10min de questionário), critérios objetivos de quando encerrar, as 3 perguntas finais faladas, e uma Ficha de Observação com a disciplina explícita de "registrar primeiro, analisar depois".

## 2. Questionário do Participante

[`docs/playtesting/03-participant-questionnaire.md`](../playtesting/03-participant-questionnaire.md) — 8 afirmações em escala 1-5 (clareza, diversão, dificuldade percebida, vontade de continuar/retornar, clareza de sistemas de loot/login), 5 perguntas abertas (momento memorável, momento confuso, o que mudaria, comparação com outros jogos, recomendação), e 2 perguntas extras só para perfis específicos (criadores de conteúdo, jogadores de ARPG). Deliberadamente sem nota geral única — uma média esconderia exatamente o detalhe que este programa existe para capturar.

## 3. Lista de Métricas

[`docs/playtesting/04-metrics.md`](../playtesting/04-metrics.md) — todas coletadas manualmente (cronômetro + leitura direta do HUD existente), sem nenhuma instrumentação nova: tempo até a Aventura/1º nível/1º Elite, duração total, ponto de abandono, regiões/checkpoints/Elites/Mini-Bosses/Chefes/mortes, mais as métricas derivadas do questionário.

## 4. Modelo de Relatório

[`docs/playtesting/06-consolidation-template.md`](../playtesting/06-consolidation-template.md) — template único para os ~10 participantes de um ciclo, com seções separadas para padrões recorrentes (3+ participantes), problemas isolados, sugestões de participantes, divergências entre perfis, comparação com o ciclo anterior, e resultado objetivo contra os Success Criteria.

## 5. Processo de Priorização

[`docs/playtesting/05-issue-classification-and-success-criteria.md`](../playtesting/05-issue-classification-and-success-criteria.md) (categorias: UX/Onboarding/Gameplay/Balanceamento/Bug/Conteúdo/Apresentação, priorização por impacto×frequência) + [`docs/playtesting/07-roadmap-integration.md`](../playtesting/07-roadmap-integration.md) (quando um achado vira Sprint — só padrões recorrentes de impacto alto — vs. quando é só registrado vs. quando é descartado).

## 6. Commercial Impact

**Como este programa reduz risco antes da Steam Page e do contato com publishers?**

Hoje, toda avaliação do Vertical Slice vem de duas fontes: simulação quantitativa (Combat/Loot/Progressão, já madura) e um único playtest interno guiado pela própria equipe. Nenhuma delas responde à pergunta que mais importa para um publisher: **"como uma pessoa que nunca viu este projeto reage a ele, sozinha, sem ajuda?"**

Sem um processo estruturado, o primeiro contato de jogadores reais e desconhecidos com o jogo aconteceria só na gravação do trailer ou na própria Steam Page — o pior momento possível para descobrir um problema de clareza ou de dificuldade, porque nesse ponto já não há tempo de reagir sem refazer material caro. Este programa move essa descoberta para **antes** da produção de qualquer material de apresentação, com um processo repetível, não uma sessão improvisada:

- Reduz o risco de um trailer/demo pública expor um problema (como a queda de Picos Congelados) que já era conhecido internamente, mas nunca visto por alguém de fora.
- Gera evidência de jogador real para reforçar (ou revisar) prioridades do roadmap comercial — hoje baseadas majoritariamente em simulação interna.
- Cria um ativo reutilizável: cada ciclo futuro (após Equipment Progression Audit, após Visual Polish, etc.) pode rodar com o mesmo protocolo, tornando comparável se uma mudança realmente melhorou a experiência de um jogador novo, não só os números do simulador.
- Antecipa perguntas que um publisher provavelmente fará ("vocês já testaram isso com alguém de fora?") com uma resposta concreta e documentada, em vez de "achamos que está bom".

## 7. Roadmap

Atualizado em `commercial/roadmap/project-valuation-roadmap.md` (nova seção "0.3") — ver abaixo.

---

## Validação

Nenhum código de produção foi alterado nesta Sprint — só documentação (`docs/playtesting/*`, este relatório, e o roadmap comercial). Nenhum typecheck ou suíte de testes é aplicável. Nenhum playtest novo foi executado (conforme instrução explícita da Sprint: "Não executar novos playtests nesta Sprint" — o processo foi desenhado com base nos playtests já documentados nas 3 Sprints anteriores).

## Critérios de Aprovação — Checklist Final

- [x] Protocolo completo de playtest (Guia do Moderador).
- [x] Roteiro para observação (Ficha de Observação, dentro do Guia do Moderador).
- [x] Questionário final.
- [x] Métricas objetivas.
- [x] Modelo de consolidação.
- [x] Critérios claros para priorização (Issue Classification + Roadmap Integration).
