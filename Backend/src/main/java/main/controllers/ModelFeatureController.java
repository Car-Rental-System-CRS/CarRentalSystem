package main.controllers;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.ModelFeatureRequest;
import main.dtos.response.ModelFeatureResponse;
import main.services.ModelFeatureService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/model-features")
public class ModelFeatureController {

    private final ModelFeatureService modelFeatureService;

    // ===== ATTACH FEATURE TO TYPE =====
    @PostMapping("/attach")
    public ResponseEntity<APIResponse<Void>> attach(
            @RequestParam UUID typeId,
            @RequestParam UUID featureId
    ) {
        modelFeatureService.attachFeatureToType(typeId, featureId);

        return ResponseEntity.ok(
                APIResponse.<Void>builder()
                        .success(true)
                        .message("Feature attached to car type")
                        .timestamp(Instant.now())
                        .build()
        );
    }

    // ===== REMOVE FEATURE FROM TYPE =====
    @DeleteMapping("/detach")
    public ResponseEntity<APIResponse<Void>> detach(
            @RequestParam UUID typeId,
            @RequestParam UUID featureId
    ) {
        modelFeatureService.removeFeatureFromType(typeId, featureId);

        return ResponseEntity.ok(
                APIResponse.<Void>builder()
                        .success(true)
                        .message("Feature removed from car type")
                        .timestamp(Instant.now())
                        .build()
        );
    }

    // ===== GET FEATURES OF TYPE =====
    @GetMapping("/by-type/{typeId}")
    public ResponseEntity<APIResponse<Page<ModelFeatureResponse>>> getByType(
            @PathVariable UUID typeId,
            Pageable pageable
    ) {
        Page<ModelFeatureResponse> data =
                modelFeatureService.getByType(typeId, pageable);

        return ResponseEntity.ok(
                APIResponse.<Page<ModelFeatureResponse>>builder()
                        .success(true)
                        .message("OK")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    // ===== GET TYPES HAVING FEATURE =====
    @GetMapping("/by-feature/{featureId}")
    public ResponseEntity<APIResponse<Page<ModelFeatureResponse>>> getByFeature(
            @PathVariable UUID featureId,
            Pageable pageable
    ) {
        Page<ModelFeatureResponse> data =
                modelFeatureService.getByFeature(featureId, pageable);

        return ResponseEntity.ok(
                APIResponse.<Page<ModelFeatureResponse>>builder()
                        .success(true)
                        .message("OK")
                        .data(data)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @PostMapping("/attach-bulk")
    public ResponseEntity<APIResponse<Void>> attachBulk(
            @RequestBody ModelFeatureRequest request) {

        modelFeatureService.attachFeaturesBulk(
                request.getTypeId(),
                request.getFeatureIds()
        );

        return ResponseEntity.ok(
                APIResponse.<Void>builder()
                        .success(true)
                        .message("Features attached in bulk")
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @PostMapping("/replace")
    public ResponseEntity<APIResponse<Void>> replace(
            @RequestBody ModelFeatureRequest request) {

        modelFeatureService.replaceFeatures(
                request.getTypeId(),
                request.getFeatureIds()
        );

        return ResponseEntity.ok(
                APIResponse.<Void>builder()
                        .success(true)
                        .message("Features replaced")
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @DeleteMapping("/detach-bulk")
    public ResponseEntity<APIResponse<Void>> detachBulk(
            @RequestBody ModelFeatureRequest request) {

        modelFeatureService.detachFeaturesBulk(
                request.getTypeId(),
                request.getFeatureIds()
        );

        return ResponseEntity.ok(
                APIResponse.<Void>builder()
                        .success(true)
                        .message("Features detached in bulk")
                        .timestamp(Instant.now())
                        .build()
        );
    }

}
