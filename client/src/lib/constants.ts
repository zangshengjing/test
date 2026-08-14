import type { ContentCategory, DimensionId, TaskCategory } from '../../../shared/types'

export const CATEGORY_LABEL: Record<TaskCategory, string> = {
  study: '学习',
  fitness: '健身',
  finance: '理财',
  family: '家庭',
  mind: '心态',
  life: '生活',
}

export const CATEGORY_COLOR: Record<string, string> = {
  study: '#60A5FA',
  fitness: '#34D399',
  finance: '#FBBF24',
  family: '#F59E0B',
  mind: '#A78BFA',
  life: '#4ADE80',
}

export const CONTENT_CATEGORY_LABEL: Record<ContentCategory, string> = {
  study: '技能成长',
  finance: '理财知识',
  mind: '心态正念',
  family: '家庭关系',
  life: '效率生活',
}

export const DIMENSION_LABELS: Record<DimensionId, string> = {
  body: '身体健康',
  finance: '财务自由',
  skill: '职业技能',
  social: '人际关系',
  mind: '心态情绪',
  family: '家庭责任',
  spirit: '精神成长',
  life: '生活管理',
}

export const DIMENSION_COLORS: Record<DimensionId, string> = {
  body: '#34D399',
  finance: '#FBBF24',
  skill: '#60A5FA',
  social: '#FB7185',
  mind: '#A78BFA',
  family: '#F59E0B',
  spirit: '#38BDF8',
  life: '#4ADE80',
}

export const GOAL_STATUS_LABEL: Record<string, string> = {
  active: '进行中',
  paused: '已暂停',
  done: '已完成',
}
