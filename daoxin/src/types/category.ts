export interface Category {
  id: string
  name: string
  description?: string

  icon?: string
  color?: string

  parentId?: string

  createdAt: Date
}