export interface WorkType {
  id: number
  name: string
}

export interface JournalEntry {
  id: number
  date: string
  work_type_id: number
  work_type: WorkType
  volume: string
  unit: string
  executor_name: string
}

export interface JournalEntryPayload {
  date: string
  work_type_id: number
  volume: number
  unit: string
  executor_name: string
}

export interface EntryFilters {
  date_from?: string
  date_to?: string
  sort?: 'asc' | 'desc'
}
