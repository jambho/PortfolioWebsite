'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface RabbitProps {
  readonly className?: string;
}

export default function AnimatedRabbit({ className = '' }: RabbitProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isHiding, setIsHiding] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMatrixMode, setIsMatrixMode] = useState(false);
  const router = useRouter();
  const rabbitRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  // Mouse tracking to make rabbit hide
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!rabbitRef.current || isMatrixMode) return;

      const rabbitRect = rabbitRef.current.getBoundingClientRect();
      const rabbitCenter = {
        x: rabbitRect.left + rabbitRect.width / 2,
        y: rabbitRect.top + rabbitRect.height / 2,
      };

      const distance = Math.sqrt(
        Math.pow(e.clientX - rabbitCenter.x, 2) + Math.pow(e.clientY - rabbitCenter.y, 2)
      );

      // If mouse is within 150px of rabbit, start hiding
      if (distance < 150 && !isHiding) {
        setIsHiding(true);
        // Clear any existing timeout
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      } else if (distance >= 150 && isHiding) {
        setIsHiding(false);
        // Clear any existing timeout
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        // Set a timeout to show rabbit again after mouse moves away
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(true);
        }, 500);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isHiding, isMatrixMode]);

  // Random movement when not hiding
  useEffect(() => {
    if (isHiding || isMatrixMode) return;

    const moveInterval = setInterval(() => {
      setPosition({
        x: Math.random() * (window.innerWidth - 60),
        y: Math.random() * (window.innerHeight - 60),
      });
    }, 3000);

    return () => clearInterval(moveInterval);
  }, [isHiding, isMatrixMode]);

  const handleRabbitClick = async () => {
    setIsMatrixMode(true);
    
    // Wait for matrix animation to complete, then navigate
    setTimeout(() => {
      router.push('/matrix');
    }, 3000);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Matrix overlay when clicked */}
      {isMatrixMode && (
        <div className="fixed inset-0 z-50 matrix-overlay">
          <div className="matrix-rain"></div>
          <div className="matrix-text">
            <div className="matrix-title">FOLLOW THE WHITE RABBIT</div>
            <div className="matrix-subtitle">Entering the Matrix...</div>
          </div>
        </div>
      )}
      
      {/* Animated Rabbit */}
      <button
        ref={rabbitRef}
        className={`fixed z-40 cursor-pointer transition-all duration-1000 ease-out border-none bg-transparent p-0 ${className} ${
          isHiding ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: isHiding ? 'translate(50px, 50px)' : 'translate(0, 0)',
        }}
        onClick={handleRabbitClick}
        aria-label="Click to follow the white rabbit"
        type="button"
      >
        <div className="rabbit-container">
          <div className="rabbit-body">
            <div className="rabbit-ear rabbit-ear-left"></div>
            <div className="rabbit-ear rabbit-ear-right"></div>
            <div className="rabbit-head">
              <div className="rabbit-eye rabbit-eye-left"></div>
              <div className="rabbit-eye rabbit-eye-right"></div>
              <div className="rabbit-nose"></div>
              <div className="rabbit-mouth"></div>
            </div>
            <div className="rabbit-tail"></div>
          </div>
        </div>
      </button>
    </>
  );
}
