// Sprint History of the Kingdom (Phase I) — conteúdo puro sobre a
// história antiga do Reino: Eras, personagens históricos (não heróis,
// não jogadores), cartas antigas e diários. Mesmo espírito de
// ravens.ts/ruins.ts/folk.ts: arquivo isolado, sem componente, sem
// sistema, pronto para uma Sprint futura decidir onde exibir.
//
// Regra central desta Sprint: nenhuma resposta definitiva. Eras têm
// datação disputada, personagens têm feitos contestados, cartas e
// diários se contradizem entre si — de propósito.
export interface KingdomEra {
  id: string;
  name: string;
  duration: string;
  summary: string;
  mainChanges: string;
  legacy: string;
}

export const KINGDOM_ERAS: KingdomEra[] = [
  { id: "era-das-origens-perdidas", name: "Era das Origens Perdidas", duration: "Desconhecida — anterior a qualquer registro escrito.", summary: "Primeiros povoamentos dispersos pelo território, sem nenhum reino unificado.", mainChanges: "Assentamentos isolados, sem estrada, sem lei comum entre eles.", legacy: "As Ruínas Antigas espalhadas pelo Reino, cuja origem ninguém confirma até hoje." },
  { id: "era-da-primeira-fundacao", name: "Era da Primeira Fundação", duration: "Cerca de 300 anos, segundo uns — 250, segundo outros.", summary: "Pequenos povoados se uniram em torno do que hoje é o Porto do Amanhecer.", mainChanges: "Primeira muralha simples e as primeiras estradas ligando vilas próximas.", legacy: "O próprio nome 'Porto do Amanhecer' e a lenda de que a Capital já existia antes de qualquer fundação oficial." },
  { id: "era-do-primeiro-reino", name: "Era do Primeiro Reino", duration: "Aproximadamente 150 anos.", summary: "Primeira coroa unificada reconhecida por registros escritos que sobreviveram até hoje.", mainChanges: "Leis escritas pela primeira vez e cunhagem da primeira moeda do Reino.", legacy: "Fragmentos de leis antigas e moedas desgastadas que ainda aparecem em escavações." },
  { id: "era-da-quebra", name: "Era da Quebra", duration: "Poucos anos — historiadores discordam de quantos exatamente.", summary: "Colapso do Primeiro Reino, por motivo que nenhuma fonte confirma com certeza.", mainChanges: "Fragmentação em territórios menores, cada um com governo próprio.", legacy: "A Quebra do Primeiro Reino continua sendo o evento mais discutido por historiadores da Capital, sem consenso sobre a causa." },
  { id: "era-dos-territorios-divididos", name: "Era dos Territórios Divididos", duration: "Quase dois séculos.", summary: "Regiões governadas separadamente, sem nenhuma coroa em comum.", mainChanges: "Cada região desenvolveu costumes, moedas e leis próprias.", legacy: "A diversidade cultural que ainda distingue as regiões atuais do Reino." },
  { id: "era-da-grande-migracao", name: "Era da Grande Migração", duration: "Cerca de 40 anos.", summary: "Povos inteiros se deslocaram entre regiões, por um motivo nunca totalmente esclarecido.", mainChanges: "Povoamento de áreas antes desabitadas do território.", legacy: "Vilas cujos fundadores ninguém sabe dizer, ao certo, de onde vieram." },
  { id: "era-da-reunificacao", name: "Era da Reunificação", duration: "Cerca de 80 anos.", summary: "Os territórios divididos se reuniram sob uma nova coroa comum.", mainChanges: "Reconstrução da Capital e ereção de uma nova muralha, maior que a anterior.", legacy: "A própria Capital atual, erguida sobre os restos da anterior." },
  { id: "era-do-inverno-longo", name: "Era do Inverno Longo", duration: "Um único inverno que, segundo relatos, durou mais de um ano.", summary: "Colheitas perdidas em quase todo o território, seguidas de fome generalizada.", mainChanges: "Reservas de comida passaram a ser obrigatórias em cada vila do Reino.", legacy: "A tradição de guardar excedente, ainda seguida por lavradores e moleiros até hoje." },
  { id: "era-das-grandes-construcoes", name: "Era das Grandes Construções", duration: "Cerca de 100 anos.", summary: "Pontes, torres e muralhas erguidas por todo o território do Reino.", mainChanges: "Construção da Primeira Ponte, da Torre do Portão Norte e expansão das estradas principais.", legacy: "Boa parte da infraestrutura que o Reino ainda usa hoje, sem grandes modificações." },
  { id: "era-atual", name: "Era Atual", duration: "Em curso, desde a última coroação registrada.", summary: "O período em que o Reino se encontra agora, sem mudança oficial de coroa há gerações.", mainChanges: "Nenhuma mudança de coroa — só o acúmulo lento de novas histórias, pequenas e grandes.", legacy: "Ainda sendo escrita, segundo os próprios historiadores da Capital." },
];

