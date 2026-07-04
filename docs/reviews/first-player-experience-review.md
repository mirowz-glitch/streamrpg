# First Player Experience Review (0–2 horas)

**Status: 🟠 Auditoria — nenhum código, nenhum sistema, nenhuma
documentação existente alterada.** Baseada inteiramente no código e
documentação já confirmados ao longo desta sessão (rotas, hooks,
páginas, Systems, Technical Design, Bible) — não assume nada não
verificado.

---

## 1. Jornada completa

1. **Login Twitch.** `/api/auth/login` gera URL OAuth + cookie de estado.
   Twitch autentica. `/api/auth/callback` troca o código, busca o
   usuário, cria (se novo) ou atualiza o `profile`, conecta
   automaticamente um `streamer_channel` para esse mesmo perfil (todo
   jogador também vira um canal potencial, mesmo que nunca vá transmitir
   — efeito colateral do fluxo atual, não um recurso desenhado), cria
   sessão, redireciona para `/app/character`.
2. **Criação do personagem.** Acontece **dentro** do callback OAuth, sem
   nenhuma tela própria: `level=1, xp=0, gold=0, total_minutes=0`. O
   jogador não escolhe nome, aparência, classe (não existe) nem vê
   qualquer cerimônia de criação — simplesmente aparece na página de
   personagem já existindo.
3. **Primeiro ping.** O jogador precisa **digitar manualmente** o login
   Twitch do canal que está assistindo (`CharacterPage`, campo de texto)
   — não há detecção automática (a página web não sabe que aba/stream
   está aberta). Depois disso, `usePing` dispara automaticamente e se
   repete a cada cooldown enquanto a aba ficar aberta.
4. **Primeiro XP.** **Nunca chega na resposta do ping** —
   `xp_gained` é sempre `0` na resposta HTTP (débito UI-001 já
   documentado). O XP real é concedido de forma assíncrona pelo tick da
   Engine (60s), completamente desacoplado do clique do jogador. Mesmo
   chamando `refresh()` logo após o ping, o XP mostrado normalmente
   ainda é o valor antigo.
5. **Primeiro Gold.** É o único passo que funciona de forma síncrona e
   visível — `gold_gained` chega correto na resposta do ping, e o
   `refresh()` seguinte já mostra o valor atualizado.
6. **Primeiro Drop.** Rola silenciosamente no tick da Engine (15% de
   chance) — e, por um bug matemático já documentado (mesmo `rng`
   reaproveitado entre o gate de chance e a seleção de raridade), **100%
   dos drops resolvem como `common`**. Nenhuma notificação aparece — o
   campo `drop` da resposta do ping é sempre `null`.
7. **Primeiro equipamento.** Só acontece se o jogador for **ativamente**
   até `/app/inventory` — nada o avisa que ganhou algo. Uma vez lá, o
   fluxo funciona bem: lista de itens, cor por raridade, badge de
   comparação (▲/▼/=), confirmação "Item equipado!" ao clicar.
8. **Primeiro Boss.** Roda de verdade no servidor (Sprints Boss
   Integration → Combat Model Runtime), com dano real dependente de
   level/equipamento — mas **não existe nenhuma interface para ele**.
   Sem barra de vida, sem notificação de nascimento/vitória/fuga, sem
   qualquer sinal de que um Boss existiu. A única "evidência" seria um
   ganho de XP/item que o jogador não consegue distinguir de um drop
   comum, porque os dois são igualmente invisíveis.
9. **Primeiro inventário.** Página funcional e a experiência mais
   completa do produto hoje — mas passiva: o jogador só a visita se
   lembrar de checar por conta própria.
10. **Primeiro objetivo futuro.** Não existe nenhum. Sem Quest, sem
    mapa, sem próximo marco anunciado. O único "objetivo" implícito é o
    Ranking (existe, funciona, mas não é destacado nem comparado ao
    estado anterior — é um retrato estático a cada visita).

---

## 2. Momentos de recompensa

| Momento | Existe? | Funciona? | É visível? | Gera emoção? |
|---|---|---|---|---|
| Level Up | Sim | Sim (cálculo correto) | **Não** — popup morto (UI-001) | Praticamente nenhuma |
| Primeiro item (drop) | Sim | Sim, mas sempre `common` | **Não** — sem notificação | Nenhuma no momento; leve só ao descobrir no Inventário |
| Equipar arma | Sim | Sim, completo | Sim — mensagem + badge de comparação | A melhor da lista, ainda modesta |
| Matar Boss | Sim (backend) | Sim (fórmula real) | **Não** — zero UI | Nenhuma |
| Ranking | Sim | Sim (corrigido, sem staleness) | Sim, página própria | Fraca — sem "você subiu 3 posições" |
| Descobrir região | **Não existe** | — | — | — |

