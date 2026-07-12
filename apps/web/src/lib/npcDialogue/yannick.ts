import type { NpcDialogueCatalog } from "./types";

// Sprint Living NPCs (MVP) — Erudito Yannick: curioso, científico,
// observador. Vê o Reino como um grande objeto de estudo.
export const YANNICK_DIALOGUE: NpcDialogueCatalog = {
  boas_vindas: [
    "Bem-vindo ao Bestiário. Cuidado onde pisa, tenho amostras espalhadas.",
    "Entra. Estava justamente observando um comportamento interessante.",
    "Seja bem-vindo. Tudo aqui é motivo de estudo, inclusive você.",
    "Bem-vindo. Espero que não se importe com o cheiro de ervas secas.",
    "Entra com calma. Alguns registros ainda estão sendo catalogados.",
  ],
  primeiro_encontro: [
    "Cara nova. Interessante, vou anotar suas reações.",
    "Nunca te vi por aqui. Isso já é um dado relevante.",
    "Primeira vez no Bestiário? Vamos ver o que desperta sua curiosidade.",
    "Bem-vindo. Todo visitante novo é uma oportunidade de observação.",
    "Você é novo. Vou registrar isso, se não se importa.",
  ],
  novato: [
    "Novato. Curioso ver como você reage ao desconhecido.",
    "Ainda não sabe reconhecer os sinais que uma criatura dá antes de atacar. Vai aprender.",
    "Todo iniciante observa pouco e reage rápido demais. Tente o contrário.",
    "Você tem muito a descobrir. Isso é empolgante, do ponto de vista científico.",
    "Iniciante que observa antes de agir sobrevive mais. Anota isso.",
  ],
  veterano: [
    "Você já reconhece padrões que a maioria não vê.",
    "Veterano. Sua forma de observar o mundo mudou bastante.",
    "Já não reage por impulso como antes. Isso é crescimento real.",
    "Experiente o bastante pra fazer boas perguntas, não só respostas.",
    "Você virou um bom objeto de estudo, no melhor sentido possível.",
  ],
  nivel_alto: [
    "Seu poder cresceu de um jeito que vale a pena documentar.",
    "Nível alto. Curioso como isso muda o comportamento de uma pessoa.",
    "Forte assim, você se tornou uma variável interessante nesse Reino.",
    "Gostaria de estudar como você chegou a esse nível de poder.",
    "Poder desse tamanho desperta minha curiosidade científica.",
  ],
  boss_derrotado: [
    "Um Boss derrotado. Isso precisa ser documentado com detalhes.",
    "Ouvi dizer que você venceu um Boss. Poderia descrever o comportamento dele antes da queda?",
    "Vitórias assim geram dados valiosos sobre criaturas raras.",
    "Você presenciou algo que poucos estudiosos verão de perto.",
    "Parabéns. E, se possível, me conte tudo que observou durante o combate.",
  ],
  sem_gold: [
    "Sem Gold não impede observação nenhuma.",
    "Bolso vazio, mente cheia de perguntas, espero.",
    "Sem dinheiro hoje. A curiosidade continua de graça.",
    "Isso não afeta meus estudos. Fica à vontade.",
    "Falta de moeda é dado irrelevante pra minha pesquisa.",
  ],
  muito_gold: [
    "Muito Gold. Interessante como isso muda o comportamento das pessoas.",
    "Rico assim, você poderia financiar uma expedição de pesquisa.",
    "Dinheiro não é meu campo de estudo, mas admito que ajuda.",
    "Gold em excesso é um fenômeno social curioso, por si só.",
    "Espero que use parte disso pra apoiar pesquisas importantes. As minhas, por exemplo.",
  ],
  chovendo: [
    "Chuva muda o comportamento de várias criaturas. Adoro observar isso.",
    "Dia de chuva é dia perfeito pra estudar padrões de migração.",
    "Chovendo assim, algumas espécies saem mais, outras se escondem.",
    "A chuva revela comportamentos que o sol esconde.",
    "Aproveito dias assim pra revisar minhas anotações de campo.",
  ],
  noite: [
    "A noite revela criaturas que o dia esconde. Fascinante.",
    "Trabalho melhor à noite, quando o Reino também muda de comportamento.",
    "Passei mais noites observando covis do que dormindo em uma cama de verdade.",
    "Se veio de noite, talvez tenha visto algo que vale a pena registrar.",
    "A escuridão não me assusta. Só me dá mais para observar.",
  ],
  primeira_visita: [
    "Primeira vez no Bestiário. Sinta-se à vontade pra explorar.",
    "Bem-vindo pela primeira vez. Cada visitante novo traz uma pergunta diferente.",
    "Você nunca esteve aqui. O que despertou sua curiosidade hoje?",
    "Primeira visita é sempre a mais cheia de perguntas.",
    "Entra. Deixe-me te mostrar o que já documentamos até agora.",
  ],
  visitas_repetidas: [
    "Você de novo. Sua curiosidade parece constante.",
    "Voltou. Isso já é um padrão de comportamento interessante.",
    "Já é visitante frequente. Vou incluir isso nas minhas notas.",
    "Cada retorno seu traz uma pergunta nova. Aprecio isso.",
    "Sempre que penso ter visto tudo que você tinha pra perguntar, aparece algo novo.",
  ],
  aleatorias: [
    "Toda criatura tem um comportamento. A maioria de nós só nunca ficou tempo suficiente pra ver.",
    "Um peixe elétrico não sabe o que é eletricidade. Um dragão não sabe que solta magia. Ele apenas vive.",
    "Cada nova espécie que descubro me faz perceber o quanto ainda não sei.",
    "Prefiro perguntas sem resposta a respostas sem pergunta.",
    "O Reino é maior do que qualquer catálogo pode registrar.",
    // Sprint Social Fabric (Phase I)
    "Já viajamos juntos, eu e o Idris, atrás de uma expedição que ninguém mais quis fazer. Ele queria voltar inteiro. Eu queria anotar tudo. Os dois conseguimos, por pouco.",
  ],
  humor: [
    "Uma vez me disfarcei de arbusto pra observar uma criatura. Funcionou bem demais.",
    "Já fui confundido com uma estátua de tanto ficar parado observando.",
    "Um lobo uma vez me observou observando ele. Empate técnico.",
    "Já anotei o comportamento errado numa página certa. Foi uma bagunça acadêmica e tanto.",
    "Rio pouco, mas quando uma criatura faz algo inesperado, eu rio sozinho, tarde da noite.",
    // Sprint Social Fabric (Phase I)
    "O Zoltar acha que previsão é ciência. Eu acho que é sorte com roupa nova. Discutimos isso toda semana, e nenhum dos dois cede.",
  ],
  conselhos: [
    "Observe antes de agir. Isso salva vidas.",
    "Nenhuma criatura ataca sem motivo. Entenda o motivo primeiro.",
    "Anote o que aprender. A memória falha, o papel não.",
    "Nunca subestime uma criatura só porque parece pequena.",
    "Curiosidade é uma ferramenta tão útil quanto qualquer espada.",
    // Sprint Social Fabric (Phase I)
    "O Roth me deixa passar pelo Portão Norte sem revistar minhas amostras, mesmo desconfiando um pouco do que carrego. Isso é respeito, do jeito dele.",
  ],
  fofocas: [
    "Ouvi dizer que a Talia vendeu a mesma espada três vezes. Comportamento comercial curioso.",
    "Dizem que o Zoltar prevê o futuro através dos frascos. Adoraria estudar essa metodologia.",
    "A Greta sabe de tudo antes de todo mundo. Isso merece investigação séria.",
    "O Borin fala sozinho na forja, segundo consta. Comportamento comum sob estresse repetitivo.",
    "Prefiro dados a fofoca, mas admito que esta é interessante.",
    // Sprint Wolves Ecosystem (Phase I)
    "Tenho um caderno só de rastros de lobo, catalogados por tamanho da pegada. Ainda incompleto.",
    "Nunca confirmei se as presas do lobo dos Picos realmente brilham, ou se é só a neve. Sigo tentando.",
    "Dedicaria anos só pra entender por que uma noite inteira, há muito tempo, nenhum lobo uivou no Bosque.",
    // Sprint Ravens Ecosystem (Phase I)
    "Tenho um caderno inteiro só sobre o comportamento dos corvos. Ainda incompleto.",
    "Nunca resolvi se os corvos entendem o que dizemos. Prefiro deixar a pergunta em aberto do que inventar uma resposta.",
    "Um corvo parece saber, antes de qualquer caçador, onde a matilha de lobos vai atacar. Ainda não sei explicar como.",
    // Sprint Ancient Ruins Ecosystem (Phase I)
    "Medi a profundidade do poço seco do Deserto de Vidro três vezes. Três resultados diferentes. Vou medir de novo.",
    "Os símbolos do penhasco nos Picos Congelados não batem com meu esboço da primeira visita. Prefiro achar que errei eu, não que mudaram.",
    "Adoraria catalogar as doze Ruínas Antigas com o mesmo rigor que catalogo criaturas. Ainda não encontrei um método que funcione com pedra que não se explica.",
    // Sprint First WOW Moment (Phase I)
    "Estudei o desgaste de umas luvas rasgadas outro dia. Cientificamente, deveriam ter se desfeito há semanas.",
    // Sprint StreamRPG Identity (Phase I)
    "O Bosque Sussurrante continua sendo o lugar que mais estudo, depois de todos esses anos. Sempre acho algo que não tinha visto antes.",
    // Sprint StreamRPG Identity (Phase II)
    "O Corvo Ancião nunca me deixou perto o bastante pra estudar de verdade. Isso, sozinho, já vira uma nota de campo interessante.",
    "Entre a Loba Prateada e o Lobo Marcado, aposto que um dia vão provar ser a mesma linhagem. Ainda não tenho como provar. Ainda.",
    // Sprint Place Identity (Phase I)
    "Levei um instrumento de medição pra Câmara das Vozes, uma vez. Ele registrou um som que eu não consegui ouvir.",
  ],
  comentarios_reino: [
    "Esse Reino tem uma biodiversidade fascinante ao redor.",
    "Cada região desse Reino guarda espécies que ainda não documentei completamente.",
    "O Reino cresce, e as criaturas ao redor se adaptam a isso.",
    "Vivemos cercados de mistérios que a maioria nunca para pra observar.",
    "Esse lugar merece décadas de estudo, não anos.",
    // Sprint History of the Kingdom (Phase I)
    "A Grande Migração me interessa tanto quanto qualquer criatura que já estudei. Motivo nunca esclarecido, efeito visível até hoje.",
    "Tenho quinze diários antigos catalogados. Nenhum conta a história completa de nada — juntos, formam só um mosaico incompleto.",
    "Adoraria aplicar o mesmo rigor às Eras do Reino que aplico ao Bestiário. O problema é que pedra e papel velho não respondem perguntas como criatura viva.",
  ],
  comentarios_npcs: [
    "O Borin entende de metal como eu entendo de comportamento animal.",
    "A Miriam catalogaria minhas descobertas melhor do que eu mesmo.",
    "A Elenya observa pessoas como eu observo criaturas. Somos parecidos, de um jeito.",
    "O Kade treina o corpo. Eu treino a observação. Métodos diferentes, disciplina parecida.",
    "O Alaric estuda o passado. Eu estudo o que ainda se move. Combinamos bem, às vezes.",
  ],
  raras: [
    "Uma vez segui uma criatura por três dias sem dormir. Valeu a pena.",
    "Já fui atacado documentando um comportamento perigoso demais. Aprendi a manter distância depois.",
    "Tive um mentor que me ensinou a nunca parar de perguntar por quê.",
    "Guardo um registro que nunca publiquei, por medo de não ser acreditado.",
    "Já pensei em desistir de estudar criaturas perigosas. A curiosidade venceu.",
  ],
  extremamente_raras: [
    "Tenho medo de morrer antes de documentar tudo que esse Reino ainda esconde.",
    "Se um dia eu desaparecer, procurem meus registros. Estará tudo lá, cuidadosamente anotado.",
    "Já chorei vendo uma criatura rara morrer sem que eu pudesse fazer nada.",
    "Quero que, no fim, o Reino lembre que cada criatura, por menor que seja, merece ser entendida antes de temida.",
    "Se esse Bestiário sobreviver a mim, quero que continue crescendo com a mesma curiosidade que eu tive.",
  ],
};
