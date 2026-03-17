'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { CreateDiscountCampaignRequest, DiscountCampaign } from '@/types/discountCampaign';

interface Props {
  value: CreateDiscountCampaignRequest;
  editingCampaign: DiscountCampaign | null;
  submitting: boolean;
  onChange: (value: CreateDiscountCampaignRequest) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export default function DiscountCampaignForm({
  value,
  editingCampaign,
  submitting,
  onChange,
  onSubmit,
  onReset,
}: Props) {
  const setField = <K extends keyof CreateDiscountCampaignRequest>(key: K, fieldValue: CreateDiscountCampaignRequest[K]) => {
    onChange({
      ...value,
      [key]: fieldValue,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingCampaign ? 'Edit Campaign' : 'Create Campaign'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Campaign Name</Label>
          <Input id="name" value={value.name} onChange={(e) => setField('name', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={value.description}
            onChange={(e) => setField('description', e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="discountType">Discount Type</Label>
            <select
              id="discountType"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={value.discountType}
              onChange={(e) => setField('discountType', e.target.value as CreateDiscountCampaignRequest['discountType'])}
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountValue">Discount Value</Label>
            <Input
              id="discountValue"
              type="number"
              min="0"
              step="0.01"
              value={value.discountValue}
              onChange={(e) => setField('discountValue', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="validFrom">Valid From</Label>
            <Input
              id="validFrom"
              type="datetime-local"
              value={value.validFrom}
              onChange={(e) => setField('validFrom', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="validUntil">Valid Until</Label>
            <Input
              id="validUntil"
              type="datetime-local"
              value={value.validUntil}
              onChange={(e) => setField('validUntil', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="couponQuantity">Coupon Quantity</Label>
            <Input
              id="couponQuantity"
              type="number"
              min="1"
              value={value.couponQuantity}
              onChange={(e) => setField('couponQuantity', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usageLimitPerCoupon">Usage Limit</Label>
            <Input
              id="usageLimitPerCoupon"
              type="number"
              min="1"
              value={value.usageLimitPerCoupon}
              onChange={(e) => setField('usageLimitPerCoupon', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minimumBookingAmount">Minimum Booking Amount</Label>
            <Input
              id="minimumBookingAmount"
              type="number"
              min="0"
              step="0.01"
              value={value.minimumBookingAmount ?? ''}
              onChange={(e) => setField('minimumBookingAmount', e.target.value ? Number(e.target.value) : null)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetingMode">Targeting Mode</Label>
          <select
            id="targetingMode"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={value.targetingMode}
            onChange={(e) => setField('targetingMode', e.target.value as CreateDiscountCampaignRequest['targetingMode'])}
          >
            <option value="ALL_RENTERS">All Renters</option>
            <option value="FILTERED_RENTERS">Filtered Renters</option>
          </select>
        </div>

        <div className="flex gap-3">
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : editingCampaign ? 'Update Campaign' : 'Create Campaign'}
          </Button>
          <Button variant="outline" onClick={onReset} disabled={submitting}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
