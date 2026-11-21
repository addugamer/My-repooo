import { useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  Building2,
  Bus,
  Calendar,
  CheckCircle2,
  MapPin,
  Plane,
  Sparkles,
  Tag,
} from 'lucide-react';
import { formatINR } from '../utils/commerce';

type TravelTab = 'flights' | 'hotels' | 'buses';

interface TravelDeal {
  id: string;
  type: TravelTab;
  title: string;
  subtitle: string;
  fromCity: string;
  toCity: string;
  durationOrNights: string;
  fare: number;
  mrp: number;
  promoCode: string;
  perks: string;
  provider: string;
}

const TRAVEL_DEALS: TravelDeal[] = [
  {
    id: 'trv-del-bom',
    type: 'flights',
    title: 'New Delhi (DEL) → Mumbai (BOM)',
    subtitle: 'Non-stop · Morning & Evening Diwali Specials',
    fromCity: 'Delhi',
    toCity: 'Mumbai',
    durationOrNights: '2h 10m · Non-stop',
    fare: 3499,
    mrp: 6890,
    promoCode: 'FLYDIWALI',
    perks: 'Zero convenience fee + free seat selection',
    provider: 'IndiGo · Akasa · Air India',
  },
  {
    id: 'trv-blr-goa',
    type: 'flights',
    title: 'Bengaluru (BLR) → Goa (GOX)',
    subtitle: 'Non-stop · Festive Long Weekend Fare',
    fromCity: 'Bengaluru',
    toCity: 'Goa',
    durationOrNights: '1h 15m · Non-stop',
    fare: 2199,
    mrp: 4999,
    promoCode: 'GOAFEST',
    perks: 'Instant ₹600 off on UPI payments',
    provider: 'Akasa Air · IndiGo',
  },
  {
    id: 'trv-bom-jai',
    type: 'flights',
    title: 'Mumbai (BOM) → Jaipur (JAI)',
    subtitle: 'Non-stop · Pink City Diwali Express',
    fromCity: 'Mumbai',
    toCity: 'Jaipur',
    durationOrNights: '1h 50m · Non-stop',
    fare: 2899,
    mrp: 5650,
    promoCode: 'UTSAVFLY',
    perks: 'Free 15 kg check-in baggage included',
    provider: 'Air India Express · IndiGo',
  },
  {
    id: 'trv-htl-goa',
    type: 'hotels',
    title: 'Baga Coastline Boutique Resort, North Goa',
    subtitle: '4.6★ · Poolside Deluxe Room with Breakfast',
    fromCity: 'Goa',
    toCity: 'Goa',
    durationOrNights: '2 Nights · 2 Adults',
    fare: 4599,
    mrp: 11200,
    promoCode: 'STAY55',
    perks: 'Free cancellation up to 24 hrs prior',
    provider: 'Shopping Stays Assured',
  },
  {
    id: 'trv-htl-udaipur',
    type: 'hotels',
    title: 'Haveli Lakeview Heritage Suite, Udaipur',
    subtitle: '4.8★ · Rooftop Diwali Dinner Included',
    fromCity: 'Udaipur',
    toCity: 'Udaipur',
    durationOrNights: '2 Nights · 2 Adults',
    fare: 5499,
    mrp: 12999,
    promoCode: 'ROYALDIWALI',
    perks: 'Complimentary airport pick-up & breakfast',
    provider: 'Shopping Stays Assured',
  },
  {
    id: 'trv-bus-del-manali',
    type: 'buses',
    title: 'Delhi → Manali Volvo 9600 AC Sleeper',
    subtitle: 'Overnight Semi-Sleeper · Live GPS Tracking',
    fromCity: 'Delhi',
    toCity: 'Manali',
    durationOrNights: '11h 30m · Overnight',
    fare: 849,
    mrp: 1699,
    promoCode: 'BUSFEST',
    perks: 'Water bottle, blanket & charging port',
    provider: 'Himalayan Express AC',
  },
  {
    id: 'trv-bus-blr-hyd',
    type: 'buses',
    title: 'Bengaluru → Hyderabad Multi-Axle AC Sleeper',
    subtitle: 'Direct Highway Express · Verified Crew',
    fromCity: 'Bengaluru',
    toCity: 'Hyderabad',
    durationOrNights: '8h 45m · Overnight',
    fare: 699,
    mrp: 1499,
    promoCode: 'BUSFEST',
    perks: 'Instant refund on cancellation',
    provider: 'Deccan Cruiser Volvo',
  },
];

interface TravelDealsViewProps {
  onBackToShop: () => void;
}

