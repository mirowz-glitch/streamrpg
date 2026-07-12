// Sprint Ravens Ecosystem (Phase I) — conteúdo puro sobre os Corvos do
// Reino. Corvos NÃO são monstros (não entram no Bestiário) e não geram
// Encounters reais de Expedição (ExpeditionSystem intocado nesta
// Sprint) — este arquivo é só uma base de lore, pronta para uma Sprint
// futura decidir como (e se) conectar a algum sistema/UI existente.
export interface RavenSpecies {
  id: string;
  name: string;
  behavior: string;
  habitat: string;
  personality: string;
  curiosity: string;
  story: string;
  // "drops futuros (somente lore)" — mesmo espírito do Bestiário: nunca
  // implementado, só texto de sabor.
  loreDrops: string[];
}

export const RAVEN_SPECIES: RavenSpecies[] = [
  {
    id: "corvo-do-reino",
    name: "Corvo do Reino",
    behavior: "Segue viajantes à distância, observando sem nunca se aproximar demais.",
    habitat: "Presente em quase todas as regiões, mais comum perto de estradas e expedições.",
    personality: "Curioso, silencioso, nunca hostil.",
    story: "Contam que o mesmo corvo já foi visto acompanhando a mesma estrada por gerações — ou são vários, indistinguíveis uns dos outros. Ninguém consegue confirmar.",
    curiosity: "Alguns caçadores juram que ele reconhece rostos que já viu antes.",
    loreDrops: ["Pena Escura", "Bico Curto"],
  },
  {
    id: "corvo-das-ruinas",
    name: "Corvo das Ruínas",
    behavior: "Nunca sai das Ruínas Esquecidas, pousando sempre nos mesmos pontos exatos.",
    habitat: "Colunas quebradas e corredores das Ruínas Esquecidas.",
    personality: "Silencioso, quase imóvel por horas seguidas.",
    story: "Alaric, o Curador, evita comentar sobre eles — diz só que nenhum corvo das Ruínas parece incomodado com o que quer que viva lá dentro.",
    curiosity: "Um deles foi visto dias inteiros sobre a mesma lápide vazia, sem se mover.",
    loreDrops: ["Pena de Pedra", "Olho de Corvo"],
  },
  {
    id: "corvo-das-montanhas",
    name: "Corvo das Montanhas",
    behavior: "Voa em bandos pequenos acima da neve, acompanhando exploradores por dias inteiros.",
    habitat: "Picos Congelados, sempre acima da linha de neve.",
    personality: "Resistente ao frio, teimoso, difícil de afastar.",
    story: "Exploradores dos Picos Congelados contam que um bando os seguiu até o topo de uma escalada inteira, sem nunca pousar uma vez.",
    curiosity: "Uma pena encontrada lá em cima nunca murchou, mesmo anos depois.",
    loreDrops: ["Pena Congelada", "Garra Fina"],
  },
  {
    id: "corvo-do-bosque",
    name: "Corvo do Bosque",
    behavior: "Segue matilhas de lobos à distância, alimentando-se do que sobra de uma caçada.",
    habitat: "Bosque Sussurrante, sempre nas proximidades de território de lobo.",
    personality: "Oportunista, paciente, nunca apressado.",
    story: "Caçadores do Bosque Sussurrante dizem que ver corvos sobre a copa das árvores é sinal de que uma matilha caçou por perto, antes mesmo de qualquer rastro aparecer.",
    curiosity: "Somem por completo pouco antes de a matilha atacar — ninguém sabe explicar por quê.",
    loreDrops: ["Pena Suja", "Bico Manchado"],
  },
  {
    id: "corvo-mensageiro",
    name: "Corvo Mensageiro",
    behavior: "Alguns viajantes tentam treiná-lo para carregar bilhetes curtos entre regiões.",
    habitat: "Encontrado perto da Casa dos Viajantes e das principais estradas do Reino.",
    personality: "Obediente às vezes, mas nunca confiável o bastante para mensagens importantes.",
    story: "Idris jura que já confiou uma mensagem de verdade a um. Só uma vez — e nunca mais tentou repetir.",
    curiosity: "Ninguém sabe explicar como ele sempre volta para o dono certo, mesmo quando muda de região.",
    loreDrops: ["Broche do Mensageiro (lore)", "Pena Marcada"],
  },
  {
    id: "corvo-anciao",
    name: "Corvo Ancião",
    behavior: "Visto sempre sozinho, nunca em bando.",
    habitat: "Aparece em qualquer região do Reino, sem padrão conhecido.",
    personality: "Observador silencioso, quase deliberado no que faz.",
    story: "Alguns caçadores juram reconhecer o mesmo corvo observando-os por anos seguidos, em lugares completamente diferentes. Se ele entende o que os humanos dizem, nunca deu esse sinal.",
    curiosity: "Nunca foi visto se alimentando, brigando ou fugindo de nada.",
    loreDrops: ["Pena Eterna", "Olho Antigo"],
  },
];

// "20 encounters" — texto de sabor puro, no mesmo espírito de
// PLACEHOLDER_PAGES/pages do Bestiário: pronto para uma Sprint futura
// decidir onde exibir. Nenhuma alteração em ExpeditionSystem.ts.
export const RAVEN_ENCOUNTERS: string[] = [
  "Um corvo observa o grupo de um galho próximo, sem se mover.",
  "Centenas de corvos levantam voo ao mesmo tempo, sem motivo aparente.",
  "Uma pena negra cai devagar entre os viajantes.",
  "Um ninho abandonado é encontrado entre as pedras.",
  "Um silêncio absoluto toma conta do caminho — nem um pio de corvo.",
  "Um único corvo acompanha a expedição por um bom trecho, depois desaparece.",
  "Um corvo pousa exatamente onde alguém tropeçou segundos antes.",
  "Um bando pequeno de corvos sobrevoa em círculos, sem pousar.",
  "Um corvo grasna três vezes e depois some entre as árvores.",
  "Um corvo observa o acampamento a noite inteira, imóvel.",
  "Pegadas de corvo cruzam a lama, indo e voltando sem razão clara.",
  "Um corvo pousa no ombro de um dos viajantes por um instante, depois voa.",
  "Um bando inteiro segue a expedição por um trecho curto do caminho.",
  "Um corvo solitário observa de uma pedra alta, sem se aproximar.",
  "Uma pena escura fica presa entre os equipamentos do grupo.",
  "Um corvo interrompe o silêncio da noite com um grasnido só.",
  "Vários corvos pousam ao mesmo tempo, formando um círculo estranho.",
  "Um corvo acompanha o grupo de galho em galho, sem nunca se aproximar demais.",
  "Um ninho recém-feito é avistado alto demais para ser alcançado.",
  "Um corvo observa de longe enquanto o grupo descansa, sem emitir som.",
];
