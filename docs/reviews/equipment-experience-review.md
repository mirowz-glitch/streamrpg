# Equipment Experience Review (MVP)

**Status: ✅ Implementado e verificado ao vivo no navegador.** Combat
Model, Boss, XP, Gold, Economia, EventBus, Engine, Schema, Gameplay
Design e World Design não foram tocados. Duas colunas já existentes
(`items.damage_type`, `items.uti_bonus`) e um método já existente
(`CharacterRepository.getCombatAttributes()`) passaram a ser **expostos**
pela API — nenhum dado novo foi inventado, nenhuma fórmula nova foi
criada.

---

## 1. Auditoria (backend envia? frontend mostra?)

| Informação | Backend enviava antes? | Frontend mostrava antes? | Depois desta Sprint |
|---|---|---|---|
| Nome | Sim | Sim | Sem mudança |
| Slot | Sim | Sim | Sem mudança |
| Raridade | Sim | Sim (cor do texto) | + borda por raridade (CSS) |
| Equipado | Sim | Sim (texto inline) | + tag `[EQUIPADO]` destacada |
| Poder | Calculável | Sim (badge ▲/▼/=) | Mantido, complementado pela comparação detalhada |
| Tipo de dano | **Coluna existia, API não enviava** | Não | Agora enviado e mostrado |
| SUS bônus | Não existe em item nenhum (decisão do Combat Model) | N/A | N/A — corretamente ausente |
| UTI bônus | **Coluna existia, API não enviava** | Não | Agora enviado e mostrado |

---

## 2. Melhor item disponível

Por slot, o item não-equipado com maior soma de poder (`getItemPower`,
já existente, mesmo cálculo do badge de comparação) entre todos os itens
possuídos naquele slot ganha a tag `⬆ Melhor disponível`. Nenhum cálculo
novo — só um `max` sobre valores que já existiam.

---

## 3. Comparação detalhada

Armas mostram `ATQ {tipo} +X ↓ ATQ {tipo} +Y (delta)`. Demais slots
mostram `Resistência Física`, `Resistência Mágica` e `UTI`, cada um com
seu próprio delta. Números nunca escondidos.

**Achado real, encontrado testando ao vivo no navegador (não em
harness):** a primeira versão rotulava os dois lados da comparação com o
tipo do item **novo** — comparar uma espada física equipada com um
cajado mágico mostrava a espada como "ATQ Mágico", o que é factualmente
errado. Corrigido para rotular cada lado com o próprio tipo; quando os
tipos divergem, a comparação agora mostra "troca de tipo — não é o mesmo
eixo de dano" em vez de um delta que misturaria físico com mágico.
Confirmado corrigido com uma nova verificação no navegador.

---

## 4. Visual

Borda de 2px por raridade (`rarity-border-{common|uncommon|rare|epic|legendary}`,
CSS puro). **Nota de honestidade:** a lista original pedia também
"Unique" — não existe essa raridade no sistema (`ItemRarity` só tem 5
valores); não foi inventada uma sexta raridade para não contradizer o
que já existe. `[EQUIPADO]` e `NOVO` implementados como badges. "Melhor
disponível" implementado como badge própria.

**NOVO:** watermark guardado só no navegador (`localStorage`), sem
coluna nova. Capturado uma vez por visita (`useRef`), para as tags não
sumirem sozinhas enquanto a página está aberta; equipar um item
específico o marca como "visto" imediatamente (independente da
watermark geral), satisfazendo o Cenário 8 sem exigir recarregar a
página.

---

## 5. Poder do personagem

Adicionado a `CharacterPage.tsx`, alimentado por um campo novo
(`combat`) na resposta de `/api/character`, que só chama
`CharacterRepository.getCombatAttributes()` — método já existente desde
a Sprint Character Attributes Schema, nunca antes exposto pela API.
Verificado ao vivo: `ATQ Físico`, `Resistência Física` batendo
exatamente com os itens equipados reais, e atualizando corretamente
depois de trocar de arma.

---

## 6. Feedback ao equipar

`Equipado!` seguido do delta real (`ATQ Físico +13`, verificado ao vivo
trocando de uma espada comum para uma lâmina rara). Quando o tipo de
dano muda (física → mágica), o texto declara a troca de tipo em vez de
mostrar um delta enganoso — mesma correção da seção 3.

---

## 7. Harness e verificação ao vivo

**Backend:** `tsc` limpo nos quatro arquivos alterados; build real via
`esbuild` (o mesmo comando usado em produção) sem erros.