export interface HistoricalFigure {
  id: string;
  name: string;
  role: string;
  description: string;
  dispute: string;
}

// "30 personagens históricos. Não jogadores. Não heróis." — pessoas
// comuns que, por circunstância, mudaram algo no Reino. Cada uma com
// uma contestação real, nunca resolvida.
export const HISTORICAL_FIGURES: HistoricalFigure[] = [
  { id: "aldric", name: "Aldric", role: "Primeiro Fundador (lendário)", description: "Creditado por fundar o primeiro povoado no que hoje é o Porto do Amanhecer.", dispute: "Alguns registros sugerem que já havia um povoado ali antes dele — Aldric só teria lhe dado nome." },
  { id: "rainha-meira", name: "Rainha Meira", role: "A Unificadora", description: "Reuniu os territórios divididos sob uma coroa comum, na Era da Reunificação.", dispute: "Cronistas discordam se ela negociou a união ou apenas assinou o que outros já tinham acertado." },
  { id: "o-juiz-sem-nome", name: "O Juiz Sem Nome", role: "Autor do Primeiro Código de Leis", description: "Escreveu o primeiro conjunto de leis escritas do Reino, ainda no Primeiro Reino.", dispute: "Ninguém sabe se era uma única pessoa ou vários juízes creditados como um só, com o tempo." },
  { id: "berna-cartografa", name: "Berna, a Cartógrafa", role: "Primeira a mapear o Litoral Quebrado", description: "Percorreu e registrou o litoral inteiro, criando o primeiro mapa confiável da costa.", dispute: "O mapa original dela nunca foi encontrado — só cópias, e nenhuma bate exatamente com a outra." },
  { id: "o-rei-sem-coroa", name: "O Rei Sem Coroa", role: "Governante não coroado", description: "Governou por anos recusando a coroação oficial, por razões nunca explicadas por ele mesmo.", dispute: "Alguns dizem que foi humildade. Outros dizem que a coroa simplesmente tinha desaparecido." },
  { id: "ilda-construtora", name: "Ilda, a Construtora", role: "Projetista da Primeira Ponte", description: "Creditada pelo projeto e pela supervisão da construção da Primeira Ponte do Reino.", dispute: "Alguns historiadores acreditam que 'Ilda' é a personificação de vários engenheiros, não uma pessoa só." },
  { id: "o-escriba-do-inverno", name: "O Escriba do Inverno", role: "Cronista do Inverno Longo", description: "Registrou, dia após dia, os acontecimentos durante o Inverno Longo.", dispute: "Metade do diário dele nunca foi encontrada — ninguém sabe se foi perdida ou destruída." },
  { id: "dorel-fundador-da-guilda", name: "Dorel", role: "Fundador da Guilda dos Aventureiros", description: "Criado como o fundador formal da primeira Guilda de Aventureiros do Reino.", dispute: "Alguns dizem que ele só formalizou uma organização que já existia informalmente há anos." },
  { id: "a-viuva-do-litoral", name: "A Viúva do Litoral", role: "Organizadora da reconstrução pós-naufrágio", description: "Liderou a reconstrução das comunidades pesqueiras após o Naufrágio da Frota do Litoral.", dispute: "Nenhum registro guardou o nome verdadeiro dela — só o título pelo qual ficou conhecida." },
  { id: "senna-primeira-curadora", name: "Senna", role: "Primeira Curadora reconhecida", description: "Creditada por fundar a prática formal de cura no Reino.", dispute: "Historiadores discordam se ela era uma única curandeira ou uma linhagem inteira de mulheres com o mesmo nome." },
  { id: "o-arquiteto-da-muralha-caida", name: "O Arquiteto da Muralha Caída", role: "Construtor da muralha que depois ruiu", description: "Projetou a muralha que, décadas depois, viria a cair numa única noite.", dispute: "Alguns acreditam que seu nome foi apagado dos registros de propósito, após a queda." },
  { id: "otwin-mercador-fundador", name: "Otwin", role: "Fundador das primeiras rotas comerciais", description: "Estabeleceu as primeiras rotas de comércio regular entre regiões do Reino.", dispute: "Alguns cronistas sugerem que ele enriqueceu à custa de mercadores menores, silenciados com o tempo." },
  { id: "a-rainha-do-inverno", name: "A Rainha do Inverno", role: "Governante durante o Inverno Longo", description: "Tomou as decisões que guiaram o Reino durante o pior período de fome já registrado.", dispute: "Alguns a consideram responsável por conter a crise. Outros culpam decisões dela pela duração do inverno." },
  { id: "o-historiador-perdido", name: "O Historiador Perdido", role: "Autor do primeiro registro histórico completo", description: "Escreveu, segundo relatos, o primeiro registro histórico completo do Reino inteiro.", dispute: "A obra nunca foi encontrada — ninguém sabe se foi perdida por acidente ou escondida de propósito." },
  { id: "ferra-primeira-ferreira", name: "Ferra", role: "Considerada a origem do ofício de ferreiro no Reino", description: "Creditada como a primeira a estabelecer uma forja permanente no território.", dispute: "Borin, o atual Ferreiro da Capital, discorda publicamente que ela tenha sido 'a primeira' de qualquer coisa." },
  { id: "o-juiz-da-quebra", name: "O Juiz da Quebra", role: "Presidiu os julgamentos após a Quebra do Primeiro Reino", description: "Decidiu disputas de terra e sucessão nos anos seguintes ao colapso do Primeiro Reino.", dispute: "Alguns o consideram justo. Outros dizem que favoreceu certas famílias, sem provas que sobrevivessem." },
  { id: "aveline-ultima-rainha", name: "Aveline", role: "Última Rainha do Primeiro Reino", description: "Reinou até o momento da Quebra, seja qual for a causa real dela.", dispute: "Discordam se ela causou a queda do reino ou tentou evitá-la até o último instante." },
  { id: "o-mensageiro-que-nunca-chegou", name: "O Mensageiro Que Nunca Chegou", role: "Tentou entregar um aviso antes de uma tragédia", description: "Segundo a lenda, carregava um aviso que teria evitado um desastre, se tivesse chegado a tempo.", dispute: "Ninguém confirma se ele existiu de fato ou se é só uma personificação de um aviso nunca ouvido." },
  { id: "bertrand-fundador-biblioteca", name: "Bertrand", role: "Fundador da Biblioteca Real", description: "Reuniu os primeiros livros do Reino sob um único teto, dando origem à Biblioteca.", dispute: "Alguns registros sugerem que parte do acervo original veio de outras regiões, sem consentimento." },
  { id: "a-curandeira-da-peste", name: "A Curandeira da Peste das Colinas", role: "Conteve a Peste das Colinas, segundo a lenda", description: "Creditada por isolar e conter a doença antes que se espalhasse pelo resto do Reino.", dispute: "Alguns historiadores sugerem que a peste simplesmente perdeu força sozinha, sem intervenção dela." },
  { id: "o-primeiro-guarda-do-portao-norte", name: "O Primeiro Guarda do Portão Norte", role: "Estabeleceu a vigilância da fronteira norte", description: "Organizou o primeiro sistema de vigília na fronteira que hoje o Guarda Roth protege.", dispute: "Historiadores modernos criticam o método dele como 'sorte, não estratégia'." },
  { id: "sorina-migrante-fundadora", name: "Sorina", role: "Liderou parte da Grande Migração", description: "Guiou um grupo inteiro de migrantes até fundar uma nova vila.", dispute: "Ninguém sabe ao certo qual vila atual do Reino foi, de fato, fundada por ela." },
  { id: "o-poceiro-real", name: "O Poceiro Real", role: "Encontrou água para a Capital numa seca severa", description: "Localizou uma fonte de água que salvou a Capital durante uma das piores secas já registradas.", dispute: "O método dele nunca foi documentado nem repetido por nenhum poceiro depois." },
  { id: "a-tecela-da-corte", name: "A Tecelã da Corte", role: "Vestiu a realeza por três gerações seguidas", description: "Responsável pelas roupas oficiais de três reinados consecutivos.", dispute: "Historiadores discordam se as roupas dela realmente influenciaram a moda do Reino, ou se é exagero de cronistas da época." },
  { id: "o-contador-da-primeira-moeda", name: "O Contador da Primeira Moeda", role: "Desenhou e cunhou a primeira moeda oficial", description: "Criou o desenho e o processo de cunhagem da primeira moeda do Primeiro Reino.", dispute: "Seu nome aparece de forma diferente em cada registro encontrado até hoje." },
  { id: "elowen-exploradora-dos-picos", name: "Elowen", role: "Abriu a passagem pelos Picos Congelados", description: "Liderou a expedição que descobriu a primeira rota segura pelos Picos Congelados.", dispute: "Alguns dizem que ela morreu na expedição. Outros dizem que voltou e viveu em silêncio até o fim da vida." },
  { id: "o-escriba-da-fortaleza", name: "O Escriba da Fortaleza Sombria", role: "Documentou a expedição original à Fortaleza", description: "Registrou os primeiros relatos da expedição que chegou à Fortaleza Sombria.", dispute: "Os registros dele contradizem os de outro escriba que participou da mesma expedição." },
  { id: "garrick-primeiro-guildmaster", name: "Garrick", role: "Antecessor de Elenya como Guildmaster", description: "Organizou os primeiros registros formais de aventureiros do Reino.", dispute: "Alguns dizem que era irmão de Dorel, o Fundador da Guilda. Outros dizem que eram a mesma pessoa, com nomes diferentes." },
  { id: "a-ultima-testemunha-da-segunda-coroa", name: "A Última Testemunha da Segunda Coroa", role: "Única pessoa a ver a Segunda Coroa antes de seu desaparecimento", description: "Segundo relatos, foi a última pessoa viva a confirmar ter visto a Segunda Coroa do Reino.", dispute: "Morreu antes de confirmar qualquer detalhe a mais sobre o que viu." },
  { id: "o-rei-que-discordava-de-si-mesmo", name: "O Rei Que Discordava de Si Mesmo", role: "Mudava de decisão sobre a Capital, ano após ano", description: "Reinou revisando repetidamente as próprias decisões sobre a expansão da Capital.", dispute: "Historiadores discordam se isso o tornava fraco ou simplesmente cauteloso demais para a época." },
];

