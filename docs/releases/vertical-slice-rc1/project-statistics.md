# Estatísticas do Projeto — RC1

Levantado em 2026-07-26, na branch `release/vertical-slice-rc1`, incluindo o estado após o congelamento (arquivos desta própria Sprint já contados).

## Código

| Métrica | Valor |
| --- | --- |
| Linhas de código (TS/TSX, `apps/` + `packages/`) | ~60.200 |
| Arquivos `apps/web/src` | 239 |
| Arquivos `apps/api/src` | 63 |
| Arquivos `packages/shared/src` | 146 |
| Scripts de auditoria/simulação (`packages/shared/scripts`) | 29 |
| Relatórios de Sprint (`packages/shared/reports`) | 78 |

## Testes

| Métrica | Valor |
| --- | --- |
| Testes automatizados — `packages/shared` (`node:test`) | 442 |
| Suítes — `packages/shared` | 161 |
| Testes automatizados — `apps/web` (sessão de Aventura, novo nesta Sprint) | 7 |
| **Total** | **449** |
| Falhas | 0 |
| Cobertura formal (istanbul/c8) | Não configurada — validação por N de campanhas simuladas + browser playtests reais, não por % de linha |

## Páginas (apps/web)

11: Personagem, Inventário, Crônicas, Cidade, Ranking, Mundo, Streamer, Aventura, Login, Auth Callback, Overlay.

## Conteúdo de Jogo (packages/shared)

| Categoria | Quantidade | Detalhe |
| --- | --- | --- |
| Regiões / Biomas | 9 | Bosque Sussurrante, Pântano Podre, Colinas Áridas, Minas Abandonadas, Ruínas Esquecidas, Picos Congelados, Litoral Quebrado, Deserto de Vidro, Fortaleza Sombria |
| Masmorras (Dungeons) | 4 | Queda da Fortaleza Sombria, Fortaleza Congelada, Catedral Esquecida, Covil do Dragão |
| Chefes de masmorra | 4 | forgotten-guardian, frost-king, corrupted-bishop, ancient-dragon |
| Templates de inimigo (total, inclui chefes/elites/minions) | 22 | |
| Facções | 4 | Guardiões da Floresta, Mercadores Livres, Culto das Ruínas, Legião Sombria — 5 níveis de reputação cada |
| Eventos de Mundo (World Events) | 15 | Treasure/Merchant/Shrine/Discovery/Ambush |
| Relíquias únicas | 4 | 1 por chefe de masmorra |
| World Tiers | 4 | WT1–WT4 |
| Slots de equipamento | 9 | Arma/Elmo/Peitoral/Luvas/Botas/Anel×2/Amuleto/Cinto |
| Slots do Item Generator | 8 | weapon/helmet/chest/gloves/boots/ring/amulet/belt |
| Itens-base (Item Generator) | 14 | |
| Raridades procedurais | 4 | common/magic/rare/unique |
| Prefixos de afixo | 7 | |
| Sufixos de afixo | 7 | |
| Objetivos (Objectives) | 29 | Caça/Exploração/Facção/Expedição/Mundo/Masmorra |

## Validação Empírica Acumulada (todas as Sprints desta sessão)

- Maior campanha simulada de uma única auditoria: N=5000 (Boss Accessibility Sprint)
- Auditoria mais recente de rebalanceamento: N=500 campanhas completas (Global Gameplay Rebalance)
- Playthroughs reais em navegador: múltiplos, cobrindo login→morte→reinício, todas as páginas, 2 masmorras diferentes concluídas/testadas nesta última Sprint
