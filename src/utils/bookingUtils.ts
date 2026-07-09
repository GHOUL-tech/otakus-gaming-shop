import { Booking } from '../types';

/**
 * Converts "HH:MM" time string to minutes from start of day
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Converts minutes from start of day back to "HH:MM" (24-hour format)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Checks if a proposed booking slot overlaps with any active (approved or pending) bookings
 */
export function checkBookingConflict(
  proposed: { system: 'PC' | 'PSP'; date: string; time: string; duration: number },
  existingBookings: Booking[]
): { hasConflict: boolean; conflictingBooking?: Booking } {
  const proposedStart = timeToMinutes(proposed.time);
  const proposedEnd = proposedStart + proposed.duration * 60;

  for (const booking of existingBookings) {
    // Only check active bookings for the same system on the same date
    if (
      booking.status !== 'cancelled' &&
      booking.system === proposed.system &&
      booking.date === proposed.date
    ) {
      const existingStart = timeToMinutes(booking.time);
      const existingEnd = existingStart + booking.duration * 60;

      // Overlap condition: start of one is before end of other, and end of one is after start of other
      if (proposedStart < existingEnd && proposedEnd > existingStart) {
        return { hasConflict: true, conflictingBooking: booking };
      }
    }
  }

  return { hasConflict: false };
}

/**
 * Returns a list of busy time slots for a specific system on a given date
 */
export function getBusySlots(
  system: 'PC' | 'PSP',
  date: string,
  bookings: Booking[]
): { start: string; end: string; label: string }[] {
  return bookings
    .filter(b => b.system === system && b.date === date && b.status !== 'cancelled')
    .map(b => {
      const startMin = timeToMinutes(b.time);
      const endMin = startMin + b.duration * 60;
      return {
        start: b.time,
        end: minutesToTime(endMin),
        label: `${b.time} - ${minutesToTime(endMin)} (${b.name})`
      };
    })
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
}
