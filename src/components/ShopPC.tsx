import React, { useState, useEffect, useRef } from 'react';
import { Booking, ActiveSession } from '../types';
import { ACCOUNTS } from '../data/defaultData';
import { Search, Monitor, Gamepad2, ShieldAlert, Timer, Play, LogOut, CheckCircle, Volume2, AlertTriangle, FastForward } from 'lucide-react';

interface ShopPCProps {
  bookings: Booking[];
  activeSessions: ActiveSession[];
  onStartSession: (session: ActiveSession) => void;
  onEndSession: (code: string) => void;
  onLogoutProfile: () => void;
  loggedInProfile: 'PC' | 'PSP' | null;
  onLoginProfile: (profile: 'PC' | 'PSP') => void;
}

export default function ShopPC({
  bookings,
  activeSessions,
  onStartSession,
  onEndSession,
  onLogoutProfile,
  loggedInProfile,
  onLoginProfile
}: ShopPCProps) {
  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Logout/Lock Screen Password States
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutPassword, setLogoutPassword] = useState('');
  const [logoutError, setLogoutError] = useState('');

  // Terminal States
  const [searchCode, setSearchCode] = useState('');
  const [searchError, setSearchError] = useState('');
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  
  // Timer Simulation
  const [isSimulateFast, setIsSimulateFast] = useState(false);

  // Active terminal timer states (rendered if there is a running session for this logged-in profile)
  const currentSession = activeSessions.find(
    s => s.system === loggedInProfile && s.isActive && !s.isEnded
  );

  // State to track ticking timer countdown values
  const [timeLeft, setTimeLeft] = useState<number>(0); // remaining seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasBuzzedRef = useRef<string | null>(null);

  // Dynamic sound generator using Web Audio API (ensures play buzzer works unmuted)
  const playBuzzerSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playBeep = (delay: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, audioCtx.currentTime + delay);
        osc.frequency.linearRampToValueAtTime(320, audioCtx.currentTime + delay + duration);
        
        gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + delay + 0.05);
        gain.gain.setValueAtTime(0.6, audioCtx.currentTime + delay + duration - 0.05);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + delay + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + duration);
      };

      // Play gritty buzzer sound pattern
      playBeep(0, 0.4);
      playBeep(0.5, 0.4);
      playBeep(1.0, 0.7);
    } catch (e) {
      console.warn('Web Audio buzzer not supported or blocked:', e);
    }
  };

  // Filter sessions that have ended for this specific logged-in profile to show warning / YouTube video
  const endedSession = activeSessions.find(
    s => s.system === loggedInProfile && s.isEnded
  );

  // Trigger buzzer sound once when session ends
  useEffect(() => {
    if (endedSession && hasBuzzedRef.current !== endedSession.code) {
      hasBuzzedRef.current = endedSession.code;
      playBuzzerSound();
    } else if (!endedSession) {
      hasBuzzedRef.current = null;
    }
  }, [endedSession?.code]);

  // Initialize countdown and handle ticking with stable primitive dependencies
  useEffect(() => {
    if (!currentSession) {
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const end = new Date(currentSession.endTime).getTime();
      const now = new Date().getTime();
      return Math.max(0, Math.floor((end - now) / 1000));
    };

    const initialSecs = calculateTimeLeft();
    setTimeLeft(initialSecs);

    if (initialSecs <= 0) {
      onEndSession(currentSession.code);
      return;
    }

    const intervalSpeed = isSimulateFast ? 100 : 1000;
    const interval = setInterval(() => {
      if (isSimulateFast) {
        setTimeLeft(prev => {
          const next = Math.max(0, prev - 10);
          if (next === 0) {
            onEndSession(currentSession.code);
            clearInterval(interval);
          }
          return next;
        });
      } else {
        const secs = calculateTimeLeft();
        setTimeLeft(secs);
        if (secs <= 0) {
          onEndSession(currentSession.code);
          clearInterval(interval);
        }
      }
    }, intervalSpeed);

    return () => clearInterval(interval);
  }, [currentSession?.id, currentSession?.endTime, isSimulateFast, onEndSession]);

  // Handle Profile Login Submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (username === ACCOUNTS.pcUser.username && password === ACCOUNTS.pcUser.password) {
      onLoginProfile('PC');
      setUsername('');
      setPassword('');
    } else if (username === ACCOUNTS.pspUser.username && password === ACCOUNTS.pspUser.password) {
      onLoginProfile('PSP');
      setUsername('');
      setPassword('');
    } else {
      setLoginError('Incorrect User ID or Password for gaming profiles.');
    }
  };

  // Search and Activate Booking code
  const handleSearchCode = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setFoundBooking(null);

    const cleanCode = searchCode.trim().toUpperCase();
    if (!cleanCode) return;

    // 1. Find if code exists in bookings
    const booking = bookings.find(b => b.code.toUpperCase() === cleanCode);

    if (!booking) {
      setSearchError(`Error: Booking Code "${cleanCode}" was not found. Please contact Rahin.`);
      return;
    }

    // 2. Check if booking status is cancelled
    if (booking.status === 'cancelled') {
      setSearchError('Error: This booking has been cancelled by the admin.');
      return;
    }

    // 3. System Validation check: Code system matches logged-in terminal system
    if (booking.system !== loggedInProfile) {
      if (loggedInProfile === 'PC') {
        setSearchError('Error: This is a High-End PC terminal. PSP codes cannot be loaded here. Please use a PSP TV station.');
      } else {
        setSearchError('Error: This is a PSP TV station. High-Power PC codes cannot be loaded here. Please use a High-End PC terminal.');
      }
      return;
    }

    // 4. Check if session is already running or completed
    const existingSession = activeSessions.find(s => s.code === cleanCode);
    if (existingSession) {
      if (existingSession.isEnded) {
        setSearchError('Error: This session has already ended/expired.');
      } else if (existingSession.isActive) {
        setSearchError('Error: This session is already currently active and running!');
      }
      return;
    }

    // Code is valid! Display pre-activation details card for manual user activation
    setFoundBooking(booking);
    setSearchError('');
  };

  const handleStartPlay = () => {
    if (!foundBooking) return;

    const durationMinutes = foundBooking.duration * 60;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const newSession: ActiveSession = {
      id: foundBooking.code,
      bookingId: foundBooking.id,
      code: foundBooking.code,
      system: foundBooking.system,
      customerName: foundBooking.name,
      durationMinutes,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      isActive: true,
      isEnded: false
    };

    onStartSession(newSession);
    setFoundBooking(null);
    setSearchCode('');
  };

  // Format seconds to hh:mm:ss
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTo24H = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const hrs = date.getHours().toString().padStart(2, '0');
      const mins = date.getMinutes().toString().padStart(2, '0');
      const secs = date.getSeconds().toString().padStart(2, '0');
      return `${hrs}:${mins}:${secs}`;
    } catch (e) {
      return '00:00:00';
    }
  };

  const formatTo12H = (isoString: string) => {
    try {
      const date = new Date(isoString);
      let hrs = date.getHours();
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      hrs = hrs % 12;
      hrs = hrs ? hrs : 12; // the hour '0' should be '12'
      const hrsStr = hrs.toString().padStart(2, '0');
      const mins = date.getMinutes().toString().padStart(2, '0');
      const secs = date.getSeconds().toString().padStart(2, '0');
      return `${hrsStr}:${mins}:${secs} ${ampm}`;
    } catch (e) {
      return '12:00:00 AM';
    }
  };

  // Handle Confirming Terminal Logout/Lock Screen with Password
  const handleConfirmLogout = (e: React.FormEvent) => {
    e.preventDefault();
    setLogoutError('');

    const correctPcPass = ACCOUNTS.pcUser.password; // 'rahinemp'
    const correctPspPass = ACCOUNTS.pspUser.password; // 'rahin5566'
    const adminPass = ACCOUNTS.admin.password; // 'rahin5566'

    let isAuthorized = false;

    if (loggedInProfile === 'PC') {
      if (logoutPassword === correctPcPass || logoutPassword === adminPass) {
        isAuthorized = true;
      }
    } else if (loggedInProfile === 'PSP') {
      if (logoutPassword === correctPspPass || logoutPassword === adminPass) {
        isAuthorized = true;
      }
    }

    if (isAuthorized) {
      onLogoutProfile();
      setShowLogoutConfirm(false);
      setLogoutPassword('');
    } else {
      setLogoutError('Incorrect password! Lock screen action denied.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Login Page / Credentials Gate */}
      {!loggedInProfile ? (
        <div className="max-w-md mx-auto bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6 shadow-[0_0_15px_rgba(0,255,0,0.05)]">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#00FF00]/10 text-[#00FF00] rounded-xl flex items-center justify-center mx-auto border border-[#00FF00]/20">
              <Monitor className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-display font-black text-white uppercase italic tracking-tight">SHOP TERMINAL LOGIN</h2>
            <p className="text-xs text-gray-400">
              Enter User ID & Password to unlock this station. Ask Rahin for credentials.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 font-sans">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">USER ID</label>
              <input
                id="terminal-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. RAHINEMP or psp123"
                className="w-full bg-black hover:bg-[#0f0f0f] text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">PASSWORD</label>
              <input
                id="terminal-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black hover:bg-[#0f0f0f] text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex gap-2 font-mono">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              id="terminal-login-btn"
              type="submit"
              className="w-full py-3 bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
            >
              Unlock Station
            </button>
          </form>
        </div>
      ) : (
        // Logged In Terminal View
        <div className="space-y-8">
          {/* Top Info Bar */}
          <div className="flex justify-between items-center bg-[#111] border border-white/10 rounded-2xl p-4 px-6">
            <div className="flex items-center gap-3">
              {loggedInProfile === 'PC' ? (
                <div className="p-2 bg-[#00FF00]/10 text-[#00FF00] rounded-lg border border-[#00FF00]/20">
                  <Monitor className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 bg-white/5 text-white rounded-lg border border-white/10">
                  <Gamepad2 className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="font-mono text-[10px] text-gray-500 block font-bold uppercase">CURRENT STATION ROLE</span>
                <span className={`text-sm font-black tracking-wider uppercase italic ${loggedInProfile === 'PC' ? 'text-[#00FF00] text-glow-green' : 'text-white'}`}>
                  {loggedInProfile === 'PC' ? '⚡ HIGH POWER PC TERMINAL' : '🕹️ PSP PLAY STATION'}
                </span>
              </div>
            </div>

            <button
              id="terminal-logout"
              onClick={() => setShowLogoutConfirm(true)}
              className="px-3.5 py-1.5 bg-black hover:bg-[#111] text-gray-400 hover:text-white rounded-lg border border-white/10 text-xs font-mono flex items-center gap-2 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Lock Screen
            </button>
          </div>

          {/* 1. If A Session is currently ACTIVE (Playing Countdown!) */}
          {currentSession ? (
            <div className="bg-[#111] border border-[#00FF00]/20 rounded-2xl p-8 space-y-6 text-center relative overflow-hidden shadow-[0_0_20px_rgba(0,255,0,0.08)]">
              <div className="absolute inset-0 bg-[#00FF00]/5 pointer-events-none" />
              
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00FF00]/10 border border-[#00FF00]/20 rounded text-xs font-mono font-bold text-[#00FF00] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#00FF00] animate-pulse" />
                  GAMING SESSION IN PROGRESS
                </span>
                <h2 className="text-2xl font-display font-black text-white tracking-tight uppercase italic leading-tight">
                  Welcome, <span className="text-[#00FF00] text-glow-green">{currentSession.customerName}</span>!
                </h2>
                <p className="text-gray-400 text-xs font-mono uppercase font-bold tracking-tight">
                  Booking Code: {currentSession.code} • System: {currentSession.system} Game Lounge
                </p>
              </div>

              {/* Ticking Big Clock Timer */}
              <div className="space-y-3 py-6">
                <div className="text-[10px] font-mono tracking-widest text-gray-500 uppercase font-bold">REMAINING PLAY TIME</div>
                <div className="text-5xl md:text-6xl font-mono font-black tracking-widest text-white text-glow-green">
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Start Times Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto py-2">
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center">
                  <div className="text-[9px] font-mono tracking-widest text-gray-500 uppercase font-bold">START TIME (12H CLOCK)</div>
                  <div className="text-sm font-mono font-bold text-[#00FF00] text-glow-green mt-1">
                    {formatTo12H(currentSession.startTime)}
                  </div>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center">
                  <div className="text-[9px] font-mono tracking-widest text-gray-500 uppercase font-bold">END TIME (12H CLOCK)</div>
                  <div className="text-sm font-mono font-bold text-[#00FF00] text-glow-green mt-1">
                    {formatTo12H(currentSession.endTime)}
                  </div>
                </div>
              </div>

              {/* Tester Fast Forward Option */}
              <div className="max-w-xs mx-auto p-2 bg-black rounded-xl border border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono font-bold uppercase flex items-center gap-1">
                  <FastForward className="w-3.5 h-3.5 text-[#00FF00]" />
                  Speedup Simulator (10x)
                </span>
                <input
                  id="checkbox-simulate-timer"
                  type="checkbox"
                  checked={isSimulateFast}
                  onChange={(e) => setIsSimulateFast(e.target.checked)}
                  className="w-4 h-4 accent-[#00FF00] cursor-pointer"
                />
              </div>

              <div className="p-4 bg-black/50 rounded-xl max-w-md mx-auto text-xs text-gray-400 font-sans leading-relaxed">
                📢 Game safely! When your timer hits zero, a completion buzzer sound will trigger. If you need more hours, please ask Rahin to update your slot.
              </div>
            </div>
          ) : endedSession ? (
            // 2. If Session Has ENDED (Shows YouTube Alarm Embed!)
            <div className="bg-[#111] border border-red-500/30 rounded-2xl p-8 space-y-6 text-center relative overflow-hidden shadow-[0_0_20px_rgba(255,0,0,0.05)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-2">
                <div className="w-14 h-14 bg-red-500/15 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/20 animate-bounce">
                  <Timer className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-display font-black text-red-500 tracking-tight uppercase italic leading-tight">
                  YOUR TIME IS OVER!
                </h2>
                <p className="text-gray-400 text-sm">
                  The play timer for booking <strong className="text-white">{endedSession.code}</strong> has run out.
                </p>
              </div>

              {/* YouTube embedded alarm */}
              <div className="max-w-xl mx-auto rounded-2xl overflow-hidden border border-white/10 aspect-video">
                <iframe
                  id="youtube-alarm-frame"
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/09Urt8CSQAA?autoplay=1&mute=0"
                  title="Gaming Time Over Buzzer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="no-referrer"
                  allowFullScreen
                />
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs max-w-md mx-auto font-sans leading-relaxed">
                🚨 <strong>Notice for Customer ({endedSession.customerName}):</strong> Please step back from the system or talk to Rahin to top-up/bill another hour. Thank you for playing!
              </div>

              <button
                id="reset-timer-btn"
                onClick={() => onEndSession(endedSession.code)} // resets back to loading state
                className="px-6 py-2.5 bg-black hover:bg-[#111] text-gray-300 rounded-xl border border-white/10 text-xs font-mono transition-colors cursor-pointer"
              >
                Clear Screen & Close Alarm
              </button>
            </div>
          ) : (
            // 3. Waiting to Activate Session (Search Code Screen!)
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8 space-y-8">
              <div className="text-center space-y-2 max-w-md mx-auto">
                <h2 className="text-xl font-display font-black text-white uppercase italic tracking-tight">
                  START YOUR SESSION
                </h2>
                <p className="text-xs text-gray-400 leading-normal font-sans">
                  Please enter your booked ID/code (e.g. <span className="font-mono text-[#00FF00] font-bold">#PC-1234</span>) in the search bar below to initiate your gaming timer.
                </p>
              </div>

              {/* Search Code Form */}
              <form onSubmit={handleSearchCode} className="max-w-md mx-auto flex gap-3">
                <input
                  id="terminal-code-search"
                  type="text"
                  placeholder="Enter Booking Code (e.g. #PC-XXXX)"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="flex-1 bg-black text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40 uppercase font-mono tracking-wider"
                />
                <button
                  id="terminal-code-search-submit"
                  type="submit"
                  className="px-5 bg-[#00FF00] hover:bg-[#00FF00]/90 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Load Slot
                </button>
              </form>

              {searchError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex gap-2.5 max-w-md mx-auto leading-normal font-mono">
                  <ShieldAlert className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                  <span>{searchError}</span>
                </div>
              )}

              {/* Pre-Activation Details Card */}
              {foundBooking && (
                <div className="max-w-md mx-auto bg-black border border-[#00FF00]/30 rounded-2xl p-6 space-y-6 shadow-[0_0_15px_rgba(0,255,0,0.1)]">
                  <div className="border-b border-white/5 pb-3">
                    <span className="text-[10px] font-mono text-gray-500 block uppercase font-bold">FOUND VALID SLOT</span>
                    <span className="text-lg font-black text-white font-display uppercase italic tracking-tight">{foundBooking.name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                    <div>
                      <span className="text-gray-500 block uppercase font-bold text-[10px]">SYSTEM SPEC</span>
                      <span className="font-bold text-white">{foundBooking.system === 'PC' ? 'HIGH POWER PC' : 'PSP PC CONSOLE'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block uppercase font-bold text-[10px]">ALLOCATED TIME</span>
                      <span className="font-bold text-[#00FF00]">{foundBooking.duration} Hour(s) ({foundBooking.duration * 60} Mins)</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block uppercase font-bold text-[10px]">ORDER ID</span>
                      <span className="font-bold text-gray-300">{foundBooking.code}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block uppercase font-bold text-[10px]">PHONE CONTACT</span>
                      <span className="font-bold text-gray-300">{foundBooking.phone}</span>
                    </div>
                  </div>

                  <button
                    id="activate-play-btn"
                    onClick={handleStartPlay}
                    className="w-full py-3 bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,0,0.3)]"
                  >
                    <Play className="w-4 h-4 fill-current" /> Activate Play Timer Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Logout Password Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-6 shadow-[0_0_50px_rgba(255,0,0,0.15)] text-left">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center mx-auto border border-red-500/20">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-display font-black text-white uppercase italic tracking-tight">LOCK TERMINAL?</h3>
              <p className="text-xs text-gray-400">
                A password is required to exit or lock the <span className="font-bold text-white">{loggedInProfile === 'PC' ? '⚡ HIGH POWER PC' : '🕹️ PSP PLAY STATION'}</span> role.
              </p>
            </div>

            <form onSubmit={handleConfirmLogout} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-mono font-bold text-gray-400 block uppercase tracking-widest">ENTER PASSWORD</label>
                <input
                  id="logout-password-input"
                  type="password"
                  required
                  autoFocus
                  value={logoutPassword}
                  onChange={(e) => setLogoutPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-red-500/40 text-center font-mono tracking-widest"
                />
              </div>

              {logoutError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-center font-mono">
                  {logoutError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    setLogoutPassword('');
                    setLogoutError('');
                  }}
                  className="py-2.5 bg-neutral-900 hover:bg-neutral-800 text-slate-400 hover:text-white rounded-xl border border-white/5 transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-colors cursor-pointer"
                >
                  CONFIRM LOCK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
