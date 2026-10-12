import React from 'react';
import { Link } from '../../router/Router';
import { OutFytLogo } from '../brand/OutFytLogo';
import { ShieldCheck, Mail, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E5DDD0] bg-[#EFE6D8]/60 text-[#66615B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* 4-Column Professional Grid: 12-column grid on desktop, 2-col on tablet/landscape, 1-col on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12">
          {/* Column 1: BRAND (lg:col-span-4) */}
          <div className="space-y-4 lg:col-span-4">
            <div className="flex items-center gap-3">
              <OutFytLogo variant="badge" size={48} />
              <div>
                <span className="font-editorial text-2xl font-bold tracking-tight text-[#171717] block leading-none">
                  OutFyt<span className="text-[#CDA66B]">.</span>co.in
                </span>
                <span className="text-[10px] tracking-[0.25em] font-semibold uppercase text-[#A77B3D] block mt-1">
                  FASHION FINDS &bull; LOOK DISCOVERY
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-[#66615B] max-w-sm">
              Discover verified fashion looks inspired by social platforms including Instagram, YouTube, and Pinterest. Every outfit features an identifier and curated links to individual pieces from trusted retailers.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#66615B] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#CDA66B] shrink-0" />
              <span className="text-[11px] leading-tight">Independent Fashion Discovery &bull; Verified Affiliate Links</span>
            </div>
          </div>

          {/* Column 2: EXPLORE (lg:col-span-2) */}
          <div className="space-y-3 lg:col-span-2 sm:pl-2">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#171717]">
              Explore
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/discover" className="hover:text-[#171717] transition-colors block py-0.5">
                  Discover Looks
                </Link>
              </li>
              <li>
                <Link to="/discover" className="hover:text-[#171717] transition-colors block py-0.5">
                  All Outfits
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-[#171717] transition-colors block py-0.5">
                  Search by Outfit ID
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-[#171717] transition-colors block py-0.5">
                  Browse Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: INFORMATION (lg:col-span-3) */}
          <div className="space-y-3 lg:col-span-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#171717]">
              Information
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/about" className="hover:text-[#171717] transition-colors block py-0.5">
                  About OutFyt.co.in
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#171717] transition-colors block py-0.5">
                  Contact & Feedback
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#171717] transition-colors block py-0.5">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#171717] transition-colors block py-0.5">
                  Terms & Conditions
                </Link>
              </li>
            </ul>

            <div className="pt-1.5">
              <a
                href="mailto:supportoutfyt.co.in@gmail.com"
                className="inline-flex items-center gap-1.5 text-xs text-[#A77B3D] hover:underline font-semibold"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>supportoutfyt.co.in@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Column 4: TRUST & TRANSPARENCY (lg:col-span-3) */}
          <div className="space-y-3 lg:col-span-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#171717]">
              Trust & Transparency
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/affiliate-disclosure" className="hover:text-[#171717] transition-colors flex items-center gap-1 py-0.5">
                  <span>Affiliate Disclosure</span>
                  <ArrowUpRight className="w-3 h-3 text-[#CDA66B]" />
                </Link>
              </li>
            </ul>

            <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5DDD0] text-xs text-[#66615B] leading-relaxed shadow-xs">
              <span className="font-semibold text-[#171717] block mb-1">
                Affiliate Notice:
              </span>
              OutFyt.co.in is an independent curation platform. When you purchase through retailer links on our site, we may earn an affiliate commission at no extra cost to you.
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="mt-10 sm:mt-12 pt-6 border-t border-[#E5DDD0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#66615B]">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} OutFyt.co.in &bull; FASHION FINDS. All rights reserved.
          </p>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-end">
            <Link to="/affiliate-disclosure" className="hover:text-[#171717] transition-colors">Disclosure</Link>
            <span>&bull;</span>
            <Link to="/privacy" className="hover:text-[#171717] transition-colors">Privacy</Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:text-[#171717] transition-colors">Terms</Link>
            <span>&bull;</span>
            <Link to="/contact" className="hover:text-[#171717] transition-colors">Support</Link>
            <span>&bull;</span>
            <Link to="/admin" className="hover:text-[#171717] transition-colors">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
