import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutPage } from './components/CheckoutPage';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { OrdersPage } from './components/OrdersPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { PRODUCTS } from './data/products';
import type {
  AppRoute,
  CartItem,
  CheckoutStep,
  Order,
  Product,
  ProductReview,
  ProductVariant,
  ShippingAddress,
} from './types/store';
import { calculatePriceBreakdown, validateCoupon } from './utils/commerce';
import {
  getInitialAppRoute,
  getParentRoute,
  isHistoryNavEntry,
  isSameRoute,
  parseHashToRoute,
  pushRouteStack,
  routeToHash,
  stepBackInStack,
  type HistoryNavEntry,
} from './utils/navigation';

const STORAGE_CART_KEY = 'utsavbazaar_cart_v1';
const STORAGE_ORDERS_KEY = 'utsavbazaar_orders_v1';
const STORAGE_LAST_PRODUCT_KEY = 'utsavbazaar_last_product_v1';
const STORAGE_NAV_STACK_KEY = 'utsavbazaar_nav_stack_v1';
const LEGACY_STORAGE_ADDRESS_KEY = 'utsavbazaar_address_v1';

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: '',
  phone: '',
  pincode: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  addressType: 'Home',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [route, setRoute] = useState<AppRoute>(() =>
    typeof window !== 'undefined' ? getInitialAppRoute(window.location.hash) : { view: 'home' },
  );
  const [routeStack, setRouteStack] = useState<AppRoute[]>(() => {
    if (typeof window === 'undefined') return [{ view: 'home' }];
    const initial = getInitialAppRoute(window.location.hash);
    if (initial.view === 'home') {
      return [{ view: 'home' }];
    }
    try {
      const raw = window.sessionStorage.getItem(STORAGE_NAV_STACK_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppRoute[];
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          isSameRoute(parsed[parsed.length - 1], initial)
        ) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return [initial];
  });
  const [activeCategory, setActiveCategory] = useState<string>('For You');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    readStorage<CartItem[]>(STORAGE_CART_KEY, []),
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    readStorage<Order[]>(STORAGE_ORDERS_KEY, []),
  );
  const [checkoutAddress, setCheckoutAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);

  const [cartOpen, setCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const historyDepthRef = useRef<number>(0);
  const sessionHistoryDepthRef = useRef<number>(0);
  const lastBackActionAtRef = useRef<number>(0);
  const routeRef = useRef<AppRoute>(route);
  const routeStackRef = useRef<AppRoute[]>(routeStack);
  const cartOpenRef = useRef<boolean>(cartOpen);
  const cartItemsRef = useRef<CartItem[]>(cartItems);
  const lastProductIdRef = useRef<string | undefined>(
    (() => {
      if (typeof window === 'undefined') return undefined;
      try {
        const fromSession = window.sessionStorage.getItem(STORAGE_LAST_PRODUCT_KEY);
        if (fromSession) return fromSession;
        const fromLocal = window.localStorage.getItem(STORAGE_LAST_PRODUCT_KEY);
        if (fromLocal) return fromLocal;
      } catch {
        // ignore
      }
      return undefined;
    })(),
  );

  const persistLastProductId = useCallback((productId: string) => {
    lastProductIdRef.current = productId;
    try {
      window.sessionStorage.setItem(STORAGE_LAST_PRODUCT_KEY, productId);
      window.localStorage.setItem(STORAGE_LAST_PRODUCT_KEY, productId);
    } catch {
      // ignore storage errors
    }
  }, []);

  const persistRouteStack = useCallback((nextStack: AppRoute[]) => {
    routeStackRef.current = nextStack;
    setRouteStack(nextStack);
    try {
      window.sessionStorage.setItem(STORAGE_NAV_STACK_KEY, JSON.stringify(nextStack));
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    routeRef.current = route;
    if (route.view === 'product') {
      persistLastProductId(route.productId);
    }
  }, [route, persistLastProductId]);

  useEffect(() => {
    cartOpenRef.current = cartOpen;
  }, [cartOpen]);

  useEffect(() => {
    cartItemsRef.current = cartItems;
    if (!lastProductIdRef.current && cartItems.length > 0) {
      persistLastProductId(cartItems[0].productId);
    }
  }, [cartItems, persistLastProductId]);

  // Initialize base history entry and listen for hardware/browser Back & Forward (popstate)
  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_ADDRESS_KEY);
    } catch {
      // ignore storage errors
    }
    const initialRoute = getInitialAppRoute(window.location.hash);
    const baseEntry: HistoryNavEntry = {
      appHistory: true,
      route: initialRoute,
      cartOpen: false,
      depth: 0,
    };
    historyDepthRef.current = 0;
    sessionHistoryDepthRef.current = 0;
    routeRef.current = initialRoute;
    cartOpenRef.current = false;
    setRoute(initialRoute);
    setCartOpen(false);
    if (initialRoute.view === 'home') {
      persistRouteStack([{ view: 'home' }]);
    }
    window.history.replaceState(baseEntry, '', routeToHash(initialRoute));

    const handlePopState = (event: PopStateEvent) => {
      const wasCartOpen = cartOpenRef.current;

      if (isHistoryNavEntry(event.state)) {
        const prevDepth = historyDepthRef.current;
        const delta = event.state.depth - prevDepth;
        historyDepthRef.current = event.state.depth;
        sessionHistoryDepthRef.current = Math.max(0, sessionHistoryDepthRef.current + delta);

        // If CartDrawer was open and user pressed Back, just close the CartDrawer without altering the page stack.
        if (wasCartOpen && !event.state.cartOpen) {
          cartOpenRef.current = false;
          setCartOpen(false);
          return;
        }

        const isBackward = delta < 0;
        if (isBackward && !event.state.cartOpen) {
          const effectiveLastProductId =
            lastProductIdRef.current ?? cartItemsRef.current[0]?.productId;
          const { nextRoute, nextStack } = stepBackInStack(
            routeStackRef.current,
            routeRef.current,
            effectiveLastProductId,
          );
          if (
            nextRoute.view !== 'home' &&
            (event.state.depth <= 0 || sessionHistoryDepthRef.current <= 0)
          ) {
            const grandParent = getParentRoute(nextRoute, effectiveLastProductId);
            const grandParentEntry: HistoryNavEntry = {
              appHistory: true,
              route: grandParent,
              cartOpen: false,
              depth: 0,
            };
            const anchoredEntry: HistoryNavEntry = {
              appHistory: true,
              route: nextRoute,
              cartOpen: false,
              depth: 1,
            };
            window.history.replaceState(grandParentEntry, '', routeToHash(grandParent));
            window.history.pushState(anchoredEntry, '', routeToHash(nextRoute));
            historyDepthRef.current = 1;
            sessionHistoryDepthRef.current = 1;
          } else if (!isSameRoute(event.state.route, nextRoute)) {
            // Browser skipped an intermediate step or hit a replaced slot; enforce exact step-by-step route
            const repairedEntry: HistoryNavEntry = {
              appHistory: true,
              route: nextRoute,
              cartOpen: false,
              depth: event.state.depth,
            };
            window.history.replaceState(repairedEntry, '', routeToHash(nextRoute));
          }
          cartOpenRef.current = false;
          routeRef.current = nextRoute;
          setCartOpen(false);
          setRoute(nextRoute);
          persistRouteStack(nextStack);
          window.scrollTo(0, 0);
          return;
        }

        routeRef.current = event.state.route;
        cartOpenRef.current = event.state.cartOpen;
        setRoute(event.state.route);
        setCartOpen(event.state.cartOpen);
        persistRouteStack(pushRouteStack(routeStackRef.current, event.state.route));
        if (!event.state.cartOpen) {
          window.scrollTo(0, 0);
        }
      } else {
        const parsed = parseHashToRoute(window.location.hash);
        historyDepthRef.current = 0;
        sessionHistoryDepthRef.current = 0;

        if (wasCartOpen) {
          cartOpenRef.current = false;
          setCartOpen(false);
          return;
        }

        const effectiveLastProductId =
          lastProductIdRef.current ?? cartItemsRef.current[0]?.productId;
        if (routeRef.current.view !== 'home') {
          const { nextRoute, nextStack } = stepBackInStack(
            routeStackRef.current,
            routeRef.current,
            effectiveLastProductId,
          );
          const repairedEntry: HistoryNavEntry = {
            appHistory: true,
            route: nextRoute,
            cartOpen: false,
            depth: 0,
          };
          window.history.replaceState(repairedEntry, '', routeToHash(nextRoute));
          cartOpenRef.current = false;
          routeRef.current = nextRoute;
          setCartOpen(false);
          setRoute(nextRoute);
          persistRouteStack(nextStack);
          window.scrollTo(0, 0);
          return;
        }

        routeRef.current = parsed;
        cartOpenRef.current = false;
        setRoute(parsed);
        setCartOpen(false);
        persistRouteStack([parsed]);
        window.scrollTo(0, 0);
      }
    };

    // Keep at least one parent history entry behind nested views whenever historyDepth is 0
    // so Android hardware Back never exits the app from Payment, Order Summary, Address, or PDP.
    const anchorParentOnGesture = (event: Event) => {
      if (historyDepthRef.current > 0 && sessionHistoryDepthRef.current > 0) return;
      const current = routeRef.current;
      if (current.view === 'home') return;

      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          '[data-testid="checkout-back-button"], [data-testid="pdp-back-button"], [data-action="nav-back"]',
        )
      ) {
        return;
      }

      const effectiveLastProductId =
        lastProductIdRef.current ?? cartItemsRef.current[0]?.productId;
      const parent = getParentRoute(current, effectiveLastProductId);
      const parentEntry: HistoryNavEntry = {
        appHistory: true,
        route: parent,
        cartOpen: false,
        depth: 0,
      };
      const currentEntry: HistoryNavEntry = {
        appHistory: true,
        route: current,
        cartOpen: cartOpenRef.current,
        depth: 1,
      };
      window.history.replaceState(parentEntry, '', routeToHash(parent));
      window.history.pushState(currentEntry, '', routeToHash(current));
      historyDepthRef.current = 1;
      sessionHistoryDepthRef.current = 1;
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pointerdown', anchorParentOnGesture, true);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pointerdown', anchorParentOnGesture, true);
    };
  }, [persistLastProductId, persistRouteStack]);

  const navigateTo = useCallback(
    (nextRoute: AppRoute, options?: { replace?: boolean }) => {
      const current = routeRef.current;
      const isReplacingCartEntry = cartOpenRef.current;

      if (!options?.replace && !isReplacingCartEntry && isSameRoute(current, nextRoute)) {
        return;
      }

      if (nextRoute.view === 'product') {
        persistLastProductId(nextRoute.productId);
      }

      const isReplace = Boolean(options?.replace || isReplacingCartEntry);
      const nextDepth = isReplace ? historyDepthRef.current : historyDepthRef.current + 1;

      const entry: HistoryNavEntry = {
        appHistory: true,
        route: nextRoute,
        cartOpen: false,
        depth: nextDepth,
      };

      historyDepthRef.current = nextDepth;
      if (!isReplace) {
        sessionHistoryDepthRef.current += 1;
      }

      if (isReplace) {
        window.history.replaceState(entry, '', routeToHash(nextRoute));
      } else {
        window.history.pushState(entry, '', routeToHash(nextRoute));
      }

      cartOpenRef.current = false;
      routeRef.current = nextRoute;
      setCartOpen(false);
      setRoute(nextRoute);
      persistRouteStack(pushRouteStack(routeStackRef.current, nextRoute));
      window.scrollTo(0, 0);
    },
    [persistLastProductId, persistRouteStack],
  );

  const openCartDrawer = useCallback(() => {
    if (cartOpenRef.current) return;
    const nextDepth = historyDepthRef.current + 1;
    const entry: HistoryNavEntry = {
      appHistory: true,
      route: routeRef.current,
      cartOpen: true,
      depth: nextDepth,
    };
    historyDepthRef.current = nextDepth;
    sessionHistoryDepthRef.current += 1;
    cartOpenRef.current = true;
    window.history.pushState(entry, '', routeToHash(routeRef.current));
    setCartOpen(true);
  }, []);

  const closeCartDrawer = useCallback(() => {
    if (!cartOpenRef.current) return;
    const currentState = window.history.state;
    if (
      isHistoryNavEntry(currentState) &&
      currentState.cartOpen &&
      currentState.depth > 0 &&
      sessionHistoryDepthRef.current > 0
    ) {
      window.history.back();
    } else {
      cartOpenRef.current = false;
      setCartOpen(false);
    }
  }, []);

  const handleGoBack = useCallback(() => {
    const now = Date.now();
    if (now - lastBackActionAtRef.current < 180) {
      return;
    }
    lastBackActionAtRef.current = now;

    const current = routeRef.current;
    if (current.view === 'home') {
      return;
    }

    const effectiveLastProductId =
      lastProductIdRef.current ?? cartItemsRef.current[0]?.productId;
    const { nextRoute, nextStack } = stepBackInStack(
      routeStackRef.current,
      current,
      effectiveLastProductId,
    );

    if (
      nextRoute.view !== 'home' &&
      (historyDepthRef.current === 0 || sessionHistoryDepthRef.current === 0)
    ) {
      // Anchor grandParent behind nextRoute so subsequent hardware Back also stays in-app
      const grandParent = getParentRoute(nextRoute, effectiveLastProductId);
      const grandParentEntry: HistoryNavEntry = {
        appHistory: true,
        route: grandParent,
        cartOpen: false,
        depth: 0,
      };
      const parentEntry: HistoryNavEntry = {
        appHistory: true,
        route: nextRoute,
        cartOpen: false,
        depth: 1,
      };
      window.history.replaceState(grandParentEntry, '', routeToHash(grandParent));
      window.history.pushState(parentEntry, '', routeToHash(nextRoute));
      historyDepthRef.current = 1;
      sessionHistoryDepthRef.current = 1;
    } else {
      const entry: HistoryNavEntry = {
        appHistory: true,
        route: nextRoute,
        cartOpen: false,
        depth: historyDepthRef.current,
      };
      window.history.replaceState(entry, '', routeToHash(nextRoute));
    }

    cartOpenRef.current = false;
    routeRef.current = nextRoute;
    setCartOpen(false);
    setRoute(nextRoute);
    persistRouteStack(nextStack);
    window.scrollTo(0, 0);
  }, [persistRouteStack]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore quota errors
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // ignore quota errors
    }
  }, [orders]);

  const pricing = useMemo(
    () => calculatePriceBreakdown(cartItems, couponCode),
    [cartItems, couponCode],
  );

  const setSelectedCheckoutItem = (product: Product, variant: ProductVariant, quantity: number) => {
    persistLastProductId(product.id);
    setCartItems([
      {
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        fullTitle: product.fullTitle ?? product.name,
        brand: product.brand,
        variantLabel: variant.label,
        image: product.image,
        assured: product.assured,
        price: variant.price,
        mrp: variant.mrp,
        quantity,
      },
    ]);
  };

  const handlePdpAddToCart = (product: Product, variant: ProductVariant, quantity: number) => {
    setSelectedCheckoutItem(product, variant, quantity);
    setCheckoutAddress(EMPTY_ADDRESS);
    navigateTo({ view: 'checkout', step: 'address' });
  };

  const handleBuyNow = (product: Product, variant: ProductVariant, quantity: number) => {
    setSelectedCheckoutItem(product, variant, quantity);
    setCheckoutAddress(EMPTY_ADDRESS);
    navigateTo({ view: 'checkout', step: 'address' });
  };

  const handleSaveAddress = useCallback((addr: ShippingAddress) => {
    setCheckoutAddress(addr);
  }, []);

  const handleAdvanceCheckoutStep = useCallback(
    (nextStep: CheckoutStep) => {
      navigateTo({ view: 'checkout', step: nextStep });
    },
    [navigateTo],
  );

  const handleReplaceToAddress = useCallback(() => {
    navigateTo({ view: 'checkout', step: 'address' }, { replace: true });
  }, [navigateTo]);

  const handleUpdateQty = (productId: string, variantId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveItem = (productId: string, variantId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variantId === variantId)),
    );
  };

  const handleApplyCoupon = (code: string) => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const res = validateCoupon(code, subtotal);
    setCouponFeedback({ valid: res.valid, message: res.message });
    if (res.valid && res.coupon) {
      setCouponCode(res.coupon.code);
    } else {
      setCouponCode('');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponFeedback(null);
  };

  const handleOrderComplete = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCheckoutAddress(EMPTY_ADDRESS);
    setCartItems([]);
    setCouponCode('');
    setCouponFeedback(null);
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: 'Cancelled' } : order)),
    );
  };

  const handleAddReview = (productId: string, review: ProductReview) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        const nextReviews = [review, ...prod.reviews];
        const nextCount = prod.reviewCount + 1;
        const avg =
          nextReviews.reduce((sum, r) => sum + r.rating, 0) / nextReviews.length;
        return {
          ...prod,
          reviews: nextReviews,
          reviewCount: nextCount,
          rating: Math.round(avg * 10) / 10,
        };
      }),
    );
  };

  const navigateHome = (category?: string) => {
    if (category) setActiveCategory(category);
    navigateTo({ view: 'home' });
  };

  const navigateProduct = (productId: string) => {
    navigateTo({ view: 'product', productId });
  };

  const navigateOrders = (highlightOrderId?: string) => {
    navigateTo(highlightOrderId ? { view: 'orders', highlightOrderId } : { view: 'orders' });
  };

  const previousRoute =
    routeStack.length >= 2 ? routeStack[routeStack.length - 2] : undefined;
  const checkoutBackLabel =
    previousRoute?.view === 'product' ? 'Back to Product' : 'Back to Store';

  const activeProduct =
    route.view === 'product'
      ? products.find((p) => p.id === route.productId) ?? products[0]
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F3F6] text-[#111827]">
      {route.view !== 'home' && route.view !== 'product' && route.view !== 'checkout' && (
        <Header
          route={route}
          activeCategory={activeCategory}
          orderCount={orders.length}
          onNavigateHome={navigateHome}
          onNavigateOrders={() => navigateOrders()}
          onOpenCart={openCartDrawer}
        />
      )}

      <div className="flex-1">
        {route.view === 'home' && (
          <HomePage
            products={products}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            orderCount={orders.length}
            onCategoryChange={setActiveCategory}
            onSearchChange={setSearchQuery}
            onSelectProduct={navigateProduct}
            onOpenCart={openCartDrawer}
            onNavigateOrders={() => navigateOrders()}
          />
        )}

        {route.view === 'product' && activeProduct && (
          <ProductDetailPage
            key={activeProduct.id}
            product={activeProduct}
            relatedProducts={products.filter((p) => p.id !== activeProduct.id)}
            onBack={handleGoBack}
            onOpenCart={openCartDrawer}
            onAddToCart={handlePdpAddToCart}
            onBuyNow={handleBuyNow}
            onSelectProduct={navigateProduct}
            onAddReview={handleAddReview}
          />
        )}

        {route.view === 'checkout' && (
          <CheckoutPage
            step={route.step === 'payment' ? 3 : route.step === 'summary' ? 2 : 1}
            items={cartItems}
            pricing={pricing}
            initialAddress={checkoutAddress}
            backLabel={checkoutBackLabel}
            onBack={handleGoBack}
            onAdvanceStep={handleAdvanceCheckoutStep}
            onReplaceToAddress={handleReplaceToAddress}
            onSaveAddress={handleSaveAddress}
            onBackToStore={() => navigateHome()}
            onOrderComplete={handleOrderComplete}
            onViewOrders={(orderId) => navigateOrders(orderId)}
          />
        )}

        {route.view === 'orders' && (
          <OrdersPage
            orders={orders}
            highlightOrderId={route.highlightOrderId}
            onBackToStore={handleGoBack}
            onCancelOrder={handleCancelOrder}
          />
        )}
      </div>

      {/* Quiet Editorial Footer (hidden on checkout so delivery address matches full-height white flow) */}
      {route.view !== 'checkout' && (
        <footer className="border-t border-stone-200 bg-white mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-500">
            <div>
              <p className="font-display text-sm font-bold text-stone-900">Shopping</p>
              <p className="mt-1">
                Curated festive essentials · Express pan-India shipping &amp; GST billing
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => navigateHome('For You')}
                className="hover:text-stone-900 cursor-pointer"
              >
                All Deals
              </button>
              <button
                type="button"
                onClick={() => navigateOrders()}
                className="hover:text-stone-900 cursor-pointer"
              >
                Track Orders
              </button>
              <button
                type="button"
                onClick={openCartDrawer}
                className="hover:text-stone-900 cursor-pointer"
              >
                Shopping Cart
              </button>
              <span>© 2026 Shopping Retail</span>
            </div>
          </div>
        </footer>
      )}

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        pricing={pricing}
        couponCode={couponCode}
        couponFeedback={couponFeedback}
        onClose={closeCartDrawer}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        onProceedToCheckout={() => {
          setCheckoutAddress(EMPTY_ADDRESS);
          navigateTo({ view: 'checkout', step: 'address' });
        }}
      />
    </div>
  );
}
