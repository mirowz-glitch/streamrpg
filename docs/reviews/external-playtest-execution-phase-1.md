# External Playtest Execution — Phase I

**Data**: 2026-07-25
**Tipo de Sprint**: ajustada em escopo, com confirmação do usuário — preparação completa do Ciclo 1, execução real ainda pendente.

---

## Por que esta Sprint não executou os 10 playtests como pedido no brief

O brief pede a execução real de ~10 sessões com jogadores externos: recrutar pessoas com perfis diversos, conduzir sessões, coletar questionários e métricas reais, e consolidar tudo em evidência comportamental.

Isso exige acesso a seres humanos reais fora desta conversa — recrutar, agendar, conduzir e observar pessoas. Essa capacidade não existe neste ambiente: não há como contatar, convidar ou observar pessoas externas ao usuário e a este assistente. Preencher os 10 participantes com dados inventados e apresentar isso como "resultado de playtest externo" seria fabricar evidência — exatamente o oposto do que a metodologia em `docs/playtesting/` existe para garantir (Princípio Fundamental desta própria Sprint: "Observar primeiro. Interpretar depois." — não há o que observar se os dados não vieram de pessoas reais).

Esse limite foi levantado ao usuário antes de qualquer trabalho começar, e a decisão confirmada foi: **preparar o pacote de execução completo, para que o usuário/equipe rode as ~10 sessões reais**, com a consolidação e o relatório final ficando prontos para serem produzidos assim que os dados reais chegarem.

---

## O que foi entregue nesta Sprint

Um pacote de execução completo do **Ciclo 1**, em `docs/playtesting/results/cycle-1/`, operacionalizando a metodologia genérica (já existente em `docs/playtesting/01` a `07`) numa rodada concreta e pronta para rodar:

1. **[`00-recruitment.md`](../playtesting/results/cycle-1/00-recruitment.md)** — composição-alvo dos 10 participantes (com as mesmas prioridades de perfil já definidas em `01-goals-and-profiles.md`), uma mensagem de recrutamento pronta para uso, e uma tabela de candidatos para preencher conforme pessoas reais forem convidadas/confirmadas.
2. **[`01-session-log-template.md`](../playtesting/results/cycle-1/01-session-log-template.md)** — ficha única por participante (copiar uma vez por sessão), com todos os campos de métricas, observação e questionário já prontos para preencher durante/logo após cada sessão real, referenciando o roteiro e o questionário oficiais em vez de duplicá-los.
3. **[`02-consolidation.md`](../playtesting/results/cycle-1/02-consolidation.md)** — cópia em branco do Modelo de Consolidação, já rotulada para o Ciclo 1, pronta para ser preenchida assim que as ~10 sessões estiverem completas.

Nenhum arquivo de `docs/playtesting/01` a `07` (a metodologia genérica) foi alterado — conforme exigido ("Este processo já foi validado internamente... Não deverá alterá-lo").

## O que falta para esta Sprint estar de fato concluída

As Fases 3 a 10 e a Entrega completa (participantes, métricas consolidadas, problemas recorrentes, elogios recorrentes, comparação interno×externo, priorização, Commercial Impact definitivo, atualização de roadmap baseada em evidência real) **dependem de dados reais que ainda não existem**. Assim que as ~10 sessões forem conduzidas e os arquivos em `docs/playtesting/results/cycle-1/` estiverem preenchidos (ou qualquer outro formato de registro real — notas, planilha, gravações), a análise completa pode ser retomada nesta mesma linha, processando os dados reais através da metodologia já pronta.

**Handoff — o que enviar para retomar esta Sprint**:
- Os ~10 arquivos de session log preenchidos (ou equivalente), com métricas + questionário completos por participante.
- Qualquer observação livre do moderador que não coube nos campos padronizados.

Com isso em mãos, o restante da Sprint (Fases 6-10 + Entrega 1-6) é puramente análise sobre dados já existentes — não depende de mais nenhuma decisão de escopo.

---

## Commercial Impact — resposta honesta dado o estado real de hoje

