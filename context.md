# 观渊 · InnerAbyss — 项目上下文

> 命运是轨迹，不是预言 · See into the depths, know yourself

---

## 1. 项目概述

| 项目 | 内容 |
|---|---|
| **品牌名** | 观渊（Guān Yuān）· InnerAbyss |
| **Slogan** | 观渊以知己 / See into the depths, know yourself |
| **定位** | 融合传统八字命理 + 紫微斗数 + 现代心理学 + AI 透明推理的 Web 算命 / 自我认知应用 |
| **目标用户** | 18-30 岁城市白领 / 学生，"清醒算命"群体（半信半疑、把占卜当自我认知工具） |
| **核心差异化** | ① 现代国风极简 UI（非神秘暗黑风）<br>② 透明推理（每个结论附"推理链"折叠面板）<br>③ 命理 + 心理学双轨解读，支持中英双语<br>④ 命运日记（验证预测准确度）<br>⑤ AI 生成"平行时空"人生轨迹（主线 + 备选 + 假设分支） |
| **路径** | `d:\ntu-study\life-planner` |
| **运行** | `npm run dev` → http://localhost:3000 |

---

## 2. 技术栈

```
Frontend:    Next.js 16 (App Router, Turbopack) + React 19 + TypeScript 5
Styling:     Tailwind CSS v4 (@theme 自定义配色) + Framer Motion
State:       Zustand (含 persist 中间件,localStorage,按用户命名空间)
i18n:        自研 useT() hook + zh.ts / en.ts 字典(含 250+ keys)
Auth:        NextAuth.js v5 (Credentials Provider + JWT session)
Database:    SQLite (better-sqlite3,直接 SQL,绕过 Prisma v7 适配器问题)
AI:          阿里云百炼 (DashScope, OpenAI 兼容接口)
             - qwen-plus: 命盘解读 / 人生轨迹预测 (深度任务,质量优先)
             - qwen-turbo: 问对话(流式) / 每日签 / 解梦 / 追问 (低延迟)
可视化:      自研 SVG + 绝对定位的横向时间轴(替代 ReactFlow)
分享:        html2canvas (命盘卡片导出 PNG)
紫微:        自研紫微斗数计算(命宫/身宫/五行局/紫微星位置 + 14 主星定位)
```

依赖详见 [`package.json`](package.json)。

---

## 3. 7 模块逻辑关系

```
命 → 卦 → 问 (深度追问)
命 × 流日 → 签
命 + 梦境 → 梦
签/梦/事件 → 册 (统一记录)
命(根) + 册(节点) + AI预测(主线+备选) + 用户假设条件 → 迹 (平行时空轨迹)
命 + 出生信息 → 紫微斗数(命宫/身宫/五行局/紫微入宫)  [展示在/ming 页]
```

| 模块 | 路径 | 功能 |
|---|---|---|
| **命** | `/ming` | 八字命盘 + 五行分布 + 日主分析 + **紫微斗数卡片** |
| **卦** | `/gua` | AI 五维深度解读(事业/感情/健康/财富/成长) + 透明推理链 + 追问 |
| **问** | `/wen` | 基于命盘的 AI 流式对话(以命盘为 system prompt 上下文) |
| **签** | `/qian` | 今日运签(基于命盘 × 流日干支,非随机) |
| **梦** | `/meng` | 梦境符号解析 + 命理关联 + **自定义情绪标签** |
| **册** | `/ce` | 命运日记(验证准确率) + 人生事件管理(与/迹双向同步) |
| **迹** | `/ji` | **平行时空轨迹树**: 横向点·线时间轴 + 主线/备选预测 + 用户假设分支 |

---

## 4. 目录结构

