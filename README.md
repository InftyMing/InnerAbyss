# 观渊 · InnerAbyss

> 命运是轨迹，不是预言 · See into the depths, know yourself

融合传统八字命理 + 紫微斗数 + 现代心理学 + AI 透明推理的 Web 算命 / 自我认知应用。

面向 18–30 岁"清醒算命"群体（半信半疑、把占卜当自我认知工具），用宋朝极简国风的 UI 取代神秘暗黑风，每个 AI 结论都附带可折叠的"推理链"，并支持中英双语切换与多账户数据隔离。

**在线访问**：http://47.237.107.46:8090 （已部署在阿里云轻量服务器，Docker 容器化）

---

## 核心差异化

| 竞品通病 | 观渊的做法 |
|---|---|
| 界面神秘暗黑，不适合截图分享 | 宋朝极简 × 现代设计，墨色 + 珊瑚 + 留白 |
| 结论模糊，无法验证 | 每个 AI 结论附带「推理链」折叠面板，引用具体干支五行依据 |
| 一次性体验，无留存 | 「册」命运日记：记录预测 → 现实对照，统计准确率 |
| 割裂命理与现实 | 命理 + 心理学双轨解读，降低信仰门槛 |
| 千篇一律的"未来" | 「迹」平行时空时间轴：主线 + 备选 + 用户假设的"如果当时…"分支 |
| 单一中文 | 全站中英双语（i18n 250+ keys），AI 提示词按 locale 分支 |

---

## 七大模块

```
命 ──┬──> 卦 ──> 问 (深度追问)
     │
     ├──> 签 (× 流日干支)
     ├──> 梦
     │
     └──> 册 ──> 迹 (平行时空)
              ↑
              └── AI 主线/备选预测 + 用户假设分支
```

| 模块 | 路径 | 功能 |
|---|---|---|
| **命** | `/ming` | 八字四柱 + 五行分布 + 日主分析 + **紫微斗数卡片**（命宫/身宫/五行局/紫微入宫/主星） |
| **卦** | `/gua` | 五维深度解读（事业/感情/健康/财富/成长）+ 透明推理链 + 追问 |
| **问** | `/wen` | 基于命盘的 AI 流式对话（命盘作为 system prompt 上下文，自然散文体回复） |
| **签** | `/qian` | 今日运签（基于命盘 × 流日干支，非随机，含宜忌建议） |
| **梦** | `/meng` | 梦境符号解析 + 命理关联 + 自定义情绪标签 |
| **册** | `/ce` | 命运日记（预测 vs 现实，统计准确率）+ 人生事件管理 |
| **迹** | `/ji` | **平行时空时间轴**：横向点·线 SVG，主线灰 + 备选紫 + 假设分支深色虚线 |

---

## 技术栈

```
Frontend     Next.js 16 (App Router, Turbopack) + React 19 + TypeScript 5
Styling      Tailwind CSS v4 (@theme 自定义配色) + Framer Motion
State        Zustand + persist (按用户 email 命名空间隔离 localStorage)
i18n         自研 useT() hook + zh.ts/en.ts 字典 (250+ keys)
Auth         NextAuth.js v5 (Credentials Provider + JWT session)
Database     SQLite (better-sqlite3，直接 SQL，绕过 Prisma v7 适配器)
AI           阿里云百炼 (DashScope, OpenAI 兼容接口)
             - qwen-plus  深度任务 (命盘解读/人生轨迹/平行分支)
             - qwen-turbo 低延迟 (问·对话流式/签/梦/追问)
紫微         自研紫微斗数计算 (命宫/身宫/五行局/紫微入宫 + 14 主星)
分享         html2canvas (命盘卡片导出 PNG)
部署         Dockerfile (3 阶段) + Next.js standalone output (镜像 ~422MB)
```

完整依赖见 [`package.json`](package.json)，详细技术决策见 [`context.md`](context.md)。

---

## 快速开始

### 本地开发

```bash
git clone https://github.com/InftyMing/InnerAbyss.git
cd InnerAbyss
npm install

cp .env.local.example .env.local   # 填入 DASHSCOPE_API_KEY 与 AUTH_SECRET
npm run dev                        # http://localhost:3000
```

### 环境变量

参见 [`.env.local.example`](.env.local.example)。最小配置：

```bash
DASHSCOPE_API_KEY=                              # 留空则 AI 走中英双语 mock 数据,功能仍可用
AUTH_SECRET=replace_me_with_a_strong_random     # NextAuth JWT 签名,生产建议 openssl rand -hex 32
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=file:./prisma/dev.db
# 生产部署到非 localhost 时必须加:
# AUTH_TRUST_HOST=true
```

