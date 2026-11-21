import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import type {
  CartItem,
  CheckoutStep,
  Order,
  PriceBreakdown,
  ShippingAddress,
} from '../types/store';
import {
  calculateDiscountPercent,
  checkPincodeDelivery,
  formatFullDeliveryDate,
  formatINR,
  generateOrderId,
  validateAddress,
} from '../utils/commerce';
import { OrderSuccessFlow } from './OrderSuccessFlow';
import { PaymentStepView, type QuickUpiApp } from './PaymentStepView';
import { SmartImage } from './SmartImage';
import { AssuredBadge } from './StoreIcons';

interface CheckoutPageProps {
  step: 1 | 2 | 3;
  items: CartItem[];
  pricing: PriceBreakdown;
  initialAddress: ShippingAddress;
  backLabel?: string;
  onBack: () => void;
  onAdvanceStep: (nextStep: CheckoutStep) => void;
  onReplaceToAddress: () => void;
  onSaveAddress: (addr: ShippingAddress) => void;
  onBackToStore: () => void;
  onOrderComplete: (order: Order) => void;
  onViewOrders?: (orderId: string) => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export function CheckoutPage({
  step,
  items,
  pricing,
  initialAddress,
  backLabel = 'Back to Store',
  onBack,
  onAdvanceStep,
  onReplaceToAddress,
  onSaveAddress,
  onBackToStore,
  onOrderComplete,
}: CheckoutPageProps) {
  const [address, setAddress] = useState<ShippingAddress>(initialAddress);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const [selectedUpiApp, setSelectedUpiApp] = useState<QuickUpiApp>('phonepe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (step > 1 && !confirmedOrder && Object.keys(validateAddress(address)).length > 0) {
      onReplaceToAddress();
    }
  }, [step, confirmedOrder, address, onReplaceToAddress]);

  const pincodeHint =
    address.pincode.length === 6 ? checkPincodeDelivery(address.pincode) : null;

  const handleAddressSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateAddress(address);
    setAddressErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSaveAddress(address);
      onAdvanceStep('summary');
      window.scrollTo(0, 0);
    }
  };

  const handlePayNow = (e: FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    window.setTimeout(() => {
      const pinCheck = checkPincodeDelivery(address.pincode);
      const orderId = generateOrderId();
      const paymentSummary = selectedUpiApp === 'phonepe' ? 'PhonePe UPI' : 'Paytm UPI';

      const newOrder: Order = {
        id: orderId,
        createdAt: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        estimatedDelivery: formatFullDeliveryDate(pinCheck.estimatedDays ?? 3),
        status: 'Confirmed',
        items: [...items],
        address: { ...address },
        paymentMethod: 'upi',
        paymentSummary,
        pricing: { ...pricing },
      };

      setIsProcessing(false);
      setConfirmedOrder(newOrder);
      onOrderComplete(newOrder);
      window.scrollTo(0, 0);
    }, 650);
  };

  // Post-Order Tick Animation -> "Thanks for shopping with us!" View
  if (confirmedOrder) {
    return (
      <OrderSuccessFlow
        order={confirmedOrder}
        onContinueShopping={onBackToStore}
      />
    );
  }

  // Guard empty cart on checkout
  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-stone-950">Your cart is empty</h1>
        <p className="text-sm text-stone-600 mt-2 mb-6">
          Add at least one item to proceed to checkout.
        </p>
        <button
          type="button"
          onClick={onBackToStore}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer"
        >
          Return to Store
        </button>
      </main>
    );
  }

  const handleHeaderBack = () => {
    onBack();
  };

  const headerTitle =
    step === 1 ? 'Add delivery address' : step === 2 ? 'Order Summary' : 'Payments';

  return (
    <div className={`min-h-screen flex flex-col ${step === 1 ? 'bg-white' : 'bg-[#F1F3F6]'}`}>
      {/* Top App Bar (White on Address/Summary, Royal Blue on Payments) */}
      <header
        className={
          step === 3
            ? 'bg-[#2874F0] text-white border-b border-[#1E60D5]'
            : 'bg-white text-[#111827] border-b border-[#E5E7EB]'
        }
      >
        <div className="max-w-6xl mx-auto h-[56px] px-3 sm:px-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleHeaderBack}
            data-testid="checkout-back-button"
            aria-label={step === 1 ? backLabel : `Back to step ${step - 1}`}
            className={`w-10 h-10 -ml-1.5 rounded-full inline-flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              step === 3 ? 'text-white hover:bg-white/15' : 'text-[#111827] hover:bg-[#F3F4F6]'
            }`}
          >
            <ArrowLeft className="w-[22px] h-[22px]" aria-hidden="true" />
          </button>
          <h1 className="text-[19px] font-medium tracking-[-0.01em] truncate">
            {headerTitle}
          </h1>
        </div>
      </header>

      {/* 3-Step Horizontal Progress Stepper */}
      <nav
        aria-label="Checkout progress"
        className="bg-white border-b border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-lg mx-auto px-4 py-3.5 relative">
          {/* Two connecting track segments behind step circles */}
          <div
            aria-hidden="true"
            className="absolute top-[27px] left-[16.666%] right-[16.666%] grid grid-cols-2"
          >
            <div className={`h-[1.5px] ${step >= 2 ? 'bg-[#2874F0]' : 'bg-[#D1D5DB]'}`} />
            <div className={`h-[1.5px] ${step >= 3 ? 'bg-[#2874F0]' : 'bg-[#D1D5DB]'}`} />
          </div>
          <ol className="grid grid-cols-3 relative z-10">
            {[
              { num: 1 as const, label: 'Address' },
              { num: 2 as const, label: 'Order Summary' },
              { num: 3 as const, label: 'Payment' },
            ].map((s) => {
              const isActive = step === s.num;
              const isCompleted = step > s.num;
              const useSolidCompleted = step === 3 && isCompleted;
              return (
                <li key={s.num} className="flex flex-col items-center text-center">
                  <span
                    className={`w-[26px] h-[26px] rounded-full text-[13px] font-semibold inline-flex items-center justify-center transition-colors ${
                      isActive || useSolidCompleted
                        ? 'bg-[#2874F0] text-white'
                        : isCompleted
                          ? 'bg-white border-[1.5px] border-[#2874F0] text-[#2874F0]'
                          : 'bg-white border-[1.5px] border-[#9CA3AF] text-[#6B7280]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" /> : s.num}
                  </span>
                  <span
                    className={`mt-1.5 text-[12px] leading-tight ${
                      isActive
                        ? step === 1
                          ? 'font-medium text-[#111827]'
                          : 'font-medium text-[#2874F0]'
                        : 'font-normal text-[#6B7280]'
                    }`}
                  >
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      {/* STEP 1: PURE WHITE DELIVERY ADDRESS FORM MATCHING SCREENSHOT */}
      {step === 1 && (
        <main className="flex-1 bg-white">
          <form
            onSubmit={handleAddressSubmit}
            noValidate
            autoComplete="off"
            className="max-w-xl mx-auto px-4 pt-6 pb-28 sm:pb-12 space-y-4"
          >
            <div>
              <input
                id="addr-name"
                type="text"
                aria-label="Full Name"
                value={address.fullName}
                onChange={(e) => {
                  setAddress({ ...address, fullName: e.target.value });
                  if (addressErrors.fullName) setAddressErrors({ ...addressErrors, fullName: '' });
                }}
                placeholder="Full Name"
                className={`w-full h-[52px] px-3.5 text-[15px] text-[#111827] placeholder:text-[#6B7280] bg-white border rounded-[4px] focus:outline-none transition-colors ${
                  addressErrors.fullName
                    ? 'border-[#DC2626] focus:border-[#DC2626]'
                    : 'border-[#CBD5E1] focus:border-[#2874F0]'
                }`}
              />
              {addressErrors.fullName && (
                <p className="text-[12px] text-[#DC2626] mt-1">{addressErrors.fullName}</p>
              )}
            </div>

            <div>
              <input
                id="addr-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                aria-label="Mobile number"
                value={address.phone}
                onChange={(e) => {
                  setAddress({ ...address, phone: e.target.value.replace(/\D/g, '') });
                  if (addressErrors.phone) setAddressErrors({ ...addressErrors, phone: '' });
                }}
                placeholder="Mobile number"
                className={`w-full h-[52px] px-3.5 text-[15px] text-[#111827] placeholder:text-[#6B7280] bg-white border rounded-[4px] focus:outline-none transition-colors ${
                  addressErrors.phone
                    ? 'border-[#DC2626] focus:border-[#DC2626]'
                    : 'border-[#CBD5E1] focus:border-[#2874F0]'
                }`}
              />
              {addressErrors.phone && (
                <p className="text-[12px] text-[#DC2626] mt-1">{addressErrors.phone}</p>
              )}
            </div>

            <div>
              <input
                id="addr-pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                aria-label="Pincode"
                value={address.pincode}
                onChange={(e) => {
                  setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '') });
                  if (addressErrors.pincode) setAddressErrors({ ...addressErrors, pincode: '' });
                }}
                placeholder="Pincode"
                className={`w-full h-[52px] px-3.5 text-[15px] text-[#111827] placeholder:text-[#6B7280] bg-white border rounded-[4px] focus:outline-none transition-colors ${
                  addressErrors.pincode
                    ? 'border-[#DC2626] focus:border-[#DC2626]'
                    : 'border-[#CBD5E1] focus:border-[#2874F0]'
                }`}
              />
              {addressErrors.pincode && (
                <p className="text-[12px] text-[#DC2626] mt-1">{addressErrors.pincode}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  id="addr-city"
                  type="text"
                  aria-label="City"
                  value={address.city}
                  onChange={(e) => {
                    setAddress({ ...address, city: e.target.value });
                    if (addressErrors.city) setAddressErrors({ ...addressErrors, city: '' });
                  }}
                  placeholder="City"
                  className={`w-full h-[52px] px-3.5 text-[15px] text-[#111827] placeholder:text-[#6B7280] bg-white border rounded-[4px] focus:outline-none transition-colors ${
                    addressErrors.city
                      ? 'border-[#DC2626] focus:border-[#DC2626]'
                      : 'border-[#CBD5E1] focus:border-[#2874F0]'
                  }`}
                />
                {addressErrors.city && (
                  <p className="text-[12px] text-[#DC2626] mt-1">{addressErrors.city}</p>
                )}
              </div>

              <div>
                <div
                  className={`relative h-[52px] bg-white border rounded-[4px] transition-colors ${
                    addressErrors.state
                      ? 'border-[#DC2626] focus-within:border-[#DC2626]'
                      : 'border-[#CBD5E1] focus-within:border-[#2874F0]'
                  }`}
                >
                  <label
                    htmlFor="addr-state"
                    className="absolute left-3.5 top-1.5 text-[11px] leading-tight text-[#6B7280] pointer-events-none"
                  >
                    State
                  </label>
                  <select
                    id="addr-state"
                    value={address.state}
                    onChange={(e) => {
                      setAddress({ ...address, state: e.target.value });
                      if (addressErrors.state) setAddressErrors({ ...addressErrors, state: '' });
                    }}
                    className={`w-full h-full appearance-none bg-transparent pl-3.5 pr-8 pt-4 pb-1 text-[14.5px] focus:outline-none cursor-pointer ${
                      address.state ? 'text-[#111827]' : 'text-[#6B7280]'
                    }`}
                  >
                    <option value=""></option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st} className="text-[#111827]">
                        {st}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="w-4 h-4 text-[#4B5563] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
                {addressErrors.state && (
                  <p className="text-[12px] text-[#DC2626] mt-1">{addressErrors.state}</p>
                )}
              </div>
            </div>

            <div>
              <input
                id="addr-line1"
                type="text"
                aria-label="House No., Building Name"
                value={address.addressLine1}
                onChange={(e) => {
                  setAddress({ ...address, addressLine1: e.target.value });
                  if (addressErrors.addressLine1) {
                    setAddressErrors({ ...addressErrors, addressLine1: '' });
                  }
                }}
                placeholder="House No., Building Name"
                className={`w-full h-[52px] px-3.5 text-[15px] text-[#111827] placeholder:text-[#6B7280] bg-white border rounded-[4px] focus:outline-none transition-colors ${
                  addressErrors.addressLine1
                    ? 'border-[#DC2626] focus:border-[#DC2626]'
                    : 'border-[#CBD5E1] focus:border-[#2874F0]'
                }`}
              />
              {addressErrors.addressLine1 && (
                <p className="text-[12px] text-[#DC2626] mt-1">{addressErrors.addressLine1}</p>
              )}
            </div>

            <div>
              <input
                id="addr-line2"
                type="text"
                aria-label="Road name, Area, Colony"
                value={address.addressLine2}
                onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                placeholder="Road name, Area, Colony"
                className="w-full h-[52px] px-3.5 text-[15px] text-[#111827] placeholder:text-[#6B7280] bg-white border border-[#CBD5E1] rounded-[4px] focus:border-[#2874F0] focus:outline-none transition-colors"
              />
            </div>

            <div className="fixed bottom-0 inset-x-0 z-30 bg-white px-4 py-3.5 sm:static sm:px-0 sm:pt-4 sm:pb-0">
              <button
                type="submit"
                className="w-full h-[50px] bg-[#FB641B] hover:bg-[#EA580C] active:bg-[#D94E0A] text-white font-bold uppercase tracking-wide text-[15px] rounded-[4px] shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-colors cursor-pointer"
              >
                PROCEED
              </button>
            </div>
          </form>
        </main>
      )}

      {/* STEP 2: ORDER SUMMARY (MATCHING REFERENCE SCREENSHOTS) */}
      {step === 2 && (
        <main className="flex-1 bg-[#F1F3F6] pb-[84px]">
          <div className="max-w-2xl mx-auto sm:pt-4 space-y-2.5">
            {/* Delivered To Card */}
            <section aria-label="Delivery address summary" className="bg-white px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[15px] text-[#6B7280]">Delivered to:</p>
                <button
                  type="button"
                  data-action="nav-back"
                  onClick={onBack}
                  className="text-[13px] font-medium text-[#2874F0] hover:underline cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>
              <div className="mt-1.5 text-[14.5px] text-[#111827] leading-snug space-y-0.5">
                {address.fullName && <p className="font-medium">{address.fullName}</p>}
                <p>
                  {[
                    address.addressLine1,
                    address.addressLine2,
                    address.city,
                    address.state,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                  {address.pincode ? ` - ${address.pincode}` : ''}
                </p>
                {address.phone && <p className="pt-0.5">{address.phone}</p>}
              </div>
            </section>

            {/* Delivery Estimate Strip + Product Summary Card */}
            <section aria-label="Selected products" className="bg-white">
              <div className="px-4 py-3 border-b border-[#F1F3F6] flex items-center gap-2">
                {/* Tiny Delivery Truck Icon */}
                <svg viewBox="0 0 24 18" className="w-[18px] h-[14px] shrink-0" fill="none" aria-hidden="true">
                  <rect x="1" y="2" width="13" height="10" rx="1.5" fill="#EA580C" />
                  <path d="M14 5H18.5L22 9V12H14V5Z" fill="#F59E0B" />
                  <rect x="15.5" y="6.5" width="3.5" height="2.5" rx="0.4" fill="#FEF3C7" />
                  <circle cx="5.5" cy="14" r="2.2" fill="#374151" />
                  <circle cx="17.5" cy="14" r="2.2" fill="#374151" />
                </svg>
                <p className="text-[14px] font-medium text-[#15803D]">
                  Delivery by {pincodeHint?.estimatedDateLabel ?? '2–3 days'} |{' '}
                  {pricing.shippingFee === 0 ? 'FREE' : formatINR(pricing.shippingFee)}
                </p>
              </div>

              <div className="divide-y divide-[#F1F3F6]">
                {items.map((item) => {
                  const itemDiscount = calculateDiscountPercent(item.mrp, item.price);
                  const displayTitle = item.fullTitle ?? item.name;
                  return (
                    <article
                      key={`${item.productId}-${item.variantId}`}
                      className="px-4 py-4 flex items-start gap-3.5"
                    >
                      <div className="w-[78px] h-[78px] shrink-0 bg-white overflow-hidden rounded-[2px]">
                        <SmartImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="text-[15px] font-normal text-[#111827] truncate">
                          {displayTitle}
                        </h2>
                        <p className="text-[13.5px] text-[#6B7280] truncate mt-0.5">
                          {item.variantLabel && item.variantLabel !== 'Standard'
                            ? `${item.variantLabel} · ${displayTitle}`
                            : displayTitle}
                        </p>

                        {item.assured !== false && (
                          <div className="mt-1.5">
                            <AssuredBadge />
                          </div>
                        )}

                        <div className="mt-2 flex items-center flex-wrap gap-2.5">
                          <span className="text-[14px] text-[#111827]">Qty: {item.quantity}</span>
                          {itemDiscount > 0 && (
                            <span className="text-[14px] font-semibold text-[#16A34A] tabular-nums">
                              {itemDiscount}% off
                            </span>
                          )}
                          <span className="text-[14px] text-[#6B7280] line-through tabular-nums">
                            {formatINR(item.mrp * item.quantity)}
                          </span>
                          <span className="text-[15.5px] font-bold text-[#111827] tabular-nums">
                            {formatINR(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Price Details Card */}
            <section aria-label="Price details" className="bg-white px-4 py-4">
              <h2 className="text-[16px] font-bold text-[#111827] mb-3.5">Price Details</h2>
              <dl className="space-y-3 text-[14.5px] text-[#111827]">
                <div className="flex items-center justify-between">
                  <dt>
                    Price ({pricing.itemCount} {pricing.itemCount === 1 ? 'item' : 'items'})
                  </dt>
                  <dd className="tabular-nums">{formatINR(pricing.mrpTotal)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Discount</dt>
                  <dd className="text-[#16A34A] tabular-nums">
                    - {formatINR(pricing.festiveSavings)}
                  </dd>
                </div>
                {pricing.couponDiscount > 0 && (
                  <div className="flex items-center justify-between">
                    <dt>Coupon ({pricing.appliedCoupon?.code})</dt>
                    <dd className="text-[#16A34A] tabular-nums">
                      - {formatINR(pricing.couponDiscount)}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt>Delivery Charges</dt>
                  <dd className="text-[#16A34A]">
                    {pricing.shippingFee === 0 ? 'FREE Delivery' : formatINR(pricing.shippingFee)}
                  </dd>
                </div>

                <div className="border-t border-dashed border-[#E5E7EB] pt-3.5 flex items-center justify-between text-[16px] font-bold text-[#111827]">
                  <dt>Total Amount</dt>
                  <dd className="tabular-nums">{formatINR(pricing.grandTotal)}</dd>
                </div>
              </dl>

              {pricing.totalSavings > 0 && (
                <p className="mt-3 text-[14.5px] font-medium text-[#16A34A]">
                  You will save {formatINR(pricing.totalSavings)} on this order
                </p>
              )}
            </section>

            {/* Trust Guarantee Block */}
            <div className="px-4 py-5 flex items-center justify-center gap-3 text-[#6B7280]">
              <ShieldCheck
                className="w-8 h-8 text-[#9CA3AF] shrink-0"
                aria-hidden="true"
              />
              <p className="text-[13px] leading-snug text-[#6B7280]">
                Safe and secure payments. Easy returns.
                <br />
                100% Authentic products.
              </p>
            </div>
          </div>

          {/* Sticky Bottom Total + Yellow Continue Bar */}
          <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E5E7EB] px-4 py-2.5 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              <div>
                {pricing.mrpTotal > pricing.grandTotal && (
                  <p className="text-[13px] text-[#6B7280] line-through leading-none tabular-nums">
                    {formatINR(pricing.mrpTotal)}
                  </p>
                )}
                <p className="text-[20px] font-bold text-[#111827] leading-tight mt-0.5 tabular-nums">
                  {formatINR(pricing.grandTotal)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onAdvanceStep('payment');
                  window.scrollTo(0, 0);
                }}
                className="min-w-[168px] sm:min-w-[210px] h-[44px] bg-[#FFC200] hover:bg-[#F4B800] active:bg-[#EAB308] text-[#111827] font-semibold text-[15px] rounded-[4px] transition-colors cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        </main>
      )}

      {/* STEP 3: PAYMENTS PAGE MATCHING REFERENCE SCREENSHOTS */}
      {step === 3 && (
        <PaymentStepView
          pricing={pricing}
          selectedApp={selectedUpiApp}
          isProcessing={isProcessing}
          onSelectApp={setSelectedUpiApp}
          onSubmitPay={handlePayNow}
        />
      )}
    </div>
  );
}
