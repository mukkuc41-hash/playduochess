import React, { useState } from 'react';
import {
  ExternalLink,
  Sparkles,
  Rocket,
  Gamepad2,
  Copy,
  Check,
  Zap,
  Globe,
  Play,
  Share2,
  ChevronRight,
  Shield,
  Layers,
  Compass
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface MoreLikeThisSectionProps {
  onOpenPreviewModal?: () => void;
}

export const MoreLikeThisSection: React.FC<MoreLikeThisSectionProps> = ({
  onOpenPreviewModal,
}) => {
  const [copied, setCopied] = useState(false);
  const targetUrl = 'https://3d-void-rider.ai.studio';

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(targetUrl).then(() => {
      setCopied(true);
      soundFx.playMove();
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleLaunch = () => {
    soundFx.playWin();
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="more-like-this"
      aria-label="More Like This - Connected Second Website"
      className="w-full bg-gradient-to-b from-[#060a16] via-[#090d1f] to-[#04060e] border border-cyan-500/30 hover:border-cyan-400/60 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden transition-all duration-300"
    >
      {/* Background ambient cosmic glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
              MORE LIKE THIS
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <span>🚀</span>
              SECOND WEBSITE
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE &amp; CONNECTED
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2 pt-1 font-sans">
            <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-fuchsia-400 bg-clip-text text-transparent">
              3D VOID RIDER
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-400 font-mono">
              — Hyperspeed Sci-Fi Runner
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
            Love playing strategy on Duo Chess? Blast into deep space with our sister game — an intense 3D obstacle surfer and high-velocity void runner powered by WebGL.
          </p>
        </div>

        {/* Top CTA Launch Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleLaunch}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] border border-cyan-300/50 active:scale-95 transition-all duration-200 cursor-pointer group"
            id="more-like-this-header-launch"
          >
            <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            <span>PLAY 3D VOID RIDER</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>

      {/* Main Content Showcase Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 pt-6 items-center">
        
        {/* Left Column: Visual Game Banner & 3D Interactive Card */}
        <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 bg-gradient-to-br from-[#070e24] via-[#0d1636] to-[#120b29] p-5 sm:p-6 shadow-xl group">
          {/* Cyberpunk Neon Accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl group-hover:bg-cyan-400/30 transition-colors pointer-events-none" />
          
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-fuchsia-500 flex items-center justify-center text-white text-2xl shadow-[0_0_20px_rgba(6,182,212,0.6)] border border-cyan-300/50 shrink-0">
                🛸
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  OFFICIAL SISTER SITE
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  3D Void Rider
                </h3>
                <span className="text-xs text-fuchsia-300/90 font-mono font-medium">
                  https://3d-void-rider.ai.studio
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1">
              <span>★</span> 4.9 Rating
            </span>
          </div>

          {/* Futuristic Tunnel Simulation Graphic */}
          <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden bg-[#030611] border border-cyan-500/30 flex items-center justify-center mb-4 select-none">
            {/* Perspective Grid lines */}
            <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:28px_28px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030611] via-transparent to-[#030611]/80" />

            {/* Glowing Warp Tunnel Center */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 p-[2px] animate-pulse shadow-[0_0_30px_rgba(6,182,212,0.8)]">
                <div className="w-full h-full rounded-full bg-[#050917] flex items-center justify-center text-3xl">
                  🚀
                </div>
              </div>
              <span className="mt-3 text-xs font-black tracking-widest uppercase text-cyan-300 font-mono bg-black/60 px-3 py-1 rounded-full border border-cyan-400/40 backdrop-blur-md">
                HIGH-OCTANE 3D ARCADE
              </span>
              <p className="text-[11px] text-slate-300 font-mono mt-1">
                Dodge Void Pillars • Hit Sonic Boosts • Beat Highscores
              </p>
            </div>

            {/* Velocity HUD Tag */}
            <div className="absolute top-2.5 left-2.5 bg-black/70 border border-cyan-500/40 rounded-lg px-2 py-1 text-[10px] font-mono text-cyan-300 backdrop-blur-sm">
              WARP: 1,420 KM/H
            </div>
            <div className="absolute top-2.5 right-2.5 bg-black/70 border border-fuchsia-500/40 rounded-lg px-2 py-1 text-[10px] font-mono text-fuchsia-300 backdrop-blur-sm">
              ENGINE: THREE.JS
            </div>
            <div className="absolute bottom-2.5 left-2.5 bg-black/70 border border-slate-700 rounded-lg px-2 py-1 text-[10px] font-mono text-emerald-300 backdrop-blur-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              DIRECT CONNECT READY
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLaunch}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
                id="btn-play-void-rider-card"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Website</span>
              </button>

              {onOpenPreviewModal && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playMove();
                    onOpenPreviewModal();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/40 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  title="Preview 3D Void Rider inside modal"
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Preview In-App</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 text-xs font-mono font-medium flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Copy website link to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Why Play & Feature Breakdown */}
        <div className="text-left space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              STUDIO CONNECTED UNIVERSE
            </span>
            <h3 className="text-lg font-black text-white">
              Why You&apos;ll Love 3D Void Rider
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Created under the same studio philosophy as Duo Chess: zero lag, instant in-browser play, no downloads required, and modern responsive controls.
            </p>
          </div>

          {/* 3 Feature Pills */}
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-[#080e22] border border-cyan-500/20 hover:border-cyan-500/40 flex items-start gap-3 transition">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">High-Speed 3D Physics</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Experience dynamic banking, inertia gliding, and supersonic speed rings across endless procedural neon sectors.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#080e22] border border-fuchsia-500/20 hover:border-fuchsia-500/40 flex items-start gap-3 transition">
              <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300 shrink-0 mt-0.5">
                <Compass className="w-4 h-4 text-fuchsia-400" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Touch, Keyboard &amp; Gamepad Support</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Play smoothly on desktop with A/D, arrows or mouse, or slide and tilt on mobile devices with zero lag.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#080e22] border border-emerald-500/20 hover:border-emerald-500/40 flex items-start gap-3 transition">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Direct AI Studio Deployment</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Runs directly on Google AI Studio infrastructure with 99.9% uptime, no third-party trackers, and fast global CDN.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Connect Link Bar */}
          <div className="p-3 rounded-xl bg-[#050814] border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 overflow-hidden">
              <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-400 truncate">URL:</span>
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 hover:text-cyan-200 underline font-bold truncate"
              >
                {targetUrl}
              </a>
            </div>

            <button
              type="button"
              onClick={handleLaunch}
              className="text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1 shrink-0 transition"
            >
              <span>Visit</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