### 测试账号（本地数据库需自行注册）

`/register` 注册后即可用；线上库已有：

| 邮箱 | 密码 |
|---|---|
| `bugfree@test.com` | `12345678` |
| `observer@test.com` | `12345678` |

> 同一浏览器切换账号，数据完全隔离（每个邮箱独立 localStorage 桶）。

---

## Docker 部署

镜像基于 `node:22-bookworm-slim` + Next.js standalone output 三阶段构建。

```bash
# 本地或服务器构建
docker build -t inner-abyss:latest .

# 运行（注意挂载 prisma 目录持久化 SQLite）
docker run -d --name inner-abyss --restart=unless-stopped \
  -p 8090:3000 \
  -v $(pwd)/data/prisma:/app/prisma \
  --env-file .env.local \
  inner-abyss:latest
```

### 生产环境（阿里云轻量服务器）

完整部署位于 `root@47.237.107.46:/root/inner-abyss/`：

```bash
ssh -i CA6125.pem root@47.237.107.46

# 标准更新流程（pull → build → 重启）
cd /root/inner-abyss/repo && \
  git pull && \
  docker build -t inner-abyss:latest . && \
  docker rm -f inner-abyss && \
  docker run -d --name inner-abyss --restart=unless-stopped \
    -p 8090:3000 \
    -v /root/inner-abyss/data/prisma:/app/prisma \
    --env-file /root/inner-abyss/repo/.env.local \
    inner-abyss:latest

# 查看日志
docker logs -f --tail 100 inner-abyss
```

> 阿里云轻量服务器的"防火墙"在控制台独立配置（与 ufw 不是同一套），需要手动放行 TCP 8090。

---

## 项目结构

```
src/
├── app/
│   ├── (auth)/                   未登录页组 (i18n)
│   │   ├── login/  register/
│   ├── (main)/                   认证守卫后的主应用
│   │   ├── ming/  gua/  wen/  qian/  meng/  ce/  ji/
│   ├── api/
│   │   ├── auth/[...nextauth]/   NextAuth 路由
│   │   ├── register/             用户注册
│   │   ├── fortune/              命盘 + 解读 (qwen-plus, locale-aware)
│   │   ├── chat/                 问·对话 (流式 SSE, qwen-turbo)
│   │   ├── daily-sign/           今日签 (qwen-turbo)
│   │   ├── dream/                梦境解读 (qwen-turbo)
│   │   ├── followup/             卦页面追问 (qwen-turbo)
│   │   ├── life-tree/            主线 + 备选 2 路径 (qwen-plus)
│   │   └── life-branch/          用户假设的平行分支 (qwen-plus)
│   └── globals.css               @theme 配色 + 全局样式
├── components/
│   ├── layout/                   Sidebar / TopBar / MobileNav / AuthProvider / StoreSession
│   ├── fortune/                  BirthForm / BaziPanel / ZiweiPanel / ReadingPanel /
│   │                             DailySignCard / FortuneDiary / ShareCard
│   └── ui/                       通用 UI (WuxingBadge / ScoreRing / ReasoningChain ...)
├── store/index.ts                Zustand 全局状态 + storeKeyFor() 命名空间
├── i18n/                         zh.ts / en.ts / useT() hook
├── lib/
│   ├── ai.ts                     百炼客户端 (chat + stream + 超时)
│   ├── auth.ts                   NextAuth 配置 (Credentials + JWT, trustHost)
│   ├── bazi.ts                   八字算法 (纯 TS)
│   ├── ziwei.ts                  紫微斗数算法 (命宫/身宫/五虎遁/纳音/紫微表)
│   ├── prompts.ts                AI 提示词模板 (全部 locale-aware)
│   └── db.ts                     better-sqlite3 直接 SQL 封装
└── types/index.ts                共享类型定义

prisma/schema.prisma              SQLite schema (lib/db.ts 自动建表覆盖)
Dockerfile                        3 阶段构建: deps → builder → runner
next.config.ts                    output: "standalone" + devIndicators: false
```

完整目录注释见 [`context.md §4`](context.md)。

---

## 关键设计决策

### 编码安全
所有中文字符串字面量（API/lib/i18n 字典）均使用 `\uXXXX` Unicode 转义，规避 PowerShell 批量替换 / 跨工具传输偶发的 UTF-8 损坏（曾出现命盘下方一排 `?????`）。JSX 文本节点用 `{"\uXXXX"}` 表达式形式，attribute 用 `placeholder={"\u2022..."}` 花括号包裹，避免 React 把转义符当字面量渲染。

