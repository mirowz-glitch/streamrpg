// Sprint Kingdom Folklore (Phase I) — conteúdo puro sobre o folclore
// do Reino: superstições, lendas, cantigas, ditados, histórias de
// assustar criança e festas populares. Mesmo espírito de
// ravens.ts/ruins.ts/folk.ts/history.ts/government.ts: arquivo
// isolado, sem componente, sem sistema, pronto para uma Sprint futura
// decidir onde exibir.
//
// Regra central: nada aqui é confirmado. Nenhuma criatura real, nenhum
// fato histórico oficial — só o que o povo conta e em que o povo
// escolhe acreditar.
export interface FolkSuperstition {
  id: string;
  text: string;
}

// "50 superstições" — sempre um aviso curto, nunca uma explicação.
export const FOLK_SUPERSTITIONS: FolkSuperstition[] = [
  { id: "assobiar-na-floresta", text: "Nunca assobie numa floresta." },
  { id: "responder-chamado-do-rio", text: "Nunca responda um chamado vindo do rio à noite." },
  { id: "contar-moedas-tempestade", text: "Nunca conte moedas durante uma tempestade." },
  { id: "atravessar-ponte-antiga-sozinho", text: "Nunca atravesse uma ponte antiga sozinho ao amanhecer." },
  { id: "aceitar-comida-sem-sombra", text: "Nunca aceite comida de alguém sem sombra." },
  { id: "forja-aberta-lua-cheia", text: "Nunca deixe a porta da forja aberta durante a lua cheia." },
  { id: "chamar-corvo-pelo-nome", text: "Nunca chame um corvo pelo nome, mesmo que ele pareça responder." },
  { id: "cortar-lenha-anoitecer", text: "Nunca corte lenha depois do anoitecer no Bosque Sussurrante." },
  { id: "dormir-perto-de-ruina", text: "Nunca durma perto de uma ruína sem deixar uma vela acesa." },
  { id: "recusar-brinde-estranho", text: "Nunca recuse um brinde oferecido por um estranho na Taverna." },
  { id: "contar-degraus-escada-antiga", text: "Nunca conte quantos degraus tem uma escada de pedra antiga." },
  { id: "olhar-para-tras-ponte-noite", text: "Nunca olhe para trás ao atravessar uma ponte à noite." },
  { id: "sal-emprestado", text: "Nunca leve sal emprestado sem devolver em dobro." },
  { id: "faca-virada-para-cima", text: "Nunca deixe uma faca virada para cima na mesa depois do jantar." },
  { id: "assobiar-cao-desconhecido", text: "Nunca assobie para chamar um cão que você não conhece." },
  { id: "beber-agua-poco-nao-usado", text: "Nunca beba água de poço que ninguém mais usa." },
  { id: "nome-de-lobo-morto-em-casa", text: "Nunca fale o nome de um lobo morto dentro de casa." },
  { id: "varrer-casa-apos-escurecer", text: "Nunca varra a casa depois do escurecer." },
  { id: "carona-carroca-vazia", text: "Nunca aceite carona de uma carroça vazia." },
  { id: "contar-estrelas-em-voz-alta", text: "Nunca conte as estrelas em voz alta." },
  { id: "dormir-botas-viradas-porta", text: "Nunca durma com as botas viradas para a porta." },
  { id: "cortar-unhas-a-noite", text: "Nunca corte as próprias unhas à noite." },
  { id: "pao-descoberto", text: "Nunca deixe pão sem cobrir de um dia para o outro." },
  { id: "porta-batida-uma-vez", text: "Nunca responda quando alguém bate na porta só uma vez." },
  { id: "sombra-estatua-sem-rosto", text: "Nunca pise na sombra de uma estátua sem rosto." },
  { id: "mentira-perto-do-poco", text: "Nunca conte uma mentira perto de um poço." },
  { id: "flor-em-casa-antes-meio-dia", text: "Nunca leve flor para dentro de casa antes do meio-dia." },
  { id: "dormir-virado-para-o-rio", text: "Nunca durma virado para o rio." },
  { id: "roupa-emprestada-funeral", text: "Nunca use roupa emprestada num funeral." },
  { id: "tres-velas-mesma-mesa", text: "Nunca acenda três velas na mesma mesa." },
  { id: "falar-de-viagem-antes-de-sair", text: "Nunca fale sobre a viagem antes de sair de casa." },
  { id: "comprar-de-quem-regateia-baixo", text: "Nunca compre nada de quem regateia baixo demais." },
  { id: "andar-em-circulo-fogueira-apagada", text: "Nunca ande em círculo ao redor de uma fogueira apagada." },
  { id: "casa-nova-bater-tres-vezes", text: "Nunca durma numa casa nova sem antes bater três vezes na porta." },
  { id: "ultima-fatia-de-pao", text: "Nunca deixe a última fatia de pão no prato." },
  { id: "chamar-alguem-de-tras", text: "Nunca chame alguém pelo nome estando de costas para ele." },
  { id: "contar-moeda-sem-tocar-mesa", text: "Nunca passe moeda de mão em mão sem antes tocar a mesa." },
  { id: "arvore-sozinha-no-campo", text: "Nunca fique parado embaixo de uma árvore sozinha no meio do campo." },
  { id: "espelho-dentro-da-mina", text: "Nunca leve espelho para dentro de uma mina." },
  { id: "janela-aberta-territorio-de-lobo", text: "Nunca durma com a janela aberta perto de território de lobo." },
  { id: "roupa-pendurada-noite-toda", text: "Nunca deixe roupa pendurada durante a noite toda." },
  { id: "cumprimentar-viajante-sem-sombra", text: "Nunca cumprimente um viajante que não projeta sombra." },
  { id: "ultimo-gole-do-barril", text: "Nunca beba o último gole de um barril sem oferecer o primeiro brinde." },
  { id: "cantar-sozinho-estrada-vazia", text: "Nunca cante sozinho numa estrada vazia à noite." },
  { id: "consertar-ferradura-apos-por-do-sol", text: "Nunca conserte uma ferradura depois do pôr do sol." },
  { id: "presente-embrulhado-pano-preto", text: "Nunca aceite presente embrulhado em pano preto." },
  { id: "dormir-virado-para-ruina", text: "Nunca durma virado para uma ruína." },
  { id: "abrir-livro-emprestado-sem-agradecer", text: "Nunca abra um livro emprestado antes de agradecer a quem emprestou." },
  { id: "apontar-para-o-bosque-a-noite", text: "Nunca aponte para o Bosque Sussurrante depois de escurecer." },
  { id: "contar-corvos-no-mesmo-galho", text: "Nunca conte quantos corvos pousaram no mesmo galho." },

  // Sprint Place Identity (Phase I)
  { id: "moeda-na-fonte-sem-pedido", text: "Nunca jogue moeda na fonte da praça sem fazer um pedido de verdade." },
  { id: "cortar-galho-arvore-praca-sem-licenca", text: "Nunca corte um galho da árvore da praça sem pedir licença a ela primeiro." },
  { id: "chutar-barril-vazio-da-praca", text: "Nunca chute o barril vazio da praça. Alguns dizem que ele conta." },
  { id: "parado-sob-ultima-badalada", text: "Nunca fique parado embaixo do Sino da Torre na última badalada do dia." },
  { id: "mover-sozinho-bloco-portal-fronteira", text: "Nunca tente mover sozinho o bloco caído do Portal de Pedra da Fronteira." },
];

