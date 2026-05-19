import type { ReactNode } from 'react'

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string
  emptyMessage?: string
  compact?: boolean
  onRowClick?: (row: T) => void
  selectedRowKey?: string | null
}

export default function DataTable<T>({
  columns,
  data,
  rowKey,
  emptyMessage = 'No records',
  compact = false,
  onRowClick,
  selectedRowKey,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <p className="font-mono text-sm text-text-tertiary py-8 px-5">{emptyMessage}</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="ops-data-table w-full min-w-[720px] text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-border-medium bg-bg-elevated/80">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-5 py-3 ops-section-label font-medium ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const key = rowKey(row)
            const selected = selectedRowKey === key
            return (
              <tr
                key={key}
                className={`border-b border-border-subtle transition-colors ${
                  selected ? 'table-row-selected' : 'hover:bg-bg-elevated/60'
                } ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-5 ${compact ? 'py-2.5' : 'py-4'} align-middle ${col.className ?? ''}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
