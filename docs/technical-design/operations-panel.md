# Painel de Operação — proposta de métricas (não implementado)

**Status:** documento de decisão, não de construção. Nenhum dashboard, nenhuma
tabela, nenhum endpoint. O objetivo é decidir quais métricas realmente
importam para alguém acompanhar uma live sem abrir o código — não listar
tudo que seria tecnicamente possível medir.

Critério usado para priorizar: cada métrica foi avaliada contra o objetivo
real da live de hoje — **"as pessoas permanecem mais tempo por causa do
StreamRPG?"** — não contra "isso seria interessante de ver". Isso empurra
tudo de Retenção para cima e desempata vários itens dos outros três grupos.

---

## A métrica mais importante de todas, antes dos 4 grupos

**Tempo médio assistido / abandono** (grupo Retenção) não é só mais uma
métrica — é a resposta direta à pergunta que motivou a live de hoje. Se o
Painel de Operação um dia existir de verdade e só pudesse mostrar uma
coisa, seria essa. Todo o resto existe para explicar o *porquê* desse
número, não para competir com ele.

---

## 1. Operação

| Métrica | Prioridade | Por quê |
|---|---|---|
| Erros | P0 | Sinal mais básico de saúde — sem isso, nada mais é confiável. |
| Viewers ativos / Personagens ativos | P0 | Pulso mínimo de "tem gente jogando agora". Mantidos como dois números, não um só: personagem único ≠ sessão (reconexão, múltiplas abas). |
| Canais online | P1 hoje, vira P0 com múltiplos streamers | Com a Karol como único canal testado, isso hoje é só "o live-check está funcionando". Ganha peso real quando existir mais de um canal simultâneo. |
| Sessões (total, incluindo reconexões) | P1 | Diferença entre "sessões" e "personagens ativos" é o próprio sinal de instabilidade de conexão do lado do viewer. |
| Reconnects | P2 | Diagnóstico útil, não é um sinal operacional central por si só — é decomposição do número de Sessões acima. |

## 2. Economia

| Métrica | Prioridade | Por quê |
|---|---|---|
| Raridades dos drops | **P0 temporário** | Não é permanente — é prioridade alta agora especificamente porque é a primeira confirmação empírica, com gente de verdade, do bug já provado matematicamente (RNG compartilhado sempre resolvendo "common"). Depois que esse bug for corrigido (Sprint de Economia), essa métrica volta a ser P2. |
| XP criada | P1 | Lado de emissão, direto e simples — mesmo papel que Gold criado. |
| Gold criado | P1 | Idem, com uma ressalva abaixo. |
| Drops (tentativas/sucessos) | P1 | Já sai de graça do Tick Summary — tentativas = XP concedido por tick, sucessos = drop.granted. |
| Itens concedidos | **Redundante hoje** | Idêntico a "drops (sucessos)" enquanto só existir uma fonte de item (passivo). Só vira métrica distinta quando Boss/Welcome/Marketplace concederem item por caminhos diferentes — não vale rastrear como coisa separada ainda. |
| Gold destruído | **Não mensurável hoje, e tudo bem** | Não existe nenhum sink de Gold implementado (sem Marketplace, sem reparo, sem taxa) — esse número é estruturalmente zero até algum desses existir. Incluir essa métrica no painel agora só criaria um card sempre vazio. Anotar aqui para lembrar de acrescentar no dia que o primeiro sink nascer, não antes. |

## 3. Game Design

| Métrica | Prioridade | Por quê |
|---|---|---|
| Welcome Rewards concedidos | P1 | Proxy direto de "quantos viewers eram genuinamente novos" — a métrica mais acionável do grupo numa única sessão. |
| Tempo médio entre drops | P2 | Não precisa de instrumentação própria — é derivável depois, olhando os timestamps de `drop.granted` já logados. Não é um número que precisa existir "ao vivo". |
| Progressão média / Distribuição de níveis | **P2, mas só fica interessante comparando várias lives** | Numa única sessão isso é só uma foto sem contexto — o valor real aparece comparando a distribução de hoje com a de daqui a um mês. Vale registrar o número, não vale dar peso a ele ainda. |

## 4. Retenção

| Métrica | Prioridade | Por quê |
|---|---|---|
| Tempo médio assistido / Abandono | **P0** | A pergunta da live inteira (ver seção acima). Abandono, na prática, é só a outra ponta do "Session End" que o DebugEventSubscriber já loga — não é uma métrica nova, é uma leitura diferente do mesmo dado, olhando "quanto tempo desde a primeira presença até o Session End". |
| Novos jogadores | **Mesmo dado que Welcome Rewards (Game Design)**, olhado pela lente de retenção | Não vale ter duas fontes de verdade pra mesma pergunta — decidir qual grupo "dono" quando o painel for construído de verdade. |
| Jogadores recorrentes | P1, mas não é uma métrica de log ao vivo | Exige saber se um `profile_id` já apareceu numa live anterior — informação que existe no banco (`characters`/`profiles` persistem entre sessões), mas não sai de um Tick Summary de uma sessão isolada. Precisa de uma consulta pós-live, não de instrumentação em tempo real. |
| Retenção após Welcome / Retenção após Drop | P1 conceitual, mas é análise, não painel | Correlacionar dois eventos por personagem ao longo do tempo (welcome/drop → quanto tempo depois veio o Session End) é exatamente o tipo de pergunta que os logs estruturados de hoje já permitem responder *depois* da live, cruzando `applyPing`/`xp.granted`/`drop.granted`/`Session End` manualmente. Não é um número que um painel em tempo real precisa calcular ao vivo. |

---

## O que isso significa para a próxima versão real deste painel (se um dia for construído)

Não é "20 métricas separadas" — é um número pequeno de sinais ao vivo (P0/P1 dos grupos Operação e Retenção, mais a elevação temporária de Raridades) e um conjunto maior de perguntas que os **logs estruturados de hoje já respondem em análise pós-live**, sem precisar de nenhuma tabela ou tela nova. A decisão mais importante deste documento não é "quais métricas existem" — é que **metade das métricas listadas pelo pedido original não precisa de painel nenhum, precisa só dos logs que acabamos de instrumentar** sendo lidos com a pergunta certa depois.