export interface FolkLegend {
  id: string;
  title: string;
  text: string;
}

// "40 lendas populares" — contadas por moradores, nunca confirmadas.
export const FOLK_LEGENDS: FolkLegend[] = [
  { id: "a-dama-da-neblina", title: "A Dama da Neblina", text: "Dizem que aparece nas margens do Pântano Podre chamando por um nome que ninguém reconhece." },
  { id: "o-cavaleiro-sem-sombra", title: "O Cavaleiro Sem Sombra", text: "Um cavaleiro que atravessa estradas à noite sem nunca projetar sombra nenhuma." },
  { id: "o-menino-do-poco", title: "O Menino do Poço", text: "Dizem que uma criança vive dentro de um poço abandonado, e responde se você chamar três vezes." },
  { id: "a-viuva-de-pedra", title: "A Viúva de Pedra", text: "Uma figura de pedra que, segundo moradores, chora à meia-noite perto de certas ruínas." },
  { id: "o-barco-fantasma-do-litoral", title: "O Barco Fantasma do Litoral", text: "Um barco visto à distância que nunca chega ao porto, nem some completamente." },
  { id: "o-velho-do-moinho", title: "O Velho do Moinho", text: "Um moleiro que, segundo dizem, nunca envelheceu, e ainda mói grão num moinho abandonado." },
  { id: "a-loba-de-prata", title: "A Loba de Prata", text: "Uma lenda mais antiga que qualquer lobo conhecido hoje, contada muito antes de qualquer variante regional." },
  { id: "o-sussurro-da-fortaleza", title: "O Sussurro da Fortaleza", text: "Vozes ouvidas dentro da Fortaleza Sombria que sabem o nome de quem escuta." },
  { id: "a-crianca-que-nunca-cresce", title: "A Criança que Nunca Cresce", text: "Vista em várias vilas ao longo de décadas, sempre com a mesma idade, segundo quem jura ter visto duas vezes." },
  { id: "o-ferreiro-fantasma", title: "O Ferreiro Fantasma", text: "Continua batendo martelo numa forja abandonada, mesmo sem fogo aceso." },
  { id: "a-serpente-das-colheitas", title: "A Serpente das Colheitas", text: "Aparece nos campos da Planície Dourada só em anos de colheita ruim." },
  { id: "o-homem-de-cinza-das-estradas", title: "O Homem de Cinza das Estradas", text: "Visto em várias estradas ao mesmo tempo, segundo quem jura ter cruzado com ele mais de uma vez no mesmo dia." },
  { id: "a-dama-do-espelho", title: "A Dama do Espelho", text: "Um espelho antigo que mostra o reflexo de quem já morreu, segundo boato de aldeia." },
  { id: "o-cao-de-tres-patas", title: "O Cão de Três Patas", text: "Visto seguindo viajantes perdidos até a estrada certa, e depois desaparece sem deixar rastro." },
  { id: "a-voz-nas-minas", title: "A Voz nas Minas", text: "Mineiros contam ouvir uma voz cantando nas galerias mais fundas, sempre a mesma melodia." },
  { id: "o-rei-sob-a-montanha", title: "O Rei Sob a Montanha", text: "Dizem que um antigo rei dorme sob os Picos Congelados, esperando ser acordado." },
  { id: "a-tecela-da-meia-noite", title: "A Tecelã da Meia-Noite", text: "Tece uma peça de pano que nunca termina, vista só em certas noites de lua cheia." },
  { id: "o-pescador-que-nunca-volta", title: "O Pescador que Nunca Volta", text: "Um barco que sai todo fim de tarde do Litoral Quebrado e nunca é visto retornando, mas nunca falta na manhã seguinte." },
  { id: "a-sombra-da-torre", title: "A Sombra da Torre", text: "Uma sombra que se move sozinha ao redor da Torre do Portão Norte." },
  { id: "o-menino-que-conta-as-estrelas", title: "O Menino que Conta as Estrelas", text: "Visto sentado nos telhados da Capital contando estrelas, sempre sozinho, nunca duas noites na mesma casa." },
  { id: "a-anciã-do-bosque", title: "A Anciã do Bosque", text: "Mora nas profundezas do Bosque Sussurrante e concede um favor a quem a encontra — mas sempre cobra algo em troca, segundo o boato." },
  { id: "o-cavalo-sem-cavaleiro", title: "O Cavalo Sem Cavaleiro", text: "Visto galopando sozinho pelas estradas, sempre na mesma direção, nunca alcançado." },
  { id: "a-danca-dos-corvos", title: "A Dança dos Corvos", text: "Uma dança circular de corvos vista raramente, dita ser sinal de aviso pra quem souber reconhecer." },
  { id: "o-fantasma-do-primeiro-guarda", title: "O Fantasma do Primeiro Guarda", text: "Vigia ainda hoje o Portão Norte, segundo os guardas mais antigos que já serviram ali." },
  { id: "a-filha-do-rio", title: "A Filha do Rio", text: "Uma figura que emerge das águas em noites de cheia, sempre pedindo ajuda que ninguém consegue dar a tempo." },
  { id: "o-contador-de-ovelhas", title: "O Contador de Ovelhas", text: "Um pastor que conta o rebanho errado de propósito, pra confundir quem tenta roubar à noite." },
  { id: "a-lenda-do-sino-duplo", title: "A Lenda do Sino Duplo", text: "Dizem que existe um segundo sino, idêntico ao da torre, escondido em algum lugar do Reino." },
  { id: "o-espantalho-que-anda", title: "O Espantalho que Anda", text: "Visto mudando de posição sozinho nos campos da Planície Dourada, sempre de noite." },
  { id: "a-dama-das-colinas", title: "A Dama das Colinas", text: "Aparece para pastores perdidos, indicando o caminho de volta, mas nunca fala uma palavra." },
  { id: "o-barqueiro-sem-rosto", title: "O Barqueiro Sem Rosto", text: "Atravessa passageiros à noite sem cobrar nada, e ninguém nunca viu o rosto dele." },
  { id: "a-crianca-do-deserto-de-vidro", title: "A Criança do Deserto de Vidro", text: "Vista caminhando pela areia vitrificada, sem deixar pegada nenhuma para trás." },
  { id: "o-guardiao-invisivel-da-ponte", title: "O Guardião Invisível da Ponte", text: "Dizem que a Primeira Ponte só permite atravessar quem tem intenção honesta." },
  { id: "a-cantora-das-ruinas", title: "A Cantora das Ruínas", text: "Uma voz feminina ouvida cantando dentro de sítios de ruínas, nunca vista por quem escuta." },
  { id: "o-cachorro-que-uiva-pro-nada", title: "O Cachorro que Uiva pro Nada", text: "Visto uivando pra direções vazias, momentos antes de algo acontecer na vila." },
  { id: "a-noiva-perdida", title: "A Noiva Perdida", text: "Vista caminhando pelas estradas em trajes de casamento antigos, procurando por alguém que nunca aparece." },
  { id: "o-homem-que-vende-sombras", title: "O Homem que Vende Sombras", text: "Um mercador ambulante que, segundo o boato, compra e vende sombras de quem estiver desesperado." },
  { id: "a-fogueira-que-nao-apaga", title: "A Fogueira que Não Apaga", text: "Vista à distância, dizem que nunca se apaga, nem em noite de chuva forte." },
  { id: "o-eco-que-responde-antes", title: "O Eco que Responde Antes", text: "Nas ruínas, um eco que parece responder perguntas antes mesmo de serem feitas em voz alta." },
  { id: "a-dama-do-trigo", title: "A Dama do Trigo", text: "Anda pelos campos da Planície Dourada nas noites de colheita, abençoando ou amaldiçoando a plantação — ninguém sabe explicar qual das duas." },
  { id: "o-ultimo-migrante", title: "O Último Migrante", text: "Dizem que ainda existe alguém andando, sozinho, terminando uma migração que todos os outros já terminaram há gerações." },
];

