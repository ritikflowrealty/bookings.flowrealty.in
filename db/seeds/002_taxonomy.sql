-- Seed: Bangalore-specific taxonomy for SEO landing pages.
-- Idempotent: INSERT OR IGNORE keeps existing rows safe.

-- =========================================================
-- LOCATIONS (Bangalore micro-markets where Flow Realty operates)
-- =========================================================
INSERT OR IGNORE INTO locations (slug, name, city, description, meta_title, meta_description, display_order) VALUES
('sarjapur-road', 'Sarjapur Road', 'Bangalore', 'Bangalore''s fastest-growing IT corridor with premium gated communities and excellent ORR connectivity.', 'Premium Apartments on Sarjapur Road, Bangalore | Flow Realty', 'Find verified residential projects on Sarjapur Road, Bangalore. 2, 3, 4 BHK flats and villas curated by Flow Realty.', 10),
('whitefield', 'Whitefield', 'Bangalore', 'Established East Bangalore tech hub with mature infrastructure and metro connectivity.', 'Apartments in Whitefield, Bangalore | Flow Realty', 'Premium homes in Whitefield with metro access and proximity to ITPL. Verified projects from Flow Realty.', 20),
('electronic-city', 'Electronic City', 'Bangalore', 'South Bangalore''s original IT corridor with elevated expressway and metro.', 'Apartments in Electronic City, Bangalore | Flow Realty', '2 and 3 BHK apartments in Electronic City. Excellent connectivity, metro access, verified projects.', 30),
('hebbal', 'Hebbal', 'Bangalore', 'North Bangalore premium hub close to airport and Manyata Tech Park.', 'Apartments in Hebbal, Bangalore | Flow Realty', 'Luxury homes in Hebbal, North Bangalore. Airport connectivity, metro, premium projects from Flow Realty.', 40),
('jp-nagar', 'JP Nagar', 'Bangalore', 'Established South Bangalore residential locality with mature infrastructure.', 'Apartments in JP Nagar, Bangalore | Flow Realty', 'Premium apartments in JP Nagar. Established neighbourhood, metro, schools, verified developers.', 50),
('kanakapura-road', 'Kanakapura Road', 'Bangalore', 'Emerging South Bangalore corridor with metro Phase 2 and green pockets.', 'Apartments on Kanakapura Road, Bangalore | Flow Realty', 'Affordable to premium homes on Kanakapura Road with upcoming metro connectivity.', 60),
('yelahanka', 'Yelahanka', 'Bangalore', 'North Bangalore satellite township with airport proximity and IISc connectivity.', 'Apartments in Yelahanka, Bangalore | Flow Realty', 'Homes in Yelahanka with airport proximity and excellent road network.', 70),
('devanahalli', 'Devanahalli', 'Bangalore', 'Airport corridor with KIADB tech parks and luxury townships.', 'Apartments in Devanahalli, Bangalore | Flow Realty', 'Premium townships near Bangalore International Airport. Verified projects from Flow Realty.', 80),
('bannerghatta-road', 'Bannerghatta Road', 'Bangalore', 'South Bangalore corridor connecting JP Nagar to Bannerghatta National Park.', 'Apartments on Bannerghatta Road, Bangalore | Flow Realty', 'Homes on Bannerghatta Road with hospitals, schools, and IT proximity.', 90),
('hosur-road', 'Hosur Road', 'Bangalore', 'South-East Bangalore IT corridor with elevated expressway.', 'Apartments on Hosur Road, Bangalore | Flow Realty', 'Affordable and premium apartments on Hosur Road. Electronic City and Bommasandra access.', 100),
('old-airport-road', 'Old Airport Road', 'Bangalore', 'Premium East Bangalore corridor with established neighbourhoods.', 'Apartments on Old Airport Road, Bangalore | Flow Realty', 'Premium homes on Old Airport Road, Bangalore. Established locality, mature infrastructure.', 110),
('marathahalli', 'Marathahalli', 'Bangalore', 'Central-East Bangalore IT hub with Outer Ring Road connectivity.', 'Apartments in Marathahalli, Bangalore | Flow Realty', 'Apartments in Marathahalli with excellent ORR connectivity and IT park access.', 120),

