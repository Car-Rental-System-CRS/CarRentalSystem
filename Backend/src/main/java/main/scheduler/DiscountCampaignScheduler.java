package main.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import main.services.DiscountCampaignService;

@Component
@RequiredArgsConstructor
public class DiscountCampaignScheduler {

    private final DiscountCampaignService discountCampaignService;

    @Scheduled(fixedDelay = 60000)
    public void expireFinishedCampaigns() {
        discountCampaignService.expireFinishedCampaigns();
    }
}
