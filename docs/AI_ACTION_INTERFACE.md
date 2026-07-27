# AI 动作上传接口文档（ActionPack 协议 v1）

本文档面向低 harness 的 AI Agent：你无需理解项目内部模块，只需完成两步——**上传动作文件到仓库**、**调用接口注册动作并绑定交互**。

## 第一步：上传动作文件（如需新动作）

将 Cubism 导出的 `*.motion3.json` 文件推送到 GitHub 仓库：

```
仓库:  Qing-Feng-123/model_base
分支:  hiyori_pro
路径:  runtime/motion/<你的文件名>.motion3.json
```

推送后文件立即通过 jsDelivr CDN 可用：

```
https://cdn.jsdelivr.net/gh/Qing-Feng-123/model_base@hiyori_pro/runtime/motion/<你的文件名>.motion3.json
```

> 若仅使用模型自带动作（Idle / Flick / FlickDown / FlickUp / Tap / Tap@Body / Flick@Body），可跳过此步。

## 第二步：加载动作包

在页面打开后（控制台或你的宿主环境）调用：

```js
window.hiyoriAPI.loadActionPack({
  name: "my_pack",                       // 动作包名
  actions: [
    {
      id: "happy",                       // 动作唯一 ID（必填）
      name: "开心",                       // 展示名（必填）
      // 动作来源二选一：
      motionGroup: "FlickUp",            // 方式A：模型自带动作组
      motionIndex: 0,                    // 组内序号，默认 0
      // motionFile: "motion/my_motion.motion3.json",  // 方式B：第一步上传的新文件（相对 runtime 的路径）
      // 可选：参数动画（如脸颊泛红）
      paramFx: [
        { paramId: "ParamCheek", value: 1, fadeInMs: 400, holdMs: 1500, fadeOutMs: 1200 }
      ]
    }
  ],
  bindings: [
    // trigger 支持：{ kind:"tap", region:"head"|"body"|"any" } 或 { kind:"wheel" }
    { id: "scroll_happy", trigger: { kind: "wheel" }, actionId: "happy" }
  ]
});
```

调用后：动作被注册到注册表、交互绑定即时生效，运行日志面板会输出全过程日志。

## 其他可用接口

| 接口 | 说明 |
|---|---|
| `hiyoriAPI.listActions()` | 列出已注册动作 |
| `hiyoriAPI.runAction(id)` | 手动触发动作 |
| `hiyoriAPI.unregisterAction(id)` | 移除动作 |
| `hiyoriAPI.bindInteraction({id, trigger, actionId})` | 追加绑定 |
| `hiyoriAPI.unbindInteraction(id)` | 解绑 |
| `hiyoriAPI.listBindings()` | 列出绑定 |

## 常用参数 ID（来自模型 cdi3.json）

`ParamCheek`(脸颊泛红)、`ParamEyeLSmile`/`ParamEyeRSmile`(微笑眼)、`ParamMouthOpenY`(嘴开闭)、`ParamAngleX/Y/Z`(头部角度)、`ParamBrowLY/RY`(眉毛)。

## 注意事项

1. 动作 ID 与绑定 ID 在各自命名空间内必须唯一，重复注册会覆盖旧定义。
2. `motionFile` 路径是仓库 `runtime/` 下的相对路径，不是完整 URL。
3. jsDelivr 有缓存（约 12 小时），同名文件覆盖推送后可能延迟生效，建议新文件用新文件名。
