// Sprint Kingdom Memories (Phase I) — conteúdo puro sobre acontecimentos
// que marcaram emocionalmente o Reino: tragédias, vitórias caras,
// pessoas comuns lembradas, frases históricas e memoriais simples.
// Mesmo espírito de ravens.ts/ruins.ts/folk.ts/history.ts/
// government.ts/folklore.ts: arquivo isolado, sem componente, sem
// sistema, pronto para uma Sprint futura decidir onde exibir.
//
// Regra central: nem toda memória é confiável. Moradores discordam do
// que realmente aconteceu — de propósito, em vários destes registros.
export interface GreatTragedy {
  id: string;
  name: string;
  description: string;
}

// "20 grandes tragédias" — distintas das 8 já catalogadas em
// museum.ts (Grande Incêndio, Inverno Longo, etc.), mesma função
// narrativa, nunca cópia de obra existente.
export const GREAT_TRAGEDIES: GreatTragedy[] = [
  { id: "cidade-perdida-do-vale-cinza", name: "A Cidade Perdida do Vale Cinza", description: "Um povoado inteiro desapareceu numa única estação, sem motivo confirmado. Hoje, ruínas dispersas marcam onde ficava." },
  { id: "queda-da-ponte-dos-emigrantes", name: "A Queda da Ponte dos Emigrantes", description: "Uma ponte desabou durante uma travessia em massa, na Era da Grande Migração, levando dezenas de famílias." },
  { id: "seca-das-tres-colheitas", name: "A Seca das Três Colheitas", description: "Três anos seguidos de colheita perdida na Planície Dourada, décadas depois do Inverno Longo." },
  { id: "inverno-das-portas-fechadas", name: "O Inverno das Portas Fechadas", description: "Vilas inteiras se isolaram umas das outras por meses, com medo de uma doença que nunca foi totalmente identificada." },
  { id: "incendio-da-feira-de-outono", name: "O Incêndio da Feira de Outono", description: "Destruiu uma feira inteira e a colheita armazenada de dezenas de famílias, na mesma noite." },
  { id: "naufragio-do-barco-das-criancas", name: "O Naufrágio do Barco das Crianças", description: "Um barco de pescadores levando crianças a um festival se perdeu numa tempestade repentina no Litoral Quebrado." },
  { id: "praga-dos-graos-negros", name: "A Praga dos Grãos Negros", description: "Uma doença nos grãos arruinou plantações por duas estações seguidas, espalhando-se antes que alguém entendesse a causa." },
  { id: "desmoronamento-vila-das-colinas", name: "O Desmoronamento da Vila das Colinas", description: "Um deslizamento soterrou parte de uma vila inteira nas Colinas Áridas, numa única madrugada." },
  { id: "fome-do-cerco-silencioso", name: "A Fome do Cerco Silencioso", description: "Estradas ficaram intransitáveis por semanas, isolando a Capital do resto do Reino sem nenhum inimigo envolvido." },
  { id: "afogamento-travessia-de-inverno", name: "O Afogamento da Travessia de Inverno", description: "Um grupo de viajantes tentou atravessar um rio congelado e não resistiu ao gelo que cedeu no meio do caminho." },
  { id: "epidemia-da-agua-parada", name: "A Epidemia da Água Parada", description: "Doença espalhada por água contaminada num verão excepcionalmente quente, atingindo várias vilas ao mesmo tempo." },
  { id: "colapso-da-mina-funda", name: "O Colapso da Mina Funda", description: "Um desabamento isolou dezenas de mineiros por dias antes que o resgate conseguisse alcançá-los." },
  { id: "tempestade-que-levou-o-cais", name: "A Tempestade que Levou o Cais", description: "Destruiu o principal cais de pesca do Litoral Quebrado, nunca reconstruído exatamente do mesmo jeito." },
  { id: "ano-sem-primavera", name: "O Ano Sem Primavera", description: "Uma estação inteira em que a primavera simplesmente não chegou no tempo esperado, atrasando plantios por meses." },
  { id: "massacre-silencioso-das-colmeias", name: "O Massacre Silencioso das Colmeias", description: "Todas as colmeias de uma região morreram na mesma semana, sem explicação encontrada até hoje." },
  { id: "fuga-da-vila-queimada", name: "A Fuga da Vila Queimada", description: "Moradores tiveram que abandonar a própria vila depois de um incêndio que consumiu quase tudo em poucas horas." },
  { id: "naufragio-da-ultima-travessia", name: "O Naufrágio da Última Travessia", description: "A última expedição a tentar atravessar o Litoral Quebrado antes do mapeamento oficial nunca foi encontrada." },
  { id: "peste-dos-animais", name: "A Peste dos Animais", description: "Doença que dizimou rebanhos inteiros, afetando pastores e curtidores da região por anos seguidos." },
  { id: "desabamento-teto-biblioteca-antiga", name: "O Desabamento do Teto da Biblioteca Antiga", description: "Destruiu parte do acervo original antes mesmo da fundação da Biblioteca Real que conhecemos hoje." },
  { id: "noite-rio-mudou-de-curso", name: "A Noite em que o Rio Mudou de Curso", description: "Um evento que redesenhou parte da geografia próxima ao Porto do Amanhecer, deixando famílias inteiras sem suas terras." },
];

