import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Animated, TouchableWithoutFeedback, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGameState } from '../hooks/useGameState';
import { checkBridgeSuccess, generateNextPlatformGap } from '../utils/physics';
import { COLORS, PHYSICS, SCREEN } from '../constants';
import { Platform } from '../components/Platform';
import { Bridge } from '../components/Bridge';
import { Character } from '../components/Character';

export default function GameScreen() {
  const { state, setState, score, setScore, startGrowing, stopGrowing } = useGameState();

  const bridgeHeight = useRef(new Animated.Value(0)).current;
  const bridgeRotate = useRef(new Animated.Value(0)).current;
  const characterX = useRef(new Animated.Value(0)).current;
  const characterY = useRef(new Animated.Value(0)).current;
  const screenPanX = useRef(new Animated.Value(0)).current;

  const [platforms, setPlatforms] = useState([
    { id: 1, x: 0, width: PHYSICS.platformWidth },
    { id: 2, x: PHYSICS.platformWidth + 120, width: PHYSICS.platformWidth },
  ]);

  const bridgeRefHeight = useRef(0);
  const growInterval = useRef<NodeJS.Timeout | null>(null);

  const characterStartX = PHYSICS.platformWidth - 20;

  useEffect(() => {
    characterX.setValue(characterStartX);
  }, []);

  const handlePressIn = () => {
    if (state !== 'idle') return;
    startGrowing();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    bridgeRefHeight.current = 0;
    bridgeHeight.setValue(0);
    bridgeRotate.setValue(0);
    characterY.setValue(0);

    growInterval.current = setInterval(() => {
      bridgeRefHeight.current += PHYSICS.bridgeGrowSpeed;
      bridgeHeight.setValue(bridgeRefHeight.current);
    }, 20);
  };

  const handlePressOut = () => {
    if (state !== 'growing') return;
    if (growInterval.current) clearInterval(growInterval.current);
    stopGrowing();

    Animated.timing(bridgeRotate, {
      toValue: 90,
      duration: PHYSICS.dropAnimDuration,
      useNativeDriver: false,
    }).start(() => {
      evaluateBridge();
    });
  };

  const evaluateBridge = () => {
    setState('evaluating');
    const currentPlatform = platforms[0];
    const nextPlatform = platforms[1];

    const gapStart = nextPlatform.x - (currentPlatform.x + currentPlatform.width);
    const gapEnd = gapStart + nextPlatform.width;

    const { success, isBait } = checkBridgeSuccess(bridgeRefHeight.current, gapStart, gapEnd);

    if (isBait) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    const walkTargetX = success 
      ? nextPlatform.x + nextPlatform.width - 20 
      : currentPlatform.x + currentPlatform.width + bridgeRefHeight.current;

    setState('walking');

    Animated.timing(characterX, {
      toValue: walkTargetX,
      duration: PHYSICS.characterWalkSpeed,
      useNativeDriver: false,
    }).start(() => {
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setScore(score + 1);
        handleSuccess(nextPlatform);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        handleFail();
      }
    });
  };

  const handleSuccess = (nextPlatform: any) => {
    const panDistance = nextPlatform.x;
    
    Animated.timing(screenPanX, {
      toValue: -panDistance,
      duration: 400,
      useNativeDriver: false,
    }).start(() => {
      const newGap = generateNextPlatformGap();
      setPlatforms([
        { id: platforms[1].id, x: 0, width: PHYSICS.platformWidth },
        { id: platforms[1].id + 1, x: PHYSICS.platformWidth + newGap, width: PHYSICS.platformWidth },
      ]);
      
      screenPanX.setValue(0);
      characterX.setValue(characterStartX);
      bridgeHeight.setValue(0);
      bridgeRotate.setValue(0);
      bridgeRefHeight.current = 0;
      setState('idle');
    });
  };

  const handleFail = () => {
    setState('fail');
    Animated.timing(characterY, {
      toValue: -SCREEN.height,
      duration: PHYSICS.fallAnimDuration,
      useNativeDriver: false,
    }).start();
  };

  const resetGame = () => {
    setScore(0);
    setPlatforms([
      { id: Date.now(), x: 0, width: PHYSICS.platformWidth },
      { id: Date.now() + 1, x: PHYSICS.platformWidth + 120, width: PHYSICS.platformWidth },
    ]);
    screenPanX.setValue(0);
    characterX.setValue(characterStartX);
    characterY.setValue(0);
    bridgeHeight.setValue(0);
    bridgeRotate.setValue(0);
    setState('idle');
  };

  const currentPlatformEdge = platforms[0].x + platforms[0].width;

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={state === 'fail' ? resetGame : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.scoreText}>{score}</Text>

        {state === 'fail' && (
          <Text style={styles.restartText}>Tekrar Oynamak İçin Dokun</Text>
        )}

        <Animated.View style={[styles.gameArea, { transform: [{ translateX: screenPanX }] }]}>
          {platforms.map(p => (
            <Platform key={p.id} leftPos={p.x} width={p.width} />
          ))}

          <Bridge
            heightAnim={bridgeHeight}
            rotateAnim={bridgeRotate}
            leftOffset={currentPlatformEdge - 3} 
            bottomOffset={SCREEN.platformHeight}
          />

          <Character
            translateX={characterX}
            translateY={characterY}
            bottomOffset={SCREEN.platformHeight}
          />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gameArea: {
    flex: 1,
  },
  scoreText: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    fontSize: 70,
    fontWeight: 'bold',
    color: '#333',
    zIndex: 100,
  },
  restartText: {
    position: 'absolute',
    top: 220,
    alignSelf: 'center',
    fontSize: 22,
    color: '#FF4500',
    fontWeight: 'bold',
    zIndex: 100,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    overflow: 'hidden',
  }
});
