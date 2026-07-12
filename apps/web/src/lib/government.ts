// Sprint Kingdom Government (Phase I) — conteúdo puro sobre a
// estrutura política do Reino: cargos, instituições, documentos
// oficiais, conflitos políticos e cerimônias. Mesmo espírito de
// ravens.ts/ruins.ts/folk.ts/history.ts: arquivo isolado, sem
// componente, sem sistema, pronto para uma Sprint futura decidir onde
// exibir.
//
// Regra central: nenhuma instituição pode parecer perfeita. Toda
// instituição e todo cargo carrega uma falha humana, uma tradição
// estranha ou uma contradição sem solução.
export interface OfficialPosition {
  id: string;
  name: string;
  function: string;
  responsibilities: string;
  tradition: string;
  curiosity: string;
}

export const OFFICIAL_POSITIONS: OfficialPosition[] = [
  { id: "mestre-da-moeda", name: "Mestre da Moeda", function: "Supervisiona a cunhagem e o valor da moeda do Reino.", responsibilities: "Aprova cada novo lote de moedas e investiga falsificações reportadas.", tradition: "O cargo passa de um mestre a outro através de um teste de pesagem às cegas.", curiosity: "Nenhum Mestre da Moeda em exercício já foi visto carregando dinheiro próprio." },
  { id: "guardiao-das-estradas", name: "Guardião das Estradas", function: "Garante que as estradas principais do Reino sejam mantidas e seguras.", responsibilities: "Organiza reparos, reporta bandidos e coordena com carroceiros e guias.", tradition: "Percorre pessoalmente toda estrada nova antes de declará-la oficial.", curiosity: "O atual Guardião nunca usa a mesma estrada duas vezes seguidas, por hábito." },
  { id: "arquivista-real", name: "Arquivista Real", function: "Organiza e preserva os documentos oficiais do Reino.", responsibilities: "Cataloga decretos, arquiva correspondências e decide o que é histórico e o que é descartável.", tradition: "Cargo criado a partir do legado de Bertrand, fundador da Biblioteca Real.", curiosity: "Existe um arquivo inteiro que o Arquivista atual se recusa a catalogar." },
  { id: "marechal-do-reino", name: "Marechal do Reino", function: "Comanda as forças de defesa em tempos de crise.", responsibilities: "Coordena guardas regionais e decide mobilizações em emergências.", tradition: "Só assume comando total durante emergências formalmente declaradas, nunca em tempos de paz.", curiosity: "O cargo ficou vago por quase uma geração inteira, sem que ninguém notasse oficialmente." },
  { id: "inspetor-das-pontes", name: "Inspetor das Pontes", function: "Avalia a segurança estrutural de pontes por todo o Reino.", responsibilities: "Inspeciona, interdita pontes perigosas e autoriza reparos.", tradition: "Sempre atravessa a pé antes de qualquer autorização, nunca a cavalo.", curiosity: "Nunca aprovou a reforma completa da Primeira Ponte, por razões que se recusa a explicar." },
  { id: "cronista-real", name: "Cronista Real", function: "Registra oficialmente os acontecimentos do Reino.", responsibilities: "Mantém os registros atualizados e revisa crônicas antigas.", tradition: "Cada Cronista reescreve, ao assumir o cargo, ao menos uma crônica do anterior.", curiosity: "Os registros do Cronista atual já contradizem os do anterior em pelo menos três eventos." },
  { id: "mestre-das-minas", name: "Mestre das Minas", function: "Supervisiona a extração mineral em todo o território.", responsibilities: "Autoriza novas escavações e media disputas entre mineiros.", tradition: "Nunca autoriza uma escavação sem antes consultar um mineiro experiente da região.", curiosity: "O atual Mestre das Minas nunca visitou pessoalmente as Minas Abandonadas." },
  { id: "capitao-da-guarda", name: "Capitão da Guarda", function: "Comanda a guarda da Capital.", responsibilities: "Organiza rondas, treina novos guardas e reporta ao Conselho.", tradition: "Escolhido sempre entre os próprios guardas, nunca de fora da corporação.", curiosity: "O Guarda Roth já recusou a promoção ao cargo duas vezes." },
  { id: "conselheiro-da-coroa", name: "Conselheiro da Coroa", function: "Aconselha diretamente as decisões da coroa.", responsibilities: "Analisa decretos e media disputas entre instituições.", tradition: "Fala em particular antes de qualquer anúncio público, nunca em praça.", curiosity: "Ninguém sabe ao certo quantos Conselheiros existem no momento — o número nunca é divulgado." },
  { id: "embaixador", name: "Embaixador", function: "Representa o Reino em negociações com outras regiões.", responsibilities: "Negocia tratados e media disputas de fronteira.", tradition: "Aprende, antes de assumir, ao menos um costume de cada região que vai representar.", curiosity: "O cargo já ficou sem ocupante por anos, sem que isso causasse problema visível." },
  { id: "fiscal-de-mercado", name: "Fiscal de Mercado", function: "Regula preços e práticas comerciais nas feiras do Reino.", responsibilities: "Investiga reclamações, aplica multas e media disputas entre mercadores.", tradition: "Nunca revela sua identidade nas feiras que fiscaliza, disfarçado de comprador comum.", curiosity: "A Mercadora Talia jura já ter reconhecido três Fiscais diferentes, só pela forma de regatear." },
  { id: "escrivao-de-registros-civis", name: "Escrivão de Registros Civis", function: "Registra nascimentos, uniões e óbitos em todo o Reino.", responsibilities: "Mantém os registros das vilas atualizados junto ao Arquivo Real.", tradition: "Viaja de vila em vila uma vez por estação, nunca ficando parado.", curiosity: "Alguns registros mais antigos foram feitos por escrivães cujos próprios nomes nunca foram registrados." },
  { id: "superintendente-de-aguas", name: "Superintendente de Águas", function: "Administra poços, rios e o abastecimento de água do Reino.", responsibilities: "Autoriza novos poços e media disputas de irrigação.", tradition: "Prova a água de cada poço novo pessoalmente antes de aprová-lo.", curiosity: "O cargo foi criado logo depois da Seca de Sete Anos, e nunca mais foi extinto." },
  { id: "mestre-de-correios", name: "Mestre de Correios", function: "Supervisiona a rede de mensageiros e carteiros do Reino.", responsibilities: "Organiza rotas, resolve entregas perdidas e treina novos mensageiros.", tradition: "Lê pessoalmente toda carta reportada como 'perdida' antes de arquivá-la como tal.", curiosity: "Guarda uma gaveta inteira de cartas nunca entregues, por endereço ilegível ou destinatário desconhecido." },
  { id: "censor-de-publicacoes", name: "Censor de Publicações", function: "Revisa livros e documentos antes de entrarem oficialmente na Biblioteca Real.", responsibilities: "Aprova ou veta textos considerados sensíveis.", tradition: "Nunca veta um livro sem lê-lo por completo, por mais longo que seja.", curiosity: "Miriam, a Bibliotecária, discorda abertamente de metade das decisões do Censor atual." },
];

