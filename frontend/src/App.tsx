import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import JournalTable from './components/JournalTable'
import RecordForm from './components/RecordForm'
import type { JournalEntry } from './types'

const queryClient = new QueryClient()

export default function App() {
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const openAdd = () => {
    setEditingEntry(null)
    setIsFormOpen(true)
  }

  const openEdit = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingEntry(null)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-700 text-white shadow-md">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Журнал работ</h1>
              <p className="text-blue-200 text-xs mt-0.5">Строительный объект</p>
            </div>
            <button
              onClick={openAdd}
              className="bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm"
            >
              + Добавить запись
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-6">
          <JournalTable onEdit={openEdit} />
        </main>

        {isFormOpen && <RecordForm entry={editingEntry} onClose={closeForm} />}
      </div>
    </QueryClientProvider>
  )
}
