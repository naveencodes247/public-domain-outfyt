/**
 * Comprehensive Product Categories for Men and Women (Pre-launch Curation)
 * Supports all garment types, accessories, and ethnic silhouettes.
 */
export interface ProductCategoryGroup {
  groupName: string;
  items: string[];
}

export const PRODUCT_CATEGORY_GROUPS: ProductCategoryGroup[] = [
  {
    groupName: 'Tops & Layering',
    items: [
      'Shirt',
      'T-Shirt',
      'Polo Shirt',
      'Tank Top',
      'Blouse',
      'Crop Top',
      'Kurta',
      'Sweatshirt',
      'Hoodie',
      'Sweater',
      'Cardigan',
      'Jacket',
      'Blazer',
      'Coat',
    ],
  },
  {
    groupName: 'Bottoms',
    items: [
      'Pants',
      'Trousers',
      'Jeans',
      'Chinos',
      'Shorts',
      'Cargo Pants',
      'Joggers',
      'Leggings',
      'Skirt',
      'Palazzo',
      'Dhoti',
      'Traditional Bottomwear',
    ],
  },
  {
    groupName: 'One-Piece & Sets',
    items: [
      'Dress',
      'Jumpsuit',
      'Romper',
      'Gown',
      'Saree',
      'Suit Set',
      'Co-ord Set',
    ],
  },
  {
    groupName: 'Ethnic & Traditional',
    items: [
      'Kurta Set',
      'Sherwani',
      'Lehenga',
      'Salwar Suit',
      'Anarkali',
      'Indo-Western',
      'Traditional Wear',
    ],
  },
  {
    groupName: 'Footwear',
    items: [
      'Sneakers',
      'Formal Shoes',
      'Loafers',
      'Sandals',
      'Heels',
      'Flats',
      'Boots',
      'Slippers',
    ],
  },
  {
    groupName: 'Accessories',
    items: [
      'Watch',
      'Sunglasses',
      'Belt',
      'Bag',
      'Handbag',
      'Backpack',
      'Jewellery',
      'Necklace',
      'Bracelet',
      'Earrings',
      'Cap',
      'Hat',
      'Scarf',
      'Tie',
      'Wallet',
    ],
  },
  {
    groupName: 'Sports, Active & Other',
    items: [
      'Sportswear',
      'Activewear',
      'Swimwear',
      'Innerwear',
      'Socks',
      'Other (Custom)',
    ],
  },
];

// Flat list for validation and simple selections
export const ALL_PRODUCT_CATEGORIES: string[] = PRODUCT_CATEGORY_GROUPS.flatMap(
  (group) => group.items
);
