"use client"

import { useState, useEffect } from "react"
import { format, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns"
import { CalendarIcon, ArrowRightLeft } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/Label"

interface RentalPeriodPickerProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  className?: string
  pricePerDay?: number
}

export function RentalPeriodPicker({
  dateRange,
  onDateRangeChange,
  className,
  pricePerDay = 0,
}: RentalPeriodPickerProps) {
  const [open, setOpen] = useState(false)
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange)
  const [pickupTime, setPickupTime] = useState<string>("09:00")
  const [returnTime, setReturnTime] = useState<string>("20:00")
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)")
    const updateIsDesktop = (event?: MediaQueryListEvent) => {
      setIsDesktop(event ? event.matches : mediaQuery.matches)
    }

    updateIsDesktop()
    mediaQuery.addEventListener("change", updateIsDesktop)

    return () => {
      mediaQuery.removeEventListener("change", updateIsDesktop)
    }
  }, [])

  useEffect(() => {
    setTempDateRange(dateRange)
  }, [dateRange, open])

  const getDuration = (from?: Date, to?: Date) => {
    if (!from || !to) return { text: "0 days", days: 0, hours: 0, minutes: 0 }
    
    const totalMinutes = differenceInMinutes(to, from)
    const totalHours = differenceInHours(to, from)
    const days = differenceInDays(to, from)
    const hours = totalHours % 24
    const minutes = totalMinutes % 60
    
    if (days > 0) {
      if (hours > 0) {
        return { text: `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`, days, hours, minutes }
      }
      return { text: `${days} day${days > 1 ? 's' : ''}`, days, hours, minutes }
    } else if (totalHours > 0) {
      if (minutes > 0) {
        return { text: `${totalHours} hour${totalHours > 1 ? 's' : ''} ${minutes} min`, days, hours: totalHours, minutes }
      }
      return { text: `${totalHours} hour${totalHours > 1 ? 's' : ''}`, days, hours: totalHours, minutes }
    } else {
      return { text: `${totalMinutes} minute${totalMinutes > 1 ? 's' : ''}`, days, hours: 0, minutes: totalMinutes }
    }
  }

  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      setTempDateRange(undefined)
      return
    }

    // Apply times to dates
    const [pickupHours, pickupMinutes] = pickupTime.split(':').map(Number)
    const [returnHours, returnMinutes] = returnTime.split(':').map(Number)
    
    const from = new Date(range.from)
    from.setHours(pickupHours, pickupMinutes, 0, 0)
    
    let to: Date | undefined
    if (range.to) {
      to = new Date(range.to)
      to.setHours(returnHours, returnMinutes, 0, 0)
    }
    
    setTempDateRange({ from, to })
  }

  const handleTimeChange = (type: 'pickup' | 'return', time: string) => {
    if (type === 'pickup') {
      setPickupTime(time)
    } else {
      setReturnTime(time)
    }

    // Update temp date range with new time
    if (tempDateRange?.from) {
      const [hours, minutes] = time.split(':').map(Number)
      if (type === 'pickup') {
        const from = new Date(tempDateRange.from)
        from.setHours(hours, minutes, 0, 0)
        setTempDateRange({ ...tempDateRange, from })
      } else if (tempDateRange.to) {
        const to = new Date(tempDateRange.to)
        to.setHours(hours, minutes, 0, 0)
        setTempDateRange({ ...tempDateRange, to })
      }
    }
  }

  const handleConfirm = () => {
    if (tempDateRange?.from && tempDateRange?.to) {
      onDateRangeChange(tempDateRange)
      setOpen(false)
    }
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push(timeString)
      }
    }
    return options
  }

  const formatButtonText = () => {
    if (!dateRange?.from) return "Select rental period"
    
    if (!dateRange.to) return format(dateRange.from, "HH:mm, dd/MM")
    
    const duration = getDuration(dateRange.from, dateRange.to)
    return `${format(dateRange.from, "HH:mm, dd/MM")} - ${format(dateRange.to, "HH:mm, dd/MM")} (${duration.text})`
  }

  const timeOptions = generateTimeOptions()

  return (
    <div className={cn("grid gap-2", className)}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="truncate">{formatButtonText()}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-[700px] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-center text-xl">Rental Period</DialogTitle>
          </DialogHeader>
          
          <div className="px-6 pb-6 space-y-4 mt-4">
              {/* Calendar */}
              <div className="flex justify-center overflow-x-auto pb-1">
                <Calendar
                  mode="range"
                  selected={tempDateRange}
                  onSelect={handleDateSelect}
                  numberOfMonths={isDesktop ? 2 : 1}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border bg-background"
                />
              </div>

              {/* Time Selectors */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr,auto,1fr] md:items-center">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Pick up time</Label>
                  <Select value={pickupTime} onValueChange={(val) => handleTimeChange('pickup', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <ArrowRightLeft className="mx-auto h-4 w-4 text-muted-foreground md:mt-7" />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Return time</Label>
                  <Select value={returnTime} onValueChange={(val) => handleTimeChange('return', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm">
                  {tempDateRange?.from && tempDateRange?.to ? (
                    <>
                      <span className="font-medium">
                        {format(tempDateRange.from, "HH:mm, dd/MM")} - {format(tempDateRange.to, "HH:mm, dd/MM")}
                      </span>
                      <div className="text-muted-foreground">
                        Duration: {getDuration(tempDateRange.from, tempDateRange.to).text}
                      </div>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Select dates to continue</span>
                  )}
                </div>
                <Button 
                  onClick={handleConfirm} 
                  disabled={!tempDateRange?.from || !tempDateRange?.to}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Continue
                </Button>
              </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
