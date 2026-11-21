import { useEffect, useState } from 'react';
import type { Order } from '../types/store';

interface OrderSuccessFlowProps {
  order: Order;
  onContinueShopping: () => void;
  animationDurationMs?: number;
}

function ParcelBoxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" fill="none" aria-hidden="true">
      <path d="M12 2.5L20.5 7L12 11.5L3.5 7L12 2.5Z" fill="#D9A76A" />
      <path d="M3.5 7L12 11.5V21L3.5 16.5V7Z" fill="#B88045" />
      <path d="M20.5 7L12 11.5V21L20.5 16.5V7Z" fill="#9E6A36" />
      <path d="M7.6 4.8L16.1 9.3L14 10.4L5.5 5.9L7.6 4.8Z" fill="#F3D9B1" />
    </svg>
  );
}

function LightningBoltIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4 shrink-0" fill="none" aria-hidden="true">
      <path
        d="M9.5 1.5L3.5 9H8L6.5 14.5L12.5 7H8L9.5 1.5Z"
        fill="#FACC15"
        stroke="#EAB308"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OrderSuccessFlow({
  order,
  onContinueShopping,
  animationDurationMs = 2000,
}: OrderSuccessFlowProps) {
  const [phase, setPhase] = useState<'tick' | 'thanks'>('tick');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPhase('thanks');
      window.scrollTo(0, 0);
    }, animationDurationMs);
    return () => window.clearTimeout(timer);
  }, [animationDurationMs]);

  if (phase === 'tick') {
    return (
      <main
        data-testid="order-tick-animation"
        className="min-h-screen bg-[#F1F3F6] flex items-center justify-center px-5 py-8"
      >
        <div className="w-full max-w-[360px] bg-white rounded-[16px] shadow-[0_8px_30px_rgba(15,23,42,0.08)] px-6 py-11 text-center relative overflow-hidden animate-order-card">
          {/* Animated Green Tick + Confetti Dots */}
          <div className="relative w-[240px] h-[112px] mx-auto flex items-center justify-center">
            {/* Left Confetti Dots */}
            <span className="animate-order-confetti absolute left-1 top-6 w-2 h-2 rounded-full bg-[#E5E7EB]" aria-hidden="true" />
            <span className="animate-order-confetti absolute left-10 top-5 w-2.5 h-2.5 rounded-full bg-[#93C5FD]" aria-hidden="true" />
            <span className="animate-order-confetti absolute left-11 top-14 w-2 h-2 rounded-full bg-[#FDE68A]" aria-hidden="true" />
            <span className="animate-order-confetti absolute left-16 bottom-1 w-3.5 h-3.5 rounded-full bg-[#F87171]" aria-hidden="true" />
            <span className="animate-order-confetti absolute left-[96px] bottom-0.5 w-3 h-3 rounded-full bg-[#22C55E]" aria-hidden="true" />

            {/* Right Confetti Dots */}
            <span className="animate-order-confetti absolute right-14 top-5 w-2.5 h-2.5 rounded-full bg-[#60A5FA]" aria-hidden="true" />
            <span className="animate-order-confetti absolute right-7 top-4 w-2.5 h-2.5 rounded-full bg-[#C084FC]" aria-hidden="true" />
            <span className="animate-order-confetti absolute right-2 top-8 w-3 h-3 rounded-full bg-[#FB7185]" aria-hidden="true" />
            <span className="animate-order-confetti absolute right-2.5 top-12 w-2 h-2 rounded-full bg-[#86EFAC]" aria-hidden="true" />
            <span className="animate-order-confetti absolute right-11 top-14 w-1.5 h-1.5 rounded-full bg-[#FDE047]" aria-hidden="true" />
            <span className="animate-order-confetti absolute right-2 bottom-4 w-3 h-3 rounded-full bg-[#34D399]" aria-hidden="true" />
            <span className="animate-order-confetti absolute -right-4 bottom-2 w-2.5 h-2.5 rounded-full bg-[#FACC15]" aria-hidden="true" />

            {/* Central Green Checkmark Badge */}
            <div className="animate-order-tick-circle w-[86px] h-[86px] rounded-full bg-[#1BA65B] inline-flex items-center justify-center shadow-[0_6px_20px_rgba(27,166,91,0.28)] relative z-10">
              <svg viewBox="0 0 40 40" className="w-11 h-11" fill="none" aria-hidden="true">
                <path
                  d="M11 20.5L17 26.5L29.5 14"
                  stroke="#FFFFFF"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-order-tick-stroke"
                />
              </svg>
            </div>
          </div>

          <h1 className="mt-4 text-[21px] font-bold text-[#111827] tracking-[-0.01em]">
            Order Placed Successfully
          </h1>

          <p className="mt-3 inline-flex items-center justify-center gap-2 text-[14.5px] font-medium text-[#6B7280]">
            <span
              aria-hidden="true"
              className="w-[20px] h-[20px] rounded-full bg-[#FFD400] border border-[#F59E0B] text-[#92400E] text-[11px] font-extrabold inline-flex items-center justify-center shrink-0"
            >
              S
            </span>
            <span>5 SuperCoins on the way</span>
          </p>
        </div>
      </main>
    );
  }

  const formattedAddress = [
    order.address.addressLine1,
    order.address.addressLine2,
    order.address.city,
    order.address.state,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');
  const addressWithPin = formattedAddress
    ? `${formattedAddress}${order.address.pincode ? ` - ${order.address.pincode}` : ''}`
    : 'Address not available';

  return (
    <main
      data-testid="order-thanks-page"
      className="min-h-screen bg-[#F1F3F6] flex flex-col pb-[68px]"
    >
      {/* Top Confirmation Header Card */}
      <section className="bg-white border-b border-[#E5E7EB] px-4 py-5">
        <div className="max-w-2xl mx-auto flex items-start gap-4">
          <span className="w-[50px] h-[50px] rounded-full bg-[#1BA65B] inline-flex items-center justify-center shrink-0 mt-0.5">
            <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" aria-hidden="true">
              <path
                d="M8.5 16.5L13.5 21.5L23.5 11.5"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <div className="min-w-0">
            <h1 className="text-[19px] font-bold text-[#111827] leading-snug">
              Thanks for shopping with us!
            </h1>
            <p className="text-[13.5px] text-[#6B7280] mt-0.5">
              Delivery by {order.estimatedDelivery}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#15803D]">
              <LightningBoltIcon />
              <span>10 SuperCoins on the way</span>
            </p>
          </div>
        </div>
      </section>

      {/* Delivery Date, Customer Address & Open Box OTP Card */}
      <section className="mt-2.5 bg-white border-y border-[#E5E7EB]">
        <div className="max-w-2xl mx-auto px-4">
          <div className="py-4 border-b border-[#E5E7EB]">
            <p className="text-[15.5px] font-bold text-[#111827]">
              Delivery by {order.estimatedDelivery}
            </p>
          </div>

          <div className="py-4 border-b border-[#E5E7EB]">
            <p className="text-[15.5px] font-bold text-[#111827]">
              {order.address.fullName.trim() || 'Customer'}
            </p>
            <p className="text-[14px] text-[#6B7280] mt-1 leading-relaxed">
              {addressWithPin}
            </p>
            <p className="text-[14px] text-[#6B7280] mt-1">
              Phone number: {order.address.phone.trim() || '—'}
            </p>
          </div>

          <div className="py-4">
            <div className="bg-[#F9FAFB] rounded-[8px] px-4 py-4">
              <div className="flex items-center gap-2">
                <ParcelBoxIcon />
                <h2 className="text-[14.5px] font-bold text-[#111827]">
                  Delivery requires an OTP
                </h2>
              </div>
              <p className="mt-2 text-[13.5px] leading-[1.55] text-[#4B5563]">
                We will open the package at your doorstep to check for damages or wrong product
                delivery. An OTP will be shared when the order is out for delivery.
              </p>
              <p className="mt-3 text-[13.5px] leading-[1.55] text-[#4B5563]">
                Share the OTP with the agent to confirm open box delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Width Bottom Blue Continue Shopping CTA */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-[#2874F0] shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={onContinueShopping}
          data-testid="continue-shopping-button"
          className="w-full h-[52px] bg-[#2874F0] hover:bg-[#1E60D5] active:bg-[#1D4ED8] text-white font-bold text-[16px] tracking-[0.01em] transition-colors cursor-pointer"
        >
          Continue Shopping
        </button>
      </div>
    </main>
  );
}
