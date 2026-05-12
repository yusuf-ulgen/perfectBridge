import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from '../constants';

const { width } = Dimensions.get('window');

interface TutorialOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export const TutorialOverlay = ({ visible, onClose }: TutorialOverlayProps) => {
  const bridgeHeight = useRef(new Animated.Value(0)).current;
  const bridgeRotate = useRef(new Animated.Value(0)).current;
  const characterX = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      startAnimation();
    }
  }, [visible]);

  const startAnimation = () => {
    bridgeHeight.setValue(0);
    bridgeRotate.setValue(0);
    characterX.setValue(40);

    Animated.sequence([
      Animated.delay(800),
      // Grow bridge
      Animated.timing(bridgeHeight, {
        toValue: 110,
        duration: 1200,
        useNativeDriver: false,
      }),
      Animated.delay(300),
      // Fall bridge
      Animated.timing(bridgeRotate, {
        toValue: 90,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.delay(300),
      // Walk character
      Animated.timing(characterX, {
        toValue: 160,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.delay(1500),
    ]).start(() => {
      if (visible) startAnimation();
    });
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <Text style={styles.title}>NASIL OYNANIR?</Text>
            <View style={styles.titleUnderline} />
          </View>

          <View style={styles.animationWrapper}>
            <View style={styles.animationContainer}>
              {/* Platform 1 */}
              <View style={[styles.platform, { left: 0, width: 50 }]} />

              {/* Platform 2 */}
              <View style={[styles.platform, { left: 150, width: 40 }]}>
                <View style={styles.perfectZone} />
              </View>

              {/* Bridge - Proper pivot at bottom */}
              <Animated.View
                style={[
                  styles.bridge,
                  {
                    left: 48,
                    height: bridgeHeight,
                    zIndex: 5,
                    transform: [
                      { translateY: bridgeHeight.interpolate({ inputRange: [0, 1000], outputRange: [0, 500] }) },
                      {
                        rotate: bridgeRotate.interpolate({
                          inputRange: [0, 180],
                          outputRange: ['0deg', '180deg']
                        })
                      },
                      { translateY: bridgeHeight.interpolate({ inputRange: [0, 1000], outputRange: [0, -500] }) }
                    ]
                  }
                ]}
              />

              {/* Character - Rendered on top */}
              <Animated.View style={[styles.character, { left: characterX, zIndex: 20 }]} />
            </View>

            <View style={styles.touchIndicator}>
              <Text style={styles.touchText}>BASILI TUT</Text>
              <View style={styles.touchCircle} />
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.instruction}>
              <Text style={{ color: COLORS.perfect, fontWeight: 'bold' }}>BASILI TUT:</Text> Köprüyü uzatır.
            </Text>
            <Text style={styles.instruction}>
              <Text style={{ color: '#FF4A4A', fontWeight: 'bold' }}>BIRAK:</Text> Köprüyü devirir.
            </Text>
            <Text style={[styles.instruction, { marginTop: 10, fontSize: 14, opacity: 0.8 }]}>
              Hedef platformun üzerine tam denk getirerek ilerle!
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }).start(onClose);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>ANLADIM, BAŞLA!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,
    backgroundColor: '#1E293B',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  titleUnderline: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.perfect,
    marginTop: 8,
    borderRadius: 2,
  },
  animationWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  animationContainer: {
    width: 200,
    height: 120,
    position: 'relative',
  },
  platform: {
    position: 'absolute',
    bottom: 0,
    height: 40,
    backgroundColor: COLORS.platform,
    borderRadius: 2,
  },
  perfectZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 16,
    height: 4,
    backgroundColor: COLORS.perfect,
  },
  character: {
    position: 'absolute',
    bottom: 40,
    width: 12,
    height: 20,
    backgroundColor: COLORS.character,
    borderRadius: 2,
    zIndex: 10,
  },
  bridge: {
    position: 'absolute',
    bottom: 40,
    width: 3,
    backgroundColor: COLORS.bridge,
    borderRadius: 1,
  },
  touchIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  touchText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  touchCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  infoContainer: {
    width: '100%',
    marginBottom: 35,
  },
  instruction: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 5,
  },
  button: {
    backgroundColor: COLORS.perfect,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: COLORS.perfect,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
