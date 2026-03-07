package main.enums;

public enum PaymentPurpose {
    BOOKING_PAYMENT,      // pay for booking (full or initial)
    FINAL_PAYMENT,        // final payment, calculated after all.
    OVERDUE_PAYMENT       // overdue charge payment
}
