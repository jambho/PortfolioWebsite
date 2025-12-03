'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface LightCycleProps {
  onComplete: () => void;
}

type Direction = 'up' | 'down' | 'left' | 'right';
type Difficulty = 'recruit' | 'program' | 'master';

interface Position {
  x: number;
  y: number;
}

interface Player {
  position: Position;
  direction: Direction;
  trail: Position[];
  color: string;
}

const GRID_SIZE = 30;
const CELL_SIZE = 15;
const GAME_SPEED = { recruit: 150, program: 100, master: 60 };

export default function LightCycleChallenge({ onComplete }: LightCycleProps) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);

  const [player, setPlayer] = useState<Player>({
    position: { x: 5, y: 15 },
    direction: 'right',
    trail: [{ x: 5, y: 15 }],
    color: '#ff6b35',
  });

  const [opponent, setOpponent] = useState<Player>({
    position: { x: 25, y: 15 },
    direction: 'left',
    trail: [{ x: 25, y: 15 }],
    color: '#00ff41',
  });

  const nextDirectionRef = useRef<Direction>(player.direction);

  const checkCollision = useCallback((pos: Position, trail: Position[], opponentTrail: Position[]): boolean => {
    // Check walls
    if (pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE) {
      return true;
    }

    // Check own trail
    if (trail.some(t => t.x === pos.x && t.y === pos.y)) {
      return true;
    }

    // Check opponent trail
    if (opponentTrail.some(t => t.x === pos.x && t.y === pos.y)) {
      return true;
    }

    return false;
  }, []);

  const getNextPosition = (position: Position, direction: Direction): Position => {
    const nextPos = { ...position };
    switch (direction) {
      case 'up':
        nextPos.y -= 1;
        break;
      case 'down':
        nextPos.y += 1;
        break;
      case 'left':
        nextPos.x -= 1;
        break;
      case 'right':
        nextPos.x += 1;
        break;
    }
    return nextPos;
  };

  const getOpponentDirection = useCallback((oppPos: Position, oppDir: Direction, playerTrail: Position[], oppTrail: Position[]): Direction => {
    const possibleDirections: Direction[] = [];
    const directions: Direction[] = ['up', 'down', 'left', 'right'];

    // Get opposite direction
    const opposite = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    }[oppDir] as Direction;

    // Check each direction
    for (const dir of directions) {
      if (dir === opposite) continue; // Can't go backwards

      const nextPos = getNextPosition(oppPos, dir);
      if (!checkCollision(nextPos, oppTrail, playerTrail)) {
        possibleDirections.push(dir);
      }
    }

    // If no safe direction, keep current
    if (possibleDirections.length === 0) {
      return oppDir;
    }

    // Prefer continuing in same direction if safe
    if (possibleDirections.includes(oppDir)) {
      // 70% chance to continue straight
      if (Math.random() < 0.7) {
        return oppDir;
      }
    }

    // Otherwise pick random safe direction
    return possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
  }, [checkCollision]);

  const gameLoop = useCallback(() => {
    if (!difficulty) return;

    setPlayer(prevPlayer => {
      const newDirection = nextDirectionRef.current;
      const nextPos = getNextPosition(prevPlayer.position, newDirection);

      return {
        ...prevPlayer,
        position: nextPos,
        direction: newDirection,
        trail: [...prevPlayer.trail, nextPos],
      };
    });

    setOpponent(prevOpponent => {
      const newDir = getOpponentDirection(
        prevOpponent.position,
        prevOpponent.direction,
        player.trail,
        prevOpponent.trail
      );
      const nextPos = getNextPosition(prevOpponent.position, newDir);

      return {
        ...prevOpponent,
        position: nextPos,
        direction: newDir,
        trail: [...prevOpponent.trail, nextPos],
      };
    });

    setScore(prev => prev + 1);
  }, [difficulty, player.trail, getOpponentDirection]);

  // Check for collisions
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const playerCollision = checkCollision(player.position, player.trail.slice(0, -1), opponent.trail);
    const opponentCollision = checkCollision(opponent.position, opponent.trail.slice(0, -1), player.trail);

    if (playerCollision && opponentCollision) {
      // Both lose - draw
      setGameOver(true);
      setWon(false);
    } else if (playerCollision) {
      // Player loses
      setGameOver(true);
      setWon(false);
    } else if (opponentCollision) {
      // Player wins!
      setGameOver(true);
      setWon(true);
    }
  }, [player.position, opponent.position, gameStarted, gameOver, player.trail, opponent.trail, checkCollision]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw player trail
    ctx.strokeStyle = player.color;
    ctx.lineWidth = CELL_SIZE * 0.6;
    ctx.lineCap = 'square';
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;
    ctx.beginPath();
    player.trail.forEach((pos, i) => {
      const x = pos.x * CELL_SIZE + CELL_SIZE / 2;
      const y = pos.y * CELL_SIZE + CELL_SIZE / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw opponent trail
    ctx.strokeStyle = opponent.color;
    ctx.shadowColor = opponent.color;
    ctx.beginPath();
    opponent.trail.forEach((pos, i) => {
      const x = pos.x * CELL_SIZE + CELL_SIZE / 2;
      const y = pos.y * CELL_SIZE + CELL_SIZE / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw player head
    ctx.shadowBlur = 20;
    ctx.fillStyle = player.color;
    ctx.fillRect(
      player.position.x * CELL_SIZE + CELL_SIZE * 0.2,
      player.position.y * CELL_SIZE + CELL_SIZE * 0.2,
      CELL_SIZE * 0.6,
      CELL_SIZE * 0.6
    );

    // Draw opponent head
    ctx.fillStyle = opponent.color;
    ctx.fillRect(
      opponent.position.x * CELL_SIZE + CELL_SIZE * 0.2,
      opponent.position.y * CELL_SIZE + CELL_SIZE * 0.2,
      CELL_SIZE * 0.6,
      CELL_SIZE * 0.6
    );

    ctx.shadowBlur = 0;
  }, [player, opponent]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || !difficulty) return;

    const interval = setInterval(gameLoop, GAME_SPEED[difficulty]);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, difficulty, gameLoop]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;

      const key = e.key.toLowerCase();
      const currentDir = nextDirectionRef.current;

      if ((key === 'arrowup' || key === 'w') && currentDir !== 'down') {
        nextDirectionRef.current = 'up';
      } else if ((key === 'arrowdown' || key === 's') && currentDir !== 'up') {
        nextDirectionRef.current = 'down';
      } else if ((key === 'arrowleft' || key === 'a') && currentDir !== 'right') {
        nextDirectionRef.current = 'left';
      } else if ((key === 'arrowright' || key === 'd') && currentDir !== 'left') {
        nextDirectionRef.current = 'right';
      }

      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver]);

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setGameStarted(true);
    setGameOver(false);
    setWon(false);
    setScore(0);
    setPlayer({
      position: { x: 5, y: 15 },
      direction: 'right',
      trail: [{ x: 5, y: 15 }],
      color: '#ff6b35',
    });
    setOpponent({
      position: { x: 25, y: 15 },
      direction: 'left',
      trail: [{ x: 25, y: 15 }],
      color: '#00ff41',
    });
    nextDirectionRef.current = 'right';
  };

  const handleContinue = () => {
    if (won) {
      onComplete();
    }
  };

  return (
    <div className="light-cycle-overlay">
      <div className="light-cycle-container">
        {!gameStarted && (
          <div className="difficulty-selection">
            <h2 className="text-4xl font-bold terminal-glow mb-8 text-center">
              LIGHT CYCLE CHALLENGE
            </h2>
            <p className="text-lg text-secondary mb-12 text-center">
              Survive longer than your opponent to prove your worth
            </p>

            <div className="difficulty-buttons">
              <button
                onClick={() => startGame('recruit')}
                className="difficulty-btn recruit"
              >
                <div className="text-xl font-bold">RECRUIT</div>
                <div className="text-sm">Slow pace, good for learning</div>
              </button>

              <button
                onClick={() => startGame('program')}
                className="difficulty-btn program"
              >
                <div className="text-xl font-bold">PROGRAM</div>
                <div className="text-sm">Medium pace, balanced challenge</div>
              </button>

              <button
                onClick={() => startGame('master')}
                className="difficulty-btn master"
              >
                <div className="text-xl font-bold">MASTER</div>
                <div className="text-sm">Fast pace, expert only</div>
              </button>
            </div>

            <div className="controls-info">
              <p className="text-sm text-secondary">
                Controls: Arrow Keys or WASD
              </p>
            </div>
          </div>
        )}

        {gameStarted && (
          <>
            <div className="game-header">
              <div className="text-accent font-bold">SCORE: {score}</div>
              <div className="text-foreground font-bold">
                DIFFICULTY: {difficulty?.toUpperCase()}
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="light-cycle-canvas"
            />

            {gameOver && (
              <div className="game-over-panel">
                <h3 className={`text-3xl font-bold mb-4 ${won ? 'text-accent' : 'text-red-500'}`}>
                  {won ? 'VICTORY!' : 'DEREZ\'D'}
                </h3>
                <p className="text-lg mb-2">Score: {score}</p>
                <p className="text-sm text-secondary mb-6">
                  {won
                    ? 'You have proven yourself worthy. The encryption key has been granted.'
                    : 'Your light cycle has been destroyed. Try again, program.'}
                </p>

                <div className="flex gap-4 justify-center">
                  {won ? (
                    <button
                      onClick={handleContinue}
                      className="retro-btn px-6 py-3"
                    >
                      Continue Journey
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => startGame(difficulty!)}
                        className="retro-btn px-6 py-3"
                      >
                        Retry
                      </button>
                      <button
                        onClick={() => {
                          setGameStarted(false);
                          setDifficulty(null);
                        }}
                        className="border-2 border-foreground text-foreground px-6 py-3 font-bold hover:bg-foreground hover:text-background transition-all"
                      >
                        Change Difficulty
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Tron Grid Background */}
      <div className="tron-grid-background animated"></div>
    </div>
  );
}
