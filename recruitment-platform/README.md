# 招聘平台（Recruitment Platform）

基于 Vue 3 + Element Plus + Express 的前后端分离招聘平台。

## 技术栈

- **前端**：Vue 3 + Vue Router 4 + Element Plus + Axios + Vite
- **后端**：Express + 内存 Mock 数据（无数据库，重启后恢复种子数据）
- **开发端口**：
  - 前端：http://localhost:5173
  - 后端：http://localhost:3000

## 目录结构

```
recruitment-platform/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── api/            # API 接口封装
│   │   ├── router/       # 路由配置
│   │   ├── views/        # 页面组件
│   │   ├── App.vue        # 根组件
│   │   └── main.js        # 入口文件
│   ├── vite.config.js     # Vite 配置（含代理）
│   └── package.json
├── server/                 # 后端项目
│   ├── src/
│   │   ├── data/         # Mock 数据
│   │   └── routes/       # 路由接口
│   ├── app.js             # 入口文件
│   └── package.json
├── start.bat              # Windows 一键启动脚本
├── API_DOC.md           # API 接口文档
└── README.md              # 本文件
```

## 快速开始

### 环境要求

- Node.js >= 14
- npm 或 pnpm

### 安装依赖（首次运行）

```bash
# 后端
cd server
npm install

# 前端
cd ../client
npm install
```

### 启动开发环境

**方式一：一键启动（Windows）

双击 `start.bat` 即可同时启动前后端。

**方式二：分别启动**

```bash
# 终端 1：启动后端
cd server
node app.js
# 或 npm start

# 终端 2：启动前端
cd client
npm run dev
```

启动成功后访问：
- 前端首页：http://localhost:5173
- 后端接口：http://localhost:3000/api/jobs

### 构建生产版本

```bash
# 前端构建
cd client
npm run build
# 构建产物在 client/dist/

# 预览构建后预览
npm run preview
```

## 前端路由与入口

| 页面 | 路由 | 说明 |
|------|------|------|
| 职位列表（首页） | `/` | 职位列表、搜索筛选、分页 |
| 职位详情 | `/job/:id | 职位信息、立即投递 |
| 发布职位 | `/job/create` | 发布新职位（可关联用人需求） |
| 编辑职位 | `/job/:id/edit` | 编辑已有职位 |
| 候选人列表 | `/candidates` | 所有候选人、状态筛选、状态变更 |
| 职位投递列表 | `/applications/:jobId` | 某职位下的投递列表 |
| 投递详情 | `/application/:id` | 候选人详情、状态变更、消息、面试安排 |
| 面试列表 | `/interviews` | 面试安排列表 |
| 面试反馈 | `/interview/:id` | 面试反馈详情、填写/编辑 |
| 用人需求 | `/hiring-requests` | 部门需求列表、新增、审批、批量操作 |
| 统计概览 | `/statistics` | 职位/投递/需求/通知统计 |
| 通知中心 | `/notifications` | 通知列表、筛选、标记已读、忽略 |

## API 代理配置

前端通过 Vite 开发代理将 `/api` 转发到 `http://localhost:3000`，配置在 `client/vite.config.js`。

API 基础路径：`/api`（已配置 接口完整接口地址格式统一响应格式：

```json
{
  "code": 200,
  "data": {},
  "message": "success"
}
```

详细接口文档见 [API_DOC.md](./API_DOC.md)。

## 业务复查路径

### 路径一：投简历 → 候选人 → 通知 全链路

1. 打开首页（职位列表）→ 点击任意职位进入详情
2. 点「立即投递」→ 填写姓名/电话/邮箱 → 点「确认投递」
   - ✅ 预期：提示「投递成功」，对话框关闭，「查看投递(N)」数字 +1
   - ✅ 预期：顶部「通知中心」未读数字 +1
3. 顶部导航点「候选人列表」
   - ✅ 预期：能看到刚投递的候选人，状态为「待筛选」
4. 在候选人列表中，将状态改为「已沟通」
   - ✅ 预期：弹出确认对话框 → 确认后状态更新，通知未读数字变化
5. 点「通知中心」
   - ✅ 预期：能看到「新投递提醒」等通知，可标记已读后顶部未读数字减少

### 路径二：面试反馈 闭环

1. 顶部导航点「面试反馈」
2. 点击一条「待反馈」的面试进入详情
3. 填写评分、结论等，点「提交反馈」
   - ✅ 预期：提示成功，页面刷新，通知未读变化
4. 回到候选人列表查看对应候选人状态是否联动更新

### 路径三：空状态与错误提示

- 访问不存在的职位 ID（如 `/job/9999`）→ 显示空状态和返回按钮
- 编辑职位时修改内容后点「取消」→ 弹出未保存修改确认
- 消息为空时点发送 → 提示「请输入消息内容」

## 数据说明

所有数据存储在内存中（`server/src/data/mockData.js`），包含：

- 5 个职位
- 5 条投递记录
- 3 条消息
- 4 场面试
- 1 条面试反馈
- 4 条用人需求
- 10 条通知

重启后端服务后数据恢复初始状态。
