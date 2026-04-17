# 鲸选数据

短视频&直播电商数据分析平台。

当前项目基于 React Router 构建，目前采用：

- React Router Framework Mode
- SPA 模式（`ssr: false`）
- TypeScript
- Tailwind CSS
- pnpm

## 项目特性

- 基于 Vite 的快速开发体验
- 支持热更新（HMR）
- 静态资源打包与优化
- 路由级数据加载
- 默认启用 TypeScript
- 使用 Tailwind CSS 进行样式开发
- 可参考 [React Router 官方文档](https://reactrouter.com/)

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发环境

```bash
pnpm dev
```

启动后可在 `http://localhost:5173` 访问应用。

## 生产构建

执行以下命令生成生产环境构建产物：

```bash
pnpm build
```

## 部署说明

当前项目使用 React Router 的 SPA 模式，因此部署时通常发布 `build/client` 目录即可。

常见部署方式包括：

- Nginx 静态托管
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- 任何支持静态资源托管的平台

部署时需要确保所有路由都回退到 `index.html`，否则刷新页面时可能出现 404。

## 目录建议

当前项目采用如下组织方式：

```text
app/
  routes/        # 路由入口文件
  pages/         # 页面模块
  components/    # 通用组件
  hooks/         # 全局 hooks
  lib/           # 工具函数
```

其中：

- `routes` 只负责路由入口、`meta`、`clientLoader` 等路由导出
- `pages` 负责页面自身的 UI 和页面内数据组织
- `components` 放跨页面复用的组件
- `hooks` 放统一管理的 hooks
- `lib` 放通用工具函数

## 样式

项目已预先配置好 [Tailwind CSS](https://tailwindcss.com/)，可直接开始编写样式。

## 参考资料

- [React Router 文档](https://reactrouter.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

---

使用 React Router 构建。
