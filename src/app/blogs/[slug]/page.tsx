import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import Link from 'next/link';

type BlogPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  content: string;
};

const blogPosts: Record<string, BlogPost> = {
  'invest-in-plots-in-mysore': {
    slug: 'invest-in-plots-in-mysore',
    title: 'Why You Should Invest in Plots in Mysore Right Now',
    category: 'Investment',
    date: '2026-04-15',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    content: `Mysore is rapidly emerging as one of South India's most promising real estate investment destinations. With the Bangalore-Mysore Expressway nearing completion and systematic infrastructure development, the city offers a unique window for early investors.

## Why Mysore, Why Now?

The Bangalore-Mysore corridor is transforming. What was once a 3-hour drive is now under 90 minutes. This connectivity shift is driving a fundamental change in how people think about Mysore — not just as a heritage city, but as a viable extension of Bangalore's economic zone.

## Key Drivers

**Infrastructure:** The expressway, new ring road, and upcoming metro connectivity are creating new micro-markets that didn't exist 3 years ago.

**Price Arbitrage:** While Bangalore's average plot prices have crossed ₹5,000/sqft in most corridors, Mysore offers comparable quality at ₹1,500-2,500/sqft — a 60-70% discount.

**Demand Spillover:** IT professionals priced out of Bangalore are actively looking at Mysore for weekend homes, retirement plots, and investment holdings.

**Developer Quality:** Tier-A Bangalore developers are now launching projects in Mysore, bringing the same construction quality and amenity standards.

## What to Look For

When evaluating plots in Mysore, focus on:
- Proximity to the expressway corridor
- RERA registration and clear title
- Developer track record in plotted developments
- Infrastructure timeline (roads, water, electricity)
- Appreciation potential based on surrounding development

## Flow's Take

At Flow Realty, we've seen plot projects in Mysore achieve 80%+ sell-through within 6 months of launch. The demand is real, the prices are still accessible, and the infrastructure story is only getting stronger. If you're considering a plot investment, the window is now.`,
  },
  'bangalore-real-estate-prices-high': {
    slug: 'bangalore-real-estate-prices-high',
    title: 'Is Bangalore Real Estate Becoming Too Expensive?',
    category: 'Market Analysis',
    date: '2026-03-20',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    content: `Bangalore's residential real estate market has seen unprecedented price appreciation over the last 3 years. Average prices in key corridors like Sarjapur Road, Whitefield, and North Bangalore have jumped 40-60%. The question every buyer is asking: has the market peaked?

## The Numbers

Let's look at the data:
- **Sarjapur Road:** ₹6,500-9,000/sqft (up from ₹4,500 in 2023)
- **Whitefield:** ₹7,000-10,000/sqft (up from ₹5,000 in 2023)
- **North Bangalore:** ₹5,500-8,000/sqft (up from ₹3,800 in 2023)
- **Electronic City:** ₹5,000-7,000/sqft (up from ₹3,500 in 2023)

## What's Driving Prices?

**Supply Constraint:** Land availability in established corridors is shrinking. New launches are fewer, and developers are pricing for scarcity.

**IT Sector Strength:** Bangalore's tech ecosystem continues to grow. GCC (Global Capability Centre) expansion is adding high-income demand that wasn't there 5 years ago.

**Infrastructure:** Metro expansion, peripheral ring road, and airport connectivity improvements are unlocking new value in previously underserved areas.

**NRI Demand:** Post-pandemic, NRI investment in Bangalore residential has surged — driven by rupee depreciation and rental yield improvements.

## Is It Too Late?

Short answer: No, but you need to be smarter about where you buy.

The days of buying anywhere in Bangalore and seeing 15% annual appreciation are over. The market is bifurcating:
- **Premium corridors** (Sarjapur, Whitefield, Hebbal) will continue to appreciate but at a slower 8-10% pace
- **Emerging corridors** (Kanakapura Road, Devanahalli, Yelahanka) still offer entry points with 12-15% upside
- **Peripheral markets** (Mysore, Hosur) offer the best value for long-term investors

## Flow's Recommendation

Don't wait for a correction that may not come. Instead, focus on:
1. Projects from developers with strong delivery track records
2. Locations with confirmed infrastructure timelines
3. Configurations that match rental demand (2BHK and 3BHK)
4. RERA-registered projects with clear possession dates`,
  },
  'tech-in-real-estate': {
    slug: 'tech-in-real-estate',
    title: 'The Role of Technology in Modern Real Estate Sales',
    category: 'Technology',
    date: '2026-02-10',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    content: `Real estate in India has traditionally been a relationship-driven business. But the last 3 years have seen a fundamental shift. Technology is no longer optional — it's the difference between a 30% conversion rate and a 60% one.

## How Flow Uses Technology

At Flow Realty, technology isn't a department — it's embedded in every part of our sales process:

**Lead Scoring & Routing:** Every lead that enters our system is scored based on 15+ parameters (source, budget match, location preference, engagement signals). High-intent leads are routed to senior closers within 5 minutes.

**CRM Automation:** Follow-up sequences, site visit reminders, and post-visit nurturing are automated. No lead falls through the cracks because someone forgot to call back.

**Real-Time Dashboards:** Developers see live data — walk-ins this week, conversions by source, inventory status, CP performance. No more monthly reports that arrive too late to act on.

**Channel Partner Portal:** Our 2000+ CPs get real-time inventory, instant brokerage calculations, lead status updates, and performance leaderboards. This transparency drives engagement.

## The Results

Projects using our full tech stack consistently outperform:
- **40% faster** lead-to-site-visit conversion
- **2x higher** CP engagement vs traditional models
- **Real-time** inventory management preventing double-bookings
- **90%+** project success rate across 40+ engagements

## What's Next

We're investing in:
- AI-powered pricing recommendations based on real-time demand signals
- Virtual site visits with AR/VR for out-of-city buyers
- Predictive analytics for inventory phasing
- Automated compliance and documentation

The future of real estate sales is data-driven, tech-enabled, and human-led. Technology handles the repetitive work. Our people handle the relationships.`,
  },
  'ppc-framework-flow-values': {
    slug: 'ppc-framework-flow-values',
    title: 'The PPC Framework: How Flow Values Drive Results',
    category: 'Company',
    date: '2026-01-25',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    content: `Every company has values on a wall. At Flow, our values are a framework that directly drives how we operate, measure, and deliver. We call it PPC: Performance, Predictability, and Cashflow.

## Performance

We don't measure effort. We measure outcomes. Every team member, every project, every week — the question is the same: did we move units?

This isn't about pressure. It's about clarity. When everyone knows the number, everyone knows what to focus on. No ambiguity, no politics, no hiding behind "we're working on it."

## Predictability

Developers don't need surprises. They need to know: how many units will sell this month? What's the pipeline? Where are we stuck?

Our systems are built to answer these questions in real-time. Weekly velocity tracking, conversion funnel analytics, and demand forecasting give developers the predictability they need to plan construction, manage cashflow, and make decisions.

## Cashflow

This is the ultimate outcome. Everything we do — strategy, marketing, sales, CP activation — exists to solve one problem: cashflow predictability for developers.

Banks won't lend without sales. Construction can't continue without cashflow. Buyers won't buy without confidence. We break that cycle by delivering consistent, predictable sales velocity.

## How PPC Shows Up Daily

- **Monday reviews:** Every project's weekly velocity is reviewed against target. No exceptions.
- **CP incentives:** Designed around velocity, not just volume. Speed matters.
- **Marketing spend:** Allocated based on conversion data, not gut feel.
- **Team structure:** Dedicated teams per project. No splitting attention.

The PPC framework isn't just values — it's our operating system.`,
  },
};

