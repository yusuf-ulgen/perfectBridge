import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type GameState = 'menu' | 'idle' | 'growing' | 'dropping' | 'walking' | 'evaluating' | 'success' | 'fail';

export const useGameState = () => {
  const [state, setState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);

  // Load high score on initial mount
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const savedRaw = await AsyncStorage.getItem('HIGH_SCORE');
        if (savedRaw) {
          setHighScore(parseInt(savedRaw, 10));
        }
      } catch (e) {
        console.error('Failed to load high score', e);
      }
    };
    loadHighScore();
  }, []);

  // Update high score whenever score increases
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      AsyncStorage.setItem('HIGH_SCORE', score.toString());
    }
  }, [score]);

  const startGame = () => {
    if (state === 'menu' || state === 'fail') {
      setScore(0);
      setCombo(0);
      setState('idle');
    }
  };

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

  const [isPaused, setIsPaused] = useState(false);

  const togglePause = () => {

    if (state !== 'menu' && state !== 'fail') {
      setIsPaused(prev => !prev);
    }
  };

  return {
    state,
    setState,
    isPaused,
    setIsPaused,
    score,
    highScore,
    setScore,
    combo,
    setCombo,
    startGame,
    startGrowing,
    stopGrowing,
    togglePause,
  };
};

