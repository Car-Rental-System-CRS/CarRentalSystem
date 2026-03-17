'use client';

import {
  AlertTriangle,
  BarChart3,
  CalendarRange,
  DollarSign,
  Minus,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/Card';
import {
  getAttentionBadgeClasses,
  getAttentionClasses,
  getComparisonClasses,
  getSummaryIconName,
} from '@/lib/dashboard';
import { cn } from '@/lib/utils';
import { DashboardSummaryCard } from '@/types/dashboard';

const iconMap = {
  BarChart3,
  CalendarRange,
  DollarSign,
  Users,
  Wallet,
};

function ComparisonIcon({ direction }: { direction: DashboardSummaryCard['comparisonDirection'] }) {
  if (direction === 'UP') {
    return <TrendingUp className="h-4 w-4" />;
  }
  if (direction === 'DOWN') {
    return <TrendingDown className="h-4 w-4" />;
  }
  return <Minus className="h-4 w-4" />;
}

export function SummaryCards({ cards }: { cards: DashboardSummaryCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = iconMap[getSummaryIconName(card) as keyof typeof iconMap] || BarChart3;

        return (
          <Card
            key={card.key}
            className={cn(
              'overflow-hidden rounded-3xl border shadow-sm transition-colors',
              getAttentionClasses(card.attentionState)
            )}
          >
            <CardContent className="p-0">
              <div className="border-b border-slate-100/80 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                      {card.valueDisplay}
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-slate-900 p-3 text-white shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="space-y-3 px-5 py-4">
                <div
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
                    getComparisonClasses(card.comparisonDirection)
                  )}
                >
                  <ComparisonIcon direction={card.comparisonDirection} />
                  <span>{card.comparisonDeltaDisplay || 'No change data'}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <p className="text-slate-500">{card.supportingLabel}</p>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                      getAttentionBadgeClasses(card.attentionState)
                    )}
                  >
                    {card.attentionState === 'CRITICAL' && (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    )}
                    {card.attentionState.toLowerCase()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