// "30 cantigas infantis" — algumas engraçadas, algumas assustadoras.
export interface FolkSong {
  id: string;
  title: string;
  lyrics: string;
}

export const FOLK_SONGS: FolkSong[] = [
  { id: "cantiga-corvo-cantou", title: "Corvo Cantou", lyrics: "Corvo pousou, corvo cantou,\nninguém entendeu o que ele falou." },
  { id: "cantiga-lobo-no-bosque", title: "Lobo no Bosque", lyrics: "Lobo no bosque, lua no céu,\nquem sai de noite, não é meu." },
  { id: "cantiga-poco-sem-fundo", title: "O Poço Sem Fundo", lyrics: "Um, dois, três,\nconta de novo se puder,\nquatro, cinco, seis,\no poço não tem fundo, você vai ver." },
  { id: "cantiga-padeiro-gato", title: "Padeiro e Gato", lyrics: "Padeiro assou, gato roubou,\ncorreu tão rápido que ninguém notou." },
  { id: "cantiga-fortaleza-sombria", title: "Ninguém Vai", lyrics: "Na Fortaleza Sombria, ninguém vai,\nquem entra de noite, não sai." },
  { id: "cantiga-moinho-para", title: "O Moinho Para", lyrics: "Moleiro mói, moinho para,\nquando o vento esquece de soprar." },
  { id: "cantiga-sino-duas-vezes", title: "Sino Duas Vezes", lyrics: "Ronda, ronda, guarda vai,\nse o sino tocar duas vezes, corre pro pai." },
  { id: "cantiga-sete-corvos", title: "Sete Corvos", lyrics: "Sete corvos no galho,\nse contar todos, dá trabalho." },
  { id: "cantiga-ponte-velha", title: "A Ponte Velha", lyrics: "Na ponte velha, não pare,\nsó atravesse, nunca se compare." },
  { id: "cantiga-pastora-canta", title: "Pastora Canta", lyrics: "Pastora canta, ovelha berra,\nquem se perde, não acha a terra." },
  { id: "cantiga-sapato-aqui", title: "Sapato Aqui, Sapato Lá", lyrics: "Um sapato aqui, outro lá,\nquem anda descalço, no rio vai dar." },
  { id: "cantiga-copo-bate", title: "O Copo Bate", lyrics: "Na taverna à noite, o copo bate,\nse ouvir três vezes, ninguém debate." },
  { id: "cantiga-filha-do-rio", title: "Chame Baixinho", lyrics: "Filha do rio, chame baixinho,\nse ela responder, você tá sozinho." },
  { id: "cantiga-ferreiro-bate", title: "Ferreiro Bate", lyrics: "Ferreiro bate, faísca voa,\nquem conta as batidas, não voa à toa." },
  { id: "cantiga-vento-no-bosque", title: "Vento no Bosque", lyrics: "Vento no bosque, folha no chão,\nquem assobia, ouve responder não." },
  { id: "cantiga-um-corvo-dois-corvos", title: "Um Corvo, Dois Corvos", lyrics: "Um corvo, dois corvos, três a voar,\nquatro é sorte, cinco é azar." },
  { id: "cantiga-luz-no-pantano", title: "Luz no Pântano", lyrics: "Na neblina do pântano, luz aparece,\nsiga e não siga, quem sabe o que acontece." },
  { id: "cantiga-padeira-acorda", title: "Padeira Acorda", lyrics: "Padeira acorda antes do sol,\nse cheirar o pão, já é um gol." },
  { id: "cantiga-camara-das-vozes", title: "Fale Baixinho", lyrics: "Na Câmara das Vozes, fale baixinho,\nseu eco pode não ser sozinho." },
  { id: "cantiga-cordeiro-corre", title: "Cordeiro Corre", lyrics: "Cordeiro corre, pastor apita,\nquem conta as ovelhas, nunca acerta a conta exata." },
  { id: "cantiga-areia-canta", title: "A Areia Canta", lyrics: "No Deserto de Vidro, a areia canta,\nquem escuta de perto, nunca mais se levanta." },
  { id: "cantiga-sino-da-torre", title: "Sino da Torre", lyrics: "Sino da torre, uma vez, duas,\nse tocar três, more nas dunas." },
  { id: "cantiga-loba-prateada", title: "A Loba Caça Sozinha", lyrics: "A loba prateada caça sozinha,\nquem a encontra, vira rainha... ou não volta mais pra vizinhança." },
  { id: "cantiga-carroca-vazia", title: "Carroça Vazia", lyrics: "Carroça vazia na estrada parada,\nnão suba nela, não é nada." },
  { id: "cantiga-passarinho-no-telhado", title: "Passarinho no Telhado", lyrics: "Um passarinho, dois passarinhos, três no telhado,\nquem contar todos, dorme sossegado." },
  { id: "cantiga-minas-canto", title: "Canto nas Minas", lyrics: "Nas Minas Abandonadas, ouço um canto,\nnão desço mais fundo, nem que me espanto." },
  { id: "cantiga-cheiro-de-pao", title: "Cheiro no Ar", lyrics: "Padaria fechada, cheiro no ar,\nse seguir o cheiro, vai se perder no lugar." },
  { id: "cantiga-espantalho-acena", title: "O Espantalho Acena", lyrics: "Espantalho na planície acena,\nnão acena de volta, ninguém o ensina." },
  { id: "cantiga-cesteira-tranca", title: "Cesteira Trança", lyrics: "Cesteira trança, vime enrola,\nquem desfaz o cesto, nunca mais consola." },
  { id: "cantiga-boa-noite-reino", title: "Boa Noite, Reino", lyrics: "Boa noite, Reino, boa noite, luar,\namanhã os corvos vão te acordar." },
];

