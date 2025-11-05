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
        const projectsWithEbNo = response.data.filter(project =>
          project.propertyDetails &&
          project.propertyDetails.some(property => property.ebNo && property.ebNo.trim() !== '')
        )
        setProjects(projectsWithEbNo)
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }
    fetchProjects()
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
  const getFrequencyData = (propertyId) => {
    const found = frequencyHistory.find(freq => freq.projectNamePropertyDetailsId === propertyId)
    return found
  }

  // Get active frequency data for a specific property and month
  const getActiveFrequencyData = (propertyId, year, monthNumber) => {
    if (!frequencyHistory || frequencyHistory.length === 0) return null

    const records = frequencyHistory.filter(
      f => f.projectNamePropertyDetailsId === propertyId && f.startingMonthOfElectricityFrequency
    )
    if (records.length === 0) return null
    
    const currentVal = year * 12 + parseInt(monthNumber)
    const sorted = records.sort((a, b) => {
      const [aY, aM] = a.startingMonthOfElectricityFrequency.split('-').map(Number)
      const [bY, bM] = b.startingMonthOfElectricityFrequency.split('-').map(Number)
      return aY * 12 + aM - (bY * 12 + bM)
    })
    
    let active = sorted[0]
    for (const rec of sorted) {
      const [rY, rM] = rec.startingMonthOfElectricityFrequency.split('-').map(Number)
      const recVal = rY * 12 + rM
      if (recVal <= currentVal) {
        active = rec
      } else {
        break
      }
    }
    return active
  }

  // Calculate next due date based on frequency
  const calculateNextDueDate = (ebNo, propertyId) => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    // Get the latest payment for this EB number
    const latestPayment = electricityData
      .filter(payment => payment.utilityTypeNumber === ebNo)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0]

    if (!latestPayment || !latestPayment.date) {
      return null // No payment history
    }
    const lastPaymentDate = new Date(latestPayment.date)
    const lastPaymentYear = lastPaymentDate.getFullYear()
    const lastPaymentMonth = lastPaymentDate.getMonth() + 1
    const freqData = getActiveFrequencyData(propertyId, currentYear, currentMonth)
    if (!freqData || !freqData.electricityFrequencyNo || !freqData.startingMonthOfElectricityFrequency) {
      let nextDue = addMonthsClamped(lastPaymentDate, 1)
      while (nextDue <= currentDate) {
        nextDue = addMonthsClamped(nextDue, 1)
      }
      return nextDue
    }
    const frequency = parseInt(freqData.electricityFrequencyNo)
    if (frequency === 0) {
      return null
    }
    const startingMonth = freqData.startingMonthOfElectricityFrequency.trim()
    const [startYear, startMonth] = startingMonth.split('-').map(Number)
    let nextDueYear = lastPaymentYear
    let nextDueMonth = lastPaymentMonth
    while (true) {
      nextDueMonth += frequency
      if (nextDueMonth > 12) {
        nextDueYear += Math.floor((nextDueMonth - 1) / 12)
        nextDueMonth = ((nextDueMonth - 1) % 12) + 1
      }
      const nextDueDate = new Date(nextDueYear, nextDueMonth - 1, lastPaymentDate.getDate())
      if (nextDueDate > currentDate) {
        return nextDueDate
      }
    }
  }
  const upcomingElectricity = useMemo(() => {
    if (!electricityData || electricityData.length === 0 || !projects.length) return []
    const items = []
    const processedEbs = new Set()
    projects.forEach(project => {
      project.propertyDetails
        .filter(property => property.ebNo && property.ebNo.trim() !== '')
        .forEach(property => {
          const ebNo = property.ebNo.trim()
          if (processedEbs.has(ebNo)) return
          processedEbs.add(ebNo)
          const nextDue = calculateNextDueDate(ebNo, property.id)
          if (!nextDue) return
          const today = new Date()
          const daysLeft = daysBetween(today, nextDue)
          items.push({
            ebNo: ebNo,
            siteName: project.projectName || property.siteName || '-',
            nextDue,
            daysLeft,
          })
        })
    })
    return items
      .sort((a, b) => a.nextDue - b.nextDue)
      .slice(0, 6)
  }, [electricityData, frequencyHistory, projects])

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
                    <div key={item.ebNo} className="flex items-start justify-between py-2 border-b last:border-b-0">
                      <div className="text-left">
                        <div 
                          className="text-sm font-semibold text-black cursor-pointer hover:text-[#BF9853] hover:underline"
                          onClick={() => {
                            // Find the project for this ebNo
                            const project = projects.find(p => 
                              p.propertyDetails?.some(prop => prop.ebNo?.trim() === item.ebNo)
                            )
                            const property = project?.propertyDetails?.find(prop => prop.ebNo?.trim() === item.ebNo)                            
                            // Store pre-fill data in localStorage
                            localStorage.setItem('expenseEntryPrefill', JSON.stringify({
                              ebNo: item.ebNo,
                              siteName: item.siteName,
                              projectId: project?.id,
                              propertyId: property?.id
                            }))                            
                            // Navigate to expense entry form
                            navigate('/expense-entry')
                          }}
                        >
                          {item.ebNo}
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

              </div>
            </div>
          </div>
          <div>
            <div className="py-2">
              <h3 className="font-semibold text-blue-300 text-base">Water</h3>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-blue-300">
              <div className="p-4 space-y-3">

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
