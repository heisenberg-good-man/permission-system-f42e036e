let jobs = [
  {
    id: 1,
    title: '前端开发工程师',
    company: '科技有限公司',
    category: '技术开发',
    salary: '15-25K',
    location: '北京',
    experience: '3-5年',
    education: '本科',
    description: '负责公司产品的前端开发工作，包括Web应用和移动端H5页面的开发与维护。',
    requirements: '熟悉Vue、React等主流前端框架；熟练使用HTML/CSS/JavaScript；了解TypeScript优先。',
    createdAt: '2024-01-15T10:00:00Z',
    status: 'active'
  },
  {
    id: 2,
    title: 'Java后端开发工程师',
    company: '互联网科技公司',
    category: '技术开发',
    salary: '20-35K',
    location: '上海',
    experience: '3-5年',
    education: '本科',
    description: '负责公司核心业务系统的后端开发，参与系统架构设计和优化。',
    requirements: '扎实的Java基础，熟悉Spring Boot框架；熟悉MySQL、Redis等数据库；有分布式系统开发经验优先。',
    createdAt: '2024-01-14T14:00:00Z',
    status: 'active'
  },
  {
    id: 3,
    title: '产品经理',
    company: '创新科技有限公司',
    category: '产品运营',
    salary: '18-30K',
    location: '深圳',
    experience: '2-4年',
    education: '本科',
    description: '负责产品规划、需求分析、原型设计和项目管理，推动产品迭代优化。',
    requirements: '有互联网产品经验；熟练使用Axure、XMind等工具；良好的沟通能力和逻辑思维。',
    createdAt: '2024-01-13T09:00:00Z',
    status: 'active'
  },
  {
    id: 4,
    title: 'UI/UX设计师',
    company: '设计工作室',
    category: '设计',
    salary: '12-20K',
    location: '杭州',
    experience: '2-3年',
    education: '本科',
    description: '负责产品的界面设计和用户体验优化，输出高质量的设计稿和交互原型。',
    requirements: '精通Figma、Sketch等设计工具；有Web和移动端设计经验；熟悉设计规范和组件库。',
    createdAt: '2024-01-12T11:00:00Z',
    status: 'active'
  },
  {
    id: 5,
    title: '测试工程师',
    company: '软件测试公司',
    category: '技术开发',
    salary: '10-18K',
    location: '成都',
    experience: '1-3年',
    education: '本科',
    description: '负责产品的功能测试、性能测试和自动化测试，保障产品质量。',
    requirements: '熟悉测试流程和方法；有自动化测试经验优先；良好的沟通能力和问题分析能力。',
    createdAt: '2024-01-11T15:00:00Z',
    status: 'active'
  }
]

