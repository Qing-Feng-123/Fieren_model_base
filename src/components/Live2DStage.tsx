import { useEffect, useRef } from 'react';
import { live2d } from '../live2d/Live2DManager';
import { attachInteractions } from '../interactions/InteractionManager';
import { exposeHiyoriAPI } from '../api/actionPack';
import { logger } from '../logging/logger';

export function Live2DStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    exposeHiyoriAPI();
    const canvas = canvasRef.current!;
    live2d
      .init(canvas)
      .then(() => attachInteractions(canvas))
      .catch((err) => logger.error('Live2D', `初始化失败: ${err?.message ?? err}`));
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-rose-50 via-pink-50 to-amber-50">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-pointer" />
      <div className="pointer-events-none absolute left-4 top-4 rounded-lg bg-white/70 px-3 py-1.5 text-sm text-rose-500 shadow backdrop-blur">
        hiyori_pro · 点她的头试试 ♡
      </div>
    </div>
  );
}
