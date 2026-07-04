# Canonical Combat Formula

**Status: 🟠 Rascunho.** Não é capítulo da Bible. Estende, sem substituir,
a fórmula já fechada no capítulo 6 (Bosses) da Bible:
`Dano = Base × Equipamentos × Classe × Critical`. Todo termo abaixo é uma
extensão de um desses quatro fatores — nenhum termo novo é adicionado
fora dessa estrutura.

**Revisado em Sprint 4 (fechamento Gameplay × Combat Model):** este
documento agora é a **única** fonte de verdade para mitigação de dano
(Resistência) — o atributo `DEF` que existia em
`docs/gameplay-design/01-characters-attributes.md` foi removido por
completo, não convertido, não mantido como sinônimo. Este documento
também ganhou as seções "Sustentação (SUS)" e "Utilidade (UTI)", que
faltavam na versão anterior.

---

## A fórmula canônica

```
Dano_bruto(tipo) = Base(level) × Equipamento_ATQ(tipo) × Classe_mult(tipo) × Critical

Resistência_efetiva(tipo) = max(0, Resistência(tipo)_alvo − Penetração_atacante(tipo))

Dano_final(tipo) = max(1, Dano_bruto(tipo) × (1 − Resistência_efetiva(tipo) / 100) − Bloqueio_aplicável)
```

Onde `tipo` ∈ {`físico`, `mágico`} — todo ataque tem exatamente um tipo,
determinado pelo peso da arma/classe do atacante (nunca os dois ao mesmo
tempo no mesmo golpe — evita duplicar dano por hit).

---

## Respondendo cada pergunta, uma a uma

### Existe dano físico? Existe dano mágico?

Sim — os dois existem como **pools separados**, não como o mesmo número
com um rótulo diferente. `Equipamento_ATQ(físico)` vem de armas físicas
(espada, machado, lança, arco — já existentes em
`packages/shared/src/items.ts` via `RARITY_BASE.attack`);
`Equipamento_ATQ(mágico)` viria de um novo sub-tipo de arma (cajado,
grimório — proposta, não existe hoje no schema). Um personagem sem arma
mágica equipada simplesmente tem `Equipamento_ATQ(mágico) = 0` — não
precisa de um campo "null", só o valor zero já resolve.

**Esta é a resolução direta da contradição de Minas Abandonadas:** um
Guerreiro (arma física) contra um constructo com `Resistência(físico)`
alta sofre `Resistência_efetiva` alta, quase todo o dano é descontado. Um
Druida/Xamã com `Equipamento_ATQ(mágico) > 0` contra o mesmo constructo,
que tem `Resistência(mágico)` baixa, passa quase o dano bruto inteiro.

### Existe penetração?

Sim — reduz a resistência efetiva do alvo antes do cálculo, nunca o dano
bruto do atacante diretamente. Mantém a matemática simples (uma subtração,
não uma segunda multiplicação) e dá uma identidade real a builds/classes
que "furam" resistência alta em vez de simplesmente bater mais forte —
diferencia-se de ATQ bruto porque só importa contra alvos com resistência
alta (inútil contra um alvo com `Resistência = 0`).

### Existe resistência?

Sim — expressa como percentual (0-100), não como valor plano, para que
funcione de forma previsível em qualquer faixa de dano bruto (dano alto
contra resistência alta continua proporcionalmente mitigado, sem precisar
recalibrar a cada tier de Boss). Cada combatente (personagem ou monstro)
tem `Resistência(físico)` e `Resistência(mágico)` como valores
independentes — um monstro pode ser resistente a um tipo e vulnerável ao
outro (é exatamente o que Minas Abandonadas precisa).

### Existe precisão? Existe evasão?

