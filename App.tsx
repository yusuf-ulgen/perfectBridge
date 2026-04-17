import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, BackHandler, ToastAndroid, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import GameScreen from './src/screens/GameScreen';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'Home' | 'Game'>('Home');
  const [backPressCount, setBackPressCount] = useState(0);

  useEffect(() => {
    const backAction = () => {
      if (currentScreen === 'Game') {
        setCurrentScreen('Home');
        return true; // prevent default behavior (exit app)
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
        return false; // Exit app on second pressing
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [currentScreen, backPressCount]);

  return (
    <View style={styles.container}>
      {currentScreen === 'Home' ? (
        <HomeScreen onPlay={() => setCurrentScreen('Game')} />
      ) : (
        <GameScreen onGoHome={() => setCurrentScreen('Home')} />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
