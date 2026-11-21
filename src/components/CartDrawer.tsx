import { useEffect, useState, type FormEvent } from 'react';
import { Minus, Plus, ShoppingBag, Tag, Trash2, X } from 'lucide-react';
import { AVAILABLE_COUPONS } from '../data/products';
import type { CartItem, PriceBreakdown } from '../types/store';
import { formatINR } from '../utils/commerce';
import { SmartImage } from './SmartImage';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  pricing: PriceBreakdown;
  couponCode: string;
  couponFeedback: { valid: boolean; message: string } | null;
  onClose: () => void;
  onUpdateQty: (productId: string, variantId: string, delta: number) => void;
  onRemoveItem: (productId: string, variantId: string) => void;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  onProceedToCheckout: () => void;
}

export function CartDrawer({
  open,
  items,
  pricing,
  couponCode,
  couponFeedback,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onApplyCoupon,
  onRemoveCoupon,
  onProceedToCheckout,
}: CartDrawerProps) {
  const [codeInput, setCodeInput] = useState(couponCode);

  useEffect(() => {
    setCodeInput(couponCode);
  }, [couponCode]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleCouponSubmit = (e: FormEvent) => {
    e.preventDefault();
    onApplyCoupon(codeInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-stone-950/45 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        className="relative z-10 w-full max-w-md bg-white h-full flex flex-col shadow-2xl"
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-stone-950">
              Shopping Cart
            </h2>
            {pricing.itemCount > 0 && pricing.shippingFee === 0 && (
              <p className="text-xs text-emerald-700 font-medium">
                Unlocked Free Express Delivery
              </p>
            )}
            {pricing.itemCount > 0 && pricing.shippingFee > 0 && (
              <p className="text-xs text-stone-600">
                Add {formatINR(pricing.freeShippingThreshold - (pricing.subtotal - pricing.couponDiscount))} more for Free Delivery
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping cart"
            className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-950 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-stone-400" aria-hidden="true" />
            </div>
            <p className="font-display text-lg font-semibold text-stone-900">Your cart is empty</p>
            <p className="text-sm text-stone-500 mt-1 mb-5 max-w-xs">
              Explore our curated festive deals on audio, wearables, kitchen essentials, and decor.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-stone-200">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="py-4 first:pt-0 flex gap-3.5"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                    <SmartImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display text-sm font-semibold text-stone-950 line-clamp-2 leading-snug">
                        {item.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.productId, item.variantId)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="p-1 text-stone-400 hover:text-red-700 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{item.variantLabel}</p>

                    <div className="flex items-center justify-between gap-2 mt-3">
                      <div className="inline-flex items-center border border-stone-300 rounded-md">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.productId, item.variantId, -1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="w-8 h-8 inline-flex items-center justify-center text-stone-700 hover:bg-stone-100 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.productId, item.variantId, 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="w-8 h-8 inline-flex items-center justify-center text-stone-700 hover:bg-stone-100 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold text-stone-950 tabular-nums">
                          {formatINR(item.price * item.quantity)}
                        </p>
                        <p className="font-mono text-[11px] text-stone-400 line-through tabular-nums">
                          {formatINR(item.mrp * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Coupon Section */}
              <div className="pt-4 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                  <Tag className="w-3.5 h-3.5 text-[#C2410C]" aria-hidden="true" />
                  <span>Apply Festive Coupon</span>
                </div>
                <form onSubmit={handleCouponSubmit} className="flex gap-2">
                  <label htmlFor="cart-coupon-input" className="sr-only">
                    Coupon code
                  </label>
                  <input
                    id="cart-coupon-input"
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter DIWALI10 or FESTIVE250"
                    className="flex-1 px-3 py-2 text-xs font-mono uppercase border border-stone-300 rounded-lg focus:border-[#C2410C] focus:outline-none min-h-[38px]"
                  />
                  {pricing.appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCodeInput('');
                        onRemoveCoupon();
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer"
                    >
                      Apply
                    </button>
                  )}
                </form>

                {couponFeedback && (
                  <p
                    data-testid="coupon-feedback"
                    className={`text-xs font-medium ${
                      couponFeedback.valid ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}

                {!pricing.appliedCoupon && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {AVAILABLE_COUPONS.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCodeInput(c.code);
                          onApplyCoupon(c.code);
                        }}
                        className="px-2.5 py-1 text-[11px] font-mono font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded border border-stone-200 cursor-pointer"
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Price Summary & Checkout CTA */}
            <div className="border-t border-stone-200 bg-stone-50 px-5 py-4 space-y-3">
              <dl className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <dt>MRP Total</dt>
                  <dd className="font-mono tabular-nums">{formatINR(pricing.mrpTotal)}</dd>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <dt>Festive Discount</dt>
                  <dd className="font-mono tabular-nums">−{formatINR(pricing.festiveSavings)}</dd>
                </div>
                {pricing.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <dt>Coupon ({pricing.appliedCoupon?.code})</dt>
                    <dd className="font-mono tabular-nums">−{formatINR(pricing.couponDiscount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Delivery Charges</dt>
                  <dd className="font-mono tabular-nums">
                    {pricing.shippingFee === 0 ? 'FREE' : formatINR(pricing.shippingFee)}
                  </dd>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-950 pt-2 border-t border-stone-200">
                  <dt>Total Payable</dt>
                  <dd data-testid="cart-grand-total" className="font-mono tabular-nums">
                    {formatINR(pricing.grandTotal)}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={onProceedToCheckout}
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-lg transition-colors cursor-pointer min-h-[44px]"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
