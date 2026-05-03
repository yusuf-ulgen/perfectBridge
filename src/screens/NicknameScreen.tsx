import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants';
import { leaderboardService } from '../utils/leaderboardService';

const { width } = Dimensions.get('window');

interface NicknameScreenProps {
  onComplete: (nickname: string) => void;
}

export default function NicknameScreen({ onComplete }: NicknameScreenProps) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (nickname.trim().length < 3) {
      setError('Nickname en az 3 karakter olmalı');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (nickname.trim().length > 15) {
      setError('Nickname en fazla 15 karakter olmalı');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await AsyncStorage.setItem('USER_NICKNAME', nickname.trim());
      
      // Also sync current high score to global leaderboard immediately
      const savedScore = await AsyncStorage.getItem('HIGH_SCORE');
      if (savedScore) {
        await leaderboardService.updateScore(parseInt(savedScore, 10));
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete(nickname.trim());
    } catch (e) {
      console.error('Failed to save nickname', e);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>HOŞ GELDİN!</Text>
        <Text style={styles.subtitle}>
          Rakiplerinin seni tanıması için bir nickname seç.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nickname girin..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={nickname}
            onChangeText={(text) => {
              setNickname(text);
              setError('');
            }}
            autoFocus
            maxLength={15}
            autoCapitalize="none"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>BAŞLA</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.backgroundDecorations}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  errorText: {
    color: '#FF4A4A',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    backgroundColor: COLORS.perfect,
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
    shadowColor: COLORS.perfect,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#1E293B',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  backgroundDecorations: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.05,
  },
  circle1: {
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: COLORS.perfect,
    top: -width * 0.4,
    left: -width * 0.2,
  },
  circle2: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: '#FF4A4A',
    bottom: -width * 0.2,
    right: -width * 0.2,
  },
});
