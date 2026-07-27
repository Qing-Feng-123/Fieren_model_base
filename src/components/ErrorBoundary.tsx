import { Component, type ReactNode } from 'react';
import { logger } from '../logging/logger';

interface State {
  error: string | null;
  stack: string | null;
  componentStack: string | null;
}

/** 全局错误边界：任何渲染/生命周期异常都不再导致白屏，而是显示错误信息 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, stack: null, componentStack: null };

  static getDerivedStateFromError(err: unknown): Partial<State> {
    return {
      error: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
      stack: err instanceof Error ? (err.stack ?? null) : null,
    };
  }

  componentDidCatch(err: unknown, info: { componentStack?: string | null }) {
    this.setState({ componentStack: info.componentStack ?? null });
    logger.error('ErrorBoundary', `未捕获异常: ${err instanceof Error ? err.message : err}`);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-rose-50 p-6">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-rose-200 bg-white p-6 shadow">
            <h1 className="mb-2 text-lg font-bold text-rose-600">页面渲染出错</h1>
            <p className="font-mono text-sm text-slate-700">{this.state.error}</p>
            {this.state.stack && (
              <pre className="mt-3 whitespace-pre-wrap break-all rounded bg-slate-50 p-3 font-mono text-[10px] leading-4 text-slate-500">
                {this.state.stack}
              </pre>
            )}
            {this.state.componentStack && (
              <pre className="mt-2 whitespace-pre-wrap break-all rounded bg-slate-50 p-3 font-mono text-[10px] leading-4 text-slate-400">
                {this.state.componentStack}
              </pre>
            )}
            <p className="mt-3 text-xs text-slate-400">
              请把整屏（含下方堆栈）截图反馈，便于精确定位问题。
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
