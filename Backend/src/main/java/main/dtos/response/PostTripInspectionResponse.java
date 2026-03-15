package main.dtos.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostTripInspectionResponse {
    private UUID id;
    private UUID bookingId;
    private boolean completed;
    private boolean noAdditionalDamage;
    private String summaryNotes;
    private LocalDateTime inspectedAt;
    private UUID inspectedByAccountId;
    private List<PostTripInspectionItemResponse> items;
}
