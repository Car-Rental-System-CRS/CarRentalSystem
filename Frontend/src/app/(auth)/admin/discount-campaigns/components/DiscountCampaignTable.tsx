'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { DiscountCampaign } from '@/types/discountCampaign';

interface Props {
  campaigns: DiscountCampaign[];
  selectedCampaignId: string | null;
  onEdit: (campaign: DiscountCampaign) => void;
  onSelect: (campaign: DiscountCampaign) => void;
  onActivate: (campaignId: string) => void;
  onPause: (campaignId: string) => void;
  onEnd: (campaignId: string) => void;
}

export default function DiscountCampaignTable({
  campaigns,
  selectedCampaignId,
  onEdit,
  onSelect,
  onActivate,
  onPause,
  onEnd,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaigns</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No discount campaigns created yet.</p>
        ) : (
          campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`rounded-lg border p-4 ${selectedCampaignId === campaign.id ? 'border-blue-500 bg-blue-50/40' : 'border-gray-200'}`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                  <p className="text-sm text-gray-600">{campaign.description}</p>
                </div>
                <Badge variant="outline">{campaign.status}</Badge>
              </div>

              <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                <p>Discount value: {campaign.discountValue}</p>
                <p>Coupons: {campaign.generatedCouponCount} / {campaign.couponQuantity}</p>
                <p>Valid from: {campaign.validFrom.replace('T', ' ')}</p>
                <p>Valid until: {campaign.validUntil.replace('T', ' ')}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => onSelect(campaign)}>
                  Select
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(campaign)}>
                  Edit
                </Button>
                {campaign.status !== 'ACTIVE' && campaign.status !== 'ENDED' && campaign.status !== 'EXPIRED' && (
                  <Button size="sm" onClick={() => onActivate(campaign.id)}>
                    Activate
                  </Button>
                )}
                {campaign.status === 'ACTIVE' && (
                  <Button variant="outline" size="sm" onClick={() => onPause(campaign.id)}>
                    Pause
                  </Button>
                )}
                {campaign.status !== 'ENDED' && (
                  <Button variant="destructive" size="sm" onClick={() => onEnd(campaign.id)}>
                    End
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
