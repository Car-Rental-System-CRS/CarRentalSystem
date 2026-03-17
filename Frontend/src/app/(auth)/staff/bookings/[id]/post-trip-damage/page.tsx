'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  AdminBookingResponse,
  PostTripInspectionResponse,
  staffBookingService,
} from '@/services/staffBookingService';
import { handleError, handleSuccess } from '@/lib/errorHandler';
import { ImageWithDescription } from '@/types/carType';
import { compressImage, getImageDimensions, formatFileSize } from '@/lib/imageUtils';

interface CarInspectionDraft {
  hasNewDamage: boolean;
  notes: string;
  selectedImages: ImageWithDescription[];
  uploadedDamageImageCount: number;
  linkedDamageImageIds: string[];
  isUploading: boolean;
}

function createEmptyDraft(): CarInspectionDraft {
  return {
    hasNewDamage: false,
    notes: '',
    selectedImages: [],
    uploadedDamageImageCount: 0,
    linkedDamageImageIds: [],
    isUploading: false,
  };
}

export default function PostTripDamageCapturePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [booking, setBooking] = useState<AdminBookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [noAdditionalDamage, setNoAdditionalDamage] = useState(false);
  const [summaryNotes, setSummaryNotes] = useState('');
  const [carDrafts, setCarDrafts] = useState<Record<string, CarInspectionDraft>>({});

  const canEditInspection = useMemo(() => {
    if (!booking) return false;
    return booking.status === 'IN_PROGRESS' && !!booking.actualReturnDate;
  }, [booking]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingRes, inspectionRes] = await Promise.all([
          staffBookingService.getById(id),
          staffBookingService.getPostTripInspection(id),
        ]);

        const fetchedBooking = bookingRes.data.data;
        const inspection = inspectionRes.data.data;

        setBooking(fetchedBooking);
        applyInspectionToDrafts(fetchedBooking, inspection);
      } catch (error) {
        handleError(error, 'Failed to load post-trip inspection data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const applyInspectionToDrafts = (
    fetchedBooking: AdminBookingResponse,
    inspection: PostTripInspectionResponse
  ) => {
    setNoAdditionalDamage(inspection.noAdditionalDamage ?? false);
    setSummaryNotes(inspection.summaryNotes ?? '');

    const inspectionMap = new Map(
      (inspection.items ?? []).map((item) => [item.carId, item])
    );

    const draftByCar: Record<string, CarInspectionDraft> = {};
    fetchedBooking.cars.forEach((car) => {
      const item = inspectionMap.get(car.id);
      draftByCar[car.id] = {
        hasNewDamage: item?.hasNewDamage ?? false,
        notes: item?.notes ?? '',
        selectedImages: [],
        uploadedDamageImageCount:
          item?.damageImages && item.damageImages.length > 0
            ? item.damageImages.length
            : item?.uploadedDamageImageCount ?? 0,
        linkedDamageImageIds: (item?.damageImages ?? []).map((image) => image.id),
        isUploading: false,
      };
    });

    setCarDrafts(draftByCar);
  };

  const updateCarDraft = (carId: string, updater: (draft: CarInspectionDraft) => CarInspectionDraft) => {
    setCarDrafts((prev) => ({
      ...prev,
      [carId]: updater(prev[carId] ?? createEmptyDraft()),
    }));
  };

  const processImages = async (files: File[]) => {
    const limitedFiles = files.slice(0, 10);

    return Promise.all(
      limitedFiles.map(async (originalFile) => {
        try {
          const dimensions = await getImageDimensions(originalFile);
          const originalSize = originalFile.size;

          const shouldCompress =
            originalSize > 2 * 1024 * 1024 ||
            dimensions.width > 1920 ||
            dimensions.height > 1080;

          let processedFile = originalFile;
          if (shouldCompress) {
            processedFile = await compressImage(originalFile, {
              maxWidth: 1920,
              maxHeight: 1080,
              quality: 0.85,
              format: 'image/jpeg',
            });
          }

          return {
            file: processedFile,
            originalFile,
            description: '',
            preview: URL.createObjectURL(processedFile),
            originalSize,
            compressedSize: processedFile.size,
            dimensions,
          } as ImageWithDescription;
        } catch {
          return {
            file: originalFile,
            originalFile,
            description: '',
            preview: URL.createObjectURL(originalFile),
            originalSize: originalFile.size,
            compressedSize: originalFile.size,
            dimensions: { width: 0, height: 0 },
          } as ImageWithDescription;
        }
      })
    );
  };

  const handleSelectImages = async (carId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!canEditInspection) return;

    const processed = await processImages(Array.from(files));
    updateCarDraft(carId, (draft) => ({
      ...draft,
      selectedImages: [...draft.selectedImages, ...processed].slice(0, 10),
    }));
  };

  const removeSelectedImage = (carId: string, index: number) => {
    updateCarDraft(carId, (draft) => {
      const image = draft.selectedImages[index];
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
      return {
        ...draft,
        selectedImages: draft.selectedImages.filter((_, idx) => idx !== index),
      };
    });
  };

  const updateImageDescription = (carId: string, index: number, description: string) => {
    updateCarDraft(carId, (draft) => ({
      ...draft,
      selectedImages: draft.selectedImages.map((image, idx) =>
        idx === index ? { ...image, description } : image
      ),
    }));
  };

  const uploadDamageImagesForDraft = async (
    bookingId: string,
    carId: string,
    draft: CarInspectionDraft
  ): Promise<string[]> => {
    if (draft.selectedImages.length === 0) {
      return draft.linkedDamageImageIds;
    }

    const uploadRes = await staffBookingService.uploadPostTripDamageImages(
      bookingId,
      carId,
      draft.selectedImages
    );
    const uploadedImageIds = (uploadRes.data.data ?? []).map((image) => image.id);

    draft.selectedImages.forEach((image) => {
      if (image.preview) {
        URL.revokeObjectURL(image.preview);
      }
    });

    return Array.from(new Set([...draft.linkedDamageImageIds, ...uploadedImageIds]));
  };

  const uploadCarDamageImages = async (carId: string) => {
    const draft = carDrafts[carId];
    if (!booking || !draft || draft.selectedImages.length === 0 || !canEditInspection) return;

    updateCarDraft(carId, (current) => ({ ...current, isUploading: true }));

    try {
      const mergedImageIds = await uploadDamageImagesForDraft(booking.id, carId, draft);

      updateCarDraft(carId, (current) => ({
        ...current,
        linkedDamageImageIds: mergedImageIds,
        selectedImages: [],
        uploadedDamageImageCount: mergedImageIds.length,
        hasNewDamage: true,
      }));

      handleSuccess('Damage images uploaded', 'New damage evidence was stored for this car.');
    } catch (error) {
      handleError(error, 'Failed to upload damage images');
    } finally {
      updateCarDraft(carId, (current) => ({ ...current, isUploading: false }));
    }
  };

  const handleSaveInspection = async () => {
    if (!booking) return;

    setSaving(true);
    try {
      const nextDrafts: Record<string, CarInspectionDraft> = { ...carDrafts };

      for (const car of booking.cars) {
        const draft = nextDrafts[car.id] ?? createEmptyDraft();
        if (!draft.hasNewDamage || draft.selectedImages.length === 0) continue;

        nextDrafts[car.id] = { ...draft, isUploading: true };
        setCarDrafts((prev) => ({
          ...prev,
          [car.id]: { ...(prev[car.id] ?? createEmptyDraft()), isUploading: true },
        }));

        try {
          const mergedImageIds = await uploadDamageImagesForDraft(booking.id, car.id, draft);
          nextDrafts[car.id] = {
            ...draft,
            hasNewDamage: true,
            linkedDamageImageIds: mergedImageIds,
            selectedImages: [],
            uploadedDamageImageCount: mergedImageIds.length,
            isUploading: false,
          };
        } catch (error) {
          nextDrafts[car.id] = { ...draft, isUploading: false };
          setCarDrafts((prev) => ({
            ...prev,
            [car.id]: { ...(prev[car.id] ?? createEmptyDraft()), isUploading: false },
          }));
          throw error;
        }
      }

      setCarDrafts(nextDrafts);

      const items = booking.cars
        .map((car) => {
          const draft = nextDrafts[car.id] ?? createEmptyDraft();
          return {
            carId: car.id,
            hasNewDamage: draft.hasNewDamage,
            notes: draft.notes.trim() || undefined,
            uploadedDamageImageCount: draft.uploadedDamageImageCount,
            damageImageIds: draft.linkedDamageImageIds,
          };
        })
        .filter((item) => item.hasNewDamage || item.notes || item.damageImageIds.length > 0);

      await staffBookingService.upsertPostTripInspection(booking.id, {
        noAdditionalDamage,
        summaryNotes: summaryNotes.trim() || undefined,
        items: noAdditionalDamage ? [] : items,
      });

      handleSuccess('Post-trip inspection saved', 'Settlement actions are now available when payment is due.');
      router.push(`/staff/bookings/${booking.id}`);
    } catch (error) {
      handleError(error, 'Failed to save post-trip inspection');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center gap-2 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading inspection...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center text-gray-500">
        Booking not found.
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <Button variant="outline" size="sm" onClick={() => router.push(`/staff/bookings/${booking.id}`)}>
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Booking Detail
      </Button>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Post-Trip Damage Capture</h1>
        <p className="text-sm text-gray-600">
          Booking ID: <span className="font-mono">{booking.id}</span>
        </p>

        {!canEditInspection && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            Inspection is read-only because this booking is not in post-return, in-progress state.
          </div>
        )}

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={noAdditionalDamage}
              disabled={!canEditInspection || saving}
              onChange={(e) => setNoAdditionalDamage(e.target.checked)}
            />
            No additional damage found after trip
          </label>
          <textarea
            value={summaryNotes}
            onChange={(e) => setSummaryNotes(e.target.value)}
            disabled={!canEditInspection || saving}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
            rows={3}
            placeholder="Overall inspection summary"
          />
          <p className="text-xs text-amber-700">
            Note: Images uploaded in this post-trip session but not linked in the final saved inspection are deleted automatically.
          </p>
        </div>
      </div>

      {!noAdditionalDamage && (
        <div className="space-y-4">
          {booking.cars.map((car) => {
            const draft = carDrafts[car.id] ?? createEmptyDraft();
            return (
              <div key={car.id} className="bg-white border rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {car.brand} {car.model}
                    </h2>
                    <p className="text-xs text-gray-500">Car ID: {car.id}</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={draft.hasNewDamage}
                      disabled={!canEditInspection || saving}
                      onChange={(e) =>
                        updateCarDraft(car.id, (current) => {
                          if (e.target.checked) {
                            return {
                              ...current,
                              hasNewDamage: true,
                            };
                          }

                          current.selectedImages.forEach((image) => {
                            if (image.preview) {
                              URL.revokeObjectURL(image.preview);
                            }
                          });

                          return {
                            ...current,
                            hasNewDamage: false,
                            notes: '',
                            selectedImages: [],
                            linkedDamageImageIds: [],
                            uploadedDamageImageCount: 0,
                          };
                        })
                      }
                    />
                    Has new damage
                  </label>
                </div>

                {draft.hasNewDamage && (
                  <>
                    <textarea
                      value={draft.notes}
                      onChange={(e) =>
                        updateCarDraft(car.id, (current) => ({
                          ...current,
                          notes: e.target.value,
                        }))
                      }
                      disabled={!canEditInspection || saving}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                      rows={2}
                      placeholder="Damage notes for this car"
                    />

                    <div className="text-xs text-gray-600">
                      Uploaded additional damage images: {draft.linkedDamageImageIds.length}
                    </div>

                    <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={!canEditInspection || saving || draft.isUploading}
                          onChange={(e) => {
                            handleSelectImages(car.id, e.target.files);
                            e.currentTarget.value = '';
                          }}
                          className="text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!canEditInspection || saving || draft.isUploading || draft.selectedImages.length === 0}
                          onClick={() => uploadCarDamageImages(car.id)}
                        >
                          {draft.isUploading ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-1" />
                          )}
                          Upload Selected Images
                        </Button>
                      </div>

                      {draft.selectedImages.length > 0 && (
                        <div className="space-y-2">
                          {draft.selectedImages.map((image, index) => (
                            <div key={`${car.id}-${index}`} className="border rounded-lg bg-white p-3 flex gap-3">
                              <img
                                src={image.preview}
                                alt={`Damage preview ${index + 1}`}
                                className="w-24 h-16 object-cover rounded border"
                              />
                              <div className="flex-1 space-y-1">
                                <input
                                  value={image.description}
                                  onChange={(e) => updateImageDescription(car.id, index, e.target.value)}
                                  disabled={!canEditInspection || saving || draft.isUploading}
                                  className="w-full border border-gray-300 rounded p-2 text-sm"
                                  placeholder="Describe this damage image"
                                />
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(image.compressedSize || image.file.size)}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                disabled={!canEditInspection || saving || draft.isUploading}
                                onClick={() => removeSelectedImage(car.id, index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white border rounded-xl p-6 flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.push(`/staff/bookings/${booking.id}`)}
          disabled={saving}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveInspection}
          disabled={!canEditInspection || saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Inspection
        </Button>
      </div>
    </div>
  );
}
