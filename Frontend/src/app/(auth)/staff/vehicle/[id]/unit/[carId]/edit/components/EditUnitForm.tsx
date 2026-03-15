'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Car, Calendar, Save, Upload, Plus, X, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  compressImage,
  formatFileSize,
  getImageDimensions,
} from '@/lib/imageUtils';
import { ImageWithDescription } from '@/types/carType';
import { CarDamageImage } from '@/types/car';
import { getServerUrl } from '@/lib/utils';

type FormState = {
  license: string;
  importDate: string;
};

interface Props {
  form: FormState;
  loading: boolean;
  existingDamageImages: CarDamageImage[];
  deletingImageId: string | null;
  onChange: React.Dispatch<React.SetStateAction<FormState>>;
  onDeleteExistingDamageImage: (imageId: string) => void;
  onSubmit: (e: React.FormEvent, newDamageImages: ImageWithDescription[]) => void;
  onCancel: () => void;
}

export default function EditUnitForm({
  form,
  loading,
  existingDamageImages,
  deletingImageId,
  onChange,
  onDeleteExistingDamageImage,
  onSubmit,
  onCancel,
}: Props) {
  const [newDamageImages, setNewDamageImages] = useState<ImageWithDescription[]>(
    []
  );
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const newDamageImagesRef = useRef<ImageWithDescription[]>([]);

  useEffect(() => {
    newDamageImagesRef.current = newDamageImages;
  }, [newDamageImages]);

  useEffect(() => {
    return () => {
      newDamageImagesRef.current.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  const processImages = async (files: File[]) => {
    const allowedFiles = files.slice(0, Math.max(0, 10 - newDamageImages.length));
    if (allowedFiles.length < files.length) {
      alert('You can upload at most 10 new damage images per request.');
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

      setNewDamageImages((prev) => [...prev, ...processedImages]);
    } finally {
      setIsProcessingImages(false);
    }
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await processImages(files);
    }
    e.target.value = '';
  };

  const removeNewImage = (index: number) => {
    const item = newDamageImages[index];
    if (item?.preview) {
      URL.revokeObjectURL(item.preview);
    }

    setNewDamageImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateNewImageDescription = (index: number, description: string) => {
    setNewDamageImages((prev) =>
      prev.map((item, i) => (i === index ? { ...item, description } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (isProcessingImages) {
      e.preventDefault();
      alert('Please wait for image processing to complete.');
      return;
    }

    onSubmit(e, newDamageImages);
  };

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="p-6 border-b bg-gray-50">
        <h2 className="text-xl font-semibold">Edit Unit Information</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <Field label="License Plate" icon={<Car />}>
          <Input
            value={form.license}
            onChange={(e) =>
              onChange((p) => ({ ...p, license: e.target.value.toUpperCase() }))
            }
            required
          />
        </Field>

        <Field label="Import Date" icon={<Calendar />}>
          <Input
            type="date"
            value={form.importDate}
            onChange={(e) =>
              onChange((p) => ({ ...p, importDate: e.target.value }))
            }
            required
          />
        </Field>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Existing Damage Images
            </Label>
          </div>

          {existingDamageImages.length === 0 ? (
            <p className="text-sm text-gray-500">No existing damage images.</p>
          ) : (
            <div className="space-y-3">
              {existingDamageImages.map((image) => (
                <div key={image.id} className="border rounded-lg p-3 flex gap-3">
                  <img
                    src={getServerUrl() + image.fileUrl}
                    alt={image.description || 'Damage image'}
                    className="w-28 h-20 object-cover rounded border"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {image.description || 'No description'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(image.fileSize)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => onDeleteExistingDamageImage(image.id)}
                    disabled={deletingImageId === image.id || loading}
                  >
                    {deletingImageId === image.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Add New Damage Images
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

          {newDamageImages.length > 0 && (
            <div className="space-y-3">
              {newDamageImages.map((item, index) => (
                <div key={index} className="border rounded-lg p-3 flex gap-3">
                  <img
                    src={item.preview}
                    alt={`New damage preview ${index + 1}`}
                    className="w-28 h-20 object-cover rounded border"
                  />
                  <div className="flex-1 space-y-2">
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateNewImageDescription(index, e.target.value)
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
                    onClick={() => removeNewImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-6 border-t flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}