export interface GreatVictory {
  id: string;
  name: string;
  description: string;
  cost: string;
}

// "20 grandes vitórias. Vitórias caras. Nunca perfeitas."
export const GREAT_VICTORIES: GreatVictory[] = [
  { id: "defesa-do-portao-norte", name: "A Defesa do Portão Norte", description: "Repeliu um ataque que ameaçava alcançar a Capital.", cost: "Custou a vida de metade da guarnição que defendia o posto naquela noite." },
  { id: "reconstrucao-apos-grande-incendio", name: "A Reconstrução Após o Grande Incêndio", description: "Reergueu o bairro destruído em tempo recorde.", cost: "À custa de anos de dívida coletiva que só terminou de ser paga há pouco tempo." },
  { id: "travessia-dos-picos-congelados", name: "A Travessia dos Picos Congelados", description: "Abriu a rota que hoje conecta o Reino aos Picos.", cost: "Só um terço da expedição original sobreviveu para ver a rota concluída." },
  { id: "fim-da-seca-de-sete-anos", name: "O Fim da Seca de Sete Anos", description: "Encontrar água salvou a Capital de uma crise ainda maior.", cost: "Duas vilas menores já tinham sido abandonadas antes que a solução chegasse." },
  { id: "reunificacao-dos-territorios-vitoria", name: "A Reunificação dos Territórios", description: "Uniu o Reino sob uma coroa comum novamente.", cost: "Exigiu concessões territoriais que ainda geram disputa entre regiões hoje." },
  { id: "contencao-peste-das-colinas-vitoria", name: "A Contenção da Peste das Colinas", description: "Parou a doença antes que se espalhasse pelo resto do Reino.", cost: "Não antes de dizimar boa parte de uma única geração naquela região." },
  { id: "vitoria-ponte-reconstruida", name: "A Vitória da Ponte Reconstruída", description: "Reergueu a Primeira Ponte após anos de travessia perigosa.", cost: "Um trabalhador foi perdido durante a própria obra de reconstrução." },
  { id: "resgate-dos-mineiros-soterrados", name: "O Resgate dos Mineiros Soterrados", description: "Todos os mineiros presos no Colapso da Mina Funda foram salvos.", cost: "O resgate consumiu recursos que atrasaram outras obras do Reino por anos." },
  { id: "pacificacao-fronteiras-do-sul-vitoria", name: "A Pacificação das Fronteiras do Sul", description: "Encerrou décadas de disputa territorial sem mais um confronto.", cost: "Nenhum dos lados saiu do tratado plenamente satisfeito." },
  { id: "expedicao-que-voltou-fortaleza-sombria", name: "A Expedição que Voltou da Fortaleza Sombria", description: "Trouxe os primeiros registros confiáveis sobre o local.", cost: "Metade do grupo nunca mais quis falar sobre o que viu lá dentro." },
  { id: "reconstrucao-muralha-caida-vitoria", name: "A Reconstrução da Muralha Caída", description: "Ergueu uma muralha mais forte que a anterior.", cost: "O arquiteto responsável pela original nunca teve o nome restaurado nos registros." },
  { id: "salvamento-da-frota-do-litoral", name: "O Salvamento da Frota do Litoral", description: "Parte da frota foi salva após o Naufrágio da Frota do Litoral.", cost: "Graças a pescadores que arriscaram a própria vida nas piores condições." },
  { id: "vitoria-primeira-colheita-pos-praga", name: "A Vitória da Primeira Colheita Depois da Praga", description: "Celebrada com festa por toda a Planície Dourada.", cost: "Ainda assim, menor que qualquer colheita registrada antes da doença." },
  { id: "abertura-estrada-dos-picos-vitoria", name: "A Abertura da Estrada dos Picos", description: "Conectou o Reino aos Picos Congelados de forma permanente.", cost: "Ao custo de vidas que, até hoje, ninguém contabilizou por completo." },
  { id: "contencao-incendio-feira-outono", name: "A Contenção do Incêndio da Feira de Outono", description: "Impediu que o fogo alcançasse a Capital inteira.", cost: "A feira, porém, nunca se recuperou completamente depois daquele ano." },
  { id: "reconciliacao-disputa-fronteiras-cartorio", name: "A Reconciliação Após a Disputa das Fronteiras do Cartório", description: "Duas vilas assinaram um acordo formal sobre a terra disputada.", cost: "O ressentimento entre as famílias envolvidas nunca desapareceu de verdade." },
  { id: "fim-inverno-das-portas-fechadas", name: "O Fim do Inverno das Portas Fechadas", description: "As vilas voltaram a se comunicar normalmente.", cost: "Algumas amizades e alianças de antes nunca foram totalmente restauradas." },
  { id: "vitoria-silenciosa-pocos-publicos", name: "A Vitória Silenciosa dos Poços Públicos", description: "Resolveu o abastecimento de água de boa parte do Reino.", cost: "Exigiu décadas de trabalho de poceiros cujos nomes poucos lembram hoje." },
  { id: "retomada-da-vila-queimada", name: "A Retomada da Vila Queimada", description: "Moradores reconstruíram suas próprias casas, tijolo por tijolo.", cost: "Nem todos os que fugiram durante o incêndio voltaram depois." },
  { id: "descoberta-passagem-segura-picos", name: "A Descoberta da Passagem Segura pelos Picos", description: "Creditada a Elowen, a Exploradora, abriu caminho seguro pelos Picos Congelados.", cost: "Ninguém sabe ao certo se ela sobreviveu para ver o resultado do próprio esforço." },
];

