import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const COLORS = {
  background: '#87CEEB', // Sky blue for general feel
  platform: '#222222',
  bridge: '#8B4513', // SaddleBrown color for bridge
  character: '#FF4500',
  text: '#ffffff',
  perfect: '#FFD700',
  combo: '#00FF00',
  danger: '#FF0000',
};

export const PHYSICS = {
  bridgeGrowSpeed: 4,
  characterWalkSpeed: 500,
  dropAnimDuration: 300,
  fallAnimDuration: 400,
  platformWidthBase: 60,
  platformMinGapBase: 50,
  platformMaxGapBase: 220,
  baitTolerance: 3,
  perfectLandingTolerance: 5, // Slightly more forgiving for edge landing
};

export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  platformHeight: SCREEN_HEIGHT * 0.3, // Platforms take up bottom 30%
};
