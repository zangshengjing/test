import { Router } from 'express'
import {
  BOOKS,
  COURSES,
  DIMENSIONS,
  GOAL_TEMPLATES,
  LIBRARY_CONTENTS,
  QUESTIONS,
  SKILL_PATHS,
} from '../seed'

const router = Router()

/** GET /api/v1/seed/library（书单/课程/技能路径/题库/目标模板） */
router.get('/library', (_req, res) => {
  res.json({
    library: {
      dimensions: DIMENSIONS,
      questions: QUESTIONS,
      books: BOOKS,
      courses: COURSES,
      skillPaths: SKILL_PATHS,
      goalTemplates: GOAL_TEMPLATES,
      contents: LIBRARY_CONTENTS,
    },
  })
})

export default router
