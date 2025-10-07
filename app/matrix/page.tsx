'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MatrixPage() {
  const [matrixCode, setMatrixCode] = useState<string[]>([]);

  return (
    <div className="min-h-screen matrix-background">
      {/* Matrix Code Rain */}
      <div className="matrix-code-container">
        {matrixCode.map((line, index) => (
          <div
            key={`matrix-line-${index}-${line.slice(0, 10)}`}
            className="matrix-line"
            style={{
              animationDelay: `${index * 0.1}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="matrix-content">
        <div className="matrix-welcome">
          <div className="matrix-actions">
            <Link href="/" className="matrix-btn">
              Take the Blue Pill
            </Link>
            <Link href="/projects" className="matrix-btn matrix-btn-red">
              Take the Red Pill
            </Link>
          </div>
        </div>

        {/* Hidden Easter Egg */}
        <div className="matrix-easter-egg">
          <div className="matrix-binary">
            01001000 01100101 01101100 01101100 01101111
          </div>
          <div className="matrix-binary">
            01001000 01110101 01101101 01100001 01101110
          </div>
        </div>
      </div>

      {/* Matrix Glitch Effect */}
      <div className="matrix-glitch"></div>
    </div>
  );
}
