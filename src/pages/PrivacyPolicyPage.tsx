import React from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#A77B3D] font-semibold">
          Data Protection & Privacy
        </span>
        <h1 className="font-editorial text-4xl font-bold text-[#171717] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#66615B] font-mono">
          Effective Date: October 2026
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] space-y-5 text-sm text-[#171717] leading-relaxed shadow-xs">
        <h3 className="font-editorial text-xl font-bold text-[#171717]">
          1. Information We Collect
        </h3>
        <p className="text-[#66615B]">
          At OutFyt.co.in, we respect your privacy and adhere to data minimization principles. We do not require visitors to register an account or provide personal information to browse outfits, view categories, or access affiliate links.
        </p>
        <p className="text-[#66615B]">
          <strong>Affiliate Click Telemetry:</strong> When an outbound link is clicked, we record only minimal telemetry (the Outfit ID, Product ID, and retailer name with a server timestamp) to analyze which styles are popular. No personal identifiers, IP scraping, or browsing histories are harvested.
        </p>

        <h3 className="font-editorial text-xl font-bold text-[#171717] pt-2">
          2. Cookies and External Retailers
        </h3>
        <p className="text-[#66615B]">
          When you click a retailer link on OutFyt.co.in, the destination merchant (e.g. Amazon India, Flipkart, Myntra, Meesho) may set tracking cookies on their own domain to attribute the referral and track purchases. These cookies are governed by the respective retailer's privacy policy.
        </p>

        <h3 className="font-editorial text-xl font-bold text-[#171717] pt-2">
          3. Security
        </h3>
        <p className="text-[#66615B]">
          Our application communicates securely over HTTPS using Cloud Firestore and Firebase Authentication with strict Security Rules. We do not store sensitive payment details or credit cards.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
