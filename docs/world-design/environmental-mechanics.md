# Environmental Mechanics — Rascunho de World Design

**Status: 🟠 Rascunho.** Não é capítulo da Bible. Toda mecânica aqui precisa
eventualmente encaixar na fórmula de dano já fechada no capítulo 6 da Bible
(`Base × Equipamentos × Classe × Critical`, sem RNG pesado além da pequena
chance de crítico) — nenhuma mecânica aqui deveria introduzir uma segunda
fonte de aleatoriedade pesada. Onde isso parecer necessário, é sinalizado
como pergunta em aberto, não resolvido aqui.

Princípio geral (herdado da sessão anterior de World Design): cada mecânica
ambiental deve ser um **teste de preparo** (equipamento, resistência,
build escolhida antes), nunca um teste de reação — mesma lógica já usada
para mecânicas de Boss.

---

## Veneno (Pântano Podre)

- **Efeito:** dano contínuo ao longo do tempo, reduz também a eficácia de
  cura recebida enquanto ativo.
- **Como influencia combate:** transforma "quanto tempo o grupo aguenta"
  em uma variável própria, separada de HP bruto — um grupo com alta
  defesa mas sem resistência a veneno ainda sofre desgaste.
- **Mitigação:** resistência a veneno (equipamento/build), ou reduzir
  tempo de exposição (rota mais rápida, ver [roads.md](roads.md)).
- **Regra de preparo:** o grupo decide antes de entrar se está preparado
  — não há como reagir a veneno já aplicado sem mitigação pré-existente.

## Gelo (Picos Congelados)

- **Efeito:** reduz frequência de ação do grupo inteiro (lentidão
  ambiental, não um debuff de combate isolado).
- **Como influencia combate:** compensa a força bruta dos inimigos da
  região — o desafio real é "quantas ações o grupo consegue executar",
  não "quanto dano os inimigos causam por golpe".
- **Mitigação:** builds de alta frequência de ação absorvem melhor a
  penalidade proporcionalmente; equipamento de resistência ao frio (Vila
  Refúgio Gélido) reduz o efeito.
- **Regra de preparo:** equipamento térmico é obtido antes da expedição,
  na Vila regional — reforça o propósito da Vila existir.

## Lava (candidata para região futura, não implementada nas 10 atuais)

- **Efeito proposto:** dano de área instantâneo em zonas visualmente
  marcadas (rachaduras no chão, brilho vermelho) — dano por posição, não
  por tempo.
- **Como influenciaria combate:** a única mecânica ambiental puramente
  posicional cogitada até agora — precisa de uma região própria (ver
  [future-expansion.md](future-expansion.md)), nenhuma das 10 regiões
  atuais tem esse traço.
- **Risco identificado:** posicionamento não existe como mecânica no MVP
  de combate (capítulo 6 da Bible exclui Posicionamento explicitamente
  do MVP) — esta mecânica não pode ser implementada antes disso mudar.

## Escuridão (Minas Abandonadas)

- **Efeito:** reduz alcance de detecção de encontro, aumentando a chance
  de combate começar em desvantagem (o grupo "tropeça" no inimigo, não o
  vê chegando).
- **Como influencia combate:** transforma preparo antecipado (itens/
  build de detecção, se vierem a existir) em vantagem real, sem ser um
  debuff de dano direto.
- **Mitigação:** tochas/itens de iluminação (item temático, não decidido
  como mecânica formal ainda).
- **Regra de preparo:** de novo, decidido antes da expedição, não durante.

## Vento (Colinas Áridas, secundário)

- **Efeito proposto:** reduz precisão/eficácia de ataques à distância.
- **Como influenciaria combate:** contrabalança o fato de Colinas Áridas
  já favorecer dano em área — se o vento penalizasse especificamente
  ataques à distância de longo alcance, criaria tensão interna dentro da
  própria região (não simplesmente "dano em área bom, resto ruim").
- **Status:** proposta não validada — pode tornar a região confusa
  (dois traços mecânicos competindo) em vez de mais rica. Marcar como
  hipótese, testar isoladamente antes de comprometer.

## Armadilhas (Ruínas Esquecidas)

- **Efeito:** dano pontual ou efeito de controle (atordoamento breve) ao
  entrar em certas salas/trechos.
