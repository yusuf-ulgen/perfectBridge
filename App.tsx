import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, BackHandler, ToastAndroid, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GameScreen from './src/screens/GameScreen';
import HomeScreen from './src/screens/HomeScreen';
import NicknameScreen from './src/screens/NicknameScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'Loading' | 'Nickname' | 'Home' | 'Game'>('Loading');
  const [nickname, setNickname] = useState<string | null>(null);
  const [backPressCount, setBackPressCount] = useState(0);

  useEffect(() => {
    const checkNickname = async () => {
      try {
        const savedNickname = await AsyncStorage.getItem('USER_NICKNAME');
        if (savedNickname) {
          setNickname(savedNickname);
          setCurrentScreen('Home');
        } else {
          setCurrentScreen('Nickname');
        }
      } catch (e) {
        console.error('Failed to check nickname', e);
        setCurrentScreen('Nickname');
      }
    };
    checkNickname();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (currentScreen === 'Game') {
        setCurrentScreen('Home');
        return true;
      }

      if (currentScreen === 'Home') {
        if (backPressCount === 0) {
          setBackPressCount(1);
          if (Platform.OS === 'android') {
            ToastAndroid.show('Çıkmak için tekrar geriye basın', ToastAndroid.SHORT);
          }
          setTimeout(() => setBackPressCount(0), 2000);
          return true;
        }
        return false;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [currentScreen, backPressCount]);

  if (currentScreen === 'Loading') {
    return <View style={[styles.container, { backgroundColor: '#1E293B' }]} />;
  }

  return (
    <View style={styles.container}>
      {currentScreen === 'Nickname' && (
        <NicknameScreen onComplete={(name) => {
          setNickname(name);
          setCurrentScreen('Home');
        }} />
      )}
      {currentScreen === 'Home' && (
        <HomeScreen onPlay={() => setCurrentScreen('Game')} />
      )}
      {currentScreen === 'Game' && (
        <GameScreen onGoHome={() => setCurrentScreen('Home')} />
      )}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
