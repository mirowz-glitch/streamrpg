# Gameplay Vertical Slice — Player Experience (Phase I)

Sessão real jogada como um jogador novo jogaria: servidor de dev rodando localmente, navegador real, cliques reais no botão "Avançar" em `/app/adventure` (nenhuma URL secreta, nenhum atalho de engenharia — a mesma rota acessível a partir do menu principal). Nenhuma alteração de produção foi feita. Nenhuma investigação matemática adicional — só observação direta da experiência.

**Resposta à Objetivo Principal**: em 20 minutos, um jogador novo experimenta uma sequência real de vitórias, level ups, um Elite, e seu primeiro equipamento — mas também descobre, sem nenhum aviso, que sair da aba Aventura apaga tudo, e que os menus "Personagem"/"Inventário" não refletem nada do que ele acabou de conquistar. **O maior atrito encontrado nesta Sprint não é de conteúdo nem de balanceamento — é a desconexão entre a demo jogável (Aventura, sem login) e a persistência real (Personagem/Inventário, atrás de login), que juntas fazem a Aventura parecer, para um jogador novo, um jogo que "esquece" o que ele fez.**

---

## 1. Jornada Completa (Fase 1)

| Tempo (relógio do jogo) | Evento | Contexto | Sensação esperada | Feedback visual existente |
| --- | --- | --- | --- | --- |
| 0:00 | Sessão inicia em Bosque Sussurrante, Nível 1, 145/145 HP | Objetivo "Primeira Caçada" (derrote 5) já visível | Chegada, orientação | HUD completo desde o 1º frame — nível, XP, objetivo, facção, região, timeline vazia |
| 0:34 | **Primeiro combate + primeira vitória** | 1 inimigo, 70 de dano causado | "Eu consigo lutar" | "🔥 Novo recorde de dano: 70" — só texto na barra de estatísticas, sem destaque visual próprio na tela |
| ~0:48 | Expedição "Queda da Fortaleza Sombria" iniciada automaticamente + Boss Final revelado (Guardião Esquecido) | Nenhuma ação do jogador — começou sozinha, junto com o 2º combate | Confuso: um sistema de "Expedição"/"Checkpoint 0/35"/"Boss Final" aparece sem explicação, antes mesmo do jogador entender o combate básico | Só texto na timeline, sem tutorial/tooltip |
| 1:10 | **Primeiro loot** (2 itens: Adaga Comum, Botas Mágico) + "Novo melhor item" | 5º encontro, 6º abate | "Achei algo!" | "🏆 Novo melhor item: dagger" na barra de estatísticas — mas nenhum popup/destaque na timeline em si, e nenhum dos 2 itens foi equipado |
| 1:10 | Objetivo concluído: "Primeira Caçada" (+30 XP) | Novo objetivo aparece imediatamente: "Segredos das Ruínas" (reputação) | Realização | Só uma linha na timeline — sem celebração distinta de um "Encontro concluído" comum |
| 2:10 | **Primeiro Level Up** (Nível 1→2) | 10º abate | Marco importante — "estou ficando mais forte" | "Nível 2 alcançado!" — uma linha de texto na timeline, MESMA formatação de "1 inimigo derrotado". Nenhuma distinção visual perceptível no HTML/texto da página |
| 1:10–5:46 | **5 itens encontrados, 0 equipados** (persistindo por ~4,5 minutos de jogo) | 18+ abates, loot comum/raro variado | Sem explicação na tela de por que nada foi equipado | Nenhuma — o jogador não tem como saber se os itens são piores, se o Auto Equip está desligado, ou se há um bug |
| 3:59 | HP cai pra 15% (28/189) | Sem grande cura disponível, só "+2 HP" por tick | Tensão real — quase morre | Barra de vida muda de valor, mas nenhum alerta/aviso de "vida baixa" percebido no conteúdo da página |
| 4:56 | **Primeiro Elite** — "Boar" avistado e derrotado (+74 XP) | 21º encontro | Marco de conteúdo especial — deveria parecer diferente de um combate comum | "Elite avistado" + "Elite derrotado" na timeline — mesmo formato de texto que qualquer outra linha |
| 4:56 | **Primeiro equipamento de verdade**: Botas Raras (Power Score 23) equipadas | Mesmo encontro do Elite | "Fiquei mais forte de verdade" | "Equipado: Botas no slot Botas" — mesma linha de texto simples |
| 4:56 | Primeira reputação de facção ganha (+4, Guardiões da Floresta) | Mesmo encontro | Novo sistema aparecendo (Facção) | Barra de progresso de facção já visível desde o início, mas o ganho em si só aparece como texto na timeline |
| 5:46 | Nível 3 alcançado, HP recuperando (18%, subindo) | 24 encontros, 31 abates | Sobrevivi ao momento de perigo | Igual aos outros level ups — texto simples |
| **N/A** | **Ao navegar para "Personagem"**: "Faça login para ver seu personagem." | Nenhum aviso prévio de que isso aconteceria | Confusão — "onde está meu personagem que eu acabei de jogar?" | Bloqueio total, sem contexto |
| **N/A** | **Ao navegar para "Inventário"**: "Seu inventário está vazio. Continue assistindo — drops têm boa chance a cada minuto de presença." | Mensagem fala de "assistir" (mecânica antiga de espectador de stream), não tem NENHUMA relação com o que acabou de acontecer na Aventura | Confusão mais profunda — 2 sistemas de jogo parecem não se conhecer | Nenhum aviso de que Inventário ≠ Aventura |
| **N/A** | **Ao voltar para "Aventura"**: sessão inteira resetada — Nível 1, 0 XP, 0 itens, timeline vazia | Nenhuma confirmação, nenhum aviso, nenhuma forma de desfazer | **Sensação de perda/traição** — tudo que foi conquistado nos primeiros ~6 minutos desapareceu | Nenhum — a página recarrega como se fosse a primeira visita |

