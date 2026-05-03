import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { leaderboardService } from '../utils/leaderboardService';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  onPlay: () => void;
}

export default function HomeScreen({ onPlay }: HomeScreenProps) {
  const [highScore, setHighScore] = useState(0);
  const [nickname, setNickname] = useState('');
  const [showStoryWarning, setShowStoryWarning] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedScore = await AsyncStorage.getItem('HIGH_SCORE');
        const savedNickname = await AsyncStorage.getItem('USER_NICKNAME');
        if (savedScore) setHighScore(parseInt(savedScore, 10));
        if (savedNickname) {
          setNickname(savedNickname);
          // Force sync current score to global DB if table exists
          if (savedScore) {
            leaderboardService.updateScore(parseInt(savedScore, 10));
          }
        }
      } catch (e) {
        console.error('Failed to load data', e);
      }
    };
    loadData();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const scores = await leaderboardService.getTopScores();
      setLeaderboard(scores);
    } catch (e) {
      console.error('Failed to fetch leaderboard', e);
    }
  };

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

  const handleStoryPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setShowStoryWarning(true);
    setTimeout(() => setShowStoryWarning(false), 2000);
  };

  const openLeaderboard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchLeaderboard();
    setIsLeaderboardVisible(true);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          style={styles.leaderboardTrigger}
          onPress={openLeaderboard}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="crown" size={32} color={COLORS.perfect} />
        </TouchableOpacity>
      </SafeAreaView>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Hoş geldin, <Text style={styles.nicknameText}>{nickname}</Text>
          </Text>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.titleLine1}>PERFECT</Text>
          <Text style={styles.titleLine2}>BRIDGE</Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>REKORUN</Text>
          <Text style={styles.scoreValue}>{highScore}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity activeOpacity={0.8} onPress={handlePlayPress} style={styles.mainButtonWrapper}>
            <Animated.View style={[styles.playButton, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.playButtonText}>SONSUZ MOD</Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={handleStoryPress} style={styles.storyButton}>
            <Text style={styles.storyButtonText}>HİKAYE MODU</Text>
            {showStoryWarning && (
              <View style={styles.warningBadge}>
                <Text style={styles.warningText}>Yakında!</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Leaderboard Modal */}
      <Modal
        visible={isLeaderboardVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLeaderboardVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>LİDERLİK TABLOSU</Text>
              <TouchableOpacity onPress={() => setIsLeaderboardVisible(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {leaderboard.length === 0 ? (
                <Text style={styles.emptyText}>Yükleniyor veya henüz rekor yok...</Text>
              ) : (
                leaderboard.map((item, index) => (
                  <View key={index} style={styles.leaderboardItem}>
                    <View style={styles.rankBadge}>
                      <Text style={[styles.rankText, index < 3 && styles.topRankText]}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </Text>
                    </View>
                    <Text style={styles.leaderNickname}>{item.nickname}</Text>
                    <Text style={styles.leaderScore}>{item.score}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  safeArea: {
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 20,
  },
  leaderboardTrigger: {
    alignSelf: 'flex-end',
    marginTop: 50, // Increased from 20
    marginRight: 20,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  header: {
    position: 'absolute',
    top: -60, // Moved down from -100
    alignItems: 'center',
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '600',
  },
  nicknameText: {
    color: COLORS.perfect,
    fontWeight: '900',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
    color: COLORS.perfect,
    letterSpacing: 2,
    marginTop: -10,
    textShadowColor: 'rgba(255, 215, 0, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15,
  },
  scoreContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scoreTitle: {
    color: 'rgba(255,255,255,0.5)',
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
  buttonContainer: {
    width: '80%',
    gap: 20,
  },
  mainButtonWrapper: {
    width: '100%',
  },
  playButton: {
    backgroundColor: '#FF4A4A',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#FF4A4A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  storyButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  storyButtonText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  warningBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: COLORS.perfect,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    transform: [{ rotate: '15deg' }],
  },
  warningText: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: height * 0.7,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalScroll: {
    flex: 1,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  rankBadge: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '900',
  },
  topRankText: {
    fontSize: 20,
  },
  leaderNickname: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
  },
  leaderScore: {
    color: COLORS.perfect,
    fontSize: 20,
    fontWeight: '900',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    fontStyle: 'italic',
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
