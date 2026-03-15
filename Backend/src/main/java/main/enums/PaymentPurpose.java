package main.enums;

public enum PaymentPurpose {
    BOOKING_PAYMENT,      // pay for booking (full or initial)
    FINAL_PAYMENT,        // post-return settlement (remaining + overdue when applicable)
    OVERDUE_PAYMENT       // legacy purpose: keep for backward compatibility in history/webhooks
}
