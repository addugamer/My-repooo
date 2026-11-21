interface CategoryIconProps {
  category: string;
}

export function CategoryIcon({ category }: CategoryIconProps) {
  switch (category) {
    case 'For You':
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
          {/* Shopping bag outline */}
          <path
            d="M10.5 13.5C10.5 11.8431 11.8431 10.5 13.5 10.5H26.5C28.1569 10.5 29.5 11.8431 29.5 13.5L31.2 28.5C31.4 30.2 30.1 31.8 28.4 31.8H11.6C9.9 31.8 8.6 30.2 8.8 28.5L10.5 13.5Z"
            stroke="#1F2937"
            strokeWidth="2.1"
            strokeLinejoin="round"
            fill="#FFFFFF"
          />
          {/* Yellow festive smile handle inside bag */}
          <path
            d="M15.2 15.8C15.9 19.2 17.8 20.6 20 20.6C22.2 20.6 24.1 19.2 24.8 15.8"
            stroke="#1F2937"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <path
            d="M15.6 15.8C16.2 18.8 18 20 20 20C22 20 23.8 18.8 24.4 15.8Z"
            fill="#FFD400"
          />
        </svg>
      );

    case 'Fashion':
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
          {/* Yellow lower hem accent */}
          <path d="M13 26.5H27V31.2H13V26.5Z" fill="#FFD400" />
          {/* T-shirt outline */}
          <path
            d="M14.5 9.5L8.5 13.2L11.2 19L13 17.8V31.2H27V17.8L28.8 19L31.5 13.2L25.5 9.5C24.2 11.7 22.3 12.8 20 12.8C17.7 12.8 15.8 11.7 14.5 9.5Z"
            stroke="#1F2937"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          <line x1="13" y1="26.5" x2="27" y2="26.5" stroke="#1F2937" strokeWidth="1.8" />
        </svg>
      );

    case 'Mobiles':
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
          {/* Yellow bottom chin accent */}
          <rect x="13" y="27.5" width="14" height="4.5" rx="1.5" fill="#FFD400" />
          {/* Smartphone frame */}
          <rect
            x="12.5"
            y="8"
            width="15"
            height="24.5"
            rx="3.2"
            stroke="#1F2937"
            strokeWidth="2.1"
          />
          <line x1="18" y1="11.5" x2="22" y2="11.5" stroke="#1F2937" strokeWidth="1.9" strokeLinecap="round" />
          <line x1="12.8" y1="27.5" x2="27.2" y2="27.5" stroke="#1F2937" strokeWidth="1.8" />
        </svg>
      );

    case 'Beauty':
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
          {/* Yellow lipstick tip */}
          <path
            d="M17.2 15.5V10.5L22.8 8.3V15.5H17.2Z"
            fill="#FFD400"
            stroke="#1F2937"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Middle collar */}
          <rect
            x="15.8"
            y="15.5"
            width="8.4"
            height="5.2"
            stroke="#1F2937"
            strokeWidth="2"
            fill="#FFFFFF"
          />
          {/* Base tube */}
          <rect
            x="14.2"
            y="20.7"
            width="11.6"
            height="11.5"
            rx="1.8"
            stroke="#1F2937"
            strokeWidth="2.1"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'Electronics':
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
          {/* Laptop screen */}
          <rect
            x="10"
            y="10.5"
            width="20"
            height="14.5"
            rx="2"
            stroke="#1F2937"
            strokeWidth="2.1"
            fill="#FFFFFF"
          />
          {/* Yellow keyboard base */}
          <path
            d="M6.8 25.5H33.2L31.5 30.2C31.2 31 30.4 31.5 29.5 31.5H10.5C9.6 31.5 8.8 31 8.5 30.2L6.8 25.5Z"
            fill="#FFD400"
            stroke="#1F2937"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'Home':
    default:
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
          {/* Yellow lampshade top band */}
          <path d="M14.2 10H25.8L27.2 14H12.8L14.2 10Z" fill="#FFD400" />
          {/* Lampshade */}
          <path
            d="M14.2 10H25.8L29.5 21.5H10.5L14.2 10Z"
            stroke="#1F2937"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          {/* Lamp stem & base */}
          <line x1="20" y1="21.5" x2="20" y2="31" stroke="#1F2937" strokeWidth="2.1" />
          <line
            x1="13.5"
            y1="31.2"
            x2="26.5"
            y2="31.2"
            stroke="#1F2937"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export function AssuredBadge() {
  return (
    <span
      className="inline-flex items-center shrink-0 select-none"
      aria-label="Quality Assured"
    >
      <span className="relative z-10 w-[20px] h-[20px] rounded-full bg-[#FFD400] border-[1.5px] border-[#2874F0] flex items-center justify-center shadow-[0_1px_2px_rgba(40,116,240,0.25)]">
        <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" aria-hidden="true">
          <path
            d="M3.5 8.3L6.6 11.3L12.7 4.8"
            stroke="#1D4ED8"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="-ml-1.5 pl-2.5 pr-2 py-[2px] rounded-r-full bg-gradient-to-r from-[#2874F0] to-[#3B82F6] text-white text-[11px] font-bold italic tracking-tight leading-none">
        Assured
      </span>
    </span>
  );
}