export function TravelDealsView({ onBackToShop }: TravelDealsViewProps) {
  const [activeTab, setActiveTab] = useState<TravelTab>('flights');
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [travelDate, setTravelDate] = useState('2026-11-24');
  const [bookedIds, setBookedIds] = useState<string[]>([]);

  const matchingDeals = useMemo(() => {
    const f = fromQuery.trim().toLowerCase();
    const t = toQuery.trim().toLowerCase();
    return TRAVEL_DEALS.filter((deal) => {
      if (deal.type !== activeTab) return false;
      const matchesFrom =
        !f ||
        deal.fromCity.toLowerCase().includes(f) ||
        deal.title.toLowerCase().includes(f);
      const matchesTo =
        !t ||
        deal.toCity.toLowerCase().includes(t) ||
        deal.title.toLowerCase().includes(t);
      return matchesFrom && matchesTo;
    });
  }, [activeTab, fromQuery, toQuery]);

  const handleSwapCities = () => {
    setFromQuery(toQuery);
    setToQuery(fromQuery);
  };

  const handleBookDeal = (dealId: string) => {
    setBookedIds((prev) => (prev.includes(dealId) ? prev : [...prev, dealId]));
  };

  return (
    <section
      aria-label="Shopping Travel Deals"
      data-testid="travel-deals-view"
      className="max-w-6xl mx-auto px-3 sm:px-6 pt-3 pb-10 space-y-3.5"
    >
      {/* Festive Travel Hero Card */}
      <div className="rounded-[18px] bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#0284C7] text-white p-4 sm:p-6 shadow-[0_4px_16px_rgba(37,99,235,0.2)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1 bg-[#FFE500] text-[#111827] text-[11px] font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              Diwali Travel Dhamaka
            </span>
            <h1 className="mt-2 font-display text-[22px] sm:text-[28px] font-extrabold tracking-tight leading-tight">
              Flat up to 50% Off on Flights, Stays &amp; Buses
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-blue-100">
              Zero convenience fee on UPI · Instant confirmation · Assured Diwali fares
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToShop}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold border border-white/25 transition-colors cursor-pointer"
          >
            Back to Shopping Deals
          </button>
        </div>

        {/* Mode Tabs: Flights / Hotels / Buses */}
        <div
          role="tablist"
          aria-label="Travel categories"
          className="mt-4 inline-flex bg-white/15 p-1 rounded-xl gap-1"
        >
          {(
            [
              { id: 'flights', label: 'Flights', icon: Plane },
              { id: 'hotels', label: 'Hotels', icon: Building2 },
              { id: 'buses', label: 'Buses', icon: Bus },
            ] as const
          ).map(({ id, label, icon: Icon }) => {
            const selected = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  selected
                    ? 'bg-[#FFE500] text-[#111827] shadow-xs'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Route Search Strip */}
        <div className="mt-3.5 bg-white rounded-xl p-2.5 sm:p-3 text-[#111827] grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_170px] gap-2 items-center shadow-sm">
          <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <MapPin className="w-4 h-4 text-[#2874F0] shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={fromQuery}
              onChange={(e) => setFromQuery(e.target.value)}
              placeholder={activeTab === 'hotels' ? 'City (e.g. Goa, Udaipur)' : 'From (e.g. Delhi, Mumbai)'}
              aria-label="Departure city or destination"
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </label>

          <button
            type="button"
            onClick={handleSwapCities}
            aria-label="Swap departure and destination cities"
            className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2874F0] transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
          </button>

          <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <MapPin className="w-4 h-4 text-[#E53935] shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={toQuery}
              onChange={(e) => setToQuery(e.target.value)}
              placeholder={activeTab === 'hotels' ? 'Area or Resort' : 'To (e.g. Goa, Jaipur)'}
              aria-label="Destination city"
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </label>

          <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <Calendar className="w-4 h-4 text-[#4B5563] shrink-0" aria-hidden="true" />
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              aria-label="Travel date"
              className="w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none"
            />
          </label>
        </div>
      </div>

      {/* Matching Travel Deals List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-base sm:text-lg font-bold text-[#111827]">
            Featured Festive {activeTab === 'flights' ? 'Flight' : activeTab === 'hotels' ? 'Hotel' : 'Bus'} Deals ({matchingDeals.length})
          </h2>
          {(fromQuery || toQuery) && (
            <button
              type="button"
              onClick={() => {
                setFromQuery('');
                setToQuery('');
              }}
              className="text-xs sm:text-sm font-semibold text-[#2874F0] hover:underline cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>

        {matchingDeals.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-[#E5E7EB]">
            <p className="font-display font-bold text-[#111827]">No matching routes found</p>
            <p className="text-sm text-[#6B7280] mt-1">
              Clear the city filter to browse all Diwali festive travel fares.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matchingDeals.map((deal) => {
              const discountPct = Math.round(((deal.mrp - deal.fare) / deal.mrp) * 100);
              const isBooked = bookedIds.includes(deal.id);

              return (
                <article
                  key={deal.id}
                  className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col justify-between gap-3 shadow-[0_1px_4px_rgba(15,23,42,0.04)]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-[15.5px] font-bold text-[#111827] leading-snug">
                          {deal.title}
                        </h3>
                        <p className="text-xs text-[#6B7280] mt-0.5">{deal.subtitle}</p>
                      </div>
                      <span className="shrink-0 bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold px-2 py-0.5 rounded-md tabular-nums">
                        {discountPct}% Off
                      </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-[#4B5563]">
                      <span className="font-medium text-[#1F2937]">{deal.durationOrNights}</span>
                      <span>·</span>
                      <span>{deal.provider}</span>
                    </div>

                    <p className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-1 rounded-md">
                      <Tag className="w-3 h-3" aria-hidden="true" />
                      Use {deal.promoCode} · {deal.perks}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-[#878787] line-through tabular-nums mr-1.5">
                        {formatINR(deal.mrp)}
                      </span>
                      <span className="text-lg font-extrabold text-[#111827] tabular-nums">
                        {formatINR(deal.fare)}
                      </span>
                      <span className="block text-[11px] text-[#6B7280]">
                        For {travelDate}
                      </span>
                    </div>

                    {isBooked ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#DCFCE7] text-[#15803D] text-xs sm:text-sm font-bold">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        Fare Locked
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBookDeal(deal.id)}
                        className="px-4 py-2 rounded-lg bg-[#FFE500] hover:bg-[#FACC15] text-[#111827] text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Lock Festive Fare
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
