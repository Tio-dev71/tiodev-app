// ============================================
// Type Definitions
// ============================================

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  slug: string;
}

export interface CheckoutFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: 'stripe' | 'vietqr';
  affiliateCode?: string;
}

export interface OrderSummary {
  subtotal: number;
  discount: number;
  discountPercent: number;
  total: number;
  affiliateCode?: string;
}

export interface AffiliateValidation {
  valid: boolean;
  code?: string;
  discountPercent?: number;
  message: string;
}

export interface VietQRData {
  qrDataURL: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  amount: number;
  description: string;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalAffiliates: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  affiliatePerformance: Array<{
    code: string;
    name: string;
    ordersCount: number;
    totalRevenue: number;
    commission: number;
  }>;
  monthlySales: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
}
