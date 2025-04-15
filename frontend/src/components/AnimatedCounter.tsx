"use client";

import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  endValue: string;
  initialValue?: string;
  duration?: number;
  delayBetweenDigits?: number;
}

interface DigitProps {
  value: string;
  animationDelay: number;
}

const Digit: React.FC<DigitProps> = ({ value, animationDelay }) => {
  const [currentValue, setCurrentValue] = useState('0');
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentValue(value);
        setTimeout(() => {
          setIsFlipping(false);
        }, 500);
      }, 500);
    }, animationDelay);

    return () => clearTimeout(timeout);
  }, [value, animationDelay]);

  return (
    <div className="relative inline-block w-[40px] md:w-[60px] lg:w-[80px] h-[60px] md:h-[90px] lg:h-[120px] mx-0.5 md:mx-1">
      <div 
        className={`bg-gray-900 rounded-lg text-white text-2xl md:text-4xl lg:text-6xl font-bold flex items-center justify-center w-full h-full transition-all duration-500 transform ${
          isFlipping ? 'animate-flip' : ''
        }`}
      >
        {currentValue}
      </div>
    </div>
  );
};

const Separator: React.FC<{ value: string }> = ({ value }) => {
  return (
    <div className="inline-flex items-center justify-center mx-0.5 md:mx-1 text-2xl md:text-4xl lg:text-6xl font-bold text-white">
      {value}
    </div>
  );
};

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  endValue,
  initialValue = "0",
  duration = 2000,
  delayBetweenDigits = 100,
}) => {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);
  
  // Özel format fonksiyonu - sayıları düzgün formatlar
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Görünürlüğü izlemek için Intersection Observer kurulumu
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 } // %10'u göründüğünde tetikle
    );
    
    if (counterRef.current) {
      observer.observe(counterRef.current);
    }
    
    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, []);
  
  // Sayaç animasyonu - sadece görünür olduğunda başla
  useEffect(() => {
    if (!isVisible) return;
    
    // Başlangıç ve bitiş değerlerini sayılara dönüştür (virgülleri kaldır)
    const startNum = Number(initialValue.replace(/,/g, ''));
    const endNum = Number(endValue.replace(/,/g, ''));
    
    // Animasyon süresi
    const animationDuration = 3000; // 3 saniye
    const stepTime = 20; // Her 20 ms'de bir güncelle
    const totalSteps = animationDuration / stepTime;
    const stepValue = (endNum - startNum) / totalSteps;
    
    let currentStep = 0;
    let currentNum = startNum;
    
    const timer = setInterval(() => {
      currentStep++;
      currentNum += stepValue;
      
      if (currentStep >= totalSteps) {
        clearInterval(timer);
        setCurrentValue(endValue); // Tam bitiş değerini göster
      } else {
        // Sayıyı özel format fonksiyonu ile formatlayarak göster
        setCurrentValue(formatNumber(Math.floor(currentNum)));
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [initialValue, endValue, isVisible]);
  
  // Karakterleri ayır (rakamlar ve ayraçlar)
  const characters = currentValue.split('');
  
  return (
    <div ref={counterRef} className="flex justify-center items-center py-8">
      <div className="flex items-center justify-center">
        {characters.map((char, index) => {
          // Eğer karakter rakam ise Digit bileşenini göster, değilse Separator bileşenini göster
          if (char === ',' || char === '$' || char === '.') {
            return <Separator key={`sep-${index}`} value={char} />;
          } else {
            return (
              <Digit 
                key={`digit-${index}`}
                value={char}
                animationDelay={index * delayBetweenDigits}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export default AnimatedCounter; 