O brief pede para responder, por público, se o Vertical Slice está pronto para demonstrações públicas, Steam Page, criadores de conteúdo e conversas com publishers **após este primeiro ciclo de playtests**. Como o ciclo ainda não foi executado, a resposta correta hoje não é "sim" nem "não" — é o estado de evidência disponível:

| Público | Estado da evidência hoje | O que falta |
| --- | --- | --- |
| **Demonstrações públicas** | Só evidência interna (equipe/IA) — onboarding e retenção validados internamente (Front Door Experience, Player Retention Loop), nunca por alguém de fora do projeto | O Ciclo 1 real é exatamente o que fecha essa lacuna — é o pré-requisito, não um "nice to have" |
| **Steam Page** | Mesma lacuna — a página venderia promessas validadas só internamente | Ciclo 1 real, especialmente confirmando que pessoas sem contexto do projeto entendem a proposta de valor sozinhas |
| **Criadores de conteúdo** | Nenhuma evidência ainda de como um criador reagiria ao gancho Twitch (a sessão de demo hoje é sem login, então nem esse ângulo foi testado com ninguém) | Priorizar recrutar os 2-3 perfis de criadores de conteúdo do Ciclo 1 (ver `00-recruitment.md`) — pergunta C1 do questionário existe exatamente para isso |
| **Conversas iniciais com publishers** | Mesma lacuna, mais o gargalo já conhecido (Endgame Funnel Fix / Picos Congelados) ainda não corrigido | Ciclo 1 real + Equipment Progression Audit/Endgame Funnel Fix (ambos já no roadmap) |

**Conclusão honesta**: nenhum destes públicos deve ser abordado com o argumento "já validamos com jogadores externos" até o Ciclo 1 real acontecer — fazer isso hoje seria uma alegação sem evidência.

---

## Strategic Review (Fase 10) — maior risco restante, com a ressalva de que os dados disponíveis são só internos

Usando exclusivamente os dados coletados até aqui (todos internos — nenhuma sessão externa real ocorreu): o maior risco restante do StreamRPG não é mais um problema de sistema (onboarding e retenção já testados e resolvidos/mapeados internamente), e também não é, isoladamente, o funil de Picos Congelados (já quantificado e já no roadmap). É este:

**Toda conclusão do projeto até hoje foi validada só por quem já conhece o produto.** Cada "problema resolvido" (Front Door, Retention) foi confirmado por um playtest conduzido pela própria equipe/IA — nunca por alguém sem contexto prévio. Isso é exatamente o tipo de ponto cego que só aparece com uma pessoa de fora: alguém que já sabe que "Portão Norte leva à Aventura" não consegue medir se isso é realmente óbvio para quem nunca viu a tela antes. Esta Sprint tentou fechar exatamente essa lacuna e não conseguiu, pela mesma razão que a expõe: não há, ainda, nenhum dado vindo de uma pessoa genuinamente externa ao projeto. Até o Ciclo 1 rodar de verdade, este é o risco mais alto — maior que qualquer item técnico já mapeado, porque nenhum dos itens técnicos pode ser corretamente priorizado sem saber se as premissas por trás deles (o que confunde, o que engaja) realmente se sustentam fora da bolha da equipe.

---

## Roadmap

Atualizado com uma nota de status (não uma reprioridade) em `commercial/roadmap/project-valuation-roadmap.md` — ver seção "0.4". Nenhum item foi reordenado ou criado nesta Sprint, porque nenhuma evidência real de jogador externo existe ainda para justificar isso (Princípio Obrigatório: "Nenhuma Sprint deverá ser criada utilizando opiniões isoladas" — estendido aqui para "nenhuma mudança de roadmap sem evidência real").

## Critérios de Aprovação — status real

- [ ] ~10 sessões completas — **pendente** (aguarda execução real).
- [ ] Métricas registradas — **pendente**.
- [ ] Questionários completos — **pendente**.
- [ ] Consolidação final — **pendente**.
- [ ] Lista priorizada de problemas — **pendente**.
- [ ] Comparação entre playtests internos e externos — **parcial**: a lacuna em si já está documentada (ver Strategic Review acima); a comparação completa depende dos dados reais.
- [x] Atualização fundamentada do roadmap — feita como nota de status, não como reprioridade (a única atualização honesta possível sem dados reais).