**Verificação ao vivo no navegador** (não só harness/typecheck, dado que
esta é uma Sprint de UX): personagem de teste inserido diretamente no
banco de desenvolvimento real (removido ao final, banco limpo
confirmado), sessão autenticada via cookie, navegação real por
`/app/character` e `/app/inventory`.

Cenários confirmados ao vivo:
- **Equipado/NOVO/Melhor disponível** aparecendo corretamente nos itens
  certos.
- **Comparação** (arma física vs. física, física vs. mágica, amuleto com
  UTI) — os dois bugs reais encontrados (rotulagem de tipo, UTI zerado)
  foram corrigidos e reconfirmados.
- **Trocar por melhor** (Cenário 4): "Equipado! ATQ Físico +13", `Poder
  do personagem` atualizado de ATQ Físico 5 para 18.
- **Trocar por pior** (Cenário 5): item antigo mostra comparação com
  delta negativo (`-13`, cor vermelha) contra o agora-equipado.
- **Cenário 8** (equipar remove NOVO): confirmado — a tag desaparece do
  item equipado imediatamente, sem precisar recarregar a página.

**Cenários 1/2/7 (inventário vazio, primeiro item, drop novo em
isolamento) não foram re-executados ao vivo** — a lógica que os cobre
(mensagem de inventário vazio, tag NOVO por comparação de id) não foi
alterada nesta Sprint além do necessário para os cenários acima, e já
existia/foi coberta por leitura de código, não por execução real. Registrado
com honestidade, não escondido.

**Achado real adicional (fora do previsto pelo roteiro), corrigido:**
`seedItems()` usa `INSERT OR IGNORE`, que nunca atualiza uma linha já
existente. Um item cujo `uti_bonus` foi definido no catálogo **depois**
de já ter sido inserido no banco real (`amuleto-presenca`, adicionado na
Sprint Character Attributes Schema) continuava com o valor antigo (`0`)
mesmo com o código já correto. Corrigido com uma sincronização adicional
em `seedItems()` (um `UPDATE` idempotente, rodando sempre, restrito a
`damage_type`/`uti_bonus`) — sem essa correção, a comparação de UTI desta
própria Sprint estaria sempre mostrando `+0` em produção.

---

## 8. Regressão

- **XP:** não tocado.
- **Gold:** não tocado.
- **Boss:** nenhum arquivo relacionado a Boss foi aberto nesta Sprint.
- **Ranking:** não tocado.
- **Combat:** `docs/combat-model/` e `BossCombatSystem.ts` não tocados;
  `getCombatAttributes()`/`getItemPower()` só foram **chamados**, nunca
  alterados.
- **Inventário persistindo:** confirmado ao vivo — equipar/desequipar
  grava e recarrega corretamente do banco real.
- **Equipamentos persistindo:** idem.

`getCharacterByProfileId`, `createCharacter` e `updateDisplayName`
passaram de síncronas para `async` (necessário para chamar
`getCombatAttributes()`, que já era assíncrona) — os três pontos de
chamada (`routes/character.ts`, `routes/auth.ts`) foram atualizados para
`await` corretamente; confirmado sem erro de tipo e sem erro de build.

---

## 9. Respostas diretas

**O jogador consegue identificar rapidamente qual item é melhor?** Sim —
a tag "⬆ Melhor disponível" aponta diretamente qual item trocar, sem
precisar comparar manualmente; a comparação detalhada abaixo de cada
item mostra o número exato do ganho/perda.

**O inventário agora incentiva abrir o site?** Parcialmente. A tag
`NOVO` dá um motivo concreto de checagem quando existe algo não visto —
mas isso só resolve a metade "descobrir que algo chegou"; a metade
"saber que algo chegou sem precisar abrir o site" continua dependendo da
Player Feedback Bridge (Sprint anterior), que já resolve XP/Level/Drop
no ping, mas não referencia o inventário diretamente.

**Existe algum ponto de confusão restante?** Sim, um: um item cujo tipo
de dano diverge do equipado (ex.: trocar espada física por cajado
mágico) mostra "troca de tipo — não é o mesmo eixo de dano" em vez de um
número — correto (evita mentir com um delta sem sentido), mas ainda é
uma frase que exige leitura, não um número direto. Registrado, não
resolvido nesta Sprint (resolver bem exigiria decidir como comparar
build físico vs. mágico de forma justa, uma decisão de Combat Model, não
de UX).

**Qual foi o maior ganho de UX desta Sprint?** A combinação borda por
raridade + `[EQUIPADO]` + `⬆ Melhor disponível` — de relance, sem ler
nenhum número, dá pra saber o que já está em uso e o que vale a pena
trocar. É a diferença exata entre "lista de banco" e "inventário de
RPG" que o critério de sucesso pedia.
