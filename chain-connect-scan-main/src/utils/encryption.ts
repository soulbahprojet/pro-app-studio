// Utilitaires de chiffrement pour la messagerie E2EE
// Implémentation simplifiée pour la démonstration

export class EncryptionService {
  private static instance: EncryptionService;
  private keyPair: CryptoKeyPair | null = null;

  private constructor() {}

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Génère une paire de clés RSA pour le chiffrement E2EE
   */
  async generateKeyPair(): Promise<CryptoKeyPair> {
    try {
      this.keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true, // extractable
        ['encrypt', 'decrypt']
      );
      return this.keyPair;
    } catch (error) {
      console.error('Erreur génération clés:', error);
      throw new Error('Impossible de générer les clés de chiffrement');
    }
  }

  /**
   * Exporte la clé publique en format PEM pour partage
   */
  async exportPublicKey(): Promise<string> {
    if (!this.keyPair) {
      await this.generateKeyPair();
    }

    try {
      const exported = await window.crypto.subtle.exportKey(
        'spki',
        this.keyPair!.publicKey
      );
      
      const exportedAsString = this.arrayBufferToBase64(exported);
      const exportedAsBase64 = btoa(exportedAsString);
      
      return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
    } catch (error) {
      console.error('Erreur export clé publique:', error);
      throw new Error('Impossible d\'exporter la clé publique');
    }
  }

  /**
   * Importe une clé publique depuis le format PEM
   */
  async importPublicKey(pemKey: string): Promise<CryptoKey> {
    try {
      const pemHeader = '-----BEGIN PUBLIC KEY-----';
      const pemFooter = '-----END PUBLIC KEY-----';
      const pemContents = pemKey.substring(
        pemHeader.length,
        pemKey.length - pemFooter.length
      ).replace(/\s/g, '');
      
      const binaryDerString = atob(pemContents);
      const binaryDer = this.stringToArrayBuffer(binaryDerString);

      return await window.crypto.subtle.importKey(
        'spki',
        binaryDer,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        true,
        ['encrypt']
      );
    } catch (error) {
      console.error('Erreur import clé publique:', error);
      throw new Error('Impossible d\'importer la clé publique');
    }
  }

  /**
   * Chiffre un message avec la clé publique du destinataire
   */
  async encryptMessage(message: string, recipientPublicKey: CryptoKey): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(message);

      const encrypted = await window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP',
        },
        recipientPublicKey,
        data
      );

      return this.arrayBufferToBase64(encrypted);
    } catch (error) {
      console.error('Erreur chiffrement message:', error);
      throw new Error('Impossible de chiffrer le message');
    }
  }

  /**
   * Déchiffre un message avec la clé privée locale
   */
  async decryptMessage(encryptedMessage: string): Promise<string> {
    if (!this.keyPair) {
      throw new Error('Aucune clé privée disponible');
    }

    try {
      const encryptedData = this.base64ToArrayBuffer(encryptedMessage);

      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: 'RSA-OAEP',
        },
        this.keyPair.privateKey,
        encryptedData
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Erreur déchiffrement message:', error);
      throw new Error('Impossible de déchiffrer le message');
    }
  }

  /**
   * Génère un hash SHA-256 pour vérification d'intégrité
   */
  async generateHash(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      return this.arrayBufferToBase64(hashBuffer);
    } catch (error) {
      console.error('Erreur génération hash:', error);
      throw new Error('Impossible de générer le hash');
    }
  }

  /**
   * Signe un message avec la clé privée pour authentification
   */
  async signMessage(message: string): Promise<string> {
    if (!this.keyPair) {
      await this.generateKeyPair();
    }

    try {
      // Génération d'une paire de clés pour signature (RSA-PSS)
      const signingKeyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-PSS',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['sign', 'verify']
      );

      const encoder = new TextEncoder();
      const data = encoder.encode(message);

      const signature = await window.crypto.subtle.sign(
        {
          name: 'RSA-PSS',
          saltLength: 32,
        },
        signingKeyPair.privateKey,
        data
      );

      return this.arrayBufferToBase64(signature);
    } catch (error) {
      console.error('Erreur signature message:', error);
      throw new Error('Impossible de signer le message');
    }
  }

  // Utilitaires de conversion
  public arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  public base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private stringToArrayBuffer(str: string): ArrayBuffer {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Génère un ID de session unique pour les conversations
   */
  generateSessionId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Chiffre les métadonnées de conversation pour audit admin
   */
  async encryptForAudit(data: any, adminPublicKey?: CryptoKey): Promise<string> {
    const jsonData = JSON.stringify(data);
    
    if (adminPublicKey) {
      return await this.encryptMessage(jsonData, adminPublicKey);
    }
    
    // Chiffrement simple pour stockage local si pas de clé admin
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonData);
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    );
    
    return this.arrayBufferToBase64(encrypted);
  }
}

// Instance singleton
export const encryptionService = EncryptionService.getInstance();

// Utilitaires pour la gestion des clés
export class KeyManager {
  private static readonly STORAGE_KEY = 'messaging_keys';

  /**
   * Sauvegarde les clés en localStorage (dev uniquement)
   */
  static async saveKeys(keyPair: CryptoKeyPair): Promise<void> {
    try {
      const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      
      const keys = {
        publicKey: encryptionService.arrayBufferToBase64(publicKey),
        privateKey: encryptionService.arrayBufferToBase64(privateKey),
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
      console.error('Erreur sauvegarde clés:', error);
    }
  }

  /**
   * Charge les clés depuis localStorage
   */
  static async loadKeys(): Promise<CryptoKeyPair | null> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const keys = JSON.parse(stored);
      
      const publicKeyBuffer = encryptionService.base64ToArrayBuffer(keys.publicKey);
      const privateKeyBuffer = encryptionService.base64ToArrayBuffer(keys.privateKey);
      
      const publicKey = await crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['encrypt']
      );
      
      const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['decrypt']
      );
      
      return { publicKey, privateKey };
    } catch (error) {
      console.error('Erreur chargement clés:', error);
      return null;
    }
  }

  /**
   * Supprime les clés stockées
   */
  static clearKeys(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}