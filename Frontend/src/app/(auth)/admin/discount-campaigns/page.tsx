'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ScopeGuard from '@/components/ScopeGuard';
import { discountCampaignService } from '@/services/discountCampaignService';
import {
  CouponSummary,
  CreateDiscountCampaignRequest,
  DiscountCampaign,
} from '@/types/discountCampaign';
import DiscountCampaignForm from './components/DiscountCampaignForm';
import DiscountCampaignTable from './components/DiscountCampaignTable';
import CouponPanel from './components/CouponPanel';

const EMPTY_FORM: CreateDiscountCampaignRequest = {
  name: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  minimumBookingAmount: null,
  maximumDiscountAmount: null,
  validFrom: '',
  validUntil: '',
  targetingMode: 'ALL_RENTERS',
  targetAccountIds: [],
  couponQuantity: 100,
  usageLimitPerCoupon: 1,
};

const toDateTimeLocal = (value: string) => value ? value.slice(0, 16) : '';

export default function DiscountCampaignsPage() {
  const [campaigns, setCampaigns] = useState<DiscountCampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<DiscountCampaign | null>(null);
  const [coupons, setCoupons] = useState<CouponSummary[]>([]);
  const [form, setForm] = useState<CreateDiscountCampaignRequest>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? null,
    [campaigns, selectedCampaignId]
  );

  const loadCampaigns = async () => {
    const data = await discountCampaignService.getAll({ page: 0, size: 50 });
    setCampaigns(data.items);
  };

  useEffect(() => {
    loadCampaigns().catch(() => {
      toast.error('Failed to load discount campaigns');
    });
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingCampaign) {
        await discountCampaignService.update(editingCampaign.id, form);
        toast.success('Discount campaign updated');
      } else {
        await discountCampaignService.create(form);
        toast.success('Discount campaign created');
      }
      await loadCampaigns();
      setEditingCampaign(null);
      setForm(EMPTY_FORM);
    } catch {
      toast.error('Failed to save discount campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (campaign: DiscountCampaign) => {
    setEditingCampaign(campaign);
    setForm({
      name: campaign.name,
      description: campaign.description,
      discountType: campaign.discountType,
      discountValue: campaign.discountValue,
      minimumBookingAmount: campaign.minimumBookingAmount,
      maximumDiscountAmount: campaign.maximumDiscountAmount,
      validFrom: toDateTimeLocal(campaign.validFrom),
      validUntil: toDateTimeLocal(campaign.validUntil),
      targetingMode: campaign.targetingMode,
      targetAccountIds: campaign.targetAccountIds,
      couponQuantity: campaign.couponQuantity,
      usageLimitPerCoupon: campaign.usageLimitPerCoupon,
    });
  };

  const handleAction = async (action: 'activate' | 'pause' | 'end', campaignId: string) => {
    try {
      if (action === 'activate') {
        await discountCampaignService.activate(campaignId);
      } else if (action === 'pause') {
        await discountCampaignService.pause(campaignId);
      } else {
        await discountCampaignService.end(campaignId);
      }
      await loadCampaigns();
      toast.success(`Campaign ${action}d successfully`);
    } catch {
      toast.error(`Failed to ${action} campaign`);
    }
  };

  const handleGenerateCoupons = async (quantity: number) => {
    if (!selectedCampaign) {
      return;
    }
    try {
      const generated = await discountCampaignService.generateCoupons(selectedCampaign.id, { quantity });
      setCoupons((current) => [...generated, ...current]);
      await loadCampaigns();
      toast.success('Coupons generated');
    } catch {
      toast.error('Failed to generate coupons');
    }
  };

  return (
    <ScopeGuard scope="DISCOUNT_CAMPAIGN_MANAGE" fallback={<div className="p-8">You do not have access to discount campaigns.</div>}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discount Campaigns</h1>
          <p className="text-muted-foreground">
            Create campaign offers, publish them, and generate coupons for renters.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr_1fr]">
          <DiscountCampaignForm
            value={form}
            editingCampaign={editingCampaign}
            submitting={submitting}
            onChange={setForm}
            onSubmit={handleSubmit}
            onReset={() => {
              setEditingCampaign(null);
              setForm(EMPTY_FORM);
            }}
          />

          <DiscountCampaignTable
            campaigns={campaigns}
            selectedCampaignId={selectedCampaignId}
            onEdit={handleEdit}
            onSelect={(campaign) => {
              setSelectedCampaignId(campaign.id);
              setCoupons([]);
            }}
            onActivate={(campaignId) => handleAction('activate', campaignId)}
            onPause={(campaignId) => handleAction('pause', campaignId)}
            onEnd={(campaignId) => handleAction('end', campaignId)}
          />

          <CouponPanel
            campaign={selectedCampaign}
            coupons={coupons}
            onGenerate={handleGenerateCoupons}
          />
        </div>
      </div>
    </ScopeGuard>
  );
}
