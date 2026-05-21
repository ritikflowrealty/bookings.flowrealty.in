-- Seed: Marketing content (founders, team, testimonials, case studies, awards, news/blogs).
-- Idempotent via INSERT OR IGNORE on slug/email.

-- =========================================================
-- TEAM MEMBERS (Co-founders + Leadership)
-- =========================================================
INSERT OR IGNORE INTO team_members (slug, name, designation, category, photo_url, bio, linkedin_url, display_order, is_published) VALUES
('arun-anand', 'Arun Anand', 'Co-founder & CEO', 'cofounder',
 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80&auto=format&fit=crop',
 'NIT and NMIMS alumnus. 16+ years in real estate sales and strategy. Earlier at Lodha Group, Embassy Group, and Shriram Properties. Builds and runs the engine that powers Flow.',
 'https://www.linkedin.com/in/aaborad/',
 10, 1),
('vyoma-pandit', 'Vyoma Pandit', 'Co-founder & COO', 'cofounder',
 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80&auto=format&fit=crop',
 'IIM Bangalore alumna. 14+ years across sales, marketing, and operations in residential real estate. Leads strategy, partnerships, and channel synergy at Flow.',
 'https://www.linkedin.com/in/',
 20, 1),
('rohit-mehra', 'Rohit Mehra', 'Head of Sales', 'leadership',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80&auto=format&fit=crop',
 'Leads project sales execution. 12 years across new launches and last-mile closures.',
 '',
 30, 1),
('priya-sharma', 'Priya Sharma', 'Head of Marketing', 'leadership',
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80&auto=format&fit=crop',
 'Performance marketing lead. Builds digital engines that turn cold leads into walk-ins.',
 '',
 40, 1),
('karthik-rao', 'Karthik Rao', 'Head of Channel Partner Synergy', 'leadership',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80&auto=format&fit=crop',
 'Activates and manages a 1000+ CP network across South India. Onboarding, training, incentive design.',
 '',
 50, 1),
('anita-patel', 'Anita Patel', 'Head of CRM & Tech', 'leadership',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80&auto=format&fit=crop',
 'Lead management, walk-in tracking, conversion analytics. The platform that gives developers real-time visibility.',
 '',
 60, 1);

-- =========================================================
-- TESTIMONIALS (Client Speak)
-- =========================================================
INSERT OR IGNORE INTO testimonials (client_name, designation, company, photo_url, quote, rating, display_order, is_published) VALUES
('Rajesh Iyer', 'Director', 'Sparkle Realty',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80&auto=format&fit=crop',
 'Flow took our project from a 6-month inventory pile-up to sold-out in 90 days. Their digital plus channel partner combo is a force multiplier.',
 5, 10, 1),
('Meena Krishnamurthy', 'Promoter', 'Lake View Developers',
 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&q=80&auto=format&fit=crop',
 'We hired Flow for last-mile closure. They cleared the remaining 14 units in 6 weeks at full price. The CRM dashboard alone was worth it.',
 5, 20, 1),
('Vikram Reddy', 'Managing Director', 'Reddy Constructions',
 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80&auto=format&fit=crop',
 'Flow restructured our pricing and brought in 70 walk-ins in the first month. Conversion went from 4% to 11%. They are not a vendor, they are a partner.',
 5, 30, 1),
('Sunita Nair', 'CEO', 'Greenfield Estates',
 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&q=80&auto=format&fit=crop',
 'The team at Flow understands real estate inside out. Their CP network drove 60% of our bookings. Worth every rupee.',
 5, 40, 1);

-- =========================================================
-- CASE STUDIES
-- =========================================================
INSERT OR IGNORE INTO case_studies (slug, title, subtitle, client_name, cover_image_url, excerpt, content,
  metric_1_label, metric_1_value, metric_2_label, metric_2_value, metric_3_label, metric_3_value,
  display_order, is_published) VALUES
('sparkle-atmos-launch',
 'Sparkle Atmos: 250 units sold in 90 days',
 'New launch turnaround through integrated digital and channel partner activation.',
 'Sparkle Realty',
 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80&auto=format&fit=crop',
 'How we helped Sparkle Realty achieve full sell-out within the first quarter of launch.',
 '<p>Sparkle Realty came to us with a new tower launch in East Bangalore. Inventory: 250 units. Timeline pressure: aggressive. Competition: heavy.</p><p>We built a 90-day go-to-market: pricing recalibration, performance marketing, 200 channel partners activated, and a CRM tracking every walk-in. Result: 250 units sold in 90 days at full price.</p>',
 'Units sold', '250', 'Walk-ins', '1,800', 'Conversion', '14%',
 10, 1),
