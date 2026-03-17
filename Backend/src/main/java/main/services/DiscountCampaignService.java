package main.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import main.dtos.request.CreateDiscountCampaignRequest;
import main.dtos.request.GenerateCouponsRequest;
import main.dtos.request.UpdateDiscountCampaignRequest;
import main.dtos.response.CouponResponse;
import main.dtos.response.DiscountCampaignResponse;

public interface DiscountCampaignService {
    Page<DiscountCampaignResponse> getAllCampaigns(Pageable pageable);

    DiscountCampaignResponse getCampaignById(UUID campaignId);

    DiscountCampaignResponse createCampaign(CreateDiscountCampaignRequest request);

    DiscountCampaignResponse updateCampaign(UUID campaignId, UpdateDiscountCampaignRequest request);

    DiscountCampaignResponse activateCampaign(UUID campaignId);

    DiscountCampaignResponse pauseCampaign(UUID campaignId);

    DiscountCampaignResponse endCampaign(UUID campaignId);

    List<CouponResponse> generateCoupons(UUID campaignId, GenerateCouponsRequest request);

    void expireFinishedCampaigns();
}