export interface KingdomInstitution {
  id: string;
  name: string;
  purpose: string;
  flaw: string;
  connection: string;
}

export const KINGDOM_INSTITUTIONS: KingdomInstitution[] = [
  { id: "arquivo-real", name: "Arquivo Real", purpose: "Guarda documentos oficiais, decretos e registros históricos do Reino.", flaw: "Parte do acervo está desorganizada há tanto tempo que nem o Arquivista sabe o que existe lá dentro.", connection: "Fundado a partir do legado de Bertrand (História) e guarda registros sobre a Quebra do Primeiro Reino (Museu)." },
  { id: "tesouro-real", name: "Tesouro Real", purpose: "Administra as finanças e a cunhagem de moeda do Reino.", flaw: "Dorwin, o Tesoureiro da Capital, já admitiu que nem toda transação antiga bate exatamente com os registros.", connection: "Ligado ao cargo de Mestre da Moeda e à Primeira Moeda do Reino (História)." },
  { id: "conselho-da-coroa", name: "Conselho da Coroa", purpose: "Aconselha as decisões da coroa e media disputas entre instituições.", flaw: "Reuniões acontecem em segredo, e ninguém confirma quantos conselheiros participam de fato.", connection: "Citado em diversas cartas antigas e decretos (História)." },
  { id: "guarda-real", name: "Guarda Real", purpose: "Mantém a ordem e a segurança da Capital e das estradas principais.", flaw: "A guarda é menor do que o Reino gostaria de admitir publicamente.", connection: "Liderada pelo Capitão da Guarda — Roth trabalha diretamente sob essa instituição." },
  { id: "correios-do-reino", name: "Correios do Reino", purpose: "Organiza a entrega de cartas e mensagens entre regiões.", flaw: "Uma gaveta inteira de cartas nunca entregues continua guardada, sem solução.", connection: "Ligada ao Mestre de Correios e às Cartas Antigas (História)." },
  { id: "tribunal-da-capital", name: "Tribunal da Capital", purpose: "Julga disputas civis e criminais do Reino.", flaw: "Alguns veredictos antigos são hoje considerados injustos, mas nenhum foi oficialmente revisado.", connection: "Herdeiro do trabalho do Juiz da Quebra e do Juiz Sem Nome (História)." },
  { id: "cartorio-real", name: "Cartório Real", purpose: "Registra propriedades, terras e heranças de todo o Reino.", flaw: "Disputas de terra que remontam à Era dos Territórios Divididos ainda aparecem nos registros, sem solução.", connection: "Relacionado a disputas entre lavradores e pastores (Povo)." },
  { id: "observatorio-da-coroa", name: "Observatório da Coroa", purpose: "Estuda os céus e mantém o calendário oficial do Reino.", flaw: "O calendário oficial já discorda do calendário popular usado nas vilas há gerações.", connection: "Ligado ao Enigma da Contagem de Anos (Museu/História)." },
  { id: "alfandega-das-estradas", name: "Alfândega das Estradas", purpose: "Cobra taxas sobre mercadorias que atravessam fronteiras internas do Reino.", flaw: "Carroceiros e guias de caravana reclamam constantemente de taxas que mudam sem aviso.", connection: "Relacionada ao Carroceiro e ao Guia de Caravana (Povo)." },
  { id: "camara-dos-oficios", name: "Câmara dos Ofícios", purpose: "Regula e reconhece formalmente as profissões do Reino.", flaw: "Nunca conseguiu catalogar todas as profissões que realmente existem fora da Capital.", connection: "Diretamente ligada às profissões do Reino (Povo)." },
  { id: "guarda-das-ruinas", name: "Guarda das Ruínas", purpose: "Instituição recente, dedicada a proteger e estudar sítios de ruínas antigas.", flaw: "Nenhum de seus membros concorda sobre o que, de fato, deveria ser protegido.", connection: "Trabalha ao lado de Alaric e cita diretamente as Ruínas Antigas (Ruínas)." },
  { id: "ordem-dos-cronistas", name: "Ordem dos Cronistas", purpose: "Reúne cronistas e historiadores oficiais do Reino.", flaw: "Frequentemente publicam versões conflitantes do mesmo evento histórico.", connection: "Ligada ao Cronista Real e aos livros da Biblioteca (Livros/História)." },
];

