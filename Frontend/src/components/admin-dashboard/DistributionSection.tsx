'use client';

import { ReactNode } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

interface DistributionSectionProps {
  children?: ReactNode;
  description: string;
  emptyMessage: string;
  hasData: boolean;
  title: string;
}

export function DistributionSection({
  children,
  description,
  emptyMessage,
  hasData,
  title,
}: DistributionSectionProps) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardHeader className="space-y-1 border-b border-slate-100">
        <CardTitle className="text-lg text-slate-900">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {hasData ? (
          children
        ) : (
          <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
