# 08. Como Boss consome este Gameplay Design

**Status: 🟠 Rascunho.** Não é capítulo da Bible — o capítulo 6 (Bosses)
continua ✅ Estável e **não é reaberto por nada aqui**. Este capítulo só
confirma explicitamente onde os capítulos 01-06 deste diretório encaixam
no que o capítulo 6 já decidiu, fechando o "achado crítico" que o próprio
Technical Design de Boss (`docs/technical-design/boss-system.md`, seção
7) já havia sinalizado: a fórmula de dano pressupõe Equipamentos/Classe
com valor numérico, que "hoje nenhum dos dois existe assim".

## O que já estava decidido (capítulo 6, fato)

- Dano coletivo: uma única barra de vida por canal, cada personagem
  contribui seu próprio DPS.
- Sem aggro, sem Tank/Healer no MVP.
- Fórmula: `Base × Equipamentos × Classe × Critical`, sem RNG pesado
  além de pequena chance de crítico.
- Multiplicador de Classe fixo em `1` como placeholder, documentado
  explicitamente como tal no Technical Design.
- 3 habilidades fixas do Boss (ataque normal, especial periódico,
  ultimate por %).

## O que este diretório propõe para preencher as lacunas

| Termo da fórmula | Onde este diretório resolve | Status |
|---|---|---|
| `Base` | Capítulo 01 — função de `level`, já existente | Pronto para uso, sem mudança de schema |
| `Equipamentos` | Capítulo 01 (ATQ) + capítulo 05 — parte numérica já existe em `packages/shared/src/items.ts`, nunca chamada por nenhum System de combate | Parcialmente pronto — falta só *conectar*, não inventar |
| `Classe` | Capítulo 06 — 4 arquétipos com multiplicador proposto | Não implementado, Classes (cap. 4 da Bible) continua Placeholder |
| `Critical` | Inalterado — já decidido no capítulo 6, este diretório não propõe mudança | Já fechado |

## O que existe no Combat Model e ainda NÃO existe na implementação real de Boss (Sprint 4)

`docs/technical-design/boss-system.md` (Sprint B3, ✅ implementado)
documenta explicitamente: *"fórmula temporária: `DAMAGE_PER_CHARACTER_PER_TICK`
fixo por personagem presente — sem crítico, sem Equipamentos/Classe."*
Comparando com a fórmula canônica (`docs/combat-model/canonical-formula.md`),
faltam na implementação real:

- Resistência (física/mágica)
- Crítico
- Equipamentos (ATQ real por item)
- Classe (multiplicador real, hoje nem existe como placeholder no código)
- Penetração
- Bloqueio
- Regeneração via SUS
- Checagens de UTI (controle/detecção)

**Isso é esperado, não é um bug.** O Boss real usa deliberadamente a
fórmula simplificada decidida na Sprint B3 — o próprio Technical Design
já registra isso como escolha consciente, não como pendência esquecida.
Nenhuma parte desta lista deveria ser tratada como "trabalho atrasado";
é trabalho que só faz sentido começar depois que Classes (capítulo 4 da
Bible) sair de Placeholder, na ordem já confirmada pelo Roadmap
(capítulo 12).

## Onde este diretório NÃO altera Boss

- **Aggro/Tank/Healer continuam fora do MVP de Boss**, mesmo que o
  capítulo 02 (Grupo) e 06 (Classes) deste diretório desenhem uma visão
  onde papéis de grupo existem — isso é visão pós-MVP para expedições
  normais, não uma proposta de reabrir o capítulo 6.
- **Habilidades diferenciadas de Boss reagindo a tipo de equipamento**
  (ex.: Escudo anulando ataque frontal, capítulo 05) não existem no MVP
  de Boss (3 habilidades fixas, sem tipo). Isso também é visão futura,
  não uma mudança do que já foi implementado (Sprints B1-B4).
- **Escala por tiers (capítulo 6, bloco Escala)** continua baseada em
  contagem de participantes, não em atributos de build — este diretório
  não propõe mudar isso.

## O que muda de fato, se este diretório for aceito no futuro

Só uma coisa: `BossRewardSystem`/`BossCombatSystem` (já implementados,
Sprints B3/B4) poderiam parar de tratar o multiplicador de Classe como
`1` fixo e passar a ler um valor real — **isso exigiria que Classes
(capítulo 4 da Bible) deixasse de ser Placeholder primeiro**, seguindo a
mesma ordem de construção já confirmada no capítulo 12 (Roadmap). Nenhuma
mudança de código é proposta ou decidida aqui.

## Nota de honestidade

Este capítulo confirma que a lacuna que o Technical Design de Boss já
tinha nomeado ("dependência ainda não modelada") agora tem uma proposta
de preenchimento — mas "proposta" não é "decisão". Nada aqui altera o
capítulo 6 da Bible, nenhuma linha de código muda, e Classes continua
precisando do mesmo processo bloco-a-bloco que Bosses já usou antes de
qualquer implementação real.
