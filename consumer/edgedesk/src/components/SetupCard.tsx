import type { TradeSetup } from '@/types';
import OptionsPlayCard from './OptionsPlay';

function fmt(n: number, dp = 2) {
  return n.toFixed(dp);
}

function ConvictionMeter({ value }: { value: number }) {
  const pct = (value / 10) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-edge-mute">
        <span>Conviction</span>
        <span className="font-mono">{value}/10</span>
      </div>
      <div className="h-2 w-full bg-edge-border rounded">
        <div
          className="h-2 rounded bg-edge-accent"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function SetupCard({
  setup,
  onExport,
  exporting,
}: {
  setup: TradeSetup;
  onExport: () => void;
  exporting?: boolean;
}) {
  const dirColor =
    setup.direction === 'long'
      ? 'text-edge-up'
      : setup.direction === 'short'
      ? 'text-edge-down'
      : 'text-edge-mute';
  return (
    <div className="space-y-4">
      <div className="panel p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase text-edge-mute tracking-wider">Setup</div>
            <div className={`text-2xl font-semibold ${dirColor}`}>
              {setup.direction.toUpperCase()} · {setup.style} · {setup.timeframe}
            </div>
          </div>
          <button
            onClick={onExport}
            disabled={exporting}
            className="text-sm rounded-md border border-edge-border px-3 py-1.5 text-edge-mute hover:text-white hover:border-edge-accent disabled:opacity-50"
          >
            {exporting ? 'Exporting…' : 'Export Report'}
          </button>
        </div>

        {setup.degraded && (
          <div className="text-xs text-edge-warn border border-edge-warn/40 bg-edge-warn/10 rounded p-2">
            ⚠ Degraded result: {setup.degradedReasons.join(' ')}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <div className="text-edge-mute text-xs uppercase">Entry zone</div>
            <div className="font-mono">${fmt(setup.entryLow)} – ${fmt(setup.entryHigh)}</div>
          </div>
          <div>
            <div className="text-edge-mute text-xs uppercase">Target 1</div>
            <div className="font-mono text-edge-up">${fmt(setup.target1)}</div>
          </div>
          <div>
            <div className="text-edge-mute text-xs uppercase">Target 2</div>
            <div className="font-mono text-edge-up">${fmt(setup.target2)}</div>
          </div>
          <div>
            <div className="text-edge-mute text-xs uppercase">Stop</div>
            <div className="font-mono text-edge-down">${fmt(setup.stop)}</div>
          </div>
          <div className="col-span-2">
            <div className="text-edge-mute text-xs uppercase">R:R (to T1)</div>
            <div className="font-mono">{fmt(setup.rr)}</div>
          </div>
          <div className="col-span-2">
            <ConvictionMeter value={setup.conviction} />
          </div>
        </div>

        <div>
          <div className="text-xs uppercase text-edge-mute mb-1">Thesis</div>
          <p className="text-sm leading-relaxed">{setup.thesis}</p>
        </div>

        <div>
          <div className="text-xs uppercase text-edge-mute mb-1">Triggers</div>
          <ul className="text-sm list-disc list-inside text-edge-mute space-y-0.5">
            {setup.triggers.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase text-edge-mute mb-1">Risk notes</div>
          <p className="text-sm text-edge-mute">{setup.riskNotes}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm uppercase text-edge-mute tracking-wider">
            Options structures
          </h3>
          <span className="text-[10px] text-edge-mute">illustrative only</span>
        </div>
        <p className="text-[11px] text-edge-mute mb-3">
          Strikes selected mechanically from spot + ATR offsets. Does not model Greeks, IV, liquidity, spreads,
          commissions, or assignment risk. Verify the live chain before any trade.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {setup.optionsPlays.map((p, i) => (
            <OptionsPlayCard key={i} play={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
