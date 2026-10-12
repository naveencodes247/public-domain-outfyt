import React, { useEffect, useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from '../router/Router';
import { OutfitCard } from '../components/outfit/OutfitCard';
import { getPublishedOutfits } from '../firebase/services/outfits';
import { Outfit } from '../types/schema';
import { getAllCategories, STARTER_CATEGORIES } from '../firebase/services/categories';

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('cat') || 'All'
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'title'>('latest');
  const [categories, setCategories] = useState<string[]>([
    'All',
    ...STARTER_CATEGORIES.map((c) => c.name),
  ]);

  useEffect(() => {
    let isMounted = true;
    getAllCategories().then((cats) => {
      if (isMounted) {
        const list = ['All', ...cats.map((c) => c.name)];
        // Include any custom URL category if passed
        const urlCat = searchParams.get('cat');
        if (urlCat && !list.includes(urlCat)) {
          list.push(urlCat);
        }
        setCategories(Array.from(new Set(list)));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    async function fetchOutfits() {
      try {
        const data = await getPublishedOutfits();
        if (isMounted) setOutfits(data);
      } catch (err) {
        console.warn('Error fetching outfits:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchOutfits();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const urlCat = searchParams.get('cat');
    if (urlCat) {
      setSelectedCategory(urlCat);
    }
  }, [searchParams]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') {
      params.delete('cat');
    } else {
      params.set('cat', cat);
    }
    setSearchParams(params);
  };

  const filteredOutfits = useMemo(() => {
    return outfits
      .filter((outfit) => {
        if (selectedCategory !== 'All' && outfit.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const matchesId = outfit.id.toLowerCase().includes(q);
          const matchesTitle = outfit.title.toLowerCase().includes(q);
          const matchesCategory = outfit.category.toLowerCase().includes(q);
          const matchesTag = outfit.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchesId && !matchesTitle && !matchesCategory && !matchesTag) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        const timeA = a.createdAt ? new Date(String(a.createdAt)).getTime() : 0;
        const timeB = b.createdAt ? new Date(String(b.createdAt)).getTime() : 0;
        return timeB - timeA;
      });
  }, [outfits, selectedCategory, searchTerm, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#A77B3D] font-semibold">
          Curated Catalog
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#171717] tracking-tight">
          Discover Fashion Finds
        </h1>
        <p className="text-sm text-[#66615B] max-w-xl">
          Browse verified outfits styled from trending social reels, shorts, and pins. Each look comes with individual garment details and direct affiliate store links.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#E5DDD0] p-4 rounded-2xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by outfit ID (e.g. OUT-001), keyword, or occasion..."
              className="w-full bg-[#F7F3EB] border border-[#E5DDD0] focus:border-[#CDA66B] focus:ring-1 focus:ring-[#CDA66B] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#171717] placeholder-[#66615B] outline-none transition"
            />
            <Search className="w-4 h-4 text-[#66615B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#66615B]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#F7F3EB] border border-[#E5DDD0] rounded-xl px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#CDA66B]"
            >
              <option value="latest">Recently Added</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Functional Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#CDA66B] text-[#FFFFFF] font-semibold shadow-xs'
                    : 'bg-[#F7F3EB] text-[#66615B] hover:text-[#171717] border border-[#E5DDD0]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-xl bg-[#EFE6D8]/50 border border-[#E5DDD0] animate-pulse"
            />
          ))}
        </div>
      ) : filteredOutfits.length > 0 ? (
        <div className="space-y-4">
          <div className="text-xs text-[#66615B]">
            Showing <strong className="text-[#171717]">{filteredOutfits.length}</strong> outfit looks
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredOutfits.map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] max-w-md mx-auto space-y-3 shadow-xs">
          <h3 className="font-editorial text-2xl font-bold text-[#171717]">No Matching Outfits</h3>
          <p className="text-xs text-[#66615B]">
            We couldn't find any published outfits matching your current filter criteria.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchTerm('');
            }}
            className="text-xs text-[#A77B3D] hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
