import React from 'react';
import { StyleSheet, Animated } from 'react-native';
import { COLORS, SCREEN } from '../constants';

interface PlatformProps {
  // Can be a number or an animated interpolation if the screen moves
  leftPos: number | Animated.AnimatedInterpolation<number>;
  width: number;
}

export const Platform: React.FC<PlatformProps> = ({ leftPos, width }) => {
  return (
    <Animated.View
      style={[
        styles.platform,
        {
          left: leftPos,
          width: width,
        }
      ]}
    />
  );
};

const styles = StyleSheet.create({
  platform: {
    position: 'absolute',
    bottom: 0,
    height: SCREEN.platformHeight,
    backgroundColor: COLORS.platform,
  }
});
