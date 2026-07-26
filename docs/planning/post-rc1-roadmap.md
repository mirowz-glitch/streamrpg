# Roadmap Pós-RC1 — Plano Estratégico

Documento estratégico, não gera código. Define a sequência das próximas grandes fases de desenvolvimento após o congelamento do [Vertical Slice RC1](../releases/vertical-slice-rc1/RC1-SNAPSHOT.md), priorizando entrega de valor pro jogador e respeitando dependências técnicas já identificadas em Sprints anteriores.

Complementa (não substitui) `commercial/roadmap/project-valuation-roadmap.md` — aquele documento governa a prioridade comercial (Visual Polish/Identity/Trailer/Steam Page como caminho crítico até um publisher); este aqui detalha especificamente a sequência de **conteúdo e sistemas de jogo** que vem depois do RC1.

---

## Visão Macro

```
RC1 (congelado)
  │
  ├─▶ 1. Eventos Dinâmicos          (Alta, Pequeno)
  ├─▶ 2. Conteúdo de Endgame        (Alta, Médio)
  ├─▶ 8. Polimento Visual/Sonoro    (Alta, Grande — pode rodar em paralelo aos itens 1-2)
  │
  ├─▶ 3. Novas Regiões              (Média, Médio)
  ├─▶ 6. Progressão de Longo Prazo  (Média, Médio — depende de 2+3)
  │
  ├─▶ [DECISÃO DE ARQUITETURA: Gold ownership — ver dívida técnica A2]
  │     │
  │     ├─▶ 4. Economia              (Média, Grande)
  │     └─▶ 5. Crafting               (Baixa, Grande — depende de 4)
  │
  ├─▶ 7. Recursos de Streamer/Twitch/OBS   (Média, Médio — independente do resto)
  │
  └─▶ 9. Preparação Early Access/Steam     (Alta, Médio — converge tudo acima)
```

A execução de playtests externos (`docs/playtesting/`) roda **em paralelo a tudo**, desde já — não espera nenhum item terminar.

---

## 1. Eventos Dinâmicos (expandir World Events)

- **Objetivo**: aumentar a variedade de momentos "algo está acontecendo agora" durante uma Aventura, sem tocar a arquitetura já validada (Treasure/Merchant/Shrine/Discovery/Ambush).
- **Dependências**: nenhuma — o sistema (`packages/shared/src/worldevents/`) já existe e suporta novos dados sem mudança estrutural.
- **Impacto esperado no gameplay**: alto retorno por esforço — mais surpresa/variedade percebida numa campanha longa, sem risco de regressão.
- **Riscos**: baixo. Risco principal é inflar a lista de eventos sem calibrar frequência/recompensa (repetir o erro já corrigido em Sprints de Balance anteriores).
- **Prioridade**: Alta.
- **Esforço**: Pequeno.

## 2. Conteúdo de Endgame

- **Objetivo**: dar aos personagens que já concluíram as 4 masmorras existentes uma razão pra continuar jogando (variações de dificuldade, chefes secundários, ou objetivos pós-masmorra).
- **Dependências**: Global Gameplay Rebalance (concluído) — os 4 chefes só voltaram a ser desafiadores nessa Sprint; construir endgame antes teria sido retrabalho.
- **Impacto esperado no gameplay**: alto — resolve a pergunta óbvia de "e depois da 4ª masmorra?" que hoje não tem resposta.
- **Riscos**: médio — decisão de design ainda não tomada sobre a FORMA do endgame (New Game+, dificuldade escalada, conteúdo novo). Definir a forma antes de implementar.
- **Prioridade**: Alta.
- **Esforço**: Médio.

## 3. Novas Regiões e Expansão do Mapa

- **Objetivo**: adicionar regiões além das 9 atuais, seguindo o padrão já 9x replicado (Region + Encounter Table + Enemy Template + Loot Table).
- **Dependências**: item 2 (decidir profundidade — endgame nas regiões existentes — antes de amplitude — regiões novas).
- **Impacto esperado no gameplay**: médio-alto — mecanicamente repetitivo de construir, mas cada região nova é conteúdo genuinamente novo pro jogador.
- **Riscos**: médio — cada região nova precisa herdar a calibração da Continuous Affix Scaling/Global Gameplay Rebalance, não a antiga (erro já cometido e corrigido uma vez nesta linha do tempo).
- **Prioridade**: Média.
- **Esforço**: Médio.

## 4. Economia (ouro, comerciantes, compra e venda)

- **Objetivo**: dar função de gasto real ao ouro (hoje só acumula, sem sink) e abrir o Mercador/Alquimista da Cidade (hoje rotulados "em construção").
- **Dependências**: **bloqueante** — a decisão de arquitetura de Ouro (emissão via Engine vs. ledger/gasto transacional) precisa ser tomada e congelada ANTES de qualquer linha de código de Economia (ver dívida técnica A2). Construir em cima do modelo atual de ouro geraria dívida técnica imediata, o mesmo padrão que 6 Sprints de Item Generator já ensinaram a evitar.
- **Impacto esperado no gameplay**: alto — jogadores já perguntam "pra que serve o ouro" (Limitação Conhecida L5 do known-issues).
- **Riscos**: alto se a decisão de arquitetura for pulada; baixo se for resolvida antes.
- **Prioridade**: Média (alta depois que a decisão de arquitetura estiver resolvida).
- **Esforço**: Grande.

## 5. Crafting e Evolução de Equipamento

