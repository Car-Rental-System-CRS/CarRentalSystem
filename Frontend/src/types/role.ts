export type CustomRole = {
    id: string;
    name: string;
    description?: string;
    baseRole: 'USER' | 'STAFF' | 'ADMIN';
    isDefault: boolean;
    scopes: string[];
    createdAt: string;
    modifiedAt: string;
};

export type AccountAdmin = {
    id: string;
    name: string;
    email: string;
    phone: string;
    baseRole: 'USER' | 'STAFF' | 'ADMIN';
    customRole: {
        id: string;
        name: string;
    } | null;
    createdAt: string;
    modifiedAt: string;
};

// All available scope names
export const STAFF_SCOPES = [
    'CAR_BRAND_VIEW',
    'CAR_BRAND_CREATE',
    'CAR_BRAND_EDIT',
    'CAR_BRAND_DELETE',
    'CAR_FEATURE_VIEW',
    'CAR_FEATURE_CREATE',
    'CAR_FEATURE_EDIT',
    'CAR_FEATURE_DELETE',
    'CAR_TYPE_VIEW',
    'CAR_TYPE_CREATE',
    'CAR_TYPE_EDIT',
    'CAR_TYPE_DELETE',
    'CAR_TYPE_IMAGE_MANAGE',
    'CAR_VIEW',
    'CAR_CREATE',
    'CAR_EDIT',
    'CAR_DELETE',
    'MODEL_FEATURE_MANAGE',
    'BOOKING_MANAGE',
    'PAYMENT_VIEW',
] as const;

export const ADMIN_SCOPES = [
    'DASHBOARD_VIEW',
    'USER_VIEW',
    'USER_EDIT',
    'USER_ROLE_ASSIGN',
    'ROLE_VIEW',
    'ROLE_CREATE',
    'ROLE_EDIT',
    'ROLE_DELETE',
    'DISCOUNT_CAMPAIGN_MANAGE',
] as const;

export const SCOPE_LABELS: Record<string, string> = {
    DASHBOARD_VIEW: 'View Dashboard',
    CAR_BRAND_VIEW: 'View Car Brands',
    CAR_BRAND_CREATE: 'Create Car Brand',
    CAR_BRAND_EDIT: 'Edit Car Brand',
    CAR_BRAND_DELETE: 'Delete Car Brand',
    CAR_FEATURE_VIEW: 'View Car Features',
    CAR_FEATURE_CREATE: 'Create Car Feature',
    CAR_FEATURE_EDIT: 'Edit Car Feature',
    CAR_FEATURE_DELETE: 'Delete Car Feature',
    CAR_TYPE_VIEW: 'View Car Types',
    CAR_TYPE_CREATE: 'Create Car Type',
    CAR_TYPE_EDIT: 'Edit Car Type',
    CAR_TYPE_DELETE: 'Delete Car Type',
    CAR_TYPE_IMAGE_MANAGE: 'Manage Car Type Images',
    CAR_VIEW: 'View Cars',
    CAR_CREATE: 'Create Car',
    CAR_EDIT: 'Edit Car',
    CAR_DELETE: 'Delete Car',
    MODEL_FEATURE_MANAGE: 'Manage Model Features',
    BOOKING_MANAGE: 'Manage Bookings',
    PAYMENT_VIEW: 'View Payments',
    USER_VIEW: 'View Users',
    USER_EDIT: 'Edit Users',
    USER_ROLE_ASSIGN: 'Assign Roles to Users',
    ROLE_VIEW: 'View Roles',
    ROLE_CREATE: 'Create Roles',
    ROLE_EDIT: 'Edit Roles',
    ROLE_DELETE: 'Delete Roles',
    DISCOUNT_CAMPAIGN_MANAGE: 'Manage Discount Campaigns',
};