**Não — decisão deliberada, não uma lacuna.** Precisão/evasão como
mecânica de acerto-ou-erro (chance de o ataque simplesmente não
acontecer) é, por definição, uma segunda fonte de RNG pesada — exatamente
o que o capítulo 6 já rejeitou ("sem RNG exagerado... não porque teve
sorte"). O "espírito" de evasão (evitar parte do dano) já é cumprido por
Resistência (reduz o dano que passa) e por Bloqueio (abaixo). Adicionar
uma terceira camada de mitigação puramente probabilística seria
redundante e reabriria uma porta que o projeto já fechou deliberadamente
em Boss.

### Existe crítico?

Sim — inalterado. O capítulo 6 já decidiu "pequena chance de crítico" como
a única fonte de aleatoriedade aceita no combate. Este documento não
propõe mudar isso, só confirma que `Critical` continua sendo um
multiplicador pequeno aplicado após `Base × Equipamento × Classe`, antes
da resistência.

### Existe bloqueio?

Sim — mas **determinístico, não probabilístico** (diferente do "block
chance" clássico de RPG). `Bloqueio_aplicável` só existe quando o ataque
é marcado como "frontal" (proposta já registrada em
`docs/gameplay-design/05-equipment.md`, ligada ao slot de Escudo, ainda
não existente no schema) **e** o defensor tem Escudo equipado. Quando
aplicável, é uma redução plana, fixa, sempre acontece — nunca "50% de
chance de bloquear". Mantém a coerência com "sem RNG pesado".

### Como equipamentos entram na conta?

- **Arma:** define `Equipamento_ATQ(tipo)` — físico ou mágico, conforme o
  sub-tipo da arma (espada/machado/lança/arco = físico; cajado/grimório =
  mágico, proposta nova).
- **Armadura/Elmo/Botas/Amuleto/Anel:** contribuem para `Resistência`
  (físico e/ou mágico, a decidir por slot) — reaproveitando o peso já
  existente em `SLOT_DEFENSE_WEIGHT`, mas agora convertido de "defesa
  plana" para "percentual de resistência".
- **Escudo (proposta, slot novo):** único responsável por `Bloqueio`.

### Como região influencia isso?

Regiões (World Design) não mudam a fórmula — mudam os **valores** que
entram nela, temporariamente, durante a expedição. Exemplos já registrados
em `docs/world-design/environmental-mechanics.md`: Veneno reduz `Base` ao
longo do tempo (dano contínuo, fora da fórmula de combate por golpe);
Corrupção do Deserto de Vidro poderia ser modelada como uma redução
temporária de `Resistência(mágico)` de todo o grupo, tornando a região
mais punitiva especificamente contra dano mágico recebido — proposta
nova, não decidida antes deste documento.

### Como monstros usam isso?

Ver [monsters-and-regions.md](monsters-and-regions.md) — monstros recebem
exatamente o mesmo modelo (ATQ físico/mágico, Resistência física/mágica,
Penetração, HP, VEL), nunca um sistema à parte. Mesma decisão já tomada em
`docs/gameplay-design/03-combat.md` ("uma única fórmula, sempre"), agora
estendida de "jogador vs. Boss" para "jogador vs. qualquer coisa".

---

## Sustentação (SUS)

**Adicionado na Sprint 4** — antes desta revisão, SUS existia em
`docs/gameplay-design/01-characters-attributes.md` sem nenhuma fórmula
real. Fórmula proposta:

```
Cura_por_tick = SUS_base × (1 − Redução_ambiental)
HP_efetivo = min(HP_máximo, HP_efetivo + Cura_por_tick)
```

- **Onde entra:** aplicada uma vez por tick de combate (mesma cadência do
  dano), separada da fórmula de `Dano_final` — nunca multiplica nem
  divide o dano, só soma HP de volta.
- **Quando é aplicada:** todo tick em que o personagem está em combate
  (expedição ou Boss), antes ou depois do dano recebido naquele tick —
  ordem exata é detalhe de implementação, não decidida aqui.
- **O que modifica:** só HP do próprio personagem, a menos que a classe
  redirecione isso para o grupo (ver `docs/gameplay-design/06-classes-skills.md`,
  Xamã).
- **Quais sistemas usam:** qualquer System que tickeie dano a
  personagens — hoje só `BossCombatSystem` (implementado, mas **sem**
  esta fórmula ainda, ver `docs/gameplay-design/08-boss-interface.md`).
  Nenhum System de combate de expedição existe ainda.
- **`Redução_ambiental`:** valor de 0 a 1, definido por mecânica
  ambiental — Veneno e Corrupção (`docs/world-design/environmental-mechanics.md`)
  já descrevem "cura reduzida"/dano contínuo como efeito; este documento
  formaliza isso como a variável que multiplica `SUS_base`.
- **Aumentado por equipamento?** Não, no MVP — deliberadamente escopado
  só a Classe, para não expandir o número de slots com efeito além do já
  proposto no capítulo 05.
- **Aumentado por classe?** Sim — é a única fonte de SUS no MVP
  (`docs/gameplay-design/06-classes-skills.md`, coluna SUS).

## Utilidade (UTI)

**Redefinido na Sprint 4** — a versão anterior de UTI incluía "chance de
crítico adicional", contradizendo a decisão já fechada de que Crítico é
fixo e igual para todos (capítulo 6 da Bible). Essa função foi **removida**,
não ajustada. UTI cobre agora só duas checagens, ambas **determinísticas
por limiar, nunca por chance**:

```
Resiste_a_controle = UTI_personagem ≥ Controle_valor_da_mecânica
Detecta_perigo = UTI_personagem ≥ Detecção_valor_da_mecânica
```

- **Onde entra:** fora da fórmula de dano — são checagens binárias
  aplicadas quando uma mecânica ambiental com efeito de controle
  (Armadilhas, `docs/world-design/environmental-mechanics.md`) ou de
  detecção (Escuridão, mesma referência) é acionada.
- **Quando é aplicada:** no momento em que a mecânica ambiental
  dispara (ex.: grupo entra numa sala com Armadilha) — nunca por tick,
  diferente de SUS.
- **O que modifica:** se `Resiste_a_controle` for verdadeiro, o efeito de
  atordoamento da Armadilha não se aplica àquele personagem. Se
  `Detecta_perigo` for verdadeiro, o personagem evita o gatilho da
  Escuridão/Armadilha por completo (o grupo não entra em desvantagem).
- **Quais sistemas usam:** nenhum ainda — Armadilhas/Escuridão são
  conceitos de World Design sem System de expedição implementado.
- **Aumentado por equipamento?** Sim — Elmo (resistência a controle) e
  Amuleto/Anel (detecção), já propostos em
  `docs/gameplay-design/05-equipment.md`.
- **Aumentado por classe?** Sim (`docs/gameplay-design/06-classes-skills.md`,
  coluna UTI).

---

## Nota de honestidade

Converter `SLOT_DEFENSE_WEIGHT` de valor plano para percentual de
resistência é uma mudança de unidade, não só de nome — os números
`{armor: 1, helmet: 0.7, boots: 0.5, amulet: 0.5, ring: 0.3}` hoje são
pesos multiplicando `RARITY_BASE.defense`, não percentuais de mitigação.
Nenhuma calibração de percentual real foi feita aqui — é proposta de
estrutura, não de número.

As fórmulas de SUS e UTI adicionadas nesta Sprint têm o mesmo status —
estrutura proposta, nenhum valor de `SUS_base`, `Redução_ambiental`,
`Controle_valor` ou `Detecção_valor` foi calibrado. Elas fecham a lacuna
de "não existe fórmula nenhuma", não a lacuna de "não existe calibração
real" — essa segunda só playtest resolve.
