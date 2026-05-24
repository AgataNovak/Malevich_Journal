import { useState, useEffect, type ReactNode, type FormEvent, type ChangeEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { JournalEntry, JournalEntryPayload } from '../types'

interface Props {
  entry: JournalEntry | null
  onClose: () => void
}

interface FormState {
  date: string
  work_type_id: string
  volume: string
  unit: string
  executor_name: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const UNITS = ['м²', 'м³', 'пог. м', 'шт', 'т', 'кг', 'м']

function emptyForm(): FormState {
  return {
    date: new Date().toISOString().slice(0, 10),
    work_type_id: '',
    volume: '',
    unit: 'м²',
    executor_name: '',
  }
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return (
    'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ' +
    (hasError ? 'border-red-400 bg-red-50' : 'border-gray-300')
  )
}

export default function RecordForm({ entry, onClose }: Props) {
  const qc = useQueryClient()
  const isEdit = !!entry

  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})

  const { data: workTypes = [] } = useQuery({
    queryKey: ['work-types'],
    queryFn: api.getWorkTypes,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (entry) {
      setForm({
        date: entry.date,
        work_type_id: String(entry.work_type_id),
        volume: String(entry.volume),
        unit: entry.unit,
        executor_name: entry.executor_name,
      })
    } else {
      setForm(emptyForm())
    }
    setErrors({})
  }, [entry])

  const mutation = useMutation({
    mutationFn: (data: JournalEntryPayload) =>
      isEdit ? api.updateEntry(entry!.id, data) : api.createEntry(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] })
      onClose()
    },
  })

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!form.date) e.date = 'Укажите дату'
    if (!form.work_type_id) e.work_type_id = 'Выберите вид работ'
    if (!form.volume || Number(form.volume) <= 0) e.volume = 'Объём должен быть больше 0'
    if (!form.unit.trim()) e.unit = 'Укажите единицу измерения'
    if (form.executor_name.trim().length < 2) e.executor_name = 'Укажите ФИО исполнителя'
    return e
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    mutation.mutate({
      date: form.date,
      work_type_id: Number(form.work_type_id),
      volume: Number(form.volume),
      unit: form.unit,
      executor_name: form.executor_name.trim(),
    })
  }

  function set(field: keyof FormState) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(f => ({ ...f, [field]: e.target.value }))
      setErrors(er => ({ ...er, [field]: undefined }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Редактировать запись' : 'Новая запись'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Закрыть"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <Field label="Дата" error={errors.date}>
            <input
              type="date"
              value={form.date}
              onChange={set('date')}
              className={inputCls(!!errors.date)}
            />
          </Field>

          <Field label="Вид работ" error={errors.work_type_id}>
            <select
              value={form.work_type_id}
              onChange={set('work_type_id')}
              className={inputCls(!!errors.work_type_id)}
            >
              <option value="">— Выберите вид работ —</option>
              {workTypes.map(wt => (
                <option key={wt.id} value={wt.id}>
                  {wt.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex gap-3">
            <Field label="Объём" error={errors.volume} className="flex-1">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.volume}
                onChange={set('volume')}
                className={inputCls(!!errors.volume)}
                placeholder="0.00"
              />
            </Field>
            <Field label="Единица" error={errors.unit} className="w-32">
              <select
                value={form.unit}
                onChange={set('unit')}
                className={inputCls(!!errors.unit)}
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="ФИО исполнителя" error={errors.executor_name}>
            <input
              type="text"
              value={form.executor_name}
              onChange={set('executor_name')}
              className={inputCls(!!errors.executor_name)}
              placeholder="Иванов Иван Иванович"
            />
          </Field>

          {mutation.isError && (
            <p className="text-red-500 text-sm">{(mutation.error as Error).message}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
