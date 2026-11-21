import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS } from '../data/products';
import {
  calculateDiscountPercent,
  calculatePriceBreakdown,
  checkPincodeDelivery,
  detectCardBrand,
  filterProducts,
  formatCardNumber,
  formatCountdown,
  formatExpiry,
  formatFullDeliveryDate,
  formatINR,
  formatINRDecimal,
  generateOrderId,
  getNextPingPongSlide,
  getProductGalleryImages,
  getRatingVerdict,
  sortAndFilterReviews,
  validateAddress,
  validateCoupon,
  validatePayment,
  clampGallerySlideIndex,
  MERCHANT_UPI_ID,
  PAYTM_UPI_ID,
  PHONEPE_UPI_ID,
  buildPaytmUpiUrl,
  buildPhonePeUpiUrl,
} from './commerce';

test('formatINR and formatINRDecimal format Indian currency accurately', () => {
  assert.equal(formatINR(0), '₹0');
  assert.equal(formatINR(999), '₹999');
  assert.equal(formatINR(12999), '₹12,999');
  assert.equal(formatINR(125000), '₹1,25,000');

  assert.equal(formatINRDecimal(489), '₹489.00');
  assert.equal(formatINRDecimal(6289), '₹6,289.00');
  assert.equal(formatINRDecimal(8790), '₹8,790.00');
});

test('formatCountdown formats live sale timer as MMm SSs', () => {
  assert.equal(formatCountdown(567), '09m 27s');
  assert.equal(formatCountdown(65), '01m 05s');
  assert.equal(formatCountdown(0), '00m 00s');
  assert.equal(formatCountdown(-10), '00m 00s');
});

test('calculateDiscountPercent returns accurate percentage savings', () => {
  assert.equal(calculateDiscountPercent(6289, 489), 92);
  assert.equal(calculateDiscountPercent(8790, 699), 92);
  assert.equal(calculateDiscountPercent(1000, 1000), 0);
  assert.equal(calculateDiscountPercent(0, 500), 0);
});

test('validateCoupon enforces min subtotal, percent cap, and invalid codes', () => {
  const lowSubtotal = validateCoupon('DIWALI10', 500);
  assert.equal(lowSubtotal.valid, false);

  const validPercent = validateCoupon('diwali10', 3000);
  assert.equal(validPercent.valid, true);
  assert.equal(validPercent.discount, 300);

  const cappedPercent = validateCoupon('DIWALI10', 25000);
  assert.equal(cappedPercent.valid, true);
  assert.equal(cappedPercent.discount, 1500);

  const flatCoupon = validateCoupon('FESTIVE250', 2000);
  assert.equal(flatCoupon.valid, true);
  assert.equal(flatCoupon.discount, 250);

  const invalid = validateCoupon('FAKE99', 5000);
  assert.equal(invalid.valid, false);
});

test('calculatePriceBreakdown computes totals, shipping threshold, and coupon discount', () => {
  const lowCart = calculatePriceBreakdown([
    {
      productId: 'p1',
      variantId: 'v1',
      name: 'Test Item',
      brand: 'Brand',
      variantLabel: 'Default',
      image: '',
      price: 500,
      mrp: 800,
      quantity: 1,
    },
  ]);
  assert.equal(lowCart.subtotal, 500);
  assert.equal(lowCart.shippingFee, 0);
  assert.equal(lowCart.grandTotal, 500);
  assert.equal(lowCart.festiveSavings, 300);
  assert.equal(lowCart.totalSavings, 300);

  const highCart = calculatePriceBreakdown(
    [
      {
        productId: 'p1',
        variantId: 'v1',
        name: 'Headphones',
        brand: 'Solis',
        variantLabel: 'Obsidian',
        image: '',
        price: 3500,
        mrp: 7000,
        quantity: 2,
      },
    ],
    'DIWALI10',
  );
  assert.equal(highCart.itemCount, 2);
  assert.equal(highCart.subtotal, 7000);
  assert.equal(highCart.couponDiscount, 700);
  assert.equal(highCart.shippingFee, 0);
  assert.equal(highCart.grandTotal, 6300);
});

test('checkPincodeDelivery validates Indian pincodes and returns estimated dates', () => {
  const fixedDate = new Date('2026-10-20T00:00:00Z');
  const mumbai = checkPincodeDelivery('400001', fixedDate);
  assert.equal(mumbai.valid, true);
  assert.equal(mumbai.estimatedDays, 2);
  assert.equal(mumbai.codAvailable, true);

  const invalidShort = checkPincodeDelivery('4000');
  assert.equal(invalidShort.valid, false);

  const invalidZero = checkPincodeDelivery('000001');
  assert.equal(invalidZero.valid, false);

  assert.equal(formatFullDeliveryDate(3, new Date('2026-11-20T12:00:00Z')), 'Mon, Nov 23, 2026');
});

