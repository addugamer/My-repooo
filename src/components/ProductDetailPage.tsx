import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Banknote,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  RefreshCw,
  Search,
  ShoppingCart,
} from 'lucide-react';
import type { Product, ProductReview, ProductVariant } from '../types/store';
import {
  calculateDiscountPercent,
  clampGallerySlideIndex,
  formatCountdown,
  formatINRDecimal,
  getProductGalleryImages,
} from '../utils/commerce';
import { ProductReviewsSection } from './ProductReviewsSection';
import { SmartImage } from './SmartImage';
import {
  AssuredBadge,
  PayLaterLogo,
  PlusAssuredMark,
  PlusStarGlyph,
} from './StoreIcons';

interface ProductDetailPageProps {
  product: Product;
  relatedProducts: Product[];
  onBack: () => void;
  onOpenCart: () => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onBuyNow: (product: Product, variant: ProductVariant, quantity: number) => void;
  onSelectProduct: (productId: string) => void;
  onAddReview: (productId: string, review: ProductReview) => void;
}

type DetailTab = 'specifications' | 'description' | 'warranty' | 'manufacturer';

const DETAIL_TABS: Array<{ id: DetailTab; label: string }> = [
  { id: 'specifications', label: 'Specifications' },
  { id: 'description', label: 'Description' },
  { id: 'warranty', label: 'Warranty' },
  { id: 'manufacturer', label: 'Manufacturer' },
];

const INITIAL_PDP_SECONDS = 9 * 60 + 6; // 09m 06s