export interface OfficialDocument {
  id: string;
  type: string;
  title: string;
  text: string;
}

export const OFFICIAL_DOCUMENTS: OfficialDocument[] = [
  { id: "edital-reparo-estradas", type: "Edital", title: "Edital de Reparo das Estradas", text: "O Guardião das Estradas convoca carpinteiros e pedreiros disponíveis para reparo urgente do trecho danificado pela última tempestade." },
  { id: "decreto-reserva-obrigatoria", type: "Decreto", title: "Decreto da Reserva Obrigatória", text: "Em memória ao Inverno Longo, fica estabelecido que toda vila do Reino deve manter reserva mínima de grãos para, no mínimo, uma estação inteira." },
  { id: "ordem-inspecao-pontes", type: "Ordem", title: "Ordem de Inspeção das Pontes", text: "O Inspetor das Pontes determina inspeção geral em todas as travessias de pedra do território antes do início do inverno." },
  { id: "autorizacao-escavacao-minas", type: "Autorização", title: "Autorização de Escavação nas Minas Abandonadas", text: "Concedida autorização para nova escavação em galeria previamente interditada, mediante acompanhamento de mineiro experiente." },
  { id: "convocacao-conselho-urgente", type: "Convocação", title: "Convocação do Conselho da Coroa", text: "Convocação urgente de todos os conselheiros para reunião fechada. Nenhum motivo foi registrado publicamente." },
  { id: "correspondencia-tesouro-cartorio", type: "Correspondência", title: "Correspondência entre o Tesouro e o Cartório", text: "Disputa sobre a avaliação de uma pequena parcela de terra, ainda sem resolução após três trocas de carta." },
  { id: "edital-recrutamento-guarda", type: "Edital", title: "Edital de Recrutamento da Guarda", text: "O Capitão da Guarda anuncia abertura de vagas para novos guardas, com preferência a candidatos que já conheçam bem as estradas do Reino." },
  { id: "decreto-protecao-ruinas", type: "Decreto", title: "Decreto de Proteção das Ruínas Antigas", text: "Proíbe a remoção de qualquer artefato encontrado em sítios de ruínas sem autorização expressa da Guarda das Ruínas." },
  { id: "ordem-silencio-arquivo", type: "Ordem", title: "Ordem de Silêncio sobre o Incidente do Arquivo", text: "Determina que os detalhes do incidente recente no Arquivo Real permaneçam reservados até nova ordem." },
  { id: "autorizacao-rota-comercial", type: "Autorização", title: "Autorização de Rota Comercial", text: "Concede a um guia de caravana permissão para abrir nova rota comercial entre duas regiões, mediante inspeção prévia do Guardião das Estradas." },
  { id: "convocacao-testemunhas-quebra", type: "Convocação", title: "Convocação de Testemunhas da Quebra do Primeiro Reino", text: "Convocação histórica, nunca respondida, pedindo que qualquer testemunha viva da Quebra se apresentasse ao Cronista Real. Nenhuma jamais apareceu." },
  { id: "correspondencia-embaixador-regiao-vizinha", type: "Correspondência", title: "Correspondência do Embaixador com uma Região Vizinha", text: "Tom formal, mas tenso — menciona 'divergências que preferimos resolver em particular' sem detalhar quais." },
  { id: "edital-precos-feira", type: "Edital", title: "Edital de Preços de Feira", text: "O Fiscal de Mercado estabelece limite máximo de reajuste de preços durante festivais e feiras sazonais." },
  { id: "decreto-superintendencia-aguas", type: "Decreto", title: "Decreto de Criação do Cargo de Superintendente de Águas", text: "Criado logo após a Seca de Sete Anos, para que 'o que aconteceu não se repita por falta de quem cuide da água'." },
  { id: "ordem-busca-correspondencia-perdida", type: "Ordem", title: "Ordem de Busca por Correspondência Perdida", text: "O Mestre de Correios determina busca em todas as rotas pela correspondência de um mês inteiro que nunca chegou ao destino." },
  { id: "autorizacao-publicacao-livro", type: "Autorização", title: "Autorização para Publicação de Livro", text: "Aprovada, após revisão extensa do Censor de Publicações — não sem antes uma nota formal de discordância registrada por Miriam, a Bibliotecária." },
  { id: "convocacao-recontagem-anos", type: "Convocação", title: "Convocação Real para Recontagem de Anos", text: "O Observatório da Coroa convoca cronistas e escribas para tentar, mais uma vez, resolver a discrepância na contagem oficial de anos." },
  { id: "correspondencia-mineiros-mestre-minas", type: "Correspondência", title: "Correspondência entre Mineiros e o Mestre das Minas", text: "Relato de um som estranho nas galerias, dias antes do desabamento registrado nas Minas Antigas. A resposta oficial nunca chegou a tempo." },
  { id: "edital-isencao-taxas-seca", type: "Edital", title: "Edital de Isenção de Taxas para Lavradores em Ano de Seca", text: "Suspende temporariamente a cobrança de taxas da Alfândega das Estradas sobre transporte de grãos durante períodos de seca declarada." },
  { id: "decreto-reconhecimento-guilda", type: "Decreto", title: "Decreto de Reconhecimento da Guilda dos Aventureiros", text: "Reconhece formalmente a Guilda fundada por Dorel — ou por Garrick, dependendo do registro consultado — como instituição oficial do Reino." },
  { id: "ordem-interdicao-ponte", type: "Ordem", title: "Ordem de Interdição de uma Ponte", text: "O Inspetor das Pontes interdita travessia considerada instável, gerando reclamação imediata de carroceiros da região." },
  { id: "autorizacao-expedicao-fortaleza", type: "Autorização", title: "Autorização de Expedição à Fortaleza Sombria", text: "Concedida mediante duas condições: relatório completo ao final, e nenhuma remoção de item sem aprovação prévia da Guarda das Ruínas." },
  { id: "convocacao-julgamento-publico", type: "Convocação", title: "Convocação de um Julgamento Público", text: "O Tribunal da Capital convoca testemunhas para audiência aberta — rara exceção à praxe de julgamentos reservados." },
  { id: "correspondencia-dois-cronistas", type: "Correspondência", title: "Correspondência entre Dois Cronistas Reais que Discordam", text: "Troca de cartas ríspidas sobre qual versão de um evento antigo deveria constar no registro oficial. Nenhum dos dois cedeu." },
  { id: "edital-protecao-pocos-publicos", type: "Edital", title: "Edital de Proteção aos Poços Públicos", text: "O Superintendente de Águas proíbe uso não autorizado dos poços públicos para fins que não sejam consumo direto." },
  { id: "decreto-anistia-escandalo", type: "Decreto", title: "Decreto de Anistia após um Escândalo", text: "Concede anistia a funcionários envolvidos num escândalo não nomeado explicitamente no próprio decreto." },
  { id: "ordem-escolta-embaixador", type: "Ordem", title: "Ordem de Escolta para um Embaixador", text: "A Guarda Real recebe ordem de escoltar o Embaixador em viagem considerada 'de maior sensibilidade que o usual'." },
  { id: "autorizacao-casamento-real", type: "Autorização", title: "Autorização de Casamento Real", text: "Registrada pelo Escrivão de Registros Civis, com uma nota lateral incomum: 'consultar o Cartório antes de qualquer cerimônia pública'." },
  { id: "convocacao-urgente-marechal", type: "Convocação", title: "Convocação Urgente do Marechal do Reino", text: "Convocação de urgência máxima, sem explicação registrada. Até hoje, historiadores discutem o motivo real por trás dela." },
  { id: "correspondencia-anonima-conselho", type: "Correspondência", title: "Correspondência Anônima Endereçada ao Conselho", text: "Carta sem assinatura, guardada no Arquivo Real, cujo conteúdo nunca foi tornado público em nenhum registro conhecido." },
];

