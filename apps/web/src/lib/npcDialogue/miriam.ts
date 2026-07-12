import type { NpcDialogueCatalog } from "./types";

// Sprint Living NPCs (MVP) — Bibliotecária Miriam: calma, educada,
// adora conhecimento acima de quase tudo.
export const MIRIAM_DIALOGUE: NpcDialogueCatalog = {
  boas_vindas: [
    "Bem-vindo à Biblioteca. Fale baixo, por favor.",
    "Entra com calma. Os livros agradecem o silêncio.",
    "Seja bem-vindo. Aqui, cada página espera por quem souber lê-la.",
    "Bem-vindo. Sinta-se em casa entre essas estantes.",
    "Entra. Sempre há algo novo pra descobrir aqui dentro.",
  ],
  primeiro_encontro: [
    "Nunca te vi por aqui. Que bom que decidiu visitar.",
    "Uma cara nova entre os livros. Seja bem-vindo.",
    "Primeira vez na Biblioteca? Vou te mostrar por onde começar.",
    "Bem-vindo. Espero que goste tanto de ler quanto eu gosto de catalogar.",
    "Você é novo. Isso é só o começo de uma boa relação com o conhecimento.",
  ],
  novato: [
    "Novato. Todo grande leitor um dia começou sem saber por onde começar.",
    "Vá com calma. O conhecimento não tem pressa.",
    "Ainda tem muito a aprender. Isso é bonito, não é falha.",
    "Comece pelas seções mais simples. O resto vem com o tempo.",
    "Todo iniciante merece paciência. Você tem a minha.",
  ],
  veterano: [
    "Você já não precisa mais de tanta orientação minha.",
    "Veterano de leitura e de aventura, pelo visto.",
    "Já não se surpreende fácil com o que encontra aqui.",
    "Sua curiosidade amadureceu bastante desde a primeira visita.",
    "Você lê diferente agora. Com mais atenção, percebi.",
  ],
  nivel_alto: [
    "Seu poder cresceu. Espero que sua sede por conhecimento também.",
    "Nível alto e ainda visitando a Biblioteca. Isso me deixa feliz.",
    "Força sem sabedoria é incompleta. A sua parece equilibrada.",
    "Você chegou longe. Continue lendo, mesmo assim.",
    "Poder e curiosidade juntos formam alguém raro.",
  ],
  boss_derrotado: [
    "Um Boss derrotado. Isso merece um registro nos livros, um dia.",
    "Ouvi dizer que você venceu um Boss. Que história extraordinária.",
    "Vitórias assim deveriam ser escritas, para que ninguém esqueça.",
    "Você fez algo digno de página. Talvez eu escreva sobre isso.",
    "Parabéns. Poucas histórias merecem ser guardadas como essa.",
  ],
  sem_gold: [
    "Sem Gold não impede ninguém de ler aqui. Os livros são gratuitos.",
    "Conhecimento não se compra. Fico feliz em lembrar disso.",
    "Sem dinheiro hoje, mas com tempo de sobra pra ler, espero.",
    "A Biblioteca nunca cobrou por uma página sequer.",
    "Bolso vazio não é problema aqui dentro.",
  ],
  muito_gold: [
    "Muito Gold. Espero que parte disso vire livros um dia.",
    "Riqueza é boa. Riqueza de conhecimento é melhor ainda.",
    "Com esse dinheiro, talvez financie a próxima expedição de registros que eu preciso.",
    "Gold é útil. Mas nenhuma moeda compra uma boa história.",
    "Espero que use bem essa fortuna. Um livro raro, talvez?",
  ],
  chovendo: [
    "Chuva é o clima perfeito pra ler.",
    "Dias de chuva enchem a Biblioteca de visitantes.",
    "Gosto do som da chuva enquanto cataloga páginas novas.",
    "Chuva lá fora, história aqui dentro.",
    "Aproveite a chuva pra terminar aquele livro que começou.",
  ],
  noite: [
    "Trabalho até tarde catalogando o que chega à Capital.",
    "A Biblioteca de noite é o lugar mais silencioso do Reino.",
    "Prefiro ler à luz de vela. Tem algo especial nisso.",
    "Se veio de noite, sente-se, fique à vontade.",
    "A noite é generosa com quem gosta de estudar em paz.",
  ],
  primeira_visita: [
    "Primeira vez na Biblioteca. Seja muito bem-vindo.",
    "Você nunca esteve aqui? Vamos corrigir isso com calma.",
    "Primeira visita merece uma boa recomendação de leitura.",
    "Entra. Deixe-me te mostrar por onde nossos livros começam.",
    "Bem-vindo pela primeira vez. Espero que não seja a última.",
  ],
  visitas_repetidas: [
    "Você voltou. Isso me deixa muito feliz.",
    "Já é presença constante entre essas estantes.",
    "Sua curiosidade não parece ter fim. Isso é admirável.",
    "Sempre que penso nos livros que catalogo, penso em quem vai lê-los. Você, por exemplo.",
    "Voltar sempre é sinal de que algo aqui importa pra você.",
  ],
  aleatorias: [
    "Cada livro aqui espera por quem souber lê-lo.",
    "Catalogo cada página que chega à Capital, mesmo as que ainda ninguém pode abrir.",
    "O conhecimento cresce devagar, mas nunca para.",
    "Prefiro o silêncio de um bom livro a qualquer barulho da Capital.",
    "Nenhuma pergunta é boba o bastante pra não merecer resposta.",
    // Sprint Social Fabric (Phase I)
    "O Zoltar cita meus arquivos com mais frequência do que admite. Eu finjo não perceber, ele finge não saber que eu percebo.",
  ],
  humor: [
    "Uma vez catalogei o mesmo livro duas vezes. Ninguém percebeu, exceto eu, três dias depois.",
    "Já dormi aqui dentro sem perceber. Os livros são bons companheiros.",
    "Um visitante uma vez tentou ler um livro de cabeça para baixo. Não corrigi na hora.",
    "Prefiro rir baixinho. Livros não gostam de barulho.",
    "Já perdi um livro na própria Biblioteca. Levei uma semana pra achar.",
  ],
  conselhos: [
    "Leia devagar. Pressa não combina com conhecimento de verdade.",
    "Nunca ignore um livro só porque parece antigo demais.",
    "Pergunte sempre que tiver dúvida. Ninguém nasce sabendo tudo.",
    "Guarde o que aprender. Um dia isso faz diferença.",
    "Volte sempre que precisar entender algo melhor.",
    // Sprint Social Fabric (Phase I)
    "O Idris conta a mesma história de dois jeitos diferentes, dependendo do dia. Prefiro não corrigir nenhum dos dois.",
  ],
  fofocas: [
    "Ouvi dizer que a Talia vendeu a mesma espada três vezes. Prefiro não confirmar.",
    "Dizem que o Zoltar prevê o futuro através dos frascos. Interessante hipótese.",
    "A Greta sabe de tudo antes de todo mundo. Ela deveria escrever um livro.",
    "O Dorwin conta o mesmo Gold duas vezes, segundo dizem. Isso parece exaustivo.",
    "Prefiro não repetir fofocas. Prefiro histórias com mais substância.",
    // Sprint Ravens Ecosystem (Phase I)
    "Um corvo pousou na janela outro dia e ficou a tarde inteira. Não saí do lugar pra não espantar.",
    "Há um livro inteiro sobre os corvos do Reino nesta Biblioteca. Nunca conclui nada, e talvez seja assim mesmo que deva ser.",
    "Prefiro não afirmar se os corvos entendem o que lemos em voz alta aqui dentro. Mas um deles sempre parece prestar atenção.",
    // Sprint Ancient Ruins Ecosystem (Phase I)
    "Temos um diário inteiro sobre as Ruínas Esquecidas nesta Biblioteca. Treze páginas, e nenhuma conclusão. Isso me incomoda mais do que deveria.",
    "Gostaria de catalogar as Ruínas do jeito que catalogo tudo aqui. Mas não existe seção pra coisas que ninguém consegue explicar direito.",
    "Um leitor me perguntou outro dia quantas Ruínas existem de verdade. Só pude responder: 'pelo menos doze, que a gente saiba'.",
    // Sprint Kingdom Folklore (Phase I)
    "Catalogo ditado popular do jeito que catalogo livro. 'Ruína velha ensina mais que livro novo' é o único que me ofende profissionalmente.",
    "Tenho uma seção inteira só de superstição registrada. Nenhuma delas tem explicação. Todas têm gente que jura ser verdade.",
    "Diferença entre lenda e história, pra mim, é simples: uma tem data, a outra tem gente que ainda acredita mesmo sem data nenhuma.",
    // Sprint First WOW Moment (Phase I)
    "Tem um livro aqui sobre os primeiros passos de um aventureiro. A capa está tão gasta quanto as primeiras luvas de qualquer um. Combina.",
    // Sprint StreamRPG Identity (Phase I)
    "O primeiro capítulo do Bestiário sempre foi sobre os Lobos Cinzentos. Nunca mudou, nem quando todo o resto mudou.",
    "Recomendo o Tratado da Matilha pra quem quiser entender os Lobos de verdade. Não é o mais longo. É o mais honesto.",
    // Sprint Place Identity (Phase I)
    "Tem gente que deixa bilhete escondido no oco daquela árvore da praça. Já vi um, uma vez. Não li.",
    "Tenho registro de três reformas na Torre do Portão Norte. As datas nunca batem direito com o que os guardas contam.",
  ],
  comentarios_reino: [
    "Esse Reino tem mais história guardada do que qualquer um imagina.",
    "Catalogar esse Reino é catalogar gerações de gente teimosa e curiosa.",
    "Capital pequena, memória enorme.",
    "Cada geração acrescenta algo novo à história desse lugar.",
    "Gosto de pensar que essa Biblioteca guarda um pouco de cada um que já passou por aqui.",
    // Sprint History of the Kingdom (Phase I)
    "Guardo vinte cartas antigas nesta Biblioteca. Nenhuma delas conta a história inteira — juntas, ainda deixam mais buracos do que respostas.",
    "Tenho um fragmento de livro que sobreviveu a um incêndio na primeira Biblioteca. Me recuso a especular sobre o que faltava. Prefiro admitir que não sei.",
    "Um leitor me perguntou outro dia qual era a data certa da fundação da Capital. Só pude mostrar três registros que discordam entre si.",
  ],
  comentarios_npcs: [
    "O Borin nunca lê, mas conta boas histórias mesmo assim.",
    "A Talia fala tanto que eu deveria transcrever as conversas dela.",
    "A Elenya guarda mais sabedoria do que qualquer livro que já catalogei.",
    "O Yannick seria um ótimo pesquisador, se decidisse escrever mais e observar menos.",
    "O Alaric e eu discutimos sobre história com frequência. Discordamos com respeito.",
  ],
  raras: [
    "Uma vez encontrei um livro sem autor. Ainda não sei quem escreveu.",
    "Já chorei lendo um livro sozinha aqui dentro. Não foi a primeira vez.",
    "Tive uma mestra antes de mim. Ela me ensinou a amar o silêncio dos livros.",
    "Guardo um livro que nunca mostrei a ninguém. Talvez um dia mostre.",
    "Já pensei em escrever meu próprio livro. Talvez um dia eu tenha coragem.",
    // Sprint Social Fabric (Phase I)
    "O Dorwin acha que gasto Gold demais com livro. Eu acho que ele guarda Gold demais pra nada. Discutimos isso todo mês, e nenhum dos dois muda de ideia.",
  ],
  extremamente_raras: [
    "Se um dia essa Biblioteca queimar, quero acreditar que o conhecimento sobrevive nas pessoas, não só nas páginas.",
    "Tenho medo de esquecer alguma história importante entre tantas que já catalogei.",
    "Já fiquei aqui a noite inteira, sozinha, só para terminar de catalogar algo importante.",
    "Se eu não estiver mais aqui um dia, espero que alguém continue cuidando dessas páginas com o mesmo carinho.",
    "Quero que, no fim, lembrem de mim como alguém que ajudou o Reino a nunca esquecer quem foi.",
  ],
};
