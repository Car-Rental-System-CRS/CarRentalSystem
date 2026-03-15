'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Car, Calendar, Save, Upload, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  compressImage,
  formatFileSize,
  getImageDimensions,
} from '@/lib/imageUtils';
import { ImageWithDescription } from '@/types/carType';

export type AddUnitFormState = {
  license: string;
  importDate: string;
};

type Props = {
  form: AddUnitFormState;
  loading: boolean;
  onChange: React.Dispatch<React.SetStateAction<AddUnitFormState>>;
  onSubmit: (e: React.FormEvent, damageImages: ImageWithDescription[]) => void;
  onCancel: () => void;
};

export default function AddUnitForm({
  form,
  loading,
  onChange,
  onSubmit,
  onCancel,
}: Props) {
  const [damageImages, setDamageImages] = useState<ImageWithDescription[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const damageImagesRef = useRef<ImageWithDescription[]>([]);

  useEffect(() => {
    damageImagesRef.current = damageImages;
  }, [damageImages]);

  useEffect(() => {
    return () => {
      damageImagesRef.current.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  const processImages = async (files: File[]) => {
    const allowedFiles = files.slice(0, Math.max(0, 10 - damageImages.length));
    if (allowedFiles.length < files.length) {
      alert('You can upload at most 10 damage images per request.');
    }

    if (allowedFiles.length === 0) {
      return;
    }

    setIsProcessingImages(true);

    try {
      const processedImages = await Promise.all(
        allowedFiles.map(async (originalFile) => {
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

      setDamageImages((prev) => [...prev, ...processedImages]);
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await processImages(files);
    }
    e.target.value = '';
  };

  const triggerFilePicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        await processImages(Array.from(target.files));
      }
    };
    input.click();
  };

  const removeImage = (index: number) => {
    const item = damageImages[index];
    if (item?.preview) {
      URL.revokeObjectURL(item.preview);
    }
    setDamageImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateImageDescription = (index: number, description: string) => {
    setDamageImages((prev) =>
      prev.map((item, i) => (i === index ? { ...item, description } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (isProcessingImages) {
      e.preventDefault();
      alert('Please wait for image processing to complete.');
      return;
    }
    onSubmit(e, damageImages);
  };

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="p-6 border-b bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">
          Unit Information
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the details for the new vehicle unit
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* License Plate */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium flex items-center gap-2">
            <Car className="w-4 h-4" />
            License Plate *
          </Label>
          <Input
            value={form.license}
            onChange={(e) =>
              onChange((p) => ({
                ...p,
                license: e.target.value.toUpperCase(),
              }))
            }
            required
            placeholder="e.g., ABC-123, XYZ-789"
            className="text-base py-3 uppercase"
            maxLength={20}
          />
        </div>

        {/* Import Date */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Import Date *
          </Label>
          <Input
            type="date"
            value={form.importDate}
            onChange={(e) =>
              onChange((p) => ({ ...p, importDate: e.target.value }))
            }
            required
            className="py-3"
          />
        </div>

        {/* Damage Images */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Existing Damage Images (Optional)
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerFilePicker}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Images
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            Upload existing damage photos and descriptions for this unit. Maximum
            10 images per upload.
          </p>

          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="cursor-pointer"
          />

          {isProcessingImages && (
            <div className="border rounded-lg p-4 bg-blue-50 text-blue-700 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing images...
            </div>
          )}

          {damageImages.length > 0 && (
            <div className="space-y-3">
              {damageImages.map((item, index) => (
                <div key={index} className="border rounded-lg p-3 flex gap-3">
                  <img
                    src={item.preview}
                    alt={`Damage preview ${index + 1}`}
                    className="w-28 h-20 object-cover rounded border"
                  />
                  <div className="flex-1 space-y-2">
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateImageDescription(index, e.target.value)
                      }
                      placeholder="Describe the damage in this image"
                    />
                    <p className="text-xs text-gray-500">
                      {formatFileSize(item.compressedSize || item.file.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-6 border-t">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="flex-1 gap-2 py-3 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Creating Unit...' : 'Create Vehicle Unit'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