export interface FolkProverb {
  id: string;
  text: string;
}

// "25 ditados populares" — originais, nunca cópias.
export const FOLK_PROVERBS: FolkProverb[] = [
  { id: "corvo-calado", text: "Corvo calado vê mais longe." },
  { id: "lobo-faminto", text: "Lobo faminto não teme neve." },
  { id: "dorme-na-estrada", text: "Quem dorme na estrada acorda sem botas." },
  { id: "ferreiro-bom-fogo-certo", text: "Ferreiro bom não tem pressa, só tem fogo certo." },
  { id: "agua-de-poco-velho", text: "Água de poço velho, sede de gente nova." },
  { id: "contar-moeda-no-escuro", text: "Quem conta moeda no escuro, perde a conta e o sono." },
  { id: "pao-de-ontem", text: "Pão de ontem enche mais barriga que promessa de amanhã." },
  { id: "ruina-nao-fala", text: "Ruína não fala, mas também não esquece." },
  { id: "casa-de-lenhador", text: "Casa de lenhador não fica sem lenha, nem sem desculpa." },
  { id: "assobiar-na-floresta-ditado", text: "Quem assobia na floresta, canta pra quem não devia ouvir." },
  { id: "moeda-gasta", text: "Moeda gasta ainda compra silêncio." },
  { id: "cao-que-late-de-longe", text: "Cão que late de longe, morde de perto raramente." },
  { id: "estrada-boa", text: "Estrada boa é a que você já conhece o fim." },
  { id: "quem-cria-corvo", text: "Quem cria corvo, aprende a dividir o pão." },
  { id: "sombra-curta", text: "Sombra curta, conversa curta." },
  { id: "vento-que-muda", text: "Vento que muda de direção, muda também de dono." },
  { id: "quem-mede-o-poco", text: "Quem mede o poço, nunca bebe da água." },
  { id: "taverna-cheia", text: "Taverna cheia, rumor mais barato que cerveja." },
  { id: "ferreiro-sem-martelo", text: "Ferreiro sem martelo é só um homem com braço forte." },
  { id: "quem-guarda-sal", text: "Quem guarda sal, guarda amizade." },
  { id: "neve-nos-picos", text: "Neve nos Picos não pergunta se você está pronto." },
  { id: "ruina-velha-ensina", text: "Ruína velha ensina mais que livro novo." },
  { id: "conta-ovelha-duas-vezes", text: "Quem conta ovelha duas vezes, perde uma de vista." },
  { id: "pescador-que-nao-erra-mare", text: "Pescador que não erra a maré, nunca aprendeu a esperar." },
  { id: "reino-que-esquece-o-povo", text: "Reino que esquece o povo, esquece também de si mesmo." },
];