test('validateAddress rejects empty fields and accepts any entered address values', () => {
  const emptyErrors = validateAddress({
    fullName: '',
    phone: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    addressType: 'Home',
  });
  assert.ok(emptyErrors.fullName);
  assert.ok(emptyErrors.phone);
  assert.ok(emptyErrors.pincode);
  assert.ok(emptyErrors.addressLine1);
  assert.ok(emptyErrors.city);

  // Casual / short / arbitrary address values should all be accepted
  const casualErrors = validateAddress({
    fullName: 'A',
    phone: '12345',
    pincode: '000',
    addressLine1: '12',
    addressLine2: '',
    city: 'X',
    state: '',
    addressType: 'Home',
  });
  assert.deepEqual(casualErrors, {});

  const validErrors = validateAddress({
    fullName: 'Aarav Patel',
    phone: '9876543210',
    pincode: '400001',
    addressLine1: 'Flat 402, Lotus Heights, MG Road',
    addressLine2: 'Near Metro Station',
    city: 'Mumbai',
    state: 'Maharashtra',
    addressType: 'Home',
  });
  assert.deepEqual(validErrors, {});
});

test('validatePayment validates UPI, Card, Net Banking, and COD accurately', () => {
  assert.ok(validatePayment('upi', { upiId: 'invalid-upi' }).upiId);
  assert.deepEqual(validatePayment('upi', { upiId: 'aarav.patel@okaxis' }), {});

  assert.ok(validatePayment('card', { cardNumber: '1234', cardExpiry: '99/99', cardCvv: '1', cardHolder: '' }).cardNumber);
  assert.deepEqual(
    validatePayment('card', {
      cardNumber: '4111 1111 1111 1111',
      cardExpiry: '08/29',
      cardCvv: '412',
      cardHolder: 'Aarav Patel',
    }),
    {},
  );

  assert.ok(validatePayment('netbanking', { bankName: '' }).bankName);
  assert.deepEqual(validatePayment('netbanking', { bankName: 'HDFC Bank' }), {});
  assert.deepEqual(validatePayment('cod', {}), {});
});

test('card formatting and brand detection helpers', () => {
  assert.equal(formatCardNumber('4111111111111111'), '4111 1111 1111 1111');
  assert.equal(formatExpiry('0928'), '09/28');
  assert.equal(detectCardBrand('4111'), 'Visa');
  assert.equal(detectCardBrand('5234'), 'Mastercard');
  assert.equal(detectCardBrand('6074'), 'RuPay');
});

test('filterProducts filters by category, For You, search query, and sorts properly', () => {
  const forYou = filterProducts(PRODUCTS, 'For You', '', 'featured');
  assert.equal(forYou.length, PRODUCTS.length);
  assert.equal(forYou[0].id, 'smartbuy-cordless-drill');
  assert.equal(forYou[1].id, 'green-soul-kiev-chair');
  assert.equal(forYou[2].id, 'leader-beast-26t');
  assert.equal(forYou[3].id, 'nilkamal-sleep-lite-mattress');
  assert.equal(forYou[4].id, 'milton-euroline-combo');
  assert.equal(forYou[5].id, 'trendylivings-dining-set');
  assert.equal(forYou[6].id, 'magnum-safari-luggage');
  assert.equal(forYou[7].id, 'plantex-7step-ladder');

  const electronics = filterProducts(PRODUCTS, 'Electronics', '', 'featured');
  assert.ok(electronics.length >= 2);
  assert.ok(electronics.every((p) => p.category === 'Electronics'));

  const ladderSearch = filterProducts(PRODUCTS, 'For You', 'Plantex', 'featured');
  assert.ok(ladderSearch.length >= 1);
  assert.equal(ladderSearch[0].id, 'plantex-7step-ladder');

  const sortedAsc = filterProducts(PRODUCTS, 'For You', '', 'price-asc');
  for (let i = 1; i < sortedAsc.length; i++) {
    assert.ok(sortedAsc[i - 1].variants[0].price <= sortedAsc[i].variants[0].price);
  }
});

test('generateOrderId follows UB-2026-XXXXX pattern', () => {
  assert.match(generateOrderId(1795179191234), /^UB-2026-\d{5}$/);
});

test('getRatingVerdict returns expected qualitative rating tiers', () => {
  assert.equal(getRatingVerdict(4.8), 'Excellent');
  assert.equal(getRatingVerdict(4.3), 'Very Good');
  assert.equal(getRatingVerdict(3.9), 'Good');
  assert.equal(getRatingVerdict(3.1), 'Average');
});

