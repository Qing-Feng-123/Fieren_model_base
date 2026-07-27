/**
 * 动作包（ActionPack）上传接口 —— 供低 harness AI 程序化接入
 * --------------------------------------------------
 * AI 只需构造一个 ActionPack JSON，调用 window.hiyoriAPI.loadActionPack(pack)
 * 即可完成：上传动作文件 + 注册动作 + 绑定交互，无需了解内部模块。
 *
 * 协议文档见 docs/AI_ACTION_INTERFACE.md
 */
import { registerAction, unregisterAction, listActions, runAction } from '../actions/registry';
import { bindInteraction, unbindInteraction, listBindings } from '../interactions/InteractionManager';
import { modelAsset } from '../config/env';
import { logger } from '../logging/logger';
import type { ActionDefinition } from '../actions/types';

/** AI 上传动作包的协议格式 */
export interface ActionPack {
  /** 包名 */
  name: string;
  /** 动作列表 */
  actions: Array<{
    /** 动作唯一 ID */
    id: string;
    /** 展示名 */
    name: string;
    /**
     * 动作来源（二选一）：
     * - motionGroup: 使用模型自带动作组，如 { motionGroup: 'Tap', motionIndex: 0 }
     * - motionFile:  使用新上传的 motion3.json，路径为仓库 runtime 下相对路径
     *                （需先把文件推送到仓库 motion/ 目录，通过 jsDelivr 加载）
     */
    motionGroup?: string;
    motionIndex?: number;
    motionFile?: string;
    /** 附加参数动画（可选），如脸颊泛红 */
    paramFx?: Array<{ paramId: string; value: number; fadeInMs: number; holdMs: number; fadeOutMs: number }>;
  }>;
  /** 交互绑定列表 */
  bindings: Array<{
    id: string;
    trigger: { kind: 'tap'; region: 'head' | 'body' | 'any' } | { kind: 'wheel' };
    actionId: string;
  }>;
}

export function loadActionPack(pack: ActionPack): void {
  logger.info('ActionPack', `加载动作包 [${pack.name}]：${pack.actions.length} 个动作，${pack.bindings.length} 条绑定`);

  for (const a of pack.actions) {
    const def: ActionDefinition = {
      id: a.id,
      name: a.name,
      async run(ctx) {
        if (a.motionFile) await ctx.playMotionFile(modelAsset(a.motionFile), 3);
        else if (a.motionGroup) ctx.playMotion(a.motionGroup, a.motionIndex ?? 0, 3);
        for (const fx of a.paramFx ?? []) {
          ctx.fadeParam(fx.paramId, fx.value, fx.fadeInMs, () => {
            setTimeout(() => ctx.fadeParam(fx.paramId, 0, fx.fadeOutMs), fx.holdMs);
          });
        }
        ctx.log(`Action:${a.id}`, `执行动作包动作 ${a.name}`);
      },
    };
    registerAction(def);
  }

  for (const b of pack.bindings) bindInteraction(b);
  logger.success('ActionPack', `动作包 [${pack.name}] 加载完成`);
}

/** 挂到 window，供外部 AI / 控制台直接调用 */
export function exposeHiyoriAPI(): void {
  (window as any).hiyoriAPI = {
    loadActionPack,
    registerAction,
    unregisterAction,
    listActions,
    runAction,
    bindInteraction,
    unbindInteraction,
    listBindings,
  };
  logger.success('API', 'window.hiyoriAPI 已就绪（详见 docs/AI_ACTION_INTERFACE.md）');
}