export interface ScaryChildrenStory {
  id: string;
  title: string;
  text: string;
}

// "20 histórias para assustar crianças".
export const SCARY_CHILDREN_STORIES: ScaryChildrenStory[] = [
  { id: "homem-do-saco-de-pedras", title: "O Homem do Saco de Pedras", text: "Carrega um saco cheio de pedras que, dizem, na verdade são crianças que não dormiram na hora certa." },
  { id: "coisa-debaixo-da-cama", title: "A Coisa Debaixo da Cama da Estalagem", text: "Nunca sai, nunca fala, só espera quem deixa o pé de fora do cobertor." },
  { id: "corvo-que-conta-erros", title: "O Corvo que Conta os Erros", text: "Pousa na janela de quem mentiu durante o dia e grasna o número de mentiras contadas." },
  { id: "sombra-do-cabelo-despenteado", title: "A Sombra que Segue Quem Não Penteia o Cabelo", text: "Puro exagero de mãe, dizem os mais velhos, mas ninguém testa pra ter certeza." },
  { id: "lobo-dos-preguicosos", title: "O Lobo que Espera na Porta dos Preguiçosos", text: "Só aparece pra quem não termina as tarefas antes do escurecer." },
  { id: "velha-do-sotao", title: "A Velha do Sótão que Nunca Foi Vista", text: "Mora no sótão de toda casa antiga da Capital, segundo toda criança da vizinhança." },
  { id: "menino-que-contou-estrelas-demais", title: "O Menino que Foi Pego Contando Estrelas Demais", text: "Sumiu uma noite e ninguém mais ouviu falar dele." },
  { id: "mao-que-sai-do-poco", title: "A Mão que Sai do Poço", text: "Pega quem se debruça demais pra ver o próprio reflexo." },
  { id: "fantasma-do-sapato-perdido", title: "O Fantasma do Sapato Perdido", text: "Assombra quem perde as próprias botas, até encontrarem um par novo." },
  { id: "coisa-das-ruinas-esquecidas", title: "A Coisa que Mora nas Ruínas Esquecidas", text: "Espera crianças que se afastam demais dos adultos durante passeios." },
  { id: "homem-sem-rosto-das-feiras", title: "O Homem Sem Rosto das Feiras", text: "Aparece só pra quem fica na feira depois que todas as bancas fecham." },
  { id: "bruxa-do-pantano", title: "A Bruxa do Pântano que Cozinha Sapos", text: "Na verdade só cozinha sopa, dizem os adultos, mas nenhuma criança acredita." },
  { id: "cavalo-negro-meia-noite", title: "O Cavalo Negro que Relincha à Meia-Noite", text: "Quem ouve, deve fingir estar dormindo até o relincho parar." },
  { id: "coisa-que-espia-fresta-porta", title: "A Coisa que Espia pela Fresta da Porta", text: "Só aparece se a porta ficar entreaberta durante a noite." },
  { id: "ferreiro-que-forja-pesadelos", title: "O Ferreiro que Forja Pesadelos", text: "Usa o martelo errado durante a noite, dizem, e cada batida vira um pesadelo novo." },
  { id: "menina-de-vestido-molhado", title: "A Menina de Vestido Molhado", text: "Pede carona na estrada em noites de chuva, mas nunca chega a lugar nenhum com quem a leva." },
  { id: "o-que-vive-atras-do-espelho", title: "O Que Vive Atrás do Espelho", text: "Imita quem se olha por tempo demais." },
  { id: "coisa-que-conta-os-dedos-dos-pes", title: "A Coisa que Conta os Dedos dos Pés", text: "Enquanto você dorme, pra ver se sobrou algum de fora do cobertor." },
  { id: "homem-da-lanterna-sem-chama", title: "O Homem da Lanterna Sem Chama", text: "Anda pelas estradas à noite carregando uma lanterna apagada, procurando quem se perdeu." },
  { id: "voz-que-chama-seu-nome-no-escuro", title: "A Voz que Chama pelo Seu Nome no Escuro", text: "Nunca responda, dizem, porque ela só sabe o seu nome se você disser primeiro." },
];

