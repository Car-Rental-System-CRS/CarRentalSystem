'use client';

import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ReportingPeriod } from '@/types/dashboard';

export type PresetRange =
  | '7d'
  | '30d'
  | '3m'
  | '6m'
  | '12m'
  | 'all'
  | 'custom';

interface DashboardHeaderProps {
  customRange?: DateRange;
  onCustomRangeChange: (range: DateRange | undefined) => void;
  onPresetChange: (preset: PresetRange) => void;
  preset: PresetRange;
  reportingPeriod?: ReportingPeriod;
}

export function DashboardHeader({
  customRange,
  onCustomRangeChange,
  onPresetChange,
  preset,
  reportingPeriod,
}: DashboardHeaderProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
            Admin dashboard
          </span>
          <div className="space-y-1">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
              Business health at a glance
            </h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Review revenue momentum, booking flow, payment health, and
              recent activity from one reporting window.
            </p>
          </div>
          {reportingPeriod && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                {reportingPeriod.label}
              </span>
              <span>
                {format(new Date(reportingPeriod.startDate), 'MMM dd, yyyy')} to{' '}
                {format(new Date(reportingPeriod.endDate), 'MMM dd, yyyy')}
              </span>
              {reportingPeriod.comparisonLabel && (
                <span className="text-slate-500">
                  Comparing against {reportingPeriod.comparisonLabel}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={preset}
            onValueChange={(value) => onPresetChange(value as PresetRange)}
          >
            <SelectTrigger className="w-full min-w-[180px] bg-white sm:w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          {preset === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'min-w-[240px] justify-start bg-white text-left font-normal',
                    !customRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customRange?.from ? (
                    customRange.to ? (
                      <>
                        {format(customRange.from, 'LLL dd, y')} -{' '}
                        {format(customRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(customRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick dates</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={customRange?.from}
                  selected={customRange}
                  onSelect={onCustomRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
}
