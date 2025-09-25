// Générateur d'IDs selon les spécifications 224SOLUTIONS

const COUNTRY_CODES: Record<string, string> = {
  'GN': 'GN', // Guinée
  'FR': 'FR', // France
  'US': 'US', // États-Unis
  'UK': 'UK', // Royaume-Uni
  'DE': 'DE', // Allemagne
  'ES': 'ES', // Espagne
  'CN': 'CN', // Chine
  'SN': 'SN', // Sénégal
  'ML': 'ML', // Mali
  'CI': 'CI', // Côte d'Ivoire
  'BF': 'BF', // Burkina Faso
};

/**
 * Génère un ID utilisateur: 2 lettres + 4 chiffres (selon nouvelles consignes)
 * Exemple: GN1234
 */
export function generateUserId(countryCode?: string): string {
  const letters = countryCode && COUNTRY_CODES[countryCode] 
    ? COUNTRY_CODES[countryCode] 
    : generateRandomLetters(2);
  const digits = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  
  return `${letters}${digits}`;
}

/**
 * Génère un ID livreur: 3 chiffres + 1 lettre
 * Exemple: 731L
 */
export function generateCourierId(): string {
  const digits = Math.floor(Math.random() * 900) + 100; // 100-999
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
  
  return `${digits}${letter}`;
}

/**
 * Génère un token de commande QR: 2 chiffres + 1 lettre
 * Exemple: 84K
 */
export function generateOrderToken(): string {
  const digits = Math.floor(Math.random() * 90) + 10; // 10-99
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
  
  return `${digits}${letter}`;
}

/**
 * Génère des lettres aléatoires
 */
function generateRandomLetters(count: number): string {
  let result = '';
  for (let i = 0; i < count; i++) {
    result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }
  return result;
}

/**
 * Génère un ID produit
 */
export function generateProductId(): string {
  return `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Génère un ID commande (UUID-like)
 */
export function generateOrderId(): string {
  return `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Génère un ID entrepôt
 */
export function generateWarehouseId(countryCode: string): string {
  const prefix = `WH_${countryCode}`;
  const suffix = Math.floor(Math.random() * 999) + 1;
  return `${prefix}_${suffix}`;
}

/**
 * Valide le format d'un ID utilisateur (nouveau format: 2 lettres + 4 chiffres)
 */
export function validateUserId(id: string): boolean {
  return /^[A-Z]{2}\d{4}$/.test(id);
}

/**
 * Valide le format d'un ID livreur
 */
export function validateCourierId(id: string): boolean {
  return /^\d{3}[A-Z]$/.test(id);
}

/**
 * Valide le format d'un token de commande
 */
export function validateOrderToken(token: string): boolean {
  return /^\d{2}[A-Z]$/.test(token);
}