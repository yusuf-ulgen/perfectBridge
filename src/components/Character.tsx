import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface CharacterProps {
  translateX: Animated.Value;
  translateY: Animated.Value;
  bottomOffset: number;
}

export const Character: React.FC<CharacterProps> = ({ translateX, translateY, bottomOffset }) => {
  return (
    <Animated.View
      style={[
        styles.character,
        {
          bottom: bottomOffset,
          transform: [
            { translateX: translateX },
            { translateY: translateY }
          ]
        }
      ]}
    />
  );
};

const styles = StyleSheet.create({
  character: {
    position: 'absolute',
    width: 20,
    height: 30,
    backgroundColor: COLORS.character,
    borderRadius: 4,
    zIndex: 20,
    left: 0,
  }
});
