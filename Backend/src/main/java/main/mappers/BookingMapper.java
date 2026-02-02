package main.mappers;

import lombok.AllArgsConstructor;
import main.dtos.response.BookingResponse;
import main.entities.Booking;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class BookingMapper {
    private final ModelMapper mapper;

    public BookingResponse toBookingResponseDto(Booking booking) {
        return mapper.map(booking, BookingResponse.class);
    }
}
