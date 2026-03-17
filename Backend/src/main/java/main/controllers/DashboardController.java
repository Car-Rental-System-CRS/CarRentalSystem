package main.controllers;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.response.DashboardStatsResponse;
import main.services.DashboardService;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') and hasAuthority('DASHBOARD_VIEW')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<APIResponse<DashboardStatsResponse>> getDashboardStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate
    ) {
        if (endDate == null) {
            endDate = Instant.now();
        }
        if (startDate == null) {
            startDate = endDate.minus(365, ChronoUnit.DAYS);
        }
        if (startDate.isAfter(endDate)) {
            startDate = endDate.minus(365, ChronoUnit.DAYS);
        }

        DashboardStatsResponse data = dashboardService.getDashboardStats(startDate, endDate);

        return ResponseEntity.ok(APIResponse.<DashboardStatsResponse>builder()
                .success(true)
                .message("OK")
                .data(data)
                .timestamp(Instant.now())
                .build());
    }
}
