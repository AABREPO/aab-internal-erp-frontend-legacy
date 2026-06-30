import React from 'react'
import {
  Phone,
  CalendarDays,
  Download,
  Pencil,
  Trash2,
} from 'lucide-react'

const Field = ({ label, children }) => (
  <label className="block">
    <div className="mb-1 text-[13px] font-medium text-gray-700">{label}</div>
    {children}
  </label>
)

const Input = (props) => (
  <input
    {...props}
    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500/40"
  />
)

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/40"
  >
    {children}
  </select>
)

const TotalRow = ({ items }) => {
  const totalQty = items.reduce((sum, i) => sum + i.qty, 0)
  const totalAmount = items.reduce((sum, i) => sum + i.qty * i.price, 0)

  return (
    <div className="grid grid-cols-[40px,1.8fr,1fr,1.3fr,0.8fr,0.7fr,0.6fr,0.8fr,60px] items-center gap-2 rounded-b-xl bg-[#faf7f1] px-3 py-2 text-[12px] font-semibold text-gray-800 max-md:hidden">
      <div />
      <div>Total</div>
      <div />
      <div />
      <div />
      <div className="text-center">{totalQty}</div>
      <div />
      <div className="text-right">{totalAmount}</div>
      <div />
    </div>
  )
}

const TestToolsTrackerPurchaseOrder = ({ username, userRoles }) => {
  const sampleItems = [
    {
      slNo: 1,
      name: 'AP Tractor Emulsion Advanced',
      category: 'PAINTING',
      model: 'Pure Ivory L124',
      brand: '4 L',
      type: '1',
      qty: 1,
      price: 0,
    },
    {
      slNo: 2,
      name: 'AP Damp Sheath Interior',
      category: 'PAINTING',
      model: 'Base White',
      brand: '3 L',
      type: '2',
      qty: 2,
      price: 0,
    },
  ]

  return (
    <div className="min-h-screen bg-[#faf7f1] pb-20 sm:pb-6">
      <main className="mx-auto max-w-7xl px-4 py-4">
        {/* Top PO details card */}
        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Vendor Name">
              <Select defaultValue="Sathuragiri Tiles">
                <option>Sathuragiri Tiles</option>
                <option>ABC Hardware</option>
              </Select>
            </Field>
            <Field label="Project Name">
              <Select defaultValue="Muthukrishnan - Godhai Nagar">
                <option>Muthukrishnan - Godhai Nagar</option>
                <option>Project 2</option>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="PID">
                <Input readOnly value="4" />
              </Field>
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
            <Field label="PO No">
              <Input placeholder="Enter PO No" defaultValue={2} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Project Incharge">
                <Select defaultValue="Er. Karthick">
                  <option>Er. Karthick</option>
                  <option>Er. Prakash</option>
                </Select>
              </Field>
              <Field label="Contact">
                <div className="relative">
                  <Input readOnly defaultValue="+91 94452 99325" />
                  <Phone className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-orange-500" />
                </div>
              </Field>
            </div>
          </div>
        </section>

        {/* Items area */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-800">
              Purchase Items
            </h3>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-orange-500"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px,1fr]">
            {/* Left: Item form */}
            <div className="space-y-3">
              <Field label="Category">
                <Select defaultValue="PAINTING">
                  <option>PAINTING</option>
                  <option>TILE</option>
                  <option>PLUMBING</option>
                </Select>
              </Field>
              <Field label="Item Name">
                <Select defaultValue="">
                  <option value="" disabled>
                    Select Item Name
                  </option>
                  <option>AP Tractor Emulsion Advanced</option>
                  <option>AP Damp Sheath Interior</option>
                </Select>
              </Field>
              <Field label="Model">
                <Select defaultValue="">
                  <option value="" disabled>
                    Select Model
                  </option>
                  <option>Pure Ivory L124</option>
                  <option>Base White</option>
                </Select>
              </Field>
              <Field label="Brand">
                <Select defaultValue="">
                  <option value="" disabled>
                    Select Brand
                  </option>
                  <option>Asian Paints</option>
                  <option>Nerolac</option>
                </Select>
              </Field>
              <Field label="Type">
                <Select defaultValue="">
                  <option value="" disabled>
                    Select Type
                  </option>
                  <option>4 L</option>
                  <option>3 L</option>
                </Select>
              </Field>
              <Field label="Quantity">
                <Input placeholder="Enter Qty" />
              </Field>
              <button
                type="button"
                className="mt-2 w-full rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-700"
              >
                Add
              </button>
            </div>

            {/* Right: Items table / cards */}
            <div className="space-y-2">
              {/* Desktop/Tablet table */}
              <div className="hidden rounded-2xl border border-gray-100 bg-[#fffaf1] md:block">
                <div className="grid grid-cols-[40px,1.8fr,1fr,1.3fr,0.8fr,0.7fr,0.6fr,0.8fr,60px] items-center gap-2 border-b border-gray-100 px-3 py-2 text-[11px] font-semibold text-gray-600">
                  <div>S.No</div>
                  <div>Item Name</div>
                  <div>Category</div>
                  <div>Model</div>
                  <div>Brand</div>
                  <div className="text-center">Type</div>
                  <div className="text-center">Qty</div>
                  <div className="text-right">Amount</div>
                  <div className="text-center">Activity</div>
                </div>
                {sampleItems.map((item) => (
                  <div
                    key={item.slNo}
                    className="grid grid-cols-[40px,1.8fr,1fr,1.3fr,0.8fr,0.7fr,0.6fr,0.8fr,60px] items-center gap-2 border-b border-gray-100 px-3 py-2 text-[12px]"
                  >
                    <div>{item.slNo}</div>
                    <div className="truncate">{item.name}</div>
                    <div>{item.category}</div>
                    <div className="truncate">{item.model}</div>
                    <div>{item.brand}</div>
                    <div className="text-center">{item.type}</div>
                    <div className="text-center">{item.qty}</div>
                    <div className="text-right">
                      {item.qty * item.price || 0}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <button type="button">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button type="button">
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
                <TotalRow items={sampleItems} />
              </div>

              {/* Mobile: cards */}
              <div className="space-y-2 md:hidden">
                {sampleItems.map((item) => (
                  <div
                    key={item.slNo}
                    className="rounded-xl border border-gray-100 bg-[#fffbf3] p-3 text-[12px]"
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[11px] text-gray-500">
                          S.No {item.slNo}
                        </div>
                        <div className="font-semibold text-gray-800">
                          {item.name}
                        </div>
                      </div>
                      <div className="flex gap-2 text-gray-500">
                        <button type="button">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-gray-600">
                      <span>Category: {item.category}</span>
                      <span>Model: {item.model}</span>
                      <span>Brand: {item.brand}</span>
                      <span>Type: {item.type}</span>
                      <span>Qty: {item.qty}</span>
                      <span>Amount: {item.qty * item.price || 0}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop buttons */}
              <div className="mt-4 hidden justify-end gap-3 md:flex">
                <button
                  type="button"
                  className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-amber-700"
                >
                  Generate PO
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile sticky footer */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-100 bg-white/95 px-4 py-2 shadow-inner md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          <button
            type="button"
            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-700"
          >
            Generate PO
          </button>
        </div>
      </div>
    </div>
  )
}

export default TestToolsTrackerPurchaseOrder
