# Mapa de Dependência de Classes (Etapas 10 e 11)

Complementa [classes-final-architecture.md](classes-final-architecture.md).
Aqui: o diagrama de dependência pedido pela Sprint, e a análise
documento-a-documento de tudo que já existe.

## Diagrama de dependência

```
Classes
  ↓ (define Classe_mult(tipo), VEL/SUS/UTI bonus por classe)
Combat (fórmula canônica: Base × Equipamento_ATQ × Classe_mult × Critical,
        mitigado por Resistência/Penetração/Bloqueio)
  ↓ (mesma fórmula, sem exceção — "uma única fórmula, sempre")
Boss (substitui Classe_mult=1 fixo por valor real por Classe;
      nenhuma outra regra de Boss muda)
  ↓ (Equipamento continua vindo de Items — nenhuma mudança de schema aqui)
Items (arma define tipo de dano; Armadura/Elmo/Botas/Amuleto/Anel
       continuam definindo Resistência/UTI, como já decidido no
       Combat Model)
  ↓ (Hero Token é a via de obtenção de variante de Classe, não de item)
Hero Token (emitido por indicação real validada; gasto em variante
            exclusiva ou reset de Classe)
  ↓ (build = Classe + Equipamento passa a existir como conceito real)
Progression (XP/Level/Gold/Drop continuam absolutamente inalterados;
             só ganha uma nova dimensão de identidade — a Classe)
  ↓ (Hero Token é sink e ativo negociável)
Economy (ganha destino definido para Hero Token; nenhuma mudança em
         DROP_CHANCE, pesos de raridade, ou Gold)
  ↓ (Hero Token circula livremente, uma vez emitido)
Marketplace (Hero Token é o primeiro ativo com regra de emissão
             anti-abuso já definida antes de Marketplace existir)
  ↓ (classe favorecida por região ganha mecanismo numérico real)
World (tabela região×classe já existente em gameplay-design/07 passa a
       ter Classe_mult vs. Resistência do monstro por trás; nenhuma
       região redesenhada)
  ↓ (Kingdom é o contexto onde tudo isso acontece coletivamente)
Kingdom (nenhuma mudança direta — Classes é decisão de Character,
         Kingdom continua sendo escopo de canal; a única relação é que
         a diversidade de Classes num Kingdom afeta a variedade de
         grupo disponível para Boss/Exploração daquele canal)
```

## Análise documento-a-documento

| Documento | Precisa alterar? | Por quê |
|---|---|---|
| Bible cap. 4 (Classes) | **Sim**, quando entrar oficialmente em Sprint | Sai de Placeholder — este documento é a proposta pronta para substituir o conteúdo atual do capítulo |
| Bible cap. 3 (Characters) | Não | Continua descrevendo o Character; Classe é uma extensão, não uma mudança de Character |
| Bible cap. 6 (Bosses) | Não | Já antecipava `Classe_mult` como termo placeholder — nada aqui contradiz o capítulo, só preenche a lacuna já registrada nele mesmo |
| Bible cap. 10 (Economy) | **Parcialmente**, quando Economia entrar em Sprint | A pergunta em aberto sobre Hero Token circular no Marketplace antes do resgate agora tem resposta (Etapa 8) — precisa ser incorporada ao capítulo quando ele fechar |
| Bible cap. 11 (Marketplace) | Não | Nenhuma decisão de Marketplace em si muda — só ganha um ativo a mais (Hero Token) quando existir |
| Bible `open-questions.md` | **Sim** | As 3 perguntas de Classes devem ser removidas da lista de abertas — estão todas respondidas nesta Sprint |
| Bible `consistency-report.md` | **Sim**, na próxima auditoria de consistência | Deve registrar que a dependência "Classes bloqueia fórmula de Boss" está resolvida em design (não em código) |
| `gameplay-design/01-characters-attributes.md` | Não | Já descreve corretamente que ATQ/VEL/SUS/UTI derivam de Classe — este documento só dá valores reais, não muda a estrutura |
| `gameplay-design/04-builds.md` | Não | A tabela de builds (Dano/Tanque/Suporte/Velocidade/Utilidade) continua válida; Classes é o mecanismo que a torna real, não uma substituição dela |
| `gameplay-design/06-classes-skills.md` | Não, mas fica "encerrado" | Este era o rascunho — `classes-final-architecture.md` é a versão fechada dele. Não fica obsoleto (continua sendo a fonte do raciocínio de identidade/passivos), só deixa de ser a fronteira do design |
| `gameplay-design/07-regions-interface.md` | Não | Tabela região×classe continua válida integralmente; ganha um mecanismo numérico (`Classe_mult`) por trás, não uma tabela nova |
| `gameplay-design/08-boss-interface.md` | Não | Já previa exatamente esta resolução ("só falta Classes sair de Placeholder") — nenhuma parte dele precisa mudar |
| `combat-model/canonical-formula.md` | Não | A fórmula e a estrutura de `Classe_mult(tipo)` já estavam corretas — só ganham valores reais (Etapa 7), não uma reformulação |
| `combat-model/monsters-and-regions.md` | Não | Perfis de Resistência dos monstros continuam os mesmos; a interação com `Classe_mult` é nova mas não exige mudar nenhum valor de monstro |
| `world-design/regions.md` | Não | Nenhuma região muda de conteúdo, dificuldade ou tema |
| `technical-design/boss-system.md` | **Sim**, quando a implementação real acontecer | Precisa registrar que `Classe_mult` deixou de ser `1` fixo — mas isso é mudança de **código futuro**, não deste documento |
| `docs/design/progression-tree.md` (Sprint anterior) | **Sim**, atualização leve | Já recomendava "Classes logo após BossSystem" como proposta — agora pode citar este documento como a proposta fechada, não mais em aberto |
| `docs/design/risks-and-mitigations.md` (Sprint anterior) | **Sim**, atualização leve | O risco "Druida/Xamã convergem" e "Classe_mult=1 sem incentivo" agora têm mitigação fechada — podem ser marcados como "resolvidos em design" |

## Nenhum documento ficou obsoleto

Nenhum arquivo lido nesta Sprint precisa ser apagado ou descartado — cada
um continua sendo a fonte correta do raciocínio que levou a esta decisão
final. `classes-final-architecture.md` é a camada de fechamento sobre
eles, não uma substituição.
