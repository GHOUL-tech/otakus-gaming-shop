import React, { useState, useEffect } from 'react';
import { Booking, GamePackage } from '../types';
import { checkBookingConflict, getBusySlots } from '../utils/bookingUtils';
import { Calendar, Clock, AlertTriangle, CheckCircle, Smartphone, User, Mail, CreditCard, ShieldAlert } from 'lucide-react';

interface PrebookProps {
  bookings: Booking[];
  packages: GamePackage[];
  onAddBooking: (booking: Booking) => void;
}

export default function Prebook({ bookings, packages, onAddBooking }: PrebookProps) {
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [system, setSystem] = useState<'PC' | 'PSP'>('PC');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState<number>(1); // default 1 hour

  // UI State
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState(100);

  // Set default date to today's date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setTime('12:00');
  }, []);

  // Recalculate price whenever system or duration changes
  useEffect(() => {
    // Standard rates: PC is 100 TK per hr, PSP is 60 TK per hr
    const ratePerHour = system === 'PC' ? 100 : 60;
    setCalculatedPrice(duration * ratePerHour);
  }, [system, duration]);

  // Check conflicts dynamically on form change
  useEffect(() => {
    if (!date || !time || !duration) return;

    const { hasConflict, conflictingBooking } = checkBookingConflict(
      { system, date, time, duration },
      bookings
    );

    if (hasConflict && conflictingBooking) {
      setConflictWarning(
        `Overlap Warning: This ${system} is already booked by ${conflictingBooking.name} on ${date} from ${conflictingBooking.time} for ${conflictingBooking.duration} Hour(s). Please choose a different slot.`
      );
    } else {
      setConflictWarning(null);
    }
  }, [system, date, time, duration, bookings]);

  // Get active busy slots for selected system and date
  const busySlots = date ? getBusySlots(system, date, bookings) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;
    if (!phone.trim()) return;
    if (!date || !time) return;

    // Check conflict one final time
    const { hasConflict, conflictingBooking } = checkBookingConflict(
      { system, date, time, duration },
      bookings
    );

    if (hasConflict && conflictingBooking) {
      setConflictWarning(`Cannot Prebook: Slot overlaps with an existing booking by ${conflictingBooking.name}.`);
      return;
    }

    // Generate unique code starting with #
    // e.g., #PC-1234 or #PSP-5678
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `#${system}-${randomNum}`;

    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() ? email.trim() : undefined,
      system,
      date,
      time,
      duration,
      amount: calculatedPrice,
      status: 'approved', // Auto-approved in this offline shop model for seamless instant play, admin can cancel later
      code
    };

    onAddBooking(newBooking);
    setSuccessBooking(newBooking);

    // Reset Form
    setName('');
    setPhone('');
    setEmail('');
    setDuration(1);
    setConflictWarning(null);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-white/10 text-center md:text-left">
        <h1 className="font-display text-3xl font-black text-white tracking-tighter uppercase italic">
          PREBOOK <span className="text-glow-green text-[#00FF00]">PC & PSP SEATS</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Select your timeslot and lock in your seat. Walk in and start playing instantly!
        </p>
      </div>

      {successBooking ? (
        // Success Receipt Card
        <div className="bg-[#111] border border-[#00FF00]/30 rounded-2xl p-8 space-y-6 text-center max-w-xl mx-auto shadow-[0_0_20px_rgba(0,255,0,0.1)]">
          <div className="w-16 h-16 bg-[#00FF00]/10 rounded-full flex items-center justify-center text-[#00FF00] mx-auto border border-[#00FF00]/20">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-display font-black text-white uppercase italic tracking-tight">BOOKING CONFIRMED!</h2>
            <p className="text-gray-400 text-sm">
              Your gaming seat has been secured. Show this booking ID to Rahin at the shop!
            </p>
          </div>

          {/* Ticket Spacer Box */}
          <div className="bg-black rounded-xl p-6 border border-white/10 font-mono space-y-4 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <span className="text-gray-500 text-xs uppercase font-bold">BOOKING ID</span>
              <span className="text-lg font-black text-[#00FF00] tracking-wider text-glow-green">
                {successBooking.code}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-300">
              <div>
                <span className="text-gray-500 block uppercase font-bold text-[10px]">CUSTOMER</span>
                <span className="font-bold text-white">{successBooking.name}</span>
              </div>
              <div>
                <span className="text-gray-500 block uppercase font-bold text-[10px]">SYSTEM RENTED</span>
                <span className="font-bold text-white">{successBooking.system === 'PC' ? 'HIGH-END PC' : 'PSP CONSOLE'}</span>
              </div>
              <div>
                <span className="text-gray-500 block uppercase font-bold text-[10px]">DATE & TIME</span>
                <span className="font-bold text-white">{successBooking.date} @ {successBooking.time}</span>
              </div>
              <div>
                <span className="text-gray-500 block uppercase font-bold text-[10px]">PLAYING TIME</span>
                <span className="font-bold text-white">{successBooking.duration} Hour(s)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              <span className="text-gray-500 text-xs uppercase font-bold">ESTIMATED BILL</span>
              <span className="text-[#00FF00] font-black text-base">{successBooking.amount} TAKA</span>
            </div>
          </div>

          <div className="text-xs text-amber-500 bg-amber-950/20 border border-amber-500/20 rounded-lg p-3 font-mono">
            ⚠️ Note down your code: <strong>{successBooking.code}</strong>. You will need to enter this in the client PC to activate your play timer!
          </div>

          <button
            id="book-another-btn"
            onClick={() => setSuccessBooking(null)}
            className="w-full py-3 bg-[#00FF00] hover:bg-[#00FF00]/95 text-black font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
          >
            Prebook Another Seat
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Prebook Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-[#00FF00]" /> Customer Information
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">CUSTOMER NAME *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                  <input
                    id="input-book-name"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black hover:bg-[#0f0f0f] focus:bg-black text-slate-100 text-sm pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:border-[#00FF00]/40 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">PHONE NUMBER *</label>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                  <input
                    id="input-book-phone"
                    type="tel"
                    required
                    placeholder="e.g. 01872XXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black hover:bg-[#0f0f0f] focus:bg-black text-slate-100 text-sm pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:border-[#00FF00]/40 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email (Optional) */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">
                  EMAIL ADDRESS <span className="text-gray-500 font-normal">(OPTIONAL)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                  <input
                    id="input-book-email"
                    type="email"
                    placeholder="you@example.com (can be left blank)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black hover:bg-[#0f0f0f] focus:bg-black text-slate-100 text-sm pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:border-[#00FF00]/40 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3 flex items-center gap-2 pt-4">
              <Calendar className="w-5 h-5 text-[#00FF00]" /> Booking Configuration
            </h2>

            <div className="space-y-4">
              {/* System Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">SELECT SYSTEM TO RENT</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    id="system-select-pc"
                    type="button"
                    onClick={() => setSystem('PC')}
                    className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                      system === 'PC'
                        ? 'bg-[#00FF00]/10 border-[#00FF00] text-white shadow-[0_0_15px_rgba(0,255,0,0.1)]'
                        : 'bg-black border-white/10 hover:border-white/20 text-gray-400'
                    }`}
                  >
                    <span className="font-bold text-sm tracking-wide">HIGH POWER PC</span>
                    <span className={`text-[10px] font-mono mt-1 ${system === 'PC' ? 'text-[#00FF00]' : 'text-gray-500'}`}>100 TAKA / hour</span>
                  </button>

                  <button
                    id="system-select-psp"
                    type="button"
                    onClick={() => setSystem('PSP')}
                    className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                      system === 'PSP'
                        ? 'bg-white/10 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                        : 'bg-black border-white/10 hover:border-white/20 text-gray-400'
                    }`}
                  >
                    <span className="font-bold text-sm tracking-wide">PSP PC STATION</span>
                    <span className={`text-[10px] font-mono mt-1 ${system === 'PSP' ? 'text-white' : 'text-gray-500'}`}>60 TAKA / hour</span>
                  </button>
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">BOOKING DATE</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                    <input
                      id="input-book-date"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-black text-slate-100 text-sm pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-widest">START TIME (24H CLOCK)</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                    <input
                      id="input-book-time"
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-black text-slate-100 text-sm pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00FF00]/40"
                    />
                  </div>
                </div>
              </div>

              {/* Duration Slider or Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-gray-400 flex justify-between uppercase tracking-widest">
                  <span>RENTING DURATION</span>
                  <span className="text-[#00FF00] font-black">{duration} HOUR{duration > 1 ? 'S' : ''} ({duration * 60} MINS)</span>
                </label>
                
                {/* Visual Duration Buttons */}
                <div className="grid grid-cols-5 gap-2">
                  {[0.5, 1, 2, 3, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDuration(val)}
                      className={`py-2 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                        duration === val
                          ? 'bg-[#00FF00] border-[#00FF00] text-black font-black'
                          : 'bg-black border-white/10 hover:border-white/20 text-slate-300'
                      }`}
                    >
                      {val === 0.5 ? '30m' : `${val}h`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Preview Card */}
            <div className="bg-black rounded-xl p-4 border border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#00FF00]/10 rounded-lg text-[#00FF00]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-mono font-bold uppercase">TOTAL ESTIMATED RENT</div>
                  <div className="text-[#00FF00] font-mono font-black text-lg">{calculatedPrice} TAKA</div>
                </div>
              </div>

              <div className="text-right text-[10px] text-gray-400 font-mono">
                <div>No advance payment required.</div>
                <div>Pay at the shop after gaming!</div>
              </div>
            </div>

            {/* Overlap warnings */}
            {conflictWarning && (
              <div className="p-3 bg-red-950/20 border border-red-500/30 text-red-300 rounded-xl text-xs flex gap-2.5 items-start">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-normal font-sans">{conflictWarning}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="submit-book-btn"
              type="submit"
              disabled={!!conflictWarning}
              className={`w-full py-3.5 rounded-xl font-black font-display uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer ${
                conflictWarning
                  ? 'bg-neutral-800 border border-neutral-700 text-neutral-500 cursor-not-allowed'
                  : 'bg-[#00FF00] hover:bg-[#00FF00]/90 text-black shadow-[0_0_15px_rgba(0,255,0,0.3)]'
              }`}
            >
              Confirm Prebook Seat
            </button>
          </form>

          {/* Sidebar Schedule Calendar View */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-black text-white text-base flex items-center gap-2 uppercase italic tracking-tight">
                <Clock className="w-5 h-5 text-[#00FF00]" /> Hourly Availability
              </h3>
              
              <div className="space-y-1">
                <div className="text-[10px] text-gray-500 font-mono font-bold uppercase">SELECTED DATE</div>
                <div className="text-sm font-bold text-slate-300 font-sans">{date || 'Select a date'}</div>
              </div>

              <div className="space-y-1 pb-2">
                <div className="text-[10px] text-gray-500 font-mono font-bold uppercase">SYSTEM</div>
                <div className="text-sm font-bold text-slate-300 font-sans">
                  {system === 'PC' ? '💻 PC High-End Stations' : '🎮 PSP Retro Stations'}
                </div>
              </div>

              {/* Busy Timeline Slots */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <h4 className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                  Booked Slots Today
                </h4>

                {busySlots.length > 0 ? (
                  <div className="space-y-2">
                    {busySlots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-xs font-mono flex items-center justify-between text-red-300"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                          <span>{slot.start} - {slot.end}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Reserved ({slot.label.split('(')[1].replace(')', '')})</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-center text-emerald-400 font-sans">
                    ✨ Clear Schedule! No bookings registered yet. You can book any hour you like!
                  </div>
                )}
              </div>
            </div>

            {/* Quick Pricing Summary Policy Card */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-4 font-sans">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                Fair Renting Guarantee
              </h4>
              <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4 font-sans leading-relaxed">
                <li>30 Minutes and hourly packs calculated transparently.</li>
                <li>No penalties for cancellations made through Rahin.</li>
                <li>Automatic grace period of 10 minutes from your scheduled start time.</li>
                <li>All setups cleaned and disinfected before you sit!</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
