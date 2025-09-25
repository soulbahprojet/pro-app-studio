import { getFeesConfig } from "./feesConfig";

/**
 * Calcul montant payé par client (achat/service)
 * @param montant - montant initial de l'achat/service
 */
export function calculClient(montant: number): number {
  const config = getFeesConfig();
  return Math.round(montant * (1 + config.FRAIS_APP + config.COMMISSION_API));
}

/**
 * Calcul montant net après retrait (livreur, vendeur, affilié, client)
 * @param montant - montant demandé au retrait
 */
export function calculRetrait(montant: number): number {
  const config = getFeesConfig();
  const fraisApi = montant * config.COMMISSION_API;
  return Math.round(montant - config.FRAIS_RETRAIT - fraisApi);
}

export type CalculationType = "client" | "livreur" | "vendeur" | "affilie" | "client_retrait";