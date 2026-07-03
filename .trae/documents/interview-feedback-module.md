# 面试反馈模块实现计划

## Context（背景）

现有招聘平台为前后端分离结构（Vue3 + Element Plus 前端 / Express + 内存 mock 后端），已有职位、投递、消息、统计四个模块，前端首页与业务路由在本地 dev 服务下可正常打开（已验证：后端 `localhost:3000` API 返回 200，前端 `localhost:5173` 返回 200）。

现需补齐"面试结束后的反馈闭环"。关键缺口：**现有 mock 数据只有 jobs/applications/messages，没有"面试安排"实体**，反馈无处挂载。因此本方案在不重建项目的前提下，新增"面试（interview）"与"面试反馈（feedback）"两组内存数据及接口，并打通候选人状态联动。

目标三块：面试反馈列表、反馈详情/编辑、候选人状态联动。约束：已淘汰或已发 Offer 的候选人不可再提交普通面试反馈；页面需对空列表、字段缺失、重复提交、不可编辑状态给出明确反馈。

## 设计要点

### 1. 数据模型（`server/src/data/mockData.js`）

新增 `interviews` 数组：
```js
{ id, applicationId, jobId, jobTitle, candidateName,
  round,            // 1/2/3
  roundName,        // 初试/复试/终试
  interviewer, scheduledTime, location,
  status,           // scheduled | completed | cancelled
  createdAt }
```

新增 `feedbacks` 数组：
```js
{ id, interviewId, applicationId,
  rating,           // 1-5
  strengths, risks, conclusion,   // next_round | pending | offer | reject
  comment, interviewer, createdAt, updatedAt }
```

新增 `interviewIdCounter` / `feedbackIdCounter`，并在 `module.exports` 导出。

种子数据（基于现有 applications）：
- 面试1：application 3（王五，Java，interviewing），第1轮 completed，已有一份反馈（conclusion=next_round）→ 演示"查看已有反馈"
- 面试2：application 3，第2轮 scheduled，无反馈 → 演示"进入下一轮后待填写"
- 面试3：application 2（李四，前端，contacted），第1轮 scheduled，无反馈 → 演示"从零填写反馈"

### 2. 候选人状态联动（核心规则）

applications 的合法状态新增 `offered`（原为 pending/contacted/interviewing/rejected）。保存反馈时按 `conclusion` 联动：

| conclusion | application.status | timeline 动作 | 自动追加的沟通记录（候选人侧可见） |
|---|---|---|---|
| next_round | interviewing（不变） | 进入下一轮 | "您的面试已通过，将进入下一轮，请留意后续安排。" |
| pending | interviewing（不变） | 面试待定 | "面试结果待定，HR 将进一步评估后与您联系。" |
| offer | offered | 发 Offer | "恭喜您通过面试，我们将向您发放 Offer。" |
| reject | rejected | 已淘汰 | "很遗憾您本次未通过面试，感谢您的参与。" |

- 自动追加消息复用现有 `messages` 与 `messageApi`，senderType='recruiter'，由后端在保存反馈时直接 push（不走前端 messageApi，保证原子性）。
- timeline 复用现有 `application.timeline` 结构。

### 3. 后端接口（新增 `server/src/routes/interviews.js`，在 `server/app.js` 注册 `/api/interviews`）

- `GET /api/interviews`：列表，支持 `jobId / candidateName / round / feedbackStatus(pending|submitted) / status / page / size` 筛选与分页。每条带 `feedbackStatus` 派生字段。
- `GET /api/interviews/:id`：详情，聚合 interview + application（简历摘要）+ 该投递的 messages + 已有 feedback。
- `GET /api/interviews/application/:applicationId`：某投递下的所有面试（供 ApplicationDetail 展示）。
- `POST /api/interviews`：安排面试。校验 application 存在且状态非 rejected/offered；必填字段缺失返回 400（沿用 jobs/applications 的 `{code:400,message}` 风格）。
- `PUT /api/interviews/:id/feedback`：**upsert** 反馈（同 interview 已有反馈则更新，否则新建，杜绝重复提交）。
  - 阻断校验：若 application.status ∈ {rejected, offered} 且当前 interview 无已有反馈 → 返回 403 风格 `{code:400, message:'该候选人已发 Offer/已淘汰，不可再提交面试反馈'}`。
  - 字段校验：`rating`、`conclusion` 必填；缺失返回 400 + 字段名清单。
  - 副作用：写入/更新 feedback → 按 conclusion 更新 application.status + timeline + 自动消息 → interview.status 置 completed。
  - 返回更新后的 interview（含 feedback）。

### 4. 现有后端调整

- `server/src/routes/applications.js`：`PUT /:id/status` 的 `validStatuses` 增加 `'offered'`；`getStatusAction` 增加 `offered:'发 Offer'`。
- `server/src/routes/statistics.js`：overview 与 job 统计增加 `offeredCount`、`interviewCount`、`feedbackCount`。
- `server/src/data/mockData.js`：导出 interviews/feedbacks 及计数器。

### 5. 前端 API（`client/src/api/index.js`）

新增 `interviewApi`：`list(params)`、`get(id)`、`create(data)`、`saveFeedback(id, data)`、`listByApplication(applicationId)`。

### 6. 前端路由与导航

- `client/src/router/index.js`：新增 `/interviews`（InterviewList）、`/interview/:id`（InterviewFeedback）。
- `client/src/App.vue`：导航栏增加"面试反馈"入口。

### 7. 前端页面

