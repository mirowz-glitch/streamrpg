// Sprint World Simulation — conteúdo transcrito de
// docs/world-design/regions.md (Rascunho, não é capítulo da Bible).
// Puramente apresentação: nenhuma região nova, nenhum valor de World
// Design alterado. "theme" vem do campo "Atmosfera" de cada região;
// "description" vem do campo "Sensação" (a frase-síntese que o próprio
// documento já usa para resumir cada região numa linha).
export interface RegionInfo {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  theme: string;
}

export const REGIONS: RegionInfo[] = [
  {
    id: "porto-do-amanhecer",
    name: "Porto do Amanhecer",
    description: "Eu estou seguro, mas o mundo lá fora está esperando.",
    difficulty: "Nenhuma (hub inicial)",
    theme: "Segura, acolhedora, sem tensão",
  },
  {
    id: "bosque-sussurrante",
    name: "Bosque Sussurrante",
    description: "Isto é seguro o bastante pra eu explorar sem medo, mas ainda me surpreende.",
    difficulty: "Baixa",
    theme: "Curiosidade tranquila",
  },
  {
    id: "pantano-podre",
    name: "Pântano Podre",
    description: "Preciso ir com cautela, isto não perdoa pressa.",
    difficulty: "Baixa-média",
    theme: "Pavor contido",
  },
  {
    id: "colinas-aridas",
    name: "Colinas Áridas",
    description: "Estou exposto, e eles sabem disso.",
    difficulty: "Baixa-média",
    theme: "Exposição",
  },
  {
    id: "planicie-dourada",
    name: "Planície Dourada",
    description: "Aqui eu relaxo — mas nem tudo aqui é inofensivo.",
    difficulty: "Muito baixa",
    theme: "Falsa tranquilidade",
  },
  {
    id: "minas-abandonadas",
    name: "Minas Abandonadas",
    description: "O ar está pesado, e eu não sei o que vem depois da próxima curva.",
    difficulty: "Média",
    theme: "Claustrofobia crescente",
  },
  {
    id: "litoral-quebrado",
    name: "Litoral Quebrado",
    description: "Algo aqui já afundou antes de mim — espero não ser o próximo.",
    difficulty: "Média",
    theme: "Melancolia",
  },
  {
    id: "picos-congelados",
    name: "Picos Congelados",
    description: "Estou pequeno diante disto, e isso é intencional.",
    difficulty: "Média-alta",
    theme: "Isolamento e reverência",
  },
  {
    id: "deserto-de-vidro",
    name: "Deserto de Vidro",
    description: "Algo terrível aconteceu aqui, e ainda não terminou.",
    difficulty: "Alta",
    theme: "Errado, artificial",
  },
  {
    id: "ruinas-esquecidas",
    name: "Ruínas Esquecidas",
    description: "Isto já foi grandioso — e talvez ainda seja perigoso por causa disso.",
    difficulty: "Alta",
    theme: "Reverência e inquietação",
  },
  {
    id: "fortaleza-sombria",
    name: "Fortaleza Sombria",
    description: "Tudo que aprendi até aqui está sendo testado agora.",
    difficulty: "Muito alta (endgame)",
    theme: "Clímax",
  },
];
