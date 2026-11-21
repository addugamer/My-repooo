import test from 'node:test';
import assert from 'node:assert/strict';
import type { AppRoute } from '../types/store';
import {
  getInitialAppRoute,
  getParentRoute,
  isHistoryNavEntry,
  isSameRoute,
  parseHashToRoute,
  popRouteStack,
  pushRouteStack,
  routeToHash,
  stepBackInStack,
} from './navigation';

test('routeToHash and parseHashToRoute round-trip all application views', () => {
  const homeHash = routeToHash({ view: 'home' });
  assert.equal(homeHash, '#/');
  assert.deepEqual(parseHashToRoute(homeHash), { view: 'home' });
  assert.deepEqual(parseHashToRoute(''), { view: 'home' });

  const pdpHash = routeToHash({ view: 'product', productId: 'smartbuy-cordless-drill' });
  assert.equal(pdpHash, '#/product/smartbuy-cordless-drill');
  assert.deepEqual(parseHashToRoute(pdpHash), {
    view: 'product',
    productId: 'smartbuy-cordless-drill',
  });

  const checkoutHash = routeToHash({ view: 'checkout', step: 'address' });
  assert.equal(checkoutHash, '#/checkout');
  assert.deepEqual(parseHashToRoute(checkoutHash), { view: 'checkout', step: 'address' });

  const summaryHash = routeToHash({ view: 'checkout', step: 'summary' });
  assert.equal(summaryHash, '#/checkout/summary');
  assert.deepEqual(parseHashToRoute(summaryHash), { view: 'checkout', step: 'summary' });

  const paymentHash = routeToHash({ view: 'checkout', step: 'payment' });
  assert.equal(paymentHash, '#/checkout/payment');
  assert.deepEqual(parseHashToRoute(paymentHash), { view: 'checkout', step: 'payment' });

  const ordersHash = routeToHash({ view: 'orders', highlightOrderId: 'UB-2026-12345' });
  assert.equal(ordersHash, '#/orders?highlight=UB-2026-12345');
  assert.deepEqual(parseHashToRoute(ordersHash), {
    view: 'orders',
    highlightOrderId: 'UB-2026-12345',
  });

  assert.deepEqual(parseHashToRoute('#/unknown/path'), { view: 'home' });
});

test('pushRouteStack and popRouteStack step back Home <- PDP <- Address <- Summary <- Payment cleanly', () => {
  let stack: AppRoute[] = [{ view: 'home' }];

  // Home -> Product Detail
  stack = pushRouteStack(stack, { view: 'product', productId: 'green-soul-kiev-chair' });
  assert.equal(stack.length, 2);
  assert.deepEqual(stack[stack.length - 1], {
    view: 'product',
    productId: 'green-soul-kiev-chair',
  });

  // Duplicate push is ignored
  stack = pushRouteStack(stack, { view: 'product', productId: 'green-soul-kiev-chair' });
  assert.equal(stack.length, 2);

  // Product Detail -> Address -> Order Summary -> Payment
  stack = pushRouteStack(stack, { view: 'checkout', step: 'address' });
  stack = pushRouteStack(stack, { view: 'checkout', step: 'summary' });
  stack = pushRouteStack(stack, { view: 'checkout', step: 'payment' });
  assert.equal(stack.length, 5);
  assert.deepEqual(stack[stack.length - 1], { view: 'checkout', step: 'payment' });

  // Back from Payment -> Order Summary
  stack = popRouteStack(stack);
  assert.deepEqual(stack[stack.length - 1], { view: 'checkout', step: 'summary' });

  // Back from Order Summary -> Address
  stack = popRouteStack(stack);
  assert.deepEqual(stack[stack.length - 1], { view: 'checkout', step: 'address' });

  // Back from Address -> returns to Product Detail (NOT Home)
  stack = popRouteStack(stack);
  assert.equal(stack.length, 2);
  assert.deepEqual(stack[stack.length - 1], {
    view: 'product',
    productId: 'green-soul-kiev-chair',
  });

  // Back from Product Detail -> returns to Home
  stack = popRouteStack(stack);
  assert.equal(stack.length, 1);
  assert.deepEqual(stack[stack.length - 1], { view: 'home' });

  // Back at root stays safely at Home
  stack = popRouteStack(stack);
  assert.deepEqual(stack, [{ view: 'home' }]);
});

test('isSameRoute and isHistoryNavEntry validate route equality and history entries', () => {
  assert.equal(
    isSameRoute({ view: 'product', productId: 'a' }, { view: 'product', productId: 'a' }),
    true,
  );
  assert.equal(
    isSameRoute({ view: 'product', productId: 'a' }, { view: 'product', productId: 'b' }),
    false,
  );
  assert.equal(
    isHistoryNavEntry({
      appHistory: true,
      route: { view: 'checkout' },
      cartOpen: false,
      depth: 2,
    }),
    true,
  );
  assert.equal(isHistoryNavEntry({ unrelated: true }), false);
});

