-- Flow Realty seed data: 12 projects across 7 developers
-- All projects start disabled until admin configures Razorpay keys.
-- Sipani City has test credentials pre-loaded for quick demo.

INSERT OR IGNORE INTO projects (
  slug, name, developer, city, description, highlight_text, image_url, learn_more_url,
  razorpay_key_id, razorpay_key_secret, razorpay_active,
  is_visible, booking_enabled, payment_enabled, display_order
) VALUES
  ('sipani-city', 'Sipani City', 'Sipani Properties', 'Bangalore',
    'Premium residential township with modern architecture and curated amenities.',
    '450 units booked',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
    '',
    '', '', 0, 1, 0, 0, 1),

  ('atmos', 'Atmos', 'Sparkle Realty', 'Bangalore',
    'Sky-rise apartments with panoramic city views and resort-style amenities.',
    'Limited units left',
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80',
    '', '', '', 0, 0, 0, 0, 2),

  ('pramoda', 'Pramoda', 'Sumadhura', 'Bangalore',
    'Boutique homes designed for discerning families.',
    '',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
    '', '', '', 0, 0, 0, 0, 3),

  ('tranquil', 'Tranquil', 'Geown', 'Bangalore',
    'Lakeside living surrounded by lush greenery and peaceful walking trails.',
    '',
    'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1600&q=80',
    '', '', '', 0, 0, 0, 0, 4),

  ('pearl', 'Pearl', 'Meenakshi Group', 'Bangalore',
    'Crafted residences with timeless design language.',
    '',
    'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1600&q=80',
    '', '', '', 0, 0, 0, 0, 5),

  ('epitome', 'Epitome', 'Sumadhura', 'Bangalore',
    'A landmark address defining luxury in the heart of the city.',
    '',
    'https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&w=1600&q=80',
    '', '', '', 0, 0, 0, 0, 6),

  ('solea', 'Solea', 'Sumadhura', 'Bangalore',
    'Sun-soaked homes designed around courtyards and natural light.',
    '',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80',
    '', '', '', 0, 0, 0, 0, 7),

  ('avenue-garden', 'Avenue Garden', 'PurpleBrick', 'Bangalore',
    'Garden-front homes on a tree-lined avenue.',
    '',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1600&q=80',
    '', '', '', 0, 0, 0, 0, 8),

  ('unstoppable-2', 'Unstoppable 2.0', 'Beyond Acres', 'Mysore',
    'Next-generation living for the families of tomorrow.',
    '',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
    '', '', '', 0, 0, 0, 0, 9),

  ('miraya-woods', 'Miraya Woods', 'UKN Realty', 'Mysore',
    'Forest-edge homes with biophilic design.',
    '',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    '', '', '', 0, 0, 0, 0, 10),

  ('belvedere', 'Belvedere', 'UKN Realty', 'Bangalore',
    'A modern landmark for those who value perspective.',
    '',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80',
    '', '', '', 0, 0, 0, 0, 11),

  ('sipani-royal-heritage', 'Sipani Royal Heritage', 'Sipani Properties', 'Bangalore',
    'Heritage-inspired residences with royal scale and modern comfort.',
    '',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
    '', '', '', 0, 0, 0, 0, 12);
