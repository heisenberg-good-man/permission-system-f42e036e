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
  },
  {
    id: 6,
    title: '运维工程师（已关闭）',
    company: '运维科技公司',
    category: '技术开发',
    salary: '12-20K',
    location: '北京',
    experience: '2-4年',
    education: '本科',
    description: '负责公司服务器、网络和基础设施的运维管理，保障系统稳定运行。',
    requirements: '熟悉 Linux 系统运维；掌握 Shell/Python 脚本；有云平台运维经验优先。',
    createdAt: '2024-01-08T10:00:00Z',
    status: 'closed'
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
    source: '官网投递',
    owner: '李HR',
    notes: '',
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
    source: '内推',
    owner: '王招聘',
    notes: '候选人沟通能力强，技术栈匹配度高，建议优先推进。',
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
    source: '猎头推荐',
    owner: '刘总监',
    notes: '技术能力突出，面试反馈良好，已进入复试环节。',
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
    source: '招聘网站',
    owner: '李HR',
    notes: '经验不足，技术栈不匹配，已淘汰。',
    status: 'rejected',
    createdAt: '2024-01-14T16:00:00Z',
    timeline: [
      { status: 'pending', action: '投递简历', time: '2024-01-14T16:00:00Z' },
      { status: 'rejected', action: '已淘汰', time: '2024-01-14T17:00:00Z' }
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
    source: '官网投递',
    owner: '钱产品总监',
    notes: '',
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

let notifications = [
  {
    id: 1,
    role: 'recruiter',
    type: 'new_application',
    title: '新投递提醒',
    content: '张三 投递了「前端开发工程师」职位，请及时筛选。',
    priority: 'high',
    isRead: false,
    isIgnored: false,
    relatedType: 'application',
    relatedId: 1,
    linkUrl: '/application/1',
    triggerTime: '2024-01-16T09:00:00Z',
    createdAt: '2024-01-16T09:00:00Z'
  },
  {
    id: 2,
    role: 'candidate',
    type: 'interview_scheduled',
    title: '面试安排提醒',
    content: '您应聘的「前端开发工程师」初试已安排，时间为 1月19日 09:30，地点：视频会议。',
    priority: 'high',
    isRead: false,
    isIgnored: false,
    relatedType: 'interview',
    relatedId: 3,
    linkUrl: '/interview/3',
    triggerTime: '2024-01-16T11:30:00Z',
    createdAt: '2024-01-16T11:30:00Z'
  },
  {
    id: 3,
    role: 'interviewer',
    type: 'feedback_pending',
    title: '待填写面试反馈',
    content: '请尽快为候选人「李四」的初试（前端开发工程师）填写面试反馈。',
    priority: 'normal',
    isRead: false,
    isIgnored: false,
    relatedType: 'interview',
    relatedId: 3,
    linkUrl: '/interview/3',
    triggerTime: '2024-01-19T09:30:00Z',
    createdAt: '2024-01-19T09:30:00Z'
  },
  {
    id: 4,
    role: 'interviewer',
    type: 'feedback_pending',
    title: '待填写面试反馈',
    content: '请尽快为候选人「王五」的复试（Java后端开发工程师）填写面试反馈。',
    priority: 'normal',
    isRead: true,
    isIgnored: false,
    relatedType: 'interview',
    relatedId: 2,
    linkUrl: '/interview/2',
    triggerTime: '2024-01-22T14:00:00Z',
    createdAt: '2024-01-22T14:00:00Z'
  },
  {
    id: 5,
    role: 'recruiter',
    type: 'feedback_submitted',
    title: '面试反馈结果提醒',
    content: '面试官「刘总监」已提交候选人「王五」初试反馈，结论：进入下一轮。',
    priority: 'normal',
    isRead: false,
    isIgnored: false,
    relatedType: 'interview',
    relatedId: 1,
    linkUrl: '/interview/1',
    triggerTime: '2024-01-18T11:30:00Z',
    createdAt: '2024-01-18T11:30:00Z'
  },
  {
    id: 6,
    role: 'recruiter',
    type: 'offer_pending',
    title: 'Offer 待确认',
    content: '候选人「王五」面试已通过，请尽快确认并发放 Offer。',
    priority: 'high',
    isRead: false,
    isIgnored: false,
    relatedType: 'application',
    relatedId: 3,
    linkUrl: '/application/3',
    triggerTime: '2024-01-18T11:30:00Z',
    createdAt: '2024-01-18T11:30:00Z'
  },
  {
    id: 7,
    role: 'hiring_manager',
    type: 'hiring_request_result',
    title: '用人需求审批结果',
    content: '您提交的用人需求「HR-2024-003 高级产品经理」已审批通过。',
    priority: 'normal',
    isRead: false,
    isIgnored: false,
    relatedType: 'hiring_request',
    relatedId: 3,
    linkUrl: '/hiring-requests',
    triggerTime: '2024-01-16T11:00:00Z',
    createdAt: '2024-01-16T11:00:00Z'
  },
  {
    id: 8,
    role: 'hiring_manager',
    type: 'hiring_request_result',
    title: '用人需求审批结果',
    content: '您提交的用人需求「HR-2024-004 UI/UX设计师」已被拒绝，请查看原因。',
    priority: 'normal',
    isRead: true,
    isIgnored: false,
    relatedType: 'hiring_request',
    relatedId: 4,
    linkUrl: '/hiring-requests',
    triggerTime: '2024-01-14T16:00:00Z',
    createdAt: '2024-01-14T16:00:00Z'
  },
  {
    id: 9,
    role: 'candidate',
    type: 'status_change',
    title: '投递状态变更',
    content: '您投递的「Java后端开发工程师」状态已更新为：面试中。',
    priority: 'normal',
    isRead: true,
    isIgnored: false,
    relatedType: 'application',
    relatedId: 3,
    linkUrl: '/application/3',
    triggerTime: '2024-01-15T15:00:00Z',
    createdAt: '2024-01-15T15:00:00Z'
  },
  {
    id: 10,
    role: 'recruiter',
    type: 'new_application',
    title: '新投递提醒',
    content: '钱七 投递了「产品经理」职位，请及时筛选。',
    priority: 'normal',
    isRead: false,
    isIgnored: false,
    relatedType: 'application',
    relatedId: 5,
    linkUrl: '/application/5',
    triggerTime: '2024-01-17T09:00:00Z',
    createdAt: '2024-01-17T09:00:00Z'
  }
]

// ============ 中介平台数据 ============
// 服务人员（职业声明 + 实名认证）
let agencyWorkers = [
  {
    id: 1,
    name: '李阿姨',
    phone: '13700137001',
    city: '北京',
    profession: '保姆',
    skills: '做饭, 带孩子, 收纳整理',
    experience: '8年',
    description: '从事家政服务8年，擅长做饭和带孩子，性格耐心细致，有健康证。',
    expectedSalary: '6000-8000元/月',
    authStatus: 'verified',
    authInfo: {
      realName: '李秀英',
      idCard: '11010119800101****',
      idCardFront: 'idcard_front_1.jpg',
      idCardBack: 'idcard_back_1.jpg'
    },
    authRemark: '材料齐全，审核通过',
    authTime: '2024-01-10T10:00:00Z',
    rating: 4.8,
    orderCount: 12,
    status: 'available',
    createdAt: '2024-01-08T09:00:00Z'
  },
  {
    id: 2,
    name: '张师傅',
    phone: '13700137002',
    city: '北京',
    profession: '维修工',
    skills: '水电维修, 家电维修, 管道疏通',
    experience: '10年',
    description: '专业水电维修10年，承接各类家电维修、管道疏通，上门服务，价格合理。',
    expectedSalary: '200-500元/次',
    authStatus: 'verified',
    authInfo: {
      realName: '张建国',
      idCard: '11010119750505****',
      idCardFront: 'idcard_front_2.jpg',
      idCardBack: 'idcard_back_2.jpg'
    },
    authRemark: '材料齐全，审核通过',
    authTime: '2024-01-09T11:00:00Z',
    rating: 4.9,
    orderCount: 25,
    status: 'available',
    createdAt: '2024-01-07T14:00:00Z'
  },
  {
    id: 3,
    name: '王月嫂',
    phone: '13700137003',
    city: '上海',
    profession: '月嫂',
    skills: '新生儿护理, 产妇护理, 营养餐制作',
    experience: '6年',
    description: '高级月嫂，持月嫂证、催乳师证，护理过30+新生儿，专业细致。',
    expectedSalary: '12000-15000元/月',
    authStatus: 'verified',
    authInfo: {
      realName: '王丽芳',
      idCard: '31010119820303****',
      idCardFront: 'idcard_front_3.jpg',
      idCardBack: 'idcard_back_3.jpg'
    },
    authRemark: '材料齐全，审核通过',
    authTime: '2024-01-11T09:30:00Z',
    rating: 4.7,
    orderCount: 18,
    status: 'busy',
    createdAt: '2024-01-06T10:00:00Z'
  },
  {
    id: 4,
    name: '赵保洁',
    phone: '13700137004',
    city: '北京',
    profession: '保洁',
    skills: '日常保洁, 开荒保洁, 玻璃清洗',
    experience: '4年',
    description: '专业保洁4年，工具齐全，干活麻利，可上门服务。',
    expectedSalary: '50-80元/小时',
    authStatus: 'pending',
    authInfo: {
      realName: '赵小妹',
      idCard: '11010119900101****',
      idCardFront: 'idcard_front_4.jpg',
      idCardBack: 'idcard_back_4.jpg'
    },
    authRemark: '',
    authTime: null,
    rating: 0,
    orderCount: 0,
    status: 'available',
    createdAt: '2024-01-18T15:00:00Z'
  },
  {
    id: 5,
    name: '刘护工',
    phone: '13700137005',
    city: '上海',
    profession: '护工',
    skills: '老人护理, 医院陪护, 康复护理',
    experience: '7年',
    description: '专业护工7年，有护理证，擅长老人护理和医院陪护，细心负责。',
    expectedSalary: '200-300元/天',
    authStatus: 'unverified',
    authInfo: null,
    authRemark: '',
    authTime: null,
    rating: 0,
    orderCount: 0,
    status: 'available',
    createdAt: '2024-01-19T10:00:00Z'
  }
]

// 中介平台订单
let agencyOrders = [
  {
    id: 1,
    workerId: 1,
    workerName: '李阿姨',
    workerPhone: '13700137001',
    profession: '保姆',
    customerName: '陈先生',
    customerPhone: '13800138001',
    customerAddress: '北京市朝阳区XX小区5号楼',
    description: '需要保姆照顾老人，做一日三餐，每周休息一天。',
    scheduledTime: '2024-01-20T08:00:00Z',
    budget: '7000元/月',
    status: 'confirmed',
    timeline: [
      { status: 'pending', action: '客户下单', time: '2024-01-18T10:00:00Z' },
      { status: 'confirmed', action: '服务人员确认接单', time: '2024-01-18T11:00:00Z' }
    ],
    createdAt: '2024-01-18T10:00:00Z'
  },
  {
    id: 2,
    workerId: 2,
    workerName: '张师傅',
    workerPhone: '13700137002',
    profession: '维修工',
    customerName: '林女士',
    customerPhone: '13800138002',
    customerAddress: '北京市海淀区YY小区3号楼',
    description: '厨房水管漏水，需要上门维修。',
    scheduledTime: '2024-01-21T14:00:00Z',
    budget: '300元',
    status: 'completed',
    timeline: [
      { status: 'pending', action: '客户下单', time: '2024-01-15T09:00:00Z' },
      { status: 'confirmed', action: '服务人员确认接单', time: '2024-01-15T10:00:00Z' },
      { status: 'in_progress', action: '开始服务', time: '2024-01-15T14:00:00Z' },
      { status: 'completed', action: '服务完成', time: '2024-01-15T16:00:00Z' }
    ],
    createdAt: '2024-01-15T09:00:00Z'
  }
]

// 中介平台订单沟通消息
let agencyOrderMessages = [
  {
    id: 1,
    orderId: 1,
    senderType: 'customer',
    content: '请问您下周一开始可以吗？',
    createdAt: '2024-01-18T10:30:00Z'
  },
  {
    id: 2,
    orderId: 1,
    senderType: 'worker',
    content: '可以的，我下周一早上8点到。',
    createdAt: '2024-01-18T10:45:00Z'
  }
]

let hiringRequestIdCounter = 5

let jobIdCounter = 7
let applicationIdCounter = 6
let messageIdCounter = 4
let interviewIdCounter = 5
let feedbackIdCounter = 2
let notificationIdCounter = 11
let agencyWorkerIdCounter = 6
let agencyOrderIdCounter = 3
let agencyOrderMessageIdCounter = 3

module.exports = {
  jobs,
  applications,
  messages,
  interviews,
  feedbacks,
  hiringRequests,
  notifications,
  agencyWorkers,
  agencyOrders,
  agencyOrderMessages,
  getNextJobId: () => jobIdCounter++,
  getNextApplicationId: () => applicationIdCounter++,
  getNextMessageId: () => messageIdCounter++,
  getNextInterviewId: () => interviewIdCounter++,
  getNextFeedbackId: () => feedbackIdCounter++,
  getNextHiringRequestId: () => hiringRequestIdCounter++,
  getNextNotificationId: () => notificationIdCounter++,
  getNextAgencyWorkerId: () => agencyWorkerIdCounter++,
  getNextAgencyOrderId: () => agencyOrderIdCounter++,
  getNextAgencyOrderMessageId: () => agencyOrderMessageIdCounter++
}
