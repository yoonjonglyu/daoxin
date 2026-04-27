import { ScheduleCategory } from "./schedule";

export interface ActivityLog {
  id: string;
  daoxinId: string;     // 시스템 루트 ID
  scheduleName?: string; // (선택) 로그 시점의 스케줄 이름 저장 (스케줄 삭제/이름 변경 대비)
  scheduleId: string;   // 연관된 일정 ID
  categoryId?: string;  // 연관된 카테고리 ID
  categoryName?: string; // (선택) 로그 시점의 카테고리 이름 저장 (카테고리 삭제 대비)
  
  scheduleCategory: ScheduleCategory; // habit, goal 등

  executedAt: string;   // 수행 일시 (ISO 8601)
  earnedExp: number;    // 획득한 경험치
  earnedGauge: number;  // 획득한 도심 게이지
  value?: number;       // 수치형 목표일 경우 수행량
  note?: string;        // 간단한 회고 메모
}