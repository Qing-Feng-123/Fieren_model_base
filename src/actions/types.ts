/**
 * 动作（Action）定义层 —— 业务语义与 Live2D 引擎解耦
 * --------------------------------------------------
 * 一个 Action = 一个语义（如"害羞"）= 若干引擎指令的组合。
 * 增删动作只需注册新的 ActionDefinition，无需改引擎层或交互层。
 */
import { live2d } from '../live2d/Live2DManager';
import { logger } from '../logging/logger';

export interface ActionContext {
  /** 播放模型内置动作组 */
  playMotion(group: string, index?: number, priority?: number): void;
  /** 播放自定义 motion3.json（URL） */
  playMotionFile(url: string, priority?: number): Promise<void>;
  setParam(id: string, value: number): void;
  fadeParam(id: string, to: number, durationMs: number, onDone?: () => void): void;
  log(source: string, message: string): void;
}

export interface ActionDefinition {
  /** 动作唯一 ID（AI 上传时也必须提供） */
  id: string;
  /** 展示名 */
  name: string;
  /** 动作执行体：可组合任意引擎指令 */
  run(ctx: ActionContext): void | Promise<void>;
}

export function createActionContext(): ActionContext {
  return {
    playMotion: (g, i, p) => live2d.playMotion(g, i, p),
    playMotionFile: (u, p) => live2d.playMotionFile(u, p),
    setParam: (id, v) => live2d.setParam(id, v),
    fadeParam: (id, to, ms, cb) => live2d.fadeParam(id, to, ms, cb),
    log: (s, m) => logger.info(s, m),
  };
}
