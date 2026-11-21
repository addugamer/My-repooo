import { ArrowLeft, CheckCircle2, Package, Truck, XCircle } from 'lucide-react';
import type { Order } from '../types/store';
import { formatINR } from '../utils/commerce';
import { SmartImage } from './SmartImage';

interface OrdersPageProps {
  orders: Order[];
  highlightOrderId?: string;
  onBackToStore: () => void;
  onCancelOrder: (orderId: string) => void;
}

const TRACKING_STEPS = ['Confirmed', 'Packed', 'Shipped', 'Delivered'] as const;

export function OrdersPage({
  orders,
  highlightOrderId,
  onBackToStore,
  onCancelOrder,
}: OrdersPageProps) {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-16">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-950">My Orders</h1>
          <p className="text-sm text-stone-600 mt-1">
            Track shipments, view payment receipts, and manage recent orders.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToStore}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-700 hover:text-stone-950 cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Store</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-10 text-center">
          <Package className="w-10 h-10 text-stone-400 mx-auto mb-3 stroke-[1.5]" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-stone-900">No orders placed yet</h2>
          <p className="text-sm text-stone-500 mt-1 mb-5">
            Once you complete checkout, your order receipt and live delivery timeline will appear
            here.
          </p>
          <button
            type="button"
            onClick={onBackToStore}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer"
          >
            Explore Festive Deals
          </button>
        </div>
      ) : (
        <div className="space-y-5" data-testid="orders-list">
          {orders.map((order) => {
            const isHighlighted = order.id === highlightOrderId;
            const isCancelled = order.status === 'Cancelled';
            const stepIndex = TRACKING_STEPS.indexOf(
              order.status === 'Cancelled' ? 'Confirmed' : order.status,
            );

            return (
              <article
                key={order.id}
                className={`bg-white border rounded-xl p-5 sm:p-6 space-y-5 ${
                  isHighlighted ? 'border-[#C2410C] ring-1 ring-[#C2410C]/30' : 'border-stone-200'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-stone-200">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="font-mono font-semibold text-stone-900">#{order.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>Placed {order.createdAt}</span>
                    </div>
                    <p className="text-sm font-semibold text-stone-900 mt-1 flex items-center gap-1.5">
                      {isCancelled ? (
                        <>
                          <XCircle className="w-4 h-4 text-red-700" aria-hidden="true" />
                          <span className="text-red-700">Order Cancelled</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                          <span>
                            {order.status} · Est. Delivery {order.estimatedDelivery}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-stone-950 tabular-nums">
                      {formatINR(order.pricing.grandTotal)}
                    </p>
                    <p className="text-xs text-stone-500">{order.paymentSummary}</p>
                  </div>
                </div>

                {/* Tracking Progress */}
                {!isCancelled && (
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {TRACKING_STEPS.map((label, idx) => {
                      const done = idx <= stepIndex;
                      return (
                        <div key={label} className="space-y-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              done ? 'bg-emerald-600' : 'bg-stone-200'
                            }`}
                          />
                          <p className={done ? 'font-semibold text-stone-900' : 'text-stone-400'}>
                            {label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Items */}
                <div className="divide-y divide-stone-100">
                  {order.items.map((item) => (
                    <div
                      key={`${order.id}-${item.productId}-${item.variantId}`}
                      className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                          <SmartImage
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-sm font-semibold text-stone-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-stone-500">
                            {item.variantLabel} · Qty {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-semibold text-stone-900 tabular-nums shrink-0">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping Destination & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-100 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-stone-400 shrink-0" aria-hidden="true" />
                    <span>
                      Deliver to {order.address.fullName}, {order.address.city} –{' '}
                      <span className="font-mono">{order.address.pincode}</span>
                    </span>
                  </div>

                  {!isCancelled && order.status === 'Confirmed' && (
                    <button
                      type="button"
                      onClick={() => onCancelOrder(order.id)}
                      className="text-xs font-semibold text-red-700 hover:underline cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
