import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Timer as TimerIcon, X, RotateCcw } from 'lucide-react';
import { whiteboardService, type ToolActionPayload } from '@/services/whiteboardService';

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

interface ClassroomToolOverlayProps {
  roomId: string;
  /** Teacher only — show a small dismiss "X" on overlays. */
  canDismiss?: boolean;
  /** Local participant role — drives which mark (X/O) can play in tic-tac-toe. */
  localRole?: 'teacher' | 'student';
}

type DiceState = { id: string; rolling: boolean; value: number };
type WheelState = { id: string; options: string[]; winner?: string; spinning: boolean };
type TimerState = { id: string; endsAt: number; durationSec: number; remaining: number; running: boolean };

/**
 * Renders centered dice / spinning wheel and a top-center countdown timer,
 * driven by realtime `tool_action` broadcasts. Mounted in MainStage so
 * both teacher and student see the same overlay synchronized.
 */
export const ClassroomToolOverlay: React.FC<ClassroomToolOverlayProps> = ({ roomId, canDismiss, localRole = 'student' }) => {
  const [dice, setDice] = useState<DiceState | null>(null);
  const [wheel, setWheel] = useState<WheelState | null>(null);
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [xoBoard, setXoBoard] = useState<Array<'X' | 'O' | null> | null>(null);
  const diceTimer = useRef<number | null>(null);
  const wheelTimer = useRef<number | null>(null);
  const localMark: 'X' | 'O' = localRole === 'teacher' ? 'X' : 'O';

  useEffect(() => {
    if (!roomId) return;
    const unsub = whiteboardService.subscribeToToolActions(roomId, (p: ToolActionPayload) => {
      if (p.tool === 'dice' && typeof p.result === 'number') {
        const id = p.actionId ?? String(p.timestamp);
        // Opening dice closes other center tools so nothing is hidden behind it.
        setWheel(null);
        setXoBoard(null);
        setDice({ id, rolling: true, value: p.result });
        if (diceTimer.current) window.clearTimeout(diceTimer.current);
        diceTimer.current = window.setTimeout(() => {
          setDice((d) => (d && d.id === id ? { ...d, rolling: false } : d));
        }, 900);
      } else if (p.tool === 'wheel' && p.options && p.options.length) {
        const id = p.actionId ?? String(p.timestamp);
        setDice(null);
        setXoBoard(null);
        setWheel({ id, options: p.options, spinning: true, winner: undefined });
        if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
        wheelTimer.current = window.setTimeout(() => {
          setWheel({ id, options: p.options!, spinning: false, winner: p.winner });
        }, 2400);
      } else if (p.tool === 'timer') {
        if (p.status === 'stop' || p.status === 'reset') {
          setTimer(null);
          return;
        }
        const dur = Math.max(1, p.durationSec ?? 60);
        const id = p.actionId ?? String(p.timestamp);
        setTimer({ id, endsAt: Date.now() + dur * 1000, durationSec: dur, remaining: dur, running: true });
      } else if (p.tool === 'xo') {
        if (p.xoAction === 'close') {
          setXoBoard(null);
        } else if (p.xoAction === 'start' || p.xoAction === 'reset') {
          setDice(null);
          setWheel(null);
          setXoBoard(Array(9).fill(null));
        } else if (p.xoAction === 'move' && typeof p.cell === 'number' && p.mark) {
          setXoBoard((b) => {
            const base = b ?? Array(9).fill(null);
            if (base[p.cell!]) return base;
            const next = base.slice();
            next[p.cell!] = p.mark!;
            return next;
          });
        }
      }
    });
    return () => {
      unsub();
      if (diceTimer.current) window.clearTimeout(diceTimer.current);
      if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
    };
  }, [roomId]);

  // Timer tick
  useEffect(() => {
    if (!timer?.running) return;
    const interval = window.setInterval(() => {
      setTimer((t) => {
        if (!t) return t;
        const remaining = Math.max(0, Math.round((t.endsAt - Date.now()) / 1000));
        return remaining === t.remaining ? t : { ...t, remaining, running: remaining > 0 };
      });
    }, 250);
    return () => window.clearInterval(interval);
  }, [timer?.running, timer?.id]);

  const DiceIcon = dice ? DICE_ICONS[Math.max(1, Math.min(6, dice.value)) - 1] : Dice6;

  return (
    <div className="pointer-events-none absolute inset-0 z-[55]">
      {/* Top-center timer — large & student-readable */}
      {timer && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2 pointer-events-auto">
          <div
            className={`flex items-center gap-3 rounded-2xl px-7 py-4 text-white shadow-2xl backdrop-blur ring-4 ring-white/30 ${
              timer.remaining <= 5 && timer.remaining > 0 ? 'bg-red-600 animate-pulse' : timer.remaining === 0 ? 'bg-red-700' : 'bg-black/80'
            }`}
          >
            <TimerIcon className="h-8 w-8" />
            <span className="text-5xl font-extrabold tabular-nums tracking-tight">
              {formatTime(timer.remaining)}
            </span>
            {canDismiss && (
              <button
                onClick={() => {
                  setTimer(null);
                  void whiteboardService.sendToolAction(roomId, {
                    tool: 'timer', status: 'stop', senderId: 'local',
                  });
                }}
                className="ml-2 rounded-full p-1.5 hover:bg-white/20"
                aria-label="Dismiss timer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Centered dice — clickable to re-roll */}
      {dice && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="pointer-events-auto relative">
            <button
              type="button"
              disabled={dice.rolling || !canDismiss}
              onClick={() => {
                if (!canDismiss || dice.rolling) return;
                const nextVal = Math.floor(Math.random() * 6) + 1;
                void whiteboardService.sendToolAction(roomId, {
                  tool: 'dice', result: nextVal, senderId: 'local',
                }).catch(() => {});
              }}
              className={`group flex h-48 w-48 items-center justify-center rounded-3xl bg-white shadow-2xl ring-4 ring-orange-300 transition ${
                dice.rolling ? 'animate-bounce' : 'hover:scale-105 active:scale-95 animate-in zoom-in-50'
              } ${canDismiss && !dice.rolling ? 'cursor-pointer' : 'cursor-default'}`}
              aria-label={canDismiss ? 'Click to roll again' : 'Dice'}
            >
              <DiceIcon className="h-32 w-32 text-orange-600" />
            </button>
            {!dice.rolling && (
              <div className="mt-3 text-center">
                <div className="text-2xl font-extrabold text-foreground drop-shadow">
                  You rolled {dice.value}!
                </div>
                {canDismiss && (
                  <div className="text-xs font-medium text-muted-foreground mt-1">Tap the dice to roll again</div>
                )}
              </div>
            )}
            {canDismiss && (
              <button
                onClick={() => setDice(null)}
                className="absolute -right-2 -top-2 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                aria-label="Dismiss dice"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Centered spinning wheel — click hub to spin */}
      {wheel && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="pointer-events-auto relative">
            <SpinningWheel
              options={wheel.options}
              spinning={wheel.spinning}
              winner={wheel.winner}
              canSpin={!!canDismiss && !wheel.spinning}
              onSpin={() => {
                if (!canDismiss || wheel.spinning) return;
                const nextWinner = wheel.options[Math.floor(Math.random() * wheel.options.length)];
                void whiteboardService.sendToolAction(roomId, {
                  tool: 'wheel', options: wheel.options, winner: nextWinner, senderId: 'local',
                }).catch(() => {});
              }}
            />
            {!wheel.spinning && wheel.winner && (
              <div className="mt-3 text-center text-2xl font-extrabold text-foreground drop-shadow">
                🎯 {wheel.winner}
              </div>
            )}
            {!wheel.spinning && canDismiss && (
              <div className="mt-1 text-center text-xs font-medium text-muted-foreground">
                Tap the center to spin again
              </div>
            )}
            {canDismiss && (
              <button
                onClick={() => setWheel(null)}
                className="absolute -right-2 -top-2 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                aria-label="Dismiss wheel"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tic-Tac-Toe (XO) — teacher=X, student=O, shared above content */}
      {xoBoard && (
        <XOBoard
          board={xoBoard}
          localMark={localMark}
          canControl={canDismiss === true || localRole === 'student'}
          onMove={(cell, mark) => {
            void whiteboardService.sendToolAction(roomId, {
              tool: 'xo', xoAction: 'move', cell, mark, senderId: 'local',
            }).catch(() => {});
          }}
          onReset={() => {
            void whiteboardService.sendToolAction(roomId, {
              tool: 'xo', xoAction: 'reset', senderId: 'local',
            }).catch(() => {});
          }}
          onClose={canDismiss ? () => {
            setXoBoard(null);
            void whiteboardService.sendToolAction(roomId, {
              tool: 'xo', xoAction: 'close', senderId: 'local',
            }).catch(() => {});
          } : undefined}
        />
      )}
    </div>
  );
};

interface XOBoardProps {
  board: Array<'X' | 'O' | null>;
  localMark: 'X' | 'O';
  canControl: boolean;
  onMove: (cell: number, mark: 'X' | 'O') => void;
  onReset: () => void;
  onClose?: () => void;
}

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

const XOBoard: React.FC<XOBoardProps> = ({ board, localMark, canControl, onMove, onReset, onClose }) => {
  const { winner, line } = useMemo(() => {
    for (const l of WIN_LINES) {
      const [a,b,c] = l;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a] as 'X' | 'O', line: l };
      }
    }
    return { winner: null as 'X' | 'O' | null, line: null as number[] | null };
  }, [board]);
  const filled = board.filter(Boolean).length;
  const xs = board.filter((m) => m === 'X').length;
  const os = board.filter((m) => m === 'O').length;
  const nextMark: 'X' | 'O' = xs <= os ? 'X' : 'O';
  const isDraw = !winner && filled === 9;
  const yourTurn = !winner && !isDraw && nextMark === localMark;

  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="pointer-events-auto relative rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-7 shadow-2xl ring-4 ring-indigo-400/60">
        <div className="mb-4 flex items-center justify-between gap-6">
          <div className="text-base font-extrabold tracking-tight text-foreground">
            Tic-Tac-Toe · You are{' '}
            <span className={localMark === 'X' ? 'text-sky-600' : 'text-pink-600'}>{localMark}</span>
          </div>
          <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-muted-foreground shadow-sm">
            {winner ? `${winner} wins! 🎉` : isDraw ? 'Draw' : yourTurn ? 'Your turn' : `${nextMark}'s turn`}
          </div>
        </div>
        <div className="grid aspect-square w-[22rem] grid-cols-3 gap-3">
          {board.map((cell, i) => {
            const disabled = !canControl || !!cell || !!winner || isDraw || !yourTurn;
            const highlight = line?.includes(i);
            const markColor =
              cell === 'X'
                ? 'text-sky-500 drop-shadow-[0_3px_0_rgba(14,165,233,0.35)]'
                : cell === 'O'
                ? 'text-pink-500 drop-shadow-[0_3px_0_rgba(236,72,153,0.35)]'
                : '';
            return (
              <button
                key={i}
                disabled={disabled}
                onClick={() => onMove(i, localMark)}
                className={`flex aspect-square items-center justify-center rounded-2xl text-7xl font-black transition-all duration-150 active:scale-95 ${
                  highlight
                    ? 'bg-gradient-to-br from-emerald-200 to-emerald-300 ring-4 ring-emerald-400 animate-pulse'
                    : 'bg-white shadow-md ring-1 ring-slate-200 hover:ring-indigo-400 hover:shadow-lg hover:-translate-y-0.5'
                } ${disabled && !cell ? 'opacity-70 cursor-not-allowed' : ''} ${markColor}`}
                aria-label={`cell ${i + 1}`}
              >
                {cell ?? ''}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" /> New round
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold text-foreground hover:bg-slate-300 transition"
            >
              Close game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

const WHEEL_COLORS = ['#FE6A2F', '#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#8338EC', '#3A86FF', '#FB5607'];

interface SpinningWheelProps {
  options: string[];
  spinning: boolean;
  winner?: string;
  canSpin?: boolean;
  onSpin?: () => void;
}

const SpinningWheel: React.FC<SpinningWheelProps> = ({ options, spinning, winner, canSpin, onSpin }) => {
  const n = Math.max(1, options.length);
  const slice = 360 / n;
  const winnerIdx = winner ? Math.max(0, options.indexOf(winner)) : 0;
  // Land winner at top (pointer at -90°)
  const targetRot = spinning
    ? 360 * 6 + (270 - (winnerIdx * slice + slice / 2))
    : (270 - (winnerIdx * slice + slice / 2));

  const R = 140;
  const cx = 150;
  const cy = 150;

  const slicePath = (i: number): string => {
    const start = (i * slice - 90) * (Math.PI / 180);
    const end = ((i + 1) * slice - 90) * (Math.PI / 180);
    const x1 = cx + R * Math.cos(start);
    const y1 = cy + R * Math.sin(start);
    const x2 = cx + R * Math.cos(end);
    const y2 = cy + R * Math.sin(end);
    const largeArc = slice > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="relative h-80 w-80">
      {/* Pointer */}
      <div className="absolute left-1/2 top-[-4px] z-20 -translate-x-1/2">
        <div className="h-0 w-0 border-l-[16px] border-r-[16px] border-t-[26px] border-l-transparent border-r-transparent border-t-red-600 drop-shadow-lg" />
      </div>

      <div
        className="h-full w-full"
        style={{
          transform: `rotate(${targetRot}deg)`,
          transition: spinning ? 'transform 2.3s cubic-bezier(0.17, 0.67, 0.21, 1)' : 'none',
        }}
      >
        <svg viewBox="0 0 300 300" className="h-full w-full drop-shadow-2xl">
          <circle cx={cx} cy={cy} r={R + 4} fill="white" />
          {options.map((label, i) => {
            const mid = (i * slice + slice / 2 - 90) * (Math.PI / 180);
            const tx = cx + (R * 0.62) * Math.cos(mid);
            const ty = cy + (R * 0.62) * Math.sin(mid);
            const rot = i * slice + slice / 2;
            const display = label.length > 10 ? `${label.slice(0, 9)}…` : label;
            return (
              <g key={`${label}-${i}`}>
                <path d={slicePath(i)} fill={WHEEL_COLORS[i % WHEEL_COLORS.length]} stroke="white" strokeWidth={2} />
                <text
                  x={tx}
                  y={ty}
                  fill="white"
                  fontSize="15"
                  fontWeight="800"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${rot} ${tx} ${ty})`}
                  style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.35)', strokeWidth: 2 }}
                >
                  {display}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hub cap — clickable to spin */}
      <button
        type="button"
        disabled={!canSpin}
        onClick={onSpin}
        className={`absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs font-extrabold uppercase tracking-wide text-foreground shadow-xl ring-4 ring-orange-400 transition ${
          canSpin ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default opacity-90'
        }`}
        aria-label={canSpin ? 'Spin the wheel' : 'Wheel'}
      >
        {spinning ? '…' : canSpin ? 'SPIN' : '★'}
      </button>
    </div>
  );
};
