import type {
  AssessmentQuestion,
  DimensionMeta,
  GoalTemplate,
  LearningContent,
  SkillPath,
} from '../../shared/types'
import { db } from './db'

// ============================================================
// 8 维度元数据
// ============================================================
export const DIMENSIONS: DimensionMeta[] = [
  {
    id: 'body',
    label: '身体健康',
    icon: 'Dumbbell',
    color: '#34D399',
    description: '睡眠、运动与饮食，是一切成长的物质基础。',
  },
  {
    id: 'finance',
    label: '财务自由',
    icon: 'Wallet',
    color: '#FBBF24',
    description: '储蓄、记账与规划，为家庭和未来建立安全垫。',
  },
  {
    id: 'skill',
    label: '职业技能',
    icon: 'Code2',
    color: '#60A5FA',
    description: '硬技能与成长路径，决定职业天花板。',
  },
  {
    id: 'social',
    label: '人际关系',
    icon: 'Users',
    color: '#FB7185',
    description: '与家人、朋友的联结质量，滋养内心能量。',
  },
  {
    id: 'mind',
    label: '心态情绪',
    icon: 'HeartPulse',
    color: '#A78BFA',
    description: '情绪稳定与正念，是应对压力的底层能力。',
  },
  {
    id: 'family',
    label: '家庭责任',
    icon: 'Home',
    color: '#F59E0B',
    description: '从被照顾者走向家庭支柱的成长必修课。',
  },
  {
    id: 'spirit',
    label: '精神成长',
    icon: 'BookOpen',
    color: '#38BDF8',
    description: '阅读与内省，让思想保持清澈与丰盈。',
  },
  {
    id: 'life',
    label: '生活管理',
    icon: 'CalendarCheck',
    color: '#4ADE80',
    description: '时间与秩序管理，让每一天高效而不失从容。',
  },
]

