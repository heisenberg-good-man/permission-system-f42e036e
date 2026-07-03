# 招聘平台 API 接口文档

## 基础信息

- 基础 URL: `http://localhost:3000/api`
- 数据存储: 内存数据（Mock）
- 支持的候选人状态枚举:
  - `pending` - 待筛选
  - `contacted` - 已沟通
  - `interviewing` - 面试中
  - `rejected` - 已拒绝

---

## 职位管理

### 1. 获取职位列表

**GET** `/api/jobs`

**查询参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 关键词搜索（职位名称、公司名） |
| category | string | 否 | 职位分类 |
| salaryMin | number | 否 | 最低薪资 |
| salaryMax | number | 否 | 最高薪资 |
| page | number | 否 | 页码，默认1 |
| size | number | 否 | 每页数量，默认10 |

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "title": "前端开发工程师",
        "company": "科技有限公司",
        "category": "技术开发",
        "salary": "15-25K",
        "location": "北京",
        "experience": "3-5年",
        "education": "本科",
        "description": "负责公司产品的前端开发工作...",
        "requirements": "熟悉Vue、React等框架...",
        "createdAt": "2024-01-15T10:00:00Z",
        "status": "active"
      }
    ],
    "total": 50,
    "page": 1,
    "size": 10
  }
}
```

### 2. 获取职位详情

**GET** `/api/jobs/:id`

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "title": "前端开发工程师",
    "company": "科技有限公司",
    "category": "技术开发",
    "salary": "15-25K",
    "location": "北京",
    "experience": "3-5年",
    "education": "本科",
    "description": "负责公司产品的前端开发工作...",
    "requirements": "熟悉Vue、React等框架...",
    "createdAt": "2024-01-15T10:00:00Z",
    "status": "active"
  }
}
```

### 3. 发布职位

**POST** `/api/jobs`

**请求体:**
```json
{
  "title": "前端开发工程师",
  "company": "科技有限公司",
  "category": "技术开发",
  "salary": "15-25K",
  "location": "北京",
  "experience": "3-5年",
  "education": "本科",
  "description": "负责公司产品的前端开发工作...",
  "requirements": "熟悉Vue、React等框架..."
}
```

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "id": 2,
    "title": "前端开发工程师",
    "company": "科技有限公司",
    ...
  }
}
```

### 4. 更新职位

**PUT** `/api/jobs/:id`

**请求体:** 同发布职位

**响应示例:** 同获取职位详情

### 5. 删除职位

**DELETE** `/api/jobs/:id`

**响应示例:**
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

## 简历投递

### 1. 投递简历

**POST** `/api/applications`

**请求体:**
```json
{
  "jobId": 1,
  "candidateName": "张三",
  "phone": "13800138000",
  "email": "zhangsan@example.com",
  "education": "本科",
  "experience": "3年",
  "skills": "Vue, React, TypeScript",
  "resume": "个人简历内容...",
  "expectSalary": "20K"
}
```

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "jobId": 1,
    "candidateName": "张三",
    "status": "pending",
    "createdAt": "2024-01-16T09:00:00Z"
  }
}
```

### 2. 获取职位投递列表

**GET** `/api/applications/job/:jobId`

**查询参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 筛选状态 |
| page | number | 否 | 页码 |
| size | number | 否 | 每页数量 |

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "jobId": 1,
        "jobTitle": "前端开发工程师",
        "candidateName": "张三",
        "phone": "13800138000",
        "email": "zhangsan@example.com",
        "education": "本科",
        "experience": "3年",
        "skills": "Vue, React, TypeScript",
        "resume": "个人简历内容...",
        "expectSalary": "20K",
        "status": "pending",
        "createdAt": "2024-01-16T09:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "size": 10
  }
}
```

### 3. 获取投递详情

**GET** `/api/applications/:id`

**响应示例:** 同投递列表项

### 4. 更新投递状态

**PUT** `/api/applications/:id/status`

**请求体:**
```json
{
  "status": "contacted"
}
```

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "status": "contacted"
  }
}
```

---

## 消息沟通

### 1. 发送消息

**POST** `/api/messages`

**请求体:**
```json
{
  "applicationId": 1,
  "senderType": "recruiter",
  "content": "您好，我们对您的简历很感兴趣，方便安排面试吗？"
}
```

**senderType 枚举:**
- `recruiter` - 招聘方
- `candidate` - 应聘方

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "applicationId": 1,
    "senderType": "recruiter",
    "content": "您好，我们对您的简历很感兴趣...",
    "createdAt": "2024-01-16T10:00:00Z"
  }
}
```

### 2. 获取消息列表

**GET** `/api/messages/application/:applicationId`

**响应示例:**
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "applicationId": 1,
      "senderType": "recruiter",
      "content": "您好，我们对您的简历很感兴趣...",
      "createdAt": "2024-01-16T10:00:00Z"
    },
    {
      "id": 2,
      "applicationId": 1,
      "senderType": "candidate",
      "content": "您好，可以的，请问什么时间方便？",
      "createdAt": "2024-01-16T10:05:00Z"
    }
  ]
}
```

---

## 统计数据

### 1. 获取统计概览

**GET** `/api/statistics`

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "totalJobs": 50,
    "totalApplications": 200,
    "pendingCount": 50,
    "contactedCount": 80,
    "interviewingCount": 40,
    "rejectedCount": 30
  }
}
```

### 2. 获取职位统计

**GET** `/api/statistics/job/:jobId`

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "jobId": 1,
    "jobTitle": "前端开发工程师",
    "totalApplications": 25,
    "pendingCount": 5,
    "contactedCount": 10,
    "interviewingCount": 5,
    "rejectedCount": 5
  }
}
```

---

## 数据结构定义

### Job（职位）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 职位ID |
| title | string | 职位名称 |
| company | string | 公司名称 |
| category | string | 职位分类 |
| salary | string | 薪资范围 |
| location | string | 工作地点 |
| experience | string | 经验要求 |
| education | string | 学历要求 |
| description | string | 职位描述 |
| requirements | string | 任职要求 |
| createdAt | string | 创建时间 |
| status | string | 职位状态（active/inactive） |

### Application（投递记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 投递ID |
| jobId | number | 职位ID |
| jobTitle | string | 职位名称（冗余） |
| candidateName | string | 候选人姓名 |
| phone | string | 联系电话 |
| email | string | 邮箱 |
| education | string | 学历 |
| experience | string | 工作经验 |
| skills | string | 技能标签 |
| resume | string | 简历内容 |
| expectSalary | string | 期望薪资 |
| status | string | 状态（pending/contacted/interviewing/rejected） |
| createdAt | string | 投递时间 |

### Message（消息）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 消息ID |
| applicationId | number | 投递记录ID |
| senderType | string | 发送方类型（recruiter/candidate） |
| content | string | 消息内容 |
| createdAt | string | 发送时间 |

### Statistics（统计）

| 字段 | 类型 | 说明 |
|------|------|------|
| totalJobs | number | 职位总数 |
| totalApplications | number | 投递总数 |
| pendingCount | number | 待筛选数 |
| contactedCount | number | 已沟通数 |
| interviewingCount | number | 面试中数 |
| rejectedCount | number | 已拒绝数 |
