package main.enums;

public enum BookingStatus {
    CREATED,
    CONFIRMED,
    IN_PROGRESS,
    COMPLETED,
    CANCELED,
    //FLow 2 - return vehicle
    RETURNED,                  // vehicle physically back, return timestamp recorded
    PENDING_USER_CONFIRMATION, // post-trip report uploaded, user must accept/dispute
    DISPUTED,                  // user disputed report — staff resolves
    PENDING_PAYMENT            // user accepted, waiting for payment (QR or cash)
}
/// -- Step 1: Drop the old constraint (name from your error message)
/// ALTER TABLE bookings
/// DROP CONSTRAINT CK__bookings__status__3C69FB99;
/// -- Step 2: Recreate it with all status values including the new ones
/// ALTER TABLE bookings
/// ADD CONSTRAINT CK_bookings_status CHECK (status IN (
///     'CREATED',
///     'CONFIRMED',
///     'IN_PROGRESS',
///     'COMPLETED',
///     'CANCELED',
///     'RETURNED',
///     'PENDING_USER_CONFIRMATION',
///     'DISPUTED',
///     'PENDING_PAYMENT'
/// ));
