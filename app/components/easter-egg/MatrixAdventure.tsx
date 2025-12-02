'use client';

import { useState, useEffect } from 'react';
import WhiteRabbit from './WhiteRabbit';
import PillChoice from './PillChoice';
import TerminalHack from './TerminalHack';
import LightCycleChallenge from './LightCycleChallenge';
import MatrixCodeHunt from './MatrixCodeHunt';
import ArchitectChamber from './ArchitectChamber';

type Stage = 'idle' | 'rabbit-clicked' | 'pill-choice' | 'terminal' | 'light-cycle' | 'matrix-hunt' | 'architect' | 'completed';

export default function MatrixAdventure() {
  const [stage, setStage] = useState<Stage>('idle');
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [showMatrixRain, setShowMatrixRain] = useState(false);
  const [progress, setProgress] = useState({
    rabbitClicked: false,
    pillChosen: false,
    terminalComplete: false,
    lightCycleComplete: false,
    matrixHuntComplete: false,
    architectComplete: false,
  });

  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('matrix-adventure-progress');
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      setProgress(parsed);

      // Resume from last completed stage
      if (parsed.architectComplete) setStage('completed');
      else if (parsed.matrixHuntComplete) setStage('architect');
      else if (parsed.lightCycleComplete) setStage('matrix-hunt');
      else if (parsed.terminalComplete) setStage('light-cycle');
      else if (parsed.pillChosen) setStage('terminal');
      else if (parsed.rabbitClicked) setStage('pill-choice');
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('matrix-adventure-progress', JSON.stringify(progress));
  }, [progress]);

  // Konami code listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === konamiCode[konamiIndex]) {
        const newIndex = konamiIndex + 1;
        setKonamiIndex(newIndex);

        if (newIndex === konamiCode.length) {
          setKonamiIndex(0);
          // Trigger rabbit appearance
          if (stage === 'idle') {
            setStage('rabbit-clicked');
            handleRabbitClick();
          }
        }
      } else {
        setKonamiIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiIndex, stage]);

  const handleRabbitClick = () => {
    setShowMatrixRain(true);
    setTimeout(() => {
      setStage('pill-choice');
      setShowMatrixRain(false);
      setProgress(prev => ({ ...prev, rabbitClicked: true }));
    }, 3000);
  };

  const handlePillChoice = (pill: 'red' | 'blue') => {
    if (pill === 'blue') {
      // Reset everything
      setStage('idle');
      setProgress({
        rabbitClicked: false,
        pillChosen: false,
        terminalComplete: false,
        lightCycleComplete: false,
        matrixHuntComplete: false,
        architectComplete: false,
      });
      localStorage.removeItem('matrix-adventure-progress');
    } else {
      setStage('terminal');
      setProgress(prev => ({ ...prev, pillChosen: true }));
    }
  };

  const handleTerminalComplete = () => {
    setStage('light-cycle');
    setProgress(prev => ({ ...prev, terminalComplete: true }));
  };

  const handleLightCycleComplete = () => {
    setStage('matrix-hunt');
    setProgress(prev => ({ ...prev, lightCycleComplete: true }));
  };

  const handleMatrixHuntComplete = () => {
    setStage('architect');
    setProgress(prev => ({ ...prev, matrixHuntComplete: true }));
  };

  const handleArchitectComplete = () => {
    setStage('completed');
    setProgress(prev => ({ ...prev, architectComplete: true }));
  };

  const handleReset = () => {
    setStage('idle');
    setProgress({
      rabbitClicked: false,
      pillChosen: false,
      terminalComplete: false,
      lightCycleComplete: false,
      matrixHuntComplete: false,
      architectComplete: false,
    });
    localStorage.removeItem('matrix-adventure-progress');
  };

  return (
    <>
      {/* Matrix Rain Effect */}
      {showMatrixRain && (
        <div className="matrix-rain-overlay">
          <div className="matrix-rain-container">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="matrix-column" style={{ left: `${i * 2}%`, animationDelay: `${Math.random() * 2}s` }}>
                {[...Array(20)].map((_, j) => (
                  <span key={j} className="matrix-char">
                    {String.fromCharCode(0x30A0 + Math.random() * 96)}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="matrix-message">
            Wake up, Neo...
          </div>
        </div>
      )}

      {/* Stage 0: White Rabbit */}
      {stage === 'idle' && (
        <WhiteRabbit onClick={handleRabbitClick} />
      )}

      {/* Stage 1: Pill Choice */}
      {stage === 'pill-choice' && (
        <PillChoice onChoice={handlePillChoice} />
      )}

      {/* Stage 2: Terminal Hack */}
      {stage === 'terminal' && (
        <TerminalHack onComplete={handleTerminalComplete} />
      )}

      {/* Stage 3: Light Cycle Challenge */}
      {stage === 'light-cycle' && (
        <LightCycleChallenge onComplete={handleLightCycleComplete} />
      )}

      {/* Stage 4: Matrix Code Hunt */}
      {stage === 'matrix-hunt' && (
        <MatrixCodeHunt onComplete={handleMatrixHuntComplete} />
      )}

      {/* Stage 5: Architect's Chamber */}
      {stage === 'architect' && (
        <ArchitectChamber onComplete={handleArchitectComplete} />
      )}

      {/* Completed State */}
      {stage === 'completed' && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-accent text-background font-bold rounded hover:bg-opacity-80 transition-all"
          >
            Restart Adventure
          </button>
        </div>
      )}

      {/* Progress Indicator (always visible after starting) */}
      {stage !== 'idle' && stage !== 'completed' && (
        <div className="fixed top-20 left-4 z-50 bg-card-bg border border-border p-3 rounded font-mono text-xs">
          <div className="text-accent mb-2">PROGRESS</div>
          <div className={progress.rabbitClicked ? 'text-foreground' : 'text-secondary'}>
            ✓ Followed the Rabbit
          </div>
          <div className={progress.pillChosen ? 'text-foreground' : 'text-secondary'}>
            {progress.pillChosen ? '✓' : '○'} Chose the Red Pill
          </div>
          <div className={progress.terminalComplete ? 'text-foreground' : 'text-secondary'}>
            {progress.terminalComplete ? '✓' : '○'} Hacked the Terminal
          </div>
          <div className={progress.lightCycleComplete ? 'text-foreground' : 'text-secondary'}>
            {progress.lightCycleComplete ? '✓' : '○'} Won Light Cycle
          </div>
          <div className={progress.matrixHuntComplete ? 'text-foreground' : 'text-secondary'}>
            {progress.matrixHuntComplete ? '✓' : '○'} Found the Code
          </div>
          <div className={progress.architectComplete ? 'text-foreground' : 'text-secondary'}>
            {progress.architectComplete ? '✓' : '○'} Met the Architect
          </div>
        </div>
      )}
    </>
  );
}
