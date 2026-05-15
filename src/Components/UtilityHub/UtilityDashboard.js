import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import axios from 'axios'
import ExpenseEntryForm from '../ExpensesEntry/Form'

/** Hover: shop / tenant / phone; portaled + fixed above anchor so card overflow does not clip it. */
const UtilityUpcomingShopTooltip = ({ item, children }) => {
  const shop = (item.shopNo ?? '').toString().trim() || '-'
  const tenant = (item.tenantName ?? '').toString().trim() || '-'
  const phone = (item.tenantPhone ?? '').toString().trim() || '-'
  const anchorRef = useRef(null)
  const tipRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ left: 0, bottom: 0 })

  const syncPosition = useCallback(() => {
    const anchor = anchorRef.current
    if (!anchor) return
    const r = anchor.getBoundingClientRect()
    const gap = 8
    let left = r.left
    const bottom = window.innerHeight - r.top + gap
    const tip = tipRef.current
    if (tip) {
      const tw = tip.getBoundingClientRect().width
      if (left + tw > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - tw - 8)
      }
      if (left < 8) left = 8
    }
    setPos({ left, bottom })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    syncPosition()
    const id = requestAnimationFrame(() => syncPosition())
    return () => cancelAnimationFrame(id)
  }, [open, shop, tenant, phone, syncPosition])

  useEffect(() => {
    if (!open) return
    const onScrollOrResize = () => syncPosition()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [open, syncPosition])

  return (
    <>
      <span
        ref={anchorRef}
        className="inline-block max-w-full align-top"
        onMouseEnter={() => {
          const anchor = anchorRef.current
          if (anchor) {
            const r = anchor.getBoundingClientRect()
            const gap = 8
            setPos({
              left: r.left,
              bottom: window.innerHeight - r.top + gap,
            })
          }
          setOpen(true)
        }}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </span>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={tipRef}
            role="tooltip"
            className="pointer-events-none fixed z-[10050] min-w-[18rem] w-max max-w-[min(calc(100vw-2rem),36rem)] rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-left text-xs font-normal text-white shadow-xl"
            style={{ left: pos.left, bottom: pos.bottom }}
          >
            <span className="block break-words leading-snug">
              <span className="text-gray-300">Shop No : </span>
              {shop}
            </span>
            <span className="mt-1.5 block whitespace-nowrap leading-snug">
              <span className="text-gray-300">Tenant Name: </span>
              {tenant}
            </span>
            <span className="mt-1.5 block whitespace-nowrap leading-snug">
              <span className="text-gray-300">Phone: </span>
              {phone}
            </span>
          </div>,
          document.body
        )}
    </>
  )
}

