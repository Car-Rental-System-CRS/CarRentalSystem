-- ==========================================
-- Car Rental System Complete Seeding Script (New Cars & Bookings)
-- ==========================================

-- 1. DELETE EXISTING DATA (Reverse Dependency Order)
DELETE FROM post_trip_inspection_item_media_files;
DELETE FROM post_trip_inspection_items;
DELETE FROM post_trip_inspections;
DELETE FROM payment_transactions;
DELETE FROM booking_car;
DELETE FROM media_files;
DELETE FROM bookings;
DELETE FROM accounts;
DELETE FROM car;
DELETE FROM model_features;
DELETE FROM car_feature;
DELETE FROM car_type;
DELETE FROM car_brand;

-- ==========================================
-- 2. ACCOUNTS
-- ==========================================
-- Password is '123456' encoded with BCrypt
DECLARE @Pwd VARBINARY(MAX) = CAST('$2a$10$w4C3sD8t.rXFh/1R4/O16eVn4M9rA3.X2Wb/SjP7oI9U7.R2Q0A4S' AS VARBINARY(MAX));

INSERT INTO accounts (id, name, email, role, phone, password, created_at, modified_at)
SELECT id, name, email, role, phone, password, created_at, modified_at
FROM (VALUES
('11111111-1111-1111-1111-111111111001', N'John Doe (User)', 'john.doe@example.com', 'USER', '0912345678', @Pwd, GETDATE(), GETDATE()),
('11111111-1111-1111-1111-111111111002', N'Jane Smith (Staff)', 'jane.smith@example.com', 'STAFF', '0987654321', @Pwd, GETDATE(), GETDATE())
) AS v(id, name, email, role, phone, password, created_at, modified_at)
WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.id = v.id);

-- ==========================================
-- 3. CAR BRANDS
-- ==========================================
INSERT INTO car_brand (id, name, created_at, modified_at) VALUES 
('22222222-2222-2222-2222-222222222A01', N'Honda', GETDATE(), GETDATE()),
('22222222-2222-2222-2222-222222222A02', N'Toyota', GETDATE(), GETDATE()),
('22222222-2222-2222-2222-222222222A03', N'Ford', GETDATE(), GETDATE()),
('22222222-2222-2222-2222-222222222A04', N'BMW', GETDATE(), GETDATE()),
('22222222-2222-2222-2222-222222222A05', N'Audi', GETDATE(), GETDATE());

-- ==========================================
-- 4. CAR TYPES
-- ==========================================
INSERT INTO car_type (id, name, number_of_seats, consumption_kwh_per_km, description, price, brand_id, created_at, modified_at) VALUES
('33333333-3333-3333-3333-333333333A01', N'Civic Type R', 4, 0.12, N'Sporty compact car with aggressive styling and high performance.', 800000.00, '22222222-2222-2222-2222-222222222A01', GETDATE(), GETDATE()),
('33333333-3333-3333-3333-333333333A02', N'Camry XSE', 5, 0.14, N'Reliable mid-size sedan with premium features and comfort.', 900000.00, '22222222-2222-2222-2222-222222222A02', GETDATE(), GETDATE()),
('33333333-3333-3333-3333-333333333A03', N'Mustang GT', 4, 0.25, N'Classic American muscle car with a powerful V8 engine.', 1500000.00, '22222222-2222-2222-2222-222222222A03', GETDATE(), GETDATE()),
('33333333-3333-3333-3333-333333333A04', N'3 Series 330i', 5, 0.16, N'Luxury sports sedan offering superior driving dynamics.', 1800000.00, '22222222-2222-2222-2222-222222222A04', GETDATE(), GETDATE()),
('33333333-3333-3333-3333-333333333A05', N'A4 Premium Plus', 5, 0.15, N'Sophisticated compact luxury sedan with progressive technology.', 1700000.00, '22222222-2222-2222-2222-222222222A05', GETDATE(), GETDATE());

