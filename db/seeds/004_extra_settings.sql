-- Extra site settings introduced after the initial seed.
-- Idempotent via INSERT OR IGNORE.

INSERT OR IGNORE INTO site_settings (key, value) VALUES
('potential_inventory', '500'),
('about_headline', 'Real estate''s #1 challenge is cashflow.'),
('about_paragraph', 'Banks won''t lend without sales. Buyers won''t buy without confidence. We break that cycle. From cashflow stress to sold-out projects, Flow Realty is India''s leading sales and marketing outsourcing partner.'),
('careers_headline', 'We''re building the future of real estate sales.'),
('careers_subline', 'Sharp people in sales, marketing, tech, and operations. If you want to be part of the team that powers India''s biggest real estate sales engine, let''s talk.'),
('social_twitter', ''),
('social_facebook', '');
