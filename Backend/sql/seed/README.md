# Car Rental System Seed Data

This directory contains the database seed script to populate the `ev_rental` SQL Server database with initial test data.

## What's Included

The `seed_all.sql` script populates the following 14 tables in the correct dependency order:
1. `car_brand` (5 brands: Tesla, VinFast, Hyundai, BYD, Porsche)
2. `car_type` (5 types: Model 3, VF8, Ioniq 5, Atto 3, Taycan)
3. `car_feature` (6 EV-specific features)
4. `model_features` (Feature-to-type assignments)
5. `car` (8 specific car units with license plates)
6. `accounts` (2 users: 1 standard USER, 1 STAFF member)
7. `media_files` (Hero images for the 5 car types and 3 damage photos for specific cars)
8. `bookings` (3 bookings in different statuses)
9. `booking_car` (Car assignments to bookings)
10. `payment_transactions` (Payment records related to bookings)
11. `post_trip_inspections` (Inspection details for completed bookings)
12. `post_trip_inspection_items` (Per-car inspection items)
13. `post_trip_inspection_item_media_files` (Junction table linking damage photos)

The associated AI-generated image files have already been placed in the `Backend/uploads` directory.

## How to Run

You can execute the `seed_all.sql` script against your SQL Server instance using one of the following methods:

**Method 1: SQL Server Management Studio (SSMS) or Azure Data Studio**
1. Open SSMS or Azure Data Studio and connect to your SQL Server `localhost:1433`.
2. Open the `ev_rental` database.
3. Open `seed_all.sql` and click **Execute**.

**Method 2: Command Line (sqlcmd)**
If you have `sqlcmd` installed:
```bash
sqlcmd -S localhost,1433 -d ev_rental -U sa -P 1234567890 -i seed_all.sql
```

**Note:** The script will first DELETE existing data in these tables before inserting the new rows, ensuring a clean state.
