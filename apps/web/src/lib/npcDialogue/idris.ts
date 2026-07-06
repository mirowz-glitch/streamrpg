import type { NpcDialogueCatalog } from "./types";

// Sprint Wolves Ecosystem (Phase I) — primeiro catálogo de falas de
// Idris (viajante). Ainda não é uma Sprint de Living NPCs completa pra
// ele: só a categoria "fofocas", com comentários reais sobre os Lobos
// do Bosque Sussurrante — as outras 19 categorias ficam vazias até uma
// Sprint futura expandir o restante da personalidade dele.
export const IDRIS_DIALOGUE: NpcDialogueCatalog = {
  boas_vindas: [],
  primeiro_encontro: [],
  novato: [],
  veterano: [],
  nivel_alto: [],
  boss_derrotado: [],
  sem_gold: [],
  muito_gold: [],
  chovendo: [],
  noite: [],
  primeira_visita: [],
  visitas_repetidas: [],
  aleatorias: [],
  humor: [],
  conselhos: [],
  fofocas: [
    "Já vi o mesmo lobo marcado em duas regiões diferentes, no mesmo dia. Não sei explicar.",
    "Cruzei com um lobo das Colinas Áridas duas vezes na mesma travessia. Magro, mas rápido.",
    "Os lobos do Pântano Podre nadam melhor do que caçam. Vi com meus próprios olhos.",
  ],
  comentarios_reino: [],
  comentarios_npcs: [],
  raras: [],
  extremamente_raras: [],
};
