import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'

type ShopControlsProps = {
  activeCategory: string
  categories: string[]
  onCategoryChange: (category: string) => void
  onQueryChange: (query: string) => void
  onSortChange: (sort: string) => void
  query: string
  sort: string
  minPrice: string
  maxPrice: string
  onMinPriceChange: (val: string) => void
  onMaxPriceChange: (val: string) => void
  selectedMaterial: string
  onMaterialChange: (val: string) => void
  onResetFilters: () => void
}

const materials = ['All Materials', '18k Gold', '22k Gold', 'Sterling Silver', 'Luxury Fashion']

export function ShopControls({
  activeCategory,
  categories,
  onCategoryChange,
  onQueryChange,
  onSortChange,
  query,
  sort,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  selectedMaterial,
  onMaterialChange,
  onResetFilters,
}: ShopControlsProps) {
  const hasActiveFilters =
    activeCategory !== 'All' ||
    query !== '' ||
    sort !== 'featured' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    selectedMaterial !== 'All Materials'

  return (
    <div className='space-y-5 border-y border-black/10 py-5'>
      {/* Top Bar: Search, Sort, Price Inputs */}
      <div className='grid gap-4 lg:grid-cols-[1.2fr_auto_auto] lg:items-center'>
        <label className='relative block'>
          <span className='sr-only'>Search products</span>
          <Search className='pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 stroke-[1.7] text-muted-foreground' />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder='Search fashion, gold, abaya, bags, shoes...'
            className='h-11 w-full border border-black/15 bg-white pl-11 pr-4 text-sm text-black outline-none transition-colors placeholder:text-muted-foreground focus:border-gold'
          />
        </label>

        {/* Price Inputs */}
        <div className='flex items-center gap-2'>
          <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1'>
            <SlidersHorizontal className='size-3.5 text-gold' /> Price (₦)
          </span>
          <input
            type='number'
            placeholder='Min'
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className='h-11 w-24 border border-black/15 bg-white px-3 text-xs text-black outline-none focus:border-gold placeholder:text-muted-foreground'
          />
          <span className='text-muted-foreground text-xs'>-</span>
          <input
            type='number'
            placeholder='Max'
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className='h-11 w-24 border border-black/15 bg-white px-3 text-xs text-black outline-none focus:border-gold placeholder:text-muted-foreground'
          />
        </div>

        {/* Sort & Reset */}
        <div className='flex items-center gap-3'>
          <label className='flex items-center gap-2'>
            <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0'>
              Sort
            </span>
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value)}
              className='h-11 min-w-40 border border-black/15 bg-white px-3 text-xs font-semibold text-black outline-none focus:border-gold cursor-pointer'
            >
              <option value='featured'>Featured</option>
              <option value='newest'>Newest</option>
              <option value='price-low'>Price low to high</option>
              <option value='price-high'>Price high to low</option>
            </select>
          </label>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              type='button'
              className='h-11 px-3 border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-rose-100 transition-colors shrink-0'
            >
              <RotateCcw className='size-3.5' />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className='flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        {categories.map((category) => (
          <button
            key={category}
            type='button'
            onClick={() => onCategoryChange(category)}
            className={
              activeCategory === category
                ? 'shrink-0 bg-black px-4 py-2 text-xs font-semibold text-white uppercase tracking-wider'
                : 'shrink-0 border border-black/15 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-black hover:text-black uppercase tracking-wider'
            }
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}
