import type { Metadata } from 'next'
import Link from 'next/link'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | FM LUXE',
  description: 'Answers to questions about FM LUXE gold jewellery, product options, prices, delivery and order support.',
  alternates: { canonical: '/faq' },
}

const questions = [
  { question: 'What does FM LUXE sell?', answer: 'Our current store focuses on our own gold jewellery collections. The shop shows the products currently available.' },
  { question: 'Where can I find a product’s karat, weight and size?', answer: 'Check the product page for its listed details and available options. Contact us with the product link if you need help choosing.' },
  { question: 'How are prices displayed?', answer: 'Product prices are shown in Nigerian naira. Where a gold option changes the price, choose the karat to see its calculated price. Delivery is included in the checkout total when checkout is available.' },
  { question: 'Do you deliver within Nigeria?', answer: 'The store supports Nigerian delivery addresses. Confirm the address and applicable delivery fee before placing your order.' },
  { question: 'How do I get help with an order?', answer: 'Contact our support team with your order reference and a description of the issue.' },
  { question: 'Who can leave a product review?', answer: 'Reviews are reserved for customers with a paid order containing the product and are checked before publication.' },
]
const structuredData = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: questions.map(({ question, answer }) => ({
    '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
}

export default function FaqPage() {
  return (
    <div className="bg-white text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll('<', '\\u003c') }} />
      <section className="bg-muted px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-5">
          <p className="text-sm font-medium text-muted-foreground">FAQs</p>
          <h1 className="font-heading text-5xl font-semibold leading-tight sm:text-6xl">A little help with your next piece.</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">Product details, delivery and support for shopping with FM LUXE.</p>
        </div>
      </section>
      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-4xl flex-col gap-10">
          <Accordion type="single" collapsible>
            {questions.map(({ question, answer }, index) => (
              <AccordionItem key={question} value={`question-${index}`}>
                <AccordionTrigger>{question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-7 text-muted-foreground">{answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="flex flex-wrap gap-3">
            <Button asChild><Link href="/shop">Explore jewellery</Link></Button>
            <Button asChild variant="outline"><Link href="/contact">Contact support</Link></Button>
          </div>
        </div>
      </section>
    </div>
  )
}
