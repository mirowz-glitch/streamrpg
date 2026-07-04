# NPCs Vivos (MVP) — Review

7 NPCs permanentes, um por edifício da Capital, mais uma Praça Central
transformada em HUB de verdade. Sprint exclusivamente de apresentação;
nenhuma rota nova, nenhuma tabela nova, nenhum arquivo de
XP/Gold/Drops/Boss/Combat/Classes/Economy/Marketplace/Expedition/
Encounter tocado.

## Arquitetura

Catálogo estático em `apps/web/src/lib/npcs.ts` (`NPCS`) — cada NPC tem
nome, profissão, frase própria, descrição, ícone e um retrato (cor +
forma). Dois componentes reaproveitados por todo edifício:

- `NpcPortrait` — silhueta ilustrada sem IA: uma forma via CSS
  (`npc-portrait-{square|hex|shield|arch|circle}`, `clip-path`) numa cor
  própria do NPC, com o ícone do prédio por cima. Forma+cor+ícone é uma
  combinação única por NPC — reconhecível à distância sem precisar de
  arte real.
- `NpcIntro` — retrato + nome + profissão + frase + descrição, mesmo
  bloco em todo edifício. Sem diálogo, sem interação — só identidade.
  Estender para "falar com o NPC" no futuro é acrescentar um botão a
  este componente, nunca reescrevê-lo.

Cada edifício (`BlacksmithBuilding`, `MerchantBuilding`,
`AlchemistBuilding`, `GuildBuilding`, `BankBuilding`, `ArenaBuilding`,
`NorthGateBuilding`) ganhou um `<NpcIntro npc={NPCS.x} />` no topo,
antes do conteúdo já existente da Sprint Capital City — nenhum desses
conteúdos foi alterado, só precedido pelo NPC.

Praça Central ganhou `CityHubBar` (relógio, população online, expedições
ativas, último Boss derrotado, banner do Reino — tudo lido do mesmo
`/api/world/state` que `CityPage` já buscava) e `CitySquareDecor`
(bandeiras, brasão, árvores, banco da praça, fonte — puramente visual,
sem animação, sem novo dado).

## Verificação

- **Typecheck/Build:** limpos, mesma baseline de sempre.
- **Browser ao vivo:** personagem de teste com Gold, item equipado, Boss
  derrotado e canal com Kingdom Prestige real. Confirmados os 7 NPCs com
  nome/profissão/frase/descrição corretos em cada edifício (Borin no
  Ferreiro, Talia no Mercador, Zoltar no Alquimista, Mestra Elenya na
  Guilda, Dorwin no Banco, Kade na Arena, Sargento Roth no Portão
  Norte), cada um com retrato visualmente distinto (forma + cor
  diferentes lado a lado, ex: Guildmaster dourada em forma de escudo vs.
  Guarda cinza em forma de arco). Mercador mostra "Loja fechada" +
  "Novas mercadorias chegam em breve."; Alquimista mostra a bancada
  visual (🧪🧉🌿🍄⚗️🧫) + a frase própria; Praça Central mostra o banner
  do Reino, relógio ao vivo, população online, expedições ativas e
  último Boss derrotado, com a fileira de ambientação abaixo. Todos os
  dados de teste removidos ao final (contagem zero em cada tabela
  tocada).

## Regressão

Nenhum arquivo de XP/Gold/Drops/Boss/Combat/Classes/Economy/Marketplace/
Expedition/Encounter foi tocado. Todo o trabalho ficou em
`apps/web/src/lib/npcs.ts`, `apps/web/src/components/city/` e
`styles.css` — puramente aditivo.

## Respostas

**A cidade parece habitada?**
Sim — antes desta Sprint, cada prédio era conteúdo (equipamento, Gold,
Hall da Fama); agora cada um tem alguém ali dentro dizendo algo antes
disso, com um retrato reconhecível. A Praça Central também deixou de ser
só um mapa de botões — tem relógio correndo, gente online e um banner
do Reino no topo.

**Os NPCs possuem identidade própria?**
Sim, dentro do que uma Sprint de apresentação permite: cada um tem nome,
profissão, frase e descrição únicas, e um retrato (forma+cor) que não se
repete entre os 7. Nenhum tem personalidade profunda ou reage a nada — é
identidade estática, não simulação.

**Existe espaço para futuras interações?**
Sim, por construção: `NpcIntro` é um componente isolado que só recebe um
`NpcDefinition` — adicionar uma futura interação (ex: um botão "Falar
com Borin" abrindo um diálogo real) é estender este componente sem
tocar nos 7 edifícios que o usam.

**A arquitetura evita retrabalho?**
Sim: o catálogo (`NPCS`) é a única fonte da verdade sobre nome/frase/
retrato de cada NPC — mudar uma frase ou uma cor é uma linha, nunca uma
mudança estrutural. Crescer o elenco (um NPC novo para um prédio futuro)
segue o mesmo padrão.
