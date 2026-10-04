import React, { useState, useEffect } from 'react';
import { Eye, X, Radio, Volume2, VolumeX, Users, Zap, Shield, ArrowRight, Trophy } from 'lucide-react';

export interface SpectatorTarget {
  id: string;
  game: string;
  gameIcon?: string;
  players: string[];
  matchType?: string;
  roomName?: string;
  durationSeconds?: number;
  username?: string;
  opponent?: string;
  spectators?: number;
  isGuest?: boolean;
}

interface LiveSpectatorModalProps {
  isOpen: boolean;
  target: SpectatorTarget | null;
  onClose: () => void;
  onNextMatch?: () => void;
}

export const LiveSpectatorModal: React.FC<LiveSpectatorModalProps> = ({
  isOpen,
  target,
  onClose,
  onNextMatch,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [spectatorCount, setSpectatorCount] = useState<number>(14);
  const [movesLog, setMovesLog] = useState<Array<{ id: string; move: string; player: string; time: string }>>([]);

  // Initialize and tick live duration
  useEffect(() => {
    if (!isOpen || !target) return;
    setElapsedSeconds(target.durationSeconds || 195);
    setSpectatorCount(target.spectators || Math.floor(Math.random() * 8 + 8));

    const ticker = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(ticker);
  }, [isOpen, target]);

  // Dynamic live game moves stream
  useEffect(() => {
    if (!isOpen || !target) return;

    const gameLower = (target.game || 'Chess').toLowerCase();
    const p1 = target.players?.[0] || target.username || 'White';
    const p2 = target.players?.[1] || target.opponent || 'Black';

    let baseMoves = [
      { id: 'm1', move: '1. e4', player: p1, time: '2m ago' },
      { id: 'm2', move: '1... c5 (Sicilian Defense)', player: p2, time: '1m 40s ago' },
      { id: 'm3', move: '2. Nf3', player: p1, time: '1m 15s ago' },
      { id: 'm4', move: '2... d6', player: p2, time: '40s ago' },
      { id: 'm5', move: '3. d4 cxd4', player: p1, time: '15s ago' },
    ];

    if (gameLower.includes('ludo')) {
      baseMoves = [
        { id: 'm1', move: 'Rolled a 6! Deployed Red Token onto Arena', player: p1, time: '2m ago' },
        { id: 'm2', move: 'Rolled 4, moved Yellow Token 4 steps', player: p2, time: '1m 30s ago' },
        { id: 'm3', move: 'Rolled 6! Double turn, Token advanced +6', player: p1, time: '45s ago' },
        { id: 'm4', move: 'Safe Star position secured', player: p2, time: '15s ago' },
      ];
    } else if (gameLower.includes('carrom')) {
      baseMoves = [
        { id: 'm1', move: 'Break shot: 2 White coins clustered in center', player: p1, time: '2m ago' },
        { id: 'm2', move: 'Pocketed Black coin (Bottom-Left pocket)', player: p2, time: '1m 10s ago' },
        { id: 'm3', move: 'Cut shot: White Queen coin targeted', player: p1, time: '25s ago' },
      ];
    } else if (gameLower.includes('checkers')) {
      baseMoves = [
        { id: 'm1', move: '11-15 center control', player: p1, time: '2m ago' },
        { id: 'm2', move: '22-18 attack diagonally', player: p2, time: '1m 15s ago' },
        { id: 'm3', move: '15x22 Jump Capture!', player: p1, time: '30s ago' },
      ];
    }

    setMovesLog(baseMoves);

    const movePool = gameLower.includes('chess')
      ? [
          '4. Nxd4 Nf6',
          '5. Nc3 a6 (Najdorf variation)',
          '6. Be3 e5 (Central push)',
          '7. Nb3 Be6',
          '8. f3 Be7',
          '9. Qd2 O-O (Kingside Castle)',
          '10. O-O-O Nbd7 (Opposite side castling)',
          '11. g4 b5! Counter-attack',
          '12. g5 Nh5 (Knight outpost)',
          '13. Nd5 Bxd5',
          '14. exd5 f5',
        ]
      : gameLower.includes('ludo')
      ? [
          'Rolled 5! Jumped ahead +5 tiles',
          'Cut opponent token! Token returned to base',
          'Rolled 6! Extra bonus roll awarded',
          'Safe Star entry at tile #28',
          'Approaching home corridor (3 tiles away)',
        ]
      : gameLower.includes('carrom')
      ? [
          'Pocketed White Queen coin! (+3 points)',
          'Cover shot confirmed (+1 point)',
          'Fine bank shot, striker bounced cleanly',
          'Turn shifted to challenger',
        ]
      : [
          'Strategic move executed',
          'Defensive line fortified',
          'Turn completed with 14s on clock',
          'Positional advantage gained (+1.4)',
        ];

    let count = 6;
    const interval = setInterval(() => {
      const nextMove = movePool[Math.floor(Math.random() * movePool.length)];
      const actor = Math.random() > 0.5 ? p1 : p2;
      setMovesLog((prev) => [
        {
          id: `move_${Date.now()}_${count++}`,
          move: nextMove,
          player: actor,
          time: 'Just now',
        },
        ...prev.slice(0, 19),
      ]);
    }, 3200);

    return () => clearInterval(interval);
  }, [isOpen, target]);

  if (!isOpen || !target) return null;

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  const p1Name = target.players?.[0] || target.username || 'Player 1';
  const p2Name = target.players?.[1] || target.opponent || 'Player 2';
  const gameIcon = target.gameIcon || '♟️';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-3 sm:p-6 animate-fadeIn select-none">
      <div className="bg-[#080d1a] border border-sky-500/40 rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl shadow-sky-950/60 text-slate-100 space-y-4 flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-sky-500/20">
              {gameIcon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white font-mono tracking-wide">
                  SPECTATING: {p1Name}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-black uppercase tracking-wider animate-pulse">
                  <Radio className="w-3 h-3 text-red-400" /> LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {target.game} • {target.roomName || 'Arena 1'} • {target.matchType || 'Ranked Match'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Matchup Header Banner */}
        <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-3 shrink-0 flex items-center justify-between">
          {/* Player 1 */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600 border border-sky-400/40 flex items-center justify-center font-black text-sm text-white">
              {p1Name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-white">{p1Name}</span>
                {p1Name.toLowerCase().includes('aditya') && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/40">
                    👑 OWNER
                  </span>
                )}
              </div>
              <div className="text-[10px] text-sky-400 font-mono">Rating: 2140 ELO</div>
            </div>
          </div>

          {/* VS Center Badge */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-amber-400 font-mono tracking-widest bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
              VS
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-1 font-bold">
              {formatSecs(elapsedSeconds)}
            </span>
          </div>

          {/* Player 2 */}
          <div className="flex items-center gap-2.5 text-right flex-row-reverse">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 border border-indigo-400/40 flex items-center justify-center font-black text-sm text-white">
              {p2Name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs sm:text-sm font-bold text-white">{p2Name}</span>
              </div>
              <div className="text-[10px] text-indigo-400 font-mono">Rating: 2085 ELO</div>
            </div>
          </div>
        </div>

        {/* Live Arena Stream Canvas Simulation */}
        <div className="bg-[#050811] border border-slate-800/90 rounded-2xl p-4 flex-1 min-h-[220px] flex flex-col justify-between relative overflow-hidden">
          
          {/* Top Overlays */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 z-10">
            <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-bold">Stream: 1080p 60fps</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">Ping: 16ms</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-sky-300 font-bold">{spectatorCount} Viewers Live</span>
            </div>
          </div>

          {/* Simulated Game Graphic Centerpiece */}
          <div className="my-auto text-center py-4 space-y-3">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-sky-500/20 via-indigo-500/20 to-purple-500/20 border border-sky-500/30 flex items-center justify-center text-4xl shadow-inner relative">
              <span className="animate-bounce">{gameIcon}</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#050811] animate-ping" />
            </div>

            <div>
              <div className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">
                Active Game Match Streaming
              </div>
              <div className="text-sm font-black text-white mt-0.5">
                {target.game.toUpperCase()} ARENA TOURNAMENT
              </div>
            </div>

            {/* Latest Move Highlight */}
            {movesLog[0] && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-mono text-amber-300 font-bold shadow-lg">
                <span>Turn Event:</span>
                <span className="text-white">{movesLog[0].player}</span>
                <span className="text-sky-400">➔</span>
                <span className="text-amber-300">{movesLog[0].move}</span>
              </div>
            )}
          </div>

          {/* Live Sub-Second Turn Move Log */}
          <div className="border-t border-slate-800/80 pt-2.5 z-10">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              <span>Real-Time Turn Logs</span>
              <span className="text-sky-400 font-bold">Sub-Second Stream Active</span>
            </div>

            <div className="max-h-24 overflow-y-auto space-y-1 scrollbar-thin text-xs font-mono">
              {movesLog.map((m, idx) => (
                <div
                  key={m.id}
                  className={`flex items-center justify-between px-2.5 py-1 rounded-lg transition ${
                    idx === 0
                      ? 'bg-sky-500/15 border border-sky-500/30 text-sky-200'
                      : 'bg-slate-900/40 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-[11px]">{m.player}:</span>
                    <span className="text-[11px] text-amber-300">{m.move}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{m.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-3 shrink-0 pt-1">
          {onNextMatch ? (
            <button
              onClick={onNextMatch}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 border border-slate-700"
            >
              <span>Next Live Match</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Spectator Feed Synchronized</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-sky-500/20"
          >
            Exit Spectator Room
          </button>
        </div>

      </div>
    </div>
  );
};
