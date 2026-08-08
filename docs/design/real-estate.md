# Real Estate Market

**Status:** 🚧 Preparação — conceitual, nenhuma implementação. Parte da Sprint "Foundation Refactor".

## 1. O princípio — separar o objeto do status

O exemplo do brief é a regra inteira: *"Castelo do Campeão de 2027, à venda — quem compra recebe o castelo, não os títulos."* Um imóvel carrega sua história física (quem construiu, quando, eventos que aconteceram ali) mas nunca carrega o status do dono anterior. Comprar o castelo do Campeão de 2027 dá um castelo bonito com uma placa dizendo "erguido pelo Campeão de 2027" — nunca torna o comprador Campeão de 2027.

Esta é, na minha avaliação, a decisão mais importante de todo o domínio de Housing/Real Estate: ela é o que evita que o mercado imobiliário vire uma forma de **comprar prestígio** — o pior incentivo possível para esta mecânica (rico compra status em vez de conquistar). Prestígio continua sendo do personagem, sempre; propriedade é só um objeto físico com uma memória anexada.

## 2. O mercado

Propriedades listadas à venda por seus proprietários atuais (venda voluntária) ou pelo Reino (propriedades recuperadas por abandono, ver `housing-phase1.md` Seção 3) aparecem num mercado consultável — comparável entre Reinos, permitindo que um jogador escolha onde quer morar não só por vocação econômica (`trade-routes.md`) mas também por que tipo de imóvel está disponível e a que preço.

## 3. Anti-especulação — risco a resolver desde a concepção

Um castelo raro, vendável por gold, é exatamente o tipo de ativo que atrai comércio de dinheiro real por fora do jogo (RMT) — risco já sinalizado no histórico do projeto ("sensibilidade de RMT" da pesquisa de Constituição Econômica, adjacente à decisão congelada sobre Gold). O design do mercado precisa considerar, desde a concepção:

- **Limite de reajuste de preço** — impedir que um proprietário liste e relise a mesma propriedade repetidamente a preços crescentes de forma manipulativa.
- **Imposto de transação em revendas rápidas** — desincentivar "flipping" puro (comprar e revender em curto prazo só para lucro de arbitragem), sem impedir venda legítima.
- **Nenhum caminho de compra direta com dinheiro real** — a compra de propriedade é sempre com recursos do jogo (gold, ganho jogando), nunca um produto de loja.

Nenhuma dessas mitigações é decidida em detalhe aqui — são nomeadas como requisito de design a resolver antes da implementação, não como decisão já tomada.

## 4. Interação com Kingdom Treasury

Toda transação de mercado imobiliário é uma oportunidade natural de receita para o Reino (um imposto de transação, distinto do imposto de manutenção periódica já coberto em `housing-phase1.md`) — reforçando o mesmo ciclo "contribuição visível volta como investimento visível" que já embasa a mecânica de manutenção.

## 5. O que este documento não decide

Fórmula de preço, se existe leilão ou preço fixo, se há um limite de propriedades por jogador — decisões de balanceamento/game design futuras.

---

*Referências: `housing-phase1.md`; `kingdom-treasury.md`; a discussão de risco de RMT já presente na revisão "STREAMRPG — WORLD DESIGN 3.0" desta mesma sessão de projeto.*
