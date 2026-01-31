import { describe, it, expect } from 'vitest';
import planData from '../plan.json';
import { parseISO, getDay, format, getMonth, isBefore, isAfter } from 'date-fns';

describe('plan.json validation', () => {
  const { classes } = planData;

  it('each day with classes for a specific group should have exactly 2 classes', () => {
    const days = {};
    classes.forEach(c => {
      const key = `${c.group}-${c.date}`;
      days[key] = (days[key] || 0) + 1;
    });

    Object.entries(days).forEach(([key, count]) => {
      expect(count, `Day ${key} has ${count} classes instead of 2`).toBe(2);
    });
  });

  it('classes should only be on weekends (Saturday or Sunday)', () => {
    classes.forEach(c => {
      const date = parseISO(c.date);
      const dayOfWeek = getDay(date); // 0 = Sunday, 6 = Saturday
      expect([0, 6], `Date ${c.date} is not a weekend`).toContain(dayOfWeek);
    });
  });

  it('first class in a day starts at 9:00 and finishes at 12:15', () => {
    const dailyClasses = {};
    classes.forEach(c => {
      const key = `${c.group}-${c.date}`;
      if (!dailyClasses[key]) dailyClasses[key] = [];
      dailyClasses[key].push(c);
    });

    Object.values(dailyClasses).forEach(dayClasses => {
      const sorted = dayClasses.sort((a, b) => a.start_time.localeCompare(b.start_time));
      const first = sorted[0];
      
      const startTime = format(parseISO(first.start_time), 'HH:mm');
      const endTime = format(parseISO(first.end_time), 'HH:mm');
      
      expect(startTime, `First class on ${first.date} starts at ${startTime} instead of 09:00`).toBe('09:00');
      expect(endTime, `First class on ${first.date} ends at ${endTime} instead of 12:15`).toBe('12:15');
    });
  });

  it('second class in a day starts at 12:45 and finishes at 16:00', () => {
    const dailyClasses = {};
    classes.forEach(c => {
      const key = `${c.group}-${c.date}`;
      if (!dailyClasses[key]) dailyClasses[key] = [];
      dailyClasses[key].push(c);
    });

    Object.values(dailyClasses).forEach(dayClasses => {
      const sorted = dayClasses.sort((a, b) => a.start_time.localeCompare(b.start_time));
      if (sorted.length < 2) return;
      
      const second = sorted[1];
      
      const startTime = format(parseISO(second.start_time), 'HH:mm');
      const endTime = format(parseISO(second.end_time), 'HH:mm');
      
      expect(startTime, `Second class on ${second.date} starts at ${startTime} instead of 12:45`).toBe('12:45');
      expect(endTime, `Second class on ${second.date} ends at ${endTime} instead of 16:00`).toBe('16:00');
    });
  });

  it('all lectures should be on Saturdays', () => {
    classes.filter(c => c.type === 'lecture').forEach(c => {
      const date = parseISO(c.date);
      const dayOfWeek = getDay(date);
      expect(dayOfWeek, `Lecture on ${c.date} is not on Saturday`).toBe(6);
    });
  });

  it('all lectures should be in room 2.41', () => {
    classes.filter(c => c.type === 'lecture').forEach(c => {
      // Room in JSON is "s. 2.41" based on current plan.json
      expect(c.room, `Lecture on ${c.date} is in room ${c.room} instead of s. 2.41`).toBe('s. 2.41');
    });
  });

  it('in March and April, Saturday classes should only be lectures', () => {
    classes.forEach(c => {
      const date = parseISO(c.date);
      const month = getMonth(date); // 0-indexed, March=2, April=3
      const dayOfWeek = getDay(date);
      
      if ((month === 2 || month === 3) && dayOfWeek === 6) {
        expect(c.type, `Saturday class on ${c.date} is ${c.type} instead of lecture`).toBe('lecture');
      }
    });
  });

  it('on Sundays, classes should only be labs', () => {
    classes.forEach(c => {
      const date = parseISO(c.date);
      const dayOfWeek = getDay(date);
      
      if (dayOfWeek === 0) {
        expect(c.type, `Sunday class on ${c.date} is ${c.type} instead of lab`).toBe('lab');
      }
    });
  });

  it('since May, all classes should be labs', () => {
    classes.forEach(c => {
      const date = parseISO(c.date);
      const month = getMonth(date); // May is 4
      
      if (month >= 4) {
        expect(c.type, `Class on ${c.date} (since May) is ${c.type} instead of lab`).toBe('lab');
      }
    });
  });

  it('labs are only in either room "s. 3.27e" or "s. 3.27d"', () => {
    classes.filter(c => c.type === 'lab').forEach(c => {
      expect(['s. 3.27e', 's. 3.27d'], `Lab on ${c.date} G${c.group} is in room ${c.room}`).toContain(c.room);
    });
  });

  it('labs of group 1 and 2 are not happening in the same room at the same time', () => {
    const timeSlots = {};
    classes.filter(c => c.type === 'lab').forEach(c => {
      const key = `${c.start_time}-${c.end_time}`;
      if (!timeSlots[key]) timeSlots[key] = [];
      timeSlots[key].push(c);
    });

    Object.values(timeSlots).forEach(slotClasses => {
      if (slotClasses.length < 2) return;
      // Check for same room at same time
      const rooms = slotClasses.map(c => c.room);
      const uniqueRooms = new Set(rooms);
      expect(uniqueRooms.size, `Rooms overlap at ${slotClasses[0].start_time}: ${rooms.join(', ')}`).toBe(rooms.length);
    });
  });

  it('labs on Saturdays should follow specific room assignments by group', () => {
    const dailyClasses = {};
    classes.filter(c => c.type === 'lab').forEach(c => {
      const key = `${c.group}-${c.date}`;
      if (!dailyClasses[key]) dailyClasses[key] = [];
      dailyClasses[key].push(c);
    });

    Object.values(dailyClasses).forEach(dayClasses => {
      const firstClass = dayClasses.sort((a, b) => a.start_time.localeCompare(b.start_time))[0];
      const secondClass = dayClasses.sort((a, b) => a.start_time.localeCompare(b.start_time))[1];
      const date = parseISO(firstClass.date);
      const dayOfWeek = getDay(date);

      if (dayOfWeek === 6) { // Saturday
        if (firstClass.group === 1) {
          expect(firstClass.room, `G1 Sat 1st lab on ${firstClass.date} room`).toBe('s. 3.27d');
          if (secondClass) expect(secondClass.room, `G1 Sat 2nd lab on ${secondClass.date} room`).toBe('s. 3.27e');
        } else if (firstClass.group === 2) {
          expect(firstClass.room, `G2 Sat 1st lab on ${firstClass.date} room`).toBe('s. 3.27e');
          if (secondClass) expect(secondClass.room, `G2 Sat 2nd lab on ${secondClass.date} room`).toBe('s. 3.27d');
        }
      }
    });
  });

  it('labs on Sundays should follow specific room assignments based on date', () => {
    const dailyClasses = {};
    classes.filter(c => c.type === 'lab').forEach(c => {
      const key = `${c.group}-${c.date}`;
      if (!dailyClasses[key]) dailyClasses[key] = [];
      dailyClasses[key].push(c);
    });

    Object.values(dailyClasses).forEach(dayClasses => {
      const sorted = dayClasses.sort((a, b) => a.start_time.localeCompare(b.start_time));
      const firstClass = sorted[0];
      const secondClass = sorted[1];
      const date = parseISO(firstClass.date);
      const dayOfWeek = getDay(date);

      if (dayOfWeek === 0) { // Sunday
        const isUntilMarch13 = isBefore(date, parseISO('2026-03-14'));
        
        if (isUntilMarch13) {
          // Until March 13th
          if (firstClass.group === 1) {
            expect(firstClass.room, `G1 Sun (<=Mar13) 1st lab on ${firstClass.date}`).toBe('s. 3.27d');
            if (secondClass) expect(secondClass.room, `G1 Sun (<=Mar13) 2nd lab on ${secondClass.date}`).toBe('s. 3.27e');
          } else {
            expect(firstClass.room, `G2 Sun (<=Mar13) 1st lab on ${firstClass.date}`).toBe('s. 3.27e');
            if (secondClass) expect(secondClass.room, `G2 Sun (<=Mar13) 2nd lab on ${secondClass.date}`).toBe('s. 3.27d');
          }
        } else {
          // After March 14th
          if (firstClass.group === 1) {
            expect(firstClass.room, `G1 Sun (>Mar14) 1st lab on ${firstClass.date}`).toBe('s. 3.27e');
            if (secondClass) expect(secondClass.room, `G1 Sun (>Mar14) 2nd lab on ${secondClass.date}`).toBe('s. 3.27d');
          } else {
            expect(firstClass.room, `G2 Sun (>Mar14) 1st lab on ${firstClass.date}`).toBe('s. 3.27d');
            if (secondClass) expect(secondClass.room, `G2 Sun (>Mar14) 2nd lab on ${secondClass.date}`).toBe('s. 3.27e');
          }
        }
      }
    });
  });

  it('all class times should have the correct timezone offset', () => {
    const springForward = parseISO('2026-03-29');
    const fallBack = parseISO('2026-10-25');

    classes.forEach(c => {
      const date = parseISO(c.date);
      
      const isSummerTime = (isAfter(date, springForward) || format(date, 'yyyy-MM-dd') === '2026-03-29') && isBefore(date, fallBack);
      const expectedOffset = isSummerTime ? '+02:00' : '+01:00';

      expect(c.start_time, `Class on ${c.date} has wrong offset in start_time`).toContain(expectedOffset);
      expect(c.end_time, `Class on ${c.date} has wrong offset in end_time`).toContain(expectedOffset);
    });
  });
});
