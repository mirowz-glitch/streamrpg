# City Foundation — Plano de Preparação (para a Sprint "City Foundation")

**Status:** 🚧 Preparação — nenhuma funcionalidade de Cidade foi implementada a partir deste documento. Escrito ao final da Sprint "Backpack Experience Phase I", que deu à Mochila seus primeiros sinais reais de "hora de visitar a Cidade" (`deriveBackpackSignals`, `suggestCityVisit`) sem nenhum lugar real pra esse convite levar ainda.

Este documento não implementa nada. Define, conforme pedido pelo Entregável 8 da Sprint anterior: como a Cidade deixa de ser só uma tela e passa a ser o lugar natural pra vender itens, reciclar sucata, conversar com mercadores, visitar o ferreiro, e resolver o acúmulo trazido das expedições — arquitetura e fluxo, nunca layout ou código.

---

## 1. O que já existe hoje — auditoria real, não hipotética

| Prédio | Estado real | Onde |
| --- | --- | --- |
| **Mercador** | Vitrine fechada — `"Loja fechada"` / `"Novas mercadorias chegam em breve."` | `apps/web/src/components/city/MerchantBuilding.tsx:13-14` |
| **Ferreiro** | Só exibe o equipamento atual (leitura), nenhuma forja real — `"Forja disponível em breve."` | `BlacksmithBuilding.tsx:92` |
| **Alquimista** | Decorativo, sem papel definido — `"Ainda estou preparando minhas misturas."` | `AlchemistBuilding.tsx:30` |
| **Banco** | Só consulta — `"sem depósito, sem saque, só consulta"` | `BankBuilding.tsx:18` |
| Guilda/Arena/Portão Norte/Biblioteca/Bestiário/Museu/Taverna/Casa dos Viajantes | Funcionais, mas nenhum envolve vender/gastar ouro | `apps/web/src/components/city/*` |

Nenhuma rota de backend pra vender/comprar/converter item existe (`apps/api/src/routes/items.ts` tem só `GET /api/items`, `POST /api/items/loot`, `/equip`, `/unequip`). "Sucata"/"scrap" não existe em código nenhum — só como conceito de design, já antecipado em `idle-experience-redesign.md` Seção 7 e `backpack-experience-plan.md` Seção 3.

## 2. O bloqueio — ainda o mesmo, ainda não resolvido

`docs/design/idle-experience-redesign.md` Seção 13 já registrava: Sprint "Functional City" está **bloqueada** pela decisão de arquitetura de Ouro (`commercial/roadmap/project-valuation-roadmap.md` Seção 8, linha 312) — Gold hoje só tem lado de EMISSÃO (`POST /api/character/adventure/gold`, só soma, `Math.max(0, ...)`, nenhuma rota de gasto/dedução existe em lugar nenhum). Confirmado nesta preparação: **nada mudou** — essa decisão continua pendente.

Consequência direta pro planejamento desta Sprint futura: **qualquer coisa que gaste ouro (comprar, vender por ouro, craftar) continua fora de escopo até essa decisão ser tomada.** O que a Sprint City Foundation PODE fazer sem esbarrar nisso:

- Dar aos prédios um papel/fluxo REAL de apresentação (o jogador entende o que cada um faz, mesmo que a transação ainda não exista).
- Implementar a parte que não envolve Ouro: reciclar sucata por algo que não seja moeda (ex.: um recurso de troca não-monetário, ou simplesmente "sucata vira espaço livre na mochila" sem nenhuma recompensa em ouro).
- Conectar o convite que a Mochila já emite (`suggestCityVisit`) a um destino real na Cidade.

O que continua bloqueado: comprar itens do Mercador, o Ferreiro cobrar ouro por upgrade, qualquer preço em ouro.

## 3. Responsabilidades por prédio (o "quem faz o quê", já definido nas Sprints anteriores, reafirmado aqui)

- **Mercador**: responde "o que eu faço com o que sobrou". Recebe itens marcados como sucata pela Mochila (Backpack Experience Phase I não implementou favoritos/sucata de verdade — só preparou a arquitetura, ver Seção 4 do plano anterior) e os converte em algo — a NATUREZA exata dessa conversão (ouro vs. recurso não-monetário) é a primeira decisão que esta Sprint futura precisa tomar, e depende do bloqueio da Seção 2.
- **Ferreiro**: responde "o que eu faço com tudo que a mochila já não usa". Transforma excedente de equipamento em progresso (upgrade, fusão) — a forma exata também depende da decisão de Economia, mas o PAPEL já está definido desde `idle-experience-redesign.md` Seção 7.
- **Banco**: continua só leitura até existir algo que ameace ou consuma o valor guardado — sem mudança de escopo aqui.
- **Alquimista**: permanece sem papel definido até existir uma necessidade de gameplay concreta — mesmo princípio de "não inventar sistema sem evidência" já aplicado nas Sprints anteriores.

## 4. Fluxo do Jogador — conectando com o que a Mochila já emite

```
Mochila fica cheia OU recebe muitas descobertas recentes
     ↓
BackpackNarrativePanel mostra "🏙️ Vale a pena visitar a cidade"
     ↓
[City Foundation] Jogador clica/navega pra Cidade já sabendo POR QUÊ foi lá
     ↓
[City Foundation] Cidade sinaliza QUAL prédio resolve o motivo (mochila cheia -> Mercador/Ferreiro, nunca um menu genérico)
     ↓
[Bloqueado] Prédio resolve o excedente (depende da decisão de Ouro)
     ↓
Jogador volta pra Aventura/Personagem — exploração nunca parou durante nada disso (Global Idle System, já garantido)
```

Este fluxo só fecha de verdade a partir do passo bloqueado — os dois primeiros passos `[City Foundation]` são o escopo real e não-bloqueado desta Sprint futura.

## 5. O que já é reaproveitável (Fase 6 da Sprint anterior, mesmo princípio aqui)

- **`deriveBackpackSignals`/`suggestCityVisit`** (`apps/web/src/lib/backpackSignals.ts`) — já existe, já é real, só precisa de um destino. City Foundation não deveria reinventar "quando sugerir a Cidade", só reagir ao sinal que já existe.
- **Padrão de classificação por prioridade** (`adventureDiary.ts`/`backpackFinds.ts` — alta/média/normal) — mesma técnica serviria pra classificar itens como sucata/aproveitável/favorito dentro do Mercador/Ferreiro, sem inventar uma lógica de classificação nova.
- **`formatRelativeTime`** — qualquer narrativa de "o que o Ferreiro/Mercador fez com seus itens" deveria usar o mesmo formatador, nunca um novo.

## 6. O Que NÃO Fazer Nesta Preparação

- Não desenhar nenhuma interface (cores, layout, componente React específico).
- Não implementar nenhuma transação, venda, compra, ou conversão real — nem a não-monetária, só listar que ela é possível sem o bloqueio de Ouro.
- Não tomar a decisão de arquitetura de Ouro aqui — isso pertence a uma decisão de Economia própria, fora do escopo de qualquer uma das Sprints de UX/apresentação até agora.
- Não alterar Combate/Loot/XP/AutoEquip/IdleDriver/Living Character/Living World/Backpack — todos intocados por esta preparação.

---

*Referências: [docs/design/idle-experience-redesign.md](idle-experience-redesign.md) Seção 7 (Cidade) e Seção 13 (Roadmap, Sprint 4); [docs/design/backpack-experience-plan.md](backpack-experience-plan.md) (papéis de Mercador/Ferreiro já definidos); `commercial/roadmap/project-valuation-roadmap.md` Seção 8 (bloqueio de Ouro, confirmado ainda vigente nesta preparação).*
