package main.enums;

public enum PaymentPurpose {
    BOOKING_PAYMENT,      // pay for booking (full or initial)
    DEPOSIT,              // security deposit
    EXTENSION_FEE,         // extend rental
    DAMAGE_PENALTY,        // damage compensation
    LATE_RETURN_PENALTY,   // late return
    REFUND                // money returned to user
}
