package main.dtos.response;

import java.util.List;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostTripInspectionItemResponse {
    private UUID carId;
    private String licensePlate;
    private boolean hasNewDamage;
    private int uploadedDamageImageCount;
    private String notes;
    private List<MediaFileResponse> damageImages;
}
