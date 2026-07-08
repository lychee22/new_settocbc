# 迁移总览

> 旧系统 (JSP+jQuery) → 新系统 (React+TypeScript) 的迁移策略和架构差异。

---

## 1. 架构差异

### 旧系统架构
```
浏览器 → JSP (服务端渲染) → jQuery DOM 操作 → AJAX (NetMessage) → Java Servlet → GridServer → Oracle
```

### 新系统架构
```
浏览器 → React SPA (客户端渲染) → fetch (NetMessage) → Vite Proxy → Java Servlet → GridServer → Oracle
```

### 关键差异

| 项目 | 旧系统 | 新系统 | 影响 |
|------|--------|--------|------|
| 渲染方式 | 服务端 (JSP) | 客户端 (React) | sessionKey 无法通过 JSP 嵌入 |
| Cookie | 同域同路径，自动携带 | Vite 代理，路径可能不匹配 | 需要特殊处理 Cookie Path |
| 状态管理 | 全局变量 `cache`/`config` | Zustand store (带 persist) | 状态持久化方式不同 |
| 页面导航 | 整页刷新 / iframe Tab | React Router + Tab 组件 | 路由和 Tab 逻辑完全重写 |
| 错误处理 | `ui.helper.showErrorPopup(resp.e)` | Ant Design message/modal | 错误信息保留后端原文 |

---

## 2. 通信层映射

### 旧系统
```javascript
// app.addMetaData 添加认证元数据
conn.sendRequest(data, { callback: function(resp) { ... } });
```

### 新系统
```typescript
// sendAuthRequest 自动添加认证元数据
import { sendAuthRequest } from '../api/request';
const result = await sendAuthRequest<T>({ n: 'messageName' }, session);
```

### 元数据对比

旧系统 `app.addMetaData` 添加的字段（来自 `cache` 对象）：

| 字段 | 旧系统来源 | 新系统来源 | 备注 |
|------|-----------|-----------|------|
| `euid` | `cache._loginID` | `session.loginID` | 一致 |
| `uid` | `cache._loginID` | `session.loginID` | 一致 |
| `snk` | `cache._sessionKey` | `session.sessionKey` | **需要后端新接口获取** |
| `scid` | `cache._securityID` | `session.securityID` | 默认 `?` |
| `env` | `cache._env` | `session.env` | 需要 getSystemInfo 后获取 |
| `l` | `config.lang` | `session.language` | 一致 |
| `euc`/`uc` | `cache._compID` (固定1) | 固定 1 | 一致 |
| `acc` | `cache._accID` (固定`?`) | 固定 `?` | 一致 |
| `ch` | `cache._channel` | null | 一致 |
| `extuid` | `cache._extUserID` | null | 一致 |
| `t` | `cache._accessToken` | 固定 `?` | 一致 |
| `v` | `config.sysVer` | 固定版本号 | 一致 |

---

## 3. 旧系统前端文件对应关系

| 旧文件 | 作用 | 新系统对应 |
|--------|------|-----------|
| `login.js` | 登录逻辑 | `src/pages/Login/index.tsx` |
| `app.js` | 全局逻辑、元数据、推送 | `src/api/request.ts` (sendAuthRequest) |
| `cache.js` | 全局状态 | `src/stores/authStore.ts` + `tabStore.ts` |
| `conn.js` | 网络请求 | `src/api/request.ts` |
| `ui.js` | UI 工具、弹窗、加载状态 | Ant Design 组件 |
| `config.js` | 配置常量 | 环境变量 + 常量 |
| `func.rpt.js` | 报表功能 | 待实现 |
| `functions.mfxbo.js` | 业务函数库 | 待实现 |

---

## 4. 迁移策略

### 阶段一：基础框架（当前）
- [x] 登录功能
- [x] Tab 系统
- [x] 会话超时管理
- [x] API 通信层
- [ ] sessionKey 获取（等待后端接口）

### 阶段二：主数据设置
- [ ] Currency Setup
- [ ] Currency Pair Setup
- [ ] Counterparty Setup
- [ ] GL Posting Setup

### 阶段三：数据录入与查询
- [ ] FX Contract Entry
- [ ] FX Utilization Entry/Amend
- [ ] FX Contract Inquiry
- [ ] FX Utilization Inquiry

### 阶段四：微前端集成
- [ ] qiankun 集成
- [ ] 新旧系统共存
- [ ] Nginx 独立部署