// ============================================================
// 8 维度自评题库（每题 5 个选项，得分 1-5）
// ============================================================
export const QUESTIONS: AssessmentQuestion[] = [
  // —— 身体 ——
  {
    id: 'body_1',
    dimension: 'body',
    text: '你平均每天的有效睡眠时长是？',
    options: [
      { label: '不足 6 小时', score: 1 },
      { label: '6～7 小时，常熬夜', score: 2 },
      { label: '7 小时左右，基本规律', score: 4 },
      { label: '7.5 小时以上，睡眠质量高', score: 5 },
    ],
  },
  {
    id: 'body_2',
    dimension: 'body',
    text: '你每周进行中等强度运动（快走/慢跑/力量）的次数？',
    options: [
      { label: '几乎不运动', score: 1 },
      { label: '1 次', score: 2 },
      { label: '2～3 次', score: 4 },
      { label: '4 次及以上', score: 5 },
    ],
  },
  {
    id: 'body_3',
    dimension: 'body',
    text: '你的三餐与饮水规律程度如何？',
    options: [
      { label: '不定时，常吃外卖高油高糖', score: 1 },
      { label: '偶尔规律，饮食随意', score: 2 },
      { label: '基本规律，会注意营养', score: 4 },
      { label: '很规律，有明确饮食计划', score: 5 },
    ],
  },
  // —— 财务 ——
  {
    id: 'finance_1',
    dimension: 'finance',
    text: '你每月是否有固定比例的储蓄？',
    options: [
      { label: '没有，月底常月光', score: 1 },
      { label: '有结余就存，不稳定', score: 2 },
      { label: '有固定比例储蓄', score: 4 },
      { label: '有储蓄+投资双轨计划', score: 5 },
    ],
  },
  {
    id: 'finance_2',
    dimension: 'finance',
    text: '你是否有记账与月度复盘的习惯？',
    options: [
      { label: '从不记账，花多少不清楚', score: 1 },
      { label: '只记大额支出', score: 2 },
      { label: '用工具记账，月度大致复盘', score: 4 },
      { label: '分类预算+每周复盘', score: 5 },
    ],
  },
  {
    id: 'finance_3',
    dimension: 'finance',
    text: '你对未来 1～3 年家庭财务的掌控感？',
    options: [
      { label: '完全没有概念', score: 1 },
      { label: '知道要攒钱但无规划', score: 2 },
      { label: '有存款目标，正在执行', score: 4 },
      { label: '有完整财务规划并动态调整', score: 5 },
    ],
  },
  // —— 职业技能 ——
  {
    id: 'skill_1',
    dimension: 'skill',
    text: '你每周投入职业技能学习的时长？',
    options: [
      { label: '不足 1 小时', score: 1 },
      { label: '2～3 小时', score: 2 },
      { label: '3～5 小时', score: 4 },
      { label: '5 小时以上', score: 5 },
    ],
  },
  {
    id: 'skill_2',
    dimension: 'skill',
    text: '你是否有清晰的技术成长路径？',
    options: [
      { label: '没有，走一步看一步', score: 1 },
      { label: '有模糊方向', score: 2 },
      { label: '有明确方向', score: 4 },
      { label: '有具体阶段计划并定期校准', score: 5 },
    ],
  },
  {
    id: 'skill_3',
    dimension: 'skill',
    text: '你是否有项目沉淀与复盘的习惯？',
    options: [
      { label: '从不记录', score: 1 },
      { label: '偶尔写笔记', score: 2 },
      { label: '经常总结并输出', score: 4 },
      { label: '形成系统知识库并分享', score: 5 },
    ],
  },
  // —— 人际关系 ——
  {
    id: 'social_1',
    dimension: 'social',
    text: '你每周与家人深度交流（非日常寒暄）的次数？',
    options: [
      { label: '几乎没有', score: 1 },
      { label: '1 次', score: 2 },
      { label: '2～3 次', score: 4 },
      { label: '4 次及以上', score: 5 },
    ],
  },
  {
    id: 'social_2',
    dimension: 'social',
    text: '你与朋友的联络与见面频率？',
    options: [
      { label: '很少主动联系', score: 1 },
      { label: '偶尔线上聊聊', score: 2 },
      { label: '经常联系，偶尔见面', score: 4 },
      { label: '有固定的朋友圈层与聚会', score: 5 },
    ],
  },
  {
    id: 'social_3',
    dimension: 'social',
    text: '当你需要帮助时，会主动开口求助吗？',
    options: [
      { label: '从不，怕麻烦别人', score: 1 },
      { label: '很少，习惯硬扛', score: 2 },
      { label: '必要时会求助', score: 4 },
      { label: '能自然寻求与给予支持', score: 5 },
    ],
  },
  // —— 心态情绪 ——
  {
    id: 'mind_1',
    dimension: 'mind',
    text: '你近期的情绪稳定性如何？',
    options: [
      { label: '经常焦虑、易怒', score: 1 },
      { label: '偶尔情绪波动', score: 2 },
      { label: '整体稳定，能自我调节', score: 4 },
      { label: '情绪稳定，内心平和', score: 5 },
    ],
  },
  {
    id: 'mind_2',
    dimension: 'mind',
    text: '你是否有冥想、正念或放空练习？',
    options: [
      { label: '从不练习', score: 1 },
      { label: '偶尔尝试', score: 2 },
      { label: '每周有固定练习', score: 4 },
      { label: '每日 10 分钟以上', score: 5 },
    ],
  },
  {
    id: 'mind_3',
    dimension: 'mind',
    text: '面对突发压力（加班/冲突/计划外支出），你的应对？',
    options: [
      { label: '容易崩溃或逃避', score: 1 },
      { label: '会焦虑但能硬撑', score: 2 },
      { label: '能冷静分析处理', score: 4 },
      { label: '从容应对，善用支持系统', score: 5 },
    ],
  },
  // —— 家庭责任 ——
  {
    id: 'family_1',
    dimension: 'family',
    text: '你每周陪伴家人（伴侣/父母）的有效时间？',
    options: [
      { label: '不足 1 小时', score: 1 },
      { label: '1～3 小时', score: 2 },
      { label: '3～7 小时', score: 4 },
      { label: '7 小时以上', score: 5 },
    ],
  },
  {
    id: 'family_2',
    dimension: 'family',
    text: '你是否参与家庭事务（财务/家务/规划）的决策？',
    options: [
      { label: '完全不参与', score: 1 },
      { label: '被动配合', score: 2 },
      { label: '积极参与共商', score: 4 },
      { label: '主动主导家庭规划', score: 5 },
    ],
  },
  {
    id: 'family_3',
    dimension: 'family',
    text: '你对步入婚姻/育子的准备程度？',
    options: [
      { label: '还没认真想过', score: 1 },
      { label: '有想法但无计划', score: 2 },
      { label: '正在做准备（财务/能力/心态）', score: 4 },
      { label: '已基本就绪并持续学习', score: 5 },
    ],
  },
  // —— 精神成长 ——
  {
    id: 'spirit_1',
    dimension: 'spirit',
    text: '你每月完整阅读的书籍数量？',
    options: [
      { label: '0 本', score: 1 },
      { label: '1 本', score: 2 },
      { label: '2 本', score: 4 },
      { label: '3 本及以上', score: 5 },
    ],
  },
  {
    id: 'spirit_2',
    dimension: 'spirit',
    text: '你保持学习新事物的热情程度？',
    options: [
      { label: '没有，安于现状', score: 1 },
      { label: '偶尔有兴趣', score: 2 },
      { label: '会主动学习感兴趣的新领域', score: 4 },
      { label: '有持续学习的系统习惯', score: 5 },
    ],
  },
  {
    id: 'spirit_3',
    dimension: 'spirit',
    text: '你是否有独处思考或复盘的时间？',
    options: [
      { label: '几乎没有', score: 1 },
      { label: '偶尔睡前想想', score: 2 },
      { label: '每周固定复盘', score: 4 },
      { label: '每日记录+周复盘', score: 5 },
    ],
  },
  // —— 生活管理 ——
  {
    id: 'life_1',
    dimension: 'life',
    text: '你的时间管理能力如何？',
    options: [
      { label: '混乱，常被事情推着走', score: 1 },
      { label: '一般，靠 deadline 驱动', score: 2 },
      { label: '有计划，能安排重要的事', score: 4 },
      { label: '高效，主次分明且留有余量', score: 5 },
    ],
  },
  {
    id: 'life_2',
    dimension: 'life',
    text: '你的居住与办公环境整洁度？',
    options: [
      { label: '比较乱，影响效率', score: 1 },
      { label: '一般，定期大扫除', score: 2 },
      { label: '较整洁，有收纳习惯', score: 4 },
      { label: '很整洁，物归原位', score: 5 },
    ],
  },
  {
    id: 'life_3',
    dimension: 'life',
    text: '你的生活节奏（作息/饮食/工作平衡）规律吗？',
    options: [
      { label: '很不规律，随缘', score: 1 },
      { label: '一般，偶尔失控', score: 2 },
      { label: '较规律，有基本节奏', score: 4 },
      { label: '很规律，工作生活平衡', score: 5 },
    ],
  },
]