export interface AncientLetter {
  id: string;
  from: string;
  to: string;
  era: string;
  text: string;
}

// "20 cartas antigas" — fragmentos curtos, pessoais, nunca conclusivos.
export const ANCIENT_LETTERS: AncientLetter[] = [
  { id: "carta-soldado-muralha", from: "Um soldado da Primeira Muralha", to: "sua família", era: "era-da-primeira-fundacao", text: "O fogo chegou perto da muralha essa noite. Não sei dizer se foi acidente ou não. Digam à mãe que estou bem, por enquanto." },
  { id: "carta-aveline-conselheiro", from: "Aveline, Última Rainha", to: "um conselheiro sem nome", era: "era-da-quebra", text: "Não sei mais se as decisões são minhas ou se apenas assino o que já foi decidido antes de eu acordar. Isso me assusta mais do que qualquer exército." },
  { id: "carta-mercador-dividido", from: "Um mercador da Era dos Territórios Divididos", to: "seu sócio distante", era: "era-dos-territorios-divididos", text: "A fronteira mudou de novo. O que era território de um lado, hoje pertence ao outro. Ajuste os preços antes que a próxima mudança nos pegue de novo." },
  { id: "carta-migrante-partida", from: "Um migrante", to: "quem ficou para trás", era: "era-da-grande-migracao", text: "Não sei ainda pra onde estamos indo de verdade. Só sei que ficar não era mais opção. Escrevo de novo quando encontrarmos um lugar." },
  { id: "carta-mae-migrante", from: "Uma mãe", to: "o filho que migrou", era: "era-da-grande-migracao", text: "Já faz três estações sem notícia sua. Rezo pra essa carta te encontrar em algum lugar, mesmo sem saber qual." },
  { id: "carta-arquiteto-ponte", from: "Ilda, a Construtora", to: "o conselho da Capital", era: "era-das-grandes-construcoes", text: "A ponte vai ficar de pé, prometo. Só preciso de mais um inverno pra terminar direito. Fazer rápido demais é como não fazer nada." },
  { id: "carta-sobrevivente-inverno", from: "Um sobrevivente do Inverno Longo", to: "gerações futuras", era: "era-do-inverno-longo", text: "Guardem sempre mais do que acham necessário. Nós achávamos que sabíamos o que era necessário, e quase não sobrevivemos pra contar." },
  { id: "carta-guarda-fortaleza", from: "Um guarda da Fortaleza Sombria", to: "o comando da Capital", era: "era-atual", text: "Algo mudou nos corredores mais fundos. Não sei explicar o quê. Vou investigar mais amanhã." },
  { id: "carta-berna-aprendiz", from: "Berna, a Cartógrafa", to: "seu aprendiz", era: "era-das-grandes-construcoes", text: "Continue o mapeamento a partir de onde parei, na enseada estreita. Não confie em nenhuma cópia do meu mapa — só no original, se algum dia aparecer." },
  { id: "carta-juiz-quebra-sucessor", from: "O Juiz da Quebra", to: "seu sucessor", era: "era-da-quebra", text: "Uma das sentenças que dei ainda me assombra. Não vou dizer qual. Só digo: julgue sempre com medo de errar, nunca com certeza de acertar." },
  { id: "carta-curandeiro-anonimo", from: "Um curandeiro anônimo", to: "a próxima geração de curandeiras", era: "era-atual", text: "Deixo essa receita incompleta de propósito. O resto, vocês vão aprender melhor errando do que lendo." },
  { id: "carta-exilado-dividido", from: "Um exilado da Era dos Territórios Divididos", to: "sua terra natal", era: "era-dos-territorios-divididos", text: "Ainda sonho com as estradas de lá, mesmo tantos anos depois. Não sei se um dia vou parar de sonhar, ou se um dia vou voltar." },
  { id: "carta-primeiro-guildmaster-sucessor", from: "Garrick", to: "seu sucessor na Guilda", era: "era-da-reunificacao", text: "Registre cada aventureiro, mesmo os que não voltam. Principalmente os que não voltam. A Guilda é feita de nomes, não só de vitórias." },
  { id: "carta-testemunha-naufragio", from: "Uma testemunha do Naufrágio da Frota", to: "as famílias dos marinheiros", era: "era-atual", text: "Não vi tudo que aconteceu, só o suficiente pra não conseguir esquecer. Sinto muito por não ter mais detalhes pra dar a vocês." },
  { id: "carta-lavrador-neto", from: "Um lavrador", to: "seu neto", era: "era-atual", text: "Essa terra já viu seca, migração e reino se partir ao meio. Continua plantando nela mesmo assim. É o que a família sempre fez." },
  { id: "carta-escriba-perdido", from: "O Historiador Perdido", to: "quem encontrar isto", era: "era-atual", text: "Se está lendo isso, é porque a obra completa não foi perdida como todos pensam. Só escondida. Procure com mais cuidado." },
  { id: "carta-mensageiro-migracao", from: "Um mensageiro da Grande Migração", to: "a Capital", era: "era-da-grande-migracao", text: "Preciso de ajuda com urgência, o grupo não vai aguentar mais uma semana nessas condições. Enviem o que puderem, o quanto antes." },
  { id: "carta-rainha-inverno-povo", from: "A Rainha do Inverno", to: "o povo do Reino", era: "era-do-inverno-longo", text: "Sei que a decisão de racionar ainda mais não foi popular. Prefiro a raiva de vocês agora à fome de todos depois." },
  { id: "carta-mineiro-esposa", from: "Um mineiro das Minas Antigas", to: "sua esposa", era: "era-atual", text: "O túnel novo faz um som estranho, mas o veio é bom demais pra abandonar agora. Volto pra casa nesse fim de semana, prometo." },
  { id: "carta-historiador-arquivo", from: "Um historiador anônimo", to: "os arquivos da Biblioteca", era: "era-atual", text: "Admito, antes que outro descubra: nem tudo que escrevi aqui é certeza. Alguns trechos são a melhor suposição que consegui fazer." },
];

