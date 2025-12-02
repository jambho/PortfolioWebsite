'use client';

import { useState, useEffect } from 'react';

interface MatrixCodeHuntProps {
  onComplete: () => void;
}

interface TargetChar {
  id: number;
  char: string;
  x: number;
  y: number;
  found: boolean;
}

const TARGET_COUNT = 5;

export default function MatrixCodeHunt({ onComplete }: MatrixCodeHuntProps) {
  const [targets, setTargets] = useState<TargetChar[]>([]);
  const [foundCount, setFoundCount] = useState(0);
  const [coordinates, setCoordinates] = useState<string[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [matrixColumns, setMatrixColumns] = useState<Array<{chars: string[], speed: number}>>([]);

  // Generate random Matrix characters
  const getRandomChar = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    return chars[Math.floor(Math.random() * chars.length)];
  };

  // Initialize background matrix rain
  useEffect(() => {
    const columns = [];
    const numColumns = 40;
    for (let i = 0; i < numColumns; i++) {
      const columnChars = [];
      for (let j = 0; j < 25; j++) {
        columnChars.push(getRandomChar());
      }
      columns.push({
        chars: columnChars,
        speed: Math.random() * 5 + 8, // Slower animation: 8-13 seconds
      });
    }
    setMatrixColumns(columns);
  }, []);

  // Initialize target characters with better positioning
  useEffect(() => {
    const newTargets: TargetChar[] = [];
    const coordinateParts = ['3', '7', '.', '4', '2'];
    const usedPositions = new Set<string>();

    for (let i = 0; i < TARGET_COUNT; i++) {
      let x, y;
      let attempts = 0;
      do {
        // Spread targets across the screen more evenly
        x = 15 + Math.random() * 70; // 15-85% of screen width
        y = 20 + Math.random() * 60; // 20-80% of screen height
        attempts++;
      } while (
        (usedPositions.has(`${Math.floor(x / 15)}-${Math.floor(y / 15)}`) && attempts < 100)
      );

      usedPositions.add(`${Math.floor(x / 15)}-${Math.floor(y / 15)}`);

      newTargets.push({
        id: i,
        char: coordinateParts[i],
        x,
        y,
        found: false,
      });
    }

    setTargets(newTargets);
  }, []);

  const handleCharClick = (targetId: number) => {
    const target = targets.find(t => t.id === targetId);
    if (!target || target.found) return;

    // Mark target as found
    setTargets(prev =>
      prev.map(t =>
        t.id === targetId ? { ...t, found: true } : t
      )
    );

    setCoordinates(prev => [...prev, target.char]);
    setFoundCount(prev => prev + 1);

    // Check if all found
    if (foundCount + 1 === TARGET_COUNT) {
      setTimeout(() => {
        setShowCompletion(true);
        setTimeout(() => {
          onComplete();
        }, 3000);
      }, 500);
    }
  };

  return (
    <div className="matrix-hunt-overlay">
      {/* Header */}
      <div className="matrix-hunt-header">
        <div className="text-accent font-bold text-xl">
          LOCATE THE COORDINATES
        </div>
        <div className="text-foreground text-lg">
          Found: {foundCount} / {TARGET_COUNT}
        </div>
        <div className="text-accent font-mono text-2xl font-bold mt-2">
          {coordinates.join('')}
        </div>
      </div>

      {/* Slow Matrix Rain Background */}
      <div className="matrix-rain-background">
        {matrixColumns.map((column, colIndex) => (
          <div
            key={colIndex}
            className="matrix-background-column"
            style={{
              left: `${(colIndex / matrixColumns.length) * 100}%`,
              animationDuration: `${column.speed}s`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            {column.chars.map((char, charIndex) => (
              <span key={charIndex} className="matrix-bg-char">
                {char}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Stationary Target Characters */}
      {targets.map((target) => (
        <button
          key={target.id}
          onClick={() => handleCharClick(target.id)}
          className={`matrix-target-button ${target.found ? 'found' : 'active'}`}
          disabled={target.found}
          style={{
            left: `${target.x}%`,
            top: `${target.y}%`,
          }}
        >
          <span className="target-char-content">{target.char}</span>
        </button>
      ))}

      {/* Completion Message */}
      {showCompletion && (
        <div className="matrix-hunt-completion">
          <div className="completion-content">
            <h2 className="text-4xl md:text-5xl font-bold terminal-glow mb-4">
              COORDINATES ACQUIRED
            </h2>
            <div className="text-4xl md:text-5xl font-mono text-accent mb-6 font-bold">
              {coordinates.join('')}
            </div>
            <p className="text-lg md:text-xl text-secondary">
              Location triangulated. Preparing transport to The Architect's Chamber...
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="matrix-hunt-instructions">
        <p className="text-base text-foreground font-bold">
          Click the glowing <span className="text-accent">orange</span> characters
        </p>
      </div>
    </div>
  );
}