export interface PoliticalConflict {
  id: string;
  name: string;
  description: string;
  outcome: string;
}

// "20 conflitos políticos históricos. Nunca guerras completas.
// Disputas. Crises. Escândalos."
export const POLITICAL_CONFLICTS: PoliticalConflict[] = [
  { id: "disputa-sucessao-silenciosa", name: "A Disputa da Sucessão Silenciosa", description: "Dois candidatos disputaram um título regional por meses, sem confronto público.", outcome: "Resolvida em particular. Nenhum registro explica os termos exatos do acordo." },
  { id: "escandalo-moeda-leve", name: "O Escândalo da Moeda Leve", description: "Um Mestre da Moeda foi acusado de cunhar moedas com menos metal do que o declarado.", outcome: "Nunca formalmente confirmado ou desmentido. O mestre da época deixou o cargo pouco depois." },
  { id: "crise-conselho-vazio", name: "A Crise do Conselho Vazio", description: "O Conselho da Coroa funcionou por quase um ano com menos membros do que o exigido.", outcome: "Descoberto tarde demais para qualquer ação — ninguém sabe quantas decisões daquele ano foram, tecnicamente, inválidas." },
  { id: "disputa-fronteiras-cartorio", name: "A Disputa das Fronteiras do Cartório", description: "Duas vilas reivindicam a mesma faixa de terra há gerações.", outcome: "Segue sem solução. O Cartório Real arquivou o caso como 'pendente' há mais de cinquenta anos." },
  { id: "escandalo-arquivo-queimado", name: "O Escândalo do Arquivo Queimado", description: "Um incêndio suspeito destruiu parte de uma seção específica do Arquivo Real.", outcome: "A causa nunca foi determinada. Alguns suspeitam que os documentos perdidos foram queimados de propósito." },
  { id: "crise-embaixador-silencioso", name: "A Crise do Embaixador Silencioso", description: "Um embaixador parou de enviar relatórios por um ano inteiro, sem explicação.", outcome: "Voltou a se comunicar sem nunca justificar o silêncio. O Conselho decidiu não insistir na pergunta." },
  { id: "disputa-tribunal-guilda", name: "A Disputa entre Tribunal e Guilda", description: "Conflito de jurisdição sobre um aventureiro acusado de um crime em vila pequena.", outcome: "Resolvido informalmente entre Elenya e o Tribunal, sem precedente formal registrado." },
  { id: "escandalo-taxas-duplicadas", name: "O Escândalo das Taxas Duplicadas", description: "A Alfândega das Estradas cobrou taxa duplicada de mercadores durante uma estação inteira.", outcome: "Os valores foram parcialmente reembolsados. Ninguém foi oficialmente responsabilizado." },
  { id: "crise-sucessao-marechal", name: "A Crise da Sucessão do Marechal", description: "O cargo de Marechal ficou vago por quase uma geração, em meio a disputas discretas.", outcome: "Nunca resolvida publicamente — o cargo simplesmente voltou a ser ocupado, sem anúncio formal." },
  { id: "disputa-censor-bibliotecaria", name: "A Disputa do Censor e da Bibliotecária", description: "Miriam discordou publicamente de uma decisão do Censor de Publicações sobre um livro específico.", outcome: "O livro permanece vetado. Miriam continua discordando, em voz alta, sempre que o assunto surge." },
  { id: "escandalo-cronista-reescrito", name: "O Escândalo do Cronista Reescrito", description: "Um Cronista Real reescreveu por completo um relato de seu antecessor, sem aviso prévio.", outcome: "Gerou protesto formal da Ordem dos Cronistas. As duas versões ainda circulam, contraditórias entre si." },
  { id: "crise-pontes-interditadas", name: "A Crise das Pontes Interditadas", description: "Um Inspetor interditou várias pontes ao mesmo tempo, paralisando rotas comerciais inteiras.", outcome: "As interdições foram revistas parcialmente. O Inspetor nunca admitiu ter exagerado na avaliação." },
  { id: "disputa-agua-litoral", name: "A Disputa da Água do Litoral", description: "Um Superintendente de Águas foi acusado de favorecer uma região no controle de irrigação.", outcome: "A acusação nunca foi provada nem retirada oficialmente." },
  { id: "escandalo-correio-perdido", name: "O Escândalo do Correio Perdido", description: "Um lote inteiro de correspondência desapareceu antes de chegar ao destino.", outcome: "Parte das cartas foi encontrada anos depois, guardada, sem explicação de como chegaram ali." },
  { id: "crise-recontagem-anos", name: "A Crise da Recontagem de Anos", description: "O novo calendário oficial do Observatório foi rejeitado por diversas vilas do Reino.", outcome: "O Reino hoje convive com dois calendários, oficial e popular, sem que nenhum tenha prevalecido de fato." },
  { id: "disputa-minas-divididas", name: "A Disputa das Minas Divididas", description: "Um Mestre das Minas foi acusado de favorecer certos mineiros na distribuição de novas escavações.", outcome: "A disputa esfriou sem veredicto — o mestre seguinte simplesmente mudou o critério, sem confirmar nada sobre o anterior." },
  { id: "escandalo-conselheiro-anonimo", name: "O Escândalo do Conselheiro Anônimo", description: "Uma carta vazada revelou a opinião de um conselheiro nunca identificado publicamente.", outcome: "O Conselho nunca confirmou nem negou a autenticidade da carta." },
  { id: "crise-guarda-dividida", name: "A Crise da Guarda Dividida", description: "Disputa interna sobre quem deveria assumir o posto de Capitão da Guarda.", outcome: "Resolvida quando Roth recusou a promoção pela segunda vez, encerrando a disputa por eliminação." },
  { id: "disputa-tesouro-cartorio", name: "A Disputa do Tesouro e do Cartório", description: "Desacordo sobre o valor oficial de propriedades para fins de taxação.", outcome: "As duas instituições ainda usam métodos de avaliação diferentes, sem harmonização." },
  { id: "escandalo-convocacao-nao-explicada", name: "O Escândalo da Convocação Não Explicada", description: "A convocação urgente de um Marechal do Reino, sem motivo registrado, ainda é discutida por historiadores.", outcome: "Nunca esclarecida. Os poucos que talvez soubessem já morreram sem confirmar nada." },
];

