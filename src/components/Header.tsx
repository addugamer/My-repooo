import { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import type { AppRoute } from '../types/store';

interface HeaderProps {
  route: AppRoute;
  activeCategory: string;
  orderCount: number;
  onNavigateHome: (category?: string) => void;
  onNavigateOrders: () => void;
  onOpenCart: () => void;
}

export function Header({
  route,
  activeCategory,
  orderCount,
  onNavigateHome,
  onNavigateOrders,
  onOpenCart,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: 'For You',
      active: route.view === 'home' && (activeCategory === 'For You' || activeCategory === 'All'),
      onClick: () => {
        onNavigateHome('For You');
        setMobileMenuOpen(false);
      },
    },
    {
      label: 'Mobiles',
      active: route.view === 'home' && activeCategory === 'Mobiles',
      onClick: () => {
        onNavigateHome('Mobiles');
        setMobileMenuOpen(false);
      },
    },
    {
      label: 'Electronics',
      active: route.view === 'home' && activeCategory === 'Electronics',
      onClick: () => {
        onNavigateHome('Electronics');
        setMobileMenuOpen(false);
      },
    },
    {
      label: 'Home',
      active: route.view === 'home' && activeCategory === 'Home',
      onClick: () => {
        onNavigateHome('Home');
        setMobileMenuOpen(false);
      },
    },
    {
      label: orderCount > 0 ? `My Orders (${orderCount})` : 'My Orders',
      active: route.view === 'orders',
      onClick: () => {
        onNavigateOrders();
        setMobileMenuOpen(false);
      },
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 -ml-2 text-stone-700 hover:text-stone-950 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigateHome('For You');
              setMobileMenuOpen(false);
            }}
            className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#2874F0] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Shopping
          </button>
        </div>

        {/* Zone 2: Concise single-line nav links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                item.active
                  ? 'text-stone-950 border-[#2874F0]'
                  : 'text-stone-600 border-transparent hover:text-stone-950 hover:border-stone-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label="Open shopping cart"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            <span>Cart</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-stone-200 bg-white px-4 py-3 flex flex-col gap-1"
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-stone-100 text-[#C2410C] font-semibold'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
