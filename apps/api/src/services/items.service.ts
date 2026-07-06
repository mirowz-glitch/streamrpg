import type { ItemCatalogEntry } from "@streamrpg/shared";
import { getDb } from "../config/database.js";

export const ITEM_CATALOG: Omit<ItemCatalogEntry, "id">[] = [
  // Sprint First 120 Seconds — item símbolo concedido e já equipado a
  // todo personagem novo (FirstItemQuestSystem), nunca obtido por drop.
  // Fica no mesmo catálogo/tabela que todo o resto (nenhuma tabela
  // separada para "itens especiais") — rarity "common" porque a fórmula
  // de poder (getItemPower()) já não permite um ATQ menor que isso sem
  // criar uma exceção própria; o ganho real deste item é simbólico, não
  // de força.
  { slug: "luvas-rasgadas", name: "Luvas Rasgadas", description: "Foi encontrada atrás da oficina do ferreiro.\n\nCuriosamente, o lixo parecia estar em melhor estado.", rarity: "common", slot: "weapon", min_level: 1 },
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

  // ============================================================
  // Sprint Item Expansion — Phase I — 250 itens novos, expandindo o
  // catálogo já existente acima (nenhuma tabela nova, nenhuma coluna
  // nova, nenhuma mudança de arquitetura). "Luvas" usa slot "weapon"
  // porque o schema atual (ItemSlot) nunca teve um slot de mão dedicado
  // — mesma decisão já tomada para o item símbolo "Luvas Rasgadas"
  // (Sprint First 120 Seconds); manter os dois no mesmo slot evita uma
  // inconsistência entre o item símbolo e o resto do catálogo de luvas.
  // ============================================================

  // ---- Armas (60): comum 25 · incomum 18 · raro 13 · épico 3 · lendário 1 ----
  { slug: "machado-lenhador", name: "Machado do Lenhador", description: "Ainda cheira a serragem.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "martelo-pedreiro", name: "Martelo de Pedreiro", description: "Mais pesado do que parece.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "lamina-acougueiro", name: "Lâmina do Açougueiro", description: "Nunca foi bonito.\n\nSempre funcionou.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "faca-cozinha-velha", name: "Faca de Cozinha Velha", description: "Emprestada e nunca devolvida.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "espada-guarda", name: "Espada de Guarda", description: "Padrão da guarnição da Capital.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "enxada-reforjada", name: "Enxada Reforjada", description: "Borin jura que ainda corta terra melhor que qualquer lâmina.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "picareta-curta", name: "Picareta Curta", description: "Boa para minas estreitas.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "panela-amassada", name: "Panela Amassada", description: "Um dia foi jantar. Hoje é defesa.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "tampa-barril", name: "Tampa de Barril", description: "Serve de escudo, na falta de opção melhor.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "balde-polido", name: "Balde Polido", description: "Reluz mais do que devia.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "foice-colheita", name: "Foice de Colheita", description: "Usada mais em trigo do que em batalha.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "martelo-ferrador", name: "Martelo de Ferrador", description: "Ainda tem marcas de casco.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "vara-pescador-reforcada", name: "Vara de Pescador Reforçada", description: "Idris jura que já fisgou coisa maior que peixe.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "cutelo-cozinha", name: "Cutelo de Cozinha", description: "Serve pra carne. Serve pro resto também.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "bastao-pastor", name: "Bastão de Pastor", description: "Guiava ovelhas. Agora guia outra coisa.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "adaga-mesa", name: "Adaga de Mesa", description: "Achada numa taverna. Ninguém reclamou a falta.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "espeto-churrasco", name: "Espeto de Churrasco", description: "Greta jura que nunca usou pra cutucar cliente. Jura mesmo.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "machadinha-lenha", name: "Machadinha de Lenha", description: "Boa pra galho. Serve pro resto.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "vassoura-ponta", name: "Vassoura com Ponta", description: "Alguém afiou uma vassoura. Não pergunte.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "martelo-carroceiro", name: "Martelo de Carroceiro", description: "Cheira a estrada.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "foice-curva", name: "Foice Curva", description: "Curva de tanto uso, não de fabricação.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "bengala-viajante", name: "Bengala de Viajante", description: "Idris andou mais com ela do que com as próprias pernas, dizem.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "machado-lareira", name: "Machado de Lareira", description: "Rachava lenha. Ainda racha.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "faca-caca-simples", name: "Faca de Caça Simples", description: "Sem luxo, sem enfeite, sem reclamação.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "foice-feira", name: "Foice de Feira", description: "Comprada numa feira, usada em algo bem menos pacífico depois.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "espada-treino-reforcada", name: "Espada de Treino Reforçada", description: "Marcada de tanto duelo de mentirinha.", rarity: "uncommon", slot: "weapon", min_level: 3 },
  { slug: "machado-duas-maos-lenhador", name: "Machado de Duas Mãos do Lenhador Velho", description: "Pesado até pra quem trabalha a vida toda com ele.", rarity: "uncommon", slot: "weapon", min_level: 4 },
  { slug: "lamina-curva-comerciante", name: "Lâmina Curva de Comerciante", description: "Talia garante que veio de longe. Talia garante muita coisa.", rarity: "uncommon", slot: "weapon", min_level: 3 },
  { slug: "punhal-caca-silenciosa", name: "Punhal de Caça Silenciosa", description: "Feito pra não fazer barulho. Ainda faz um pouco.", rarity: "uncommon", slot: "weapon", min_level: 5 },
  { slug: "maca-guarda-veterano", name: "Maça de Guarda Veterano", description: "Roth confiscou. Ninguém reclamou de volta.", rarity: "uncommon", slot: "weapon", min_level: 5 },
  { slug: "espada-curta-escolta", name: "Espada Curta de Escolta", description: "Usada por quem protege caravanas, não reinos.", rarity: "uncommon", slot: "weapon", min_level: 4 },
  { slug: "machado-guerra-simples", name: "Machado de Guerra Simples", description: "Simples no nome. Nada simples no peso.", rarity: "uncommon", slot: "weapon", min_level: 6 },
  { slug: "lanca-cacador-lobos", name: "Lança de Caçador de Lobos", description: "Marcas de dentes na haste.", rarity: "uncommon", slot: "weapon", min_level: 6 },
  { slug: "adaga-dupla-viajante", name: "Adaga Dupla de Viajante", description: "Uma para cada mão, dizia o antigo dono.", rarity: "uncommon", slot: "weapon", min_level: 5 },
  { slug: "cimitarra-mercador", name: "Cimitarra de Mercador", description: "Comprada, não roubada, insiste Talia.", rarity: "uncommon", slot: "weapon", min_level: 7 },
  { slug: "martelo-guerra-ferreiro-aposentado", name: "Martelo de Guerra do Ferreiro Aposentado", description: "Borin recusou vender esse por anos.", rarity: "uncommon", slot: "weapon", min_level: 6 },
  { slug: "espada-longa-remendada", name: "Espada Longa Remendada", description: "Consertada tantas vezes que ninguém sabe sua idade.", rarity: "uncommon", slot: "weapon", min_level: 7 },
  { slug: "foice-duas-laminas", name: "Foice de Duas Lâminas", description: "Feita para colher mais que trigo.", rarity: "uncommon", slot: "weapon", min_level: 6 },
  { slug: "alabarda-curta-muralha", name: "Alabarda Curta de Muralha", description: "Usada nas rondas da Guarda, segundo Roth.", rarity: "uncommon", slot: "weapon", min_level: 8 },
  { slug: "chicote-trancado", name: "Chicote Trançado", description: "Estala mais alto do que machuca.", rarity: "uncommon", slot: "weapon", min_level: 4 },
  { slug: "espada-curva-deserto", name: "Espada Curva do Deserto", description: "Areia ainda escorre da bainha.", rarity: "uncommon", slot: "weapon", min_level: 7 },
  { slug: "machado-batalha-enferrujado", name: "Machado de Batalha Enferrujado", description: "A ferrugem é só por fora, garante Borin.", rarity: "uncommon", slot: "weapon", min_level: 6 },
  { slug: "tridente-pescador", name: "Tridente de Pescador", description: "Feito pra peixe grande. Serve pra outras coisas grandes também.", rarity: "uncommon", slot: "weapon", min_level: 5 },
  { slug: "espada-ultimo-guarda-ruinas", name: "Espada do Último Guarda das Ruínas Esquecidas", description: "Encontrada intacta onde nada mais sobreviveu.", rarity: "rare", slot: "weapon", min_level: 11 },
  { slug: "lamina-forjada-minas-abandonadas", name: "Lâmina Forjada nas Minas Abandonadas", description: "O metal veio de um veio que ninguém mais encontra.", rarity: "rare", slot: "weapon", min_level: 12 },
  { slug: "machado-guerreiro-sem-nome", name: "Machado do Guerreiro Sem Nome", description: "Nenhum registro diz quem foi. A lâmina lembra.", rarity: "rare", slot: "weapon", min_level: 12 },
  { slug: "adaga-litoral-quebrado", name: "Adaga do Litoral Quebrado", description: "Achada num naufrágio, ainda afiada.", rarity: "rare", slot: "weapon", min_level: 10 },
  { slug: "espada-curva-picos-congelados", name: "Espada Curva dos Picos Congelados", description: "O frio nunca a enferrujou.", rarity: "rare", slot: "weapon", min_level: 13 },
  { slug: "lanca-fortaleza-sombria", name: "Lança da Fortaleza Sombria", description: "Recuperada de dentro dos muros escuros.", rarity: "rare", slot: "weapon", min_level: 14 },
  { slug: "cajado-replica-zoltar", name: "Cajado de Zoltar (Réplica)", description: "Zoltar jura que não é o dele. Jura rápido demais.", rarity: "rare", slot: "weapon", min_level: 11, damage_type: "magic" },
  { slug: "foice-deserto-vidro", name: "Foice do Deserto de Vidro", description: "A areia vitrificada ainda gruda na lâmina.", rarity: "rare", slot: "weapon", min_level: 12 },
  { slug: "espada-duelo-arena", name: "Espada de Duelo da Arena", description: "Kade guarda o registro de cada duelo vencido com ela.", rarity: "rare", slot: "weapon", min_level: 13 },
  { slug: "machado-duplo-bosque-sussurrante", name: "Machado Duplo do Bosque Sussurrante", description: "As árvores, dizem, se afastam quando ele passa.", rarity: "rare", slot: "weapon", min_level: 12 },
  { slug: "punhal-mensageiro-real", name: "Punhal do Mensageiro Real", description: "Entregava recados. Também resolvia o que os recados não resolviam.", rarity: "rare", slot: "weapon", min_level: 11 },
  { slug: "alabarda-ultima-coroa", name: "Alabarda da Última Coroa", description: "Usada na guarda do próprio trono, tempos atrás.", rarity: "rare", slot: "weapon", min_level: 14 },
  { slug: "lamina-explorador-desaparecido", name: "Lâmina do Explorador Desaparecido", description: "O dono nunca voltou. A lâmina, sim.", rarity: "rare", slot: "weapon", min_level: 13 },
  { slug: "espada-primeira-fundacao", name: "Espada da Primeira Fundação", description: "Dizem que estava lá quando a Capital nem tinha nome.", rarity: "epic", slot: "weapon", min_level: 17 },
  { slug: "machado-rei-conversava-pedras", name: "Machado do Rei Que Conversava com Pedras", description: "Alguns juram que ele ainda responde, se você souber ouvir.", rarity: "epic", slot: "weapon", min_level: 18 },
  { slug: "lamina-cavaleiro-ponte-velha", name: "Lâmina do Cavaleiro da Ponte Velha", description: "Ninguém sabe se ele ainda a empunha, de algum jeito.", rarity: "epic", slot: "weapon", min_level: 19 },
  { slug: "espada-sem-nome-primeiro-amanhecer", name: "Espada Sem Nome do Primeiro Amanhecer", description: "Ninguém sabe quem a forjou. Todos a reconhecem.", rarity: "legendary", slot: "weapon", min_level: 25 },

  // ---- Capacetes (40): comum 16 · incomum 12 · raro 9 · épico 2 · lendário 1 ----
  { slug: "capuz-peregrino", name: "Capuz de Peregrino", description: "Idris jura que já andou mil estradas com um igual.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "gorro-la-puida", name: "Gorro de Lã Puída", description: "Quente. Feio. Funciona.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "chapeu-palha-torto", name: "Chapéu de Palha Torto", description: "Melhor pro sol que pra batalha.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "capacete-ferreiro", name: "Capacete de Ferreiro", description: "Cheira a fumaça da forja.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "touca-cozinheira", name: "Touca de Cozinheira", description: "Greta garante que nunca serviu pra cozinhar.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "elmo-amassado-guarda", name: "Elmo Amassado de Guarda", description: "Roth garante que ainda protege, apesar da aparência.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "capuz-remendado", name: "Capuz Remendado", description: "Mais remendo que capuz, a essa altura.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "bone-cacador", name: "Boné de Caçador", description: "Cheira a mato e chuva.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "coifa-couro-cru", name: "Coifa de Couro Cru", description: "Serve. Não impressiona.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "capacete-mineiro", name: "Capacete de Mineiro", description: "A luz de dentro apagou há muito tempo.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "chapeu-feira", name: "Chapéu de Feira", description: "Comprado por impulso, usado por necessidade.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "capuz-viajante-cansado", name: "Capuz de Viajante Cansado", description: "Cobre o rosto e o cansaço, na medida do possível.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "elmo-treino", name: "Elmo de Treino", description: "Usado por quem ainda está aprendendo a levar golpe.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "gorro-pescador", name: "Gorro de Pescador", description: "Ainda cheira a maré baixa.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "capacete-pedreiro", name: "Capacete de Pedreiro", description: "Marcado de pedra, não de espada.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "faixa-couro-testa", name: "Faixa de Couro na Testa", description: "Simples, mas mantém o suor longe dos olhos.", rarity: "common", slot: "helmet", min_level: 1 },
  { slug: "elmo-guarda-veterano", name: "Elmo de Guarda Veterano", description: "Roth usa um igual há anos. Não diz por quê guarda outro.", rarity: "uncommon", slot: "helmet", min_level: 4 },
  { slug: "capuz-explorador", name: "Capuz de Explorador", description: "Idris trocou esse por uma história. Boa história.", rarity: "uncommon", slot: "helmet", min_level: 5 },
  { slug: "coifa-malha-simples", name: "Coifa de Malha Simples", description: "Pesada, mas confiável.", rarity: "uncommon", slot: "helmet", min_level: 5 },
  { slug: "elmo-viseira-emperrada", name: "Elmo com Viseira Emperrada", description: "Só abre se você souber o truque certo.", rarity: "uncommon", slot: "helmet", min_level: 6 },
  { slug: "capacete-cacador-feras", name: "Capacete de Caçador de Feras", description: "Marcas de garra na lateral.", rarity: "uncommon", slot: "helmet", min_level: 6 },
  { slug: "capuz-estudioso", name: "Capuz de Estudioso", description: "Yannick tinha um igual, antes de perder numa expedição.", rarity: "uncommon", slot: "helmet", min_level: 4 },
  { slug: "elmo-escolta-caravana", name: "Elmo de Escolta de Caravana", description: "Protegia comerciantes, não reis.", rarity: "uncommon", slot: "helmet", min_level: 5 },
  { slug: "coifa-reforcada-muralha", name: "Coifa Reforçada da Muralha", description: "Usada nas rondas mais longas do Portão Norte.", rarity: "uncommon", slot: "helmet", min_level: 6 },
  { slug: "capacete-penas-corvo", name: "Capacete com Penas de Corvo", description: "Ninguém sabe por que as penas ainda estão presas ali.", rarity: "uncommon", slot: "helmet", min_level: 5 },
  { slug: "elmo-bronze-baco", name: "Elmo de Bronze Baço", description: "Já foi reluzente. Já foi há muito tempo.", rarity: "uncommon", slot: "helmet", min_level: 6 },
  { slug: "capuz-couro-colinas", name: "Capuz de Couro das Colinas", description: "Feito pra aguentar vento, não lâmina.", rarity: "uncommon", slot: "helmet", min_level: 5 },
  { slug: "elmo-sentinela-noturna", name: "Elmo de Sentinela Noturna", description: "Usado por quem prefere trabalhar sem sol.", rarity: "uncommon", slot: "helmet", min_level: 6 },
  { slug: "elmo-guardiao-ruinas", name: "Elmo do Guardião das Ruínas", description: "Encontrado intacto num lugar que não deveria ter sobrevivido.", rarity: "rare", slot: "helmet", min_level: 11 },
  { slug: "capuz-mensageiro-fortaleza", name: "Capuz do Mensageiro da Fortaleza", description: "Ninguém sabe que mensagem ele carregava.", rarity: "rare", slot: "helmet", min_level: 12 },
  { slug: "coifa-forjada-minas-abandonadas", name: "Coifa Forjada nas Minas Abandonadas", description: "O metal veio de uma veia que ninguém mais encontra.", rarity: "rare", slot: "helmet", min_level: 11 },
  { slug: "elmo-comandante-esquecido", name: "Elmo de Comandante Esquecido", description: "Nenhum registro diz o nome dele. O elmo lembra.", rarity: "rare", slot: "helmet", min_level: 13 },
  { slug: "capuz-deserto-vidro", name: "Capuz do Deserto de Vidro", description: "A areia vitrificada ainda brilha nas bordas.", rarity: "rare", slot: "helmet", min_level: 12 },
  { slug: "elmo-picos-congelados", name: "Elmo dos Picos Congelados", description: "Nunca esquentou de verdade, mesmo perto do fogo.", rarity: "rare", slot: "helmet", min_level: 13 },
  { slug: "capacete-explorador-desaparecido", name: "Capacete do Explorador Desaparecido", description: "O dono nunca voltou. O elmo, sim.", rarity: "rare", slot: "helmet", min_level: 12 },
  { slug: "coifa-ultima-coroa", name: "Coifa da Última Coroa", description: "Usada na guarda mais antiga da Capital.", rarity: "rare", slot: "helmet", min_level: 14 },
  { slug: "elmo-litoral-quebrado", name: "Elmo do Litoral Quebrado", description: "Ainda tem cheiro de maré, mesmo seco.", rarity: "rare", slot: "helmet", min_level: 11 },
  { slug: "elmo-rei-nunca-coroado", name: "Elmo do Rei Que Nunca Foi Coroado", description: "Nunca teve uma coroa de verdade em cima. Não precisou.", rarity: "epic", slot: "helmet", min_level: 17 },
  { slug: "capuz-cavaleiro-ponte-velha", name: "Capuz do Cavaleiro da Ponte Velha", description: "Dizem que ele ainda vigia, de algum jeito, com ele.", rarity: "epic", slot: "helmet", min_level: 18 },
  { slug: "elmo-primeira-fundacao", name: "Elmo da Primeira Fundação", description: "Mais velho que qualquer registro escrito do Reino.", rarity: "legendary", slot: "helmet", min_level: 25 },

  // ---- Peitorais (40): comum 16 · incomum 12 · raro 9 · épico 2 · lendário 1 ----
  { slug: "casaco-cacador", name: "Casaco de Caçador", description: "Cheira a mato, sempre.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "colete-couro-cru", name: "Colete de Couro Cru", description: "Sem estilo. Com função.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "manto-viajante-surrado", name: "Manto de Viajante Surrado", description: "Idris jura que esse já viu mais estrada que ele.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "tunica-aprendiz", name: "Túnica de Aprendiz", description: "Ainda cheira a forja, de tanto que passou perto.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "avental-ferreiro-reforcado", name: "Avental de Ferreiro Reforçado", description: "Borin garante que aguenta faísca melhor que qualquer armadura.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "colete-acolchoado", name: "Colete Acolchoado", description: "Não para muito. Amortece o resto.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "capa-pastor", name: "Capa de Pastor", description: "Boa contra vento e ovelha teimosa.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "casaco-pescador-encerado", name: "Casaco de Pescador Encerado", description: "Repele água. Não repele nada mais.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "jaqueta-couro-remendada", name: "Jaqueta de Couro Remendada", description: "Cada remendo conta uma queda diferente.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "peitoral-guarda-novato", name: "Peitoral de Guarda Novato", description: "Padrão de quem ainda está aprendendo a ronda.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "manto-la-grossa", name: "Manto de Lã Grossa", description: "Quente demais no verão. Perfeito no resto do ano.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "colete-caca", name: "Colete de Caça", description: "Cheio de bolsos que ninguém usa direito.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "sobretudo-estrada", name: "Sobretudo de Estrada", description: "Feito pra longas caminhadas, não pra lutas longas.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "casaco-cozinheira", name: "Casaco de Cozinheira", description: "Greta garante que já sobreviveu a mais fogo que qualquer armadura.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "colete-trabalho-pedreiro", name: "Colete de Trabalho de Pedreiro", description: "Marcado de poeira que nunca sai.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "capa-remendada-viajante", name: "Capa Remendada de Viajante", description: "Nunca foi bonita.\n\nSempre funcionou.", rarity: "common", slot: "armor", min_level: 1 },
  { slug: "peitoral-escolta", name: "Peitoral de Escolta", description: "Reforçado nos ombros, de tanto carregar bagagem alheia.", rarity: "uncommon", slot: "armor", min_level: 5 },
  { slug: "colete-malha-simples", name: "Colete de Malha Simples", description: "Pesado, mas confiável.", rarity: "uncommon", slot: "armor", min_level: 5 },
  { slug: "manto-explorador", name: "Manto de Explorador", description: "Idris trocaria esse por uma história melhor. Talvez.", rarity: "uncommon", slot: "armor", min_level: 6 },
  { slug: "casaco-cacador-feras", name: "Casaco de Caçador de Feras", description: "Marcas de garra nas costas, ainda visíveis.", rarity: "uncommon", slot: "armor", min_level: 6 },
  { slug: "colete-reforcado-muralha", name: "Colete Reforçado da Muralha", description: "Grosso o bastante pra aguentar o vento da muralha a noite toda.", rarity: "uncommon", slot: "armor", min_level: 6 },
  { slug: "tunica-estudioso", name: "Túnica de Estudioso", description: "Yannick tinha uma igual, antes de rasgar numa expedição.", rarity: "uncommon", slot: "armor", min_level: 4 },
  { slug: "peitoral-bronze-baco", name: "Peitoral de Bronze Baço", description: "O brilho sumiu há tanto tempo que ninguém lembra a cor original.", rarity: "uncommon", slot: "armor", min_level: 6 },
  { slug: "casaco-couro-colinas", name: "Casaco de Couro das Colinas", description: "Resiste ao vento das Colinas Áridas melhor que a qualquer golpe.", rarity: "uncommon", slot: "armor", min_level: 5 },
  { slug: "colete-sentinela-noturna", name: "Colete de Sentinela Noturna", description: "Feito pra quem só aparece depois que o sol se põe.", rarity: "uncommon", slot: "armor", min_level: 6 },
  { slug: "manto-trancado-viajante", name: "Manto Trançado de Viajante", description: "Idris garante que esse aguenta qualquer clima do Reino.", rarity: "uncommon", slot: "armor", min_level: 5 },
  { slug: "peitoral-duelo-arena", name: "Peitoral de Duelo da Arena", description: "Kade recomenda, mas avisa: não para tudo.", rarity: "uncommon", slot: "armor", min_level: 6 },
  { slug: "casaco-acolchoado-batalha", name: "Casaco Acolchoado de Batalha", description: "Mais confortável do que parece, dizem os que já usaram.", rarity: "uncommon", slot: "armor", min_level: 5 },
  { slug: "peitoral-guardiao-ruinas", name: "Peitoral do Guardião das Ruínas", description: "Nenhuma fera ousou se aproximar de quem o vestia.", rarity: "rare", slot: "armor", min_level: 11 },
  { slug: "manto-mensageiro-fortaleza", name: "Manto do Mensageiro da Fortaleza", description: "Ainda parece pronto pra sair correndo a qualquer momento.", rarity: "rare", slot: "armor", min_level: 12 },
  { slug: "colete-forjado-minas-abandonadas", name: "Colete Forjado nas Minas Abandonadas", description: "Pesado o bastante para lembrar de onde veio a cada passo.", rarity: "rare", slot: "armor", min_level: 11 },
  { slug: "peitoral-comandante-esquecido", name: "Peitoral de Comandante Esquecido", description: "Ninguém lembra o posto que ele ocupava. A postura de quem o veste, sim.", rarity: "rare", slot: "armor", min_level: 13 },
  { slug: "casaco-deserto-vidro", name: "Casaco do Deserto de Vidro", description: "Guarda um brilho fraco, como se ainda refletisse o sol do deserto.", rarity: "rare", slot: "armor", min_level: 12 },
  { slug: "manto-picos-congelados", name: "Manto dos Picos Congelados", description: "O tecido ainda carrega uma friagem que nenhuma fogueira tira.", rarity: "rare", slot: "armor", min_level: 13 },
  { slug: "peitoral-explorador-desaparecido", name: "Peitoral do Explorador Desaparecido", description: "Voltou sozinho de uma expedição que ninguém mais completou.", rarity: "rare", slot: "armor", min_level: 12 },
  { slug: "colete-ultima-coroa", name: "Colete da Última Coroa", description: "Ainda guarda o brasão mais antigo que a Capital já teve.", rarity: "rare", slot: "armor", min_level: 14 },
  { slug: "casaco-litoral-quebrado", name: "Casaco do Litoral Quebrado", description: "As costuras ainda têm sal grudado, por mais que lavem.", rarity: "rare", slot: "armor", min_level: 11 },
  { slug: "peitoral-rei-nunca-coroado", name: "Peitoral do Rei Que Nunca Foi Coroado", description: "Nunca precisou de coroa pra impor respeito.", rarity: "epic", slot: "armor", min_level: 17 },
  { slug: "manto-cavaleiro-ponte-velha", name: "Manto do Cavaleiro da Ponte Velha", description: "Nunca esfria, mesmo abandonado a céu aberto por semanas.", rarity: "epic", slot: "armor", min_level: 18 },
  { slug: "peitoral-primeira-fundacao", name: "Peitoral da Primeira Fundação", description: "Nenhum historiador ousa datar sua origem com certeza.", rarity: "legendary", slot: "armor", min_level: 25 },

  // ---- Luvas (35, slot "weapon"): comum 14 · incomum 10 · raro 8 · épico 2 · lendário 1 ----
  { slug: "luvas-couro-cru", name: "Luvas de Couro Cru", description: "Endurecidas de tanto uso, macias por dentro ainda.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "luvas-chamuscadas", name: "Luvas Chamuscadas", description: "Tem cheiro de fumaça até hoje.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "luvas-ferreiro", name: "Luvas de Ferreiro", description: "Borin garante que já pegaram fogo umas três vezes.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "luvas-trabalho-remendadas", name: "Luvas de Trabalho Remendadas", description: "Cada dedo puxa pra um lado diferente.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "luvas-pescador-encharcadas", name: "Luvas de Pescador Encharcadas", description: "Sempre úmidas, não importa quantos dias longe da água.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "luvas-la-puida", name: "Luvas de Lã Puída", description: "Quentes. Furadas num dedo. Ainda servem.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "luvas-caca-simples", name: "Luvas de Caça Simples", description: "Cheiram a mato e couro velho.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "luvas-pedreiro", name: "Luvas de Pedreiro", description: "Duras como a pedra que carregam.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "luvas-cozinha-queimadas", name: "Luvas de Cozinha Queimadas", description: "Greta jura que não foi ela dessa vez.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "luvas-montaria", name: "Luvas de Montaria", description: "Cheiram a cavalo, sempre.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "luvas-couro-remendado", name: "Luvas de Couro Remendado", description: "Cada dedo tem um remendo de cor diferente.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "luvas-viajante", name: "Luvas de Viajante", description: "Idris garante que essas já andaram mais que ele.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "luvas-guarda-novato", name: "Luvas de Guarda Novato", description: "Padrão de quem ainda está aprendendo a segurar espada direito.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "luvas-sem-par", name: "Luvas Sem Par", description: "Ninguém sabe onde foi parar a outra.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "luvas-cacador-feras", name: "Luvas de Caçador de Feras", description: "Marcas de garra nos punhos.", rarity: "uncommon", slot: "weapon", min_level: 5 },
  { slug: "luvas-reforcadas-muralha", name: "Luvas Reforçadas da Muralha", description: "Usadas nas rondas mais longas do Portão Norte.", rarity: "uncommon", slot: "weapon", min_level: 6 },
  { slug: "luvas-escalada", name: "Luvas de Escalada", description: "Idris garante que aguentam qualquer penhasco do Reino.", rarity: "uncommon", slot: "weapon", min_level: 5 },
  { slug: "luvas-duelo-arena", name: "Luvas de Duelo da Arena", description: "Kade recomenda. Avisa que marcam os nós dos dedos.", rarity: "uncommon", slot: "weapon", min_level: 6 },
  { slug: "luvas-malha-fina", name: "Luvas de Malha Fina", description: "Leves, mas surpreendem quem acha que são só decorativas.", rarity: "uncommon", slot: "weapon", min_level: 6 },
  { slug: "luvas-explorador", name: "Luvas de Explorador", description: "Yannick jura que já anotou descobertas inteiras usando essas.", rarity: "uncommon", slot: "weapon", min_level: 5 },
  { slug: "luvas-ferreiro-veterano", name: "Luvas de Ferreiro Veterano", description: "Borin não vende as suas. Essas são de outro alguém.", rarity: "uncommon", slot: "weapon", min_level: 6 },
  { slug: "luvas-sentinela-noturna", name: "Luvas de Sentinela Noturna", description: "Usadas por quem prefere trabalhar sem sol.", rarity: "uncommon", slot: "weapon", min_level: 5 },
  { slug: "luvas-trancadas-couro-duplo", name: "Luvas Trançadas de Couro Duplo", description: "Aguentam mais do que aparentam.", rarity: "uncommon", slot: "weapon", min_level: 6 },
  { slug: "luvas-escolta", name: "Luvas de Escolta", description: "Usadas por quem protege caravanas, não reinos.", rarity: "uncommon", slot: "weapon", min_level: 5 },
  { slug: "luvas-guardiao-ruinas", name: "Luvas do Guardião das Ruínas", description: "O couro nunca rachou, mesmo depois de tanto tempo exposto.", rarity: "rare", slot: "weapon", min_level: 11 },
  { slug: "luvas-forjadas-minas-abandonadas", name: "Luvas Forjadas nas Minas Abandonadas", description: "O metal frio nunca esquenta de verdade, nem perto do fogo.", rarity: "rare", slot: "weapon", min_level: 12 },
  { slug: "luvas-deserto-vidro", name: "Luvas do Deserto de Vidro", description: "Um brilho fino ainda cobre as pontas dos dedos, como vidro moído.", rarity: "rare", slot: "weapon", min_level: 11 },
  { slug: "luvas-picos-congelados", name: "Luvas dos Picos Congelados", description: "Os dedos nunca sentem o frio, nem quando deveriam.", rarity: "rare", slot: "weapon", min_level: 12 },
  { slug: "luvas-explorador-desaparecido", name: "Luvas do Explorador Desaparecido", description: "Os dedos ainda guardam a marca de segurar algo, com força, pela última vez.", rarity: "rare", slot: "weapon", min_level: 11 },
  { slug: "luvas-ultima-coroa", name: "Luvas da Última Coroa", description: "Seguram com uma firmeza que parece cerimonial, não prática.", rarity: "rare", slot: "weapon", min_level: 13 },
  { slug: "luvas-litoral-quebrado", name: "Luvas do Litoral Quebrado", description: "Ainda enrugam como se estivessem sempre molhadas.", rarity: "rare", slot: "weapon", min_level: 10 },
  { slug: "luvas-mensageiro-fortaleza", name: "Luvas do Mensageiro da Fortaleza", description: "Seguram como se ainda tivessem um papel selado escondido dentro.", rarity: "rare", slot: "weapon", min_level: 12 },
  { slug: "luvas-cavaleiro-ponte-velha", name: "Luvas do Cavaleiro da Ponte Velha", description: "Dizem que ele ainda as veste, de algum jeito.", rarity: "epic", slot: "weapon", min_level: 17 },
  { slug: "luvas-rei-conversava-pedras", name: "Luvas do Rei Que Conversava com Pedras", description: "Alguns juram que as pedras ainda respondem, se você as vestir.", rarity: "epic", slot: "weapon", min_level: 18 },
  { slug: "luvas-primeiro-aventureiro", name: "Luvas do Primeiro Aventureiro", description: "Não são as luvas rasgadas de todo mundo. São as primeiras de todas.", rarity: "legendary", slot: "weapon", min_level: 20 },

  // ---- Botas (35): comum 14 · incomum 10 · raro 8 · épico 2 · lendário 1 ----
  { slug: "botas-encharcadas", name: "Botas Encharcadas", description: "Nunca secam de verdade.", rarity: "common", slot: "boots", min_level: 1 },
  { slug: "botas-couro-cru", name: "Botas de Couro Cru", description: "Endurecidas de tanto caminho.", rarity: "common", slot: "boots", min_level: 1 },
  { slug: "botas-pescador", name: "Botas de Pescador", description: "Cheiram a maré baixa.", rarity: "common", slot: "boots", min_level: 1 },
  { slug: "botas-trabalho-remendadas", name: "Botas de Trabalho Remendadas", description: "Nunca foram bonitas.\n\nSempre funcionaram.", rarity: "common", slot: "boots", min_level: 1 },
  { slug: "botas-pastor", name: "Botas de Pastor", description: "Cheias de lama que não sai mais.", rarity: "common", slot: "boots", min_level: 1 },
  { slug: "botas-viajante-surradas", name: "Botas de Viajante Surradas", description: "Idris garante que essas já cruzaram o Reino inteiro, ida e volta.", rarity: "common", slot: "boots", min_level: 1 },
  { slug: "botas-ferreiro", name: "Botas de Ferreiro", description: "Marcadas de faísca, resistentes ao calor da forja.", rarity: "common", slot: "boots", min_level: 1 },
  { slug: "botas-caca-simples", name: "Botas de Caça Simples", description: "Silenciosas o suficiente, na maioria das vezes.", rarity: "common", slot: "boots", min_level: 1 },
  { slug: "botas-guarda-novato", name: "Botas de Guarda Novato", description: "Ainda não sabem pisar sem fazer barulho.", rarity: "common", slot: "boots", min_level: 1 },
  { slug: "botas-montaria", name: "Botas de Montaria", description: "O couro guarda a forma do estribo, de tanto uso.", rarity: "common", slot: "boots", min_level: 1 },
  { slug: "botas-sem-par", name: "Botas Sem Par", description: "Uma aguenta a viagem. A outra nem se sabe onde ficou.", rarity: "common", slot: "boots", min_level: 1 },
  { slug: "botas-pedreiro", name: "Botas de Pedreiro", description: "Duras como a pedra que pisam.", rarity: "common", slot: "boots", min_level: 1 },
  { slug: "botas-estrada-longa", name: "Botas de Estrada Longa", description: "Feitas pra caminhar, não pra impressionar.", rarity: "common", slot: "boots", min_level: 1 },
  { slug: "botas-cozinha", name: "Botas de Cozinha", description: "Greta garante que essas já apagaram mais de um incêndio pequeno.", rarity: "common", slot: "boots", min_level: 1 },
  { slug: "botas-cacador-feras", name: "Botas de Caçador de Feras", description: "Marcas de garra na sola.", rarity: "uncommon", slot: "boots", min_level: 5 },
  { slug: "botas-reforcadas-muralha", name: "Botas Reforçadas da Muralha", description: "Aguentam rondas inteiras sem descanso, dizem os guardas mais antigos.", rarity: "uncommon", slot: "boots", min_level: 6 },
  { slug: "botas-escalada", name: "Botas de Escalada", description: "A sola nunca escorrega, segundo quem já usou em penhasco de verdade.", rarity: "uncommon", slot: "boots", min_level: 5 },
  { slug: "botas-duelo-arena", name: "Botas de Duelo da Arena", description: "Kade recomenda pra quem gosta de se manter firme.", rarity: "uncommon", slot: "boots", min_level: 6 },
  { slug: "botas-explorador", name: "Botas de Explorador", description: "Yannick jura que já cruzou o Reino inteiro com um par igual.", rarity: "uncommon", slot: "boots", min_level: 5 },
  { slug: "botas-sentinela-noturna", name: "Botas de Sentinela Noturna", description: "Silenciosas o bastante pra rondas depois da meia-noite.", rarity: "uncommon", slot: "boots", min_level: 6 },
  { slug: "botas-escolta", name: "Botas de Escolta", description: "Feitas pra acompanhar o ritmo de uma carroça, não de um exército.", rarity: "uncommon", slot: "boots", min_level: 5 },
  { slug: "botas-trancadas-couro-duplo", name: "Botas Trançadas de Couro Duplo", description: "Duram o dobro do que qualquer outro par parecido.", rarity: "uncommon", slot: "boots", min_level: 6 },
  { slug: "botas-marcha-forcada", name: "Botas de Marcha Forçada", description: "Feitas pra quem não tem tempo de descansar.", rarity: "uncommon", slot: "boots", min_level: 6 },
  { slug: "botas-mineiro-veterano", name: "Botas de Mineiro Veterano", description: "Ainda tem poeira das Minas Abandonadas grudada.", rarity: "uncommon", slot: "boots", min_level: 5 },
  { slug: "botas-guardiao-ruinas", name: "Botas do Guardião das Ruínas", description: "As pegadas que deixam parecem mais antigas que o próprio dono.", rarity: "rare", slot: "boots", min_level: 11 },
  { slug: "botas-forjadas-minas-abandonadas", name: "Botas Forjadas nas Minas Abandonadas", description: "Ainda ressoam como metal batendo em pedra, mesmo em terreno macio.", rarity: "rare", slot: "boots", min_level: 12 },
  { slug: "botas-deserto-vidro", name: "Botas do Deserto de Vidro", description: "A areia vitrificada ainda gruda na sola.", rarity: "rare", slot: "boots", min_level: 11 },
  { slug: "botas-picos-congelados", name: "Botas dos Picos Congelados", description: "Nunca esfriam de verdade, mesmo na neve.", rarity: "rare", slot: "boots", min_level: 12 },
  { slug: "botas-explorador-desaparecido", name: "Botas do Explorador Desaparecido", description: "As solas ainda têm terra de um lugar que ninguém sabe identificar.", rarity: "rare", slot: "boots", min_level: 11 },
  { slug: "botas-ultima-coroa", name: "Botas da Última Coroa", description: "Cada passo ainda ecoa como se estivesse em ronda solene.", rarity: "rare", slot: "boots", min_level: 13 },
  { slug: "botas-litoral-quebrado", name: "Botas do Litoral Quebrado", description: "Ainda tem areia grudada nas costuras.", rarity: "rare", slot: "boots", min_level: 10 },
  { slug: "botas-mensageiro-fortaleza", name: "Botas do Mensageiro da Fortaleza", description: "Percorreram mais estrada que qualquer outro par no Reino.", rarity: "rare", slot: "boots", min_level: 12 },
  { slug: "botas-cavaleiro-ponte-velha", name: "Botas do Cavaleiro da Ponte Velha", description: "Dizem que ele ainda caminha por ali, de algum jeito.", rarity: "epic", slot: "boots", min_level: 17 },
  { slug: "botas-rei-nunca-envelheceu", name: "Botas do Rei Que Nunca Envelheceu", description: "O tempo parece ter esquecido delas também.", rarity: "epic", slot: "boots", min_level: 18 },
  { slug: "botas-primeiro-amanhecer", name: "Botas do Primeiro Amanhecer", description: "Ninguém sabe quem as usou primeiro. Todas as estradas parecem lembrar.", rarity: "legendary", slot: "boots", min_level: 22 },

  // ---- Amuletos (20): comum 8 · incomum 6 · raro 4 · épico 1 · lendário 1 ----
  { slug: "amuleto-pescador", name: "Amuleto de Pescador", description: "Idris jura que já afundou três vezes e sempre voltou à tona.", rarity: "common", slot: "amulet", min_level: 1 },
  { slug: "colar-dentes-lobo", name: "Colar de Dentes de Lobo", description: "Ninguém pergunta como foram parar ali.", rarity: "common", slot: "amulet", min_level: 1 },
  { slug: "amuleto-viagem", name: "Amuleto de Viagem", description: "Idris garante que dá sorte. Idris garante muita coisa.", rarity: "common", slot: "amulet", min_level: 1 },
  { slug: "pingente-ferreiro", name: "Pingente de Ferreiro", description: "Borin fez um igual pra cada aprendiz que já teve.", rarity: "common", slot: "amulet", min_level: 1 },
  { slug: "colar-conchas", name: "Colar de Conchas", description: "Do Litoral Quebrado, dizem.", rarity: "common", slot: "amulet", min_level: 1 },
  { slug: "amuleto-boa-sorte-duvidosa", name: "Amuleto de Boa Sorte Duvidosa", description: "O antigo dono jurava que dava sorte.", rarity: "common", slot: "amulet", min_level: 1 },
  { slug: "pingente-couro-trancado", name: "Pingente de Couro Trançado", description: "Simples. Ninguém nunca reclamou.", rarity: "common", slot: "amulet", min_level: 1 },
  { slug: "colar-moedas-gastas", name: "Colar de Moedas Gastas", description: "Nenhuma delas serve mais como dinheiro.", rarity: "common", slot: "amulet", min_level: 3 },
  { slug: "amuleto-guarda", name: "Amuleto de Guarda", description: "Roth garante que protege mais o pescoço do frio do que de golpe.", rarity: "uncommon", slot: "amulet", min_level: 5 },
  { slug: "colar-cacador", name: "Colar de Caçador", description: "Marcado com dentes de mais de uma fera.", rarity: "uncommon", slot: "amulet", min_level: 6 },
  { slug: "pingente-estudioso", name: "Pingente de Estudioso", description: "Yannick garante que já anotou descobertas com esse no pescoço.", rarity: "uncommon", slot: "amulet", min_level: 5 },
  { slug: "amuleto-explorador", name: "Amuleto de Explorador", description: "Idris garante que esse sobreviveu a mais viagens que ele.", rarity: "uncommon", slot: "amulet", min_level: 6 },
  { slug: "colar-taverna", name: "Colar de Taverna", description: "Greta jura que já viu esse amuleto mudar de dono umas dez vezes.", rarity: "uncommon", slot: "amulet", min_level: 5 },
  { slug: "pingente-mercador", name: "Pingente de Mercador", description: "Talia diz que esse já pertenceu a um nobre. Talia diz muita coisa.", rarity: "uncommon", slot: "amulet", min_level: 6 },
  { slug: "amuleto-guardiao-ruinas", name: "Amuleto do Guardião das Ruínas", description: "Ainda pulsa um calor fraco, segundo quem já o usou.", rarity: "rare", slot: "amulet", min_level: 11 },
  { slug: "colar-explorador-desaparecido", name: "Colar do Explorador Desaparecido", description: "Ninguém mais tentou seguir o caminho que ele seguiu.", rarity: "rare", slot: "amulet", min_level: 12 },
  { slug: "pingente-ultima-coroa", name: "Pingente da Última Coroa", description: "Foi usado por quem jurou proteger a Capital antes de qualquer nome ser lembrado.", rarity: "rare", slot: "amulet", min_level: 13 },
  { slug: "amuleto-deserto-vidro", name: "Amuleto do Deserto de Vidro", description: "A areia vitrificada ainda brilha por dentro.", rarity: "rare", slot: "amulet", min_level: 12, uti_bonus: 3 },
  { slug: "amuleto-rei-nunca-envelheceu", name: "Amuleto do Rei Que Nunca Envelheceu", description: "O tempo parece ter esquecido dele também.", rarity: "epic", slot: "amulet", min_level: 18, uti_bonus: 5 },
  { slug: "colar-primeira-fundacao", name: "Colar da Primeira Fundação", description: "Alaric se recusa a colocá-lo em exposição. Diz que é cedo demais.", rarity: "legendary", slot: "amulet", min_level: 25, uti_bonus: 8 },

  // ---- Anéis (20): comum 8 · incomum 6 · raro 4 · épico 1 · lendário 1 ----
  { slug: "anel-ferro-simples", name: "Anel de Ferro Simples", description: "Sem enfeite. Sem história conhecida.", rarity: "common", slot: "ring", min_level: 1 },
  { slug: "anel-casamento-perdido", name: "Anel de Casamento Perdido", description: "Ninguém sabe de quem era.", rarity: "common", slot: "ring", min_level: 1 },
  { slug: "anel-cordas-trancadas", name: "Anel de Cordas Trançadas", description: "Feito à mão, provavelmente por quem o usava.", rarity: "common", slot: "ring", min_level: 1 },
  { slug: "anel-viajante", name: "Anel de Viajante", description: "Idris garante que já trocou de dono mais vezes que ele mesmo.", rarity: "common", slot: "ring", min_level: 1 },
  { slug: "anel-osso-polido", name: "Anel de Osso Polido", description: "Ninguém pergunta de que animal.", rarity: "common", slot: "ring", min_level: 1 },
  { slug: "anel-cobre-baco", name: "Anel de Cobre Baço", description: "Escureceu de tanto contato com a pele.", rarity: "common", slot: "ring", min_level: 1 },
  { slug: "anel-sorte-taverna", name: "Anel de Sorte da Taverna", description: "Greta garante que já viu esse anel dar sorte. E azar. Principalmente azar.", rarity: "common", slot: "ring", min_level: 1 },
  { slug: "anel-aprendiz", name: "Anel de Aprendiz", description: "Borin dá um desses pra cada aprendiz que aguenta o primeiro mês.", rarity: "common", slot: "ring", min_level: 3 },
  { slug: "anel-guarda-veterano", name: "Anel de Guarda Veterano", description: "Roth usa um igual há anos.", rarity: "uncommon", slot: "ring", min_level: 5 },
  { slug: "anel-cacador", name: "Anel de Caçador", description: "Marcado com um risco de garra, quase apagado.", rarity: "uncommon", slot: "ring", min_level: 6 },
  { slug: "anel-estudioso", name: "Anel de Estudioso", description: "Yannick garante que esse já esteve perto de descobertas importantes.", rarity: "uncommon", slot: "ring", min_level: 5 },
  { slug: "anel-explorador", name: "Anel de Explorador", description: "Idris garante que esse já viu mais regiões que ele.", rarity: "uncommon", slot: "ring", min_level: 6 },
  { slug: "anel-mercador", name: "Anel de Mercador", description: "Talia jura que é raro. Raro é ela admitir que não sabe.", rarity: "uncommon", slot: "ring", min_level: 6 },
  { slug: "anel-duelo-arena", name: "Anel de Duelo da Arena", description: "Kade recomenda pra quem já venceu ao menos uma vez.", rarity: "uncommon", slot: "ring", min_level: 5 },
  { slug: "anel-guardiao-ruinas", name: "Anel do Guardião das Ruínas", description: "Gravado por dentro com símbolos que ninguém mais consegue traduzir.", rarity: "rare", slot: "ring", min_level: 11, uti_bonus: 2 },
  { slug: "anel-explorador-desaparecido", name: "Anel do Explorador Desaparecido", description: "Ninguém reconheceu o símbolo gravado por dentro.", rarity: "rare", slot: "ring", min_level: 12, uti_bonus: 2 },
  { slug: "anel-ultima-coroa", name: "Anel da Última Coroa", description: "Marcado com um selo que nenhum arquivo atual reconhece.", rarity: "rare", slot: "ring", min_level: 13, uti_bonus: 3 },
  { slug: "anel-deserto-vidro", name: "Anel do Deserto de Vidro", description: "Um grão de vidro ainda gira preso dentro da pedra.", rarity: "rare", slot: "ring", min_level: 12, uti_bonus: 3 },
  { slug: "anel-rei-nunca-coroado", name: "Anel do Rei Que Nunca Foi Coroado", description: "Ninguém ousava pedir pra vê-lo de perto.", rarity: "epic", slot: "ring", min_level: 18, uti_bonus: 6 },
  { slug: "anel-primeiro-amanhecer", name: "Anel do Primeiro Amanhecer", description: "Passou por tantas mãos que perdeu a conta de qual foi a primeira.", rarity: "legendary", slot: "ring", min_level: 25, uti_bonus: 10 },

  // ---- Sprint Wolves Ecosystem (Phase I) — 20 itens ligados aos Lobos
  // do Bosque Sussurrante (e variantes regionais). Nenhum item novo fora
  // do tema; cada um referencia um lobo real do Bestiário.
  { slug: "adaga-de-presa-pequena", name: "Adaga de Presa Pequena", description: "Uma presa só, amarrada num cabo simples.", rarity: "common", slot: "weapon", min_level: 1 },
  { slug: "bracelete-de-pelo-de-lobo", name: "Bracelete de Pelo de Lobo", description: "Comum entre iniciantes que caçam perto da Capital.", rarity: "common", slot: "ring", min_level: 1 },
  { slug: "luvas-de-garra-curta", name: "Luvas de Garra Curta", description: "De um filhote, não de um adulto. Ainda corta.", rarity: "uncommon", slot: "weapon", min_level: 5 },
  { slug: "coleira-do-filhote-perdido", name: "Coleira do Filhote Perdido", description: "Ninguém sabe de qual matilha ele se separou.", rarity: "uncommon", slot: "amulet", min_level: 4 },
  { slug: "botas-de-pelagem-seca", name: "Botas de Pelagem Seca", description: "Da variante das Colinas Áridas, mais fina que a da floresta.", rarity: "uncommon", slot: "boots", min_level: 5 },
  { slug: "capuz-de-pelagem-seca", name: "Capuz de Pelagem Seca", description: "Protege do sol mais do que do frio.", rarity: "uncommon", slot: "helmet", min_level: 5 },
  { slug: "manto-de-pelagem-encharcada", name: "Manto de Pelagem Encharcada", description: "Nunca seca de verdade, mesmo longe do Pântano.", rarity: "uncommon", slot: "armor", min_level: 6 },
  { slug: "luvas-de-pelagem-encharcada", name: "Luvas de Pelagem Encharcada", description: "Cheira a lodo, não importa quantas vezes seja lavada.", rarity: "uncommon", slot: "weapon", min_level: 6 },
  { slug: "garras-de-matilha", name: "Garras de Matilha", description: "Marcas de uma matilha inteira, não de um lobo só.", rarity: "rare", slot: "weapon", min_level: 12 },
  { slug: "peitoral-de-couro-de-matilha", name: "Peitoral de Couro de Matilha", description: "Costurado com pele de mais de um lobo, por necessidade.", rarity: "rare", slot: "armor", min_level: 11 },
  { slug: "elmo-de-cranio-lobal", name: "Elmo de Crânio Lobal", description: "O crânio ainda encaixa como se tivesse sido feito pra isso.", rarity: "rare", slot: "helmet", min_level: 12 },
  { slug: "botas-de-passo-de-lobo", name: "Botas de Passo de Lobo", description: "Silenciosas o bastante para enganar até outro lobo.", rarity: "rare", slot: "boots", min_level: 11 },
  { slug: "amuleto-do-uivo-distante", name: "Amuleto do Uivo Distante", description: "Alguns juram ouvir um uivo de longe quando o usam.", rarity: "rare", slot: "amulet", min_level: 10 },
  { slug: "anel-de-olho-de-lobo", name: "Anel de Olho de Lobo", description: "A cor muda dependendo de quem observa.", rarity: "rare", slot: "ring", min_level: 10, uti_bonus: 2 },
  { slug: "elmo-de-presas-de-gelo", name: "Elmo de Presas de Gelo", description: "As presas ainda parecem geladas ao toque.", rarity: "rare", slot: "helmet", min_level: 13 },
  { slug: "botas-de-presas-de-gelo", name: "Botas de Presas de Gelo", description: "Feitas pra não escorregar em terreno congelado.", rarity: "rare", slot: "boots", min_level: 13 },
  { slug: "manto-da-loba-prateada", name: "Manto da Loba Prateada", description: "A pelagem ainda brilha sob luar, mesmo depois de curtida.", rarity: "epic", slot: "armor", min_level: 17 },
  { slug: "capuz-da-loba-prateada", name: "Capuz da Loba Prateada", description: "Cheira a floresta, não importa quanto tempo passe.", rarity: "epic", slot: "helmet", min_level: 17 },
  { slug: "colar-de-presas-do-alfa", name: "Colar de Presas do Alfa", description: "Feito só com presas de um único Lobo Alfa abatido.", rarity: "epic", slot: "amulet", min_level: 18 },
  { slug: "presa-do-alfa", name: "Presa do Alfa", description: "A presa do Lobo Alfa. Poucos chegam perto o bastante pra arrancar uma.", rarity: "legendary", slot: "weapon", min_level: 25 },
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
