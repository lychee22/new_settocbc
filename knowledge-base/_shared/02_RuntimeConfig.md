# 运行配置（旧 `config` 全局对象 → 新项目映射）

> 旧 jQuery/JSP 客户端在 `boMain.jsp` 头部初始化了一个包含 45 个字段的全局对象
> `config = {...}`，所有 JS 模块直接 `config.xxx` 访问。新项目（React + TS）
 *把这些字段拆分到三个位置。本文档记录字段映射。

---

## 1. 旧 `config` 字段映射总表

| # | 旧 `config.*` | 类型 | 新项目位置 | 备注 |
|---|---|---|---|---|
| 1 | `sysVer` | string | `UserSession.version` | 来自 GetSessionKeyServlet |
| 2 | `sessionID` | string | `UserSession.sessionKey` | 同上 |
| 3 | `entityCode` | string | `UserSession.entityCode` / `SystemInfo.entityCode` | login 携带；也由 getSystemInfo 异步刷新 |
| 4 | `lang` | number | `UserSession.language` | 0=EN, 1=zh-Hant |
| 5 | `locale` | string | — | 旧 BCP-47 标签；新项目未使用，由 language 数字码替代 |
| 6 | `jsonDir` | string | — | 旧客户端 i18n JSON 目录；新项目 server-driven，无需 |
| 7 | `jsonFilePrefix` | string | — | 同上 |
| 8 | `templateDir` | string | — | 旧客户端模板目录；新项目未使用 |
| 9 | `jsDir` | string | — | 旧客户端脚本目录；新项目未使用 |
| 10 | `pullURL` | string | `config.PULL_URL` 常量 | 默认 `/settocbcBoServer/BOAppPullServlet` |
| 11 | `pushURL` | string | `config.PUSH_URL` 常量 | 默认 `/owhFoPushServer/FOPushServlet`（占位，未实现） |
| 12 | `loginURL` | string | `config.LOGIN_URL` 常量 | 默认 `/settocbcBoServer/BOAppLoginServlet` |
| 13 | `ajaxTimeout` | number | `config.AJAX_TIMEOUT = 120_000` | 单位 ms |
| 14 | `probeInterval` | number | `config.KEEPALIVE_INTERVAL = 300_000` | keepalive 间隔（ms）；本期未启用 |
| 15 | `mouseClickInterval` | number | `useSessionTimeout` 活动追踪 | 用途不同（防超时，非点击防抖） |
| 16 | `loadAlertInterval` | number | `config.REFRESH_INTERVAL.loadAlert = 60_000` | 占位，待业务模块启用 |
| 17 | `loadCoreRateAlertInterval` | number | `config.REFRESH_INTERVAL.loadCoreRateAlert = 30_000` | 同上 |
| 18 | `loadNTSpreadAlertInterval` | number | `config.REFRESH_INTERVAL.loadNTSpreadAlert = 30_000` | 同上 |
| 19 | `loadCallCutAlertInterval` | number | `config.REFRESH_INTERVAL.loadCallCutAlert = 60_000` | 同上 |
| 20 | `pendingDealRefreshInterval` | number | `config.REFRESH_INTERVAL.pendingDeal = 30_000` | 同上 |
| 21 | `rateBookPosRefreshInterval` | number | `config.REFRESH_INTERVAL.rateBookPos = 30_000` | 同上 |
| 22 | `fwdPosRefreshInterval` | number | `config.REFRESH_INTERVAL.fwdPos = 30_000` | 同上 |
| 23 | `csAccRefreshInterval` | number | `config.REFRESH_INTERVAL.csAcc = 60_000` | 同上 |
| 24 | `defMaxLenTXB` | number | `config.TEXT_LENGTH.shortInput = 30` | |
| 25 | `defMaxLenTXA` | number | `config.TEXT_LENGTH.textArea = 2000` | |
| 26 | `pipsMaxDp` | number | `config.NUMERIC_FORMAT.pipsMaxDp = 0` | |
| 27 | `rateMaxDp` | number | `config.NUMERIC_FORMAT.rateMaxDp = 6` | |
| 28 | `rateMaxDp2` | number | `config.NUMERIC_FORMAT.rateMaxDp2 = 2` | |
| 29 | `rateMaxDp3` | number | `config.NUMERIC_FORMAT.rateMaxDp3 = 8` | |
| 30 | `pctMaxDp` | number | `config.NUMERIC_FORMAT.pctMaxDp = 2` | |
| 31 | `amtMaxDp` | number | `config.NUMERIC_FORMAT.amtMaxDp = 0` | |
| 32 | `amtMaxDp2` | number | `config.NUMERIC_FORMAT.amtMaxDp2 = 2` | |
| 33 | `defDigitAftDecPoint` | number | `config.NUMERIC_FORMAT.defDigitAftDecPoint = 6` | |
| 34 | `defDigitAftDecPointMkt` | number | `config.NUMERIC_FORMAT.defDigitAftDecPointMkt = 6` | |
| 35 | `manualPriceDiffRate` | number | `config.NUMERIC_FORMAT.manualPriceDiffRate = 15` | |
| 36 | `menu` | string | `config.BUSINESS_RULES.defaultMenu = 'D'` | |
| 37 | `internalCif` | string | `config.INTERNAL_ACCOUNT.cif = 'INTERNAL'` | |
| 38 | `internalCustName` | string | `config.INTERNAL_ACCOUNT.customerName = 'INTERNAL'` | |
| 39 | `userWarningMsg` | string | `RuntimeConfig.userWarningMsg`（运行时字段，暂空） | 旧客户端登录后弹警告 |
| 40 | `forcePwdChange` | boolean | `config.BUSINESS_RULES.forcePwdChange = false` | |
| 41 | `spreadLayerMax` | number | `config.BUSINESS_RULES.spreadLayerMax = 3` | |
| 42 | `systemCode` | string | `UserSession.systemCode` / `SystemInfo.systemCode` | 来自 GetSessionKeyServlet + getSystemInfo |
| 43 | `debug` | boolean | `MOCK_ENABLED`（来自 `src/mock/index.ts`） | 含义已变（mock 开关，非日志开关） |
| 44 | `localCcy` | string | `UserSession.localCcy` / `SystemInfo.localCcy` | 来自 GetSessionKeyServlet + getSystemInfo |
| 45 | `entityName` *(新增)* | string | `UserSession.entityName` / `SystemInfo.entityName` | 新项目新增字段 |

