# Backpack Experience — Plano de Preparação (para a Sprint "Backpack")

**Status:** 🚧 Preparação — nenhuma funcionalidade de mochila foi implementada a partir deste documento. Escrito ao final da Sprint "Living Character Phase I" (transformou a tela de Personagem na primeira grande consumidora do Estado Global) e revisado ao final da Sprint "Living World Phase II" (transformou esse mesmo painel de informativo em narrativo). O Inventário é o próximo destino natural dessa mesma linha evolutiva — mas nenhuma das duas Sprints tocou nele, por escopo.

Este documento não implementa nada. Define, conforme pedido pelo Entregável 8 de ambas as Sprints anteriores: responsabilidades, fluxo do jogador, integração com a Cidade, e impacto na experiência — nunca layout, componente React específico, ou como o limite de espaço é calculado.

## 0. Atualização pós-"Living World Phase II" — o que muda pro planejamento da Mochila

A Sprint "Living World Phase II" transformou o painel "Em Aventura" de uma lista de dados (dano causado, checkpoint X/Y, último item) numa narrativa em prosa ("Sua jornada continua em Bosque Sussurrante. Derrotou 6 inimigos. Encontrou Adaga (Mágico)."), com três peças reutilizáveis que a Mochila deveria considerar antes de reinventar algo parecido:

- **`buildJourneySummary(hudState)`** (`apps/web/src/lib/adventureJourney.ts`) — agrega uma janela de eventos recentes em poucas frases. A Mochila tem o mesmo problema em miniatura: "o que mudou na mochila desde a última visita" é, estruturalmente, o mesmo tipo de resumo (agregar `LootDropped`/`ItemEquipped` recentes), só que sobre inventário em vez de aventura. Vale reaproveitar o PADRÃO (agregação + frases curtas), não necessariamente a função.
- **`buildAdventureDiaryEntries(events, limit)`** (`apps/web/src/lib/adventureDiary.ts`) — classifica eventos em prioridade (alta/média/normal) e AGREGA eventos repetitivos numa única linha. A "categoria de sucata" e o "destaque de item novo" que a Seção 6 abaixo já pedia podem usar a MESMA técnica de classificação por prioridade, em vez de uma lógica nova — ex.: item novo = "alta" (destaque forte), item comum recém-encontrado = "normal" (discreto).
- **`formatRelativeTime(timestamp, now)`** (`apps/web/src/lib/adventureLiveState.ts`) — já pronto e testado ("agora" / "há poucos segundos" / "há 1 minuto" / "há alguns minutos" / "recentemente"). A Mochila pode reusar esta função DIRETAMENTE pro badge "NOVO" de um item (hoje `InventoryPage.tsx` só sabe "é mais novo que o watermark", nunca "há quanto tempo") — zero trabalho novo, é só importar.

Nenhuma dessas três peças pertence só à Aventura — foram escritas como módulos puros em `apps/web/src/lib/`, exatamente para serem reaproveitáveis por qualquer tela que precise contar uma história a partir de eventos existentes.

---

## 1. O que já existe hoje (`InventoryPage.tsx`) — não é um ponto de partida vazio

Diferente da tela de Personagem antes da Sprint "Living Character" (que era puramente estática), o Inventário **já implementa parte real** do que `docs/design/idle-experience-redesign.md` Seção 6 pede — construído ao longo de Sprints anteriores sob outros nomes ("Equipment Experience", "Collections & Discovery"):

| Já existe | Onde | Equivale a qual conceito da Seção 6 |
| --- | --- | --- |
| Agrupamento por `SLOT_ORDER`/`SLOT_LABEL` | `InventoryPage.tsx:150-153, 197-199` | "Categorias" |
| Badge `NOVO` (watermark de maior id já visto, por navegador) | `InventoryPage.tsx:27, 43, 80-82` | "Itens recém-encontrados" (destaque temporário) |
| Badge `⬆ Melhor disponível` (maior poder no slot, ainda não equipado) | `InventoryPage.tsx:92-113` | Comparação — mas hoje é "melhor de todos", não necessariamente "favorito do jogador" |
| Badge `EQUIPADO` + comparação numérica detalhada ao focar um item | `InventoryPage.tsx:210, 220-222, 294-354` | "Itens equipados sempre visíveis primeiro" + "Comparação como detalhe, não destaque" |
| Feedback textual com deltas reais ao equipar | `InventoryPage.tsx:358-386` | Já alinhado ao Princípio 4 (fantasia > números crus) — mas ainda é a exceção, o resto da lista ainda mostra números primeiro |

**O que isso muda pro planejamento**: Sprint 3 não é "construir a mochila do zero" — é "fechar as lacunas reais" listadas na Seção 2 abaixo. Tratar como reescrita completa seria retrabalho desnecessário.

## 2. Lacunas reais (o que a Seção 6 pede que ainda não existe)

