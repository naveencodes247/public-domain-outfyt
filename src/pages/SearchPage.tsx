import React, { useEffect, useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams, useNavigate } from '../router/Router';
import { OutfitCard } from '../components/outfit/OutfitCard';
import { getPublishedOutfits } from '../firebase/services/outfits';
import { Outfit } from '../types/schema';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getPublishedOutfits();
        if (isMounted) setOutfits(data);
      } catch (err) {
        console.warn('Error fetching outfits:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    const normalized = q.toUpperCase();

    // Check if exact match exists in outfits
    const exact = outfits.find((o) => o.id.toUpperCase() === normalized || o.slug.toUpperCase() === normalized);
    if (exact) {
      navigate(`/outfit/${exact.slug || exact.id.toLowerCase()}`);
      return;
    }

    const params = new URLSearchParams(searchParams);
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  // Prioritize Exact Look ID Matches
  const searchResults = useMemo(() => {
    const q = queryParam.trim().toLowerCase();
    if (!q) {
      return selectedCategory === 'All'
        ? outfits
        : outfits.filter((o) => o.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    const exactIdMatches: Outfit[] = [];
    const keywordMatches: Outfit[] = [];

    outfits.forEach((outfit) => {
      if (selectedCategory !== 'All' && outfit.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return;
      }

      const outfitIdLower = outfit.id.toLowerCase();
      if (outfitIdLower === q || outfitIdLower === q.replace(/\s+/g, '-')) {
        exactIdMatches.push(outfit);
      } else if (
        outfitIdLower.includes(q) ||
        outfit.title.toLowerCase().includes(q) ||
        (outfit.description && outfit.description.toLowerCase().includes(q)) ||
        outfit.category.toLowerCase().includes(q) ||
        outfit.tags?.some((t) => t.toLowerCase().includes(q))
      ) {
        keywordMatches.push(outfit);
      }
    });

    return [...exactIdMatches, ...keywordMatches];
  }, [outfits, queryParam, selectedCategory]);

  const categories = ['All', 'Casual', 'Streetwear', 'Ethnic', 'Minimal', 'Partywear', 'Office Wear', 'Summer', 'Winter'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs uppercase tracking-widest text-[#A77B3D] font-semibold">
          Look Identification & Search
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#171717] tracking-tight">
          Find Your Desired Outfit
        </h1>
        <p className="text-sm text-[#66615B]">
          Enter an exact Look ID such as <span className="font-mono text-[#A77B3D] font-bold">OUT-001</span>, or search by style, occasion, or retailer.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="max-w-2xl">
        <div className="relative flex items-center shadow-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type outfit identifier (e.g. OUT-001) or keyword..."
            className="w-full bg-[#FFFFFF] border border-[#E5DDD0] focus:border-[#CDA66B] focus:ring-2 focus:ring-[#CDA66B]/20 rounded-xl pl-11 pr-28 py-3.5 text-sm text-[#171717] placeholder-[#66615B] outline-none transition"
          />
          <Search className="w-5 h-5 text-[#66615B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#CDA66B] hover:bg-[#A77B3D] text-[#FFFFFF] font-semibold text-xs px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Search
          </button>
        </div>
      </form>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap shrink-0 ${
              selectedCategory === cat
                ? 'bg-[#CDA66B] text-[#FFFFFF] font-semibold'
                : 'bg-[#FFFFFF] text-[#66615B] hover:text-[#171717] border border-[#E5DDD0]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Results Display */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-xl bg-[#EFE6D8]/50 border border-[#E5DDD0] animate-pulse"
            />
          ))}
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-4">
          <div className="text-xs text-[#66615B]">
            Found <strong className="text-[#171717]">{searchResults.length}</strong> outfit(s)
            {queryParam ? ` matching "${queryParam}"` : ''}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {searchResults.map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#F7F3EB] flex items-center justify-center mx-auto text-[#66615B]">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-2xl font-bold text-[#171717]">No Results Found</h3>
          <p className="text-xs text-[#66615B] leading-relaxed">
            No outfits found matching <span className="text-[#171717] font-mono font-bold">"{queryParam}"</span>. Check the Look ID, or explore all looks in Discover.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              const p = new URLSearchParams(searchParams);
              p.delete('q');
              setSearchParams(p);
            }}
            className="text-xs text-[#A77B3D] hover:underline font-semibold"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
