import React from 'react';
import {
  Shirt,
  Footprints,
  Watch,
  ShoppingBag,
  Gem,
  Glasses,
  Crown,
  Sparkles,
  Tag,
  Layers,
  LucideProps,
} from 'lucide-react';

/**
 * Returns a minimal, consistent Lucide icon for clothing categories.
 * Maps menswear, womenswear, and accessories cleanly to the OutFyt design system.
 */
export function getCategoryIcon(
  category?: string | null,
  props: LucideProps = { className: 'w-3 h-3' }
): React.ReactElement {
  const norm = (category || '').toLowerCase().trim();

  // Tops, shirts, kurtas, jackets
  if (
    norm.includes('shirt') ||
    norm.includes('top') ||
    norm.includes('kurta') ||
    norm.includes('hoodie') ||
    norm.includes('sweatshirt') ||
    norm.includes('sweater') ||
    norm.includes('cardigan') ||
    norm.includes('jacket') ||
    norm.includes('blazer') ||
    norm.includes('coat') ||
    norm.includes('polo') ||
    norm.includes('blouse')
  ) {
    return <Shirt {...props} />;
  }

  // Bottoms, trousers, pants, jeans, skirts
  if (
    norm.includes('pant') ||
    norm.includes('trouser') ||
    norm.includes('jean') ||
    norm.includes('cargo') ||
    norm.includes('jogger') ||
    norm.includes('short') ||
    norm.includes('skirt') ||
    norm.includes('palazzo') ||
    norm.includes('dhoti') ||
    norm.includes('legging') ||
    norm.includes('bottom')
  ) {
    return <Layers {...props} />;
  }

  // Footwear, sneakers, boots, heels
  if (
    norm.includes('shoe') ||
    norm.includes('sneaker') ||
    norm.includes('boot') ||
    norm.includes('footwear') ||
    norm.includes('sandal') ||
    norm.includes('heel') ||
    norm.includes('flat') ||
    norm.includes('loafer') ||
    norm.includes('slipper')
  ) {
    return <Footprints {...props} />;
  }

  // One-piece & Ethnic: dresses, sarees, gowns, lehenga, suits
  if (
    norm.includes('dress') ||
    norm.includes('gown') ||
    norm.includes('saree') ||
    norm.includes('suit') ||
    norm.includes('lehenga') ||
    norm.includes('anarkali') ||
    norm.includes('sherwani') ||
    norm.includes('romper') ||
    norm.includes('jumpsuit') ||
    norm.includes('co-ord') ||
    norm.includes('ethnic') ||
    norm.includes('traditional')
  ) {
    return <Sparkles {...props} />;
  }

  // Watches
  if (norm.includes('watch')) {
    return <Watch {...props} />;
  }

  // Bags & Wallets
  if (
    norm.includes('bag') ||
    norm.includes('handbag') ||
    norm.includes('backpack') ||
    norm.includes('wallet')
  ) {
    return <ShoppingBag {...props} />;
  }

  // Jewellery
  if (
    norm.includes('jewel') ||
    norm.includes('necklace') ||
    norm.includes('earring') ||
    norm.includes('bracelet') ||
    norm.includes('ring')
  ) {
    return <Gem {...props} />;
  }

  // Sunglasses & Eyewear
  if (norm.includes('sunglass') || norm.includes('glasses') || norm.includes('eyewear')) {
    return <Glasses {...props} />;
  }

  // Hats & Caps
  if (norm.includes('cap') || norm.includes('hat')) {
    return <Crown {...props} />;
  }

  // Fallback for custom/unspecified categories
  return <Tag {...props} />;
}
