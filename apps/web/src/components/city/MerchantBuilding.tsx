import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";

interface MerchantBuildingProps {
  // City Foundation Phase I — Fase 4 ("Sugestões Inteligentes"): texto
  // já pronto vindo de CityPage (citySuggestions.merchant,
  // apps/web/src/lib/citySuggestions.ts) — este componente nunca decide
  // sozinho quando mostrar, só exibe o que já foi calculado a partir do
  // Estado Global.
  suggestion?: string | null;
}

// Sprint Capital City — componente próprio, preparado para a loja real
// (Marketplace) numa Sprint futura; hoje só apresentação, nenhum
// catálogo, nenhuma compra/venda. Sprint NPCs Vivos — Talia apresenta o
// prédio.
//
// City Foundation Phase I — Fase 3 ("Papéis dos Prédios"): o Mercador
// precisa comunicar sua função mesmo bloqueado — "compra; venda;
// avaliação de itens".
//
// Fase 8 ("Preparação para Economia") — nenhuma regra implementada
// aqui, só a documentação da dependência futura: comprar/vender vão
// depender do sistema de Ouro (ver docs/design/gold-architecture-phase1.md);
// "avaliação" (mostrar o valor de um item, sem transação) pode
// permanecer gratuita, já que é só leitura.
export function MerchantBuilding({ suggestion = null }: MerchantBuildingProps) {
  return (
    <section className="city-building-screen">
      <h2>🛒 Mercador</h2>
      <NpcIntro npc={NPCS.mercador} />
      <p className="city-building-role">Responsável por: compra; venda; avaliação de itens.</p>
      <p className="city-building-banner">Loja fechada</p>
      <p className="hint">Novas mercadorias chegam em breve.</p>
      {suggestion ? <p className="city-building-suggestion">{suggestion}</p> : null}
    </section>
  );
}
