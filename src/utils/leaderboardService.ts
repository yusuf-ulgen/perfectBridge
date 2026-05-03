import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export interface LeaderboardEntry {
  nickname: string;
  score: number;
}

class LeaderboardService {
  private SUPABASE_URL = 'https://yrgujsunnzuokvgktelf.supabase.co';
  private SUPABASE_ANON_KEY = 'sb_publishable_RBDC6NguD19ZEVkn5kKSSw_0VA5K1di';
  private supabase = createClient(this.SUPABASE_URL, this.SUPABASE_ANON_KEY);

  async updateScore(score: number) {
    const nickname = await AsyncStorage.getItem('USER_NICKNAME');
    if (!nickname) return;

    try {
      const { error } = await this.supabase
        .from('leaderboard')
        .upsert({ nickname, score }, { onConflict: 'nickname' });

      if (error) console.error('Supabase update error:', error);
    } catch (e) {
      console.error('Failed to update score globally', e);
    }
  }

  async getTopScores(): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('leaderboard')
        .select('nickname, score')
        .order('score', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Supabase fetch error:', error);
        return [];
      }

      return data || [];
    } catch (e) {
      console.error('Failed to fetch leaderboard', e);
      return [];
    }
  }
}

export const leaderboardService = new LeaderboardService();
