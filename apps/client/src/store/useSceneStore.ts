import { create } from 'zustand';

export interface SceneState {
  readonly progress: number;
  readonly interactionBoost: number;
  readonly setProgress: (value: number) => void;
  readonly setInteractionBoost: (value: number) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  progress: 0,
  interactionBoost: 0,
  setProgress: (value: number): void => {
    const clamped: number =
      value < 0 ? 0 : value > 1 ? 1 : Number.isFinite(value) ? value : 0;
    set({ progress: clamped });
  },
  setInteractionBoost: (value: number): void => {
    const clamped: number =
      value < 0 ? 0 : value > 1 ? 1 : Number.isFinite(value) ? value : 0;
    set({ interactionBoost: clamped });
  },
}));
