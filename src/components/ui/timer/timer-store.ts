import { create } from 'zustand';
import type { StoreApi, UseBoundStore } from "zustand";

export type TimerStoreInstance = UseBoundStore<StoreApi<TimerStore>>;

export type TimerStore = {
  startSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;

  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setStartSeconds: (value: number) => void;
};

export const createTimerStore = () =>
  create<TimerStore>((set) => ({
  // タイマー初期値
  startSeconds: 0,
  remainingSeconds: 0,
  isRunning: false,

  // 作業時間を設定
  setStartSeconds: (value) =>
    set({
      startSeconds: value,
      remainingSeconds: value,
    }),

  start: () =>
    set({
      isRunning: true,
    }),

  pause: () =>
    set({
      isRunning: false,
    }),

  reset: () =>
    set((state) => ({
      remainingSeconds: state.startSeconds,
      isRunning: false,
    })),

  tick: () =>
    set((state) => {
      if (!state.isRunning || state.remainingSeconds <= 0) {
        return state;
      }

      const remainingSeconds = state.remainingSeconds - 1;
      return {
        remainingSeconds,
        isRunning: remainingSeconds > 0,
      };
    }),
}));