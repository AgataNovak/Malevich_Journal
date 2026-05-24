import type { JournalEntry, JournalEntryPayload, WorkType, EntryFilters } from '../types'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error((err as { detail?: string }).detail ?? 'Ошибка запроса')
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  getEntries: (filters: EntryFilters = {}) => {
    const params = new URLSearchParams()
    if (filters.date_from) params.set('date_from', filters.date_from)
    if (filters.date_to) params.set('date_to', filters.date_to)
    if (filters.sort) params.set('sort', filters.sort)
    return request<JournalEntry[]>(`${BASE}/journal/?${params}`)
  },

  createEntry: (data: JournalEntryPayload) =>
    request<JournalEntry>(`${BASE}/journal/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateEntry: (id: number, data: JournalEntryPayload) =>
    request<JournalEntry>(`${BASE}/journal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteEntry: (id: number) =>
    request<void>(`${BASE}/journal/${id}`, { method: 'DELETE' }),

  getWorkTypes: () => request<WorkType[]>(`${BASE}/work-types/`),
}
