import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, BackHandler, ToastAndroid, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GameScreen from './src/screens/GameScreen';
import HomeScreen from './src/screens/HomeScreen';
import NicknameScreen from './src/screens/NicknameScreen';
import ReleaseNotesScreen from './src/screens/ReleaseNotesScreen';
import { checkShowReleaseNotes, markReleaseNotesAsShown } from './src/utils/updateManager';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'Loading' | 'Nickname' | 'Home' | 'Game' | 'ReleaseNotes'>('Loading');
  const [nickname, setNickname] = useState<string | null>(null);
  const [backPressCount, setBackPressCount] = useState(0);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Kullanıcı kaydı kontrolü
        const savedNickname = await AsyncStorage.getItem('USER_NICKNAME');
        
        // 2. Güncelleme notları kontrolü (Sadece güncellemeden sonra 1 kez gösterilir)
        const shouldShowNotes = await checkShowReleaseNotes();
        
        if (shouldShowNotes) {
          setCurrentScreen('ReleaseNotes');
          setNickname(savedNickname);
        } else if (savedNickname) {
          setNickname(savedNickname);
          setCurrentScreen('Home');
        } else {
          setCurrentScreen('Nickname');
        }
      } catch (e) {
        console.error('App initialization error:', e);
        setCurrentScreen('Nickname');
      }
    };
    initializeApp();
  }, []);

  const handleReleaseNotesContinue = async () => {
    await markReleaseNotesAsShown();
    if (nickname) {
      setCurrentScreen('Home');
    } else {
      setCurrentScreen('Nickname');
    }
  };

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
      {currentScreen === 'ReleaseNotes' && (
        <ReleaseNotesScreen onContinue={handleReleaseNotesContinue} />
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


