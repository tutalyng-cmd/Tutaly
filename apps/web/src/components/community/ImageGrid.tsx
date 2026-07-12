'use client';

import React, { useState } from 'react';
import { ImageLightbox } from './ImageLightbox';

interface ImageGridProps {
  images: { mediaUrl: string; orderIndex: number }[];
}

export function ImageGrid({ images }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  const handleImageClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    setSelectedImage(url);
  };

  const sortedImages = [...images].sort((a, b) => a.orderIndex - b.orderIndex);
  const displayImages = sortedImages.slice(0, 4);
  const extraCount = Math.max(0, images.length - 4);

  const getGridClass = () => {
    switch (displayImages.length) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
      case 4:
        return 'grid-cols-2 grid-rows-2';
      default:
        return 'grid-cols-1';
    }
  };

  return (
    <>
      <div className={`mt-3 grid gap-1 overflow-hidden rounded-xl ${getGridClass()}`}>
        {displayImages.map((img, index) => {
          const isLastAndExtra = index === 3 && extraCount > 0;
          return (
            <div
              key={img.mediaUrl}
              className="group relative aspect-square cursor-pointer overflow-hidden bg-gray-100"
              onClick={(e) => handleImageClick(e, img.mediaUrl)}
            >
              <img
                src={img.mediaUrl}
                alt={`Post image ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {isLastAndExtra && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="text-2xl font-semibold text-white">+{extraCount}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ImageLightbox
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage}
      />
    </>
  );
}
