/**
 * RandomProviderImpl — Sprint D3
 *
 * Implementação concreta de RandomProvider.
 *
 * Encapsula Math.random() atrás da interface já definida em
 * engine/types.ts desde o M-003. Nenhuma lógica além disso — os
 * sistemas que recebem esta implementação por injeção não sabem
 * (nem precisam saber) que por baixo é Math.random().
 */
import type { RandomProvider } from "../engine/types.js";

export class RandomProviderImpl implements RandomProvider {
  next(): number {
    return Math.random();
  }
}
