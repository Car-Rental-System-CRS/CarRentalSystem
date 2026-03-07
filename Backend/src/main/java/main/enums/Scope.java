package main.enums;

public enum Scope {
    // ── STAFF layout scopes ──────────────────────────
    CAR_BRAND_VIEW,
    CAR_BRAND_CREATE,
    CAR_BRAND_EDIT,
    CAR_BRAND_DELETE,

    CAR_FEATURE_VIEW,
    CAR_FEATURE_CREATE,
    CAR_FEATURE_EDIT,
    CAR_FEATURE_DELETE,

    CAR_TYPE_VIEW,
    CAR_TYPE_CREATE,
    CAR_TYPE_EDIT,
    CAR_TYPE_DELETE,
    CAR_TYPE_IMAGE_MANAGE,

    CAR_VIEW,
    CAR_CREATE,
    CAR_EDIT,
    CAR_DELETE,

    MODEL_FEATURE_MANAGE,

    BOOKING_MANAGE,
    PAYMENT_VIEW,

    // ── ADMIN layout scopes ──────────────────────────
    DASHBOARD_VIEW,

    USER_VIEW,
    USER_EDIT,
    USER_ROLE_ASSIGN,

    ROLE_VIEW,
    ROLE_CREATE,
    ROLE_EDIT,
    ROLE_DELETE;

    /**
     * Returns true if this scope belongs to the STAFF base role.
     */
    public boolean isStaffScope() {
        return this.ordinal() <= PAYMENT_VIEW.ordinal();
    }

    /**
     * Returns true if this scope belongs to the ADMIN base role.
     */
    public boolean isAdminScope() {
        return this.ordinal() >= DASHBOARD_VIEW.ordinal();
    }
}
