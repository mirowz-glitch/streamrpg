// Sprint Ancient Ruins Ecosystem (Phase I) — conteúdo puro sobre as
// Ruínas Antigas do Reino. Não pertencem a nenhuma raça específica, não
// têm explicação definitiva, e não entram no Bestiário nem no Museu
// (infraestrutura intocada nesta Sprint) — este arquivo é só uma base
// de lore, pronta para uma Sprint futura decidir como (e se) conectar a
// algum sistema/UI existente. Mesmo espírito de ravens.ts (Sprint
// Ravens Ecosystem): conteúdo isolado, sem componente, sem sistema.
export interface AncientRuinSite {
  id: string;
  name: string;
  regionId: string;
  conservation: string;
  appearance: string;
  curiosity: string;
  legend: string;
  unsolvedMystery: string;
}

export const ANCIENT_RUIN_SITES: AncientRuinSite[] = [
  {
    id: "coluna-partida-do-horizonte",
    name: "Coluna Partida do Horizonte",
    regionId: "planicie-dourada",
    conservation: "Muito deteriorada — só a base de uma coluna resta em pé.",
    appearance: "Pedra clara, símbolos apagados pelo vento e pelo tempo.",
    curiosity: "A sombra dela nunca aponta exatamente pra onde o sol está.",
    legend: "Dizem que era o centro de uma cidade inteira, hoje completamente desaparecida.",
    unsolvedMystery: "Nenhuma outra estrutura foi encontrada ao redor, nunca — nem fundação, nem entulho.",
  },
  {
    id: "portao-sem-muro",
    name: "Portão Sem Muro",
    regionId: "colinas-aridas",
    conservation: "Intacto, isolado — nenhuma outra estrutura por perto.",
    appearance: "Um arco de pedra perfeito, sem nenhuma parede ligada a ele.",
    curiosity: "Atravessá-lo não leva a lugar nenhum diferente do outro lado.",
    legend: "Alguns dizem que antes havia um muro inteiro em volta dele.",
    unsolvedMystery: "Nenhuma fundação foi encontrada ao redor, como se o arco tivesse sido colocado ali sozinho.",
  },
  {
    id: "escadaria-que-termina-na-pedra",
    name: "Escadaria que Termina na Pedra",
    regionId: "minas-abandonadas",
    conservation: "Parcialmente soterrada.",
    appearance: "Degraus de pedra que sobem e terminam abruptamente numa parede sólida.",
    curiosity: "Os mesmos degraus parecem continuar do outro lado, vistos de uma escavação vizinha.",
    legend: "Dizem que a escada levava a algum lugar que foi selado de propósito.",
    unsolvedMystery: "Ninguém conseguiu confirmar o que está atrás da parede.",
  },
  {
    id: "estatua-sem-rosto",
    name: "Estátua Sem Rosto",
    regionId: "ruinas-esquecidas",
    conservation: "Bem preservada, exceto o rosto.",
    appearance: "Figura humanoide ajoelhada, o rosto completamente liso.",
    curiosity: "O resto do corpo tem detalhes extremamente finos — só o rosto foi apagado, ou nunca esculpido.",
    legend: "Dizem que representa alguém que o próprio Reino escolheu esquecer.",
    unsolvedMystery: "Ninguém sabe se o rosto foi destruído ou se nunca existiu.",
  },
  {
    id: "poco-completamente-seco",
    name: "Poço Completamente Seco",
    regionId: "deserto-de-vidro",
    conservation: "Intacto.",
    appearance: "Um poço de pedra profundo, sem nenhum sinal de já ter tido água.",
    curiosity: "Jogar uma pedra dentro dele, o som do impacto demora tempo demais pra voltar.",
    legend: "Contam que era usado pra algum tipo de ritual, não pra beber.",
    unsolvedMystery: "Ninguém mediu a profundidade real dele.",
  },
  {
    id: "simbolos-esculpidos-do-penhasco",
    name: "Símbolos Esculpidos do Penhasco",
    regionId: "picos-congelados",
    conservation: "Erosão parcial pelo gelo.",
    appearance: "Uma parede inteira coberta de símbolos entalhados, nenhum decifrado.",
    curiosity: "Os símbolos parecem mudar de posição entre uma visita e outra — ou é só a luz enganando.",
    legend: "Alguns acreditam que é um aviso. Outros, um registro.",
    unsolvedMystery: "Nenhum estudioso do Reino conseguiu traduzir uma única palavra.",
  },
  {
    id: "vestigios-do-acampamento-antigo",
    name: "Vestígios do Acampamento Antigo",
    regionId: "bosque-sussurrante",
    conservation: "Quase apagado pela vegetação.",
    appearance: "Círculos de pedra queimada e restos de ferramentas enferrujadas.",
    curiosity: "As fogueiras parecem ter sido apagadas todas ao mesmo tempo, não uma a uma.",
    legend: "Dizem que um grupo inteiro desapareceu numa única noite.",
    unsolvedMystery: "Nenhum corpo, nenhum rastro de saída foi encontrado.",
  },
  {
    id: "mascara-enterrada-do-pantano",
    name: "Máscara Enterrada do Pântano",
    regionId: "pantano-podre",
    conservation: "Parcialmente submersa.",
    appearance: "Uma máscara de pedra cinza, meio afundada na lama.",
    curiosity: "Nunca afunda mais do que já está, nem sobe.",
    legend: "Contam que foi enterrada de propósito, não perdida.",
    unsolvedMystery: "Ninguém sabe o que ela representa, nem quem a fez.",
  },
  {
    id: "torre-sem-entrada",
    name: "Torre Sem Entrada",
    regionId: "litoral-quebrado",
    conservation: "Intacta por fora.",
    appearance: "Uma torre de pedra alta demais para ter sido construída sem andaimes.",
    curiosity: "Nenhuma porta, nenhuma janela, nenhuma escada visível em lugar nenhum.",
    legend: "Dizem que foi construída de dentro pra fora.",
    unsolvedMystery: "Ninguém encontrou uma única entrada, em nenhum lado.",
  },
  {
    id: "arena-afundada",
    name: "Arena Afundada",
    regionId: "colinas-aridas",
    conservation: "Parcialmente soterrada.",
    appearance: "Um círculo de arquibancadas de pedra, meio enterrado.",
    curiosity: "O centro da arena é mais fundo do que deveria ser fisicamente possível escavar naquele solo.",
    legend: "Dizem que ali aconteciam disputas que ninguém mais lembra o motivo.",
    unsolvedMystery: "Nenhum registro do Reino menciona essa arena antes de ela ser encontrada.",
  },
  {
    id: "portal-de-pedra-da-fronteira",
    name: "Portal de Pedra da Fronteira",
    regionId: "fortaleza-sombria",
    conservation: "Intacto, isolado.",
    appearance: "Dois blocos de pedra erguidos, um terceiro caído no chão entre eles.",
    curiosity: "Ninguém consegue mover o bloco caído, nem com força, nem com ferramenta.",
    legend: "Contam que era usado pra marcar um limite que já não existe.",
    unsolvedMystery: "Nenhum mapa antigo mostra uma fronteira ali.",
  },
  {
    id: "camara-das-vozes",
    name: "Câmara das Vozes",
    regionId: "ruinas-esquecidas",
    conservation: "Bem preservada.",
    appearance: "Uma câmara circular de pedra lisa, com acústica estranhamente perfeita.",
    curiosity: "Um sussurro nela ecoa como se várias vozes respondessem junto.",
    legend: "Dizem que ali se falava com os mortos. Ou apenas com o eco.",
    unsolvedMystery: "Ninguém sabe explicar por que o eco nunca se repete do mesmo jeito duas vezes.",
  },
];

