export interface Schedule {
  type: ScheduleType

  startDate?: Date
  endDate?: Date

  config: ScheduleConfig
}

export type ScheduleType =
  | "daily"
  | "weekly"
  | "custom"
  | "manual"

  export interface ScheduleConfig {
  interval?: number

  daysOfWeek?: number[]

  specificDates?: Date[]
}