export function PlusStarGlyph({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <path
        d="M16 2.5C17.4 9.2 22.8 14.6 29.5 16C22.8 17.4 17.4 22.8 16 29.5C14.6 22.8 9.2 17.4 2.5 16C9.2 14.6 14.6 9.2 16 2.5Z"
        fill="#FFD400"
        stroke="#EAB308"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M16 9.2C16.7 12.6 19.4 15.3 22.8 16C19.4 16.7 16.7 19.4 16 22.8C15.3 19.4 12.6 16.7 9.2 16C12.6 15.3 15.3 12.6 16 9.2Z"
        fill="#FFFBEB"
      />
    </svg>
  );
}

export function PlusAssuredMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 select-none"
      aria-label="Plus Assured"
    >
      <PlusStarGlyph className={compact ? 'w-6 h-6 shrink-0' : 'w-8 h-8 shrink-0'} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display font-extrabold italic text-[#2874F0] tracking-tight ${
            compact ? 'text-[14px]' : 'text-[17px]'
          }`}
        >
          Plus
        </span>
        <span
          className={`font-display font-bold italic text-[#757575] tracking-wide uppercase ${
            compact ? 'text-[9.5px]' : 'text-[11px]'
          }`}
        >
          U-ASSURED
        </span>
      </span>
    </span>
  );
}

export function PayLaterLogo() {
  return (
    <div className="inline-flex items-center gap-2 shrink-0 select-none">
      <svg viewBox="0 0 46 36" className="w-11 h-9 shrink-0" fill="none" aria-hidden="true">
        {/* Speed motion lines */}
        <line x1="2" y1="12" x2="9" y2="12" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="5" y1="17" x2="11" y2="17" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="3" y1="22" x2="10" y2="22" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" />
        {/* Shopping cart body */}
        <path
          d="M11 8H15L18.5 23.5H37.5L41 11.5H16"
          stroke="#2874F0"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M17.5 13H39.5L36.8 22H19.5L17.5 13Z" fill="#FFD400" />
        {/* Cart grid bars */}
        <line x1="23" y1="13" x2="24" y2="22" stroke="#2874F0" strokeWidth="1.4" />
        <line x1="29" y1="13" x2="29.5" y2="22" stroke="#2874F0" strokeWidth="1.4" />
        <line x1="35" y1="13" x2="34.5" y2="22" stroke="#2874F0" strokeWidth="1.4" />
        {/* Wheels */}
        <circle cx="21" cy="28" r="2.2" fill="#2874F0" />
        <circle cx="35" cy="28" r="2.2" fill="#2874F0" />
      </svg>
      <div className="flex flex-col leading-tight">
        <span className="font-display text-[13px] font-extrabold italic text-[#2874F0]">
          Shopping
        </span>
        <span className="font-display text-[13px] font-bold italic text-[#2874F0]">
          Pay Later
        </span>
      </div>
    </div>
  );
}

export function StoreBrandGlyph({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 28" className={className} fill="none" aria-hidden="true">
      {/* Cart handle & outer frame */}
      <path
        d="M3.2 5.2H7.4L10.3 18.2H24.6L27.6 8.4H8.8"
        stroke="#1D4ED8"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Solid royal-blue cart basket fill for crisp contrast on yellow tile */}
      <path
        d="M9.7 9.6H26.2L23.8 17H11.2L9.7 9.6Z"
        fill="#1D4ED8"
      />
      {/* Subtle yellow highlight bars inside cart basket */}
      <line x1="14.5" y1="11.2" x2="15.1" y2="15.4" stroke="#FFE500" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="18.4" y1="11.2" x2="18.4" y2="15.4" stroke="#FFE500" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="22.1" y1="11.2" x2="21.5" y2="15.4" stroke="#FFE500" strokeWidth="1.6" strokeLinecap="round" />
      {/* Wheels */}
      <circle cx="12.6" cy="22.8" r="2.3" fill="#1D4ED8" />
      <circle cx="22.4" cy="22.8" r="2.3" fill="#1D4ED8" />
    </svg>
  );
}

export function TravelPlaneGlyph({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} fill="none" aria-hidden="true">
      <path
        d="M24.2 3.8C23.5 3.1 22.1 3.3 20.6 4.4L15.8 8.2L6.4 5.7C5.9 5.6 5.3 5.7 4.9 6.1L3.7 7.3C3.3 7.7 3.4 8.4 3.9 8.7L11.8 12.6L8.2 16.4L4.7 15.9C4.2 15.8 3.8 16 3.5 16.3L2.6 17.2C2.2 17.6 2.3 18.2 2.8 18.5L7.6 20.5L9.6 25.2C9.8 25.7 10.5 25.8 10.9 25.4L11.8 24.5C12.1 24.2 12.3 23.7 12.2 23.3L11.7 19.8L15.5 16.2L19.4 24.1C19.7 24.6 20.4 24.7 20.8 24.3L22 23.1C22.4 22.7 22.5 22.1 22.4 21.6L19.9 12.2L23.7 7.4C24.8 5.9 25 4.5 24.2 3.8Z"
        fill="#E53935"
      />
    </svg>
  );
}
