package main.services;

import java.time.Instant;

import main.dtos.response.DashboardStatsResponse;

public interface DashboardService {
    DashboardStatsResponse getDashboardStats(Instant startDate, Instant endDate);
}
