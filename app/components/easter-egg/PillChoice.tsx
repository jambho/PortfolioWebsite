'use client';

import { useState } from 'react';

interface PillChoiceProps {
  onChoice: (pill: 'red' | 'blue') => void;
}

export default function PillChoice({ onChoice }: PillChoiceProps) {
  const [hoveredPill, setHoveredPill] = useState<'red' | 'blue' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleChoice = (pill: 'red' | 'blue') => {
    setIsTransitioning(true);
    setTimeout(() => {
      onChoice(pill);
    }, 1500);
  };

  return (
    <div className={`pill-choice-overlay ${isTransitioning ? 'transitioning' : ''}`}>
      <div className="pill-choice-container">
        {/* Morpheus Quote */}
        <div className="morpheus-quote">
          <p className="text-2xl md:text-4xl font-bold terminal-glow mb-8 text-center">
            "This is your last chance."
          </p>
          <p className="text-lg md:text-xl text-secondary text-center mb-12">
            After this, there is no turning back.
          </p>
        </div>

        {/* Pills Container */}
        <div className="pills-container">
          {/* Blue Pill */}
          <div
            className={`pill-wrapper ${hoveredPill === 'blue' ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredPill('blue')}
            onMouseLeave={() => setHoveredPill(null)}
            onClick={() => handleChoice('blue')}
          >
            <div className="pill blue-pill">
              <div className="pill-shine"></div>
            </div>
            <p className="pill-description">
              You take the <span className="text-blue-400 font-bold">blue pill</span>
              <br />
              The story ends, you wake up in your bed
              <br />
              and believe whatever you want to believe.
            </p>
          </div>

          {/* Red Pill */}
          <div
            className={`pill-wrapper ${hoveredPill === 'red' ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredPill('red')}
            onMouseLeave={() => setHoveredPill(null)}
            onClick={() => handleChoice('red')}
          >
            <div className="pill red-pill">
              <div className="pill-shine"></div>
            </div>
            <p className="pill-description">
              You take the <span className="text-accent font-bold">red pill</span>
              <br />
              You stay in Wonderland, and I show you
              <br />
              how deep the rabbit hole goes.
            </p>
          </div>
        </div>

        {/* Reminder */}
        <div className="choice-reminder">
          <p className="text-sm text-secondary italic">
            Remember: All I'm offering is the truth. Nothing more.
          </p>
        </div>
      </div>

      {/* Transition Effect */}
      {isTransitioning && (
        <div className="whoosh-transition">
          <div className="whoosh-lines"></div>
        </div>
      )}
    </div>
  );
}
