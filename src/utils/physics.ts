import { PHYSICS } from '../constants';

export const getPlatformWidth = (score: number) => {
  if (score <= 22) {
    // Standard thinning until 22 (min 40)
    return Math.max(40, PHYSICS.platformWidthBase - Math.floor(score / 5) * 5);
  } else {
    // Fluctuating width after 22: oscillates between 30 and 45
    const oscillation = Math.sin(score * 0.8) * 7.5; 
    return 37.5 + oscillation;
  }
};

export const getGapRange = (score: number) => {
  const min = PHYSICS.platformMinGapBase + Math.min(50, Math.floor(score / 3) * 5);
  const max = PHYSICS.platformMaxGapBase; 
  return { min, max };
};

export const checkBridgeSuccess = (
  bridgeLength: number,
  gapStart: number,
  gapEnd: number
): { success: boolean, isPerfect: boolean, isBait: boolean } => {
  const isPerfect = Math.abs(bridgeLength - gapStart) <= PHYSICS.perfectLandingTolerance;

  if (bridgeLength >= gapStart && bridgeLength <= gapEnd) {
    return { success: true, isPerfect, isBait: false };
  }

  const missDistanceStart = gapStart - bridgeLength;
  const missDistanceEnd = bridgeLength - gapEnd;

  let isBait = false;
  if (missDistanceStart > 0 && missDistanceStart <= PHYSICS.baitTolerance) {
    isBait = true;
  } else if (missDistanceEnd > 0 && missDistanceEnd <= PHYSICS.baitTolerance) {
    isBait = true;
  }

  return { 
    success: false, 
    isPerfect: false,
    isBait 
  };
};

export const generateNextPlatformGap = (score: number) => {
  const { min, max } = getGapRange(score);
  return min + Math.random() * (max - min);
};