```
src/
├── app/
│   ├── (auth)/                  # 未登录页组(已 i18n)
│   │   ├── layout.tsx           # 客户端组件,品牌+slogan随locale切换+语言切换器
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/                  # 主应用(认证守卫)
│   │   ├── layout.tsx           # auth() 守卫 + Sidebar + MobileNav
│   │   ├── ming/page.tsx        # 命盘 + 紫微斗数
│   │   ├── gua/page.tsx
│   │   ├── wen/page.tsx         # 流式对话 + 停止按钮
│   │   ├── qian/page.tsx
│   │   ├── meng/page.tsx        # 自定义情绪标签
│   │   ├── ce/page.tsx
│   │   └── ji/page.tsx          # 平行时空横向时间轴
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth 路由
│   │   ├── register/            # 用户注册
│   │   ├── fortune/             # 命盘 + 解读 (locale-aware, qwen-plus)
│   │   ├── daily-sign/          # 今日命签 (locale-aware, qwen-turbo)
│   │   ├── chat/                # 问·AI对话 (流式, locale-aware, qwen-turbo)
│   │   ├── followup/            # 卦页面追问 (locale-aware, qwen-turbo)
│   │   ├── dream/               # 梦境解读 (locale-aware, qwen-turbo)
│   │   ├── life-tree/           # 主线+备选 2 条预测路径 (qwen-plus)
│   │   └── life-branch/         # 用户假设条件 → 平行分支 (qwen-plus)
│   ├── globals.css              # @theme 配色 + 全局样式
│   ├── layout.tsx               # Root + AuthProvider
│   └── page.tsx                 # 入口重定向 (/login or /ming)
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # 桌面侧栏(7 模块导航)
│   │   ├── TopBar.tsx           # 顶栏(语言切换 + 用户 + 退出)
│   │   ├── MobileNav.tsx        # 移动端底部导航
│   │   ├── AuthProvider.tsx     # SessionProvider 包裹 + StoreSession
│   │   └── StoreSession.tsx     # 监听登录态,按用户切换 zustand persist key (账户隔离)
│   ├── fortune/
│   │   ├── BirthForm.tsx        # 生辰输入表单
│   │   ├── BaziPanel.tsx        # 八字命盘展示(四柱+五行)
│   │   ├── ZiweiPanel.tsx       # 紫微斗数卡片(命宫/身宫/五行局/紫微入宫/主星)
│   │   ├── ReadingPanel.tsx     # 卦页面 Tab + 推理链 + 追问
│   │   ├── DailySignCard.tsx    # 今日命签卡片
│   │   ├── FortuneDiary.tsx     # 册·命运日记组件
│   │   └── ShareCard.tsx        # 命盘名片导出
│   └── ui/
│       └── fortune-ui.tsx       # WuxingBadge / ScoreRing / GanZhiPillar / ReasoningChain / LoadingInk
├── store/
│   └── index.ts                 # Zustand 全局 store + storeKeyFor() 命名空间函数
├── i18n/
│   ├── zh.ts                    # 中文字典(250+ keys, 含紫微/平行时空)
│   ├── en.ts                    # 英文字典
│   └── index.ts                 # useT() hook
├── lib/
│   ├── ai.ts                    # 百炼客户端: chatWithBailian + streamChatWithBailian + 超时
│   ├── auth.ts                  # NextAuth 配置(Credentials+JWT)
│   ├── bazi.ts                  # 八字算法(纯 TS,Unicode 转义,索引数组方案)
│   ├── ziwei.ts                 # 紫微斗数算法(命宫/身宫/五虎遁/纳音/紫微表)
│   ├── prompts.ts               # AI 提示词模板(全部 locale-aware)
│   ├── db.ts                    # better-sqlite3 直接 SQL 封装
│   ├── prisma.ts                # (备用,实际未使用)
│   └── utils.ts                 # cn() 等工具
└── types/
    ├── index.ts                 # UserBirthInfo / BaziDisplay / FortuneReading / DailySign /
    │                            # DiaryEntry / DreamEntry / LifeEvent / PredictedPath / BranchPath
    └── fortune.ts               # (历史遗留)

prisma/
├── schema.prisma                # SQLite schema
└── dev.db                       # 本地数据库文件

next.config.ts                   # devIndicators: false (隐藏左下角 N 浮标)
.env.local                       # DASHSCOPE_API_KEY / AUTH_SECRET / DATABASE_URL
```

---

## 5. 配色 / 设计系统

文件:[`src/app/globals.css`](src/app/globals.css)

```
墨色系 (ink-50 → 950)    主文字 + 背景       #f7f5f0 ~ #0f0e0d
珊瑚色 (coral-100 → 700) 取代朱砂红,更柔和   #f7ebe7 ~ #8b4a38 (核心 #c47a66)
青绿色 (jade)            吉祥/正向/jade-500 #2e8b57
金色   (gold)            财运/高亮/gold-500 #b8891e
紫色   (mystic)          人生树根节点/紫微   #7c4da0
五行色:木绿/火珊瑚/土金/金灰/水蓝
```

