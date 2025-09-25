// Types de base pour le système 224SOLUTIONS

export type UserRole = 'client' | 'seller' | 'courier' | 'transitaire' | 'admin';

export type Currency = 'GNF' | 'USD' | 'EUR' | 'XOF' | 'CNY';

export type Language = 'fr' | 'en' | 'es' | 'zh';

export interface User {
  id: string; // Format: 4+ chiffres + 2 lettres (ex: 6693JW)
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  country: string; // ISO2
  online: boolean;
  security: {
    pinSet: boolean;
    biometric: boolean;
  };
  kyc: {
    status: 'pending' | 'approved' | 'rejected';
    docType: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVER_LICENSE';
    docNumber: string;
    verifiedAt?: string;
  };
  createdAt: string;
}

export interface Wallet {
  userId: string;
  currency: Currency;
  balance: number;
  history: WalletTransaction[];
  limits: {
    p2pMax: Record<Currency, number>;
  };
}

export interface WalletTransaction {
  id: string;
  type: 'recharge' | 'transfer' | 'payout' | 'purchase' | 'commission';
  amount: number;
  fee: number;
  from?: string;
  to?: string;
  currency: Currency;
  status: 'pending' | 'completed' | 'failed';
  ts: string;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: {
    amount: number;
    currency: Currency;
  };
  stock: number;
  images: string[];
  warehouseId?: string;
  attributes: Record<string, string>;
  status: 'active' | 'draft';
  type: 'physical' | 'digital';
  digital?: {
    fileKey: string;          // clé/chemin dans storage Supabase
    fileName: string;         // nom original du fichier
    fileSize: number;         // taille en octets
    mimeType: string;         // type MIME
    downloadLimit: number;    // max téléchargements par achat
    downloadsCount: number;   // compteur global
    requiresWatermark: boolean; // watermark pour PDFs
  };
  createdAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  amounts: {
    subtotal: number;
    platformFee: number; // 1%
    totalClient: number;
    currency: Currency;
  };
  affiliate?: {
    partnerId: string;
    commission: number; // 1% de la commission plateforme
  };
  status: 'PLACED' | 'PICKED' | 'DELIVERED' | 'CANCELLED';
  escrow: {
    held: boolean;
    releasedAt?: string;
  };
  qr: {
    token: string; // 2 chiffres + 1 lettre (ex: 84K)
    payload: string;
  };
  createdAt: string;
  expiresAt: string; // +3 mois
}

export interface OrderItem {
  productId: string;
  qty: number;
  price: {
    amount: number;
    currency: Currency;
  };
}

export interface Warehouse {
  id: string;
  sellerId: string;
  name: string;
  address: {
    country: string;
    city: string;
    line1: string;
    postalCode: string;
  };
  geo: {
    lat: number;
    lng: number;
  };
  hours: {
    mon_fri: string;
    sat: string;
  };
}

export interface Courier {
  id: string; // Format: 3 chiffres + 1 lettre (ex: 731L)
  name: string;
  phone: string;
  vehicleInfo: {
    type: 'motorbike' | 'car' | 'truck';
    plate: string;
  };
  status: 'available' | 'busy' | 'offline';
  location?: {
    lat: number;
    lng: number;
  };
}

export interface VendorSubscription {
  id: string;
  sellerId: string;
  plan: 'starter' | 'pro' | 'premium';
  features: {
    maxWarehouses: number;
    maxProducts: number;
    analytics: boolean;
    paymentLinks: boolean;
    teamAccounts: boolean;
    webhooks: boolean;
  };
  validUntil: string;
}

export interface DigitalAccess {
  id: string;
  orderId: string;
  userId: string;
  productId: string;
  downloadsLeft: number;
  createdAt: string;
  expiresAt?: string;
}

export interface DownloadToken {
  userId: string;
  productId: string;
  accessId: string;
  iat: number;
  exp: number;
}

export interface DeliveryTracking {
  id: string;
  orderId: string;
  courierId: string;
  sellerId: string;
  buyerId: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  currentLocation: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  route: {
    pickup: { lat: number; lng: number; address: string };
    delivery: { lat: number; lng: number; address: string };
  };
  estimatedArrival: string;
  createdAt: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: UserRole;
  content: string;
  type: 'text' | 'location' | 'image' | 'system';
  timestamp: string;
  readBy: string[];
}

export interface Conversation {
  id: string;
  orderId: string;
  participants: {
    client: string;
    seller: string;
    courier?: string;
  };
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransfer {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  currency: Currency;
  fee: number;
  purpose: 'payment' | 'refund' | 'commission' | 'tip' | 'withdrawal';
  reference?: string; // Order ID ou autre référence
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  escrow?: {
    enabled: boolean;
    releaseCondition: 'delivery_confirmed' | 'auto_release' | 'manual';
    releaseDate?: string;
  };
  expirationId?: string; // ID unique expirant après livraison
  createdAt: string;
  completedAt?: string;
}

export interface ExpirableId {
  id: string;
  type: 'delivery' | 'payment' | 'access';
  associatedEntityId: string; // Order ID, Transfer ID, etc.
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}