---

## 2. 新项目的三处配置来源

```
┌───────────────────────────────────────────────────────────────┐
│  启动期常量（src/api/config.ts）                                │
│   - URL: PULL_URL / PUSH_URL / LOGIN_URL / GET_SESSION_KEY_URL│
│   - 超时: AJAX_TIMEOUT / KEEPALIVE_INTERVAL                   │
│   - 精度: NUMERIC_FORMAT                                       │
│   - 文本长度: TEXT_LENGTH                                      │
│   - 刷新间隔: REFRESH_INTERVAL                                 │
│   - 内部账户: INTERNAL_ACCOUNT                                 │
│   - 业务限定: BUSINESS_RULES                                   │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼  业务模块 import
┌───────────────────────────────────────────────────────────────┐
│  运行时配置（useAuthStore.session → getRuntimeConfig()）        │
│   - sessionKey / env / version / language                     │
│   - systemCode / entityCode / entityName / localCcy / sysEnv  │
│   - userWarningMsg                                             │
└───────────────────────────────────────────────────────────────┘
                              ▲
                              │  服务端响应
┌───────────────────────────────────────────────────────────────┐
│  部署期配置（.env / .env.mock）                                │
│   - VITE_PULL_URL / VITE_LOGIN_URL / VITE_GET_SESSION_KEY_URL │
│   - VITE_USE_MOCK / VITE_MOCK_LATENCY                         │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. 哪些字段是"业务请求 NetMsgMeta 必填"？

下列字段**每次业务请求**都会注入 `NetMsgMeta`，缺失会导致后端返回 -10110003：

| 字段 | NetMsgMeta key | 来源 |
|---|---|---|
| sessionKey | `snk` | login() → GetSessionKeyServlet |
| env | `env` | login() → GetSessionKeyServlet |
| version | `v` | login() → GetSessionKeyServlet |
| language | `l` | 登录表单用户选择 |
| entityCode | `euc`（= entityCode? 待 `buildNetMsg` 确认） | login() → GetSessionKeyServlet |
| systemCode | (implied via entity / ch=systemCode?) | login() → GetSessionKeyServlet |

> 业务请求构造详见 `src/api/request.ts:buildNetMsg()`。

---

## 4. 已修复的 -10110003 根因

旧 Login 页在 `setSession()` 时硬编码空值，导致 `buildNetMsg` 注入 NetMsgMeta 时
`env=''` / `entityCode=''` / `systemCode=''` / `localCcy=''`，后端 session 校验失败。

修复（2026-07-08）：
1. `src/api/request.ts` `login()` 返回值扩展为携带 `env / systemCode / entityCode / entityName / localCcy`
2. `src/pages/Login/index.tsx` 不再硬编码 `''`，改用 `result.xxx || ''`
3. `src/api/config.ts` 集中定义所有运行配置常量，提供 `getRuntimeConfig()` 快照

---

## 5. 哪些字段暂时不需要？

下列旧 config 字段新项目**主动不实现**，原因：

| 字段 | 不实现的原因 |
|---|---|
| `locale` (5) | language 数字码已足够；BCP-47 子标签无业务价值 |
| `jsonDir / jsonFilePrefix / templateDir / jsDir` (6-9) | 客户端 i18n 路径；新项目 server-driven，无需客户端加载 |
| `debug` (43) | 改用 `MOCK_ENABLED` 开关；调试日志由 Vite dev tools 提供 |
| 8 个轮询定时器 (16-23) | 占位常量已定义在 `REFRESH_INTERVAL`，但**未启用**任何 setInterval；业务模块接入时再启用 |
| 8 个精度字段 (26-34) | 占位常量已定义在 `NUMERIC_FORMAT`；业务模块做手工报价时引用 |

---

## 6. 后续接入步骤

业务模块（如 CcyPair / Cpty / FxAccount 等）接入时按以下步骤引用本配置：

```tsx
import { NUMERIC_FORMAT, REFRESH_INTERVAL, getRuntimeConfig } from '@/api/config';
import { usePolling } from '@/api/refresh';

function CcyPairPage() {
  // 1. 数字格式化
  const rateDp = NUMERIC_FORMAT.rateMaxDp;

  // 2. 轮询数据
  const { data, refresh } = usePolling(
    'rateBookPos',
    async () => sendRequest('xxGridMsg_GetRateBook', {}, 'G'),
    { intervalMs: REFRESH_INTERVAL.rateBookPos }
  );

  // 3. 运行时配置（如显示当前机构）
  const cfg = getRuntimeConfig();
  // cfg.entityCode, cfg.localCcy, ...

  // ...
}
```

---

## 7. 关联文档

- `_shared/01_SessionAuth.md` —— 登录与会话机制详解
- `_shared/00_MigrationOverview.md` —— 整体迁移策略
- `progress/00_Login.md` —— 登录模块迁移进展
- `src/api/config.ts` —— 本文档对应代码
- `src/api/refresh.ts` —— 轮询 Hook 与命令式 API