风格:宋朝极简 × 大量留白 × 卡片式信息架构,字体 `Source Han Serif SC` + `PingFang SC` 系统栈(无 Google Fonts 依赖)。

---

## 6. 关键设计决策

### 6.1 编码安全:所有中文用 Unicode 转义
**问题**:PowerShell 批量替换 / 工具操作偶尔会把 UTF-8 中文损坏成 `??`。

**约定**:
- ✅ **API 路由 / lib / 静态字典**:所有中文字符串字面量用 `\uXXXX` 转义
- ✅ **i18n 字典 (zh.ts/en.ts)**:全部 unicode 转义
- ✅ **bazi.ts / ziwei.ts**:用索引数组(避免中文做对象 key 时编码出错)
- ⚠️ **JSX 文本节点**:`{"\uXXXX"}` 而非裸 `\uXXXX`(后者会被 React 当字面量渲染)
- ⚠️ **JSX attribute**:`placeholder={"\u2022..."}`(花括号包裹),不要 `placeholder="\u2022..."`

### 6.2 错误码而非中文消息
所有 API 路由返回 `{ errorCode: "fortuneFailed" }` 而非中文文本,前端通过 `t.errors.fortuneFailed` 翻译显示。

错误码列表(在 `i18n/zh.ts` 的 `errors.*`):
- `fortuneFailed` / `dailySignFailed` / `chatFailed` / `dreamFailed`
- `paramsMissing` / `passwordTooShort` / `emailExists` / `registerFailed`

### 6.3 数据库:绕过 Prisma v7 适配器
`src/lib/db.ts` 直接用 `better-sqlite3` 写 SQL,自动建表,完全跳过 Prisma 运行时。schema 仍保留在 `prisma/schema.prisma` 作为文档参考。

### 6.4 全局状态:Zustand + localStorage(按用户命名空间)
[`src/store/index.ts`](src/store/index.ts) 的 `useStore` 包含:
```ts
locale, sidebarCollapsed,                              // UI
birthInfo, bazi, reading,                              // 命盘
dailySign, dailySignDate,                              // 签
chatHistory,                                           // 问·对话
diaryEntries, dreamEntries, lifeEvents,                // 册·记录
customEmotions,                                        // 梦·自定义情绪标签
predictedPaths, branchPaths,                           // 迹·主备路径+假设分支
```

**账户数据隔离**:[`StoreSession`](src/components/layout/StoreSession.tsx) 在 `AuthProvider` 内部监听 `useSession()`,登录态变化时:
1. 将 zustand persist 的 storage `name` 切换到 `guanyuan-store::<user.email>`(未登录用 `::guest`)
2. 清空内存中所有用户级数据字段
3. 调用 `useStore.persist.rehydrate()` 从新 key 加载该用户的数据
4. 保留 `locale` 跨账户传递(UI 偏好不强制重置)

这样同一浏览器登录不同账户,数据完全隔离;localStorage 中可见多份 `guanyuan-store::xxx` 桶。

### 6.5 i18n:轻量自研 + locale 通过 API 透传
- 客户端组件用 `const t = useT()`
- 切换语言:`store.setLocale("en")` 即时生效
- AI API 调用都接收 `locale` 参数;`lib/prompts.ts` 提供双语提示词:
  - `buildSystemPrompt(locale)`:严格 JSON 输出 + 字段语言强制
  - `buildChatSystemPrompt(locale)`:对话非 JSON
  - `buildBaziReadingPrompt`/`buildDailySignPrompt`/`buildDreamPrompt`/`buildFollowUpPrompt`/`buildLifeTreePrompt`/`buildBranchPrompt` 都按 locale 分支
- 所有 mock 回退数据也提供完整中英文版本

### 6.6 AI 性能:模型分级 + 流式输出
- `qwen-turbo`(快): 问·对话(SSE 流式)、签、梦、追问(实测 1-2s)
- `qwen-plus`(质量): 命盘深度解读、人生轨迹预测、平行分支(实测 15-35s)
- 所有调用配 `AbortController` 超时 + 错误透传到前端 errorCode
- /api/chat 用 `streamChatWithBailian` 直接管道流到前端,带光标动画 + 停止按钮

