'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MediaFile } from '@/types/carType';
import { ImageIcon, X } from 'lucide-react';
import { getServerUrl } from '@/lib/utils';

interface VehicleImagesCardProps {
  mediaFiles?: MediaFile[];
  vehicleName: string;
}

export default function VehicleImagesCard({
  mediaFiles,
  vehicleName,
}: VehicleImagesCardProps) {
  const [selectedImage, setSelectedImage] = useState<MediaFile | null>(null);

  const sortedImages = mediaFiles?.slice().sort((a, b) => {
    const orderA = a.displayOrder ?? 999;
    const orderB = b.displayOrder ?? 999;
    return orderA - orderB;
  });

  return (
    <>
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Car Type Images</h2>
        </div>

        {!sortedImages || sortedImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <ImageIcon className="w-12 h-12 mb-2" />
            <p className="text-sm">No images available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedImages.map((file) => (
              <button
                key={file.id}
                onClick={() => setSelectedImage(file)}
                className="relative aspect-video rounded-lg overflow-hidden border hover:border-primary hover:shadow-md transition-all group cursor-pointer"
              >
                <Image
                  src={getServerUrl() + file.fileUrl}
                  alt={file.description || vehicleName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  unoptimized={true}
                />
                {file.displayOrder === 0 && (
                  <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                    Primary
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {sortedImages && sortedImages.length > 0 && (
          <p className="text-sm text-gray-500 mt-4">
            {sortedImages.length} image{sortedImages.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="relative max-w-4xl max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={getServerUrl() + selectedImage.fileUrl}
              alt={selectedImage.description || vehicleName}
              fill
              className="object-contain"
              sizes="(max-width: 1536px) 100vw, 1536px"
              unoptimized={true}
            />
          </div>
          {selectedImage.description && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded">
              {selectedImage.description}
            </p>
          )}
        </div>
      )}
    </>
  );
}
