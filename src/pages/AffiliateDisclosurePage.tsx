import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from '../router/Router';

export const AffiliateDisclosurePage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#A77B3D] font-semibold">
          Transparency & FTC / ASCI Compliance
        </span>
        <h1 className="font-editorial text-4xl font-bold text-[#171717] tracking-tight">
          Affiliate Disclosure
        </h1>
        <p className="text-xs text-[#66615B] font-mono">
          Last Updated: October 2026
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] space-y-5 text-sm text-[#171717] leading-relaxed shadow-xs">
        <div className="flex items-center gap-2 text-[#A77B3D] font-semibold text-base">
          <ShieldCheck className="w-5 h-5 text-[#CDA66B]" />
          <span>How OutFyt.co.in Operates</span>
        </div>
        <p className="text-[#66615B]">
          OutFyt.co.in is an independent editorial fashion discovery website. Our mission is to curate complete outfits featured across social platforms like Instagram, YouTube, and Pinterest, and connect visitors with the individual clothing pieces and accessories that comprise those looks.
        </p>
        <p className="text-[#66615B]">
          <strong className="text-[#171717]">We do not sell products directly.</strong> OutFyt.co.in is not a retailer, merchant, or marketplace. When you click on buttons marked "Shop on Retailer", you are redirected to third-party merchant platforms (such as Amazon India, Flipkart, Myntra, Meesho, Shoppers Stop, Zara, or Nicobar) where transactions, shipping, and customer support are handled entirely by those entities.
        </p>

        <h3 className="font-editorial text-xl font-bold text-[#171717] pt-2">
          Affiliate Commissions
        </h3>
        <p className="text-[#66615B]">
          In accordance with the Advertising Standards Council of India (ASCI) guidelines and international affiliate transparency best practices:
        </p>
        <p className="text-[#66615B]">
          Some of the links on OutFyt.co.in are affiliate links. This means that if you click on the link and complete a qualifying purchase on the retailer’s website, OutFyt.co.in may earn a small referral commission.
        </p>
        <p className="text-[#66615B]">
          <strong className="text-[#171717]">This incurs zero additional cost to you.</strong> The price you pay on the retailer website remains identical whether you use our link or navigate directly to the store.
        </p>

        <h3 className="font-editorial text-xl font-bold text-[#171717] pt-2">
          Editorial Independence
        </h3>
        <p className="text-[#66615B]">
          Our styling curation is driven exclusively by aesthetic quality, trend relevance, and wearer value. Commission rates never dictate our styling curation or selection.
        </p>
      </div>

      <div className="text-xs text-[#66615B]">
        Questions regarding affiliate links? Contact our team via the{' '}
        <Link to="/contact" className="text-[#A77B3D] hover:underline font-semibold">
          Contact Page
        </Link>
        .
      </div>
    </div>
  );
};

export default AffiliateDisclosurePage;
