# Auditoria da Jornada — exposição real ao roll de MiniBoss (Ruínas Esquecidas)

Amostra: 500 Dungeons (runDungeonSimulation, seedBase=1, mesmo Simulador já validado nas Sprints anteriores).

- Execuções que alcançaram Ruínas Esquecidas: 398/500
- Ticks em Ruínas Esquecidas — média: 404.5, mediana: 440, p10: 430, p90: 447
- Chefe Final realmente encontrado: 26/500 (5.20%)
- Chance nominal de miniBoss por tick (encounterTables.ts): 35%
- Chegadas esperadas SE a chance nominal se aplicasse independentemente a cada tick real de exposição (soma de 1-(1-p)^ticks por execução): 394.9 de 500
- Razão observado/esperado (dado a exposição real medida): 6.6%

Distribuição de ticks em Ruínas Esquecidas (primeiras 30 execuções que a alcançaram):
446, 20, 446, 441, 439, 440, 444, 443, 442, 439, 443, 440, 19, 433, 446, 437, 442, 440, 436, 443, 440, 444, 448, 451, 442, 433, 444, 442, 435, 438