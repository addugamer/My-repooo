import { useEffect, useRef, useState } from 'react';
import type { TouchEvent } from 'react';
import { Package, Search, ShoppingBag, Star, X } from 'lucide-react';
import { HERO_BANNER_IMAGE, HERO_TECH_BANNER_IMAGE } from '../data/products';
import type { Product } from '../types/store';
import {
  calculateDiscountPercent,
  filterProducts,
  formatCountdown,
  formatINRDecimal,
  getNextPingPongSlide,
  type CarouselPingPongState,
} from '../utils/commerce';
import { SmartImage } from './SmartImage';
import {
  AssuredBadge,
  CategoryIcon,
  StoreBrandGlyph,
  TravelPlaneGlyph,
} from './StoreIcons';
import { TravelDealsView } from './TravelDealsView';

interface HomePageProps {
  products: Product[];
  activeCategory: string;
  searchQuery: string;
  orderCount: number;
  onCategoryChange: (category: string) => void;
  onSearchChange: (q: string) => void;
  onSelectProduct: (productId: string) => void;
  onOpenCart: () => void;
  onNavigateOrders: () => void;
}

const HOME_CATEGORIES = [
  'For You',
  'Fashion',
  'Mobiles',
  'Beauty',
  'Electronics',
  'Home',
] as const;

interface BannerSlide {
  id: string;
  image: string;
  imageAlt: string;
  badgeTop: string;
  badgeBottom: string;
  headlineLine1: string;
  headlineLine2: string;
  subtitleLine1: string;
  subtitleLine2: string;
  promoTag: string;
  targetCategory: string;
  contentPaddingClass: string;
}

const BANNER_AUTO_SCROLL_MS = 5000;

const BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'diwali-tech-deals',
    image: HERO_TECH_BANNER_IMAGE,
    imageAlt:
      'Big Bang Diwali Sale Is Live featuring festive tech deals on laptops, wireless headphones, and tablets with glowing diyas and lanterns',
    badgeTop: 'BIG BANG',
    badgeBottom: 'DIWALI',
    headlineLine1: 'SALE',
    headlineLine2: 'IS LIVE',
    subtitleLine1: 'SHOP FESTIVE',
    subtitleLine2: 'TECH DEALS TODAY!',
    promoTag: 'DIWALI10 · 10% OFF',
    targetCategory: 'Electronics',
    contentPaddingClass: 'pl-[38%] pr-[10%] pb-3 sm:pl-[40%] sm:pr-[14%] sm:pb-5',
  },
  {
    id: 'diwali-home-appliances',
    image: HERO_BANNER_IMAGE,
    imageAlt:
      'Big Bang Diwali Sale Is Live featuring lowest prices guaranteed on home appliances, refrigerators, washing machines, and smart TVs',
    badgeTop: 'BIG BANG',
    badgeBottom: 'DIWALI',
    headlineLine1: 'SALE',
    headlineLine2: 'IS LIVE',
    subtitleLine1: 'LOWEST PRICES',
    subtitleLine2: 'GUARANTEED*',
    promoTag: 'No-Cost UPI & COD',
    targetCategory: 'For You',
    contentPaddingClass: 'pl-[43%] pr-[5%] pb-3 sm:pl-[46%] sm:pr-[10%] sm:pb-5',
  },
];

const INITIAL_SALE_SECONDS = 9 * 60 + 27; // 09m 27s