test('getParentRoute resolves step-by-step parent route chain without exiting to Home prematurely', () => {
  assert.deepEqual(
    getParentRoute({ view: 'checkout', step: 'payment' }, 'chair-1'),
    { view: 'checkout', step: 'summary' },
  );
  assert.deepEqual(
    getParentRoute({ view: 'checkout', step: 'summary' }, 'chair-1'),
    { view: 'checkout', step: 'address' },
  );
  assert.deepEqual(
    getParentRoute({ view: 'checkout', step: 'address' }, 'chair-1'),
    { view: 'product', productId: 'chair-1' },
  );
  assert.deepEqual(getParentRoute({ view: 'checkout', step: 'address' }), { view: 'home' });
  assert.deepEqual(getParentRoute({ view: 'product', productId: 'chair-1' }), { view: 'home' });
  assert.deepEqual(getParentRoute({ view: 'orders' }), { view: 'home' });
});

test('stepBackInStack steps Payment -> Summary -> Address -> PDP -> Home reliably even from shallow stacks', () => {
  let stack: AppRoute[] = [
    { view: 'home' },
    { view: 'product', productId: 'chair-1' },
    { view: 'checkout', step: 'address' },
    { view: 'checkout', step: 'summary' },
    { view: 'checkout', step: 'payment' },
  ];

  let res = stepBackInStack(stack, { view: 'checkout', step: 'payment' }, 'chair-1');
  assert.deepEqual(res.nextRoute, { view: 'checkout', step: 'summary' });
  stack = res.nextStack;

  res = stepBackInStack(stack, res.nextRoute, 'chair-1');
  assert.deepEqual(res.nextRoute, { view: 'checkout', step: 'address' });
  stack = res.nextStack;

  res = stepBackInStack(stack, res.nextRoute, 'chair-1');
  assert.deepEqual(res.nextRoute, { view: 'product', productId: 'chair-1' });
  stack = res.nextStack;

  res = stepBackInStack(stack, res.nextRoute, 'chair-1');
  assert.deepEqual(res.nextRoute, { view: 'home' });
  assert.deepEqual(res.nextStack, [{ view: 'home' }]);

  // Shallow reloaded stack on Summary -> still steps Summary -> Address -> PDP -> Home
  const fromReloadSummary = stepBackInStack(
    [{ view: 'checkout', step: 'summary' }],
    { view: 'checkout', step: 'summary' },
    'chair-1',
  );
  assert.deepEqual(fromReloadSummary.nextRoute, { view: 'checkout', step: 'address' });

  const fromReloadAddress = stepBackInStack(
    fromReloadSummary.nextStack,
    fromReloadSummary.nextRoute,
    'chair-1',
  );
  assert.deepEqual(fromReloadAddress.nextRoute, { view: 'product', productId: 'chair-1' });
});

test('getInitialAppRoute always opens Home on root or checkout URLs so app never launches on Address', () => {
  assert.deepEqual(getInitialAppRoute(''), { view: 'home' });
  assert.deepEqual(getInitialAppRoute('#/'), { view: 'home' });
  assert.deepEqual(getInitialAppRoute('#/checkout'), { view: 'home' });
  assert.deepEqual(getInitialAppRoute('#/checkout/summary'), { view: 'home' });
  assert.deepEqual(getInitialAppRoute('#/checkout/payment'), { view: 'home' });
  assert.deepEqual(getInitialAppRoute('#/product/smartbuy-cordless-drill'), {
    view: 'product',
    productId: 'smartbuy-cordless-drill',
  });
});

test('continuous repeat forward and back cycles maintain exact Home <-> PDP <-> Address <-> Summary <-> Payment sequence', () => {
  const productIds = ['smartbuy-cordless-drill', 'green-soul-kiev-chair', 'leader-beast-26t'];
  let stack: AppRoute[] = [{ view: 'home' }];

  for (const productId of productIds) {
    // Forward: Home -> PDP -> Address -> Summary -> Payment
    stack = pushRouteStack(stack, { view: 'product', productId });
    stack = pushRouteStack(stack, { view: 'checkout', step: 'address' });
    stack = pushRouteStack(stack, { view: 'checkout', step: 'summary' });
    stack = pushRouteStack(stack, { view: 'checkout', step: 'payment' });
    assert.equal(stack.length, 5);

    // Back: Payment -> Summary -> Address -> PDP -> Home
    let back = stepBackInStack(stack, { view: 'checkout', step: 'payment' }, productId);
    assert.deepEqual(back.nextRoute, { view: 'checkout', step: 'summary' });

    back = stepBackInStack(back.nextStack, back.nextRoute, productId);
    assert.deepEqual(back.nextRoute, { view: 'checkout', step: 'address' });

    back = stepBackInStack(back.nextStack, back.nextRoute, productId);
    assert.deepEqual(back.nextRoute, { view: 'product', productId });

    back = stepBackInStack(back.nextStack, back.nextRoute, productId);
    assert.deepEqual(back.nextRoute, { view: 'home' });
    assert.deepEqual(back.nextStack, [{ view: 'home' }]);

    // Returning to Home via pushRouteStack also resets cleanly for next cycle
    stack = pushRouteStack(back.nextStack, { view: 'home' });
    assert.deepEqual(stack, [{ view: 'home' }]);
  }
});