### 6.7 迹·平行时空可视化(自研,替代 ReactFlow)
- 横向 SVG + HTML 绝对定位实现的点·线时间轴
- 节点 = 小色点(8px)+ 年份 + 6 字内标题
- 三层结构:
  - **主脊**: 出生 → 用户记录 → 当前 → AI 主线预测(灰)
  - **备选未来**: 当前向下分叉,紫色虚曲线 + 紫色节点
  - **假设分支**: 任一过去节点向上分叉,深色虚曲线;用户输入"如果当时…"后端推演 3 节点
- 点击节点 → 右侧滑入详情面板;过去节点支持编辑/删除 + "假设条件"输入
- `predictedPaths` 不持久化(按需重新生成),`branchPaths` 持久化(用户思考资产)

### 6.8 紫微斗数(`lib/ziwei.ts`)
- **命宫地支** = (寅 + 月 - 时) mod 12,用月份和时辰索引
- **身宫地支** = (寅 + 月 + 时) mod 12
- **命宫天干** 用五虎遁(由年干推月干起寅)
- **五行局** 由命宫纳音五行决定:水二/木三/金四/土五/火六
- **紫微入宫** 由 (五行局, 农历日) 标准查表;**用公历日近似农历日**,UI 标注 approximation
- **命宫主星** 由紫微/天府双系列偏移规则推算 14 主星,展示落在命宫的那颗
- 在 `/ming` 页面 BaZiPanel 下方展示卡片:命宫/身宫/五行局/紫微入宫四块 + 主星行

---

## 7. 环境变量 ([`.env.local`](.env.local))

```
DASHSCOPE_API_KEY=sk-xxx                                    # 阿里云百炼 API Key
AUTH_SECRET=guanyuan-innerabyss-secret-2026-xuan-yuan       # NextAuth JWT 签名
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=file:///D:/ntu-study/life-planner/prisma/dev.db
```

未配置 `DASHSCOPE_API_KEY` 时,所有 AI 接口返回内置 mock 数据(中英双版本),功能仍可用。

---

## 8. 测试账号

| 邮箱 | 密码 | 备注 |
|---|---|---|
| `bugfree@test.com` | `12345678` | 端到端测试通过的账号 |
| `demo4@test.com` | `12345678` | 早期测试账号 |
| `observer@test.com` | `12345678` | UI 测试账号 |

> 同一浏览器切换账号,数据完全隔离(每个邮箱独立 localStorage 桶)。

---

## 9. 关键修复历史

| # | 问题 | 根因 | 修复 |
|---|---|---|---|
| 1 | Google Fonts 加载失败 | 国内访问问题 | layout.tsx 移除 `next/font/google`,改用系统字体栈 |
| 2 | Hero 字符 `命` 显示 ??? | UTF-8 工具操作损坏 | 改用 `{"\u547d"}` Unicode 转义 |
| 3 | Prisma v7 客户端构造失败 | 必须传 adapter | 切到 `better-sqlite3` + 直写 SQL (`lib/db.ts`) |
| 4 | 命盘下方 `??????????` | `/api/fortune` 错误消息中文损坏 | 所有 API 改返回 `errorCode`,前端翻译 |
| 5 | EN 切换不全(只 TopBar 变) | 组件硬编码中文 | 重写 15+ 组件,全部接 `useT()` |
| 6 | FortuneDiary build error | 文件 UTF-8 第 6544 字节损坏 | 全文用 unicode 转义重写 |
| 7 | bazi.ts 中文 key 损坏 | `Record<string, ...> = { 木: ... }` | 改用索引数组 + Unicode 转义 |
| 8 | 命盘日主显示 `\u00b7 身强` | JSX 文本节点不解析 `\u` 转义 | 改 `{" \u00b7 "}` 表达式形式;同步修 ji/ShareCard |
| 9 | 问·解惑返回 JSON 原文 | 共享系统提示要求 JSON 输出 | 新增 `buildChatSystemPrompt`(显式禁止 JSON) |
| 10 | 命盘/签等 AI 响应 14-30s | 全部用 qwen-plus | 模型分级 + 问·对话改流式 SSE |
| 11 | 迹页节点又大又丑、有 minimap | 用了 ReactFlow + 默认节点 | 自研 SVG 横向时间轴,色点+小标签;移除 minimap/控件 |
| 12 | 迹页节点 `\u00b7` 同样乱码 | 同 #8 | 同 #8 修法 |
| 13 | 迹页 AI 预测 3 条难取舍 | 提示词要求 3 路径 | 改"主线 + 备选"恰好 2 路径(isMain 字段) |
| 14 | 左下角 Next.js 浮标"N" | dev indicator 默认开启 | `next.config.ts` 设 `devIndicators: false` |
| 15 | 登录页密码 placeholder 显示 `\u2022\u2022\u2022...` | JSX attribute 字符串不解析转义 | 改 `placeholder={"\u2022..."}` 表达式形式 |
| 16 | 登录/注册页面只有中文 | AuthLayout 是 server component 硬编码 | 改 `"use client"` + useT + 加语言切换器 |
| 17 | 同一浏览器多账户共享数据 | zustand 用单一 localStorage key | StoreSession 按 user.email 命名空间切换 persist key |

