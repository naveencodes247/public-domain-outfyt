import React from 'react';
import { Compass, ArrowLeft, Search, Home } from 'lucide-react';
import { Link } from '../router/Router';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center space-y-6">
      {/* 404 Badge */}
      <div className="w-16 h-16 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] text-[#CDA66B] flex items-center justify-center mx-auto shadow-xs">
        <Compass className="w-8 h-8 text-[#CDA66B]" />
      </div>

      <div className="space-y-3">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#A77B3D] block">
          404 &bull; PAGE NOT FOUND
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#171717] tracking-tight">
          Lost in the Catalog<span className="text-[#CDA66B]">?</span>
        </h1>
        <p className="text-sm text-[#66615B] max-w-md mx-auto leading-relaxed">
          The page or look you requested cannot be found. It may have been moved, renamed, or is temporarily unavailable.
        </p>
      </div>

      {/* Helpful Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#CDA66B] hover:bg-[#A77B3D] text-[#FFFFFF] font-semibold text-xs px-5 py-3 rounded-xl transition shadow-xs cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/discover"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFFFFF] hover:bg-[#F7F3EB] text-[#171717] font-semibold text-xs px-5 py-3 rounded-xl border border-[#E5DDD0] transition shadow-xs cursor-pointer"
        >
          <Compass className="w-4 h-4 text-[#CDA66B]" />
          <span>Discover Outfits</span>
        </Link>
        <Link
          to="/search"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFFFFF] hover:bg-[#F7F3EB] text-[#171717] font-semibold text-xs px-5 py-3 rounded-xl border border-[#E5DDD0] transition shadow-xs cursor-pointer"
        >
          <Search className="w-4 h-4 text-[#CDA66B]" />
          <span>Search by Look ID</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
