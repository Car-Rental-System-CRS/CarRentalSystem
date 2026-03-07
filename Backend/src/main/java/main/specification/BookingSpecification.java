package main.specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.jpa.domain.Specification;

import main.entities.Booking;
import main.enums.BookingStatus;

public class BookingSpecification {

    /**
     * Filter by booking status
     */
    public static Specification<Booking> hasStatus(BookingStatus status) {
        return (root, query, cb) -> {
            if (status == null) return null;
            return cb.equal(root.get("status"), status);
        };
    }

    /**
     * Filter by expected receive date from (inclusive)
     */
    public static Specification<Booking> expectedReceiveDateFrom(LocalDateTime from) {
        return (root, query, cb) -> {
            if (from == null) return null;
            return cb.greaterThanOrEqualTo(root.get("expectedReceiveDate"), from);
        };
    }

    /**
     * Filter by expected return date to (inclusive)
     */
    public static Specification<Booking> expectedReturnDateTo(LocalDateTime to) {
        return (root, query, cb) -> {
            if (to == null) return null;
            return cb.lessThanOrEqualTo(root.get("expectedReturnDate"), to);
        };
    }

    /**
     * Search by customer name or email (case-insensitive LIKE)
     */
    public static Specification<Booking> customerSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return null;
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("account").get("name")), pattern),
                    cb.like(cb.lower(root.get("account").get("email")), pattern)
            );
        };
    }

    /**
     * Filter by minimum total price (inclusive)
     */
    public static Specification<Booking> minPrice(BigDecimal minPrice) {
        return (root, query, cb) -> {
            if (minPrice == null) return null;
            return cb.greaterThanOrEqualTo(root.get("totalPrice"), minPrice);
        };
    }

    /**
     * Filter by maximum total price (inclusive)
     */
    public static Specification<Booking> maxPrice(BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (maxPrice == null) return null;
            return cb.lessThanOrEqualTo(root.get("totalPrice"), maxPrice);
        };
    }
}
