-- SaveBite seed (Istanbul) — passwords for all test users: password123
-- Run after schema.sql

truncate table impact_logs, reservations, favorites, listings, businesses, users restart identity cascade;

insert into users (id, email, password_hash, name, role, avatar_url) values
  ('c0000001-0001-4000-8001-000000000001', 'customer1@test.com', '$2b$12$1hPNAT86vqi1/0dZxLZUpe/4oKBUSq2qpXY2gqfUi2ntSADtf3RMy', 'Ayşe Yılmaz', 'customer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop'),
  ('c0000001-0001-4000-8001-000000000002', 'customer2@test.com', '$2b$12$1hPNAT86vqi1/0dZxLZUpe/4oKBUSq2qpXY2gqfUi2ntSADtf3RMy', 'Mehmet Kaya', 'customer', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop'),
  ('c0000001-0001-4000-8001-000000000003', 'customer3@test.com', '$2b$12$1hPNAT86vqi1/0dZxLZUpe/4oKBUSq2qpXY2gqfUi2ntSADtf3RMy', 'Zeynep Demir', 'customer', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop'),
  ('b0000001-0001-4000-8001-000000000001', 'owner1@test.com', '$2b$12$1hPNAT86vqi1/0dZxLZUpe/4oKBUSq2qpXY2gqfUi2ntSADtf3RMy', 'Can Arslan', 'business', null),
  ('b0000001-0001-4000-8001-000000000002', 'owner2@test.com', '$2b$12$1hPNAT86vqi1/0dZxLZUpe/4oKBUSq2qpXY2gqfUi2ntSADtf3RMy', 'Elif Şahin', 'business', null);

insert into businesses (id, owner_id, name, description, address, lat, lng, category, phone, logo_url, rating, verified) values
  ('d0000001-0001-4000-8001-000000000001', 'b0000001-0001-4000-8001-000000000001', 'Karaköy Simit Sarayı', 'Fresh simit and börek daily.', 'Kemankeş Karamustafa Paşa, Karaköy', 41.0232, 28.9756, 'bakery', '+90 212 555 0101', null, 4.7, true),
  ('d0000001-0001-4000-8001-000000000002', 'b0000001-0001-4000-8001-000000000001', 'Moda Kahvesi', 'Third-wave coffee and pastries.', 'Caferağa Mah., Moda Cd., Kadıköy', 41.0012, 29.0274, 'cafe', '+90 216 555 0102', null, 4.5, true),
  ('d0000001-0001-4000-8001-000000000003', 'b0000001-0001-4000-8001-000000000001', 'Nişantaşı Lokanta', 'Modern Turkish plates.', 'Teşvikiye, Nişantaşı', 41.0478, 28.9851, 'restaurant', '+90 212 555 0103', null, 4.6, true),
  ('d0000001-0001-4000-8001-000000000004', 'b0000001-0001-4000-8001-000000000001', 'Beşiktaş Balıkçısı', 'Seafood and meze.', 'Sinanpaşa, Beşiktaş', 41.0422, 29.0089, 'restaurant', '+90 212 555 0104', null, 4.4, false),
  ('d0000001-0001-4000-8001-000000000005', 'b0000001-0001-4000-8001-000000000002', 'Galata Fırın', 'Sourdough and viennoiserie.', 'Bereketzade, Galata', 41.0257, 28.9741, 'bakery', '+90 212 555 0105', null, 4.8, true),
  ('d0000001-0001-4000-8001-000000000006', 'b0000001-0001-4000-8001-000000000002', 'Cihangir Bagel House', 'Hand-rolled bagels and spreads.', 'Cihangir Mah., Beyoğlu', 41.0344, 28.9827, 'cafe', '+90 212 555 0106', null, 4.3, true),
  ('d0000001-0001-4000-8001-000000000007', 'b0000001-0001-4000-8001-000000000002', 'Kadıköy Çorbacısı', 'Slow-cooked soups and stews.', 'Osmanağa, Kadıköy', 40.9903, 29.0251, 'restaurant', '+90 216 555 0107', null, 4.5, true),
  ('d0000001-0001-4000-8001-000000000008', 'b0000001-0001-4000-8001-000000000002', 'Şişli Organik Market', 'Organic produce and deli.', 'Halaskargazi, Şişli', 41.0602, 28.9874, 'grocery', '+90 212 555 0108', null, 4.2, false);

-- Listings: mix pickup windows, quantities, mystery bags, statuses
insert into listings (id, business_id, title, description, category, original_price, current_price, quantity_total, quantity_remaining, pickup_start, pickup_end, photo_url, is_mystery_bag, status) values
  ('e0000001-0001-4000-8001-000000000001', 'd0000001-0001-4000-8001-000000000001', 'Evening Simit Bundle', '6 simit + sesame mix.', 'bakery', 120.00, 72.00, 8, 6, now() - interval '30 minutes', now() + interval '25 minutes', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000002', 'd0000001-0001-4000-8001-000000000001', 'Börek Assortment', 'Cheese and spinach börek.', 'bakery', 180.00, 90.00, 5, 2, now() - interval '20 minutes', now() + interval '90 minutes', 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000003', 'd0000001-0001-4000-8001-000000000002', 'Pastry & Latte Box', 'Chef selection pastries.', 'cafe', 220.00, 110.00, 10, 8, now() - interval '45 minutes', now() + interval '3 hours', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000004', 'd0000001-0001-4000-8001-000000000002', 'Mystery Coffee Bag', 'Surprise beans and treats.', 'cafe', 150.00, 75.00, 4, 1, now() - interval '15 minutes', now() + interval '40 minutes', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', true, 'active'),
  ('e0000001-0001-4000-8001-000000000005', 'd0000001-0001-4000-8001-000000000003', 'Meyhane Meze Platter', '8 cold meze.', 'restaurant', 420.00, 210.00, 6, 5, now() - interval '1 hour', now() + interval '2 hours', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000006', 'd0000001-0001-4000-8001-000000000003', 'Grilled Sea Bass', 'Whole fish with salad.', 'restaurant', 580.00, 290.00, 3, 2, now() - interval '10 minutes', now() + interval '70 minutes', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000007', 'd0000001-0001-4000-8001-000000000004', 'Balık Tava', 'Fried fish portion.', 'restaurant', 350.00, 175.00, 7, 7, now() - interval '25 minutes', now() + interval '95 minutes', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000008', 'd0000001-0001-4000-8001-000000000004', 'Mystery Seafood Bag', 'Chef''s catch of the day.', 'restaurant', 400.00, 200.00, 2, 2, now() - interval '5 minutes', now() + interval '35 minutes', 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800', true, 'active'),
  ('e0000001-0001-4000-8001-000000000009', 'd0000001-0001-4000-8001-000000000005', 'Sourdough Loaf Trio', 'Three artisan loaves.', 'bakery', 240.00, 120.00, 9, 9, now() - interval '40 minutes', now() + interval '4 hours', 'https://images.unsplash.com/photo-1586444538869-86e37b0ef498?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000010', 'd0000001-0001-4000-8001-000000000005', 'Croissant Pack', '6 butter croissants.', 'bakery', 200.00, 100.00, 10, 3, now() - interval '50 minutes', now() + interval '55 minutes', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000011', 'd0000001-0001-4000-8001-000000000006', 'Bagel Brunch Box', 'Bagels, spreads, salad.', 'cafe', 260.00, 130.00, 5, 4, now() - interval '12 minutes', now() + interval '110 minutes', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000012', 'd0000001-0001-4000-8001-000000000006', 'Cold Brew Growler', '2L cold brew.', 'cafe', 180.00, 90.00, 6, 6, now() - interval '1 hour', now() + interval '3 hours', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000013', 'd0000001-0001-4000-8001-000000000007', 'Mercimek & Ezogelin', 'Two soups to go.', 'restaurant', 140.00, 70.00, 8, 8, now() - interval '20 minutes', now() + interval '80 minutes', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000014', 'd0000001-0001-4000-8001-000000000007', 'İskender Plate', 'Doner with butter tomato sauce.', 'restaurant', 320.00, 160.00, 4, 2, now() - interval '8 minutes', now() + interval '28 minutes', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000015', 'd0000001-0001-4000-8001-000000000008', 'Organic Fruit Box', 'Seasonal mix.', 'grocery', 300.00, 150.00, 10, 10, now() - interval '30 minutes', now() + interval '150 minutes', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800', false, 'active'),
  ('e0000001-0001-4000-8001-000000000016', 'd0000001-0001-4000-8001-000000000002', 'Sold Out Pastries', 'Was great croissants.', 'cafe', 100.00, 50.00, 5, 0, now() - interval '6 hours', now() - interval '4 hours', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', false, 'sold_out'),
  ('e0000001-0001-4000-8001-000000000017', 'd0000001-0001-4000-8001-000000000003', 'Chef''s Tasting (Sold)', 'Tasting menu surplus.', 'restaurant', 900.00, 450.00, 2, 0, now() - interval '5 hours', now() - interval '3 hours', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', false, 'sold_out'),
  ('e0000001-0001-4000-8001-000000000018', 'd0000001-0001-4000-8001-000000000005', 'Holiday Panettone', 'Limited edition.', 'bakery', 500.00, 250.00, 3, 0, now() - interval '8 hours', now() - interval '6 hours', 'https://images.unsplash.com/photo-1606889464200-8e9f04567e2b?w=800', false, 'sold_out'),
  ('e0000001-0001-4000-8001-000000000019', 'd0000001-0001-4000-8001-000000000001', 'Yesterday''s Poğaça', 'Cheese poğaça — day old.', 'bakery', 90.00, 45.00, 10, 4, now() - interval '30 hours', now() - interval '28 hours', 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800', false, 'expired'),
  ('e0000001-0001-4000-8001-000000000020', 'd0000001-0001-4000-8001-000000000004', 'Lunch Fish Wrap', 'Grilled fish wrap.', 'restaurant', 200.00, 100.00, 6, 1, now() - interval '26 hours', now() - interval '24 hours', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800', false, 'expired');

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
