# MultiPayFX Settlement BackOffice - React 迁移知识库

> 记录 JSP → React 迁移过程中的技术决策、差异、踩坑记录和解决方案。

---

## 目录结构

```
knowledge-base/
├── README.md                    # 本索引文件
├── CHANGELOG.md                 # 变更记录
├── _shared/                     # 共享知识
│   ├── 00_MigrationOverview.md  # 迁移总览（技术栈对比、迁移策略）
│   └── 01_SessionAuth.md        # 会话与认证机制
│
├── progress/                    # 迁移进度
│   └── 00_Login.md              # 登录模块迁移记录
│
└── issues/                      # 已知问题与解决方案
    └── README.md                # 问题索引
```

---

## 技术栈对比

| 层级 | 旧系统 | 新系统 |
|------|--------|--------|
| 框架 | JSP + jQuery | React 18 + TypeScript |
| UI | Materialize CSS + DataTables | Ant Design 5 |
| 构建 | 无 (服务端渲染) | Vite |
| 状态管理 | 全局变量 (cache/config) | Zustand + persist |
| 路由 | 服务端页面跳转 | React Router 6 |
| 通信 | NetMessage (JSON+Base64) | NetMessage (JSON+Base64) - 不变 |
| 部署 | Java Servlet 容器 | Nginx 独立部署 |

---

## 迁移原则

1. **保持通信协议不变** - NetMessage (JSON+Base64) 格式完全兼容
2. **保持后端不变** - 不修改现有后端逻辑（必要时新增接口）
3. **渐进式迁移** - 模块逐步迁移，通过 qiankun 微前端共存
4. **保持 URL 路由** - 新旧系统共享同一套路由

---

## 快速导航

- [迁移总览](./_shared/00_MigrationOverview.md)
- [会话与认证](./_shared/01_SessionAuth.md)
- [登录模块进度](./progress/00_Login.md)
- [问题索引](./issues/README.md)

---

## 参考文档

- [旧项目知识库](../../knowledge-base/README.md) - JSP 系统的完整业务逻辑和 API 文档
