import type { OptionsPlay } from '@/types';

export default function OptionsPlayCard({ play }: { play: OptionsPlay }) {
  const riskColor =
    play.riskRating === 'high'
      ? 'text-edge-down'
      : play.riskRating === 'medium'
      ? 'text-edge-warn'
      : 'text-edge-up';
  return (
    <div className="panel p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase text-edge-mute">{play.label}</div>
          <div className="text-lg font-semibold">{play.structure}</div>
        </div>
        <div className={`text-xs font-mono uppercase ${riskColor}`}>{play.riskRating} risk</div>
      </div>
      <div className="font-mono text-sm">
        {play.shortStrike != null && play.longStrike != null ? (
          <span>
            Long ${play.longStrike.toFixed(2)} · Short ${play.shortStrike.toFixed(2)}
          </span>
        ) : (
          <span>Strike ${play.strike.toFixed(2)}</span>
        )}
        <span className="text-edge-mute"> · {play.expiryHint}</span>
      </div>
      <p className="text-sm text-edge-mute">{play.rationale}</p>
    </div>
  );
}
