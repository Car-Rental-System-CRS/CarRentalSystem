package main.enums;

public enum PostTripConfirmationStatus {
    /** Staff uploaded condition report — waiting for user to review */
    PENDING_USER,
    /** User accepted the report — proceed to payment */
    ACCEPTED,
    /** User disputed — requires manual staff resolution before payment */
    DISPUTED
}