import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface BridgeProps {
  heightAnim: Animated.Value;
  rotateAnim: Animated.Value;
  leftOffset: number;
  bottomOffset: number;
}

export const Bridge = React.memo(({ heightAnim, rotateAnim, leftOffset, bottomOffset }: BridgeProps) => {
  return (
    <Animated.View
      style={[
        styles.bridge,
        {
          left: leftOffset,
          bottom: bottomOffset,
          height: heightAnim,
          transformOrigin: 'bottom center', // Needs RN 0.73+
          transform: [
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 90],
                outputRange: ['0deg', '90deg']
              })
            }
          ]
        }
      ]}
    />
  );
});

const styles = StyleSheet.create({
  bridge: {
    position: 'absolute',
    width: 6,
    backgroundColor: COLORS.bridge,
    borderRadius: 3,
    zIndex: 10,
  }
});
