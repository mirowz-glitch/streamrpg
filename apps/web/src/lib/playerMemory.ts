// Sprint Reactive Layer Foundation — primitiva genérica de "memória do
// jogador": localStorage + evento próprio de mudança. É o mesmo
// mecanismo que já existia, só que embutido só dentro de
// lib/onboarding.ts; generalizado aqui para qualquer chave de storage,
// não só flags de onboarding. onboarding.ts agora delega pra cá (mesmas
// chaves, mesmo comportamento) em vez de duplicar a lógica, e qualquer
// sistema futuro (Hidden Objects, livros lidos, regiões visitadas) pode
// reaproveitar sem reescrever storage+evento do zero.
export const PLAYER_MEMORY_EVENT = "streamrpg:player-memory";

export function hasRemembered(key: string): boolean {
  return localStorage.getItem(key) === "1";
}

export function remember(key: string): void {
  localStorage.setItem(key, "1");
  window.dispatchEvent(new Event(PLAYER_MEMORY_EVENT));
}
