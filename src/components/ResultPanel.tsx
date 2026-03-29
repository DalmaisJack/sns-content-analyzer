'use client';

import { useState } from 'react';
import ScoreCard from './ScoreCard';
import ScoreRadar, { ScoreRadarSkeleton } from './ScoreRadar';
import { t } from '@/lib/i18n';
import type { AnalyzeResult, Locale } from '@/lib/types';

interface ResultPanelProps {
  result: AnalyzeResult | null;
  loading: boolean;
  locale: Locale;
  caption: string;
}

export default function ResultPanel({ result, loading, locale, caption }: ResultPanelProps) {
  const tx = t(locale);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyHook = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 fade-in">
        {/* Scores + Radar skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid grid-cols-1 gap-3">
            <ScoreCard label="" value={0} color="purple" skeleton />
            <ScoreCard label="" value={0} color="blue" skeleton />
            <ScoreCard label="" value={0} color="pink" skeleton />
          </div>
          <ScoreRadarSkeleton />
        </div>
        <SkeletonBlock lines={2} />
        <SkeletonBlock lines={3} />
        <SkeletonBlock lines={2} />
        <SkeletonBlock lines={1} />
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-4 fade-in">

      {/* Scores + Radar — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 gap-3">
          <ScoreCard label={tx.scores.buzz}    value={result.buzzScore}    color="purple" />
          <ScoreCard label={tx.scores.hook}    value={result.hookScore}    color="blue" />
          <ScoreCard label={tx.scores.emotion} value={result.emotionScore} color="pink" />
        </div>
        <ScoreRadar
          buzzScore={result.buzzScore}
          hookScore={result.hookScore}
          emotionScore={result.emotionScore}
          labels={{ buzz: tx.scores.buzz, hook: tx.scores.hook, emotion: tx.scores.emotion }}
        />
      </div>

      {/* Before / After */}
      <div className="rounded-2xl p-5 bg-white/5 ring-1 ring-white/10">
        <p className="text-sm font-semibold text-white mb-3">{tx.sections.beforeAfter}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="border-l-2 border-gray-500 pl-3">
            <p className="text-xs text-gray-400 mb-1">{tx.beforeLabel}</p>
            <p className="text-xs text-gray-300 leading-relaxed line-clamp-6 whitespace-pre-wrap">
              {caption || '—'}
            </p>
          </div>
          <div className="border-l-2 border-purple-500 pl-3">
            <p className="text-xs text-purple-400 mb-1">{tx.afterLabel}</p>
            <p className="text-xs text-gray-200 leading-relaxed">
              {result.hooks[0] ?? '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Hook Alternatives */}
      <div className="rounded-2xl p-5 bg-white/5 ring-1 ring-white/10">
        <p className="text-sm font-semibold text-white mb-3">{tx.sections.hooks}</p>
        <ul className="space-y-2">
          {result.hooks.map((hook, i) => (
            <li key={i} className="flex gap-3 items-start border-l-2 border-purple-500 pl-3">
              <p className="flex-1 text-sm text-gray-200 leading-relaxed">{hook}</p>
              <button
                onClick={() => copyHook(hook, i)}
                className="flex-shrink-0 text-xs text-gray-500 hover:text-purple-400 transition-colors"
              >
                {copiedIndex === i ? tx.copied : tx.copy}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Improvements */}
      <div className="rounded-2xl p-5 bg-white/5 ring-1 ring-white/10">
        <p className="text-sm font-semibold text-white mb-3">{tx.sections.improvements}</p>
        <div className="space-y-3">
          {result.improvements.map((tip, i) => (
            <div key={i}>
              <p className="text-sm font-semibold text-amber-300">{tip.title}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{tip.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hashtags */}
      <div className="rounded-2xl p-5 bg-white/5 ring-1 ring-white/10">
        <p className="text-sm font-semibold text-white mb-3">{tx.sections.hashtags}</p>
        <div className="flex flex-wrap gap-2">
          {result.hashtags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-200 ring-1 ring-purple-400/30"
            >
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}

function SkeletonBlock({ lines }: { lines: number }) {
  return (
    <div className="rounded-2xl p-5 bg-white/5 ring-1 ring-white/10 animate-pulse space-y-2">
      <div className="h-3 w-28 rounded bg-white/10" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded bg-white/10" style={{ width: `${65 + (i % 3) * 12}%` }} />
      ))}
    </div>
  );
}
