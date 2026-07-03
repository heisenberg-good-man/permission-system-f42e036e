# 招聘平台

前后端分离的招聘管理平台，包含职位管理、简历投递、候选人状态流转、统计概览等功能。

## 技术栈

- **前端**: Vue 3 + Vite + Element Plus + Vue Router + Axios
- **后端**: Node.js + Express（内存数据，无需数据库）
- **数据层**: Mock 内存数据，重启服务后恢复初始状态

## 快速启动

### 方式一：一键启动（推荐）

双击 `start.bat` 即可同时启动前后端服务。

### 方式二：分别启动

**启动后端：**
```bash
cd server
npm install    # 首次运行需要
node app.js
```
后端地址：http://localhost:3000
健康检查：http://localhost:3000/api/health

**启动前端：**
```bash
cd client
npm install    # 首次运行需要
node node_modules/vite/bin/vite.js --host 0.0.0.0
```
前端地址：http://localhost:5173

> **注意**: 如 PowerShell 提示"无法加载脚本"，请使用 cmd 执行，或用 `node node_modules/vite/bin/vite.js` 代替 `npx vite`。

## 构建生产版本

```bash
cd client
npm run build
```
构建产物在 `client/dist` 目录。

## 项目结构

```
recruitment-platform/
├── client/                  # 前端项目
│   ├── src/
│   │   ├── views/           # 页面组件
│   │   │   ├── JobList.vue         # 职位列表
│   │   │   ├── JobDetail.vue       # 职位详情 + 投递
│   │   │   ├── CandidateList.vue   # 候选人列表
│   │   │   ├── ApplicationDetail.vue # 投递详情
│   │   │   ├── Statistics.vue      # 统计概览
│   │   │   └── NotFound.vue        # 404 兜底页
│   │   ├── router/index.js   # 路由配置
│   │   ├── api/index.js      # API 封装
│   │   └── App.vue           # 根组件
│   └── package.json
├── server/                  # 后端项目
│   ├── app.js               # 入口文件
│   └── src/
│       ├── data/mockData.js # Mock 数据
│       └── routes/          # 路由接口
│           ├── jobs.js
│           ├── applications.js
│           ├── statistics.js
│           └── notifications.js
├── start.bat                # 一键启动脚本
└── start.ps1                # PowerShell 启动脚本
```

## 页面入口

| 页面 | 地址 | 说明 |
|------|------|------|
| 职位列表（首页） | http://localhost:5173/ | 浏览所有职位，支持搜索筛选 |
| 职位详情 | http://localhost:5173/job/:id | 查看职位信息，投递简历 |
| 候选人列表 | http://localhost:5173/candidates | 查看所有候选人，流转状态 |
| 投递详情 | http://localhost:5173/application/:id | 查看投递详情和时间线 |
| 统计概览 | http://localhost:5173/statistics | 查看招聘数据统计 |
| 通知中心 | 顶部导航栏 | 查看未读通知 |
| 404 页面 | 任意未定义路由 | 友好错误页，提供返回入口 |

## 复查路径

### 路径 1：首页 → 职位列表 → 投递简历
1. 打开 http://localhost:5173/，确认显示 5 个职位
2. 点击「前端开发工程师」进入详情页
3. 点击「立即投递」，弹出投递表单
4. 填写姓名、电话、邮箱等信息，点「确认投递」
5. **预期**: 提示"投递成功"，「查看投递」数字 +1，通知中心未读数 +1

### 路径 2：重复投递异常
1. 在同一职位详情页，再次点击「立即投递」
2. 填写与上次相同的手机号，点「确认投递」
3. **预期**: 提示"您已投递过该职位，请勿重复投递"，表单保留可修改

### 路径 3：职位已关闭
1. 访问 http://localhost:5173/job/6（运维工程师，已关闭）
2. **预期**: 标题旁显示「已关闭」标签，「立即投递」按钮置灰
3. hover 按钮显示"该职位已关闭，暂不接受新的投递"

### 路径 4：候选人状态流转
1. 进入候选人列表 http://localhost:5173/candidates
2. 找到状态为「待筛选」的候选人，改为「已沟通」
3. **预期**: 状态变更成功，通知中心 +1，统计数据同步更新
4. 找到状态为「面试中」的候选人，尝试改为「待筛选」
5. **预期**: 提示"状态不能回退"，列表和统计不受影响

### 路径 5：404 兜底页
1. 访问 http://localhost:5173/some-random-path
2. **预期**: 显示 404 页面，有「回到职位列表」「候选人列表」「统计概览」「返回上一页」四个按钮
3. 点击「回到职位列表」，**预期**正常返回职位列表

### 路径 6：列表空搜索 + 一键清空
1. 在职位列表搜索框输入"不存在的职位"，点击搜索
2. **预期**: 显示空状态 + "一键清空筛选"按钮
3. 点击「一键清空筛选」，**预期**: 搜索条件清空，列表恢复全部数据

### 路径 7：失败操作不污染统计
1. 进入统计概览页，记下当前各状态数字
2. 对「已淘汰」终态候选人尝试改状态（会失败）
3. 回到统计概览，点「刷新数据」
4. **预期**: 数字与之前一致，失败操作未影响统计

## 主要接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/health | GET | 健康检查 |
| /api/jobs | GET | 职位列表（默认过滤已关闭） |
| /api/jobs/:id | GET | 职位详情 |
| /api/applications | POST | 投递简历 |
| /api/applications/:id/status | PUT | 更新候选人状态 |
| /api/statistics | GET | 统计数据 |
| /api/notifications | GET | 通知列表 |

## 异常场景一览

| 场景 | 错误码 | 提示 |
|------|--------|------|
| 重复投递 | 409 | 您已投递过该职位，请勿重复投递 |
| 职位已关闭 | 403 | 该职位已关闭，暂不接受新的投递 |
| 手机号格式错误 | 400 | 手机号格式不正确 |
| 邮箱格式错误 | 400 | 邮箱格式不正确 |
| 状态回退 | 403 | 状态不能从「X」回退到「Y」 |
| 终态不可变更 | 403 | 当前状态为终态，不可再次变更 |
| 投递不存在 | 404 | 投递记录不存在 |
| 职位不存在 | 404 | 职位不存在 |
