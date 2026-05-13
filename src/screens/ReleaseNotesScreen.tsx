import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { APP_RELEASE_NOTES } from '../utils/releaseNotes';

const { width } = Dimensions.get('window');

interface ReleaseNotesScreenProps {
  onContinue: () => void;
}

export default function ReleaseNotesScreen({ onContinue }: ReleaseNotesScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1E293B', '#0F172A']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="rocket-outline" size={40} color="#38BDF8" />
          </View>
          <Text style={styles.title}>Yenilikler</Text>
          <Text style={styles.version}>Sürüm {APP_RELEASE_NOTES.version}</Text>
        </View>

        <ScrollView 
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>
              {APP_RELEASE_NOTES.notes}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={onContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#38BDF8', '#0284C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Devam Et</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  version: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  notesCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  notesText: {
    fontSize: 17,
    lineHeight: 28,
    color: '#CBD5E1',
    letterSpacing: 0.3,
  },
  footer: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  button: {
    width: '100%',
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 10,
  },
});
