-- ==========================================
-- Car Rental System Complete Seeding Script
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

-- Reset identity columns if any (UUIDs are used here, but good practice)
-- DBCC CHECKIDENT ('table_name', RESEED, 0);

-- ==========================================
-- 2. ACCOUNTS
-- ==========================================
-- Password is '123456' encoded with BCrypt
DECLARE @Pwd VARBINARY(MAX) = CAST('$2a$10$w4C3sD8t.rXFh/1R4/O16eVn4M9rA3.X2Wb/SjP7oI9U7.R2Q0A4S' AS VARBINARY(MAX));

INSERT INTO accounts (id, name, email, role, phone, password, created_at, modified_at) VALUES
('11111111-1111-1111-1111-111111111001', N'John Doe (User)', 'john.doe@example.com', 'USER', '0912345678', @Pwd, GETDATE(), GETDATE()),
('11111111-1111-1111-1111-111111111002', N'Jane Smith (Staff)', 'jane.smith@example.com', 'STAFF', '0987654321', @Pwd, GETDATE(), GETDATE());

-- ==========================================
-- 3. CAR BRANDS
-- ==========================================
INSERT INTO car_brand (id, name, created_at, modified_at) VALUES 
('22222222-2222-2222-2222-222222222001', N'Tesla', GETDATE(), GETDATE()),
('22222222-2222-2222-2222-222222222002', N'VinFast', GETDATE(), GETDATE()),
('22222222-2222-2222-2222-222222222003', N'Hyundai', GETDATE(), GETDATE()),
('22222222-2222-2222-2222-222222222004', N'BYD', GETDATE(), GETDATE()),
('22222222-2222-2222-2222-222222222005', N'Porsche', GETDATE(), GETDATE());

-- ==========================================
-- 4. CAR TYPES
-- ==========================================
INSERT INTO car_type (id, name, number_of_seats, consumption_kwh_per_km, description, price, brand_id, created_at, modified_at) VALUES
('33333333-3333-3333-3333-333333333001', N'Model 3 Long Range', 5, 0.15, N'Sleek electric sedan with unmatched range and autopilot capabilities.', 1200000.00, '22222222-2222-2222-2222-222222222001', GETDATE(), GETDATE()),
('33333333-3333-3333-3333-333333333002', N'VF8 Eco', 5, 0.18, N'Premium D-SUV with modern design and smart features.', 1000000.00, '22222222-2222-2222-2222-222222222002', GETDATE(), GETDATE()),
('33333333-3333-3333-3333-333333333003', N'Ioniq 5', 5, 0.16, N'Retro-futuristic crossover with ultra-fast charging.', 1100000.00, '22222222-2222-2222-2222-222222222003', GETDATE(), GETDATE()),
('33333333-3333-3333-3333-333333333004', N'Atto 3', 5, 0.14, N'Fun, efficient compact SUV perfect for city driving.', 800000.00, '22222222-2222-2222-2222-222222222004', GETDATE(), GETDATE()),
('33333333-3333-3333-3333-333333333005', N'Taycan 4S', 4, 0.22, N'High-performance luxury sports sedan.', 3500000.00, '22222222-2222-2222-2222-222222222005', GETDATE(), GETDATE());

-- ==========================================
-- 5. CAR FEATURES
-- ==========================================
INSERT INTO car_feature (id, name, description, created_at, modified_at) VALUES
('55555555-5555-5555-5555-555555555001', N'Autopilot', N'Advanced driver-assistance system', GETDATE(), GETDATE()),
('55555555-5555-5555-5555-555555555002', N'Fast Charging', N'Supports DC fast charging up to 250kW', GETDATE(), GETDATE()),
('55555555-5555-5555-5555-555555555003', N'Panoramic Sunroof', N'Full glass roof', GETDATE(), GETDATE()),
('55555555-5555-5555-5555-555555555004', N'360 Camera', N'Surround view camera system for parking', GETDATE(), GETDATE()),
('55555555-5555-5555-5555-555555555005', N'Heated Seats', N'Front and rear heated seats', GETDATE(), GETDATE()),
('55555555-5555-5555-5555-555555555006', N'Premium Audio', N'High-fidelity sound system', GETDATE(), GETDATE());

