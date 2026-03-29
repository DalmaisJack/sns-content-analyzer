import type { Locale } from './types';

const translations = {
  en: {
    title: 'SNS Content Analyzer',
    subtitle: 'Optimize your short-form video content with AI',
    placeholder: "Paste your caption or video script here...\n\nExample: POV: You tried this one weird trick and it actually worked! 🤯 Comment below if you've done this too!",
    analyzeBtn: 'Analyze',
    analyzing: 'Analyzing...',
    charCount: (n: number) => `${n} chars`,
    charLimit: (limit: number) => `/ ${limit.toLocaleString()} limit`,
    overLimit: 'Over limit',
    beforeLabel: 'Before',
    afterLabel: 'After (Hook #1)',
    sections: {
      hooks: 'Hook Alternatives',
      improvements: 'Improvement Tips',
      hashtags: 'Recommended Hashtags',
      beforeAfter: 'Before / After',
    },
    scores: {
      buzz: 'Buzz',
      hook: 'Hook',
      emotion: 'Emotion',
    },
    errors: {
      empty: 'Please enter some content to analyze.',
      api: 'Analysis failed. Please try again.',
      erLimit: 'Rate limit exceeded',
    },
    langToggle: '日本語',
    footer: 'Powered by Claude Opus 4.6',
    copy: 'Copy',
    copied: 'Copied!',
  },
  ja: {
    title: 'SNSコンテンツアナライザー',
    subtitle: 'AIで短尺動画コンテンツを最適化しよう',
    placeholder: 'キャプションや動画スクリプトをここに貼り付けてください...\n\n例：POV: この裏技を試したら本当に効いた！🤯 やったことある人はコメントして！',
    analyzeBtn: '分析する',
    analyzing: '分析中...',
    charCount: (n: number) => `${n}文字`,
    charLimit: (limit: number) => `/ ${limit.toLocaleString()}文字制限`,
    overLimit: '制限超過',
    beforeLabel: '修正前',
    afterLabel: '修正後（フック#1）',
    sections: {
      hooks: 'フック代替案',
      improvements: '改善のヒント',
      hashtags: 'おすすめハッシュタグ',
      beforeAfter: '修正前 / 修正後',
    },
    scores: {
      buzz: 'バズ',
      hook: 'フック',
      emotion: '感情',
    },
    errors: {
      empty: '分析するコンテンツを入力してください。',
      api: '分析に失敗しました。もう一度お試しください。',
      erLimit: '制限超過',
    },
    langToggle: 'English',
    footer: 'Claude Opus 4.6 搭載',
    copy: 'コピー',
    copied: 'コピー済み！',
  },
} as const;

export type Translations = typeof translations['en'];

export function t(locale: Locale): Translations {
  return translations[locale] as Translations;
}
