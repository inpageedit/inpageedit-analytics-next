<div align="center">

[<img src="https://www.ipe.wiki/images/logo/ipe-next-uwu.png" width="280" alt="InPageEdit Logo">](https://www.ipe.wiki)

# InPageEdit Analytics NEXT

📊 InPageEdit 全球使用统计与数据分析平台

**InPageEdit Analytics NEXT** 是为 InPageEdit NEXT 开发的数据统计分析平台。实时收集并展示全球 InPageEdit 用户的使用数据，包括使用量趋势、活跃用户、接入站点等统计信息，为 InPageEdit 的发展和改进提供数据支持。

→ <https://analytics.ipe.wiki> ←

</div>

## ✨ 主要特性

- 📈 **实时统计** - 展示全球 InPageEdit 使用量、用户数、站点数等核心指标
- 📊 **趋势分析** - 可视化展示使用量随时间变化的趋势图表
- 🏆 **排行榜** - 展示最活跃的用户和接入站点排行
- ⚡ **高性能** - 基于 Cloudflare Workers + D1 数据库，全球边缘节点部署
- 🎨 **现代 UI** - 使用 Nuxt 4 + Nuxt UI 打造，美观流畅的用户体验

## 🚀 技术栈

- **框架**: [Nuxt 4](https://nuxt.com/) - Vue.js 服务端渲染框架
- **UI 组件**: [Nuxt UI](https://ui.nuxt.com/) - 基于 Tailwind CSS 的组件库
- **数据库**: [Cloudflare D1](https://developers.cloudflare.com/d1/) - 边缘数据库
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- **图表**: [Apache ECharts](https://echarts.apache.org/) - 数据可视化库
- **部署**: [Cloudflare Pages](https://pages.cloudflare.com/) - 边缘部署

## 🛠️ 开发指南

### 环境要求

- Node.js 18+
- pnpm 8+
- Cloudflare 账号（用于部署）

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
# 启动开发服务器（端口 20105）
pnpm dev

# 生成数据库迁移
pnpm drizzle:generate

# 应用数据库迁移（本地）
pnpm drizzle:push

# 查看数据库（本地）
pnpm drizzle:studio
```

### 构建部署

```bash
# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview

# 应用数据库迁移（生产环境）
pnpm drizzle:push-prod
```

## 📊 数据库结构

项目使用 Drizzle ORM + Cloudflare D1 存储数据，主要表结构：

- **wiki_site** - Wiki 站点信息
- **wiki_user** - Wiki 用户信息
- **event_log** - 使用事件日志

## 🔌 API 接口

项目提供 RESTful API 接口用于数据查询：

- `GET /api/v6/usage/total` - 获取总体统计
- `GET /api/v6/usage/daily` - 获取每日趋势
- `GET /api/v6/leaderboard/user` - 用户排行榜
- `GET /api/v6/leaderboard/site` - 站点排行榜

详细 API 文档请查看源码中的类型定义和接口实现。

## 📄 许可证

> [MIT License](https://opensource.org/licenses/MIT)
>
> InPageEdit Analytics NEXT Copyright © 2025-present dragon-fish

See more: [InPageEdit NEXT](https://github.com/inpageedit/inpageedit-next)