---

## 3. Momentos mortos

1. **Primeiro minuto após login** — nenhuma orientação sobre o que
   fazer com o campo de canal. Sem feedback, sem objetivo declarado.
2. **Espera pelo primeiro tick** (até 60s) — Gold sobe visivelmente,
   XP/Level/Drop não mudam de forma perceptível nenhuma vez, durante
   toda a sessão. Dura a sessão inteira, não só o início.
3. **Entre drops** — com 15%/tick, a média é de ~6-7 minutos sem nada
   novo, e o que chega no fim ainda é sempre comum. Sem feedback em
   tempo real, sem objetivo guiando essa espera.
4. **Depois de equipar o primeiro item comum** — sem próximo marco
   anunciado, platô até o próximo drop (também invisível, também comum).
5. **Qualquer Boss que aconteça** — o único evento coletivo do jogo
   passa despercebido inteiramente, sem aviso, sem clímax, sem
   celebração.
6. **A partir de ~15-20 minutos** — nada de conteúdo novo aparece;
   resta só o número subindo, sem mundo, exploração ou combate visível.

---

## 4. Motivação por janela de tempo

- **10 minutos:** o mais forte — novidade do login via Twitch, ver o
  personagem existir com o próprio nome, Gold subindo em tempo real
  (o único feedback instantâneo do jogo), talvez o primeiro item (~78%
  de chance em 10 ticks).
- **30 minutos:** Gold já não tem para onde ir (sem sink), XP/Level
  seguem invisíveis, itens repetidos em raridade `common` perdem
  novidade. Motivação passa a depender quase inteiramente da própria
  live, não da camada de jogo.
- **1 hora:** Gold virou um número sem sentido, nenhuma variedade nova
  de recompensa, Boss (se aconteceu) passou batido. A camada de RPG já
  não está gerando motivação própria mensurável.
- **2 horas:** sem diferença estrutural em relação a 1 hora — nenhum
  novo tipo de conteúdo é introduzido em nenhum momento da sessão.

---

## 5. Economia

- **Conseguir equipamentos melhores?** Motivo real existe **matematicamente**
  desde a Sprint Combat Model Runtime (equipamento melhor = mais dano
  contra Boss), mas é **invisível na prática** — sem UI de Boss, o
  jogador não tem como perceber esse benefício.
- **Explorar?** Nenhum motivo — não existe nada para explorar no código
  hoje (World Design é 100% documento).
- **Matar Boss?** Nenhum motivo perceptível — o jogador não sabe que
  Boss existe.
- **Voltar amanhã?** Nenhum gancho do próprio jogo (sem streak, sem
  diário, sem notificação) — só razões sociais/parassociais ligadas ao
  streamer, não à camada de RPG.

---

## 6. Core Loop real (o que existe hoje, não o planejado)

```
Assistir a live
   ↓
Digitar o canal manualmente  ⚠ sem detecção automática, fricção no minuto 1
   ↓
Ping (a cada 60s)
   ↓
   ├── Gold (+0,3, imediato, visível)         ⚠ sem sink — número sem função
   │
   └── XP (+10, assíncrono)  ⚠ NUNCA visível na resposta do ping (UI-001)
          ↓
       Drop (15%, sempre "common")  ⚠ SEM NOTIFICAÇÃO — bug de RNG conhecido
          ↓
       Equipar  ⚠ exige o jogador ir checar o Inventário por conta própria
          ↓
       "Ficar mais forte"  ⚠ NADA no jogo mostra ou confirma isso
          ↓
       Boss (roda no servidor)  ⚠ TOTALMENTE INVISÍVEL — zero UI, zero notificação
          ↓
       Recompensa de Boss  ⚠ mesma invisibilidade do drop comum
          ↓
       Repetir  ⚠ SEM NENHUM OBJETIVO NOVO aparecendo neste ponto
```

O loop **existe e não quebra tecnicamente** — mas quase todo elo depois
de "Ping" é invisível, sem destino (Gold) ou sem objetivo declarado
(repetir o quê, buscando o quê).

---

## 7. Os 10 maiores gargalos, por impacto

1. XP/Level/Drop invisíveis em tempo real (UI-001) — o maior de todos,
   faz o loop de recompensa parecer ausente mesmo funcionando por
   baixo.
2. Boss sem nenhuma interface — um sistema real e funcional,
   completamente não sentido por ninguém.
