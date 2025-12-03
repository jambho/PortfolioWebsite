'use client';

import { useState, useEffect } from 'react';

interface WhiteRabbitProps {
  onClick: () => void;
}

export default function WhiteRabbit({ onClick }: WhiteRabbitProps) {
  const [position, setPosition] = useState({ x: 90, y: 80 });
  const [isVisible, setIsVisible] = useState(true);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    // Move rabbit to random position every 5 seconds
    const interval = setInterval(() => {
      const newX = Math.random() * 80 + 10; // 10-90% of screen width
      const newY = Math.random() * 60 + 20; // 20-80% of screen height
      setPosition({ x: newX, y: newY });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    setClickCount(prev => prev + 1);

    if (clickCount + 1 >= 10) {
      // Easter egg: 10 clicks triggers hyperspace mode
      document.body.classList.add('hyperspace-mode');
      setTimeout(() => {
        document.body.classList.remove('hyperspace-mode');
      }, 3000);
    }

    setIsVisible(false);
    setTimeout(() => {
      onClick();
    }, 500);
  };

  return (
    <div
      className={`white-rabbit ${isVisible ? 'visible' : 'hidden'}`}
      style={{
        position: 'fixed',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        transition: 'all 2s ease-in-out',
        zIndex: 40,
        cursor: 'pointer',
      }}
      onClick={handleClick}
    >
      <div className="rabbit-container">
        <svg
          width="50"
          height="50"
          viewBox="0 0 100 100"
          className="rabbit-svg"
        >
          {/* Rabbit ears */}
          <ellipse cx="30" cy="20" rx="8" ry="25" fill="white" opacity="0.8" />
          <ellipse cx="70" cy="20" rx="8" ry="25" fill="white" opacity="0.8" />

          {/* Rabbit head */}
          <circle cx="50" cy="50" r="30" fill="white" opacity="0.9" />

          {/* Eyes */}
          <circle cx="40" cy="45" r="4" fill="#ff6b35" />
          <circle cx="60" cy="45" r="4" fill="#ff6b35" />

          {/* Nose */}
          <circle cx="50" cy="55" r="3" fill="#ff6b35" />

          {/* Whiskers */}
          <line x1="30" y1="55" x2="15" y2="53" stroke="white" strokeWidth="1" />
          <line x1="30" y1="55" x2="15" y2="57" stroke="white" strokeWidth="1" />
          <line x1="70" y1="55" x2="85" y2="53" stroke="white" strokeWidth="1" />
          <line x1="70" y1="55" x2="85" y2="57" stroke="white" strokeWidth="1" />
        </svg>

        {/* Tooltip */}
        <div className="rabbit-tooltip">
          Follow the white rabbit...
        </div>
      </div>
    </div>
  );
}