export interface RememberedCommoner {
  id: string;
  name: string;
  description: string;
}

// "20 pessoas comuns lembradas pelo Reino." Não reis, não lendas —
// pessoas ligadas diretamente às tragédias e vitórias acima.
export const REMEMBERED_COMMONERS: RememberedCommoner[] = [
  { id: "mira-a-que-nao-fugiu", name: "Mira, a Que Não Fugiu", description: "Ficou para ajudar vizinhos durante o Incêndio da Feira de Outono, mesmo podendo fugir a tempo." },
  { id: "tomas-do-cais", name: "Tomás do Cais", description: "Organizou o salvamento de pescadores durante a Tempestade que Levou o Cais." },
  { id: "a-parteira-do-inverno", name: "A Parteira do Inverno das Portas Fechadas", description: "Atravessou vilas isoladas escondida, arriscando a própria segurança para continuar ajudando partos." },
  { id: "old-kell-o-poceiro-da-seca", name: "Old Kell, o Poceiro da Seca", description: "Encontrou água para duas vilas inteiras durante a Seca das Três Colheitas, sem reconhecimento oficial na época." },
  { id: "a-menina-que-avisou-a-vila", name: "A Menina que Avisou a Vila", description: "Correu horas para avisar sobre o Desmoronamento da Vila das Colinas antes que fosse tarde demais." },
  { id: "bram-o-ultimo-a-sair", name: "Bram, o Último a Sair", description: "Foi o último a deixar a Vila Queimada, carregando quem não conseguia andar sozinho." },
  { id: "a-viuva-dos-mineiros", name: "A Viúva dos Mineiros", description: "Organizou o apoio às famílias durante o Colapso da Mina Funda, sem nunca ter sido mineira ela mesma." },
  { id: "senhor-adby-o-ferreiro-da-reconstrucao", name: "Senhor Adby, o Ferreiro da Reconstrução", description: "Forjou ferramentas de graça para quem reconstruía a vida depois do Grande Incêndio." },
  { id: "a-enfermeira-da-epidemia", name: "A Enfermeira da Epidemia da Água Parada", description: "Cuidou de doentes por semanas seguidas, sem nunca adoecer ela mesma, segundo os relatos." },
  { id: "old-yara-a-que-contou-os-sobreviventes", name: "Old Yara, a Que Contou os Sobreviventes", description: "Catalogou nome por nome quem sobreviveu ao Naufrágio do Barco das Crianças, para que ninguém fosse esquecido." },
  { id: "o-guia-que-voltou-sozinho", name: "O Guia que Voltou Sozinho", description: "Liderou parte da expedição aos Picos Congelados e voltou sozinho para buscar ajuda para os que ficaram para trás." },
  { id: "a-costureira-que-vestiu-os-enlutados", name: "A Costureira que Vestiu os Enlutados", description: "Costurou roupas de luto de graça para famílias atingidas pela Praga dos Grãos Negros." },
  { id: "o-menino-do-sino", name: "O Menino do Sino", description: "Tocou o sino de aviso durante a Noite em que o Rio Mudou de Curso, mesmo sem ordem de ninguém para fazer isso." },
  { id: "old-senna-a-enfermeira-esquecida", name: "Old Senna, a Enfermeira Esquecida", description: "Cuidou de quem ninguém mais queria cuidar durante a Peste dos Animais, sem nunca cobrar nada por isso." },
  { id: "o-carroceiro-que-nao-cobrou", name: "O Carroceiro que Não Cobrou", description: "Levou famílias inteiras para fora da Vila Queimada sem cobrar nada, por dias seguidos." },
  { id: "a-tecela-que-vestiu-o-reino-de-luto", name: "A Tecelã que Vestiu o Reino de Luto", description: "Teceu faixas negras para cada família que perdeu alguém na Queda da Ponte dos Emigrantes." },
  { id: "o-pescador-que-nadou-contra-a-corrente", name: "O Pescador que Nadou Contra a Corrente", description: "Resgatou três pessoas do Afogamento da Travessia de Inverno, e nunca mais atravessou rio congelado depois disso." },
  { id: "a-escriba-dos-nomes-esquecidos", name: "A Escriba dos Nomes Esquecidos", description: "Insistiu em registrar cada nome perdido na Cidade Perdida do Vale Cinza, mesmo sem ninguém pedir por isso." },
  { id: "o-apicultor-que-reconstruiu-as-colmeias", name: "O Apicultor que Reconstruiu as Colmeias", description: "Trouxe novas colônias de outra região após o Massacre Silencioso das Colmeias." },
  { id: "a-ultima-testemunha-do-vale-cinza", name: "A Última Testemunha do Vale Cinza", description: "A única pessoa que teria visto a cidade antes dela desaparecer — e nunca quis contar o que viu por completo." },
];

