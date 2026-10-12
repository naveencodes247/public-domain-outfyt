import React, { useEffect, useState, useMemo } from 'react';
import { ArrowRight, Sparkles, Filter, Calendar } from 'lucide-react';
import { Link } from '../router/Router';
import { getAllCategories, STARTER_CATEGORIES } from '../firebase/services/categories';
import { Category, CategoryGroup } from '../types/schema';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(STARTER_CATEGORIES);
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getAllCategories().then((cats) => {
      if (isMounted) {
        setCategories(cats);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const groups: Array<'All' | CategoryGroup> = [
    'All',
    'Everyday',
    'Occasions',
    'Seasonal',
    'Style',
    'Custom',
  ];

  const filteredCategories = useMemo(() => {
    if (selectedGroup === 'All') return categories;
    return categories.filter((c) => (c.group || 'Custom') === selectedGroup);
  }, [categories, selectedGroup]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-widest text-[#A77B3D] font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#CDA66B]" />
          <span>Occasions, Aesthetics & Seasons</span>
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#171717] tracking-tight">
          Fashion Categories & Occasions
        </h1>
        <p className="text-sm text-[#66615B] max-w-2xl leading-relaxed">
          Explore curated fashion categories and bespoke occasions tailored for diverse Indian settings, festivals, seasons, and personal aesthetics.
        </p>
      </div>

      {/* Filter Tabs by Group */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5DDD0] no-scrollbar">
        {groups.map((grp) => {
          const isActive = selectedGroup === grp;
          const count =
            grp === 'All'
              ? categories.length
              : categories.filter((c) => (c.group || 'Custom') === grp).length;

          if (grp !== 'All' && count === 0) return null;

          return (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#171717] text-[#FFFFFF] shadow-sm'
                  : 'bg-[#F7F3EB] text-[#66615B] hover:text-[#171717] border border-[#E5DDD0]'
              }`}
            >
              <span>{grp}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#E5DDD0] text-[#66615B]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCategories.map((cat) => (
          <Link
            key={cat.id || cat.name}
            to={`/discover?cat=${encodeURIComponent(cat.name)}`}
            className="group p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] hover:border-[#CDA66B] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#A77B3D] block">
                  {cat.accent || cat.group || 'Curated'}
                </span>
                {cat.isCustom && (
                  <span className="inline-flex items-center gap-1 text-[9px] bg-[#CDA66B]/15 text-[#A77B3D] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                    <Calendar className="w-2.5 h-2.5" />
                    Custom
                  </span>
                )}
              </div>
              <h2 className="font-editorial text-2xl font-bold text-[#171717] group-hover:text-[#A77B3D] transition-colors">
                {cat.name}
              </h2>
              {cat.tagline && (
                <p className="text-xs font-medium text-[#171717] mt-1 mb-2.5 line-clamp-1">
                  {cat.tagline}
                </p>
              )}
              {cat.description && (
                <p className="text-xs text-[#66615B] leading-relaxed line-clamp-3 mt-1">
                  {cat.description}
                </p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5DDD0] flex items-center justify-between text-xs font-semibold text-[#A77B3D]">
              <span>Explore Looks</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
