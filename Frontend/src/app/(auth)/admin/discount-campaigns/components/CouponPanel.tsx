'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { CouponSummary, DiscountCampaign } from '@/types/discountCampaign';

interface Props {
  campaign: DiscountCampaign | null;
  coupons: CouponSummary[];
  onGenerate: (quantity: number) => Promise<void>;
}

export default function CouponPanel({ campaign, coupons, onGenerate }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!campaign) {
      return;
    }
    setLoading(true);
    try {
      await onGenerate(quantity);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coupons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!campaign ? (
          <p className="text-sm text-muted-foreground">Select a campaign to generate and review coupons.</p>
        ) : (
          <>
            <div className="flex items-end gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Generate quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generating...' : 'Generate'}
              </Button>
            </div>

            <div className="space-y-2">
              {coupons.length === 0 ? (
                <p className="text-sm text-muted-foreground">No coupons generated for this campaign yet.</p>
              ) : (
                coupons.map((coupon) => (
                  <div key={coupon.id} className="rounded-md border border-gray-200 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{coupon.code}</span>
                      <span className="text-gray-500">{coupon.status}</span>
                    </div>
                    <p className="text-gray-500">
                      Usage: {coupon.usageCount}/{coupon.usageLimit}
                    </p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
