const BASE = 'http://localhost:3001/api/v1'

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function req(path, method = 'GET', body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${JSON.stringify(json)}`)
  return json
}

const results = []
function log(name, ok, extra = '') {
  results.push(`${ok ? '✅' : '❌'} ${name} ${extra}`)
  console.log(`${ok ? '✅' : '❌'} ${name} ${extra}`)
}

const day = today()

try {
  // 1. seed library
  const seed = await req('/seed/library')
  log('seed/library', seed.library.questions.length >= 20 && seed.library.goalTemplates.length >= 5,
    `题库${seed.library.questions.length}题/模板${seed.library.goalTemplates.length}个`)

  // 2. profile upsert (onboarding)
  const prof = await req('/profile', 'PUT', {
    name: '测试员', onboarded: true,
    wakeTime: '06:30', sleepTime: '23:00', workStart: '09:00', workEnd: '18:30',
    commuteMin: 30, workDays: [1,2,3,4,5],
  })
  log('profile PUT', prof.profile?.onboarded === true, `name=${prof.profile?.name}`)

  // 3. create goal from template
  const tplId = seed.library.goalTemplates[0].id
  const g = await req('/goals', 'POST', { title: '测试目标', category: 'study', templateId: tplId, weeklyDays: [1,2,3,4,5,6,0] })
  log('goals POST', !!g.goal?.id, g.goal?.title)

  // 4. tasks lazy generation
  const tasks = await req(`/tasks?date=${day}`)
  log('tasks GET', tasks.tasks.length > 0, `${tasks.tasks.length} 个自动任务`)

  // 5. schedule lazy generation
  const sched = await req(`/schedule?date=${day}`)
  log('schedule GET', sched.blocks.length >= 6, `${sched.blocks.length} 个时间块`)

  // 6. content today
  const ct = await req(`/content/today?date=${day}`)
  log('content today', !!ct.content, ct.content?.title ?? '(空)')

  // 7. checkin
  const firstTask = tasks.tasks[0]
  const ck = await req(`/checkins/${day}/${firstTask.id}`, 'PUT', { completed: true })
  log('checkin PUT', ck.checkin?.completed === true, firstTask.title)
  // 幂等重打卡
  await req(`/checkins/${day}/${firstTask.id}`, 'PUT', { completed: true })
  log('checkin 幂等', true)

  // 8. assessment
  const answers = {}
  for (const q of seed.library.questions) {
    if (!answers[q.dimension]) answers[q.dimension] = []
    answers[q.dimension].push(q.options[1].score)
  }
  const ass = await req('/assessments', 'POST', { answers })
  log('assessments POST', ass.assessment?.id > 0, `建议${ass.assessment.suggestions.length}条`)

  // 9. stats
  const stats = await req('/stats')
  log('stats GET', stats.todayTotal > 0 && typeof stats.streakDays === 'number',
    `今日${stats.todayCompleted}/${stats.todayTotal} 热力图${stats.heatmap.length}天`)

  // 10. manual task + delete
  const mt = await req('/tasks', 'POST', { title: '手动测试任务', category: 'life', durationMin: 20, date: day })
  log('tasks POST(manual)', !!mt.task?.id)
  await req(`/tasks/${mt.task.id}`, 'DELETE')
  log('tasks DELETE', true)

  // 11. export / reset / import
  const ex = await req('/data/export')
  log('data export', !!ex.data?.goals, `${ex.data?.goals?.length ?? 0} goals`)
  await req('/data/reset', 'POST')
  const profAfter = await req('/profile')
  log('data reset', profAfter.profile === null, '业务数据已清空')
  await req('/data/import', 'POST', ex)
  const profRestored = await req('/profile')
  log('data import', profRestored.profile?.name === '测试员', '数据已恢复')

  const failed = results.filter((r) => r.startsWith('❌'))
  console.log(`\n结果：${results.length - failed.length}/${results.length} 通过`)
  process.exit(failed.length ? 1 : 0)
} catch (e) {
  console.error('❌ 冒烟测试异常:', e.message)
  process.exit(1)
}
