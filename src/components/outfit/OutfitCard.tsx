import React, { useState } from 'react';
import { ArrowUpRight, Play, Image as ImageIcon, Video } from 'lucide-react';
import { Link } from '../../router/Router';
import { Outfit } from '../../types/schema';

interface OutfitCardProps {
  outfit: Outfit;
  priority?: boolean;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, priority = false }) => {
  const [imageError, setImageError] = useState(false);
  const targetUrl = `/outfit/${outfit.slug || outfit.id.toLowerCase()}`;

  const isVideo = outfit.heroMediaType === 'video';
  // Thumbnail prioritized for both video and image to ensure fast grid loads; filter out dead blob: URLs
  const rawImageUrl =
    outfit.heroThumbnailUrl ||
    outfit.heroImageUrl ||
    (!isVideo ? outfit.heroMediaUrl : '');
  const displayImageUrl = rawImageUrl && !rawImageUrl.startsWith('blob:') ? rawImageUrl : '';

  return (
    <Link
      to={targetUrl}
      className="group flex flex-col bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#E5DDD0] hover:border-[#CDA66B] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-xs cursor-pointer"
    >
      {/* 1. Hero Media Visual Canvas (Strict 3:4 Aspect Ratio) */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#EFE6D8]">
        {!imageError && displayImageUrl ? (
          <img
            src={displayImageUrl}
            alt={outfit.heroMediaAlt || outfit.title}
            loading={priority ? 'eager' : 'lazy'}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-103"
          />
        ) : isVideo ? (
          // Lightweight Video Poster placeholder (avoids downloading video binaries in catalog grid)
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#66615B] bg-[#EFE6D8]">
            <div className="w-12 h-12 rounded-full bg-[#171717]/10 flex items-center justify-center mb-2">
              <Play className="w-5 h-5 text-[#CDA66B] fill-current ml-0.5" />
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#A77B3D]">
              Video Reel
            </span>
            <span className="text-xs text-[#66615B] mt-1 font-medium line-clamp-2">
              {outfit.title}
            </span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#66615B] bg-[#EFE6D8]">
            <ImageIcon className="w-8 h-8 mb-2 stroke-1 text-[#66615B]" />
            <span className="text-xs uppercase tracking-wider font-mono text-[#A77B3D] font-bold">
              {outfit.id}
            </span>
            <span className="text-xs text-[#66615B] mt-1">{outfit.title}</span>
          </div>
        )}

        {/* Prominent Outfit ID Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-block bg-[#171717]/90 backdrop-blur-xs text-[#CDA66B] border border-[#CDA66B]/40 font-mono text-xs font-bold px-2.5 py-0.5 rounded shadow-xs">
            {outfit.id}
          </span>
        </div>

        {/* Video Indicator Badge */}
        {isVideo && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 bg-[#171717]/85 backdrop-blur-xs text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
              <Play className="w-2.5 h-2.5 fill-current text-[#CDA66B]" />
              Video Look
            </span>
          </div>
        )}

        {/* Subtle Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-xs font-semibold text-white flex items-center gap-1.5">
            View Look & Pieces
            <ArrowUpRight className="w-3.5 h-3.5 text-[#CDA66B]" />
          </span>
        </div>
      </div>

      {/* 2. Editorial Metadata Container */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 bg-[#FFFFFF]">
        <div>
          {/* Optional Category and Tag */}
          <div className="flex items-center gap-2 text-xs text-[#66615B] font-medium mb-1">
            <span className="text-[#A77B3D] uppercase tracking-wider text-[11px] font-semibold">
              {outfit.category}
            </span>
            {outfit.tags && outfit.tags.length > 0 && (
              <>
                <span aria-hidden="true" className="text-[#E5DDD0]">&bull;</span>
                <span className="text-[#66615B] text-[11px] truncate">
                  {outfit.tags[0]}
                </span>
              </>
            )}
          </div>

          {/* Outfit Title */}
          <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#171717] group-hover:text-[#A77B3D] transition-colors line-clamp-2 leading-snug">
            {outfit.title}
          </h3>
        </div>

        {/* Subtle View Look Action Footer */}
        <div className="pt-3 border-t border-[#E5DDD0] flex items-center justify-between text-xs">
          <span className="text-[#66615B] font-mono text-[11px]">
            {outfit.id}
          </span>
          <span className="text-[#171717] group-hover:text-[#A77B3D] font-semibold flex items-center gap-1 transition-colors">
            <span>View Look</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#CDA66B]" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default OutfitCard;
