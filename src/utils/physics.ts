import { PHYSICS } from '../constants';

export const checkBridgeSuccess = (
  bridgeLength: number,
  gapStart: number, // Distance from bridge pivot to start of next platform
  gapEnd: number    // Distance from bridge pivot to end of next platform
): { success: boolean, isBait: boolean, dropLengthError: number } => {
  if (bridgeLength >= gapStart && bridgeLength <= gapEnd) {
    return { success: true, isBait: false, dropLengthError: 0 };
  }

  const missDistanceStart = gapStart - bridgeLength; // >0 if too short
  const missDistanceEnd = bridgeLength - gapEnd;     // >0 if too long

  let isBait = false;
  let dropLengthError = 0;

  if (missDistanceStart > 0 && missDistanceStart <= PHYSICS.baitTolerance) {
    isBait = true;
    dropLengthError = -missDistanceStart; 
  } else if (missDistanceEnd > 0 && missDistanceEnd <= PHYSICS.baitTolerance) {
    isBait = true;
    dropLengthError = missDistanceEnd; 
  }

  return { 
    success: false, 
    isBait, 
    dropLengthError: dropLengthError || (missDistanceStart > 0 ? -missDistanceStart : missDistanceEnd) 
  };
};

export const generateNextPlatformGap = () => {
  const MathRnd = Math.random();
  const range = PHYSICS.platformMaxGap - PHYSICS.platformMinGap;
  return PHYSICS.platformMinGap + (MathRnd * range);
};
