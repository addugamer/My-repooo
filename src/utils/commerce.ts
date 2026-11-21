import { AVAILABLE_COUPONS } from '../data/products';
import type {
  CartItem,
  Coupon,
  PaymentDetails,
  PaymentMethod,
  PincodeResult,
  PriceBreakdown,
  Product,
  ProductReview,
  ReviewSortMode,
  ShippingAddress,
} from '../types/store';

export const FREE_SHIPPING_THRESHOLD = 0;
export const STANDARD_SHIPPING_FEE = 0;

export function formatINR(amount: number): string {
  const safe = Math.max(0, Math.round(amount));
  return `₹${safe.toLocaleString('en-IN')}`;
}

export function formatINRDecimal(amount: number): string {
  const safe = Math.max(0, amount);
  return `₹${safe.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
}

export function calculateDiscountPercent(mrp: number, price: number): number {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function validateCoupon(
  rawCode: string,
  subtotal: number,
  coupons: Coupon[] = AVAILABLE_COUPONS,
): { valid: boolean; coupon: Coupon | null; discount: number; message: string } {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, coupon: null, discount: 0, message: 'Enter a coupon code to apply.' };
  }

  const found = coupons.find((c) => c.code.toUpperCase() === code);
  if (!found) {
    return {
      valid: false,
      coupon: null,
      discount: 0,
      message: `Code "${code}" is not valid. Try DIWALI10 or FESTIVE250.`,
    };
  }

  if (subtotal < found.minSubtotal) {
    return {
      valid: false,
      coupon: null,
      discount: 0,
      message: `Add ${formatINR(found.minSubtotal - subtotal)} more to unlock ${found.code}.`,
    };
  }

  let discount = 0;
  if (found.type === 'percent') {
    discount = Math.round((subtotal * found.value) / 100);
    if (found.maxDiscount !== undefined) {
      discount = Math.min(discount, found.maxDiscount);
    }
  } else {
    discount = found.value;
  }

  discount = Math.min(discount, subtotal);

  return {
    valid: true,
    coupon: found,
    discount,
    message: `${found.code} applied — you save ${formatINR(discount)} extra.`,
  };
}

export function calculatePriceBreakdown(
  items: CartItem[],
  couponCode?: string,
  coupons: Coupon[] = AVAILABLE_COUPONS,
): PriceBreakdown {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const mrpTotal = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const festiveSavings = Math.max(0, mrpTotal - subtotal);

  let couponDiscount = 0;
  let appliedCoupon: Coupon | null = null;

  if (couponCode && subtotal > 0) {
    const res = validateCoupon(couponCode, subtotal, coupons);
    if (res.valid && res.coupon) {
      couponDiscount = res.discount;
      appliedCoupon = res.coupon;
    }
  }

  const afterCoupon = Math.max(0, subtotal - couponDiscount);
  const shippingFee =
    itemCount === 0 ? 0 : afterCoupon >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const grandTotal = afterCoupon + shippingFee;
  const totalSavings = festiveSavings + couponDiscount;

  return {
    itemCount,
    mrpTotal,
    subtotal,
    festiveSavings,
    couponDiscount,
    appliedCoupon,
    shippingFee,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    grandTotal,
    totalSavings,
  };
}

const PINCODE_REGIONS: Record<string, { region: string; days: number }> = {
  '1': { region: 'Delhi NCR & North India', days: 2 },
  '2': { region: 'Uttar Pradesh & Uttarakhand', days: 3 },
  '3': { region: 'Rajasthan & Gujarat', days: 3 },
  '4': { region: 'Maharashtra, Goa & MP', days: 2 },
  '5': { region: 'Karnataka, Telangana & AP', days: 2 },
  '6': { region: 'Tamil Nadu & Kerala', days: 3 },
  '7': { region: 'West Bengal, Odisha & East', days: 4 },
  '8': { region: 'Bihar & Jharkhand', days: 4 },
};

export function checkPincodeDelivery(
  rawPincode: string,
  baseDate: Date = new Date(),
): PincodeResult {
  const pincode = rawPincode.trim();
  if (!/^[1-8][0-9]{5}$/.test(pincode)) {
    return {
      valid: false,
      pincode,
      message: 'Please enter a valid 6-digit Indian pincode (e.g. 400001).',
    };
  }

  const regionInfo = PINCODE_REGIONS[pincode[0]] ?? { region: 'India Standard Zone', days: 4 };
  const deliveryDate = new Date(baseDate.getTime());
  deliveryDate.setDate(deliveryDate.getDate() + regionInfo.days);

  const estimatedDateLabel = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return {
    valid: true,
    pincode,
    region: regionInfo.region,
    estimatedDays: regionInfo.days,
    estimatedDateLabel,
    codAvailable: true,
    message: `Delivery to ${regionInfo.region} by ${estimatedDateLabel} · Cash on Delivery available`,
  };
}

export function formatFullDeliveryDate(
  estimatedDays: number = 3,
  baseDate: Date = new Date(),
): string {
  const safeDays = Math.max(0, Math.round(estimatedDays));
  const deliveryDate = new Date(baseDate.getTime());
  deliveryDate.setDate(deliveryDate.getDate() + safeDays);
  return deliveryDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function validateAddress(addr: ShippingAddress): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!addr.fullName.trim()) {
    errors.fullName = 'Enter full name.';
  }
  if (!addr.phone.trim()) {
    errors.phone = 'Enter mobile number.';
  }
  if (!addr.pincode.trim()) {
    errors.pincode = 'Enter pincode.';
  }
  if (!addr.addressLine1.trim()) {
    errors.addressLine1 = 'Enter house no. or building name.';
  }
  if (!addr.city.trim()) {
    errors.city = 'Enter city.';
  }

  return errors;
}

export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function detectCardBrand(raw: string): 'Visa' | 'Mastercard' | 'RuPay' | 'Card' {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('4')) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^(60|65|81|82|508)/.test(digits)) return 'RuPay';
  return 'Card';
}

export function validatePayment(
  method: PaymentMethod,
  details: PaymentDetails,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (method === 'upi') {
    const upi = (details.upiId ?? '').trim();
    if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upi)) {
      errors.upiId = 'Enter a valid UPI ID (e.g. rahul@okaxis or name@ybl).';
    }
  } else if (method === 'card') {
    const digits = (details.cardNumber ?? '').replace(/\D/g, '');
    if (digits.length !== 16) {
      errors.cardNumber = 'Enter a valid 16-digit card number.';
    }
    const expiry = (details.cardExpiry ?? '').trim();
    const expMatch = /^(0[1-9]|1[0-2])\/([0-9]{2})$/.exec(expiry);
    if (!expMatch) {
      errors.cardExpiry = 'Enter expiry in MM/YY format.';
    }
    const cvv = (details.cardCvv ?? '').replace(/\D/g, '');
    if (cvv.length < 3 || cvv.length > 4) {
      errors.cardCvv = 'Enter 3 or 4 digit CVV.';
    }
    if (!(details.cardHolder ?? '').trim() || (details.cardHolder ?? '').trim().length < 2) {
      errors.cardHolder = 'Enter name printed on card.';
    }
  } else if (method === 'netbanking') {
    if (!(details.bankName ?? '').trim()) {
      errors.bankName = 'Select a bank to continue.';
    }
  }

  return errors;
}

export function filterProducts(
  products: Product[],
  category: string,
  query: string,
  sortBy: string,
): Product[] {
  const q = query.trim().toLowerCase();

  let list = products.filter((p) => {
    const matchesCategory =
      category === 'All' || category === 'For You' || p.category === category;
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  list = [...list];

  if (sortBy === 'price-asc') {
    list.sort((a, b) => a.variants[0].price - b.variants[0].price);
  } else if (sortBy === 'price-desc') {
    list.sort((a, b) => b.variants[0].price - a.variants[0].price);
  } else if (sortBy === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'discount') {
    list.sort(
      (a, b) =>
        calculateDiscountPercent(b.variants[0].mrp, b.variants[0].price) -
        calculateDiscountPercent(a.variants[0].mrp, a.variants[0].price),
    );
  }

  return list;
}

export function generateOrderId(timestamp: number = Date.now()): string {
  const tail = String(timestamp).slice(-5);
  return `UB-2026-${tail}`;
}

export function getRatingVerdict(rating: number): string {
  if (rating >= 4.6) return 'Excellent';
  if (rating >= 4.1) return 'Very Good';
  if (rating >= 3.5) return 'Good';
  return 'Average';
}

export function sortAndFilterReviews(
  reviews: ProductReview[],
  mode: ReviewSortMode,
): ProductReview[] {
  const copy = [...reviews];
  if (mode === 'latest') {
    return copy.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
  }
  if (mode === 'positive') {
    return copy
      .filter((r) => r.rating >= 4)
      .sort(
        (a, b) =>
          b.rating - a.rating || (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0),
      );
  }
  if (mode === 'negative') {
    return copy
      .filter((r) => r.rating <= 3)
      .sort(
        (a, b) =>
          a.rating - b.rating || (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0),
      );
  }
  // Default: 'helpful'
  return copy.sort(
    (a, b) =>
      (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0) || b.rating - a.rating,
  );
}

export interface CarouselPingPongState {
  index: number;
  direction: 1 | -1;
}

/**
 * Advances a horizontal carousel back-and-forth (ping-pong):
 * e.g. for 2 slides: 0 -> 1 (scroll left), then 1 -> 0 (scroll right), continuously.
 */
export function getNextPingPongSlide(
  currentIndex: number,
  direction: 1 | -1,
  totalSlides: number,
): CarouselPingPongState {
  if (totalSlides <= 1) {
    return { index: 0, direction: 1 };
  }

  const clamped = Math.max(0, Math.min(totalSlides - 1, currentIndex));
  let nextDir: 1 | -1 = direction;

  if (clamped === totalSlides - 1 && nextDir === 1) {
    nextDir = -1;
  } else if (clamped === 0 && nextDir === -1) {
    nextDir = 1;
  }

  const nextIndex = Math.max(0, Math.min(totalSlides - 1, clamped + nextDir));
  const upcomingDir: 1 | -1 =
    nextIndex === totalSlides - 1 ? -1 : nextIndex === 0 ? 1 : nextDir;

  return { index: nextIndex, direction: upcomingDir };
}

export function getProductGalleryImages(
  product: Pick<Product, 'id' | 'image' | 'images'>,
): string[] {
  const candidates =
    product.images && product.images.length > 0
      ? product.images
      : [
          product.image,
          `/src/assets/images/gallery/${product.id}-2.jpg`,
          `/src/assets/images/gallery/${product.id}-3.jpg`,
          `/src/assets/images/gallery/${product.id}-4.jpg`,
          `/src/assets/images/gallery/${product.id}-5.jpg`,
        ];

  const unique: string[] = [];
  for (const src of candidates) {
    if (src && !unique.includes(src)) {
      unique.push(src);
    }
  }
  return unique.length > 0 ? unique : [product.image];
}

export function clampGallerySlideIndex(index: number, totalSlides: number): number {
  if (totalSlides <= 1) return 0;
  return Math.max(0, Math.min(totalSlides - 1, Math.round(index)));
}

export const PAYTM_UPI_ID = '9149453035@ptyes';
export const PHONEPE_UPI_ID = '6006073289@ybl';
export const MERCHANT_UPI_ID = PAYTM_UPI_ID;
export const MERCHANT_PAYEE_NAME = 'Shopping';

interface UpiUrlOptions {
  upiId?: string;
  payeeName?: string;
  note?: string;
}

function buildAppUpiUrl(
  scheme: 'paytmmp' | 'phonepe',
  defaultUpiId: string,
  amount: number,
  options?: UpiUrlOptions,
): string {
  const safeAmount = Math.max(0, Number.isFinite(amount) ? amount : 0);
  const formattedAmount = safeAmount.toFixed(2);
  const rawUpiId = (options?.upiId ?? defaultUpiId).trim() || defaultUpiId;
  const encodedUpiId = encodeURIComponent(rawUpiId).replace(/%40/g, '@');
  const payeeName = (options?.payeeName ?? MERCHANT_PAYEE_NAME).trim() || MERCHANT_PAYEE_NAME;
  const note = (options?.note ?? 'Order Payment').trim() || 'Order Payment';

  return (
    `${scheme}://pay?pa=${encodedUpiId}` +
    `&pn=${encodeURIComponent(payeeName)}` +
    `&am=${formattedAmount}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(note)}`
  );
}

export function buildPaytmUpiUrl(amount: number, options?: UpiUrlOptions): string {
  return buildAppUpiUrl('paytmmp', PAYTM_UPI_ID, amount, options);
}

export function buildPhonePeUpiUrl(amount: number, options?: UpiUrlOptions): string {
  return buildAppUpiUrl('phonepe', PHONEPE_UPI_ID, amount, options);
}


