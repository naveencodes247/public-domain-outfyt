import React, { useState } from 'react';
import { ExternalLink, Tag, ShoppingBag } from 'lucide-react';
import { Product } from '../../types/schema';
import { recordAffiliateClick } from '../../firebase/services/analytics';

interface ProductCardProps {
  product: Product;
  outfitId: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, outfitId }) => {
  const [imageError, setImageError] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

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

  const handleShopClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isValidAffiliateUrl(product.affiliateUrl)) {
      e.preventDefault();
      alert('This affiliate destination is currently unavailable or invalid.');
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
    <div className="group bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#E5DDD0] hover:border-[#CDA66B] transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 shadow-xs hover:shadow-md">
      <div className="flex gap-4">
        {/* Product Visual Thumbnail */}
        <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden bg-[#F7F3EB] shrink-0 border border-[#E5DDD0] flex items-center justify-center">
          {!imageError && product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#66615B] bg-[#F7F3EB] p-2 text-center">
              <ShoppingBag className="w-5 h-5 mb-1 text-[#A77B3D]" />
              <span className="text-[10px] uppercase font-mono text-[#66615B]">Piece</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Retailer Attribution */}
            <div className="flex items-center gap-1.5 text-xs text-[#A77B3D] font-semibold uppercase tracking-wider mb-1">
              <Tag className="w-3 h-3" />
              <span>{product.retailer}</span>
            </div>

            {/* Product Title */}
            <h4 className="text-sm font-semibold text-[#171717] group-hover:text-[#A77B3D] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h4>
          </div>

          {/* Formatted Price */}
          <div className="mt-2">
            {formattedPrice ? (
              <span className="font-mono text-base font-bold text-[#171717] tabular-nums">
                {formattedPrice}
              </span>
            ) : (
              <span className="text-xs text-[#66615B] italic">
                View price on {product.retailer}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* External Action Button */}
      <div className="mt-4 pt-3 border-t border-[#E5DDD0]">
        <a
          href={isValidAffiliateUrl(product.affiliateUrl) ? product.affiliateUrl : '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleShopClick}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#CDA66B] hover:bg-[#A77B3D] active:bg-[#8E652E] text-[#FFFFFF] font-semibold text-xs px-4 py-2.5 rounded-lg transition shadow-xs hover:shadow cursor-pointer"
        >
          <span>{isRedirecting ? 'Opening Retailer...' : `Shop on ${product.retailer}`}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