let applications = [
  {
    id: 1,
    jobId: 1,
    jobTitle: '前端开发工程师',
    candidateName: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    education: '本科',
    experience: '3年',
    skills: 'Vue, React, TypeScript',
    resume: '本人有3年前端开发经验，熟悉Vue和React框架，参与过多个大型项目的开发。',
    expectSalary: '20K',
    status: 'pending',
    createdAt: '2024-01-16T09:00:00Z',
    timeline: [
      { status: 'pending', action: '投递简历', time: '2024-01-16T09:00:00Z' }
    ]
  },
  {
    id: 2,
    jobId: 1,
    jobTitle: '前端开发工程师',
    candidateName: '李四',
    phone: '13900139000',
    email: 'lisi@example.com',
    education: '本科',
    experience: '4年',
    skills: 'Vue, JavaScript, CSS',
    resume: '4年前端开发经验，专注于Vue技术栈，有丰富的项目经验。',
    expectSalary: '22K',
    status: 'contacted',
    createdAt: '2024-01-16T10:00:00Z',
    timeline: [
      { status: 'pending', action: '投递简历', time: '2024-01-16T10:00:00Z' },
      { status: 'contacted', action: '已沟通', time: '2024-01-16T11:00:00Z' }
    ]
  },
  {
    id: 3,
    jobId: 2,
    jobTitle: 'Java后端开发工程师',
    candidateName: '王五',
    phone: '13700137000',
    email: 'wangwu@example.com',
    education: '硕士',
    experience: '5年',
    skills: 'Java, Spring Boot, MySQL',
    resume: '5年Java开发经验，精通Spring Boot框架，有分布式系统开发经验。',
    expectSalary: '30K',
    status: 'interviewing',
    createdAt: '2024-01-15T14:00:00Z',
    timeline: [
      { status: 'pending', action: '投递简历', time: '2024-01-15T14:00:00Z' },
      { status: 'contacted', action: '已沟通', time: '2024-01-15T14:30:00Z' },
      { status: 'interviewing', action: '面试中', time: '2024-01-15T15:00:00Z' }
    ]
  },
  {
    id: 4,
    jobId: 1,
    jobTitle: '前端开发工程师',
    candidateName: '赵六',
    phone: '13600136000',
    email: 'zhaoliu@example.com',
    education: '大专',
    experience: '2年',
    skills: 'HTML, CSS, JavaScript',
    resume: '2年前端开发经验，熟悉HTML/CSS/JavaScript基础。',
    expectSalary: '15K',
    status: 'rejected',
    createdAt: '2024-01-14T16:00:00Z',
    timeline: [
      { status: 'pending', action: '投递简历', time: '2024-01-14T16:00:00Z' },
      { status: 'rejected', action: '已拒绝', time: '2024-01-14T17:00:00Z' }
    ]
  },
  {
    id: 5,
    jobId: 3,
    jobTitle: '产品经理',
    candidateName: '钱七',
    phone: '13500135000',
    email: 'qianqi@example.com',
    education: '本科',
    experience: '3年',
    skills: '产品设计,需求分析,项目管理',
    resume: '3年产品经理经验，负责过多个互联网产品的规划和迭代。',
    expectSalary: '25K',
    status: 'pending',
    createdAt: '2024-01-17T09:00:00Z',
    timeline: [
      { status: 'pending', action: '投递简历', time: '2024-01-17T09:00:00Z' }
    ]
  }
]

let messages = [
  {
    id: 1,
    applicationId: 2,
    senderType: 'recruiter',
    content: '您好，我们对您的简历很感兴趣，方便安排面试吗？',
    createdAt: '2024-01-16T11:00:00Z'
  },
  {
    id: 2,
    applicationId: 2,
    senderType: 'candidate',
    content: '您好，可以的，请问什么时间方便？',
    createdAt: '2024-01-16T11:05:00Z'
  },
  {
    id: 3,
    applicationId: 3,
    senderType: 'recruiter',
    content: '恭喜您进入面试环节，请于下周一上午10点到公司参加面试。',
    createdAt: '2024-01-15T15:00:00Z'
  }
]

let interviews = [
  {
    id: 1,
    applicationId: 3,
    jobId: 2,
    jobTitle: 'Java后端开发工程师',
    candidateName: '王五',
    round: 1,
    roundName: '初试',
    interviewer: '刘总监',
    scheduledTime: '2024-01-18T10:00:00Z',
    location: '现场·北京总部',
    status: 'completed',
    createdAt: '2024-01-15T15:30:00Z'
  },
  {
    id: 2,
    applicationId: 3,
    jobId: 2,
    jobTitle: 'Java后端开发工程师',
    candidateName: '王五',
    round: 2,
    roundName: '复试',
    interviewer: '陈技术官',
    scheduledTime: '2024-01-22T14:00:00Z',
    location: '视频会议',
    status: 'scheduled',
    createdAt: '2024-01-18T16:00:00Z'
  },
  {
    id: 3,
    applicationId: 2,
    jobId: 1,
    jobTitle: '前端开发工程师',
    candidateName: '李四',
    round: 1,
    roundName: '初试',
    interviewer: '赵前端负责人',
    scheduledTime: '2024-01-19T09:30:00Z',
    location: '视频会议',
    status: 'scheduled',
    createdAt: '2024-01-16T11:30:00Z'
  },
  {
    id: 4,
    applicationId: 4,
    jobId: 1,
    jobTitle: '前端开发工程师',
    candidateName: '赵六',
    round: 1,
    roundName: '初试',
    interviewer: '孙前端',
    scheduledTime: '2024-01-14T16:30:00Z',
    location: '视频会议',
    status: 'completed',
    createdAt: '2024-01-14T16:00:00Z'
  }
]

