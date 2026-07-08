# 会话与认证机制

> 记录旧系统的认证流程以及迁移到 React 后的差异和解决方案。
> 本文档经源码核实（2026-07），修正了此前对 App 通道的误判。

---

## 1. 旧系统认证流程（源码核实）

旧系统有**两个独立通道**，session 属性名和落地页完全不同：

### Admin 通道（BOAdminLoginServlet → boadmin.jsp）
```
用户提交登录表单 (boadminlogin.jsp → form POST)
    ↓
POST /settocbcBoServer/BOAdminLoginServlet (BOLoginServlet.doPost)
    ↓
后端验证密码 → 创建 HTTP Session → 存储属性（boadminUser* 前缀）:
    session.setAttribute("boadminUserLoginID",   loginID)
    session.setAttribute("boadminUserSessionKey", respNetMsg.getSessionKey())
    session.setAttribute("boadminUserEnv",        respNetMsg.getEnv())
    ↓
forward 到 boadmin.jsp
    ↓
boadmin.jsp 读取 boadminUser* 属性，嵌入 JavaScript:
    cache._loginID    = "<%= loginID %>"
    cache._sessionKey = "<%= sessKey %>"   ← 从 HTTP Session 取出嵌入页面
    cache._env        = "<%= env %>"
    ↓
后续 conn.sendRequest 通过 app.addMetaData 注入 snk = cache._sessionKey
```

### App 通道（BOAppLoginServlet → botrans.jsp）⚠️ 与 Admin 不同
```
POST /settocbcBoServer/BOAppLoginServlet (BOLoginServlet.doPost)
    ↓
后端验证密码 → 创建 HTTP Session → 存储属性（boappUser* 前缀）:
    session.setAttribute("boappUserLoginID",    loginID)
    session.setAttribute("boappUserSessionKey", respNetMsg.getSessionKey())
    session.setAttribute("boappUserEnv",        respNetMsg.getEnv())
    session.setAttribute("boappUserLanguage",   userLang)
    ↓
forward 到 botrans.jsp（跳板页，源码 src/jsp/client/botrans.jsp）
    ↓
botrans.jsp 仅做 form.submit() 跳转到 _boAppURL（App 真正的落地应用）
    ⚠️ 不嵌入任何 sessionKey / loginID / env！
```

**关键真相（已源码核实）**：
- App 通道的 `botrans.jsp` **不是** boadmin.jsp，它只是一个 34 行的跳板页，不含任何 `cache.*` 注入。
- App 通道是给**原生 App** 用的（mobile/desktop client），sessionKey 由原生层持有，**浏览器侧没有任何取出 sessionKey 的机制**。
- React 重构走的是 App 通道（用户确认），所以**必须**新增 `GetSessionKeyServlet`。

---

## 2. 新系统遇到的问题

### 问题一：无法获取 sessionKey（核心死结）
- React 用 `fetch` AJAX 调 `/settocbcBoServer/BOAppLoginServlet`，登录成功
- 但 App 通道响应是 `botrans.jsp`（跳板页），**不含 sessionKey**
- sessionKey 只存在服务端 HTTP Session 里（属性名 `boappUserSessionKey`），JS 无法直接读取
- JSESSIONID 是 HttpOnly Cookie，JS 也读不到

### 问题二：secID Cookie Path 不匹配
- `BOServletUtil.saveSecurityIDToCookie`（line 608-621）**未调用 setPath**
- cookie 默认 path = 登录请求路径 `/settocbcBoServer/BOAppLoginServlet`
- 后续请求 `/settocbcBoServer/BOAppPullServlet` 不在该 path 下 → 浏览器不携带 secID cookie
- `BOPullServlet.validateSecurityID` 会抛 `ERRCODE_InvalidLoginSession`

### 问题三：版本号未知
- `BOPullServlet.validateBOVersion` 用 `checkBOFullVersion` 要求**全版本号严格相等**
- 版本号 = `BOVersion.BO_VERSION`（编译时常量）
- 旧系统通过 JSP 注入 `config.sysVer`；React 无 JSP，硬编码会在后端升级后失效

---

## 3. 解决方案：后端新增 GetSessionKeyServlet + 修 Cookie Path

### 3.1 新增 Servlet：`/settocbcBoServer/GetSessionKeyServlet`

**web.xml 配置**：
```xml
<servlet>
    <servlet-name>GetSessionKeyServlet</servlet-name>
    <servlet-class>com.prosticks.web.GetSessionKeyServlet</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>GetSessionKeyServlet</servlet-name>
    <url-pattern>/GetSessionKeyServlet</url-pattern>
</servlet-mapping>
```