// ============================================================
// 书单（文字学习内容）
// ============================================================
export const BOOKS: LearningContent[] = [
  {
    id: 'book_habits',
    type: 'text',
    title: '《掌控习惯》',
    category: 'mind',
    link: 'https://weread.qq.com/web/search/books?keyword=掌控习惯',
    summary: 'James Clear 习惯四法则：让好习惯显而易见、有吸引力、简便易行、令人愉悦。',
    durationMin: 30,
    origin: 'builtin',
    textBody:
      '习惯是自我提高的复利。微小的改进每日重复，1 年后将带来 37 倍的成长。\n\n习惯形成的四步循环：提示 → 渴望 → 反应 → 奖赏。\n\n四大行为转变法则：\n1. 让它显而易见：设计环境，减少可见性对抗（如把书放在枕边）。\n2. 让它有吸引力：把"需要做的事"与"想做的事"绑定（习惯叠加）。\n3. 让它简便易行：两分钟法则，把新习惯压到两分钟内启动。\n4. 让它令人愉悦：即时奖赏强化行为，形成闭环。\n\n真正的行为改变是身份的改变：不是"我要跑步"，而是"我是一个有活力的人"。',
  },
  {
    id: 'book_21days',
    type: 'text',
    title: '《微习惯》',
    category: 'life',
    link: 'https://weread.qq.com/web/search/books?keyword=微习惯',
    summary: '每天一个俯卧撑：用"小到不可能失败"的策略养成自律。',
    durationMin: 25,
    origin: 'builtin',
    textBody:
      '意志力有限，但我们可以用"微习惯"绕过意志力的消耗。\n\n核心：把目标缩小到荒谬的程度——每天 1 个俯卧撑、1 页书、50 字写作。\n\n为什么有效：\n1. 启动成本极低，不会触发大脑的抗拒。\n2. 完成后常有"超额完成"的惯性，实际收获远超计划。\n3. 微小成功积累自我效能感，形成正向循环。\n\n实操：选定 1-3 个微习惯 → 固定时间执行 → 记录打卡 → 偶尔超额、绝不中断。',
  },
  {
    id: 'book_finance',
    type: 'text',
    title: '《富爸爸穷爸爸》核心财商',
    category: 'finance',
    link: 'https://weread.qq.com/web/search/books?keyword=富爸爸穷爸爸',
    summary: '资产与负债的本质：让钱为你工作，而不是为钱工作。',
    durationMin: 30,
    origin: 'builtin',
    textBody:
      '穷爸爸说"我付不起"，富爸爸问"我怎么才能付得起"。\n\n核心概念：\n1. 资产：把钱放进你口袋的东西（房产租金、股息、版权、生意）。\n2. 负债：把钱从你口袋拿走的东西（车贷、消费贷、自住房贷）。\n3. 富人先买入资产，再用资产产生的现金流购买奢侈品。\n\n给职场人的行动：\n- 每月先储蓄 10%-20%，再消费。\n- 学习一门投资技能（基金定投、可转债、指数）。\n- 关注现金流，而非工资数字。',
  },
  {
    id: 'book_communication',
    type: 'text',
    title: '《非暴力沟通》',
    category: 'social',
    link: 'https://weread.qq.com/web/search/books?keyword=非暴力沟通',
    summary: '观察-感受-需要-请求四步法，化解亲密关系与职场冲突。',
    durationMin: 30,
    origin: 'builtin',
    textBody:
      '非暴力沟通四要素：\n1. 观察：不带评判地描述事实（"你这周有三天 11 点后回家"）。\n2. 感受：表达真实感受（"我感到孤单和担忧"）。\n3. 需要：说出背后的需要（"因为我需要我们的联结"）。\n4. 请求：提出具体可执行的请求（"下次加班能提前发消息给我吗？"）。\n\n常见误区：指责（"你总是这样"）、评判（"你太自私"）、比较、命令。\n\n练习：与伴侣/父母沟通前，先在纸上写下四步，再开口。',
  },
  {
    id: 'book_deepwork',
    type: 'text',
    title: '《深度工作》',
    category: 'skill',
    link: 'https://weread.qq.com/web/search/books?keyword=深度工作',
    summary: '在碎片化时代，用深度专注建立不可替代的稀缺能力。',
    durationMin: 35,
    origin: 'builtin',
    textBody:
      '深度工作：在无干扰状态下专注进行职业活动，使认知能力达到极限。\n\n四大准则：\n1. 工作要深入：固定深度工作时段（如每天 8:30-10:30），关掉通知。\n2. 拥抱无聊：训练大脑抵抗刷手机的冲动。\n3. 远离社交媒体：减少低价值注意力的侵蚀。\n4. 摒弃肤浅：把 80% 的时间留给最重要的事。\n\n深度工作 90 分钟法则：一次深度专注 90 分钟 ≈ 半天的碎片化产出。',
  },
  {
    id: 'book_sleep',
    type: 'text',
    title: '《睡眠革命》',
    category: 'body',
    link: 'https://weread.qq.com/web/search/books?keyword=睡眠革命',
    summary: '以 90 分钟周期规划睡眠，用晨光与体温节律唤醒身体。',
    durationMin: 25,
    origin: 'builtin',
    textBody:
      '睡眠以 90 分钟为一个周期（R90 方案），成年人每天需要 4-6 个周期。\n\n关键建议：\n1. 固定起床时间，倒推入睡时间，而非"困了就睡"。\n2. 睡前 30 分钟远离蓝光，调暗灯光，让褪黑素分泌。\n3. 卧室温度 18 度左右，完全黑暗，安静。\n4. 醒来先见自然光 15 分钟，帮助校准生物钟。\n\n对职场人的意义：睡好觉 = 第二天的专注力、情绪稳定与免疫力。',
  },
  {
    id: 'book_relationship',
    type: 'text',
    title: '《爱的五种语言》',
    category: 'family',
    link: 'https://weread.qq.com/web/search/books?keyword=爱的五种语言',
    summary: '肯定的言辞、精心的时刻、接受礼物、服务的行动、身体的接触。',
    durationMin: 25,
    origin: 'builtin',
    textBody:
      '每个人都有自己偏好的"爱之语"，用对方语言表达，关系才能被感知。\n\n五种语言：\n1. 肯定的言辞：真诚的赞美与感谢。\n2. 精心的时刻：放下手机的专注陪伴。\n3. 接受礼物：用心挑选的小惊喜。\n4. 服务的行动：主动分担家务。\n5. 身体的接触：拥抱、牵手。\n\n练习：观察伴侣/父母最常向你表达爱的方式，那往往就是 TA 期待被爱的方式。',
  },
  {
    id: 'book_meditation',
    type: 'text',
    title: '《十分钟冥想》',
    category: 'mind',
    link: 'https://weread.qq.com/web/search/books?keyword=十分钟冥想',
    summary: '每天 10 分钟正念练习，找回专注与平静。',
    durationMin: 20,
    origin: 'builtin',
    textBody:
      '冥想不是放空，而是"观察念头升起又落下"的能力训练。\n\n10 分钟入门步骤：\n1. 准备：找个安静地方，坐直，设定计时器。\n2. 放松：深呼吸三次，感受身体与座椅的接触。\n3. 专注：把注意力放在呼吸上，感受鼻尖气流。\n4. 走神就回来：念头飘走是正常的，温柔地把注意力拉回呼吸。\n5. 结束：慢慢睁开眼睛，带着觉察开始这一天。\n\n坚持 30 天，你会明显感到情绪调节与专注力的提升。',
  },
]

