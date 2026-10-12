import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { handleFirestoreError, OperationType } from '../errors';
import { sanitizeFirestoreData } from '../utils/cleanData';
import { Category, CategoryGroup } from '../../types/schema';

const COLLECTION_NAME = 'categories';

/**
 * Editorial Starter Categories (Curated Baseline)
 * Grouped into Everyday, Occasions, Seasonal, and Style.
 */
export const STARTER_CATEGORIES: Category[] = [
  // EVERYDAY
  {
    id: 'casual',
    name: 'Casual',
    group: 'Everyday',
    tagline: 'Effortless Weekend & Daily Transition',
    description: 'Breathable linen shirts, lightweight chore jackets, relaxed chinos, and understated daywear.',
    accent: 'Everyday Ease',
  },
  {
    id: 'daily-wear',
    name: 'Daily Wear',
    group: 'Everyday',
    tagline: 'Comfort-First Daily Wardrobe',
    description: 'Soft cotton tees, relaxed pants, and effortless daily essentials.',
    accent: 'Everyday',
  },
  {
    id: 'streetwear',
    name: 'Streetwear',
    group: 'Everyday',
    tagline: 'Urban Silhouettes & Contemporary Edge',
    description: 'Oversized tees, utility cargos, boxy overshirts, and statement sneakers inspired by Indian metropolitan aesthetics.',
    accent: 'Casual & Youth',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    group: 'Everyday',
    tagline: 'Quiet Luxury & Tailored Restraint',
    description: 'Subtle palettes, single-pleat trousers, premium natural cottons, and architectural cuts without loud logos.',
    accent: 'Timeless & Refined',
  },
  {
    id: 'smart-casual',
    name: 'Smart Casual',
    group: 'Everyday',
    tagline: 'Elevated Dressing for Any Setting',
    description: 'Knit polos, tailored trousers, casual loafers, and structured layering.',
    accent: 'Polished Ease',
  },

  // OCCASIONS
  {
    id: 'party-wear',
    name: 'Party Wear',
    group: 'Occasions',
    tagline: 'Nocturne Glamour & Cocktail Chic',
    description: 'Satin lapel blazers, tailored cocktail sets, metallic accents, and high-contrast eveningwear.',
    accent: 'Nightlife & Events',
  },
  {
    id: 'wedding-guest',
    name: 'Wedding Guest',
    group: 'Occasions',
    tagline: 'Celebratory Splendour & Modern Elegance',
    description: 'Intricately embroidered bundis, silk blend kurtas, pastel lehengas, and refined ceremonial wear.',
    accent: 'Wedding Season',
  },
  {
    id: 'festive-wear',
    name: 'Festive Wear',
    group: 'Occasions',
    tagline: 'Rich Colours & Joyous Celebrations',
    description: 'Vibrant ethnic silhouettes, mirror work details, and traditional textiles.',
    accent: 'Festivals',
  },
  {
    id: 'festival',
    name: 'Festival',
    group: 'Occasions',
    tagline: 'Cultural Festivals & Community Gatherings',
    description: 'Lively, expressive fits for Diwali, Navratri, Eid, and year-round festivities.',
    accent: 'Celebrations',
  },
  {
    id: 'traditional',
    name: 'Traditional',
    group: 'Occasions',
    tagline: 'Authentic Heritage Craftsmanship',
    description: 'Handloom fabrics, bandhgalas, sarees, and classic Indian tailoring.',
    accent: 'Heritage',
  },
  {
    id: 'ethnic',
    name: 'Ethnic',
    group: 'Occasions',
    tagline: 'Modern Indo-Western & Festive Heritage',
    description: 'Sophisticated bundi jackets, textured chanderi kurtas, draped dhotis, and embroidered footwear for celebratory occasions.',
    accent: 'Festive & Heritage',
  },
  {
    id: 'formal-events',
    name: 'Formal Events',
    group: 'Occasions',
    tagline: 'Black-Tie, Galas & Award Ceremonies',
    description: 'Classic tuxedos, structured gowns, formal two-piece suits, and black-tie attire.',
    accent: 'Black-Tie',
  },
  {
    id: 'date-night',
    name: 'Date Night',
    group: 'Occasions',
    tagline: 'Intimate Dining & Romantic Evenings',
    description: 'Moody tones, relaxed tailoring, subtle luxury textures, and alluring silhouettes.',
    accent: 'Evening Ease',
  },
  {
    id: 'college',
    name: 'College',
    group: 'Occasions',
    tagline: 'Campus Casuals & Relaxed Fits',
    description: 'Graphic sweatshirts, straight-fit denim, comfortable sneakers, and versatile backpacks.',
    accent: 'Campus & Youth',
  },
  {
    id: 'office-wear',
    name: 'Office Wear',
    group: 'Occasions',
    tagline: 'Contemporary Professional & Smart Casual',
    description: 'Deconstructed blazers, sharp polo knits, tapered wool trousers, and elevated business wear.',
    accent: 'Executive & Creative',
  },
  {
    id: 'vacation',
    name: 'Vacation',
    group: 'Occasions',
    tagline: 'Resort Wear & Easy Escapes',
    description: 'Lightweight linen co-ords, camp shirts, breezy dresses, and relaxed travel styling.',
    accent: 'Getaways',
  },
  {
    id: 'travel',
    name: 'Travel',
    group: 'Occasions',
    tagline: 'Airport Fashion & Long Journeys',
    description: 'Layered comfort, structured track pants, soft fleece, and functional crossbodies.',
    accent: 'Transit',
  },
  {
    id: 'beachwear',
    name: 'Beachwear',
    group: 'Occasions',
    tagline: 'Sun-Drenched Coastal Aesthetics',
    description: 'Linen shorts, open-collar resort tops, slide sandals, and uv-protective accessories.',
    accent: 'Coastal',
  },
  {
    id: 'gym-activewear',
    name: 'Gym and Activewear',
    group: 'Occasions',
    tagline: 'High-Performance Movement & Form',
    description: 'Moisture-wicking sets, training tights, athletic trainers, and gym staples.',
    accent: 'Fitness',
  },

  // SEASONAL
  {
    id: 'summer',
    name: 'Summer',
    group: 'Seasonal',
    tagline: 'Flax Linens & Breathable Sunwear',
    description: 'Coastal styling, camp-collar shirts, relaxed bermudas, and open-weave essentials.',
    accent: 'Warm Weather',
  },
  {
    id: 'winter',
    name: 'Winter',
    group: 'Seasonal',
    tagline: 'Textured Layering & Soft Knitwear',
    description: 'Structured wool-blend coats, cashmere sweaters, and heavyweight layering pieces.',
    accent: 'Cool Weather',
  },
  {
    id: 'monsoon',
    name: 'Monsoon',
    group: 'Seasonal',
    tagline: 'Rain-Ready Lightweight Ensembles',
    description: 'Water-resistant fabrics, dark neutrals, cropped hems, and quick-dry materials.',
    accent: 'Rainy Season',
  },
  {
    id: 'spring',
    name: 'Spring',
    group: 'Seasonal',
    tagline: 'Pastel Tones & Gentle Breezes',
    description: 'Soft florals, lightweight cardigans, and pastel daywear.',
    accent: 'Fresh Air',
  },

  // STYLE
  {
    id: 'old-money',
    name: 'Old Money',
    group: 'Style',
    tagline: 'Aristocratic Restraint & Vintage Tailoring',
    description: 'Cream cable knits, linen trousers, signet rings, loafers, and equestrian-inspired pieces.',
    accent: 'Heritage Luxury',
  },
  {
    id: 'quiet-luxury',
    name: 'Quiet Luxury',
    group: 'Style',
    tagline: 'Logo-Free Craft & Exceptional Materials',
    description: 'Cashmere, silk-linen blends, pristine tailoring, and subtle understated perfection.',
    accent: 'Understated Chic',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    group: 'Style',
    tagline: 'Archival Silhouettes & Retro Charm',
    description: 'Classic leather jackets, bell-bottoms, washed denim, and heritage timepieces.',
    accent: 'Nostalgic',
  },
  {
    id: 'y2k',
    name: 'Y2K',
    group: 'Style',
    tagline: 'Millennium Cyber Aesthetics & Bold Color',
    description: 'Metallic accents, baby tees, tinted sunglasses, and low-rise streetwear.',
    accent: 'Retro Future',
  },
  {
    id: 'korean-inspired',
    name: 'Korean-Inspired',
    group: 'Style',
    tagline: 'K-Fashion Clean Cuts & Oversized Fits',
    description: 'Boxy double-breasted blazers, wide-leg trousers, chunky sneakers, and minimalist layering.',
    accent: 'K-Trend',
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    group: 'Style',
    tagline: 'Free-Spirited Textures & Earthy Tones',
    description: 'Flowy silhouettes, artisan embroidery, fringed accessories, and natural fibers.',
    accent: 'Boho Spirit',
  },
  {
    id: 'athleisure',
    name: 'Athleisure',
    group: 'Style',
    tagline: 'Sport Meets Streetwear',
    description: 'Technical joggers, minimal hoodies, retro runners, and elevated sports styling.',
    accent: 'Active Urban',
  },
  {
    id: 'indo-western',
    name: 'Indo-Western',
    group: 'Style',
    tagline: 'East-Meets-West Sartorial Fusion',
    description: 'Kurtas paired with tailored trousers, asymmetric bundi coats, and contemporary festive wear.',
    accent: 'Modern Fusion',
  },
];

