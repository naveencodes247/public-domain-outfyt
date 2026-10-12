import React, { useEffect, useState, useMemo } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useSearchParams, useNavigate } from '../router/Router';
import { OutfitCard } from '../components/outfit/OutfitCard';
import { getPublishedOutfits } from '../firebase/services/outfits';
import { getAllCategories, STARTER_CATEGORIES } from '../firebase/services/categories';
import { Outfit, Category } from '../types/schema';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [availableCategories, setAvailableCategories] = useState<Category[]>(STARTER_CATEGORIES);

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const [outfitData, catData] = await Promise.all([
          getPublishedOutfits(),
          getAllCategories(),
        ]);
        if (isMounted) {
          setOutfits(outfitData);
          setAvailableCategories(catData);
        }
      } catch (err) {
        console.warn('Error fetching search data:', err);
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
    if (!q) {
      const p = new URLSearchParams(searchParams);
      p.delete('q');
      setSearchParams(p);
      return;
    }

    // Normalize potential ID forms: OUT-001, out-001, out 001, out001
    const cleanId = q.toUpperCase().replace(/\s+/g, '-');
    const exact = outfits.find(
      (o) =>
        o.id.toUpperCase() === cleanId ||
        o.id.toUpperCase().replace(/[^A-Z0-9]/g, '') === q.toUpperCase().replace(/[^A-Z0-9]/g, '') ||
        o.slug.toUpperCase() === cleanId
    );

    if (exact) {
      navigate(`/outfit/${exact.slug || exact.id.toLowerCase()}`);
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set('q', q);
    setSearchParams(params);
  };

  // High-accuracy Multi-attribute Search Algorithm
  const searchResults = useMemo(() => {
    const rawQuery = queryParam.trim();
    if (!rawQuery) {
      return selectedCategory === 'All'
        ? outfits
        : outfits.filter((o) => o.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    const q = rawQuery.toLowerCase().replace(/\s+/g, ' ');
    const qClean = q.replace(/[^a-z0-9]/g, '');

    const exactMatches: Outfit[] = [];
    const highMatches: Outfit[] = [];
    const standardMatches: Outfit[] = [];

    outfits.forEach((outfit) => {
      if (
        selectedCategory !== 'All' &&
        outfit.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return;
      }

      const outfitIdLower = outfit.id.toLowerCase();
      const outfitIdClean = outfitIdLower.replace(/[^a-z0-9]/g, '');
      const titleLower = outfit.title.toLowerCase();
      const slugLower = outfit.slug?.toLowerCase() || '';
      const catLower = outfit.category.toLowerCase();
      const descLower = outfit.description?.toLowerCase() || '';
      const tagsLower = outfit.tags?.map((t) => t.toLowerCase()) || [];

      // 1. Exact ID or Slug Match (Priority 1)
      if (
        outfitIdLower === q ||
        outfitIdClean === qClean ||
        slugLower === q ||
        slugLower === q.replace(/\s+/g, '-')
      ) {
        exactMatches.push(outfit);
      }
      // 2. High relevance: Category/Occasion, Title exact, or Tag exact (Priority 2)
      else if (
        catLower === q ||
        titleLower === q ||
        tagsLower.includes(q)
      ) {
        highMatches.push(outfit);
      }
      // 3. Partial keyword matches: Title partial, Category partial, Tag partial, Description (Priority 3)
      else if (
        outfitIdLower.includes(q) ||
        outfitIdClean.includes(qClean) ||
        titleLower.includes(q) ||
        catLower.includes(q) ||
        tagsLower.some((t) => t.includes(q)) ||
        descLower.includes(q)
      ) {
        standardMatches.push(outfit);
      }
    });

    return [...exactMatches, ...highMatches, ...standardMatches];
  }, [outfits, queryParam, selectedCategory]);

  // Dynamic filter category names (Curated + Custom occasions)
  const categoryNames = useMemo(() => {
    const names = ['All'];
    availableCategories.forEach((c) => {
      if (!names.includes(c.name)) names.push(c.name);
    });
    return names;
  }, [availableCategories]);

  // Lightweight matching category suggestion
  const matchingCategory = useMemo(() => {
    if (!queryParam.trim()) return null;
    const qNorm = queryParam.trim().toLowerCase();
    return availableCategories.find(
      (c) =>
        c.name.toLowerCase() === qNorm ||
        c.name.toLowerCase().includes(qNorm)
    );
  }, [queryParam, availableCategories]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs uppercase tracking-widest text-[#A77B3D] font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#CDA66B]" />
          <span>Look Identification & Multi-Field Search</span>
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#171717] tracking-tight">
          Find Your Desired Look
        </h1>
        <p className="text-sm text-[#66615B]">
          Search by exact Look ID (e.g. <span className="font-mono text-[#A77B3D] font-bold">OUT-001</span>), outfit title, fashion category, occasion, or style tags.
        </p>
      </div>

      {/* Search Input Box (Preserving existing design and placement) */}
      <div className="max-w-2xl space-y-3">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative flex items-center shadow-xs">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by outfit number (OUT-001), style, or occasion..."
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

        {/* Lightweight Category Match Suggestion Banner */}
        {matchingCategory && selectedCategory !== matchingCategory.name && (
          <div className="flex items-center gap-2 text-xs text-[#66615B] bg-[#F7F3EB] border border-[#E5DDD0] rounded-xl px-3.5 py-2">
            <span>Matching fashion category:</span>
            <button
              type="button"
              onClick={() => setSelectedCategory(matchingCategory.name)}
              className="text-[#A77B3D] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{matchingCategory.name}</span>
              <span className="text-[10px] text-[#66615B]">({matchingCategory.group || 'Occasion'})</span>
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {categoryNames.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
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
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
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
            No outfits found matching <span className="text-[#171717] font-mono font-bold">"{queryParam}"</span>. Try another keyword, style, or browse curated categories.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="text-[11px] text-[#66615B] block w-full mb-1">Try searching:</span>
            {['OUT-001', 'Streetwear', 'Ethnic', 'Casual', 'Party Wear'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setSearchTerm(term);
                  const p = new URLSearchParams(searchParams);
                  p.set('q', term);
                  setSearchParams(p);
                }}
                className="px-2.5 py-1 text-xs bg-[#F7F3EB] hover:bg-[#EFE6D8] border border-[#E5DDD0] rounded-lg text-[#171717] transition cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              const p = new URLSearchParams(searchParams);
              p.delete('q');
              setSearchParams(p);
            }}
            className="text-xs text-[#A77B3D] hover:underline font-semibold pt-2 block mx-auto cursor-pointer"
          >
            Reset Search & Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