const UtilityDashboard = () => {
  const [showExpenseEntryModal, setShowExpenseEntryModal] = useState(false)
  const [expenseEntryPrefill, setExpenseEntryPrefill] = useState(null)
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])
  const username = currentUser?.name || currentUser?.username || currentUser?.userName || ''
  const userRoles = currentUser?.userRoles || []
  const [electricityData, setElectricityData] = useState([])
  const [frequencyHistory, setFrequencyHistory] = useState([])
  const [projects, setProjects] = useState([])
  const [allProjectRecords, setAllProjectRecords] = useState([])
  const [loadingElectricity, setLoadingElectricity] = useState(true)
  const [errorElectricity, setErrorElectricity] = useState(null)
  const [propertyTaxData, setPropertyTaxData] = useState([])
  const [loadingPropertyTax, setLoadingPropertyTax] = useState(true)
  const [errorPropertyTax, setErrorPropertyTax] = useState(null)
  const [waterTaxData, setWaterTaxData] = useState([])
  const [loadingWaterTax, setLoadingWaterTax] = useState(true)
  const [errorWaterTax, setErrorWaterTax] = useState(null)
  const [tenantShopData, setTenantShopData] = useState([])

  const [telecomDirectory, setTelecomDirectory] = useState([])
  const [telecomExpensePayments, setTelecomExpensePayments] = useState([])
  const [loadingTelecom, setLoadingTelecom] = useState(true)
  const [errorTelecom, setErrorTelecom] = useState(null)
  const [electricityView, setElectricityView] = useState(/** @type {'upcoming' | 'expired'} */ ('upcoming'))
  const [propertyView, setPropertyView] = useState(/** @type {'upcoming' | 'expired'} */ ('upcoming'))
  const [waterView, setWaterView] = useState(/** @type {'upcoming' | 'expired'} */ ('upcoming'))
  const [telecomView, setTelecomView] = useState(/** @type {'upcoming' | 'expired'} */ ('upcoming'))

  const fetchElectricity = useCallback(async () => {
    setLoadingElectricity(true)
    setErrorElectricity(null)
    try {
      const res = await axios.get('https://backendaab.in/demoAabuilderDash/expenses_form/utility/electricity')
      setElectricityData(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setErrorElectricity('Failed to load electricity data')
    } finally {
      setLoadingElectricity(false)
    }
  }, [])

  const fetchPropertyTax = useCallback(async () => {
    setLoadingPropertyTax(true)
    setErrorPropertyTax(null)
    try {
      const res = await axios.get('https://backendaab.in/demoAabuilderDash/expenses_form/utility/property')
      setPropertyTaxData(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setErrorPropertyTax('Failed to load property tax data')
    } finally {
      setLoadingPropertyTax(false)
    }
  }, [])

  const fetchWaterTax = useCallback(async () => {
    setLoadingWaterTax(true)
    setErrorWaterTax(null)
    try {
      const res = await axios.get('https://backendaab.in/demoAabuilderDash/expenses_form/utility/water')
      setWaterTaxData(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setErrorWaterTax('Failed to load water tax data')
    } finally {
      setLoadingWaterTax(false)
    }
  }, [])

  const fetchTelecom = useCallback(async () => {
    setLoadingTelecom(true)
    setErrorTelecom(null)
    try {
      const [directoryRes, expensesRes] = await Promise.all([
        axios.get('https://backendaab.in/demoAabuildersDash/api/utility-telecom/getAll'),
        axios.get('https://backendaab.in/demoAabuilderDash/expenses_form/utility/telecom').catch((err) => {
          console.error('Error fetching telecom expense payments:', err)
          return { data: [] }
        }),
      ])
      setTelecomDirectory(Array.isArray(directoryRes.data) ? directoryRes.data : [])
      setTelecomExpensePayments(Array.isArray(expensesRes.data) ? expensesRes.data : [])
    } catch (err) {
      setErrorTelecom('Failed to load telecom data')
      setTelecomDirectory([])
      setTelecomExpensePayments([])
    } finally {
      setLoadingTelecom(false)
    }
  }, [])

  const refetchUtilityData = useCallback(async () => {
    await Promise.all([fetchElectricity(), fetchPropertyTax(), fetchWaterTax(), fetchTelecom()])
  }, [fetchElectricity, fetchPropertyTax, fetchTelecom, fetchWaterTax])

  useEffect(() => {
    fetchElectricity()
  }, [fetchElectricity])
  useEffect(() => {
    const fetchFrequencyHistory = async () => {
      try {
        const response = await axios.get('https://backendaab.in/demoAabuilderDash/api/frequency-history/getAll')
        setFrequencyHistory(response.data || [])
      } catch (error) {
        console.error('Error fetching frequency history:', error)
      }
    }
    fetchFrequencyHistory()
  }, [])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('https://backendaab.in/demoAabuilderDash/api/projects/getAll')
        setAllProjectRecords(Array.isArray(response.data) ? response.data : [])
        const projectsWithUtilities = response.data.filter(project =>
          Array.isArray(project.propertyDetails) &&
          project.propertyDetails.some(property => {
            const eb = property.ebNo && property.ebNo.trim() !== ''
            const propertyTax = property.propertyTaxNo && property.propertyTaxNo.trim() !== ''
            const waterTax = property.waterTaxNo && property.waterTaxNo.trim() !== ''
            const water = property.waterNo && property.waterNo.trim() !== ''
            return eb || propertyTax || waterTax || water
          })
        )
        setProjects(projectsWithUtilities)
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    fetchTelecom()
  }, [fetchTelecom])

  useEffect(() => {
    fetchPropertyTax()
  }, [fetchPropertyTax])

  useEffect(() => {
    fetchWaterTax()
  }, [fetchWaterTax])

  useEffect(() => {
    const loadTenantShopLinks = async () => {
      try {
        const res = await axios.get('https://backendaab.in/demoAabuildersDash/api/tenant_link_shop/getAll')
        setTenantShopData(Array.isArray(res.data) ? res.data : [])
      } catch (e) {
        console.error('UtilityDashboard: failed to load tenant–shop links', e)
        setTenantShopData([])
      }
    }
    loadTenantShopLinks()
  }, [])

  const addMonthsClamped = (date, months) => {
    const d = new Date(date.getTime())
    const targetMonth = d.getMonth() + months
    const y = d.getFullYear() + Math.floor(targetMonth / 12)
    const m = ((targetMonth % 12) + 12) % 12
    const day = d.getDate()
    const daysInTarget = new Date(y, m + 1, 0).getDate()
    return new Date(y, m, Math.min(day, daysInTarget))
  }

  const formatDDMMYYYY = (date) => {
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }
  const toDateOnly = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate())
  const daysBetween = (from, to) => {
    const one = toDateOnly(from).getTime()
    const two = toDateOnly(to).getTime()
    return Math.round((two - one) / (1000 * 60 * 60 * 24))
  }

  const addDays = (date, days) => {
    const d = new Date(date.getTime())
    d.setDate(d.getDate() + days)
    return d
  }

  const addDurationToDate = (startDate, countRaw, typeRaw) => {
    const count = countRaw != null && String(countRaw).trim() !== '' ? Number(countRaw) : 0
    const unit = typeRaw != null ? String(typeRaw).trim().toLowerCase() : ''
    if (!Number.isFinite(count) || count <= 0) return null
    if (!startDate || Number.isNaN(startDate.getTime())) return null

    if (unit === 'days' || unit === 'day') return addDays(startDate, count)
    if (unit === 'month' || unit === 'months') return addMonthsClamped(startDate, count)
    if (unit === 'year' || unit === 'years') return addMonthsClamped(startDate, count * 12)
    return null
  }

  const getProjectNameById = (projectId) => {
    if (projectId == null) return '-'
    const idStr = String(projectId)
    const rec = Array.isArray(allProjectRecords)
      ? allProjectRecords.find(p => String(p?.id ?? p?.projectId ?? p?.project_id ?? '') === idStr)
      : null
    return rec?.projectName ?? rec?.siteName ?? rec?.project ?? '-'
  }

  const resolvePropertyDetailsId = (property) =>
    property?.id ?? property?.propertyId ?? property?.projectNamePropertyDetailsId ?? null

  const tenantMetaByPropertyId = useMemo(() => {
    const map = {}
    if (!Array.isArray(tenantShopData) || tenantShopData.length === 0) return map

    const tenantPhone = (t) =>
      t?.mobileNumber ??
      t?.mobile_number ??
      t?.phoneNumber ??
      t?.phone_number ??
      t?.phone ??
      t?.tenantPhone ??
      t?.tenant_phone ??
      ''

    tenantShopData.forEach((tenant) => {
      const name = (tenant?.tenantName || '').trim()
      const phone = String(tenantPhone(tenant) || '').trim()
      ;(tenant.shopNos || []).forEach((shop) => {
        const pid = shop?.shopNoId
        if (pid === undefined || pid === null) return
        const key = String(pid)
        if (!map[key]) map[key] = { entries: [] }
        map[key].entries.push({
          tenantName: name,
          phone,
          closureTime: shop.shopClosureDate ? new Date(shop.shopClosureDate).getTime() : null,
          isActive: !shop.shopClosureDate,
        })
      })
    })

    Object.keys(map).forEach((key) => {
      const entries = map[key].entries
      const active = entries.filter((e) => e.isActive)
      const hasActive = active.length > 0
      const occupancy = hasActive ? 'Occupied' : 'Vacant'
      let tenantName = '-'
      let tenantPhoneOut = ''
      if (hasActive) {
        const names = [...new Set(active.map((e) => e.tenantName).filter(Boolean))]
        tenantName = names.length ? names.join(', ') : '-'
        tenantPhoneOut = active.find((e) => e.phone)?.phone || ''
      } else {
        const closed = entries
          .filter((e) => e.closureTime != null && !Number.isNaN(e.closureTime))
          .sort((a, b) => b.closureTime - a.closureTime)
        const last = closed[0]
        tenantName = last?.tenantName || '-'
        tenantPhoneOut = last?.phone || ''
      }
      map[key] = { occupancy, tenantName, tenantPhone: tenantPhoneOut }
    })

    return map
  }, [tenantShopData])

  const getLatestTelecomExpensePayment = (serviceNumber) => {
    if (!serviceNumber) return null
    const s = String(serviceNumber).trim()
    const payments = Array.isArray(telecomExpensePayments) ? telecomExpensePayments : []
    const candidates = payments
      .filter(p => String(p?.utilityTypeNumber || '').trim() === s)
      .filter(p => p?.date || p?.timestamp)
      .sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp))
    return candidates[0] || null
  }

  const getTelecomBaseDate = (expenseEntry, dirEntry) => {
    const baseDateRaw =
      expenseEntry?.serviceStartingDate ??
      expenseEntry?.service_starting_date ??
      expenseEntry?.date ??
      expenseEntry?.timestamp ??
      dirEntry?.service_starting_date ??
      dirEntry?.serviceStartingDate ??
      dirEntry?.payment_date ??
      dirEntry?.paymentDate ??
      null
    const baseDate = baseDateRaw ? new Date(baseDateRaw) : null
    return baseDate && !Number.isNaN(baseDate.getTime()) ? baseDate : null
  }

  const getTelecomExpiryMeta = (dirEntry) => {
    if (!dirEntry) return null
    const serviceNumber = dirEntry.service_number ?? dirEntry.serviceNumber ?? dirEntry.service_number ?? null
    if (!serviceNumber || !String(serviceNumber).trim()) return null

    const latestExpense = getLatestTelecomExpensePayment(serviceNumber)
    const expenseBaseDate = getTelecomBaseDate(latestExpense, null)
    const expenseValidityCount = latestExpense?.utilityValidityDays ?? null
    const expenseValidityType = latestExpense?.utilityValidityType ?? null

    let expiry =
      expenseBaseDate && expenseValidityCount && expenseValidityType
        ? addDurationToDate(expenseBaseDate, expenseValidityCount, expenseValidityType)
        : null

    if (!expiry) {
      const endDateRaw = dirEntry.service_end_date ?? dirEntry.serviceEndDate ?? null
      const endDate = endDateRaw ? new Date(endDateRaw) : null
      expiry = endDate && !Number.isNaN(endDate.getTime()) ? endDate : null
    }

    if (!expiry) {
      const fallbackBaseDate = getTelecomBaseDate(null, dirEntry)
      const validityCount =
        dirEntry.validity ??
        dirEntry.utilityValidityDays ??
        null
      const validityType =
        dirEntry.validity_type ??
        dirEntry.validityType ??
        dirEntry.utilityValidityType ??
        null
      expiry = addDurationToDate(fallbackBaseDate, validityCount, validityType)
    }

    if (!expiry || Number.isNaN(expiry.getTime())) return null

    return {
      serviceNumber: String(serviceNumber).trim(),
      projectId: dirEntry.project_id ?? dirEntry.projectId ?? null,
      projectName: getProjectNameById(dirEntry.project_id ?? dirEntry.projectId ?? null),
      vendor: dirEntry.service_provider ?? dirEntry.serviceProvider ?? '-',
      purpose: dirEntry.purpose ?? '-',
      expiry,
    }
  }

  const upcomingTelecom = useMemo(() => {
    const today = toDateOnly(new Date())
    const entries = Array.isArray(telecomDirectory) ? telecomDirectory : []
    const uniqueItems = Array.from(
      entries
        .map(getTelecomExpiryMeta)
        .filter(Boolean)
        .reduce((map, meta) => {
          const key = String(meta.serviceNumber).trim()
          const existing = map.get(key)
          if (!existing || toDateOnly(meta.expiry) > toDateOnly(existing.expiry)) {
            map.set(key, meta)
          }
          return map
        }, new Map()).values()
    )
    const items = uniqueItems
      .map(meta => {
        const daysLeft = daysBetween(today, meta.expiry)
        return { ...meta, daysLeft }
      })
      .filter(item => {
        if (telecomView === 'upcoming') return item.daysLeft >= 0 && item.daysLeft <= 15
        return item.daysLeft < 0 && item.daysLeft >= -30
      })
      .sort((a, b) => a.expiry - b.expiry)
      .slice(0, 6)
    return items
  }, [telecomDirectory, telecomExpensePayments, allProjectRecords, telecomView])
  const frequencyConfigs = {
    electricity: {
      frequencyKeys: ['electricityFrequencyNo'],
      startingMonthKeys: ['startingMonthOfElectricityFrequency'],
    },
    property: {
      frequencyKeys: ['propertyTaxFrequencyNo', 'propertyFrequencyNo'],
      startingMonthKeys: ['startingMonthOfPropertyTaxFrequency', 'startingMonthOfPropertyFrequency'],
    },
    water: {
      frequencyKeys: ['waterTaxFrequencyNo', 'waterFrequencyNo', 'propertyFrequencyNo'],
      startingMonthKeys: ['startingMonthOfWaterTaxFrequency', 'startingMonthOfWaterFrequency', 'startingMonthOfPropertyFrequency'],
    },
  }

  const getFirstAvailableField = (obj, keys) => {
    if (!obj || !Array.isArray(keys)) return null
    for (const key of keys) {
      const value = obj[key]
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return value
      }
    }
    return null
  }

  const getActiveFrequencyDetails = (propertyId, year, monthNumber, config) => {
    if (!Array.isArray(frequencyHistory) || frequencyHistory.length === 0) return null

    const records = frequencyHistory
      .filter(f => f.projectNamePropertyDetailsId === propertyId)
      .map(record => {
        const startingMonth = getFirstAvailableField(record, config.startingMonthKeys)
        if (!startingMonth) return null
        return {
          record,
          startingMonth,
          frequencyRaw: getFirstAvailableField(record, config.frequencyKeys),
        }
      })
      .filter(Boolean)

    if (records.length === 0) return null

    const currentVal = year * 12 + parseInt(monthNumber)
    records.sort((a, b) => {
      const [aY, aM] = a.startingMonth.split('-').map(Number)
      const [bY, bM] = b.startingMonth.split('-').map(Number)
      return aY * 12 + aM - (bY * 12 + bM)
    })

    let active = records[0]
    for (const rec of records) {
      const [rY, rM] = rec.startingMonth.split('-').map(Number)
      const recVal = rY * 12 + rM
      if (recVal <= currentVal) {
        active = rec
      } else {
        break
      }
    }

    const frequency = parseInt(active.frequencyRaw, 10)
    return {
      frequency: Number.isFinite(frequency) && frequency > 0 ? frequency : null,
      startingMonth: active.startingMonth,
      record: active.record,
    }
  }

  const calculateNextDueDate = (payments, identifier, propertyId, config) => {
    if (!Array.isArray(payments) || payments.length === 0) return null

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    const latestPayment = payments
      .filter(payment => payment.utilityTypeNumber === identifier && (payment.date || payment.timestamp))
      .sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp))[0]

    if (!latestPayment) {
      return null
    }

    const lastPaymentDate = new Date(latestPayment.date || latestPayment.timestamp)
    if (Number.isNaN(lastPaymentDate.getTime())) {
      return null
    }
    const lastPaymentYear = lastPaymentDate.getFullYear()
    const lastPaymentMonth = lastPaymentDate.getMonth() + 1

    const freqDetails = getActiveFrequencyDetails(propertyId, currentYear, currentMonth, config)

    const fallbackNextDue = () => {
      let nextDue = addMonthsClamped(lastPaymentDate, 1)
      let safetyCounter = 0
      while (nextDue <= currentDate && safetyCounter < 24) {
        nextDue = addMonthsClamped(nextDue, 1)
        safetyCounter += 1
      }
      return nextDue > currentDate ? nextDue : null
    }

    if (!freqDetails || !freqDetails.frequency) {
      return fallbackNextDue()
    }

    const frequency = freqDetails.frequency
    let nextDueYear = lastPaymentYear
    let nextDueMonth = lastPaymentMonth
    let safetyCounter = 0

    while (safetyCounter < 60) {
      nextDueMonth += frequency
      if (nextDueMonth > 12) {
        nextDueYear += Math.floor((nextDueMonth - 1) / 12)
        nextDueMonth = ((nextDueMonth - 1) % 12) + 1
      }
      const nextDueDate = new Date(nextDueYear, nextDueMonth - 1, lastPaymentDate.getDate())
      if (nextDueDate > currentDate) {
        return nextDueDate
      }
      safetyCounter += 1
    }

    return fallbackNextDue()
  }

  const calculateMostRecentDueDate = (payments, identifier, propertyId, config) => {
    if (!Array.isArray(payments) || payments.length === 0) return null

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    const latestPayment = payments
      .filter(payment => payment.utilityTypeNumber === identifier && (payment.date || payment.timestamp))
      .sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp))[0]

    if (!latestPayment) return null

    const lastPaymentDate = new Date(latestPayment.date || latestPayment.timestamp)
    if (Number.isNaN(lastPaymentDate.getTime())) return null

    const freqDetails = getActiveFrequencyDetails(propertyId, currentYear, currentMonth, config)
    const stepMonths = freqDetails?.frequency && freqDetails.frequency > 0 ? freqDetails.frequency : 1

    let due = addMonthsClamped(lastPaymentDate, stepMonths)
    let mostRecentDue = null
    let safetyCounter = 0

    while (due <= currentDate && safetyCounter < 60) {
      mostRecentDue = due
      due = addMonthsClamped(due, stepMonths)
      safetyCounter += 1
    }

    return mostRecentDue
  }

  const calculateElectricityDueDate = (ebNo, propertyId) =>
    electricityView === 'expired'
      ? calculateMostRecentDueDate(electricityData, ebNo, propertyId, frequencyConfigs.electricity)
      : calculateNextDueDate(electricityData, ebNo, propertyId, frequencyConfigs.electricity)

  const calculatePropertyDueDate = (propertyTaxNo, propertyId) =>
    propertyView === 'expired'
      ? calculateMostRecentDueDate(propertyTaxData, propertyTaxNo, propertyId, frequencyConfigs.property)
      : calculateNextDueDate(propertyTaxData, propertyTaxNo, propertyId, frequencyConfigs.property)

  const calculateWaterDueDate = (waterTaxNo, propertyId) =>
    waterView === 'expired'
      ? calculateMostRecentDueDate(waterTaxData, waterTaxNo, propertyId, frequencyConfigs.water)
      : calculateNextDueDate(waterTaxData, waterTaxNo, propertyId, frequencyConfigs.water)

  const buildUpcomingItems = ({ payments, identifierKey, projectsList, calculateDue, view, upcomingLimitDays = 15, expiredLimitDays = 30 }) => {
    if (!Array.isArray(payments) || payments.length === 0 || !projectsList.length) return []

    const items = []
    const processed = new Set()
    const today = new Date()

    projectsList.forEach(project => {
      const propertyDetails = Array.isArray(project.propertyDetails) ? project.propertyDetails : []

      propertyDetails
        .filter(property => {
          const identifierValue = property[identifierKey]
          return identifierValue && identifierValue.trim() !== ''
        })
        .forEach(property => {
          const identifierValue = property[identifierKey].trim()
          if (processed.has(identifierValue)) return
          processed.add(identifierValue)

          const propertyDetailsId = resolvePropertyDetailsId(property)
          const nextDue = calculateDue(identifierValue, propertyDetailsId ?? property.id)
          if (!nextDue) return

          const daysLeft = daysBetween(today, nextDue)
          if (view === 'upcoming') {
            if (daysLeft < 0 || daysLeft > upcomingLimitDays) return
          } else {
            if (daysLeft >= 0 || daysLeft < -Math.abs(expiredLimitDays)) return
          }

          const pidKey = propertyDetailsId != null ? String(propertyDetailsId) : ''
          const shopNoStr = String(property.shopNo ?? property.shop_no ?? '').trim()
          const hasShopNo = shopNoStr.length > 0
          const tenantRow = !hasShopNo
            ? { occupancy: '', tenantName: '-', tenantPhone: '' }
            : pidKey && tenantMetaByPropertyId[pidKey]
              ? tenantMetaByPropertyId[pidKey]
              : { occupancy: 'Vacant', tenantName: '-', tenantPhone: '' }

          items.push({
            identifier: identifierValue,
            identifierKey,
            siteName: project.projectName || property.siteName || '-',
            nextDue,
            daysLeft,
            projectId: project.id,
            propertyId: property.id,
            shopNo: shopNoStr,
            waterNo: property.waterNo || '',
            occupancy: tenantRow.occupancy,
            tenantName: tenantRow.tenantName,
            tenantPhone: tenantRow.tenantPhone,
          })
        })
    })

    return items.sort((a, b) => a.nextDue - b.nextDue).slice(0, 6)
  }
  const upcomingElectricity = useMemo(() => {
    return buildUpcomingItems({
      payments: electricityData,
      identifierKey: 'ebNo',
      projectsList: projects,
      calculateDue: calculateElectricityDueDate,
      view: electricityView,
      upcomingLimitDays: 30,
      expiredLimitDays: 30,
    })
  }, [electricityData, frequencyHistory, projects, electricityView, tenantMetaByPropertyId])

  const upcomingPropertyTax = useMemo(() => {
    return buildUpcomingItems({
      payments: propertyTaxData,
      identifierKey: 'propertyTaxNo',
      projectsList: projects,
      calculateDue: calculatePropertyDueDate,
      view: propertyView,
      upcomingLimitDays: 15,
      expiredLimitDays: 30,
    })
  }, [propertyTaxData, frequencyHistory, projects, propertyView, tenantMetaByPropertyId])

  const upcomingWaterTax = useMemo(() => {
    return buildUpcomingItems({
      payments: waterTaxData,
      identifierKey: 'waterTaxNo',
      projectsList: projects,
      calculateDue: calculateWaterDueDate,
      view: waterView,
      upcomingLimitDays: 15,
      expiredLimitDays: 30,
    })
  }, [waterTaxData, frequencyHistory, projects, waterView, tenantMetaByPropertyId])

  const handleNavigateToExpense = ({ utilityType, identifierKey, identifierValue, projectId, propertyId, siteName }) => {
    const prefillData = {
      utilityType,
      siteName,
      projectId,
      propertyId,
      utilityIdentifier: {
        key: identifierKey,
        value: identifierValue,
      },
    }

    if (utilityType === 'Electricity') {
      prefillData.ebNo = identifierValue
    }
    if (utilityType === 'Property Tax') {
      prefillData.propertyTaxNo = identifierValue
    }
    if (utilityType === 'Water Tax') {
      prefillData.waterTaxNo = identifierValue
    }
    if (utilityType === 'Telecom') {
      prefillData.utilityTypeNumber = identifierValue
    }

    localStorage.setItem('expenseEntryPrefill', JSON.stringify(prefillData))
    setExpenseEntryPrefill(prefillData)
    setShowExpenseEntryModal(true)
  }

  return (
    <div className="p-6 bg-white ml-5 mr-5 rounded">
      {showExpenseEntryModal ? (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-[1824px] max-h-[92vh] overflow-y-auto shadow-lg relative">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#202020]">Expense Entry</p>
              <button
                type="button"
                onClick={() => {
                  setShowExpenseEntryModal(false)
                  setExpenseEntryPrefill(null)
                  localStorage.removeItem('expenseEntryPrefill')
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-3">
              <ExpenseEntryForm
                username={username}
                userRoles={userRoles}
                embedded
                onSuccess={async () => {
                  // close + refetch current utility data without full reload
                  setShowExpenseEntryModal(false)
                  setExpenseEntryPrefill(null)
                  localStorage.removeItem('expenseEntryPrefill')
                  try { await refetchUtilityData() } catch { /* ignore refresh errors */ }
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
      <div className="mb-8 text-left">
        <h2 className="text-xl font-bold mb-6">Upcoming Transactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="py-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#BF9853] text-base">Electricity</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setElectricityView('expired')}
                    className="w-7 h-7 flex items-center justify-center border border-[#BF9853] rounded text-xs font-semibold text-[#BF9853] disabled:opacity-40"
                    disabled={electricityView === 'expired'}
                    title="Expired (last 30 days)"
                  >
                    &lt;
                  </button>
                  <button
                    type="button"
                    onClick={() => setElectricityView('upcoming')}
                    className="w-7 h-7 flex items-center justify-center border border-[#BF9853] rounded text-xs font-semibold text-[#BF9853] disabled:opacity-40"
                    disabled={electricityView === 'upcoming'}
                    title="Upcoming"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-[#BF9853]">
              <div
                className="p-4 space-y-3 max-h-[390px] overflow-y-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {loadingElectricity ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : errorElectricity ? (
                  <div className="text-sm text-red-500">{errorElectricity}</div>
                ) : upcomingElectricity.length === 0 ? (
                  <div className="text-sm text-gray-500">{electricityView === 'upcoming' ? 'No upcoming bills' : 'No expired bills'}</div>
                ) : (
                  upcomingElectricity.map((item) => (
                    <div key={item.identifier} className="flex items-start justify-between py-2 border-b last:border-b-0">
                      <div className="text-left">
                        <UtilityUpcomingShopTooltip item={item}>
                          <div
                            className="text-sm font-semibold text-black cursor-pointer hover:text-[#BF9853] hover:underline"
                            onClick={() => {
                              handleNavigateToExpense({
                                utilityType: 'Electricity',
                                identifierKey: 'ebNo',
                                identifierValue: item.identifier,
                                projectId: item.projectId,
                                propertyId: item.propertyId,
                                siteName: item.siteName,
                              })
                            }}
                          >
                            {item.identifier}
                            {item.occupancy ? ` - ${item.occupancy}` : ''}
                          </div>
                        </UtilityUpcomingShopTooltip>
                        <div className="text-xs text-[#BF9853] font-medium">{item.siteName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-black">{formatDDMMYYYY(item.nextDue)}</div>
                        <div className={`text-xs font-medium ${electricityView === 'expired' ? 'text-red-500' : 'text-[#BF9853]'}`}>{Math.abs(item.daysLeft)} Days</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="py-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-pink-300 text-base">Property</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPropertyView('expired')}
                    className="w-7 h-7 flex items-center justify-center border border-pink-300 rounded text-xs font-semibold text-pink-300 disabled:opacity-40"
                    disabled={propertyView === 'expired'}
                    title="Expired (last 30 days)"
                  >
                    &lt;
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertyView('upcoming')}
                    className="w-7 h-7 flex items-center justify-center border border-pink-300 rounded text-xs font-semibold text-pink-300 disabled:opacity-40"
                    disabled={propertyView === 'upcoming'}
                    title="Upcoming"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-pink-300">
              <div
                className="p-4 space-y-3 max-h-[390px] overflow-y-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {loadingPropertyTax ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : errorPropertyTax ? (
                  <div className="text-sm text-red-500">{errorPropertyTax}</div>
                ) : upcomingPropertyTax.length === 0 ? (
                  <div className="text-sm text-gray-500">{propertyView === 'upcoming' ? 'No upcoming bills' : 'No expired bills'}</div>
                ) : (
                  upcomingPropertyTax.map(item => (
                    <div key={item.identifier} className="flex items-start justify-between py-2 border-b last:border-b-0">
                      <div className="text-left">
                        <UtilityUpcomingShopTooltip item={item}>
                          <div
                            className="text-sm font-semibold text-black cursor-pointer hover:text-pink-300 hover:underline"
                            onClick={() => {
                              handleNavigateToExpense({
                                utilityType: 'Property Tax',
                                identifierKey: 'propertyTaxNo',
                                identifierValue: item.identifier,
                                projectId: item.projectId,
                                propertyId: item.propertyId,
                                siteName: item.siteName,
                              })
                            }}
                          >
                            {item.identifier}
                          </div>
                        </UtilityUpcomingShopTooltip>
                        <div className="text-xs text-pink-300 font-medium">{item.siteName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-black">{formatDDMMYYYY(item.nextDue)}</div>
                        <div className={`text-xs font-medium ${propertyView === 'expired' ? 'text-red-500' : 'text-pink-300'}`}>{Math.abs(item.daysLeft)} Days</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="py-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-blue-300 text-base">Water</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWaterView('expired')}
                    className="w-7 h-7 flex items-center justify-center border border-blue-300 rounded text-xs font-semibold text-blue-300 disabled:opacity-40"
                    disabled={waterView === 'expired'}
                    title="Expired (last 30 days)"
                  >
                    &lt;
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaterView('upcoming')}
                    className="w-7 h-7 flex items-center justify-center border border-blue-300 rounded text-xs font-semibold text-blue-300 disabled:opacity-40"
                    disabled={waterView === 'upcoming'}
                    title="Upcoming"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-blue-300">
              <div
                className="p-4 space-y-3 max-h-[390px] overflow-y-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {loadingWaterTax ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : errorWaterTax ? (
                  <div className="text-sm text-red-500">{errorWaterTax}</div>
                ) : upcomingWaterTax.length === 0 ? (
                  <div className="text-sm text-gray-500">{waterView === 'upcoming' ? 'No upcoming bills' : 'No expired bills'}</div>
                ) : (
                  upcomingWaterTax.map(item => (
                    <div key={item.identifier} className="flex items-start justify-between py-2 border-b last:border-b-0">
                      <div className="text-left">
                        <UtilityUpcomingShopTooltip item={item}>
                          <div
                            className="text-sm font-semibold text-black cursor-pointer hover:text-blue-300 hover:underline"
                            onClick={() => {
                              handleNavigateToExpense({
                                utilityType: 'Water Tax',
                                identifierKey: 'waterTaxNo',
                                identifierValue: item.identifier,
                                projectId: item.projectId,
                                propertyId: item.propertyId,
                                siteName: item.siteName,
                              })
                            }}
                          >
                            {item.identifier}
                          </div>
                        </UtilityUpcomingShopTooltip>
                        <div className="text-xs text-blue-300 font-medium">{item.siteName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-black">{formatDDMMYYYY(item.nextDue)}</div>
                        <div className={`text-xs font-medium ${waterView === 'expired' ? 'text-red-500' : 'text-blue-300'}`}>{Math.abs(item.daysLeft)} Days</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="py-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-green-300 text-base">Telecom</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTelecomView('expired')}
                    className="w-7 h-7 flex items-center justify-center border border-green-300 rounded text-xs font-semibold text-green-300 disabled:opacity-40"
                    disabled={telecomView === 'expired'}
                    title="Expired (last 30 days)"
                  >
                    &lt;
                  </button>
                  <button
                    type="button"
                    onClick={() => setTelecomView('upcoming')}
                    className="w-7 h-7 flex items-center justify-center border border-green-300 rounded text-xs font-semibold text-green-300 disabled:opacity-40"
                    disabled={telecomView === 'upcoming'}
                    title="Upcoming"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-green-300">
              <div
                className="p-4 space-y-3 max-h-[390px] overflow-y-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {loadingTelecom ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : errorTelecom ? (
                  <div className="text-sm text-red-500">{errorTelecom}</div>
                ) : upcomingTelecom.length === 0 ? (
                  <div className="text-sm text-gray-500">{telecomView === 'upcoming' ? 'No upcoming recharges' : 'No expired recharges'}</div>
                ) : (
                  upcomingTelecom.map((item) => (
                    <div key={item.serviceNumber} className="flex items-start justify-between py-2 border-b last:border-b-0">
                      <div className="text-left">
                        <div
                          className="text-sm font-semibold text-black cursor-pointer hover:text-green-400 hover:underline"
                          onClick={() => {
                            handleNavigateToExpense({
                              utilityType: 'Telecom',
                              identifierKey: 'utilityTypeNumber',
                              identifierValue: item.serviceNumber,
                              projectId: item.projectId,
                              propertyId: null,
                              siteName: item.projectName,
                            })
                          }}
                        >
                          {item.serviceNumber}
                        </div>
                        <div className="text-xs text-green-300 font-medium">{item.projectName}</div>
                        <div className="text-[11px] text-gray-500">{item.vendor} {item.purpose ? `• ${item.purpose}` : ''}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-black">{formatDDMMYYYY(item.expiry)}</div>
                        <div className={`text-xs font-medium ${telecomView === 'expired' ? 'text-red-500' : 'text-green-300'}`}>{Math.abs(item.daysLeft)} Days</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Recent Transactions</h2>
          <div className="flex space-x-4">
            <button className="flex items-center text-sm font-semibold">
              Export PDF
            </button>
            <button className="flex items-center text-sm font-semibold">
              Export XL
            </button>
            <button className="flex items-center text-sm font-semibold">
              Print
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="border-l-8 border-l-[#BF9853] rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FAF6ED]">
                  <tr>
                    <td className="px-4 py-2 text-left font-semibold ">
                      Sl.No
                    </td>
                    <td className="px-4 py-2 text-left  font-semibold ">
                      Date
                    </td>
                    <td className="px-4 py-2 text-left  font-semibold ">
                      Project Name
                    </td>
                    <td className="px-4 py-2 text-left  font-semibold ">
                      Amount
                    </td>
                    <td className="px-4 py-2 text-left  font-semibold ">
                      Type
                    </td>
                    <td className="px-4 py-2 text-left font-semibold ">
                      Category
                    </td>
                    <td className="px-4 py-2 text-left  font-semibold ">
                      Purpose
                    </td>
                  </tr>
                </thead>
                <tbody className="">

                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UtilityDashboard
