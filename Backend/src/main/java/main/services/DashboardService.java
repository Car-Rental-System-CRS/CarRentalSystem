package main.services;

import java.time.Instant;

import main.dtos.response.DashboardStatsResponse;

public interface DashboardService {

    // Returns the admin dashboard payload for the selected reporting period,
    // including business health and discount campaign metrics.
    DashboardStatsResponse getDashboardStats(Instant startDate, Instant endDate);
}
