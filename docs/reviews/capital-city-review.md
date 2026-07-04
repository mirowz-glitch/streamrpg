# Capital City (MVP) — Review

Primeira cidade jogável do StreamRPG — um hub central com 7 edifícios.
Sprint exclusivamente de apresentação/infraestrutura; XP, Gold, Drops,
Boss, Combat, Classes, Economy e Marketplace continuam byte-a-byte como
estavam antes. Nenhuma rota nova no backend — tudo aditivo no frontend,
reaproveitando dados já existentes (`/api/character`, `/api/identity/me`,
`/api/world/state?channel=`, `/api/expedition/current`).

## Arquitetura

Nova página `/app/city` ("Cidade" no menu principal), com navegação
interna (sem sub-rotas) entre a Praça Central e 7 componentes próprios
de edifício, cada um em `apps/web/src/components/city/`:

| Edifício | Componente | Mostra |
|---|---|---|
| Arena | `ArenaBuilding` | Vitórias (pessoal), Bosses derrotados pelo Reino, "Maior dano" (em breve — sem fonte de dado) |
| Ferreiro | `BlacksmithBuilding` | `EquipmentSlots` (reaproveitado do Perfil) + "Forja disponível em breve" |
| Mercador | `MerchantBuilding` | "Loja em breve" |
| Alquimista | `AlchemistBuilding` | "Alquimia disponível em breve" |
| Guilda | `GuildBuilding` | Hall da Fama (`getHallOfFame`, Kingdom Prestige System) + Títulos de Fundador do personagem |
| Banco | `BankBuilding` | Gold atual + estatísticas — sem depósito, sem saque |
| Portão Norte | `NorthGateBuilding` | `ExpeditionPanel` + `RegionGallery` (regiões, nenhuma travada hoje) |

`CityMap` é o mapa da Praça Central (7 cards, ícone + descrição). `CityPage`
guarda `selected: BuildingKey | null` — `null` mostra a Praça, qualquer
outro valor mostra o edifício correspondente com um botão "Voltar". Um
campo "Reino atual" (mesmo padrão de canal já usado em Ranking/Mundo)
alimenta os edifícios que precisam de contexto de canal (Guilda, Arena).

Cada edifício é um componente isolado, recebendo só os dados que já
existem via props — nenhum consome uma rota nova, nenhum edifício sabe
da existência dos outros. Adicionar uma funcionalidade real a um deles no
futuro (loja do Mercador, forja do Ferreiro, poções do Alquimista) é
substituir o conteúdo do componente próprio, nunca reestruturar o hub.

## Verificação

- **Typecheck/Build:** limpos, mesma baseline de sempre.
- **Browser ao vivo:** personagem de teste com Gold, item equipado
  (Espada de Madeira), Boss derrotado e canal com Kingdom Prestige real
  rodando. Todos os 7 edifícios confirmados com dado real: Ferreiro
  mostrando a arma equipada nos 6 slots; Guilda mostrando o Hall da Fama
  do canal (o KingdomPrestigeSystem, rodando ao vivo no servidor de dev,
  concedeu Guardião/Campeão dos Bosses/Herói do Reino/Membro Mais Antigo/
  Maior Sequência ao único membro real do canal, e "Grande Explorador"
  corretamente "Ainda sem ocupante" por falta de expedição concluída) e
  os 3 Títulos de Fundador do personagem; Banco com Gold/XP/minutos
  reais; Arena com 1 vitória e 1 Boss derrotado pelo Reino; Portão Norte
  com uma expedição real em andamento (o ExpeditionSystem, também ao
  vivo, tinha criado uma sozinho) e a galeria de regiões; Mercador e
  Alquimista com as mensagens "em breve". Todos os dados de teste
  removidos ao final (contagem zero em cada tabela tocada).
- **Nota honesta de processo:** durante a verificação, uma interação
  automática do próprio ambiente de preview (fora do código da Sprint)
  clicava um card da Praça Central logo após cada carregamento de
  página, e uma checagem síncrona demais fez o botão "Voltar" parecer
  quebrado. Confirmado por teste isolado (clique nativo + espera) que
  nenhum dos dois era um bug do Capital City — nenhuma linha de código
  desta Sprint foi alterada por causa disso.

## Regressão

Nenhum arquivo de XP/Gold/Drops/Combat/Boss/Classes/Economy/Marketplace
foi tocado. Único código backend reaproveitado (leitura, sem alteração):
`character.ts`, `identity.service.ts`, `world.ts` (`channel_kingdom`),
`expedition-status.service.ts` — todos já existentes de Sprints
anteriores.

## Respostas

**A cidade parece um hub?**
Sim — a Praça Central mostra os 7 edifícios lado a lado como cards com
ícone, nome e descrição; cada um é uma porta de entrada clara para uma
parte do jogo (combate, equipamento, comércio, comunidade, economia,
exploração), mesmo que váriás ainda digam "em breve".

**O jogador entende para onde o jogo vai?**
Em grande parte — Mercador/Alquimista/Ferreiro sinalizam explicitamente
"em breve" (comércio, forja, alquimia chegando), enquanto Arena/Guilda/
Banco/Portão Norte já mostram dado real e vivo hoje. A cidade comunica
"isto existe e vai crescer", não "isto é só uma vitrine vazia".

**Os prédios preparados evitam retrabalho?**
Sim, por construção: cada edifício é um componente próprio que só recebe
props de dados já existentes — quando o Mercador ganhar uma loja de
verdade, o trabalho é reescrever `MerchantBuilding.tsx` sozinho, sem
tocar em `CityPage`, `CityMap` ou nos outros 6 edifícios.

**A arquitetura suporta futuras expansões?**
Sim: `CityMap`'s catálogo de edifícios é uma lista simples (mesma
extensibilidade de catálogos já usada em Títulos/Molduras/Cargos —
crescer é uma linha nova, nunca uma mudança estrutural), e a navegação
interna por estado (`selected`) já comporta qualquer número de
edifícios novos sem precisar de rotas adicionais no router.
