# hiyori_pro

简易 Live2D 前端网页：点击角色头部会害羞（脸颊泛红 + 动作回应），右侧为可收放的运行日志面板。

## 技术栈与依赖解耦

- React + TypeScript + Vite + Tailwind CSS
- Live2D：pixi.js@6 + pixi-live2d-display，Cubism Core 运行时走 jsDelivr CDN
- 模型文件床：GitHub 仓库 `Qing-Feng-123/model_base@hiyori_pro` 分支，经 jsDelivr CDN 加载
- **所有外部 URL 集中在 `src/config/env.ts`**，换 CDN / 模型 / 分支只改这一个文件

## 模块结构（基础功能按模块拆分）

```
src/
├── config/env.ts                  # 环境/依赖配置（唯一 URL 来源）
├── live2d/Live2DManager.ts        # 引擎层：加载模型、播放动作、参数、命中检测
├── actions/                       # 动作层（语义，与引擎解耦）
│   ├── types.ts                   #   ActionDefinition 协议
│   └── registry.ts                #   注册表 + 内置动作（shy 等）
├── interactions/InteractionManager.ts  # 交互层：trigger→action 绑定表（点击/滚轮…）
├── api/actionPack.ts              # ActionPack 上传接口（window.hiyoriAPI）
├── logging/logger.ts              # 日志总线
└── components/                    # UI：Live2DStage、LogPanel
docs/AI_ACTION_INTERFACE.md        # AI 动作上传协议文档
```

## 增删动作 / 绑定交互

动作与交互完全解耦，三者互不依赖：

```ts
registerAction({ id: 'xxx', name: '...', run(ctx) { /* 组合引擎指令 */ } });
bindInteraction({ id: 'b1', trigger: { kind: 'tap', region: 'head' }, actionId: 'xxx' });
```

外部 AI 上传动作请看 `docs/AI_ACTION_INTERFACE.md`。

## 本地开发

```bash
npm install
npm run dev
npm run build
```