3. Bug de RNG — 100% dos drops resolvem `common`, mesmo se ficassem
   visíveis, a sensação de raridade estaria quebrada.
4. Gold sem nenhum sink — cresce sem propósito.
5. Nenhum sistema de objetivo/Quest — nada direciona o jogador além de
   "assistir e esperar".
6. Campo de canal manual, sem detecção automática — fricção real no
   primeiro minuto.
7. Nenhum conteúdo de mundo/região/exploração — o jogo é só um número
   subindo.
8. Nenhuma representação visual do personagem/combate — tudo é texto e
   número.
9. Nenhuma dimensão social/comunitária do Boss ou dos drops — nem o
   único evento coletivo é celebrado com o chat.
10. Nenhum onboarding no primeiro login — o jogador não sabe o que
    fazer nem o que esperar.

---

## 8. Quick wins (menos de 1 dia, sem arquitetura nova)

- Preencher `xp_gained`/`leveled_up`/`drop` de verdade na resposta do
  ping (reativa dois elementos de UI que já existem e já estão mortos —
  `.level-up`/`.drop-alert` — sem nenhuma peça nova).
- Corrigir o texto desatualizado "5 minutos" no Overlay e a janela de
  300s ainda divergente em `channel.service.ts` (achados já registrados,
  nunca corrigidos).
- Destacar mais o parâmetro `?canal=` já existente (ou adicionar uma
  linha de instrução simples na página de personagem) para reduzir a
  fricção do primeiro minuto.
- Uma frase de onboarding na primeira visita ("digite o canal da Twitch
  que você está assistindo para começar a ganhar XP").
- Um contador simples de dias seguidos ou "última vez que você jogou" —
  pequeno gancho de retorno, sem arquitetura nova.

---

## 9. Notas do MVP

| Critério | Nota | Justificativa |
|---|---|---|
| Diversão | 2/10 | Quase todo o jogo é um número subindo sem retorno perceptível; a única interação satisfatória (equipar item) é pequena e rara |
| Clareza | 3/10 | Sem onboarding, campo de canal manual sem explicação, nenhuma confirmação de XP/drop/Boss |
| Progressão | 4/10 | Matematicamente real e correta, mas quase toda invisível em tempo real |
| Economia | 1/10 | Gold sem sink, drop sempre `common`, Marketplace inexistente |
| Cooperação | 1/10 | Boss é o único sistema cooperativo e é totalmente invisível |
| Rejogabilidade | 2/10 | Nada muda de sessão para sessão |
| Retenção | 2/10 | Nenhum gancho de retorno próprio do jogo |
| Potencial de Stream | 5/10 | Overlay funciona bem visualmente (lista de viewers, XP bar, arma equipada) — a parte mais pronta do produto — mas perde o maior gancho (Boss visível) |
| Potencial Viral | 2/10 | Nada visualmente distinto ou compartilhável hoje |

---

## 10. Estimativa final

**"Se este jogo fosse lançado hoje para 100 streamers pequenos, quantos
continuariam jogando depois de uma semana?"**

**Estimativa: entre 10 e 15 de 100.**

**O que sustenta esse número, não zero:** o núcleo técnico realmente
funciona sem quebrar — login, sessão, ping, Gold, XP/Level real
(mesmo invisível), Drop real (mesmo sempre comum), Inventário completo,
Ranking correto, e agora até Boss com matemática real por trás. Nada
trava, nada exige suporte técnico constante, e o Overlay já é
apresentável numa transmissão de verdade. Streamers que gostam da ideia
de "ter um overlay de RPG" por motivo estético/comunitário têm motivo
para manter, independente da profundidade de jogo.

**O que pesa contra, e por quê o número não é maior:** quase todo
elemento que deveria gerar a sensação de "estou progredindo" é invisível
(UI-001, Boss sem interface) — um jogador que não sabe que ganhou XP,
não sabe que dropou item, e não sabe que um Boss aconteceu não tem como
sentir que está jogando um RPG, só que está numa aba aberta enquanto
assiste a live. Sem sink de Gold, sem Quest, sem exploração e com um bug
de raridade que neutraliza a única fonte de variedade (itens), a camada
de jogo não dá nenhum motivo específico para voltar amanhã — só motivos
que já existiam antes do jogo existir (gostar do streamer, gostar da
comunidade). A estimativa de 10-15% reflete isso: o suficiente para não
ser zero (o sistema não quebra, e alguns vão gostar do overlay por si
só), mas longe de ser um produto que retém pela própria força de jogo.
