package main.dtos.request;

import java.util.List;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StaffPostTripInspectionItemRequest {
    private UUID carId;
    private String notes;
    private boolean hasNewDamage;
    private Integer uploadedDamageImageCount;
    private List<UUID> damageImageIds;
}