-- Mysore
('vijayanagar-mysore', 'Vijayanagar', 'Mysore', 'Mysore''s premium residential locality close to Infosys and the city centre.', 'Apartments in Vijayanagar, Mysore | Flow Realty', 'Premium apartments in Vijayanagar, Mysore. Verified projects from Flow Realty.', 200),
('hebbal-mysore', 'Hebbal', 'Mysore', 'Mysore tech hub adjoining Infosys campus.', 'Apartments in Hebbal, Mysore | Flow Realty', 'Tech-corridor apartments in Hebbal, Mysore. IT proximity, premium projects.', 210),

-- Bhubaneswar
('patia', 'Patia', 'Bhubaneswar', 'Bhubaneswar''s IT hub with KIIT University and Infocity.', 'Apartments in Patia, Bhubaneswar | Flow Realty', 'Premium homes in Patia, Bhubaneswar. IT corridor, university, verified projects.', 300);

-- =========================================================
-- CONFIGURATIONS (BHK types for Bangalore market)
-- =========================================================
INSERT OR IGNORE INTO configurations (slug, label, city, description, meta_title, meta_description, display_order) VALUES
('1-bhk-flats-in-bangalore', '1 BHK Flats', 'Bangalore', 'Compact 1 BHK apartments ideal for singles, young professionals, and investors.', '1 BHK Flats in Bangalore | Verified Projects | Flow Realty', '1 BHK apartments in Bangalore from RERA-registered developers. Compare prices, locations, and book your unit online.', 10),
('2-bhk-flats-in-bangalore', '2 BHK Flats', 'Bangalore', 'Family-friendly 2 BHK apartments across Bangalore''s top locations.', '2 BHK Flats in Bangalore | Verified Projects | Flow Realty', '2 BHK apartments in Bangalore from leading developers. Sarjapur, Whitefield, Hebbal, Electronic City.', 20),
('3-bhk-flats-in-bangalore', '3 BHK Flats', 'Bangalore', 'Spacious 3 BHK apartments for growing families with premium amenities.', '3 BHK Flats in Bangalore | Verified Projects | Flow Realty', 'Premium 3 BHK apartments in Bangalore. Compare projects, configurations, and starting prices on Flow Realty.', 30),
('4-bhk-flats-in-bangalore', '4 BHK Flats', 'Bangalore', 'Premium 4 BHK apartments and penthouses for luxury living.', '4 BHK Flats in Bangalore | Luxury Apartments | Flow Realty', 'Luxury 4 BHK apartments and penthouses in Bangalore from premium developers.', 40),
('villas-in-bangalore', 'Villas', 'Bangalore', 'Independent villas and row houses across Bangalore''s premium gated communities.', 'Villas in Bangalore | Premium Gated Communities | Flow Realty', 'Independent villas in Bangalore. Premium gated communities, North and South Bangalore.', 50),
('plots-in-bangalore', 'Plots', 'Bangalore', 'BMRDA and BIAPPA approved residential plots across Bangalore''s growth corridors.', 'Plots in Bangalore | RERA Approved | Flow Realty', 'BMRDA approved residential plots in Bangalore. Verified developers, clear titles.', 60),

-- Mysore
('2-bhk-flats-in-mysore', '2 BHK Flats', 'Mysore', '2 BHK apartments across Mysore''s premium localities.', '2 BHK Flats in Mysore | Verified Projects | Flow Realty', '2 BHK apartments in Mysore from leading developers.', 70),
('3-bhk-flats-in-mysore', '3 BHK Flats', 'Mysore', 'Spacious 3 BHK apartments in Mysore.', '3 BHK Flats in Mysore | Verified Projects | Flow Realty', 'Premium 3 BHK apartments in Mysore from Flow Realty.', 80);

