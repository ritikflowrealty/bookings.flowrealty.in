-- Tag every project to a location, configurations, and price.
-- Idempotent via INSERT OR IGNORE on composite primary keys.
-- This makes /[city]/flats-in-X/, /[city]/[bhk]/, and /[city]/[budget]/ pages
-- show actual matched projects rather than "all visible in city".

-- =========================================================
-- Set starting prices on projects (used for budget filters)
-- Idempotent: only updates when starting_price is currently 0/empty.
-- =========================================================
UPDATE projects SET starting_price = 8500000 WHERE slug = 'sipani-city' AND (starting_price IS NULL OR starting_price = 0);
UPDATE projects SET starting_price = 14500000, configurations_summary = '3, 4 BHK', locality = 'Sarjapur Road' WHERE slug = 'atmos' AND (starting_price IS NULL OR starting_price = 0);
UPDATE projects SET starting_price = 11500000, configurations_summary = '2, 3 BHK', locality = 'Whitefield' WHERE slug = 'pramoda' AND (starting_price IS NULL OR starting_price = 0);
UPDATE projects SET starting_price = 6500000, configurations_summary = '2 BHK', locality = 'Hosur Road' WHERE slug = 'tranquil' AND (starting_price IS NULL OR starting_price = 0);
UPDATE projects SET starting_price = 9500000, configurations_summary = '2, 3 BHK', locality = 'JP Nagar' WHERE slug = 'pearl' AND (starting_price IS NULL OR starting_price = 0);
UPDATE projects SET starting_price = 18500000, configurations_summary = '3, 4 BHK', locality = 'Hebbal' WHERE slug = 'epitome' AND (starting_price IS NULL OR starting_price = 0);
UPDATE projects SET starting_price = 7500000, configurations_summary = '2, 3 BHK', locality = 'Electronic City' WHERE slug = 'solea' AND (starting_price IS NULL OR starting_price = 0);
UPDATE projects SET starting_price = 10500000, configurations_summary = '2, 3 BHK', locality = 'Kanakapura Road' WHERE slug = 'avenue-garden' AND (starting_price IS NULL OR starting_price = 0);
UPDATE projects SET starting_price = 5500000, configurations_summary = '2, 3 BHK', locality = 'Vijayanagar' WHERE slug = 'unstoppable-2' AND (starting_price IS NULL OR starting_price = 0);
UPDATE projects SET starting_price = 7500000, configurations_summary = '3 BHK', locality = 'Hebbal' WHERE slug = 'miraya-woods' AND (starting_price IS NULL OR starting_price = 0);
UPDATE projects SET starting_price = 12500000, configurations_summary = '3 BHK', locality = 'Yelahanka' WHERE slug = 'belvedere' AND (starting_price IS NULL OR starting_price = 0);
UPDATE projects SET starting_price = 17500000, configurations_summary = '3, 4 BHK', locality = 'Devanahalli' WHERE slug = 'sipani-royal-heritage' AND (starting_price IS NULL OR starting_price = 0);

-- =========================================================
-- Project ↔ Location links (one location per project for now)
-- =========================================================
INSERT OR IGNORE INTO project_locations (project_id, location_id)
SELECT p.id, l.id FROM projects p JOIN locations l ON
  (p.slug = 'atmos' AND l.slug = 'sarjapur-road') OR
  (p.slug = 'pramoda' AND l.slug = 'whitefield') OR
  (p.slug = 'tranquil' AND l.slug = 'hosur-road') OR
  (p.slug = 'pearl' AND l.slug = 'jp-nagar') OR
  (p.slug = 'epitome' AND l.slug = 'hebbal') OR
  (p.slug = 'solea' AND l.slug = 'electronic-city') OR
  (p.slug = 'avenue-garden' AND l.slug = 'kanakapura-road') OR
  (p.slug = 'belvedere' AND l.slug = 'yelahanka') OR
  (p.slug = 'sipani-royal-heritage' AND l.slug = 'devanahalli') OR
  (p.slug = 'sipani-city' AND l.slug = 'electronic-city') OR
  (p.slug = 'unstoppable-2' AND l.slug = 'vijayanagar-mysore') OR
  (p.slug = 'miraya-woods' AND l.slug = 'hebbal-mysore');

-- =========================================================
-- Project ↔ Configuration links (matching configurations_summary)
-- =========================================================
-- 2 BHK
INSERT OR IGNORE INTO project_configurations (project_id, configuration_id, starting_price)
SELECT p.id, c.id, p.starting_price FROM projects p JOIN configurations c ON c.slug = '2-bhk-flats-in-bangalore'
WHERE p.city = 'Bangalore' AND p.configurations_summary LIKE '%2%BHK%';

-- 3 BHK
INSERT OR IGNORE INTO project_configurations (project_id, configuration_id, starting_price)
SELECT p.id, c.id, p.starting_price FROM projects p JOIN configurations c ON c.slug = '3-bhk-flats-in-bangalore'
WHERE p.city = 'Bangalore' AND p.configurations_summary LIKE '%3%BHK%';

-- 4 BHK
INSERT OR IGNORE INTO project_configurations (project_id, configuration_id, starting_price)
SELECT p.id, c.id, p.starting_price FROM projects p JOIN configurations c ON c.slug = '4-bhk-flats-in-bangalore'
WHERE p.city = 'Bangalore' AND p.configurations_summary LIKE '%4%BHK%';

-- Mysore
INSERT OR IGNORE INTO project_configurations (project_id, configuration_id, starting_price)
SELECT p.id, c.id, p.starting_price FROM projects p JOIN configurations c ON c.slug = '2-bhk-flats-in-mysore'
WHERE p.city = 'Mysore' AND p.configurations_summary LIKE '%2%BHK%';

INSERT OR IGNORE INTO project_configurations (project_id, configuration_id, starting_price)
SELECT p.id, c.id, p.starting_price FROM projects p JOIN configurations c ON c.slug = '3-bhk-flats-in-mysore'
WHERE p.city = 'Mysore' AND p.configurations_summary LIKE '%3%BHK%';
