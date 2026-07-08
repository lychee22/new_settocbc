# Mock 接口层

在后端不可用/未部署时，让前端能完整跑通核心链路（登录 → 主页 → 拉系统信息 → 业务请求 → 登出）并支持自测。

## 启用

```bash
# 默认 dev：走 vite proxy 到真实后端（mock 关闭）
npm run dev

# mock 模式：启用内置 mock 层，不依赖后端
npm run dev:mock
```

开关由环境变量 `VITE_USE_MOCK` 控制（见 `.env.mock`）。`npm run build` 不携带该变量，因此**生产构建永远是真实请求**，安全。

可选 `VITE_MOCK_LATENCY`（毫秒）模拟网络延迟，用于调试 loading / 超时。

## 工作原理

拦截点集中在 `src/api/request.ts`：

- `sendRequest` 开头：若 `VITE_USE_MOCK=true`，按请求消息名 `n` 查 `registry.ts` 路由表，命中则直接返回 mock 响应（跳过 fetch/Base64）。
- `login` 开头：单独走 `mockLogin`（登录不是 NetMessage 协议）。
- **未注册的消息会抛错** `[Mock] 未注册的消息: <n>``，避免「假成功」掩盖问题。

## 目录结构

```
src/mock/
├── types.ts             # MockHandler / MockLoginHandler 类型
├── registry.ts          # 消息名 n -> handler 路由表 + resolveMock
├── index.ts             # 汇总导出 + 开关常量
├── README.md            # 本文件
└── handlers/
    ├── auth.ts          # 登录 mock
    ├── system.ts        # GetSysDate / Logout
    └── masterSetup.ts   # 业务示例（Currency / Nostro / CounterParty）
```

## 新增一个业务 mock

1. 在 `handlers/<module>.ts` 写一个 `MockHandler`：

   ```ts
   import type { MockHandler, MockRequest } from '../types';
   import type { NetMessage } from '../../types';

   export const getSomething: MockHandler = (req: MockRequest) => {
     const curr = req?.hvb?.[0]?.curr;
     return {
       n: 'xxxGridMsg_GetSomething',
       sts: 0,
       hvb: [{ curr }],
       mhvb: {},
     } as NetMessage;
   };
   ```

2. 在 `registry.ts` 的 `MESSAGE_HANDLERS` 注册：

   ```ts
   'xxxGridMsg_GetSomething': getSomething,
   ```

完成。无需改动 `request.ts`。

## 状态码约定（与真实后端一致）

| sts | 含义 | 说明 |
|-----|------|------|
| `0` | 成功 | 数据在 hvb / mhvb |
| `1` | Override 审批 | 返回 ovrinfo / ovrrule |
| `-1` | 失败 | 错误信息在 e 字段（sendRequest 会自动抛错） |

返回 `sts!==0` 的写法见 `handlers/masterSetup.ts` 的 `getCcyMaster`（-1）和 `sampleOverride`（1）。

## 真实样例数据来源

- 协议/字段：`knowledge-base/_shared/01_NetMessageFormat.md`
- Nostro 真实响应：`knowledge-base/nostroaccno接口返回值.txt`
- 各模块请求/响应：`knowledge-base/<module>/*.md`
- 接口契约（7392 自测）：`knowledge-base/fixes/2026/Q2/7392_frontend_self_test_guide.md`

## 自测验证要点

| 步骤 | 操作 | 期望 |
|------|------|------|
| 1 | `npm run dev:mock` | 控制台打印 `[Mock] 已启用...` |
| 2 | `/new-login` 输入任意账号密码登录 | 成功跳转 `/admin` |
| 3 | BasicLayout 加载 | Header 显示 System Date / entity / env |
| 4 | F12 Network | 无真实后端请求（本地拦截） |
| 5 | 登出 | 正常退出 |

## 注意事项

- Mock 数据是写死的内存数据，刷新后恢复初始；需要持久化的状态请用 authStore（已 persist）。
- Mock 模式下 `vite.config.ts` 的 proxy 不生效（不走网络），二者互不影响。
