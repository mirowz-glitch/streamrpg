/**
 * World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 7 — Notificações
 * pessoais, inteiramente internas (nunca Discord/Twitch/e-mail) —
 * distinto do Activity Feed (público, mundial) e do Jornal do Reino
 * (narrado): uma notificação é SEMPRE endereçada a um personagem
 * específico, sobre algo que aconteceu com ELE.
 *
 * Só dois gatilhos REAIS existem nesta Sprint — Merchant (venda) e
 * Blacksmith (melhoria) — ambos já domínios completos com um ponto de
 * sucesso único. Os outros exemplos do brief ("casa taxada", "Reino
 * perdeu liderança", "anúncio expirou") não têm mecânica real por trás
 * ainda (Kingdom Treasury/impostos e troca de liderança são Sprints
 * futuras deliberadamente adiadas, expiração automática de anúncio
 * nunca foi implementada em Real Estate Phase I) — documentado em vez
 * de fabricado (ver Fase 7 do relatório de entrega).
 */
export interface Notification {
  id: string;
  icon: string;
  text: string;
  timestamp: number;
  read: boolean;
}

const MAX_PER_CHARACTER = 20;

const notificationsByCharacter = new Map<string, Notification[]>();
let seq = 0;

export function pushNotification(characterId: string, icon: string, text: string, timestamp: number = Date.now()): void {
  seq += 1;
  const list = notificationsByCharacter.get(characterId) ?? [];
  list.push({ id: `notif-${seq}`, icon, text, timestamp, read: false });
  notificationsByCharacter.set(characterId, list.length > MAX_PER_CHARACTER ? list.slice(-MAX_PER_CHARACTER) : list);
}

/** Mais recentes primeiro. Leitura não-destrutiva — permanece até `dismissNotifications()`. */
export function getNotifications(characterId: string): Notification[] {
  return [...(notificationsByCharacter.get(characterId) ?? [])].reverse();
}

export function dismissNotifications(characterId: string): void {
  notificationsByCharacter.set(characterId, []);
}