/**
 * Normalizes category names to avoid duplicates that differ only by case or whitespace.
 */
export function normalizeCategoryName(name: string): string {
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Helper to generate a clean URL-safe slug from a category name.
 */
export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

// In-memory cache for fast snappy UI rendering across routes
let categoryCache: Category[] | null = null;

/**
 * Fetches all categories: merges default starter categories with dynamic Firestore records.
 * Avoids duplicates case-insensitively and returns sorted by group.
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const dynamicCategories: Category[] = [];

    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.archived) {
          dynamicCategories.push({
            id: docSnap.id,
            name: data.name,
            group: data.group || 'Custom',
            description: data.description,
            tagline: data.tagline,
            accent: data.accent || data.group,
            imageUrl: data.imageUrl,
            isCustom: data.isCustom ?? true,
            archived: false,
          });
        }
      });
    } catch (firestoreErr) {
      // If collection doesn't exist yet or offline, safely proceed with starter categories
      console.warn('Firestore categories collection query handled gracefully:', firestoreErr);
    }

    // Combine starter categories and dynamic categories without duplicates
    const seenNames = new Set<string>();
    const combined: Category[] = [];

    // First add dynamic categories (custom admin additions take precedence)
    for (const cat of dynamicCategories) {
      const norm = normalizeCategoryName(cat.name);
      if (!seenNames.has(norm)) {
        seenNames.add(norm);
        combined.push(cat);
      }
    }

    // Then add starter categories if not already present
    for (const cat of STARTER_CATEGORIES) {
      const norm = normalizeCategoryName(cat.name);
      if (!seenNames.has(norm)) {
        seenNames.add(norm);
        combined.push(cat);
      }
    }

    categoryCache = combined;
    return combined;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    return STARTER_CATEGORIES;
  }
}

/**
 * Returns cached categories synchronously if available, otherwise starter categories.
 */
export function getCachedCategories(): Category[] {
  return categoryCache || STARTER_CATEGORIES;
}

/**
 * Returns a curated subset (8 items) for the Homepage display so it doesn't overwhelm visitors.
 */
export function getCuratedHomepageCategories(categories: Category[] = getCachedCategories()): string[] {
  const preferred = [
    'Casual',
    'Streetwear',
    'Ethnic',
    'Minimal',
    'Party Wear',
    'Office Wear',
    'Old Money',
    'Summer',
  ];

  const availableNames = categories.map((c) => c.name);
  const matched = preferred.filter((p) =>
    availableNames.some((a) => normalizeCategoryName(a) === normalizeCategoryName(p))
  );

  // If any missing, pad up to 8 with other available categories
  for (const cat of categories) {
    if (matched.length >= 8) break;
    if (!matched.some((m) => normalizeCategoryName(m) === normalizeCategoryName(cat.name))) {
      matched.push(cat.name);
    }
  }

  return matched;
}

/**
 * Creates a custom category or occasion (Admin only).
 * Examples: "Diwali 2026", "College Fest", "Eid Collection".
 */
export async function createCustomCategory(category: {
  name: string;
  group?: CategoryGroup;
  description?: string;
  tagline?: string;
  imageUrl?: string | null;
}): Promise<Category> {
  const cleanName = category.name.trim();
  if (cleanName.length < 2) {
    throw new Error('Category name must be at least 2 characters long.');
  }

  const id = generateCategorySlug(cleanName);
  const path = `${COLLECTION_NAME}/${id}`;

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const rawPayload: any = {
      id,
      name: cleanName,
      group: category.group || 'Custom',
      description: category.description?.trim() || null,
      tagline: category.tagline?.trim() || null,
      imageUrl: category.imageUrl?.trim() || null,
      isCustom: true,
      archived: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const payload = sanitizeFirestoreData(rawPayload);
    await setDoc(docRef, payload);

    const newCategory: Category = {
      id,
      name: cleanName,
      group: category.group || 'Custom',
      description: category.description,
      tagline: category.tagline,
      imageUrl: category.imageUrl,
      isCustom: true,
      archived: false,
    };

    // Update in-memory cache
    if (categoryCache) {
      categoryCache = [newCategory, ...categoryCache];
    }

    return newCategory;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

/**
 * Updates an existing category (Admin only).
 */
export async function updateCategory(
  id: string,
  updates: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const rawPayload: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    const payload = sanitizeFirestoreData(rawPayload);
    await updateDoc(docRef, payload);

    if (categoryCache) {
      categoryCache = categoryCache.map((c) => (c.id === id ? { ...c, ...updates } : c));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Archives or removes a custom category (Admin only).
 */
export async function deleteCategory(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);

    if (categoryCache) {
      categoryCache = categoryCache.filter((c) => c.id !== id);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
