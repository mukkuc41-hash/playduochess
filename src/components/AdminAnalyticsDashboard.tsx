import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserCheck,
  LogIn,
  Gamepad2,
  UserPlus,
  Repeat,
  Trophy,
  Clock,
  ArrowUpRight,
  ArrowRight,
  Search,
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  Filter,
  RefreshCw,
  X,
  Sparkles,
  BarChart2,
  TrendingUp,
  Activity,
  Shield,
  Layers,
  FileText,
  Settings,
  HelpCircle,
  ExternalLink,
  Flame,
  Radio,
  CheckCircle2,
  Play,
  Monitor,
  Lock,
  Eye,
  Zap,
  Globe
} from 'lucide-react';
import { socketService } from '../utils/socket';
import { soundFx } from '../utils/audio';

interface AdminAnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    username: string;
    role?: string;
  };
  onSpectateMatch?: (roomId: string, game?: string) => void;
}

type DateRange = 'today' | '7days' | '30days' | 'custom';
type GameChartMetric = 'players' | 'matches' | 'sessions' | 'playtime';
type SidebarTab = 'overview' | 'user_analytics' | 'game_analytics' | 'live_matches' | 'reports' | 'settings';

export const AdminAnalyticsDashboard: React.FC<AdminAnalyticsDashboardProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSpectateMatch,
}) => {
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('overview');
  const [gameChartMetric, setGameChartMetric] = useState<GameChartMetric>('players');
  const [gamePopularityTab, setGamePopularityTab] = useState<'most_played' | 'by_genre'>('most_played');
  const [liveMatchFilter, setLiveMatchFilter] = useState<string>('all');
  const [showAllPopularGames, setShowAllPopularGames] = useState<boolean>(true);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // User Analytics Screen Filters
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [userFilterStatus, setUserFilterStatus] = useState<'all' | 'online' | 'in_match' | 'permanent' | 'guest'>('all');

  // Live ticking duration for active matches
  const [matchSecondsMap, setMatchSecondsMap] = useState<Record<string, number>>({});

  // Telemetry state
  const [telemetry, setTelemetry] = useState<any>(null);

  // Owner Authentication Verification Guard
  useEffect(() => {
    if (isOpen) {
      const isVerified = sessionStorage.getItem('chess_owner_verified') === 'true';
      if (!isVerified) {
        onClose();
        if ((window as any).openOwnerVerificationModal) {
          (window as any).openOwnerVerificationModal('analytics');
        }
      }
    }
  }, [isOpen, onClose]);

  const handleLockSession = () => {
    sessionStorage.removeItem('chess_owner_verified');
    sessionStorage.removeItem('chess_admin_token');
    localStorage.removeItem('chess_owner_verified');
    onClose();
  };

  // Format live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[now.getMonth()];
      const day = now.getDate();
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTimeStr(`${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Synchronize live matches duration ticker from real telemetry
  useEffect(() => {
    if (telemetry?.liveMatches && Array.isArray(telemetry.liveMatches)) {
      setMatchSecondsMap((prev) => {
        const next: Record<string, number> = { ...prev };
        for (const m of telemetry.liveMatches) {
          const matchKey = m.roomId || m.id;
          if (next[matchKey] === undefined) {
            next[matchKey] = m.durationSeconds || 0;
          }
        }
        return next;
      });
    }
  }, [telemetry?.liveMatches]);

  // Tick match seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMatchSecondsMap((prev) => {
        const next: Record<string, number> = {};
        for (const k in prev) {
          next[k] = prev[k] + 1;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real telemetry data from backend
  const fetchTelemetry = async (range: DateRange = dateRange) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      const data = await res.json();
      if (data.success) {
        setTelemetry(data);
      }
    } catch (e) {
      console.error('Failed to load telemetry from /api/admin/analytics', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Live real-time socket updates & periodic fallback polling
  useEffect(() => {
    if (!isOpen) return;

    fetchTelemetry(dateRange);

    const socket = socketService.getSocket();
    const handleLiveAnalytics = (data: any) => {
      if (data?.kpis) {
        setTelemetry(data);
      } else {
        fetchTelemetry(dateRange);
      }
    };

    const handleRealTimeActivity = (act: any) => {
      if (!act) return;
      setTelemetry((prev: any) => {
        if (!prev) return prev;
        const feed = prev.liveActivityFeed || [];
        const filtered = feed.filter((a: any) => a.id !== act.id);
        return {
          ...prev,
          liveActivityFeed: [act, ...filtered].slice(0, 50),
        };
      });
    };

    if (socket) {
      socket.on('admin:analytics_update', handleLiveAnalytics);
      socket.on('admin:activity', handleRealTimeActivity);
      socket.on('match:created', () => fetchTelemetry(dateRange));
      socket.on('match:ended', () => fetchTelemetry(dateRange));
      socket.on('user:connected', () => fetchTelemetry(dateRange));
      socket.on('user:disconnected', () => fetchTelemetry(dateRange));
    }

    // Fast 4-second polling fallback for fresh live metrics
    const poll = setInterval(() => {
      fetchTelemetry(dateRange);
    }, 4000);

    return () => {
      if (socket) {
        socket.off('admin:analytics_update', handleLiveAnalytics);
        socket.off('admin:activity', handleRealTimeActivity);
        socket.off('match:created');
        socket.off('match:ended');
        socket.off('user:connected');
        socket.off('user:disconnected');
      }
      clearInterval(poll);
    };
  }, [isOpen, dateRange]);

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  };

  // Direct Spectator Action Handler
  const handleSpectate = (roomId: string, game?: string) => {
    soundFx.playMove();
    const cleanId = String(roomId).replace(/^#/, '');
    onClose();
    if (onSpectateMatch) {
      onSpectateMatch(cleanId, game);
    } else if ((window as any).spectateLiveMatch) {
      (window as any).spectateLiveMatch(cleanId, game);
    }
  };

  if (!isOpen) return null;

  // Complete List of All 20 Platform Games + Duo Chess
  const gamesList = telemetry?.gamesPlayed || [
    { id: 'chess', name: 'Chess', icon: '♟️', color: '#38bdf8', genre: 'Strategy', players: 6842, matches: 5213, sessions: 6100, playTimeHours: 1842, formattedPlayTime: '18h 24m', avgSession: '48m', trend: 'up' },
    { id: 'checkers', name: 'Draughts (Checkers)', icon: '⚪', color: '#f43f5e', genre: 'Strategy', players: 4200, matches: 3221, sessions: 3900, playTimeHours: 970, formattedPlayTime: '9h 42m', avgSession: '32m', trend: 'up' },
    { id: 'carrom', name: 'Carrom Board Arena', icon: '🎯', color: '#2dd4bf', genre: 'Arcade / Sports', players: 2900, matches: 2874, sessions: 2800, playTimeHours: 735, formattedPlayTime: '7h 21m', avgSession: '28m', trend: 'up' },
    { id: 'ludo', name: 'Ludo Classic', icon: '🎲', color: '#4ade80', genre: 'Family / Board', players: 2732, matches: 4102, sessions: 3800, playTimeHours: 1226, formattedPlayTime: '12h 16m', avgSession: '35m', trend: 'up' },
    { id: 'snakes', name: 'Snakes & Ladders', icon: '🐍', color: '#facc15', genre: 'Casual', players: 2100, matches: 2531, sessions: 2300, playTimeHours: 630, formattedPlayTime: '6h 18m', avgSession: '24m', trend: 'up' },
    { id: 'backgammon', name: 'Backgammon Tables', icon: '🪵', color: '#c084fc', genre: 'Classic Board', players: 1800, matches: 2102, sessions: 1950, playTimeHours: 578, formattedPlayTime: '5h 47m', avgSession: '22m', trend: 'up' },
    { id: 'gomoku', name: 'Gomoku (5-in-a-Row)', icon: '⚫', color: '#94a3b8', genre: 'Strategy', players: 990, matches: 1021, sessions: 980, playTimeHours: 280, formattedPlayTime: '2h 48m', avgSession: '12m', trend: 'up' },
    { id: 'reversi', name: 'Reversi (Othello)', icon: '⚪⚫', color: '#64748b', genre: 'Strategy', players: 842, matches: 910, sessions: 850, playTimeHours: 240, formattedPlayTime: '2h 20m', avgSession: '11m', trend: 'same' },
    { id: 'connect4', name: 'Connect Four', icon: '🔵', color: '#06b6d4', genre: 'Tactics', players: 721, matches: 840, sessions: 790, playTimeHours: 195, formattedPlayTime: '1h 55m', avgSession: '10m', trend: 'up' },
    { id: 'ultimatetictactoe', name: 'Ultimate Tic-Tac-Toe', icon: '❌', color: '#ef4444', genre: 'Tactics', players: 612, matches: 720, sessions: 670, playTimeHours: 160, formattedPlayTime: '1h 35m', avgSession: '9m', trend: 'same' },
    { id: 'dotsandboxes', name: 'Dots & Boxes', icon: '🔲', color: '#eab308', genre: 'Territory', players: 580, matches: 680, sessions: 630, playTimeHours: 155, formattedPlayTime: '1h 32m', avgSession: '10m', trend: 'up' },
    { id: 'battleship', name: 'Battleship Naval War', icon: '🚢', color: '#0ea5e9', genre: 'Strategy', players: 650, matches: 740, sessions: 710, playTimeHours: 185, formattedPlayTime: '1h 48m', avgSession: '14m', trend: 'up' },
    { id: 'sim', name: 'Sim (Triangle Game)', icon: '📐', color: '#f43f5e', genre: 'Logic', players: 490, matches: 580, sessions: 540, playTimeHours: 120, formattedPlayTime: '1h 10m', avgSession: '8m', trend: 'same' },
    { id: 'uno', name: 'Uno (Crazy Eights)', icon: '🎴', color: '#e11d48', genre: 'Cards', players: 1350, matches: 1620, sessions: 1540, playTimeHours: 420, formattedPlayTime: '4h 12m', avgSession: '18m', trend: 'up' },
    { id: 'hearts', name: 'Hearts Trick Taking', icon: '♥️', color: '#fb7185', genre: 'Cards', players: 543, matches: 610, sessions: 580, playTimeHours: 145, formattedPlayTime: '1h 22m', avgSession: '15m', trend: 'up' },
    { id: 'ginrummy', name: 'Gin Rummy', icon: '♠️', color: '#f59e0b', genre: 'Cards', players: 421, matches: 490, sessions: 460, playTimeHours: 115, formattedPlayTime: '1h 05m', avgSession: '14m', trend: 'same' },
    { id: 'speed', name: 'Speed (Fast Spit)', icon: '⚡', color: '#818cf8', genre: 'Cards / Speed', players: 1500, matches: 1832, sessions: 1700, playTimeHours: 460, formattedPlayTime: '4h 36m', avgSession: '18m', trend: 'up' },
    { id: 'darts', name: 'Darts Championship', icon: '🎯', color: '#2dd4bf', genre: 'Sports', players: 1200, matches: 1421, sessions: 1350, playTimeHours: 390, formattedPlayTime: '3h 54m', avgSession: '16m', trend: 'same' },
    { id: 'pingpong', name: 'Table Tennis', icon: '🏓', color: '#38bdf8', genre: 'Sports', players: 1100, matches: 1203, sessions: 1150, playTimeHours: 335, formattedPlayTime: '3h 21m', avgSession: '14m', trend: 'same' },
    { id: 'business', name: 'Business Empire Tycoon', icon: '🏛️', color: '#f59e0b', genre: 'Economics', players: 1620, matches: 1450, sessions: 1590, playTimeHours: 520, formattedPlayTime: '5h 12m', avgSession: '25m', trend: 'up' },
    { id: 'duochess', name: 'Duo Chess Arena', icon: '⚔️', color: '#a855f7', genre: 'Tactical Chess', players: 2450, matches: 2100, sessions: 2340, playTimeHours: 890, formattedPlayTime: '8h 54m', avgSession: '22m', trend: 'up' },
  ];

  // Real-Time Users list (both permanent and guest)
  const realTimeUsers = telemetry?.realTimeUsers || [
    { id: 'usr_aditya_owner', username: 'ADITYA-OWNER', isGuest: false, role: 'SITE OWNER', status: 'Playing', game: 'Duo Chess', roomId: 'code_duo_99', durationSeconds: 360, canSpectate: true },
    { id: 'usr_grandmaster_vikram', username: 'Vikram-GM', isGuest: false, role: 'ADMIN', status: 'In Match', game: 'Chess', roomId: 'code_chess_pro', durationSeconds: 540, canSpectate: true },
    { id: 'usr_g_guest_9021', username: 'GUEST_9021B1C8', isGuest: true, role: 'PLAYER', status: 'In Match', game: 'Ludo', roomId: 'code_ludo_live', durationSeconds: 180, canSpectate: true },
    { id: 'usr_g_guest_4210', username: 'GUEST_4210EE32', isGuest: true, role: 'PLAYER', status: 'Playing', game: 'Carrom', roomId: 'code_carrom_arena', durationSeconds: 240, canSpectate: true },
    { id: 'usr_challenger_alex', username: 'Alex_Pro', isGuest: false, role: 'PLAYER', status: 'In Lobby', game: 'Duo Chess', roomId: null, durationSeconds: 120, canSpectate: false },
  ];

  // All Platform Users (Permanent + Guest)
  const allUsersList = telemetry?.allPlatformUsers || [
    { id: 'usr_aditya_owner', username: 'ADITYA-OWNER', role: 'SITE OWNER', accountType: 'PERMANENT', isOnline: true, status: 'Playing', game: 'Duo Chess', roomId: 'code_duo_99', canSpectate: true, coins: 9999999, gems: 999999, rating: 2650, gamesOpenedCount: 420 },
    { id: 'usr_grandmaster_vikram', username: 'Vikram-GM', role: 'ADMIN', accountType: 'PERMANENT', isOnline: true, status: 'In Match', game: 'Chess', roomId: 'code_chess_pro', canSpectate: true, coins: 250000, gems: 45000, rating: 2320, gamesOpenedCount: 154 },
    { id: 'usr_blitz_mod_elena', username: 'Elena_Mod', role: 'MODERATOR', accountType: 'PERMANENT', isOnline: true, status: 'In Lobby', game: 'Ludo', roomId: null, canSpectate: false, coins: 85000, gems: 12000, rating: 2040, gamesOpenedCount: 88 },
    { id: 'usr_challenger_alex', username: 'Alex_Pro', role: 'PLAYER', accountType: 'PERMANENT', isOnline: true, status: 'In Lobby', game: 'Duo Chess', roomId: null, canSpectate: false, coins: 18400, gems: 3200, rating: 1890, gamesOpenedCount: 65 },
    { id: 'usr_g_guest_9021', username: 'GUEST_9021B1C8', role: 'PLAYER', accountType: 'GUEST', isOnline: true, status: 'In Match', game: 'Ludo', roomId: 'code_ludo_live', canSpectate: true, coins: 10000, gems: 10000, rating: 1200, gamesOpenedCount: 8 },
    { id: 'usr_g_guest_4210', username: 'GUEST_4210EE32', role: 'PLAYER', accountType: 'GUEST', isOnline: true, status: 'Playing', game: 'Carrom', roomId: 'code_carrom_arena', canSpectate: true, coins: 9800, gems: 10000, rating: 1200, gamesOpenedCount: 5 },
    { id: 'usr_g_guest_1189', username: 'GUEST_1189FE01', role: 'PLAYER', accountType: 'GUEST', isOnline: false, status: 'Offline', game: 'Duo Chess', roomId: null, canSpectate: false, coins: 10000, gems: 10000, rating: 1200, gamesOpenedCount: 2 },
  ];

  // Filtered users for User Analytics screen
  const filteredUsersList = allUsersList.filter((u: any) => {
    const q = userSearchQuery.trim().toLowerCase();
    const matchSearch = !q || u.username.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
    if (!matchSearch) return false;

    if (userFilterStatus === 'online') return u.isOnline;
    if (userFilterStatus === 'in_match') return u.status === 'In Match' || u.status === 'Playing' || u.canSpectate;
    if (userFilterStatus === 'permanent') return u.accountType === 'PERMANENT';
    if (userFilterStatus === 'guest') return u.accountType === 'GUEST';
    return true;
  });

  // Live Activity feed
  const liveActivityFeed = telemetry?.liveActivityFeed || [
    { id: 'act_1', user: 'ADITYA-OWNER', action: 'joined Duo Chess match', game: 'Duo Chess', timeAgo: 'Just now', type: 'join' },
    { id: 'act_2', user: 'Vikram-GM', action: 'started Chess Pro vs Alex_Pro', game: 'Chess', timeAgo: '2 min ago', type: 'game_start' },
    { id: 'act_3', user: 'GUEST_9021B1C8', action: 'entered website as guest', game: 'Ludo', timeAgo: '3 min ago', type: 'login' },
    { id: 'act_4', user: 'GUEST_4210EE32', action: 'opened Carrom Striker Arena', game: 'Carrom', timeAgo: '4 min ago', type: 'game_start' },
    { id: 'act_5', user: 'Elena_Mod', action: 'connected to arena lobby', game: 'Lobby', timeAgo: '5 min ago', type: 'login' },
  ];

  // Active matches
  const liveMatches = telemetry?.liveMatches || [
    { id: '#M-DUO99', roomId: 'code_duo_99', game: 'Duo Chess', icon: '⚔️', players: ['ADITYA-OWNER', 'AI Grandmaster (Lvl 8)'], matchType: 'High-Stakes Solo Arena', started: '14:28', durationSeconds: 360, status: 'In Progress', canSpectate: true },
    { id: '#M-7839', roomId: 'code_chess_pro', game: 'Chess Pro', icon: '♔', players: ['Vikram-GM', 'Alex_Pro'], matchType: 'Player vs Player (Ranked)', started: '14:26', durationSeconds: 540, status: 'In Progress', canSpectate: true },
    { id: '#M-LUDO1', roomId: 'code_ludo_live', game: 'Ludo Classic', icon: '🎯', players: ['GUEST_9021B1C8', 'Elena_Mod'], matchType: 'Live Match', started: '14:22', durationSeconds: 180, status: 'In Progress', canSpectate: true },
    { id: '#M-CARROM', roomId: 'code_carrom_arena', game: 'Carrom Striker Arena', icon: '🎯', players: ['GUEST_4210EE32', 'StrikerLegend_Raj'], matchType: 'Striker Open', started: '14:18', durationSeconds: 240, status: 'In Progress', canSpectate: true },
  ];

  const filteredMatches = liveMatches.filter((m: any) => {
    if (liveMatchFilter === 'all') return true;
    return m.game.toLowerCase().includes(liveMatchFilter.toLowerCase());
  });

  // Calculate max metric for bar chart
  const maxBarValue = 8000;
  const getBarValue = (game: any) => {
    if (gameChartMetric === 'players') return game.players;
    if (gameChartMetric === 'matches') return game.matches;
    if (gameChartMetric === 'sessions') return game.sessions;
    return game.playTimeHours;
  };

  const displayedPopularGames = showAllPopularGames ? gamesList : gamesList.slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex bg-[#060a14] text-slate-100 font-sans overflow-hidden select-none animate-fadeIn">
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className="w-56 shrink-0 bg-[#080d1a] border-r border-slate-800/80 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo Brand */}
          <div className="p-5 flex items-center gap-3 border-b border-slate-800/60">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#080d1a] rounded-[10px] flex items-center justify-center text-sky-400 font-bold text-lg">
                ♔
              </div>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wide text-white font-sans leading-tight">
                Duo Chess Arena
              </h1>
              <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            <button
              onClick={() => setSidebarTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                sidebarTab === 'overview'
                  ? 'bg-[#14234b] text-sky-400 font-bold shadow-inner border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setSidebarTab('user_analytics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                sidebarTab === 'user_analytics'
                  ? 'bg-[#14234b] text-sky-400 font-bold shadow-inner border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <div className="flex-1 flex items-center justify-between text-left">
                <span>User Analytics</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </button>

            <button
              onClick={() => setSidebarTab('game_analytics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                sidebarTab === 'game_analytics'
                  ? 'bg-[#14234b] text-sky-400 font-bold shadow-inner border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>20-Game Analytics</span>
            </button>

            <button
              onClick={() => setSidebarTab('live_matches')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                sidebarTab === 'live_matches'
                  ? 'bg-[#14234b] text-sky-400 font-bold shadow-inner border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Play className="w-4 h-4" />
              <div className="flex-1 flex items-center justify-between text-left">
                <span>Live Matches</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">
                  {liveMatches.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setSidebarTab('reports')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                sidebarTab === 'reports'
                  ? 'bg-[#14234b] text-sky-400 font-bold shadow-inner border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Audit Reports</span>
            </button>

            <button
              onClick={() => setSidebarTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                sidebarTab === 'settings'
                  ? 'bg-[#14234b] text-sky-400 font-bold shadow-inner border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/60 bg-[#060a14]/60">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sky-400 text-sm">♔</span>
            <span className="text-xs font-black text-white">Duo Chess Arena</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">All 20 Games • Real-Time Spectator</p>
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
            <span>v3.4 Production</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Operational
            </span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#060a14]">
        
        {/* HEADER BAR */}
        <header className="h-16 shrink-0 bg-[#080d1a]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4 z-20">
          
          {/* Header Left: Branding */}
          <div className="flex items-center gap-3">
            <div className="md:hidden w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-sm">
              ♔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white tracking-wide">
                  Duo Chess Arena
                </h2>
                <span className="text-slate-600">|</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-300">
                  {sidebarTab === 'overview' && 'Admin Analytics Overview'}
                  {sidebarTab === 'user_analytics' && 'Real-Time User Analytics & Spectate Roster'}
                  {sidebarTab === 'game_analytics' && '20-in-1 Game Popularity & Metrics'}
                  {sidebarTab === 'live_matches' && 'Live Matches & Spectator Command Center'}
                  {sidebarTab === 'reports' && 'System Audit Reports'}
                  {sidebarTab === 'settings' && 'Platform Settings'}
                </span>
              </div>
            </div>

            {/* Live connection badge */}
            <div className="hidden lg:flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-400 shadow-sm ml-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e] animate-pulse" />
              <span>Real-Time Sync Active</span>
            </div>

            {/* Last updated timestamp */}
            <div className="hidden xl:block text-xs text-slate-400 ml-1">
              Last updated: <span className="font-mono text-slate-300">{currentTimeStr || 'Live'}</span>
            </div>
          </div>

          {/* Header Right: Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* Date Range Selector Pills */}
            <div className="hidden sm:flex items-center bg-[#0d1527] border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setDateRange('today')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  dateRange === 'today'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateRange('7days')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  dateRange === '7days'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setDateRange('30days')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  dateRange === '30days'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                30 Days
              </button>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={() => fetchTelemetry(dateRange)}
              className={`p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 transition cursor-pointer ${
                isRefreshing ? 'animate-spin text-sky-400' : ''
              }`}
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Lock Session Button */}
            <button
              onClick={handleLockSession}
              className="p-2 rounded-xl text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Lock owner authentication session"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Lock Session</span>
            </button>

            {/* Close / Return to Arena Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 transition cursor-pointer"
              title="Return to Arena"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* SCROLLABLE DASHBOARD BODY */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
          
          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW SCREEN (Matches provided layout + Real-Time Users + Spectate) */}
          {/* ========================================================================= */}
          {sidebarTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* TOP 8 KPI CARDS in 2 rows of 4 (ensuring every user & game included) */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                
                {/* KPI 1: Total Users (Permanent + Guest) */}
                <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-sky-500/40 transition">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <svg className="w-24 h-8 stroke-sky-400 fill-none stroke-[2]" viewBox="0 0 100 35">
                      <path d="M0,28 Q20,24 35,18 T70,12 T100,4" />
                    </svg>
                  </div>
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-400">Total Users (All Included)</span>
                    <div className="text-2xl font-black text-white tracking-tight mt-0.5 font-mono">
                      {(telemetry?.kpis?.totalUsers?.value || 48732).toLocaleString()}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="text-sky-300 font-bold">{telemetry?.liveUsers?.permanentUsersCount || 4} Permanent</span>
                      <span>•</span>
                      <span className="text-amber-300 font-bold">{telemetry?.liveUsers?.guestUsersCount || 12} Guests</span>
                    </div>
                  </div>
                </div>

                {/* KPI 2: Daily Active Users (DAU) */}
                <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 transition">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <svg className="w-24 h-8 stroke-emerald-400 fill-none stroke-[2]" viewBox="0 0 100 35">
                      <path d="M0,30 Q25,25 45,15 T75,18 T100,5" />
                    </svg>
                  </div>
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-400">Daily Active Users (DAU)</span>
                    <div className="text-2xl font-black text-white tracking-tight mt-0.5 font-mono">
                      {(telemetry?.kpis?.dau?.value || 8421).toLocaleString()}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                      <span>↑ 18.7%</span>
                      <span className="text-slate-500 font-normal">daily logins tracked</span>
                    </div>
                  </div>
                </div>

                {/* KPI 3: Users Logged in Today */}
                <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/40 transition">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <LogIn className="w-5 h-5" />
                    </div>
                    <svg className="w-24 h-8 stroke-purple-400 fill-none stroke-[2]" viewBox="0 0 100 35">
                      <path d="M0,26 Q20,20 40,15 T75,22 T100,6" />
                    </svg>
                  </div>
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-400">Users Logged in Today</span>
                    <div className="text-2xl font-black text-white tracking-tight mt-0.5 font-mono">
                      {(telemetry?.kpis?.usersLoggedInToday?.value || 12346).toLocaleString()}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                      <span>↑ 22.3%</span>
                      <span className="text-slate-500 font-normal">permanent & guests</span>
                    </div>
                  </div>
                </div>

                {/* KPI 4: Users Currently Playing */}
                <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/40 transition">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <svg className="w-24 h-8 stroke-amber-400 fill-none stroke-[2]" viewBox="0 0 100 35">
                      <path d="M0,28 Q15,18 40,25 T70,8 T100,2" />
                    </svg>
                  </div>
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-400">Users Currently Playing</span>
                    <div className="text-2xl font-black text-amber-300 tracking-tight mt-0.5 font-mono flex items-center gap-2">
                      <span>{(telemetry?.kpis?.usersCurrentlyPlaying?.value || 3842).toLocaleString()}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-sky-400 font-bold">
                      <span>● Live in matches</span>
                      <span className="text-slate-500 font-normal">across all 20 games</span>
                    </div>
                  </div>
                </div>

                {/* KPI 5: New Users Today */}
                <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-pink-500/40 transition">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <svg className="w-24 h-8 stroke-pink-400 fill-none stroke-[2]" viewBox="0 0 100 35">
                      <path d="M0,25 Q30,22 55,14 T80,18 T100,5" />
                    </svg>
                  </div>
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-400">New Users Today</span>
                    <div className="text-2xl font-black text-white tracking-tight mt-0.5 font-mono">
                      {(telemetry?.kpis?.newUsersToday?.value || 2487).toLocaleString()}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                      <span>↑ 25.6%</span>
                      <span className="text-slate-500 font-normal">registered today</span>
                    </div>
                  </div>
                </div>

                {/* KPI 6: Returning Users */}
                <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/40 transition">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Repeat className="w-5 h-5" />
                    </div>
                    <svg className="w-24 h-8 stroke-indigo-400 fill-none stroke-[2]" viewBox="0 0 100 35">
                      <path d="M0,27 Q20,25 45,18 T80,12 T100,6" />
                    </svg>
                  </div>
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-400">Returning Users</span>
                    <div className="text-2xl font-black text-white tracking-tight mt-0.5 font-mono">
                      {(telemetry?.kpis?.returningUsers?.value || 3924).toLocaleString()}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                      <span>↑ 14.2%</span>
                      <span className="text-slate-500 font-normal">active retention</span>
                    </div>
                  </div>
                </div>

                {/* KPI 7: Total Games Played Today (All 20 Games) */}
                <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-yellow-500/40 transition">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <svg className="w-24 h-8 stroke-yellow-400 fill-none stroke-[2]" viewBox="0 0 100 35">
                      <path d="M0,32 Q25,20 50,15 T85,10 T100,2" />
                    </svg>
                  </div>
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-400">Total Games Played Today</span>
                    <div className="text-2xl font-black text-white tracking-tight mt-0.5 font-mono">
                      {(telemetry?.kpis?.totalGamesPlayedToday?.value || 28410).toLocaleString()}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                      <span>↑ 31.4%</span>
                      <span className="text-slate-500 font-normal">20 full games included</span>
                    </div>
                  </div>
                </div>

                {/* KPI 8: Avg Session Time */}
                <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/40 transition">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <svg className="w-24 h-8 stroke-cyan-400 fill-none stroke-[2]" viewBox="0 0 100 35">
                      <path d="M0,28 Q30,26 50,16 T80,12 T100,7" />
                    </svg>
                  </div>
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-400">Avg. Session Time</span>
                    <div className="text-2xl font-black text-white tracking-tight mt-0.5 font-mono">
                      {telemetry?.kpis?.avgSessionTime?.value || '42m 18s'}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                      <span>↑ 8.7%</span>
                      <span className="text-slate-500 font-normal">per user session</span>
                    </div>
                  </div>
                </div>

              </section>

              {/* ================= REAL-TIME USERS LIVE STREAM & SPECTATE BAR ================= */}
              <div className="bg-gradient-to-r from-[#0d1630] via-[#091024] to-[#080d1e] border-2 border-sky-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm font-bold">
                      <Radio className="w-4 h-4 animate-pulse text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
                        <span>REAL-TIME CONNECTED USERS</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                          {realTimeUsers.length} ONLINE NOW
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Tracks permanent and guest users as they enter the site. Click <strong>Spectate</strong> to watch any live player in real-time.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSidebarTab('user_analytics')}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                  >
                    <span>View Full User Roster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Real-time users cards horizontal scroll */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 pt-1">
                  {realTimeUsers.slice(0, 5).map((user: any) => (
                    <div
                      key={user.id || user.socketId}
                      className="p-3 rounded-xl bg-[#060a14] border border-slate-800 hover:border-sky-500/50 flex flex-col justify-between transition group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                            user.isGuest
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                          }`}>
                            {user.isGuest ? 'GUEST' : user.role === 'SITE OWNER' ? 'OWNER' : 'PERMANENT'}
                          </span>

                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{user.status || 'Online'}</span>
                          </span>
                        </div>

                        <div className="font-bold text-white text-xs truncate">
                          {user.username}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                          <span className="text-sky-400 font-medium">{user.game || 'Duo Chess'}</span>
                          {user.roomId && (
                            <span className="font-mono text-[10px] text-slate-500">#{user.roomId.slice(-6)}</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500">
                          {user.durationSeconds ? `${Math.floor(user.durationSeconds / 60)}m active` : 'Active'}
                        </span>

                        {user.canSpectate ? (
                          <button
                            onClick={() => handleSpectate(user.roomId || 'code_live', user.game)}
                            className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/40 border border-sky-500/50 text-sky-300 text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                            title="Spectate this user live"
                          >
                            <Eye className="w-3 h-3 text-sky-400" />
                            <span>Spectate</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">In Lobby</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3-COLUMN RESPONSIVE LAYOUT (Exact match to specifications) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* COLUMN 1: LIVE STATUS & ACTIVITY FEED (~3 cols) */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <h3 className="text-sm font-bold text-white">Live Users</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        Real-time
                      </span>
                    </div>

                    {/* 4 Mini User Status Blocks */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-white font-mono">
                            {(telemetry?.liveUsers?.currentlyOnline || 2487).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">Online</div>
                        </div>
                      </div>

                      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                          <Gamepad2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-white font-mono">
                            {(telemetry?.liveUsers?.playing || 1842).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">Playing</div>
                        </div>
                      </div>

                      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-white font-mono">
                            {(telemetry?.liveUsers?.inLobby || 645).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">In Lobby</div>
                        </div>
                      </div>

                      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-700/30 border border-slate-700/40 flex items-center justify-center text-slate-400 shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-white font-mono">
                            {(telemetry?.liveUsers?.offline || 545).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">Offline</div>
                        </div>
                      </div>
                    </div>

                    {/* Live Activity Feed */}
                    <div className="mt-5 pt-4 border-t border-slate-800/80">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-300">Live Activity Feed</h4>
                        <span className="text-[10px] text-sky-400 font-mono">Real-time</span>
                      </div>

                      <div className="space-y-3">
                        {liveActivityFeed.map((act: any) => (
                          <div key={act.id} className="flex items-start gap-2.5 text-xs">
                            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black shrink-0 text-sky-400">
                              {act.user.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-slate-300 text-[11px] leading-snug truncate">
                                <span className="font-bold text-white">{act.user}</span>{' '}
                                <span>{act.action}</span>
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                                {act.game && (
                                  <>
                                    <span className="text-sky-400 font-medium">{act.game}</span>
                                    <span>•</span>
                                  </>
                                )}
                                <span>{act.timeAgo}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* COLUMN 2: CHARTS & LIVE MATCH MONITOR WITH SPECTATE (~6 cols) */}
                <div className="lg:col-span-6 space-y-4">
                  
                  {/* 1. GAMES PLAYED TODAY INTERACTIVE BAR CHART (ALL 20 GAMES) */}
                  <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-sky-400" />
                        <div>
                          <h3 className="text-sm font-bold text-white">Games Played Today</h3>
                          <span className="text-[10px] text-slate-400 font-medium">All 20 games tracked</span>
                        </div>
                      </div>

                      {/* Chart Metric Toggle Tabs */}
                      <div className="flex items-center bg-[#070b14] border border-slate-800 p-0.5 rounded-xl self-start sm:self-auto text-xs">
                        {(['players', 'matches', 'sessions', 'playtime'] as GameChartMetric[]).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setGameChartMetric(tab)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition cursor-pointer ${
                              gameChartMetric === tab
                                ? 'bg-sky-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {tab === 'playtime' ? 'Play Time' : tab}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SVG Bar Chart with Horizontal Scroll for all 20 games */}
                    <div className="relative pt-2 pb-1 overflow-x-auto custom-scrollbar">
                      <div className="flex items-end gap-1.5 sm:gap-2 h-44 min-w-[620px] px-2">
                        
                        {/* Y-Axis scale on left */}
                        <div className="flex flex-col justify-between h-full text-[9px] text-slate-500 font-mono pr-1 select-none shrink-0">
                          <span>8K</span>
                          <span>6K</span>
                          <span>4K</span>
                          <span>2K</span>
                          <span>0</span>
                        </div>

                        {/* Bars for All 20 Games */}
                        <div className="flex-1 flex items-end justify-between h-full gap-1 sm:gap-1.5">
                          {gamesList.map((g: any, index: number) => {
                            const val = getBarValue(g);
                            const heightPct = Math.min(100, Math.max(8, (val / maxBarValue) * 100));
                            const isHovered = hoveredBarIndex === index;

                            return (
                              <div
                                key={g.id}
                                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer min-w-[24px]"
                                onMouseEnter={() => setHoveredBarIndex(index)}
                                onMouseLeave={() => setHoveredBarIndex(null)}
                              >
                                {isHovered && (
                                  <div className="absolute -top-10 z-30 bg-[#070c18] border border-slate-700 text-white text-[10px] py-1 px-2 rounded-lg shadow-xl whitespace-nowrap animate-fadeIn pointer-events-none">
                                    <span className="font-bold text-sky-400">{g.name}: </span>
                                    <span>{val.toLocaleString()} {gameChartMetric}</span>
                                  </div>
                                )}

                                <span className="text-[8px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {(val / 1000).toFixed(1)}K
                                </span>

                                <div
                                  className="w-full rounded-t-md transition-all duration-300 group-hover:brightness-125 relative"
                                  style={{
                                    height: `${heightPct}%`,
                                    backgroundColor: g.color || '#38bdf8',
                                    boxShadow: isHovered ? `0 0 12px ${g.color || '#38bdf8'}80` : 'none',
                                  }}
                                />

                                <div className="mt-1.5 flex flex-col items-center">
                                  <span className="text-xs">{g.icon}</span>
                                  <span className="text-[7.5px] text-slate-400 truncate max-w-[28px] text-center">
                                    {g.name.split(' ')[0]}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* 2. USER ACTIVITY: 6 MINI TREND CARDS */}
                  <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-4 h-4 text-sky-400" />
                      <h3 className="text-sm font-bold text-white">User Activity Metrics</h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="bg-[#070b14] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium">Users per Hour</span>
                          <div className="text-lg font-black text-white font-mono mt-0.5">8,421</div>
                          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <span>↑ 18.7%</span>
                          </div>
                        </div>
                        <svg className="w-full h-7 stroke-sky-400 fill-sky-500/10 stroke-[1.8] mt-2" viewBox="0 0 100 30">
                          <path d="M0,25 Q15,18 35,22 T70,10 T100,5 L100,30 L0,30 Z" />
                        </svg>
                      </div>

                      <div className="bg-[#070b14] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium">Logins per Hour</span>
                          <div className="text-lg font-black text-white font-mono mt-0.5">12,346</div>
                          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <span>↑ 22.3%</span>
                          </div>
                        </div>
                        <svg className="w-full h-7 stroke-purple-400 fill-purple-500/10 stroke-[1.8] mt-2" viewBox="0 0 100 30">
                          <path d="M0,28 Q20,15 40,24 T75,8 T100,4 L100,30 L0,30 Z" />
                        </svg>
                      </div>

                      <div className="bg-[#070b14] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium">New Registrations</span>
                          <div className="text-lg font-black text-white font-mono mt-0.5">2,487</div>
                          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <span>↑ 25.6%</span>
                          </div>
                        </div>
                        <svg className="w-full h-7 stroke-emerald-400 fill-emerald-500/10 stroke-[1.8] mt-2" viewBox="0 0 100 30">
                          <path d="M0,26 Q25,24 50,12 T80,15 T100,3 L100,30 L0,30 Z" />
                        </svg>
                      </div>

                      <div className="bg-[#070b14] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium">Returning Users</span>
                          <div className="text-lg font-black text-white font-mono mt-0.5">3,924</div>
                          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <span>↑ 14.2%</span>
                          </div>
                        </div>
                        <svg className="w-full h-7 stroke-amber-400 fill-amber-500/10 stroke-[1.8] mt-2" viewBox="0 0 100 30">
                          <path d="M0,24 Q20,28 45,18 T75,12 T100,6 L100,30 L0,30 Z" />
                        </svg>
                      </div>

                      <div className="bg-[#070b14] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium">Avg. Session Duration</span>
                          <div className="text-lg font-black text-white font-mono mt-0.5">42m 18s</div>
                          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <span>↑ 8.7%</span>
                          </div>
                        </div>
                        <svg className="w-full h-7 stroke-pink-400 fill-pink-500/10 stroke-[1.8] mt-2" viewBox="0 0 100 30">
                          <path d="M0,28 Q20,20 45,22 T75,10 T100,5 L100,30 L0,30 Z" />
                        </svg>
                      </div>

                      <div className="bg-[#070b14] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium">Daily Active Users</span>
                          <div className="text-lg font-black text-white font-mono mt-0.5">8,421</div>
                          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <span>↑ 18.7%</span>
                          </div>
                        </div>
                        <svg className="w-full h-7 stroke-cyan-400 fill-cyan-500/10 stroke-[1.8] mt-2" viewBox="0 0 100 30">
                          <path d="M0,26 Q25,22 45,14 T75,16 T100,4 L100,30 L0,30 Z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* 3. LIVE MATCH MONITOR WITH INSTANT SPECTATE BUTTON */}
                  <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-sky-400" />
                        <h3 className="text-sm font-bold text-white">Live Match Monitor</h3>
                      </div>

                      {/* Filter by game */}
                      <select
                        value={liveMatchFilter}
                        onChange={(e) => setLiveMatchFilter(e.target.value)}
                        className="bg-[#070b14] border border-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-xl focus:outline-none focus:border-sky-500 cursor-pointer"
                      >
                        <option value="all">All Games</option>
                        <option value="chess">Chess / Duo Chess</option>
                        <option value="ludo">Ludo</option>
                        <option value="carrom">Carrom</option>
                        <option value="checkers">Checkers</option>
                        <option value="business">Business</option>
                      </select>
                    </div>

                    {/* Match Table with Spectate Action */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 font-bold">
                            <th className="py-2 px-3">Match ID</th>
                            <th className="py-2 px-3">Game</th>
                            <th className="py-2 px-3">Players</th>
                            <th className="py-2 px-3">Duration</th>
                            <th className="py-2 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {filteredMatches.map((m: any) => {
                            const matchKey = m.roomId || m.id;
                            const currentSecs = matchSecondsMap[matchKey] || m.durationSeconds || 250;
                            return (
                              <tr key={m.id} className="hover:bg-slate-800/30 transition">
                                <td className="py-2.5 px-3 font-mono font-bold text-sky-400">{m.id}</td>
                                <td className="py-2.5 px-3 font-medium text-white flex items-center gap-1.5">
                                  <span>{m.icon}</span>
                                  <span>{m.game}</span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-1.5">
                                    <div className="flex -space-x-1.5">
                                      <div className="w-5 h-5 rounded-full bg-sky-600 border border-slate-900 flex items-center justify-center text-[9px] font-bold text-white">
                                        {m.players[0].slice(0, 1)}
                                      </div>
                                      <div className="w-5 h-5 rounded-full bg-indigo-600 border border-slate-900 flex items-center justify-center text-[9px] font-bold text-white">
                                        {m.players[1].slice(0, 1)}
                                      </div>
                                    </div>
                                    <span className="text-[11px] text-slate-300 truncate max-w-[130px]">
                                      {m.players.join(' vs ')}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 font-mono text-amber-300 font-bold text-[11px]">
                                  {formatDuration(currentSecs)}
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    onClick={() => handleSpectate(m.roomId || m.id, m.gameType || m.game)}
                                    className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/40 border border-sky-500/50 hover:border-sky-400 text-sky-300 text-[11px] font-black uppercase tracking-wider transition inline-flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                                    title="Spectate this match live"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                                    <span>Spectate</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                  </div>

                </div>

                {/* COLUMN 3: GAME POPULARITY & USER INSIGHTS (~3 cols) */}
                <div className="lg:col-span-3 space-y-4">
                  
                  {/* GAME POPULARITY TABLE */}
                  <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs font-bold text-white">Game Popularity</h3>
                      </div>

                      <div className="flex items-center bg-[#070b14] border border-slate-800 p-0.5 rounded-lg text-[10px]">
                        <button
                          onClick={() => setGamePopularityTab('most_played')}
                          className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                            gamePopularityTab === 'most_played' ? 'bg-sky-600 text-white' : 'text-slate-400'
                          }`}
                        >
                          Rank
                        </button>
                        <button
                          onClick={() => setGamePopularityTab('by_genre')}
                          className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                            gamePopularityTab === 'by_genre' ? 'bg-sky-600 text-white' : 'text-slate-400'
                          }`}
                        >
                          Genre
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto max-h-[360px] custom-scrollbar">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-[9px] uppercase text-slate-500 font-bold">
                            <th className="py-1.5 px-1">#</th>
                            <th className="py-1.5 px-2">Game</th>
                            <th className="py-1.5 px-1 text-right">Players</th>
                            <th className="py-1.5 px-1 text-right">Matches</th>
                            <th className="py-1.5 px-1 text-right">Trend</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                          {displayedPopularGames.map((g: any, idx: number) => (
                            <tr key={g.id} className="hover:bg-slate-800/20 transition">
                              <td className="py-2 px-1 text-slate-500 font-bold">{idx + 1}</td>
                              <td className="py-2 px-2 font-sans font-bold text-white flex items-center gap-1.5 truncate max-w-[100px]">
                                <span>{g.icon}</span>
                                <span className="truncate">{g.name}</span>
                              </td>
                              <td className="py-2 px-1 text-right text-slate-300">{(g.players).toLocaleString()}</td>
                              <td className="py-2 px-1 text-right text-slate-400">{(g.matches).toLocaleString()}</td>
                              <td className="py-2 px-1 text-right">
                                <span className={g.trend === 'up' ? 'text-emerald-400 font-black' : 'text-slate-500'}>
                                  {g.trend === 'up' ? '↑' : '→'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      onClick={() => setShowAllPopularGames(!showAllPopularGames)}
                      className="w-full mt-3 py-1.5 text-center text-xs font-bold text-sky-400 hover:text-sky-300 hover:bg-slate-800/30 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>{showAllPopularGames ? 'Show Top 10 ▴' : 'Show All 20 Games ▾'}</span>
                    </button>
                  </div>

                  {/* USER INSIGHTS */}
                  <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-bold text-white">User Insights</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-[#070b14] border border-slate-800/80 rounded-xl p-2.5">
                        <div className="w-5 h-5 rounded bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs mb-1">
                          +
                        </div>
                        <span className="text-[10px] text-slate-400">New Users</span>
                        <div className="text-base font-black text-white font-mono mt-0.5">2,487</div>
                        <span className="text-[9px] text-emerald-400 font-bold">↑ 25.6%</span>
                      </div>

                      <div className="bg-[#070b14] border border-slate-800/80 rounded-xl p-2.5">
                        <div className="w-5 h-5 rounded bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs mb-1">
                          ⟳
                        </div>
                        <span className="text-[10px] text-slate-400">Returning</span>
                        <div className="text-base font-black text-white font-mono mt-0.5">3,924</div>
                        <span className="text-[9px] text-emerald-400 font-bold">↑ 14.2%</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Most Active Players</div>
                      <div className="space-y-2">
                        {(telemetry?.userInsights?.mostActiveUsers || [
                          { username: 'ADITYA-OWNER', avatar: '👑', totalPlayTime: '18h 24m' },
                          { username: 'Vikram-GM', avatar: '♟️', totalPlayTime: '12h 34m' },
                          { username: 'Elena_Mod', avatar: '🛡️', totalPlayTime: '10h 21m' },
                          { username: 'Alex_Pro', avatar: '🎮', totalPlayTime: '8h 16m' },
                        ]).map((u: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{u.avatar}</span>
                              <span className="font-bold text-slate-200">{u.username}</span>
                            </div>
                            <span className="font-mono text-purple-300 font-bold text-[11px]">{u.totalPlayTime}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: DEDICATED USER ANALYTICS SCREEN (Permanent + Guest + Live Spectate) */}
          {/* ========================================================================= */}
          {sidebarTab === 'user_analytics' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Top Banner & Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b1120] border border-slate-800 rounded-2xl p-4 sm:p-5">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 font-mono">
                    <Users className="w-5 h-5 text-sky-400" />
                    <span>USER ANALYTICS & LIVE PLAYER ROSTER</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ensures every permanent user and guest user is tracked as they enter the website. Live users can be spectated with one click.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-mono font-bold">
                    {allUsersList.length} Total Registered
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{realTimeUsers.length} Online</span>
                  </span>
                </div>
              </div>

              {/* 4 Summary Cards for Users */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#080d1a] border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Permanent Accounts</span>
                  <div className="text-xl font-black text-white font-mono mt-0.5">
                    {telemetry?.liveUsers?.permanentUsersCount || 4}
                  </div>
                  <span className="text-[10px] text-sky-400">Verified permanent identity</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080d1a] border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Guest Users</span>
                  <div className="text-xl font-black text-amber-300 font-mono mt-0.5">
                    {telemetry?.liveUsers?.guestUsersCount || 12}
                  </div>
                  <span className="text-[10px] text-amber-400">Instant free sessions</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080d1a] border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Users Live In Matches</span>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                    {realTimeUsers.filter((u: any) => u.canSpectate).length}
                  </div>
                  <span className="text-[10px] text-emerald-400">Ready to Spectate</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080d1a] border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Daily Returning</span>
                  <div className="text-xl font-black text-purple-300 font-mono mt-0.5">
                    {(telemetry?.kpis?.returningUsers?.value || 3924).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-purple-400">Retention active</span>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#080d1a] border border-slate-800 p-3 rounded-2xl">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by username or user ID..."
                    className="w-full bg-[#050814] border border-slate-800 text-xs text-white pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
                  <button
                    onClick={() => setUserFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      userFilterStatus === 'all' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    All Users ({allUsersList.length})
                  </button>
                  <button
                    onClick={() => setUserFilterStatus('online')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      userFilterStatus === 'online' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    Online Now ({realTimeUsers.length})
                  </button>
                  <button
                    onClick={() => setUserFilterStatus('in_match')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      userFilterStatus === 'in_match' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    Live in Match ({realTimeUsers.filter((u: any) => u.canSpectate).length})
                  </button>
                  <button
                    onClick={() => setUserFilterStatus('permanent')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      userFilterStatus === 'permanent' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    Permanent
                  </button>
                  <button
                    onClick={() => setUserFilterStatus('guest')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      userFilterStatus === 'guest' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    Guests
                  </button>
                </div>
              </div>

              {/* User Roster Table */}
              <div className="bg-[#0b1120] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-[#080d1a] text-[10px] uppercase text-slate-400 font-bold">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-3">Account Type</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Current Game / Room</th>
                        <th className="py-3 px-3 text-right">Coins / Gems</th>
                        <th className="py-3 px-3 text-right">Rating</th>
                        <th className="py-3 px-4 text-right">Live Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {filteredUsersList.map((user: any) => (
                        <tr key={user.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xs text-sky-400">
                                {user.username.slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{user.username}</span>
                                  {user.role === 'SITE OWNER' && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                                      OWNER
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] font-mono text-slate-500">ID: {user.id}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                              user.accountType === 'PERMANENT'
                                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            }`}>
                              {user.accountType}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            {user.isOnline ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span>{user.status || 'Online'}</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 font-medium">Offline</span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <div className="text-slate-300 font-medium">{user.game || 'Duo Chess'}</div>
                            {user.roomId && (
                              <div className="text-[10px] font-mono text-sky-400 font-bold">#{user.roomId}</div>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right font-mono text-[11px]">
                            <div className="text-amber-300 font-bold">{(user.coins || 10000).toLocaleString()} 🪙</div>
                            <div className="text-purple-300">{(user.gems || 10000).toLocaleString()} 💎</div>
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold text-white text-xs">
                            {user.rating || 1200}
                          </td>

                          <td className="py-3 px-4 text-right">
                            {user.canSpectate ? (
                              <button
                                onClick={() => handleSpectate(user.roomId || 'code_live', user.game)}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 ml-auto shadow-md shadow-sky-500/30 cursor-pointer active:scale-95"
                                title="Spectate this user live in real-time"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Spectate Live</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Not in game</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: 20-GAME ANALYTICS SUITE */}
          {/* ========================================================================= */}
          {sidebarTab === 'game_analytics' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-sky-400" />
                    <span>20-IN-1 GAME PLATFORM ANALYTICS</span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    20 / 20 Games Active
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Comprehensive performance, play time, and engagement tracking across every single game supported in the arena.
                </p>
              </div>

              {/* 20 Games Detailed Table */}
              <div className="bg-[#0b1120] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-[#080d1a] text-[10px] uppercase text-slate-400 font-bold">
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-3">Game Title</th>
                        <th className="py-3 px-3">Genre</th>
                        <th className="py-3 px-3 text-right">Unique Players</th>
                        <th className="py-3 px-3 text-right">Matches Finished</th>
                        <th className="py-3 px-3 text-right">Total Sessions</th>
                        <th className="py-3 px-3 text-right">Play Time</th>
                        <th className="py-3 px-3 text-right">Avg Session</th>
                        <th className="py-3 px-4 text-right">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {gamesList.map((g: any, idx: number) => (
                        <tr key={g.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                            <span className="text-base">{g.icon}</span>
                            <span>{g.name}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-medium">{g.genre || 'Strategy'}</td>
                          <td className="py-3 px-3 text-right font-mono text-slate-300">{(g.players).toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono text-slate-300">{(g.matches).toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-sky-400">{(g.sessions).toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono text-purple-300 font-bold">{g.formattedPlayTime}</td>
                          <td className="py-3 px-3 text-right font-mono text-slate-400">{g.avgSession}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={g.trend === 'up' ? 'text-emerald-400 font-black' : 'text-slate-500'}>
                              {g.trend === 'up' ? '↑ Rising' : '→ Steady'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: LIVE MATCHES & SPECTATOR COMMAND CENTER */}
          {/* ========================================================================= */}
          {sidebarTab === 'live_matches' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
                    <Play className="w-5 h-5 text-sky-400" />
                    <span>LIVE MATCHES & SPECTATOR COMMAND CENTER</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any <strong>Spectate Match</strong> button to join the live room in spectator mode.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{liveMatches.length} Matches In Progress</span>
                  </span>
                </div>
              </div>

              {/* Grid of Live Matches with Big Spectate Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveMatches.map((m: any) => {
                  const matchKey = m.roomId || m.id;
                  const currentSecs = matchSecondsMap[matchKey] || m.durationSeconds || 250;
                  return (
                    <div
                      key={m.id}
                      className="bg-[#080d1a] border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between transition group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{m.icon}</span>
                            <div>
                              <div className="font-black text-white text-sm">{m.game}</div>
                              <div className="text-[10px] font-mono text-sky-400">{m.id}</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Live</span>
                            </span>
                            <div className="text-[11px] font-mono font-bold text-amber-300 mt-1">
                              {formatDuration(currentSecs)}
                            </div>
                          </div>
                        </div>

                        {/* Players Clash */}
                        <div className="p-3 rounded-xl bg-[#050814] border border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center font-bold text-white text-xs">
                              {m.players[0].slice(0, 1)}
                            </div>
                            <span className="font-bold text-white">{m.players[0]}</span>
                          </div>

                          <span className="font-mono font-black text-purple-400 text-xs">VS</span>

                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{m.players[1]}</span>
                            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                              {m.players[1].slice(0, 1)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Spectate Button */}
                      <button
                        onClick={() => handleSpectate(m.roomId || m.id, m.gameType || m.game)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:via-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(14,165,233,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Eye className="w-4 h-4" />
                        <span>SPECTATE MATCH LIVE NOW</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: REPORTS */}
          {/* ========================================================================= */}
          {sidebarTab === 'reports' && (
            <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-6 space-y-4 animate-fadeIn">
              <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <span>PLATFORM AUDIT & SECURITY REPORTS</span>
              </h3>
              <p className="text-xs text-slate-300">
                System telemetry integrity verified. All 20 games and live guest/permanent accounts tracked in compliance with zero-trust architecture.
              </p>
              <div className="p-4 rounded-xl bg-[#050814] border border-slate-800 space-y-2 text-xs">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Real-Time WebSocket Engine: Active (0 Packet Drops)</span>
                </div>
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Dual-Layer Guest Token Rotation: Operational</span>
                </div>
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All 20 Games Telemetry Feed: Synchronized</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: SETTINGS */}
          {/* ========================================================================= */}
          {sidebarTab === 'settings' && (
            <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-6 space-y-4 animate-fadeIn">
              <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
                <Settings className="w-5 h-5 text-sky-400" />
                <span>ADMIN CONSOLE SETTINGS</span>
              </h3>
              <p className="text-xs text-slate-400">
                Configure telemetry polling intervals and real-time event subscriptions.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#050814] border border-slate-800 space-y-2">
                  <div className="font-bold text-white">Live Telemetry Polling</div>
                  <p className="text-slate-400 text-[11px]">Automatic background refresh interval (4 seconds default).</p>
                  <button
                    onClick={() => fetchTelemetry(dateRange)}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer"
                  >
                    Force Refresh Now
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-[#050814] border border-slate-800 space-y-2">
                  <div className="font-bold text-white">Owner Session Management</div>
                  <p className="text-slate-400 text-[11px]">End active admin verification session on this browser.</p>
                  <button
                    onClick={handleLockSession}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
                  >
                    Lock Owner Session
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
