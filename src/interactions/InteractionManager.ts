/**
 * 交互绑定层 —— 触发事件 → 动作
 * --------------------------------------------------
 * 交互（点击头部 / 点击身体 / 滚轮…）与动作完全解耦：
 * 这里只维护 "trigger → actionId" 的绑定表，改绑定不碰动作逻辑。
 *
 * 示例：把滚轮滚动绑定到某个动作，只需
 *   bindInteraction({ trigger: 'wheel', actionId: 'xxx' })
 */
import { live2d } from '../live2d/Live2DManager';
import { runAction } from '../actions/registry';
import { logger } from '../logging/logger';

export type TriggerType =
  | { kind: 'tap'; region: 'head' | 'body' | 'any' }
  | { kind: 'wheel' };

export interface InteractionBinding {
  id: string;
  trigger: TriggerType;
  actionId: string;
  enabled: boolean;
}

const bindings = new Map<string, InteractionBinding>();
let detachFns: (() => void)[] = [];

export function bindInteraction(b: Omit<InteractionBinding, 'enabled'> & { enabled?: boolean }): void {
  bindings.set(b.id, { ...b, enabled: b.enabled ?? true });
  logger.info('Interactions', `绑定交互 [${b.id}] → 动作 [${b.actionId}]`);
}

export function unbindInteraction(id: string): void {
  bindings.delete(id);
  logger.info('Interactions', `解绑交互 [${id}]`);
}

export function listBindings(): InteractionBinding[] {
  return [...bindings.values()];
}

/** 将绑定表挂到画布上（在 live2d.init 之后调用） */
export function attachInteractions(canvas: HTMLCanvasElement): void {
  detachFns.forEach((fn) => fn());
  detachFns = [];

  const onTap = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const region = live2d.hitRegion(e.clientX - rect.left, e.clientY - rect.top);
    logger.info('Interactions', `点击 (${Math.round(e.clientX - rect.left)}, ${Math.round(e.clientY - rect.top)}) → 区域: ${region}`);
    for (const b of bindings.values()) {
      if (!b.enabled || b.trigger.kind !== 'tap') continue;
      if (b.trigger.region === 'any' || b.trigger.region === region) runAction(b.actionId);
    }
  };

  const onWheel = () => {
    for (const b of bindings.values()) {
      if (b.enabled && b.trigger.kind === 'wheel') runAction(b.actionId);
    }
  };

  canvas.addEventListener('pointerdown', onTap);
  canvas.addEventListener('wheel', onWheel);
  detachFns.push(() => canvas.removeEventListener('pointerdown', onTap));
  detachFns.push(() => canvas.removeEventListener('wheel', onWheel));
}

/* ---------------- 默认绑定：点头部 → 害羞；点身体 → body_tap ---------------- */
bindInteraction({ id: 'tap_head_shy', trigger: { kind: 'tap', region: 'head' }, actionId: 'shy' });
bindInteraction({ id: 'tap_body', trigger: { kind: 'tap', region: 'body' }, actionId: 'body_tap' });