export interface HistoricalQuote {
  id: string;
  attributedTo: string;
  text: string;
}

// "20 frases históricas atribuídas a essas pessoas." Cada uma
// vinculada a um dos 20 nomes acima.
export const HISTORICAL_QUOTES: HistoricalQuote[] = [
  { id: "quote-mira", attributedTo: "Mira, a Que Não Fugiu", text: "Quem foge primeiro nunca olha para trás. Eu olhei." },
  { id: "quote-tomas", attributedTo: "Tomás do Cais", text: "O mar não pergunta se você está pronto. Você só entra." },
  { id: "quote-parteira", attributedTo: "A Parteira do Inverno das Portas Fechadas", text: "Porta fechada não impede parto. Só atrasa quem ajuda." },
  { id: "quote-old-kell", attributedTo: "Old Kell, o Poceiro da Seca", text: "Água existe onde ninguém mais olhou." },
  { id: "quote-menina-avisou", attributedTo: "A Menina que Avisou a Vila", text: "Corri porque ninguém mais estava correndo." },
  { id: "quote-bram", attributedTo: "Bram, o Último a Sair", text: "Sair por último não é bravura. É só não conseguir sair antes." },
  { id: "quote-viuva-mineiros", attributedTo: "A Viúva dos Mineiros", text: "Luto se organiza. Espera não." },
  { id: "quote-adby", attributedTo: "Senhor Adby, o Ferreiro da Reconstrução", text: "Ferramenta de graça não reconstrói nada sozinha. Mas ajuda quem reconstrói." },
  { id: "quote-enfermeira-epidemia", attributedTo: "A Enfermeira da Epidemia da Água Parada", text: "Cuidar de doente não é coragem. É só o que sobra para fazer." },
  { id: "quote-old-yara", attributedTo: "Old Yara, a Que Contou os Sobreviventes", text: "Nome esquecido é a segunda morte de alguém." },
  { id: "quote-guia-voltou-sozinho", attributedTo: "O Guia que Voltou Sozinho", text: "Voltar sozinho dói mais do que seguir em grupo." },
  { id: "quote-costureira-enlutados", attributedTo: "A Costureira que Vestiu os Enlutados", text: "Luto tem cor. Fingir que não tem é que é mentira." },
  { id: "quote-menino-do-sino", attributedTo: "O Menino do Sino", text: "Ninguém me mandou tocar. Eu só toquei." },
  { id: "quote-old-senna", attributedTo: "Old Senna, a Enfermeira Esquecida", text: "Ninguém escolhe quem vai cuidar de quem. Alguém sempre acaba escolhendo." },
  { id: "quote-carroceiro-nao-cobrou", attributedTo: "O Carroceiro que Não Cobrou", text: "Cobrar de quem perdeu tudo é o mesmo que roubar." },
  { id: "quote-tecela-luto", attributedTo: "A Tecelã que Vestiu o Reino de Luto", text: "Tecer luto é mais lento que tecer festa. Devia ser o contrário." },
  { id: "quote-pescador-corrente", attributedTo: "O Pescador que Nadou Contra a Corrente", text: "A correnteza não perdoa duas vezes. Por isso só entrei uma." },
  { id: "quote-escriba-nomes-esquecidos", attributedTo: "A Escriba dos Nomes Esquecidos", text: "Escrevo nome que ninguém mais vai escrever. É o mínimo que posso fazer." },
  { id: "quote-apicultor-reconstruiu", attributedTo: "O Apicultor que Reconstruiu as Colmeias", text: "Abelha nova não substitui abelha perdida. Só continua o trabalho." },
  { id: "quote-ultima-testemunha-vale-cinza", attributedTo: "A Última Testemunha do Vale Cinza", text: "Vi o suficiente para nunca mais dormir direito. Não vou contar o resto." },
];

