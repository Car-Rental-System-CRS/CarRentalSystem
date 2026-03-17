package main.controllers;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.CreateDiscountCampaignRequest;
import main.dtos.request.GenerateCouponsRequest;
import main.dtos.request.UpdateDiscountCampaignRequest;
import main.dtos.response.CouponResponse;
import main.dtos.response.DiscountCampaignResponse;
import main.dtos.response.PageResponse;
import main.services.DiscountCampaignService;

@RestController
@RequestMapping("/api/admin/discount-campaigns")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') and hasAuthority('DISCOUNT_CAMPAIGN_MANAGE')")
public class DiscountCampaignAdminController {

    private final DiscountCampaignService discountCampaignService;

    @GetMapping
    public ResponseEntity<APIResponse<PageResponse<DiscountCampaignResponse>>> getAllCampaigns(Pageable pageable) {
        Page<DiscountCampaignResponse> page = discountCampaignService.getAllCampaigns(pageable);
        return ResponseEntity.ok(APIResponse.<PageResponse<DiscountCampaignResponse>>builder()
                .success(true)
                .message("OK")
                .data(PageResponse.from(page))
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/{campaignId}")
    public ResponseEntity<APIResponse<DiscountCampaignResponse>> getCampaignById(@PathVariable UUID campaignId) {
        return ResponseEntity.ok(success(discountCampaignService.getCampaignById(campaignId)));
    }

    @PostMapping
    public ResponseEntity<APIResponse<DiscountCampaignResponse>> createCampaign(@RequestBody CreateDiscountCampaignRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(success(discountCampaignService.createCampaign(request)));
    }

    @PutMapping("/{campaignId}")
    public ResponseEntity<APIResponse<DiscountCampaignResponse>> updateCampaign(@PathVariable UUID campaignId, @RequestBody UpdateDiscountCampaignRequest request) {
        return ResponseEntity.ok(success(discountCampaignService.updateCampaign(campaignId, request)));
    }

    @PostMapping("/{campaignId}/activate")
    public ResponseEntity<APIResponse<DiscountCampaignResponse>> activateCampaign(@PathVariable UUID campaignId) {
        return ResponseEntity.ok(success(discountCampaignService.activateCampaign(campaignId)));
    }

    @PostMapping("/{campaignId}/pause")
    public ResponseEntity<APIResponse<DiscountCampaignResponse>> pauseCampaign(@PathVariable UUID campaignId) {
        return ResponseEntity.ok(success(discountCampaignService.pauseCampaign(campaignId)));
    }

    @PostMapping("/{campaignId}/end")
    public ResponseEntity<APIResponse<DiscountCampaignResponse>> endCampaign(@PathVariable UUID campaignId) {
        return ResponseEntity.ok(success(discountCampaignService.endCampaign(campaignId)));
    }

    @PostMapping("/{campaignId}/coupons/generate")
    public ResponseEntity<APIResponse<List<CouponResponse>>> generateCoupons(@PathVariable UUID campaignId, @RequestBody GenerateCouponsRequest request) {
        return ResponseEntity.ok(APIResponse.<List<CouponResponse>>builder()
                .success(true)
                .message("Coupons generated")
                .data(discountCampaignService.generateCoupons(campaignId, request))
                .timestamp(Instant.now())
                .build());
    }

    private APIResponse<DiscountCampaignResponse> success(DiscountCampaignResponse response) {
        return APIResponse.<DiscountCampaignResponse>builder()
                .success(true)
                .message("OK")
                .data(response)
                .timestamp(Instant.now())
                .build();
    }
}
