// Sprint Hidden Objects (MVP) — catálogo estático de pontos interativos
// espalhados pela Praça Central. Mesmo padrão de Biblioteca/Bestiário/
// Museu/Taverna: só conteúdo, nenhuma mecânica, nenhum backend. Cada
// clique avança para o próximo texto da lista (nunca sorteado — a
// graça está na progressão); ao esgotar a lista, repete o último texto
// para sempre.
export interface HiddenObjectDefinition {
  key: string;
  icon: string;
  name: string;
  description: string;
  texts: string[];
}

export const HIDDEN_OBJECTS: HiddenObjectDefinition[] = [
  {
    key: "balde",
    icon: "🪣",
    name: "Balde",
    description: "Encostado perto do poço, meio esquecido.",
    texts: [
      "O balde está cheio de água da chuva.",
      "Ainda tem água.",
      "Você podia lavar algo. Mas não vai.",
      "O balde observa você em silêncio.",
    ],
  },
  {
    key: "fonte",
    icon: "⛲",
    name: "Fonte",
    description: "A fonte central da praça, sempre correndo.",
    texts: [
      "A água parece limpa.",
      "Você lava as mãos.",
      "Agora elas estão limpas.\n\nAs Luvas Rasgadas continuam não.",
    ],
  },
  {
    key: "arvore",
    icon: "🌳",
    name: "Árvore",
    description: "Mais velha que qualquer construção ao redor.",
    texts: [
      "A árvore balança com o vento.",
      "Uma folha cai.",
      "Você não fez nada para causar isso.",
      "A árvore continua sendo mais paciente que você.",
    ],
  },
  {
    key: "banco",
    icon: "🪑",
    name: "Banco",
    description: "Um banco de madeira na sombra da árvore.",
    texts: [
      "O banco da praça está vazio.",
      "Você senta por um momento.",
      "Ninguém nota. Ninguém precisa notar.",
      "Você se levanta. A praça segue igual.",
    ],
  },
  {
    key: "fogueira",
    icon: "🔥",
    name: "Fogueira",
    description: "Uma fogueira pequena, sempre acesa.",
    texts: [
      "O fogo crepita baixinho.",
      "Está quente perto dali.",
      "Alguém deveria trazer mais lenha.",
      "Você não é essa pessoa hoje.",
    ],
  },
  {
    key: "caixote",
    icon: "📦",
    name: "Caixote",
    description: "Um caixote de madeira encostado num canto.",
    texts: ["O caixote está pregado no chão.", "Você tenta abrir mesmo assim.", "Não abre.", "Talvez nunca tenha sido para abrir."],
  },
  {
    key: "barril",
    icon: "🛢",
    name: "Barril",
    description: "Um barril velho, de origem incerta.",
    texts: ["O barril está vazio.", "Continua vazio.", "Você realmente esperava outro resultado?"],
  },
  {
    key: "estatua",
    icon: "🕯",
    name: "Estátua",
    description: "Uma estátua de pedra escura, sem nenhuma feição.",
    texts: ["A estátua não tem rosto.", "Ninguém sabe por quê.", "Você também não vai descobrir hoje."],
  },
  {
    key: "janela",
    icon: "🪟",
    name: "Janela",
    description: "Uma janela baixa, de uma casa qualquer.",
    texts: ["A janela está fechada.", "Você espia por ela mesmo assim.", "Não tem nada demais lá dentro.", "Ou talvez tenha, e você não percebeu."],
  },
  {
    key: "placa",
    icon: "🪧",
    name: "Placa",
    description: "Uma placa de madeira cravada na terra.",
    texts: ["A placa está desbotada.", "Você tenta ler mesmo assim.", "Diz algo sobre não pisar na grama.", "Você está pisando na grama."],
  },
  {
    key: "pedra",
    icon: "🪨",
    name: "Pedra",
    description: "Uma pedra qualquer no meio do caminho.",
    texts: ["É só uma pedra.", "Você chuta a pedra.", "Ainda é só uma pedra, agora um pouco mais longe."],
  },
  {
    key: "ninho",
    icon: "🐦",
    name: "Ninho",
    description: "Um ninho num galho baixo.",
    texts: ["Há um ninho vazio no galho.", "Os pássaros devem estar por perto.", "Ou já foram embora há muito tempo."],
  },
  {
    key: "porta-velha",
    icon: "🚪",
    name: "Porta velha",
    description: "Uma porta isolada, sem parede ao redor.",
    texts: ["A porta está trancada.", "Você empurra mesmo assim.", "Continua trancada.", "Alguém, um dia, vai ter que explicar essa porta."],
  },
  {
    key: "bigorna",
    icon: "⚒",
    name: "Bigorna",
    description: "A bigorna do Borin, fria por enquanto.",
    texts: ["A bigorna está fria.", "Você bate nela uma vez.", "Nada acontece, exceto o barulho.", "O barulho já valeu a pena."],
  },
  {
    key: "pilha-livros",
    icon: "📚",
    name: "Pilha de livros",
    description: "Livros empilhados num canto, esquecidos.",
    texts: ["Uma pilha de livros esquecida num canto.", "Você folheia um deles.", "Está em uma língua que você não reconhece.", "Ou só está de cabeça para baixo."],
  },
  {
    key: "vassoura",
    icon: "🧹",
    name: "Vassoura",
    description: "Uma vassoura encostada na parede.",
    texts: ["Uma vassoura encostada na parede.", "Você pega a vassoura.", "Varre um pouco de poeira.", "A poeira volta amanhã, como sempre."],
  },
  {
    key: "espelho",
    icon: "🪞",
    name: "Espelho",
    description: "Um espelho rachado, apoiado num canto.",
    texts: ["Um espelho rachado num canto.", "Você se olha nele.", "Parece você, só que um pouco mais cansado.", "O espelho não mente. Isso é o pior."],
  },
  {
    key: "cesta-pao",
    icon: "🥖",
    name: "Cesta de pão",
    description: "Pão fresco esfriando na janela da padaria.",
    texts: [
      "Uma cesta de pão fresco na janela.",
      "O cheiro é bom.",
      "Você não vai roubar pão. Provavelmente.",
      "As maçãs da praça continuam desaparecendo, mas não foi você dessa vez.",
    ],
  },
  {
    key: "gato",
    icon: "🐈",
    name: "Gato",
    description: "Um gato sentado onde bem entende.",
    texts: ["O gato ignora você.", "O gato continua ignorando você.", "Você perdeu a discussão."],
  },
  {
    key: "cachorro",
    icon: "🐕",
    name: "Cachorro",
    description: "Um cachorro que conhece todo mundo na Capital.",
    texts: ["O cachorro balança o rabo.", "Você faz carinho.", "Ele parece satisfeito. Finalmente alguém entende as prioridades certas.", "Vocês dois concordam: isso foi ótimo."],
  },
  {
    key: "sino",
    icon: "🔔",
    name: "Sino",
    description: "Um sino pequeno pendurado numa porta.",
    texts: ["Um sino pequeno pendurado numa porta.", "Você toca o sino.", "Ninguém aparece.", "Você toca de novo, só para garantir."],
  },
  {
    key: "teia",
    icon: "🕸",
    name: "Teia de aranha",
    description: "Uma teia entre dois postes de madeira.",
    texts: ["Uma teia de aranha entre dois postes.", "A aranha não está em casa.", "Ou está bem quieta, observando."],
  },
  {
    key: "cesto-roupa",
    icon: "🧺",
    name: "Cesto de roupa",
    description: "Roupas secando ao sol, penduradas num varal.",
    texts: ["Roupas secando ao sol.", "Uma delas nem parece ser de ninguém que você conhece.", "Você finge que não viu."],
  },
  {
    key: "lenha",
    icon: "🪵",
    name: "Pilha de lenha",
    description: "Lenha cortada e empilhada com cuidado.",
    texts: ["Uma pilha de lenha bem organizada.", "Alguém teve trabalho com isso.", "Você não vai desorganizar. Hoje não."],
  },
  {
    key: "armadilha",
    icon: "🪤",
    name: "Armadilha",
    description: "Uma armadilha simples, escondida num canto.",
    texts: ["Uma armadilha simples, provavelmente para ratos.", "Está vazia.", "Você se afasta, por precaução.", "Boa decisão."],
  },
];
