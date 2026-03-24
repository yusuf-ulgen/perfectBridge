import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const COLORS = {
  background: '#87CEEB', // Sky blue for general feel
  platform: '#222222',
  bridge: '#8B4513', // SaddleBrown color for bridge
  character: '#FF4500',
  text: '#ffffff',
};

export const PHYSICS = {
  bridgeGrowSpeed: 4, // Units added per interval ticket (e.g., 20ms)
  characterWalkSpeed: 500, // Ms duration for walking animation
  dropAnimDuration: 300, // Ms duration for bridge to drop
  fallAnimDuration: 400, // Ms for character dropping
  platformMinGap: 50,
  platformMaxGap: 200,
  platformWidth: 60,
  baitTolerance: 2, // If missed by <= 2 units, trigger "Bait" logic (dramatic miss)
};

export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  platformHeight: SCREEN_HEIGHT * 0.3, // Platforms take up bottom 30%
};
