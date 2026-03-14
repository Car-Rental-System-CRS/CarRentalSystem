package main.enums;

public enum BookingStatus {
    CREATED,
    CONFIRMED,
    IN_PROGRESS,
    PENDING_OVERDUE,        // overdue charge created, waiting on customer payment
    COMPLETED_OVERDUE,      // car back, ready for condition upload
    PENDING_FINAL_PAYMENT,  // conditions uploaded, final QR generated, awaiting PayOS
    COMPLETED,
    CANCELED
}
//-- Drop the old constraint
//ALTER TABLE bookings
//DROP CONSTRAINT CK_bookings_status;
//
//-- Recreate with all current status values
//ALTER TABLE bookings
//ADD CONSTRAINT CK_bookings_status
//CHECK (status IN (
//               'CREATED',
//    'CONFIRMED',
//               'IN_PROGRESS',
//               'PENDING_OVERDUE',
//               'COMPLETED_OVERDUE',
//               'PENDING_FINAL_PAYMENT',
//               'COMPLETED',
//               'CANCELED'
//        ));