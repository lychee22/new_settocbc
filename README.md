# MultiPayFX Settlement - BackOffice (React重构版)

## 项目概述

本项目是对原有 Java JSP 的 MultiPayFX Settlement BackOffice 系统进行前端重构，采用 React + TypeScript + Ant Design 技术栈。

## 技术栈

- **前端框架**: React 18
- **语言**: TypeScript 5
- **UI 库**: Ant Design 5
- **路由**: React Router 6
- **状态管理**: Zustand
- **微前端框架**: qiankun (规划中)
- **构建工具**: Vite
- **代理/部署**: Nginx

## 项目结构

```
new_settocbc/
├── src/
│   ├── api/                    # API 请求封装
│   │   ├── index.ts
│   │   └── request.ts
│   ├── components/             # 公共组件（待扩展）
│   ├── pages/
│   │   ├── Login/             # 登录页
│   │   ├── Layout/            # 基础布局
│   │   ├── MasterSetup/       # Master Setup 模块
│   │   │   ├── CurrSetup/     # 货币设置
│   │   │   ├── CurrPairSetup/ # 货币对设置
│   │   │   ├── CounterPartySetup/  # 交易对手设置
│   │   │   └── GlPostingSetup/     # GL过账设置
│   │   └── Inquiry/           # 查询模块
│   │       └── FxUtilizationInq/   # FX利用率查询
│   ├── routes/                # 路由配置
│   ├── stores/                # 状态管理
│   │   └── authStore.ts       # 认证状态
│   ├── styles/                # 样式文件
│   ├── types/                 # TypeScript 类型定义
│   └── utils/                 # 工具函数
├── dist/                      # 构建输出目录
├── nginx.conf.example         # Nginx 配置示例
└── vite.config.ts             # Vite 配置
```

## 路由结构

| 路径 | 页面 | 状态 |
|------|------|------|
| `/new-login` | 登录页 | 已完成 |
| `/admin/master/curr-setup` | Currency Setup | 待实现 |
| `/admin/master/curr-pair-setup` | Currency Pair Setup | 待实现 |
| `/admin/master/counter-party-setup` | Counter Party Setup | 待实现 |
| `/admin/master/gl-posting-setup` | GL Posting Setup | 待实现 |
| `/admin/inquiry/fx-utilization` | FX Utilization Inquiry | 待实现 |

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 登录流程

1. 用户访问 `/new-login`
2. 输入用户名、密码、语言
3. 调用后端 `BOAppLoginServlet`
4. 登录成功后跳转到 `/admin`
5. 未登录用户访问 `/admin` 会重定向到 `/new-login`

## 与旧系统集成

### Vite 开发服务器代理

`vite.config.ts` 中已配置代理，解决跨域问题：

- `/BOAppLoginServlet` -> `http://localhost:8080`
- `/BOAppPullServlet` -> `http://localhost:8080`
- `/FOAdminPushServlet` -> `http://localhost:8080`

### Nginx 生产部署

参考 `nginx.conf.example` 配置反向代理。

## 后续开发计划

### Phase 1: 基础设施 (已完成)
- [x] 项目骨架搭建
- [x] 路由配置
- [x] 登录页面
- [x] 基础布局

### Phase 2: 公共组件
- [ ] UI 组件封装（参考 ui.js）
- [ ] 国际化方案
- [ ] 报表功能（参考 func.rpt.js）
- [ ] 审批功能组件

### Phase 3: 业务模块
- [ ] Currency Setup
- [ ] Currency Pair Setup
- [ ] Counter Party Setup
- [ ] GL Posting Setup
- [ ] FX Utilization Inquiry

### Phase 4: 微前端集成 (规划中)
- [ ] qiankun 集成
- [ ] 新旧前端共存

## 注意事项

1. **Session 管理**: 保持原有 Session 机制不变，使用 Cookie 进行会话管理
2. **API 接口**: 继续使用现有的 NetMessage JSON 格式
3. **样式主题**: Ant Design 默认主题，可根据需要调整