// ============================================================
// 课程（视频学习内容）
// ============================================================
export const COURSES: LearningContent[] = [
  {
    id: 'course_frontend',
    type: 'video',
    title: '前端性能优化实战',
    category: 'study',
    summary: '从构建、运行时到网络加载，全面诊断并优化前端性能。',
    durationMin: 45,
    origin: 'builtin',
    videoUrl: 'https://search.bilibili.com/all?keyword=%E5%89%8D%E7%AB%AF%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96%E5%AE%9E%E6%88%98',
  },
  {
    id: 'course_ts',
    type: 'video',
    title: 'TypeScript 工程化进阶',
    category: 'study',
    summary: '类型体操、泛型实战与大型项目类型架构设计。',
    durationMin: 40,
    origin: 'builtin',
    videoUrl: 'https://search.bilibili.com/all?keyword=TypeScript%E5%B7%A5%E7%A8%8B%E5%8C%96%E8%BF%9B%E9%98%B6',
  },
  {
    id: 'course_react',
    type: 'video',
    title: 'React 18 核心原理',
    category: 'study',
    summary: '理解渲染机制、并发特性与状态管理设计。',
    durationMin: 50,
    origin: 'builtin',
    videoUrl: 'https://search.bilibili.com/all?keyword=React%2018%E6%A0%B8%E5%BF%83%E5%8E%9F%E7%90%86',
  },
  {
    id: 'course_finance',
    type: 'video',
    title: '理财入门：从零构建家庭资产配置',
    category: 'finance',
    summary: '指数基金、储蓄险、应急金三步走，30 岁开始不晚。',
    durationMin: 35,
    origin: 'builtin',
    videoUrl: 'https://search.bilibili.com/all?keyword=%E7%90%86%E8%B4%A2%E5%85%A5%E9%97%A8%E5%AE%B6%E5%BA%AD%E8%B5%84%E4%BA%A7%E9%85%8D%E7%BD%AE',
  },
  {
    id: 'course_fitness',
    type: 'video',
    title: '居家力量训练计划（无器械）',
    category: 'fitness',
    summary: '俯卧撑、深蹲、核心训练的科学组合与进阶方法。',
    durationMin: 30,
    origin: 'builtin',
    videoUrl: 'https://search.bilibili.com/all?keyword=%E5%B1%85%E5%AE%B6%E5%8A%9B%E9%87%8F%E8%AE%AD%E7%BB%83%E6%97%A0%E5%99%A8%E6%A2%B0',
  },
  {
    id: 'course_mind',
    type: 'video',
    title: '正念冥想入门引导',
    category: 'mind',
    summary: '跟随引导完成 10 分钟身体扫描与呼吸觉察。',
    durationMin: 15,
    origin: 'builtin',
    videoUrl: 'https://search.bilibili.com/all?keyword=%E6%AD%A3%E5%BF%B5%E5%86%A5%E6%83%B3%E5%85%A5%E9%97%A8%E5%BC%95%E5%AF%BC',
  },
  {
    id: 'course_family',
    type: 'video',
    title: '亲密关系沟通课',
    category: 'family',
    summary: '用"非暴力沟通"化解日常摩擦，经营幸福家庭。',
    durationMin: 40,
    origin: 'builtin',
    videoUrl: 'https://search.bilibili.com/all?keyword=%E4%BA%B2%E5%AF%86%E5%85%B3%E7%B3%BB%E6%B2%9F%E9%80%9A%E8%AF%BE',
  },
  {
    id: 'course_habit',
    type: 'video',
    title: '习惯养成的科学方法',
    category: 'life',
    summary: '基于行为心理学的习惯设计与意志力管理。',
    durationMin: 25,
    origin: 'builtin',
    videoUrl: 'https://search.bilibili.com/all?keyword=%E4%B9%A0%E6%83%AF%E5%85%BB%E6%88%90%E7%9A%84%E7%A7%91%E5%AD%A6%E6%96%B9%E6%B3%95',
  },
]

