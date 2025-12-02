'use client';

import { useState, useEffect } from 'react';

interface ArchitectChamberProps {
  onComplete: () => void;
}

export default function ArchitectChamber({ onComplete }: ArchitectChamberProps) {
  const [showMonitors, setShowMonitors] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [showRewards, setShowRewards] = useState(false);
  const [tronThemeEnabled, setTronThemeEnabled] = useState(false);

  const messages = [
    "Hello, Neo. Or should I say... Potential_Recruit.",
    "I am the Architect. I created the Matrix.",
    "I've been watching your journey through my system.",
    "You followed the white rabbit...",
    "You chose the red pill...",
    "You hacked the terminal...",
    "You mastered the light cycle...",
    "You decoded the Matrix...",
    "And now, you have found me.",
    "Your persistence is... admirable.",
    "I have a message for you:",
    "Welcome to my digital realm.",
    "You have proven yourself worthy of seeing beyond the illusion.",
    "This portfolio is more than it seems.",
    "Just like the Matrix, there are layers upon layers of reality.",
    "You are now part of an exclusive group.",
    "Those who see what others cannot.",
    "I leave you with this:",
    "\"Free your mind.\"",
    "You have been recruited.",
  ];

  useEffect(() => {
    // Animate monitors appearing
    setTimeout(() => setShowMonitors(true), 500);
    setTimeout(() => setShowMessage(true), 2000);
  }, []);

  useEffect(() => {
    if (!showMessage) return;

    if (messageIndex < messages.length) {
      const timer = setTimeout(() => {
        setMessageIndex(prev => prev + 1);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setTimeout(() => {
        setShowRewards(true);
      }, 1000);
    }
  }, [showMessage, messageIndex, messages.length]);

  const downloadCertificate = () => {
    // Create a simple text certificate
    const certificate = `
╔════════════════════════════════════════════════════╗
║                                                    ║
║          MATRIX CLEARANCE CERTIFICATE              ║
║                                                    ║
║  This certifies that the bearer has successfully  ║
║  completed THE ARCHITECT'S CHALLENGE and has      ║
║  demonstrated exceptional ability to see beyond   ║
║  the illusion of the digital realm.               ║
║                                                    ║
║  Clearance Level: ENLIGHTENED                     ║
║  Date: ${new Date().toLocaleDateString()}                           ║
║  Code: ${Math.random().toString(36).substring(2, 10).toUpperCase()}                              ║
║                                                    ║
║  "Free your mind."                                ║
║                                                    ║
║  - The Architect                                  ║
║                                                    ║
╚════════════════════════════════════════════════════╝
    `;

    const blob = new Blob([certificate], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matrix-clearance-certificate.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleTronTheme = () => {
    setTronThemeEnabled(!tronThemeEnabled);
    if (!tronThemeEnabled) {
      document.documentElement.style.setProperty('--foreground', '#00d4ff');
      document.documentElement.style.setProperty('--accent', '#ff00ff');
    } else {
      document.documentElement.style.setProperty('--foreground', '#00ff41');
      document.documentElement.style.setProperty('--accent', '#ff6b35');
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="architect-overlay">
      {/* Chamber Container */}
      <div className="architect-chamber">
        {/* Monitor Grid */}
        <div className={`monitor-grid ${showMonitors ? 'visible' : ''}`}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className="monitor" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="monitor-screen">
                {i === 0 && <div className="monitor-content">FOLLOWING RABBIT...</div>}
                {i === 1 && <div className="monitor-content">RED PILL CHOSEN</div>}
                {i === 2 && <div className="monitor-content">TERMINAL ACCESSED</div>}
                {i === 3 && <div className="monitor-content">LIGHT CYCLE: WIN</div>}
                {i === 4 && <div className="monitor-content">MATRIX DECODED</div>}
                {i === 5 && <div className="monitor-content">CLEARANCE: GRANTED</div>}
                {i === 6 && <div className="monitor-content code-rain">01010011</div>}
                {i === 7 && <div className="monitor-content code-rain">11010110</div>}
                {i === 8 && <div className="monitor-content code-rain">10110101</div>}
                {i === 9 && <div className="monitor-content">STATUS: RECRUIT</div>}
                {i === 10 && <div className="monitor-content">LEVEL: ENLIGHTENED</div>}
                {i === 11 && <div className="monitor-content glow">THE ARCHITECT</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Central Message Display */}
        {showMessage && (
          <div className="architect-message-panel">
            <div className="architect-avatar">
              <div className="avatar-ring"></div>
              <div className="avatar-core"></div>
            </div>

            <div className="message-display">
              {messages.slice(0, messageIndex).map((msg, i) => (
                <div
                  key={i}
                  className={`message-line ${i === messageIndex - 1 ? 'current' : ''}`}
                >
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rewards Panel */}
        {showRewards && (
          <div className="rewards-panel">
            <h2 className="text-3xl font-bold terminal-glow mb-6 text-center">
              REWARDS UNLOCKED
            </h2>

            <div className="rewards-grid">
              <button
                onClick={downloadCertificate}
                className="reward-card"
              >
                <div className="reward-icon">🏆</div>
                <div className="reward-title">Clearance Certificate</div>
                <div className="reward-description">
                  Download your Matrix Clearance Badge
                </div>
              </button>

              <button
                onClick={toggleTronTheme}
                className="reward-card"
              >
                <div className="reward-icon">🎨</div>
                <div className="reward-title">
                  {tronThemeEnabled ? 'Matrix Theme' : 'Tron Theme'}
                </div>
                <div className="reward-description">
                  Toggle between Matrix green and Tron blue
                </div>
              </button>

              <div className="reward-card">
                <div className="reward-icon">🔐</div>
                <div className="reward-title">Secret Code</div>
                <div className="reward-description code">
                  {Math.random().toString(36).substring(2, 15).toUpperCase()}
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="reward-card complete-btn"
              >
                <div className="reward-icon">✓</div>
                <div className="reward-title">Complete Journey</div>
                <div className="reward-description">
                  Exit the Matrix
                </div>
              </button>
            </div>

            <div className="final-message">
              <p className="text-accent font-bold text-lg mb-2">
                "The Matrix is everywhere. It is all around us."
              </p>
              <p className="text-secondary">
                Thank you for exploring this hidden adventure. You are one of the few who have seen beyond the veil.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3D Background Effect */}
      <div className="architect-background">
        <div className="perspective-grid"></div>
      </div>
    </div>
  );
}
