// 一次性完成引导：提交 profile + assessment
const base = 'http://localhost:3001/api/v1'

const profile = {
  name: '小明',
  wakeTime: '06:30',
  sleepTime: '23:00',
  workStart: '09:00',
  workEnd: '18:30',
  commuteMin: 30,
  workDays: [1, 2, 3, 4, 5],
  goals: ['职业硬技能进阶', '深度阅读计划'],
  onboarded: true,
}

const answers = []
for (let i = 1; i <= 24; i++) {
  answers.push({ questionId: 'q' + i, score: ((i % 4) + 2) })
}

;(async () => {
  const p = await fetch(base + '/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })
  console.log('PROFILE', p.status, (await p.text()).slice(0, 120))

  const a = await fetch(base + '/assessments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  })
  console.log('ASSESS', a.status, (await a.text()).slice(0, 200))
})()