// ============================================================
// 分阶段技能成长路径
// ============================================================
export const SKILL_PATHS: SkillPath[] = [
  {
    id: 'path_frontend',
    title: '前端高级工程师 90 天进阶',
    description: '从熟练工到能设计架构的进阶路线',
    category: 'study',
    stages: [
      { name: '阶段一 · 地基夯实（30 天）', items: ['JavaScript 语言精粹重读', 'HTTP/浏览器原理', '数据结构与算法入门'] },
      { name: '阶段二 · 框架深潜（30 天）', items: ['React 核心源码解读', 'TypeScript 类型系统', '工程化与构建优化'] },
      { name: '阶段三 · 架构能力（30 天）', items: ['微前端与模块设计', '性能监控与调优', '技术方案沉淀与分享'] },
    ],
  },
  {
    id: 'path_finance',
    title: '家庭理财 30 天入门',
    description: '建立储蓄、保障与投资的基本框架',
    category: 'finance',
    stages: [
      { name: '第一周 · 盘点', items: ['记账 7 天摸清现金流', '梳理家庭资产负债', '建立应急金（3-6 个月支出）'] },
      { name: '第二周 · 保障', items: ['认识社保与商业保险', '配置基础医疗险', '学习基金定投原理'] },
      { name: '第三、四周 · 配置', items: ['制定储蓄-投资-消费比例', '开启指数基金定投', '建立年度财务复盘模板'] },
    ],
  },
  {
    id: 'path_fitness',
    title: '体能提升 8 周计划',
    description: '从久坐族到拥有稳定运动习惯',
    category: 'fitness',
    stages: [
      { name: '第 1-2 周 · 启动', items: ['每日 10 分钟拉伸', '每周 2 次 30 分钟快走', '建立睡眠与饮水习惯'] },
      { name: '第 3-5 周 · 适应', items: ['每周 3 次力量训练（徒手）', '加入 1 次中等强度有氧', '记录身体数据'] },
      { name: '第 6-8 周 · 强化', items: ['每周 4 次训练并增加强度', '尝试 HIIT 或跑步', '评估并制定下阶段目标'] },
    ],
  },
  {
    id: 'path_mind',
    title: '情绪与精力管理',
    description: '用正念与精力法则提升内在稳定性',
    category: 'mind',
    stages: [
      { name: '第一周 · 觉察', items: ['每日 10 分钟冥想', '情绪日记记录触发点', '识别精力低谷时段'] },
      { name: '第二周 · 调节', items: ['练习深呼吸应激法', '建立午间恢复仪式', '减少手机被动刷屏'] },
      { name: '第三、四周 · 系统', items: ['每周复盘情绪模式', '把冥想固定为晨间习惯', '设计工作与休息节律'] },
    ],
  },
]

