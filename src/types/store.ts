export type ProductCategory =
  | 'Fashion'
  | 'Mobiles'
  | 'Beauty'
  | 'Electronics'
  | 'Home';

export interface ProductVariant {
  id: string;
  label: string;
  swatchHex?: string;
  price: number;
  mrp: number;
  stock: number;
}

export type ReviewSortMode = 'helpful' | 'latest' | 'positive' | 'negative';

export interface ProductSpecItem {
  label: string;
  value: string;
  fullWidth?: boolean;
}

export interface RatingAspect {
  id: string;
  label: string;
  rating: number;
  ratingsCount: number;
  breakdown: [number, number, number, number, number]; // [5★, 4★, 3★, 2★, 1★]
}

export interface WarrantyInfo {
  summary: string;
  serviceType: string;
  covered: string;
  notCovered: string;
}

export interface ManufacturerInfo {
  manufacturer: string;
  packer: string;
  countryOfOrigin: string;
  genericName: string;
  netQuantity: string;
}

export interface ProductReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  timestamp?: number;
  title: string;
  comment: string;
  reviewFor?: string;
  helpfulCount?: number;
  notHelpfulCount?: number;
  photos?: string[];
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  fullTitle?: string;
  brand: string;
  modelNumber?: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  image: string;
  images?: string[];
  galleryCaptions: string[];
  rating: number;
  reviewCount: number;
  writtenReviewCount?: number;
  ratingBreakdown?: [number, number, number, number, number];
  ratingAspects?: RatingAspect[];
  tag?: string;
  assured?: boolean;
  codAvailable?: boolean;
  deliveryDays: number;
  warranty: string;
  warrantyInfo?: WarrantyInfo;
  manufacturerInfo?: ManufacturerInfo;
  highlightPairs?: Array<{ label: string; value: string }>;
  highlights: string[];
  specs: ProductSpecItem[];
  variants: ProductVariant[];
  reviews: ProductReview[];
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  fullTitle?: string;
  brand: string;
  variantLabel: string;
  image: string;
  assured?: boolean;
  price: number;
  mrp: number;
  quantity: number;
}

export interface Coupon {
  code: string;
  description: string;
  type: 'percent' | 'flat';
  value: number;
  minSubtotal: number;
  maxDiscount?: number;
}

export interface PriceBreakdown {
  itemCount: number;
  mrpTotal: number;
  subtotal: number;
  festiveSavings: number;
  couponDiscount: number;
  appliedCoupon: Coupon | null;
  shippingFee: number;
  freeShippingThreshold: number;
  grandTotal: number;
  totalSavings: number;
}

export interface PincodeResult {
  valid: boolean;
  pincode: string;
  region?: string;
  estimatedDays?: number;
  estimatedDateLabel?: string;
  codAvailable?: boolean;
  message: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  pincode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  addressType: 'Home' | 'Work';
}

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';

export interface PaymentDetails {
  upiApp?: 'gpay' | 'phonepe' | 'paytm' | 'other';
  upiId?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardHolder?: string;
  bankName?: string;
}

export type OrderStatus = 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  createdAt: string;
  estimatedDelivery: string;
  status: OrderStatus;
  items: CartItem[];
  address: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentSummary: string;
  pricing: PriceBreakdown;
}

export type CheckoutStep = 'address' | 'summary' | 'payment';

export type AppRoute =
  | { view: 'home' }
  | { view: 'product'; productId: string }
  | { view: 'checkout'; step?: CheckoutStep }
  | { view: 'orders'; highlightOrderId?: string };