Primeiro Boss (Final) e primeira derrota não ocorreram dentro desta sessão — o Boss Final exige Checkpoint 35/35 (chegamos a 6/35 em quase 6 minutos de jogo simulado), e o personagem nunca morreu (chegou a 15% de vida e se recuperou). Ambos ficam fora do alcance realista de uma sessão de 20-30 minutos jogada manualmente neste ritmo — um achado em si (ver Seção 3).

---

## 2. Momentos Memoráveis (Fase 2, ordenados por impacto positivo)

1. **A Cidade (Capital)** — não faz parte do loop de Aventura em si, mas é, de longe, a superfície com mais identidade e personalidade do jogo: relógio ao vivo, população online, "kingdom news" ambiente ("Hoje muitos viajantes comentam sobre: O Caminho que Sussurra Nomes", "Uma pena negra cai devagar entre os viajantes"), 13 edifícios temáticos, 24 objetos clicáveis com curiosidades do dia. Isso é um diferencial real e um forte candidato a trailer.
2. **O primeiro Elite** (Boar) — é o primeiro momento em que o jogo diz "isto é especial" de forma explícita (nome, XP bônus, item garantido) — mas o tratamento visual (mesma linha de texto que qualquer abate) desperdiça a oportunidade.
3. **Primeiro equipamento real** (Botas Raras) — coincide com o Elite, criando um "combo" de bons momentos na mesma janela de tempo — mas, de novo, sem nenhum destaque visual próprio.
4. **A curva de XP/objetivos encadeados** — "Primeira Caçada" → "Segredos das Ruínas" aparece imediatamente ao completar o anterior, sem hiato — boa continuidade percebida.
5. **O sistema de Facção/Expedição/Boss Final revelado logo de cara** — tem potencial (dá um horizonte de longo prazo desde o minuto 1), mas hoje é só ruído: nenhuma explicação do que "Checkpoint 0/35" significa pra quem acabou de abrir o jogo.

---

## 3. Pontos de Atrito (Fase 4, priorizados)

### Alto Impacto

