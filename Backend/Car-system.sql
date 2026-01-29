

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        user_id       BIGINT IDENTITY(1,1) PRIMARY KEY,
        email         NVARCHAR(255) NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        full_name     NVARCHAR(150) NULL,
        phone         NVARCHAR(30)  NULL,
        role          NVARCHAR(30)  NOT NULL CONSTRAINT DF_Users_role DEFAULT ('CUSTOMER'),
        is_active     BIT           NOT NULL CONSTRAINT DF_Users_active DEFAULT (1),
        created_at    DATETIME2(0)  NOT NULL CONSTRAINT DF_Users_created DEFAULT (SYSUTCDATETIME()),
        updated_at    DATETIME2(0)  NOT NULL CONSTRAINT DF_Users_updated DEFAULT (SYSUTCDATETIME())
    );

    CREATE UNIQUE INDEX UX_Users_email ON dbo.Users(email);

    ALTER TABLE dbo.Users
    ADD CONSTRAINT CK_Users_role CHECK (role IN ('CUSTOMER','OWNER','ADMIN'));
END
GO


IF OBJECT_ID(N'dbo.PricingTier', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PricingTier (
        pricing_tier_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        tier_name       NVARCHAR(100) NOT NULL,
        price_per_hour  DECIMAL(18,2) NOT NULL CONSTRAINT CK_PT_hour CHECK (price_per_hour >= 0),
        price_per_day   DECIMAL(18,2) NOT NULL CONSTRAINT CK_PT_day  CHECK (price_per_day  >= 0),
        currency        NVARCHAR(10)  NOT NULL CONSTRAINT DF_PT_currency DEFAULT ('VND'),
        created_at      DATETIME2(0)  NOT NULL CONSTRAINT DF_PT_created DEFAULT (SYSUTCDATETIME())
    );

    CREATE UNIQUE INDEX UX_PricingTier_name ON dbo.PricingTier(tier_name);
END
GO

IF OBJECT_ID(N'dbo.PricingTier', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PricingTier (
        pricing_tier_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        tier_name       NVARCHAR(100) NOT NULL,
        price_per_hour  DECIMAL(18,2) NOT NULL CONSTRAINT CK_PT_hour CHECK (price_per_hour >= 0),
        price_per_day   DECIMAL(18,2) NOT NULL CONSTRAINT CK_PT_day  CHECK (price_per_day  >= 0),
        currency        NVARCHAR(10)  NOT NULL CONSTRAINT DF_PT_currency DEFAULT ('VND'),
        created_at      DATETIME2(0)  NOT NULL CONSTRAINT DF_PT_created DEFAULT (SYSUTCDATETIME())
    );

    CREATE UNIQUE INDEX UX_PricingTier_name ON dbo.PricingTier(tier_name);
END
GO

IF OBJECT_ID(N'dbo.Vehicle', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Vehicle (
        vehicle_id       BIGINT IDENTITY(1,1) PRIMARY KEY,
        owner_user_id    BIGINT NOT NULL,
        pricing_tier_id  BIGINT NOT NULL,
        plate_number     NVARCHAR(20)  NOT NULL,
        brand            NVARCHAR(50)  NULL,
        model            NVARCHAR(50)  NULL,
        year             INT           NULL,
        color            NVARCHAR(30)  NULL,
        status           NVARCHAR(30)  NOT NULL CONSTRAINT DF_Vehicle_status DEFAULT ('AVAILABLE'),
        created_at       DATETIME2(0)  NOT NULL CONSTRAINT DF_Vehicle_created DEFAULT (SYSUTCDATETIME())
    );

    CREATE UNIQUE INDEX UX_Vehicle_plate ON dbo.Vehicle(plate_number);

    ALTER TABLE dbo.Vehicle
    ADD CONSTRAINT FK_Vehicle_Owner FOREIGN KEY (owner_user_id)
        REFERENCES dbo.Users(user_id);

    ALTER TABLE dbo.Vehicle
    ADD CONSTRAINT FK_Vehicle_PricingTier FOREIGN KEY (pricing_tier_id)
        REFERENCES dbo.PricingTier(pricing_tier_id);

    ALTER TABLE dbo.Vehicle
    ADD CONSTRAINT CK_Vehicle_status CHECK (status IN ('AVAILABLE','MAINTENANCE','INACTIVE'));
END
GO

IF OBJECT_ID(N'dbo.AvailabilitySlot', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AvailabilitySlot (
        slot_id       BIGINT IDENTITY(1,1) PRIMARY KEY,
        user_id       BIGINT NOT NULL,
        vehicle_id    BIGINT NOT NULL,
        start_time    DATETIME2(0) NOT NULL,
        end_time      DATETIME2(0) NOT NULL,
        status        NVARCHAR(30) NOT NULL CONSTRAINT DF_Slot_status DEFAULT ('OPEN'),
        created_at    DATETIME2(0) NOT NULL CONSTRAINT DF_Slot_created DEFAULT (SYSUTCDATETIME())
    );

    ALTER TABLE dbo.AvailabilitySlot
    ADD CONSTRAINT FK_Slot_User FOREIGN KEY (user_id)
        REFERENCES dbo.Users(user_id);

    ALTER TABLE dbo.AvailabilitySlot
    ADD CONSTRAINT FK_Slot_Vehicle FOREIGN KEY (vehicle_id)
        REFERENCES dbo.Vehicle(vehicle_id);

    ALTER TABLE dbo.AvailabilitySlot
    ADD CONSTRAINT CK_Slot_time CHECK (end_time > start_time);

    ALTER TABLE dbo.AvailabilitySlot
    ADD CONSTRAINT CK_Slot_status CHECK (status IN ('OPEN','BLOCKED','BOOKED'));

    CREATE INDEX IX_Slot_vehicle_time ON dbo.AvailabilitySlot(vehicle_id, start_time, end_time);
END
GO

IF OBJECT_ID(N'dbo.Booking', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Booking (
        booking_id     BIGINT IDENTITY(1,1) PRIMARY KEY,
        user_id        BIGINT NOT NULL,
        vehicle_id     BIGINT NOT NULL,
        start_time     DATETIME2(0) NOT NULL,
        end_time       DATETIME2(0) NOT NULL,
        status         NVARCHAR(30) NOT NULL CONSTRAINT DF_Booking_status DEFAULT ('PENDING'),
        total_amount   DECIMAL(18,2) NOT NULL CONSTRAINT DF_Booking_total DEFAULT (0),
        created_at     DATETIME2(0) NOT NULL CONSTRAINT DF_Booking_created DEFAULT (SYSUTCDATETIME())
    );

    ALTER TABLE dbo.Booking
    ADD CONSTRAINT FK_Booking_User FOREIGN KEY (user_id)
        REFERENCES dbo.Users(user_id);

    ALTER TABLE dbo.Booking
    ADD CONSTRAINT FK_Booking_Vehicle FOREIGN KEY (vehicle_id)
        REFERENCES dbo.Vehicle(vehicle_id);

    ALTER TABLE dbo.Booking
    ADD CONSTRAINT CK_Booking_time CHECK (end_time > start_time);

    ALTER TABLE dbo.Booking
    ADD CONSTRAINT CK_Booking_status CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED'));

    CREATE INDEX IX_Booking_user ON dbo.Booking(user_id, created_at DESC);
    CREATE INDEX IX_Booking_vehicle_time ON dbo.Booking(vehicle_id, start_time, end_time);
END
GO

IF OBJECT_ID(N'dbo.PaymentTransaction', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PaymentTransaction (
        payment_id     BIGINT IDENTITY(1,1) PRIMARY KEY,
        booking_id     BIGINT NOT NULL,
        amount         DECIMAL(18,2) NOT NULL CONSTRAINT CK_Payment_amount CHECK (amount >= 0),
        method         NVARCHAR(30) NOT NULL, -- CARD, CASH, MOMO, VNPAY...
        status         NVARCHAR(30) NOT NULL CONSTRAINT DF_Payment_status DEFAULT ('INIT'),
        provider_ref   NVARCHAR(100) NULL,
        created_at     DATETIME2(0) NOT NULL CONSTRAINT DF_Payment_created DEFAULT (SYSUTCDATETIME())
    );

    ALTER TABLE dbo.PaymentTransaction
    ADD CONSTRAINT FK_Payment_Booking FOREIGN KEY (booking_id)
        REFERENCES dbo.Booking(booking_id);

    ALTER TABLE dbo.PaymentTransaction
    ADD CONSTRAINT CK_Payment_status CHECK (status IN ('INIT','SUCCESS','FAILED','REFUNDED'));

    CREATE INDEX IX_Payment_booking ON dbo.PaymentTransaction(booking_id, created_at DESC);
END
GO

IF OBJECT_ID(N'dbo.DamageReport', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DamageReport (
        damage_report_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        booking_id       BIGINT NOT NULL,
        vehicle_id       BIGINT NOT NULL,
        description      NVARCHAR(1000) NOT NULL,
        severity         NVARCHAR(30) NOT NULL CONSTRAINT DF_Damage_severity DEFAULT ('MINOR'),
        cost_estimate    DECIMAL(18,2) NOT NULL CONSTRAINT DF_Damage_cost DEFAULT (0),
        created_at       DATETIME2(0) NOT NULL CONSTRAINT DF_Damage_created DEFAULT (SYSUTCDATETIME())
    );

    ALTER TABLE dbo.DamageReport
    ADD CONSTRAINT FK_Damage_Booking FOREIGN KEY (booking_id)
        REFERENCES dbo.Booking(booking_id);

    ALTER TABLE dbo.DamageReport
    ADD CONSTRAINT FK_Damage_Vehicle FOREIGN KEY (vehicle_id)
        REFERENCES dbo.Vehicle(vehicle_id);

    ALTER TABLE dbo.DamageReport
    ADD CONSTRAINT CK_Damage_severity CHECK (severity IN ('MINOR','MAJOR','TOTAL'));

    CREATE INDEX IX_Damage_booking ON dbo.DamageReport(booking_id);
END
GO

IF OBJECT_ID(N'dbo.GPSTracking', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.GPSTracking (
        gps_id       BIGINT IDENTITY(1,1) PRIMARY KEY,
        vehicle_id   BIGINT NOT NULL,
        latitude     DECIMAL(10,7) NOT NULL,
        longitude    DECIMAL(10,7) NOT NULL,
        recorded_at  DATETIME2(0) NOT NULL CONSTRAINT DF_GPS_recorded DEFAULT (SYSUTCDATETIME())
    );

    ALTER TABLE dbo.GPSTracking
    ADD CONSTRAINT FK_GPS_Vehicle FOREIGN KEY (vehicle_id)
        REFERENCES dbo.Vehicle(vehicle_id);

    CREATE INDEX IX_GPS_vehicle_time ON dbo.GPSTracking(vehicle_id, recorded_at DESC);
END
GO
