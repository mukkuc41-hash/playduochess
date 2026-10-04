import React, { useState } from 'react';
import { Users, UserCheck, Gamepad2, Search, Eye, Filter, Radio, Shield, Clock, Sparkles } from 'lucide-react';

export interface RealtimeUserRecord {
  userId: string;
  username: string;
  isGuest: boolean;
  userType: 'Permanent' | 'Guest';
  role: string;
  status: 'In Match' | 'In Lobby' | 'Idle';
  activeGame: string;
  gameIcon: string;
  roomName: string;
  ip?: string;
  durationSeconds: number;
  durationFormatted: string;
  isLive: boolean;
  spectateId: string;
  opponent?: string;
}

interface RealtimeUsersHubProps {
  users: RealtimeUserRecord[];
  userBreakdown?: {
    permanentUsers: number;
    guestUsers: number;
    totalUsers: number;
    livePlaying: number;
  };
  onSpectateUser: (user: RealtimeUserRecord) => void;
}

export const RealtimeUsersHub: React.FC<RealtimeUsersHubProps> = ({
  users,
  userBreakdown,
  onSpectateUser,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'permanent' | 'guest' | 'live'>('all');

  const permanentCount = userBreakdown?.permanentUsers ?? users.filter((u) => !u.isGuest).length;
  const guestCount = userBreakdown?.guestUsers ?? users.filter((u) => u.isGuest).length;
  const liveCount = userBreakdown?.livePlaying ?? users.filter((u) => u.isLive || u.status === 'In Match').length;
  const totalCount = userBreakdown?.totalUsers ?? users.length;

  const filteredUsers = users.filter((u) => {
    // Search query
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      const matchName = u.username.toLowerCase().includes(term);
      const matchGame = u.activeGame.toLowerCase().includes(term);
      const matchRoom = u.roomName?.toLowerCase().includes(term);
      const matchId = u.userId?.toLowerCase().includes(term);
      if (!matchName && !matchGame && !matchRoom && !matchId) return false;
    }

    // Filter type
    if (filterType === 'permanent') return !u.isGuest;
    if (filterType === 'guest') return u.isGuest;
    if (filterType === 'live') return u.isLive || u.status === 'In Match';
    return true;
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Connected */}
        <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Total Connected Users</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{totalCount}</div>
            <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-time Active</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Permanent Users */}
        <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Permanent Users</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{permanentCount}</div>
            <div className="text-[10px] text-sky-400 font-bold mt-1">
              Registered Accounts
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Guest Users */}
        <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Guest Users</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{guestCount}</div>
            <div className="text-[10px] text-amber-400 font-bold mt-1">
              Immediate Entry
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Live In-Match */}
        <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Live Playing (Spectatable)</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{liveCount}</div>
            <div className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              <span>In Match Now</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search real-time users, games, rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#070c18] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#070c18] border border-slate-800 p-1 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Users ({totalCount})
          </button>
          <button
            onClick={() => setFilterType('permanent')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              filterType === 'permanent'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Permanent ({permanentCount})
          </button>
          <button
            onClick={() => setFilterType('guest')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              filterType === 'guest'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Guests ({guestCount})
          </button>
          <button
            onClick={() => setFilterType('live')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'live'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span>Live In Match ({liveCount})</span>
          </button>
        </div>
      </div>

      {/* Real-time Users List / Table */}
      <div className="bg-[#0b1120] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#22c55e] animate-pulse" />
            <h3 className="text-sm font-bold text-white">
              Connected Active Users ({filteredUsers.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Auto-refreshing via WebSocket Stream
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 font-bold bg-[#080e1b]/70">
                <th className="py-2.5 px-3.5">User Handle</th>
                <th className="py-2.5 px-3.5">User Type</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5">Active Game & Arena</th>
                <th className="py-2.5 px-3.5">Duration</th>
                <th className="py-2.5 px-3.5 text-center">Spectate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs italic">
                    No active users match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAditya = u.username.toLowerCase().includes('aditya') || u.role === 'Super Administrator';
                  const isPlaying = u.isLive || u.status === 'In Match';

                  return (
                    <tr key={u.userId} className="hover:bg-slate-800/30 transition group">
                      {/* User handle & avatar */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                              isAditya
                                ? 'bg-gradient-to-tr from-amber-500 to-yellow-600 border border-amber-400/50'
                                : u.isGuest
                                ? 'bg-slate-700 border border-slate-600'
                                : 'bg-sky-600 border border-sky-400/40'
                            }`}
                          >
                            {isAditya ? '👑' : u.username.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-xs">{u.username}</span>
                              {isAditya && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/40">
                                  OWNER
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              ID: {u.userId.slice(0, 14)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* User Type */}
                      <td className="py-2.5 px-3.5">
                        {u.isGuest ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-semibold">
                            <span>Guest User</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold">
                            <UserCheck className="w-3 h-3" />
                            <span>Permanent User</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3.5">
                        {isPlaying ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>In Match</span>
                          </span>
                        ) : u.status === 'Idle' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Idle</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[10px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                            <span>In Lobby</span>
                          </span>
                        )}
                      </td>

                      {/* Active Game & Arena */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{u.gameIcon || '♟️'}</span>
                          <div>
                            <div className="font-bold text-slate-200 capitalize text-xs">
                              {u.activeGame}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                              {u.roomName || 'Lobby Room'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-2.5 px-3.5 font-mono text-amber-300 text-[11px] font-bold">
                        {u.durationFormatted || 'Just now'}
                      </td>

                      {/* Spectate Button */}
                      <td className="py-2.5 px-3.5 text-center">
                        <button
                          id={`spectate-user-${u.userId.replace(/[^a-zA-Z0-9]/g, '')}`}
                          onClick={() => onSpectateUser(u)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition shadow-sm ${
                            isPlaying
                              ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/30 hover:scale-105 active:scale-95'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 hover:text-white'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isPlaying ? 'Spectate Live' : 'Spectate'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
