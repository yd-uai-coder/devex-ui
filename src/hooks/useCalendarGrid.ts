"use client";

import { useState } from "react";

export type CalendarGridCell = {
  day: number;
  currentMonth: boolean;
  dateString: string;
};

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function toDateString(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

export function parseDateString(
  value: string
): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
}

function getMonthMatrix(year: number, month: number): CalendarGridCell[] {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CalendarGridCell[] = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    cells.push({ day, currentMonth: false, dateString: toDateString(prevYear, prevMonth, day) });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, currentMonth: true, dateString: toDateString(year, month, day) });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    cells.push({
      day: nextDay,
      currentMonth: false,
      dateString: toDateString(nextYear, nextMonth, nextDay),
    });
    nextDay++;
  }
  return cells;
}

/**
 * 年月から週単位のカレンダー行列を計算し、前月/次月への移動を提供する。
 * どの日付が選択されているかという関心事は持たない(呼び出し側で管理する)。
 */
export function useCalendarGrid(initialYear: number, initialMonth: number) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const cells = getMonthMatrix(year, month);
  const monthDate = new Date(year, month, 1);

  function goPrev() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNext() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function setView(nextYear: number, nextMonth: number) {
    setYear(nextYear);
    setMonth(nextMonth);
  }

  return { year, month, cells, monthDate, goPrev, goNext, setView };
}