let feedbacks = [
  {
    id: 1,
    interviewId: 1,
    applicationId: 3,
    rating: 4,
    strengths: 'Java 基础扎实，对 Spring Boot 原理理解透彻，分布式系统经验丰富，沟通清晰。',
    risks: '对高并发场景下的限流方案经验略少，需后续轮次重点考察。',
    conclusion: 'next_round',
    comment: '建议进入复试，重点考察系统设计与高并发。',
    interviewer: '刘总监',
    createdAt: '2024-01-18T11:30:00Z',
    updatedAt: '2024-01-18T11:30:00Z'
  }
]

let hiringRequests = [
  {
    id: 1,
    requestNo: 'HR-2024-001',
    department: '技术部',
    position: '前端开发工程师',
    headcount: 3,
    level: '中级',
    priority: 'normal',
    salaryRange: '15-25K',
    location: '北京',
    category: '技术开发',
    reason: '业务线扩张，支撑新产品前端研发。',
    requirements: '熟悉 Vue/React，3年以上经验，良好沟通能力。',
    applicant: '张技术总监',
    status: 'approved',
    filledCount: 1,
    relatedJobIds: [1],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 2,
    requestNo: 'HR-2024-002',
    department: '技术部',
    position: 'Java后端开发工程师',
    headcount: 2,
    level: '高级',
    priority: 'urgent',
    salaryRange: '25-40K',
    location: '上海',
    category: '技术开发',
    reason: '核心业务系统重构，需补充高级后端。',
    requirements: '5年以上Java经验，精通Spring全家桶，有分布式架构经验。',
    applicant: '刘后端负责人',
    status: 'approved',
    filledCount: 0,
    relatedJobIds: [2],
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z'
  },
  {
    id: 3,
    requestNo: 'HR-2024-003',
    department: '产品部',
    position: '高级产品经理',
    headcount: 1,
    level: '高级',
    priority: 'normal',
    salaryRange: '25-35K',
    location: '深圳',
    category: '产品运营',
    reason: '新业务线成立，需要产品负责人。',
    requirements: '5年以上产品经验，有B端产品背景优先。',
    applicant: '钱产品总监',
    status: 'pending',
    filledCount: 0,
    relatedJobIds: [],
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z'
  },
  {
    id: 4,
    requestNo: 'HR-2024-004',
    department: '设计部',
    position: 'UI/UX设计师',
    headcount: 2,
    level: '中级',
    priority: 'low',
    salaryRange: '12-20K',
    location: '杭州',
    category: '设计',
    reason: '配合产品迭代，增加设计产能。',
    requirements: '2年以上设计经验，精通Figma，有完整项目案例。',
    applicant: '孙设计主管',
    status: 'rejected',
    filledCount: 0,
    relatedJobIds: [],
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z'
  }
]

let hiringRequestIdCounter = 5

let jobIdCounter = 6
let applicationIdCounter = 6
let messageIdCounter = 4
let interviewIdCounter = 5
let feedbackIdCounter = 2

module.exports = {
  jobs,
  applications,
  messages,
  interviews,
  feedbacks,
  hiringRequests,
  getNextJobId: () => jobIdCounter++,
  getNextApplicationId: () => applicationIdCounter++,
  getNextMessageId: () => messageIdCounter++,
  getNextInterviewId: () => interviewIdCounter++,
  getNextFeedbackId: () => feedbackIdCounter++,
  getNextHiringRequestId: () => hiringRequestIdCounter++
}