-- ==========================================
-- 6. MODEL FEATURES (Junction)
-- ==========================================
INSERT INTO model_features (id, type_id, feature_id, created_at, modified_at) VALUES
-- Tesla Model 3 uses: Autopilot, Fast Charging, Panoramic Sunroof, Premium Audio
(NEWID(), '33333333-3333-3333-3333-333333333001', '55555555-5555-5555-5555-555555555001', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333001', '55555555-5555-5555-5555-555555555002', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333001', '55555555-5555-5555-5555-555555555003', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333001', '55555555-5555-5555-5555-555555555006', GETDATE(), GETDATE()),

-- VinFast VF8 uses: Autopilot, 360 Camera, Heated Seats
(NEWID(), '33333333-3333-3333-3333-333333333002', '55555555-5555-5555-5555-555555555001', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333002', '55555555-5555-5555-5555-555555555004', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333002', '55555555-5555-5555-5555-555555555005', GETDATE(), GETDATE()),

-- Hyundai Ioniq 5 uses: Fast Charging, 360 Camera, Premium Audio
(NEWID(), '33333333-3333-3333-3333-333333333003', '55555555-5555-5555-5555-555555555002', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333003', '55555555-5555-5555-5555-555555555004', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333003', '55555555-5555-5555-5555-555555555006', GETDATE(), GETDATE()),

-- Porsche Taycan uses: Fast Charging, Premium Audio, Heated Seats, Panoramic Sunroof
(NEWID(), '33333333-3333-3333-3333-333333333005', '55555555-5555-5555-5555-555555555002', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333005', '55555555-5555-5555-5555-555555555006', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333005', '55555555-5555-5555-5555-555555555005', GETDATE(), GETDATE()),
(NEWID(), '33333333-3333-3333-3333-333333333005', '55555555-5555-5555-5555-555555555003', GETDATE(), GETDATE());

-- ==========================================
-- 7. CAR UNITS
-- ==========================================
INSERT INTO car (id, license_plate, import_date, type_id, created_at, modified_at) VALUES
('44444444-4444-4444-4444-444444444001', '30F-123.45', '2023-01-15', '33333333-3333-3333-3333-333333333001', GETDATE(), GETDATE()), -- Model 3 (#1)
('44444444-4444-4444-4444-444444444002', '30F-123.46', '2023-01-15', '33333333-3333-3333-3333-333333333001', GETDATE(), GETDATE()), -- Model 3 (#2)
('44444444-4444-4444-4444-444444444003', '51G-987.65', '2023-03-10', '33333333-3333-3333-3333-333333333002', GETDATE(), GETDATE()), -- VF8 (#1)
('44444444-4444-4444-4444-444444444004', '51G-987.66', '2023-03-10', '33333333-3333-3333-3333-333333333002', GETDATE(), GETDATE()), -- VF8 (#2)
('44444444-4444-4444-4444-444444444005', '43A-555.22', '2023-05-20', '33333333-3333-3333-3333-333333333003', GETDATE(), GETDATE()), -- Ioniq 5 (#1)
('44444444-4444-4444-4444-444444444006', '15A-111.99', '2023-06-01', '33333333-3333-3333-3333-333333333004', GETDATE(), GETDATE()), -- Atto 3 (#1)
('44444444-4444-4444-4444-444444444007', '30H-888.88', '2023-11-11', '33333333-3333-3333-3333-333333333005', GETDATE(), GETDATE()), -- Taycan (#1)
('44444444-4444-4444-4444-444444444008', '51H-999.99', '2023-11-15', '33333333-3333-3333-3333-333333333005', GETDATE(), GETDATE()); -- Taycan (#2)

-- ==========================================
-- 8. MEDIA FILES
-- ==========================================
-- NOTE: The physical files have been placed in Backend/uploads/ matching these paths
INSERT INTO media_files (id, file_name, file_url, file_type, file_size, description, display_order, media_category, damage_source, car_type_id, car_id, source_booking_id, created_at, modified_at) VALUES
-- Car Type Images (Hero images)
('66666666-6666-6666-6666-666666666001', 'tesla-model3-hero.png', '/uploads/car-types/33333333-3333-3333-3333-333333333001/tesla-model3-hero.png', 'image/png', 500000, 'Tesla Model 3 Front View', 1, 'CAR_TYPE_IMAGE', NULL, '33333333-3333-3333-3333-333333333001', NULL, NULL, GETDATE(), GETDATE()),
('66666666-6666-6666-6666-666666666002', 'vinfast-vf8-hero.png', '/uploads/car-types/33333333-3333-3333-3333-333333333002/vinfast-vf8-hero.png', 'image/png', 500000, 'VinFast VF8 Front View', 1, 'CAR_TYPE_IMAGE', NULL, '33333333-3333-3333-3333-333333333002', NULL, NULL, GETDATE(), GETDATE()),
('66666666-6666-6666-6666-666666666003', 'hyundai-ioniq5-hero.png', '/uploads/car-types/33333333-3333-3333-3333-333333333003/hyundai-ioniq5-hero.png', 'image/png', 500000, 'Hyundai Ioniq 5 Front View', 1, 'CAR_TYPE_IMAGE', NULL, '33333333-3333-3333-3333-333333333003', NULL, NULL, GETDATE(), GETDATE()),
('66666666-6666-6666-6666-666666666004', 'byd-atto3-hero.png', '/uploads/car-types/33333333-3333-3333-3333-333333333004/byd-atto3-hero.png', 'image/png', 500000, 'BYD Atto 3 Front View', 1, 'CAR_TYPE_IMAGE', NULL, '33333333-3333-3333-3333-333333333004', NULL, NULL, GETDATE(), GETDATE()),
('66666666-6666-6666-6666-666666666005', 'porsche-taycan-hero.png', '/uploads/car-types/33333333-3333-3333-3333-333333333005/porsche-taycan-hero.png', 'image/png', 500000, 'Porsche Taycan Front View', 1, 'CAR_TYPE_IMAGE', NULL, '33333333-3333-3333-3333-333333333005', NULL, NULL, GETDATE(), GETDATE()),

-- Existing Damage Images (LEGACY_OR_MANUAL)
('66666666-6666-6666-6666-666666666006', 'scratch-door.png', '/uploads/cars/44444444-4444-4444-4444-444444444001/damages/scratch-door.png', 'image/png', 200000, 'Prior scratch on left door', 1, 'CAR_DAMAGE_IMAGE', 'LEGACY_OR_MANUAL', '33333333-3333-3333-3333-333333333001', '44444444-4444-4444-4444-444444444001', NULL, GETDATE(), GETDATE()),
('66666666-6666-6666-6666-666666666007', 'dent-bumper.png', '/uploads/cars/44444444-4444-4444-4444-444444444002/damages/dent-bumper.png', 'image/png', 200000, 'Prior dent on rear bumper', 1, 'CAR_DAMAGE_IMAGE', 'LEGACY_OR_MANUAL', '33333333-3333-3333-3333-333333333001', '44444444-4444-4444-4444-444444444002', NULL, GETDATE(), GETDATE()),

-- Post-Trip Inspection Damage Images (Linked to booking 1)
('66666666-6666-6666-6666-666666666008', 'cracked-mirror.png', '/uploads/cars/44444444-4444-4444-4444-444444444003/damages/cracked-mirror.png', 'image/png', 200000, 'Cracked mirror found upon return', 1, 'CAR_DAMAGE_IMAGE', 'POST_TRIP_INSPECTION', '33333333-3333-3333-3333-333333333002', '44444444-4444-4444-4444-444444444003', '77777777-7777-7777-7777-777777777001', GETDATE(), GETDATE());

-- ==========================================
-- 9. BOOKINGS
-- ==========================================
INSERT INTO bookings (id, account_id, total_price, booking_price, deposit_amount, remaining_amount, overdue_charge, expected_receive_date, expected_return_date, actual_receive_date, actual_return_date, pickup_notes, return_notes, status, post_trip_inspection_completed, created_at, modified_at) VALUES

-- Booking 1: COMPLETED (Returned with new damage)
('77777777-7777-7777-7777-777777777001', '11111111-1111-1111-1111-111111111001', 3000000.00, 3000000.00, 600000.00, 2400000.00, 0.00, DATEADD(day, -5, GETDATE()), DATEADD(day, -2, GETDATE()), DATEADD(day, -5, GETDATE()), DATEADD(day, -2, GETDATE()), 'Car handed over clean', 'Minor crack on mirror noticed', 'COMPLETED', 1, GETDATE(), GETDATE()),

-- Booking 2: IN_PROGRESS (Currently rented out)
('77777777-7777-7777-7777-777777777002', '11111111-1111-1111-1111-111111111001', 3600000.00, 3600000.00, 720000.00, 2880000.00, 0.00, DATEADD(day, -1, GETDATE()), DATEADD(day, 2, GETDATE()), DATEADD(day, -1, GETDATE()), NULL, 'Customer picked up on time', NULL, 'IN_PROGRESS', 0, GETDATE(), GETDATE()),

-- Booking 3: CONFIRMED (Upcoming)
('77777777-7777-7777-7777-777777777003', '11111111-1111-1111-1111-111111111001', 7000000.00, 7000000.00, 1400000.00, 5600000.00, 0.00, DATEADD(day, 5, GETDATE()), DATEADD(day, 7, GETDATE()), NULL, NULL, NULL, NULL, 'CONFIRMED', 0, GETDATE(), GETDATE());

-- ==========================================
-- 10. BOOKING_CAR
-- ==========================================
INSERT INTO booking_car (id, booking_id, car_id, created_at, modified_at) VALUES
-- Booking 1 rents VF8 #1
(NEWID(), '77777777-7777-7777-7777-777777777001', '44444444-4444-4444-4444-444444444003', GETDATE(), GETDATE()),
-- Booking 2 rents Model 3 #1
(NEWID(), '77777777-7777-7777-7777-777777777002', '44444444-4444-4444-4444-444444444001', GETDATE(), GETDATE()),
-- Booking 3 rents Taycan #1
(NEWID(), '77777777-7777-7777-7777-777777777003', '44444444-4444-4444-4444-444444444007', GETDATE(), GETDATE());

-- ==========================================
-- 11. PAYMENT TRANSACTIONS
-- ==========================================
INSERT INTO payment_transactions (id, booking_id, purpose, payment_method, amount, payospayment_code, status, payment_url, created_at, modified_at) VALUES
-- Booking 1: Deposit (Paid)
(NEWID(), '77777777-7777-7777-7777-777777777001', 'BOOKING_PAYMENT', 'PAYOS', 600000.00, 100000001, 'PAID', 'https://pay.payos.vn/100000001', GETDATE(), GETDATE()),
-- Booking 1: Final Payment (Paid)
(NEWID(), '77777777-7777-7777-7777-777777777001', 'FINAL_PAYMENT', 'PAYOS', 2400000.00, 100000002, 'PAID', 'https://pay.payos.vn/100000002', GETDATE(), GETDATE()),
-- Booking 2: Deposit (Paid)
(NEWID(), '77777777-7777-7777-7777-777777777002', 'BOOKING_PAYMENT', 'PAYOS', 720000.00, 100000003, 'PAID', 'https://pay.payos.vn/100000003', GETDATE(), GETDATE()),
-- Booking 3: Deposit (Paid)
(NEWID(), '77777777-7777-7777-7777-777777777003', 'BOOKING_PAYMENT', 'PAYOS', 1400000.00, 100000004, 'PAID', 'https://pay.payos.vn/100000004', GETDATE(), GETDATE());

-- ==========================================
-- 12. POST TRIP INSPECTIONS
-- ==========================================
INSERT INTO post_trip_inspections (id, booking_id, inspected_by_account_id, inspected_at, summary_notes, no_additional_damage, completed, created_at, modified_at) VALUES
-- Inspection for Booking 1
('88888888-8888-8888-8888-888888888001', '77777777-7777-7777-7777-777777777001', '11111111-1111-1111-1111-111111111002', DATEADD(day, -2, GETDATE()), 'Car returned with a cracked side mirror, requiring replacement.', 0, 1, GETDATE(), GETDATE());

-- ==========================================
-- 13. POST TRIP INSPECTION ITEMS
-- ==========================================
INSERT INTO post_trip_inspection_items (id, inspection_id, car_id, notes, has_new_damage, uploaded_damage_image_count, created_at, modified_at) VALUES
-- Item for VF8 #1 in Booking 1
('99999999-9999-9999-9999-999999999001', '88888888-8888-8888-8888-888888888001', '44444444-4444-4444-4444-444444444003', 'Passenger side mirror cracked.', 1, 1, GETDATE(), GETDATE());

-- ==========================================
-- 14. POST TRIP INSPECTION ITEM MEDIA FILES (Junction)
-- ==========================================
INSERT INTO post_trip_inspection_item_media_files (inspection_item_id, media_file_id) VALUES
-- Link VF8 inspection item to the cracked mirror damage image
('99999999-9999-9999-9999-999999999001', '66666666-6666-6666-6666-666666666008');

PRINT 'SEED DATA SUCCESSFULLY INSERTED.';
