"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CANVAS_WIDTH = 520;
const CANVAS_HEIGHT = 140;
const GROUND_Y = 112;
const GRAVITY = 0.45;
const JUMP_VELOCITY = -8.5;
const DINO_X = 44;
const DINO_W = 22;
const DINO_H = 26;
const OBSTACLE_W = 14;
const OBSTACLE_H = 28;
const MIN_OBSTACLE_GAP = 280;
const MAX_OBSTACLE_GAP = 460;
const START_SPEED = 2.2;
const MAX_SPEED = 4;

interface Obstacle {
  x: number;
  w: number;
  h: number;
}

interface CanvasTheme {
  primary: string;
  border: string;
  muted: string;
  foreground: string;
  canvasBg: string;
}

function readThemeColor(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function getCanvasTheme(): CanvasTheme {
  return {
    primary: readThemeColor("--primary", "oklch(0.50 0.18 262)"),
    border: readThemeColor("--border", "oklch(0.88 0.02 250)"),
    muted: readThemeColor("--muted-foreground", "oklch(0.40 0.03 250)"),
    foreground: readThemeColor("--foreground", "oklch(0.12 0.03 250)"),
    canvasBg: readThemeColor("--surface-sunken", "oklch(0.965 0.01 250)"),
  };
}

export function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const themeRef = useRef<CanvasTheme>(getCanvasTheme());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const gameRef = useRef({
    running: true,
    dinoY: GROUND_Y - DINO_H,
    dinoVy: 0,
    isJumping: false,
    speed: START_SPEED,
    obstacles: [] as Obstacle[],
    distance: 0,
    nextObstacleAt: MIN_OBSTACLE_GAP + 120,
    score: 0,
  });

  const resetGame = useCallback(() => {
    gameRef.current = {
      running: true,
      dinoY: GROUND_Y - DINO_H,
      dinoVy: 0,
      isJumping: false,
      speed: START_SPEED,
      obstacles: [],
      distance: 0,
      nextObstacleAt: MIN_OBSTACLE_GAP + 120,
      score: 0,
    };
    setScore(0);
    setIsGameOver(false);
  }, []);

  const jump = useCallback(() => {
    const game = gameRef.current;
    if (!game.running) {
      resetGame();
      return;
    }
    if (!game.isJumping && game.dinoY >= GROUND_Y - DINO_H - 1) {
      game.dinoVy = JUMP_VELOCITY;
      game.isJumping = true;
    }
  }, [resetGame]);

  useEffect(() => {
    themeRef.current = getCanvasTheme();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    const drawDino = (y: number, theme: CanvasTheme) => {
      ctx.fillStyle = theme.primary;
      ctx.fillRect(DINO_X, y, DINO_W, DINO_H);
      ctx.fillStyle = theme.foreground;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(DINO_X + 14, y + 4, 8, 8);
      ctx.globalAlpha = 1;
      ctx.fillStyle = theme.primary;
      ctx.fillRect(DINO_X + 2, y + DINO_H, 6, 4);
      ctx.fillRect(DINO_X + 12, y + DINO_H, 6, 4);
    };

    const drawObstacle = (obs: Obstacle, theme: CanvasTheme) => {
      ctx.fillStyle = theme.muted;
      ctx.fillRect(obs.x, GROUND_Y - obs.h, obs.w, obs.h);
      ctx.globalAlpha = 0.55;
      ctx.fillRect(obs.x - 4, GROUND_Y - obs.h + 8, obs.w + 8, obs.h - 12);
      ctx.globalAlpha = 1;
    };

    const tick = () => {
      const game = gameRef.current;
      const theme = themeRef.current;

      ctx.fillStyle = theme.canvasBg;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y + 1);
      ctx.lineTo(CANVAS_WIDTH, GROUND_Y + 1);
      ctx.stroke();

      ctx.fillStyle = theme.border;
      ctx.globalAlpha = 0.65;
      for (let i = 0; i < CANVAS_WIDTH; i += 18) {
        const offset = (game.distance * 0.35) % 18;
        ctx.fillRect(i - offset, GROUND_Y + 6, 10, 2);
      }
      ctx.globalAlpha = 1;

      if (game.running) {
        game.dinoVy += GRAVITY;
        game.dinoY += game.dinoVy;

        if (game.dinoY >= GROUND_Y - DINO_H) {
          game.dinoY = GROUND_Y - DINO_H;
          game.dinoVy = 0;
          game.isJumping = false;
        }

        game.distance += game.speed;
        game.speed = Math.min(MAX_SPEED, START_SPEED + game.distance / 8000);

        if (game.distance >= game.nextObstacleAt) {
          game.obstacles.push({
            x: CANVAS_WIDTH + 10,
            w: OBSTACLE_W,
            h: OBSTACLE_H,
          });
          game.nextObstacleAt +=
            MIN_OBSTACLE_GAP +
            Math.random() * (MAX_OBSTACLE_GAP - MIN_OBSTACLE_GAP);
        }

        game.obstacles = game.obstacles
          .map((obs) => ({ ...obs, x: obs.x - game.speed }))
          .filter((obs) => obs.x + obs.w > 0);

        const dinoBox = {
          x: DINO_X + 2,
          y: game.dinoY + 2,
          w: DINO_W - 4,
          h: DINO_H - 4,
        };

        for (const obs of game.obstacles) {
          const obsBox = {
            x: obs.x + 2,
            y: GROUND_Y - obs.h + 2,
            w: obs.w - 2,
            h: obs.h - 4,
          };
          if (
            dinoBox.x < obsBox.x + obsBox.w &&
            dinoBox.x + dinoBox.w > obsBox.x &&
            dinoBox.y < obsBox.y + obsBox.h &&
            dinoBox.y + dinoBox.h > obsBox.y
          ) {
            game.running = false;
            setIsGameOver(true);
            setHighScore((prev) => Math.max(prev, game.score));
          }
        }

        game.score = Math.floor(game.distance / 12);
        setScore(game.score);
      }

      for (const obs of game.obstacles) {
        drawObstacle(obs, theme);
      }
      drawDino(game.dinoY, theme);

      if (!game.running) {
        ctx.fillStyle = theme.foreground;
        ctx.globalAlpha = 0.75;
        ctx.font = "600 14px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "Game over — tap or press Space to restart",
          CANVAS_WIDTH / 2,
          36,
        );
        ctx.globalAlpha = 1;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(frameRef.current);
    };
  }, [jump]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Score: {score}</span>
        <span>Best: {highScore}</span>
        <span className="hidden sm:inline">Space / tap to jump</span>
      </div>
      <div
        className="overflow-hidden border border-border/60 bg-surface-sunken"
        role="application"
        aria-label="Dino runner mini-game"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="h-auto w-full max-w-full cursor-pointer touch-none"
          onPointerDown={jump}
        />
      </div>
      {isGameOver && (
        <p className="text-center text-xs text-muted-foreground">
          Tap the game or press Space to play again
        </p>
      )}
    </div>
  );
}
