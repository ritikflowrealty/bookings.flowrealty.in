-- Real founder data per the founder's own copy + cutouts hosted on R2.
-- Idempotent: UPDATE existing founder rows by slug; INSERT OR IGNORE if missing.

INSERT OR IGNORE INTO team_members (slug, name, designation, category, photo_url, cutout_url, bio, pedigree, linkedin_url, display_order, is_published)
VALUES
('arun-anand', 'Arun Anand', 'Co-Founder', 'cofounder',
  'https://pub-6cedfcd24b1f4f6abb86ef2df3629236.r2.dev/booking-flow/Founder''s Image on Home/arun-anand.png',
  'https://pub-6cedfcd24b1f4f6abb86ef2df3629236.r2.dev/booking-flow/Founder''s Image on Home/arun-anand.png',
  'Known for the ability to turn around some of the toughest projects in the country, deep knowledge of the market, ruthless pragmatism, hustle and impressive industry network. Industry experience: 15 years+ in senior roles with brands like Lodha Group, Embassy Group, and most recently at Shriram Properties as Director (Sales, Marketing, CRM). Managed sales of over 20+mn Sqft over geographies such as Mumbai, Bangalore, Chennai, Kolkata, Bhubaneswar, Mysore etc. Alma-mater: Narsee Monjee Institute of Management Studies (NMIMS) and NIT Trichy.',
  'NMIMS|NIT Trichy|Lodha Group|Embassy Group|Shriram Properties',
  'https://www.linkedin.com/in/aaborad/',
  10, 1),
('vyoma-pandit', 'Vyoma Pandit', 'Co-Founder', 'cofounder',
  'https://pub-6cedfcd24b1f4f6abb86ef2df3629236.r2.dev/booking-flow/Founder''s Image on Home/vyoma-pandit.png',
  'https://pub-6cedfcd24b1f4f6abb86ef2df3629236.r2.dev/booking-flow/Founder''s Image on Home/vyoma-pandit.png',
  'Known for the most unique marketing campaigns in real estate and understanding of the deep customer psyche. A Real Estate 40Under40 Awardee, she is a numbers champ, an avid reader, and a much-loved leader. Industry experience: 14 years+ with brands like Lodha (Head – Sales Strategy), Brigade (Head – Marketing & Strategy), Shriram (Associate Director – Sales & Marketing). Alma-mater: IIM Bangalore and Nirma University, Ahmedabad.',
  'IIM Bangalore|Nirma University|Lodha|Brigade|Shriram',
  '',
  20, 1);

-- If rows already exist, refresh content to the canonical bio + cutouts.
UPDATE team_members SET
  designation = 'Co-Founder',
  category = 'cofounder',
  photo_url = 'https://pub-6cedfcd24b1f4f6abb86ef2df3629236.r2.dev/booking-flow/Founder''s Image on Home/arun-anand.png',
  cutout_url = 'https://pub-6cedfcd24b1f4f6abb86ef2df3629236.r2.dev/booking-flow/Founder''s Image on Home/arun-anand.png',
  bio = 'Known for the ability to turn around some of the toughest projects in the country, deep knowledge of the market, ruthless pragmatism, hustle and impressive industry network. Industry experience: 15 years+ in senior roles with brands like Lodha Group, Embassy Group, and most recently at Shriram Properties as Director (Sales, Marketing, CRM). Managed sales of over 20+mn Sqft over geographies such as Mumbai, Bangalore, Chennai, Kolkata, Bhubaneswar, Mysore etc. Alma-mater: Narsee Monjee Institute of Management Studies (NMIMS) and NIT Trichy.',
  pedigree = 'NMIMS|NIT Trichy|Lodha Group|Embassy Group|Shriram Properties',
  linkedin_url = 'https://www.linkedin.com/in/aaborad/',
  display_order = 10,
  is_published = 1
WHERE slug = 'arun-anand';

UPDATE team_members SET
  designation = 'Co-Founder',
  category = 'cofounder',
  photo_url = 'https://pub-6cedfcd24b1f4f6abb86ef2df3629236.r2.dev/booking-flow/Founder''s Image on Home/vyoma-pandit.png',
  cutout_url = 'https://pub-6cedfcd24b1f4f6abb86ef2df3629236.r2.dev/booking-flow/Founder''s Image on Home/vyoma-pandit.png',
  bio = 'Known for the most unique marketing campaigns in real estate and understanding of the deep customer psyche. A Real Estate 40Under40 Awardee, she is a numbers champ, an avid reader, and a much-loved leader. Industry experience: 14 years+ with brands like Lodha (Head – Sales Strategy), Brigade (Head – Marketing & Strategy), Shriram (Associate Director – Sales & Marketing). Alma-mater: IIM Bangalore and Nirma University, Ahmedabad.',
  pedigree = 'IIM Bangalore|Nirma University|Lodha|Brigade|Shriram',
  display_order = 20,
  is_published = 1
WHERE slug = 'vyoma-pandit';

-- Sample partners for Developers strip + Banking strip
INSERT OR IGNORE INTO partners (name, category, logo_url, website_url, display_order, is_published) VALUES
('Sterling Developers', 'developer', '', '', 10, 1),
('Habitat Ventures', 'developer', '', '', 20, 1),
('Sumadhura Group', 'developer', '', '', 30, 1),
('Sipani Properties', 'developer', '', '', 40, 1),
('Svamitva Ventures', 'developer', '', '', 50, 1),
('UKN Properties', 'developer', '', '', 60, 1),
('Mana Projects', 'developer', '', '', 70, 1),
('Sowparnika Projects', 'developer', '', '', 80, 1),
('HDFC Bank', 'banking', '', '', 10, 1),
('ICICI Bank', 'banking', '', '', 20, 1),
('SBI Home Loans', 'banking', '', '', 30, 1),
('Axis Bank', 'banking', '', '', 40, 1),
('LIC Housing', 'banking', '', '', 50, 1),
('Bajaj Housing', 'banking', '', '', 60, 1);
