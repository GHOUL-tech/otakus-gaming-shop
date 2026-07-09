import React, { useState } from 'react';
import { Booking, Game, GamePackage, ActiveSession } from '../types';
import { ACCOUNTS } from '../data/defaultData';
import { checkBookingConflict } from '../utils/bookingUtils';
import { Lock, LogOut, Check, X, PlusCircle, Trash2, CreditCard, DollarSign, Image, Edit3, Settings, Users, Gamepad2, AlertCircle, Bell, BellOff } from 'lucide-react';

interface AdminPanelProps {
  bookings: Booking[];
  games: Game[];
  packages: GamePackage[];
  activeSessions: ActiveSession[];
  onAddBooking: (booking: Booking) => void;
  onCancelBooking: (id: string) => void;
  onDeleteBooking: (id: string) => void;
  onAddGame: (game: Game) => void;
  onAddPackage: (pkg: GamePackage) => void;
  onDeletePackage: (id: string) => void;
  onClearEndedNotifications: () => void;
  onLoginAdmin: () => void;
  onLogoutAdmin: () => void;
  isLoggedInAdmin: boolean;
}

export default function AdminPanel({
  bookings,
  games,
  packages,
  activeSessions,
  onAddBooking,
  onCancelBooking,
  onDeleteBooking,
  onAddGame,
  onAddPackage,
  onDeletePackage,
  onClearEndedNotifications,
  onLoginAdmin,
  onLogoutAdmin,
  isLoggedInAdmin
}: AdminPanelProps) {
  // Credentials Form States
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab State inside Admin
  const [adminTab, setAdminTab] = useState<'requests' | 'billing' | 'games' | 'packages'>('requests');

  // --- Walk-in Billing Form States ---
  const [billName, setBillName] = useState('');
  const [billPhone, setBillPhone] = useState('');
  const [billSystem, setBillSystem] = useState<'PC' | 'PSP'>('PC');
  const [selectedPkgId, setSelectedPkgId] = useState('');
  const [billingSuccess, setBillingSuccess] = useState<Booking | null>(null);

  // --- Add Game Form States ---
  const [newGameName, setNewGameName] = useState('');
  const [newGameImage, setNewGameImage] = useState('');
  const [newGameType, setNewGameType] = useState<'PC' | 'PSP'>('PC');
  const [gameSuccessMsg, setGameSuccessMsg] = useState('');

  // --- Add Package Form States ---
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgSystem, setNewPkgSystem] = useState<'PC' | 'PSP'>('PC');
  const [newPkgDuration, setNewPkgDuration] = useState<number>(60);
  const [newPkgPrice, setNewPkgPrice] = useState<number>(100);
  const [pkgSuccessMsg, setPkgSuccessMsg] = useState('');

  // Filter packages for selected billing system
  const billingPackages = packages.filter(p => p.system === billSystem);

  // Auto calculate bill amount
  const selectedPkg = packages.find(p => p.id === selectedPkgId);
  const calculatedBillAmount = selectedPkg ? selectedPkg.price : 0;

  // Handle Admin Login submission
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const matchedAdmin = ACCOUNTS.admins.find(
      a => a.username.toLowerCase() === adminUsername.trim().toLowerCase() && a.password === adminPassword
    );

    if (matchedAdmin) {
      onLoginAdmin();
      setAdminUsername('');
      setAdminPassword('');
    } else {
      setLoginError('Invalid Administrator User ID or Password.');
    }
  };

  // Handle walked-in direct billing form submit
  const handleBillingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!billName.trim() || !billPhone.trim() || !selectedPkgId) return;

    const pkg = packages.find(p => p.id === selectedPkgId);
    if (!pkg) return;

    // Generate unique code starting with #
    // e.g., #PC-BILL-1234 or #PSP-BILL-5678
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `#${billSystem}-BILL-${randomNum}`;

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

    const directBooking: Booking = {
      id: `bill-${Date.now()}`,
      name: billName.trim(),
      phone: billPhone.trim(),
      system: billSystem,
      date: today,
      time: nowTime,
      duration: pkg.durationMinutes / 60,
      amount: pkg.price,
      status: 'approved',
      code,
      isWalkIn: true
    };

    onAddBooking(directBooking);
    setBillingSuccess(directBooking);

    // Reset Form
    setBillName('');
    setBillPhone('');
    setSelectedPkgId('');
  };

  // Handle adding new game
  const handleGameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameName.trim()) return;

    // Provide default placeholder images if input is empty
    const defaultImg = newGameType === 'PC'
      ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=600&auto=format&fit=crop';

    const game: Game = {
      id: `game-${Date.now()}`,
      name: newGameName.trim(),
      image: newGameImage.trim() ? newGameImage.trim() : defaultImg,
      type: newGameType,
      isCustom: true
    };

    onAddGame(game);
    setGameSuccessMsg(`Successfully added "${game.name}" to the ${game.type} catalog!`);
    setNewGameName('');
    setNewGameImage('');
    
    setTimeout(() => setGameSuccessMsg(''), 4000);
  };

  // Handle adding new package
  const handlePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgName.trim() || newPkgDuration <= 0 || newPkgPrice < 0) return;

    const pkg: GamePackage = {
      id: `pkg-${Date.now()}`,
      system: newPkgSystem,
      name: newPkgName.trim(),
      durationMinutes: newPkgDuration,
      price: newPkgPrice
    };

    onAddPackage(pkg);
    setPkgSuccessMsg(`Package "${pkg.name}" added successfully.`);
    setNewPkgName('');
    setNewPkgDuration(60);
    setNewPkgPrice(100);

    setTimeout(() => setPkgSuccessMsg(''), 4000);
  };

  // Find ended sessions to display the terminal alert
  const endedSessions = activeSessions.filter(s => s.isEnded);

  return (
    <div className="space-y-8">
      {/* Login Gate */}
      {!isLoggedInAdmin ? (
        <div className="max-w-md mx-auto bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6 shadow-[0_0_15px_rgba(0,255,0,0.05)]">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#00FF00]/10 text-[#00FF00] rounded-xl flex items-center justify-center mx-auto border border-[#00FF00]/20">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-display font-black text-white uppercase italic tracking-tight">ADMINISTRATOR CONTROL</h2>
            <p className="text-xs text-gray-400">
              Authorized personnel only. Please verify your admin credentials to enter.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 font-sans">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">ADMIN USERNAME</label>
              <input
                id="admin-username"
                type="text"
                required
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="e.g. Rahin"
                className="w-full bg-black text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40 font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">ADMIN PASSWORD</label>
              <input
                id="admin-password"
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex gap-2 font-mono">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              id="admin-login-submit"
              type="submit"
              className="w-full py-3 bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
            >
              Verify Credentials
            </button>
          </form>
        </div>
      ) : (
        // Authorized Admin Area
        <div className="space-y-8 font-sans">
          
          {/* Real-time Session Finished Alarm Alert Banner */}
          {endedSessions.length > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[0_0_15px_rgba(255,0,0,0.05)]">
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-red-500/15 text-red-400 rounded-lg animate-pulse shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">⚠️ TERMINAL TIME EXPIRED NOTICE!</h4>
                  <p className="text-xs text-red-400 font-sans mt-0.5 font-bold">
                    {endedSessions.length} active user{endedSessions.length > 1 ? 's are' : ' is'} done playing. Please clear their terminal or renew:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {endedSessions.map((session, sidx) => (
                      <span key={sidx} className="inline-block px-2.5 py-1 bg-red-950/40 text-[10px] font-mono text-red-200 rounded border border-red-500/20">
                        {session.customerName} ({session.code}) - {session.system} Station
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <button
                id="btn-clear-notifications"
                onClick={onClearEndedNotifications}
                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-white border border-red-500/30 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BellOff className="w-3.5 h-3.5" /> Dismiss All Alerts
              </button>
            </div>
          )}

          {/* Admin Header with Roles */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#00FF00] border border-[#00FF00]/30 bg-[#00FF00]/10 px-2 py-0.5 rounded tracking-widest">
                Owner Mode Active
              </span>
              <h1 className="font-display text-3xl font-black text-white tracking-tighter mt-1 uppercase italic">
                ADMIN <span className="text-glow-green text-[#00FF00]">CONTROL ROOM</span>
              </h1>
            </div>

            <button
              id="admin-logout-btn"
              onClick={onLogoutAdmin}
              className="px-4 py-2 bg-[#111] hover:bg-black text-gray-400 hover:text-white rounded-xl border border-white/10 text-xs font-mono flex items-center gap-2 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" /> End Admin Session
            </button>
          </div>

          {/* Dashboard Hub Navigation tabs */}
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-1 font-mono">
            <button
              id="admin-tab-requests"
              onClick={() => setAdminTab('requests')}
              className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider relative transition-all cursor-pointer ${
                adminTab === 'requests' ? 'text-[#00FF00]' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="flex items-center gap-2"><Users className="w-4.5 h-4.5" /> Play Bookings & Active ({bookings.length})</span>
              {adminTab === 'requests' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00FF00]" />}
            </button>

            <button
              id="admin-tab-billing"
              onClick={() => setAdminTab('billing')}
              className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider relative transition-all cursor-pointer ${
                adminTab === 'billing' ? 'text-[#00FF00]' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="flex items-center gap-2"><CreditCard className="w-4.5 h-4.5" /> Walk-in Billing</span>
              {adminTab === 'billing' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00FF00]" />}
            </button>

            <button
              id="admin-tab-games"
              onClick={() => setAdminTab('games')}
              className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider relative transition-all cursor-pointer ${
                adminTab === 'games' ? 'text-[#00FF00]' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="flex items-center gap-2"><Gamepad2 className="w-4.5 h-4.5" /> Games Management</span>
              {adminTab === 'games' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00FF00]" />}
            </button>

            <button
              id="admin-tab-packages"
              onClick={() => setAdminTab('packages')}
              className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider relative transition-all cursor-pointer ${
                adminTab === 'packages' ? 'text-[#00FF00]' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="flex items-center gap-2"><Settings className="w-4.5 h-4.5" /> System Rates & Packages</span>
              {adminTab === 'packages' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00FF00]" />}
            </button>
          </div>

          {/* TAB 1: BOOKING REQUESTS AND TERMINAL MANAGEMENT */}
          {adminTab === 'requests' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Active Play Logs
                </h2>
                <div className="text-xs font-mono text-gray-500">
                  Total Booked Amount: <strong className="text-[#00FF00] font-black">{bookings.reduce((sum, b) => b.status === 'approved' ? sum + b.amount : sum, 0)} TK</strong>
                </div>
              </div>

              {bookings.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#111]">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="bg-black text-gray-400 border-b border-white/10">
                        <th className="p-4 font-bold uppercase tracking-wider">Customer</th>
                        <th className="p-4 font-bold uppercase tracking-wider">Phone</th>
                        <th className="p-4 font-bold uppercase tracking-wider">System</th>
                        <th className="p-4 font-bold uppercase tracking-wider">Date & Time</th>
                        <th className="p-4 font-bold uppercase tracking-wider">Renting Time</th>
                        <th className="p-4 font-bold uppercase tracking-wider">Billing Code</th>
                        <th className="p-4 text-right font-bold uppercase tracking-wider">TK</th>
                        <th className="p-4 text-center font-bold uppercase tracking-wider">Timer Status</th>
                        <th className="p-4 text-center font-bold uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.map((booking) => {
                        const session = activeSessions.find(s => s.code === booking.code);
                        let timerLabel = 'Not Started';
                        let timerColor = 'text-gray-500 border-white/5 bg-black/40';

                        if (session) {
                          if (session.isEnded) {
                            timerLabel = '🔴 TIME EXPIRED';
                            timerColor = 'text-red-400 bg-red-950/20 border-red-500/20';
                          } else if (session.isActive) {
                            timerLabel = '🟢 PLAYING';
                            timerColor = 'text-[#00FF00] bg-[#00FF00]/10 border-[#00FF00]/20';
                          }
                        }

                        return (
                          <tr
                            key={booking.id}
                            className={`hover:bg-white/5 transition-colors ${
                              booking.status === 'cancelled' ? 'opacity-40 line-through' : ''
                            }`}
                          >
                            <td className="p-4">
                              <span className="font-bold text-white block">{booking.name}</span>
                              {booking.isWalkIn && <span className="text-[9px] font-bold text-[#00FF00] uppercase font-mono tracking-tight">Walk-in</span>}
                            </td>
                            <td className="p-4 text-gray-400">{booking.phone}</td>
                            <td className="p-4">
                              <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                                booking.system === 'PC'
                                  ? 'bg-[#00FF00]/10 text-[#00FF00] border-[#00FF00]/20'
                                  : 'bg-white/10 text-white border-white/20'
                              }`}>
                                {booking.system}
                              </span>
                            </td>
                            <td className="p-4 text-gray-400">{booking.date} {booking.time}</td>
                            <td className="p-4 text-gray-300">{booking.duration} Hour(s)</td>
                            <td className="p-4 text-white font-bold">{booking.code}</td>
                            <td className="p-4 text-right text-[#00FF00] font-black">{booking.amount} TK</td>
                            <td className="p-4 text-center">
                              <span className={`inline-block text-[9px] px-2 py-0.5 rounded border font-bold ${timerColor}`}>
                                {timerLabel}
                              </span>
                            </td>
                            <td className="p-4 text-center space-x-2">
                              {booking.status !== 'cancelled' ? (
                                <button
                                  id={`cancel-booking-${booking.id}`}
                                  onClick={() => onCancelBooking(booking.id)}
                                  title="Cancel Prebook"
                                  className="p-1 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-gray-600 font-bold">Cancelled</span>
                              )}
                              <button
                                id={`delete-booking-${booking.id}`}
                                onClick={() => onDeleteBooking(booking.id)}
                                title="Delete Booking Record"
                                className="p-1 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-[#111] border border-white/10 rounded-2xl">
                  <p className="text-gray-500 font-sans text-xs">No bookings recorded yet. Walk-in bill or prebook first!</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DIRECT WALK-IN BILLING */}
          {adminTab === 'billing' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fadeIn font-sans">
              {/* Billing Form */}
              <form onSubmit={handleBillingSubmit} className="md:col-span-7 bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-mono font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2 uppercase tracking-wider">
                  <DollarSign className="w-5 h-5 text-[#00FF00]" /> Walk-In Direct Invoice
                </h3>

                <div className="space-y-4">
                  {/* Walk-in Customer Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">CUSTOMER NAME</label>
                    <input
                      id="walkin-name"
                      type="text"
                      required
                      placeholder="Enter customer name"
                      value={billName}
                      onChange={(e) => setBillName(e.target.value)}
                      className="w-full bg-black text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40"
                    />
                  </div>

                  {/* Customer Phone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">CUSTOMER PHONE</label>
                    <input
                      id="walkin-phone"
                      type="text"
                      required
                      placeholder="e.g. 01872XXXXXX"
                      value={billPhone}
                      onChange={(e) => setBillPhone(e.target.value)}
                      className="w-full bg-black text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40"
                    />
                  </div>

                  {/* System selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">SELECT SYSTEM TYPE</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        id="bill-system-pc"
                        type="button"
                        onClick={() => {
                          setBillSystem('PC');
                          setSelectedPkgId('');
                        }}
                        className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                          billSystem === 'PC'
                            ? 'bg-[#00FF00]/10 border-[#00FF00] text-white shadow-[0_0_15px_rgba(0,255,0,0.1)]'
                            : 'bg-black border-white/10 text-gray-400'
                        }`}
                      >
                        <span className="font-bold text-sm tracking-wide">HIGH POWER PC</span>
                        <span className={`text-[10px] font-mono mt-1 ${billSystem === 'PC' ? 'text-[#00FF00]' : 'text-gray-500'}`}>100 TK / hr</span>
                      </button>

                      <button
                        id="bill-system-psp"
                        type="button"
                        onClick={() => {
                          setBillSystem('PSP');
                          setSelectedPkgId('');
                        }}
                        className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                          billSystem === 'PSP'
                            ? 'bg-white/10 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                            : 'bg-black border-white/10 text-gray-400'
                        }`}
                      >
                        <span className="font-bold text-sm tracking-wide">PSP TV STATION</span>
                        <span className={`text-[10px] font-mono mt-1 ${billSystem === 'PSP' ? 'text-white' : 'text-gray-500'}`}>60 TK / hr</span>
                      </button>
                    </div>
                  </div>

                  {/* Package dropdown */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">SELECT GAME PACKAGE</label>
                    <select
                      id="bill-package-select"
                      required
                      value={selectedPkgId}
                      onChange={(e) => setSelectedPkgId(e.target.value)}
                      className="w-full bg-black text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40 font-mono"
                    >
                      <option value="">-- Choose Package --</option>
                      {billingPackages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name.toUpperCase()} ({pkg.price} TK)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  id="direct-bill-submit"
                  type="submit"
                  className="w-full py-3.5 bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-black rounded-xl transition-all font-display tracking-widest uppercase cursor-pointer shadow-[0_0_15px_rgba(0,255,0,0.3)]"
                >
                  Mark Paid & Issue Ticket Code
                </button>
              </form>

              {/* Billing Success Receipt */}
              <div className="md:col-span-5 space-y-6">
                {billingSuccess ? (
                  <div className="bg-[#111] border border-[#00FF00]/30 rounded-2xl p-6 space-y-4 text-center shadow-[0_0_20px_rgba(0,255,0,0.08)]">
                    <div className="w-12 h-12 bg-[#00FF00]/10 text-[#00FF00] rounded-full flex items-center justify-center mx-auto border border-[#00FF00]/20">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="font-display font-black text-white uppercase italic tracking-tight">BILLING TICKET GENERATED!</h4>
                    
                    <div className="bg-black border border-white/10 p-4 rounded-xl font-mono text-left space-y-3 text-xs text-slate-300">
                      <div className="flex justify-between pb-2 border-b border-white/5">
                        <span className="text-gray-500 uppercase font-bold text-[10px]">BILLING ID:</span>
                        <strong className="text-[#00FF00] font-black">{billingSuccess.code}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block uppercase font-bold text-[10px]">CUSTOMER:</span>
                        <strong className="text-white">{billingSuccess.name}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block uppercase font-bold text-[10px]">SYSTEM LIMIT:</span>
                        <strong className="text-white">{billingSuccess.system === 'PC' ? 'HIGH-END PC' : 'PSP TV'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block uppercase font-bold text-[10px]">PLAY TIME:</span>
                        <strong className="text-white">{billingSuccess.duration * 60} Minutes</strong>
                      </div>
                      <div className="pt-2 border-t border-white/5 flex justify-between">
                        <span className="text-gray-500 uppercase font-bold text-[10px]">AMOUNT PAID:</span>
                        <strong className="text-[#00FF00] font-black">{billingSuccess.amount} TK</strong>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 font-sans leading-normal">
                      The customer can now type <strong>{billingSuccess.code}</strong> at the client station to launch their timer.
                    </p>

                    <button
                      id="btn-bill-new"
                      onClick={() => setBillingSuccess(null)}
                      className="w-full py-2 bg-black hover:bg-[#111] text-gray-300 rounded-xl text-xs font-mono border border-white/10 cursor-pointer"
                    >
                      Issue Next Bill
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-3 font-sans text-xs text-gray-400 leading-relaxed">
                    <h4 className="font-display font-black text-white text-sm uppercase tracking-wider italic">Walk-in instructions</h4>
                    <p>Use this module when customers walk into the shop directly without booking online.</p>
                    <p>Select their desired system type (PC or PSP), choose a standard game package, enter their details, and collect cash.</p>
                    <p>Upon clicking billing, the system instantly logs a paid invoice and outputs a unique code starting with <strong>#</strong> which activates the station timer!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GAMES MANAGEMENT */}
          {adminTab === 'games' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fadeIn font-sans">
              {/* Form to add game */}
              <form onSubmit={handleGameSubmit} className="md:col-span-5 bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-mono font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2 uppercase tracking-wider">
                  <PlusCircle className="w-5 h-5 text-[#00FF00]" /> Load New Game Title
                </h3>

                <div className="space-y-4">
                  {/* Game Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">GAME NAME</label>
                    <input
                      id="new-game-name"
                      type="text"
                      required
                      placeholder="e.g. Tekken 7"
                      value={newGameName}
                      onChange={(e) => setNewGameName(e.target.value)}
                      className="w-full bg-black text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40 font-sans"
                    />
                  </div>

                  {/* Image link */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">IMAGE URL / LINK</label>
                    <div className="relative">
                      <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        id="new-game-image"
                        type="url"
                        placeholder="Paste image link (optional)"
                        value={newGameImage}
                        onChange={(e) => setNewGameImage(e.target.value)}
                        className="w-full bg-black text-slate-100 text-sm pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40"
                      />
                    </div>
                  </div>

                  {/* Game System Type */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">SYSTEM DIRECTORY</label>
                    <select
                      id="new-game-type"
                      value={newGameType}
                      onChange={(e) => setNewGameType(e.target.value as 'PC' | 'PSP')}
                      className="w-full bg-black text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40"
                    >
                      <option value="PC">High-End PC Library</option>
                      <option value="PSP">PSP Console Directory</option>
                    </select>
                  </div>
                </div>

                {gameSuccessMsg && (
                  <div className="p-3 bg-[#00FF00]/10 border border-[#00FF00]/20 text-[#00FF00] rounded-xl text-xs font-mono">
                    {gameSuccessMsg}
                  </div>
                )}

                <button
                  id="add-game-submit"
                  type="submit"
                  className="w-full py-3 bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Add Game to Shop Catalog
                </button>
              </form>

              {/* List of current custom games to review */}
              <div className="md:col-span-7 bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Review Shop Library ({games.length} titles)
                </h3>

                <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2">
                  {games.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between p-3 bg-black border border-white/10 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={g.image}
                          alt={g.name}
                          className="w-12 h-9 object-cover rounded-md border border-white/5"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-sans font-bold text-slate-200 text-sm leading-snug">{g.name}</h4>
                          <span className={`text-[9px] font-mono font-bold uppercase ${g.type === 'PC' ? 'text-[#00FF00]' : 'text-white'}`}>
                            {g.type}
                          </span>
                        </div>
                      </div>

                      {g.isCustom && (
                        <span className="text-[9px] font-mono font-bold border border-white/10 text-gray-500 rounded px-1.5 py-0.5 uppercase">
                          Admin Added
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM RATES & PACKAGES */}
          {adminTab === 'packages' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fadeIn font-sans">
              {/* Form to add package */}
              <form onSubmit={handlePackageSubmit} className="md:col-span-5 bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6 font-sans">
                <h3 className="text-sm font-mono font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Edit3 className="w-5 h-5 text-[#00FF00]" /> Create Custom Package
                </h3>

                <div className="space-y-4">
                  {/* Package Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">PACKAGE LABEL</label>
                    <input
                      id="new-package-name"
                      type="text"
                      required
                      placeholder="e.g. VIP Gaming Session - 3 Hours"
                      value={newPkgName}
                      onChange={(e) => setNewPkgName(e.target.value)}
                      className="w-full bg-black text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40 font-sans"
                    />
                  </div>

                  {/* System */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">SYSTEM DESIGNATION</label>
                    <select
                      id="new-package-system"
                      value={newPkgSystem}
                      onChange={(e) => setNewPkgSystem(e.target.value as 'PC' | 'PSP')}
                      className="w-full bg-black text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40"
                    >
                      <option value="PC">High-End PC Packages</option>
                      <option value="PSP">PSP Console Packages</option>
                    </select>
                  </div>

                  {/* Duration in minutes */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">DURATION (IN MINUTES)</label>
                    <input
                      id="new-package-duration"
                      type="number"
                      required
                      min="1"
                      value={newPkgDuration}
                      onChange={(e) => setNewPkgDuration(Number(e.target.value))}
                      className="w-full bg-black text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40 font-mono"
                    />
                  </div>

                  {/* Price in TK */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">PRICE (IN TAKA - TK)</label>
                    <input
                      id="new-package-price"
                      type="number"
                      required
                      min="0"
                      value={newPkgPrice}
                      onChange={(e) => setNewPkgPrice(Number(e.target.value))}
                      className="w-full bg-black text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40 font-mono"
                    />
                  </div>
                </div>

                {pkgSuccessMsg && (
                  <div className="p-3 bg-[#00FF00]/10 border border-[#00FF00]/20 text-[#00FF00] rounded-xl text-xs font-mono">
                    {pkgSuccessMsg}
                  </div>
                )}

                <button
                  id="add-package-submit"
                  type="submit"
                  className="w-full py-3 bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Publish Package Rate
                </button>
              </form>

              {/* List of current package configurations */}
              <div className="md:col-span-7 bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4 font-sans">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Active Package Pricing Sheet
                </h3>

                <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 font-mono text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-black text-gray-500 border-b border-white/10">
                        <th className="p-3 font-bold uppercase tracking-wider">Package Name</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Type</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Duration</th>
                        <th className="p-3 text-right font-bold uppercase tracking-wider">Price</th>
                        <th className="p-3 text-center font-bold uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {packages.map((pkg) => (
                        <tr key={pkg.id} className="hover:bg-white/5">
                          <td className="p-3 text-slate-200 font-sans font-bold">{pkg.name.toUpperCase()}</td>
                          <td className="p-3">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                              pkg.system === 'PC' ? 'text-[#00FF00] border-[#00FF00]/20 bg-[#00FF00]/5' : 'text-white border-white/20 bg-white/5'
                            }`}>
                              {pkg.system}
                            </span>
                          </td>
                          <td className="p-3 text-gray-400 font-mono">{pkg.durationMinutes} mins</td>
                          <td className="p-3 text-right text-[#00FF00] font-black font-mono">{pkg.price} TK</td>
                          <td className="p-3 text-center">
                            <button
                              id={`delete-package-${pkg.id}`}
                              onClick={() => onDeletePackage(pkg.id)}
                              className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