// "25 Encounter Narratives" — texto de sabor puro, mesmo espírito de
// RAVEN_ENCOUNTERS (Sprint Ravens Ecosystem): não altera
// ExpeditionSystem/EncounterSystem, só conteúdo pronto pra uma Sprint
// futura decidir onde exibir.
export const RUIN_ENCOUNTER_NARRATIVES: string[] = [
  "Vestígios de um antigo acampamento entre as pedras.",
  "Uma escadaria termina abruptamente numa parede sólida.",
  "Uma porta de pedra, sem nenhuma parede ao redor.",
  "Uma estátua sem rosto observa o caminho.",
  "Um poço completamente seco, fundo demais para ver o fim.",
  "Pegadas antigas, gravadas na pedra, não na terra.",
  "Símbolos esculpidos cobrem uma parede inteira.",
  "Uma coluna quebrada projeta uma sombra estranha.",
  "Um eco responde antes mesmo de qualquer som ser feito.",
  "Um bloco de pedra caído, impossível de mover.",
  "Uma câmara circular silenciosa demais para o tamanho.",
  "Uma máscara de pedra meio enterrada observa de baixo.",
  "Um arco de pedra isolado, sem nada ao redor.",
  "Restos de ferramentas enferrujadas espalhados no chão.",
  "Uma inscrição apagada de propósito, não pelo tempo.",
  "Degraus de pedra sobem e desaparecem na escuridão.",
  "Um vento frio passa por um corredor sem saída visível.",
  "Uma arquibancada de pedra, meio soterrada, forma um círculo.",
  "Um fragmento de mapa gravado numa pedra, ilegível.",
  "Um selo antigo, sem nenhum brasão reconhecível.",
  "Uma torre alta demais, sem porta nem janela.",
  "Um silêncio absoluto toma conta das ruínas por um instante.",
  "Uma voz distante ecoa, sem dono aparente.",
  "Marcas de mãos gravadas numa pedra lisa demais.",
  "Um corredor termina numa parede idêntica à de entrada.",
];
