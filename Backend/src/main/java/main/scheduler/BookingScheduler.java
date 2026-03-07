package main.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import main.entities.Booking;
import main.enums.BookingStatus;
import main.repositories.BookingRepository;

@Component
@RequiredArgsConstructor
public class BookingScheduler {

    private static final Logger log = LoggerFactory.getLogger(BookingScheduler.class);

    private final BookingRepository bookingRepository;

    /**
     * Runs every hour. Cancels CONFIRMED bookings whose expected pickup date
     * is more than 1 day in the past (renter never showed up).
     */
    @Scheduled(fixedRate = 3600000) // every hour
    @Transactional
    public void autoCancelOverduePickups() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(1);

        List<Booking> overdueBookings =
                bookingRepository.findConfirmedBookingsBeforePickupCutoff(cutoff);

        for (Booking booking : overdueBookings) {
            booking.setStatus(BookingStatus.CANCELED);
            bookingRepository.save(booking);
            log.info("Auto-cancelled booking {} — pickup overdue by 1+ day (expected: {})",
                    booking.getId(), booking.getExpectedReceiveDate());
        }

        if (!overdueBookings.isEmpty()) {
            log.info("Auto-cancelled {} overdue booking(s)", overdueBookings.size());
        }
    }
}
