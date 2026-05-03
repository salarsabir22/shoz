-- SaveBite seed (Karachi) — passwords for all test users: password123
-- Run after schema.sql

truncate table impact_logs, reservations, favorites, listings, businesses, users restart identity cascade;

insert into users (id, email, password_hash, name, role, avatar_url) values
  ('c0000001-0001-4000-8001-000000000001', 'customer1@test.com', '$2b$12$1hPNAT86vqi1/0dZxLZUpe/4oKBUSq2qpXY2gqfUi2ntSADtf3RMy', 'Ayesha Khan', 'customer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop'),
  ('c0000001-0001-4000-8001-000000000002', 'customer2@test.com', '$2b$12$1hPNAT86vqi1/0dZxLZUpe/4oKBUSq2qpXY2gqfUi2ntSADtf3RMy', 'Bilal Ahmed', 'customer', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop'),
  ('c0000001-0001-4000-8001-000000000003', 'customer3@test.com', '$2b$12$1hPNAT86vqi1/0dZxLZUpe/4oKBUSq2qpXY2gqfUi2ntSADtf3RMy', 'Sara Malik', 'customer', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop'),
  ('b0000001-0001-4000-8001-000000000001', 'owner1@test.com', '$2b$12$1hPNAT86vqi1/0dZxLZUpe/4oKBUSq2qpXY2gqfUi2ntSADtf3RMy', 'Omar Farooq', 'business', null),
  ('b0000001-0001-4000-8001-000000000002', 'owner2@test.com', '$2b$12$1hPNAT86vqi1/0dZxLZUpe/4oKBUSq2qpXY2gqfUi2ntSADtf3RMy', 'Fatima Raza', 'business', null);

insert into businesses (id, owner_id, name, description, address, lat, lng, category, phone, logo_url, rating, verified) values
  ('d0000001-0001-4000-8001-000000000001', 'b0000001-0001-4000-8001-000000000001', 'Nursery Super Bakers', 'Fresh naan, khatai, and cakes daily.', 'Nursery, PECHS Block 2', 24.8615, 67.0640, 'bakery', '+92 21 3455 0101', null, 4.7, true),
  ('d0000001-0001-4000-8001-000000000002', 'b0000001-0001-4000-8001-000000000001', 'Clifton Chai Stop', 'Karachi chai, paratha rolls, and pastries.', '26th Street, Clifton Block 2', 24.8138, 67.0289, 'cafe', '+92 21 3455 0102', null, 4.5, true),
  ('d0000001-0001-4000-8001-000000000003', 'b0000001-0001-4000-8001-000000000001', 'Boat Basin Grill House', 'BBQ, grilled fish, and rice platters.', 'Boat Basin, Clifton', 24.8142, 67.0305, 'restaurant', '+92 21 3455 0103', null, 4.6, true),
  ('d0000001-0001-4000-8001-000000000004', 'b0000001-0001-4000-8001-000000000001', 'Burns Road Biryani Corner', 'Classic Karachi biryani and kebabs.', 'Burns Road Food Street', 24.8509, 67.0185, 'restaurant', '+92 21 3455 0104', null, 4.4, false),
  ('d0000001-0001-4000-8001-000000000005', 'b0000001-0001-4000-8001-000000000002', 'Zamzama Dough Co', 'Sourdough, croissants, and viennoiserie.', 'Khadda Market, DHA Phase 6', 24.8047, 67.0612, 'bakery', '+92 21 3455 0105', null, 4.8, true),
  ('d0000001-0001-4000-8001-000000000006', 'b0000001-0001-4000-8001-000000000002', 'Tariq Road Samosa King', 'Samosa, chaat, and cold coffee.', 'Tariq Road', 24.8793, 67.0612, 'cafe', '+92 21 3455 0106', null, 4.3, true),
  ('d0000001-0001-4000-8001-000000000007', 'b0000001-0001-4000-8001-000000000002', 'Gulshan Karahi Point', 'Mutton and chicken karahi.', 'Gulshan-e-Iqbal Block 13', 24.9058, 67.0934, 'restaurant', '+92 21 3455 0107', null, 4.5, true),
  ('d0000001-0001-4000-8001-000000000008', 'b0000001-0001-4000-8001-000000000002', 'HyperMart North', 'Organic produce and deli counter.', 'North Nazimabad Block L', 24.9420, 67.0415, 'grocery', '+92 21 3455 0108', null, 4.2, false);

-- Listings: mix pickup windows, quantities, mystery bags, statuses
insert into listings (id, business_id, title, description, category, original_price, current_price, quantity_total, quantity_remaining, pickup_start, pickup_end, photo_url, is_mystery_bag, status) values
  ('e0000001-0001-4000-8001-000000000001', 'd0000001-0001-4000-8001-000000000001', 'Evening naan & paratha pack', '6 naan + paratha mix.', 'bakery', 120.00, 72.00, 8, 6, now() - interval '30 minutes', now() + interval '25 minutes', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000002', 'd0000001-0001-4000-8001-000000000001', 'Jalebi & samosa box', 'Mixed sweets and savoury.', 'bakery', 180.00, 90.00, 5, 2, now() - interval '20 minutes', now() + interval '90 minutes', 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000003', 'd0000001-0001-4000-8001-000000000002', 'Pastry & doodh pati box', 'Chef selection pastries.', 'cafe', 220.00, 110.00, 10, 8, now() - interval '45 minutes', now() + interval '3 hours', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000004', 'd0000001-0001-4000-8001-000000000002', 'Mystery chai & snacks bag', 'Surprise treats.', 'cafe', 150.00, 75.00, 4, 1, now() - interval '15 minutes', now() + interval '40 minutes', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', true, 'active'),
  ('e0000001-0001-4000-8001-000000000005', 'd0000001-0001-4000-8001-000000000003', 'BBQ platter for two', 'Seekh kebab, malai boti, naan.', 'restaurant', 420.00, 210.00, 6, 5, now() - interval '1 hour', now() + interval '2 hours', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000006', 'd0000001-0001-4000-8001-000000000003', 'Grilled pomfret plate', 'Whole fish with salad.', 'restaurant', 580.00, 290.00, 3, 2, now() - interval '10 minutes', now() + interval '70 minutes', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000007', 'd0000001-0001-4000-8001-000000000004', 'Fish fry tiffin', 'Fried fish portion.', 'restaurant', 350.00, 175.00, 7, 7, now() - interval '25 minutes', now() + interval '95 minutes', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000008', 'd0000001-0001-4000-8001-000000000004', 'Mystery seafood bag', 'Chef''s catch of the day.', 'restaurant', 400.00, 200.00, 2, 2, now() - interval '5 minutes', now() + interval '35 minutes', 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800', true, 'active'),
  ('e0000001-0001-4000-8001-000000000009', 'd0000001-0001-4000-8001-000000000005', 'Sourdough loaf trio', 'Three artisan loaves.', 'bakery', 240.00, 120.00, 9, 9, now() - interval '40 minutes', now() + interval '4 hours', 'https://images.unsplash.com/photo-1586444538869-86e37b0ef498?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000010', 'd0000001-0001-4000-8001-000000000005', 'Croissant pack', '6 butter croissants.', 'bakery', 200.00, 100.00, 10, 3, now() - interval '50 minutes', now() + interval '55 minutes', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000011', 'd0000001-0001-4000-8001-000000000006', 'Chaat & bun kebab box', 'Chaat, bun kebab, salad.', 'cafe', 260.00, 130.00, 5, 4, now() - interval '12 minutes', now() + interval '110 minutes', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000012', 'd0000001-0001-4000-8001-000000000006', 'Cold brew growler', '2L cold brew.', 'cafe', 180.00, 90.00, 6, 6, now() - interval '1 hour', now() + interval '3 hours', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000013', 'd0000001-0001-4000-8001-000000000007', 'Daal & haleem combo', 'Two soups to go.', 'restaurant', 140.00, 70.00, 8, 8, now() - interval '20 minutes', now() + interval '80 minutes', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000014', 'd0000001-0001-4000-8001-000000000007', 'Chicken tikka plate', 'Leg piece with naan.', 'restaurant', 320.00, 160.00, 4, 2, now() - interval '8 minutes', now() + interval '28 minutes', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000015', 'd0000001-0001-4000-8001-000000000008', 'Seasonal fruit box', 'Seasonal mix.', 'grocery', 300.00, 150.00, 10, 10, now() - interval '30 minutes', now() + interval '150 minutes', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000016', 'd0000001-0001-4000-8001-000000000002', 'Sold out pastries', 'Was great croissants.', 'cafe', 100.00, 50.00, 5, 0, now() - interval '6 hours', now() - interval '4 hours', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', false, 'sold_out'),
  ('e0000001-0001-4000-8001-000000000017', 'd0000001-0001-4000-8001-000000000003', 'Chef''s tasting (sold)', 'Tasting menu surplus.', 'restaurant', 900.00, 450.00, 2, 0, now() - interval '5 hours', now() - interval '3 hours', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', false, 'sold_out'),
  ('e0000001-0001-4000-8001-000000000018', 'd0000001-0001-4000-8001-000000000005', 'Holiday cake', 'Limited edition.', 'bakery', 500.00, 250.00, 3, 0, now() - interval '8 hours', now() - interval '6 hours', 'https://images.unsplash.com/photo-1606889464200-8e9f04567e2b?w=800', false, 'sold_out'),
  ('e0000001-0001-4000-8001-000000000019', 'd0000001-0001-4000-8001-000000000001', 'Yesterday''s khatai tin', 'Day-old biscuits.', 'bakery', 90.00, 45.00, 10, 4, now() - interval '30 hours', now() - interval '28 hours', 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800', false, 'expired'),
  ('e0000001-0001-4000-8001-000000000020', 'd0000001-0001-4000-8001-000000000004', 'Lunch fish wrap', 'Grilled fish wrap.', 'restaurant', 200.00, 100.00, 6, 1, now() - interval '26 hours', now() - interval '24 hours', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800', false, 'expired');

insert into favorites (customer_id, business_id) values
  ('c0000001-0001-4000-8001-000000000001', 'd0000001-0001-4000-8001-000000000001'),
  ('c0000001-0001-4000-8001-000000000001', 'd0000001-0001-4000-8001-000000000002'),
  ('c0000001-0001-4000-8001-000000000002', 'd0000001-0001-4000-8001-000000000005');

insert into reservations (id, listing_id, customer_id, quantity, total_price, status, reservation_code) values
  ('f0000001-0001-4000-8001-000000000001', 'e0000001-0001-4000-8001-000000000016', 'c0000001-0001-4000-8001-000000000001', 1, 50.00, 'picked_up', 'SAVEB1'),
  ('f0000001-0001-4000-8001-000000000002', 'e0000001-0001-4000-8001-000000000001', 'c0000001-0001-4000-8001-000000000001', 2, 144.00, 'confirmed', 'SAVEB2'),
  ('f0000001-0001-4000-8001-000000000003', 'e0000001-0001-4000-8001-000000000003', 'c0000001-0001-4000-8001-000000000002', 1, 110.00, 'picked_up', 'SAVEB3'),
  ('f0000001-0001-4000-8001-000000000004', 'e0000001-0001-4000-8001-000000000005', 'c0000001-0001-4000-8001-000000000002', 1, 210.00, 'confirmed', 'SAVEB4'),
  ('f0000001-0001-4000-8001-000000000005', 'e0000001-0001-4000-8001-000000000007', 'c0000001-0001-4000-8001-000000000003', 2, 350.00, 'pending', 'SAVEB5'),
  ('f0000001-0001-4000-8001-000000000006', 'e0000001-0001-4000-8001-000000000009', 'c0000001-0001-4000-8001-000000000003', 1, 120.00, 'picked_up', 'SAVEB6'),
  ('f0000001-0001-4000-8001-000000000007', 'e0000001-0001-4000-8001-000000000011', 'c0000001-0001-4000-8001-000000000001', 1, 130.00, 'cancelled', 'SAVEB7'),
  ('f0000001-0001-4000-8001-000000000008', 'e0000001-0001-4000-8001-000000000013', 'c0000001-0001-4000-8001-000000000002', 2, 140.00, 'picked_up', 'SAVEB8'),
  ('f0000001-0001-4000-8001-000000000009', 'e0000001-0001-4000-8001-000000000015', 'c0000001-0001-4000-8001-000000000003', 1, 150.00, 'confirmed', 'SAVEB9'),
  ('f0000001-0001-4000-8001-000000000010', 'e0000001-0001-4000-8001-000000000012', 'c0000001-0001-4000-8001-000000000001', 1, 90.00, 'picked_up', 'SAVE10');

insert into impact_logs (reservation_id, co2_saved_kg, meals_saved, money_saved) values
  ('f0000001-0001-4000-8001-000000000001', 2.5, 1, 50.00),
  ('f0000001-0001-4000-8001-000000000003', 2.5, 1, 110.00),
  ('f0000001-0001-4000-8001-000000000006', 2.5, 1, 120.00),
  ('f0000001-0001-4000-8001-000000000008', 5.0, 2, 70.00),
  ('f0000001-0001-4000-8001-000000000010', 2.5, 1, 90.00);
