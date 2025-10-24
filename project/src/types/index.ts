export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'vendor' | 'supplier' | 'client' | 'admin';
  avatar?: string;
  company?: string;
  phone?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  badges: string[];
  joinedAt: string;
  address?: Address;
  paymentMethods?: PaymentMethod[];
  preferences?: UserPreferences;
  kycStatus?: 'pending' | 'verified' | 'rejected' | 'in_progress';
  subscription?: 'free' | 'premium' | 'enterprise';
  bio?: string;
  lastLoginAt?: string;
  metadata?: Record<string, any>;
}
interface LoginFormProps {
  onSwitchToRegister: () => void;
}
interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  supplierId: string;
  vendorId?: string;
  stock: number;
  minOrder: number;
  maxOrder?: number;
  tags: string[];
  rating: number;
  reviewCount: number;
  isPromoted: boolean;
  specifications?: Record<string, string>;
  variants?: ProductVariant[];
  shippingInfo?: ShippingInfo;
  seoData?: SEOData;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface Order {
  id: string;
  orderNumber: string;
  productId: string;
  productTitle: string;
  productImage: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  commission: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: Address;
  billingAddress?: Address;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  timeline: OrderTimeline[];
  items?: OrderItem[];
  currency?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  description: string;
  location?: string;
}

export interface Address {
  id?: string;
  type?: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'mobile_money' | 'bank_transfer';
  provider: string;
  displayName: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  isDefault: boolean;
  isActive: boolean;
  isExpired: boolean;
  createdAt: string;
  icon: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'file' | 'product' | 'order';
  attachments?: MessageAttachment[];
  metadata?: Record<string, any>;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'product' | 'order';
  url: string;
  name: string;
  size?: number;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantDetails: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  type: 'direct' | 'group' | 'support';
  title?: string;
  archived?: boolean;
  conversationId: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetId: string;
  targetType: 'user' | 'product' | 'order';
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  helpful: number;
  verified: boolean;
  createdAt: string;
  response?: ReviewResponse;
}

export interface ReviewResponse {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'message' | 'review' | 'payment' | 'system' | 'marketing' | 'live_stream';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isExpired: boolean;
}

export interface ShippingInfo {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  shippingClass: string;
  freeShippingThreshold?: number;
  processingTime: string;
  carriers: string[];
}

export interface SEOData {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  slug: string;
}

export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  darkMode?: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'contacts';
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
  };
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'funnel' | 'email' | 'social' | 'ads';
  status: 'draft' | 'active' | 'paused' | 'completed';
  targetAudience: string[];
  content: any;
  metrics: CampaignMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
}

export interface SalesFunnel {
  id: string;
  name: string;
  steps: FunnelStep[];
  status: 'draft' | 'active' | 'paused';
  metrics: FunnelMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface FunnelStep {
  id: string;
  type: 'landing' | 'product' | 'upsell' | 'downsell' | 'checkout' | 'thankyou';
  name: string;
  content: any;
  nextStep?: string;
  alternativeStep?: string;
}

export interface FunnelMetrics {
  visitors: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  stepMetrics: Record<string, { visitors: number; conversions: number }>;
}

export interface LiveStream {
  id: string;
  title: string;
  description?: string;
  streamer: User;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  streamKey?: string;
  streamUrl?: string;
  playbackUrl?: string;
  thumbnail?: string;
  viewerCount: number;
  maxViewers: number;
  totalViews: number;
  revenue?: string;
  ordersCount?: number;
  settings?: any;
  tags: string[];
  isPublic: boolean;
  allowChat: boolean;
  recordStream: boolean;
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
  products: Product[];
}

export interface LiveStreamMessage {
  id: string;
  liveStreamId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: 'text' | 'emoji' | 'system' | 'product_highlight';
  metadata?: any;
  createdAt: string;
  isVisible: boolean;
}

export interface SocialShare {
  platform: 'facebook' | 'twitter' | 'instagram' | 'tiktok' | 'whatsapp' | 'email' | 'sms';
  url: string;
  title: string;
  description?: string;
  image?: string;
  utmParams?: Record<string, string>;
}

export interface KYCDocument {
  id: number;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface Shipping {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  shippedAt?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  trackingEvents?: ShippingEvent[];
}

export interface ShippingEvent {
  status: string;
  description: string;
  location?: string;
  timestamp: string;
  details?: any;
}

export interface AnalyticsEvent {
  eventType: string;
  eventName: string;
  properties?: any;
  value?: number;
  currency?: string;
  timestamp: string;
}