| Pedido pela Seção 6 | Existe hoje? | Observação |
| --- | --- | --- |
| Limite de espaço sentido pelo jogador | **Não** | `24` é um limite técnico (`DEMO_INVENTORY_CAPACITY`, `useAdventureSession.ts`) — nunca comunicado, nunca avisado antes de ser atingido |
| Aviso antecipado ao se aproximar do limite | **Não** | Consequência direta da lacuna acima |
| Favoritos (sinal manual "não sucatear") | **Não** | O badge "Melhor disponível" é automático/calculado, não uma decisão do jogador — não substitui Favoritos |
| Categoria "Sucata" agrupada e óbvia | **Não** | Itens claramente inferiores hoje se misturam na mesma lista do slot, sem nenhuma seção própria |
| "Convite" pra Cidade quando a mochila pede atenção | **Não** | Não existe nenhum sinal cruzando Inventário → Cidade hoje |

Estas 5 linhas são o escopo real da Sprint 3 — tudo o que já existe na tabela da Seção 1 continua funcionando, só precisa ganhar companhia.

## 3. Responsabilidades (o "quem faz o quê", não o "como")

- **Mochila (Inventário)**: dona da apresentação — categorias, destaque de novo, favoritos, sucata sugerida, aviso de limite. Nunca decide o que a Cidade faz com um item marcado como sucata — só sinaliza o que existe.
- **Ferreiro/Mercador (Cidade)**: donos da transformação — o que a mochila sinaliza como sucata é o que o Mercador compra; o que está perto de um upgrade é o que o Ferreiro trabalha (papel já definido na Seção 7 do documento de design, ainda sem implementação — ver Seção 5 abaixo, é um bloqueio real).
- **Motor (packages/shared)**: dono da capacidade real (`Inventory`, já existente) e do cálculo de poder (`getItemPower`/`getCombatAttributes`, já existentes) — nenhuma mudança de regra nesta Sprint futura, só nova apresentação sobre dados já corretos.

## 4. Fluxo do Jogador (evidência real do Global Idle System, não hipotético)

Com o Global Idle System e o Living Character já no ar, o fluxo real observado em Browser Validation nesta Sprint já é:

```
Jogador abre Personagem (ou qualquer tela)
     ↓
Vê "Em Aventura" — sabe que o mundo já está em movimento
     ↓
Painel mostra "🎁 Último item encontrado: X"
     ↓
Curiosidade natural: abrir o Inventário pra ver o item de perto
     ↓
[Sprint 3] Mochila destaca o item novo, mostra categoria, mostra se está perto do limite
     ↓
[Sprint 3, se perto do limite] Sinal claro de "hora de visitar a Cidade"
     ↓
[Sprint 4, bloqueada] Cidade resolve o excedente
     ↓
Volta pra Aventura/Personagem — exploração nunca parou durante nada disso
```

Este fluxo já é parcialmente REAL hoje (os 3 primeiros passos foram validados em browser nesta própria Sprint) — a Sprint 3 fecha exatamente os passos marcados `[Sprint 3]`.

## 5. Integração com a Cidade — o bloqueio que já existia, ainda existe

`docs/design/idle-experience-redesign.md` Seção 13 já documentava: Sprint 4 (Functional City) está **bloqueada** pela decisão de arquitetura de Ouro (`commercial/roadmap/project-valuation-roadmap.md`). Isso não mudou nesta Sprint. Consequência prática pro planejamento da Sprint 3:

- A Sprint 3 pode e deve implementar o SINAL "mochila perto do limite → convite pra Cidade" (é só uma leitura de capacidade, nenhuma transação envolvida).
- A Sprint 3 NÃO deve implementar o que a Cidade FAZ com o excedente (Ferreiro/Mercador comprando/fundindo itens) — isso é Sprint 4, e depende da decisão de Ouro ainda pendente.
- Isso significa que, ao final da Sprint 3, o convite vai existir mas a Cidade ainda vai responder com "Loja fechada"/"Forja disponível em breve" (estado atual, `CityPage`/`BlacksmithBuilding`) — uma lacuna CONHECIDA e aceitável, não um bug da Sprint 3.

## 6. Impacto esperado na experiência

- Resolve diretamente a Observação 3 do diagnóstico original (`idle-experience-redesign.md` Seção 0): "inventário parece lista", não mochila.
- Não resolve (e não deveria tentar resolver) a Observação 4 ("falta motivo pra voltar à Cidade") sozinha — só prepara o gatilho; a resolução completa depende da Sprint 4.
- Risco: baixo (mesma avaliação já registrada no roadmap — mudança isolada, sem dependência de Combate/Loot/XP/Engine).

## 7. O Que NÃO Fazer Nesta Preparação (mesmo princípio dos documentos anteriores)

- Não desenhar nenhuma interface (cores, layout, componente React específico).
- Não implementar o limite de espaço sentido, favoritos, ou categoria de sucata aqui — só a lista de lacunas está registrada.
- Não tocar Ferreiro/Mercador/Cidade além do sinal de convite — a transformação de itens é Sprint 4, bloqueada.
- Não recalcular `getItemPower`/`getCombatAttributes`/capacidade do `Inventory` — motor intocado.

---

*Referências: [docs/design/idle-experience-redesign.md](idle-experience-redesign.md) Seção 6 (Inventário → Mochila) e Seção 13 (Roadmap, Sprint 3); `apps/web/src/pages/InventoryPage.tsx` (estado real atual, auditado nesta preparação).*
