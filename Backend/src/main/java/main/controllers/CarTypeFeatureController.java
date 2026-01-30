package main.controllers;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.AddFeaturesToCarTypeRequest;
import main.entities.CarFeature;
import main.services.CarTypeFeatureService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/car-types")
@RequiredArgsConstructor
public class CarTypeFeatureController {
    /*
    private final CarTypeFeatureService carTypeFeatureService;

    @GetMapping("/{typeId}/features")
    public ResponseEntity<APIResponse<List<CarFeature>>> getFeaturesByCarType(@PathVariable UUID typeId) {
        List<CarFeature> features = carTypeFeatureService.getFeaturesByCarTypeId(typeId);
        return ResponseEntity.ok(
                APIResponse.<List<CarFeature>>builder()
                        .success(true)
                        .message("Features retrieved")
                        .data(features)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @PutMapping("/{typeId}/features")
    public ResponseEntity<APIResponse<Object>> replaceFeaturesForCarType(
            @PathVariable UUID typeId,
            @RequestBody AddFeaturesToCarTypeRequest request
    ) {
        carTypeFeatureService.replaceFeaturesForCarType(typeId, request.getFeatureIds());
        return ResponseEntity.ok(
                APIResponse.<Object>builder()
                        .success(true)
                        .message("Features replaced")
                        .timestamp(Instant.now())
                        .build()
        );
    }
    */
}
