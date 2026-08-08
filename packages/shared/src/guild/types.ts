/**
 * World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 9 — Guild System
 * prep. APENAS tipos — nenhuma tabela, nenhum serviço, nenhuma rota,
 * nenhuma lógica. O objetivo desta Fase é só "que a próxima Sprint de
 * Guild seja muito menor" (brief), documentando o contrato esperado
 * antes de qualquer implementação real.
 *
 * Decisões DELIBERADAMENTE NÃO tomadas aqui (ficam para a Sprint real de
 * Guild decidir, com o contexto completo na hora):
 *   - Se uma Guild é escopada a um único Reino ou pode ser cross-Reino
 *     (o campo `kingdom_id` abaixo assume Kingdom-scoped, espelhando
 *     Citizen/House — mas isso é uma HIPÓTESE de partida, não uma
 *     decisão travada).
 *   - Sistema de permissões por papel (aqui só um enum simples).
 *   - Como Guild interage com Kingdom Treasury (ainda não existe).
 *
 * Mesmo princípio D1 (packages/shared, puro, sem I/O) que todo domínio
 * novo desta Sprint já segue — mas aqui não há NENHUMA função, só
 * formas de dados, porque não há nenhuma regra pra implementar ainda.
 */
export type GuildRoleId = "leader" | "officer" | "member";

export interface Guild {
  id: string;
  kingdom_id: string;
  name: string;
  description: string;
  founder_character_id: string;
  created_at: string;
}

export interface GuildMember {
  id: string;
  guild_id: string;
  character_id: string;
  role: GuildRoleId;
  joined_at: string;
}

/**
 * Contrato mínimo que um serviço real de Guild precisaria implementar
 * — assinaturas apenas, sem corpo. Serve de checklist para a Sprint que
 * implementar Guild de verdade, não uma interface a ser importada por
 * código real ainda (nenhum arquivo desta Sprint implementa isto).
 */
export interface GuildServiceContract {
  createGuild(founderCharacterId: string, kingdomId: string, name: string): Guild;
  getGuild(id: string): Guild | null;
  listKingdomGuilds(kingdomId: string): Guild[];
  joinGuild(characterId: string, guildId: string): GuildMember;
  leaveGuild(characterId: string, guildId: string): void;
  listMembers(guildId: string): GuildMember[];
}
