import React, { useState, useEffect } from 'react';
import { Search, Menu, X, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from '../../router/Router';
import { OutFytLogo } from '../brand/OutFytLogo';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer and search modal on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim();
    setSearchOpen(false);
    setSearchQuery('');

    // Normalize potential ID forms: OUT-001, out-001, out 001, out001
    const cleanId = q.toUpperCase().replace(/\s+/g, '-');
    if (/^OUT-[0-9]{3,}$/.test(cleanId)) {
      navigate(`/outfit/${cleanId.toLowerCase()}`);
    } else if (/^OUT[0-9]{3,}$/.test(cleanId)) {
      const formatted = `out-${cleanId.substring(3).toLowerCase()}`;
      navigate(`/outfit/${formatted}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const navLinks = [
    { label: 'Discover', path: '/discover' },
    { label: 'About', path: '/about' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-[#FFFFFF]/95 backdrop-blur-md border-[#E5DDD0] shadow-sm py-2.5'
            : 'bg-[#F7F3EB] border-[#E5DDD0] py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6">
            {/* Zone 1: OutFyt Logo */}
            <Link to="/" className="shrink-0 flex items-center">
              <OutFytLogo variant="compact" theme="light" size="sm" />
            </Link>

            {/* Zone 2: Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`transition-colors whitespace-nowrap shrink-0 relative py-1 ${
                      isActive
                        ? 'text-[#A77B3D] font-semibold'
                        : 'text-[#66615B] hover:text-[#171717]'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#CDA66B] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Zone 3: Search, Admin Shortcut & Mobile Navigation */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Quick Search Action */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 text-xs text-[#66615B] bg-[#FFFFFF] hover:bg-[#EFE6D8]/50 hover:text-[#171717] px-3.5 py-2 rounded-lg border border-[#E5DDD0] transition shadow-xs cursor-pointer"
                aria-label="Search outfits"
              >
                <Search className="w-3.5 h-3.5 text-[#CDA66B]" />
                <span className="hidden sm:inline">Search OUT-001...</span>
              </button>

              {/* Compact Admin Link */}
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center text-xs font-semibold text-[#66615B] hover:text-[#171717] px-2.5 py-2 rounded-lg hover:bg-[#EFE6D8]/60 transition"
              >
                Admin
              </Link>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#171717] hover:bg-[#EFE6D8] rounded-lg transition cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5DDD0] bg-[#FFFFFF] px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top duration-200 shadow-lg">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-3 py-2 text-sm text-[#171717] hover:bg-[#F7F3EB] rounded-lg font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/categories"
                className="px-3 py-2 text-sm text-[#171717] hover:bg-[#F7F3EB] rounded-lg font-medium"
              >
                Categories
              </Link>
              <Link
                to="/admin"
                className="px-3 py-2 text-sm font-semibold text-[#A77B3D] hover:bg-[#F7F3EB] rounded-lg"
              >
                Admin Portal
              </Link>
            </nav>

            <div className="pt-2 border-t border-[#E5DDD0]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#66615B] bg-[#F7F3EB] rounded-lg border border-[#E5DDD0] cursor-pointer"
              >
                <span>Search by Look ID (OUT-001)...</span>
                <Search className="w-3.5 h-3.5 text-[#CDA66B]" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-[#FFFFFF] border border-[#E5DDD0] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E5DDD0]">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#A77B3D]">
                Find Outfits & Pieces
              </span>
              <button
                onClick={() => setSearchOpen(false)}
                className="text-[#66615B] hover:text-[#171717] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search outfit number (e.g. OUT-001), style, or occasion..."
                className="w-full bg-[#F7F3EB] border border-[#E5DDD0] focus:border-[#CDA66B] focus:ring-1 focus:ring-[#CDA66B] rounded-xl pl-11 pr-24 py-3.5 text-sm text-[#171717] placeholder-[#66615B] outline-none transition"
              />
              <Search className="w-5 h-5 text-[#66615B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#CDA66B] hover:bg-[#A77B3D] text-[#FFFFFF] font-semibold text-xs px-3.5 py-2 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                Search
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex items-center gap-2 text-xs text-[#66615B]">
              <span>Quick Look IDs:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  navigate('/outfit/out-001');
                }}
                className="text-[#171717] hover:text-[#A77B3D] underline font-mono"
              >
                OUT-001
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  navigate('/outfit/out-002');
                }}
                className="text-[#171717] hover:text-[#A77B3D] underline font-mono"
              >
                OUT-002
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  navigate('/discover?cat=Ethnic');
                }}
                className="text-[#171717] hover:text-[#A77B3D] underline"
              >
                Ethnic Fusion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
