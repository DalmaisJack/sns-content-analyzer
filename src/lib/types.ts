export type Platform = 'TikTok' | 'Reels' | 'Shorts' | 'X' | 'Threads' | 'LinkedIn';
export type Locale = 'en' | 'ja';

export const PLATFORM_CHAR_LIMITS: Record<Platform, number> = {
  TikTok: 2200,
  Reels: 2200,
  Shorts: 5000,
  X: 280,
  Threads: 500,
  LinkedIn: 3000,
};

export interface Improvement {
  title: string;
  detail: string;
}

export interface AnalyzeResult {
  buzzScore: number;
  hookScore: number;
  emotionScore: number;
  hooks: string[];
  hashtags: string[];
  improvements: Improvement[];
}
