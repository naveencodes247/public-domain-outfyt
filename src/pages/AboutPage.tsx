import React from 'react';
import { OutFytLogo } from '../components/brand/OutFytLogo';
import { Compass, ShieldCheck, Heart } from 'lucide-react';
import { Link } from '../router/Router';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
      {/* Brand Hero */}
      <div className="text-center space-y-5">
        <div className="flex justify-center">
          <OutFytLogo variant="full" size={100} />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#A77B3D] block">
          Fashion Finds &bull; OutFyt.co.in
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#171717] tracking-tight leading-tight">
          Curating the Best of Social Fashion
        </h1>
        <p className="text-base sm:text-lg text-[#66615B] max-w-2xl mx-auto leading-relaxed">
          OutFyt.co.in is a premier fashion discovery destination built to bridge the gap between social media inspiration and effortless styling.
        </p>
      </div>

      {/* Story & Philosophy */}
      <div className="space-y-8 text-[#171717] leading-relaxed text-sm sm:text-base">
        <div className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] space-y-4 shadow-xs">
          <h2 className="font-editorial text-2xl font-bold text-[#171717] tracking-tight">
            The Inspiration Behind OutFyt
          </h2>
          <p className="text-[#66615B]">
            Every day, fashion enthusiasts across India encounter incredible styling inspiration on Instagram Reels, YouTube Shorts, and Pinterest boards. Yet, finding the exact pieces or wearable alternatives often leads to frustration: broken links, unanswered comment threads, and endless manual image searches.
          </p>
          <p className="text-[#66615B]">
            OutFyt solves this by giving every look a permanent, structured home. Each outfit receives a unique business identifier — such as <strong className="font-mono text-[#A77B3D]">OUT-001</strong> — allowing stylists and curators to reference one simple code that directs their audience to verified, individual garment details.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] space-y-3 shadow-xs">
            <div className="p-2.5 rounded-xl bg-[#F7F3EB] w-fit text-[#CDA66B]">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#171717]">Independent Curation</h3>
            <p className="text-xs text-[#66615B] leading-relaxed">
              We scout genuine style trends across ethnic fusion, streetwear, minimalist tailoring, and eveningwear tailored for the Indian climate and lifestyle.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] space-y-3 shadow-xs">
            <div className="p-2.5 rounded-xl bg-[#F7F3EB] w-fit text-[#CDA66B]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#171717]">Direct Retailer Trust</h3>
            <p className="text-xs text-[#66615B] leading-relaxed">
              We do not sell products or hold inventory. All purchases occur directly on reputable brand platforms including Amazon India, Flipkart, Myntra, Meesho, Zara, and Nicobar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] space-y-3 shadow-xs">
            <div className="p-2.5 rounded-xl bg-[#F7F3EB] w-fit text-[#CDA66B]">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#171717]">Transparent Ethics</h3>
            <p className="text-xs text-[#66615B] leading-relaxed">
              Our business is funded strictly through affiliate relationships. When you choose to purchase an item through our curated links, we may earn a modest commission.
            </p>
          </div>
        </div>

        {/* Action Link */}
        <div className="text-center pt-4">
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 bg-[#CDA66B] hover:bg-[#A77B3D] text-[#FFFFFF] font-semibold text-xs px-6 py-3 rounded-xl transition shadow-xs cursor-pointer"
          >
            Explore Curated Outfits
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
