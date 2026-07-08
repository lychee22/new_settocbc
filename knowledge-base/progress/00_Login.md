# 登录模块迁移记录

---

## 状态：前端已完成，待后端联调

> 前端登录链路已通（含容错降级）。端到端走通需后端先完成 2 处改动（见下文「后端依赖」）。

---

## 1. 新系统登录流程（已实现）

```
用户输入 用户名/密码/语言，勾选 Remember Me
                        │
                        ▼
   1. 前端密码加密 securityEncode(password)        ← 与旧系统完全一致
      （char 运算 → reverse → Base64）
                        │
                        ▼
   2. POST /settocbcBoServer/BOAppLoginServlet     ← AJAX fetch（非整页跳转）
      body: sfUserLoginID / sfUserPassword(加密) / sfUserLanguage
      credentials: 'include'
                        │ 200
                        ▼
   3. 后端建 HTTP Session（旧代码，不改）
      session.boappUserSessionKey = sessionKey
      session.boappUserEnv        = env
      + 写 secID cookie（需后端改动2：setPath）
                        │
                        ▼
   4. GET /settocbcBoServer/GetSessionKeyServlet   ← 后端改动1 新增
      （浏览器自动带 JSESSIONID cookie，同上下文路径匹配）
                        │ 200 { sessionKey, env, version, ... }
                        ▼
   5. 存入 authStore (zustand)
      sessionKey / env / version → 后续业务请求的 metadata 字段
      + Remember Me：勾选→localStorage 存用户名；取消→清除
                        │
                        ▼
   6. navigate('/admin')                           ← React Router 客户端跳转
                        │
                        ▼
   7. 后续业务请求 POST /settocbcBoServer/BOAppPullServlet
      metadata.snk = sessionKey（消息体）
      cookie.boappsid = secID（自动携带，依赖后端改动2）
```

### 代码位置
| 步骤 | 文件 | 函数 |
|------|------|------|
| 1 密码加密 | `src/api/request.ts` | `securityEncode()` |
| 2 登录请求 | `src/api/request.ts` | `login()` → `fetch(LOGIN_URL)` |
| 4 取 sessionKey | `src/api/request.ts` | `login()` → `getSessionKey()` |
| 5 存 authStore | `src/pages/Login/index.tsx` | `setAuthLogin(session)` |
| 5 记住用户名 | `src/pages/Login/index.tsx` | `saveUsername()` / `clearSavedUsername()` |
| 6 跳转 | `src/pages/Login/index.tsx` | `navigate('/admin')` |
| 7 业务请求 | `src/api/request.ts` | `sendAuthRequest()` → `buildNetMsg()` 注入 18 字段 metadata |

---

## 2. 与旧系统的差异（核心：整页跳转 → AJAX）

> **所有差异都源于一个改变：登录从整页 `<form>.submit()` 跳转，变成 AJAX `fetch`。**
> AJAX 打破了旧系统「JSP 服务端渲染传递 sessionKey」的链路，新系统需补 2 处口子。

### 2.1 差异总表

| 环节 | 旧系统 | 新系统 | 差异原因 |
|------|--------|--------|----------|
| **登录方式** | 整页 `<form>.submit()` 跳转 | AJAX `fetch`，不刷新页面 | React SPA 必然 AJAX |
| **sessionKey 获取** | JSP 渲染嵌入 `<script>` | `GetSessionKeyServlet` 返回 JSON（**新增**） | AJAX 拿不到 JSP 渲染内容 |
| **版本号来源** | JSP 注入 `config.sysVer` | `GetSessionKeyServlet` 返回 `version` | 同上 |
| **secID cookie** | 整页跳转恰好同路径，默认 path 能用 | 必须 `setPath("/settocbcBoServer")`（**修补**） | AJAX 跨路径带不上 cookie |
| **响应处理** | 整张 HTML 页面渲染 | 状态码 + cookie，JSON 存 zustand | — |
| **路由控制** | 后端 forward 决定页面 | React Router 客户端 `navigate` | SPA |
| **会话存储** | 全局对象 `cache._*` | zustand `authStore.session` | — |
| **密码加密** | `securityUtil.encode` | `securityEncode`（**完全一致**） | 刻意保持，零差异 |

### 2.2 sessionKey 获取方式对比（最大差异）

**旧系统**（靠 JSP 服务端渲染，1 次请求搞定）：
```jsp
<%-- boadmin.jsp（Admin 通道）--%>
cache._sessionKey = "<%= sessKey %>";   // 后端读 session 渲染到 HTML
```
下一页 JS 从全局 `cache` 对象直接读到。

**新系统**（必须显式再发请求，2 次请求）：
```
登录 AJAX 成功 → 响应是 botrans.jsp 跳板页（不含 sessionKey）
              → 再 GET GetSessionKeyServlet → 拿到 JSON
```

> ⚠️ 注意：App 通道的 `botrans.jsp` 本就是跳板页，**旧系统在浏览器侧也取不到 sessionKey**（它本就给原生 App 用，sessionKey 由原生层持有）。新系统补 `GetSessionKeyServlet` 让浏览器 AJAX 也能取到。

### 2.3 cookie path 问题，旧系统"恰好规避"