export interface AncientDiaryEntry {
  id: string;
  author: string;
  era: string;
  excerpt: string;
}

// "15 diários" — trechos únicos, nunca a obra inteira.
export const ANCIENT_DIARIES: AncientDiaryEntry[] = [
  { id: "diario-soldado-primeira-muralha", author: "Um soldado da Primeira Muralha", era: "era-da-primeira-fundacao", excerpt: "Terceira noite de vigília seguida. O sono pesa mais que a espada. Ainda assim, ninguém reclama — todos sabem por que estamos aqui." },
  { id: "diario-curandeira-peste", author: "A Curandeira da Peste das Colinas", era: "era-atual", excerpt: "Mais três casos hoje. Não sei se estou curando ou só atrasando o inevitável. Vou continuar tentando de qualquer jeito." },
  { id: "diario-mercador-dividido", author: "Um mercador da Era dos Territórios Divididos", era: "era-dos-territorios-divididos", excerpt: "A fronteira mudou de lugar outra vez. Comecei a desenhar meus próprios mapas, porque os oficiais não duram uma estação inteira." },
  { id: "diario-pescador-inverno-longo", author: "Um pescador durante o Inverno Longo", era: "era-do-inverno-longo", excerpt: "O rio congelou até o fundo, coisa que meu pai jurava nunca ter visto. Não sei mais o que pescar, nem onde." },
  { id: "diario-arquiteto-torre-norte", author: "O arquiteto da Torre do Portão Norte", era: "era-das-grandes-construcoes", excerpt: "Errei o cálculo da fundação, descobri tarde demais. Reforcei às pressas. Só o tempo vai dizer se foi o suficiente." },
  { id: "diario-migrante-grande-migracao", author: "Uma migrante da Grande Migração", era: "era-da-grande-migracao", excerpt: "Ninguém no grupo sabe dizer, com certeza, pra onde estamos indo. Seguimos porque parar parece pior." },
  { id: "diario-guarda-fortaleza-sombria", author: "Um guarda da Fortaleza Sombria", era: "era-atual", excerpt: "Ouvi um som vindo dos corredores mais fundos hoje. Vou investigar amanhã, se —" },
  { id: "diario-escriba-biblioteca-real", author: "Um escriba da Biblioteca Real", era: "era-atual", excerpt: "Três livros sumiram da mesma prateleira essa semana. Ninguém assume ter levado, e a Bibliotecária jura que trancou tudo direito." },
  { id: "diario-mineiro-minas-antigas", author: "Um mineiro das Minas Antigas", era: "era-atual", excerpt: "O som que o túnel novo faz mudou de novo hoje. Mais grave. Vou perguntar aos outros se estão ouvindo a mesma coisa." },
  { id: "diario-tecela-da-corte", author: "A Tecelã da Corte", era: "era-da-reunificacao", excerpt: "A terceira geração da corte já usa o que teço, e ainda sinto que nunca vou acertar de primeira. Talvez esse seja o ofício mesmo." },
  { id: "diario-juiz-da-quebra", author: "O Juiz da Quebra", era: "era-da-quebra", excerpt: "Assinei uma sentença hoje sem ter certeza nenhuma. Duvido que algum dia eu tenha certeza de verdade, nesse cargo." },
  { id: "diario-cartografo-litoral-quebrado", author: "Um cartógrafo do Litoral Quebrado", era: "era-das-grandes-construcoes", excerpt: "Encontrei uma baía que não aparece em nenhum mapa anterior. Ou ela é nova, ou todo mundo antes de mim errou o litoral inteiro." },
  { id: "diario-crianca-grande-migracao", author: "Uma criança durante a Grande Migração", era: "era-da-grande-migracao", excerpt: "Andamos de novo hoje. Perguntei pra onde vamos. Ninguém sabe responder direito, mas todo mundo continua andando." },
  { id: "diario-guildmaster-antigo", author: "Garrick, antigo Guildmaster", era: "era-da-reunificacao", excerpt: "Registrei mais dois aventureiros hoje. Um deles não parecia pronto pra nada. Registrei mesmo assim — a lista é de nomes, não de garantias." },
  { id: "diario-historiador-era-atual", author: "Um historiador da Era Atual", era: "era-atual", excerpt: "Quanto mais registro a história do Reino, mais percebo o quanto ainda não sei. Talvez essa seja a única conclusão honesta que existe." },
];
