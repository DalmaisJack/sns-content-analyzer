'use client';

interface ScoreCardProps {
  label: string;
  value: number;
  color: 'purple' | 'blue' | 'pink';
  skeleton?: boolean;
}

const colorStyles = {
  purple: { hex: '#a855f7', ring: 'ring-purple-500/30', bg: 'bg-purple-950/20' },
  blue:   { hex: '#3b82f6', ring: 'ring-blue-500/30',   bg: 'bg-blue-950/20'   },
  pink:   { hex: '#ec4899', ring: 'ring-pink-500/30',   bg: 'bg-pink-950/20'   },
};

export default function ScoreCard({ label, value, color, skeleton = false }: ScoreCardProps) {
  const c = colorStyles[color];

  if (skeleton) {
    return (
      <div className="rounded-2xl p-3 bg-white/5 ring-1 ring-white/10 animate-pulse">
        <div className="h-2 w-16 rounded bg-white/10 mb-2" />
        <div className="h-7 w-10 rounded bg-white/10" />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-3 ${c.bg} ring-1 ${c.ring}`}>
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 truncate">{label}</p>
      <p className="text-3xl sm:text-4xl font-black tabular-nums" style={{ color: c.hex }}>
        {value}
      </p>
      <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: c.hex }}
        />
      </div>
    </div>
  );
}
