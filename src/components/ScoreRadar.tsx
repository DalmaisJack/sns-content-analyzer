'use client';

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

interface ScoreRadarProps {
  buzzScore: number;
  hookScore: number;
  emotionScore: number;
  labels: { buzz: string; hook: string; emotion: string };
}

export default function ScoreRadar({ buzzScore, hookScore, emotionScore, labels }: ScoreRadarProps) {
  const data = [
    { subject: labels.buzz,    value: buzzScore,    fullMark: 100 },
    { subject: labels.hook,    value: hookScore,    fullMark: 100 },
    { subject: labels.emotion, value: emotionScore, fullMark: 100 },
  ];

  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 flex flex-col">
      <ResponsiveContainer width="100%" height={144}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'rgba(156,163,175,0.9)', fontSize: 11 }}
          />
          <Radar
            dataKey="value"
            stroke="#a855f7"
            fill="#a855f7"
            fillOpacity={0.18}
            strokeWidth={2}
            dot={{ fill: '#a855f7', r: 3 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreRadarSkeleton() {
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center animate-pulse" style={{ minHeight: 180 }}>
      <div className="w-28 h-28 rounded-full bg-white/10" />
    </div>
  );
}