export function ProductDetailPage({
  product,
  relatedProducts,
  onBack,
  onOpenCart: _onOpenCart,
  onAddToCart,
  onBuyNow,
  onSelectProduct,
  onAddReview,
}: ProductDetailPageProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0].id);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_PDP_SECONDS);
  const [payLaterExpanded, setPayLaterExpanded] = useState(false);

  const [highlightsOpen, setHighlightsOpen] = useState(true);
  const [allDetailsOpen, setAllDetailsOpen] = useState(true);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('specifications');
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);

  const galleryScrollRef = useRef<HTMLDivElement | null>(null);
  const dragStartXRef = useRef<number | null>(null);
  const dragScrollLeftRef = useRef<number>(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 10 * 60 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const galleryImages = getProductGalleryImages(product);
  const slideCount = galleryImages.length;

  useEffect(() => {
    setSelectedVariantId(product.variants[0].id);
    setActiveSlideIdx(0);
    if (galleryScrollRef.current) {
      galleryScrollRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [product.id, product.variants]);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  const discountPct = calculateDiscountPercent(selectedVariant.mrp, selectedVariant.price);

  const highlightPairs =
    product.highlightPairs ??
    product.specs.slice(0, 8).map((s) => ({ label: s.label, value: s.value }));

  const scrollToSlide = (nextIdx: number) => {
    const clamped = clampGallerySlideIndex(nextIdx, slideCount);
    setActiveSlideIdx(clamped);
    const el = galleryScrollRef.current;
    if (el) {
      el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
    }
  };

  const handleGalleryScroll = () => {
    const el = galleryScrollRef.current;
    if (!el || el.clientWidth <= 0) return;
    const idx = clampGallerySlideIndex(el.scrollLeft / el.clientWidth, slideCount);
    if (idx !== activeSlideIdx) {
      setActiveSlideIdx(idx);
    }
  };

  const handleGalleryMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = galleryScrollRef.current;
    if (!el) return;
    dragStartXRef.current = e.clientX;
    dragScrollLeftRef.current = el.scrollLeft;
    setIsDraggingGallery(true);
  };

  const handleGalleryMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = galleryScrollRef.current;
    if (!isDraggingGallery || dragStartXRef.current === null || !el) return;
    const deltaX = e.clientX - dragStartXRef.current;
    el.scrollLeft = dragScrollLeftRef.current - deltaX;
  };

  const finishGalleryMouseDrag = () => {
    if (!isDraggingGallery) return;
    setIsDraggingGallery(false);
    dragStartXRef.current = null;
    const el = galleryScrollRef.current;
    if (el && el.clientWidth > 0) {
      const nearest = clampGallerySlideIndex(el.scrollLeft / el.clientWidth, slideCount);
      scrollToSlide(nearest);
    }
  };

  const handleAdd = () => {
    onAddToCart(product, selectedVariant, 1);
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1800);
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-[64px] lg:pb-12">
      {/* Top Royal-Blue Store App Bar (scrolls naturally with page) */}
      <header
        data-testid="pdp-top-header"
        className="relative z-20 bg-[#2874F0] text-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
      >
        <div className="max-w-6xl mx-auto h-14 px-3 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              data-testid="pdp-back-button"
              onClick={onBack}
              aria-label="Back to homepage"
              className="w-10 h-10 -ml-1.5 rounded-full hover:bg-white/15 inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={onBack}
              className="flex flex-col items-start leading-none text-left cursor-pointer shrink-0"
            >
              <span className="font-display text-[18px] sm:text-[19px] font-bold italic tracking-tight">
                Shopping{' '}
                <span className="font-normal text-[14px] text-white/90">Lite</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10.5px] italic text-white/90 mt-0.5">
                <span>Explore</span>
                <span className="font-bold text-[#FFE500]">Plus</span>
                <PlusStarGlyph className="w-3 h-3" />
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Decorative Search and Cart icons in PDP header (non-interactive) */}
            <span
              aria-hidden="true"
              data-testid="pdp-search-icon"
              className="w-10 h-10 rounded-full inline-flex items-center justify-center select-none cursor-default"
            >
              <Search className="w-5 h-5" />
            </span>
            <span
              aria-hidden="true"
              data-testid="pdp-cart-icon"
              className="relative w-10 h-10 rounded-full inline-flex items-center justify-center select-none cursor-default"
            >
              <ShoppingCart className="w-5 h-5" />
            </span>
          </div>
        </div>
      </header>

      {/* Main Responsive Layout: Mobile single-column (exact screenshot flow), Desktop 2-col sticky gallery + scrollable details */}
      <main className="max-w-6xl mx-auto lg:px-6 lg:pt-5">
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
          {/* Left Column (Desktop Sticky Gallery + Desktop Split CTAs) */}
          <div className="lg:col-span-5 lg:sticky lg:top-5">
            <section
              aria-label="Product images"
              className="bg-white border-b border-[#E5E7EB] lg:border lg:rounded-xl lg:overflow-hidden"
            >
              {/* Main Horizontal Swipeable / Scrollable Image Carousel Stage */}
              <div className="relative px-2 sm:px-4 pt-4 pb-3">
                <div className="relative">
                  <div
                    ref={galleryScrollRef}
                    data-testid="pdp-gallery-scroller"
                    data-active-slide={activeSlideIdx}
                    data-slide-count={slideCount}
                    onScroll={handleGalleryScroll}
                    onMouseDown={handleGalleryMouseDown}
                    onMouseMove={handleGalleryMouseMove}
                    onMouseUp={finishGalleryMouseDrag}
                    onMouseLeave={finishGalleryMouseDrag}
                    aria-label="Swipe or scroll horizontally to view product images"
                    className={`flex w-full overflow-x-auto no-scrollbar select-none touch-pan-x touch-pan-y ${
                      isDraggingGallery
                        ? 'cursor-grabbing'
                        : 'snap-x snap-mandatory scroll-smooth cursor-grab'
                    }`}
                  >
                    {galleryImages.map((imgSrc, idx) => (
                      <div
                        key={`${product.id}-slide-${idx}`}
                        data-testid={`pdp-gallery-slide-${idx}`}
                        className="w-full shrink-0 snap-center snap-always aspect-square max-h-[360px] flex items-center justify-center bg-white px-2 sm:px-4"
                      >
                        <SmartImage
                          src={imgSrc}
                          alt={`${product.name} — ${
                            product.galleryCaptions[idx] ?? `View ${idx + 1}`
                          }`}
                          fallbackTitle={product.name}
                          className="w-full h-full object-contain rounded-[4px] pointer-events-none select-none"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Subtle Prev / Next Buttons for Mouse & Keyboard Navigation */}
                  {activeSlideIdx > 0 && (
                    <button
                      type="button"
                      onClick={() => scrollToSlide(activeSlideIdx - 1)}
                      aria-label="Previous product image"
                      data-testid="pdp-gallery-prev"
                      className="hidden sm:inline-flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/92 hover:bg-white text-[#111827] border border-[#E5E7EB] shadow-sm items-center justify-center transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  {activeSlideIdx < slideCount - 1 && (
                    <button
                      type="button"
                      onClick={() => scrollToSlide(activeSlideIdx + 1)}
                      aria-label="Next product image"
                      data-testid="pdp-gallery-next"
                      className="hidden sm:inline-flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/92 hover:bg-white text-[#111827] border border-[#E5E7EB] shadow-sm items-center justify-center transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  {/* Subtle Slide Counter Indicator */}
                  <span
                    data-testid="pdp-gallery-counter"
                    className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/55 text-white text-[11px] font-semibold tabular-nums pointer-events-none"
                  >
                    {activeSlideIdx + 1} / {slideCount}
                  </span>
                </div>

                {/* Carousel Pagination Dots matching Gallery Slides */}
                <div
                  role="tablist"
                  aria-label="Product image slides"
                  className="mt-3.5 mb-1 flex items-center justify-center gap-2"
                >
                  {galleryImages.map((_, idx) => {
                    const isCurrent = idx === activeSlideIdx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        role="tab"
                        aria-selected={isCurrent}
                        aria-label={`View product image ${idx + 1}`}
                        onClick={() => scrollToSlide(idx)}
                        className={`rounded-full transition-all cursor-pointer ${
                          isCurrent
                            ? 'w-2.5 h-2.5 bg-[#2874F0]'
                            : 'w-2 h-2 bg-[#D1D5DB] hover:bg-[#9CA3AF]'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Desktop Split Action Buttons (matches mobile bottom bar visually) */}
              <div className="hidden lg:grid grid-cols-2 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="h-[52px] bg-white hover:bg-[#F9FAFB] text-[#111827] font-bold text-[15px] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {addedFeedback ? (
                    <>
                      <Check className="w-4 h-4 text-[#16A34A]" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <span>Add to Cart</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onBuyNow(product, selectedVariant, 1)}
                  className="h-[52px] bg-[#FFC200] hover:bg-[#F4B800] text-[#111827] font-bold text-[15px] transition-colors cursor-pointer"
                >
                  Buy Now
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Title, Price, Timer, Pay Later, Trust Badges, Product Highlights, All Details, Ratings & Reviews */}
          <div className="lg:col-span-7 lg:rounded-xl lg:overflow-hidden lg:border lg:border-[#E5E7EB]">
            {/* Section 1: Brand, Full Title, Plus Assured & Price Block */}
            <section className="bg-white px-4 sm:px-6 pt-4 pb-4 border-b border-[#E5E7EB]">
              <p className="font-display text-[16px] font-bold text-[#111827] tracking-tight">
                {product.brand}
              </p>
              <h1 className="mt-1 text-[15px] sm:text-[16px] text-[#1F2937] leading-[1.45] font-normal">
                {product.fullTitle ?? product.name}
              </h1>

              {/* Plus Assured Emblem */}
              {product.assured && (
                <div className="mt-2.5">
                  <PlusAssuredMark />
                </div>
              )}

              {/* Price Row: 92% off  ₹6,289.00  ₹489.00 */}
              <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
                <span className="text-[20px] sm:text-[22px] font-bold text-[#16A34A] tabular-nums">
                  {discountPct}% off
                </span>
                <span className="text-[18px] sm:text-[20px] text-[#878787] line-through tabular-nums">
                  {formatINRDecimal(selectedVariant.mrp)}
                </span>
                <span
                  data-testid="pdp-price"
                  className="text-[24px] sm:text-[26px] font-bold text-[#111827] tracking-tight tabular-nums"
                >
                  {formatINRDecimal(selectedVariant.price)}
                </span>
              </div>

              {/* Variant Selector (if multiple variants exist) */}
              {product.variants.length > 1 && (
                <div className="mt-3.5 pt-3 border-t border-[#F3F4F6]">
                  <p className="text-[12.5px] font-medium text-[#6B7280] mb-2">
                    Variant:{' '}
                    <span className="font-semibold text-[#111827]">
                      {selectedVariant.label}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => {
                      const isActive = variant.id === selectedVariant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setSelectedVariantId(variant.id)}
                          aria-pressed={isActive}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12.5px] font-medium transition-colors cursor-pointer ${
                            isActive
                              ? 'border-[#2874F0] bg-[#EFF6FF] text-[#1D4ED8] font-semibold'
                              : 'border-[#D1D5DB] bg-white text-[#374151] hover:border-[#9CA3AF]'
                          }`}
                        >
                          {variant.swatchHex && (
                            <span
                              className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                              style={{ backgroundColor: variant.swatchHex }}
                              aria-hidden="true"
                            />
                          )}
                          <span>{variant.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* Section 2: Live Sale Timer + Pay Later Promo + 3 Trust Badges (Screenshot 5) */}
            <section className="bg-white border-b-[8px] border-[#F1F3F6]">
              {/* Live Sale Countdown */}
              <div className="py-3.5 text-center border-b border-[#F3F4F6]">
                <p className="font-display text-[21px] sm:text-[23px] font-bold text-[#1F2937] tracking-tight leading-none">
                  <span>Live Sale : </span>
                  <span
                    data-testid="pdp-live-timer"
                    className="text-[#EA580C] tabular-nums"
                  >
                    {formatCountdown(secondsLeft)}
                  </span>
                </p>
              </div>

              {/* Pay Later Promotional Strip */}
              <div className="px-4 sm:px-6 py-3.5 border-b border-[#E5E7EB]">
                <div className="flex items-center justify-center sm:justify-between gap-4 flex-wrap">
                  <PayLaterLogo />
                  <div className="text-[12.5px] leading-snug text-[#1F2937]">
                    <p className="font-semibold text-[#111827]">Credit Up to ₹1 Lakh*</p>
                    <p className="text-[#374151]">Shop Now &amp; Pay Next Month or in EMIs</p>
                    <button
                      type="button"
                      onClick={() => setPayLaterExpanded((v) => !v)}
                      className="mt-1 inline-flex items-center gap-0.5 text-[12.5px] font-semibold text-[#2874F0] hover:underline cursor-pointer"
                    >
                      <span>Activate Now</span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {payLaterExpanded && (
                  <p className="mt-2.5 text-[12px] text-[#374151] bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-3 py-2">
                    Instant zero-fee credit up to ₹1,00,000 available at checkout with UPI AutoPay
                    and 3–12 month EMI plans. T&amp;C apply.
                  </p>
                )}
              </div>

              {/* 3-Column Trust Badges Strip */}
              <div className="grid grid-cols-3 divide-x divide-[#F3F4F6] py-4 px-2 text-center">
                <div className="flex flex-col items-center justify-start gap-2 px-1">
                  <span className="w-9 h-9 rounded-full bg-[#EA9E1A] text-white inline-flex items-center justify-center shadow-xs">
                    <RefreshCw className="w-4 h-4 stroke-[2.4]" aria-hidden="true" />
                  </span>
                  <span className="text-[12px] sm:text-[13px] font-semibold text-[#111827] leading-tight">
                    7 Days Replacement
                  </span>
                </div>

                <div className="flex flex-col items-center justify-start gap-2 px-1">
                  <span className="relative w-9 h-9 rounded-full bg-[#F3F4F6] text-[#6B7280] inline-flex items-center justify-center">
                    <Banknote className="w-5 h-5" aria-hidden="true" />
                    {product.codAvailable === false && (
                      <span
                        aria-hidden="true"
                        className="absolute w-7 h-[2px] bg-[#6B7280] -rotate-45 rounded-full"
                      />
                    )}
                  </span>
                  <span className="text-[12px] sm:text-[13px] font-semibold text-[#111827] leading-tight">
                    {product.codAvailable === false
                      ? 'No Cash On Delivery'
                      : 'Cash on Delivery'}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-start gap-2 px-1">
                  <div className="h-9 flex items-center justify-center">
                    <PlusAssuredMark compact />
                  </div>
                  <span className="text-[12px] sm:text-[13px] font-semibold text-[#111827] leading-tight">
                    Plus Assured
                  </span>
                </div>
              </div>
            </section>

            {/* Section 3: Collapsible "Product highlights" (2-column grid matching Screenshot 5) */}
            <section
              aria-label="Product highlights"
              className="bg-white border-b-[8px] border-[#F1F3F6] px-4 sm:px-6 py-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[19px] font-bold text-[#111827]">
                  Product highlights
                </h2>
                <button
                  type="button"
                  onClick={() => setHighlightsOpen((v) => !v)}
                  aria-expanded={highlightsOpen}
                  aria-label={
                    highlightsOpen
                      ? 'Collapse product highlights'
                      : 'Expand product highlights'
                  }
                  className="w-8 h-8 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] inline-flex items-center justify-center transition-colors cursor-pointer"
                >
                  {highlightsOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {highlightsOpen && (
                <dl
                  data-testid="product-highlights-grid"
                  className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4"
                >
                  {highlightPairs.map((pair) => (
                    <div
                      key={pair.label}
                      className="border-b border-[#F3F4F6] pb-3.5 min-w-0"
                    >
                      <dt className="text-[13px] text-[#6B7280] leading-snug">
                        {pair.label}
                      </dt>
                      <dd className="mt-1 text-[14.5px] sm:text-[15px] text-[#111827] leading-snug break-words">
                        {pair.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>

            {/* Section 4: Collapsible "All details" with 4 Pill Tabs (Screenshots 1 & 3) */}
            <section
              aria-label="All details"
              className="bg-white border-b-[8px] border-[#F1F3F6] px-4 sm:px-6 py-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[19px] font-bold text-[#111827]">
                  All details
                </h2>
                <button
                  type="button"
                  onClick={() => setAllDetailsOpen((v) => !v)}
                  aria-expanded={allDetailsOpen}
                  aria-label={
                    allDetailsOpen ? 'Collapse all details' : 'Expand all details'
                  }
                  className="w-8 h-8 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] inline-flex items-center justify-center transition-colors cursor-pointer"
                >
                  {allDetailsOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {allDetailsOpen && (
                <div>
                  {/* 4 Rounded Pill Tabs matching Screenshot 1 */}
                  <div
                    role="tablist"
                    aria-label="Product detail tabs"
                    className="mt-3.5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
                  >
                    {DETAIL_TABS.map((tab) => {
                      const isActive = activeDetailTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setActiveDetailTab(tab.id)}
                          className={`px-4 py-2 rounded-[10px] text-[14px] whitespace-nowrap shrink-0 transition-colors cursor-pointer min-h-[40px] ${
                            isActive
                              ? 'bg-[#1F2937] text-white font-semibold'
                              : 'bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] font-medium hover:border-[#D1D5DB]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Panel: Specifications */}
                  {activeDetailTab === 'specifications' && (
                    <div className="mt-4">
                      <h3 className="text-[15.5px] font-bold text-[#111827] mb-3">
                        General
                      </h3>
                      <dl
                        data-testid="all-details-specs"
                        className="grid grid-cols-2 gap-x-5 gap-y-3.5"
                      >
                        {product.specs.map((spec) => (
                          <div
                            key={spec.label}
                            className={`border-b border-[#F3F4F6] pb-3 min-w-0 ${
                              spec.fullWidth ? 'col-span-2' : 'col-span-1'
                            }`}
                          >
                            <dt className="text-[13px] text-[#6B7280] leading-snug">
                              {spec.label}
                            </dt>
                            <dd className="mt-0.5 text-[15px] text-[#111827] leading-snug break-words">
                              {spec.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  {/* Tab Panel: Description */}
                  {activeDetailTab === 'description' && (
                    <div data-testid="all-details-description" className="mt-4 space-y-3.5">
                      <p className="text-[14.5px] text-[#1F2937] leading-relaxed">
                        {product.description}
                      </p>
                      <ul className="space-y-2 text-[14px] text-[#374151] list-disc pl-5">
                        {product.highlights.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tab Panel: Warranty */}
                  {activeDetailTab === 'warranty' && (
                    <dl data-testid="all-details-warranty" className="mt-4 space-y-3.5">
                      <div className="border-b border-[#F3F4F6] pb-3">
                        <dt className="text-[13px] text-[#6B7280]">Warranty Summary</dt>
                        <dd className="mt-0.5 text-[15px] text-[#111827]">
                          {product.warrantyInfo?.summary ?? product.warranty}
                        </dd>
                      </div>
                      <div className="border-b border-[#F3F4F6] pb-3">
                        <dt className="text-[13px] text-[#6B7280]">Warranty Service Type</dt>
                        <dd className="mt-0.5 text-[15px] text-[#111827]">
                          {product.warrantyInfo?.serviceType ?? 'Authorized Brand Support'}
                        </dd>
                      </div>
                      <div className="border-b border-[#F3F4F6] pb-3">
                        <dt className="text-[13px] text-[#6B7280]">Covered in Warranty</dt>
                        <dd className="mt-0.5 text-[15px] text-[#111827]">
                          {product.warrantyInfo?.covered ?? 'Manufacturing defects under normal use.'}
                        </dd>
                      </div>
                      <div className="pb-1">
                        <dt className="text-[13px] text-[#6B7280]">Not Covered in Warranty</dt>
                        <dd className="mt-0.5 text-[15px] text-[#111827]">
                          {product.warrantyInfo?.notCovered ?? 'Physical damage or wear and tear.'}
                        </dd>
                      </div>
                    </dl>
                  )}

                  {/* Tab Panel: Manufacturer */}
                  {activeDetailTab === 'manufacturer' && (
                    <dl data-testid="all-details-manufacturer" className="mt-4 space-y-3.5">
                      <div className="border-b border-[#F3F4F6] pb-3">
                        <dt className="text-[13px] text-[#6B7280]">Generic Name</dt>
                        <dd className="mt-0.5 text-[15px] text-[#111827]">
                          {product.manufacturerInfo?.genericName ?? product.category}
                        </dd>
                      </div>
                      <div className="border-b border-[#F3F4F6] pb-3">
                        <dt className="text-[13px] text-[#6B7280]">Country of Origin</dt>
                        <dd className="mt-0.5 text-[15px] text-[#111827]">
                          {product.manufacturerInfo?.countryOfOrigin ?? 'India'}
                        </dd>
                      </div>
                      <div className="border-b border-[#F3F4F6] pb-3">
                        <dt className="text-[13px] text-[#6B7280]">Manufacturer Details</dt>
                        <dd className="mt-0.5 text-[15px] text-[#111827]">
                          {product.manufacturerInfo?.manufacturer ?? `${product.brand} India Pvt. Ltd.`}
                        </dd>
                      </div>
                      <div className="border-b border-[#F3F4F6] pb-3">
                        <dt className="text-[13px] text-[#6B7280]">Packer Details</dt>
                        <dd className="mt-0.5 text-[15px] text-[#111827]">
                          {product.manufacturerInfo?.packer ?? `${product.brand} Fulfillment Hub`}
                        </dd>
                      </div>
                      <div className="pb-1">
                        <dt className="text-[13px] text-[#6B7280]">Net Quantity</dt>
                        <dd className="mt-0.5 text-[15px] text-[#111827]">
                          {product.manufacturerInfo?.netQuantity ?? '1 Unit'}
                        </dd>
                      </div>
                    </dl>
                  )}
                </div>
              )}
            </section>

            {/* Section 5: Ratings and Reviews + User Reviews Sorted By (Screenshots 3, 4, 6, 7) */}
            <ProductReviewsSection product={product} onAddReview={onAddReview} />

            {/* Section 6: Similar Products */}
            {relatedProducts.length > 0 && (
              <section aria-label="Similar products" className="bg-white px-4 sm:px-6 py-5">
                <h2 className="font-display text-[17px] font-bold text-[#111827] mb-3.5">
                  Similar Products
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {relatedProducts.slice(0, 3).map((rel) => {
                    const relVar = rel.variants[0];
                    const relDisc = calculateDiscountPercent(relVar.mrp, relVar.price);
                    return (
                      <article
                        key={rel.id}
                        className="border border-[#E5E7EB] rounded-lg overflow-hidden bg-white"
                      >
                        <button
                          type="button"
                          onClick={() => onSelectProduct(rel.id)}
                          aria-label={`View details for ${rel.name}`}
                          className="w-full text-left cursor-pointer group"
                        >
                          <div className="aspect-square p-2.5 bg-white overflow-hidden">
                            <SmartImage
                              src={rel.image}
                              alt={rel.name}
                              className="w-full h-full object-cover rounded-[3px] group-hover:scale-[1.03] transition-transform duration-300"
                            />
                          </div>
                          <div className="px-2.5 pb-2.5">
                            <p className="text-[13px] font-medium text-[#111827] truncate">
                              {rel.name}
                            </p>
                            <p className="mt-0.5 text-[12px] font-semibold text-[#16A34A] tabular-nums">
                              {relDisc}% Off
                            </p>
                            <div className="mt-1 flex items-center justify-between gap-1">
                              <span className="text-[14px] font-bold text-[#111827] tabular-nums">
                                {formatINRDecimal(relVar.price)}
                              </span>
                              {rel.assured && <AssuredBadge />}
                            </div>
                          </div>
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Sticky 50/50 Split Bottom Bar (White Add to Cart | Yellow Buy Now) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-[56px] grid grid-cols-2 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        <button
          type="button"
          onClick={handleAdd}
          className="h-full bg-white active:bg-[#F3F4F6] text-[#111827] font-bold text-[15.5px] border-t border-[#E5E7EB] inline-flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {addedFeedback ? (
            <>
              <Check className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
              <span>Added</span>
            </>
          ) : (
            <span>Add to Cart</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => onBuyNow(product, selectedVariant, 1)}
          className="h-full bg-[#FFC200] active:bg-[#EAB308] text-[#111827] font-bold text-[15.5px] cursor-pointer"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
