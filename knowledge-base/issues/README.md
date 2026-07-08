# 问题索引

> 迁移过程中遇到的已知问题和解决方案。

---

## 未解决

### #001 - sessionKey 无法获取
- **状态**: 等待后端接口
- **现象**: `getSystemInfo` 返回 `(PSE10110001) Login session expired`
- **原因**: sessionKey 存储在服务端 HTTP Session，JSP 通过 `<%= %>` 嵌入页面，React 无法获取
- **方案**: 后端新增 `/settocbcBoServer/GetSessionKeyServlet`，从 HTTP Session 读取 sessionKey 返回 JSON
- **详细**: [../_shared/01_SessionAuth.md](../_shared/01_SessionAuth.md)

### #002 - Cookie Path 不匹配
- **状态**: 设计中
- **现象**: JSESSIONID Cookie (Path=/settocbcBoServer) 不会随 /BOAppPullServlet 请求发送
- **原因**: 浏览器 Cookie 路径匹配规则
- **方案**: 新接口使用 `/settocbcBoServer/` 前缀路径；业务接口通过消息体 snk 验证，不依赖 Cookie

---

## 已解决

### #003 - 密码加密不匹配 → 已解决
- **方案**: 实现 securityEncode 算法，与旧系统 `securityUtil.encode` 一致

### #004 - 登录成功判断错误 → 已解决
- **方案**: HTTP 200 即为登录成功，不需要检查响应内容
