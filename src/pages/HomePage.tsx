import React, { useEffect, useState } from 'react';
import { Search, ArrowRight, ShoppingBag, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from '../router/Router';
import { OutfitCard } from '../components/outfit/OutfitCard';
import { getPublishedOutfits, subscribeToPublishedOutfits } from '../firebase/services/outfits';
import { Outfit } from '../types/schema';
import { getAllCategories, getCuratedHomepageCategories } from '../firebase/services/categories';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [curatedCategories, setCuratedCategories] = useState<string[]>(getCuratedHomepageCategories());

  const loadData = () => {
    setLoading(true);
    setError(null);
    getPublishedOutfits()
      .then((data) => {
        setOutfits(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Could not fetch published outfits:', err);
        setError('Unable to load outfits from the database. Please check connection and try again.');
        setLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Subscribe to live Firestore changes so newly published outfits appear instantly
    const unsubscribe = subscribeToPublishedOutfits(
      (published) => {
        if (isMounted) {
          setOutfits(published);
          setLoading(false);
          setError(null);
        }
      },
      (err) => {
        console.warn('Real-time listener issue, falling back to one-time fetch:', err);
        if (isMounted) {
          loadData();
        }
      }
    );

    getAllCategories().then((cats) => {
      if (isMounted) {
        setCuratedCategories(getCuratedHomepageCategories(cats));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Check if query matches exact outfit ID (e.g., OUT-001)
    const normalized = query.toUpperCase();
    const exactMatch = outfits.find(
      (o) => o.id.toUpperCase() === normalized || o.slug.toUpperCase() === normalized
    );

    if (exactMatch) {
      navigate(`/outfit/${exactMatch.slug || exactMatch.id.toLowerCase()}`);
    } else if (/^OUT-[0-9]{3,}$/.test(normalized)) {
      // Direct navigation attempt for standard ID
      navigate(`/outfit/${normalized.toLowerCase()}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Search Header Banner */}
      <section className="pt-6 sm:pt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#A77B3D] block">
              FASHION FINDS &bull; SOCIAL LOOK DISCOVERY
            </span>
            <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#171717] leading-tight">
              Discover Your Next Favourite Look<span className="text-[#CDA66B]">.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#66615B] max-w-xl mx-auto leading-relaxed">
              Curated outfits inspired by social platforms. Enter an outfit number to find its individual pieces from trusted retailers.
            </p>
          </div>

          {/* Prominent Search Field by Outfit Number */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-2">
            <div className="relative flex items-center shadow-sm rounded-xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by outfit number (OUT-001), style, or occasion..."
                className="w-full bg-[#FFFFFF] border border-[#E5DDD0] focus:border-[#CDA66B] focus:ring-2 focus:ring-[#CDA66B]/20 rounded-xl pl-11 pr-28 py-3.5 text-sm text-[#171717] placeholder-[#66615B] outline-none transition"
              />
              <Search className="w-5 h-5 text-[#66615B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#CDA66B] hover:bg-[#A77B3D] text-[#FFFFFF] font-semibold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                Find Look
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-[#66615B] mt-2.5">
              <span>Try Outfit Number:</span>
              <button
                type="button"
                onClick={() => navigate('/outfit/out-001')}
                className="text-[#171717] hover:text-[#A77B3D] font-mono font-semibold underline"
              >
                OUT-001
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => navigate('/outfit/out-002')}
                className="text-[#171717] hover:text-[#A77B3D] font-mono font-semibold underline"
              >
                OUT-002
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => navigate('/discover?cat=Ethnic')}
                className="text-[#171717] hover:text-[#A77B3D] underline"
              >
                Ethnic Fusion
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Outfit Gallery: Four-Column Responsive Grid Directly Below Search */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-[#E5DDD0]">
          <div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#171717] tracking-tight">
              Discover the Looks
            </h2>
            <p className="text-xs sm:text-sm text-[#66615B] mt-1">
              Find your next favourite outfit.
            </p>
          </div>
          <Link
            to="/discover"
            className="text-xs font-semibold text-[#A77B3D] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View All Outfits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Responsive Outfit Grid: 4 columns on Desktop, 2-3 on Tablet, 2 on Mobile (1 on very narrow) */}
        {loading ? (
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-xl bg-[#EFE6D8]/50 border border-[#E5DDD0] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center rounded-2xl bg-amber-50/70 border border-amber-200 max-w-md mx-auto space-y-3">
            <AlertCircle className="w-6 h-6 text-amber-700 mx-auto" />
            <h3 className="text-sm font-semibold text-amber-900">Catalogue Sync Issue</h3>
            <p className="text-xs text-amber-800 leading-relaxed">{error}</p>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFFFFF] border border-amber-300 rounded-lg text-xs font-semibold text-amber-900 hover:bg-amber-100 transition shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Loading</span>
            </button>
          </div>
        ) : outfits.length > 0 ? (
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {outfits.map((outfit, index) => (
              <OutfitCard key={outfit.id} outfit={outfit} priority={index < 4} />
            ))}
          </div>
        ) : (
          <div className="p-10 text-center rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] max-w-md mx-auto space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#F7F3EB] flex items-center justify-center mx-auto text-[#CDA66B]">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-2xl font-bold text-[#171717]">
              Curating Looks
            </h3>
            <p className="text-xs text-[#66615B] leading-relaxed">
              No outfits are currently published in the catalogue. New fashion finds are added regularly.
            </p>
          </div>
        )}
      </section>

      {/* Secondary Category Browsing Section (Placed BELOW Primary Gallery) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div className="bg-[#FFFFFF] border border-[#E5DDD0] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DDD0] pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A77B3D] block">
                Secondary Browsing
              </span>
              <h3 className="font-editorial text-2xl font-bold text-[#171717]">
                Browse by Category
              </h3>
            </div>
            <Link
              to="/categories"
              className="text-xs text-[#A77B3D] hover:underline font-semibold"
            >
              All Categories &rarr;
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {curatedCategories.map((cat) => (
              <Link
                key={cat}
                to={`/discover?cat=${encodeURIComponent(cat)}`}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[#171717] bg-[#F7F3EB] hover:bg-[#EFE6D8] border border-[#E5DDD0] transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Transparent Explanation Section */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-3 pt-2">
        <div className="inline-flex p-2.5 rounded-full bg-[#FFFFFF] border border-[#E5DDD0] text-[#CDA66B] shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h3 className="font-editorial text-2xl font-bold text-[#171717]">
          Independent Fashion Curation
        </h3>
        <p className="text-xs sm:text-sm text-[#66615B] leading-relaxed max-w-xl mx-auto">
          OutFyt.co.in helps you find complete looks from social media and provides verified affiliate links to each individual piece. We do not sell items directly; purchases occur safely on external retailer stores.
        </p>
        <div className="pt-1">
          <Link
            to="/affiliate-disclosure"
            className="text-xs text-[#A77B3D] hover:underline font-semibold"
          >
            Read our Affiliate Disclosure &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
