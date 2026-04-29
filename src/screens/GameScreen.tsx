import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Animated, TouchableWithoutFeedback, Text, Easing, TouchableOpacity, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGameState } from '../hooks/useGameState';
import { checkBridgeSuccess, generateNextPlatformGap, getPlatformWidth } from '../utils/physics';
import { COLORS, PHYSICS as CONST_PHYSICS, SCREEN } from '../constants';
import { Platform } from '../components/Platform';
import { Bridge } from '../components/Bridge';
import { Character } from '../components/Character';

interface IParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  anim: Animated.Value;
  vx: number;
  vy: number;
}

const Particle = React.memo(({ particle }: { particle: IParticle }) => {
  const opacity = particle.anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const translateX = particle.anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, particle.vx],
  });

  const translateY = particle.anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, particle.vy],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          backgroundColor: particle.color,
          opacity,
          transform: [{ translateX }, { translateY }, { scale: opacity }],
        },
      ]}
    />
  );
});

const GameBackground = React.memo(({ totalPanX, shakeAnim, score }: { totalPanX: Animated.Value, shakeAnim: Animated.Value, score: number }) => {
  const backgroundColor = useAnimatedValueInterpolation(score);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor }]}>
      <Animated.View style={[styles.parallaxLayer, { transform: [{ translateX: Animated.multiply(totalPanX, 0.2) }, { translateX: shakeAnim }] }]}>
        <View style={[styles.cloud, { top: 100, left: 50, scaleX: 1.2 }]} />
        <View style={[styles.cloud, { top: 150, left: 300, scaleX: 0.8 }]} />
        <View style={[styles.cloud, { top: 250, left: 150 }]} />
      </Animated.View>

      <Animated.View style={[styles.parallaxLayer, { transform: [{ translateX: Animated.multiply(totalPanX, 0.5) }, { translateX: shakeAnim }] }]}>
        <View style={[styles.mountain, { left: -100, borderBottomWidth: 400, borderLeftWidth: 300, borderRightWidth: 300 }]} />
        <View style={[styles.mountain, { left: 250, borderBottomWidth: 300, borderLeftWidth: 200, borderRightWidth: 200, opacity: 0.8 }]} />
      </Animated.View>
    </Animated.View>
  );
});

