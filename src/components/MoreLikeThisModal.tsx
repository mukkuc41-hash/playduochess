import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Rocket,
  Sparkles,
  Gamepad2,
  Copy,
  Check,
  Globe,
  Maximize2,
  Play,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface MoreLikeThisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MoreLikeThisModal: React.FC<MoreLikeThisModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'preview'>('overview');
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen) return null;

  const targetUrl = 'https://3d-void-rider.ai.studio';

  const handleLaunchExternal = () => {
    soundFx.playWin();
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl).then(() => {
      setCopied(true);
      soundFx.playMove();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="more-like-this-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#070b18] border border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[92vh] text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#090e21]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-fuchsia-600 flex items-center justify-center text-white text-xl shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-300/40 shrink-0">
              🚀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="more-like-this-modal-title"
                  className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-sans"
                >
                  3D Void Rider
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  SECOND WEBSITE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Connected Studio Game: https://3d-void-rider.ai.studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playMove();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-slate-800/70 flex items-center justify-between gap-3 bg-[#050814]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playMove();
                setActiveTab('overview');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Game Overview &amp; Controls</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playMove();
                setActiveTab('preview');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Live In-App Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg transition"
            title="Copy URL"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar space-y-5">
          {activeTab === 'overview' ? (
            <>
              {/* Hero Banner with Speed & Sci-Fi Visual */}
              <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-gradient-to-r from-[#0a122c] via-[#091538] to-[#120f30] p-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2 max-w-md">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-bold">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    POWERED BY WEBGL &amp; THREE.JS
                  </div>
                  <h4 className="text-2xl font-black text-white tracking-wide">
                    Ride the Neon Abyss
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                    Navigate an endless hyperspace corridor filled with shifting obstacles, warp speed boosters, and quantum portals. Connect seamlessly between Duo Chess and 3D Void Rider!
                  </p>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleLaunchExternal}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white font-black text-sm tracking-wider uppercase flex items-center gap-2.5 shadow-[0_0_25px_rgba(6,182,212,0.5)] border border-cyan-300/60 active:scale-95 transition-all duration-200 cursor-pointer group"
                    id="btn-modal-launch-hero"
                  >
                    <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    <span>LAUNCH GAME NOW</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Free to Play • No Sign-up Required
                  </span>
                </div>
              </div>

              {/* Specs & Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[#090f23] border border-cyan-500/20 text-left space-y-1">
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                    GENRE
                  </span>
                  <div className="text-sm font-black text-white">3D Sci-Fi Runner</div>
                  <p className="text-[11px] text-slate-400">
                    High-speed procedural obstacle avoidance with drift mechanics.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#090f23] border border-fuchsia-500/20 text-left space-y-1">
                  <span className="text-[10px] font-mono uppercase text-fuchsia-400 font-bold">
                    PLATFORM
                  </span>
                  <div className="text-sm font-black text-white">Google AI Studio</div>
                  <p className="text-[11px] text-slate-400">
                    Host URL: https://3d-void-rider.ai.studio with instant cloud deployment.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#090f23] border border-emerald-500/20 text-left space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                    COMPATIBILITY
                  </span>
                  <div className="text-sm font-black text-white">Desktop &amp; Mobile</div>
                  <p className="text-[11px] text-slate-400">
                    Keyboard, mouse, touch swipe, and game controller compatible.
                  </p>
                </div>
              </div>

              {/* Controls Cheatsheet */}
              <div className="p-4 rounded-2xl bg-[#050816] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Gamepad2 className="w-4 h-4 text-cyan-400" />
                    <span>Controls Cheatsheet</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Intuitive &amp; Responsive
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="font-mono font-black text-cyan-300">A / D or ◀ / ▶</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Steer Left / Right</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="font-mono font-black text-cyan-300">W or ▲</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Sonic Afterburner</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="font-mono font-black text-cyan-300">SPACEBAR</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Shield Pulse / Jump</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="font-mono font-black text-cyan-300">TOUCH / DRAG</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Mobile Gyro &amp; Swipe</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Live Embedded IFrame Sandbox */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Interactive Live Frame:</span>
                  <strong className="text-white font-mono">{targetUrl}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIframeKey((k) => k + 1)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                    title="Reload embedded view"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reload</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLaunchExternal}
                    className="p-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs flex items-center gap-1 font-bold"
                    title="Open full page"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Full Screen</span>
                  </button>
                </div>
              </div>

              <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-cyan-500/40 bg-black relative shadow-inner">
                <iframe
                  key={iframeKey}
                  src={targetUrl}
                  title="3D Void Rider - Connected Game"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>

              <p className="text-[11px] text-slate-400 font-mono text-center">
                Tip: For the highest framerate and full audio immersion, click <strong className="text-cyan-300 cursor-pointer" onClick={handleLaunchExternal}>Launch in New Tab</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-800 bg-[#060a17] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Website Address:</span>
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline font-bold"
            >
              {targetUrl}
            </a>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Back to Duo Chess
            </button>
            <button
              type="button"
              onClick={handleLaunchExternal}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Launch 3D Void Rider</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
