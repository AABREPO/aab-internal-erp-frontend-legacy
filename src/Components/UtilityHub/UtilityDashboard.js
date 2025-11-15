import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const UtilityDashboard = () => {
  const navigate = useNavigate()
  const [electricityData, setElectricityData] = useState([])
  const [frequencyHistory, setFrequencyHistory] = useState([])
  const [projects, setProjects] = useState([])
  const [loadingElectricity, setLoadingElectricity] = useState(true)
  const [errorElectricity, setErrorElectricity] = useState(null)
  const [propertyTaxData, setPropertyTaxData] = useState([])
  const [loadingPropertyTax, setLoadingPropertyTax] = useState(true)
  const [errorPropertyTax, setErrorPropertyTax] = useState(null)
  const [waterTaxData, setWaterTaxData] = useState([])
  const [loadingWaterTax, setLoadingWaterTax] = useState(true)
  const [errorWaterTax, setErrorWaterTax] = useState(null)
  useEffect(() => {
    const fetchElectricity = async () => {
      try {
        const res = await axios.get('https://backendaab.in/aabuilderDash/expenses_form/utility/electricity')
        setElectricityData(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        setErrorElectricity('Failed to load electricity data')
      } finally {
        setLoadingElectricity(false)
      }
    }
    fetchElectricity()
  }, [])
  useEffect(() => {
    const fetchFrequencyHistory = async () => {
      try {
        const response = await axios.get('https://backendaab.in/aabuilderDash/api/frequency-history/getAll')
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
        const response = await axios.get('https://backendaab.in/aabuilderDash/api/projects/getAll')
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
    const fetchPropertyTax = async () => {
      try {
        const res = await axios.get('https://backendaab.in/aabuilderDash/expenses_form/utility/property')
        setPropertyTaxData(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        setErrorPropertyTax('Failed to load property tax data')
      } finally {
        setLoadingPropertyTax(false)
      }
    }
    fetchPropertyTax()
  }, [])

  useEffect(() => {
    const fetchWaterTax = async () => {
      try {
        const res = await axios.get('https://backendaab.in/aabuilderDash/expenses_form/utility/water')
        setWaterTaxData(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        setErrorWaterTax('Failed to load water tax data')
      } finally {
        setLoadingWaterTax(false)
      }
    }
    fetchWaterTax()
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
  const daysBetween = (from, to) => {
    const one = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()
    const two = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime()
    return Math.round((two - one) / (1000 * 60 * 60 * 24))
  }
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

  const calculateElectricityNextDueDate = (ebNo, propertyId) =>
    calculateNextDueDate(electricityData, ebNo, propertyId, frequencyConfigs.electricity)

  const calculatePropertyNextDueDate = (propertyTaxNo, propertyId) =>
    calculateNextDueDate(propertyTaxData, propertyTaxNo, propertyId, frequencyConfigs.property)

  const calculateWaterNextDueDate = (waterTaxNo, propertyId) =>
    calculateNextDueDate(waterTaxData, waterTaxNo, propertyId, frequencyConfigs.water)

  const buildUpcomingItems = ({ payments, identifierKey, projectsList, calculateDue }) => {
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

          const nextDue = calculateDue(identifierValue, property.id)
          if (!nextDue) return

          const daysLeft = daysBetween(today, nextDue)
          items.push({
            identifier: identifierValue,
            siteName: project.projectName || property.siteName || '-',
            nextDue,
            daysLeft,
            projectId: project.id,
            propertyId: property.id,
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
      calculateDue: calculateElectricityNextDueDate,
    })
  }, [electricityData, frequencyHistory, projects])

  const upcomingPropertyTax = useMemo(() => {
    return buildUpcomingItems({
      payments: propertyTaxData,
      identifierKey: 'propertyTaxNo',
      projectsList: projects,
      calculateDue: calculatePropertyNextDueDate,
    })
  }, [propertyTaxData, frequencyHistory, projects])

  const upcomingWaterTax = useMemo(() => {
    return buildUpcomingItems({
      payments: waterTaxData,
      identifierKey: 'waterTaxNo',
      projectsList: projects,
      calculateDue: calculateWaterNextDueDate,
    })
  }, [waterTaxData, frequencyHistory, projects])

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

    localStorage.setItem('expenseEntryPrefill', JSON.stringify(prefillData))
    navigate('/expense-entry')
  }

  return (
    <div className="p-6 bg-white ml-5 mr-5 rounded">
      <div className="mb-8 text-left">
        <h2 className="text-xl font-bold mb-6">Upcoming Transactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="py-2">
              <h3 className="font-semibold text-[#BF9853] text-base">Electricity</h3>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-[#BF9853]">
              <div className="p-4 space-y-3">
                {loadingElectricity ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : errorElectricity ? (
                  <div className="text-sm text-red-500">{errorElectricity}</div>
                ) : upcomingElectricity.length === 0 ? (
                  <div className="text-sm text-gray-500">No upcoming bills</div>
                ) : (
                  upcomingElectricity.map((item) => (
                    <div key={item.identifier} className="flex items-start justify-between py-2 border-b last:border-b-0">
                      <div className="text-left">
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
                        </div>
                        <div className="text-xs text-[#BF9853] font-medium">{item.siteName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-black">{formatDDMMYYYY(item.nextDue)}</div>
                        <div className="text-xs text-[#BF9853] font-medium">{item.daysLeft} Days</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="py-2">
              <h3 className="font-semibold text-pink-300 text-base">Property</h3>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-pink-300">
              <div className="p-4 space-y-3">
                {loadingPropertyTax ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : errorPropertyTax ? (
                  <div className="text-sm text-red-500">{errorPropertyTax}</div>
                ) : upcomingPropertyTax.length === 0 ? (
                  <div className="text-sm text-gray-500">No upcoming bills</div>
                ) : (
                  upcomingPropertyTax.map(item => (
                    <div key={item.identifier} className="flex items-start justify-between py-2 border-b last:border-b-0">
                      <div className="text-left">
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
                        <div className="text-xs text-pink-300 font-medium">{item.siteName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-black">{formatDDMMYYYY(item.nextDue)}</div>
                        <div className="text-xs text-pink-300 font-medium">{item.daysLeft} Days</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="py-2">
              <h3 className="font-semibold text-blue-300 text-base">Water</h3>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-blue-300">
              <div className="p-4 space-y-3">
                {loadingWaterTax ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : errorWaterTax ? (
                  <div className="text-sm text-red-500">{errorWaterTax}</div>
                ) : upcomingWaterTax.length === 0 ? (
                  <div className="text-sm text-gray-500">No upcoming bills</div>
                ) : (
                  upcomingWaterTax.map(item => (
                    <div key={item.identifier} className="flex items-start justify-between py-2 border-b last:border-b-0">
                      <div className="text-left">
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
                        <div className="text-xs text-blue-300 font-medium">{item.siteName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-black">{formatDDMMYYYY(item.nextDue)}</div>
                        <div className="text-xs text-blue-300 font-medium">{item.daysLeft} Days</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="py-2">
              <h3 className="font-bold text-green-300 text-base">Telecom</h3>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-green-300">
              <div className="p-4 space-y-3">

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

