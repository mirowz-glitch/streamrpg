# World Events

**Status:** 🚧 Preparação — conceitual, nenhuma implementação. Parte da Sprint "Foundation Refactor".

## 1. Eventos naturais — o princípio

Feiras, festivais, invasões, eleições, construções coletivas, eventos econômicos, secas, prosperidade — sem depender de streamers. O princípio central: **eventos naturais deveriam ser, na maioria, uma consequência do estado real do Reino, não um calendário arbitrário.** Uma seca acontece quando a vocação agrícola de um Reino está em baixa real (métrica de economia caindo); uma invasão é mais provável num Reino com tesouro rico e defesa fraca; uma construção coletiva se torna possível quando o tesouro atinge um limiar. Mesmo princípio já aplicado no projeto — Boss loot não deve replicar um bug antigo só para parecer consistente; eventos de mundo devem emergir de dados reais, não ser encenação vazia por cima de nada.

## 2. Categorias de evento

| Evento | Gatilho conceitual |
|---|---|
| Feira/Festival | Prosperidade econômica acima de um limiar, ou marco de Crônica (aniversário de fundação) |
| Invasão | Tesouro alto + defesa (cidadania ativa/prestígio militar) baixa |
| Eleição | Ciclo periódico de um Reino sob modelo de liderança Eleito |
| Construção coletiva | Tesouro atinge um limiar de investimento em expansão de bairro |
| Evento econômico (boom/crise) | Variação real de vocação/comércio inter-Reino (`trade-routes.md`) |
| Seca/Prosperidade | Vocação agrícola/de recurso específico em baixa/alta real |

Nenhum desses gatilhos exige presença de streamer nem de live — todos derivam de estado já existente no jogo (Economy Core, cidadania, comércio).

## 3. A camada permanente e a camada sazonal — como convivem

O maior risco de longo prazo de um mundo "onde nada nunca desaparece" é que, depois de anos reais de operação, permanência sem novidade vira estagnação visitável. A solução recomendada é um modelo de duas camadas:

- **Camada permanente (substrato)** — Reino, casa, cidadania, Crônica. Nunca reseta, nunca desaparece. É a geografia do jogo.
- **Camada sazonal (competição/novidade)** — rankings competitivos, eventos temáticos, desafios coletivos com início e fim definidos.

A reconciliação entre as duas: quando uma temporada termina, ela não desaparece — **se funde na camada permanente** como um registro histórico definitivo ("Campeão da Temporada 3 — 2027" vira uma entrada de Crônica/título permanente), mas o quadro competitivo em si reseta para a Temporada 4, dando aos veteranos um motivo genuíno de recomeçar a competir sem apagar nada do que já construíram.

Isso resolve a tensão real entre "nada nunca desaparece" (Housing, Kingdom, Cidadania) e a necessidade de qualquer MMO de longa duração ter uma camada de novidade recorrente — sem contradizer a promessa de permanência, porque só o *quadro competitivo* reseta, nunca o *resultado histórico* dele.

## 4. Quem opera a Coroa/Reinos sem líder ativo

Um Reino sob liderança Coroa (sem streamer, sem eleição ativa) ainda precisa de eventos e conteúdo para não parecer "sem vida" — isso não é automação gratuita: na prática, é trabalho contínuo de conteúdo/live-ops da produção, gerando ou calibrando os gatilhos da Seção 2 para Reinos administrados pela Coroa. Nomear isso explicitamente agora evita que o planejamento de capacidade da equipe descubra esse custo só depois de estar em produção.

---

*Referências: `kingdom-domain-2.0.md` (os modelos de liderança que geram diferentes perfis de evento); `trade-routes.md` (eventos econômicos derivados de comércio real); `long-term-retention.md` (o papel da camada sazonal na retenção de longo prazo).*
