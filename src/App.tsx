import { Live2DStage } from './components/Live2DStage';
import { LogPanel } from './components/LogPanel';

export default function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <main className="min-w-0 flex-1">
        <Live2DStage />
      </main>
      <LogPanel />
    </div>
  );
}
