package main.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConfirmPostTripRequest {

    @NotNull(message = "Action is required")
    private Action action; // ACCEPT or DISPUTE

    /** Required when action = DISPUTE */
    private String disputeReason;

    public enum Action {
        ACCEPT, DISPUTE
    }
}