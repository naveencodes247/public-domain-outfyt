import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from '../router/Router';

export const CategoriesPage: React.FC = () => {
  const categoryList = [
    {
      name: 'Streetwear',
      tagline: 'Urban Silhouettes & Contemporary Edge',
      description: 'Oversized tees, utility cargos, boxy overshirts, and statement sneakers inspired by Indian metropolitan aesthetics.',
      accent: 'Casual & Youth',
    },
    {
      name: 'Ethnic',
      tagline: 'Modern Indo-Western & Festive Heritage',
      description: 'Sophisticated bundi jackets, textured chanderi kurtas, draped dhotis, and embroidered footwear for celebratory occasions.',
      accent: 'Festive & Heritage',
    },
    {
      name: 'Minimal',
      tagline: 'Quiet Luxury & Tailored Restraint',
      description: 'Subtle palettes, single-pleat trousers, premium natural cottons, and architectural cuts without loud logos.',
      accent: 'Timeless & Refined',
    },
    {
      name: 'Casual',
      tagline: 'Effortless Weekend & Daily Transition',
      description: 'Breathable linen shirts, lightweight chore jackets, relaxed chinos, and understated daywear.',
      accent: 'Everyday Ease',
    },
    {
      name: 'Partywear',
      tagline: 'Nocturne Glamour & Cocktail Chic',
      description: 'Satin lapel blazers, tailored cocktail sets, metallic accents, and high-contrast eveningwear.',
      accent: 'Nightlife & Events',
    },
    {
      name: 'Office Wear',
      tagline: 'Contemporary Professional & Smart Casual',
      description: 'Deconstructed blazers, sharp polo knits, tapered wool trousers, and elevated business wear.',
      accent: 'Executive & Creative',
    },
    {
      name: 'Summer',
      tagline: 'Flax Linens & Breathable Sunwear',
      description: 'Coastal styling, camp-collar shirts, relaxed bermudas, and open-weave essentials.',
      accent: 'Warm Weather',
    },
    {
      name: 'Winter',
      tagline: 'Textured Layering & Soft Knitwear',
      description: 'Structured wool-blend coats, cashmere sweaters, and heavyweight layering pieces.',
      accent: 'Cool Weather',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-widest text-[#A77B3D] font-semibold">
          Occasion & Aesthetics
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#171717] tracking-tight">
          Fashion Categories
        </h1>
        <p className="text-sm text-[#66615B] max-w-xl">
          Explore curated fashion categories tailored for diverse Indian occasions, seasons, and personal aesthetics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categoryList.map((cat) => (
          <Link
            key={cat.name}
            to={`/discover?cat=${encodeURIComponent(cat.name)}`}
            className="group p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] hover:border-[#CDA66B] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg shadow-xs"
          >
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#A77B3D] block mb-2">
                {cat.accent}
              </span>
              <h2 className="font-editorial text-2xl font-bold text-[#171717] group-hover:text-[#A77B3D] transition-colors">
                {cat.name}
              </h2>
              <p className="text-xs font-medium text-[#171717] mt-1 mb-3">
                {cat.tagline}
              </p>
              <p className="text-xs text-[#66615B] leading-relaxed">
                {cat.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5DDD0] flex items-center justify-between text-xs font-semibold text-[#A77B3D]">
              <span>Explore Outfits</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
