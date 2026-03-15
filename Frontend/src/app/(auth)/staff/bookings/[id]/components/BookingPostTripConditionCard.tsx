'use client';

import { AdminBookingResponse, PostTripInspectionResponse } from '@/services/staffBookingService';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Loader2 } from 'lucide-react';
import { getServerUrl } from '@/lib/utils';

interface Props {
  booking: AdminBookingResponse;
  inspection: PostTripInspectionResponse | null;
  loading: boolean;
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BookingPostTripConditionCard({ booking, inspection, loading }: Props) {
  if (booking.status !== 'COMPLETED' && !booking.postTripInspectionCompleted) return null;

  const resolveImageUrl = (fileUrl?: string) => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    return `${getServerUrl()}${fileUrl}`;
  };

  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <ClipboardCheck className="w-5 h-5 text-blue-600" />
        Post-Trip Condition
      </h3>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading post-trip condition...
        </div>
      ) : !inspection?.completed ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          No completed post-trip inspection record was found for this booking.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Inspection Time</div>
              <div className="text-sm font-medium text-gray-900">
                {formatDateTime(inspection.inspectedAt ?? booking.postTripInspectionAt)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Condition Result</div>
              <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                {inspection.noAdditionalDamage ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    No Additional Damage
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Additional Damage Reported
                  </>
                )}
              </div>
            </div>
          </div>

          {inspection.summaryNotes && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Inspection Summary</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{inspection.summaryNotes}</p>
            </div>
          )}

          {inspection.items.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">Per-Car Condition</h4>
              {inspection.items.map((item) => (
                <div
                  key={item.carId}
                  className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-1"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-gray-900">{item.licensePlate}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.hasNewDamage
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {item.hasNewDamage ? 'New Damage' : 'No New Damage'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Uploaded damage images: {item.uploadedDamageImageCount}
                  </div>
                  {!!item.damageImages?.length && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {item.damageImages.map((image) => (
                        <a
                          key={image.id}
                          href={resolveImageUrl(image.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={resolveImageUrl(image.fileUrl)}
                            alt={image.description || image.fileName || 'Damage image'}
                            className="w-20 h-16 object-cover rounded border border-gray-200"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
