package main.dtos.request;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBookingRequest {
    // Car Type ID (the vehicle model)
    private UUID carTypeId;
    
    // Number of cars to book
    private int quantity;

    // Optional explicit selection from renter flow.
    // If provided, quantity is derived from this list.
    private List<UUID> selectedCarIds;

    private LocalDateTime expectedReceiveDate;
    private LocalDateTime expectedReturnDate;
    
    // If true, return payment URL for immediate payment. If false, pay later option.
    private boolean payNow;
}