- **Como influencia combate:** é a única mecânica desta lista que se
  aproxima de "posicional" sem exigir um sistema de posicionamento real —
  a armadilha ativa por **entrar na sala**, não por onde o personagem
  está dentro dela, preservando compatibilidade com o combate automático
  já decidido.
- **Mitigação:** itens de detecção de armadilha (mesma família temática
  da mitigação de Escuridão).

## Neblina (Litoral Quebrado, Pântano Podre secundário)

- **Efeito:** reduz visão a distância — no Litoral, também controla se
  certas criaturas de maré aparecem (ver mecânica de Maré abaixo).
- **Como influencia combate:** mais atmosférico que mecânico no Pântano
  (já coberto por Veneno como traço principal); no Litoral, é o gatilho
  visual da mudança de maré, não uma mecânica de combate isolada.

## Maré (Litoral Quebrado)

- **Efeito:** alterna entre dois estados do mesmo espaço físico — maré
  baixa expõe cavernas e trilhas normais; maré alta esconde essas áreas e
  faz aparecer criaturas de maré exclusivas.
- **Como influencia combate:** é a única mecânica cujo efeito é "o mapa
  muda de conteúdo", não "o combate fica mais difícil" — mais próxima de
  um evento programado (horário) do que de um efeito de status.
- **Regra de preparo:** o grupo escolhe quando partir para a expedição
  sabendo (ou não) o horário de maré — informação disponível, decisão
  estratégica de quando ir.

## Desmoronamento (Minas Abandonadas, secundário)

- **Efeito proposto:** parte de um túnel pode ficar bloqueada
  permanentemente após um evento aleatório de Desmoronamento (ver
  [random-events.md](random-events.md)), forçando uma rota alternativa
  dentro da própria região.
- **Como influenciaria combate:** não afeta combate diretamente — afeta
  a estrutura de exploração da região, criando variedade entre visitas
  diferentes à mesma Mina.

## Magia (Ruínas Esquecidas, secundário; Deserto de Vidro, principal)

- **Efeito:** amplifica dano mágico recebido e causado dentro da região
  (regra simétrica, não só uma penalidade).
- **Como influencia combate:** cria uma região onde builds mágicas se
  destacam claramente sobre builds físicas puras, de forma consistente
  com o traço mecânico já descrito em [regions.md](regions.md).

## Corrupção (Deserto de Vidro)

- **Efeito:** dano contínuo por exposição prolongada à região inteira,
  independente de combate — a região em si "cobra um preço" por estar
  ali, não só os monstros.
- **Como influencia combate:** favorece expedições mais curtas e builds
  com resistência mágica geral — é a mecânica mais punitiva desta lista,
  condizente com o tom da região ("algo terrível aconteceu aqui").
- **Regra de preparo:** resistência mágica equipada antes de entrar é a
  única mitigação — não existe forma de "esperar passar", ao contrário
  da Nevasca (evento temporário) ou da Maré (previsível por horário).

---

## Tabela-resumo (mecânica × região principal)

| Mecânica | Região principal | Tipo de efeito |
|---|---|---|
| Veneno | Pântano Podre | Dano contínuo + cura reduzida |
| Gelo | Picos Congelados | Lentidão de ação |
| Escuridão | Minas Abandonadas | Detecção reduzida |
| Vento | Colinas Áridas (proposta) | Precisão à distância reduzida |
| Armadilhas | Ruínas Esquecidas | Dano/controle pontual por sala |
| Neblina | Litoral Quebrado / Pântano | Visão reduzida / gatilho de Maré |
| Maré | Litoral Quebrado | Alternância de conteúdo por horário |
| Desmoronamento | Minas Abandonadas | Bloqueio de rota interna |
| Magia | Deserto de Vidro / Ruínas | Amplificação de dano mágico |
| Corrupção | Deserto de Vidro | Dano contínuo ambiental |
| Lava | (região futura) | Dano posicional — bloqueado por falta de posicionamento no MVP |

---

## Nota de honestidade

Duas mecânicas desta lista (Vento, Lava) são propostas não testadas mesmo
dentro deste próprio rascunho — marcadas explicitamente como hipótese, não
decisão. A mecânica de Maré é a mais estruturalmente diferente (muda
conteúdo, não dificuldade) e merece validação isolada antes de generalizar
o padrão para outras regiões.
