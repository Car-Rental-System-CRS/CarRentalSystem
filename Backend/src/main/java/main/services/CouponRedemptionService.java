package main.services;

import java.math.BigDecimal;
import java.util.UUID;

import main.dtos.request.BookingCouponValidationRequest;
import main.dtos.response.BookingCouponValidationResponse;
import main.entities.Booking;

public interface CouponRedemptionService {
    BookingCouponValidationResponse validateCoupon(BookingCouponValidationRequest request, UUID accountId);

    BookingCouponValidationResponse consumeCouponForBooking(String couponCode, Booking booking, UUID accountId, BigDecimal originalTotal);
}
