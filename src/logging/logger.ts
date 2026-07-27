/**
 * 全局日志模块（独立可替换）
 * 任意模块 import { logger } 即可写日志，UI 通过 subscribe 渲染。
 */

export type LogLevel = 'info' | 'success' | 'warn' | 'error';

export interface LogEntry {
  id: number;
  time: string;
  level: LogLevel;
  source: string;
  message: string;
}

type Listener = (entries: LogEntry[]) => void;

const MAX_ENTRIES = 500;
let seq = 0;
let entries: LogEntry[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((fn) => fn([...entries]));
}

function push(level: LogLevel, source: string, message: string) {
  entries.push({
    id: ++seq,
    time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
    level,
    source,
    message,
  });
  if (entries.length > MAX_ENTRIES) entries = entries.slice(-MAX_ENTRIES);
  emit();
}

export const logger = {
  info: (source: string, message: string) => push('info', source, message),
  success: (source: string, message: string) => push('success', source, message),
  warn: (source: string, message: string) => push('warn', source, message),
  error: (source: string, message: string) => push('error', source, message),
  clear() {
    entries = [];
    emit();
  },
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    fn([...entries]);
    return () => listeners.delete(fn);
  },
};