```
旧系统（整页跳转）：登录后 URL 在 /settocbcBoServer/ 下 → 后续请求同路径 → cookie 默认 path 恰好能用
新系统（AJAX）：    cookie 默认 path 锁在 /BOAppLoginServlet → 业务请求 /BOAppPullServlet 带不上
```
故新系统必须 `setPath("/settocbcBoServer")` 显式修。

### 2.4 一图总览

```
旧系统（整页跳转）:
  form.submit → 后端建session + forward JSP → JSP渲染sessionKey进HTML → JS读取
                    └── cookie path 恰好对 ──┘   （1次请求）

新系统（AJAX）:
  fetch登录 → 后端建session → ①GET取sessionKey ②setPath修cookie → 存store → 路由跳转
                              └─ 这两步是旧系统不需要的 ─┘          （2次请求）
```

---

## 3. 后端依赖（端到端走通的前提）

前端登录链路已实现并含容错降级。但要真正走通业务请求，后端需做 **2 处改动**（其余零改动）：

| 改动 | 必须 | 解决问题 | 不做的后果 |
|------|------|----------|------------|
| **改动1** 新增 `GetSessionKeyServlet` | ✅ | sessionKey 取不出来 | 所有业务请求失败（无 snk） |
| **改动2** `saveSecurityIDToCookie` 加 `setPath("/settocbcBoServer")` | ✅ | cookie 带不到业务请求 | validateSecurityID 报会话失效 |

> 实现规格见 `_shared/01_SessionAuth.md` 第 3 节。

### 当前状态
- ✅ 前端：`login()` → `getSessionKey()` 链路已实现，GetSessionKeyServlet 不可用时降级（控制台警告，不中断登录）
- ❌ 后端：GetSessionKeyServlet 未部署（返回 404），secID cookie path 未修
- ⏳ 联调需后端先完成改动1 + 改动2

### 验证后端改动是否生效（5 步检查）
1. `BOAppLoginServlet` 返回 200
2. `GetSessionKeyServlet` 返回 200 + JSON（**验证改动1**）
3. F12 → Application → Cookies → `boappsid` 的 Path = `/settocbcBoServer`（**验证改动2**，测前先清旧 cookie）
4. `BOAppPullServlet` 请求头 Cookie 含 `boappsid`（验证 cookie 带上了）
5. `BOAppPullServlet` 响应解码 `sts: 0`（端到端通）

---

## 4. 完成情况

### 已完成（前端）
- [x] 登录页面 UI (Ant Design)
- [x] 密码加密 securityEncode（与旧系统一致）
- [x] 记住用户名（localStorage，已修同步读取 bug）
- [x] 语言选择 (English / 繁体中文)
- [x] 登录 AJAX 请求 + 容错降级
- [x] authStore (Zustand + persist) 存储登录状态（含 version 字段）
- [x] 会话超时管理 (10分钟超时 + 60秒预警)
- [x] 登出功能 (loginSessionGridMsg_Logout)
- [x] Tab 系统 (多标签页 + 面包屑 + 页面状态保持)
- [x] 基础布局 (Header 信息展示、侧边菜单)
- [x] API 通信层 (sendRequest / sendAuthRequest，18 字段 metadata)
- [x] 错误信息保留后端原文
- [x] credentials: 'include' 确保发送 Cookie
- [x] GetSessionKeyServlet 不可用时降级 + 控制台明确警告

### 已修复
- [x] Bug: servlet 名 BOPullServlet → BOAppPullServlet（web.xml 核实，404 根因）
- [x] Bug: Remember Username 无效（initialValues 异步设置时机问题）
- [x] Bug: GetSessionKeyServlet 404 前端容错降级

### 待解决
- [ ] sessionKey 获取 → 等待后端新增 GetSessionKeyServlet
- [ ] getSystemInfo (sysParamSetupGridMsg_GetSysDate) → 依赖 sessionKey
- [ ] 系统信息展示 (sysdate, entityCode 等) → 依赖 getSystemInfo
- [ ] secID cookie setPath → 等待后端修补

---

## 5. 文件清单

| 文件 | 说明 |
|------|------|
| `src/pages/Login/index.tsx` | 登录页面（含 Remember Me 同步读取） |
| `src/api/request.ts` | API 请求层 (login, sendRequest, sendAuthRequest, getSessionKey, getSystemInfo, logout, sendReportRequest) |
| `src/stores/authStore.ts` | 认证状态 (isAuthenticated, session, systemInfo) |
| `src/types/netmessage.ts` | NetMessage 通用类型 (NetMsgMeta 18 字段, DataTable*, ApiResult) |
| `src/stores/tabStore.ts` | Tab 状态管理 |
| `src/hooks/useSessionTimeout.ts` | 会话超时 Hook |
| `src/hooks/useSystemInfo.ts` | 系统信息获取 Hook |
| `src/utils/storage.ts` | localStorage 工具 (记住用户名) |
| `src/components/Breadcrumb/TabBar.tsx` | Tab 栏组件 |
| `src/components/Breadcrumb/MultiTabRouter.tsx` | 多 Tab 路由 |
| `src/pages/Layout/BasicLayout.tsx` | 主布局 |
