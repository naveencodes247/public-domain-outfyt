import React, { useState } from 'react';
import { ExternalLink, Tag, ShoppingBag, AlertCircle } from 'lucide-react';
import { Product } from '../../types/schema';
import { recordAffiliateClick } from '../../firebase/services/analytics';
import { RetailerLogo } from '../../utils/retailerLogos';

interface ProductCardProps {
  product: Product;
  outfitId: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, outfitId }) => {
  const [imageError, setImageError] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Validate URL scheme for security
  const isValidAffiliateUrl = (url?: string): boolean => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  };

  const isUrlValid = isValidAffiliateUrl(product.affiliateUrl);

  const handleShopClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isUrlValid) {
      e.preventDefault();
      setLinkError('Direct link temporarily updating');
      setTimeout(() => setLinkError(null), 3000);
      return;
    }

    setIsRedirecting(true);
    try {
      await recordAffiliateClick(outfitId, product.id || 'unknown', product.retailer);
    } catch (err) {
      console.warn('Click event logged locally:', err);
    } finally {
      setTimeout(() => setIsRedirecting(false), 500);
    }
  };

  // Safe Indian Rupee formatting
  const formatPrice = (price?: number | null, currency = 'INR') => {
    if (price === undefined || price === null || isNaN(price)) {
      return null;
    }
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
      }).format(price);
    } catch {
      return `₹${price}`;
    }
  };

  const formattedPrice = formatPrice(product.price, product.currency);

  return (
    <div className="group bg-[#FFFFFF] rounded-2xl overflow-hidden border border-[#E5DDD0] hover:border-[#CDA66B] transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 shadow-xs hover:shadow-md">
      <div className="flex gap-4">
        {/* Product Visual Thumbnail or Tasteful Placeholder */}
        <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-[#F7F3EB] shrink-0 border border-[#E5DDD0] flex items-center justify-center relative">
          {!imageError && product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#66615B] bg-[#F7F3EB] p-2 text-center">
              <ShoppingBag className="w-6 h-6 mb-1 text-[#A77B3D]" />
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#66615B]">
                {product.category || 'Piece'}
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            {/* Retailer & Category Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <RetailerLogo retailer={product.retailer} logoUrl={product.retailerLogoUrl} />
              </div>

              {product.category && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-[#A77B3D] bg-[#F7F3EB] border border-[#E5DDD0] px-2 py-0.5 rounded-full">
                  <Tag className="w-2.5 h-2.5" />
                  {product.category}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h4 className="text-sm font-semibold text-[#171717] group-hover:text-[#A77B3D] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h4>
          </div>

          {/* Formatted Price (Only shown when price is valid) */}
          <div className="mt-2">
            {formattedPrice ? (
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-base font-bold text-[#171717] tabular-nums">
                  {formattedPrice}
                </span>
                <span className="text-[11px] text-[#66615B]">
                  on {product.retailer}
                </span>
              </div>
            ) : (
              <span className="text-xs text-[#66615B] italic">
                Check price on {product.retailer}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* External Action Button: Clear "Shop Now" */}
      <div className="mt-4 pt-3 border-t border-[#E5DDD0]">
        {linkError && (
          <div className="mb-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
            <span>{linkError}</span>
          </div>
        )}
        <a
          href={isUrlValid ? product.affiliateUrl : '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleShopClick}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#CDA66B] hover:bg-[#A77B3D] active:bg-[#8E652E] text-[#FFFFFF] font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-xs hover:shadow cursor-pointer"
        >
          <span>{isRedirecting ? 'Opening Retailer...' : `Shop Now on ${product.retailer}`}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
