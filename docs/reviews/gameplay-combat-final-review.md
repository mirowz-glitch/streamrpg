# Gameplay Design × Combat Model — Fechamento (Sprint 4)

**Status: 🟠 Rascunho de revisão.** Não é capítulo da Bible, não altera
Engine, Boss, World Design ou Technical Design. Documenta o fechamento das
três inconsistências objetivas encontradas na Sprint 3
(`docs/reviews/gameplay-combat-world-review.md`) e as edições reais já
aplicadas a `docs/gameplay-design/` e `docs/combat-model/`.

---

## 1. Problemas encontrados

1. **DEF (Gameplay Design) e Resistência física/mágica (Combat Model)
   coexistiam como dois modelos de mitigação de dano**, sem nenhum
   documento reconhecer que um substituía o outro.
2. **SUS existia como atributo nomeado em quatro documentos**
   (`01-characters-attributes.md`, `04-builds.md`, `06-classes-skills.md`,
   `07-regions-interface.md`) **sem nenhuma fórmula matemática em nenhum
   lugar** — atributo puramente ornamental.
3. **UTI prometia afetar Crítico** (`06-classes-skills.md`: "Guerreiro:
   pequeno bônus de crítico via UTI"), **contradizendo diretamente** a
   decisão já fechada no capítulo 6 da Bible e reafirmada no Combat Model
   de que Crítico é fixo e igual para todos.

---

## 2. Correções realizadas

### DEF × Resistência (Etapa 1)

**Opção escolhida: DEF desaparece completamente.** Não foi renomeado, não
foi convertido automaticamente, não continua coexistindo. Resistência
física/mágica (`docs/combat-model/canonical-formula.md`) é agora o único
modelo de mitigação de dano em toda a biblioteca. Arquivos atualizados:
`01-characters-attributes.md` (removeu a definição de DEF, adicionou
seção explicando a remoção), `04-builds.md` (tabela: "Tanque (DEF alto)"
→ "Tanque (Resistência alta)"), `05-equipment.md` (todas as referências a
DEF trocadas por Resistência), `06-classes-skills.md` (tabela de classes
ganhou colunas `Res. Física`/`Res. Mágica` no lugar de uma única `DEF`).

### SUS (Etapa 2)

**Não removido — ganhou fórmula real**, porque tem uso genuíno: mesmo com
morte temporária e sem penalidade (já decidido para Boss e proposto para
expedição), SUS determina **quanto tempo um personagem permanece
contribuindo** antes de cair num combate prolongado, o que afeta
diretamente participação/recompensa medida (capítulo 6 da Bible). Fórmula
adicionada em `docs/combat-model/canonical-formula.md`:

```
Cura_por_tick = SUS_base × (1 − Redução_ambiental)
```

Escopado só a Classe no MVP (sem via de equipamento), consumido por
qualquer System que tickeie dano — hoje só `BossCombatSystem`, que ainda
não implementa esta fórmula (ver seção 7).

### UTI (Etapa 3)

**Não removido — escopo reduzido.** A função "crítico adicional" foi
**eliminada**, não ajustada, porque contradizia uma decisão já fechada.
Restam duas funções, ambas reformuladas como **checagem determinística
por limiar**, nunca chance:

```
Resiste_a_controle = UTI_personagem ≥ Controle_valor_da_mecânica
Detecta_perigo = UTI_personagem ≥ Detecção_valor_da_mecânica
```

Ligadas a mecânicas ambientais já existentes (Armadilhas, Escuridão —
`docs/world-design/environmental-mechanics.md`), não inventadas para a
ocasião.

---

## 3. Modelo final de atributos

| Atributo | Existe? | Fórmula | Fonte |
|---|---|---|---|
| ATQ | Sim | `Equipamento_ATQ(tipo) × Classe_mult(tipo)` | Combat Model |
| ~~DEF~~ | **Não — removido** | — | Substituído por Resistência |
| Resistência (física/mágica) | Sim | `max(0, Resistência_alvo − Penetração_atacante)` | Combat Model |
| VEL | Sim | `1 + Classe.vel_bonus + Ambiente.vel_modifier` | Gameplay 01 |
| SUS | Sim (novo nesta Sprint) | `SUS_base × (1 − Redução_ambiental)` | Combat Model |
| UTI | Sim (redefinido nesta Sprint) | `UTI ≥ limiar` (determinístico) | Combat Model |

Nenhum atributo ornamental restante — todo atributo hoje listado tem
fórmula, mesmo que não calibrada.

---

## 4. Modelo final de combate

```
Dano_bruto(tipo)        = Base(level) × Equipamento_ATQ(tipo) × Classe_mult(tipo) × Critical
Resistência_efetiva(tipo) = max(0, Resistência(tipo)_alvo − Penetração_atacante(tipo))
Dano_final(tipo)        = max(1, Dano_bruto(tipo) × (1 − Resistência_efetiva(tipo)/100) − Bloqueio_aplicável)

Cura_por_tick           = SUS_base × (1 − Redução_ambiental)
Resiste_a_controle      = UTI ≥ Controle_valor
Detecta_perigo          = UTI ≥ Detecção_valor
```

Precisão e evasão continuam **inexistentes por decisão deliberada** — não
reabertas nesta Sprint.

---

## 5. Impacto nas classes

Tabela final (`docs/gameplay-design/06-classes-skills.md`):

| Classe | ATQ | Res. Física | Res. Mágica | VEL | SUS | UTI |
|---|---|---|---|---|---|---|
| Guerreiro | Alto | Média | Baixa | Baixo | Baixo | Baixo |
| Druida | Baixo | Baixa | Alta | Médio | Alto | Alto |
| Caçador | Médio-alto | Baixa | Baixa | Alto | Baixo | Médio |
| Xamã | Baixo | Baixa | Média | Médio | Alto | Alto |

**Teste "esconda o nome" (Etapa 4):** Guerreiro e Caçador passam — cada
um tem um pico numérico isolado e inconfundível (ATQ/Resistência física
para Guerreiro; VEL para Caçador). **Druida e Xamã falham** — depois de
remover DEF, os dois convergem quase inteiramente, diferindo só em
Resistência mágica (Alta vs. Média), uma distinção fraca demais. A
identidade real entre os dois **não está nos números — está no
comportamento do SUS** (Xamã cura o grupo, Druida cura só a si mesma),
que já existia como observação isolada na versão anterior do capítulo 06
e foi promovida a regra formal nesta Sprint. Guerreiro também perdeu seu
passivo original ("bônus de crítico via UTI", removido por contradizer
Crítico fixo) — hoje carrega identidade só pelos números (ATQ mais alto
do jogo), sem passivo compensatório. Registrado como decisão consciente,
não lacuna: nem toda classe precisa de um passivo para ter identidade
clara, e inventar um novo aqui seria abrir uma ideia nova fora do escopo
desta Sprint.

---

## 6. Impacto nas regiões

Releitura de `docs/gameplay-design/07-regions-interface.md` contra o
modelo final, focada em Minas, Deserto, Bosque e Pântano (pedido
explícito), mas revisando a tabela inteira:

- **Minas Abandonadas:** identidade matematicamente resolvida (Resistência
  física alta/mágica baixa dos inimigos), mas **ainda depende de uma
  mecânica inexistente** — arma mágica não existe no schema. Marcado.
- **Deserto de Vidro:** ganhou um perfil de resistência **invertido** ao
  de Minas (mágica alta/física baixa) e uma descoberta nova: sobreviver
  (SUS/Resistência mágica) e causar dano (ATQ físico) puxam para classes
  diferentes — a primeira região que recompensa grupo misto por
  necessidade, não só por design de intenção.
- **Bosque Sussurrante:** inalterado por esta Sprint — VEL/ATQ à
  distância continuam suficientes para explicar a identidade da região,
  sem dependência de nenhum conceito removido ou redefinido.
- **Pântano Podre:** **fortalecido** por esta Sprint — SUS agora tem
  fórmula real, e a interação "Veneno reduz cura" (já descrita em
  `environmental-mechanics.md`) finalmente tem um mecanismo concreto
  (`Redução_ambiental` na fórmula de SUS) em vez de só prosa.
- **Achado novo, fora das quatro regiões pedidas:** Colinas Áridas nunca
  teve nenhum atributo representando "dano em área" — nem antes, nem
  depois desta Sprint. Marcado como lacuna nova, fora do escopo de
  DEF/SUS/UTI, não corrigida agora.

### Vento e outras mecânicas ambientais dependentes de precisão/evasão (Etapa 7)

**Não foi alterado nenhum arquivo de `docs/world-design/`, por restrição
explícita desta Sprint.** Verificação de todas as 11 mecânicas de
`environmental-mechanics.md` encontrou duas com dependência implícita de
precisão/evasão/chance-de-erro:

- **Vento** (Colinas Áridas, já flagada na Sprint 3): descrita como
  "reduz precisão de ataques à distância" — depende de uma mecânica de
  acerto/erro que não existe. Correção recomendada (não aplicada): trocar
  para "reduz ATQ à distância diretamente" (subtração determinística, sem
  chance).
- **Escuridão** (Minas Abandonadas, achado novo desta Sprint): descrita
  como "reduz alcance de detecção... **aumentando a chance** de combate
  começar em desvantagem" — a palavra "chance" é uma dependência
  implícita de RNG que o restante do modelo já rejeitou. Correção
  recomendada (não aplicada): reformular como checagem de UTI
  determinística (`Detecta_perigo`, já definida na seção 3 deste
  documento) — "se UTI do grupo for menor que o limiar de Detecção da
  região, o encontro começa com o inimigo já tendo agido uma vez".

Nenhuma outra mecânica ambiental (Veneno, Gelo, Lava, Armadilhas, Neblina,
Maré, Desmoronamento, Magia, Corrupção) depende de precisão, evasão ou
chance de erro — todas já são deterministicas (dano contínuo, redução de
VEL, bloqueio de rota, ou gatilho por entrada em área).

**Essas duas correções ficam registradas aqui como recomendação para uma
futura Sprint de World Design — não aplicadas, porque esta Sprint
explicitamente não altera `docs/world-design/`.**

---

## 7. Compatibilidade com Boss

Boss (capítulo 6 da Bible) **não foi alterado, nem deveria ser.** Lista
completa do que existe no Combat Model e ainda não existe na
implementação real (`docs/technical-design/boss-system.md`, Sprint B3):

- Resistência (física/mágica)
- Crítico
- Equipamentos (ATQ real por item)
- Classe (multiplicador real)
- Penetração
- Bloqueio
- Regeneração via SUS
- Checagens de UTI

**Isso é esperado, não é um bug.** O Boss real usa deliberadamente a
fórmula simplificada da Sprint B3 (`DAMAGE_PER_CHARACTER_PER_TICK` fixo,
documentado como escolha consciente, não pendência). Nenhuma linha da
lista acima deveria começar a ser implementada antes de Classes
(capítulo 4 da Bible) sair de Placeholder, seguindo a ordem já confirmada
no Roadmap (capítulo 12) — esta Sprint não muda essa ordem.

---

## 8. Veredito

**Sim — Gameplay Design e Combat Model podem ser considerados fechados
para o MVP.**

As três inconsistências objetivas da Sprint 3 foram eliminadas, não
adiadas: DEF não existe mais em lugar nenhum, SUS e UTI têm fórmula real
e documentos-fonte atualizados, e nenhum atributo restante contradiz uma
decisão já fechada da Bible. Os dois achados novos desta Sprint (Druida ×
Xamã convergindo numericamente; Colinas Áridas sem atributo de "dano em
área"; Vento e Escuridão dependendo implicitamente de RNG) foram todos
**documentados como lacunas conhecidas, não escondidos** — nenhum deles é
uma contradição entre Gameplay Design e Combat Model entre si, são
lacunas de cobertura (algo que o modelo ainda não representa) ou
dependências em World Design (fora do escopo desta Sprint, deliberadamente
não tocado). Combat Model e Gameplay Design, como par, estão prontos para
orientar a próxima fase do projeto.
