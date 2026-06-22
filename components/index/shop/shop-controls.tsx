import { Search } from 'lucide-react'

type ShopControlsProps = {
  activeCategory: string
  categories: string[]
  onCategoryChange: (category: string) => void
  onQueryChange: (query: string) => void
  onSortChange: (sort: string) => void
  query: string
  sort: string
}

export function ShopControls({
  activeCategory,
  categories,
  onCategoryChange,
  onQueryChange,
  onSortChange,
  query,
  sort,
}: ShopControlsProps) {
  return (
    <div className='space-y-5 border-y border-black/10 py-5'>
      <div className='grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center'>
        <label className='relative block'>
          <span className='sr-only'>Search products</span>
          <Search className='pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 stroke-[1.7] text-muted-foreground' />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder='Search fashion, gold, bags, shoes...'
            className='h-12 w-full border border-black/10 bg-white pl-11 pr-4 text-sm text-black outline-none transition-colors placeholder:text-muted-foreground focus:border-black'
          />
        </label>

        <label className='flex items-center gap-3'>
          <span className='text-xs font-medium uppercase text-muted-foreground'>
            Sort
          </span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className='h-12 min-w-48 border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition-colors focus:border-black'
          >
            <option value='featured'>Featured</option>
            <option value='newest'>Newest</option>
            <option value='price-low'>Price low to high</option>
            <option value='price-high'>Price high to low</option>
          </select>
        </label>
      </div>

      <div className='flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        {categories.map((category) => (
          <button
            key={category}
            type='button'
            onClick={() => onCategoryChange(category)}
            className={
              activeCategory === category
                ? 'shrink-0 bg-black px-4 py-2 text-xs font-medium uppercase text-white'
                : 'shrink-0 border border-black/10 px-4 py-2 text-xs font-medium uppercase text-muted-foreground transition-colors hover:border-black hover:text-black'
            }
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}