export interface OfficialCeremony {
  id: string;
  name: string;
  description: string;
  curiosity: string;
}

export const OFFICIAL_CEREMONIES: OfficialCeremony[] = [
  { id: "ceremonia-posse-mestre-moeda", name: "Cerimônia de Posse do Mestre da Moeda", description: "Marca a entrada de um novo Mestre da Moeda no cargo.", curiosity: "Inclui um teste de pesagem às cegas, decidindo quem herda o título." },
  { id: "juramento-capitao-guarda", name: "Juramento do Capitão da Guarda", description: "Feito diante da Guarda reunida, nunca em praça pública.", curiosity: "As palavras exatas do juramento nunca foram publicadas fora da corporação." },
  { id: "selamento-decreto-real", name: "Selamento de um Decreto Real", description: "Cera derretida e selo pressionado sobre cada decreto oficial antes de sua publicação.", curiosity: "A tradição do selamento nunca foi documentada por escrito — só passada de escrivão a escrivão." },
  { id: "ceremonia-recontagem-anos", name: "Cerimônia de Recontagem de Anos", description: "Realizada pelo Observatório da Coroa em tentativas periódicas de ajustar o calendário oficial.", curiosity: "Poucos assistem — a maioria das vilas ignora o resultado de qualquer forma." },
  { id: "juramento-embaixador", name: "Juramento do Embaixador", description: "Feito antes de qualquer viagem diplomática oficial.", curiosity: "Jura representar o Reino 'sem nunca esquecer de onde veio' — frase repetida sem alteração há gerações." },
  { id: "ceremonia-abertura-arquivo-real", name: "Cerimônia de Abertura do Arquivo Real", description: "Acontece uma vez por geração, quando uma seção lacrada do Arquivo é reaberta para revisão.", curiosity: "Poucos têm permissão de entrar — nem todo Arquivista viveu pra assistir a mais de uma." },
  { id: "assinatura-registro-civil", name: "Assinatura do Registro Civil", description: "Pequena cerimônia feita pelo Escrivão em cada vila, ao registrar nascimentos, uniões ou óbitos.", curiosity: "Alguns escrivães mais antigos assinavam com símbolos, não com nome — hoje ilegíveis." },
  { id: "ceremonia-interdicao-ponte", name: "Cerimônia de Interdição de uma Ponte", description: "O Inspetor das Pontes caminha até o meio da travessia antes de declará-la oficialmente interditada.", curiosity: "Considerada, por alguns moradores, mais teatral do que necessária." },
  { id: "juramento-conselheiro-coroa", name: "Juramento do Conselheiro da Coroa", description: "Feito em particular, nunca em praça pública, ao contrário da maioria dos juramentos oficiais.", curiosity: "Ninguém fora do Conselho sabe ao certo o texto exato do juramento." },
  { id: "ceremonia-encerramento-julgamento", name: "Cerimônia de Encerramento de um Julgamento", description: "O Tribunal da Capital encerra formalmente cada julgamento com um sino específico.", curiosity: "O sino do Tribunal é distinto do sino tocado pelo Sineiro da vila, e ninguém de fora reconhece a diferença." },
];