test('sortAndFilterReviews sorts by Most Helpful, Latest, Positive, and Negative', () => {
  const leader = PRODUCTS.find((p) => p.id === 'leader-beast-26t');
  assert.ok(leader);
  const sample = [
    { id: 'r1', author: 'A', city: 'X', rating: 4, date: 'Jan, 2024', timestamp: 1705000000, title: 'T1', comment: 'C1', helpfulCount: 968, verified: true },
    { id: 'r2', author: 'B', city: 'Y', rating: 3, date: 'Jun, 2024', timestamp: 1718000000, title: 'T2', comment: 'C2', helpfulCount: 43, verified: true },
    { id: 'r3', author: 'C', city: 'Z', rating: 5, date: 'Jun, 2025', timestamp: 1749000000, title: 'T3', comment: 'C3', helpfulCount: 113, verified: true },
  ];

  assert.equal(sortAndFilterReviews(sample, 'helpful')[0].id, 'r1');
  assert.equal(sortAndFilterReviews(sample, 'latest')[0].id, 'r3');

  const positive = sortAndFilterReviews(sample, 'positive');
  assert.equal(positive.length, 2);
  assert.equal(positive[0].id, 'r3');

  const negative = sortAndFilterReviews(sample, 'negative');
  assert.equal(negative.length, 1);
  assert.equal(negative[0].id, 'r2');
});

test('getNextPingPongSlide alternates left (0->1) then right (1->0) continuously for 2 banners', () => {
  const s1 = getNextPingPongSlide(0, 1, 2);
  assert.deepEqual(s1, { index: 1, direction: -1 });

  const s2 = getNextPingPongSlide(s1.index, s1.direction, 2);
  assert.deepEqual(s2, { index: 0, direction: 1 });

  const s3 = getNextPingPongSlide(s2.index, s2.direction, 2);
  assert.deepEqual(s3, { index: 1, direction: -1 });

  const s4 = getNextPingPongSlide(s3.index, s3.direction, 2);
  assert.deepEqual(s4, { index: 0, direction: 1 });

  // Single-slide edge case stays safely at 0
  assert.deepEqual(getNextPingPongSlide(0, 1, 1), { index: 0, direction: 1 });
});

test('every product provides 4 to 6 unique gallery images and clampGallerySlideIndex bounds indices', () => {
  assert.ok(PRODUCTS.length >= 16);
  for (const product of PRODUCTS) {
    const gallery = getProductGalleryImages(product);
    assert.ok(
      gallery.length >= 4 && gallery.length <= 6,
      `Expected 4-6 images for ${product.id}, got ${gallery.length}`,
    );
    assert.equal(new Set(gallery).size, gallery.length, `Duplicate gallery images on ${product.id}`);
    assert.equal(gallery[0], product.image);
  }

  assert.equal(clampGallerySlideIndex(-2, 5), 0);
  assert.equal(clampGallerySlideIndex(2.4, 5), 2);
  assert.equal(clampGallerySlideIndex(9, 5), 4);
  assert.equal(clampGallerySlideIndex(3, 1), 0);
});

test('buildPaytmUpiUrl builds Paytm deep link with 9149453035@ptyes and dynamic checkout amount', () => {
  assert.equal(MERCHANT_UPI_ID, '9149453035@ptyes');

  const url = buildPaytmUpiUrl(478);
  assert.equal(
    url,
    'paytmmp://pay?pa=9149453035@ptyes&pn=Shopping&am=478.00&cu=INR&tn=Order%20Payment',
  );

  const highAmountUrl = buildPaytmUpiUrl(1299.5, { note: 'Chair Order' });
  assert.equal(
    highAmountUrl,
    'paytmmp://pay?pa=9149453035@ptyes&pn=Shopping&am=1299.50&cu=INR&tn=Chair%20Order',
  );

  const zeroSafeUrl = buildPaytmUpiUrl(-50);
  assert.ok(zeroSafeUrl.includes('am=0.00'));
  assert.ok(zeroSafeUrl.includes('pa=9149453035@ptyes'));
});

test('buildPhonePeUpiUrl builds PhonePe deep link with 6006073289@ybl and dynamic checkout amount', () => {
  assert.equal(PAYTM_UPI_ID, '9149453035@ptyes');
  assert.equal(PHONEPE_UPI_ID, '6006073289@ybl');

  const url = buildPhonePeUpiUrl(478);
  assert.equal(
    url,
    'phonepe://pay?pa=6006073289@ybl&pn=Shopping&am=478.00&cu=INR&tn=Order%20Payment',
  );

  const highAmountUrl = buildPhonePeUpiUrl(1499, { note: 'Mobile Order' });
  assert.equal(
    highAmountUrl,
    'phonepe://pay?pa=6006073289@ybl&pn=Shopping&am=1499.00&cu=INR&tn=Mobile%20Order',
  );

  const zeroSafeUrl = buildPhonePeUpiUrl(-10);
  assert.ok(zeroSafeUrl.includes('am=0.00'));
  assert.ok(zeroSafeUrl.includes('pa=6006073289@ybl'));
});