type RouteParams = { slug: string };

export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;
  const post = blogPosts[slug];
  if (!post) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-8 pb-20">
        <article className="mx-auto max-w-3xl px-5 lg:px-8">
          <SectionReveal>
            <Link href="/blogs" className="text-sm text-ink-muted hover:text-ink transition-colors">
              ← Back to blogs
            </Link>
            <div className="mt-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.15em] text-ink-muted">
              <span>{post.category}</span>
              <span>·</span>
              <span>{new Date(post.date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
            <h1 className="mt-4 font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.1]">
              {post.title}
            </h1>
          </SectionReveal>

          <div className="mt-8 rounded-3xl overflow-hidden aspect-[16/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          <div className="mt-10 prose-flow">
            {post.content.split('\n\n').map((paragraph, i) => {
              if (paragraph.startsWith('## ')) {
                return <h2 key={i} className="mt-10 mb-4 font-heading text-2xl tracking-tight">{paragraph.replace('## ', '')}</h2>;
              }
              if (paragraph.startsWith('**') && paragraph.includes(':**')) {
                return (
                  <p key={i} className="mt-3 text-ink-muted leading-relaxed">
                    <span className="text-ink font-medium">{paragraph.split(':**')[0].replace(/\*\*/g, '')}:</span>
                    {paragraph.split(':**')[1]?.replace(/\*\*/g, '')}
                  </p>
                );
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n').filter(l => l.startsWith('- '));
                return (
                  <ul key={i} className="mt-3 space-y-2">
                    {items.map((item, j) => (
                      <li key={j} className="text-ink-muted leading-relaxed flex gap-2">
                        <span className="text-neon-purple mt-1">•</span>
                        <span>{item.replace('- ', '').replace(/\*\*/g, '')}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              if (paragraph.match(/^\d\./)) {
                const items = paragraph.split('\n').filter(l => l.match(/^\d\./));
                return (
                  <ol key={i} className="mt-3 space-y-2">
                    {items.map((item, j) => (
                      <li key={j} className="text-ink-muted leading-relaxed flex gap-2">
                        <span className="text-neon-purple font-medium">{j + 1}.</span>
                        <span>{item.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '')}</span>
                      </li>
                    ))}
                  </ol>
                );
              }
              return <p key={i} className="mt-4 text-ink-muted leading-relaxed">{paragraph.replace(/\*\*/g, '')}</p>;
            })}
          </div>

          {/* CTA */}
          <div className="mt-16 glass-strong rounded-3xl p-8 text-center">
            <h3 className="font-heading text-2xl tracking-tight">Start a conversation</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Want to discuss how Flow can help your project? Our team responds within 2 hours.
            </p>
            <a href="/enquire" className="btn-neon mt-5 inline-flex">
              Enquire Now
            </a>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
