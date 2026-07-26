# Feature Inventory — Vertical Slice RC1

Inventário completo das funcionalidades presentes na baseline `2a5bfc4`, separadas por estágio real — para que ninguém (moderador, participante, ou uma futura leitura deste documento) tenha uma expectativa incorreta do que a RC entrega.

## Implementado (funcional, jogável, validado por playtest)

| Funcionalidade | Requer login? |
| --- | --- |
| Landing Page com CTA "Jogar Agora" e explicação clara do que precisa de login | Não |
| Navegação da Cidade (Praça Central, 12 prédios, objetos ambiente clicáveis) | Não |
| Portão Norte → link real para a Aventura | Não |
| Aventura: exploração, combate, encontros | Não |
| Geração de loot + decisão automática de equipar/rejeitar (com explicação ao jogador) | Não |
| Progressão de XP/Nível | Não |
| Cadeia de objetivos (sempre um "OBJETIVO ATUAL" visível) | Não |
| Expedições com checkpoints e Dungeons (ex: "Queda da Fortaleza Sombria") | Não |
| Encontros especiais: Elite, Mini-Boss, Chefe Final, com banners dedicados | Não |
| Sistema de Facções/Reputação | Não |
| Troca de região (11 regiões, dificuldade crescente) | Não |
| Banner de sessão de demonstração + modal de confirmação ao tentar sair | Não |
| Timeline de eventos da sessão | Não |
| Ranking global (agregado do servidor) | Não |
| Personagem, Inventário, Mundo, Crônicas (dados reais persistidos) | **Sim** |
| Mundo: Prestígio do Reino, Hall da Fama, Jornal do Reino | **Sim** |
| Login via Twitch OAuth | Sim (opcional) |

## Experimental (existe e funciona, mas nunca validado por um jogador genuinamente externo)

| Funcionalidade | Observação |
| --- | --- |
| Camada Twitch-integrada completa (XP automático assistindo a uma live, Reino/Prestígio da comunidade) | Tecnicamente funcional (rotas de API reais), mas **zero validação externa** até hoje — todos os testes até esta RC foram internos (equipe/IA). Ver [`docs/reviews/external-playtest-execution-phase-1.md`](../../reviews/external-playtest-execution-phase-1.md) |
| `ExpeditionPanel` (expedição persistente ligada à Twitch, distinta da Aventura de demonstração) | Só renderiza algo quando `enabled=true` (login ativo); não teve nenhuma sessão de teste dedicada nesta RC |

## Desabilitado

Nenhum item nesta categoria na RC1 — não há funcionalidade implementada e propositalmente desligada nesta baseline.

## Planejado (não implementado, sinalizado honestamente na interface quando aplicável)

| Funcionalidade | Sinalização atual |
| --- | --- |
| Mercador (comércio do Reino) | Prédio "em construção" |
| Alquimista (poções e reagentes) | Prédio "em construção" |
| Sistema de gasto de ouro (loja/crafting/marketplace) | Nenhuma sinalização direta — ver [Known Issues L5](known-issues-rc1.md) |
| Correção do funil de Picos Congelados (Endgame Funnel Fix) | Rótulo "Muito Alta" na ficha da região, sem aviso de transição |
| Identidade visual própria (paleta/fonte/logo, hoje 100% emoji) | Não sinalizado — registrado só neste inventário e no roadmap comercial |
| Som e música | Não sinalizado |
| Persistência 100% fiel de afixos de item procedural entre refresh | Não sinalizado — ver [Known Issues B1](known-issues-rc1.md) |
| Multiplayer/PvP/Crafting/Economia avançada | Fora de escopo de qualquer Vertical Slice, conforme roadmap comercial |

Ver também: [Known Issues](known-issues-rc1.md), [Build Freeze Audit](build-freeze-audit.md).
