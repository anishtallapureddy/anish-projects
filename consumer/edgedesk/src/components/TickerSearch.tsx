'use client';

import { useState } from 'react';

const SUGGESTIONS = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'SPY', 'QQQ', 'AMD', 'META'];

export default function TickerSearch({
  initial,
  onSubmit,
  loading,
}: {
  initial?: string;
  onSubmit: (symbol: string) => void;
  loading?: boolean;
}) {
  const [value, setValue] = useState(initial ?? '');

  return (
    <div className="space-y-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = value.trim().toUpperCase();
          if (v) onSubmit(v);
        }}
        className="flex gap-2"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ticker (e.g. NVDA)"
          className="flex-1 rounded-md bg-edge-bg border border-edge-border px-3 py-2 text-lg uppercase tracking-wide focus:outline-none focus:border-edge-accent"
          maxLength={10}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="rounded-md bg-edge-accent text-black font-semibold px-4 py-2 disabled:opacity-50"
        >
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setValue(s);
              onSubmit(s);
            }}
            className="text-xs px-2 py-1 border border-edge-border rounded text-edge-mute hover:text-white hover:border-edge-accent"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
