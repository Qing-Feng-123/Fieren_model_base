import { useEffect, useRef, useState } from 'react';
import { ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { logger, type LogEntry, type LogLevel } from '../logging/logger';

const LEVEL_STYLE: Record<LogLevel, string> = {
  info: 'text-slate-600',
  success: 'text-emerald-600',
  warn: 'text-amber-600',
  error: 'text-rose-600',
};

export function LogPanel() {
  const [open, setOpen] = useState(true);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => logger.subscribe(setEntries), []);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [entries]);

  return (
    <aside
      className={`relative flex h-full flex-col border-l border-slate-200 bg-white/95 shadow-lg transition-all duration-300 ${
        open ? 'w-80' : 'w-10'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="absolute -left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow hover:bg-slate-50"
        title={open ? '收起日志' : '展开日志'}
      >
        {open ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {open && (
        <>
          <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-700">运行日志</h2>
            <button
              onClick={() => logger.clear()}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              title="清空日志"
            >
              <Trash2 size={14} />
            </button>
          </header>
          <div className="flex-1 space-y-1 overflow-y-auto px-3 py-2 font-mono text-xs">
            {entries.map((e) => (
              <div key={e.id} className="leading-5">
                <span className="text-slate-400">{e.time}</span>{' '}
                <span className="text-indigo-500">[{e.source}]</span>{' '}
                <span className={LEVEL_STYLE[e.level]}>{e.message}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </>
      )}
    </aside>
  );
}
