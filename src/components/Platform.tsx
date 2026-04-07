import React from 'react';
import { StyleSheet, Animated } from 'react-native';
import { COLORS, SCREEN } from '../constants';

interface PlatformProps {
  leftPos: number | Animated.AnimatedInterpolation<number>;
  width: number;
  isTarget?: boolean;
}

export const Platform: React.FC<PlatformProps> = ({ leftPos, width, isTarget }) => {
  return (
    <Animated.View
      style={[
        styles.platform,
        {
          left: leftPos,
          width: width,
        }
      ]}
    >
      {isTarget && (
        <View style={styles.perfectZone} />
      )}
      <View style={styles.topHighlight} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  platform: {
    position: 'absolute',
    bottom: 0,
    height: SCREEN.platformHeight,
    backgroundColor: COLORS.platform,
  },
  perfectZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 10,
    height: 4,
    backgroundColor: COLORS.perfect,
    borderRadius: 2,
    shadowColor: COLORS.perfect,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  }
});
