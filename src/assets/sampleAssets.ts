import linenImg from './images/outfit_mumbai_linen_1791766063000.jpg';
import festiveImg from './images/outfit_festive_fusion_1791766074273.jpg';
import minimalImg from './images/outfit_minimal_monochrome_1791766090458.jpg';
import eveningImg from './images/outfit_evening_chic_1791766100381.jpg';
import { MediaType } from '../types/schema';

export interface SampleOutfitPreset {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  heroImageUrl: string;
  heroMediaType: MediaType;
  heroMediaUrl: string;
  heroThumbnailUrl?: string;
  heroMediaAlt?: string;
  status: 'published' | 'draft' | 'archived';
  products: {
    id: string;
    name: string;
    retailer: string;
    price?: number;
    currency: string;
    affiliateUrl: string;
    imageUrl?: string;
    sortOrder: number;
  }[];
}

export const SAMPLE_EDITORIAL_PRESETS: SampleOutfitPreset[] = [
  {
    id: 'OUT-001',
    slug: 'mumbai-resort-linen-streetwear',
    title: 'The Linen Minimalist: Heritage & Contemporary Ease',
    description:
      'A relaxed yet impeccably tailored day look marrying breathable natural flax with architectural lines. Inspired by summer gallery afternoons and coastal Mumbai café culture.',
    category: 'Streetwear',
    tags: ['Linen', 'Summer', 'Neutral', 'Streetwear', 'Casual'],
    heroImageUrl: linenImg,
    heroMediaType: 'image',
    heroMediaUrl: linenImg,
    heroThumbnailUrl: linenImg,
    heroMediaAlt: 'Model wearing relaxed oversized beige linen shirt and tailored off-white trousers',
    status: 'published',
    products: [
      {
        id: 'PROD-001-A',
        name: 'Relaxed Oversized Flax Linen Camp Shirt',
        retailer: 'Nicobar',
        price: 3450,
        currency: 'INR',
        affiliateUrl: 'https://www.nicobar.com',
        sortOrder: 1,
      },
      {
        id: 'PROD-001-B',
        name: 'Single-Pleat Wide Leg Ecru Chinos',
        retailer: 'Zara India',
        price: 3990,
        currency: 'INR',
        affiliateUrl: 'https://www.zara.com/in',
        sortOrder: 2,
      },
      {
        id: 'PROD-001-C',
        name: 'Handcrafted Vegetable-Tanned Leather Slides',
        retailer: 'Hidesign',
        price: 2899,
        currency: 'INR',
        affiliateUrl: 'https://www.hidesign.com',
        sortOrder: 3,
      },
    ],
  },
  {
    id: 'OUT-002',
    slug: 'contemporary-festive-embroidered-fusion',
    title: 'Modern Festive: Slate Jacquard Bundi & Raw Silk Kurta',
    description:
      'Subtle metallic embroidery meets crisp monochrome tailoring. A sophisticated take on contemporary Indian festive and evening celebration aesthetics.',
    category: 'Ethnic',
    tags: ['Ethnic', 'Festive', 'Fusion', 'Nehru Jacket', 'Evening'],
    heroImageUrl: festiveImg,
    heroMediaType: 'image',
    heroMediaUrl: festiveImg,
    heroThumbnailUrl: festiveImg,
    heroMediaAlt: 'Model wearing charcoal threadwork embroidered bundi jacket over ivory silk kurta',
    status: 'published',
    products: [
      {
        id: 'PROD-002-A',
        name: 'Charcoal Threadwork Structured Bundi Jacket',
        retailer: 'Fabindia Artisanal',
        price: 5990,
        currency: 'INR',
        affiliateUrl: 'https://www.fabindia.com',
        sortOrder: 1,
      },
      {
        id: 'PROD-002-B',
        name: 'Pristine Textured Chanderi Silk Kurta',
        retailer: 'Manyavar',
        price: 2999,
        currency: 'INR',
        affiliateUrl: 'https://www.manyavar.com',
        sortOrder: 2,
      },
      {
        id: 'PROD-002-C',
        name: 'Embroidered Velvet Zardozi Juttis',
        retailer: 'Needledust',
        price: 4200,
        currency: 'INR',
        affiliateUrl: 'https://www.needledust.com',
        sortOrder: 3,
      },
    ],
  },
  {
    id: 'OUT-003',
    slug: 'architectural-monochrome-gallery-casual',
    title: 'Architectural Charcoal Overshirt & Pleated Trousers',
    description:
      'Structured utilitarian overshirt paired with fluid drape trousers. Designed for gallery hopping, creative studios, and effortless metropolitan transition.',
    category: 'Minimal',
    tags: ['Minimal', 'Monochrome', 'Quiet Luxury', 'Casual', 'Autumn'],
    heroImageUrl: minimalImg,
    heroMediaType: 'image',
    heroMediaUrl: minimalImg,
    heroThumbnailUrl: minimalImg,
    heroMediaAlt: 'Model in structured black overshirt and wide leg pleated trousers',
    status: 'published',
    products: [
      {
        id: 'PROD-003-A',
        name: 'Structured Boxy Wool-Blend Overshirt',
        retailer: 'COS Global',
        price: 7800,
        currency: 'INR',
        affiliateUrl: 'https://www.cos.com',
        sortOrder: 1,
      },
      {
        id: 'PROD-003-B',
        name: 'Heavyweight Supima Cotton Ribbed T-Shirt',
        retailer: 'Uniqlo India',
        price: 1490,
        currency: 'INR',
        affiliateUrl: 'https://www.uniqlo.com/in',
        sortOrder: 2,
      },
      {
        id: 'PROD-003-C',
        name: 'Double-Pleated Wide Relaxed Charcoal Trousers',
        retailer: 'H&M Studio',
        price: 2999,
        currency: 'INR',
        affiliateUrl: 'https://www2.hm.com/en_in',
        sortOrder: 3,
      },
    ],
  },
  {
    id: 'OUT-004',
    slug: 'nocturne-silk-tailored-blazer-chic',
    title: 'Midnight Atelier: Structured Silk Blazer Cocktail Look',
    description:
      'Sharp double-breasted tuxedo silhouette highlighted with refined champagne metallic edge piping. Ideal for dinner galas and evening lounge occasions.',
    category: 'Partywear',
    tags: ['Partywear', 'Cocktail', 'Evening', 'Blazer', 'Glamour'],
    heroImageUrl: eveningImg,
    heroMediaType: 'image',
    heroMediaUrl: eveningImg,
    heroThumbnailUrl: eveningImg,
    heroMediaAlt: 'Model wearing tailored peak-lapel satin trim blazer dress in city evening setting',
    status: 'published',
    products: [
      {
        id: 'PROD-004-A',
        name: 'Tailored Peak-Lapel Satin Trim Blazer Dress',
        retailer: 'Mango India',
        price: 8990,
        currency: 'INR',
        affiliateUrl: 'https://shop.mango.com/in',
        sortOrder: 1,
      },
      {
        id: 'PROD-004-B',
        name: 'Gold Embellished Minaudière Evening Clutch',
        retailer: 'Aldo Shoes',
        price: 5499,
        currency: 'INR',
        affiliateUrl: 'https://www.aldoshoes.in',
        sortOrder: 2,
      },
      {
        id: 'PROD-004-C',
        name: 'Pointed Black Suede Stiletto Pumps',
        retailer: 'Charles & Keith',
        price: 6999,
        currency: 'INR',
        affiliateUrl: 'https://www.charleskeith.in',
        sortOrder: 3,
      },
    ],
  },
  {
    id: 'OUT-005',
    slug: 'editorial-cinematic-runway-reel',
    title: 'Kinetic Motion: Fluid Silk Trench & Contemporary Tailoring',
    description:
      'Captured in live cinematic motion. A featherweight sandwashed silk trench over crisp neutral separates, showcasing flow and movement for Indian autumn evenings.',
    category: 'Casual',
    tags: ['Video Look', 'Silk Trench', 'Casual', 'Kinetic', 'Reels'],
    heroImageUrl: linenImg, // Thumbnail / Poster fallback
    heroMediaType: 'video',
    heroMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    heroThumbnailUrl: linenImg,
    heroMediaAlt: 'Editorial video presentation of sandwashed silk trench in motion',
    status: 'published',
    products: [
      {
        id: 'PROD-005-A',
        name: 'Sandwashed Fluid Modal Trench Coat',
        retailer: 'Massimo Dutti',
        price: 15990,
        currency: 'INR',
        affiliateUrl: 'https://www.massimodutti.com/in',
        sortOrder: 1,
      },
      {
        id: 'PROD-005-B',
        name: 'Tailored Cotton Poplin Button-Down Shirt',
        retailer: 'Myntra',
        price: 2499,
        currency: 'INR',
        affiliateUrl: 'https://www.myntra.com',
        sortOrder: 2,
      },
      {
        id: 'PROD-005-C',
        name: 'Ecru Straight-Leg High-Rise Denim',
        retailer: 'Ajio Luxe',
        price: 4999,
        currency: 'INR',
        affiliateUrl: 'https://luxe.ajio.com',
        sortOrder: 3,
      },
    ],
  },
];