- **Objetivo**: dar ao jogador agência direta sobre o próprio equipamento (além de "achar item melhor").
- **Dependências**: item 4 (Economia — crafting sem sink de recursos vira só "mais um jeito de achar item") **e** confirmação por playtest de que falta agência sobre equipamento (hipótese ainda não validada com jogador real).
- **Impacto esperado no gameplay**: potencialmente alto, mas especulativo até validado.
- **Riscos**: alto — risco real de fragmentar de novo o sistema de item que a Continuous Affix Scaling acabou de unificar. Só avançar com evidência de playtest, não por intuição.
- **Prioridade**: Baixa (até o playtest confirmar a necessidade).
- **Esforço**: Grande.

## 6. Eventos Dinâmicos Durante a Aventura — Progressão de Longo Prazo (prestígio/renome)

- **Objetivo**: dar sentido a continuar jogando o MESMO personagem além do nível máximo atual (`MAX_LEVEL`), via prestígio, renome, ou sistema equivalente.
- **Dependências**: itens 2 e 3 — "campanha longa" só tem sentido definido depois que existir endgame e/ou regiões novas pra sustentar essa duração.
- **Impacto esperado no gameplay**: médio-alto no longo prazo, mas toca duas hipóteses de design ainda não promovidas a princípio (Character Legacy — Estado/Legado separados, legado como valor de mercado não-poder; "Escala aumenta opções, não poder" — escala numérica não deveria ser a única forma de progressão) — nenhuma das duas tem evidência de playtest ainda, ambas devem ser revisitadas explicitamente antes de qualquer implementação aqui.
- **Riscos**: alto se implementado sem decisão de design real primeiro — é hipótese, não especificação.
- **Prioridade**: Média.
- **Esforço**: Médio.

## 7. Recursos para Streamers e Integração Twitch/OBS

- **Objetivo**: expandir além do XP automático assistindo a uma live (já funcional) — comandos de chat, overlays dedicados, notificações de eventos do Reino na tela do streamer.
- **Dependências**: nenhuma técnica — pode rodar em paralelo a qualquer item acima, já que a base de autenticação/sessão Twitch já existe e está estável.
- **Impacto esperado no gameplay**: médio pro jogador comum, alto pra proposta de valor específica do produto (é o gancho comercial único do projeto — ver `project-valuation-roadmap.md` Seção 6/7).
- **Riscos**: baixo tecnicamente; risco de escopo (fácil inflar essa frente indefinidamente) — definir um recorte mínimo antes de começar.
- **Prioridade**: Média (Alta se o próximo marco comercial for demonstração pra publisher, ver roadmap comercial).
- **Esforço**: Médio.

## 8. Polimento Visual e Sonoro

- **Objetivo**: animação, som, partículas, ícones de raridade, identidade visual própria (hoje 100% emoji) — o item já identificado como "Crítico" pro valor percebido no roadmap comercial.
- **Dependências**: nenhuma técnica — pode e deve rodar em paralelo aos itens 1-3, idealmente ANTES de novo conteúdo (regiões/endgame) precisar ser apresentado sem esse polimento.
- **Impacto esperado no gameplay**: o maior salto de percepção "protótipo → produto" de toda esta lista, segundo a própria auditoria comercial.
- **Riscos**: baixo pra gameplay, alto em esforço subestimado se tratado como item único (é múltiplas frentes: animação, som, partícula, ícone, fonte, paleta, HUD).
- **Prioridade**: Alta.
- **Esforço**: Grande.

## 9. Preparação para Early Access / Steam

- **Objetivo**: Steam Page, trailer, presskit, pitch deck — converter o RC1 (e os itens 1/2/8 acima) num pacote apresentável.
- **Dependências**: idealmente pelo menos os itens 1, 2 e 8 (conteúdo + polimento) prontos primeiro — uma Steam Page/trailer sem esse trabalho mostraria um produto ainda cru.
- **Impacto esperado no gameplay**: nenhum (não é gameplay, é go-to-market) — mas é o item que converte todo o trabalho anterior em oportunidade comercial real.
- **Riscos**: baixo, é trabalho de curadoria/produção, não de código novo.
- **Prioridade**: Alta (mas sequenciada depois do conteúdo/polimento, não em paralelo).
- **Esforço**: Médio.

---

## Recomendação de Sequência

**Fase A (paralela, começa já)**: 8 (Polimento) + 1 (Eventos Dinâmicos) + playtests externos em execução contínua.

**Fase B**: 2 (Endgame) → 3 (Novas Regiões) → 6 (Progressão de Longo Prazo), nessa ordem — cada um usa evidência do anterior pra reduzir risco do próximo.

**Fase C (gate de decisão)**: resolver a decisão de arquitetura de Ouro (dívida técnica A2) — só então entrar em 4 (Economia) → 5 (Crafting), nessa ordem, e só depois de confirmação por playtest para o item 5.

**Fase D (independente, qualquer momento)**: 7 (Streamer/Twitch/OBS) — não bloqueia nem é bloqueado por nada acima.

**Fase E (convergência)**: 9 (Steam/Early Access) — depois que Fase A e parte da Fase B estiverem maduras o suficiente pra serem mostradas.

O projeto sai definitivamente da fase de fundação neste ponto: RC1 encerra "construir os sistemas base"; este roadmap abre "produzir conteúdo e preparar lançamento" como as duas frentes paralelas que definem o resto do desenvolvimento.
