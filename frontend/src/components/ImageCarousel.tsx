"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface ImageCarouselProps {
  images: string[];
  autoplaySpeed?: number;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  autoplaySpeed = 3000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    // Mobil cihaz kontrolü
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // İlk yükleme kontrolü
    checkMobile();

    // Ekran boyutu değiştiğinde kontrol et
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    resetTimeout();
    
    // Son indeksi mobil için farklı hesapla
    const lastIndex = isMobile 
      ? images.length - 2 
      : images.length - 3;
    
    // Otomatik kaydırma için zamanlayıcı ayarla
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === lastIndex ? 0 : prevIndex + 1
      );
    }, autoplaySpeed);
    
    return () => {
      resetTimeout();
    };
  }, [currentIndex, autoplaySpeed, images.length, isMobile]);

  // Görünen resim sayısı
  const visibleImages = isMobile ? 2 : 3;

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <div 
        className="flex transition-transform duration-1000 ease-in-out"
        style={{ 
          transform: `translateX(-${currentIndex * (100 / images.length)}%)`,
          width: `${(images.length * 100) / visibleImages}%`
        }}
      >
        {images.map((image, index) => (
          <div 
            key={index} 
            className="relative h-64 md:h-80"
            style={{ 
              width: `${(100 / images.length) * visibleImages}%`,
              paddingRight: '16px',
              paddingLeft: '4px'
            }}
          >
            <div className="h-full w-full overflow-hidden rounded-2xl border-2 border-primary-300 shadow-lg">
              <Image
                src={image}
                alt={`Stake paketi görseli ${index + 1}`}
                fill
                className="object-cover pr-2 rounded-xl"
                sizes="(max-width: 768px) 50vw, 33vw"
                priority={index < visibleImages}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Gösterge noktaları */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {Array.from({ length: images.length - (isMobile ? 1 : 2) }).map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-colors ${
              currentIndex === index ? 'bg-primary-600' : 'bg-primary-300'
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Slayt ${index + 1}'e git`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel; 