1. **Perda total de progresso ao navegar pra fora da Aventura, sem aviso.** Depende de engenharia/arquitetura (estado da sessão só existe em memória do componente React, nunca persistido sem login) — mas a CORREÇÃO mais simples é de UX/apresentação: um aviso claro ("Faça login pra não perder seu progresso") resolveria a maior parte do dano de percepção sem tocar arquitetura nenhuma.
2. **"Personagem" e "Inventário" não refletem nada da Aventura sem login, e a mensagem do Inventário ("continue assistindo") é de um sistema diferente (o modelo antigo de espectador Twitch), criando uma contradição direta com o que o jogador acabou de fazer.** Depende de UX/apresentação (mensagem certa, comunicação clara de "isto é uma demo") — não exige mudança de arquitetura pra pelo menos comunicar a situação corretamente.
3. **5 itens encontrados, 0 equipados, por ~4,5 minutos seguidos, sem nenhuma explicação na tela.** Já documentado extensivamente na investigação técnica anterior (Dead Loot ~95%) — mas o ponto novo aqui é de PERCEPÇÃO: mesmo sabendo (pelos relatórios anteriores) que o comportamento é matematicamente esperado, um jogador real não tem CONTEXTO nenhum na tela pra entender isso. É um problema de apresentação, não precisa esperar o redesenho de progressão pra ser parcialmente resolvido (ex.: mostrar "por que não equipei" ao passar o mouse sobre um item no log).
4. **Level Up, Novo Item, Equipar, e Elite Encontrado usam a MESMA formatação de texto simples na timeline** que um "1 inimigo derrotado" comum — os 4 maiores momentos da sessão inteira não se destacam visualmente de eventos rotineiros no conteúdo da página.

### Médio Impacto

5. **Sistema de Expedição/Checkpoint/Boss Final aparece sem nenhuma explicação, na 2ª tick da sessão** — antes mesmo do jogador terminar seu primeiro objetivo simples. Sobrecarrega um jogador que ainda está entendendo o combate básico.
6. **HP caindo a 15% sem nenhum alerta perceptível no conteúdo da tela** (a barra muda de número, mas não há nenhuma mensagem de "cuidado").
7. **O botão "Avançar" é a única interação disponível** — 24+ cliques idênticos pra progredir; nenhuma variação de input do jogador (escolhas, timing, nada) na janela observada.

### Baixo Impacto

8. Textos de sistema (Reputação, Checkpoint) usam nomenclatura de facção/expedição sem contexto prévio (quem são os "Guardiões da Floresta"? por que a reputação importa?) — mais uma questão de onboarding progressivo do que um problema em si.

---

## 4. Melhorias de Alto Impacto, Baixo Risco (Fase 5 — Presentation Opportunities, não implementadas)

Todas abaixo usam sistemas/dados JÁ existentes — nenhuma mudança de Combat Engine, Item Generator, Equipamento, Persistência ou Arquitetura:

- **Aviso persistente e visível** (banner, não modal bloqueante) na Aventura pra visitantes sem login: "Você está jogando uma demonstração — faça login pra salvar seu progresso." Comunicação pura, sem tocar arquitetura.
- **Diferenciar visualmente** (cor, ícone, ou destaque de linha) os 4 eventos de maior impacto na timeline — Level Up, Item Equipado, Elite/Mini-Boss, Novo Melhor Item — dos eventos rotineiros de combate. Já existem componentes de celebração no código (`ProgressionCelebration.tsx`, `LootPopup.tsx`, `EquipmentPopup.tsx`) — a questão é se estão de fato conectados a esses 4 eventos específicos na jornada real observada, ou se a timeline textual está desacoplada deles.
- **Corrigir a mensagem do Inventário vazio** pra refletir o fluxo de Aventura atual (encontrar itens jogando), não a mecânica antiga de "assistir" — 1 string, zero risco.
- **Adiar a revelação de Expedição/Boss Final** por alguns encontros (ex.: só depois do 1º objetivo concluído), dando espaço pro jogador entender o loop básico primeiro — mudança de sequenciamento de UI, não de sistema.
- **Um indicador simples de "por que este item não foi equipado"** (ex.: comparação de Power Score visível ao passar o mouse) — resolveria boa parte da confusão do Atrito #3 sem esperar nenhum redesenho de progressão.
- **Um aviso de "vida baixa"** quando o personagem cai abaixo de ~25% de HP — reaproveita o dado que já existe (`currentLife`/`maximumLife`), só precisa de um estado visual condicional.