-- =========================================================
-- BUDGET RANGES (Bangalore-realistic price tiers)
-- =========================================================
INSERT OR IGNORE INTO budget_ranges (slug, label, city, min_amount, max_amount, meta_title, meta_description, display_order) VALUES
('properties-under-40-lakhs-in-bangalore', 'Under ₹40 Lakhs', 'Bangalore', 0, 4000000, 'Properties Under ₹40 Lakhs in Bangalore | Flow Realty', 'Affordable apartments under ₹40 lakhs in Bangalore. Compact 1 and 2 BHK options across emerging corridors.', 10),
('properties-under-60-lakhs-in-bangalore', 'Under ₹60 Lakhs', 'Bangalore', 0, 6000000, 'Properties Under ₹60 Lakhs in Bangalore | Flow Realty', '2 BHK and compact 3 BHK apartments under ₹60 lakhs in Bangalore.', 20),
('properties-under-80-lakhs-in-bangalore', 'Under ₹80 Lakhs', 'Bangalore', 0, 8000000, 'Properties Under ₹80 Lakhs in Bangalore | Flow Realty', '2 and 3 BHK apartments under ₹80 lakhs across Bangalore''s top corridors.', 30),
('properties-under-1-crore-in-bangalore', 'Under ₹1 Crore', 'Bangalore', 0, 10000000, 'Properties Under ₹1 Crore in Bangalore | Flow Realty', 'Premium 2 and 3 BHK apartments under ₹1 crore in Bangalore.', 40),
('properties-under-1-5-crore-in-bangalore', 'Under ₹1.5 Crore', 'Bangalore', 0, 15000000, 'Properties Under ₹1.5 Crore in Bangalore | Flow Realty', 'Premium 3 BHK apartments and townhomes under ₹1.5 crore in Bangalore.', 50),
('properties-under-2-crore-in-bangalore', 'Under ₹2 Crore', 'Bangalore', 0, 20000000, 'Properties Under ₹2 Crore in Bangalore | Flow Realty', 'Premium 3 and 4 BHK apartments under ₹2 crore. Sarjapur, Hebbal, Whitefield.', 60),
('properties-under-3-crore-in-bangalore', 'Under ₹3 Crore', 'Bangalore', 0, 30000000, 'Properties Under ₹3 Crore in Bangalore | Flow Realty', 'Luxury 4 BHK apartments and villas under ₹3 crore in Bangalore.', 70),
('luxury-properties-in-bangalore', 'Luxury (₹3 Cr+)', 'Bangalore', 30000000, 0, 'Luxury Properties in Bangalore | ₹3 Crore and Above | Flow Realty', 'Luxury apartments, penthouses and villas above ₹3 crore in Bangalore.', 80);

-- =========================================================
-- SITE SETTINGS DEFAULTS (CMS-editable from admin)
-- =========================================================
INSERT OR IGNORE INTO site_settings (key, value) VALUES
('hero_video_url', ''),
('hero_video_poster', ''),
('hero_headline', 'The address you have been waiting for. Yours, in a tap.'),
('hero_subheadline', 'Hand-picked homes from India''s most respected developers. Reserve the unit you love today. Our sales team takes it from there.'),
('contact_phone', '+91 80 1234 5678'),
('contact_email', 'hello@flowrealty.in'),
('contact_address', 'Richards Town, Bangalore'),
('contact_address_line_2', '3rd Floor, Clarke Road'),
('cities_covered', 'Bangalore,Mysore,Bhubaneswar'),
('coming_soon_cities', 'Hyderabad'),
('total_sales_value', '3500'),
('total_sales_unit', 'Cr'),
('years_active', '5'),
('cp_distribution_size', '1000'),
('team_size', '75'),
('developers_count', '15'),
('projects_count', '30'),
('social_linkedin', ''),
('social_instagram', ''),
('social_youtube', ''),
('whatsapp_number', '');