export function HomePage({
  products,
  activeCategory,
  searchQuery,
  orderCount,
  onCategoryChange,
  onSearchChange,
  onSelectProduct,
  onOpenCart,
  onNavigateOrders,
}: HomePageProps) {
  const [activePortal, setActivePortal] = useState<'shop' | 'travel'>('shop');
  const [carousel, setCarousel] = useState<CarouselPingPongState>({
    index: 0,
    direction: 1,
  });
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SALE_SECONDS);
  const touchStartXRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);

  const activeSlide = carousel.index;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 10 * 60 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Automatically scroll left after 5s (Slide 1 -> Slide 2), then right after 5s (Slide 2 -> Slide 1), continuously
  useEffect(() => {
    const autoScrollTimer = window.setTimeout(() => {
      setCarousel((prev) =>
        getNextPingPongSlide(prev.index, prev.direction, BANNER_SLIDES.length),
      );
    }, BANNER_AUTO_SCROLL_MS);
    return () => window.clearTimeout(autoScrollTimer);
  }, [carousel.index, carousel.direction, timerResetKey]);

  const goToSlide = (targetIndex: number) => {
    const clamped = Math.max(0, Math.min(BANNER_SLIDES.length - 1, targetIndex));
    setCarousel({
      index: clamped,
      direction: clamped === BANNER_SLIDES.length - 1 ? -1 : 1,
    });
    setTimerResetKey((k) => k + 1);
  };

  const handleBannerTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
    didSwipeRef.current = false;
  };

  const handleBannerTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = endX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) > 36) {
      didSwipeRef.current = true;
      if (deltaX < 0 && activeSlide < BANNER_SLIDES.length - 1) {
        goToSlide(activeSlide + 1);
      } else if (deltaX > 0 && activeSlide > 0) {
        goToSlide(activeSlide - 1);
      }
    }
  };

  const filtered = filterProducts(products, activeCategory, searchQuery, 'featured');

  return (
    <main className="min-h-screen bg-[#F0F1F4] pb-12">
      {/* Top Sky-Blue Gradient Header: Dual Portal Switcher + Search + Category Strip */}
      <header
        data-testid="home-top-header"
        className="relative z-20 bg-gradient-to-b from-[#9AD0FF] via-[#D4ECFF] to-white shadow-[0_1px_0_rgba(15,23,42,0.06)]"
      >
        <div className="max-w-6xl mx-auto">
          {/* Top Dual Tile Row: Shopping (Yellow) & Travel (White) matching screenshot */}
          <div className="px-3 sm:px-6 pt-2.5 pb-2 flex items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label="Store mode switcher"
              data-testid="top-portal-switcher"
              className="grid grid-cols-2 gap-3 w-full md:max-w-[440px]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activePortal === 'shop'}
                data-testid="portal-tab-shop"
                onClick={() => setActivePortal('shop')}
                className={`h-[60px] sm:h-[64px] rounded-[14px] flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2874F0] ${
                  activePortal === 'shop'
                    ? 'bg-[#FFE500] text-[#111827] shadow-[0_3px_10px_rgba(37,99,235,0.14)] ring-1 ring-[#FACC15]/80'
                    : 'bg-white text-[#374151] shadow-[0_2px_8px_rgba(37,99,235,0.10)] hover:bg-[#FFFDF0]'
                }`}
              >
                <StoreBrandGlyph className="w-[26px] h-[22px]" />
                <span className="font-display text-[15px] font-extrabold italic tracking-tight leading-none text-[#111827]">
                  Shopping
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activePortal === 'travel'}
                data-testid="portal-tab-travel"
                onClick={() => setActivePortal('travel')}
                className={`h-[60px] sm:h-[64px] rounded-[14px] flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2874F0] ${
                  activePortal === 'travel'
                    ? 'bg-[#FFE500] text-[#111827] shadow-[0_3px_10px_rgba(37,99,235,0.14)] ring-1 ring-[#FACC15]/80'
                    : 'bg-white text-[#374151] shadow-[0_2px_8px_rgba(37,99,235,0.10)] hover:bg-[#F8FAFC]'
                }`}
              >
                <TravelPlaneGlyph className="w-[22px] h-[22px]" />
                <span className="font-display text-[15px] font-bold italic tracking-tight leading-none text-[#2B2F36]">
                  Travel
                </span>
              </button>
            </div>

            {/* Clean Desktop Orders & Cart Actions aligned beside the dual switcher */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onNavigateOrders}
                className="inline-flex items-center gap-1.5 h-[44px] px-4 bg-white/95 hover:bg-white text-[#1F2937] text-sm font-semibold rounded-xl shadow-[0_2px_6px_rgba(37,99,235,0.08)] transition-colors whitespace-nowrap cursor-pointer"
              >
                <Package className="w-4 h-4 text-[#2874F0]" aria-hidden="true" />
                <span>{orderCount > 0 ? `Orders (${orderCount})` : 'Orders'}</span>
              </button>
              <button
                type="button"
                onClick={onOpenCart}
                aria-label="Open shopping cart"
                className="inline-flex items-center gap-2 h-[44px] px-4 bg-[#2874F0] hover:bg-[#1D5FD1] text-white text-sm font-semibold rounded-xl shadow-[0_2px_8px_rgba(40,116,240,0.28)] transition-colors whitespace-nowrap cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>Cart</span>
              </button>
            </div>
          </div>

          {/* Search Row (shown in Shopping mode) */}
          {activePortal === 'shop' && (
            <div className="px-3 sm:px-6 pt-0.5 pb-2.5 flex items-center gap-3">
              <div className="relative flex-1 flex items-center bg-white rounded-xl shadow-[0_2px_8px_rgba(37,99,235,0.09)] border border-[#DBEAFE] h-[44px] px-3.5 transition-shadow focus-within:ring-2 focus-within:ring-[#2874F0]/40">
                <Search
                  className="w-[19px] h-[19px] text-[#2874F0] shrink-0 mr-2.5 pointer-events-none"
                  aria-hidden="true"
                />
                <label htmlFor="home-product-search" className="sr-only">
                  Search for Product
                </label>
                <input
                  id="home-product-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search for Product"
                  className="w-full bg-transparent text-[15px] text-[#111827] placeholder:text-[#757575] focus:outline-none min-w-0"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    aria-label="Clear search"
                    className="p-1 text-[#6B7280] hover:text-[#111827] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Decorative mobile Cart indicator inside right end of search bar (non-interactive) */}
                <span
                  aria-hidden="true"
                  data-testid="search-bar-cart-icon"
                  className="md:hidden relative ml-1.5 p-1.5 text-[#374151] rounded-lg select-none cursor-default shrink-0"
                >
                  <ShoppingBag className="w-[19px] h-[19px]" aria-hidden="true" />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Full-width Category Icon Strip (shown in Shopping mode) */}
        {activePortal === 'shop' && (
          <div className="bg-gradient-to-b from-white/45 to-white">
            <nav
              aria-label="Product categories"
              role="tablist"
              className="max-w-6xl mx-auto flex items-stretch justify-between md:justify-start md:gap-5 overflow-x-auto no-scrollbar px-2 sm:px-6 pt-1"
            >
              {HOME_CATEGORIES.map((category) => {
                const isSelected =
                  activeCategory === category ||
                  (activeCategory === 'All' && category === 'For You');

                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => onCategoryChange(category)}
                    className="relative flex flex-col items-center justify-end min-w-[62px] sm:min-w-[84px] px-1 pt-1 pb-2.5 cursor-pointer group shrink-0 focus-visible:outline-2 focus-visible:outline-[#2874F0]"
                  >
                    <span
                      className={`w-[48px] h-[44px] rounded-[14px] flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#E8F1FF]'
                          : 'bg-transparent group-hover:bg-[#F3F6FB]'
                      }`}
                    >
                      <CategoryIcon category={category} />
                    </span>
                    <span
                      className={`mt-1 text-[12px] sm:text-[13px] leading-tight whitespace-nowrap ${
                        isSelected
                          ? 'font-bold text-[#111827]'
                          : 'font-medium text-[#374151] group-hover:text-[#111827]'
                      }`}
                    >
                      {category}
                    </span>
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 inset-x-0.5 h-[3px] rounded-t-full bg-[#2874F0]"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {activePortal === 'travel' ? (
        <TravelDealsView onBackToShop={() => setActivePortal('shop')} />
      ) : (
        /* Main Shopping Content Container */
        <div className="max-w-6xl mx-auto">
        {/* Hero Festive Banner Carousel (2 Slides: Auto-Scroll Left after 5s, Right after 5s) */}
        <section aria-label="Diwali Sale Promotions" className="bg-white px-3 sm:px-6 pt-3.5 pb-1">
          <div
            data-testid="banner-carousel"
            data-active-slide={activeSlide}
            onTouchStart={handleBannerTouchStart}
            onTouchEnd={handleBannerTouchEnd}
            className="relative rounded-[18px] overflow-hidden aspect-[16/9] sm:aspect-auto sm:h-[310px] md:h-[335px] bg-[#9B111E] shadow-[0_4px_16px_rgba(153,27,27,0.18)] touch-pan-y select-none"
          >
            {/* Horizontal 2-Slide Track */}
            <div
              data-testid="banner-track"
              className={`flex w-[200%] h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                activeSlide === 0 ? 'translate-x-0' : '-translate-x-1/2'
              }`}
            >
              {BANNER_SLIDES.map((slide, idx) => {
                const isCurrent = idx === activeSlide;
                const HeadlineTag = idx === 0 ? 'h1' : 'p';

                return (
                  <div
                    key={slide.id}
                    data-testid={`banner-slide-${idx}`}
                    aria-hidden={!isCurrent}
                    className="relative w-1/2 h-full shrink-0 overflow-hidden"
                  >
                    <SmartImage
                      src={slide.image}
                      alt={slide.imageAlt}
                      fallbackTitle={`${slide.badgeTop} ${slide.badgeBottom} ${slide.headlineLine1} ${slide.headlineLine2}`}
                      className="w-full h-full object-cover object-left sm:object-center pointer-events-none"
                    />

                    {/* Subtle crimson vignette over the right-center stage for crisp festive lettering */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-r from-black/5 via-[#9B111E]/38 to-[#7A0912]/52"
                    />

                    {/* Top-right compact festive promo badge */}
                    <div className="absolute top-2 right-2.5 sm:top-3.5 sm:right-4 bg-white/95 backdrop-blur-xs text-[#111827] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md shadow-xs text-[9.5px] sm:text-xs font-semibold tracking-tight">
                      {slide.promoTag}
                    </div>

                    {/* Interactive Banner Content Overlay */}
                    <button
                      type="button"
                      tabIndex={isCurrent ? 0 : -1}
                      onClick={() => {
                        if (didSwipeRef.current) {
                          didSwipeRef.current = false;
                          return;
                        }
                        onCategoryChange(slide.targetCategory);
                      }}
                      className={`absolute inset-0 w-full h-full flex items-center justify-center text-center cursor-pointer ${slide.contentPaddingClass}`}
                      aria-label={`${slide.badgeTop} ${slide.badgeBottom} ${slide.headlineLine1} ${slide.headlineLine2} - ${slide.subtitleLine1} ${slide.subtitleLine2}`}
                    >
                      <div className="flex flex-col items-center max-w-[215px] sm:max-w-[370px]">
                        {/* Festive Diwali Starburst Badge */}
                        <div className="inline-flex flex-col items-center leading-none mb-1.5 sm:mb-2">
                          <span className="font-display font-black text-[12px] sm:text-[18px] tracking-tight text-[#FFE44D] drop-shadow-[0_2px_0_rgba(30,58,138,0.95)]">
                            {slide.badgeTop}
                          </span>
                          <span className="font-display font-extrabold text-[10px] sm:text-[14px] tracking-wider text-white bg-[#1D4ED8] px-2 py-0.5 rounded-xs shadow-xs -mt-0.5">
                            {slide.badgeBottom}
                          </span>
                        </div>

                        {/* Gleaming Gold Main Headline */}
                        <HeadlineTag className="font-display font-black uppercase leading-[0.94] tracking-tight text-[26px] sm:text-[42px] md:text-[48px] drop-shadow-[0_3px_6px_rgba(69,10,10,0.88)]">
                          <span className="block bg-gradient-to-b from-[#FFF9CC] via-[#FFD43B] to-[#DE8910] bg-clip-text text-transparent">
                            {slide.headlineLine1}
                          </span>
                          <span className="block bg-gradient-to-b from-[#FFF9CC] via-[#FFD43B] to-[#DE8910] bg-clip-text text-transparent">
                            {slide.headlineLine2}
                          </span>
                        </HeadlineTag>

                        {/* Crisp White Subtitle */}
                        <p className="mt-1.5 sm:mt-2 text-[9.5px] sm:text-[14px] font-bold tracking-wider uppercase text-white leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.75)]">
                          {slide.subtitleLine1}
                          <br />
                          {slide.subtitleLine2}
                        </p>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom-center 2-Dot Carousel Pagination Indicators */}
            <div
              className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-10"
              role="tablist"
              aria-label="Banner slides"
            >
              {BANNER_SLIDES.map((slide, idx) => {
                const isCurrent = idx === activeSlide;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isCurrent}
                    aria-label={`View banner slide ${idx + 1}`}
                    onClick={() => goToSlide(idx)}
                    className={`h-[6px] sm:h-[7px] rounded-full transition-all duration-300 cursor-pointer ${
                      isCurrent
                        ? 'w-5 sm:w-6 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.4)]'
                        : 'w-[6px] sm:w-[7px] bg-white/50 hover:bg-white/85'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Live Sale Countdown Strip */}
        <section
          aria-label="Live Sale Countdown"
          className="bg-white py-3.5 sm:py-3.5 text-center border-b border-[#E6E8EC] shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
        >
          <p className="font-display text-[21px] sm:text-[24px] font-bold tracking-tight text-[#1F2937] leading-none">
            <span>Live Sale : </span>
            <span
              data-testid="live-sale-timer"
              className="text-[#EA580C] tabular-nums"
            >
              {formatCountdown(secondsLeft)}
            </span>
          </p>
        </section>

        {/* Active Filter Indicator (only when filtered or searching) */}
        {(activeCategory !== 'For You' && activeCategory !== 'All') || searchQuery ? (
          <div className="bg-white px-4 sm:px-6 py-2.5 border-b border-[#E5E7EB] flex items-center justify-between gap-2 text-xs sm:text-sm">
            <span className="text-[#4B5563]">
              Showing <strong className="text-[#111827]">{filtered.length}</strong>{' '}
              {filtered.length === 1 ? 'deal' : 'deals'}
              {activeCategory !== 'For You' && activeCategory !== 'All'
                ? ` in ${activeCategory}`
                : ''}
              {searchQuery ? ` for “${searchQuery}”` : ''}
            </span>
            <button
              type="button"
              onClick={() => {
                onCategoryChange('For You');
                onSearchChange('');
              }}
              className="text-[#2874F0] font-semibold hover:underline cursor-pointer shrink-0"
            >
              Show All
            </button>
          </div>
        ) : null}

        {/* Product Grid */}
        <section aria-label="Live Sale Products" className="pt-3 sm:px-6 sm:pt-4">
          {filtered.length === 0 ? (
            <div className="bg-white mx-2 sm:mx-0 rounded-[6px] p-10 text-center border border-[#E6E8EC]">
              <p className="font-display text-lg font-bold text-[#111827]">
                No matching products found
              </p>
              <p className="text-sm text-[#6B7280] mt-1 mb-4">
                Try searching for another product or switch back to For You.
              </p>
              <button
                type="button"
                onClick={() => {
                  onCategoryChange('For You');
                  onSearchChange('');
                }}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2874F0] hover:bg-[#1D5FD1] rounded-lg transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div
              data-testid="product-grid"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-2.5 sm:gap-3.5 px-2 sm:px-0"
            >
              {filtered.map((product) => {
                const primaryVariant = product.variants[0];
                const discountPct = calculateDiscountPercent(
                  primaryVariant.mrp,
                  primaryVariant.price,
                );

                return (
                  <article
                    key={product.id}
                    className="bg-white rounded-[5px] border border-[#E7E9ED] shadow-[0_1px_4px_rgba(15,23,42,0.06)] overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-[0_6px_16px_rgba(15,23,42,0.10)]"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product.id)}
                      aria-label={`View details for ${product.name}`}
                      className="w-full flex-1 flex flex-col text-left bg-white cursor-pointer group focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#2874F0]"
                    >
                      {/* Clean Square Studio / Lifestyle Image with crisp white border frame */}
                      <div className="w-full aspect-square bg-white p-2 sm:p-2.5 flex items-center justify-center overflow-hidden">
                        <SmartImage
                          src={product.image}
                          alt={product.name}
                          fallbackTitle={product.name}
                          className="w-full h-full object-cover rounded-[2px] bg-white transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>

                      {/* Product Details aligned flush with image inside crisp white card */}
                      <div className="px-2 sm:px-2.5 pt-1 pb-3 flex-1 flex flex-col w-full bg-white">
                        <h2 className="text-[14px] sm:text-[15px] font-medium text-[#111827] truncate leading-snug group-hover:text-[#2874F0] transition-colors">
                          {product.name}
                        </h2>

                        {/* Discount & Strikethrough MRP */}
                        <div className="mt-1.5 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                          <span className="text-[13.5px] sm:text-[14.5px] font-semibold text-[#16A34A] tabular-nums">
                            {discountPct}% Off
                          </span>
                          <span className="text-[13.5px] sm:text-[14.5px] text-[#878787] line-through tabular-nums">
                            {formatINRDecimal(primaryVariant.mrp)}
                          </span>
                        </div>

                        {/* Final Price & Assured Badge */}
                        <div className="mt-1.5 flex items-center justify-between gap-1.5">
                          <span className="text-[17px] sm:text-[18.5px] font-bold text-[#111827] tracking-tight tabular-nums leading-none">
                            {formatINRDecimal(primaryVariant.price)}
                          </span>
                          {product.assured && <AssuredBadge />}
                        </div>

                        {/* Dedicated Green Rating Pill + Ratings Count */}
                        <div className="mt-2 flex items-center gap-1.5 text-[12.5px] sm:text-[13px] text-[#6B7280]">
                          <span className="inline-flex items-center gap-0.5 bg-[#26A541] text-white font-bold px-1.5 py-[3px] rounded-[4px] text-[12px] leading-none tabular-nums shrink-0">
                            {product.rating.toFixed(1)}
                            <Star className="w-2.5 h-2.5 fill-white text-white" aria-hidden="true" />
                          </span>
                          <span className="tabular-nums truncate">
                            {product.reviewCount} Ratings
                          </span>
                        </div>

                        {/* Dedicated Free Delivery Line */}
                        <p className="mt-2 text-[12.5px] sm:text-[13px] text-[#374151] font-normal leading-tight">
                          Free Delivery in Two Days
                        </p>
                      </div>
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
      )}
    </main>
  );
}