---

## 10. 已知限制 / 可优化方向

### 当前限制
- **better-sqlite3 单线程**:并发写入可能阻塞,小流量没问题
- **百炼 API 稳定性**:偶发 socket 关闭,前端 retry 逻辑较简单
- **响应式**:< 768px 用底部导航条,但 ji 页面横向滚动在小屏体验略局促
- **紫微斗数用公历日近似农历日**:UI 已标注 approximation;精确版本需引入农历转换库
- **紫微 14 主星**:目前只显示命宫主星;未呈现完整 12 宫主星布局
- **数据隔离仅在浏览器端**:命盘等仍只在 localStorage,跨设备/浏览器不同步;服务端 schema 已支持 userId 但暂未对接

### 后续可做
1. **服务端持久化命盘**:命盘/事件迁移到 SQLite,跨设备同步
2. **多命盘管理**:用户为家人朋友建多个命盘
3. **农历日转换**:接入精确农历库,提升紫微计算精度
4. **紫微 12 宫整盘**:展示完整紫微星盘 + AI 解读
5. **社区/UGC**:发布"验证帖"(预测准不准),形成社区护城河
6. **付费墙**:流年详批 / 一对一深度咨询
7. **PWA / 离线**:命盘和日记离线可访问
8. **错误重试**:百炼 API 失败自动重试 1-2 次(指数退避)
9. **数据迁移**:从 better-sqlite3 迁移到 PostgreSQL(线上部署)

---

## 11. 启动 / 调试

```bash
cd d:\ntu-study\life-planner

# 安装(已完成)
npm install

# 启动开发服务器
npm run dev          # http://localhost:3000

# 类型检查
npx tsc --noEmit

# 数据库重置
npx prisma db push   # 同步 schema(新增表会被 lib/db.ts 自动建表覆盖)
```

---

## 12. 与上下文有关的关键文件速查

| 修改诉求 | 直接改这里 |
|---|---|
| 新增/修改翻译 | [`src/i18n/zh.ts`](src/i18n/zh.ts) + [`src/i18n/en.ts`](src/i18n/en.ts) |
| 改主题色 | [`src/app/globals.css`](src/app/globals.css) `@theme {}` |
| 改命理算法 | [`src/lib/bazi.ts`](src/lib/bazi.ts) |
| 改紫微算法/查表 | [`src/lib/ziwei.ts`](src/lib/ziwei.ts) |
| 改 AI 提示词 | [`src/lib/prompts.ts`](src/lib/prompts.ts) |
| 改侧栏导航 | [`src/components/layout/Sidebar.tsx`](src/components/layout/Sidebar.tsx) |
| 全局状态 | [`src/store/index.ts`](src/store/index.ts) |
| 数据隔离行为 | [`src/components/layout/StoreSession.tsx`](src/components/layout/StoreSession.tsx) |
| 切换 AI 模型 | 各 `src/app/api/*/route.ts` 中的 `model` 参数 |
| 数据库结构 | [`src/lib/db.ts`](src/lib/db.ts) `getDb()` 中的 CREATE TABLE |
| 关闭 dev 浮标 | [`next.config.ts`](next.config.ts) `devIndicators` |
| 迹页可视化算法 | [`src/app/(main)/ji/page.tsx`](src/app/(main)/ji/page.tsx) `buildLayout()` |
| 紫微卡片 UI | [`src/components/fortune/ZiweiPanel.tsx`](src/components/fortune/ZiweiPanel.tsx) |

---

> 最后更新:2026-05-11(第二轮迭代:修复 i18n + 紫微 + 平行时空 + 账户隔离)
