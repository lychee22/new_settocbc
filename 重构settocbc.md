# 重构settocbc

## 模块划分

登录注销、主设定设置、下单、查询、报表模块、审批草稿功能

## 差异化分析

### 登陆注销

差异：整页跳转-》ajax跳转

> 旧系统登录为整页跳转流程如下：
>
> 登录 form POST → 后端建 session → forward 到 JSP → JSP 把 sessionKey 写进
>
> ​                                                      ↑
>
> ​                              下一页的 JS 从 window 上下文里直接读到 sessionKey

> 新系统登录采用ajax不刷新页面跳转

| 环节                | 旧系统                        | 新系统                                   |
| :------------------ | :---------------------------- | :--------------------------------------- |
| **登录方式**        | 整页 `<form>.submit()` 跳转   | AJAX `fetch`（不刷新页面）               |
| **sessionKey 传递** | JSP 服务端渲染嵌入 `<script>` | `GetSessionKeyServlet` 返回 JSON         |
| **cookie**          | 靠 JSP 跳转同路径恰好带上     | 需 `setPath("/settocbcBoServer")` 显式修 |
| **版本号**          | `config.sysVer` 由 JSP 注入   | `GetSessionKeyServlet` 返回              |
| **响应处理**        | 整页 HTML 渲染                | JSON → 存 zustand → 路由跳转             |

