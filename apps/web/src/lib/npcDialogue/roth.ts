import type { NpcDialogueCatalog } from "./types";

// Sprint Living NPCs (MVP) — Sargento Roth: militar, objetivo,
// desconfiado. Fala pouco, observa muito.
export const ROTH_DIALOGUE: NpcDialogueCatalog = {
  boas_vindas: [
    "Identifique-se. Brincadeira. Só entra.",
    "Portão liberado. Siga em frente.",
    "Bem-vindo. Mantenha a calma e a distância dos lobos.",
    "Passagem autorizada. Boa sorte na estrada.",
    "Entra. Vou ficar de olho, como sempre.",
  ],
  primeiro_encontro: [
    "Nunca te vi por aqui. Isso me deixa alerta.",
    "Cara nova no portão. Vou lembrar desse rosto.",
    "Primeira vez? Fica atento. O Reino não perdoa distração.",
    "Não te conheço. Isso não é bom nem ruim. Ainda.",
    "Bem-vindo. A partir de agora, você está no meu radar.",
  ],
  novato: [
    "Novato. Cuidado lá fora, o mundo não avisa antes de atacar.",
    "Iniciante. Fica perto de grupos até aprender o terreno.",
    "Você ainda não sabe reconhecer perigo de longe. Vai aprender rápido, ou não vai aprender.",
    "Todo novato acha que vai voltar fácil. Poucos voltam fácil.",
    "Recomendo cautela. Recomendo isso a todo novato.",
  ],
  veterano: [
    "Você já sabe reconhecer perigo antes de mim, às vezes.",
    "Veterano. Passa por esse portão com mais confiança que a maioria.",
    "Já perdi a conta de quantas vezes você saiu e voltou por aqui.",
    "Experiente. Isso facilita meu trabalho de vigiar.",
    "Você aprendeu a ler o terreno. Poucos aprendem isso de verdade.",
  ],
  nivel_alto: [
    "Forte assim, você é menos risco pro Reino e mais risco pros outros.",
    "Nível alto. Ainda assim, fico de olho. Sempre fico.",
    "Poder desse tamanho exige responsabilidade. Espero que você entenda isso.",
    "Você ficou perigoso. Bom, se for pros inimigos certos.",
    "Continuo vigiando quem sai e quem volta, independente do nível.",
  ],
  boss_derrotado: [
    "Um Boss derrotado. Isso não é pouca coisa.",
    "Ouvi dizer que você encarou um Boss e venceu. Bom trabalho, aventureiro.",
    "Poucos voltam de um combate contra Boss inteiros. Você voltou.",
    "Registro isso: mais um Boss fora do caminho.",
    "Vitória contra Boss merece respeito. Tem o meu.",
  ],
  sem_gold: [
    "Sem Gold não é crime. Ainda.",
    "Bolso vazio não impede ninguém de passar por aqui.",
    "Sem dinheiro hoje. O portão continua livre mesmo assim.",
    "Isso não é da minha alçada. Segue em frente.",
    "Falta de moeda não é problema de segurança. Segue.",
  ],
  muito_gold: [
    "Muito Gold chama atenção errada. Cuidado ao sair por aí.",
    "Rico assim, vira alvo fácil lá fora. Fica esperto.",
    "Dinheiro em excesso é motivo pra roubo. Guarda bem.",
    "Vou fingir que não notei quanto Gold você carrega.",
    "Riqueza desse tamanho exige cautela redobrada na estrada.",
  ],
  chovendo: [
    "Chuva atrapalha visão. Redobro a vigilância.",
    "Dia de chuva, dia de mais atenção no portão.",
    "Chuva esconde passos. Não gosto disso.",
    "Mantenha distância da muralha molhada. Escorrega.",
    "Chuva não me tira do posto. Nada tira.",
  ],
  noite: [
    "Fico de olho em quem parte e em quem volta, principalmente de noite.",
    "Noite é quando o perigo de verdade aparece.",
    "Poucos escapam do meu aceno, de dia ou de noite.",
    "A noite exige o dobro de atenção. Sempre exigiu.",
    "Se está saindo de noite, tenha um bom motivo.",
  ],
  primeira_visita: [
    "Primeira vez nesse portão. Vou lembrar do seu rosto.",
    "Bem-vindo. A partir de agora, você está registrado, mentalmente.",
    "Nunca passou por aqui antes. Isso muda hoje.",
    "Primeira passagem. Cuidado lá fora, o mundo não avisa.",
    "Entra com atenção. Sai com mais atenção ainda.",
  ],
  visitas_repetidas: [
    "Você de novo. Já reconheço seus passos.",
    "Voltou. Bom sinal, significa que sabe se cuidar.",
    "Sua frequência por aqui não passa despercebida.",
    "Já perdi a conta de quantas vezes te vi passar por esse portão.",
    "Sempre que penso que não vou te ver de novo, aparece.",
  ],
  aleatorias: [
    "Boa sorte na estrada.",
    "Fico de olho em quem parte e em quem volta.",
    "Poucos escapam do meu aceno.",
    "Vigilância nunca é excesso, mesmo quando parece.",
    "O portão não dorme. Eu também não, muito.",
    // Sprint Social Fabric (Phase I)
    "Já caçamos lado a lado, eu e o Kade, antes dele virar mestre de arena. Ele era pior atirador do que hoje admite.",
  ],
  humor: [
    "Já confundi uma cabra com um invasor. Foi uma noite longa.",
    "Uma vez saudei o vento por engano. Ninguém precisa saber disso. Menos ainda escrever.",
    "Desconfio até de mim mesmo, às vezes.",
    "Já fiquei tão alerta que assustei um mercador só de olhar.",
    "Se eu rir, é porque algo saiu muito errado ou muito certo.",
    // Sprint Social Fabric (Phase I)
    "Já duvidei de uma história do Idris. Ele provou que eu estava errado. Não gostei, mas anotei.",
  ],
  conselhos: [
    "Nunca sai sem checar o equipamento.",
    "Confia no seu instinto quando algo parecer errado.",
    "Grupo é sempre mais seguro que solitário.",
    "Aprende o terreno antes de se aventurar longe.",
    "Volta antes do escuro, sempre que possível.",
    // Sprint Social Fabric (Phase I)
    "Se um dia essa Torre cair de verdade, quero o Borin do meu lado reconstruindo. Ninguém mais eu confiaria pra isso.",
  ],
  fofocas: [
    "Ouvi dizer que a Talia vendeu a mesma espada três vezes. Isso deveria ser investigado.",
    "Dizem que o Zoltar prevê o futuro. Prefiro não testar essa teoria.",
    "A Greta sabe de tudo antes de todo mundo. Tenho teorias sobre isso.",
    "O Dorwin desconfia de todo mundo, menos de mim. Não sei se isso é elogio.",
    "Não repito fofoca em serviço. Fora dele, às vezes.",
    // Sprint Kingdom Folk (Phase I)
    "Conheço o guarda-noturno de cada vila que já passei. Nenhum deles dorme direito. Reconheço o cansaço na cara.",
    "Um vigia de torre notou um perigo antes de qualquer patrulha minha. Não gosto de admitir, mas ele viu primeiro.",
    "Todo mensageiro que passa pelo Portão Norte, eu reviso o cavalo antes de deixar seguir. Ferrador ruim mata mais que bandido.",
    // Sprint Kingdom Government (Phase I)
    "Já recusei a promoção a Capitão da Guarda duas vezes. Prefiro proteger o Portão do que assinar papel na Capital.",
    "O Marechal do Reino ficou sem ocupante por uma geração inteira. Ninguém me avisou disso quando entrei pra Guarda. Aprendi sozinho.",
    "Hierarquia existe por motivo. Não questiono ordem que vem de cima — questiono é quem nunca aparece pra dar a ordem em pessoa.",
    // Sprint Kingdom Memories (Phase I)
    "A Defesa do Portão Norte custou metade da guarnição daquela noite. Todo guarda novo aprende esse nome antes de aprender a segurar escudo direito.",
    "Ninguém que serviu aqui antes de mim fala muito da noite da defesa. Os que falam, discordam nos detalhes. Prefiro acreditar em todos eles um pouco.",
    "Vitória cara é a que a gente comemora calado. A do Portão Norte é assim até hoje.",
    // Sprint First WOW Moment (Phase I)
    "Você ainda parece inteiro. Isso já é um ótimo começo, luvas rasgadas e tudo.",
    // Sprint StreamRPG Identity (Phase I)
    "A Torre do Portão Norte é mais velha que qualquer guarda vivo hoje. Eu só cuido dela. Não vou fingir que ela precisa de mim.",
    // Sprint StreamRPG Identity (Phase II)
    "A Arena do Kade nunca fica vazia. Nem nos dias de chuva mais forte. Isso diz mais sobre o Reino do que qualquer decreto.",
    // Sprint Place Identity (Phase I)
    "Já revistei aquele barril da praça umas três vezes. Sempre vazio. Continuo revistando, por garantia.",
    "Evito atravessar a Primeira Ponte depois do pôr do sol. Não por medo. Por hábito antigo, dos guardas antes de mim.",
    "Já mandei patrulha regular perto do Portal de Pedra da Fronteira. Nunca acharam nada. Nunca pararam de patrulhar, mesmo assim.",
  ],
  comentarios_reino: [
    "Esse Reino é mais seguro do que parece, mas não por acaso.",
    "Vigio esse portão porque acredito nesse lugar.",
    "O Reino cresce. A segurança precisa crescer junto.",
    "Já vi esse lugar passar por momentos difíceis. Continua de pé.",
    "Capital pequena, responsabilidade grande.",
  ],
  comentarios_npcs: [
    "O Borin é confiável. Testei isso mais de uma vez.",
    "A Elenya lidera com firmeza. Respeito militar por natureza.",
    "O Kade treina mais que qualquer soldado que já vi.",
    "A Miriam sabe mais sobre esse Reino do que qualquer relatório meu.",
    "O Yannick observa demais pra quem diz só estudar bichos.",
  ],
  raras: [
    "Já falhei em proteger alguém uma vez. Carrego isso até hoje.",
    "Fui soldado antes de guarda. A diferença é menor do que parece.",
    "Uma vez duvidei de uma ordem. Estava certo em duvidar.",
    "Guardo o nome de cada aventureiro que não voltou pelo portão.",
    "Já pensei em abandonar o posto. Decidi ficar, por respeito a quem depende disso.",
  ],
  extremamente_raras: [
    "Se algo me acontecer nesse portão, quero que alguém continue vigiando com o mesmo cuidado.",
    "Tenho medo de falhar em proteger esse Reino quando mais importar.",
    "Já chorei atrás desse posto, uma vez. Ninguém viu.",
    "Se um dia eu não estiver mais aqui, digam a quem passar: boa sorte na estrada.",
    "Vigio esse portão porque acredito que alguém precisa se importar com quem parte e quem volta.",
  ],
};