### 错误码而非中文消息
所有 API 路由统一返回 `{ errorCode: "fortuneFailed" }` 形式，前端通过 `t.errors.<code>` 翻译显示。错误码列表集中在 `i18n/zh.ts` 的 `errors.*`。

### 数据库：绕过 Prisma v7 适配器
`src/lib/db.ts` 直接用 `better-sqlite3` 写 SQL + 自动建表，完全跳过 Prisma 运行时（v7 在 dev 环境的 adapter 兼容问题）。`prisma/schema.prisma` 仅作为文档参考保留。

### 账户级 localStorage 隔离
`StoreSession` 监听 `useSession()`，登录态变化时把 zustand persist 的 storage `name` 切换到 `guanyuan-store::<email>`（未登录用 `::guest`），并清空内存中的用户级数据后 `rehydrate()`。同一浏览器多账户登录数据完全隔离；UI 偏好（locale、sidebarCollapsed）跨账户保留。

### AI 性能：模型分级 + 流式
- `qwen-turbo`：问·对话（SSE 流式）、签、梦、追问 — 1–2s 响应
- `qwen-plus`：命盘深度解读、人生轨迹、平行分支 — 15–35s
- 全部带 `AbortController` 超时；`/api/chat` 直接管道流到前端，含光标动画 + 停止按钮
- 未配置 `DASHSCOPE_API_KEY` 时所有接口回退到内置中英双语 mock 数据，功能仍可用

### 「迹」平行时空可视化（自研，替代 ReactFlow）
横向 SVG + HTML 绝对定位实现的点·线时间轴；节点 = 8px 色点 + 年份 + 6 字内标题。三层结构：
- **主脊**：出生 → 用户记录 → 当前 → AI 主线预测
- **备选未来**：当前节点向下分叉，紫色虚曲线
- **假设分支**：任一过去节点向上分叉（用户输入"如果当时…"，后端推演 3 节点）

`predictedPaths` 不持久化（按需重新生成），`branchPaths` 持久化（用户思考资产）。

更多设计取舍与历史踩坑记录详见 [`context.md §6, §9`](context.md)。

---

## 路线图

### 当前限制
- **数据隔离仅在浏览器端**：命盘等用户数据存于 localStorage，跨设备/浏览器不同步（schema 已支持 `userId` 但暂未对接服务端持久化）
- **better-sqlite3 单线程**：并发写入会阻塞，小流量 OK
- **紫微斗数用公历日近似农历日**：UI 已标注 approximation；只展示命宫主星，未呈现完整 12 宫星盘
- **ji 页面 < 768px 横向滚动**：小屏体验略局促

### 后续可做
1. 服务端持久化命盘（命盘/事件迁移到 SQLite，跨设备同步）
2. 多命盘管理（用户为家人朋友建多个命盘）
3. 接入精确农历转换库 + 完整紫微 12 宫整盘
4. 社区 / UGC："验证帖"形成护城河
5. PWA / 离线支持
6. 百炼 API 错误指数退避自动重试
7. 数据库迁移到 PostgreSQL（线上规模化）

---

## 贡献 / 二次开发

| 修改诉求 | 直接改这里 |
|---|---|
| 新增/修改翻译 | `src/i18n/zh.ts` + `src/i18n/en.ts` |
| 改主题色 | `src/app/globals.css` 的 `@theme {}` |
| 改命理算法 | `src/lib/bazi.ts` |
| 改紫微算法/查表 | `src/lib/ziwei.ts` |
| 改 AI 提示词 | `src/lib/prompts.ts`（每个模板含中英双分支） |
| 改侧栏导航 | `src/components/layout/Sidebar.tsx` |
| 全局状态 | `src/store/index.ts` |
| 数据隔离行为 | `src/components/layout/StoreSession.tsx` |
| 切换 AI 模型 | 各 `src/app/api/*/route.ts` 中的 `model` 参数 |
| 数据库结构 | `src/lib/db.ts` `getDb()` 中的 `CREATE TABLE` |
| 迹页可视化算法 | `src/app/(main)/ji/page.tsx` `buildLayout()` |
| 紫微卡片 UI | `src/components/fortune/ZiweiPanel.tsx` |

PR / Issue 欢迎到 [GitHub Issues](https://github.com/InftyMing/InnerAbyss/issues)。

---

## License

本项目仅作个人学习与原型探索使用，命理与心理学内容仅供自我认知参考，不构成专业建议或预测保证。
