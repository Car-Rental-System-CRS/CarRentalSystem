'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminBookingResponse, staffBookingService } from '@/services/staffBookingService';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { handleError, handleSuccess } from '@/lib/errorHandler';
import { CheckCircle, RotateCcw, Loader2, Wallet, Link as LinkIcon, ClipboardCheck } from 'lucide-react';

interface Props {
  booking: AdminBookingResponse;
  onUpdated: (booking: AdminBookingResponse) => void;
}

interface ConfirmationState {
  title: string;
  description: string;
  confirmLabel: string;
  variant?: 'default' | 'destructive';
  action: () => Promise<void> | void;
}

export default function BookingActions({ booking, onUpdated }: Props) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<
    'pickup' | 'return' | 'payos' | 'cash' | null
  >(null);
  const [pickupNotes, setPickupNotes] = useState(booking.pickupNotes ?? '');
  const [returnNotes, setReturnNotes] = useState(booking.returnNotes ?? '');
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);

  const pendingSettlementPayment = booking.payments?.find(
    (payment) =>
      (payment.purpose === 'FINAL_PAYMENT' || payment.purpose === 'OVERDUE_PAYMENT')
      && payment.status === 'PENDING'
  );
  const latestNotification = booking.notifications?.[0] ?? null;

  const needsInspection =
    booking.status === 'IN_PROGRESS' &&
    !!booking.actualReturnDate &&
    !booking.postTripInspectionCompleted;

  const needsSettlement =
    booking.status === 'IN_PROGRESS' &&
    !!booking.actualReturnDate &&
    booking.remainingAmount > 0 &&
    !!booking.postTripInspectionCompleted;

  const refreshBooking = async () => {
    const latest = await staffBookingService.getById(booking.id);
    onUpdated(latest.data.data);
  };

  const handleConfirmPickup = async () => {
    setLoadingAction('pickup');
    try {
      const res = await staffBookingService.confirmPickup(booking.id, {
        pickupNotes: pickupNotes.trim() || undefined,
      });
      onUpdated(res.data.data);
      handleSuccess('Car pickup confirmed', 'Booking is now IN PROGRESS');
    } catch (error) {
      handleError(error, 'Failed to confirm pickup');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleConfirmReturn = async () => {
    setLoadingAction('return');
    try {
      const res = await staffBookingService.confirmReturn(booking.id, {
        returnNotes: returnNotes.trim() || undefined,
      });
      onUpdated(res.data.data);
      handleSuccess(
        'Car return confirmed',
        'Return recorded. Post-trip inspection is required before settlement.'
      );
    } catch (error) {
      handleError(error, 'Failed to confirm return');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGenerateFinalPayment = async () => {
    setLoadingAction('payos');
    try {
      const res = await staffBookingService.createFinalPayment(booking.id);
      await refreshBooking();

      const paymentUrl = res.data.data.paymentUrl;
      if (paymentUrl) {
        window.open(paymentUrl, '_blank', 'noopener,noreferrer');
      }

      handleSuccess('Final payment link ready', 'Share/open the PayOS link to complete settlement.');
    } catch (error) {
      handleError(error, 'Failed to create final payment link');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSettleCash = async () => {
    setLoadingAction('cash');
    try {
      await staffBookingService.settleCash(booking.id);
      await refreshBooking();
      handleSuccess('Cash payment recorded', 'Booking is now marked as COMPLETED.');
    } catch (error) {
      handleError(error, 'Failed to record cash payment');
    } finally {
      setLoadingAction(null);
    }
  };

  const openConfirmation = (next: ConfirmationState) => {
    if (loadingAction !== null) return;
    setConfirmation(next);
  };

  const closeConfirmation = () => {
    if (loadingAction !== null) return;
    setConfirmation(null);
  };

  const handleConfirmedAction = async () => {
    if (!confirmation) return;
    try {
      await confirmation.action();
    } finally {
      setConfirmation(null);
    }
  };

  if (booking.status === 'COMPLETED') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-green-800">Booking Complete</h3>
        <p className="text-sm text-green-600 mt-1">
          All payments resolved. No further actions available.
        </p>
      </div>
    );
  }

  if (booking.status === 'CANCELED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800">Booking Canceled</h3>
        <p className="text-sm text-red-600 mt-1">
          This booking has been canceled.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Actions</h3>

      {latestNotification && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          Latest notification: <span className="font-medium">{latestNotification.eventType.replace(/_/g, ' ')}</span>
          {' · '}
          <span className="font-medium">{latestNotification.deliveryStatus}</span>
          {latestNotification.failureReason ? ` · ${latestNotification.failureReason}` : ''}
        </div>
      )}

      {booking.status === 'CREATED' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Waiting for renter to pay the deposit. No actions available yet.
          </p>
        </div>
      )}

      {booking.status === 'CONFIRMED' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup notes (optional)
            </label>
            <textarea
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              rows={3}
              placeholder="Identity checked, handover notes, etc."
            />
          </div>
          <Button
            onClick={() =>
              openConfirmation({
                title: 'Confirm pickup',
                description:
                  'Are you sure that the vehicle has been handed over to the renter?',
                confirmLabel: 'Confirm Pickup',
                action: handleConfirmPickup,
              })
            }
            disabled={loadingAction !== null}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {loadingAction === 'pickup' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Confirm Pickup
          </Button>
        </div>
      )}

      {booking.status === 'IN_PROGRESS' && !booking.actualReturnDate && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Return notes (optional)
            </label>
            <textarea
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              rows={3}
              placeholder="Condition check summary, handback notes, etc."
            />
          </div>
          <Button
            onClick={() =>
              openConfirmation({
                title: 'Confirm return',
                description:
                  'Confirm that the renter has returned the vehicle. This will record the return and require post-trip inspection before settlement.',
                confirmLabel: 'Confirm Return',
                action: handleConfirmReturn,
              })
            }
            disabled={loadingAction !== null}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            size="lg"
          >
            {loadingAction === 'return' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            Confirm Return
          </Button>
        </div>
      )}

      {needsInspection && (
        <div className="space-y-3 border border-amber-200 bg-amber-50 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            Post-trip inspection is required before payment settlement.
          </p>
          <Button
            onClick={() =>
              openConfirmation({
                title: 'Open post-trip damage capture',
                description:
                  'Continue to the post-trip inspection screen for this booking. Use this when the vehicle has been returned and inspection is ready to be recorded.',
                confirmLabel: 'Open Inspection',
                action: () => router.push(`/staff/bookings/${booking.id}/post-trip-damage`),
              })
            }
            disabled={loadingAction !== null}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white whitespace-normal h-auto py-2 leading-snug"
            size="lg"
          >
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Open Post-Trip Damage Capture
          </Button>
        </div>
      )}

      {needsSettlement && (
        <div className="space-y-3 border border-orange-200 bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-orange-900">
            Remaining amount due: <span className="font-semibold">${booking.remainingAmount.toFixed(2)}</span>
          </p>
          <Button
            onClick={() =>
              openConfirmation({
                title: 'Generate final payment link',
                description:
                  'Create a PayOS settlement link for the remaining balance. A new payment link will be opened in a new tab if creation succeeds.',
                confirmLabel: 'Generate Link',
                action: handleGenerateFinalPayment,
              })
            }
            disabled={loadingAction !== null}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white whitespace-normal h-auto py-2 leading-snug"
            size="lg"
          >
            {loadingAction === 'payos' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LinkIcon className="w-4 h-4 mr-2" />
            )}
            Generate Final Payment Link
          </Button>

          {pendingSettlementPayment?.paymentUrl && (
            <button
              type="button"
              onClick={() =>
                openConfirmation({
                  title: 'Open pending payment link',
                  description:
                    'Open the existing pending PayOS payment link in a new tab for the renter to complete settlement.',
                  confirmLabel: 'Open Link',
                  action: () => {
                    if (!pendingSettlementPayment.paymentUrl) return;
                    window.open(
                      pendingSettlementPayment.paymentUrl,
                      '_blank',
                      'noopener,noreferrer'
                    );
                  },
                })
              }
              disabled={loadingAction !== null}
              className="block text-sm text-blue-700 hover:text-blue-800 disabled:opacity-50"
            >
              Open existing pending payment link
            </button>
          )}

          <Button
            onClick={() =>
              openConfirmation({
                title: 'Record cash settlement',
                description:
                  'Confirm that the remaining amount has been collected in full by cash. This will mark the booking as COMPLETED.',
                confirmLabel: 'Mark Paid',
                action: handleSettleCash,
              })
            }
            disabled={loadingAction !== null}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            size="lg"
          >
            {loadingAction === 'cash' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wallet className="w-4 h-4 mr-2" />
            )}
            Mark Paid (Cash)
          </Button>
        </div>
      )}

      <Dialog open={!!confirmation} onOpenChange={(open) => !open && closeConfirmation()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmation?.title}</DialogTitle>
            <DialogDescription>{confirmation?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeConfirmation} disabled={loadingAction !== null}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmedAction}
              disabled={loadingAction !== null}
              variant={confirmation?.variant ?? 'default'}
            >
              {loadingAction !== null ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmation?.confirmLabel
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