---

## 5. Commercial Impact

**O que mais aumentaria a chance de recomendação após a 1ª sessão**: resolver a perda de progresso silenciosa (Atrito #1/#2). Nenhuma quantidade de polimento de partículas ou som compensa a sensação de "o jogo apagou meu progresso sem avisar" — esse é o tipo de momento que gera reclamação pública (review negativa, clipe de stream reclamando), não recomendação. É também, coincidentemente, a correção de MENOR risco técnico de toda a lista (uma mensagem, não uma mudança de arquitetura).

**Candidatos a trailer**: a Cidade (ambiente vivo, "kingdom news", 24 objetos interativos) é hoje o maior diferencial visual do projeto — mais do que qualquer momento de combate observado nesta sessão. O momento do Elite + equipamento real coincidindo (minuto ~5) também é um bom candidato, SE recebesse tratamento visual à altura (hoje é texto plano).

**A progressão parece interessante?** Sim, na estrutura (objetivos encadeados, Facção, Expedição, Elite) — mas a experiência de "ficar mais forte" fica invisível na prática (Atrito #3/#4), o que é exatamente o achado da investigação técnica anterior, agora confirmado na prática: o jogo ESTÁ gerando os eventos certos, mas não está COMUNICANDO a maioria deles com destaque.

---

## 6. Diagnóstico Final (Critérios de Aprovação)

- ✅ Mapa completo da primeira sessão (Seção 1).
- ✅ Lista priorizada de atritos (Seção 3).
- ✅ Lista priorizada de momentos memoráveis (Seção 2).
- ✅ Oportunidades de melhoria de alto impacto e baixo risco (Seção 4).

**Diferenciação Engenharia vs. UX vs. Game Design** (conforme exigido):
- **Engenharia** (mudaria arquitetura, fora do escopo desta Sprint): persistir a sessão de Aventura sem exigir login; unificar Inventário/Personagem com o estado da Aventura.
- **UX/Apresentação** (baixo risco, alto impacto, disponível agora): avisos de sessão temporária, destaque visual de eventos importantes, correção de mensagens desatualizadas, indicador de "por que não equipou".
- **Game Design** (já encerrado como linha de investigação, per `equipment-progression-investigation-conclusions.md`): o modelo de progressão em si.

---

## 7. Roadmap Atualizado (Fase 6 → Entrega 6)

Considerando tudo aprendido na investigação de equipamentos (8 Sprints, causa raiz estrutural, não técnica) e nesta sessão real de playtest, a prioridade imediata do roadmap de valorização (`project-valuation-roadmap.md`) deveria mover pra cima:

1. **Comunicação de sessão temporária / risco de perda de progresso** (Atrito #1/#2) — maior risco de percepção negativa, menor custo de correção.
2. **Destaque visual dos 4 momentos de maior impacto** (Level Up, Equipar, Elite, Melhor Item) — maior alavanca de "sensação de recompensa" que qualquer ajuste de balanceamento faria neste momento.
3. **Correção da mensagem do Inventário** — trivial, remove uma contradição direta visível a qualquer novo jogador.
4. Só depois disso, avaliar se vale investir em qualquer decisão de modelo de progressão (`equipment-progression-investigation-conclusions.md`, Seção 4) — e mesmo essa avaliação deveria vir de playtest real, não de mais simulação.

---

## Validação

- **Sessão real**: ~6 minutos de jogo simulado (~24 encontros, 31 abates, 3 níveis, 1 Elite, 1 equipamento real), jogada manualmente via clique real em `/app/adventure`, servidor de dev local.
- **Nenhuma alteração em produção.**
- **Nenhuma investigação matemática adicional** — só observação qualitativa.
- Console do navegador sem erros durante toda a sessão.
