import type { AppRoute, CheckoutStep } from '../types/store';

export interface HistoryNavEntry {
  appHistory: true;
  route: AppRoute;
  cartOpen: boolean;
  depth: number;
}

export function normalizeCheckoutStep(step?: CheckoutStep): CheckoutStep {
  return step ?? 'address';
}

export function isSameRoute(a: AppRoute, b: AppRoute): boolean {
  if (a.view !== b.view) return false;
  if (a.view === 'product' && b.view === 'product') {
    return a.productId === b.productId;
  }
  if (a.view === 'checkout' && b.view === 'checkout') {
    return normalizeCheckoutStep(a.step) === normalizeCheckoutStep(b.step);
  }
  if (a.view === 'orders' && b.view === 'orders') {
    return a.highlightOrderId === b.highlightOrderId;
  }
  return true;
}

export function routeToHash(route: AppRoute): string {
  switch (route.view) {
    case 'home':
      return '#/';
    case 'product':
      return `#/product/${encodeURIComponent(route.productId)}`;
    case 'checkout': {
      const step = normalizeCheckoutStep(route.step);
      return step === 'address' ? '#/checkout' : `#/checkout/${step}`;
    }
    case 'orders':
      return route.highlightOrderId
        ? `#/orders?highlight=${encodeURIComponent(route.highlightOrderId)}`
        : '#/orders';
  }
}

export function parseHashToRoute(rawHash: string): AppRoute {
  const cleaned = rawHash.replace(/^#/, '').trim();
  if (!cleaned || cleaned === '/') {
    return { view: 'home' };
  }

  const [pathPart, queryPart = ''] = cleaned.split('?');
  const normalizedPath = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;

  if (normalizedPath.startsWith('/product/')) {
    const productId = decodeURIComponent(normalizedPath.slice('/product/'.length)).trim();
    if (productId) {
      return { view: 'product', productId };
    }
  }

  if (normalizedPath === '/checkout' || normalizedPath === '/checkout/address') {
    return { view: 'checkout', step: 'address' };
  }
  if (normalizedPath === '/checkout/summary') {
    return { view: 'checkout', step: 'summary' };
  }
  if (normalizedPath === '/checkout/payment') {
    return { view: 'checkout', step: 'payment' };
  }

  if (normalizedPath === '/orders') {
    const params = new URLSearchParams(queryPart);
    const highlightOrderId = params.get('highlight') || undefined;
    return highlightOrderId ? { view: 'orders', highlightOrderId } : { view: 'orders' };
  }

  return { view: 'home' };
}

export function isHistoryNavEntry(state: unknown): state is HistoryNavEntry {
  if (!state || typeof state !== 'object') return false;
  const candidate = state as Partial<HistoryNavEntry>;
  return (
    candidate.appHistory === true &&
    typeof candidate.depth === 'number' &&
    typeof candidate.cartOpen === 'boolean' &&
    Boolean(candidate.route && typeof candidate.route === 'object' && 'view' in candidate.route)
  );
}

/**
 * Pure stack helpers for deterministic navigation stack modeling & testing.
 */
export function pushRouteStack(stack: AppRoute[], next: AppRoute): AppRoute[] {
  if (next.view === 'home') {
    return [{ view: 'home' }];
  }
  const current = stack[stack.length - 1];
  if (current && isSameRoute(current, next)) {
    return stack;
  }
  return [...stack, next];
}

export function popRouteStack(stack: AppRoute[]): AppRoute[] {
  if (stack.length <= 1) {
    return [{ view: 'home' }];
  }
  return stack.slice(0, -1);
}

export function getParentRoute(current: AppRoute, lastProductId?: string): AppRoute {
  if (current.view === 'checkout') {
    const step = normalizeCheckoutStep(current.step);
    if (step === 'payment') {
      return { view: 'checkout', step: 'summary' };
    }
    if (step === 'summary') {
      return { view: 'checkout', step: 'address' };
    }
    if (lastProductId) {
      return { view: 'product', productId: lastProductId };
    }
    return { view: 'home' };
  }
  if (current.view === 'product' || current.view === 'orders') {
    return { view: 'home' };
  }
  return { view: 'home' };
}

export function stepBackInStack(
  stack: AppRoute[],
  currentRoute: AppRoute,
  lastProductId?: string,
): { nextRoute: AppRoute; nextStack: AppRoute[] } {
  if (stack.length >= 2) {
    const trimmed = stack.slice(0, -1);
    const candidate = trimmed[trimmed.length - 1];
    if (!isSameRoute(candidate, currentRoute)) {
      return { nextRoute: candidate, nextStack: trimmed };
    }
  }
  const fallback = getParentRoute(currentRoute, lastProductId);
  return {
    nextRoute: fallback,
    nextStack: [fallback],
  };
}

export function getInitialAppRoute(rawHash: string): AppRoute {
  const parsed = parseHashToRoute(rawHash);
  if (parsed.view === 'checkout') {
    return { view: 'home' };
  }
  return parsed;
}