// ============================================================
// 目标模板（自动拆解为每日任务）
// ============================================================
export const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    id: 'tpl_fitness',
    title: '打造强健体魄',
    description: '每周 3-4 次力量与有氧训练，从新手到养成稳定运动习惯',
    category: 'fitness',
    targetDays: 90,
    weeklyDays: [1, 3, 5],
    tasks: [
      { title: '力量训练 · 上肢', category: 'fitness', durationMin: 45, weeklyDays: [1] },
      { title: '力量训练 · 下肢', category: 'fitness', durationMin: 45, weeklyDays: [3] },
      { title: '有氧耐力训练', category: 'fitness', durationMin: 30, weeklyDays: [5] },
      { title: '睡前拉伸放松', category: 'fitness', durationMin: 10, weeklyDays: [1, 2, 3, 4, 5] },
    ],
  },
  {
    id: 'tpl_skill',
    title: '职业硬技能进阶',
    description: '每天 40 分钟技术学习，90 天完成一个能力跃迁',
    category: 'study',
    targetDays: 90,
    weeklyDays: [1, 2, 3, 4, 5],
    tasks: [
      { title: '技术学习 · 主攻专题', category: 'study', durationMin: 40, weeklyDays: [1, 2, 3, 4, 5] },
      { title: '代码复盘与输出笔记', category: 'study', durationMin: 20, weeklyDays: [3, 6] },
    ],
  },
  {
    id: 'tpl_finance',
    title: '家庭财务规划',
    description: '记账、储蓄与理财学习，为婚姻和新家庭建立安全垫',
    category: 'finance',
    targetDays: 90,
    weeklyDays: [1, 2, 3, 4, 5, 6, 0],
    tasks: [
      { title: '记账并复盘今日支出', category: 'finance', durationMin: 5, weeklyDays: [1, 2, 3, 4, 5, 6, 0] },
      { title: '理财课程/书籍学习', category: 'finance', durationMin: 30, weeklyDays: [2, 4, 6] },
    ],
  },
  {
    id: 'tpl_family',
    title: '经营幸福家庭',
    description: '每天专注陪伴家人，学习沟通与责任承担',
    category: 'family',
    targetDays: 90,
    weeklyDays: [1, 2, 3, 4, 5, 6, 0],
    tasks: [
      { title: '陪伴家人 · 专注交流 30 分钟', category: 'family', durationMin: 30, weeklyDays: [1, 2, 3, 4, 5, 6, 0] },
      { title: '家庭关系学习（沟通/亲密关系）', category: 'family', durationMin: 25, weeklyDays: [3, 6] },
    ],
  },
  {
    id: 'tpl_mind',
    title: '心态与情绪管理',
    description: '每日冥想与情绪觉察，做一个情绪稳定的人',
    category: 'mind',
    targetDays: 60,
    weeklyDays: [1, 2, 3, 4, 5, 6, 0],
    tasks: [
      { title: '正念冥想 10 分钟', category: 'mind', durationMin: 10, weeklyDays: [1, 2, 3, 4, 5, 6, 0] },
      { title: '情绪日记', category: 'mind', durationMin: 10, weeklyDays: [1, 2, 3, 4, 5, 6, 0] },
    ],
  },
  {
    id: 'tpl_reading',
    title: '深度阅读计划',
    description: '每天 30 分钟阅读，一年完成 12+ 本经典',
    category: 'study',
    targetDays: 90,
    weeklyDays: [1, 2, 3, 4, 5, 6, 0],
    tasks: [
      { title: '阅读 30 分钟', category: 'study', durationMin: 30, weeklyDays: [1, 2, 3, 4, 5, 6, 0] },
      { title: '读书笔记输出', category: 'study', durationMin: 15, weeklyDays: [6] },
    ],
  },
  {
    id: 'tpl_calligraphy',
    title: '每天练字',
    description: '每天 30 分钟睡前临帖，静心养性，90 天练出一手好字',
    category: 'mind',
    targetDays: 90,
    weeklyDays: [1, 2, 3, 4, 5, 6, 0],
    tasks: [
      { title: '书法临帖 · 楷书', category: 'mind', durationMin: 30, weeklyDays: [1, 2, 3, 4, 5, 6, 0] },
      { title: '控笔线条基础练习', category: 'mind', durationMin: 10, weeklyDays: [1, 3, 5] },
    ],
  },
  {
    id: 'tpl_drawing',
    title: '学习画画',
    description: '从素描打基础到独立创作，每周 4 天系统练习',
    category: 'study',
    targetDays: 90,
    weeklyDays: [2, 4, 6, 0],
    tasks: [
      { title: '素描基础 · 排线造型', category: 'study', durationMin: 45, weeklyDays: [2, 4] },
      { title: '绘画创作 · 完整作品', category: 'study', durationMin: 60, weeklyDays: [6] },
      { title: '日常速写 · 抓形练习', category: 'study', durationMin: 20, weeklyDays: [0] },
    ],
  },
]