export interface FolkFestival {
  id: string;
  name: string;
  description: string;
}

// "15 festas populares" — não religiosas: colheita, inverno,
// pescadores, viajantes.
export const FOLK_FESTIVALS: FolkFestival[] = [
  { id: "festa-da-primeira-colheita", name: "Festa da Primeira Colheita", description: "Celebra a primeira colheita de grãos da estação na Planície Dourada." },
  { id: "festival-do-ultimo-feno", name: "Festival do Último Feno", description: "Marca o fim da temporada de colheita, com fogueiras e comida compartilhada entre vizinhos." },
  { id: "noite-do-fogo-de-inverno", name: "Noite do Fogo de Inverno", description: "Celebrada na véspera do inverno mais frio, com fogueiras acesas em toda vila do Reino." },
  { id: "festival-do-gelo-rachado", name: "Festival do Gelo Rachado", description: "Comemora o degelo dos rios perto dos Picos Congelados, sinal de que as estradas reabrem." },
  { id: "festa-do-primeiro-peixe", name: "Festa do Primeiro Peixe", description: "Celebrada pelos pescadores do Litoral Quebrado a cada nova estação de pesca." },
  { id: "noite-das-redes-cheias", name: "Noite das Redes Cheias", description: "Festa dos pescadores ao final de uma boa temporada, com dança na praia até tarde." },
  { id: "feira-dos-viajantes", name: "Feira dos Viajantes", description: "Reúne mercadores e viajantes de toda região numa única grande feira anual." },
  { id: "festival-das-historias", name: "Festival das Histórias", description: "Noite dedicada só a contar histórias, liderada por contadores ambulantes de passagem." },
  { id: "festa-da-chegada", name: "Festa da Chegada", description: "Celebra a chegada de qualquer grande caravana à Capital, com comida e música na praça." },
  { id: "noite-dos-corvos", name: "Noite dos Corvos", description: "Celebração regional, principalmente perto do Bosque Sussurrante, em respeito aos corvos que 'guardam a floresta'." },
  { id: "festival-da-matilha", name: "Festival da Matilha", description: "Celebrado por caçadores do Bosque Sussurrante, marcando o início e o fim da temporada de caça." },
  { id: "festa-da-agua-nova", name: "Festa da Água Nova", description: "Celebra a abertura de um novo poço público, com toda a vila participando da primeira água tirada." },
  { id: "noite-da-fogueira-alta", name: "Noite da Fogueira Alta", description: "Competição amistosa entre vilas para ver qual fogueira de inverno queima mais alto." },
  { id: "festival-da-colheita-do-mel", name: "Festival da Colheita do Mel", description: "Celebrado por apicultores da Planície Dourada, com degustação do mel mais novo da estação." },
  { id: "feira-de-troca-de-inverno", name: "Feira de Troca de Inverno", description: "Evento onde moradores trocam objetos, roupas e ferramentas antes do inverno mais rigoroso." },
];
