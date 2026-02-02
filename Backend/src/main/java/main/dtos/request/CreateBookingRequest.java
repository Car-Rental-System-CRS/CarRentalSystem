package main.dtos.request;

import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBookingRequest {


    // Car IDs (many cars per booking)
    // TODO: replace UUID with CarId / Car entity when Car module is ready
    //private List<UUID> carIds;

    private LocalDate expectedReceiveDate;
    private LocalDate expectedReturnDate;
}
