import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants';

interface CharacterProps {
  translateX: Animated.Value;
  translateY: Animated.Value;
  bottomOffset: number;
  isWalking?: boolean;
  isBalancing?: boolean;
}

export const Character = React.memo(({ translateX, translateY, bottomOffset, isWalking, isBalancing }: CharacterProps) => {
  const bobAnim = useRef(new Animated.Value(0)).current;
  const legAnim = useRef(new Animated.Value(0)).current;
  const armAnim = useRef(new Animated.Value(0)).current;
  const victoryJumpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isWalking) {
      // Reset victory if it was active
      victoryJumpAnim.setValue(0);

      // Bobbing up and down while running
      Animated.loop(
        Animated.sequence([
          Animated.timing(bobAnim, { toValue: -4, duration: 150, useNativeDriver: true }),
          Animated.timing(bobAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        ])
      ).start();

      // Leg swing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(legAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(legAnim, { toValue: -1, duration: 150, useNativeDriver: true }),
        ])
      ).start();

      // Arm swing animation (opposite of legs)
      Animated.loop(
        Animated.sequence([
          Animated.timing(armAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(armAnim, { toValue: -1, duration: 150, useNativeDriver: true }),
        ])
      ).start();
    } else if (!isBalancing) {
      bobAnim.setValue(0);
      legAnim.setValue(0);
      armAnim.setValue(0);
      victoryJumpAnim.setValue(0);
    }
  }, [isWalking, isBalancing]);

  useEffect(() => {
    if (isBalancing) {
      // Victory animation: Jump up and raise arms
      Animated.sequence([
        Animated.parallel([
          // Jump
          Animated.sequence([
            Animated.timing(victoryJumpAnim, { toValue: -20, duration: 200, useNativeDriver: true }),
            Animated.timing(victoryJumpAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]),
          // Arms Up
          Animated.timing(armAnim, { toValue: 2, duration: 200, useNativeDriver: true }),
        ]),
        // Hold arms for a bit then reset
        Animated.delay(200),
        Animated.timing(armAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isBalancing]);

  const leftLegRotate = legAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-30deg', '30deg'],
  });

  const rightLegRotate = legAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['30deg', '-30deg'],
  });

  // armAnim: -1 to 1 is running, 2 is arms up (victory)
  const leftArmRotate = armAnim.interpolate({
    inputRange: [-1, 1, 2],
    outputRange: ['40deg', '-40deg', '-150deg'],
  });

  const rightArmRotate = armAnim.interpolate({
    inputRange: [-1, 1, 2],
    outputRange: ['-40deg', '40deg', '150deg'],
  });

  return (
    <Animated.View
      style={[
        styles.characterContainer,
        {
          bottom: bottomOffset,
          transform: [
            { translateX: translateX },
            { translateY: Animated.add(Animated.add(translateY, bobAnim), victoryJumpAnim) },
          ]
        }
      ]}
    >
      {/* Legs - Back leg */}
      <Animated.View style={[styles.leg, styles.rightLeg, { opacity: 0.7, transform: [{ rotate: rightLegRotate }] }]} />

      {/* Torso */}
      <View style={styles.torso} />
      
      {/* Head */}
      <View style={styles.head} />

      {/* Arms - Back arm */}
      <Animated.View style={[styles.arm, styles.rightArm, { opacity: 0.7, transform: [{ rotate: rightArmRotate }] }]} />

      {/* Legs - Front leg */}
      <Animated.View style={[styles.leg, styles.leftLeg, { transform: [{ rotate: leftLegRotate }] }]} />

      {/* Arms - Front arm */}
      <Animated.View style={[styles.arm, styles.leftArm, { transform: [{ rotate: leftArmRotate }] }]} />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  characterContainer: {
    position: 'absolute',
    width: 24,
    height: 42,
    zIndex: 20,
    left: -2,
    alignItems: 'center',
  },
  head: {
    position: 'absolute',
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.character,
  },
  torso: {
    position: 'absolute',
    top: 11,
    width: 10,
    height: 18,
    borderRadius: 3,
    backgroundColor: COLORS.character,
  },
  arm: {
    position: 'absolute',
    top: 13,
    width: 4,
    height: 14,
    backgroundColor: COLORS.character,
    borderRadius: 2,
  },
  leftArm: {
    left: 4,
    transformOrigin: 'top',
  },
  rightArm: {
    right: 4,
    transformOrigin: 'top',
  },
  leg: {
    position: 'absolute',
    top: 27,
    width: 5,
    height: 16,
    backgroundColor: COLORS.character,
    borderRadius: 2,
  },
  leftLeg: {
    left: 7,
    transformOrigin: 'top',
  },
  rightLeg: {
    right: 7,
    transformOrigin: 'top',
  },
});



