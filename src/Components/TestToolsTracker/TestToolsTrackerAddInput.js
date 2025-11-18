import React from 'react'
import { Search, Edit3, Trash2, Download, Save } from 'lucide-react'

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/40"
  >
    {children}
  </select>
)

const Input = (props) => (
  <input
    {...props}
    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500/40"
  />
)

const MasterCard = ({ title, placeholder, rows }) => (
  <section className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
    {/* Header */}
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>

    {/* Search + Add */}
    <div className="mb-1 flex gap-2">
      <div className="flex-1">
        <div className="relative">
          <Input placeholder={placeholder} />
          <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>
      <button
        type="button"
        className="whitespace-nowrap rounded-xl border border-dashed border-amber-400 bg-amber-50 px-3 text-xs font-semibold text-amber-700"
      >
        + Add
      </button>
    </div>

    {/* Import link */}
    <button
      type="button"
      className="mb-2 inline-flex items-center gap-1 text-[11px] font-medium text-orange-500"
    >
      <Download className="h-3 w-3" />
      Import file
    </button>

    {/* Table header */}
    <div className="grid grid-cols-[40px,1fr,46px] items-center gap-2 border-b border-gray-100 pb-1 text-[11px] font-semibold text-gray-600">
      <div>Sl.No</div>
      <div>{title}</div>
      <div className="text-right">Act</div>
    </div>

    {/* Rows */}
    <div className="mt-1 space-y-1">
      {rows.map((row) => (
        <div
          key={row.slNo}
          className="grid grid-cols-[40px,1fr,46px] items-center gap-2 rounded-xl bg-[#faf7f1] px-2 py-1.5 text-[12px]"
        >
          <div className="text-gray-700">{row.slNo}</div>
          <div className="truncate text-gray-800">{row.value}</div>
          <div className="flex items-center justify-end gap-1 text-gray-500">
            <button type="button">
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button type="button">
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
)

const TestToolsTrackerAddInput = ({ username, userRoles }) => {
  // demo data – plug your API data here
  const itemNames = [
    { slNo: '01', value: 'Drilling Machine' },
    { slNo: '02', value: 'Angle Grinder' },
    { slNo: '03', value: 'Chipping Hammer' },
    { slNo: '04', value: 'Demolition Hammer' },
    { slNo: '05', value: 'Cutter Machine' },
  ]

  const brands = [
    { slNo: '01', value: 'Legrand' },
    { slNo: '02', value: 'Stanley' },
    { slNo: '03', value: 'Havells' },
    { slNo: '04', value: 'Siemens' },
    { slNo: '05', value: 'Bosch' },
  ]

  const itemIds = [
    { slNo: '01', value: 'AA DM 01' },
    { slNo: '02', value: 'AA DM 02' },
    { slNo: '03', value: 'AA DM 03' },
    { slNo: '04', value: 'AA DM 04' },
    { slNo: '05', value: 'AA DM 05' },
  ]

  const categories = [
    { slNo: '01', value: 'Plumbing' },
    { slNo: '02', value: 'Electrical' },
    { slNo: '03', value: 'Carpentry' },
    { slNo: '04', value: 'Vehicle' },
  ]

  return (
    <div className="min-h-screen bg-[#faf7f1] pb-16 sm:pb-4">
      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-4">
        {/* Top controls */}
        <section className="mb-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* Category + buttons */}
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="mb-1 text-sm font-semibold text-gray-800">
                  Category
                </div>
                <Select defaultValue="Electrical">
                  <option>Electrical</option>
                  <option>Plumbing</option>
                  <option>Carpentry</option>
                  <option>Vehicle</option>
                </Select>
              </div>
              <div className="flex gap-2 pt-1 sm:pt-6">
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-700"
                >
                  + Add New Item
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
              </div>
            </div>
            {/* Manage shops */}
            <button
              type="button"
              className="mt-2 w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600 sm:mt-7 sm:w-auto"
            >
              Manage Shops
            </button>
          </div>
        </section>

        {/* Master lists – stack on mobile, 4-column grid on desktop */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <MasterCard
            title="Item Name"
            placeholder="Search Item Name"
            rows={itemNames}
          />
          <MasterCard
            title="Brand"
            placeholder="Search Brand..."
            rows={brands}
          />
          <MasterCard
            title="Item ID"
            placeholder="Search Item ID..."
            rows={itemIds}
          />
          <MasterCard
            title="Category"
            placeholder="Search Category..."
            rows={categories}
          />
        </div>
      </main>

      {/* Sticky mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-100 bg-white/95 px-4 py-2 shadow-inner sm:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          <span className="text-[11px] text-gray-600">
            Review all columns before saving.
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-[13px] font-semibold text-white shadow"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default TestToolsTrackerAddInput
