import { useState } from 'react';

export type GameState = 'idle' | 'growing' | 'dropping' | 'walking' | 'evaluating' | 'success' | 'fail';

export const useGameState = () => {
  const [state, setState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);

  const startGrowing = () => {
    if (state === 'idle') {
      setState('growing');
    }
  };

  const stopGrowing = () => {
    if (state === 'growing') {
      setState('dropping');
    }
  };

  return {
    state,
    setState,
    score,
    setScore,
    startGrowing,
    stopGrowing,
  };
};
