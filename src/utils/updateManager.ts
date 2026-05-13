import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { APP_RELEASE_NOTES } from './releaseNotes';

const LAST_SHOWN_NOTES_VERSION = '@last_shown_notes_version';

export const getCurrentVersion = () => {
  return Constants.expoConfig?.version || '1.0.0';
};

export const checkShowReleaseNotes = async () => {
  try {
    const lastShownVersion = await AsyncStorage.getItem(LAST_SHOWN_NOTES_VERSION);
    const currentNotesVersion = APP_RELEASE_NOTES.version;

    if (lastShownVersion !== currentNotesVersion) {
      return true;
    }
  } catch (error) {
    console.error("Release notes check error:", error);
  }
  return false;
};

export const markReleaseNotesAsShown = async () => {
  try {
    await AsyncStorage.setItem(LAST_SHOWN_NOTES_VERSION, APP_RELEASE_NOTES.version);
  } catch (error) {
    console.error("Release notes save error:", error);
  }
};

