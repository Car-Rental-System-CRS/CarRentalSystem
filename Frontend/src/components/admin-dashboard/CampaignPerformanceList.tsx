'use client';

import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatShortDate } from '@/lib/dashboard';
import { CampaignPerformanceEntry } from '@/types/dashboard';

interface CampaignPerformanceListProps {
  entries: CampaignPerformanceEntry[];
}

function getStatusClasses(status: string): string {
  const classes: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    PAUSED: 'bg-amber-100 text-amber-800',
    DRAFT: 'bg-slate-100 text-slate-700',
    EXPIRED: 'bg-rose-100 text-rose-700',
    ENDED: 'bg-slate-200 text-slate-700',
  };

  return classes[status] || 'bg-slate-100 text-slate-700';
}

export function CampaignPerformanceList({ entries }: CampaignPerformanceListProps) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardHeader className="space-y-1 border-b border-slate-100">
        <CardTitle className="text-lg text-slate-900">Campaign performance</CardTitle>
        <CardDescription>
          Compare campaign reach, redemption, and booking contribution without leaving the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {entries.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            No campaign performance entries are available for this reporting period.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Redeemed</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Discount value</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Window</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.campaignId}>
                  <TableCell className="min-w-[220px]">
                    <div className="font-medium text-slate-900">{entry.campaignName}</div>
                    <div className="text-xs text-slate-500">{entry.campaignId}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(entry.status)}`}>
                      {entry.status.toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell>{entry.issuedCoupons}</TableCell>
                  <TableCell>{entry.redeemedCoupons}</TableCell>
                  <TableCell>{entry.discountAttributedBookings}</TableCell>
                  <TableCell>{formatCurrency(entry.discountValueGranted)}</TableCell>
                  <TableCell>{entry.redemptionRate !== null ? `${entry.redemptionRate}%` : 'N/A'}</TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {formatShortDate(entry.validFrom)} - {formatShortDate(entry.validUntil)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={entry.detailHref}
                      className="text-sm font-medium text-sky-700 transition-colors hover:text-sky-900"
                    >
                      Open campaign
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
