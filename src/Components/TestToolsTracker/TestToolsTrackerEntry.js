import React from 'react'
import {
  CalendarDays,
  Package,
  SendHorizonal,
  User,
  Boxes,
  Plus,
  Building2,
} from 'lucide-react'

const Field = ({ label, children, hint }) => (
  <label className="block">
    <div className="mb-1 text-[12px] font-medium text-gray-700">{label}</div>
    {children}
    {hint ? <p className="mt-1 text-[10px] text-gray-500">{hint}</p> : null}
  </label>
)

const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500/40 ${
      props.className || ''
    }`}
  />
)

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-amber-500/40 ${
      props.className || ''
    }`}
  >
    {children}
  </select>
)

const Section = ({ title, children }) => (
  <section className="mb-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
    <div className="mb-2 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-[13px] font-semibold text-gray-800">
        {title}
      </h3>
    </div>
    {children}
  </section>
)

const TestToolsTrackerEntry = ({ username, userRoles }) => {
  return (
    <div className="min-h-screen bg-[#faf7f1]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col">
        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-3 pb-24 pt-3">
          {/* Transfer details */}
          <Section
            title={
              <>
                <Building2 className="h-4 w-4 text-amber-600" />
                <span>Transfer Details</span>
              </>
            }
          >
            <div className="mb-2 flex items-center justify-between text-[11px] text-gray-500">
              <span>E.No 236</span>
              <span>Tool Transfer</span>
            </div>
            <div className="space-y-2">
              <Field label="From">
                <Select defaultValue="Rafiq - Ashok Nagar">
                  <option>Rafiq - Ashok Nagar</option>
                  <option>Selvam - Site Yard</option>
                  <option>Warehouse - Main</option>
                </Select>
              </Field>
              <Field label="To">
                <Select defaultValue="Muthukrishnan - Godh...">
                  <option>Muthukrishnan - Godh...</option>
                  <option>Raj - Periyar</option>
                  <option>Thripathi - Kovilpatti</option>
                </Select>
              </Field>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Field label="Date">
                    <div className="relative">
                      <Input
                        type="date"
                        defaultValue={new Date().toISOString().slice(0, 10)}
                      />
                      <CalendarDays className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </Field>
                </div>
                <div className="flex-1">
                  <Field label="Project Incharge">
                    <Select defaultValue="">
                      <option value="" disabled>
                        Select
                      </option>
                      <option>Mr. Kannan</option>
                      <option>Ms. Priya</option>
                    </Select>
                  </Field>
                </div>
              </div>
            </div>
          </Section>

          {/* Add item */}
          <Section
            title={
              <>
                <Boxes className="h-4 w-4 text-amber-600" />
                <span>Add Item</span>
              </>
            }
          >
            <div className="space-y-2">
              <Field label="Category">
                <Select defaultValue="">
                  <option value="" disabled>
                    Select Category
                  </option>
                  <option>Power Tools</option>
                  <option>Shuttering</option>
                  <option>Electrical</option>
                </Select>
              </Field>
              <Field label="Item Name">
                <Select defaultValue="">
                  <option value="" disabled>
                    Select Item
                  </option>
                  <option>Concrete Vibrator</option>
                  <option>Cutting Disk</option>
                  <option>Wacker Plate</option>
                </Select>
              </Field>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Field label="Item ID">
                    <Select defaultValue="">
                      <option value="" disabled>
                        Select Item ID
                      </option>
                      <option>ID-001</option>
                      <option>ID-002</option>
                    </Select>
                  </Field>
                </div>
                <div className="w-20">
                  <Field label="Avail.">
                    <Input readOnly defaultValue={0} />
                  </Field>
                </div>
              </div>
              <Field label="Brand">
                <Select defaultValue="">
                  <option value="" disabled>
                    Select Brand
                  </option>
                  <option>Bosch</option>
                  <option>Dewalt</option>
                  <option>Makita</option>
                </Select>
              </Field>
              <Field label="Attach Photo" hint="Optional">
                <Input type="file" accept="image/*" />
              </Field>
              <div className="pt-1 text-right">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-[13px] font-medium text-gray-700 ring-1 ring-gray-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Item
                </button>
              </div>
            </div>
          </Section>

          {/* Selected items */}
          <Section
            title={
              <>
                <Package className="h-4 w-4 text-amber-600" />
                <span>Selected Items</span>
              </>
            }
          >
            {/* Empty state */}
            <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-4 text-center">
              <p className="text-[13px] font-medium text-amber-800">
                No items added yet
              </p>
              <p className="mt-1 text-[11px] text-amber-800/80">
                Add tools above and they will appear here.
              </p>
            </div>

            {/* Example card (remove when wired to data) */}
            {/* <div className="mt-2 space-y-2">
              <div className="rounded-xl bg-gray-50 p-3 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">
                    Concrete Vibrator
                  </span>
                  <span className="text-[11px] text-gray-500">#1</span>
                </div>
                <div className="mt-1 text-[11px] text-gray-600">
                  Brand: Bosch • MCH-001 • ID-001
                </div>
              </div>
            </div> */}
          </Section>
        </main>

        {/* Sticky bottom bar */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-amber-100 bg-white/95 px-3 py-2">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <User className="h-4 w-4" />
              <span>Check incharge & items</span>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-[13px] font-semibold text-white shadow"
            >
              <SendHorizonal className="h-4 w-4" />
              Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestToolsTrackerEntry
