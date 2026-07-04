// Sprint Performance Optimization — comparação rasa via JSON, usada só
// para decidir se um poll trouxe dado realmente novo antes de chamar
// setState. Não muda nenhum dado, só evita re-renderizações quando o
// resultado é idêntico ao anterior (comum entre polls consecutivos,
// já que o backend só muda estado a cada world.tick).
export function isSameData<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
