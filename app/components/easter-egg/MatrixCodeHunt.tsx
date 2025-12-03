'use client';

import { useState, useEffect, useCallback } from 'react';

interface MatrixCodeHuntProps {
  onComplete: () => void;
}

interface TargetChar {
  id: number;
  char: string;
  column: number;
  row: number;
  found: boolean;
}

const COLUMNS = 50;
const ROWS = 30;
const TARGET_COUNT = 7;

export default function MatrixCodeHunt({ onComplete }: MatrixCodeHuntProps) {
  const [targets, setTargets] = useState<TargetChar[]>([]);
  const [foundCount, setFoundCount] = useState(0);
  const [coordinates, setCoordinates] = useState<string[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);

  // Generate random Matrix characters
  const getRandomChar = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
    return chars[Math.floor(Math.random() * chars.length)];
  };

  // Initialize target characters
  useEffect(() => {
    const newTargets: TargetChar[] = [];
    const coordinateParts = ['37', '.', '42', '19', '-', '11', '8'];
    const usedPositions = new Set<string>();

    for (let i = 0; i < TARGET_COUNT; i++) {
      let col, row;
      do {
        col = Math.floor(Math.random() * COLUMNS);
        row = Math.floor(Math.random() * (ROWS - 5)) + 2; // Avoid top and bottom edges
      } while (usedPositions.has(`${col}-${row}`));

      usedPositions.add(`${col}-${row}`);

      newTargets.push({
        id: i,
        char: coordinateParts[i],
        column: col,
        row: row,
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
        <div className="text-foreground">
          Found: {foundCount} / {TARGET_COUNT}
        </div>
        <div className="text-secondary font-mono text-lg">
          {coordinates.join('')}
        </div>
      </div>

      {/* Matrix Rain */}
      <div className="matrix-rain-hunt">
        {[...Array(COLUMNS)].map((_, colIndex) => (
          <div
            key={colIndex}
            className="matrix-hunt-column"
            style={{
              left: `${(colIndex / COLUMNS) * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 5 + 10}s`,
            }}
          >
            {[...Array(ROWS)].map((_, rowIndex) => {
              const target = targets.find(
                t => t.column === colIndex && t.row === rowIndex
              );

              if (target) {
                return (
                  <button
                    key={rowIndex}
                    onClick={() => handleCharClick(target.id)}
                    className={`matrix-char target-char ${target.found ? 'found' : 'active'}`}
                    disabled={target.found}
                  >
                    {target.char}
                  </button>
                );
              }

              return (
                <span key={rowIndex} className="matrix-char normal-char">
                  {getRandomChar()}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {showCompletion && (
        <div className="matrix-hunt-completion">
          <div className="completion-content">
            <h2 className="text-4xl font-bold terminal-glow mb-4">
              COORDINATES ACQUIRED
            </h2>
            <div className="text-3xl font-mono text-accent mb-6">
              {coordinates.join('')}
            </div>
            <p className="text-lg text-secondary">
              Location triangulated. Preparing transport to The Architect's Chamber...
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="matrix-hunt-instructions">
        <p className="text-sm text-secondary">
          Click the glowing orange characters hidden in the Matrix code
        </p>
      </div>
    </div>
  );
}
