"use client";

import React, { useState, useEffect, useRef } from 'react';

interface CounterAnimationProps {
  endValue: number;
  duration: number; // milisaniye cinsinden
  prefix?: string;
  suffix?: string;
  separator?: string;
  decimals?: number;
}

export const CounterAnimation: React.FC<CounterAnimationProps> = ({
  endValue,
  duration,
  prefix = '',
  suffix = '',
  separator = ',',
  decimals = 0
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsedTime = timestamp - startTimeRef.current;
      const progress = Math.min(elapsedTime / duration, 1);
      
      countRef.current = Math.floor(progress * endValue);
      setCount(countRef.current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [endValue, duration]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('tr-TR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).replace(/\./g, separator);
  };

  return (
    <span className="counter-animation">
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};

export default CounterAnimation; 