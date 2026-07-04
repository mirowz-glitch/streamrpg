import type { ItemCatalogEntry } from "@streamrpg/shared";
import { getDb } from "../config/database.js";

export const ITEM_CATALOG: Omit<ItemCatalogEntry, "id">[] = [
  { slug: "bastao-galho-carvalho", name: "Bastão de Galho de Carvalho", description: "Encontrado na beira de uma floresta que talvez não exista.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "faca-cozinha", name: "Faca de Cozinha", description: "Emprestada da cozinha de alguém. O dono não sabe que está aqui.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "cetro-papelao", name: "Cetro de Papelão", description: "Foi feito para uma fantasia. Aguenta mais do que parece.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "adaga-madrugada", name: "Adaga da Madrugada", description: "Alguém a deixou aqui às 3h da manhã.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "espada-madeira", name: "Espada de Madeira", description: "A primeira espada de qualquer aventureiro.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "armadura-couro-cru", name: "Armadura de Couro Cru", description: "Feita às pressas. Protege o suficiente.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "vestes-lurker-leal", name: "Vestes do Lurker Leal", description: "Para quem assiste sem falar.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "casaco-flanela", name: "Casaco de Flanela", description: "Confortável demais para ser prático.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "manto-quarta", name: "Manto de Quarta-Feira", description: "Tecido em dia de semana.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "armadura-papelao", name: "Armadura de Papelão Reforçado", description: "Improviso elevado à arte.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "tiara-papel", name: "Tiara de Papel", description: "Dobrada durante uma live longa.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "capuz-anonimo", name: "Capuz do Anônimo", description: "Para quem prefere estar sem ser visto.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "chapeu-copa", name: "Chapéu de Copa Dobrado", description: "Feito de um jornal de outubro.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "elmo-lata", name: "Elmo de Lata", description: "Levemente amassado. O dono diz que foi numa batalha.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "coroa-stream", name: "Coroa de Stream", description: "Para quem nunca perde uma live.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "botas-lurker", name: "Botas do Lurker", description: "Silenciosas como presença no chat.", rarity: "common", slot: "boots", min_level: 1 },
  { slug: "sandalias-chat", name: "Sandálias do Chat Rápido", description: "Para quem digita mais rápido que pensa.", rarity: "common", slot: "boots", min_level: 1 },
  { slug: "botas-meia-noite", name: "Botas da Meia-Noite", description: "Confortáveis para lives que passam da meia-noite.", rarity: "uncommon", slot: "boots", min_level: 3 },
  { slug: "amuleto-presenca", name: "Amuleto de Presença", description: "Brilha quando você está na live.", rarity: "uncommon", slot: "amulet", min_level: 3, uti_bonus: 2 },
  { slug: "cajado-aprendiz", name: "Cajado do Aprendiz", description: "Ainda cheira a ozônio da última vez que foi usado.", rarity: "common", slot: "weapon", min_level: 1, damage_type: "magic" },
  { slug: "pingente-streak", name: "Pingente do Streak", description: "Quente ao toque depois de dias seguidos.", rarity: "uncommon", slot: "amulet", min_level: 5 },
  { slug: "colar-xp", name: "Colar de XP", description: "Cada ping faz brilhar um pouco mais.", rarity: "uncommon", slot: "amulet", min_level: 5 },
  { slug: "anel-viewer", name: "Anel do Viewer", description: "Prova de que você esteve aqui.", rarity: "uncommon", slot: "ring", min_level: 5 },
  { slug: "anel-raid", name: "Anel do Raid", description: "Veio de outro canal e ficou.", rarity: "uncommon", slot: "ring", min_level: 7 },
  { slug: "lamina-ferro", name: "Lâmina de Ferro", description: "Finalmente, metal de verdade.", rarity: "rare", slot: "weapon", min_level: 10 },
  { slug: "capa-ranking", name: "Capa do Top 10", description: "Só quem chegou ao topo conhece este tecido.", rarity: "rare", slot: "armor", min_level: 10 },
  { slug: "elmo-veterano", name: "Elmo do Veterano", description: "Marcas de centenas de pings.", rarity: "rare", slot: "helmet", min_level: 12 },
  { slug: "bota-epica", name: "Botas do Maratonista", description: "Para sessões de 4 horas ou mais.", rarity: "epic", slot: "boots", min_level: 15 },
  { slug: "amuleto-epico", name: "Amuleto da Live Infinita", description: "Pulsa no ritmo do chat.", rarity: "epic", slot: "amulet", min_level: 18 },
  { slug: "anel-lendario", name: "Anel do Primeiro Drop", description: "Lendário. Poucos o possuem.", rarity: "legendary", slot: "ring", min_level: 20 },
  { slug: "espada-lendária", name: "Espada Sem Nome", description: "Ninguém sabe quem a forjou. Todos querem.", rarity: "legendary", slot: "weapon", min_level: 25 },
];

export function seedItems(): void {
  const db = getDb();
  const count = db.prepare("SELECT COUNT(*) AS c FROM items").get() as { c: number };

  if (count.c < ITEM_CATALOG.length) {
    // damage_type/uti_bonus: infraestrutura da Sprint Character Attributes
    // Schema — default 'physical'/0 para todo item que não declarar
    // explicitamente (mesmo default da coluna no banco), sem precisar tocar
    // nas ~30 entradas do catálogo que já existiam.
    const insert = db.prepare(`
      INSERT OR IGNORE INTO items (slug, name, description, rarity, slot, min_level, damage_type, uti_bonus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of ITEM_CATALOG) {
      insert.run(
        item.slug,
        item.name,
        item.description,
        item.rarity,
        item.slot,
        item.min_level,
        item.damage_type ?? "physical",
        item.uti_bonus ?? 0,
      );
    }
  }

  // Sprint Equipment Experience — achado real, confirmado testando no
  // navegador contra o banco de desenvolvimento: INSERT OR IGNORE nunca
  // atualiza uma linha já existente. Itens cujo damage_type/uti_bonus
  // foram definidos no catálogo DEPOIS da primeira inserção (ex.:
  // amuleto-presenca, uti_bonus adicionado só na Sprint Character
  // Attributes Schema) continuavam com o valor antigo no banco, mesmo já
  // corretos no código. Sincroniza os dois campos para todo o catálogo,
  // sempre — idempotente, poucas dezenas de linhas, sem custo
  // perceptível. Não altera rarity/slot/min_level/nome/descrição, só os
  // dois campos que esta Sprint depende deles estarem corretos.
  const sync = db.prepare(`UPDATE items SET damage_type = ?, uti_bonus = ? WHERE slug = ?`);
  for (const item of ITEM_CATALOG) {
    sync.run(item.damage_type ?? "physical", item.uti_bonus ?? 0, item.slug);
  }
}

export function getItemById(itemId: number) {
  return getDb()
    .prepare("SELECT * FROM items WHERE id = ? AND is_active = 1")
    .get(itemId) as {
      id: number;
      slug: string;
      name: string;
      description: string;
      rarity: string;
      slot: string;
      min_level: number;
    } | undefined;
}
