'use client';

import { useState } from 'react';
import ResultPanel from '@/components/ResultPanel';
import { t } from '@/lib/i18n';
import { PLATFORM_CHAR_LIMITS } from '@/lib/types';
import type { AnalyzeResult, Locale, Platform } from '@/lib/types';

const PLATFORMS: Platform[] = ['TikTok', 'Reels', 'Shorts', 'X', 'Threads', 'LinkedIn'];

export default function Home() {
  const [locale, setLocale] = useState<Locale>('en');
  const [platform, setPlatform] = useState<Platform>('TikTok');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState('');

  const tx = t(locale);
  const charLimit = PLATFORM_CHAR_LIMITS[platform];
  const isOverLimit = caption.length > charLimit;

  const toggleLocale = () => {
    setLocale((prev) => (prev === 'en' ? 'ja' : 'en'));
    setResult(null);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!caption.trim()) {
      setError(tx.errors.empty);
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption, platform, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? tx.errors.api);
      setResult(data as AnalyzeResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : tx.errors.api);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span className="text-sm font-bold text-white">{tx.title}</span>
          </div>
          <button
            onClick={toggleLocale}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 transition-colors text-gray-300"
          >
            {tx.langToggle}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            {tx.title}
          </h1>
          <p className="text-sm text-gray-400">{tx.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Input */}
          <div className="space-y-4">

            {/* Platform pills — scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setPlatform(p); setResult(null); setError(''); }}
                  className={`flex-shrink-0 py-1.5 px-4 rounded-full text-xs font-semibold transition-all ${
                    platform === p
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-white/10 text-gray-400 hover:bg-white/15 hover:text-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={tx.placeholder}
                rows={10}
                className={`w-full rounded-2xl bg-white/5 px-4 py-3 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none transition-all ring-1 ${
                  isOverLimit
                    ? 'ring-red-500 focus:ring-red-400'
                    : 'ring-white/10 focus:ring-purple-500'
                }`}
              />
              {/* Char count / limit */}
              <div className="flex justify-end mt-1 gap-1 text-xs">
                <span className={isOverLimit ? 'text-red-400 font-semibold' : 'text-gray-500'}>
                  {isOverLimit ? tx.overLimit + ' · ' : ''}{tx.charCount(caption.length)}
                </span>
                <span className="text-gray-700">{tx.charLimit(charLimit)}</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 bg-red-950/30 rounded-xl px-4 py-2 ring-1 ring-red-500/30">
                {error}
              </p>
            )}

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white transition-all shadow-lg shadow-purple-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  {tx.analyzing}
                </span>
              ) : (
                tx.analyzeBtn
              )}
            </button>
          </div>

          {/* Right: Results */}
          <div>
            {(loading || result) ? (
              <ResultPanel
                result={result}
                loading={loading}
                locale={locale}
                caption={caption}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 text-gray-700">
                <div className="text-5xl mb-3">📊</div>
                <p className="text-sm">{tx.analyzeBtn} →</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-700 border-t border-white/5">
        {tx.footer}
      </footer>
    </div>
  );
}