export default function GameScreen({ onGoHome }: { onGoHome: () => void }) {
  const { 
    state, setState, score, highScore, setScore, 
    combo, setCombo, 
    startGame, startGrowing, stopGrowing,
    isPaused, togglePause, setIsPaused
  } = useGameState();

  const bridgeHeight = useRef(new Animated.Value(0)).current;
  const bridgeRotate = useRef(new Animated.Value(0)).current;
  const characterX = useRef(new Animated.Value(0)).current;
  const characterY = useRef(new Animated.Value(0)).current;
  const screenPanX = useRef(new Animated.Value(0)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;
  const perfectTextAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const totalPanX = useRef(new Animated.Value(0)).current;
  const [isBalancing, setIsBalancing] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);

  const [platforms, setPlatforms] = useState([
    { id: 1, x: 0, width: CONST_PHYSICS.platformWidthBase },
    { id: 2, x: 180, width: CONST_PHYSICS.platformWidthBase },
  ]);

  const [particles, setParticles] = useState<IParticle[]>([]);

  const bridgeRefHeight = useRef(0);
  const growInterval = useRef<NodeJS.Timeout | null>(null);

  // Menu animation
  useEffect(() => {
    if (state === 'menu') {
      Animated.loop(
        Animated.timing(menuAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      menuAnim.stopAnimation();
    }
  }, [state]);

  useEffect(() => {
    characterX.setValue(platforms[0].width - 20);
  }, []);

  const triggerParticles = useCallback((x: number, y: number, color: string, count = 8) => {
    const newParticles: IParticle[] = [];
    for (let i = 0; i < count; i++) {
      const anim = new Animated.Value(0);
      const id = Date.now() + i;
      const vx = (Math.random() - 0.5) * 100;
      const vy = (Math.random() - 0.7) * 150;
      
      newParticles.push({ id, x, y, color, anim, vx, vy });

      Animated.timing(anim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        setParticles((prev: IParticle[]) => prev.filter(p => p.id !== id));
      });
    }
    setParticles((prev: IParticle[]) => [...prev, ...newParticles]);
  }, []);

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    if (isPaused) return;
    if (state === 'menu') {
      startGame();
      return;
    }
    if (state === 'fail') {
      resetGame();
      return;
    }
    if (state !== 'idle') return;
    
    startGrowing();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    bridgeRefHeight.current = 0;
    bridgeHeight.setValue(0);
    bridgeRotate.setValue(0);
    characterY.setValue(0);

    growInterval.current = setInterval(() => {
      bridgeRefHeight.current += CONST_PHYSICS.bridgeGrowSpeed;
      bridgeHeight.setValue(bridgeRefHeight.current);
    }, 20);
  };

  const handlePressOut = () => {
    if (isPaused || state !== 'growing') return;
    if (growInterval.current) clearInterval(growInterval.current);
    stopGrowing();

    Animated.timing(bridgeRotate, {
      toValue: 90,
      duration: CONST_PHYSICS.dropAnimDuration,
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

    const { success, isPerfect, isBait } = checkBridgeSuccess(bridgeRefHeight.current, gapStart, gapEnd);

    if (success) {
      triggerParticles(
        currentPlatform.x + currentPlatform.width + bridgeRefHeight.current,
        SCREEN.height - SCREEN.platformHeight,
        isPerfect ? COLORS.perfect : COLORS.bridge,
        15
      );
      if (isPerfect) {
        // No shake on perfect to keep it smooth
      }
    }

    if (isBait) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    const walkTargetX = success 
      ? nextPlatform.x + nextPlatform.width - 20 
      : currentPlatform.x + currentPlatform.width + bridgeRefHeight.current;

    setState('walking');

    Animated.timing(characterX, {
      toValue: walkTargetX,
      duration: CONST_PHYSICS.characterWalkSpeed,
      useNativeDriver: true,
    }).start(() => {
      if (success) {
        if (isPerfect) {
          const newCombo = combo + 1;
          const scoreGain = 2 * newCombo;
          setCombo(newCombo);
          setScore(s => s + scoreGain);
          showPerfectText(scoreGain, newCombo);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
          setIsBalancing(true);
          setTimeout(() => {
            setIsBalancing(false);
            handleSuccess(nextPlatform, score + scoreGain);
          }, 800);

        } else {
          setCombo(0);
          setScore(s => s + 1);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          handleSuccess(nextPlatform, score + 1);
        }
      } else {
        setCombo(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        handleFail();
      }
    });
  };

  const [perfectInfo, setPerfectInfo] = useState({ gain: 0, combo: 0 });
  const showPerfectText = (gain: number, combo: number) => {
    setPerfectInfo({ gain, combo });
    perfectTextAnim.setValue(0);
    Animated.sequence([
      Animated.spring(perfectTextAnim, { 
        toValue: 1, 
        friction: 4,
        useNativeDriver: true 
      }),
      Animated.delay(800),
      Animated.timing(perfectTextAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const handleSuccess = (nextPlatform: any, currentScore: number) => {
    const panDistance = nextPlatform.x;
    
    Animated.parallel([
      Animated.timing(screenPanX, {
        toValue: -panDistance,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(totalPanX, {
        toValue: -panDistance,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start(() => {
      const newGap = generateNextPlatformGap(currentScore);
      const newWidth = getPlatformWidth(currentScore);
      
      const currentNext = platforms[1];
      setPlatforms([
        currentNext,
        { id: Date.now(), x: currentNext.x + currentNext.width + newGap, width: newWidth },
      ]);
      
      bridgeHeight.setValue(0);
      bridgeRotate.setValue(0);
      bridgeRefHeight.current = 0;
      setState('idle');
    });
  };

  const handleFail = () => {
    setState('fail');
    triggerShake();
    triggerParticles(
      platforms[0].width + bridgeRefHeight.current,
      SCREEN.height - SCREEN.platformHeight + 20,
      COLORS.character,
      20
    );

    Animated.timing(characterY, {
      toValue: -SCREEN.height,
      duration: CONST_PHYSICS.fallAnimDuration,
      useNativeDriver: true,
    }).start();
  };

  const resetGame = () => {
    state === 'fail' ? startGame() : null;
    
    // Stop any ongoing native animations to prevent character from disappearing or behaving erratically
    characterY.stopAnimation();
    characterX.stopAnimation();
    bridgeHeight.stopAnimation();
    bridgeRotate.stopAnimation();

    setPlatforms([
      { id: Date.now(), x: 0, width: CONST_PHYSICS.platformWidthBase },
      { id: Date.now() + 1, x: 180, width: CONST_PHYSICS.platformWidthBase },
    ]);
    screenPanX.setValue(0);
    totalPanX.setValue(0);
    
    // YENİ DÜZELTME: setValue bazı durumlarda Native Driver ile senkronize olmayabilir. 
    // Bu yüzden 0 değerine 0 saniyede gidecek bir animasyonla zorla güncelliyoruz.
    Animated.timing(characterY, { toValue: 0, duration: 0, useNativeDriver: true }).start();
    Animated.timing(characterX, { toValue: CONST_PHYSICS.platformWidthBase - 20, duration: 0, useNativeDriver: true }).start();
    
    bridgeHeight.setValue(0);
    bridgeRotate.setValue(0);
    bridgeRefHeight.current = 0;
  };

  const handleGoHomeRequest = () => {
    if (state === 'fail' || state === 'menu') {
      onGoHome();
    } else {
      setShowConfirmExit(true);
    }
  };

  const rotation = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles.container}>
        <GameBackground totalPanX={totalPanX} shakeAnim={shakeAnim} score={score} />
        
        {state !== 'menu' && state !== 'fail' && (
          <TouchableOpacity style={styles.pauseButton} onPress={togglePause} activeOpacity={0.7}>
            <Text style={styles.pauseButtonText}>{isPaused ? '▶' : '⏸'}</Text>
          </TouchableOpacity>
        )}

        <Animated.View style={[styles.gameArea, { transform: [{ translateX: screenPanX }, { translateX: shakeAnim }] }]}>
          {platforms.map((p, idx) => (
            <Platform 
              key={p.id} 
              leftPos={p.x} 
              width={p.width} 
              isTarget={idx === 1 && state === 'idle'} 
            />
          ))}

          <Bridge
            heightAnim={bridgeHeight}
            rotateAnim={bridgeRotate}
            leftOffset={platforms[0].x + platforms[0].width - 3} 
            bottomOffset={SCREEN.platformHeight}
          />

          <Character
            translateX={characterX}
            translateY={characterY}
            bottomOffset={SCREEN.platformHeight}
            isWalking={state === 'walking'}
            isBalancing={isBalancing}
          />

          {particles.map(p => (
            <Particle key={p.id} particle={p} />
          ))}
        </Animated.View>

        <View style={styles.header} pointerEvents="none">
          <Text style={styles.scoreText}>{score}</Text>
          <Text style={styles.bestScoreText}>BEST: {highScore}</Text>
        </View>

        <Animated.View style={[
          styles.perfectContainer, 
          { 
            opacity: perfectTextAnim, 
            transform: [
              { translateY: perfectTextAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -100] }) },
              { scale: perfectTextAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] }) }
            ] 
          }
        ]} pointerEvents="none">
          <Text style={styles.perfectText}>PERFECT! +{perfectInfo.gain}</Text>
          {perfectInfo.combo > 1 && (
            <Text style={styles.comboText}>Combo x{perfectInfo.combo}!</Text>
          )}
        </Animated.View>

        {state === 'menu' && (
          <View style={styles.menuOverlay}>
            <View style={[styles.scoreBoard, { backgroundColor: 'rgba(0,0,0,0.4)', borderColor: COLORS.perfect, borderWidth: 2 }]}>
              <Text style={styles.scoreBoardTitle}>BEST SCORE</Text>
              <Text style={styles.scoreBoardValue}>{highScore}</Text>
            </View>
            <View style={styles.startBadge} pointerEvents="none">
              <Animated.View style={[styles.rotatingCircle, { transform: [{ rotate: rotation }] }]}>
              </Animated.View>
              <Text style={styles.tapToStartText}>BAŞLAMAK İÇİN DOKUN</Text>
            </View>
          </View>
        )}

        {state === 'fail' && (
          <View style={styles.failOverlay}>
            <Text style={styles.gameOverText}>OYUN BİTTİ</Text>
            <View style={styles.scoreSummary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>SKOR</Text>
                <Text style={styles.summaryValue}>{score}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>REKOR</Text>
                <Text style={styles.summaryValue}>{highScore}</Text>
              </View>
            </View>
            <Text style={styles.restartText}>Tekrar Oynamak İçin Dokun</Text>
            
            <TouchableOpacity onPress={onGoHome} style={styles.failHomeButton}>
              <Text style={styles.failHomeButtonText}>Ana Menüye Dön</Text>
            </TouchableOpacity>
          </View>
        )}

        {isPaused && !showConfirmExit && (
          <View style={styles.pauseOverlay}>
            <Text style={styles.pauseTitle}>OYUN DURAKLATILDI</Text>
            
            <TouchableOpacity style={styles.pauseMenuButton} onPress={togglePause}>
              <Text style={styles.pauseMenuButtonText}>DEVAM ET</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.pauseMenuButton, styles.pauseMenuSecondaryButton]} onPress={handleGoHomeRequest}>
              <Text style={styles.pauseMenuSecondaryText}>ANA MENÜYE DÖN</Text>
            </TouchableOpacity>
          </View>
        )}

        {showConfirmExit && (
          <View style={styles.pauseOverlay}>
            <View style={styles.confirmBox}>
              <Text style={styles.confirmTitle}>EMİN MİSİNİZ?</Text>
              <Text style={styles.confirmText}>Mevcut ilerlemeniz kaybolacak.</Text>
              
              <TouchableOpacity style={styles.pauseMenuButton} onPress={() => setShowConfirmExit(false)}>
                <Text style={styles.pauseMenuButtonText}>İPTAL</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.pauseMenuButton, styles.pauseMenuSecondaryButton]} onPress={onGoHome}>
                <Text style={styles.pauseMenuSecondaryText}>ÇIK</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

function useAnimatedValueInterpolation(score: number) {
  const animatedScore = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedScore, {
      toValue: score,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [score]);

  return animatedScore.interpolate({
    inputRange: [0, 10, 20, 30, 40, 50, 60],
    outputRange: [
      '#F0F4F8', // Soft Day
      '#D1D9E6', // Cool Gray
      '#708090', // Slate Gray
      '#2C3E50', // Midnight Blue/Gray
      '#1A1A1A', // Near Black
      '#0A0A0A', // Deep Dark
      '#F0F4F8', // Back to Day
    ],
    extrapolate: 'clamp',
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 60,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  gameArea: {
    flex: 1,
  },
  pauseButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    zIndex: 100,
    backgroundColor: 'transparent',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButtonText: {
    color: '#333', // Grayish/Blackish for subtle look
    fontSize: 24,
    fontWeight: '900',
    opacity: 0.6, // Blend better with background
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  pauseTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 40,
    letterSpacing: 2,
  },
  confirmBox: {
    width: '85%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  confirmTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 15,
  },
  confirmText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 35,
  },
  pauseMenuButton: {
    backgroundColor: COLORS.perfect,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    width: 240,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  pauseMenuButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pauseMenuSecondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pauseMenuSecondaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  parallaxLayer: {
    position: 'absolute',
    width: '200%',
    height: '100%',
  },
  mountain: {
    position: 'absolute',
    bottom: SCREEN.platformHeight,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(0,0,0,0.11)',
  },
  cloud: {
    position: 'absolute',
    width: 100,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 100,
    fontWeight: '900',
    color: 'rgba(0,0,0,0.1)',
  },
  bestScoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.3)',
    marginTop: -10,
  },
  perfectContainer: {
    position: 'absolute',
    top: SCREEN.height / 2 - 150,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  perfectText: {
    fontSize: 44,
    fontWeight: '900',
    color: COLORS.perfect,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  comboText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.combo,
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  failOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  scoreBoard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  scoreBoardTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scoreBoardValue: {
    color: '#FFD700',
    fontSize: 42,
    fontWeight: '900',
  },
  startBadge: {
    alignItems: 'center',
  },
  rotatingCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: '#fff',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  tapToStartText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  gameOverText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 30,
  },
  scoreSummary: {
    flexDirection: 'row',
    marginBottom: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 30,
    borderRadius: 24,
    gap: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },
  restartText: {
    fontSize: 20,
    color: '#fff',
    backgroundColor: '#FF4500',
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 40,
    overflow: 'hidden',
    fontWeight: 'bold',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  failHomeButton: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  failHomeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 2,
    zIndex: 5,
  }
});