**`client/src/views/InterviewList.vue`**（反馈列表）
- 筛选区：职位（el-select，复用 jobApi）、候选人关键字、面试轮次、反馈状态（待反馈/已反馈）、面试状态。
- 表格：候选人 / 职位 / 轮次 / 面试官 / 面试时间 / 面试状态 / 反馈状态 / 操作（"填写反馈"或"查看反馈"→ `/interview/:id`）。
- 空列表 empty state（沿用 ApplicationList 的 empty 样式）。
- 分页（沿用现有 el-pagination 写法）。

**`client/src/views/InterviewFeedback.vue`**（详情/编辑）
- 顶部：面试元信息（职位、轮次、面试官、时间、地点、状态）+ 候选人简历摘要（el-descriptions，取自 application）+ 状态标签。
- 中部：历史沟通（复用 ApplicationDetail 的消息列表样式）+ 已有评价展示（若有）。
- 表单：评分（el-input-number 1-5）、优势（textarea）、风险点（textarea）、结论建议（el-select：进入下一轮/待定/发 Offer/淘汰）、备注（textarea）。
- 不可编辑状态：当 application.status ∈ {rejected, offered} → 表单禁用 + el-alert 明确提示"该候选人已发 Offer/已淘汰，不可再提交面试反馈"。
- 重复提交防护：进入页面已加载已有反馈则进入"编辑"态；保存按钮 loading 标志防双击；保存成功后刷新本页 + ElMessage。
- 字段缺失：前端校验 rating/conclusion，缺失时 ElMessage.warning 提示；后端 400 同步展示。

**`client/src/views/ApplicationDetail.vue`**（增强）
- 新增"面试安排"区块：列出该投递所有面试（轮次/面试官/时间/状态/反馈状态），每条"填写/查看反馈"跳转。
- 新增"安排面试"按钮 + 简单对话框（轮次、面试官、时间、地点），调用 `interviewApi.create`。
- 状态下拉增加"已发 Offer(offered)"。
- 候选人侧进展说明：复用现有消息列表（后端自动追加的消息会展示）。

**`client/src/views/ApplicationList.vue` / `CandidateList.vue`**：状态下拉与标签增加 `offered`（已发 Offer）。

**`client/src/views/Statistics.vue`**：统计卡片增加"面试安排数 / 已反馈数 / 已发 Offer 数"；状态分布条增加 offered。

### 8. 边界与明确反馈

- 空列表：InterviewList 与 ApplicationDetail 面试区块均有空状态。
- 字段缺失：前后端双重校验，沿用 `{code:400,message}` + ElMessage 模式。
- 重复提交：后端 upsert + 前端 loading 锁 + 编辑态识别。
- 不可编辑：rejected/offered 候选人表单禁用 + alert 提示。
- 终态阻断：rejected/offered 且无已有反馈 → 后端拒绝新建，前端在进入时即置只读。

## 涉及文件清单

后端：
- `server/src/data/mockData.js`（新增 interviews/feedbacks + 种子 + 计数器）
- `server/src/routes/interviews.js`（新建）
- `server/app.js`（注册路由）
- `server/src/routes/applications.js`（status 增加 offered）
- `server/src/routes/statistics.js`（增加反馈/offer 统计）

前端：
- `client/src/api/index.js`（interviewApi）
- `client/src/router/index.js`（2 条路由）
- `client/src/App.vue`（导航项）
- `client/src/views/InterviewList.vue`（新建）
- `client/src/views/InterviewFeedback.vue`（新建）
- `client/src/views/ApplicationDetail.vue`（面试区块 + 安排面试 + offered）
- `client/src/views/ApplicationList.vue`、`client/src/views/CandidateList.vue`（offered 选项）
- `client/src/views/Statistics.vue`（反馈/offer 统计）

## 验证路径（端到端复查）

> 后端为 `node app.js`（无 nodemon），改动后需重启后端进程；前端 vite 自动热更新。

1. **进入入口**：浏览器打开 `http://localhost:5173/`，确认首页（职位列表）正常渲染、顶部导航出现"面试反馈"。也可从 `/application/2`（李四）或 `/application/3`（王五）详情页的"面试安排"区块进入。
2. **筛选**：点击导航"面试反馈"进入 `/interviews`，依次用"职位/候选人/轮次/反馈状态/面试状态"筛选，确认列表与计数正确；清空筛选恢复全量；无数据时显示空状态。
3. **打开详情**：点"查看反馈"（面试1，王五第1轮，已有反馈）→ 看到简历摘要、面试时间、面试官、历史沟通、已有评价（只读展示 + 表单为编辑态）。点"填写反馈"（面试3，李四第1轮）→ 空表单。
4. **保存反馈**：在面试3表单填评分+结论（选"进入下一轮"）→ 保存成功 → ElMessage 提示 → 页面刷新为编辑态；后端自动：application 2 status 仍 interviewing、timeline 增加"进入下一轮"、messages 增加一条候选人可见的进展说明。
5. **验证 Offer/淘汰联动**：再开一条待反馈面试，结论选"发 Offer"保存 → 回 `/candidates` 或 `/application/:id` 看到状态变"已发 Offer"；统计页"已发 Offer 数"+1。选"淘汰"同理变"已拒绝"。
6. **验证不可编辑**：对已发 Offer/已淘汰候选人再次进入面试反馈页 → 表单禁用 + alert 明确提示，无法提交。
7. **验证重复提交/字段缺失**：未填评分或结论 → 提示必填；快速双击保存 → loading 锁防止重复。
8. **查看统计变化**：`/statistics` 页确认面试安排数、已反馈数、Offer/淘汰数与状态分布条同步刷新。

## 不在本次范围

- 不重建项目、不引入数据库、不引入新依赖（仅用现有 element-plus/express）。
- 不做真实候选人端登录态，"候选人侧可见进展"通过 ApplicationDetail 的消息列表体现。
- next_round 不自动创建下一轮面试记录（需用户手动"安排面试"），保持范围聚焦。
