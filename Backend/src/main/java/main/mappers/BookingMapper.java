package main.mappers;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import lombok.AllArgsConstructor;
import main.dtos.response.BookingResponse;
import main.entities.Booking;

@Component
@AllArgsConstructor
public class BookingMapper {
    private final ModelMapper mapper;

    public BookingResponse toBookingResponseDto(Booking booking) {
        BookingResponse response = mapper.map(booking, BookingResponse.class);
        
        // Ensure proper date conversion from LocalDateTime to LocalDate
        if (booking.getExpectedReceiveDate() != null) {
            response.setExpectedReceiveDate(booking.getExpectedReceiveDate().toLocalDate());
        }
        if (booking.getExpectedReturnDate() != null) {
            response.setExpectedReturnDate(booking.getExpectedReturnDate().toLocalDate());
        }
        
        return response;
    }
}
