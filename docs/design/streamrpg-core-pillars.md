# StreamRPG — Pilares Centrais (Parte 10)

Estes são os pilares que **nunca podem ser quebrados** por nenhuma Sprint
futura — de design ou de implementação. Onde um pilar já é decisão
permanente da Bible, isso é citado explicitamente; onde é uma síntese
desta Sprint, isso também é dito com a mesma clareza. Qualquer proposta
futura que viole um destes pilares deve ser confrontada com ele
**antes** da implementação, nunca corrigida depois — mesma disciplina já
usada para os 7 Princípios Permanentes (Bible cap. 2).

## 1. Sem Pay-to-Win

Nenhum sistema deve vender poder de combate diretamente. Marketplace
(quando existir) troca itens **conquistados** entre jogadores — nunca
vende Gold, XP ou item direto de uma loja com dinheiro real. Já
consistente com a filosofia registrada em Bible cap. 11 ("o mercado tem
que estar fluindo" entre jogadores, não entre jogador e loja).
**Como verificar violação:** qualquer proposta que crie uma forma de
obter vantagem de combate trocando dinheiro real diretamente (sem
intermediação de outro jogador que também jogou para consegui-la) quebra
este pilar.

## 2. O personagem é sempre do jogador — nunca do canal ou da sessão

Já é o Princípio 1 (✅ Estável, Bible cap. 2): XP, Level, Gold, itens,
Classe pertencem ao Character, nunca à sessão, ao canal ou à plataforma.
Trocar de stream nunca reseta ou fragmenta progresso pessoal.
**Como verificar violação:** qualquer sistema que armazene progresso
pessoal vinculado a `channelId` em vez de `characterId` quebra este
pilar — o mesmo teste que a Bible já usa desde o capítulo 2.

## 3. Kingdoms são independentes por padrão

Cada canal da Twitch tem seu próprio Reino — sua própria instância de
Boss, seu próprio histórico de descobertas, suas próprias métricas
coletivas. Isso é o que diferencia StreamRPG de um MMO de servidor único
(ver `identity-and-differentiation.md`). Qualquer feature que precise de
estado verdadeiramente global (ex.: Estações, Lua Vermelha) deve ser
desenhada como "a mesma regra aplicada independentemente a cada Kingdom",
nunca como sincronização de estado entre instâncias — ver risco 9 em
`risks-and-mitigations.md`.
**Como verificar violação:** qualquer proposta que exija que um Kingdom
saiba o estado de outro Kingdom em tempo real quebra este pilar, a menos
que seja puramente informativa/cosmética (ex.: "Fenda para outro
Kingdom", já registrado como hipótese especulativa em `random-events.md`).

## 4. Progresso nunca exige reflexo ativo

Presença sempre é suficiente para evoluir — combate é determinístico
(Bible cap. 6: "o jogador deve se sentir mais forte por evoluir o
equipamento, não por sorte ou reflexo"). Decisão (build, Classe, o que
vender) sempre pode importar mais que tempo assistido, mas nunca exige
velocidade de clique ou reação em tempo real.
**Como verificar violação:** qualquer mecânica que puna um jogador
ausente da tela no momento exato de um evento (em vez de puní-lo apenas
por não ter presença registrada) quebra este pilar.

## 5. Economia viva, nunca infinita

Todo gerador de recurso (faucet) precisa ter, ou estar explicitamente a
caminho de ter, um destino (sink) correspondente antes de escalar. Hoje
nenhum sink existe (Gold e itens só acumulam) — isso é uma dívida
conhecida, não uma violação deste pilar, porque já está no caminho de
Economia 1.0. **Vira violação** se um novo faucet for adicionado (ex.:
Gold como recompensa de Boss) sem que a discussão de sink já esteja em
andamento.
**Como verificar violação:** qualquer Sprint que adicione uma nova fonte
de Gold/item sem citar onde esse recurso será eventualmente gasto quebra
este pilar.

## 6. Comunidade acima do indivíduo

Eventos coletivos (Boss) sempre recompensam presença coletiva antes de
destaque individual — já é decisão da Bible cap. 6 ("MVP: sem ranking
visível de dano, sem MVP de jogador — o objetivo é incentivar cooperação,
não competição individual dentro de um evento cooperativo"). Nenhum
sistema futuro deveria inverter essa prioridade dentro de um evento que
já é, por definição, coletivo.
**Como verificar violação:** qualquer proposta que faça a recompensa de
um evento de Kingkom depender mais do desempenho individual do que da
presença coletiva, ao ponto de eclipsar o resultado do grupo, quebra este
pilar.

## 7. Visualmente recompensador

Todo sistema de progressão precisa de uma superfície visível — dado que
existe mas ninguém vê é tratado como um problema de produto real, não uma
feature completa. Esta é a lição repetida em quase todas as Sprints de
UX recentes (Boss Experience, Identity & Progression, World Simulation,
Player Feedback Bridge): um Boss que roda no servidor sem UI, ou um XP
que sobe sem feedback, não conta como "entregue" só porque o dado está
correto no banco.
**Como verificar violação:** qualquer Sprint que declare um sistema de
progressão "pronto" sem que o jogador tenha como vê-lo na UI quebra este
pilar — mesmo que a lógica de backend esteja perfeita.

## 8. Nenhuma regra de jogo é decidida fora de ordem

Já é a lição mais repetida em `consistency-report.md` e em todo o
Roadmap (Bible cap. 12): Marketplace nunca antes de Economia 1.0; Craft
nunca antes dos pesos de raridade reais; eventos Global-scope nunca antes
de Kingdoms decidir escopo cross-canal. Isso não é burocracia — é a
mesma disciplina que já evitou retrabalho real neste projeto (ex.: a
correção do bug de RNG compartilhado foi deliberadamente adiada para não
ser feita isolada).
**Como verificar violação:** qualquer Sprint que implemente um sistema
citando "vamos ajustar depois" para uma dependência já identificada em
documentação existente quebra este pilar.

---

Estes 8 pilares — não mais que isso — devem orientar toda decisão de
design ou implementação futura em StreamRPG. Onde uma proposta futura
parecer boa mas violar um destes pilares, o pilar vence, exatamente como
a Bible já determina para os 7 Princípios Permanentes (capítulo 2):
revisitar o pilar explicitamente, nunca contorná-lo silenciosamente no
código ou no design.