export interface Memorial {
  id: string;
  name: string;
  type: string;
  description: string;
}

// "20 memoriais. Monumentos simples. Placas. Árvores. Pontes. Pedras."
export const MEMORIALS: Memorial[] = [
  { id: "arvore-de-mira", name: "A Árvore de Mira", type: "árvore", description: "Plantada no local da Feira de Outono, onde Mira ajudou vizinhos a escapar do incêndio." },
  { id: "pedra-de-tomas-do-cais", name: "A Pedra de Tomás do Cais", type: "pedra", description: "Uma pedra no cais reconstruído, sem inscrição, só o formato de uma âncora gravado à mão." },
  { id: "banco-da-parteira", name: "O Banco da Parteira", type: "banco de pedra", description: "Onde a Parteira do Inverno das Portas Fechadas costumava sentar entre um parto e outro." },
  { id: "poco-de-old-kell", name: "O Poço de Old Kell", type: "poço", description: "Um poço com o nome dele gravado informalmente na borda, por quem ainda se lembra." },
  { id: "placa-da-menina-que-avisou", name: "A Placa da Menina que Avisou", type: "placa", description: "Uma placa pequena nas Colinas Áridas, sem nome, só a frase 'ela correu por todos nós'." },
  { id: "ponte-de-bram", name: "A Ponte de Bram", type: "ponte", description: "Um trecho reconstruído da estrada onde ficava a Vila Queimada, chamado assim informalmente pelos moradores." },
  { id: "memorial-dos-mineiros", name: "O Memorial dos Mineiros", type: "monumento simples", description: "Pedras empilhadas à entrada da Mina Funda, onde cada mineiro resgatado deixou sua marca." },
  { id: "bigorna-de-adby", name: "A Bigorna de Adby", type: "objeto preservado", description: "A bigorna original dele, hoje exposta informalmente na forja de Borin, como lembrança." },
  { id: "banco-da-enfermeira", name: "O Banco da Enfermeira", type: "banco de madeira", description: "Perto de onde ficava o posto de cuidados durante a Epidemia da Água Parada." },
  { id: "livro-de-old-yara", name: "O Livro de Old Yara", type: "livro preservado", description: "Um caderno com os nomes que ela catalogou, guardado hoje na Biblioteca Real." },
  { id: "pedra-do-guia", name: "A Pedra do Guia", type: "pedra", description: "Empilhada nos Picos Congelados, marcando onde ele voltou sozinho para buscar ajuda." },
  { id: "tear-da-costureira", name: "O Tear da Costureira", type: "objeto preservado", description: "Preservado por uma tecelã atual em memória ao trabalho de vestir os enlutados." },
  { id: "sino-do-menino", name: "O Sino do Menino", type: "sino", description: "Um sino pequeno, distinto do sino oficial da torre, guardado por uma família até hoje." },
  { id: "horta-de-old-senna", name: "A Horta de Old Senna", type: "horta", description: "Uma pequena horta de ervas medicinais, cultivada em memória a ela por curandeiras que vieram depois." },
  { id: "marco-do-carroceiro", name: "O Marco do Carroceiro", type: "pedra", description: "Na estrada que leva à antiga Vila Queimada, sem inscrição, só uma roda de carroça gravada." },
  { id: "tecido-da-tecela-de-luto", name: "O Tecido da Tecelã de Luto", type: "objeto preservado", description: "Uma faixa negra preservada, ainda usada simbolicamente em funerais da região." },
  { id: "pedra-do-pescador", name: "A Pedra do Pescador", type: "pedra", description: "Na margem do rio, onde ele parou de nadar depois do resgate, nunca mais atravessando gelo." },
  { id: "arquivo-da-escriba", name: "O Arquivo da Escriba", type: "seção de arquivo", description: "Uma seção do Arquivo Real dedicada aos nomes que ela insistiu em registrar." },
  { id: "colmeia-de-honra", name: "A Colmeia de Honra", type: "colmeia", description: "Mantida viva propositalmente há gerações, em memória ao trabalho do Apicultor." },
  { id: "pedra-do-vale-cinza", name: "A Pedra do Vale Cinza", type: "pedra", description: "Uma única pedra erguida onde a cidade perdida supostamente ficava, sem inscrição — porque ninguém soube o que escrever." },

  // Sprint Place Identity (Phase I)
  { id: "fonte-da-praca-reconstruida", name: "A Fonte Reconstruída", type: "fonte", description: "Reergueu-se após a Seca de Sete Anos, para lembrar que água nunca deve ser dada como garantida." },
  { id: "arvore-do-conselho-antigo", name: "A Árvore do Conselho Antigo", type: "árvore", description: "Dizem que abrigou reuniões do Conselho, nos tempos em que ainda não havia salão próprio pra isso." },
  { id: "barril-do-comercio-perdido", name: "O Barril do Comércio Perdido", type: "barril", description: "Segundo os mais velhos, é o que sobrou de um comércio inteiro destruído no Grande Incêndio." },
  { id: "camara-do-luto-antigo", name: "A Câmara do Luto Antigo", type: "câmara", description: "Diz-se que rituais de luto do Primeiro Reino aconteciam ali dentro, para que os nomes dos mortos ecoassem uma última vez." },
  { id: "portal-da-fronteira-esquecida", name: "O Portal da Fronteira Esquecida", type: "portal de pedra", description: "Marcava, segundo a tradição, uma disputa de fronteira resolvida há tanto tempo que ninguém mais lembra os dois lados." },
];