**实现规格（伪代码 / Java 参考）**：
```java
public class GetSessionKeyServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        HttpSession session = req.getSession(false);
        resp.setContentType("application/json;charset=UTF-8");

        if (session == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"error\":\"no session\"}");
            return;
        }

        // App 通道属性名前缀 boappUser*（源码 BOLoginServlet.getSessionVariableName 映射）
        String sessionKey = (String) session.getAttribute("boappUserSessionKey");
        String env        = (String) session.getAttribute("boappUserEnv");

        if (sessionKey == null || sessionKey.isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"error\":\"no sessionKey\"}");
            return;
        }

        // 返回前端所需字段（version 取自 BOVersionUtil）
        JsonObject json = new JsonObject();
        json.addProperty("sessionKey", sessionKey);
        json.addProperty("env", env);
        json.addProperty("version", BOVersionUtil.getBOSystemVersion());
        // 以下可选（首屏信息，减少额外请求）
        json.addProperty("systemCode", ...);
        json.addProperty("entityCode", ...);
        json.addProperty("entityName", ...);
        json.addProperty("localCcy", ...);

        resp.getWriter().write(json.toString());
    }
}
```

**为什么用 GET 且 URL 在 `/settocbcBoServer/` 下**：
- 同上下文路径 → 浏览器自动携带 JSESSIONID cookie（路径匹配）
- GET 简单，无 body

### 3.2 修 Cookie Path：`saveSecurityIDToCookie` 加 setPath

**文件**：`src/java/com/prosticks/web/BOServletUtil.java`（line 608-621）

**修改**：在 `addCookie` 前增加 `cookie.setPath("/settocbcBoServer")`，确保 secID cookie 对同上下文所有 servlet 生效。

```java
// 修改前（line 608-621 附近）
Cookie cookie = new Cookie(cookieName, encryptedValue);
cookie.setMaxAge(...);
resp.addCookie(cookie);

// 修改后
Cookie cookie = new Cookie(cookieName, encryptedValue);
cookie.setMaxAge(...);
cookie.setPath("/settocbcBoServer");   // ← 新增：确保对同上下文所有请求生效
resp.addCookie(cookie);
```

### 3.3 前端流程（已实现，见 src/api/request.ts）
```
前端 POST /settocbcBoServer/BOAppLoginServlet → 登录成功（JSESSIONID 建立）
    ↓
前端 GET /settocbcBoServer/GetSessionKeyServlet → 浏览器携带 JSESSIONID
    ↓
后端从 Session 取 boappUserSessionKey → 返回 JSON
    ↓
前端存入 authStore.session.sessionKey / env / version
    ↓
正常调用 /settocbcBoServer/BOAppPullServlet（消息体携带 snk，cookie 携带 secID）
```

### 3.4 当前状态（2026-07）
- ✅ 前端：`login()` → `getSessionKey()` 链路已实现，GetSessionKeyServlet 不可用时降级（控制台警告，不中断登录）
- ❌ 后端：GetSessionKeyServlet **未部署**（返回 404），secID cookie path 未修
- ⏳ 联调需后端先完成 3.1 + 3.2

**Vite 代理配置**（已实现）:
```typescript
proxy: {
  '/settocbcBoServer': {
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
  },
}
```

---

## 4. 认证元数据完整格式

新旧系统发送的 NetMessage 元数据需一致：

```json
{
  "n": "sysParamSetupGridMsg_GetSysDate",
  "euid": "TEST_MAKER_N1",
  "euc": 1,
  "uid": "TEST_MAKER_N1",
  "acc": "?",
  "uc": 1,
  "sts": 0,
  "snk": "1776416538119000011",
  "sq": 0,
  "scid": "?",
  "scsts": 0,
  "v": "1.2.20260409.2059",
  "bm": 0,
  "l": 0,
  "e": null,
  "ch": null,
  "extuid": null,
  "t": "?",
  "env": "MFXDBMAIN"
}
```

### 各字段来源

| 字段 | 值 | 来源 |
|------|----|------|
| `euid` / `uid` | 登录用户名 | authStore.session.loginID |
| `snk` | sessionKey | **GetSessionKeyServlet** |
| `scid` | `?` | 固定值 |
| `env` | 系统环境 (如 MFXDBMAIN) | **GetSessionKeyServlet** |
| `v` | BO 全版本号 | **GetSessionKeyServlet**（后端 validateBOVersion 严格校验，不可硬编码） |
| `l` | 语言 | authStore.session.language |
| `euc` / `uc` | 1 | 固定值 |
| `acc` | `?` | 固定值 |

---

## 5. 密码加密

新旧系统使用相同的 `securityEncode` 算法：

```
原始密码 → 逐字符 ASCII 偏移 (奇数位+index, 偶数位+2*index) → 取模95+32 → 拼接quotient → 反转 → Base64
```

详见 `src/api/request.ts` 中的 `securityEncode` 函数。

---

## 6. 错误信息处理

**原则**: 保留后端返回的原始错误信息，不做翻译或包装。

旧系统: `ui.helper.showErrorPopup(resp.e)` 显示后端错误
新系统: `throw new Error(result.e)` → Ant Design message 显示后端错误
