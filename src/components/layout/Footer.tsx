import React from 'react';
import { Link } from '../../router/Router';
import { OutFytLogo } from '../brand/OutFytLogo';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E5DDD0] bg-[#EFE6D8]/60 text-[#66615B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">
          {/* Brand Column with full circular emblem */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center gap-3.5">
              <OutFytLogo variant="badge" size={56} />
              <div>
                <span className="font-editorial text-2xl font-bold tracking-tight text-[#171717] block">
                  OutFyt<span className="text-[#CDA66B]">.</span>co.in
                </span>
                <span className="text-[10px] tracking-[0.25em] font-semibold uppercase text-[#A77B3D] block mt-0.5">
                  FASHION FINDS
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#66615B] max-w-sm">
              Discover verified outfit looks inspired by social platforms including Instagram, YouTube, and Pinterest. Every outfit features an identifier and curated links to individual pieces from top retailers.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#66615B] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#CDA66B]" />
              <span>Independent Fashion Curation &bull; Direct Retailer Links</span>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#171717]">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/discover" className="hover:text-[#171717] transition-colors">
                  All Outfits
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-[#171717] transition-colors">
                  Search by Look ID
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#171717] transition-colors">
                  About OutFyt.co.in
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#171717] transition-colors">
                  Contact & Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Legal Column */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#171717]">
              Trust & Transparency
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/affiliate-disclosure" className="hover:text-[#171717] transition-colors">
                  Affiliate Disclosure
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#171717] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#171717] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>

            <div className="pt-2">
              <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5DDD0] text-xs text-[#66615B] leading-relaxed shadow-xs">
                <span className="font-semibold text-[#171717] block mb-1">
                  Affiliate Notice:
                </span>
                OutFyt.co.in does not sell products directly. When you purchase through links on our site, we may earn an affiliate commission from external retailers at no extra cost to you.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#E5DDD0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#66615B]">
          <p>
            &copy; {new Date().getFullYear()} OutFyt.co.in &bull; FASHION FINDS. All rights reserved.
          </p>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-end">
            <Link to="/affiliate-disclosure" className="hover:text-[#171717] transition-colors">Disclosure</Link>
            <span>&bull;</span>
            <Link to="/privacy" className="hover:text-[#171717] transition-colors">Privacy</Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:text-[#171717] transition-colors">Terms</Link>
            <span>&bull;</span>
            <Link to="/admin" className="hover:text-[#171717] transition-colors">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
