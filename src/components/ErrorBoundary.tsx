import { Component, type ReactNode } from 'react';
import { logger } from '../logging/logger';

interface State {
  error: string | null;
}

/** 全局错误边界：任何渲染/生命周期异常都不再导致白屏，而是显示错误信息 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(err: unknown): State {
    return { error: err instanceof Error ? `${err.name}: ${err.message}` : String(err) };
  }

  componentDidCatch(err: unknown) {
    logger.error('ErrorBoundary', `未捕获异常: ${err instanceof Error ? err.message : err}`);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-rose-50 p-6">
          <div className="max-w-md rounded-xl border border-rose-200 bg-white p-6 shadow">
            <h1 className="mb-2 text-lg font-bold text-rose-600">页面渲染出错</h1>
            <p className="font-mono text-sm text-slate-600">{this.state.error}</p>
            <p className="mt-3 text-xs text-slate-400">
              请把这段错误信息截图反馈，便于定位问题。
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
