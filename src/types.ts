export interface Game {
  id: string;
  name: string;
  image: string;
  type: 'PC' | 'PSP';
  isCustom?: boolean;
}

export interface Booking {
  id: string;
  name: string;
  phone: string;
  email?: string;
  system: 'PC' | 'PSP';
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // in hours (e.g. 0.5, 1, 2)
  amount: number; // in Taka (TK)
  status: 'pending' | 'approved' | 'cancelled';
  code: string; // unique code like #PC-1234 or #PSP-5678
  isWalkIn?: boolean;
}

export interface GamePackage {
  id: string;
  system: 'PC' | 'PSP';
  name: string;
  durationMinutes: number;
  price: number; // in TK
}

export interface ActiveSession {
  id: string; // same as code
  bookingId: string;
  code: string;
  system: 'PC' | 'PSP';
  customerName: string;
  durationMinutes: number;
  startTime: string; // ISO string
  endTime: string; // ISO string
  isActive: boolean;
  isEnded: boolean;
  notifiedAdmin?: boolean;
}
