import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { JournalEntry, EntryFilters } from '../types'

interface Props {
  onEdit: (entry: JournalEntry) => void
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

export default function JournalTable({ onEdit }: Props) {
  const qc = useQueryClient()
  const [filters, setFilters] = useState<EntryFilters>({ sort: 'desc' })

  const { data: entries = [], isLoading, isError } = useQuery({
    queryKey: ['entries', filters],
    queryFn: () => api.getEntries(filters),
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entries'] }),
  })

  const handleDelete = (entry: JournalEntry) => {
    if (window.confirm(`Удалить запись от ${formatDate(entry.date)}?`)) {
      deleteMutation.mutate(entry.id)
    }
  }

  const toggleSort = () =>
    setFilters(f => ({ ...f, sort: f.sort === 'desc' ? 'asc' : 'desc' }))

  const resetFilters = () => setFilters({ sort: 'desc' })

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Фильтры */}
      <div className="px-4 py-3 border-b bg-gray-50 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">С:</label>
          <input
            type="date"
            value={filters.date_from ?? ''}
            onChange={e =>
              setFilters(f => ({ ...f, date_from: e.target.value || undefined }))
            }
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">По:</label>
          <input
            type="date"
            value={filters.date_to ?? ''}
            onChange={e =>
              setFilters(f => ({ ...f, date_to: e.target.value || undefined }))
            }
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={resetFilters}
          className="text-sm text-gray-400 hover:text-gray-600 underline ml-auto"
        >
          Сбросить
        </button>
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-gray-400">Загрузка...</div>
      ) : isError ? (
        <div className="p-10 text-center text-red-500">Ошибка загрузки данных</div>
      ) : entries.length === 0 ? (
        <div className="p-10 text-center text-gray-400">Записей нет</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={toggleSort}
                    className="flex items-center gap-1 hover:text-gray-900 font-semibold"
                  >
                    Дата
                    <span className="text-blue-500">{filters.sort === 'desc' ? '↓' : '↑'}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold">Вид работ</th>
                <th className="px-4 py-3 text-left font-semibold">Объём</th>
                <th className="px-4 py-3 text-left font-semibold">Исполнитель</th>
                <th className="px-4 py-3 text-right font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{entry.work_type.name}</td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {Number(entry.volume).toLocaleString('ru-RU')} {entry.unit}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{entry.executor_name}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                    <button
                      onClick={() => onEdit(entry)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDelete(entry)}
                      disabled={deleteMutation.isPending}
                      className="text-red-500 hover:text-red-700 font-medium disabled:opacity-40"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
