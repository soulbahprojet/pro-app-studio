export interface VendorProfile {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  registrationNumber?: string;
  taxId?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  website?: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'incomplete';
  kycDocuments: {
    type: string;
    url: string;
    uploadedAt: Date;
    status: 'pending' | 'approved' | 'rejected';
  }[];
  rating: number;
  totalSales: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id?: string;
  size?: string;
  color?: string;
  price?: number;
  stock?: number;
  sku?: string;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  sku: string;
  price: number; // Prix en GNF
  compareAtPrice?: number;
  images: string[];
  specifications: Record<string, any>;
  tags: string[];
  isActive: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Inventory {
  id: string;
  productId: string;
  vendorId: string;
  quantityAvailable: number;
  quantityReserved: number;
  quantitySold: number;
  reorderThreshold: number;
  lastUpdated: Date;
}

export interface StockLog {
  id: string;
  productId: string;
  changeType: 'sale' | 'restock' | 'adjustment' | 'reservation' | 'return';
  quantityChange: number;
  previousQty: number;
  newQty: number;
  orderId?: string;
  userId: string;
  reason?: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  customerId: string;
  vendorId: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'ready_for_shipment' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  items: OrderItem[];
  subtotal: number;
  fees: number;
  total: number;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  internalNotes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface VendorWallet {
  id: string;
  vendorId: string;
  balance: number;
  totalEarnings: number;
  pendingAmount: number;
  lastUpdated: Date;
}

export interface PayoutRequest {
  id: string;
  vendorId: string;
  amount: number;
  netAmount: number;
  fees: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  bankDetails: {
    accountNumber: string;
    bankName: string;
    accountName: string;
  };
  processedAt?: Date;
  createdAt: Date;
}

export interface VendorTransaction {
  id: string;
  vendorId: string;
  orderId?: string;
  payoutRequestId?: string;
  type: 'sale' | 'payout' | 'fee' | 'refund';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}