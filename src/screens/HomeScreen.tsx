import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  onPlay: () => void;
}

export default function HomeScreen({ onPlay }: HomeScreenProps) {
  const [highScore, setHighScore] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const savedRaw = await AsyncStorage.getItem('HIGH_SCORE');
        if (savedRaw) {
          setHighScore(parseInt(savedRaw, 10));
        }
      } catch (e) {
        console.error('Failed to load high score', e);
      }
    };
    loadHighScore();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.parallel([
      Animated.spring(slideUpAnim, {
        toValue: 0,
        tension: 20,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handlePlayPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPlay();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleLine1}>PERFECT</Text>
          <Text style={styles.titleLine2}>BRIDGE</Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>BEST SCORE</Text>
          <Text style={styles.scoreValue}>{highScore}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={handlePlayPress}>
          <Animated.View style={[styles.playButton, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.playButtonText}>OYNA</Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.backgroundDecorations}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B', // Modern dark slate
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  titleLine1: {
    fontSize: 52,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  titleLine2: {
    fontSize: 68,
    fontWeight: '900',
    color: COLORS.perfect, // Gold/Yellow
    letterSpacing: 2,
    marginTop: -10,
    textShadowColor: 'rgba(255, 215, 0, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15,
  },
  scoreContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
  },
  scoreTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  scoreValue: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '900',
  },
  playButton: {
    backgroundColor: '#FF4A4A', // Vibrant red for contrast
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 50,
    elevation: 8,
    shadowColor: '#FF4A4A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  backgroundDecorations: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  circle1: {
    width: width * 1.5,
    height: width * 1.5,
    backgroundColor: COLORS.perfect,
    top: -width * 0.5,
    left: -width * 0.25,
  },
  circle2: {
    width: width,
    height: width,
    backgroundColor: '#FF4A4A',
    bottom: -width * 0.3,
    right: -width * 0.3,
  },
});
