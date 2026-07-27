/**
 * 动作注册表 + 内置动作
 * --------------------------------------------------
 * registerAction / unregisterAction 即可热插拔动作。
 * 外部 AI 可通过 window.hiyoriAPI 调用同一注册表。
 */
import type { ActionDefinition } from './types';
import { createActionContext } from './types';
import { logger } from '../logging/logger';

const registry = new Map<string, ActionDefinition>();

export function registerAction(action: ActionDefinition): void {
  registry.set(action.id, action);
  logger.info('Actions', `注册动作 [${action.id}] ${action.name}`);
}

export function unregisterAction(id: string): boolean {
  const ok = registry.delete(id);
  if (ok) logger.info('Actions', `移除动作 [${id}]`);
  return ok;
}

export function runAction(id: string): void {
  const action = registry.get(id);
  if (!action) return logger.warn('Actions', `未找到动作 [${id}]`);
  logger.info('Actions', `执行动作 [${id}] ${action.name}`);
  void action.run(createActionContext());
}

export function listActions(): ActionDefinition[] {
  return [...registry.values()];
}

/* ---------------- 内置动作：害羞 ---------------- */
registerAction({
  id: 'shy',
  name: '害羞（点头触发）',
  async run(ctx) {
    ctx.log('Action:shy', '脸颊泛红，播放 Tap 动作');
    ctx.playMotion('Tap', Math.random() < 0.5 ? 0 : 1, 3);
    // 红晕淡入 → 停留 → 淡出
    ctx.fadeParam('ParamCheek', 1, 400, () => {
      setTimeout(() => ctx.fadeParam('ParamCheek', 0, 1200), 1500);
    });
    // 眼睛微笑
    ctx.fadeParam('ParamEyeLSmile', 1, 400);
    ctx.fadeParam('ParamEyeRSmile', 1, 400);
    setTimeout(() => {
      ctx.fadeParam('ParamEyeLSmile', 0, 800);
      ctx.fadeParam('ParamEyeRSmile', 0, 800);
    }, 2000);
  },
});

/* ---------------- 内置动作：摸头回应 ---------------- */
registerAction({
  id: 'body_tap',
  name: '身体被点击',
  run(ctx) {
    ctx.playMotion('Tap@Body', 0, 2);
    ctx.log('Action:body_tap', '播放 Tap@Body 动作');
  },
});
