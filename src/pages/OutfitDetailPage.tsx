import React, { useEffect, useState } from 'react';
import { useLocation, Link } from '../router/Router';
import { ArrowLeft, Share2, ShieldCheck, ShoppingBag, Check, Play, Volume2, VolumeX, Eye } from 'lucide-react';
import { ProductCard } from '../components/outfit/ProductCard';
import { OutfitCard } from '../components/outfit/OutfitCard';
import { getOutfitBySlug, getOutfitById, getPublishedOutfits } from '../firebase/services/outfits';
import { getProductsByOutfitId } from '../firebase/services/products';
import { auth } from '../firebase/config';
import { Outfit, Product } from '../types/schema';

export const OutfitDetailPage: React.FC = () => {
  const { pathname } = useLocation();
  const slug = pathname.replace('/outfit/', '').replace(/\/$/, '');

  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [relatedOutfits, setRelatedOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadOutfitData() {
      setLoading(true);
      try {
        if (!slug) return;
        let current = await getOutfitBySlug(slug);

        // If not found publicly but user is authenticated administrator, check admin lookup
        if (!current && auth.currentUser) {
          try {
            current = await getOutfitById(slug.toUpperCase());
          } catch (adminErr) {
            console.warn('Admin lookup failed:', adminErr);
          }
        }

        if (isMounted) {
          setOutfit(current);
          if (current) {
            const items = await getProductsByOutfitId(current.id, current.slug || slug);
            if (isMounted) setProducts(items);

            const allPublished = await getPublishedOutfits();
            if (isMounted) {
              const related = allPublished.filter((o) => o.id !== current.id);
              setRelatedOutfits(related.slice(0, 3));
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load outfit detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOutfitData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-6 w-32 bg-[#EFE6D8] rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 aspect-[3/4] bg-[#EFE6D8] rounded-2xl" />
          <div className="lg:col-span-6 space-y-4">
            <div className="h-10 bg-[#EFE6D8] rounded w-3/4" />
            <div className="h-20 bg-[#EFE6D8] rounded" />
            <div className="h-32 bg-[#EFE6D8] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!outfit) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#EFE6D8] flex items-center justify-center mx-auto text-[#66615B]">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h2 className="font-editorial text-3xl font-bold text-[#171717]">Outfit Not Found</h2>
        <p className="text-xs text-[#66615B]">
          This look may be private, in draft state, or no longer available in the public catalog.
        </p>
        <div className="pt-2">
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 bg-[#CDA66B] hover:bg-[#A77B3D] text-[#FFFFFF] font-semibold text-xs px-5 py-2.5 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Discover Outfits
          </Link>
        </div>
      </div>
    );
  }

  const isVideo = outfit.heroMediaType === 'video';
  const mediaUrl = outfit.heroMediaUrl || outfit.heroImageUrl;
  const posterUrl = outfit.heroThumbnailUrl || outfit.heroImageUrl;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-12">
      {/* Admin Draft / Archived Notice */}
      {outfit.status !== 'published' && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Administrator Preview:</strong> This look is currently saved as{' '}
              <strong className="uppercase">{outfit.status}</strong>. It is hidden from public discovery until published.
            </span>
          </div>
          <Link
            to={`/admin/outfits/${outfit.id}/edit`}
            className="text-amber-900 underline font-semibold hover:text-amber-950 shrink-0"
          >
            Edit & Publish Look &rarr;
          </Link>
        </div>
      )}

      {/* Top Bar Actions */}
      <div className="flex items-center justify-between text-xs text-[#66615B]">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[#66615B] hover:text-[#171717] font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Outfits</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 bg-[#FFFFFF] hover:bg-[#F7F3EB] text-[#171717] px-3.5 py-1.5 rounded-lg border border-[#E5DDD0] transition shadow-xs cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-[#CDA66B]" />}
          <span>{copied ? 'Link Copied!' : 'Share Look'}</span>
        </button>
      </div>

      {/* Main Outfit Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Hero Media (Image or Video) */}
        <div className="lg:col-span-6 sticky top-24">
          <div className="rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#E5DDD0] shadow-md relative">
            <div className="aspect-[3/4] relative bg-[#EFE6D8] overflow-hidden">
              {isVideo ? (
                <div className="w-full h-full relative">
                  <video
                    src={mediaUrl}
                    poster={posterUrl || undefined}
                    controls
                    playsInline
                    muted={isMuted}
                    preload="auto"
                    className="w-full h-full object-cover"
                  />
                  {/* Floating Mute/Unmute Toggle Shortcut */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute top-4 right-4 z-20 bg-[#171717]/80 backdrop-blur-xs text-white p-2 rounded-full border border-white/20 hover:bg-[#171717] transition"
                    title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#CDA66B]" />}
                  </button>
                </div>
              ) : (
                <img
                  src={mediaUrl}
                  alt={outfit.heroMediaAlt || outfit.title}
                  className="w-full h-full object-cover object-top"
                />
              )}
            </div>

            {/* Corner Look ID Badge */}
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-[#171717]/90 backdrop-blur-xs text-[#CDA66B] border border-[#CDA66B]/40 font-mono text-sm font-bold px-3 py-1 rounded shadow-md">
                {outfit.id}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Information & "SHOP THE LOOK" */}
        <div className="lg:col-span-6 space-y-8">
          {/* Header Metadata */}
          <div className="space-y-3 pb-6 border-b border-[#E5DDD0]">
            <div className="flex items-center gap-2 text-xs text-[#66615B] font-medium">
              <span className="text-[#A77B3D] uppercase tracking-wider font-semibold">
                {outfit.category}
              </span>
              <span>&bull;</span>
              <span className="font-mono text-[#171717] font-semibold">{outfit.id}</span>
              {isVideo && (
                <>
                  <span>&bull;</span>
                  <span className="text-[#A77B3D] font-medium flex items-center gap-1">
                    <Play className="w-3 h-3 fill-current" />
                    Video Look
                  </span>
                </>
              )}
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#171717] tracking-tight leading-tight">
              {outfit.title}
            </h1>

            {outfit.description && (
              <p className="text-sm sm:text-base text-[#66615B] leading-relaxed pt-1">
                {outfit.description}
              </p>
            )}

            {/* Tags */}
            {outfit.tags && outfit.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                {outfit.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] text-[#66615B] bg-[#FFFFFF] border border-[#E5DDD0] px-2.5 py-1 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* "SHOP THE LOOK" Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#A77B3D] font-semibold block">
                  Component Pieces
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
                  SHOP THE LOOK
                </h2>
              </div>
              <span className="text-xs text-[#66615B]">
                {products.length} {products.length === 1 ? 'piece' : 'pieces'} curated
              </span>
            </div>

            {products.length > 0 ? (
              <div className="space-y-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id || product.name}
                    product={product}
                    outfitId={outfit.id}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-[#FFFFFF] border border-[#E5DDD0] text-xs text-[#66615B]">
                Product affiliate destinations for this look are currently being updated by our editorial team.
              </div>
            )}
          </div>

          {/* Transparent Affiliate Disclosure Box */}
          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DDD0] text-xs text-[#66615B] space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 font-semibold text-[#171717]">
              <ShieldCheck className="w-4 h-4 text-[#CDA66B]" />
              <span>Affiliate Transparency Disclosure</span>
            </div>
            <p className="leading-relaxed">
              OutFyt.co.in is an independent curation platform and does not sell items directly. When you purchase through the retailer buttons above, we may earn an affiliate commission at no extra charge to you.
            </p>
          </div>
        </div>
      </div>

      {/* Related Outfits Section */}
      {relatedOutfits.length > 0 && (
        <div className="pt-10 border-t border-[#E5DDD0] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
              More Looks You Might Love
            </h3>
            <Link to="/discover" className="text-xs text-[#A77B3D] hover:underline font-semibold">
              Browse All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedOutfits.map((related) => (
              <OutfitCard key={related.id} outfit={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OutfitDetailPage;
