import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { PriceBreakdown } from '../types/store';
import { buildPaytmUpiUrl, buildPhonePeUpiUrl, formatINR } from '../utils/commerce';

export type QuickUpiApp = 'phonepe' | 'paytm';

interface PaymentStepViewProps {
  pricing: PriceBreakdown;
  selectedApp: QuickUpiApp;
  isProcessing: boolean;
  onSelectApp: (app: QuickUpiApp) => void;
  onSubmitPay: (e: FormEvent) => void;
}

const INITIAL_OFFER_SECONDS = 11 * 60 + 23; // 11min 23sec

function formatOfferTimer(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}min ${String(secs).padStart(2, '0')}sec`;
}

function PhonePeSquareBadge() {
  return (
    <span className="w-10 h-10 rounded-[4px] bg-[#5F259F] inline-flex items-center justify-center shrink-0">
      <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" aria-hidden="true">
        <path
          d="M9.5 11.5H22.5M18 11.5V23M12.5 11.5V16.8C12.5 18.6 14.1 19.8 16.2 19.2L18 18.7"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.5 7.5C15.8 8.7 17.5 10.2 18.5 11.5"
          stroke="#FFFFFF"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function PhonePeCircleMark({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#5F259F" />
      <path
        d="M10.5 12H21.5M18 12V22.5M13 12V16.8C13 18.3 14.4 19.3 16.3 18.8L18 18.3"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 8.5C15.8 9.6 17.2 10.8 18.2 12"
        stroke="#FFFFFF"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PaytmSquareBadge() {
  return (
    <span className="w-10 h-10 rounded-[4px] overflow-hidden border border-[#E5E7EB] relative inline-flex items-center justify-center shrink-0 bg-white">
      <span className="absolute inset-x-0 top-0 h-1/2 bg-[#00BAF2]" aria-hidden="true" />
      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-[#002970]" aria-hidden="true" />
      <span className="relative z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
        <span className="font-display text-[9px] font-extrabold tracking-tight leading-none">
          <span className="text-[#002970]">pay</span>
          <span className="text-[#00BAF2]">tm</span>
        </span>
      </span>
    </span>
  );
}

function CodMutedIcon() {
  return (
    <span className="w-10 h-10 inline-flex flex-col items-center justify-center shrink-0 text-[#6B7280]">
      <svg viewBox="0 0 32 22" className="w-8 h-5" fill="none" aria-hidden="true">
        <rect
          x="1.5"
          y="2.5"
          width="29"
          height="17"
          rx="2.5"
          stroke="#9CA3AF"
          strokeWidth="1.8"
          fill="#F9FAFB"
        />
        <circle cx="16" cy="11" r="4" stroke="#9CA3AF" strokeWidth="1.6" />
        <path d="M5.5 6.5H7.5M24.5 15.5H26.5" stroke="#9CA3AF" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className="text-[11px] font-semibold tracking-wide text-[#4B5563] leading-none mt-0.5">
        COD
      </span>
    </span>
  );
}

export function PaymentStepView({
  pricing,
  selectedApp,
  isProcessing,
  onSelectApp,
  onSubmitPay,
}: PaymentStepViewProps) {
  const [offerSeconds, setOfferSeconds] = useState(INITIAL_OFFER_SECONDS);
  const paytmAnchorRef = useRef<HTMLAnchorElement>(null);
  const phonePeAnchorRef = useRef<HTMLAnchorElement>(null);
  const paytmUrl = buildPaytmUpiUrl(pricing.grandTotal);
  const phonePeUrl = buildPhonePeUpiUrl(pricing.grandTotal);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setOfferSeconds((prev) => (prev <= 1 ? INITIAL_OFFER_SECONDS : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleFormSubmit = (e: FormEvent) => {
    if (selectedApp === 'paytm') {
      paytmAnchorRef.current?.click();
    } else if (selectedApp === 'phonepe') {
      phonePeAnchorRef.current?.click();
    }
    onSubmitPay(e);
  };

  return (
    <main className="flex-1 bg-[#F1F3F6] pb-[84px]">
      <a
        ref={phonePeAnchorRef}
        href={phonePeUrl}
        data-testid="phonepe-deeplink-anchor"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      >
        Open PhonePe
      </a>
      <a
        ref={paytmAnchorRef}
        href={paytmUrl}
        data-testid="paytm-deeplink-anchor"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      >
        Open Paytm
      </a>
      <form onSubmit={handleFormSubmit} noValidate className="max-w-2xl mx-auto">
        {/* Promotional PhonePe Cashback Banner */}
        <section aria-label="UPI cashback offer" className="bg-white">
          <div className="relative h-[132px] sm:h-[148px] bg-[#5F259F] overflow-hidden flex items-center">
            {/* Curved White Left Wing */}
            <svg
              viewBox="0 0 220 150"
              preserveAspectRatio="none"
              className="absolute inset-y-0 left-0 h-full w-[47%] sm:w-[44%]"
              aria-hidden="true"
            >
              <path d="M0 0 H212 C164 50 160 108 194 150 H0 Z" fill="#FFFFFF" />
            </svg>

            <div className="relative z-10 w-full flex items-center justify-between px-3 sm:px-6">
              {/* Left Brand Mark */}
              <div className="flex items-center gap-1.5 w-[39%] shrink-0">
                <PhonePeCircleMark className="w-7 h-7 sm:w-9 sm:h-9 shrink-0" />
                <span className="font-display text-[17px] sm:text-[21px] font-bold text-[#4A148C] tracking-tight">
                  PhonePe
                </span>
              </div>

              {/* Right Purple Offer Headline */}
              <div className="w-[59%] text-center pl-2">
                <p className="font-display italic font-extrabold text-[15px] sm:text-[18px] tracking-tight leading-tight text-white">
                  GET <span className="text-[#FFD400]">20% CASHBACK</span>
                </p>
                <p className="mt-1.5 text-[13.5px] sm:text-[15.5px] font-semibold text-white leading-snug">
                  when you pay with
                  <br />
                  PhonePe UPI
                </p>
              </div>
            </div>

            <span className="absolute bottom-1.5 right-2.5 text-[9px] text-white/80">
              * Condition Apply
            </span>
          </div>

          {/* Offer Ends Countdown Strip */}
          <div className="bg-white py-3 px-4 text-center border-b border-[#E5E7EB]">
            <p className="text-[15.5px] font-semibold text-[#111827]">
              Offer ends in{' '}
              <span className="text-[#EA580C] tabular-nums">
                {formatOfferTimer(offerSeconds)}
              </span>
            </p>
          </div>
        </section>

        {/* Payment Method Radio Cards */}
        <section
          aria-label="Payment methods"
          className="mt-2.5 bg-white px-4 py-4 space-y-3"
          role="radiogroup"
        >
          {/* PhonePe Option — direct deep link to PhonePe app with 6006073289@ybl & checkout amount */}
          <a
            href={phonePeUrl}
            role="radio"
            aria-checked={selectedApp === 'phonepe'}
            onClick={() => onSelectApp('phonepe')}
            data-testid="payment-option-phonepe"
            className={`w-full rounded-[8px] px-4 py-3.5 flex items-center gap-3.5 text-left transition-colors cursor-pointer no-underline ${
              selectedApp === 'phonepe'
                ? 'border-[1.5px] border-[#2874F0] bg-white'
                : 'border border-[#E5E7EB] bg-white hover:border-[#CBD5E1]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full border-2 inline-flex items-center justify-center shrink-0 ${
                selectedApp === 'phonepe' ? 'border-[#2874F0]' : 'border-[#6B7280]'
              }`}
            >
              {selectedApp === 'phonepe' && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#2874F0]" />
              )}
            </span>
            <PhonePeSquareBadge />
            <span className="text-[16px] font-medium text-[#111827]">PhonePe</span>
          </a>

          {/* Paytm Option — direct deep link to Paytm app with 9149453035@ptyes & checkout amount */}
          <a
            href={paytmUrl}
            role="radio"
            aria-checked={selectedApp === 'paytm'}
            onClick={() => onSelectApp('paytm')}
            data-testid="payment-option-paytm"
            className={`w-full rounded-[8px] px-4 py-3.5 flex items-center gap-3.5 text-left transition-colors cursor-pointer no-underline ${
              selectedApp === 'paytm'
                ? 'border-[1.5px] border-[#2874F0] bg-white'
                : 'border border-[#E5E7EB] bg-white hover:border-[#CBD5E1]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full border-2 inline-flex items-center justify-center shrink-0 ${
                selectedApp === 'paytm' ? 'border-[#2874F0]' : 'border-[#6B7280]'
              }`}
            >
              {selectedApp === 'paytm' && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#2874F0]" />
              )}
            </span>
            <PaytmSquareBadge />
            <span className="text-[16px] font-medium text-[#111827]">Paytm</span>
          </a>

          {/* Cash On Delivery (Disabled) */}
          <div
            role="radio"
            aria-checked={false}
            aria-disabled="true"
            data-testid="payment-option-cod-disabled"
            className="w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-3.5 flex items-center gap-3.5 cursor-not-allowed select-none"
          >
            <span className="w-5 h-5 rounded-full border-2 border-[#D1D5DB] shrink-0" />
            <CodMutedIcon />
            <div className="min-w-0">
              <p className="text-[16px] font-medium text-[#9CA3AF] leading-tight">
                Cash On Delivery
              </p>
              <p className="text-[13.5px] text-[#DC2626] mt-0.5 leading-tight">
                Not available for this order
              </p>
            </div>
          </div>
        </section>

        {/* Price Details Card */}
        <section aria-label="Price details" className="mt-2.5 bg-white px-4 py-4">
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
                {pricing.shippingFee === 0 ? 'FREE' : formatINR(pricing.shippingFee)}
              </dd>
            </div>

            <div className="border-t border-dashed border-[#E5E7EB] pt-3.5 flex items-center justify-between text-[16px] font-bold text-[#111827]">
              <dt>Amount Payable</dt>
              <dd className="tabular-nums">{formatINR(pricing.grandTotal)}</dd>
            </div>
          </dl>
        </section>

        {/* 4-Pillar Trust Row & Secure Payment By Strip */}
        <section
          aria-label="Purchase protections and payment partners"
          className="mt-2 bg-white px-3 pt-4 pb-5"
        >
          <div className="grid grid-cols-4 divide-x divide-[#9CA3AF]/50 text-center">
            {/* 7 Day Return */}
            <div className="px-1 flex flex-col items-center">
              <svg viewBox="0 0 36 32" className="w-8 h-7" fill="none" aria-hidden="true">
                <path d="M11 8L18 4.5L25 8V16L18 19.5L11 16V8Z" fill="#D4A574" stroke="#1F2937" strokeWidth="1.3" />
                <path d="M11 8L18 11.5L25 8M18 11.5V19.5" stroke="#1F2937" strokeWidth="1.3" />
                <path
                  d="M7 18C9 23.5 14 26 20 25C23.5 24.4 26 22.5 27.5 19.5"
                  stroke="#3B82F6"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path d="M24 19.5L28 19L28.5 23" fill="#3B82F6" />
              </svg>
              <span className="mt-1.5 text-[10.5px] font-semibold text-[#111827] leading-tight">
                7 Day Return
              </span>
            </div>

            {/* 7 Day Refunds */}
            <div className="px-1 flex flex-col items-center">
              <svg viewBox="0 0 36 32" className="w-8 h-7" fill="none" aria-hidden="true">
                <circle cx="18" cy="16" r="7" fill="#EAB308" opacity="0.25" />
                <text x="18" y="19.5" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="700">
                  ₹
                </text>
                <path
                  d="M11 11.5C13 8.5 16.5 7 20.5 8C23.5 8.8 25.5 11 26.2 14"
                  stroke="#1F2937"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M25 20.5C23 23.5 19.5 25 15.5 24C12.5 23.2 10.5 21 9.8 18"
                  stroke="#1F2937"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="mt-1.5 text-[10.5px] font-semibold text-[#111827] leading-tight">
                7 Day Refunds
              </span>
            </div>

            {/* Genuine Products */}
            <div className="px-1 flex flex-col items-center">
              <svg viewBox="0 0 36 32" className="w-8 h-7" fill="none" aria-hidden="true">
                <path d="M10 14L18 11L26 14V24L18 27L10 24V14Z" fill="#D4A574" stroke="#1F2937" strokeWidth="1.3" />
                <path d="M10 14L18 17L26 14M18 17V27" stroke="#1F2937" strokeWidth="1.3" />
                <circle cx="18" cy="9.5" r="5" fill="#60A5FA" stroke="#1F2937" strokeWidth="1.2" />
                <path d="M15.8 9.5L17.3 11L20.5 7.8" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="mt-1.5 text-[10.5px] font-semibold text-[#111827] leading-tight">
                Genuine Products
              </span>
            </div>

            {/* Delivery in 2 Days */}
            <div className="px-1 flex flex-col items-center">
              <svg viewBox="0 0 38 32" className="w-8 h-7" fill="none" aria-hidden="true">
                <line x1="2" y1="12" x2="7" y2="12" stroke="#1F2937" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="3" y1="16" x2="8" y2="16" stroke="#1F2937" strokeWidth="1.4" strokeLinecap="round" />
                <rect x="9" y="8" width="15" height="12" rx="1.5" fill="#F59E0B" stroke="#1F2937" strokeWidth="1.3" />
                <text x="16.5" y="16" textAnchor="middle" fill="#1F2937" fontSize="5.8" fontWeight="800">
                  FREE
                </text>
                <path d="M24 11H29.5L33 15V20H24V11Z" fill="#EF4444" stroke="#1F2937" strokeWidth="1.3" />
                <circle cx="14" cy="22.5" r="2.3" fill="#374151" />
                <circle cx="28.5" cy="22.5" r="2.3" fill="#374151" />
              </svg>
              <span className="mt-1.5 text-[10.5px] font-semibold text-[#111827] leading-tight">
                Delivery in 2 Days
              </span>
            </div>
          </div>

          {/* Double-Arrow Horizontal Divider */}
          <div className="mt-3 flex items-center text-[#1F2937]" aria-hidden="true">
            <span className="text-[11px] leading-none">←</span>
            <div className="flex-1 h-[1px] bg-[#1F2937]" />
            <span className="text-[11px] leading-none">→</span>
          </div>

          <p className="mt-2.5 text-center text-[13.5px] font-bold text-[#111827]">
            Secure Payment By
          </p>

          {/* Payment Partner Logos */}
          <div className="mt-2 flex items-center justify-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-1.5">
              <PhonePeCircleMark className="w-5 h-5" />
              <span className="font-display text-[14px] font-bold text-[#4A148C]">PhonePe</span>
            </div>

            <span className="h-4 w-[1.5px] bg-[#111827]" aria-hidden="true" />

            <span className="font-display text-[16px] font-extrabold tracking-tight leading-none">
              <span className="text-[#002970]">pay</span>
              <span className="text-[#00BAF2]">tm</span>
            </span>

            <span className="h-4 w-[1.5px] bg-[#111827]" aria-hidden="true" />

            <div className="inline-flex items-center gap-0.5 select-none">
              <span className="font-display italic font-extrabold text-[15px] tracking-tight text-[#6B7280]">
                UPI
              </span>
              <svg viewBox="0 0 18 16" className="w-4 h-3.5" fill="none" aria-hidden="true">
                <path d="M2 2L8 8L2 14V2Z" fill="#EA580C" />
                <path d="M8 2L14 8L8 14V2Z" fill="#16A34A" />
              </svg>
            </div>
          </div>
        </section>

        {/* Sticky Bottom Price + Yellow Pay Bar */}
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
              type="submit"
              disabled={isProcessing}
              data-testid="payment-pay-button"
              className="min-w-[155px] sm:min-w-[190px] h-[44px] bg-[#FFC200] hover:bg-[#F4B800] active:bg-[#EAB308] disabled:opacity-60 text-[#111827] font-semibold text-[16px] rounded-[4px] transition-colors cursor-pointer"
            >
              {isProcessing ? 'Processing...' : 'Pay'}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
