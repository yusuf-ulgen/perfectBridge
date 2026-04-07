import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface CharacterProps {
  translateX: Animated.Value;
  translateY: Animated.Value;
  bottomOffset: number;
  isWalking?: boolean;
  isBalancing?: boolean;
}

export const Character = React.memo(({ translateX, translateY, bottomOffset, isWalking, isBalancing }: CharacterProps) => {
  const bobAnim = React.useRef(new Animated.Value(0)).current;
  const tiltAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isWalking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bobAnim, { toValue: -5, duration: 150, useNativeDriver: true }),
          Animated.timing(bobAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        ])
      ).start();
    } else {
      bobAnim.setValue(0);
    }
  }, [isWalking]);

  React.useEffect(() => {
    if (isBalancing) {
      Animated.sequence([
        Animated.timing(tiltAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(tiltAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(tiltAnim, { toValue: 5, duration: 60, useNativeDriver: true }),
        Animated.timing(tiltAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [isBalancing]);

  return (
    <Animated.View
      style={[
        styles.character,
        {
          bottom: bottomOffset,
          transform: [
            { translateX: translateX },
            { translateY: Animated.add(translateY, bobAnim) },
            { rotate: tiltAnim.interpolate({ inputRange: [-10, 10], outputRange: ['-15deg', '15deg'] }) }
          ]
        }
      ]}
    />
  );
});

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
