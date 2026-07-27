/**
 * 环境 / 依赖解耦配置层
 * --------------------------------------------------
 * 所有外部依赖（CDN、模型仓库、运行时脚本）集中在这里。
 * 想替换 CDN、换模型、换运行时版本，只改这一个文件即可，
 * 业务代码不直接引用任何 URL。
 */

export const ENV = {
  /** Cubism Core 运行时脚本（默认本地部署；想换回 CDN 改这里，同时同步 index.html） */
  CUBISM_CORE_URL: '/lib/live2dcubismcore.min.js',

  /**
   * 模型资源基地址。
   * 默认 '/model'：运行时文件内置在 public/model/，随站点一起部署，零外部依赖。
   * 想换回「GitHub 文件床 + jsDelivr CDN」，改回：
   *   'https://cdn.jsdelivr.net/gh/Qing-Feng-123/model_base@hiyori_pro/runtime'
   */
  MODEL_CDN_BASE: '/model',

  /** 模型入口文件（相对 MODEL_CDN_BASE） */
  MODEL_ENTRY: 'hiyori_pro_t11.model3.json',

  /** 头部区域判定：模型包围盒顶部占比（0~1），此模型无 Head HitArea，按高度划分 */
  HEAD_REGION_RATIO: 0.32,

  /** 日志面板默认展开 */
  LOG_PANEL_OPEN: true,
} as const;

export const MODEL_URL = `${ENV.MODEL_CDN_BASE}/${ENV.MODEL_ENTRY}`;

/** 模型资源地址拼接（动作、贴图等相对路径统一走这里） */
export function modelAsset(path: string): string {
  return `${ENV.MODEL_CDN_BASE}/${path.replace(/^\/+/, '')}`;
}
