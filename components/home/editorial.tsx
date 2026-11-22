import Image from 'next/image'
import Link from 'next/link'

export function HomeEditorial() {
  return (
    <section aria-labelledby="editorial-title" className="meere-editorial">
      <Image src="/images/featured-collections/jewellery-accessories.png"
        alt="Gold necklaces, earrings, rings and bracelets" fill sizes="100vw" className="object-cover" />
      <div className="meere-image-shade" />
      <div className="meere-hero-copy">
        <h2 id="editorial-title" className="meere-display">Make It Your Own</h2>
        <p>A favourite chain. A pair of earrings you reach for every morning. Discover gold jewellery to wear your way, every day.</p>
        <Link href="/shop" className="meere-white-button">Shop Jewellery</Link>
      </div>
    </section>
  )
}