// ============================================================
// 文字/视频内容库（每日内容分配池）
// ============================================================
export const LIBRARY_CONTENTS: LearningContent[] = [
  ...BOOKS,
  ...COURSES,
  {
    id: 'text_pomodoro',
    type: 'text',
    title: '番茄工作法实践指南',
    category: 'life',
    link: 'https://search.bilibili.com/all?keyword=番茄工作法',
    summary: '25 分钟专注 + 5 分钟休息的节奏，拯救被手机切割的时间。',
    durationMin: 15,
    origin: 'builtin',
    textBody:
      '番茄工作法核心：一个番茄钟 = 25 分钟专注 + 5 分钟休息，4 个番茄钟后大休息 15-30 分钟。\n\n要点：\n1. 每轮只做一个任务，一次只做一个番茄。\n2. 铃声响起必须停手，起身活动、喝水、望远处。\n3. 被打断：紧急事记入"待办收集箱"，不立刻处理。\n4. 预估任务番茄数，复盘每轮实际耗时。\n\n进阶：把番茄钟与"今日三件事"结合，每天先用 3 个番茄啃掉最重要的任务。',
  },
  {
    id: 'text_compound',
    type: 'text',
    title: '复利思维：普通人如何积累第一桶金',
    category: 'finance',
    link: 'https://search.bilibili.com/all?keyword=复利思维',
    summary: '本金 × 收益率 × 时间是财富公式，越早开始越好。',
    durationMin: 20,
    origin: 'builtin',
    textBody:
      '复利公式：最终价值 = 本金 × (1+收益率)^时间。\n\n三个变量中，时间最公平也最容易被忽视：\n- 25 岁每月定投 2000 元（年化 8%），60 岁约 200 万+。\n- 35 岁才开始，同样的目标每月需要近 2 倍投入。\n\n行动建议：\n1. 强制储蓄：工资到账先转 10%-20% 到理财账户。\n2. 选择低费率指数基金定投，长期持有。\n3. 把"多赚、少花、稳投"写进每月复盘。',
  },
  {
    id: 'text_sleep_habit',
    type: 'text',
    title: '睡前 30 分钟黄金习惯',
    link: 'https://search.bilibili.com/all?keyword=睡前习惯',
    category: 'body',
    summary: '放下手机、热水澡、轻阅读、写明日计划，一夜好眠。',
    durationMin: 15,
    origin: 'builtin',
    textBody:
      '睡前 30 分钟决定睡眠质量与第二天的状态。\n\n建议流程：\n1. 睡前 60 分钟：调暗灯光，停止剧烈运动。\n2. 睡前 30 分钟：手机放客厅充电，远离蓝光。\n3. 热水澡或泡脚 10 分钟，体温回落助眠。\n4. 阅读 15 分钟纸质书，替代刷短视频。\n5. 写下明日最重要的三件事，清空大脑。\n\n坚持一周，入睡时间平均提前 30 分钟，深度睡眠明显增加。',
  },
  {
    id: 'text_kpt',
    type: 'text',
    title: '高效复盘法：KPT 模板',
    link: 'https://search.bilibili.com/all?keyword=KPT复盘法',
    category: 'skill',
    summary: 'Keep 保持 / Problem 问题 / Try 尝试，10 分钟完成一次高质量复盘。',
    durationMin: 10,
    origin: 'builtin',
    textBody:
      'KPT 复盘模板：\n- Keep（保持）：今天/本周哪些做法有效，要继续？\n- Problem（问题）：遇到了哪些阻碍、浪费了哪些时间？\n- Try（尝试）：下周想尝试的一个新方法是什么？\n\n为什么有效：\n1. 结构极简，降低复盘启动成本。\n2. 聚焦行动，避免空泛的"我要更努力"。\n3. 每周一次，沉淀个人方法论。\n\n搭配建议：每周日晚 20 分钟，对着上一条记录做对比复盘。',
  },
  {
    id: 'text_meditation_start',
    type: 'text',
    title: '冥想入门：10 分钟正念呼吸',
    category: 'mind',
    link: 'https://search.bilibili.com/all?keyword=正念冥想入门',
    summary: '呼吸是锚，念头是云。一套零基础的正念呼吸练习。',
    durationMin: 12,
    origin: 'builtin',
    textBody:
      '正念呼吸练习（10 分钟）：\n\n第 1-2 分钟：安顿。坐直，闭眼，做三次深长的呼吸，感受身体。\n第 3-8 分钟：觉察。注意力放在鼻尖或腹部的呼吸起伏上。念头飘走很正常，觉察到就走回来，像训练小狗一样温和坚定。\n第 9-10 分钟：扩展。把觉察范围扩展到全身，感受整体存在。\n\n结束：搓热双手，轻抚脸颊，睁眼，带着这份清明投入生活。\n\n每天固定时间练习，21 天形成习惯。',
  },
  {
    id: 'text_strength',
    type: 'text',
    title: '徒手力量训练基础',
    link: 'https://search.bilibili.com/all?keyword=徒手力量训练',
    category: 'fitness',
    summary: '俯卧撑、深蹲、平板支撑三大动作的正确姿势与进阶。',
    durationMin: 20,
    origin: 'builtin',
    textBody:
      '三大徒手动作：\n\n1. 俯卧撑（上肢推）\n标准：双手略宽于肩，身体一条直线，下放至胸部近地。\n进阶：宽距、下斜、钻石俯卧撑。\n\n2. 深蹲（下肢）\n标准：双脚与肩同宽，臀部向后坐下蹲至大腿平行地面，膝盖不内扣。\n进阶：箭步蹲、单腿深蹲。\n\n3. 平板支撑（核心）\n标准：肘撑地，身体从头顶到脚跟一条直线，收紧核心不塌腰。\n进阶：侧平板、动态平板。\n\n训练方案：每动作 3 组 × 8-12 次，组间休息 60 秒，每周 3 次，隔天进行。',
  },
  {
    id: 'text_focus',
    type: 'text',
    title: '专注力训练：手机戒断 90 分钟',
    category: 'life',
    link: 'https://search.bilibili.com/all?keyword=深度专注训练',
    summary: '把手机放远、制造无干扰环境，体验深度专注的复利。',
    durationMin: 15,
    origin: 'builtin',
    textBody:
      '为什么手机比工作更有吸引力？因为短反馈回路劫持了多巴胺。\n\n90 分钟深度专注训练法：\n1. 物理隔离：手机放在另一个房间或上锁抽屉。\n2. 环境设计：桌面只留当前任务的物品，电脑关掉通知。\n3. 目标明确：写下这一个番茄要完成的具体产出。\n4. 视觉提示：贴一张"我在深度工作"的便签。\n\n每周做 3 次 90 分钟深潜，四周后你会明显感到专注力回升。',
  },
]

