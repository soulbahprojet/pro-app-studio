// Configuration des frais de l'application
interface FeesConfig {
  FRAIS_APP: number;        // 1% appliqué aux clients
  FRAIS_RETRAIT: number;    // frais fixe lors du retrait
  COMMISSION_API: number;   // 2% API (modifiable selon contrat)
}

// Configuration par défaut
let config: FeesConfig = {
  FRAIS_APP: 0.01,        // 1%
  FRAIS_RETRAIT: 1000,    // 1000 GNF
  COMMISSION_API: 0.02,   // 2%
};

export function getFeesConfig(): FeesConfig {
  return { ...config };
}

export function updateFeesConfig(newConfig: Partial<FeesConfig>): FeesConfig {
  config = { ...config, ...newConfig };
  return { ...config };
}

export type { FeesConfig };