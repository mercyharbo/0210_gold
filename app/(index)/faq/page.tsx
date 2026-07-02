import { ArrowRight, HelpCircle, PackageCheck, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

const faqGroups = [
  {
    title: 'Shopping',
    questions: [
      {
        question: 'What can I shop on FM LUXE?',
        answer:
          'You can browse fashion, gold jewellery, accessories, abaya, modest sets, bags, shoes, and clothing categories.',
      },
      {
        question: 'Are the products on the shop page real products?',
        answer:
          'The shop is structured as the product catalog and will hold the available products, prices, images, and product detail pages.',
      },
      {
        question: 'Can I request something that is not listed?',
        answer:
          'Yes. Use the make a request page to send item links, screenshots, sizes, colors, budget, and any preferred UK store.',
      },
    ],
  },
  {
    title: 'Make a Request',
    questions: [
      {
        question: 'How does the UK request service work?',
        answer:
          'You send your request, we review the details, source the item in the UK, confirm the order information, and prepare it for delivery to Nigeria.',
      },
      {
        question: 'What details should I include in my request?',
        answer:
          'Include the item type, size, color, quantity, budget, delivery city, deadline, links, screenshots, and any important styling preferences.',
      },
      {
        question: 'Can you shop from specific UK stores?',
        answer:
          'Yes. Add the store name or product link in your request so the item can be reviewed and sourced correctly.',
      },
    ],
  },
  {
    title: 'Delivery & Orders',
    questions: [
      {
        question: 'Do you deliver to Nigeria?',
        answer:
          'Yes. The request service is UK-based and supports waybill delivery to Nigeria.',
      },
      {
        question: 'Can I track my order?',
        answer:
          'The project already has a track order route. Tracking details can be connected as order processing is wired into the site.',
      },
      {
        question: 'What currency are prices shown in?',
        answer:
          'Shop prices are shown in Nigerian naira, using the ₦ currency symbol.',
      },
    ],
  },
  {
    title: 'Businesses',
    questions: [
      {
        question: 'Is FM LUXE only for gold jewellery?',
        answer:
          'No. FM LUXE is fashion and jewellery focused, while the wider FM LUXE group also includes custom requests and Nigerian delicacies.',
      },
      {
        question: 'How do I ask about Nigerian delicacies?',
        answer:
          'Use the contact page and select Nigerian delicacies as the enquiry type, then include the meal type, quantity, date, and delivery or pickup details.',
      },
      {
        question: 'Where can I see all businesses?',
        answer:
          'Visit the companies page to see the current businesses under FM LUXE.',
      },
    ],
  },
]

const quickLinks = [
  {
    title: 'Shop products',
    description: 'Browse fashion, gold, bags, shoes, and accessories.',
    href: '/shop',
    Icon: ShoppingBag,
  },
  {
    title: 'Make a request',
    description: 'Send a UK shopping request for Nigeria delivery.',
    href: '/make-a-request',
    Icon: PackageCheck,
  },
  {
    title: 'Contact us',
    description: 'Ask about orders, services, companies, or support.',
    href: '/contact',
    Icon: HelpCircle,
  },
]

export default function FaqPage() {
  return (
    <div className='bg-white text-black'>
      <section className='bg-muted'>
        <div className='mx-auto grid w-full gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:px-12 lg:py-24'>
          <div className='max-w-3xl'>
            <p className='text-sm font-medium uppercase text-muted-foreground'>
              FAQs
            </p>
            <h1 className='font-heading text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-7xl'>
              Answers for shopping, delivery, and services
            </h1>
          </div>

          <p className='max-w-2xl text-base leading-7 text-muted-foreground lg:ml-auto'>
            Find quick answers about the shop, UK requests, Nigeria
            delivery, orders, and the businesses under FM LUXE.
          </p>
        </div>
      </section>

      <section>
        <div className='mx-auto grid w-full gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-12 lg:py-20'>
          <aside className='space-y-4'>
            {quickLinks.map(({ title, description, href, Icon }) => (
              <Link
                key={title}
                href={href}
                className='group block border border-black/10 p-5 transition-colors hover:border-black/35'
              >
                <Icon className='size-5 stroke-[1.6]' />
                <h2 className='font-heading text-xl font-semibold'>{title}</h2>
                <p className='text-sm leading-6 text-muted-foreground'>
                  {description}
                </p>
                <span className='inline-flex items-center gap-3 text-sm font-medium text-black'>
                  Open
                  <ArrowRight className='size-4 stroke-[1.8] transition-transform group-hover:translate-x-1' />
                </span>
              </Link>
            ))}
          </aside>

          <div className='space-y-10'>
            {faqGroups.map((group) => (
              <section key={group.title}>
                <h2 className='font-heading text-3xl font-semibold'>
                  {group.title}
                </h2>
                <div className='divide-y divide-black/10 border-y border-black/10'>
                  {group.questions.map((item) => (
                    <details key={item.question} className='group py-5'>
                      <summary className='flex cursor-pointer list-none items-start justify-between gap-6 text-left'>
                        <span className='font-heading text-2xl font-semibold leading-tight'>
                          {item.question}
                        </span>
                        <span className='text-2xl leading-none text-muted-foreground transition-transform group-open:rotate-45'>
                          +
                        </span>
                      </summary>
                      <p className='max-w-3xl text-sm leading-6 text-muted-foreground'>
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
