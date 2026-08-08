# Housing Phase I

**Status:** 🚧 Preparação — conceitual, nenhuma implementação, nenhum schema. Parte da Sprint "Foundation Refactor".

## 1. O princípio

A casa é a menor unidade de permanência que um jogador comum pode possuir — mais importante emocionalmente até que um castelo, porque é o objetivo alcançável de todo cidadão, não só dos mais dedicados. A casa pertence ao Reino, nunca ao jogador — a mesma separação entre fundação (permanente) e posse (transitória) já aplicada a Reinos em `kingdom-domain-2.0.md`, um nível abaixo.

## 2. Bairros

O Reino é dividido em bairros — não geograficamente infinitos: um número de lotes que cresce com a população real do Reino, nunca fixo desde o dia 1 (para que um Reino jovem não pareça um deserto de terrenos vazios esperando compradores que não existem). Cada bairro pode ganhar identidade própria com o tempo, conforme casas de prestígio se acumulam ali — um bairro nasce humilde e pode, organicamente, virar "o Bairro dos Mercadores" ou "o Bairro Velho", sem isso ser decretado por design, só observado a partir do que os jogadores construíram.

## 3. Ciclo de vida de uma propriedade

**Construção.** Um cidadão constrói num lote disponível do bairro. O nome do construtor é gravado permanentemente no objeto — nunca no personagem — de forma que a placa continua correta mesmo se o vínculo entre o construtor e a propriedade se perder de outras formas.

**Posse ativa.** O proprietário atual paga manutenção/imposto periodicamente, pode reformar/evoluir a propriedade (mesma lógica de Building Progression já usada em prédios da Cidade), pode decorá-la.

**Impostos como mecânica social, não gold sink.** Toda propriedade contribui para o Reino — mas o retorno precisa ser visível: o tesouro do Reino financiando expansão de bairros, eventos, bônus locais. Um Reino com tesouro cheio deveria *parecer* diferente de um Reino falido, não só numa tela de estatística.

**Venda voluntária.** O proprietário lista no Mercado Imobiliário (`real-estate.md`), outro jogador compra. Título/prestígio do vendedor não transferem — só o objeto físico e sua história acumulada.

**Abandono.** Manutenção não paga por um período definido (meses, per o brief) → o Reino retoma a posse → a propriedade some do controle do jogador mas não da história (o nome do construtor original permanece, "recuperado pelo Reino em [data]" vira mais uma linha na crônica do próprio imóvel) → volta ao mercado, disponível para um novo dono.

**Ciclo perpétuo.** Este ciclo pode se repetir indefinidamente — uma casa pode ter 15 donos ao longo de 8 anos de jogo, cada um deixando um rastro, e é exatamente essa pilha de rastros que faz um imóvel antigo parecer mais valioso que um novo, sem precisar de nenhum stat mecânico diferente entre eles.

## 4. Histórico permanente — o que fica gravado

- Quem construiu, quando.
- Cada troca de dono (venda voluntária ou recuperação por abandono), com data.
- Eventos notáveis que aconteceram ali, se aplicável (mesma disciplina de fato-definitivo-nunca-editado já usada em `character_chronicles`).

## 5. Placas — o mecanismo de contar história sozinho

Cada propriedade "sabe" sua própria proveniência e a expõe automaticamente — sem precisar de conteúdo escrito à mão pela produção para cada casa individual. Mesmo padrão já usado em Environmental Storytelling/World Simulation (linhas ambiente já existentes em várias Buildings da Cidade), aplicado a objetos permanentes do mundo social.

## 6. O que este documento não decide

Quantidade de lotes por bairro, custo de construção, valor de imposto, período de abandono até recuperação — tudo isso é balanceamento futuro, não arquitetura. Este documento define a *forma* do sistema, não os números.

---

*Referências: `real-estate.md` (o lado de mercado/compra-venda); `kingdom-treasury.md` (para onde o imposto flui); `kingdom-domain-2.0.md` (o mesmo princípio de fundação-permanente/posse-transitória aplicado um nível acima).*
