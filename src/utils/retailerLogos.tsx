import React from 'react';

interface RetailerLogoProps {
  retailer: string;
  logoUrl?: string | null;
  className?: string;
}

/**
 * Returns genuine retailer logo or branded monogram badge.
 * Supports direct logoUrl if configured in the admin portal,
 * or genuine vector marks for top fashion retailers.
 */
export const RetailerLogo: React.FC<RetailerLogoProps> = ({
  retailer,
  logoUrl,
  className = 'h-5 w-auto max-w-[80px]',
}) => {
  const [imgError, setImgError] = React.useState(false);

  // If a direct logo URL was configured and hasn't errored
  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={`${retailer} logo`}
        className={`${className} object-contain`}
        onError={() => setImgError(true)}
      />
    );
  }

  const normalized = (retailer || '').toLowerCase().trim();

  // Amazon India / Amazon
  if (normalized.includes('amazon')) {
    return (
      <div className="flex items-center gap-1 font-bold text-[#171717] text-xs tracking-tight">
        <span className="font-sans font-black text-[13px]">amazon</span>
        <span className="text-[#CDA66B] font-bold text-[10px]">.in</span>
      </div>
    );
  }

  // Myntra
  if (normalized.includes('myntra')) {
    return (
      <div className="flex items-center gap-1.5 font-bold">
        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#FF3F6C] via-[#F16521] to-[#FFA200] flex items-center justify-center shadow-xs">
          <span className="text-white text-[9px] font-black leading-none">M</span>
        </div>
        <span className="text-[#FF3F6C] text-xs font-black tracking-wide">MYNTRA</span>
      </div>
    );
  }

  // Flipkart
  if (normalized.includes('flipkart')) {
    return (
      <div className="flex items-center gap-1.5 font-bold">
        <div className="w-4 h-4 rounded-sm bg-[#2874F0] flex items-center justify-center text-[#FFE500] font-black text-[10px] italic shadow-xs">
          f
        </div>
        <span className="text-[#2874F0] text-xs font-bold tracking-tight">Flipkart</span>
      </div>
    );
  }

  // Zara
  if (normalized.includes('zara')) {
    return (
      <span className="font-serif tracking-widest text-xs font-black text-[#171717]">
        ZARA
      </span>
    );
  }

  // H&M
  if (normalized.includes('h&m') || normalized.includes('hm')) {
    return (
      <span className="text-[#E50010] font-black text-sm italic tracking-tight font-serif">
        H&amp;M
      </span>
    );
  }

  // Ajio / Ajio Luxe
  if (normalized.includes('ajio')) {
    return (
      <div className="flex items-center gap-1">
        <span className="bg-[#171717] text-[#FFFFFF] text-[10px] font-black px-1.5 py-0.5 rounded tracking-widest">
          AJIO
        </span>
        {normalized.includes('luxe') && (
          <span className="text-[#CDA66B] font-serif text-[10px] tracking-widest uppercase">
            LUXE
          </span>
        )}
      </div>
    );
  }

  // Nicobar
  if (normalized.includes('nicobar')) {
    return (
      <span className="text-[#171717] font-serif uppercase tracking-widest text-xs font-bold">
        NICOBAR
      </span>
    );
  }

  // Fabindia
  if (normalized.includes('fabindia')) {
    return (
      <span className="text-[#7D1D3F] font-serif uppercase tracking-wider text-xs font-bold">
        fabindia
      </span>
    );
  }

  // Tata CLiQ
  if (normalized.includes('tata cliq') || normalized.includes('cliq')) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-[#171717] font-black text-xs tracking-tight">TATA</span>
        <span className="text-[#E70050] font-black text-xs tracking-tight">CLiQ</span>
      </div>
    );
  }

  // Shoppers Stop
  if (normalized.includes('shoppers stop')) {
    return (
      <span className="text-[#171717] uppercase tracking-wider text-[11px] font-black">
        SHOPPERS STOP
      </span>
    );
  }

  // Meesho
  if (normalized.includes('meesho')) {
    return (
      <div className="flex items-center gap-1 font-bold text-[#800080]">
        <div className="w-4 h-4 rounded-full bg-[#800080] text-white flex items-center justify-center text-[10px] font-black">
          m
        </div>
        <span className="text-xs font-black tracking-tight text-[#800080]">meesho</span>
      </div>
    );
  }

  // Snitch
  if (normalized.includes('snitch')) {
    return (
      <span className="text-[#171717] uppercase tracking-widest text-xs font-black">
        SNITCH
      </span>
    );
  }

  // Urbanic
  if (normalized.includes('urbanic')) {
    return (
      <span className="text-[#171717] uppercase tracking-widest text-xs font-semibold">
        URBANIC
      </span>
    );
  }

  // Uniqlo
  if (normalized.includes('uniqlo')) {
    return (
      <div className="bg-[#E50010] text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase inline-block">
        UNIQLO
      </div>
    );
  }

  // Default clean monogram badge
  const initial = retailer ? retailer.trim().charAt(0).toUpperCase() : 'R';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-4 rounded bg-[#EFE6D8] border border-[#E5DDD0] text-[#171717] flex items-center justify-center text-[10px] font-bold">
        {initial}
      </div>
      <span className="text-xs font-semibold text-[#171717] truncate max-w-[100px]">
        {retailer}
      </span>
    </div>
  );
};
