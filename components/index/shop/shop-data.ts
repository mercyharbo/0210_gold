export type ProductCategory =
  | 'Jewellery & Accessories'
  | 'Abaya'
  | 'Clothing'
  | 'Bags'
  | 'Shoes'
  | 'Modest Sets'

export type Product = {
  id: string
  name: string
  category: ProductCategory
  price: number
  colors: string[]
  details: string[]
  description: string
  imageAlt: string
  imageSrc: string
  label?: string
  sizes: string[]
}

export const categories: Array<'All' | ProductCategory> = [
  'All',
  'Jewellery & Accessories',
  'Abaya',
  'Clothing',
  'Bags',
  'Shoes',
  'Modest Sets',
]

export const products: Product[] = [
  {
    id: 'gold-styling-set',
    name: 'Gold Styling Set',
    category: 'Jewellery & Accessories',
    colors: ['Gold'],
    description:
      'A polished jewellery and accessories edit made to finish everyday outfits and occasion looks.',
    details: ['Gold-tone finish', 'Gift-ready styling', 'Everyday to occasion wear'],
    price: 185000,
    imageAlt: 'Gold jewellery and accessories styled as a premium flat lay',
    imageSrc: '/images/featured-collections/jewellery-accessories.png',
    label: 'Best seller',
    sizes: ['One size'],
  },
  {
    id: 'flowing-occasion-abaya',
    name: 'Flowing Occasion Abaya',
    category: 'Abaya',
    colors: ['Black', 'Sage', 'Cream'],
    description:
      'An elegant flowing abaya for modest styling, dinner plans, visits, and special occasions.',
    details: ['Relaxed modest fit', 'Soft drape', 'Occasion-ready styling'],
    price: 120000,
    imageAlt: 'Elegant abaya garment styled in a boutique studio',
    imageSrc: '/images/featured-collections/abaya.png',
    label: 'New in',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'tailored-fashion-edit',
    name: 'Tailored Fashion Edit',
    category: 'Clothing',
    colors: ['Ivory', 'Blush', 'Black'],
    description:
      'A refined clothing edit for clean wardrobe styling across work, weekends, and outings.',
    details: ['Curated fashion edit', 'Easy outfit pairing', 'Day-to-evening styling'],
    price: 95000,
    imageAlt: 'Curated fashion clothing arranged in a clean boutique scene',
    imageSrc: '/images/featured-collections/clothing.png',
    label: 'Featured',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'structured-day-bag',
    name: 'Structured Day Bag',
    category: 'Bags',
    colors: ['Brown', 'Black', 'Neutral'],
    description:
      'A structured bag designed to hold its shape and complete casual or polished outfits.',
    details: ['Structured silhouette', 'Everyday carry size', 'Gold-tone hardware feel'],
    price: 78000,
    imageAlt: 'Elegant bags styled on a warm studio plinth',
    imageSrc: '/images/featured-collections/bags.png',
    label: 'Best seller',
    sizes: ['One size'],
  },
  {
    id: 'polished-shoe-pair',
    name: 'Polished Shoe Pair',
    category: 'Shoes',
    colors: ['Black', 'Ivory', 'Slate'],
    description:
      'A polished shoe option for outfit finishing, occasion styling, and refined everyday wear.',
    details: ['Comfort-led styling', 'Occasion-ready shape', 'Pairs with dresses and sets'],
    price: 88000,
    imageAlt: 'Elegant shoes arranged on minimal studio plinths',
    imageSrc: '/images/featured-collections/shoes.png',
    label: 'New in',
    sizes: ['37', '38', '39', '40', '41'],
  },
  {
    id: 'coordinated-modest-set',
    name: 'Coordinated Modest Set',
    category: 'Modest Sets',
    colors: ['Taupe', 'Cream', 'Lavender'],
    description:
      'A coordinated modest set for easy styling across casual days, workwear, and dressier plans.',
    details: ['Matching outfit set', 'Relaxed modest coverage', 'Easy styling base'],
    price: 135000,
    imageAlt: 'Coordinated modest fashion outfit styled in a boutique studio',
    imageSrc: '/images/featured-collections/modest-sets.png',
    label: 'Featured',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'evening-accessory-edit',
    name: 'Evening Accessory Edit',
    category: 'Jewellery & Accessories',
    colors: ['Gold'],
    description:
      'Evening-ready accessories for birthdays, dinners, weddings, and formal looks.',
    details: ['Occasion styling', 'Gold-tone accents', 'Lightweight finishing pieces'],
    price: 65000,
    imageAlt: 'Gold jewellery and accessories styled as a premium flat lay',
    imageSrc: '/images/featured-collections/jewellery-accessories.png',
    label: 'Best seller',
    sizes: ['One size'],
  },
  {
    id: 'weekend-outfit-set',
    name: 'Weekend Outfit Set',
    category: 'Clothing',
    colors: ['Black', 'Ivory', 'Rose'],
    description:
      'A weekend outfit set designed for simple styling, comfortable movement, and polished plans.',
    details: ['Coordinated outfit direction', 'Weekend-ready styling', 'Pairs with flats or heels'],
    price: 110000,
    imageAlt: 'Curated fashion clothing arranged in a clean boutique scene',
    imageSrc: '/images/featured-collections/clothing.png',
    label: 'New in',
    sizes: ['S', 'M', 'L', 'XL'],
  },
]

export function formatNaira(price: number) {
  return `\u20a6${new Intl.NumberFormat('en-NG', {
    maximumFractionDigits: 0,
  }).format(price)}`
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id)
}

export function getRelatedProducts(product: Product) {
  return products
    .filter(
      (nextProduct) =>
        nextProduct.id !== product.id && nextProduct.category === product.category,
    )
    .slice(0, 4)
}
