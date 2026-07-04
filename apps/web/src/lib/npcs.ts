// Sprint NPCs Vivos — catálogo estático de personagens fixos da Capital.
// Puramente apresentação: nome, profissão, frase própria, descrição e um
// retrato ilustrado simples (nunca gerado por IA — forma + cor + ícone,
// combinação única por NPC para ser "imediatamente reconhecível" mesmo
// sem arte real). Nenhum dado aqui vem do banco; crescer o elenco no
// futuro é só adicionar uma entrada nova.
export type NpcPortraitShape = "square" | "hex" | "shield" | "arch" | "circle";

export interface NpcDefinition {
  key: string;
  name: string;
  profession: string;
  quote: string;
  description: string;
  icon: string;
  color: string;
  shape: NpcPortraitShape;
}

export const NPCS = {
  ferreiro: {
    key: "ferreiro",
    name: "Borin, o Ferreiro",
    profession: "Ferreiro",
    quote: "Uma boa espada dura mais que um guerreiro.",
    description: "Forjou a primeira lâmina da Capital com as próprias mãos — e não deixa ninguém esquecer disso.",
    icon: "🛠️",
    color: "#b08d57",
    shape: "square",
  },
  mercador: {
    key: "mercador",
    name: "Talia, a Mercadora",
    profession: "Mercadora",
    quote: "Toda moeda tem uma história — a minha loja vai guardar muitas.",
    description: "Viajou por três Reinos antes de decidir que este merecia sua loja.",
    icon: "🛒",
    color: "#34a853",
    shape: "arch",
  },
  alquimista: {
    key: "alquimista",
    name: "Zoltar, o Alquimista",
    profession: "Alquimista",
    quote: "Toda mistura precisa de paciência — e de um pouco de perigo.",
    description: "Ninguém sabe de onde ele veio. Só que os frascos nunca param de borbulhar.",
    icon: "⚗️",
    color: "#9146ff",
    shape: "hex",
  },
  guildmaster: {
    key: "guildmaster",
    name: "Mestra Elenya",
    profession: "Guildmaster",
    quote: "O Reino é feito de quem escolhe ficar.",
    description: "Guarda a memória de cada Campeão e Fundador que já passou por aqui.",
    icon: "🏛️",
    color: "#fbbc04",
    shape: "shield",
  },
  tesoureiro: {
    key: "tesoureiro",
    name: "Dorwin, o Tesoureiro",
    profession: "Tesoureiro",
    quote: "Seu ouro estará seguro comigo.",
    description: "Conta cada moeda duas vezes — e nunca erra.",
    icon: "🏦",
    color: "#4285f4",
    shape: "square",
  },
  mestreArena: {
    key: "mestreArena",
    name: "Kade, o Mestre da Arena",
    profession: "Mestre da Arena",
    quote: "Cicatrizes contam mais histórias que troféus.",
    description: "Já viu incontáveis Bosses caírem — e lembra do nome de quem os derrotou.",
    icon: "🏟️",
    color: "#ea4335",
    shape: "hex",
  },
  guarda: {
    key: "guarda",
    name: "Sargento Roth",
    profession: "Guarda do Portão Norte",
    quote: "Boa sorte na estrada.",
    description: "Fica de olho em quem parte e em quem volta — poucos escapam do seu aceno.",
    icon: "🚪",
    color: "#9aa0a6",
    shape: "arch",
  },
  bibliotecaria: {
    key: "bibliotecaria",
    name: "Bibliotecária Miriam",
    profession: "Bibliotecária",
    quote: "Cada livro aqui espera por quem souber lê-lo.",
    description: "Cataloga cada página que chega à Capital — mesmo as que ainda ninguém pode abrir.",
    icon: "📚",
    color: "#6a3bd6",
    shape: "circle",
  },
  erudito: {
    key: "erudito",
    name: "Erudito Yannick",
    profession: "Biólogo do Reino",
    quote: "Toda criatura tem um comportamento — a maioria de nós só nunca ficou tempo suficiente para ver.",
    description: "Passou mais noites observando covis do que dormindo em uma cama de verdade.",
    icon: "🔬",
    color: "#34a853",
    shape: "hex",
  },
  curador: {
    key: "curador",
    name: "Curador Alaric",
    profession: "Curador do Museu",
    quote: "Um objeto sem história é só um objeto. Aqui, cada um tem as duas coisas.",
    description: "Passa os dias catalogando o que o Reino ainda não teve coragem de esquecer.",
    icon: "🖼️",
    color: "#fbbc04",
    shape: "square",
  },
} as const satisfies Record<string, NpcDefinition>;
