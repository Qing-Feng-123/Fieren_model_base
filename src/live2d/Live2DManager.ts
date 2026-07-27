/**
 * Live2D 核心管理层
 * --------------------------------------------------
 * 只负责：加载运行时 / 加载模型 / 播放动作 / 设置参数 / 命中检测。
 * 不含任何"哪个动作表示什么情绪"的业务语义——语义在 actions 层定义。
 *
 * 注意：pixi / pixi-live2d-display 使用动态 import。
 * 它们在模块加载时就要检查 Cubism 运行时，静态 import 会让
 * 整个前端在运行时缺失时白屏；动态 import 则保证 UI 永远先渲染，
 * 错误只体现在日志面板里。
 */
import { ENV, MODEL_URL } from '../config/env';
import { logger } from '../logging/logger';

const TAG = 'Live2D';

type PIXIModule = typeof import('pixi.js');
type Live2DModelType = import('pixi-live2d-display/cubism4').Live2DModel;

function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`脚本加载失败: ${url}`));
    document.head.appendChild(s);
  });
}

export class Live2DManager {
  private app: import('pixi.js').Application | null = null;
  private model: Live2DModelType | null = null;
  private coreReady = false;

  /** 初始化（幂等）：确认运行时 → 建画布 → 加载模型 */
  async init(canvas: HTMLCanvasElement): Promise<void> {
    // 1. 运行时：由 index.html 预加载；缺失时按 env 配置补加载
    if (!this.coreReady) {
      if (typeof (window as any).Live2DCubismCore === 'undefined') {
        logger.warn(TAG, '运行时未预加载，尝试动态加载 Cubism Core…');
        await loadScript(ENV.CUBISM_CORE_URL);
        if (typeof (window as any).Live2DCubismCore === 'undefined') {
          throw new Error('Cubism Core 加载后仍不可用');
        }
      }
      this.coreReady = true;
      logger.success(TAG, 'Cubism Core 就绪');
    }

    // 2. 引擎模块（动态加载，失败不影响 UI）
    const PIXI: PIXIModule = await import('pixi.js');
    (window as any).PIXI = PIXI;
    const { Live2DModel } = await import('pixi-live2d-display/cubism4');

    if (!this.app) {
      this.app = new PIXI.Application({
        view: canvas,
        autoStart: true,
        resizeTo: canvas.parentElement ?? undefined,
        backgroundAlpha: 0,
        antialias: true,
      });
      logger.info(TAG, 'PIXI 画布已创建');
    }

    if (!this.model) {
      logger.info(TAG, `加载模型: ${MODEL_URL}`);
      this.model = await Live2DModel.from(MODEL_URL, {
        autoInteract: false,
      } as any);
      const scale = Math.min(
        canvas.parentElement!.clientWidth / this.model.width,
        canvas.parentElement!.clientHeight / this.model.height
      ) * 0.9;
      this.model.scale.set(scale);
      this.model.anchor.set(0.5, 0.5);
      this.model.position.set(
        canvas.parentElement!.clientWidth / 2,
        canvas.parentElement!.clientHeight / 2
      );
      this.app.stage.addChild(this.model as any);
      logger.success(TAG, `模型加载完成 (${Math.round(this.model.width)}×${Math.round(this.model.height)})`);
      this.model.internalModel.motionManager.on('motionStart', (g: string, i: number) =>
        logger.info(TAG, `动作开始: ${g}[${i}]`)
      );
      this.model.internalModel.motionManager.on('motionFinish', () =>
        logger.info(TAG, '动作播放结束')
      );
    }
  }

  /** 播放动作组 */
  playMotion(group: string, index = 0, priority = 2): void {
    if (!this.model) return logger.warn(TAG, '模型未就绪，忽略动作请求');
    this.model.motion(group, index, priority);
  }

  /** 播放单个 motion3.json 文件（用于 AI 上传的自定义动作） */
  async playMotionFile(url: string, priority = 3): Promise<void> {
    if (!this.model) return logger.warn(TAG, '模型未就绪，忽略动作请求');
    const mm = this.model.internalModel.motionManager;
    const motion = await (mm as any).loadMotion(new Uint8Array(await (await fetch(url)).arrayBuffer()) as any, undefined, url);
    await (mm as any).startMotion(motion, undefined, priority);
  }

  /** 设置模型参数（如脸颊泛红 ParamCheek） */
  setParam(id: string, value: number): void {
    if (!this.model) return;
    const core = this.model.internalModel.coreModel as any;
    if (typeof core.setParameterValueById === 'function') {
      core.setParameterValueById(id, value);
    }
  }

  /** 参数随时间渐变（害羞红晕淡入淡出用） */
  fadeParam(id: string, to: number, durationMs: number, onDone?: () => void): void {
    const core = this.model?.internalModel.coreModel as any;
    if (!core) return;
    const from = core.getParameterValueById(id) ?? 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      core.setParameterValueById(id, from + (to - from) * t);
      if (t < 1) requestAnimationFrame(step);
      else onDone?.();
    };
    requestAnimationFrame(step);
  }

  /** 画布坐标 → 命中区域：'head' | 'body' | 'none' */
  hitRegion(x: number, y: number): 'head' | 'body' | 'none' {
    if (!this.model) return 'none';
    const b = this.model.getBounds();
    if (x < b.left || x > b.right || y < b.top || y > b.bottom) return 'none';
    const ratio = (y - b.top) / b.height;
    return ratio <= ENV.HEAD_REGION_RATIO ? 'head' : 'body';
  }

  get isReady(): boolean {
    return !!this.model;
  }
}

export const live2d = new Live2DManager();
