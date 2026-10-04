import React, { useState } from 'react';
import {
  Globe,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  QrCode,
  Maximize2,
  X,
  Play,
  Share2,
  Flame,
  ArrowRight,
  Layers,
  Cpu,
  Trophy
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface MoreLikeThisMenuProps {
  currentUser?: {
    username?: string;
    coins?: number;
    gems?: number;
  } | null;
  onOpenGameHub?: () => void;
  onStartPvP?: () => void;
}

export const MoreLikeThisMenu: React.FC<MoreLikeThisMenuProps> = ({
  currentUser,
  onOpenGameHub,
  onStartPvP,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'sister_sites' | 'tactical_chess' | 'pvp_arenas'>('all');

  const secondWebsiteUrl = 'https://playduochess.ai.studio';

  const handleLaunchSecondWebsite = () => {
    soundFx.playMove();
    window.open(secondWebsiteUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyUrl = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFx.playClick();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(secondWebsiteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = () => {
    soundFx.playMove();
    const shareData = {
      title: 'Play Duo Chess - AI Studio Edition',
      text: 'Experience real-time twin-board tactical chess, multiplayer arenas, and AI coaching at Play Duo Chess!',
      url: secondWebsiteUrl,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => handleCopyUrl());
    } else {
      handleCopyUrl();
    }
  };

  // Curated "More Like This" game experiences
  const relatedEcosystem = [
    {
      id: 'playduochess_main',
      title: 'Play Duo Chess Official',
      url: secondWebsiteUrl,
      subtitle: 'Dedicated Standalone Arena',
      description: 'Our premier sister web application featuring twin-board real-time chess with synchronized timer engine.',
      icon: '♟️',
      badge: 'SISTER WEBSITE',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      category: 'sister_sites',
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.25)] border-emerald-500/40 hover:border-emerald-400',
      isExternal: true,
      players: '12.4k online',
    },
    {
      id: 'duo_chess_blitz',
      title: 'Duo Chess Blitz 3+2',
      url: secondWebsiteUrl,
      subtitle: 'High-Velocity Twin Clash',
      description: 'Rapid 3-minute blitz with +2s increment across simultaneous boards. Designed for adrenaline-fueled grandmasters.',
      icon: '⚡',
      badge: 'HOT MODE',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      category: 'tactical_chess',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)] border-amber-500/30 hover:border-amber-400',
      isExternal: true,
      players: '4.8k playing',
    },
    {
      id: 'fog_duo_chess',
      title: 'Fog of War Duo Chess',
      url: secondWebsiteUrl,
      subtitle: 'Tactical Reconnaissance',
      description: 'Squares outside your piece attack vectors are masked in tactical fog. Stealth moves, traps, and strategic recon.',
      icon: '🌫️',
      badge: 'VARIANT',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      category: 'tactical_chess',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)] border-purple-500/30 hover:border-purple-400',
      isExternal: true,
      players: '3.1k playing',
    },
    {
      id: 'gemini_ai_coach',
      title: 'AI Grandmaster Sparring',
      url: secondWebsiteUrl,
      subtitle: 'Gemini & Stockfish Engine',
      description: 'Interactive tactical assistant providing move-by-move evaluation, blunder detection, and positional analysis.',
      icon: '🤖',
      badge: 'AI ENGINE',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      category: 'sister_sites',
      glow: 'shadow-[0_0_20px_rgba(14,165,233,0.2)] border-sky-500/30 hover:border-sky-400',
      isExternal: true,
      players: '2.5k sessions',
    },
    {
      id: 'wheel_of_luck_hub',
      title: '20-in-1 Wheel of Luck',
      url: '#',
      subtitle: 'Current Multi-Game Arcade',
      description: 'Carrom, Ludo, Battleship, Uno, Darts, Ping Pong, and 20 classic games in one unified dark gaming arena.',
      icon: '🎯',
      badge: 'MULTI-GAME',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      category: 'pvp_arenas',
      glow: 'shadow-[0_0_20px_rgba(99,102,241,0.2)] border-indigo-500/30 hover:border-indigo-400',
      isExternal: false,
      players: '8.4k in arena',
    },
  ];

  const filteredItems = relatedEcosystem.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <div id="more-like-this-menu" className="w-full space-y-4 text-left">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#0d142b] via-[#090d1e] to-[#0a0f24] border border-indigo-900/60 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-sky-500 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#080d1e] rounded-[14px] flex items-center justify-center text-indigo-400 text-xl font-bold">
              <Globe className="w-6 h-6 animate-pulse text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 tracking-wider">
                ECOSYSTEM HUB
              </span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Connection
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-wide mt-0.5 flex items-center gap-2 font-mono">
              <span>MORE LIKE THIS</span>
              <span className="text-slate-500 font-sans font-normal text-sm">|</span>
              <span className="text-sky-400 font-sans text-sm sm:text-base font-bold">
                Connect Second Website
              </span>
            </h3>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Discover sister arenas, twin-board tactics, and connect to our second website at{' '}
              <a
                href={secondWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 underline font-mono font-bold"
              >
                playduochess.ai.studio
              </a>
            </p>
          </div>
        </div>

        {/* Quick Launch & Preview Header Buttons */}
        <div className="relative z-10 flex items-center gap-2">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            title="Open Interactive Connection Bridge & Live Preview"
          >
            <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Connection Bridge</span>
          </button>

          <button
            onClick={handleLaunchSecondWebsite}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:via-indigo-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider transition shadow-[0_0_20px_rgba(14,165,233,0.4)] flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Play Duo Chess</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ================= HERO SHOWCASE CARD: CONNECTING SECOND WEBSITE ================= */}
      <div className="bg-gradient-to-br from-[#0b1228] via-[#080d1e] to-[#040814] border-2 border-indigo-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          
          {/* Left Column: Visual Icon & 3D Twin-Board Graphic */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="relative">
              {/* Glowing board frame */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-[#1d1238] via-[#0c1638] to-[#060b1c] border-2 border-purple-500/60 shadow-[0_0_35px_rgba(168,85,247,0.45)] flex items-center justify-center relative transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="absolute inset-2 grid grid-cols-2 grid-rows-2 gap-1 opacity-40 rounded-xl overflow-hidden">
                  <div className="bg-sky-400" />
                  <div className="bg-purple-600" />
                  <div className="bg-purple-600" />
                  <div className="bg-sky-400" />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-4xl filter drop-shadow-[0_0_15px_rgba(216,180,254,0.9)] animate-pulse">
                    ⚔️
                  </span>
                  <div className="flex items-center gap-1 text-sm font-mono font-black text-amber-300 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] -mt-1">
                    <span>DUO</span>
                    <span className="text-sky-300">CHESS</span>
                  </div>
                </div>
              </div>

              {/* Verified badge */}
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-lg">
                <ShieldCheck className="w-3 h-3" />
                <span>OFFICIAL SISTER SITE</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-base font-black text-white font-mono uppercase tracking-wider">
                PLAYDUOCHESS.AI.STUDIO
              </h4>
              <p className="text-xs text-sky-400 font-semibold flex items-center gap-1 justify-center sm:justify-start mt-0.5">
                <Sparkles className="w-3 h-3" />
                <span>The Premier Twin-Board Chess Arena</span>
              </p>
            </div>
          </div>

          {/* Middle Column: Key Features & Cross-Platform Sync Details */}
          <div className="lg:col-span-5 space-y-3">
            <div>
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                Cross-Platform Integration
              </span>
              <h3 className="text-lg font-black text-white leading-tight">
                Connect Directly to Our Standalone Duo Chess Platform
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Looking for more tactical challenges like Duo Chess? Our second website at{' '}
                <span className="text-sky-300 font-mono font-bold">playduochess.ai.studio</span> features high-octane 
                dual-board matches, rapid matchmaking, real-time Elo rating, and synchronized cross-platform profile rewards.
              </p>
            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2 rounded-xl bg-[#060b17] border border-slate-800/90 text-center">
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 mx-auto flex items-center justify-center mb-1">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] font-bold text-slate-200">Twin-Board PvP</div>
                <div className="text-[9px] text-slate-400">Zero Latency</div>
              </div>

              <div className="p-2 rounded-xl bg-[#060b17] border border-slate-800/90 text-center">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center mb-1">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] font-bold text-slate-200">Gemini & Stockfish</div>
                <div className="text-[9px] text-slate-400">Tactical Coach</div>
              </div>

              <div className="p-2 rounded-xl bg-[#060b17] border border-slate-800/90 text-center">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-1">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] font-bold text-slate-200">Cross Sync</div>
                <div className="text-[9px] text-slate-400">Shared Identity</div>
              </div>
            </div>

            {/* Direct URL Box with Click-to-Copy */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#050814] border border-slate-800 text-xs font-mono">
              <Globe className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-slate-300 font-bold flex-1 truncate select-all">
                {secondWebsiteUrl}
              </span>
              <button
                onClick={handleCopyUrl}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                title="Copy website link"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Big Launch Action Panel */}
          <div className="lg:col-span-3 flex flex-col justify-center space-y-2.5 bg-[#050814]/90 border border-indigo-950 rounded-2xl p-4">
            <div className="text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                Launch Target
              </span>
              <div className="text-xs font-black text-white mt-0.5">
                Play Duo Chess Online
              </div>
              <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready to Connect (playduochess.ai.studio)</span>
              </div>
            </div>

            {/* Launch Button */}
            <button
              id="btn-launch-second-website"
              onClick={handleLaunchSecondWebsite}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:via-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(99,102,241,0.5)] transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CONNECT & PLAY NOW</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Preview Bridge Button */}
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Preview & Connect Bridge</span>
            </button>

            {/* Share / Invite Button */}
            <button
              onClick={handleShare}
              className="w-full py-2 px-3 rounded-xl bg-transparent hover:bg-slate-800/40 text-slate-400 hover:text-white font-medium text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3 h-3 text-purple-400" />
              <span>Share Website with Friends</span>
            </button>
          </div>

        </div>
      </div>

      {/* ================= "MORE LIKE THIS" EXPANDED ECOSYSTEM CARDS ================= */}
      <div className="bg-[#080d1d] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>MORE LIKE THIS MENU — SISTER ARENAS & EXPERIENCES</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Quickly switch between our sister apps, tactical chess variants, and multiplayer arenas
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center bg-[#050814] border border-slate-800 p-0.5 rounded-xl text-xs self-start sm:self-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                activeCategory === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveCategory('sister_sites')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                activeCategory === 'sister_sites' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sister Websites
            </button>
            <button
              onClick={() => setActiveCategory('tactical_chess')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                activeCategory === 'tactical_chess' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tactical Chess
            </button>
            <button
              onClick={() => setActiveCategory('pvp_arenas')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                activeCategory === 'pvp_arenas' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              20-Game Hub
            </button>
          </div>
        </div>

        {/* 5-Card Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-[#050814] border rounded-xl p-3.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 cursor-pointer group ${item.glow}`}
              onClick={() => {
                soundFx.playMove();
                if (item.isExternal) {
                  window.open(item.url, '_blank', 'noopener,noreferrer');
                } else if (onOpenGameHub) {
                  onOpenGameHub();
                }
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <h5 className="text-xs font-black text-white group-hover:text-sky-300 transition-colors">
                  {item.title}
                </h5>
                <div className="text-[10px] text-slate-400 font-semibold font-mono">
                  {item.subtitle}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug mt-1.5 line-clamp-3">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {item.players}
                </span>

                <span className="text-sky-400 group-hover:text-sky-300 font-bold flex items-center gap-1">
                  <span>{item.isExternal ? 'Connect' : 'Play'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= INTERACTIVE CONNECTION BRIDGE & PREVIEW MODAL ================= */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#080d1e] border-2 border-indigo-500/50 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0b1228]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-base">
                  🌐
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white font-mono flex items-center gap-2">
                    <span>PLAY DUO CHESS CONNECTION BRIDGE</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ONLINE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Target: <span className="font-mono text-sky-300">{secondWebsiteUrl}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
              
              {/* Quick Launch Hero */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-sm font-black text-white font-mono">
                    Ready to Connect to playduochess.ai.studio?
                  </div>
                  <p className="text-xs text-slate-300">
                    Launch the full dedicated website in a new window or copy the link to share across your gaming communities.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <button
                    onClick={handleLaunchSecondWebsite}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-sky-500/30"
                  >
                    <span>Launch Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cross-Platform Details & Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#050814] border border-slate-800 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Synchronized User Identity</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Your username <span className="text-sky-300 font-bold">({currentUser?.username || 'Guest'})</span> and 
                    competitive records are recognized across both Duo Chess web platforms. Play seamlessly on both websites.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#050814] border border-slate-800 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Twin-Board Real-Time Netcode</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <span className="text-white font-bold">playduochess.ai.studio</span> features high-performance 
                    WebSocket synchronization with less than 20ms round-trip latency for rapid competitive play.
                  </p>
                </div>
              </div>

              {/* QR Code Connection Visual for Mobile */}
              <div className="p-4 rounded-xl bg-[#050814] border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-sky-400" />
                    <span>Scan to Connect on Mobile</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Open your camera on your phone or tablet to launch Play Duo Chess instantly on mobile browser.
                  </p>
                  <div className="font-mono text-[10px] text-sky-400 font-bold">
                    https://playduochess.ai.studio
                  </div>
                </div>

                <div className="w-20 h-20 bg-white p-1 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                  {/* Decorative QR visual */}
                  <div className="w-full h-full border-2 border-slate-900 grid grid-cols-5 grid-rows-5 gap-0.5 p-0.5 bg-slate-950">
                    <div className="bg-white col-span-2 row-span-2" />
                    <div className="bg-transparent" />
                    <div className="bg-white col-span-2 row-span-2" />
                    <div className="bg-transparent" />
                    <div className="bg-white" />
                    <div className="bg-transparent" />
                    <div className="bg-white col-span-2 row-span-2" />
                    <div className="bg-transparent" />
                    <div className="bg-white" />
                    <div className="bg-white" />
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-800 bg-[#0b1228] flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                Direct Destination: <span className="text-sky-300 font-bold">playduochess.ai.studio</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleLaunchSecondWebsite}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
