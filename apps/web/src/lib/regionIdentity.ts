// Sprint Regional Expedition Identity Phase I — camada central, sem
// estado, sem persistência, sem backend: "qual sensação esta região
// transmite durante uma expedição?". Sempre UMA frase fixa por região
// (mesmo espírito de landmarkIdentity.ts: uma assinatura permanente,
// nunca sorteada, nunca por dia), complementar a Expedition Evolution/
// Expedition Journey (que respondem por STATUS/PROGRESSO, nunca por
// REGIÃO) — mais uma linha no mesmo bloco de história, nunca substitui
// nenhuma das outras.
//
// REQUISITO OBRIGATÓRIO — RegionGallery.tsx (lib/regions.ts + lib/
// knowledgeLinks.ts's getRegionKnowledge) auditados ANTES de qualquer
// linha: `RegionGallery` já usa `REGIONS` (11 regiões reais, cada uma
// com `description` — a frase-sensação oficial, ex.: "Isto é seguro o
// bastante pra eu explorar sem medo..." — e `theme`, ex.: "Curiosidade
// tranquila") e `getRegionKnowledge` (Histórias/Ruínas por região).
// REUTILIZADO diretamente: nenhuma lista de regiões nova, chaveado
// pelo mesmo `region.name` já usado em toda a UI. NUNCA reutilizado
// como TEXTO: `description`/`theme` já SÃO a identidade oficial da
// região (mostrada em RegionGallery/Landing Page) — repeti-los aqui
// seria a duplicação exata que o brief proíbe ("Não repetir a
// descrição oficial da região"). Cada frase abaixo foi escrita como um
// ângulo DIFERENTE, verificado 1 a 1 contra `description`/`theme` de
// cada uma das 11 regiões (lib/regions.ts) pra garantir zero
// duplicação de texto.
// - Environmental Storytelling/World Presence: camadas de LUGAR
//   (prédios da Cidade), nunca de REGIÃO — não têm entrada para
//   nenhuma das 11 regiões, logo nenhuma sobreposição possível.
// - Creature Ecology: opera por CRIATURA individual, nunca por região
//   como um todo — granularidade diferente, sem sobreposição.
// - Expedition Evolution/Expedition Journey: respondem por STATUS
//   discreto e por PROGRESSO contínuo da jornada inteira,
//   respectivamente — nunca por região. As três camadas (Evolution/
//   Journey/Region Identity) são eixos ortogonais entre si, por
//   design, e todas coexistem como linhas complementares no mesmo
//   bloco de história.
const REGION_IDENTITY: Record<string, string> = {
  "Porto do Amanhecer": "Aqui, cada passo ainda parece familiar.",
  "Bosque Sussurrante": "A vegetação parece esconder mais do que revela.",
  "Pântano Podre": "A paisagem muda sem que ninguém perceba.",
  "Colinas Áridas": "Não há onde se esconder por muito tempo.",
  "Planície Dourada": "Tudo aqui parece calmo demais para ser verdade.",
  "Minas Abandonadas": "As paredes parecem mais próximas a cada passo.",
  "Litoral Quebrado": "O horizonte nunca parece terminar.",
  "Picos Congelados": "O silêncio pesa mais do que o vento.",
  "Deserto de Vidro": "Cada passo parece mais longo que o anterior.",
  "Ruínas Esquecidas": "As pedras parecem observar quem passa.",
  "Fortaleza Sombria": "Cada passo aqui parece o último antes de algo maior.",
};

// Pura: mesma entrada, mesma saída, sempre. `regionName` vem direto dos
// campos reais já existentes (ExpeditionResponse.current_region_name /
// ExpeditionCompact.region_name) — nunca um id novo, nunca uma segunda
// fonte de nomes de região.
export function getRegionIdentityLine(regionName: string): string | null {
  return REGION_IDENTITY[regionName] ?? null;
}
