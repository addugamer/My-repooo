import { useMemo, useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Star,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import type { Product, ProductReview, ReviewSortMode } from '../types/store';
import { getRatingVerdict, sortAndFilterReviews } from '../utils/commerce';
import { SmartImage } from './SmartImage';

interface ProductReviewsSectionProps {
  product: Product;
  onAddReview: (productId: string, review: ProductReview) => void;
}

const SORT_MODES: Array<{ id: ReviewSortMode; label: string }> = [
  { id: 'helpful', label: 'Most Helpful' },
  { id: 'latest', label: 'Latest' },
  { id: 'positive', label: 'Positive' },
  { id: 'negative', label: 'Negative' },
];

const PHOTO_FRAMING = [
  'object-center scale-100',
  'object-left scale-110',
  'object-right scale-110',
  'object-top scale-115',
];

export function ProductReviewsSection({
  product,
  onAddReview,
}: ProductReviewsSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [activeAspectId, setActiveAspectId] = useState<string>(
    product.ratingAspects?.[0]?.id ?? 'overall',
  );
  const [sortMode, setSortMode] = useState<ReviewSortMode>('helpful');
  const [votes, setVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const [showWriteForm, setShowWriteForm] = useState(false);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewCity, setReviewCity] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const aspects = product.ratingAspects ?? [
    {
      id: 'overall',
      label: 'Overall',
      rating: product.rating,
      ratingsCount: product.reviewCount,
      breakdown: product.ratingBreakdown ?? [
        Math.round(product.reviewCount * 0.56),
        Math.round(product.reviewCount * 0.22),
        Math.round(product.reviewCount * 0.1),
        Math.round(product.reviewCount * 0.05),
        Math.round(product.reviewCount * 0.07),
      ],
    },
  ];

  const activeAspect =
    aspects.find((a) => a.id === activeAspectId) ?? aspects[0];
  const maxBarCount = Math.max(1, ...activeAspect.breakdown);
  const writtenCount = product.writtenReviewCount ?? product.reviews.length;

  const sortedReviews = useMemo(
    () => sortAndFilterReviews(product.reviews, sortMode),
    [product.reviews, sortMode],
  );

  // Collect customer gallery photos from reviews + product image fallback frames
  const customerPhotos = useMemo(() => {
    const collected: Array<{ src: string; frameClass: string; caption: string }> = [];
    product.reviews.forEach((rev, idx) => {
      (rev.photos ?? []).forEach((photo, pIdx) => {
        collected.push({
          src: photo,
          frameClass: PHOTO_FRAMING[(idx + pIdx) % PHOTO_FRAMING.length],
          caption: `Buyer photo by ${rev.author}`,
        });
      });
    });
    while (collected.length < 4) {
      collected.push({
        src: product.image,
        frameClass: PHOTO_FRAMING[collected.length % PHOTO_FRAMING.length],
        caption: `${product.name} buyer photo ${collected.length + 1}`,
      });
    }
    return collected.slice(0, 6);
  }, [product]);

  const toggleVote = (reviewId: string, dir: 'up' | 'down') => {
    setVotes((prev) => {
      if (prev[reviewId] === dir) {
        const next = { ...prev };
        delete next[reviewId];
        return next;
      }
      return { ...prev, [reviewId]: dir };
    });
  };

  const handleReviewSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewTitle.trim() || !reviewComment.trim()) {
      setReviewError('Please fill in your name, review headline, and comment.');
      return;
    }
    setReviewError('');
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      author: reviewAuthor.trim(),
      city: reviewCity.trim() || 'India',
      rating: reviewRating,
      date: formattedDate.replace(' ', ', '),
      timestamp: now.getTime(),
      title: reviewTitle.trim(),
      reviewFor: `Variant ${product.variants[0].label}`,
      comment: reviewComment.trim(),
      helpfulCount: 1,
      notHelpfulCount: 0,
      verified: true,
    };
    onAddReview(product.id, newReview);
    setReviewAuthor('');
    setReviewCity('');
    setReviewTitle('');
    setReviewComment('');
    setReviewRating(5);
    setReviewSubmitted(true);
    setShowWriteForm(false);
    setSortMode('latest');
    window.setTimeout(() => setReviewSubmitted(false), 3500);
  };

  return (
    <section
      aria-label="Ratings and reviews"
      className="bg-white border-b-[8px] border-[#F1F3F6]"
    >
      {/* Section Header */}
      <div className="px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between">
        <h2 className="font-display text-[19px] font-bold text-[#111827]">
          Ratings and reviews
        </h2>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse ratings and reviews' : 'Expand ratings and reviews'}
          className="w-8 h-8 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] inline-flex items-center justify-center transition-colors cursor-pointer"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div>
          {/* Headline Rating & Verified Buyers */}
          <div className="px-4 sm:px-6 pb-3">
            <div className="flex items-center gap-2">
              <span
                data-testid="aspect-rating-score"
                className="font-display text-[22px] font-bold text-[#111827] tabular-nums leading-none"
              >
                {activeAspect.rating.toFixed(1)}
              </span>
              <Star className="w-4 h-4 fill-[#15803D] text-[#15803D]" aria-hidden="true" />
              <span className="bg-[#E8F8EE] text-[#15803D] text-[12px] font-semibold px-2 py-0.5 rounded-[4px]">
                {getRatingVerdict(activeAspect.rating)}
              </span>
            </div>
            <p className="mt-1.5 text-[13px] text-[#6B7280] flex items-center gap-1 flex-wrap">
              <span>
                based on {activeAspect.ratingsCount.toLocaleString('en-IN')} ratings by
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6B7280] inline" aria-hidden="true" />
              <span>Verified Buyers</span>
            </p>
          </div>

          {/* Product-Specific Aspect Pills */}
          <div
            role="tablist"
            aria-label="Filter rating summary by aspect"
            className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 sm:px-6 pb-4 border-b border-[#F3F4F6]"
          >
            {aspects.map((aspect) => {
              const isSelected = aspect.id === activeAspect.id;
              return (
                <button
                  key={aspect.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveAspectId(aspect.id)}
                  className={`px-4 py-1.5 rounded-full text-[13.5px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer min-h-[36px] ${
                    isSelected
                      ? 'border-[1.5px] border-[#2874F0] text-[#2874F0] bg-[#EFF6FF]'
                      : 'border border-[#D1D5DB] text-[#1F2937] bg-white hover:border-[#9CA3AF]'
                  }`}
                >
                  {aspect.label}
                </button>
              );
            })}
          </div>

          {/* 2-Column Stars Summary + Horizontal Green Distribution Bars */}
          <div className="px-4 sm:px-6 py-4 grid grid-cols-12 gap-4 items-center border-b border-[#F3F4F6]">
            <div className="col-span-5 flex flex-col items-center text-center pr-2 border-r border-[#F3F4F6]">
              <div
                className="flex items-center gap-0.5"
                aria-label={`${activeAspect.rating.toFixed(1)} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, i) => {
                  const filled = i < Math.round(activeAspect.rating);
                  return (
                    <Star
                      key={i}
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        filled
                          ? 'fill-[#15803D] text-[#15803D]'
                          : 'fill-[#E5E7EB] text-[#E5E7EB]'
                      }`}
                      aria-hidden="true"
                    />
                  );
                })}
              </div>
              <p className="mt-2 text-[12.5px] text-[#6B7280] leading-snug tabular-nums">
                {activeAspect.ratingsCount.toLocaleString('en-IN')} ratings and{' '}
                {writtenCount.toLocaleString('en-IN')} reviews
              </p>
            </div>

            <div className="col-span-7 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star, idx) => {
                const count = activeAspect.breakdown[idx] ?? 0;
                const widthPct = Math.max(4, Math.round((count / maxBarCount) * 100));
                const barColor =
                  star === 1
                    ? 'bg-[#EA580C]'
                    : star === 2
                      ? 'bg-[#16A34A]'
                      : 'bg-[#15803D]';

                return (
                  <div key={star} className="flex items-center gap-2 text-[12.5px]">
                    <span className="w-6 shrink-0 font-semibold text-[#111827] inline-flex items-center gap-0.5 tabular-nums">
                      {star}
                      <Star className="w-2.5 h-2.5 fill-[#111827] text-[#111827]" aria-hidden="true" />
                    </span>
                    <div className="flex-1 h-[6px] rounded-full bg-[#E5E7EB] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-300`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <span className="w-11 text-right text-[#6B7280] tabular-nums shrink-0">
                      {count.toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buyer Photo Gallery Strip */}
          <div className="px-4 sm:px-6 py-4 border-b-[8px] border-[#F1F3F6]">
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
              {customerPhotos.map((photo, idx) => (
                <button
                  key={`${photo.caption}-${idx}`}
                  type="button"
                  onClick={() => setLightboxPhoto(photo.src)}
                  aria-label={`Open ${photo.caption}`}
                  className="w-[88px] h-[88px] sm:w-[96px] sm:h-[96px] rounded-xl overflow-hidden bg-[#F8FAFC] border border-[#E5E7EB] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <SmartImage
                    src={photo.src}
                    alt={photo.caption}
                    className={`w-full h-full object-cover ${photo.frameClass}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* User Reviews Sorted By Header + Filter Pills */}
          <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-[#F3F4F6]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-display text-[16px] font-bold text-[#111827]">
                User reviews sorted by
              </h3>
              <button
                type="button"
                onClick={() => setShowWriteForm((v) => !v)}
                className="text-[13px] font-semibold text-[#2874F0] hover:underline cursor-pointer shrink-0"
              >
                {showWriteForm ? 'Cancel' : '+ Rate Product'}
              </button>
            </div>

            <div
              role="tablist"
              aria-label="Sort user reviews"
              className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
            >
              {SORT_MODES.map((mode) => {
                const isSelected = sortMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSortMode(mode.id)}
                    className={`px-4 py-1.5 rounded-full text-[13.5px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer min-h-[36px] ${
                      isSelected
                        ? 'border-[1.5px] border-[#2874F0] text-[#2874F0] bg-[#EFF6FF]'
                        : 'border border-[#D1D5DB] text-[#1F2937] bg-white hover:border-[#9CA3AF]'
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>

            {reviewSubmitted && (
              <p className="mt-3 text-xs font-semibold text-[#15803D] bg-[#E8F8EE] px-3 py-2 rounded-lg">
                Thank you! Your verified review has been added to this product.
              </p>
            )}

            {/* Collapsible Write a Review Form */}
            {showWriteForm && (
              <form
                onSubmit={handleReviewSubmit}
                className="mt-4 p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-3"
                noValidate
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="rev-name" className="block text-xs font-medium text-[#374151] mb-1">
                      Your Name
                    </label>
                    <input
                      id="rev-name"
                      type="text"
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      placeholder="e.g. Priya Rao"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:border-[#2874F0] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="rev-city" className="block text-xs font-medium text-[#374151] mb-1">
                      City
                    </label>
                    <input
                      id="rev-city"
                      type="text"
                      value={reviewCity}
                      onChange={(e) => setReviewCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:border-[#2874F0] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="rev-rating" className="block text-xs font-medium text-[#374151] mb-1">
                    Star Rating
                  </label>
                  <select
                    id="rev-rating"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:border-[#2874F0] focus:outline-none"
                  >
                    <option value={5}>5 Stars — Just wow!</option>
                    <option value={4}>4 Stars — Worth the money</option>
                    <option value={3}>3 Stars — Fair / Good</option>
                    <option value={2}>2 Stars — Average</option>
                    <option value={1}>1 Star — Needs Improvement</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="rev-title" className="block text-xs font-medium text-[#374151] mb-1">
                    Review Title
                  </label>
                  <input
                    id="rev-title"
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Short headline for your review"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:border-[#2874F0] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="rev-comment" className="block text-xs font-medium text-[#374151] mb-1">
                    Detailed Review
                  </label>
                  <textarea
                    id="rev-comment"
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share build quality, delivery, and daily usage feedback..."
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:border-[#2874F0] focus:outline-none"
                  />
                </div>

                {reviewError && (
                  <p className="text-xs font-medium text-red-700">{reviewError}</p>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2874F0] hover:bg-[#1D5FD1] rounded-lg transition-colors cursor-pointer"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>

          {/* User Review Cards List */}
          <div data-testid="user-reviews-list" className="divide-y divide-[#E5E7EB]">
            {sortedReviews.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 text-center text-sm text-[#6B7280]">
                No reviews in this filter yet. Try switching to Most Helpful.
              </div>
            ) : (
              sortedReviews.map((rev) => {
                const vote = votes[rev.id];
                const upCount = (rev.helpfulCount ?? 0) + (vote === 'up' ? 1 : 0);
                const downCount = (rev.notHelpfulCount ?? 0) + (vote === 'down' ? 1 : 0);
                const isLong = rev.comment.length > 150;
                const isCommentExpanded = expandedComments[rev.id] ?? false;

                return (
                  <article key={rev.id} className="px-4 sm:px-6 py-4">
                    {/* Stars + Numeric Score + Title */}
                    <div className="flex items-start gap-2 flex-wrap">
                      <div
                        className="inline-flex items-center gap-0.5 mt-0.5 shrink-0"
                        aria-label={`Rated ${rev.rating} out of 5`}
                      >
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rev.rating
                                ? 'fill-[#15803D] text-[#15803D]'
                                : 'fill-[#E5E7EB] text-[#E5E7EB]'
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <span className="text-[14.5px] font-bold text-[#15803D] tabular-nums">
                        {rev.rating.toFixed(1)}
                      </span>
                      <span className="text-[#111827] font-bold" aria-hidden="true">
                        •
                      </span>
                      <h4 className="text-[15px] font-semibold text-[#111827] leading-snug flex-1 min-w-[140px]">
                        {rev.title}
                      </h4>
                    </div>

                    {/* Variant Context Metadata */}
                    {rev.reviewFor && (
                      <p className="mt-1.5 text-[12.5px] text-[#6B7280] leading-relaxed">
                        Review for: {rev.reviewFor}
                      </p>
                    )}

                    {/* Review Body */}
                    <p className="mt-2 text-[14.5px] text-[#111827] leading-relaxed">
                      {isLong && !isCommentExpanded
                        ? `${rev.comment.slice(0, 148)}... `
                        : rev.comment}
                      {isLong && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedComments((prev) => ({
                              ...prev,
                              [rev.id]: !isCommentExpanded,
                            }))
                          }
                          className="text-[#2874F0] font-semibold ml-1 hover:underline cursor-pointer"
                        >
                          {isCommentExpanded ? 'less' : 'more'}
                        </button>
                      )}
                    </p>

                    {/* Optional Buyer Photos */}
                    {rev.photos && rev.photos.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {rev.photos.map((photo, pIdx) => (
                          <button
                            key={`${rev.id}-p-${pIdx}`}
                            type="button"
                            onClick={() => setLightboxPhoto(photo)}
                            aria-label={`View review photo from ${rev.author}`}
                            className="w-[78px] h-[78px] rounded-xl overflow-hidden bg-[#F8FAFC] border border-[#E5E7EB] shrink-0 cursor-pointer"
                          >
                            <SmartImage
                              src={photo}
                              alt={`Photo by ${rev.author}`}
                              className={`w-full h-full object-cover ${
                                PHOTO_FRAMING[pIdx % PHOTO_FRAMING.length]
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Author & City */}
                    <p className="mt-3 text-[13.5px] text-[#6B7280]">
                      {rev.author}, {rev.city}
                    </p>

                    {/* Helpful / Not Helpful Pill Buttons */}
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleVote(rev.id, 'up')}
                          aria-pressed={vote === 'up'}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[13px] font-medium transition-colors cursor-pointer tabular-nums ${
                            vote === 'up'
                              ? 'border-[#2874F0] bg-[#EFF6FF] text-[#2874F0]'
                              : 'border-[#D1D5DB] bg-white text-[#4B5563] hover:border-[#9CA3AF]'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Helpful for {upCount}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleVote(rev.id, 'down')}
                          aria-pressed={vote === 'down'}
                          aria-label={`Mark review by ${rev.author} as not helpful, count ${downCount}`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-medium transition-colors cursor-pointer tabular-nums ${
                            vote === 'down'
                              ? 'border-[#374151] bg-[#F3F4F6] text-[#111827]'
                              : 'border-[#D1D5DB] bg-white text-[#4B5563] hover:border-[#9CA3AF]'
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{downCount}</span>
                        </button>
                      </div>

                      <span className="text-[#9CA3AF] p-1" aria-hidden="true">
                        <MoreVertical className="w-4 h-4" />
                      </span>
                    </div>

                    {/* Verified Purchase Date */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-[12.5px] text-[#6B7280]">
                      <CheckCircle2
                        className="w-3.5 h-3.5 fill-[#111827] text-white shrink-0"
                        aria-hidden="true"
                      />
                      <span>Verified Purchase</span>
                      <span aria-hidden="true">·</span>
                      <span>{rev.date}</span>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Buyer Photo Lightbox Modal */}
      {lightboxPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Customer photo preview"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              aria-label="Close photo preview"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/65 text-white inline-flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-square bg-white">
              <SmartImage
                src={lightboxPhoto}
                alt="Buyer uploaded product photo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
