import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';

export const metadata = {
  title: 'Blogs | Flow Realty — Real Estate Insights',
  description: 'Insights on Bangalore real estate, plot investments in Mysore, and the role of technology in modern real estate sales.',
};

const blogs = [
  {
    slug: 'invest-in-plots-in-mysore',
    title: 'Why You Should Invest in Plots in Mysore Right Now',
    excerpt: 'Mysore is emerging as one of South India\'s most promising real estate markets. With infrastructure development accelerating and Bangalore spillover driving demand, plotted developments in Mysore offer compelling returns for early investors.',
    category: 'Investment',
    date: '2026-04-15',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'bangalore-real-estate-prices-high',
    title: 'Is Bangalore Real Estate Becoming Too Expensive?',
    excerpt: 'With average prices crossing ₹8,000/sqft in most micro-markets and premium corridors touching ₹15,000+, the question on every buyer\'s mind: has Bangalore peaked? We break down the data, demand drivers, and what it means for buyers in 2026.',
    category: 'Market Analysis',
    date: '2026-03-20',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'tech-in-real-estate',
    title: 'The Role of Technology in Modern Real Estate Sales',
    excerpt: 'From CRM automation to AI-powered lead scoring, technology is transforming how real estate is sold in India. We share how Flow Realty uses tech to deliver 90%+ success rates across projects.',
    category: 'Technology',
    date: '2026-02-10',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'ppc-framework-flow-values',
    title: 'The PPC Framework: How Flow Values Drive Results',
    excerpt: 'Performance, Predictability, and Cashflow — the three pillars that define every engagement at Flow Realty. Here\'s how our internal framework translates to developer outcomes.',
    category: 'Company',
    date: '2026-01-25',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  },
];

export default function BlogsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-12 pb-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Blog</span>
            <h1 className="mt-4 font-heading text-4xl sm:text-5xl tracking-tight">
              Insights from the ground.
            </h1>
            <p className="mt-3 max-w-2xl text-ink-muted leading-relaxed">
              Market analysis, investment guides, and lessons from selling ₹4,500 Cr+ of real estate.
            </p>
          </SectionReveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogs.map((blog) => (
              <Link
                key={blog.slug}
                href={`/blogs/${blog.slug}`}
                className="group glass-strong rounded-3xl overflow-hidden hover:shadow-glow transition-all duration-300"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.15em] text-ink-muted">
                    <span>{blog.category}</span>
                    <span>·</span>
                    <span>{new Date(blog.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>·</span>
                    <span>{blog.readTime}</span>
                  </div>
                  <h2 className="mt-3 font-heading text-xl sm:text-2xl leading-tight tracking-tight">
                    {blog.title}
                  </h2>
                  <p className="mt-3 text-sm text-ink-muted leading-relaxed line-clamp-3">
                    {blog.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm text-ink group-hover:text-white transition-colors">
                    Read more
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
