export interface Task {
  id: number
  title: string
  important: boolean
  urgent: boolean
  completed: boolean
  createdAt: string
  completedAt?: string
}

export interface BigRocks {
  [role: string]: string[]
}

export type QuadrantType = 'do' | 'plan' | 'delegate' | 'eliminate'
export type ViewType = 'today' | 'week'
