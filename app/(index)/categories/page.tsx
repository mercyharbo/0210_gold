import { ArrowRight, Shirt, ShoppingBag, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const featuredCategories = [
  {
    title: 'Jewellery & Accessories',
    description:
      'Gold pieces, finishing details, and styling accents that complete every look.',
    imageAlt: 'Gold jewellery and accessories styled as a premium flat lay',
    imageSrc: '/images/featured-collections/jewellery-accessories.png',
    meta: 'Gold & accessories',
  },
  {
    title: 'Abaya',
    description:
      'Elegant modest silhouettes for everyday dressing, occasions, and refined styling.',
    imageAlt: 'Elegant abaya garment styled in a boutique studio',
    imageSrc: '/images/featured-collections/abaya.png',
    meta: 'Modest fashion',
  },
  {
    title: 'Clothing',
    description:
      'Wardrobe pieces across dresses, tops, bottoms, co-ords, outerwear, and sets.',
    imageAlt: 'Curated fashion clothing arranged in a clean boutique scene',
    imageSrc: '/images/featured-collections/clothing.png',
    meta: 'Fashion',
  },
  {
    title: 'Bags',
    description:
      'Structured bags, evening bags, casual carry pieces, and outfit-finishing styles.',
    imageAlt: 'Elegant bags styled on a warm studio plinth',
    imageSrc: '/images/featured-collections/bags.png',
    meta: 'Accessories',
  },
  {
    title: 'Shoes',
    description:
      'Heels, flats, sandals, sneakers, and polished footwear for complete outfits.',
    imageAlt: 'Elegant shoes arranged on minimal studio plinths',
    imageSrc: '/images/featured-collections/shoes.png',
    meta: 'Footwear',
  },
  {
    title: 'Modest Sets',
    description:
      'Coordinated outfit sets for easy styling across casual, work, and dressy days.',
    imageAlt: 'Coordinated modest fashion outfit styled in a boutique studio',
    imageSrc: '/images/featured-collections/modest-sets.png',
    meta: 'Sets',
  },
]

const categoryGroups = [
  {
    title: 'Clothing',
    categories: [
      'Dresses',
      'Tops',
      'Blouses',
      'Shirts',
      'Skirts',
      'Trousers',
      'Jeans',
      'Jumpsuits',
      'Co-ords',
      'Two-piece sets',
      'Outerwear',
      'Blazers',
      'Loungewear',
      'Occasion wear',
    ],
  },
  {
    title: 'Modest wear',
    categories: [
      'Abaya',
      'Kaftans',
      'Modest dresses',
      'Modest sets',
      'Maxi skirts',
      'Longline tops',
      'Hijabs',
      'Scarves',
      'Prayer wear',
      'Occasion modest wear',
    ],
  },
  {
    title: 'Bags',
    categories: [
      'Handbags',
      'Shoulder bags',
      'Crossbody bags',
      'Tote bags',
      'Mini bags',
      'Clutches',
      'Evening bags',
      'Travel bags',
    ],
  },
  {
    title: 'Shoes',
    categories: [
      'Heels',
      'Flats',
      'Sandals',
      'Slides',
      'Sneakers',
      'Boots',
      'Mules',
      'Occasion shoes',
    ],
  },
  {
    title: 'Jewellery & accessories',
    categories: [
      'Gold jewellery',
      'Rings',
      'Necklaces',
      'Bracelets',
      'Earrings',
      'Anklets',
      'Watches',
      'Belts',
      'Sunglasses',
      'Hair accessories',
    ],
  },
  {
    title: 'Shop by need',
    categories: [
      'Everyday outfits',
      'Workwear',
      'Wedding guest',
      'Birthday looks',
      'Church outfits',
      'Travel outfits',
      'Gift ideas',
      'Request-based picks',
    ],
  },
]

const shoppingNotes = [
  {
    title: 'Fashion only',
    description:
      'This page is focused on fashion, gold, accessories, bags, shoes, and styling categories.',
    Icon: Shirt,
  },
  {
    title: 'Request what you need',
    description:
      'If a product is not listed yet, make a request with your budget, size, and preferred style.',
    Icon: ShoppingBag,
  },
  {
    title: 'Styled together',
    description:
      'Categories are grouped so you can build a full look across clothing, jewellery, shoes, bags, and accessories.',
    Icon: Sparkles,
  },
]

export default function CategoriesPage() {
  return (
    <div className='bg-white text-black'>
      <section className='bg-muted'>
        <div className='mx-auto grid w-full gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:px-12 lg:py-24'>
          <div className='max-w-3xl'>
            <p className='text-sm font-medium uppercase text-muted-foreground'>
              Fashion categories
            </p>
            <h1 className='font-heading text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-7xl'>
              Shop fashion by the pieces that complete the look
            </h1>
          </div>

          <p className='max-w-2xl text-base leading-7 text-muted-foreground lg:ml-auto'>
            Browse fashion-focused categories across clothing, modest wear,
            shoes, bags, jewellery, and accessories. This page is strictly for
            style, shopping, and outfit-building categories.
          </p>
        </div>
      </section>

      <section>
        <div className='mx-auto w-full px-5 py-16 space-y-8 sm:px-8 lg:px-12 lg:py-20'>
          <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
            <div className='max-w-2xl'>
              <p className='text-sm font-medium uppercase text-muted-foreground'>
                Featured
              </p>
              <h2 className='font-heading text-4xl font-bold leading-tight sm:text-5xl'>
                Main shopping categories
              </h2>
            </div>

            <Link
              href='/make-a-request'
              className='inline-flex h-11 items-center gap-3 border-b border-black text-sm font-medium text-black transition-opacity hover:opacity-65'
            >
              Make a request
              <ArrowRight className='size-4 stroke-[1.8]' />
            </Link>
          </div>

          <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
            {featuredCategories.map((category) => (
              <Link
                key={category.title}
                href='/shop'
                className='group overflow-hidden border border-black/10 bg-white transition-colors hover:border-black/35'
              >
                <div className='relative aspect-[4/5] overflow-hidden bg-muted'>
                  <Image
                    src={category.imageSrc}
                    alt={category.imageAlt}
                    fill
                    sizes='(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw'
                    className='object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]'
                  />
                </div>
                <div className='p-5'>
                  <p className='text-xs font-medium uppercase text-muted-foreground'>
                    {category.meta}
                  </p>
                  <h3 className='font-heading text-3xl font-semibold leading-tight'>
                    {category.title}
                  </h3>
                  <p className='text-sm leading-6 text-muted-foreground'>
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className='bg-black text-white'>
        <div className='mx-auto w-full px-5 py-16 sm:px-8 lg:px-12 lg:py-20'>
          <div className='max-w-3xl'>
            <p className='text-sm font-medium uppercase text-muted-foreground'>
              Full category list
            </p>
            <h2 className='font-heading text-4xl font-bold leading-tight sm:text-5xl'>
              All fashion categories
            </h2>
          </div>

          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {categoryGroups.map((group) => (
              <article key={group.title} className='border border-white/15 p-5'>
                <h3 className='font-heading text-2xl font-semibold'>
                  {group.title}
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {group.categories.map((category) => (
                    <Link
                      key={category}
                      href='/shop'
                      className='border border-white/15 px-3 py-2 text-xs font-medium uppercase text-muted-foreground transition-colors hover:border-white hover:text-white'
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className='mx-auto w-full px-5 py-16 sm:px-8 lg:px-12 lg:py-20'>
          <div className='grid gap-4 md:grid-cols-3'>
            {shoppingNotes.map(({ title, description, Icon }) => (
              <article key={title} className='border border-black/10 p-5'>
                <Icon className='size-5 stroke-[1.6]' />
                <h3 className='font-heading text-xl font-semibold'>{title}</h3>
                <p className='text-sm leading-6 text-muted-foreground'>
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