('lake-view-last-mile',
 'Lake View Developers: 14 units cleared in 6 weeks',
 'Last-mile closure for a stuck project at premium pricing.',
 'Lake View Developers',
 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&q=80&auto=format&fit=crop',
 'Last-mile closure case study for a 200-unit residential project in North Bangalore.',
 '<p>14 units, sat for 8 months. Lake View needed full-price closure to satisfy the bank. We mapped the buyer profile, ran intent-based campaigns, and curated walk-ins. Closed in 6 weeks at full price.</p>',
 'Units cleared', '14', 'Avg. price', '₹1.4 Cr', 'Days', '42',
 20, 1),
('greenfield-cp-revival',
 'Greenfield Estates: ₹120 Cr in 18 months',
 'Channel partner network as the primary sales engine.',
 'Greenfield Estates',
 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop',
 'How we used a 700-strong CP network to drive 60% of bookings for a mid-size developer.',
 '<p>Greenfield wanted to reduce dependency on direct walk-ins. We activated 700 CPs across South India, ran weekly project pitches, and tracked every lead in CRM. CPs drove 60% of all bookings, contributing ₹120 Cr in 18 months.</p>',
 'Sales value', '₹120 Cr', 'CPs activated', '700+', 'CP share', '60%',
 30, 1);

-- =========================================================
-- AWARDS
-- =========================================================
INSERT OR IGNORE INTO awards (title, awarding_body, year, image_url, description, display_order, is_published) VALUES
('Best Sales Partner of the Year', 'Realty+ Awards', 2025,
 'https://images.unsplash.com/photo-1553775282-20af80779df7?w=400&q=80&auto=format&fit=crop',
 'Recognised as the leading sales and marketing outsourcing partner for residential real estate in South India.',
 10, 1),
('Marketing Excellence Award', 'Property Today', 2024,
 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&q=80&auto=format&fit=crop',
 'For pioneering integrated digital and channel partner activation campaigns.',
 20, 1),
('Top Channel Partner Network', 'Indian Real Estate Forum', 2024,
 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=400&q=80&auto=format&fit=crop',
 'Largest activated CP network in South India with 1000+ verified partners.',
 30, 1),
('Emerging Real Estate Brand', 'Real Estate Times', 2023,
 'https://images.unsplash.com/photo-1604147495798-57beb5d6af73?w=400&q=80&auto=format&fit=crop',
 'For driving ₹1500 Cr in sales within the first 3 years of operation.',
 40, 1);

-- =========================================================
-- NEWS / BLOGS (sample posts)
-- =========================================================
INSERT OR IGNORE INTO news_items (slug, title, category, excerpt, content, cover_image_url, author, published_at, is_published) VALUES
('flow-realty-crosses-3500-cr-milestone',
 'Flow Realty crosses ₹3500 Cr in residential sales',
 'press',
 'A milestone year for the Bangalore-based sales partner.',
 '<p>Flow Realty has crossed the ₹3500 Cr mark in cumulative residential real estate sales, the company announced today. The milestone covers projects across Bangalore, Mysore, and Bhubaneswar over the last 5 years.</p><p>"Our model is simple. We sell what others can''t — through pricing strategy, integrated marketing, and a 1000+ channel partner network," said co-founder Arun Anand.</p>',
 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop',
 'Press Desk', '2026-04-15', 1),
('why-channel-partners-matter-more-than-ever',
 'Why channel partners matter more than ever in 2026',
 'blog',
 'A deep dive into the resurgence of CP-led sales in Indian real estate.',
 '<p>The channel partner is back. After years of digital-first promises, real estate has rediscovered the value of a relationship-driven, trusted middleman who can move the buyer over the finish line.</p><p>In 2026, top developers are activating CP networks earlier in the project lifecycle. Here''s why it works, what to watch out for, and how to build a sustainable CP engine.</p>',
 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80&auto=format&fit=crop',
 'Vyoma Pandit', '2026-03-22', 1),
('digital-marketing-playbook-for-developers',
 'The digital marketing playbook for residential developers',
 'blog',
 'How to spend ₹50 lakh on performance marketing without burning the budget.',
 '<p>Digital is non-negotiable, but it''s also where most developer money disappears. Here''s the playbook we use at Flow Realty for high-intent lead generation that actually converts.</p>',
 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop',
 'Priya Sharma', '2026-02-10', 1);
