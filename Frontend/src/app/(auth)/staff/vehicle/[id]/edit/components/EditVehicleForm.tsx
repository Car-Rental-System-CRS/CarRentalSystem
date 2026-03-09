'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Save,
  Car,
  Tag,
  Users,
  Fuel,
  DollarSign,
  Upload,
  X,
  Plus,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  compressImage,
  getImageDimensions,
  formatFileSize,
} from '@/lib/imageUtils';

import { CarBrand } from '@/types/brand';
import { CreateCarTypePayload, ImageWithDescription } from '@/types/carType';

type Props = {
  brands: CarBrand[];
  initialValues?: CreateCarTypePayload;
  onSubmit: (
    payload: CreateCarTypePayload,
    imagesWithDescriptions?: ImageWithDescription[]
  ) => Promise<void>;
  loading?: boolean;
  submitText?: string;
};

export default function EditVehicleForm({
  brands,
  initialValues,
  onSubmit,
  loading = false,
  submitText = 'Save',
}: Props) {
  const [form, setForm] = useState<CreateCarTypePayload>({
    name: '',
    brandId: '',
    numberOfSeats: 5,
    consumptionKwhPerKm: 0,
    price: 0,
  });

  const [imagesWithDescriptions, setImagesWithDescriptions] = useState<
    ImageWithDescription[]
  >([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initialValues && !initializedRef.current) {
      setForm(initialValues);
      initializedRef.current = true;
    }
  }, [initialValues]);

  const handleChange = <K extends keyof CreateCarTypePayload>(
    field: K,
    value: CreateCarTypePayload[K]
  ) => {
    // Validate numberOfSeats to be between 2 and 8
    if (field === 'numberOfSeats') {
      const seatValue = Number(value);
      if (seatValue < 2 || seatValue > 8) {
        return; // Don't update if outside valid range
      }
    }

    setForm((p) => ({ ...p, [field]: value }));
  };

  const processImages = async (files: File[]) => {
    setIsProcessingImages(true);

    try {
      const processedImages = await Promise.all(
        files.map(async (originalFile) => {
          try {
            // Get original dimensions and size
            const dimensions = await getImageDimensions(originalFile);
            const originalSize = originalFile.size;

            // Compress if image is larger than 2MB or dimensions are too large
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
              isProcessing: false,
              originalSize,
              compressedSize: processedFile.size,
              dimensions,
            };
          } catch (error) {
            console.error('Error processing image:', error);
            // If compression fails, use original file
            return {
              file: originalFile,
              originalFile,
              description: '',
              preview: URL.createObjectURL(originalFile),
              isProcessing: false,
              originalSize: originalFile.size,
              compressedSize: originalFile.size,
              dimensions: { width: 0, height: 0 },
            };
          }
        })
      );

      setImagesWithDescriptions((prev) => [...prev, ...processedImages]);
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 0) {
      await processImages(files);
    }

    // Reset file input
    e.target.value = '';
  };

  const addImageSlot = () => {
    // Create a new file input element to trigger file selection
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const files = Array.from(target.files);
        await processImages(files);
      }
    };
    input.click();
  };

  const removeImage = (index: number) => {
    const item = imagesWithDescriptions[index];
    if (item?.preview) {
      URL.revokeObjectURL(item.preview);
    }

    setImagesWithDescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateImageDescription = (index: number, description: string) => {
    setImagesWithDescriptions((prev) =>
      prev.map((item, i) => (i === index ? { ...item, description } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isProcessingImages) {
      alert('Please wait for images to finish processing before submitting.');
      return;
    }

    await onSubmit(form, imagesWithDescriptions);
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagesWithDescriptions.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [imagesWithDescriptions]);

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Car className="w-4 h-4" /> Model Name *
        </Label>
        <Input
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Tag className="w-4 h-4" /> Brand *
        </Label>
        <select
          className="w-full border rounded-lg px-4 py-3 text-sm bg-gray-100 cursor-not-allowed"
          value={form.brandId}
          disabled
        >
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Seats
          </Label>
          <Input
            type="number"
            min={2}
            max={8}
            value={form.numberOfSeats}
            onChange={(e) =>
              handleChange('numberOfSeats', Number(e.target.value))
            }
          />
          <p className="text-xs text-gray-500">Must be between 2 and 8 seats</p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Fuel className="w-4 h-4" /> Consumption (kWh/km)
          </Label>
          <Input
            type="number"
            step="0.01"
            min={0}
            value={form.consumptionKwhPerKm}
            onChange={(e) =>
              handleChange('consumptionKwhPerKm', Number(e.target.value))
            }
          />
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Price *
        </Label>
        <Input
          type="number"
          min={0}
          value={form.price}
          onChange={(e) => handleChange('price', Number(e.target.value))}
          required
        />
      </div>

      {/* Images with Descriptions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Upload className="w-4 h-4" /> Add New Images with Descriptions
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImageSlot}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Images
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          Upload new images and add descriptions for each image. Large images
          (2MB or 1920×1080) will be automatically compressed for optimal
          performance.
        </p>

        {/* Hidden file input for initial selection */}
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="cursor-pointer"
          style={{ display: 'none' }}
          id="hidden-file-input"
        />

        {/* Image Previews with Description Inputs */}
        {imagesWithDescriptions.length > 0 && (
          <div className="space-y-4">
            {imagesWithDescriptions.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative group">
                    <img
                      src={item.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-32 h-24 object-cover rounded-lg border"
                    />
                    {item.isProcessing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-2">
                    <Label
                      htmlFor={`description-${index}`}
                      className="text-sm font-medium"
                    >
                      Image Description {index + 1}
                    </Label>
                    <Input
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) =>
                        updateImageDescription(index, e.target.value)
                      }
                      placeholder="Enter a description for this image..."
                      className="w-full"
                    />

                    {/* Image Info */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-2">
                        <span>
                          Size:{' '}
                          {formatFileSize(
                            item.compressedSize || item.file.size
                          )}
                        </span>
                        {item.originalSize &&
                          item.compressedSize &&
                          item.originalSize > item.compressedSize && (
                            <span className="text-green-600">
                              (compressed from{' '}
                              {formatFileSize(item.originalSize)})
                            </span>
                          )}
                      </div>
                      {item.dimensions && item.dimensions.width > 0 && (
                        <div>
                          Dimensions: {item.dimensions.width} ×{' '}
                          {item.dimensions.height}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      Describe what users will see in this image (e.g., "Front
                      view", "Interior dashboard", "Engine bay")
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Processing indicator */}
        {isProcessingImages && (
          <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
            <p className="text-blue-700 font-medium">Processing images...</p>
            <p className="text-blue-600 text-sm">
              Compressing large images for optimal upload
            </p>
          </div>
        )}

        {imagesWithDescriptions.length === 0 && !isProcessingImages && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No new images to add</p>
            <p className="text-sm text-gray-500 mb-4">
              Click "Add Images" to upload additional vehicle photos with
              descriptions
            </p>
            <p className="text-xs text-gray-400">
              Large images will be automatically compressed for faster upload
            </p>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="pt-6 border-t">
        <Button
          type="submit"
          disabled={loading || isProcessingImages}
          className="w-full gap-2"
        >
          {isProcessingImages ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing Images...
            </>
          ) : loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {submitText}
            </>
          )}
        </Button>

        {isProcessingImages && (
          <p className="text-xs text-orange-600 mt-2 text-center flex items-center justify-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Please wait for image processing to complete
          </p>
        )}
      </div>
    </form>
  );
}
