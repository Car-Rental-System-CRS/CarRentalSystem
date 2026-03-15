package main.dtos.request;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StaffPostTripInspectionRequest {
    private boolean noAdditionalDamage;
    private String summaryNotes;
    private List<StaffPostTripInspectionItemRequest> items;
}
