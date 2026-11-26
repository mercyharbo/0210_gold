import Link from 'next/link'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { CatalogProduct } from '@/types/catalog'

export function ProductInformation({ product }: { product: CatalogProduct }) {
  const hasDetails = Boolean(product.details?.length || product.gold_weight_grams || product.note)

  return (
    <Accordion type='single' collapsible defaultValue='details' className='border-y border-gray-200'>
      {hasDetails && (
        <AccordionItem value='details' className='border-gray-200'>
          <AccordionTrigger className='rounded-none py-5 text-sm'>Product details</AccordionTrigger>
          <AccordionContent className='flex h-auto flex-col gap-3 pb-5 text-gray-600'>
            {!!product.details?.length && (
              <ul className='flex list-disc flex-col gap-2 pl-4'>
                {product.details.map((detail, index) => (
                  <li key={`${index}-${detail}`}>{detail}</li>
                ))}
              </ul>
            )}

            {product.gold_weight_grams && <p>Gold weight: {product.gold_weight_grams} g</p>}
            {product.note && <p className='whitespace-pre-line'>{product.note}</p>}
          </AccordionContent>
        </AccordionItem>
      )}

      <AccordionItem value='delivery' className='border-gray-200'>
        <AccordionTrigger className='rounded-none py-5 text-sm'>Delivery & order support</AccordionTrigger>
        <AccordionContent className='h-auto pb-5 leading-7 text-gray-600'>
          For delivery information and help with your order,{' '}
          <Link href='/faq' className='text-black hover:text-[#e10600]'>read our FAQs</Link>
          {' '}or{' '}
          <Link href='/contact' className='text-black hover:text-[#e10600]'>contact FM LUXE</Link>.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