// ============================================================
// 向内容库表写入内置内容（幂等 seed）
// ============================================================

/** 基于 id 生成确定性模拟浏览量/发布时间（用于“最新热门”排序展示） */
function mockMetrics(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  const views = 800 + (h % 48000) // 800 ~ 48799
  const daysAgo = h % 200 // 0 ~ 199 天前
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  const publishedAt = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { views, publishedAt }
}

export function seedContentLibrary() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO content_library
      (id, type, title, category, summary, duration_min, text_body, video_url, embed_url, link, origin, views, published_at)
    VALUES (@id, @type, @title, @category, @summary, @durationMin, @textBody, @videoUrl, @embedUrl, @link, 'builtin', @views, @publishedAt)
  `)
  const updateMeta = db.prepare(
    'UPDATE content_library SET views = @views, published_at = @publishedAt, link = @link WHERE id = @id'
  )
  const run = db.transaction(() => {
    for (const c of LIBRARY_CONTENTS) {
      const { views, publishedAt } = mockMetrics(c.id)
      insert.run({
        id: c.id,
        type: c.type,
        title: c.title,
        category: c.category,
        summary: c.summary,
        durationMin: c.durationMin,
        textBody: c.textBody ?? null,
        videoUrl: c.videoUrl ?? null,
        embedUrl: c.embedUrl ?? null,
        link: c.link ?? null,
        views,
        publishedAt,
      })
      // 已有行同步刷新模拟浏览量/发布时间/资源链接
      updateMeta.run({ id: c.id, views, publishedAt, link: c.link ?? null })
    }
  })
  run()
}
