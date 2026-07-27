import { Live2DStage } from './components/Live2DStage';
import { LogPanel } from './components/LogPanel';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <div className="flex h-screen w-screen overflow-hidden">
        <main className="min-w-0 flex-1">
          <Live2DStage />
        </main>
        <LogPanel />
      </div>
    </ErrorBoundary>
  );
}
