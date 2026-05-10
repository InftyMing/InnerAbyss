# 命途 MingTu

> 命运是轨迹，不是预言

融合传统八字命理与现代心理学的差异化算命 Web 应用，以**透明推理**和**极简国风美学**区别于市场同类产品。

## 核心差异化亮点

| 竞品通病 | 命途的做法 |
|---------|-----------|
| 界面神秘暗黑，不适合截图分享 | 宋朝极简 × 现代设计，米白墨色配色 |
| 结论模糊，无法验证 | 每个结论附带「推理链」折叠面板 |
| 一次性体验，无留存 | 命运日记：记录并验证预测准确度 |
| 割裂命理与现实 | 命理 + 心理学双轨解读，降低信仰门槛 |
| 裂变能力弱 | 精美命盘名片，适合分享小红书/朋友圈 |

## 功能模块

- **命盘生成**：输入生辰八字，自动计算四柱五行
- **AI深度解读**：事业/感情/健康/财富/成长五个维度，含透明推理
- **今日命签**：基于八字+流日干支计算，非随机，含宜忌建议
- **命运日记**：记录预测与现实，统计命理准确率
- **命盘名片**：生成精美卡片，一键保存/分享

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 AI API（可选）

复制 `.env.local.example` 为 `.env.local`，填入 API Key：

```bash
cp .env.local.example .env.local
```

> 不配置 API Key 时，系统自动使用内置模拟数据，所有功能正常可用。

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 推荐 AI 服务

| 服务 | 环境变量 | 特点 |
|-----|---------|-----|
| DeepSeek | `DEEPSEEK_API_KEY` | 推荐，成本低，中文命理效果好 |
| OpenAI | `OPENAI_API_KEY` | 备选，使用 gpt-4o-mini |

## 技术栈

- **框架**：Next.js 16 (App Router)
- **样式**：Tailwind CSS v4 + 自定义国风设计系统
- **动效**：Framer Motion
- **AI**：DeepSeek / OpenAI API
- **命理算法**：纯 TypeScript 实现（`src/lib/bazi.ts`）
- **分享**：html2canvas 截图服务

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── fortune/        # 命盘解读 API
│   │   ├── daily-sign/     # 今日命签 API
│   │   └── followup/       # 追问 API
│   ├── globals.css          # 全局样式 + 设计系统
│   └── page.tsx             # 主页
├── components/
│   ├── fortune/
│   │   ├── BirthForm.tsx    # 生辰输入表单
│   │   ├── BaziPanel.tsx    # 八字命盘面板
│   │   ├── ReadingPanel.tsx # 命理解读面板（含透明推理）
│   │   ├── DailySignCard.tsx # 今日命签卡片
│   │   ├── FortuneDiary.tsx # 命运日记
│   │   ├── ShareCard.tsx    # 命盘名片分享
│   │   └── NavBar.tsx       # 底部导航
│   └── ui/
│       └── fortune-ui.tsx   # 通用UI组件
├── lib/
│   ├── bazi.ts              # 八字命理核心算法
│   ├── prompts.ts           # AI提示词体系
│   └── utils.ts             # 工具函数
└── types/
    └── fortune.ts           # TypeScript类型定义
```

## 后续规划

- **V2**：命运日记增强 + 命盘名片更多样式
- **V3**：用户社区（发布验证帖，形成UGC）+ 命理达人入驻
