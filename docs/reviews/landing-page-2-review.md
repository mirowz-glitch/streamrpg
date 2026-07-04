# Landing Page 2.0 (MVP) — Review

Reconstrução completa da primeira impressão do StreamRPG. Sprint
exclusivamente de UX/UI/apresentação; nenhuma regra de
XP/Gold/Boss/Combat/Classes/Economy/Marketplace/Kingdom/Expedition/
Encounter/Timeline/Identity/Prestige foi alterada — tudo aditivo, tudo
dentro de `apps/web/src/pages/LoginPage.tsx` e
`apps/web/src/components/landing/`.

## Arquitetura

8 componentes novos, cada um isolado e reaproveitável, exatamente os
nomes pedidos na Sprint:

| Componente | Papel |
|---|---|
| `LandingBackground` | Fundo ambiente fixo (céu em gradiente + montanhas distantes + nuvens) atrás de toda a página, não só o Hero |
| `HeroSection` | Título, tagline, CTA e a cena ilustrada (castelo/montanhas/bosque/aventureiros/Boss gigante) |
| `FeatureCard` | Cartão reutilizado pelos 6 destaques (Evolua/Explore/Reino/Bosses/Equipamentos/Prestígio) |
| `HowItWorks` | Timeline de 6 passos reais (login → escolher live → personagem nasce → explora → Boss → legado) |
| `WorldPreview` | `REGIONS.length` regiões + ícones de destaque + `RegionGallery` reaproveitado |
| `KingdomPreview` | Mock ilustrativo do Reino — `HallOfFame`/`Timeline` reais (Kingdom Prestige System) com dados de exemplo |
| `CityPreview` | `CityMap` (Sprint Capital City) + `NpcIntro` (Sprint NPCs Vivos) como vitrine |
| `CharacterPreview` | Personagem de exemplo — `FramedAvatar`/`XpBar`/`EquipmentSlots`/`ExpeditionCompact` reais com dados fabricados |
| `FinalCTA` | Chamada final, mesmo login do Hero |

`LoginPage.tsx` só compõe esses 8 componentes; o único estado próprio
que ficou nela é `loading`/`error` do login (compartilhado entre
`HeroSection` e `FinalCTA`).

**Sobre os mocks (Kingdom/Perfil):** a própria Sprint pede
"mock elegante" e "personagem exemplo" — diferente de toda tela real do
jogo (onde dado fabricado nunca é aceitável), aqui é o esperado para uma
landing pública sem sessão. Ainda assim, cada seção com dado fabricado
ganhou uma tag visível "Exemplo ilustrativo", para nunca parecer uma
alegação real sobre o estado do jogo.

**Sobre a ilustração do Hero:** SVG desenhado à mão com shapes
(polígonos, elipses, círculos) e gradientes — sem IA, sem imagem
pesada, sem animação. Boss gigante (elipse + círculo + olhos
vermelhos) parcialmente oculto atrás da cordilheira (occlusão por
ordem de desenho), castelo com torres/ameias/bandeira, bosque
(triângulos repetidos), aventureiros minúsculos para reforçar a escala
do Boss por contraste.

## Verificação

- **Typecheck/Build:** limpos, mesma baseline de sempre.
- **Browser ao vivo (desktop 1280px):** Hero ocupando quase a tela
  toda, com a cena ilustrada visível logo abaixo do CTA; 6 cartões de
  destaque com hover/sombra; "Como funciona" com os 6 passos reais;
  Mundo mostrando "11 Regiões" (contado de `REGIONS.length`, não um
  número fixo) + a galeria real de regiões; Reino com o mock elegante
  (Prestígio 1.240, Hall da Fama completo, Timeline com 3 eventos de
  exemplo); Cidade com o mapa de prédios real + Borin, o Ferreiro como
  amostra; Perfil de exemplo (Kaio, nível 14, XP bar, expedição
  compacta, 3 itens equipados com cores de raridade corretas); Chamada
  final com o mesmo botão do Hero. Nenhum erro no console, nenhuma
  requisição falhando.
- **Responsivo (mobile 375px):** sem overflow horizontal
  (`scrollWidth === innerWidth === 375`); destaques e "Mundo" colapsam
  para 1-3 colunas; galerias reaproveitadas (Regiões/Hall da
  Fama/Cidade) já colapsam sozinhas para 1 coluna (mesmo grid
  responsivo que já usavam dentro do jogo).

## Regressão

Nenhum arquivo de XP/Gold/Boss/Combat/Classes/Economy/Marketplace/
Kingdom/Expedition/Encounter/Timeline/Identity/Prestige foi tocado.
Único arquivo de página alterado foi `LoginPage.tsx` (reescrito, mesma
função `handleLogin` de antes); `styles.css` só recebeu adições (mais a
remoção do `.login-card` antigo, que não é mais usado por nenhum
componente).

## Respostas

**A primeira impressão parece um jogo?**
Sim — céu em gradiente, montanhas, castelo, bosque e um Boss gigante
com olhos brilhando substituem o antigo cartão branco-e-cinza
centralizado. A textura visual (gradientes, sombras, cartões com
hover) é consistente com "MMORPG vivo", não "dashboard".

**A Landing explica o StreamRPG em menos de 20 segundos?**
O Hero sozinho já entrega "personagem vive enquanto você assiste
lives" em uma frase; os 6 cartões de destaque cobrem progressão,
exploração, comunidade, Bosses, itens e prestígio sem precisar rolar
muito.

**Existe vontade de clicar em "Entrar com Twitch"?**
O botão aparece 2 vezes (Hero e Chamada Final), sempre com gradiente/
sombra roxa chamativa, nunca escondido atrás de texto pequeno.

**A página representa corretamente tudo que já foi implementado?**
Sim, dentro do que uma landing permite: cada seção mapeia para um
sistema real (Progressão, Mundo/Expedições, Reino/Prestígio, Cidade/
NPCs, Perfil/Equipamento) — nada foi prometido que não existe hoje.

**A Landing reutiliza componentes existentes sempre que possível?**
Sim — `RegionGallery`, `HallOfFame`, `Timeline`, `CityMap`, `NpcIntro`,
`FramedAvatar`, `XpBar`, `EquipmentSlots` e `ExpeditionCompact` são
todos componentes já usados dentro do jogo, só alimentados com dados de
exemplo aqui. Os únicos elementos verdadeiramente novos são os 8
componentes de `components/landing/` pedidos pela própria Sprint.
