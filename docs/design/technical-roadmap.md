# Roadmap Técnico (Etapa 8)

Puramente implementação — nenhuma decisão de design nova. Cada linha
pressupõe que a documentação de design correspondente (ver
`docs/ARCHITECTURE_INDEX.md`, Etapa 3) já existe e está fechada, exceto
onde marcado explicitamente como bloqueado por design pendente.

| Sistema | Dependências (técnicas) | Complexidade | Prioridade | Paralelizável? |
|---|---|---|---|---|
| Correção do RNG compartilhado (drop sempre `common`) | Nenhuma | Baixa | Alta | Sim — isolado, não toca em nenhum outro sistema |
| `isChannelLive()` com cache compartilhado | Nenhuma | Baixa | Média | Sim — puramente técnico, zero dependência de design |
| Migração schema: coluna `class` em `characters` | Nenhuma | Baixa | Alta | Sim |
| Classes — lógica de derivação (`Classe_mult`, VEL/SUS/UTI bonus) | Migração `class` | Média | Alta | Não em paralelo com o item abaixo (mesma área de código) |
| Boss — substituir `Classe_mult = 1` por valor real | Classes implementado | Baixa | Alta | Não — depende diretamente do item acima |
| Boss — Resistência/Penetração/Bloqueio reais (hoje neutros) | Classes implementado, schema de item com `damage_type` (já existe) | Média | Alta | Parcialmente — pode rodar em paralelo com Frontend de Classes |
| Item — sub-tipo de arma mágica (cajado/grimório) | Nenhuma | Baixa | Média | Sim |
| Item — slot de Escudo (`Bloqueio`) | Nenhuma | Baixa | Média | Sim |
| Boss Escala — Tiers 2+ calibrados | Boss (já implementado), dados reais de playtest | Baixa | Média | Sim — independente de Classes |
| Frontend — tela de escolha/exibição de Classe | Classes implementado (backend) | Baixa | Alta | Sim — paralelo ao trabalho de backend de Combat |
| Exploração / Regiões (Expedition System) | Combat Model completo, Classes implementado | **Alta** — novo estado de Engine (posição/região por personagem), nenhum precedente | Alta | Não pode começar antes de Combat Model + Classes; depois de iniciado, é largamente independente de Economia/Marketplace |
| Dungeon (estrutura curada, início/fim definidos) | Exploração implementada | Média | Média | Não antes de Exploração |
| QuestSystem | Exploração implementada | Média-Alta | Média | Não antes de Exploração; paralelo a Kingdoms/Economia depois |
| Economia 1.0 (RNG independente, pesos, sinks) | Correção de RNG (acima) | Média | Alta | Sim — zero código compartilhado com Exploração/Classes |
| Craft | Economia 1.0 | Média | Baixa-Média | Não antes de Economia 1.0 |
| Hero Token — lógica de emissão (limiar de engajamento real) | Nenhuma | Baixa-Média | Média | Sim — autocontido, não depende de Marketplace existir |
| Kingdoms — **Sprint de Design primeiro** | Nenhuma técnica — bloqueado por decisão de design ainda não feita (ver `ARCHITECTURE_INDEX.md`, Etapa 9) | Desconhecida até o design fechar | Alta conceitualmente, mas **bloqueada** | O design pode ser feito em paralelo a Exploração/QuestSystem; a implementação não pode começar antes |
| Marketplace | Economia 1.0, transações multi-tabela reais (primeira vez no projeto, ver `atomic-update-guideline.md`) | Alta | Alta | Não antes de Economia 1.0 (ordem já decidida, Bible cap. 11) |
| Seasons — mecanismo de Modificador de Boss | Boss (já implementado) | Média | Média | Sim, para o mecanismo em si — eventos verdadeiramente Global-scope esperam Kingdoms |
| MetricsSystem | Todos os sistemas anteriores existindo para ter o que medir | Média | Baixa agora, Alta pós-beta | Sim — padrão observador já usado (`DebugEventSubscriber`/`WorldEventSubscriber`), não toca nenhum outro sistema |

## Como ler "Paralelizável"

"Sim" significa que o sistema pode ser atribuído a um desenvolvedor
diferente **agora**, sem esperar outro sistema desta lista terminar.
"Não" significa dependência técnica real (schema, EventBus, ou área de
código compartilhada) — começar antes arrisca retrabalho, o mesmo risco
que `game-design-bible/consistency-report.md` já nomeia para decisões de
design fora de ordem, agora aplicado a sequência de implementação.

## Três desenvolvedores, amanhã — atribuição sem conflito

Com base nesta tabela, hoje é possível atribuir, sem qualquer conflito de
arquitetura:
1. **Desenvolvedor A:** Correção do RNG compartilhado → Economia 1.0.
2. **Desenvolvedor B:** Migração `class` → Classes (lógica de derivação) →
   Boss (`Classe_mult` real).
3. **Desenvolvedor C:** Item — sub-tipo de arma mágica + slot de Escudo
   (não depende de A nem B, e desbloqueia B mais cedo).

Nenhum dos três precisa esperar os outros para começar. O quarto sistema
mais óbvio (Kingdoms) **não deveria** ser atribuído a ninguém ainda — é o
único item desta lista bloqueado por uma decisão de design que ainda não
existe.
