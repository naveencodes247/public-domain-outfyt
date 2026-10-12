import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#A77B3D] font-semibold">
          Legal Agreement
        </span>
        <h1 className="font-editorial text-4xl font-bold text-[#171717] tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-xs text-[#66615B] font-mono">
          Effective Date: October 2026
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] space-y-5 text-sm text-[#171717] leading-relaxed shadow-xs">
        <h3 className="font-editorial text-xl font-bold text-[#171717]">
          1. Platform Usage
        </h3>
        <p className="text-[#66615B]">
          By accessing or using OutFyt.co.in ("the Website"), you agree to abide by these Terms and Conditions. OutFyt.co.in is provided solely for personal, non-commercial fashion discovery and outfit inspiration.
        </p>

        <h3 className="font-editorial text-xl font-bold text-[#171717] pt-2">
          2. External Merchant Disclaimer
        </h3>
        <p className="text-[#66615B]">
          OutFyt.co.in does not sell, manufacture, inventory, or ship any physical products. All product descriptions, images, prices, and links are for informational and referral purposes only. Contracts of sale, warranties, returns, and shipping are solely between the purchaser and the third-party merchant.
        </p>

        <h3 className="font-editorial text-xl font-bold text-[#171717] pt-2">
          3. Intellectual Property
        </h3>
        <p className="text-[#66615B]">
          The OutFyt.co.in name, logo, styling curation, and website design are protected by copyright and intellectual property laws. Third-party brand names, retailer trademarks, and logos are property of their respective owners.
        </p>
      </div>
    </div>
  );
};

export default TermsPage;