-- ==========================================
-- 5. CAR FEATURES
-- ==========================================
INSERT INTO car_feature (id, name, description, created_at, modified_at)
SELECT id, name, description, created_at, modified_at
FROM (VALUES
('55555555-5555-5555-5555-555555555001', N'Autopilot', N'Advanced driver-assistance system', GETDATE(), GETDATE()),
('55555555-5555-5555-5555-555555555002', N'Fast Charging', N'Supports DC fast charging up to 250kW', GETDATE(), GETDATE()),
('55555555-5555-5555-5555-555555555003', N'Panoramic Sunroof', N'Full glass roof', GETDATE(), GETDATE()),
('55555555-5555-5555-5555-555555555004', N'360 Camera', N'Surround view camera system for parking', GETDATE(), GETDATE()),
('55555555-5555-5555-5555-555555555005', N'Heated Seats', N'Front and rear heated seats', GETDATE(), GETDATE()),
('55555555-5555-5555-5555-555555555006', N'Premium Audio', N'High-fidelity sound system', GETDATE(), GETDATE())
) AS v(id, name, description, created_at, modified_at)
WHERE NOT EXISTS (SELECT 1 FROM car_feature f WHERE f.id = v.id);

-- ==========================================
-- 6. MODEL FEATURES (Junction)
-- ==========================================
INSERT INTO model_features (id, type_id, feature_id, created_at, modified_at) VALUES
-- Honda Civic uses: 360 Camera, Premium Audio
(NEWID(), '33333333-3333-3333-3333-333333333A01', '55555555-5555-5555-5555-555555555004', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333A01', '55555555-5555-5555-5555-555555555006', GETDATE(), GETDATE()),

-- Toyota Camry uses: Heated Seats, Panoramic Sunroof, 360 Camera
(NEWID(), '33333333-3333-3333-3333-333333333A02', '55555555-5555-5555-5555-555555555005', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333A02', '55555555-5555-5555-5555-555555555003', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333A02', '55555555-5555-5555-5555-555555555004', GETDATE(), GETDATE()),

-- Mustang uses: Premium Audio, Heated Seats
(NEWID(), '33333333-3333-3333-3333-333333333A03', '55555555-5555-5555-5555-555555555006', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333A03', '55555555-5555-5555-5555-555555555005', GETDATE(), GETDATE()),

-- BMW 3 Series uses: Panoramic Sunroof, Premium Audio, Heated Seats, 360 Camera
(NEWID(), '33333333-3333-3333-3333-333333333A04', '55555555-5555-5555-5555-555555555003', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333A04', '55555555-5555-5555-5555-555555555006', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333A04', '55555555-5555-5555-5555-555555555005', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333A04', '55555555-5555-5555-5555-555555555004', GETDATE(), GETDATE());

-- ==========================================
-- 7. CAR UNITS
-- ==========================================
INSERT INTO car (id, license_plate, import_date, type_id, created_at, modified_at) VALUES
('44444444-4444-4444-4444-444444444A01', '29A-111.11', '2023-01-15', '33333333-3333-3333-3333-333333333A01', GETDATE(), GETDATE()), -- Civic #1
('44444444-4444-4444-4444-444444444A02', '29A-222.22', '2023-01-15', '33333333-3333-3333-3333-333333333A01', GETDATE(), GETDATE()), -- Civic #2
('44444444-4444-4444-4444-444444444A03', '51F-333.33', '2023-03-10', '33333333-3333-3333-3333-333333333A03', GETDATE(), GETDATE()), -- Mustang #1
('44444444-4444-4444-4444-444444444A04', '51G-444.44', '2023-03-10', '33333333-3333-3333-3333-333333333A04', GETDATE(), GETDATE()); -- 3 Series #1

-- ==========================================
-- 8. MEDIA FILES
-- ==========================================
INSERT INTO media_files (id, file_name, file_url, file_type, file_size, description, display_order, media_category, damage_source, car_type_id, car_id, source_booking_id, created_at, modified_at) VALUES
-- Car Type Images (Hero images)
('66666666-6666-6666-6666-666666666A01', 'hero.png', '/uploads/car-types/33333333-3333-3333-3333-333333333A01/hero.png', 'image/png', 500000, 'Honda Civic Front View', 1, 'CAR_TYPE_IMAGE', NULL, '33333333-3333-3333-3333-333333333A01', NULL, NULL, GETDATE(), GETDATE()),
('66666666-6666-6666-6666-666666666A02', 'hero.png', '/uploads/car-types/33333333-3333-3333-3333-333333333A02/hero.png', 'image/png', 500000, 'Toyota Camry Front View', 1, 'CAR_TYPE_IMAGE', NULL, '33333333-3333-3333-3333-333333333A02', NULL, NULL, GETDATE(), GETDATE()),
('66666666-6666-6666-6666-666666666A03', 'hero.png', '/uploads/car-types/33333333-3333-3333-3333-333333333A03/hero.png', 'image/png', 500000, 'Ford Mustang Front View', 1, 'CAR_TYPE_IMAGE', NULL, '33333333-3333-3333-3333-333333333A03', NULL, NULL, GETDATE(), GETDATE()),
('66666666-6666-6666-6666-666666666A04', 'hero.png', '/uploads/car-types/33333333-3333-3333-3333-333333333A04/hero.png', 'image/png', 500000, 'BMW 3 Series Front View', 1, 'CAR_TYPE_IMAGE', NULL, '33333333-3333-3333-3333-333333333A04', NULL, NULL, GETDATE(), GETDATE()),
('66666666-6666-6666-6666-666666666A05', 'hero.png', '/uploads/car-types/33333333-3333-3333-3333-333333333A05/hero.png', 'image/png', 500000, 'Audi A4 Front View', 1, 'CAR_TYPE_IMAGE', NULL, '33333333-3333-3333-3333-333333333A05', NULL, NULL, GETDATE(), GETDATE()),

-- Damage Images (LEGACY_OR_MANUAL)
('66666666-6666-6666-6666-666666666A06', 'bumper_dent.png', '/uploads/cars/44444444-4444-4444-4444-444444444A01/damages/bumper_dent.png', 'image/png', 200000, 'Prior dent on rear bumper, banana for scale', 1, 'CAR_DAMAGE_IMAGE', 'LEGACY_OR_MANUAL', '33333333-3333-3333-3333-333333333A01', '44444444-4444-4444-4444-444444444A01', NULL, GETDATE(), GETDATE()),

-- Post-Trip Inspection Damage Images (Linked to booking 2)
('66666666-6666-6666-6666-666666666A07', 'door_scratch.png', '/uploads/cars/44444444-4444-4444-4444-444444444A03/damages/door_scratch.png', 'image/png', 200000, 'Door scratch found upon return, banana for scale', 1, 'CAR_DAMAGE_IMAGE', 'POST_TRIP_INSPECTION', '33333333-3333-3333-3333-333333333A03', '44444444-4444-4444-4444-444444444A03', '77777777-7777-7777-7777-777777777B02', GETDATE(), GETDATE());

-- ==========================================
-- 9. BOOKINGS
-- ==========================================
INSERT INTO bookings (id, account_id, total_price, booking_price, deposit_amount, remaining_amount, overdue_charge, expected_receive_date, expected_return_date, actual_receive_date, actual_return_date, pickup_notes, return_notes, status, post_trip_inspection_completed, created_at, modified_at) VALUES

-- Booking 1: COMPLETED in January
('77777777-7777-7777-7777-777777777B01', '11111111-1111-1111-1111-111111111001', 2400000.00, 2400000.00, 480000.00, 1920000.00, 0.00, '2026-01-10', '2026-01-13', '2026-01-10', '2026-01-13', 'Car handed over clean', 'Everything fine', 'COMPLETED', 1, GETDATE(), GETDATE()),

-- Booking 2: COMPLETED in February (Returned with new damage)
('77777777-7777-7777-7777-777777777B02', '11111111-1111-1111-1111-111111111001', 4500000.00, 4500000.00, 900000.00, 3600000.00, 0.00, '2026-02-14', '2026-02-17', '2026-02-14', '2026-02-17', 'Clean state', 'Door scratched', 'COMPLETED', 1, GETDATE(), GETDATE()),

-- Booking 3: IN_PROGRESS in March
('77777777-7777-7777-7777-777777777B03', '11111111-1111-1111-1111-111111111001', 5400000.00, 5400000.00, 1080000.00, 4320000.00, 0.00, DATEADD(day, -1, GETDATE()), DATEADD(day, 2, GETDATE()), DATEADD(day, -1, GETDATE()), NULL, 'Picked up', NULL, 'IN_PROGRESS', 0, GETDATE(), GETDATE()),

-- Booking 4: CONFIRMED for April
('77777777-7777-7777-7777-777777777B04', '11111111-1111-1111-1111-111111111001', 1600000.00, 1600000.00, 320000.00, 1280000.00, 0.00, '2026-04-10', '2026-04-12', NULL, NULL, NULL, NULL, 'CONFIRMED', 0, GETDATE(), GETDATE());

-- ==========================================
-- 10. BOOKING_CAR
-- ==========================================
INSERT INTO booking_car (id, booking_id, car_id, created_at, modified_at) VALUES
(NEWID(), '77777777-7777-7777-7777-777777777B01', '44444444-4444-4444-4444-444444444A01', GETDATE(), GETDATE()), -- Booking 1 rents Civic #1
(NEWID(), '77777777-7777-7777-7777-777777777B02', '44444444-4444-4444-4444-444444444A03', GETDATE(), GETDATE()), -- Booking 2 rents Mustang #1
(NEWID(), '77777777-7777-7777-7777-777777777B03', '44444444-4444-4444-4444-444444444A04', GETDATE(), GETDATE()), -- Booking 3 rents 3 Series #1
(NEWID(), '77777777-7777-7777-7777-777777777B04', '44444444-4444-4444-4444-444444444A02', GETDATE(), GETDATE()); -- Booking 4 rents Civic #2

-- ==========================================
-- 11. PAYMENT TRANSACTIONS
-- ==========================================
INSERT INTO payment_transactions (id, booking_id, purpose, payment_method, amount, payospayment_code, status, payment_url, created_at, modified_at) VALUES
-- Booking 1: Deposit (Paid) & Final (Paid)
(NEWID(), '77777777-7777-7777-7777-777777777B01', 'BOOKING_PAYMENT', 'PAYOS', 480000.00, 200000001, 'PAID', 'https://pay.payos.vn/200000001', GETDATE(), GETDATE()),
(NEWID(), '77777777-7777-7777-7777-777777777B01', 'FINAL_PAYMENT', 'PAYOS', 1920000.00, 200000002, 'PAID', 'https://pay.payos.vn/200000002', GETDATE(), GETDATE()),
-- Booking 2: Deposit (Paid) & Final (Paid)
(NEWID(), '77777777-7777-7777-7777-777777777B02', 'BOOKING_PAYMENT', 'PAYOS', 900000.00, 200000003, 'PAID', 'https://pay.payos.vn/200000003', GETDATE(), GETDATE()),
(NEWID(), '77777777-7777-7777-7777-777777777B02', 'FINAL_PAYMENT', 'PAYOS', 3600000.00, 200000004, 'PAID', 'https://pay.payos.vn/200000004', GETDATE(), GETDATE()),
-- Booking 3: Deposit (Paid)
(NEWID(), '77777777-7777-7777-7777-777777777B03', 'BOOKING_PAYMENT', 'PAYOS', 1080000.00, 200000005, 'PAID', 'https://pay.payos.vn/200000005', GETDATE(), GETDATE()),
-- Booking 4: Deposit (Paid)
(NEWID(), '77777777-7777-7777-7777-777777777B04', 'BOOKING_PAYMENT', 'PAYOS', 320000.00, 200000006, 'PAID', 'https://pay.payos.vn/200000006', GETDATE(), GETDATE());

-- ==========================================
-- 12. POST TRIP INSPECTIONS
-- ==========================================
INSERT INTO post_trip_inspections (id, booking_id, inspected_by_account_id, inspected_at, summary_notes, no_additional_damage, completed, created_at, modified_at) VALUES
-- Inspection for Booking 1 (No damage)
('88888888-8888-8888-8888-888888888B01', '77777777-7777-7777-7777-777777777B01', '11111111-1111-1111-1111-111111111002', '2026-01-13', 'Car returned without issues.', 1, 1, GETDATE(), GETDATE()),

-- Inspection for Booking 2 (Damage)
('88888888-8888-8888-8888-888888888B02', '77777777-7777-7777-7777-777777777B02', '11111111-1111-1111-1111-111111111002', '2026-02-17', 'Car returned with a scratch on the door.', 0, 1, GETDATE(), GETDATE());

-- ==========================================
-- 13. POST TRIP INSPECTION ITEMS
-- ==========================================
INSERT INTO post_trip_inspection_items (id, inspection_id, car_id, notes, has_new_damage, uploaded_damage_image_count, created_at, modified_at) VALUES
-- Item for Mustang in Booking 2
('99999999-9999-9999-9999-999999999B02', '88888888-8888-8888-8888-888888888B02', '44444444-4444-4444-4444-444444444A03', 'Door heavily scratched.', 1, 1, GETDATE(), GETDATE());

-- ==========================================
-- 14. POST TRIP INSPECTION ITEM MEDIA FILES (Junction)
-- ==========================================
INSERT INTO post_trip_inspection_item_media_files (inspection_item_id, media_file_id) VALUES
-- Link Mustang inspection item to the damaged door image
('99999999-9999-9999-9999-999999999B02', '66666666-6666-6666-6666-666666666A07');

PRINT 'SEED DATA DIFFERENT CARS SUCCESSFULLY INSERTED.';
